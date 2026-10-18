// /api/admin: everything the admin portal changes. Every call checks the signed-in person's role.
import crypto from "node:crypto";
import { wrap, body, send, one, redis, pairs, parse, HttpError, requireRole, RANK, ROLE_NAMES, hashPassword, validEmail, validPassword, publicUser, audit } from "./_lib.js";

// Who may change what (minimum role).
const DOC_ROLE = { "site/settings": "admin", "site/campuses": "admin", "site/ministries": "editor" };
const COLS = ["events", "sermons", "posts"];
const EDITOR_SETTINGS = ["images", "liveNow", "liveTitle", "nextLiveAt", "livestreamUrl", "youtubeUrl", "liveStartedAt", "updatedAt"];
const ID = /^[A-Za-z0-9_-]{4,60}$/;

function checkSize(data, max = 300_000) {
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new HttpError(400, "Expected an object.");
  if (JSON.stringify(data).length > max) throw new HttpError(413, "That's too large to save. Try a smaller photo.");
}
const randomPassword = () => crypto.randomBytes(9).toString("base64url");

export default wrap(async (req, res) => {
  /* ---------- reads ---------- */
  if (req.method === "GET") {
    if (req.query.what === "inbox") {
      await requireRole(req, ["owner", "admin", "pastoral"]);
      const items = Object.values(pairs(await one("HGETALL", "inbox"))).map(v => parse(v)).filter(Boolean);
      return send(res, 200, { items });
    }
    if (req.query.what === "users") {
      await requireRole(req, "admin");
      const users = Object.values(pairs(await one("HGETALL", "users"))).map(v => publicUser(parse(v))).filter(Boolean);
      return send(res, 200, { users });
    }
    throw new HttpError(400, "Unknown request.");
  }
  if (req.method !== "POST") throw new HttpError(405, "Use GET or POST.");
  const b = body(req);
  const path = String(b.path || "");
  const who = await requireRole(req, ["owner", "admin", "editor", "finance", "pastoral"]);
  const label = (b.data && (b.data.title || b.data.name)) || b.email || b.id || "";
  const done = async (out = { ok: true }) => { await audit(who, b.op, path || b.email || "inbox", label); send(res, 200, out); };

  /* ---------- content ---------- */
  if (b.op === "set" || b.op === "patch" || b.op === "delete") {
    if (DOC_ROLE[path]) {
      const key = "doc:" + path;
      if (b.op === "patch" && path === "site/settings") {
        const u = await requireRole(req, "editor");
        checkSize(b.data);
        const keys = Object.keys(b.data);
        if ((RANK[u.role] || 0) < RANK.admin && keys.some(k => !EDITOR_SETTINGS.includes(k))) throw new HttpError(403, "Your role can only change photos and livestream settings.");
        const cur = parse(await one("GET", key), {});
        await one("SET", key, JSON.stringify({ ...cur, ...b.data }));
      } else if (b.op === "set") {
        await requireRole(req, DOC_ROLE[path]);
        checkSize(b.data);
        await one("SET", key, JSON.stringify(b.data));
      } else throw new HttpError(400, "Not allowed.");
      return done();
    }
    const [col, id, extra] = path.split("/");
    if (extra !== undefined || !ID.test(id || "")) throw new HttpError(400, "Bad path.");
    if (COLS.includes(col)) {
      await requireRole(req, "editor");
      if (b.op === "delete") await one("HDEL", "col:" + col, id);
      else { checkSize(b.data, 100_000); await one("HSET", "col:" + col, id, JSON.stringify(b.data)); }
      return done();
    }
    if (col === "media") {
      await requireRole(req, "editor");
      if (b.op === "delete") { await redis(["HDEL", "media:data", id], ["HDEL", "media:meta", id]); return done(); }
      const d = b.data || {};
      const meta = { name: String(d.name || "Photo").slice(0, 100), w: +d.w || 0, h: +d.h || 0, at: new Date().toISOString() };
      if (/^https:\/\//.test(d.data || "")) { // a link to a photo stored elsewhere (e.g. Google Drive): nothing is stored here but the link
        meta.url = String(d.data).slice(0, 1000);
        await one("HSET", "media:meta", id, JSON.stringify(meta));
      } else {
        if (!/^data:image\/(jpeg|png|webp|gif);base64,/.test(d.data || "")) throw new HttpError(400, "Only JPEG, PNG, WebP or GIF photos can be uploaded.");
        if (d.data.length > 1_400_000) throw new HttpError(413, "That photo is too large.");
        await redis(["HSET", "media:data", id, d.data], ["HSET", "media:meta", id, JSON.stringify(meta)]);
      }
      return done();
    }
    throw new HttpError(400, "Bad path.");
  }

  /* ---------- inbox ---------- */
  if (b.op === "inbox-handle" || b.op === "inbox-delete") {
    await requireRole(req, ["owner", "admin", "pastoral"]);
    const id = String(b.id || "");
    if (b.op === "inbox-delete") { await one("HDEL", "inbox", id); return done(); }
    const item = parse(await one("HGET", "inbox", id));
    if (!item) throw new HttpError(404, "Message not found.");
    item.handled = !!b.handled;
    await one("HSET", "inbox", id, JSON.stringify(item));
    return done();
  }

  /* ---------- users & access ---------- */
  if (b.op === "user-save" || b.op === "user-reset" || b.op === "user-delete") {
    const me = await requireRole(req, "admin");
    const email = String(b.email || "").trim().toLowerCase();
    const existing = parse(await one("HGET", "users", email));
    const isOwner = me.role === "owner";
    if (existing && existing.role === "owner") throw new HttpError(403, "The owner account can't be changed here.");
    if (existing && existing.role === "admin" && !isOwner) throw new HttpError(403, "Only the owner can change an administrator.");
    if (b.op === "user-delete") {
      if (!existing) throw new HttpError(404, "User not found.");
      await one("HDEL", "users", email);
      return done();
    }
    if (b.op === "user-reset") {
      if (!existing) throw new HttpError(404, "User not found.");
      const temp = randomPassword();
      await one("HSET", "users", email, JSON.stringify({ ...existing, ...hashPassword(temp), ver: (existing.ver || 1) + 1 }));
      return done({ tempPassword: temp });
    }
    const role = String(b.role || "");
    if (!ROLE_NAMES.includes(role)) throw new HttpError(400, "Pick a role.");
    if (role === "admin" && !isOwner) throw new HttpError(403, "Only the owner can make someone an administrator.");
    if (!validEmail(email)) throw new HttpError(400, "Please enter a valid email address.");
    if (existing) {
      await one("HSET", "users", email, JSON.stringify({ ...existing, role, name: String(b.name || existing.name).slice(0, 80), ver: role !== existing.role ? (existing.ver || 1) + 1 : existing.ver }));
      return done();
    }
    const temp = b.password && validPassword(b.password) ? b.password : randomPassword();
    await one("HSET", "users", email, JSON.stringify({ email, name: String(b.name || "").slice(0, 80) || email, role, ver: 1, createdAt: new Date().toISOString(), ...hashPassword(temp) }));
    return done({ tempPassword: temp });
  }
  throw new HttpError(400, "Unknown action.");
});
