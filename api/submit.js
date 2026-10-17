// POST /api/submit: public forms (visit plans, prayer requests, messages, event registrations).
import crypto from "node:crypto";
import { wrap, body, send, one, rateLimit, ip, HttpError } from "./_lib.js";

const TYPES = ["visit", "prayer", "contact", "registration"];

export default wrap(async (req, res) => {
  if (req.method !== "POST") throw new HttpError(405, "Use POST.");
  const b = body(req);
  if (b.website) return send(res, 200, { ok: true }); // spam trap: pretend success
  if (!TYPES.includes(b.type)) throw new HttpError(400, "Unknown form.");
  await rateLimit("submit:" + ip(req), 6, 600);
  const data = b.data && typeof b.data === "object" ? b.data : {};
  const clean = {};
  for (const [k, v] of Object.entries(data).slice(0, 14)) {
    if (!/^[a-zA-Z]{1,20}$/.test(k)) continue;
    clean[k] = typeof v === "boolean" ? v : String(v ?? "").slice(0, 4000);
  }
  if (b.type === "prayer" && !String(clean.request || "").trim()) throw new HttpError(400, "Please write your prayer request.");
  if (["visit", "contact", "registration"].includes(b.type) && !String(clean.email || "").includes("@")) throw new HttpError(400, "Please add a valid email address.");
  if ((await one("HLEN", "inbox")) > 5000) throw new HttpError(507, "The inbox is full. Please contact the church directly.");
  const id = crypto.randomBytes(8).toString("hex");
  await one("HSET", "inbox", id, JSON.stringify({ ...clean, id, type: b.type, at: new Date().toISOString(), handled: false }));
  send(res, 200, { ok: true });
});
