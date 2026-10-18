// /api/records: church management data (people, giving, finance, rotas, services, communications).
// Each collection lists which roles may read and write it. The owner can do everything.
import crypto from "node:crypto";
import { wrap, body, send, one, redis, pairs, parse, HttpError, currentUser, auditCmd } from "./_lib.js";

const A = "admin", P = "pastoral", F = "finance", E = "editor";
const COLLECTIONS = {
  members:      { read: [A, P],       write: [A, P] },
  visitors:     { read: [A, P],       write: [A, P] },
  households:   { read: [A, P],       write: [A, P] },
  attendance:   { read: [A, P, E],    write: [A, P, E] },
  groups:       { read: [A, P],       write: [A, P] },
  care:         { read: [A, P],       write: [A, P] },
  funds:        { read: [A, F],       write: [A, F] },
  declarations: { read: [A, F],       write: [A, F] },
  gifts:        { read: [A, F],       write: [A, F] },
  recurring:    { read: [A, F],       write: [A, F] },
  pledges:      { read: [A, F],       write: [A, F] },
  budgets:      { read: [A, F],       write: [A, F] },
  expenses:     { read: [A, F],       write: [A, F] },
  teams:        { read: [A, P, E],    write: [A, P, E] },
  rota:         { read: [A, P, E],    write: [A, P, E] },
  availability: { read: [A, P, E],    write: [A, P, E] },
  tickets:      { read: [A, P, E],    write: [A, P, E] },
  rooms:        { read: [A, P, E],    write: [A] },
  bookings:     { read: [A, P, E, F], write: [A, P, E] },
  services:     { read: [A, P, E],    write: [A, P, E] },
  segments:     { read: [A, P],       write: [A, P] },
  broadcasts:   { read: [A, P],       write: [A, P] },
  social:       { read: [A, E],       write: [A, E] },
  tasks:        { read: [A, P, E, F], write: [A, P, E, F] },
  checkins:     { read: [A, P, E],    write: [A, P, E] }
};
const ID = /^[A-Za-z0-9_-]{4,60}$/;
const may = (u, c, act) => u.role === "owner" || (COLLECTIONS[c] && COLLECTIONS[c][act].includes(u.role));
const staff = async req => { const u = await currentUser(req); if (!u) throw new HttpError(401, "Please sign in again."); return u; };

export default wrap(async (req, res) => {
  const u = await staff(req);

  if (req.method === "GET") {
    const c = String(req.query.c || "");
    if (c === "directory") { // names only, so rota and group leaders can pick people without seeing contact details
      const all = pairs(await one("HGETALL", "rec:members"));
      return send(res, 200, { items: Object.entries(all).map(([id, v]) => { const m = parse(v, {}); return { id, data: { firstName: m.firstName || "", lastName: m.lastName || "", campus: m.campus || "", status: m.status || "", dbsExpiry: m.dbsExpiry || "", dbsStatus: m.dbsStatus || "" } }; }) });
    }
    if (c === "users") {
      const all = pairs(await one("HGETALL", "users"));
      return send(res, 200, { items: Object.values(all).map(v => { const x = parse(v, {}); return { email: x.email, name: x.name, role: x.role }; }) });
    }
    if (c === "audit") {
      if (!["owner", A].includes(u.role)) throw new HttpError(403, "Only administrators can see the audit log.");
      const rows = await one("LRANGE", "audit", "0", "999");
      return send(res, 200, { items: (rows || []).map(r => parse(r)).filter(Boolean) });
    }
    if (c === "batch") { // several collections in one round trip, silently skipping ones this role can't read
      const list = String(req.query.list || "").split(",").filter(x => COLLECTIONS[x] && may(u, x, "read")).slice(0, 20);
      const out = list.length ? await redis(...list.map(x => ["HGETALL", "rec:" + x])) : [];
      const data = {}; list.forEach((x, i) => data[x] = Object.entries(pairs(out[i])).map(([id, v]) => ({ id, data: parse(v, {}) })));
      return send(res, 200, { data });
    }
    if (!COLLECTIONS[c]) throw new HttpError(400, "Unknown list.");
    if (!may(u, c, "read")) throw new HttpError(403, "Your role can't see this.");
    const all = pairs(await one("HGETALL", "rec:" + c));
    return send(res, 200, { items: Object.entries(all).map(([id, v]) => ({ id, data: parse(v, {}) })) });
  }

  if (req.method !== "POST") throw new HttpError(405, "Use GET or POST.");
  const b = body(req);
  const c = String(b.c || "");
  if (!COLLECTIONS[c]) throw new HttpError(400, "Unknown list.");
  if (!may(u, c, "write")) throw new HttpError(403, "Your role can't change this.");

  if (b.op === "set") {
    const id = String(b.id || "");
    if (!ID.test(id)) throw new HttpError(400, "Bad id.");
    if (!b.data || typeof b.data !== "object" || Array.isArray(b.data)) throw new HttpError(400, "Expected an object.");
    const json = JSON.stringify({ ...b.data, updatedAt: new Date().toISOString(), updatedBy: u.email });
    if (json.length > 120_000) throw new HttpError(413, "That record is too large.");
    const label = b.data.title || b.data.name || [b.data.firstName, b.data.lastName].filter(Boolean).join(" ") || b.data.subject || id;
    await redis(["HSET", "rec:" + c, id, json], ...auditCmd(u, b.isNew ? "create" : "update", c, label));
    return send(res, 200, { ok: true });
  }
  if (b.op === "delete") {
    const id = String(b.id || "");
    const prev = parse(await one("HGET", "rec:" + c, id), {});
    const label = prev.title || prev.name || [prev.firstName, prev.lastName].filter(Boolean).join(" ") || id;
    await redis(["HDEL", "rec:" + c, id], ...auditCmd(u, "delete", c, label));
    return send(res, 200, { ok: true });
  }
  if (b.op === "import") { // bulk create from a spreadsheet
    const rows = Array.isArray(b.rows) ? b.rows.slice(0, 2000) : [];
    if (!rows.length) throw new HttpError(400, "Nothing to import.");
    const args = ["HSET", "rec:" + c];
    for (const r of rows) { if (r && typeof r === "object") args.push(crypto.randomBytes(6).toString("hex"), JSON.stringify({ ...r, createdAt: new Date().toISOString(), updatedBy: u.email })); }
    if (JSON.stringify(args).length > 900_000) throw new HttpError(413, "That file is too large. Split it into smaller files.");
    await redis(args, ...auditCmd(u, "import", c, rows.length + " rows"));
    return send(res, 200, { ok: true, count: rows.length });
  }
  if (b.op === "send-email") { // broadcasts by email through Resend (optional)
    if (c !== "broadcasts") throw new HttpError(400, "Not allowed.");
    const key = process.env.RESEND_API_KEY, from = process.env.FROM_EMAIL;
    if (!key || !from) throw new HttpError(503, "Email sending isn't set up. Add RESEND_API_KEY and FROM_EMAIL in Vercel, or copy the addresses instead.");
    const to = [...new Set((b.to || []).map(x => String(x).trim().toLowerCase()).filter(x => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(x)))].slice(0, 2000);
    const subject = String(b.subject || "").slice(0, 200), text = String(b.text || "").slice(0, 20000);
    if (!to.length || !subject || !text) throw new HttpError(400, "Add a subject, a message and at least one recipient.");
    let sent = 0;
    for (let i = 0; i < to.length; i += 100) {
      const batch = to.slice(i, i + 100).map(addr => ({ from, to: [addr], subject, text, reply_to: process.env.REPLY_TO || undefined }));
      const r = await fetch("https://api.resend.com/emails/batch", { method: "POST", headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" }, body: JSON.stringify(batch) });
      if (!r.ok) throw new HttpError(502, `Email service error after ${sent} sent (${r.status}).`);
      sent += batch.length;
    }
    await redis(...auditCmd(u, "send", "broadcasts", `${subject} → ${sent} people`));
    return send(res, 200, { ok: true, sent });
  }
  throw new HttpError(400, "Unknown action.");
});
