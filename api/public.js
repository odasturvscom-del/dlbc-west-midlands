// GET /api/public?what=give  → funds shown on the Give page
// GET /api/public?what=places&event=ID → places left for an event
import { wrap, send, one, redis, pairs, parse, HttpError } from "./_lib.js";

export async function placesLeft(eventId) {
  const [ev, tickets] = await redis(["HGET", "col:events", eventId], ["HGETALL", "rec:tickets"]);
  const e = parse(ev);
  if (!e) return null;
  const taken = Object.values(pairs(tickets)).map(v => parse(v, {})).filter(t => t.eventId === eventId && t.status !== "Cancelled").reduce((n, t) => n + (+t.guests || 1), 0);
  const cap = +e.capacity || 0;
  return { capacity: cap, taken, left: cap ? Math.max(0, cap - taken) : null };
}

export default wrap(async (req, res) => {
  const what = String(req.query.what || "");
  if (what === "give") {
    const [funds, gifts] = await redis(["HGETALL", "rec:funds"], ["HGETALL", "rec:gifts"]);
    const raised = {};
    Object.values(pairs(gifts)).forEach(v => { const g = parse(v, {}); raised[g.fund] = (raised[g.fund] || 0) + (+g.amount || 0); });
    const list = Object.entries(pairs(funds)).map(([id, v]) => ({ id, ...parse(v, {}) }))
      .filter(f => f.public && f.active !== false)
      .map(f => ({ id: f.id, name: f.name, description: f.description || "", paymentLink: /^https:\/\//.test(f.paymentLink || "") ? f.paymentLink : "",
        bank: f.bankDetails || "", target: f.showProgress ? (+f.target || 0) : 0, raised: f.showProgress ? Math.round(raised[f.id] || 0) : 0, giftAid: f.giftAid !== false }));
    return send(res, 200, { funds: list }, "public, max-age=0, s-maxage=30, stale-while-revalidate=120");
  }
  if (what === "places") {
    const p = await placesLeft(String(req.query.event || ""));
    if (!p) throw new HttpError(404, "Event not found.");
    return send(res, 200, p, "public, max-age=0, s-maxage=10");
  }
  throw new HttpError(400, "Unknown request.");
});
