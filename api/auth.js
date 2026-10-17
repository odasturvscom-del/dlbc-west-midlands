// /api/auth: sign in, sign out, first-time setup and password changes.
import { wrap, body, send, one, redis, parse, rateLimit, ip, HttpError, hashPassword, checkPassword, validPassword, validEmail,
  setSession, clearSession, currentUser, publicUser } from "./_lib.js";

export default wrap(async (req, res) => {
  if (req.method === "GET") {
    const [count, user] = await Promise.all([one("HLEN", "users"), currentUser(req)]);
    return send(res, 200, { setupNeeded: !count, user: publicUser(user) });
  }
  if (req.method !== "POST") throw new HttpError(405, "Use GET or POST.");
  const b = body(req);
  const email = String(b.email || "").trim().toLowerCase();

  if (b.action === "setup") {
    if (await one("HLEN", "users")) throw new HttpError(409, "Setup is already complete. Please sign in.");
    if (!process.env.SETUP_CODE) throw new HttpError(503, "Add a SETUP_CODE environment variable in Vercel, redeploy, then try again.");
    await rateLimit("setup:" + ip(req), 10, 900);
    if (String(b.code || "") !== process.env.SETUP_CODE) throw new HttpError(403, "That setup code isn't right.");
    if (!validEmail(email)) throw new HttpError(400, "Please enter a valid email address.");
    if (!validPassword(b.password)) throw new HttpError(400, "Use a password of at least 10 characters.");
    const user = { email, name: String(b.name || "").slice(0, 80) || email, role: "owner", ver: 1, createdAt: new Date().toISOString(), ...hashPassword(b.password) };
    const [created] = await redis(["HSETNX", "users", email, JSON.stringify(user)]);
    if (!created) throw new HttpError(409, "That account already exists.");
    setSession(res, user);
    return send(res, 200, { user: publicUser(user) });
  }

  if (b.action === "login") {
    await rateLimit("login:" + ip(req), 10, 900);
    const user = parse(await one("HGET", "users", email));
    if (!user || user.role === "none" || !checkPassword(String(b.password || ""), user)) throw new HttpError(401, "Email or password is incorrect.");
    setSession(res, user);
    return send(res, 200, { user: publicUser(user) });
  }

  if (b.action === "logout") { clearSession(res); return send(res, 200, { ok: true }); }

  if (b.action === "password") {
    const user = await currentUser(req);
    if (!user) throw new HttpError(401, "Please sign in again.");
    if (!checkPassword(String(b.current || ""), user)) throw new HttpError(403, "Your current password is incorrect.");
    if (!validPassword(b.next)) throw new HttpError(400, "Use a new password of at least 10 characters.");
    const next = { ...user, ...hashPassword(b.next), ver: (user.ver || 1) + 1 };
    await one("HSET", "users", user.email, JSON.stringify(next));
    setSession(res, next); // other devices are signed out
    return send(res, 200, { ok: true });
  }
  throw new HttpError(400, "Unknown action.");
});
