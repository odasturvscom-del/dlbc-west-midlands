// GET /api/media?id=…: serves an uploaded photo. Photos never change once uploaded, so they cache forever.
import { wrap, one, send } from "./_lib.js";

export default wrap(async (req, res) => {
  const id = String(req.query.id || "");
  if (!/^[A-Za-z0-9_-]{4,60}$/.test(id)) return send(res, 400, { error: "Bad image id" });
  const data = await one("HGET", "media:data", id);
  const m = /^data:(image\/[a-z+.-]+);base64,(.+)$/i.exec(data || "");
  if (!m) return send(res, 404, { error: "Image not found" });
  res.setHeader("Content-Type", m[1]);
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  res.status(200).send(Buffer.from(m[2], "base64"));
});
