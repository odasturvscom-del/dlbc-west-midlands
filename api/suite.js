// /api/suite: the church management suite (people, giving, finance, teams, services, comms).
// Same session + roles as the rest of the site. Money is stored in integer pence.
import { wrap, redis, one, parse, pairs, send, body, requireRole, HttpError, RANK } from "./_lib.js";

/* Access: read/write/delete are minimum RANK levels; roles narrows further. */
const M = {
  members:   { read:1, write:2, del:3 },
  visitors:  { read:1, write:2, del:3 },
  attendance:{ read:1, write:2, del:3 },
  groups:    { read:1, write:2, del:3 },
  care:      { read:1, write:1, del:3, roles:["owner","admin","pastoral"] },
  funds:     { read:3, write:3, del:4 },
  gifts:     { read:3, write:3, del:4 },   // append-only in spirit: only owner deletes
  plans:     { read:3, write:3, del:4 },
  pledges:   { read:3, write:3, del:4 },
  budgets:   { read:3, write:3, del:4 },
  expenses:  { read:3, write:3, del:3 },
  teams:     { read:2, write:2, del:3 },
  rota:      { read:2, write:2, del:3 },
  unavail:   { read:2, write:2, del:3 },
  events:    { read:2, write:2, del:3 },
  bookings:  { read:2, write:2, del:3 },
  orders:    { read:2, write:2, del:3 },
  segments:  { read:3, write:3, del:4 },
  broadcasts:{ read:3, write:3, del:4 },
  social:    { read:2, write:2, del:3 },
};
const RESTRICTED = new Set(["dbs","dbsDate","safeguardingNotes"]); // members: admin+ only
const KEY = /^[a-z][a-zA-Z0-9_]{0,30}$/;

function csv(rows, cols) {
  const esc = v => { v = v == null ? "" : String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
  return "\ufeff" + cols.join(",") + "\n" + rows.map(r => cols.map(c => esc(r[c])).join(",")).join("\n");
}
function okCsv(res, name, text) {
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${name}.csv"`);
  res.setHeader("Cache-Control", "no-store");
  res.status(200).send(text);
}
async function load(m) {
  const raw = await one("HGETALL", "suite:" + m);
  return Object.entries(pairs(raw)).map(([id, v]) => ({ id, ...parse(v, {}) }));
}
async function audit(by, action, m, id) {
  try { await redis(["RPUSH", "suite:audit", JSON.stringify({ at: new Date().toISOString(), by, action, m, id })]); } catch {}
}
function clean(data, restrictedOk) {
  const out = {};
  for (const [k, v] of Object.entries(data || {})) {
    if (!KEY.test(k)) continue;
    if (RESTRICTED.has(k) && !restrictedOk) continue;
    if (v == null || ["string", "number", "boolean"].includes(typeof v)) { out[k] = typeof v === "string" ? String(v).slice(0, 4000) : v; }
    else if (Array.isArray(v) && v.length <= 100) out[k] = v.slice(0, 100).map(x => String(x).slice(0, 200));
  }
  return out;
}
const month = s => (s || "").slice(0, 7);

export default wrap(async (req, res) => {
  const q = req.query || {};
  const b = req.method === "POST" ? body(req) : {};
  const op = q.op || b.op;
  const m = q.m || b.m || "";
  if (!op) throw new HttpError(400, "Missing operation.");
  const u = await requireRole(req, "pastoral"); // everyone here is staff
  const role = u.role, rank = RANK[role] || 0;

  /* ---------- read ops ---------- */
  if (op === "list") {
    const cfg = M[m]; if (!cfg) throw new HttpError(404, "Unknown module.");
    if (rank < cfg.read || (cfg.roles && !cfg.roles.includes(role))) throw new HttpError(403, "Your role doesn't allow this.");
    let rows = await load(m);
    if (m === "members" && rank < 3) for (const r of rows) for (const k of RESTRICTED) delete r[k];
    return send(res, 200, { rows });
  }
  if (op === "audit") {
    if (rank < 3) throw new HttpError(403, "Admins only.");
    const raw = await one("LRANGE", "suite:audit", "-200", "-1");
    return send(res, 200, { rows: (raw || []).reverse().map(x => parse(x, {})) });
  }
  if (op === "dashboard") {
    if (rank < 1) throw new HttpError(403, "Sign in required.");
    const [mem, vis, att, gif, exp, rota, ev] = await Promise.all([load("members"), load("visitors"), load("attendance"), load("gifts"), load("expenses"), load("rota"), load("events")]);
    const thisMonth = new Date().toISOString().slice(0, 7);
    const canFinance = rank >= 3;
    const giving = canFinance ? gif.filter(g => month(g.date) === thisMonth).reduce((a, g) => a + (parseInt(g.amount) || 0), 0) : null;
    const byFund = canFinance ? {} : null;
    if (canFinance) for (const g of gif.filter(g => month(g.date) === thisMonth)) byFund[g.fund || "General"] = (byFund[g.fund || "General"] || 0) + (parseInt(g.amount) || 0);
    const lastAtt = att.slice().sort((a, c) => (c.date || "").localeCompare(a.date || ""))[0] || null;
    const openExp = canFinance ? exp.filter(e => e.status === "submitted").length : null;
    const soon = ev.filter(e => (e.date || "") >= new Date().toISOString().slice(0, 10)).sort((a, c) => (a.date || "").localeCompare(c.date || "")).slice(0, 5);
    const followup = vis.filter(v => v.status && v.status !== "done" && (!v.nextAction || new Date(v.nextAction) <= new Date(Date.now() + 3 * 864e5))).length;
    return send(res, 200, {
      members: mem.length, activeMembers: mem.filter(x => x.status !== "inactive").length,
      visitors: vis.filter(v => month(v.visitDate) === thisMonth).length, followup,
      lastAttendance: lastAtt ? { date: lastAtt.date, total: parseInt(lastAtt.total) || 0 } : null,
      givingThisMonth: giving, givingByFund: byFund, openExpenses: openExp, events: soon
    });
  }
  if (op === "followup") {
    const rows = (await load("visitors")).filter(v => (v.status || "new") !== "done")
      .map(v => ({ ...v, days: Math.round((Date.now() - new Date(v.visitDate || Date.now())) / 864e5) }))
      .sort((a, c) => c.days - a.days);
    return send(res, 200, { rows });
  }
  if (op === "givingsummary") {
    if (rank < 3) throw new HttpError(403, "Your role doesn't allow this.");
    const [gif, fun, mem] = await Promise.all([load("gifts"), load("funds"), load("members")]);
    const name = {}; for (const p of mem) name[p.id] = p.fullName || p.name || p.email || p.id;
    const y = new Date().getFullYear(), fyStart = new Date(y, 3, 6).toISOString().slice(0, 10); // UK tax year from 6 Apr
    const fy = gif.filter(g => (g.date || "") >= fyStart);
    const byFund = {}; for (const g of gif) { const f = g.fund || "General"; byFund[f] = (byFund[f] || 0) + (parseInt(g.amount) || 0); }
    const ga = fy.filter(g => g.giftAid);
    return send(res, 200, { byFund, fyTotal: fy.reduce((a, g) => a + (parseInt(g.amount) || 0), 0), giftAidCount: ga.length, giftAidTotal: ga.reduce((a, g) => a + (parseInt(g.amount) || 0), 0), top: null, memberName: name });
  }
  if (op === "export") {
    const cfg = M[m]; if (!cfg) throw new HttpError(404, "Unknown module.");
    if (rank < cfg.read || (cfg.roles && !cfg.roles.includes(role))) throw new HttpError(403, "Your role doesn't allow this.");
    if (m === "members" && rank < 3) throw new HttpError(403, "Member exports are admin-only (they carry personal data).");
    let rows = await load(m);
    if (m === "members" && rank >= 3) { /* admin export keeps restricted fields */ }
    const cols = rows.length ? Object.keys(rows[0]).filter(k => k !== "id").concat(["id"]) : ["id"];
    await audit(u.email, "export", m, null);
    return okCsv(res, "dlbc-" + m, csv(rows, cols));
  }
  if (op === "statement") {
    if (rank < 3) throw new HttpError(403, "Your role doesn't allow this.");
    const [gif, mem] = await Promise.all([load("gifts"), load("members")]);
    const p = mem.find(x => x.id === q.member);
    const y = parseInt(q.year) || new Date().getFullYear();
    const rows = gif.filter(g => g.member === q.member && (g.date || "").startsWith(String(y))).sort((a, c) => (a.date || "").localeCompare(c.date || ""));
    const text = csv(rows.map(g => ({ ...g, fund: g.fund || "General", amountPounds: ((parseInt(g.amount) || 0) / 100).toFixed(2), giftAid: g.giftAid ? "yes" : "no", method: g.method || "", date: g.date || "" })), ["date", "fund", "amountPounds", "method", "giftAid", "note"]);
    await audit(u.email, "statement", "gifts", q.member);
    return okCsv(res, `giving-statement-${(p && (p.fullName || p.name)) || q.member}-${y}`, text);
  }

  /* ---------- write ops ---------- */
  const cfg = M[m]; if (!cfg) throw new HttpError(404, "Unknown module.");
  if (cfg.roles && !cfg.roles.includes(role)) throw new HttpError(403, "Your role doesn't allow this.");
  if (op === "save") {
    if (rank < cfg.write) throw new HttpError(403, "Your role doesn't allow this.");
    const restrictedOk = !(m === "members") || rank >= 3;
    const data = clean(b.data, restrictedOk);
    if (m === "gifts") { const n = parseInt(data.amount); if (!Number.isInteger(n) || n <= 0 || n > 100000000) throw new HttpError(400, "Gift amount must be a positive amount of pence."); }
    if (m === "expenses") { const n = parseInt(data.amount); if (!Number.isInteger(n) || n < 0 || n > 100000000) throw new HttpError(400, "Expense amount must be pence."); }
    let id = b.id;
    if (id) {
      const cur = parse(await one("HGET", "suite:" + m, id));
      if (!cur) throw new HttpError(404, "Record not found.");
      if (rank < cfg.del && m !== "members" && m !== "visitors") { /* non-admins can edit their modules' rows */ }
      await one("HSET", "suite:" + m, id, JSON.stringify({ ...cur, ...data, updatedAt: new Date().toISOString(), updatedBy: u.email }));
    } else {
      id = "r" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
      await one("HSET", "suite:" + m, id, JSON.stringify({ ...data, createdAt: new Date().toISOString(), createdBy: u.email }));
    }
    await audit(u.email, b.id ? "update" : "create", m, id);
    return send(res, 200, { id });
  }
  if (op === "del") {
    if (rank < cfg.del) throw new HttpError(403, "Your role doesn't allow this.");
    await one("HDEL", "suite:" + m, b.id);
    await audit(u.email, "delete", m, b.id);
    return send(res, 200, { ok: true });
  }
  if (op === "import") {
    if (rank < 3) throw new HttpError(403, "Imports are admin-only.");
    const rows = Array.isArray(b.rows) ? b.rows.slice(0, 2000) : [];
    if (!rows.length) throw new HttpError(400, "No rows to import.");
    const restrictedOk = !(m === "members") || rank >= 3;
    const cmds = [];
    const ids = [];
    for (const r of rows) {
      const id = "r" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); ids.push(id);
      cmds.push(["HSET", "suite:" + m, id, JSON.stringify({ ...clean(r, restrictedOk), createdAt: new Date().toISOString(), createdBy: u.email })]);
    }
    await redis(...cmds);
    await audit(u.email, "import " + rows.length, m, null);
    return send(res, 200, { imported: rows.length });
  }
  if (op === "approve") { // expenses + broadcasts approval gates
    if (rank < 3) throw new HttpError(403, "Only admins approve.");
    const cur = parse(await one("HGET", "suite:" + m, b.id));
    if (!cur) throw new HttpError(404, "Record not found.");
    const status = m === "expenses" ? (b.to || "approved") : (b.to || "approved");
    await one("HSET", "suite:" + m, b.id, JSON.stringify({ ...cur, status, approvedBy: u.email, approvedAt: new Date().toISOString() }));
    await audit(u.email, "approve -> " + status, m, b.id);
    return send(res, 200, { ok: true });
  }
  throw new HttpError(400, "Unknown operation.");
});
