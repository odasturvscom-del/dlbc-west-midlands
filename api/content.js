// GET /api/content: everything the public website needs in one small request.
import { wrap, redis, pairs, parse, send, currentUser, RANK } from "./_lib.js";

export default wrap(async (req, res) => {
  const user = req.query.u ? await currentUser(req) : null;
  const staff = user && (RANK[user.role] || 0) >= RANK.editor;
  const [settings, campuses, ministries, ev, se, po, me] = await redis(
    ["GET", "doc:site/settings"], ["GET", "doc:site/campuses"], ["GET", "doc:site/ministries"],
    ["HGETALL", "col:events"], ["HGETALL", "col:sermons"], ["HGETALL", "col:posts"], ["HGETALL", "media:meta"]
  );
  const today = new Date().toISOString().slice(0, 10);
  const list = (raw, isPost) => Object.entries(pairs(raw)).map(([id, v]) => ({ id, data: parse(v, {}) }))
    .filter(d => staff || (d.data.published !== false && (!isPost || (d.data.date || "") <= today)));
  const media = {};
  for (const [id, v] of Object.entries(pairs(me))) media[id] = parse(v, {});
  send(res, 200, {
    docs: { "site/settings": parse(settings), "site/campuses": parse(campuses), "site/ministries": parse(ministries) },
    events: list(ev), sermons: list(se), posts: list(po, true), media
  }, staff ? "private, no-store" : "public, max-age=0, s-maxage=15, stale-while-revalidate=60");
});
