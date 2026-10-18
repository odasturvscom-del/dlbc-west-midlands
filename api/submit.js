// POST /api/submit: public forms (visit plans, prayer requests, messages, event tickets, Gift Aid declarations).
import crypto from "node:crypto";
import { wrap, body, send, one, redis, rateLimit, ip, HttpError, auditCmd } from "./_lib.js";
import { placesLeft } from "./public.js";

const TYPES = ["visit", "prayer", "contact", "registration", "giftaid"];
const code = () => Array.from(crypto.randomBytes(6)).map(x => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[x % 32]).join("");

export default wrap(async (req, res) => {
  if (req.method !== "POST") throw new HttpError(405, "Use POST.");
  const b = body(req);
  if (b.website) return send(res, 200, { ok: true }); // spam trap: pretend success
  if (!TYPES.includes(b.type)) throw new HttpError(400, "Unknown form.");
  await rateLimit("submit:" + ip(req), 8, 600);
  const data = b.data && typeof b.data === "object" ? b.data : {};
  const clean = {};
  for (const [k, v] of Object.entries(data).slice(0, 20)) {
    if (!/^[a-zA-Z]{1,24}$/.test(k)) continue;
    clean[k] = typeof v === "boolean" ? v : String(v ?? "").slice(0, 4000);
  }
  if (b.type === "prayer" && !String(clean.request || "").trim()) throw new HttpError(400, "Please write your prayer request.");
  if (b.type !== "prayer" && !String(clean.email || "").includes("@")) throw new HttpError(400, "Please add a valid email address.");
  if (b.type === "giftaid" && (!clean.consent || !clean.postcode || !clean.lastName)) throw new HttpError(400, "Please complete your name, postcode and the Gift Aid declaration.");
  if ((await one("HLEN", "inbox")) > 5000) throw new HttpError(507, "The inbox is full. Please contact the church directly.");

  const now = new Date().toISOString();
  const id = crypto.randomBytes(8).toString("hex");
  const cmds = [];
  const out = { ok: true };

  if (b.type === "registration") {
    const eventId = String(clean.eventId || "");
    const p = await placesLeft(eventId);
    if (!p) throw new HttpError(404, "That event is no longer available.");
    const guests = Math.max(1, Math.min(20, parseInt(clean.guests, 10) || 1));
    if (p.left !== null && guests > p.left) throw new HttpError(409, p.left ? `Only ${p.left} place${p.left > 1 ? "s" : ""} left.` : "Sorry, this event is full.");
    out.code = code();
    cmds.push(["HSET", "rec:tickets", id, JSON.stringify({ eventId, eventTitle: clean.eventTitle || "", name: clean.name || "", email: clean.email || "", phone: clean.phone || "", guests, ticketType: clean.ticketType || "General", code: out.code, status: "Confirmed", checkedIn: false, createdAt: now })]);
    clean.code = out.code;
  }
  if (b.type === "visit") { // every visit plan also starts a follow-up card
    const [firstName, ...rest] = String(clean.name || "").trim().split(/\s+/);
    cmds.push(["HSET", "rec:visitors", id, JSON.stringify({ firstName: firstName || "", lastName: rest.join(" "), email: clean.email || "", phone: clean.phone || "", firstVisit: clean.date || "", campus: clean.campus || "", guests: clean.guests || "", stage: "New", source: "Website visit plan", notes: clean.message || "", createdAt: now })]);
  }
  if (b.type === "giftaid") { // UK Gift Aid declaration made online
    cmds.push(["HSET", "rec:declarations", id, JSON.stringify({ title: clean.title || "", firstName: clean.firstName || "", lastName: clean.lastName || "", houseNumber: clean.houseNumber || "", postcode: String(clean.postcode || "").toUpperCase(), email: clean.email || "", date: now.slice(0, 10), source: "Online form", createdAt: now })]);
  }
  cmds.push(["HSET", "inbox", id, JSON.stringify({ ...clean, id, type: b.type, at: now, handled: false })]);
  cmds.push(...auditCmd(null, "submit", b.type, clean.name || (b.type === "prayer" ? "Prayer request" : "")));
  await redis(...cmds);
  send(res, 200, out);
});
