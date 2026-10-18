// Shared helpers for the API routes. Files starting with "_" are not exposed as routes by Vercel.
import crypto from "node:crypto";

export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

/* ---------------- Upstash Redis over REST (no dependencies) ---------------- */
const RURL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const RTOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";

export async function redis(...cmds) {
  if (!RURL || !RTOKEN) throw new HttpError(503, "The database isn't connected yet. In Vercel, open Storage and connect an Upstash Redis database to this project, then redeploy.");
  const r = await fetch(RURL.replace(/\/$/, "") + "/pipeline", {
    method: "POST",
    headers: { Authorization: `Bearer ${RTOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmds)
  });
  if (!r.ok) throw new HttpError(502, "Database error (" + r.status + ")");
  const out = await r.json();
  return out.map(x => { if (x.error) throw new HttpError(502, "Database error: " + x.error); return x.result; });
}
export const one = async (...cmd) => (await redis(cmd))[0];
export function pairs(arr) { const o = {}; for (let i = 0; arr && i < arr.length; i += 2) o[arr[i]] = arr[i + 1]; return o; }
export function parse(s, fallback = null) { try { return s == null ? fallback : JSON.parse(s); } catch { return fallback; } }

/* ---------------- Request helpers ---------------- */
export function send(res, status, body, cache = "no-store") {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", cache);
  res.status(status).send(JSON.stringify(body));
}
export function wrap(fn) {
  return async (req, res) => {
    try { await fn(req, res); }
    catch (e) {
      const status = e instanceof HttpError ? e.status : 500;
      if (status === 500) console.error(e);
      send(res, status, { error: e instanceof HttpError ? e.message : "Something went wrong on the server." });
    }
  };
}
export function body(req) {
  const b = req.body;
  if (b && typeof b === "object") return b;
  try { return JSON.parse(b || "{}"); } catch { throw new HttpError(400, "Invalid request body."); }
}
export function ip(req) { return String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown"; }
export async function rateLimit(key, max, seconds) {
  const [n] = await redis(["INCR", "rl:" + key], ["EXPIRE", "rl:" + key, String(seconds), "NX"]);
  if (n > max) throw new HttpError(429, "Too many attempts. Please wait a few minutes and try again.");
}

/* ---------------- Passwords & sessions ---------------- */
const SECRET = process.env.SESSION_SECRET || crypto.createHash("sha256").update("dlbc:" + RTOKEN).digest("hex");
const COOKIE = "dl_s";
const MAX_AGE = 60 * 60 * 24 * 14; // 14 days

export function hashPassword(pw, salt = crypto.randomBytes(16).toString("hex")) {
  return { salt, hash: crypto.scryptSync(pw, salt, 64).toString("hex") };
}
export function checkPassword(pw, user) {
  if (!user || !user.hash) return false;
  const h = crypto.scryptSync(pw, user.salt, 64);
  const want = Buffer.from(user.hash, "hex");
  return want.length === h.length && crypto.timingSafeEqual(h, want);
}
export function validPassword(pw) { return typeof pw === "string" && pw.length >= 10 && pw.length <= 200; }
export function validEmail(e) { return typeof e === "string" && e.length <= 200 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e); }

const b64u = s => Buffer.from(s).toString("base64url");
const sign = s => crypto.createHmac("sha256", SECRET).update(s).digest("base64url");

export function setSession(res, user) {
  const payload = b64u(JSON.stringify({ e: user.email, v: user.ver || 1, x: Date.now() + MAX_AGE * 1000 }));
  res.setHeader("Set-Cookie", `${COOKIE}=${payload}.${sign(payload)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE}`);
}
export function clearSession(res) {
  res.setHeader("Set-Cookie", `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
}
export async function currentUser(req) {
  const raw = String(req.headers.cookie || "").split(/;\s*/).find(c => c.startsWith(COOKIE + "="));
  if (!raw) return null;
  const [payload, sig] = raw.slice(COOKIE.length + 1).split(".");
  if (!payload || !sig) return null;
  const good = sign(payload);
  if (good.length !== sig.length || !crypto.timingSafeEqual(Buffer.from(good), Buffer.from(sig))) return null;
  const p = parse(Buffer.from(payload, "base64url").toString());
  if (!p || p.x < Date.now()) return null;
  const user = parse(await one("HGET", "users", p.e));
  if (!user || (user.ver || 1) !== p.v || user.role === "none") return null;
  return user;
}
export const publicUser = u => u && ({ email: u.email, name: u.name, role: u.role, createdAt: u.createdAt });

/* ---------------- Roles ---------------- */
export const RANK = { owner: 4, admin: 3, editor: 2, finance: 1, pastoral: 1 }; // finance & pastoral get their own areas, checked by name
export const ROLE_NAMES = ["admin", "pastoral", "finance", "editor"];

/* ---------------- Audit log ---------------- */
export function auditCmd(user, action, target, summary = "") {
  const entry = { at: new Date().toISOString(), by: user ? user.email : "website", name: user ? user.name : "Website visitor", action, target, summary: String(summary).slice(0, 200) };
  return [["LPUSH", "audit", JSON.stringify(entry)], ["LTRIM", "audit", "0", "4999"]];
}
export async function audit(user, action, target, summary) { try { await redis(...auditCmd(user, action, target, summary)); } catch (e) { console.error("audit", e); } }
export async function requireRole(req, min) {
  const u = await currentUser(req);
  if (!u) throw new HttpError(401, "Please sign in again.");
  if (typeof min === "string" ? (RANK[u.role] || 0) < RANK[min] : !min.includes(u.role)) throw new HttpError(403, "Your role doesn't allow this.");
  return u;
}
