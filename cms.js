/* Deeper Life Bible Church, West Midlands: church management (loaded only inside the admin portal). */
(function(){
"use strict";
if (window.CMS_READY) return;

/* ============================== Styles ============================== */
const css = document.createElement("style");
css.textContent = `
.adm-side .grp{font-size:10px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.4);padding:14px 12px 4px}
.adm-side nav button{padding:8px 12px;font-size:13.5px}
.adm-side nav button::before{content:"";width:5px;height:5px;border-radius:50%;background:currentColor;opacity:.55;flex:none}
.cm-bar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:14px}
.cm-bar .inp{min-height:38px;width:auto;flex:0 1 auto}
.cm-bar .grow{flex:1 1 220px;min-width:0}
.cm-seg{display:inline-flex;border:1px solid var(--line);border-radius:10px;overflow:hidden;background:#fff}
.cm-seg button{border:0;background:transparent;padding:8px 12px;font-size:13px;font-weight:700;cursor:pointer}
.cm-seg button[aria-pressed="true"]{background:var(--navy);color:#fff}
.cm-tbl td{font-size:13.5px}
.cm-tbl tr[data-open]{cursor:pointer}
.num{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
.board{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(230px,1fr);gap:12px;overflow-x:auto;padding-bottom:8px}
.board .col{background:var(--grey);border-radius:14px;padding:10px;display:grid;gap:8px;align-content:start;min-height:120px}
.board .col h3{font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;margin:4px 4px 2px;display:flex;justify-content:space-between}
.card{background:#fff;border:1px solid var(--line);border-radius:12px;padding:12px;display:grid;gap:6px;font-size:13px;cursor:pointer}
.card:hover{border-color:var(--blue)}
.card b{font-size:14px}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px;margin-bottom:16px}
.kpi{background:#fff;border:1px solid var(--line);border-radius:16px;padding:16px 18px;display:grid;gap:4px;text-decoration:none;color:inherit}
.kpi b{font-family:var(--f-display);font-stretch:118%;font-weight:900;font-size:30px;line-height:1;font-variant-numeric:tabular-nums}
.kpi span{font-size:12.5px;color:var(--muted);font-weight:600}
.kpi small{font-size:12px;color:var(--muted)}
.kpi .up{color:var(--ok);font-weight:700}.kpi .down{color:var(--err);font-weight:700}
.grid2{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px}
.grid2>.panel{margin:0}
.bars{display:flex;align-items:flex-end;gap:6px;height:150px;padding-top:10px;border-bottom:1px solid var(--line)}
.bars .b{flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;height:100%;position:relative;min-width:0}
.bars .b i{display:block;width:100%;max-width:28px;background:var(--blue);border-radius:4px 4px 0 0;min-height:2px}
.bars .b:hover i{background:var(--navy)}
.bars .b em{position:absolute;bottom:calc(100% + 4px);font-style:normal;font-size:11px;font-weight:700;background:var(--navy);color:#fff;padding:3px 7px;border-radius:6px;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .15s}
.bars .b:hover em,.bars .b:focus-within em{opacity:1}
.bars-x{display:flex;gap:6px;margin-top:6px}.bars-x span{flex:1;text-align:center;font-size:10.5px;color:var(--muted);min-width:0;overflow:hidden;white-space:nowrap}
.prog{height:8px;border-radius:99px;background:var(--grey);overflow:hidden}.prog i{display:block;height:100%;background:var(--blue);border-radius:99px}
.prog.over i{background:var(--err)}
.sub-tbl{width:100%;border-collapse:collapse;font-size:13px}
.sub-tbl td,.sub-tbl th{padding:4px;vertical-align:top}
.sub-tbl th{text-align:left;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
.sub-tbl .inp{min-height:36px;padding:6px 8px;font-size:13px}
.chips{display:flex;flex-wrap:wrap;gap:6px}
.chips .chip button{border:0;background:transparent;cursor:pointer;font-size:13px;line-height:1;padding:0 0 0 4px;color:inherit}
.checks{display:flex;flex-wrap:wrap;gap:6px 14px}
.cal{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}
.cal .dh{font-size:10.5px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);padding:4px}
.cal .d{background:#fff;border:1px solid var(--line);border-radius:10px;min-height:96px;padding:6px;display:grid;align-content:start;gap:4px;min-width:0}
.cal .d.out{opacity:.45}.cal .d.today{border-color:var(--blue);box-shadow:inset 0 0 0 1px var(--blue)}
.cal .d>span{font-size:11px;font-weight:800;color:var(--muted)}
.cal .ev{font-size:11.5px;background:#E3EEFB;color:var(--navy);border-radius:6px;padding:3px 6px;cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cal .d.empty{visibility:hidden}
@media (max-width:860px){.adm-side .grp,.adm-side>.brand{display:none!important}.adm-side nav button::before{display:none}.adm-side nav button{background:rgba(255,255,255,.06)}}
@media (max-width:700px){.cal{grid-template-columns:1fr}.cal .dh,.cal .d.empty{display:none}.cal .d{min-height:0}}
.warnline{font-size:12px;color:var(--warn);font-weight:700}
.okline{font-size:12px;color:var(--ok);font-weight:700}
.ckl{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:6px;max-height:420px;overflow:auto;border:1px solid var(--line);border-radius:12px;padding:8px}
.ckl label{display:flex;gap:8px;align-items:center;font-size:13.5px;padding:6px 8px;border-radius:8px;cursor:pointer}
.ckl label:hover{background:var(--off)}
.ckl input{width:18px;height:18px;accent-color:var(--blue)}
.profile-head{display:flex;gap:16px;align-items:center;flex-wrap:wrap;margin-bottom:6px}
.profile-head .av{width:56px;height:56px;border-radius:50%;background:var(--blue);color:#fff;display:grid;place-items:center;font-weight:900;font-size:22px}
.pill-row{display:flex;gap:6px;flex-wrap:wrap}
.oos-time{font-family:var(--f-display);font-weight:900;font-variant-numeric:tabular-nums;color:var(--blue);white-space:nowrap}
@media print{.adm-side,.cm-bar,.savebar,.adm-top .abtn,.noprint{display:none!important}.adm{display:block}.panel{border:0;padding:0}}
`;
document.head.appendChild(css);

/* ============================== Data ============================== */
const R = {};          // collection cache: name -> [{id, data}]
const R_AT = {};       // when each collection was last fetched
let DIR = null, USERS = null;
const get = async url => api("GET", url);
async function load(c, force){
  if (!force && R[c]) return R[c];
  if (c === "directory"){ DIR = (await get("/api/records?c=directory")).items; return DIR; }
  R[c] = (await get("/api/records?c=" + c)).items; R_AT[c] = Date.now(); return R[c];
}
async function loadMany(list, force){
  const need = list.filter(c => force || !R[c]).filter(c => canRead(c));
  if (need.length){ const r = await get("/api/records?c=batch&list=" + need.join(",")); Object.assign(R, r.data); need.forEach(c => R_AT[c] = Date.now()); }
}
async function saveRec(c, id, data, isNew){
  await api("POST", "/api/records", {op: "set", c, id, data, isNew: !!isNew});
  const list = R[c] || (R[c] = []); const i = list.findIndex(x => x.id === id);
  const row = {id, data: Object.assign({}, data, {updatedAt: new Date().toISOString()})};
  if (i >= 0) list[i] = row; else list.push(row);
}
async function delRec(c, id){ await api("POST", "/api/records", {op: "delete", c, id}); R[c] = (R[c] || []).filter(x => x.id !== id); }
async function users(){ if (!USERS) try { USERS = (await get("/api/records?c=users")).items; } catch(e){ USERS = []; } return USERS; }

/* ============================== Roles ============================== */
const ALL = ["admin","pastoral","finance","editor"];
const TAB_ROLES = {
  dashboard: ALL, tasks: ALL, team: ALL,
  members: ["admin","pastoral"], visitors: ["admin","pastoral"], attendance: ["admin","pastoral","editor"], kids: ["admin","pastoral","editor"], groups: ["admin","pastoral"], care: ["admin","pastoral"],
  funds: ["admin","finance"], declarations: ["admin","finance"], gifts: ["admin","finance"], recurring: ["admin","finance"], pledges: ["admin","finance"], giftaid: ["admin","finance"],
  budgets: ["admin","finance"], expenses: ["admin","finance"], reports: ["admin","finance","pastoral"],
  teams: ["admin","pastoral","editor"], rota: ["admin","pastoral","editor"], availability: ["admin","pastoral","editor"],
  events: ["admin","editor"], tickets: ["admin","pastoral","editor"], bookings: ["admin","pastoral","editor"], rooms: ["admin"], services: ["admin","pastoral","editor"],
  segments: ["admin","pastoral"], broadcasts: ["admin","pastoral"], social: ["admin","editor"], inbox: ["admin","pastoral"],
  content: ["admin"], images: ["admin","editor"], campuses: ["admin"], posts: ["admin","editor"], sermons: ["admin","editor"], live: ["admin","editor"], ministries: ["admin","editor"], media: ["admin","editor"],
  audit: ["admin"]
};
const READS = { members:["admin","pastoral"], visitors:["admin","pastoral"], attendance:["admin","pastoral","editor"], groups:["admin","pastoral"], care:["admin","pastoral"],
  funds:["admin","finance"], declarations:["admin","finance"], gifts:["admin","finance"], recurring:["admin","finance"], pledges:["admin","finance"], budgets:["admin","finance"], expenses:["admin","finance"],
  teams:["admin","pastoral","editor"], rota:["admin","pastoral","editor"], availability:["admin","pastoral","editor"], tickets:["admin","pastoral","editor"],
  rooms:["admin","pastoral","editor"], bookings:["admin","pastoral","editor","finance"], services:["admin","pastoral","editor"], segments:["admin","pastoral"], broadcasts:["admin","pastoral"],
  social:["admin","editor"], tasks:ALL, checkins:["admin","pastoral","editor"] };
const role = () => S.me ? S.me.role : "none";
const canRead = c => role() === "owner" || (READS[c] || []).includes(role());
window.canTab = function(t){ const r = role(); if (!S.me) return false; if (r === "owner") return true; return (TAB_ROLES[t] || []).includes(r); };
ROLES.finance = {label: "Finance team", desc: "Giving, Gift Aid, budgets and expenses.", tabs: []};
ROLES.pastoral.desc = "People, visitors, attendance, groups, pastoral care, rotas and the inbox.";
ROLES.editor.desc = "Website, events, rotas, order of service and social media.";
ROLES.admin.desc = "Everything except changing the owner.";

/* ============================== Helpers ============================== */
const GBP = new Intl.NumberFormat("en-GB", {style: "currency", currency: "GBP"});
const money = n => GBP.format(+n || 0);
const today = () => todayISO();
const addDays = (iso, n) => { const d = parseD(iso) || new Date(); d.setDate(d.getDate() + n); return new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString().slice(0,10); };
const pname = d => d ? [d.firstName, d.lastName].filter(Boolean).join(" ") || d.name || "Unnamed" : "";
function peopleList(){ return (R.members || DIR || []).map(x => ({id: x.id, name: pname(x.data), d: x.data})).sort((a,b) => a.name.localeCompare(b.name)); }
function personName(id){ if (!id) return ""; const p = (R.members || DIR || []).find(x => x.id === id); return p ? pname(p.data) : "Former member"; }
const campusNames = () => campuses().map(c => c.name).filter(Boolean);
function csvCell(v){ v = v == null ? "" : String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g,'""') + '"' : v; }
function downloadFile(name, text, type = "text/csv"){ const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], {type})); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
function toCSV(rows, cols){ return [cols.map(c => csvCell(c[1])).join(",")].concat(rows.map(r => cols.map(c => csvCell(typeof c[0] === "function" ? c[0](r) : r[c[0]])).join(","))).join("\n"); }
function parseCSV(text){
  const rows = []; let row = [], cur = "", q = false;
  for (let i = 0; i < text.length; i++){ const ch = text[i];
    if (q){ if (ch === '"' && text[i+1] === '"'){ cur += '"'; i++; } else if (ch === '"') q = false; else cur += ch; }
    else if (ch === '"') q = true; else if (ch === ",") { row.push(cur); cur = ""; } else if (ch === "\n" || ch === "\r"){ if (ch === "\r" && text[i+1] === "\n") i++; row.push(cur); rows.push(row); row = []; cur = ""; } else cur += ch; }
  if (cur || row.length){ row.push(cur); rows.push(row); }
  return rows.filter(r => r.some(x => x.trim()));
}
async function copyText(t, label){ try { await navigator.clipboard.writeText(t); toast(label || "Copied"); } catch(e){ const ta = document.createElement("textarea"); ta.value = t; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); toast(label || "Copied"); } catch(x){ toast("Couldn't copy. Select the text manually.", true); } ta.remove(); } }
const errMsg = e => (e && e.message) || "Something went wrong.";
const taxYear = iso => { const d = parseD(iso); if (!d) return ""; const y = d.getFullYear(); const start = new Date(y, 3, 6); return d >= start ? `${y}-${String(y+1).slice(2)}` : `${y-1}-${String(y).slice(2)}`; };
const ageOn = (dob, iso) => { const b = parseD(dob), d = parseD(iso || today()); if (!b || !d) return null; let a = d.getFullYear() - b.getFullYear(); if (d.getMonth() < b.getMonth() || (d.getMonth() === b.getMonth() && d.getDate() < b.getDate())) a--; return a; };
function bars(points, fmt = v => v){
  if (!points.length) return `<p class="hint">No data yet.</p>`;
  const max = Math.max(1, ...points.map(p => p.v));
  return `<div class="bars" role="img" aria-label="${esc(points.map(p => p.l + ": " + fmt(p.v)).join(", "))}">${points.map(p => `<div class="b" tabindex="0"><em>${esc(p.l)}: ${esc(fmt(p.v))}</em><i style="height:${Math.round(p.v / max * 100)}%"></i></div>`).join("")}</div>
  <div class="bars-x" aria-hidden="true">${points.map((p,i) => `<span>${i % Math.ceil(points.length/8) === 0 || i === points.length-1 ? esc(p.s || p.l) : ""}</span>`).join("")}</div>`;
}
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

/* ============================== Generic list / editor engine ============================== */
const CM = { view: {}, q: {}, f: {}, edit: null, draft: null, dirty: false, month: {}, extra: {} };
const MOD = {};   // module definitions by tab key

function optList(o){ return typeof o === "function" ? o() : (o || []); }
function optPairs(o){ return optList(o).map(x => Array.isArray(x) ? x : [x, x]); }
function fieldVal(path){ return getPath(CM.draft, path); }

function renderField(f, path){
  path = path || f.k; const v = fieldVal(path); const id = "cf_" + path.replace(/\./g, "_");
  const lab = `<label for="${id}">${esc(f.label)}${f.req ? "" : f.opt ? " <i>(optional)</i>" : ""}</label>`;
  const wrap = inner => `<div class="fld ${f.full || f.type === "textarea" || f.type === "list" || f.type === "people" || f.type === "multi" ? "full" : ""}">${lab}${inner}${f.hint ? `<span class="hint">${esc(f.hint)}</span>` : ""}</div>`;
  switch (f.type){
    case "textarea": return wrap(`<textarea class="inp" id="${id}" data-f="${path}" rows="${f.rows || 3}">${esc(v || "")}</textarea>`);
    case "select": case "person": case "user": {
      const opts = f.type === "person" ? peopleList().map(p => [p.id, p.name]) : f.type === "user" ? (USERS || []).map(u => [u.email, u.name || u.email]) : optPairs(f.opts);
      return wrap(`<select class="inp" id="${id}" data-f="${path}"><option value="">${f.type === "select" ? "Choose…" : "—"}</option>${opts.map(([val,l]) => `<option value="${esc(val)}" ${String(v) === String(val) ? "selected" : ""}>${esc(l)}</option>`).join("")}</select>`);
    }
    case "check": return `<div class="fld"><span class="hint" style="visibility:hidden">.</span><label class="toggle" for="${id}"><input type="checkbox" id="${id}" data-f="${path}" ${v ? "checked" : ""}>${esc(f.label)}</label></div>`;
    case "multi": { const cur = Array.isArray(v) ? v : []; return wrap(`<div class="checks">${optPairs(f.opts).map(([val,l],i) => `<label class="toggle"><input type="checkbox" data-multi="${path}" value="${esc(val)}" ${cur.includes(val) ? "checked" : ""}>${esc(l)}</label>`).join("")}</div>`); }
    case "people": { const cur = Array.isArray(v) ? v : [];
      return wrap(`<div class="chips" style="margin-bottom:6px">${cur.map(pid => `<span class="chip blue">${esc(personName(pid))}<button type="button" data-unpeople="${path}" data-pid="${esc(pid)}" aria-label="Remove">×</button></span>`).join("") || '<span class="hint">Nobody added yet.</span>'}</div>
        <select class="inp" id="${id}" data-addpeople="${path}"><option value="">+ Add a person…</option>${peopleList().filter(p => !cur.includes(p.id)).map(p => `<option value="${esc(p.id)}">${esc(p.name)}</option>`).join("")}</select>`); }
    case "image": { const url = mediaUrl(v); return wrap(`<div class="imgpick">${url ? `<img src="${esc(url)}" alt="">` : ""}<div class="acts"><button type="button" class="abtn" data-cpick="${path}">${url ? "Change" : "Add photo / receipt"}</button>${url ? `<button type="button" class="abtn" data-cclear="${path}">Remove</button>` : ""}</div></div>`); }
    case "list": { const rows = Array.isArray(v) ? v : [];
      return `<div class="fld full"><label>${esc(f.label)}</label>${f.hint ? `<span class="hint">${esc(f.hint)}</span>` : ""}<div class="tbl-wrap"><table class="sub-tbl"><thead><tr>${f.sub.map(s => `<th>${esc(s.label)}</th>`).join("")}<th></th></tr></thead><tbody>
        ${rows.map((r,i) => `<tr>${f.sub.map(s => `<td style="${s.w ? "width:" + s.w : ""}">${subInput(s, `${path}.${i}.${s.k}`)}</td>`).join("")}<td style="white-space:nowrap">${i > 0 ? `<button type="button" class="abtn" data-lup="${path}" data-i="${i}" aria-label="Move up" style="padding:6px 8px">↑</button>` : ""}<button type="button" class="abtn danger" data-ldel="${path}" data-i="${i}" aria-label="Remove row" style="padding:6px 8px">×</button></td></tr>`).join("")}
        </tbody></table></div><div><button type="button" class="abtn" data-ladd="${path}">+ ${esc(f.addLabel || "Add row")}</button></div>${f.after ? f.after(rows) : ""}</div>`; }
    default: return wrap(`<input class="inp" id="${id}" data-f="${path}" type="${f.type === "money" ? "number" : (f.type || "text")}" ${f.type === "money" ? 'step="0.01" min="0"' : ""} value="${esc(v ?? "")}" ${f.ph ? `placeholder="${esc(f.ph)}"` : ""}>`);
  }
}
function subInput(s, path){
  const v = fieldVal(path);
  if (s.type === "select" || s.type === "person"){ const opts = s.type === "person" ? peopleList().map(p => [p.id, p.name]) : optPairs(s.opts);
    return `<select class="inp" data-f="${path}" aria-label="${esc(s.label)}"><option value="">—</option>${opts.map(([val,l]) => `<option value="${esc(val)}" ${String(v) === String(val) ? "selected" : ""}>${esc(l)}</option>`).join("")}</select>`; }
  if (s.type === "textarea") return `<textarea class="inp" data-f="${path}" rows="2" aria-label="${esc(s.label)}">${esc(v || "")}</textarea>`;
  if (s.type === "check") return `<input type="checkbox" data-f="${path}" ${v ? "checked" : ""} aria-label="${esc(s.label)}" style="width:18px;height:18px;margin-top:9px">`;
  return `<input class="inp" data-f="${path}" type="${s.type === "money" ? "number" : (s.type || "text")}" ${s.type === "money" ? 'step="0.01"' : ""} value="${esc(v ?? "")}" aria-label="${esc(s.label)}">`;
}

function filtered(m){
  const rows = (R[m.c] || []).slice(); const q = (CM.q[m.key] || "").toLowerCase(); const fs = CM.f[m.key] || {};
  return rows.filter(r => {
    if (q && !(m.search || []).some(k => String(typeof k === "function" ? k(r.data) : r.data[k] || "").toLowerCase().includes(q))) return false;
    for (const [k,v] of Object.entries(fs)) { if (!v) continue; const dv = r.data[k]; if (k === "_mine") { if (r.data.assignee !== S.me.email) return false; continue; } if (Array.isArray(dv) ? !dv.includes(v) : String(dv || "") !== v) return false; }
    return m.where ? m.where(r) : true;
  }).sort(m.sort || ((a,b) => String(b.data.date || b.data.updatedAt || "").localeCompare(String(a.data.date || a.data.updatedAt || ""))));
}
function listView(m){
  const rows = filtered(m); const view = CM.view[m.key] || m.views?.[0] || "list";
  const fs = CM.f[m.key] || {};
  const filterSel = (m.filters || []).map(k => { const f = m.fields.find(x => x.k === k); if (!f) return ""; const opts = f.type === "user" ? (USERS || []).map(u => [u.email, u.name]) : optPairs(f.opts);
    return `<select class="inp" data-cfilter="${k}" aria-label="Filter by ${esc(f.label)}"><option value="">All ${esc(f.label.toLowerCase())}</option>${opts.map(([v,l]) => `<option value="${esc(v)}" ${fs[k] === v ? "selected" : ""}>${esc(l)}</option>`).join("")}</select>`; }).join("");
  let body;
  if (view === "board"){
    const col = m.fields.find(x => x.k === m.boardBy); const stages = optPairs(col.opts);
    body = `<div class="board">${stages.map(([s]) => { const items = rows.filter(r => (r.data[m.boardBy] || stages[0][0]) === s);
      return `<div class="col"><h3><span>${esc(s)}</span><span>${items.length}</span></h3>${items.map(r => `<div class="card" data-open="${esc(r.id)}" tabindex="0"><b>${esc(m.name(r.data))}</b>${m.cardLine ? `<span class="hint">${m.cardLine(r.data)}</span>` : ""}
        <select class="inp" data-move="${esc(r.id)}" aria-label="Move to stage" style="min-height:32px;font-size:12px;padding:4px 8px">${stages.map(([o]) => `<option ${o === s ? "selected" : ""}>${esc(o)}</option>`).join("")}</select></div>`).join("")}</div>`; }).join("")}</div>`;
  } else if (view === "calendar"){
    body = calendar(m, rows);
  } else {
    body = rows.length ? `<div class="panel" style="padding:0;overflow:hidden"><div class="tbl-wrap"><table class="tbl cm-tbl"><thead><tr>${m.columns.map(c => `<th class="${c.num ? "num" : ""}">${esc(c.label)}</th>`).join("")}</tr></thead><tbody>
      ${rows.slice(0, 500).map(r => `<tr data-open="${esc(r.id)}" tabindex="0">${m.columns.map(c => `<td class="${c.num ? "num" : ""}">${c.html ? c.html(r.data, r) : esc(c.v ? c.v(r.data, r) : r.data[c.k] ?? "")}</td>`).join("")}</tr>`).join("")}
      </tbody></table></div>${rows.length > 500 ? `<p class="hint" style="padding:10px 14px">Showing the first 500. Use search to narrow down.</p>` : ""}</div>`
      : `<div class="panel"><div class="empty lt" style="margin:0;border-color:#C9D3E2"><h3>${esc(m.emptyTitle || "Nothing here yet")}</h3><p>${esc(m.emptyText || "Add the first one to get started.")}</p>${m.noNew ? "" : `<button class="abtn pri" type="button" data-cnew>${esc(m.newLabel || "Add")}</button>`}</div></div>`;
  }
  return head(m.title, m.sub, `${m.listActions ? m.listActions(rows) : ""}${m.importable ? `<label class="abtn" for="cimp" style="cursor:pointer">Import CSV</label><input type="file" id="cimp" accept=".csv,text/csv" hidden>` : ""}<button class="abtn" type="button" data-cexport>Export CSV</button>${m.noNew ? "" : `<button class="abtn pri" type="button" data-cnew>${esc(m.newLabel || "Add")}</button>`}`) +
    (m.top ? m.top(rows) : "") +
    `<div class="cm-bar">${m.search ? `<input class="inp grow" type="search" id="cq" placeholder="Search ${esc(m.title.toLowerCase())}…" value="${esc(CM.q[m.key] || "")}" aria-label="Search">` : ""}${filterSel}
     ${m.mineFilter ? `<label class="toggle"><input type="checkbox" data-cmine ${fs._mine ? "checked" : ""}>Only mine</label>` : ""}
     ${(m.views || []).length > 1 ? `<span class="cm-seg" role="group" aria-label="View">${m.views.map(v => `<button type="button" data-cview="${v}" aria-pressed="${view === v}">${{list:"List",board:"Board",calendar:"Calendar"}[v]}</button>`).join("")}</span>` : ""}
     <span class="hint" style="margin-left:auto">${rows.length} ${rows.length === 1 ? "item" : "items"}</span></div>` + body;
}
function calendar(m, rows){
  const ym = CM.month[m.key] || today().slice(0,7); const [y, mo] = ym.split("-").map(Number);
  const first = new Date(y, mo-1, 1); const startDow = (first.getDay() + 6) % 7; const days = new Date(y, mo, 0).getDate();
  const byDate = {}; rows.forEach(r => { const d = String(r.data[m.calendarBy] || "").slice(0,10); (byDate[d] = byDate[d] || []).push(r); });
  const cells = []; for (let i = 0; i < startDow; i++) cells.push(`<div class="d empty out"></div>`);
  for (let d = 1; d <= days; d++){ const iso = `${ym}-${String(d).padStart(2,"0")}`; const ev = byDate[iso] || [];
    cells.push(`<div class="d ${iso === today() ? "today" : ""}"><span>${d} ${DOW[new Date(y,mo-1,d).getDay()].slice(0,3)}</span>${ev.map(r => `<div class="ev" data-open="${esc(r.id)}" tabindex="0" title="${esc(m.name(r.data))}">${esc(m.calLabel ? m.calLabel(r.data) : m.name(r.data))}</div>`).join("")}<button type="button" class="abtn noprint" data-cnewdate="${iso}" style="padding:2px 6px;font-size:11px;justify-self:start;opacity:.6" aria-label="Add on ${iso}">+</button></div>`); }
  const prev = new Date(y, mo-2, 1), next = new Date(y, mo, 1); const k = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
  return `<div class="panel"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><button class="abtn" type="button" data-cmonth="${k(prev)}">← ${MONTHS[prev.getMonth()]}</button><b style="font-size:16px">${MONTHS[mo-1]} ${y}</b><button class="abtn" type="button" data-cmonth="${k(next)}">${MONTHS[next.getMonth()]} →</button></div>
    <div class="cal">${["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => `<div class="dh">${d}</div>`).join("")}${cells.join("")}</div></div>`;
}
function editorView(m){
  const isNew = CM.edit === "new"; const d = CM.draft;
  return head(isNew ? (m.newLabel || "Add") : (m.name(d) || m.title), isNew ? "" : (m.editSub ? m.editSub(d) : ""), `<button class="abtn" type="button" data-cback>← Back to ${esc(m.title.toLowerCase())}</button>${!isNew && m.editActions ? m.editActions(d) : ""}`) +
    (m.before ? m.before(d, isNew) : "") +
    `<div class="panel"><div class="fgrid lt">${m.fields.filter(f => !f.hide || !f.hide(d)).map(f => f.section ? `<div class="full" style="margin-top:6px"><b style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:var(--blue)">${esc(f.section)}</b></div>` : renderField(f)).join("")}</div></div>` +
    (m.after ? m.after(d, isNew) : "") +
    `<div class="savebar" id="savebar"><span>${isNew ? "Not saved yet." : CM.dirty ? "You have unsaved changes." : "Saved."}</span><div style="display:flex;gap:8px">${isNew ? "" : `<button type="button" class="abtn danger" id="cdel">Delete</button>`}<button type="button" class="abtn" data-cback>Close</button><button type="button" class="abtn pri" id="csave">${isNew ? "Save" : "Save changes"}</button></div></div>`;
}
function moduleView(m){ return CM.edit ? editorView(m) : listView(m); }

function openRec(m, id, preset){
  if (id === "new"){ CM.edit = "new"; CM.draft = Object.assign({}, m.defaults ? m.defaults() : {}, preset || {}); }
  else { const r = (R[m.c] || []).find(x => x.id === id); if (!r) return; CM.edit = id; CM.draft = clone(r.data); }
  CM.dirty = false; reAdminTop();
}
function reAdminTop(){ A.keepScroll = false; renderAdmin(); }
function reAdminKeep(){ A.keepScroll = true; renderAdmin(); }

function wireModule(m){
  const main = $("#admMain"); if (!main) return;
  const mark = () => { CM.dirty = true; const sb = $("#savebar span"); if (sb) sb.textContent = "You have unsaved changes."; };
  main.addEventListener("input", e => { const p = e.target.dataset && e.target.dataset.f; if (!p) return; setPath(CM.draft, p, e.target.type === "checkbox" ? e.target.checked : e.target.value); mark(); if (m.live) m.live(CM.draft, p); });
  main.addEventListener("change", e => { const t = e.target;
    if (t.dataset.f && (t.tagName === "SELECT" || t.type === "checkbox")){ setPath(CM.draft, t.dataset.f, t.type === "checkbox" ? t.checked : t.value); mark(); if (m.rerenderOn && m.rerenderOn.includes(t.dataset.f)) reAdminKeep(); }
    if (t.dataset.multi){ const cur = new Set(getPath(CM.draft, t.dataset.multi) || []); t.checked ? cur.add(t.value) : cur.delete(t.value); setPath(CM.draft, t.dataset.multi, [...cur]); mark(); }
    if (t.dataset.addpeople && t.value){ const cur = getPath(CM.draft, t.dataset.addpeople) || []; setPath(CM.draft, t.dataset.addpeople, cur.concat([t.value])); mark(); reAdminKeep(); }
  });
  $$("[data-unpeople]").forEach(b => b.onclick = () => { setPath(CM.draft, b.dataset.unpeople, (getPath(CM.draft, b.dataset.unpeople) || []).filter(x => x !== b.dataset.pid)); mark(); reAdminKeep(); });
  $$("[data-ladd]").forEach(b => b.onclick = () => { const f = findField(m, b.dataset.ladd); const cur = getPath(CM.draft, b.dataset.ladd) || []; setPath(CM.draft, b.dataset.ladd, cur.concat([f && f.newRow ? f.newRow(cur) : {}])); mark(); reAdminKeep(); });
  $$("[data-ldel]").forEach(b => b.onclick = () => { const cur = (getPath(CM.draft, b.dataset.ldel) || []).slice(); cur.splice(+b.dataset.i, 1); setPath(CM.draft, b.dataset.ldel, cur); mark(); reAdminKeep(); });
  $$("[data-lup]").forEach(b => b.onclick = () => { const cur = (getPath(CM.draft, b.dataset.lup) || []).slice(); const i = +b.dataset.i; [cur[i-1], cur[i]] = [cur[i], cur[i-1]]; setPath(CM.draft, b.dataset.lup, cur); mark(); reAdminKeep(); });
  $$("[data-cpick]").forEach(b => b.onclick = () => pickImage(id => { setPath(CM.draft, b.dataset.cpick, id); mark(); reAdminKeep(); }));
  $$("[data-cclear]").forEach(b => b.onclick = () => { setPath(CM.draft, b.dataset.cclear, ""); mark(); reAdminKeep(); });
  $$("[data-cback]").forEach(b => b.onclick = () => { CM.edit = null; CM.draft = null; CM.dirty = false; reAdminTop(); });
  $$("[data-cnew]").forEach(b => b.onclick = () => openRec(m, "new"));
  $$("[data-cnewdate]").forEach(b => b.onclick = () => openRec(m, "new", {[m.calendarBy]: b.dataset.cnewdate}));
  $$("[data-open]").forEach(el => { const go = () => openRec(m, el.dataset.open); el.addEventListener("click", e => { if (e.target.closest("select,button,input,a")) return; go(); }); el.addEventListener("keydown", e => { if (e.key === "Enter") go(); }); });
  $$("[data-move]").forEach(sel => sel.onchange = async () => { const r = (R[m.c] || []).find(x => x.id === sel.dataset.move); if (!r) return; const d = Object.assign({}, r.data, {[m.boardBy]: sel.value}); try { await saveRec(m.c, r.id, d); toast("Moved to " + sel.value); reAdminKeep(); } catch(e){ toast(errMsg(e), true); } });
  const q = $("#cq"); if (q) q.oninput = () => { CM.q[m.key] = q.value; clearTimeout(q._t); q._t = setTimeout(() => { reAdminKeep(); const n = $("#cq"); if (n){ n.focus(); n.setSelectionRange(n.value.length, n.value.length); } }, 250); };
  $$("[data-cfilter]").forEach(s => s.onchange = () => { (CM.f[m.key] = CM.f[m.key] || {})[s.dataset.cfilter] = s.value; reAdminKeep(); });
  const mine = $("[data-cmine]"); if (mine) mine.onchange = () => { (CM.f[m.key] = CM.f[m.key] || {})._mine = mine.checked; reAdminKeep(); };
  $$("[data-cview]").forEach(b => b.onclick = () => { CM.view[m.key] = b.dataset.cview; reAdminKeep(); });
  $$("[data-cmonth]").forEach(b => b.onclick = () => { CM.month[m.key] = b.dataset.cmonth; reAdminKeep(); });
  const ex = $("[data-cexport]"); if (ex) ex.onclick = () => { const rows = filtered(m).map(r => r.data); const cols = (m.exportCols || m.fields.filter(f => f.k && !["list","image","people"].includes(f.type)).map(f => [f.type === "person" ? (d => personName(d[f.k])) : f.k, f.label])); downloadFile(`${m.key}-${today()}.csv`, toCSV(rows, cols)); };
  const imp = $("#cimp"); if (imp) imp.onchange = async () => { const file = imp.files[0]; if (!file) return; const rows = parseCSV(await file.text()); if (rows.length < 2){ toast("That file has no rows.", true); return; }
    const head = rows[0].map(h => h.trim().toLowerCase()); const map = {}; m.fields.forEach(f => { if (!f.k) return; const i = head.findIndex(h => h === f.label.toLowerCase() || h === f.k.toLowerCase() || (f.aliases || []).includes(h)); if (i >= 0) map[f.k] = i; });
    if (!Object.keys(map).length){ toast("No matching columns. Use the same headings as Export CSV.", true); return; }
    const data = rows.slice(1).map(r => { const o = Object.assign({}, m.defaults ? m.defaults() : {}); for (const [k,i] of Object.entries(map)) o[k] = (r[i] || "").trim(); return m.importFix ? m.importFix(o) : o; });
    try { const res = await api("POST", "/api/records", {op: "import", c: m.c, rows: data}); toast(`Imported ${res.count} rows`); await load(m.c, true); reAdminKeep(); } catch(e){ toast(errMsg(e), true); } };
  const sv = $("#csave"); if (sv) sv.onclick = async () => {
    const d = CM.draft; const missing = m.fields.filter(f => f.req && !String(getPath(d, f.k) ?? "").trim());
    if (missing.length){ toast(`Add ${missing.map(f => f.label.toLowerCase()).join(", ")} first.`, true); return; }
    if (m.validate){ const msg = m.validate(d, CM.edit); if (msg){ toast(msg, true); return; } }
    const isNew = CM.edit === "new"; const id = isNew ? rid() : CM.edit; sv.disabled = true;
    try { if (m.beforeSave) m.beforeSave(d, isNew); await saveRec(m.c, id, d, isNew); toast("Saved"); CM.edit = id; CM.dirty = false; if (m.afterSave) await m.afterSave(d, id, isNew); reAdminKeep(); } catch(e){ toast(errMsg(e), true); sv.disabled = false; }
  };
  const dl = $("#cdel"); if (dl) dl.onclick = () => armDelete(dl, async () => { try { await delRec(m.c, CM.edit); toast("Deleted"); CM.edit = null; CM.draft = null; reAdminTop(); } catch(e){ toast(errMsg(e), true); dl.disabled = false; } });
  if (m.wire) m.wire(CM.draft);
}
function findField(m, path){ const top = path.split(".")[0]; return m.fields.find(f => f.k === top); }

/* ============================== Option lists ============================== */
const STATUSES = ["Member","Regular attender","Visitor","Youth","Child","Inactive"];
const STAGES = ["New","Contacted","Visited again","In a group","Became a member","Not now"];
const CARE_TYPES = ["Prayer","Hospital visit","Bereavement","Counselling","Welfare / practical help","Marriage & family","New believer","Other"];
const CARE_STATUS = ["Open","In progress","Waiting","Closed"];
const METHODS = ["Bank transfer","Card","Online","Cash","Cheque","Standing order","Text giving"];
const FREQ = ["Weekly","Monthly","Quarterly","Annually"];
const EXP_CATS = ["Rent & hall hire","Utilities","Ministry & programmes","Missions & outreach","Welfare","Media & technology","Hospitality","Children & youth","Office & admin","Travel","Maintenance & repairs","Staff & honoraria","Insurance","Other"];
const EXP_STATUS = ["Submitted","Approved","Paid","Rejected"];
const OOS_TYPES = ["Welcome","Praise & worship","Prayer","Bible reading","Testimony","Announcements","Offering","Special number","Sermon","Altar call","Communion","Benediction","Other"];
const PLATFORMS = ["Facebook","Instagram","YouTube","TikTok","X","WhatsApp","Email newsletter"];
const SOCIAL_STATUS = ["Idea","Drafting","Ready","Scheduled","Posted"];
const TASK_STATUS = ["To do","In progress","Done"];
const DBS = ["Not needed","Required","Applied","Clear","Expired"];
const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const serviceNames = () => [...new Set(campuses().flatMap(c => (c.times || []).map(t => t.label)).filter(Boolean).concat(["Sunday Worship Service","Bible Study","Revival & Prayer Service","Special programme"]))];
const fundOpts = () => (R.funds || []).map(f => [f.id, f.data.name || "Fund"]);
const fundName = id => ((R.funds || []).find(f => f.id === id) || {data:{}}).data.name || "—";
const teamOpts = () => (R.teams || []).map(t => [t.id, t.data.name || "Team"]);
const roomOpts = () => (R.rooms || []).map(t => [t.id, t.data.name || "Room"]);
const chip = (t, cls = "") => `<span class="chip ${cls}">${esc(t)}</span>`;
const stageCls = s => ({"Became a member":"ok","Not now":"","New":"blue","Closed":"","Open":"blue","Urgent":"red","High":"warn","Paid":"ok","Approved":"blue","Rejected":"red","Submitted":"warn","Done":"ok","Posted":"ok","Scheduled":"blue","Confirmed":"ok","Requested":"warn","Cancelled":"red","Clear":"ok","Expired":"red","Required":"warn","Applied":"blue"}[s] || "");
const overdue = d => d && d < today();

function giftsInRange(from, to, pred){ return (R.gifts || []).filter(g => (g.data.date || "") >= from && (g.data.date || "") <= to && (!pred || pred(g.data))); }
const sum = (arr, f) => arr.reduce((n, x) => n + (+f(x) || 0), 0);
function dbsIssue(d){ if (!d) return ""; if (d.dbsStatus === "Expired" || (d.dbsExpiry && d.dbsExpiry < today())) return "DBS expired"; if (d.dbsExpiry && d.dbsExpiry < addDays(today(), 60)) return "DBS expires " + fmtDate(d.dbsExpiry); if (["Required","Applied"].includes(d.dbsStatus)) return "DBS " + d.dbsStatus.toLowerCase(); return ""; }
function dirRec(id){ return (R.members || DIR || []).find(x => x.id === id); }

/* ============================== People ============================== */
MOD.members = { key:"members", c:"members", title:"Members", newLabel:"Add person", sub:"Everyone connected to the church: members, regular attenders, children and youth.",
  needs:["members","groups","attendance","care"], importable:true, search:["firstName","lastName","email","phone","household","tags","postcode"], filters:["status","campus"],
  name: pname, editSub: d => [d.status, d.campus].filter(Boolean).join(" · "),
  defaults: () => ({status:"Regular attender", campus: campusNames()[0] || "", consentEmail:false, consentSms:false, consentPhoto:false}),
  fields:[
    {section:"Personal details"},
    {k:"firstName",label:"First name",req:true,aliases:["first name","forename"]},{k:"lastName",label:"Last name",req:true,aliases:["surname","last name"]},
    {k:"email",label:"Email",type:"email"},{k:"phone",label:"Phone",type:"tel",aliases:["mobile","telephone"]},
    {k:"dob",label:"Date of birth",type:"date"},{k:"gender",label:"Gender",type:"select",opts:["Female","Male"]},
    {k:"status",label:"Status",type:"select",opts:STATUSES},{k:"campus",label:"Campus",type:"select",opts:campusNames},
    {k:"household",label:"Household / family name",hint:"People with the same household name are grouped as a family."},{k:"address",label:"Address"},{k:"postcode",label:"Postcode"},
    {k:"joined",label:"Date joined",type:"date"},{k:"baptised",label:"Water baptism date",type:"date"},{k:"tags",label:"Tags",hint:"Comma separated, e.g. choir, student, new convert",full:true},
    {section:"Consent (UK GDPR)"},
    {k:"consentEmail",label:"Happy to receive emails",type:"check"},{k:"consentSms",label:"Happy to receive texts / WhatsApp",type:"check"},{k:"consentPhoto",label:"Photos may be used publicly",type:"check"},
    {section:"Safeguarding & serving"},
    {k:"dbsStatus",label:"DBS check",type:"select",opts:DBS},{k:"dbsNumber",label:"DBS certificate number"},{k:"dbsExpiry",label:"DBS renewal due",type:"date"},{k:"skills",label:"Skills & gifts",ph:"e.g. sound, teaching, catering"},
    {section:"Other"},
    {k:"emergency",label:"Emergency contact"},{k:"notes",label:"Notes",type:"textarea"}
  ],
  columns:[{label:"Name",html:d => `<b>${esc(pname(d))}</b>${d.household ? `<div class="hint">${esc(d.household)} household</div>` : ""}`},{label:"Status",html:d => d.status ? chip(d.status, d.status === "Member" ? "ok" : "") : ""},{label:"Campus",k:"campus"},{label:"Phone",k:"phone"},{label:"Email",k:"email"},{label:"",html:d => { const i = dbsIssue(d); return i ? `<span class="warnline">${esc(i)}</span>` : ""; }}],
  editActions: d => `<button class="abtn" type="button" id="mCare">Add care case</button><button class="abtn" type="button" id="mTask">Add task</button>`,
  after: (d, isNew) => {
    if (isNew) return "";
    const id = CM.edit; const groups = (R.groups || []).filter(g => (g.data.members || []).includes(id) || g.data.leader === id);
    const att = (R.attendance || []).filter(a => (a.data.present || []).includes(id)); const last90 = att.filter(a => (a.data.date || "") >= addDays(today(), -90)).length;
    const care = (R.care || []).filter(c => c.data.person === id); const family = d.household ? (R.members || []).filter(x => x.id !== id && x.data.household === d.household) : [];
    return `<div class="grid2" style="margin-bottom:16px">
      <div class="panel"><h2>Involvement</h2><p class="sub">Groups, attendance and care.</p>
        <p style="margin:0 0 8px"><b>Groups:</b> ${groups.length ? groups.map(g => esc(g.data.name)).join(", ") : '<span class="hint">None yet</span>'}</p>
        <p style="margin:0 0 8px"><b>Checked in:</b> ${last90} time${last90 === 1 ? "" : "s"} in the last 90 days${att[0] ? "" : ""}</p>
        <p style="margin:0 0 8px"><b>Care cases:</b> ${care.length ? care.map(c => `${esc(c.data.type || "Care")} (${esc(c.data.status || "Open")})`).join(", ") : '<span class="hint">None</span>'}</p>
        ${family.length ? `<p style="margin:0"><b>Family:</b> ${family.map(f => esc(pname(f.data))).join(", ")}</p>` : ""}
        ${ageOn(d.dob) !== null ? `<p class="hint" style="margin:8px 0 0">Age ${ageOn(d.dob)}</p>` : ""}</div>
      <div class="panel"><h2>Data protection</h2><p class="sub">UK GDPR requests for this person.</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="abtn" type="button" id="mExport">Download their data</button><button class="abtn danger" type="button" id="mErase">Erase this person</button></div>
        <p class="hint" style="margin:10px 0 0">Erasing removes them from the people list, groups and teams. Giving records stay for HMRC but no longer link to them.</p></div></div>`;
  },
  wire: d => {
    const id = CM.edit;
    const c = $("#mCare"); if (c) c.onclick = () => { A.tab = "care"; CM.edit = null; openRec(MOD.care, "new", {person: id, status:"Open", opened: today()}); };
    const t = $("#mTask"); if (t) t.onclick = () => { A.tab = "tasks"; CM.edit = null; openRec(MOD.tasks, "new", {title: "Follow up with " + pname(d), related: pname(d)}); };
    const ex = $("#mExport"); if (ex) ex.onclick = () => { const out = {person: d, groups: (R.groups || []).filter(g => (g.data.members || []).includes(id)).map(g => g.data.name), attendance: (R.attendance || []).filter(a => (a.data.present || []).includes(id)).map(a => ({date: a.data.date, service: a.data.service})), careCases: (R.care || []).filter(x => x.data.person === id).map(x => x.data), exportedAt: new Date().toISOString(), exportedBy: S.me.email};
      downloadFile(`${pname(d).replace(/\W+/g,"-")}-data.json`, JSON.stringify(out, null, 2), "application/json"); };
    const er = $("#mErase"); if (er) er.onclick = () => armDelete(er, async () => { try {
      for (const g of (R.groups || []).filter(g => (g.data.members || []).includes(id) || g.data.leader === id)) await saveRec("groups", g.id, Object.assign({}, g.data, {members: (g.data.members || []).filter(x => x !== id), leader: g.data.leader === id ? "" : g.data.leader}));
      if (canRead("teams")){ await load("teams"); for (const t of (R.teams || []).filter(t => (t.data.members || []).includes(id))) await saveRec("teams", t.id, Object.assign({}, t.data, {members: t.data.members.filter(x => x !== id)})); }
      await delRec("members", id); toast("Person erased"); CM.edit = null; CM.draft = null; reAdminTop(); } catch(e){ toast(errMsg(e), true); } });
  }
};
MOD.visitors = { key:"visitors", c:"visitors", title:"Visitors & follow-up", newLabel:"Add visitor", sub:"Every “Plan your visit” form lands here automatically. Move people along as you follow up.",
  needs:["visitors"], views:["board","list"], boardBy:"stage", mineFilter:true, search:["firstName","lastName","email","phone"], filters:["campus","assignee"],
  name: pname, cardLine: d => [d.firstVisit ? "Visit " + fmtDate(d.firstVisit) : "", d.nextAction ? (overdue(d.nextAction) ? "⚠ follow up due " : "Next: ") + fmtDate(d.nextAction) : ""].filter(Boolean).map(esc).join("<br>"),
  defaults: () => ({stage:"New", firstVisit: today(), source:"Walk-in", campus: campusNames()[0] || ""}),
  fields:[{k:"firstName",label:"First name",req:true},{k:"lastName",label:"Last name"},{k:"email",label:"Email",type:"email"},{k:"phone",label:"Phone",type:"tel"},
    {k:"firstVisit",label:"First visit",type:"date"},{k:"campus",label:"Campus",type:"select",opts:campusNames},{k:"guests",label:"Came with",ph:"e.g. spouse and 2 children"},
    {k:"source",label:"How they found us",type:"select",opts:["Website visit plan","Walk-in","Invited by a member","Online service","Event","Social media","Other"]},
    {k:"stage",label:"Stage",type:"select",opts:STAGES},{k:"assignee",label:"Followed up by",type:"user"},{k:"nextAction",label:"Next follow-up",type:"date"},{k:"notes",label:"Notes",type:"textarea"}],
  columns:[{label:"Name",html:d => `<b>${esc(pname(d))}</b>`},{label:"Stage",html:d => chip(d.stage || "New", stageCls(d.stage || "New"))},{label:"First visit",v:d => fmtDate(d.firstVisit)},{label:"Next follow-up",html:d => d.nextAction ? `<span class="${overdue(d.nextAction) ? "warnline" : ""}">${esc(fmtDate(d.nextAction))}</span>` : ""},{label:"Followed up by",v:d => ((USERS || []).find(u => u.email === d.assignee) || {}).name || ""}],
  editActions: () => canRead("members") ? `<button class="abtn pri" type="button" id="vConvert">Make them a member</button>` : "",
  wire: d => { const b = $("#vConvert"); if (b) b.onclick = async () => { b.disabled = true; try { const id = rid(); await saveRec("members", id, {firstName: d.firstName, lastName: d.lastName, email: d.email, phone: d.phone, campus: d.campus, status: "Regular attender", joined: today(), notes: "From visitor follow-up. " + (d.notes || "")}, true);
    d.stage = "Became a member"; await saveRec("visitors", CM.edit, d); toast("Added to people"); reAdminKeep(); } catch(e){ toast(errMsg(e), true); b.disabled = false; } }; }
};
MOD.attendance = { key:"attendance", c:"attendance", title:"Attendance", newLabel:"Record a service", sub:"Headcounts for every service, plus optional check-in of named people.",
  needs:["attendance", canRead("members") ? "members" : "directory"], search:["service","notes"], filters:["campus","service"],
  name: d => `${d.service || "Service"} · ${fmtDate(d.date)}`,
  defaults: () => ({date: today(), service: serviceNames()[0], campus: campusNames()[0] || "", present: []}),
  fields:[{k:"date",label:"Date",type:"date",req:true},{k:"service",label:"Service",type:"select",opts:serviceNames},{k:"campus",label:"Campus",type:"select",opts:campusNames},
    {k:"adults",label:"Adults",type:"number"},{k:"children",label:"Children",type:"number"},{k:"online",label:"Online viewers",type:"number"},{k:"firstTimers",label:"First-time guests",type:"number"},{k:"salvations",label:"Decisions for Christ",type:"number"},{k:"notes",label:"Notes",type:"textarea"}],
  columns:[{label:"Date",v:d => fmtDate(d.date)},{label:"Service",k:"service"},{label:"Campus",k:"campus"},{label:"In person",num:true,v:d => (+d.adults||0)+(+d.children||0)},{label:"Online",num:true,v:d => d.online || ""},{label:"First-timers",num:true,v:d => d.firstTimers || ""},{label:"Checked in",num:true,v:d => (d.present || []).length || ""}],
  top: rows => { const pts = rows.slice().sort((a,b) => (a.data.date||"").localeCompare(b.data.date||"")).slice(-16).map(r => ({l: `${fmtDate(r.data.date)} ${r.data.service || ""}`, s: (r.data.date||"").slice(5).split("-").reverse().join("/"), v: (+r.data.adults||0)+(+r.data.children||0)}));
    return pts.length ? `<div class="panel"><h2>In-person attendance</h2><p class="sub">Last ${pts.length} services recorded.</p>${bars(pts)}</div>` : ""; },
  after: (d) => { const ppl = peopleList(); const cur = new Set(d.present || []); const q = (CM.extra.attq || "").toLowerCase();
    return `<div class="panel"><h2>Check-in (optional)</h2><p class="sub">${cur.size} people checked in. Tick names as people arrive.</p>
      <input class="inp" type="search" id="attq" placeholder="Find a name…" value="${esc(CM.extra.attq || "")}" style="margin-bottom:10px" aria-label="Find a name">
      <div class="ckl">${ppl.filter(p => !q || p.name.toLowerCase().includes(q)).map(p => `<label><input type="checkbox" data-present="${esc(p.id)}" ${cur.has(p.id) ? "checked" : ""}>${esc(p.name)}</label>`).join("") || '<span class="hint">No people yet. Add them under Members.</span>'}</div></div>`; },
  wire: () => { $$("[data-present]").forEach(cb => cb.onchange = () => { const cur = new Set(CM.draft.present || []); cb.checked ? cur.add(cb.dataset.present) : cur.delete(cb.dataset.present); CM.draft.present = [...cur]; CM.dirty = true; const sb = $("#savebar span"); if (sb) sb.textContent = `You have unsaved changes · ${cur.size} checked in.`; });
    const q = $("#attq"); if (q) q.oninput = () => { CM.extra.attq = q.value; clearTimeout(q._t); q._t = setTimeout(() => { reAdminKeep(); const n = $("#attq"); if (n){ n.focus(); n.setSelectionRange(n.value.length, n.value.length); } }, 200); }; }
};
MOD.groups = { key:"groups", c:"groups", title:"Small groups", newLabel:"New group", sub:"House fellowships, Bible study groups and other small groups.",
  needs:["groups","members"], search:["name","location","type"], filters:["type","campus"], name: d => d.name || "Group",
  defaults: () => ({type:"House fellowship", campus: campusNames()[0] || "", members: []}),
  fields:[{k:"name",label:"Group name",req:true},{k:"type",label:"Type",type:"select",opts:["House fellowship","Bible study","Prayer group","Youth","Young adults","Women","Men","Students","Other"]},
    {k:"leader",label:"Leader",type:"person"},{k:"coLeader",label:"Assistant leader",type:"person"},{k:"day",label:"Meets on",type:"select",opts:DAYS},{k:"time",label:"Time",type:"time"},
    {k:"location",label:"Location",hint:"Keep home addresses off the public website."},{k:"campus",label:"Campus",type:"select",opts:campusNames},{k:"capacity",label:"Capacity",type:"number"},
    {k:"members",label:"Members",type:"people"},{k:"whatsapp",label:"WhatsApp group link",ph:"https://chat.whatsapp.com/…"},{k:"notes",label:"Notes",type:"textarea"}],
  columns:[{label:"Group",html:d => `<b>${esc(d.name)}</b>`},{label:"Type",k:"type"},{label:"Leader",v:d => personName(d.leader)},{label:"When",v:d => [d.day, d.time].filter(Boolean).join(" ")},{label:"Members",num:true,html:d => { const n = (d.members || []).length; return d.capacity && n >= +d.capacity ? `<span class="warnline">${n}/${d.capacity} full</span>` : String(n); }}],
  editActions: () => `<button class="abtn" type="button" id="gCopy">Copy contact list</button>`,
  wire: d => { const b = $("#gCopy"); if (b) b.onclick = () => copyText([d.name].concat((d.members || []).map(id => { const p = dirRec(id); return p ? `${pname(p.data)} ${p.data.phone || ""} ${p.data.email || ""}`.trim() : ""; })).filter(Boolean).join("\n"), "Contact list copied"); }
};
MOD.care = { key:"care", c:"care", title:"Pastoral care", newLabel:"New care case", sub:"Confidential. Only administrators and the pastoral team can see this.",
  needs:["care","members"], views:["board","list"], boardBy:"status", mineFilter:true, search:[d => personName(d.person), "summary","type"], filters:["type","priority","assignee"],
  name: d => `${personName(d.person) || d.name || "Care case"}${d.type ? " · " + d.type : ""}`, cardLine: d => esc([d.priority && d.priority !== "Normal" ? d.priority : "", d.nextFollowUp ? (overdue(d.nextFollowUp) ? "Overdue " : "Next ") + fmtDate(d.nextFollowUp) : ""].filter(Boolean).join(" · ")),
  defaults: () => ({status:"Open", priority:"Normal", opened: today(), assignee: S.me.email, log: []}),
  fields:[{k:"person",label:"Person",type:"person"},{k:"name",label:"Or name (if not in people list)"},{k:"type",label:"Type",type:"select",opts:CARE_TYPES},{k:"status",label:"Status",type:"select",opts:CARE_STATUS},
    {k:"priority",label:"Priority",type:"select",opts:["Normal","High","Urgent"]},{k:"assignee",label:"Pastor / carer",type:"user"},{k:"opened",label:"Opened",type:"date"},{k:"nextFollowUp",label:"Next follow-up",type:"date"},
    {k:"summary",label:"Summary",type:"textarea",rows:3},
    {k:"log",label:"Care log",type:"list",addLabel:"Add entry",newRow: () => ({date: today(), by: S.me.name}),sub:[{k:"date",label:"Date",type:"date",w:"150px"},{k:"note",label:"What happened",type:"textarea"},{k:"by",label:"By",w:"140px"}]}],
  columns:[{label:"Person",html:d => `<b>${esc(personName(d.person) || d.name || "—")}</b>`},{label:"Type",k:"type"},{label:"Status",html:d => chip(d.status || "Open", stageCls(d.status))},{label:"Priority",html:d => d.priority && d.priority !== "Normal" ? chip(d.priority, stageCls(d.priority)) : ""},{label:"Next follow-up",html:d => d.nextFollowUp ? `<span class="${overdue(d.nextFollowUp) && d.status !== "Closed" ? "warnline" : ""}">${esc(fmtDate(d.nextFollowUp))}</span>` : ""}],
  validate: d => !d.person && !d.name ? "Choose a person or type a name." : ""
};
MOD.kids = { key:"kids", c:"checkins", title:"Kids check-in", sub:"Check children in with a pickup code. Hand the code to the parent and match it at pickup.", needs:["checkins", canRead("members") ? "members" : "directory"], custom:true,
  render(){ const date = CM.extra.kidDate || today(); const q = (CM.extra.kidq || "").toLowerCase();
    const kids = peopleList().filter(p => (p.d.status === "Child" || (ageOn(p.d.dob) !== null && ageOn(p.d.dob) < 13)) && (!q || p.name.toLowerCase().includes(q)));
    const todays = (R.checkins || []).filter(c => c.data.date === date); const inNow = todays.filter(c => !c.data.outAt);
    return head("Kids check-in", this.sub) + `<div class="cm-bar"><input class="inp" type="date" id="kidDate" value="${date}" aria-label="Date"><input class="inp grow" type="search" id="kidq" placeholder="Find a child…" value="${esc(CM.extra.kidq || "")}" aria-label="Find a child"><span class="hint" style="margin-left:auto">${inNow.length} in · ${todays.length - inNow.length} collected</span></div>
    <div class="grid2"><div class="panel"><h2>Children</h2><p class="sub">People marked as Child, or under 13 with a date of birth.</p>
      <div style="display:grid;gap:6px">${kids.map(k => { const c = todays.find(x => x.data.child === k.id && !x.data.outAt); return `<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;border:1px solid var(--line);border-radius:10px;padding:8px 10px"><span><b>${esc(k.name)}</b>${k.d.notes ? `<span class="hint"> · ${esc(k.d.notes.slice(0,40))}</span>` : ""}</span>${c ? `<span class="chip ok">In · ${esc(c.data.code)}</span>` : `<button class="abtn pri" type="button" data-kin="${esc(k.id)}">Check in</button>`}</div>`; }).join("") || '<p class="hint">No children found. Add children under Members with status “Child”.</p>'}</div></div>
    <div class="panel"><h2>Checked in today</h2><p class="sub">Match the parent's code before releasing a child.</p>
      <input class="inp" id="kidCode" placeholder="Type a pickup code…" style="margin-bottom:10px;text-transform:uppercase" aria-label="Pickup code">
      <div style="display:grid;gap:6px">${todays.map(c => `<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;border:1px solid var(--line);border-radius:10px;padding:8px 10px" data-code="${esc(c.data.code)}"><span><b>${esc(personName(c.data.child))}</b><div class="hint">In ${esc(c.data.inAt || "")}${c.data.guardian ? " · " + esc(c.data.guardian) : ""}${c.data.outAt ? " · collected " + esc(c.data.outAt) : ""}</div></span><span style="display:flex;gap:6px;align-items:center"><code style="font-weight:900;font-size:16px;letter-spacing:.1em">${esc(c.data.code)}</code>${c.data.outAt ? "" : `<button class="abtn" type="button" data-kout="${esc(c.id)}">Collected</button>`}</span></div>`).join("") || '<p class="hint">Nobody checked in yet.</p>'}</div></div></div>`; },
  wire(){ const d = $("#kidDate"); if (d) d.onchange = () => { CM.extra.kidDate = d.value; reAdminKeep(); };
    const q = $("#kidq"); if (q) q.oninput = () => { CM.extra.kidq = q.value; clearTimeout(q._t); q._t = setTimeout(() => { reAdminKeep(); const n = $("#kidq"); if (n){ n.focus(); n.setSelectionRange(n.value.length, n.value.length); } }, 200); };
    const kc = $("#kidCode"); if (kc) kc.oninput = () => { const v = kc.value.trim().toUpperCase(); $$("[data-code]").forEach(el => el.style.outline = v && el.dataset.code === v ? "3px solid var(--ok)" : ""); };
    $$("[data-kin]").forEach(b => b.onclick = () => { const guardian = ""; const code = Array.from(crypto.getRandomValues(new Uint8Array(4))).map(x => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[x % 32]).join("");
      const t = new Date().toLocaleTimeString("en-GB", {hour:"2-digit", minute:"2-digit"});
      saveRec("checkins", rid(), {date: CM.extra.kidDate || today(), child: b.dataset.kin, code, inAt: t, guardian, by: S.me.name}, true).then(() => { toast("Checked in · code " + code); reAdminKeep(); }).catch(e => toast(errMsg(e), true)); });
    $$("[data-kout]").forEach(b => b.onclick = () => { const r = (R.checkins || []).find(x => x.id === b.dataset.kout); if (!r) return; saveRec("checkins", r.id, Object.assign({}, r.data, {outAt: new Date().toLocaleTimeString("en-GB", {hour:"2-digit", minute:"2-digit"})})).then(() => { toast("Marked as collected"); reAdminKeep(); }).catch(e => toast(errMsg(e), true)); }); }
};

/* ============================== Giving ============================== */
MOD.funds = { key:"funds", c:"funds", title:"Funds", newLabel:"New fund", sub:"Where gifts go. Public funds appear on the website's Give page.", needs:["funds","gifts"], search:["name"], name: d => d.name || "Fund",
  defaults: () => ({active:true, public:true, giftAid:true}),
  fields:[{k:"name",label:"Fund name",req:true,ph:"e.g. Tithes & offerings"},{k:"description",label:"Description",type:"textarea",rows:2},{k:"target",label:"Target (optional)",type:"money"},
    {k:"paymentLink",label:"Online giving link",ph:"https://donate.stripe.com/…",hint:"A Stripe, SumUp, PayPal or bank payment link. Shown as the Give button."},{k:"bankDetails",label:"Bank transfer details",type:"textarea",rows:3,ph:"Account name, sort code, account number, reference"},
    {k:"active",label:"Active",type:"check"},{k:"public",label:"Show on the Give page",type:"check"},{k:"showProgress",label:"Show progress towards target",type:"check"},{k:"giftAid",label:"Eligible for Gift Aid",type:"check"}],
  columns:[{label:"Fund",html:d => `<b>${esc(d.name)}</b>`},{label:"On website",html:d => d.public && d.active !== false ? chip("Shown","ok") : chip("Hidden")},{label:"This tax year",num:true,html:(d,r) => { const ty = taxYear(today()); return money(sum((R.gifts || []).filter(g => g.data.fund === r.id && taxYear(g.data.date) === ty), g => g.data.amount)); }},{label:"Target",num:true,v:d => d.target ? money(d.target) : ""}]
};
MOD.gifts = { key:"gifts", c:"gifts", title:"Gifts & tithes", newLabel:"Record a gift", sub:"Every gift received. Import a bank statement CSV to add many at once.", needs:["gifts","funds","declarations","members"], importable:true,
  search:[d => personName(d.person), "donorName","reference"], filters:["fund","method"], name: d => `${money(d.amount)} · ${personName(d.person) || d.donorName || "Anonymous"}`,
  defaults: () => ({date: today(), method:"Bank transfer", fund: (R.funds || [])[0]?.id || "", campus: campusNames()[0] || ""}),
  importFix: o => { o.amount = String(o.amount || "").replace(/[£,\s]/g, ""); if (/^\d{2}\/\d{2}\/\d{4}$/.test(o.date)) { const [d,m,y] = o.date.split("/"); o.date = `${y}-${m}-${d}`; } if (o.fund && !(R.funds || []).some(f => f.id === o.fund)) { const f = (R.funds || []).find(f => (f.data.name || "").toLowerCase() === o.fund.toLowerCase()); o.fund = f ? f.id : ((R.funds || [])[0]?.id || ""); } return o; },
  fields:[{k:"date",label:"Date",type:"date",req:true},{k:"amount",label:"Amount (£)",type:"money",req:true},{k:"fund",label:"Fund",type:"select",opts:fundOpts,req:true},{k:"method",label:"Method",type:"select",opts:METHODS},
    {k:"person",label:"Donor",type:"person",hint:"Pick from people, or type a name below."},{k:"donorName",label:"Donor name (if not in people)",aliases:["name","payer","description"]},{k:"reference",label:"Reference",aliases:["ref"]},{k:"campus",label:"Campus",type:"select",opts:campusNames},{k:"notes",label:"Notes",type:"textarea",rows:2}],
  columns:[{label:"Date",v:d => fmtDate(d.date)},{label:"Donor",v:d => personName(d.person) || d.donorName || "Anonymous"},{label:"Fund",v:d => fundName(d.fund)},{label:"Method",k:"method"},{label:"Amount",num:true,v:d => money(d.amount)}],
  exportCols:[["date","Date"],[d => personName(d.person) || d.donorName || "","Donor"],[d => fundName(d.fund),"Fund"],["method","Method"],["reference","Reference"],["amount","Amount"],["campus","Campus"]],
  top: rows => { const m = today().slice(0,7); const lm = addDays(m + "-01", -1).slice(0,7); const ty = taxYear(today());
    const tm = sum((R.gifts || []).filter(g => (g.data.date || "").startsWith(m)), g => g.data.amount), tl = sum((R.gifts || []).filter(g => (g.data.date || "").startsWith(lm)), g => g.data.amount), tt = sum((R.gifts || []).filter(g => taxYear(g.data.date) === ty), g => g.data.amount);
    return `<div class="kpis"><div class="kpi"><span>This month</span><b>${money(tm)}</b><small>${tl ? `<span class="${tm >= tl ? "up" : "down"}">${tm >= tl ? "▲" : "▼"} ${Math.abs(Math.round((tm - tl) / tl * 100))}%</span> vs last month` : "&nbsp;"}</small></div><div class="kpi"><span>Last month</span><b>${money(tl)}</b></div><div class="kpi"><span>Tax year ${ty}</span><b>${money(tt)}</b></div><div class="kpi"><span>Showing</span><b>${money(sum(rows, r => r.data.amount))}</b><small>${rows.length} gifts</small></div></div>`; }
};
const nextDate = (iso, f) => { const d = parseD(iso); if (!d) return iso; if (f === "Weekly") d.setDate(d.getDate() + 7); else if (f === "Quarterly") d.setMonth(d.getMonth() + 3); else if (f === "Annually") d.setFullYear(d.getFullYear() + 1); else d.setMonth(d.getMonth() + 1); return new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString().slice(0,10); };
MOD.recurring = { key:"recurring", c:"recurring", title:"Recurring giving", newLabel:"Add standing order", sub:"Standing orders and regular gifts. Record the ones that are due in one click.", needs:["recurring","funds","members","gifts"], filters:["status","frequency"],
  search:[d => personName(d.person), "donorName"], name: d => `${personName(d.person) || d.donorName || "Donor"} · ${money(d.amount)} ${(d.frequency || "").toLowerCase()}`,
  defaults: () => ({frequency:"Monthly", status:"Active", method:"Standing order", startDate: today(), nextDue: today(), fund: (R.funds || [])[0]?.id || ""}),
  fields:[{k:"person",label:"Donor",type:"person"},{k:"donorName",label:"Donor name (if not in people)"},{k:"fund",label:"Fund",type:"select",opts:fundOpts,req:true},{k:"amount",label:"Amount (£)",type:"money",req:true},
    {k:"frequency",label:"Frequency",type:"select",opts:FREQ},{k:"method",label:"Method",type:"select",opts:METHODS},{k:"startDate",label:"Start date",type:"date"},{k:"nextDue",label:"Next due",type:"date"},{k:"status",label:"Status",type:"select",opts:["Active","Paused","Ended"]},{k:"notes",label:"Notes",type:"textarea",rows:2}],
  columns:[{label:"Donor",v:d => personName(d.person) || d.donorName || "—"},{label:"Fund",v:d => fundName(d.fund)},{label:"Frequency",k:"frequency"},{label:"Next due",html:d => d.status === "Active" && overdue(d.nextDue) ? `<span class="warnline">${esc(fmtDate(d.nextDue))}</span>` : esc(fmtDate(d.nextDue))},{label:"Status",html:d => chip(d.status || "Active", d.status === "Active" ? "ok" : "")},{label:"Amount",num:true,v:d => money(d.amount)}],
  listActions: () => { const due = (R.recurring || []).filter(r => r.data.status === "Active" && r.data.nextDue && r.data.nextDue <= today()); return `<button class="abtn ${due.length ? "pri" : ""}" type="button" id="recDue" ${due.length ? "" : "disabled"}>Record ${due.length} due gift${due.length === 1 ? "" : "s"}</button>`; },
  wire: () => { const b = $("#recDue"); if (b) b.onclick = async () => { b.disabled = true; let n = 0; try { for (const r of (R.recurring || []).filter(r => r.data.status === "Active" && r.data.nextDue && r.data.nextDue <= today())) { let d = Object.assign({}, r.data);
      while (d.nextDue <= today()) { await saveRec("gifts", rid(), {date: d.nextDue, amount: d.amount, fund: d.fund, method: d.method || "Standing order", person: d.person || "", donorName: d.donorName || "", reference: "Recurring", campus: ""}, true); n++; d.nextDue = nextDate(d.nextDue, d.frequency); }
      await saveRec("recurring", r.id, d); } toast(`${n} gift${n === 1 ? "" : "s"} recorded`); } catch(e){ toast(errMsg(e), true); } reAdminKeep(); }; }
};
MOD.pledges = { key:"pledges", c:"pledges", title:"Pledge campaigns", newLabel:"New campaign", sub:"Building funds, mission appeals and other campaigns with pledges.", needs:["pledges","funds","gifts","members"], search:["name"], name: d => d.name || "Campaign",
  defaults: () => ({startDate: today(), pledges: []}),
  fields:[{k:"name",label:"Campaign name",req:true,ph:"e.g. New church building"},{k:"fund",label:"Fund gifts go to",type:"select",opts:fundOpts,req:true},{k:"goal",label:"Goal (£)",type:"money"},{k:"startDate",label:"Starts",type:"date"},{k:"endDate",label:"Ends",type:"date"},{k:"description",label:"Description",type:"textarea",rows:2},
    {k:"pledges",label:"Pledges",type:"list",addLabel:"Add pledge",sub:[{k:"person",label:"Person",type:"person"},{k:"name",label:"Or name"},{k:"amount",label:"Pledged (£)",type:"money",w:"130px"}]}],
  columns:[{label:"Campaign",html:d => `<b>${esc(d.name)}</b>`},{label:"Pledged",num:true,v:d => money(sum(d.pledges || [], p => p.amount))},{label:"Received",num:true,v:d => money(campaignIn(d))},{label:"Goal",num:true,v:d => d.goal ? money(d.goal) : ""},{label:"Progress",html:d => d.goal ? `<div class="prog" style="min-width:90px"><i style="width:${Math.min(100, campaignIn(d) / d.goal * 100)}%"></i></div>` : ""}],
  after: (d, isNew) => { if (isNew) return ""; const got = campaignIn(d), pl = sum(d.pledges || [], p => p.amount);
    return `<div class="panel"><h2>Progress</h2><p class="sub">${money(got)} received of ${money(pl)} pledged${d.goal ? ` · goal ${money(d.goal)}` : ""}.</p>${d.goal ? `<div class="prog" style="margin-bottom:14px"><i style="width:${Math.min(100, got / d.goal * 100)}%"></i></div>` : ""}
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Person</th><th class="num">Pledged</th><th class="num">Given</th><th>Status</th></tr></thead><tbody>${(d.pledges || []).map(p => { const given = p.person ? sum(campaignGifts(d).filter(g => g.data.person === p.person), g => g.data.amount) : 0;
        return `<tr><td>${esc(personName(p.person) || p.name || "—")}</td><td class="num">${money(p.amount)}</td><td class="num">${p.person ? money(given) : '<span class="hint">n/a</span>'}</td><td>${p.person ? (given >= +p.amount ? chip("Fulfilled","ok") : chip(Math.round(given / (+p.amount || 1) * 100) + "%","blue")) : ""}</td></tr>`; }).join("")}</tbody></table></div></div>`; }
};
const campaignGifts = d => (R.gifts || []).filter(g => g.data.fund === d.fund && (!d.startDate || g.data.date >= d.startDate) && (!d.endDate || g.data.date <= d.endDate));
const campaignIn = d => sum(campaignGifts(d), g => g.data.amount);
MOD.declarations = { key:"declarations", c:"declarations", title:"Gift Aid declarations", newLabel:"Add declaration", sub:"Online declarations from the Give page arrive here. Add paper forms too, and link each one to the donor.",
  needs:["declarations","members"], search:["firstName","lastName","postcode","email"], filters:["source"], importable:true, name: d => [d.title, d.firstName, d.lastName].filter(Boolean).join(" ") || "Declaration",
  defaults: () => ({date: today(), source:"Paper form"}),
  fields:[{k:"title",label:"Title",type:"select",opts:["Mr","Mrs","Miss","Ms","Dr","Rev","Pastor"]},{k:"firstName",label:"First name",req:true},{k:"lastName",label:"Last name",req:true},{k:"houseNumber",label:"House name or number",req:true},{k:"postcode",label:"Postcode",req:true},{k:"email",label:"Email",type:"email"},
    {k:"date",label:"Declaration date",type:"date",req:true},{k:"source",label:"Source",type:"select",opts:["Online form","Paper form","Envelope","Other"]},{k:"person",label:"Linked donor",type:"person",hint:"Gifts from this person become eligible for Gift Aid from the declaration date."},{k:"cancelled",label:"Declaration cancelled",type:"date",hint:"Fill in if the donor withdraws it."},{k:"notes",label:"Notes",type:"textarea",rows:2}],
  columns:[{label:"Name",html:d => `<b>${esc([d.title, d.firstName, d.lastName].filter(Boolean).join(" "))}</b>`},{label:"Postcode",k:"postcode"},{label:"Date",v:d => fmtDate(d.date)},{label:"Linked donor",html:d => d.person ? esc(personName(d.person)) : '<span class="warnline">Not linked</span>'},{label:"Status",html:d => d.cancelled ? chip("Cancelled","red") : chip("Active","ok")}]
};
function giftAidRows(ty){
  const decl = (R.declarations || []).filter(x => x.data.person && !x.data.cancelled);
  const fundsOk = new Set((R.funds || []).filter(f => f.data.giftAid !== false).map(f => f.id));
  return (R.gifts || []).filter(g => taxYear(g.data.date) === ty && g.data.person && fundsOk.has(g.data.fund)).map(g => { const dc = decl.filter(x => x.data.person === g.data.person && x.data.date <= g.data.date).sort((a,b) => b.data.date.localeCompare(a.data.date))[0]; return dc ? {g, dc} : null; }).filter(Boolean);
}
MOD.giftaid = { key:"giftaid", title:"Gift Aid claims", custom:true, needs:["gifts","funds","declarations","members"],
  render(){ const years = [...new Set((R.gifts || []).map(g => taxYear(g.data.date)).filter(Boolean))].sort().reverse(); const ty = CM.extra.ty || years[0] || taxYear(today());
    const rows = giftAidRows(ty); const total = sum(rows, r => r.g.data.amount); const unlinked = (R.declarations || []).filter(x => !x.data.person && !x.data.cancelled).length;
    const byDonor = {}; rows.forEach(r => { const k = r.g.data.person; (byDonor[k] = byDonor[k] || {dc: r.dc, n: 0, t: 0}); byDonor[k].n++; byDonor[k].t += +r.g.data.amount || 0; });
    return head("Gift Aid claims", "UK Gift Aid: HMRC adds 25p for every £1 given by UK taxpayers who've made a declaration.", `<button class="abtn pri" type="button" id="gaCsv" ${rows.length ? "" : "disabled"}>Download HMRC schedule (CSV)</button>`) +
      `<div class="cm-bar"><label class="hint" for="gaTy">Tax year</label><select class="inp" id="gaTy">${(years.length ? years : [ty]).map(y => `<option ${y === ty ? "selected" : ""}>${y}</option>`).join("")}</select></div>
      <div class="kpis"><div class="kpi"><span>Eligible gifts</span><b>${money(total)}</b><small>${rows.length} gifts</small></div><div class="kpi"><span>You can claim</span><b style="color:var(--ok)">${money(total * 0.25)}</b><small>25% of eligible gifts</small></div><div class="kpi"><span>Donors with a declaration</span><b>${Object.keys(byDonor).length}</b></div><div class="kpi"><span>Declarations not linked</span><b style="${unlinked ? "color:var(--warn)" : ""}">${unlinked}</b><small>${unlinked ? '<a href="#" data-goto="declarations">Link them to donors</a>' : "All linked"}</small></div></div>
      <div class="panel"><h2>By donor</h2><p class="sub">Only gifts to Gift Aid eligible funds, from linked declarations dated on or before the gift.</p>${Object.keys(byDonor).length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Donor</th><th>House</th><th>Postcode</th><th class="num">Gifts</th><th class="num">Total</th><th class="num">Claim</th></tr></thead><tbody>${Object.entries(byDonor).map(([pid, x]) => `<tr><td>${esc(personName(pid))}</td><td>${esc(x.dc.data.houseNumber || "")}</td><td>${esc(x.dc.data.postcode || "")}</td><td class="num">${x.n}</td><td class="num">${money(x.t)}</td><td class="num">${money(x.t * .25)}</td></tr>`).join("")}</tbody></table></div>` : '<p class="hint">No eligible gifts in this tax year yet.</p>'}</div>
      <div class="notice warn">Check the schedule before submitting through HMRC Charities Online. You need the church's HMRC charity reference to claim.</div>`; },
  wire(){ const s = $("#gaTy"); if (s) s.onchange = () => { CM.extra.ty = s.value; reAdminKeep(); };
    $$("[data-goto]").forEach(a => a.onclick = e => { e.preventDefault(); A.tab = a.dataset.goto; CM.edit = null; renderAdmin(); });
    const b = $("#gaCsv"); if (b) b.onclick = () => { const ty = CM.extra.ty || $("#gaTy").value; const rows = giftAidRows(ty).map(r => ({title: r.dc.data.title || "", first: r.dc.data.firstName, last: r.dc.data.lastName, house: r.dc.data.houseNumber, pc: r.dc.data.postcode, date: (r.g.data.date || "").split("-").reverse().join("/"), amount: (+r.g.data.amount).toFixed(2)}));
      downloadFile(`gift-aid-${ty}.csv`, toCSV(rows, [["title","Title"],["first","First name or initial"],["last","Last name"],["house","House name or number"],["pc","Postcode"],[() => "","Aggregated donations"],[() => "","Sponsored event"],["date","Donation date"],["amount","Amount"]])); }; }
};

/* ============================== Finance ============================== */
MOD.budgets = { key:"budgets", c:"budgets", title:"Budgets", newLabel:"New budget", sub:"Set a budget per category and track spending against it.", needs:["budgets","expenses"], search:["name"], name: d => d.name || "Budget",
  defaults: () => ({year: String(new Date().getFullYear()), lines: EXP_CATS.slice(0, 6).map(c => ({category: c, amount: ""}))}),
  fields:[{k:"name",label:"Budget name",req:true,ph:"e.g. 2027 general budget"},{k:"year",label:"Year",type:"number",req:true},{k:"campus",label:"Campus (blank = all)",type:"select",opts:campusNames},
    {k:"lines",label:"Budget lines",type:"list",addLabel:"Add category",sub:[{k:"category",label:"Category",type:"select",opts:EXP_CATS},{k:"amount",label:"Budget (£)",type:"money",w:"160px"}]}],
  columns:[{label:"Budget",html:d => `<b>${esc(d.name)}</b>`},{label:"Year",k:"year"},{label:"Budget",num:true,v:d => money(sum(d.lines || [], l => l.amount))},{label:"Spent",num:true,v:d => money(sum(budgetSpend(d), e => e.data.amount))}],
  after: (d, isNew) => { if (isNew) return ""; const spent = budgetSpend(d);
    return `<div class="panel"><h2>Budget vs actual</h2><p class="sub">Approved and paid expenses in ${esc(d.year)}${d.campus ? " · " + esc(d.campus) : ""}.</p><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Category</th><th class="num">Budget</th><th class="num">Spent</th><th class="num">Left</th><th style="width:30%"></th></tr></thead><tbody>
      ${(d.lines || []).map(l => { const s = sum(spent.filter(e => e.data.category === l.category), e => e.data.amount); const b = +l.amount || 0; return `<tr><td>${esc(l.category)}</td><td class="num">${money(b)}</td><td class="num">${money(s)}</td><td class="num" style="${s > b ? "color:var(--err)" : ""}">${money(b - s)}</td><td><div class="prog ${s > b ? "over" : ""}"><i style="width:${b ? Math.min(100, s / b * 100) : 0}%"></i></div></td></tr>`; }).join("")}
      </tbody></table></div></div>`; }
};
const budgetSpend = d => (R.expenses || []).filter(e => ["Approved","Paid"].includes(e.data.status) && String(e.data.date || "").startsWith(String(d.year)) && (!d.campus || e.data.campus === d.campus));
MOD.expenses = { key:"expenses", c:"expenses", title:"Expenses", newLabel:"Add expense", sub:"Claims and bills with receipts. Approve, then mark paid.", needs:["expenses"], search:["payee","description","category"], filters:["status","category"], importable:true,
  name: d => `${d.payee || "Expense"} · ${money(d.amount)}`, defaults: () => ({date: today(), status:"Submitted", submittedBy: S.me.name, category: EXP_CATS[0]}),
  fields:[{k:"date",label:"Date",type:"date",req:true},{k:"payee",label:"Payee",req:true},{k:"amount",label:"Amount (£)",type:"money",req:true},{k:"category",label:"Category",type:"select",opts:EXP_CATS},{k:"method",label:"Paid by",type:"select",opts:["Bank transfer","Card","Cash","Cheque","Direct debit","Reimbursement"]},{k:"campus",label:"Campus",type:"select",opts:campusNames},
    {k:"description",label:"What it was for",type:"textarea",rows:2},{k:"receipt",label:"Receipt",type:"image"},{k:"status",label:"Status",type:"select",opts:EXP_STATUS},{k:"submittedBy",label:"Submitted by"},{k:"approvedBy",label:"Approved by"}],
  columns:[{label:"Date",v:d => fmtDate(d.date)},{label:"Payee",html:d => `<b>${esc(d.payee)}</b>`},{label:"Category",k:"category"},{label:"Status",html:d => chip(d.status || "Submitted", stageCls(d.status))},{label:"Receipt",html:d => d.receipt ? "✓" : '<span class="hint">—</span>'},{label:"Amount",num:true,v:d => money(d.amount)}],
  top: () => { const w = (R.expenses || []).filter(e => e.data.status === "Submitted"); return w.length ? `<div class="notice warn" style="margin-bottom:14px">${w.length} expense${w.length === 1 ? "" : "s"} waiting for approval (${money(sum(w, e => e.data.amount))}).</div>` : ""; },
  editActions: d => ({Submitted: `<button class="abtn pri" type="button" data-xs="Approved">Approve</button><button class="abtn danger" type="button" data-xs="Rejected">Reject</button>`, Approved: `<button class="abtn pri" type="button" data-xs="Paid">Mark paid</button>`}[d.status || "Submitted"] || ""),
  wire: d => $$("[data-xs]").forEach(b => b.onclick = async () => { const nd = Object.assign({}, CM.draft, {status: b.dataset.xs}); if (b.dataset.xs === "Approved") nd.approvedBy = S.me.name; if (b.dataset.xs === "Paid") nd.paidOn = today(); try { await saveRec("expenses", CM.edit, nd); CM.draft = nd; CM.dirty = false; toast(b.dataset.xs); reAdminKeep(); } catch(e){ toast(errMsg(e), true); } })
};

/* ============================== Teams & rotas ============================== */
MOD.teams = { key:"teams", c:"teams", title:"Teams", newLabel:"New team", sub:"Serving teams, their positions and members. Teams that work with children can require a DBS check.", needs:["teams","members"], search:["name"], name: d => d.name || "Team",
  defaults: () => ({members: [], positions: [{name: "Team member"}]}),
  fields:[{k:"name",label:"Team name",req:true,ph:"e.g. Media, Ushering, Choir, Children's church"},{k:"leader",label:"Team leader",type:"person"},{k:"dbsRequired",label:"Members need a DBS check",type:"check"},{k:"whatsapp",label:"WhatsApp group link"},
    {k:"positions",label:"Positions on a rota",type:"list",addLabel:"Add position",sub:[{k:"name",label:"Position",ph:"e.g. Camera 1"},{k:"count",label:"How many",type:"number",w:"110px"}]},
    {k:"members",label:"Team members",type:"people"},{k:"notes",label:"Notes",type:"textarea",rows:2}],
  columns:[{label:"Team",html:d => `<b>${esc(d.name)}</b>`},{label:"Leader",v:d => personName(d.leader)},{label:"Members",num:true,v:d => (d.members || []).length},{label:"Positions",num:true,v:d => (d.positions || []).length},{label:"Safeguarding",html:d => { if (!d.dbsRequired) return ""; const n = (d.members || []).filter(id => { const p = dirRec(id); return !p || dbsIssue(p.data) || p.data.dbsStatus !== "Clear"; }).length; return n ? `<span class="warnline">${n} need DBS</span>` : '<span class="okline">All clear</span>'; }}],
  after: (d, isNew) => isNew || !d.dbsRequired ? "" : `<div class="panel"><h2>DBS checks</h2><p class="sub">Everyone on this team needs a clear, in-date DBS check.</p>${(d.members || []).map(id => { const p = dirRec(id); const iss = p ? (dbsIssue(p.data) || (p.data.dbsStatus !== "Clear" ? "No clear DBS recorded" : "")) : "Not found"; return `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--grey)"><span>${esc(personName(id))}</span>${iss ? `<span class="warnline">${esc(iss)}</span>` : '<span class="okline">Clear</span>'}</div>`; }).join("") || '<p class="hint">No members yet.</p>'}</div>`
};
function rotaIssues(d, id){ const out = [];
  (d.assignments || []).forEach(a => { if (!a.person) return; const n = personName(a.person);
    if ((R.availability || []).some(x => x.data.person === a.person && x.data.from <= d.date && (x.data.to || x.data.from) >= d.date)) out.push(`${n} is away on this date`);
    const dup = (R.rota || []).filter(r => r.id !== id && r.data.date === d.date && (r.data.assignments || []).some(x => x.person === a.person)); if (dup.length) out.push(`${n} is also on ${dup.map(r => teamName(r.data.team)).join(", ")}`);
    const t = (R.teams || []).find(t => t.id === d.team); if (t && t.data.dbsRequired){ const p = dirRec(a.person); if (!p || p.data.dbsStatus !== "Clear" || dbsIssue(p.data)) out.push(`${n} has no clear DBS check`); } });
  return [...new Set(out)]; }
const teamName = id => ((R.teams || []).find(t => t.id === id) || {data:{}}).data.name || "Team";
function rotaText(date){ const rs = (R.rota || []).filter(r => r.data.date === date).sort((a,b) => teamName(a.data.team).localeCompare(teamName(b.data.team)));
  return [`*Rota · ${DOW[parseD(date).getDay()]} ${fmtDate(date)}*`].concat(rs.map(r => `\n*${teamName(r.data.team)}*${r.data.service ? " (" + r.data.service + ")" : ""}\n` + (r.data.assignments || []).map(a => `• ${a.position || "Team"}: ${personName(a.person) || "_needed_"}`).join("\n"))).join("\n"); }
MOD.rota = { key:"rota", c:"rota", title:"Sunday rota", newLabel:"Add to rota", sub:"Who's serving when. Clashes, time away and missing DBS checks are flagged.", needs:["rota","teams","availability","members"], views:["list","calendar"], calendarBy:"date", filters:["team"],
  name: d => `${teamName(d.team)} · ${fmtDate(d.date)}`, calLabel: d => teamName(d.team), rerenderOn:["team"],
  defaults: () => { const d = parseD(today()); d.setDate(d.getDate() + ((7 - d.getDay()) % 7)); return {date: new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString().slice(0,10), service: serviceNames()[0], assignments: []}; },
  fields:[{k:"date",label:"Date",type:"date",req:true},{k:"service",label:"Service",type:"select",opts:serviceNames},{k:"team",label:"Team",type:"select",opts:teamOpts,req:true},
    {k:"assignments",label:"Who's serving",type:"list",addLabel:"Add person",sub:[{k:"position",label:"Position",type:"select",opts: () => ((R.teams || []).find(t => t.id === (CM.draft || {}).team) || {data:{positions:[]}}).data.positions.map(p => p.name).filter(Boolean).concat(["Team member"])},{k:"person",label:"Person",type:"person"}]},
    {k:"notes",label:"Notes",type:"textarea",rows:2}],
  columns:[{label:"Date",v:d => fmtDate(d.date)},{label:"Team",html:d => `<b>${esc(teamName(d.team))}</b>`},{label:"Service",k:"service"},{label:"Filled",num:true,html:d => { const a = d.assignments || []; const f = a.filter(x => x.person).length; return f < a.length ? `<span class="warnline">${f}/${a.length}</span>` : `${f}/${a.length}`; }},{label:"Issues",html:(d,r) => { const n = rotaIssues(d, r.id).length; return n ? `<span class="warnline">${n} issue${n > 1 ? "s" : ""}</span>` : ""; }}],
  listActions: () => `<button class="abtn" type="button" id="rotaShare">Copy a week for WhatsApp</button>`,
  before: (d) => { const t = (R.teams || []).find(t => t.id === d.team); return t && !(d.assignments || []).length ? `<div class="notice ok" style="margin-bottom:12px">Start from the team's positions? <button class="abtn" type="button" id="rotaFill" style="margin-left:8px">Fill positions</button></div>` : ""; },
  after: (d, isNew) => { const iss = rotaIssues(d, isNew ? null : CM.edit); const team = (R.teams || []).find(t => t.id === d.team); const sugg = team ? (team.data.members || []).filter(id => !(d.assignments || []).some(a => a.person === id) && !(R.availability || []).some(x => x.data.person === id && x.data.from <= d.date && (x.data.to || x.data.from) >= d.date)) : [];
    return `<div class="grid2"><div class="panel"><h2>Checks</h2><p class="sub">Clashes, time away and safeguarding.</p>${iss.length ? iss.map(i => `<div class="warnline" style="padding:3px 0">⚠ ${esc(i)}</div>`).join("") : '<div class="okline">No problems found.</div>'}</div>
      <div class="panel"><h2>Available from this team</h2><p class="sub">Team members not already serving or away.</p>${sugg.length ? `<div class="chips">${sugg.map(id => chip(personName(id), "blue")).join("")}</div>` : '<p class="hint">Nobody else available.</p>'}</div></div>`; },
  wire: d => { const f = $("#rotaFill"); if (f) f.onclick = () => { const t = (R.teams || []).find(t => t.id === CM.draft.team); CM.draft.assignments = (t.data.positions || []).flatMap(p => Array.from({length: Math.max(1, +p.count || 1)}, () => ({position: p.name, person: ""}))); CM.dirty = true; reAdminKeep(); };
    const s = $("#rotaShare"); if (s) s.onclick = () => { const dates = [...new Set((R.rota || []).map(r => r.data.date).filter(x => x >= today()))].sort(); if (!dates.length){ toast("No upcoming rota yet.", true); return; }
      const close = openModal(`<h3>Share the rota</h3><div class="fld lt"><label for="rsDate">Date</label><select class="inp" id="rsDate">${dates.map(x => `<option value="${x}">${esc(fmtDate(x))}</option>`).join("")}</select></div><textarea class="inp" id="rsText" rows="12" style="margin-top:10px;font-family:inherit" aria-label="Rota text">${esc(rotaText(dates[0]))}</textarea><div style="display:flex;justify-content:flex-end;gap:8px;margin-top:12px"><button class="btn sm" type="button" id="rsCopy">Copy for WhatsApp</button></div>`);
      $("#rsDate").onchange = e => { $("#rsText").value = rotaText(e.target.value); }; $("#rsCopy").onclick = () => copyText($("#rsText").value, "Rota copied. Paste it into WhatsApp."); }; }
};
MOD.availability = { key:"availability", c:"availability", title:"Availability", newLabel:"Add time away", sub:"Holidays and dates people can't serve. The rota warns you if someone is booked while away.", needs:["availability","members"], search:[d => personName(d.person), "reason"],
  name: d => `${personName(d.person)} · ${fmtDate(d.from)}`, defaults: () => ({from: today(), to: today()}),
  fields:[{k:"person",label:"Person",type:"person",req:true},{k:"from",label:"From",type:"date",req:true},{k:"to",label:"To",type:"date",req:true},{k:"reason",label:"Reason (optional)",ph:"e.g. Holiday"}],
  columns:[{label:"Person",html:d => `<b>${esc(personName(d.person))}</b>`},{label:"From",v:d => fmtDate(d.from)},{label:"To",v:d => fmtDate(d.to)},{label:"Reason",k:"reason"}],
  validate: d => d.to < d.from ? "The end date is before the start date." : "", where: r => (r.data.to || r.data.from || "") >= addDays(today(), -30)
};

/* ============================== Services & events ============================== */
MOD.tickets = { key:"tickets", title:"Tickets & check-in", custom:true, needs:["tickets"],
  render(){ const evs = S.events.filter(e => e.registration).sort((a,b) => (b.date || "").localeCompare(a.date || "")); const id = CM.extra.ev || (evs.find(e => (e.date || "") >= today()) || evs[0] || {}).id;
    const ev = evs.find(e => e.id === id); const q = (CM.extra.tq || "").toLowerCase();
    const all = (R.tickets || []).filter(t => t.data.eventId === id); const live = all.filter(t => t.data.status !== "Cancelled");
    const places = sum(live, t => t.data.guests || 1), inn = sum(live.filter(t => t.data.checkedIn), t => t.data.guests || 1);
    const list = all.filter(t => !q || [t.data.name, t.data.email, t.data.code].join(" ").toLowerCase().includes(q)).sort((a,b) => (a.data.name || "").localeCompare(b.data.name || ""));
    if (!evs.length) return head("Tickets & check-in", "Registrations for events.") + `<div class="panel"><div class="empty lt" style="margin:0;border-color:#C9D3E2"><h3>No events take registrations yet</h3><p>Open an event under Events (website), tick “Allow online registration” and set a capacity.</p><button class="abtn pri" type="button" data-goto="events">Go to events</button></div></div>`;
    return head("Tickets & check-in", "People who registered for events. Check them in at the door by name or ticket code.", `<button class="abtn" type="button" id="tkExport">Export CSV</button><button class="abtn pri" type="button" id="tkAdd">Add registration</button>`) +
      `<div class="cm-bar"><select class="inp" id="tkEv" aria-label="Event">${evs.map(e => `<option value="${esc(e.id)}" ${e.id === id ? "selected" : ""}>${esc(fmtDate(e.date))} · ${esc(e.title)}</option>`).join("")}</select><input class="inp grow" type="search" id="tkq" placeholder="Name, email or ticket code…" value="${esc(CM.extra.tq || "")}" aria-label="Search tickets"></div>
      <div class="kpis"><div class="kpi"><span>Registered</span><b>${places}</b><small>${ev && ev.capacity ? `of ${ev.capacity} places` : "No capacity set"}</small></div><div class="kpi"><span>Checked in</span><b>${inn}</b><small>${places ? Math.round(inn / places * 100) : 0}% arrived</small></div><div class="kpi"><span>Places left</span><b>${ev && ev.capacity ? Math.max(0, ev.capacity - places) : "∞"}</b></div></div>
      <div class="panel" style="padding:0;overflow:hidden"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Name</th><th>Code</th><th class="num">Places</th><th>Ticket</th><th>Status</th><th></th></tr></thead><tbody>
      ${list.map(t => `<tr><td><b>${esc(t.data.name)}</b><div class="hint">${esc(t.data.email || "")} ${esc(t.data.phone || "")}</div></td><td><code style="font-weight:800">${esc(t.data.code || "")}</code></td><td class="num">${esc(t.data.guests || 1)}</td><td>${esc(t.data.ticketType || "")}</td><td>${t.data.status === "Cancelled" ? chip("Cancelled","red") : t.data.checkedIn ? chip("Checked in","ok") : chip("Expected","blue")}</td>
        <td><div class="rowacts">${t.data.status === "Cancelled" ? "" : `<button class="abtn ${t.data.checkedIn ? "" : "pri"}" type="button" data-tin="${esc(t.id)}">${t.data.checkedIn ? "Undo" : "Check in"}</button><button class="abtn danger" type="button" data-tcancel="${esc(t.id)}">Cancel</button>`}</div></td></tr>`).join("") || `<tr><td colspan="6" class="hint" style="padding:16px">No registrations${q ? " match" : " yet"}.</td></tr>`}
      </tbody></table></div></div>`; },
  wire(){ const ev = $("#tkEv"); if (ev) ev.onchange = () => { CM.extra.ev = ev.value; reAdminKeep(); };
    $$("[data-goto]").forEach(a => a.onclick = e => { e.preventDefault(); A.tab = a.dataset.goto; renderAdmin(); });
    const q = $("#tkq"); if (q) { q.oninput = () => { CM.extra.tq = q.value; clearTimeout(q._t); q._t = setTimeout(() => { reAdminKeep(); const n = $("#tkq"); if (n){ n.focus(); n.setSelectionRange(n.value.length, n.value.length); } }, 200); }; }
    const upd = async (id, patch, msg) => { const t = (R.tickets || []).find(x => x.id === id); if (!t) return; try { await saveRec("tickets", id, Object.assign({}, t.data, patch)); toast(msg); reAdminKeep(); } catch(e){ toast(errMsg(e), true); } };
    $$("[data-tin]").forEach(b => b.onclick = () => { const t = (R.tickets || []).find(x => x.id === b.dataset.tin); upd(b.dataset.tin, {checkedIn: !t.data.checkedIn, checkedInAt: new Date().toISOString()}, t.data.checkedIn ? "Check-in undone" : "Checked in"); });
    $$("[data-tcancel]").forEach(b => b.onclick = () => armDelete(b, () => upd(b.dataset.tcancel, {status: "Cancelled"}, "Registration cancelled")));
    const ex = $("#tkExport"); if (ex) ex.onclick = () => { const id = $("#tkEv").value; downloadFile(`tickets-${id}.csv`, toCSV((R.tickets || []).filter(t => t.data.eventId === id).map(t => t.data), [["name","Name"],["email","Email"],["phone","Phone"],["guests","Places"],["ticketType","Ticket"],["code","Code"],["status","Status"],[d => d.checkedIn ? "Yes" : "No","Checked in"]])); };
    const add = $("#tkAdd"); if (add) add.onclick = () => { const id = $("#tkEv").value; const ev = S.events.find(e => e.id === id);
      const close = openModal(`<h3>Add registration</h3><form id="tkForm" class="fgrid lt"><div class="fld"><label for="tk_n">Name</label><input class="inp" id="tk_n" required></div><div class="fld"><label for="tk_e">Email</label><input class="inp" id="tk_e" type="email"></div><div class="fld"><label for="tk_p">Phone</label><input class="inp" id="tk_p"></div><div class="fld"><label for="tk_g">Places</label><input class="inp" id="tk_g" type="number" min="1" value="1"></div><div class="full"><button class="btn sm" type="submit">Add</button></div></form>`);
      $("#tkForm").onsubmit = async e => { e.preventDefault(); if (!$("#tk_n").value.trim()) return; const code = Array.from(crypto.getRandomValues(new Uint8Array(6))).map(x => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[x % 32]).join("");
        try { await saveRec("tickets", rid(), {eventId: id, eventTitle: ev ? ev.title : "", name: $("#tk_n").value.trim(), email: $("#tk_e").value.trim(), phone: $("#tk_p").value.trim(), guests: +$("#tk_g").value || 1, ticketType: "Added by team", code, status: "Confirmed", checkedIn: false}, true); close(); toast("Added · code " + code); reAdminKeep(); } catch(x){ toast(errMsg(x), true); } }; }; }
};
MOD.rooms = { key:"rooms", c:"rooms", title:"Rooms & resources", newLabel:"Add room or resource", sub:"Halls, rooms, the minibus, the projector: anything people book.", needs:["rooms"], search:["name"], name: d => d.name || "Room",
  defaults: () => ({campus: campusNames()[0] || "", bookable: true}),
  fields:[{k:"name",label:"Name",req:true,ph:"e.g. Main hall"},{k:"kind",label:"Type",type:"select",opts:["Room","Hall","Vehicle","Equipment","Other"]},{k:"campus",label:"Campus",type:"select",opts:campusNames},{k:"capacity",label:"Capacity",type:"number"},{k:"bookable",label:"Can be booked",type:"check"},{k:"notes",label:"Notes",type:"textarea",rows:2}],
  columns:[{label:"Name",html:d => `<b>${esc(d.name)}</b>`},{label:"Type",k:"kind"},{label:"Campus",k:"campus"},{label:"Capacity",num:true,k:"capacity"}]
};
const roomName = id => ((R.rooms || []).find(r => r.id === id) || {data:{}}).data.name || "Room";
MOD.bookings = { key:"bookings", c:"bookings", title:"Room bookings", newLabel:"Book a room", sub:"Bookings for rooms and resources. Double bookings are blocked.", needs:["bookings","rooms"], views:["calendar","list"], calendarBy:"date", filters:["room","status"],
  name: d => `${d.title || "Booking"} · ${roomName(d.room)}`, calLabel: d => `${d.start || ""} ${roomName(d.room)}: ${d.title || ""}`,
  defaults: () => ({date: today(), start: "18:00", end: "20:00", status: "Confirmed", bookedBy: S.me.name}),
  fields:[{k:"room",label:"Room / resource",type:"select",opts:roomOpts,req:true},{k:"title",label:"What for",req:true},{k:"date",label:"Date",type:"date",req:true},{k:"start",label:"Start",type:"time",req:true},{k:"end",label:"End",type:"time",req:true},
    {k:"status",label:"Status",type:"select",opts:["Requested","Confirmed","Cancelled"]},{k:"bookedBy",label:"Booked by"},{k:"contact",label:"Contact"},{k:"notes",label:"Notes",type:"textarea",rows:2}],
  columns:[{label:"Date",v:d => fmtDate(d.date)},{label:"Time",v:d => `${d.start || ""}–${d.end || ""}`},{label:"Room",v:d => roomName(d.room)},{label:"What for",html:d => `<b>${esc(d.title)}</b>`},{label:"Status",html:d => chip(d.status || "Confirmed", stageCls(d.status))}],
  validate: (d, id) => { if (d.end <= d.start) return "The end time must be after the start time."; if (d.status === "Cancelled") return "";
    const clash = (R.bookings || []).find(b => b.id !== id && b.data.room === d.room && b.data.date === d.date && b.data.status !== "Cancelled" && b.data.start < d.end && d.start < b.data.end);
    return clash ? `${roomName(d.room)} is already booked ${clash.data.start}–${clash.data.end} for “${clash.data.title}”.` : ""; },
  where: r => (r.data.date || "") >= addDays(today(), -60)
};
const hhmm = (t, add) => { const [h, m] = String(t || "10:00").split(":").map(Number); const x = h * 60 + m + add; return `${String(Math.floor(x / 60) % 24).padStart(2,"0")}:${String(x % 60).padStart(2,"0")}`; };
function oosText(d){ let t = 0; return [`${d.service || "Service"} · ${fmtDate(d.date)}${d.theme ? "\nTheme: " + d.theme : ""}`, ""].concat((d.items || []).map(i => { const line = `${hhmm(d.startTime, t)}  ${i.type || ""}${i.title ? " · " + i.title : ""}${i.person ? " (" + i.person + ")" : ""}${i.minutes ? " [" + i.minutes + " min]" : ""}`; t += +i.minutes || 0; return line; })).join("\n"); }
MOD.services = { key:"services", c:"services", title:"Order of service", newLabel:"Plan a service", sub:"Running order for each service, with timings. Copy it to the team or print it.", needs:["services","members"], search:["service","theme","preacher"], filters:["service"],
  name: d => `${d.service || "Service"} · ${fmtDate(d.date)}`,
  defaults: () => ({date: MOD.rota.defaults().date, service: serviceNames()[0], startTime: "10:00", campus: campusNames()[0] || "", items: [{type:"Welcome",minutes:5},{type:"Praise & worship",minutes:25},{type:"Prayer",minutes:10},{type:"Announcements",minutes:5},{type:"Offering",minutes:10},{type:"Sermon",minutes:40},{type:"Altar call",minutes:10},{type:"Benediction",minutes:5}]}),
  fields:[{k:"date",label:"Date",type:"date",req:true},{k:"service",label:"Service",type:"select",opts:serviceNames},{k:"campus",label:"Campus",type:"select",opts:campusNames},{k:"startTime",label:"Starts at",type:"time"},
    {k:"theme",label:"Theme / sermon title"},{k:"preacher",label:"Preacher"},{k:"leader",label:"Worship leader",type:"person"},{k:"host",label:"Service host / MC"},
    {k:"items",label:"Running order",type:"list",addLabel:"Add item",sub:[{k:"type",label:"Item",type:"select",opts:OOS_TYPES,w:"170px"},{k:"title",label:"Details",ph:"Song, passage…"},{k:"person",label:"Who",w:"150px"},{k:"minutes",label:"Mins",type:"number",w:"80px"}],
      after: rows => { let t = 0; return `<p class="hint" style="margin-top:8px">Total ${sum(rows, r => r.minutes)} minutes · ends about ${hhmm((CM.draft || {}).startTime, sum(rows, r => r.minutes))}</p>`; }},
    {k:"notes",label:"Notes for the team",type:"textarea",rows:2}],
  columns:[{label:"Date",v:d => fmtDate(d.date)},{label:"Service",html:d => `<b>${esc(d.service)}</b>`},{label:"Theme",k:"theme"},{label:"Preacher",k:"preacher"},{label:"Length",num:true,v:d => sum(d.items || [], i => i.minutes) + " min"}],
  editActions: () => `<button class="abtn" type="button" id="oosCopy">Copy as text</button><button class="abtn" type="button" id="oosPrint">Print</button><button class="abtn" type="button" id="oosDup">Duplicate for next week</button>`,
  after: (d, isNew) => { let t = 0; return `<div class="panel"><h2>Running order</h2><p class="sub">${esc(d.service || "")} · ${esc(fmtDate(d.date))}${d.theme ? " · " + esc(d.theme) : ""}</p><div class="tbl-wrap"><table class="tbl"><tbody>${(d.items || []).map(i => { const r = `<tr><td class="oos-time">${hhmm(d.startTime, t)}</td><td><b>${esc(i.type || "")}</b>${i.title ? ` · ${esc(i.title)}` : ""}</td><td>${esc(i.person || "")}</td><td class="num">${esc(i.minutes || "")} min</td></tr>`; t += +i.minutes || 0; return r; }).join("")}</tbody></table></div></div>`; },
  wire: d => { const c = $("#oosCopy"); if (c) c.onclick = () => copyText(oosText(CM.draft), "Order of service copied");
    const p = $("#oosPrint"); if (p) p.onclick = () => window.print();
    const du = $("#oosDup"); if (du) du.onclick = () => { const copy = clone(CM.draft); copy.date = addDays(copy.date || today(), 7); CM.edit = "new"; CM.draft = copy; CM.dirty = true; reAdminTop(); toast("Copied. Change what's different, then save."); }; }
};

/* ============================== Communications ============================== */
function resolveSegment(s){
  const groups = new Set(s.groups || []); const tags = String(s.tags || "").toLowerCase().split(",").map(x => x.trim()).filter(Boolean);
  return (R.members || []).filter(m => { const d = m.data;
    if ((s.statuses || []).length && !s.statuses.includes(d.status)) return false;
    if ((s.campuses || []).length && !s.campuses.includes(d.campus)) return false;
    if (groups.size && !(R.groups || []).some(g => groups.has(g.id) && ((g.data.members || []).includes(m.id) || g.data.leader === m.id))) return false;
    if (tags.length && !tags.some(t => String(d.tags || "").toLowerCase().split(",").map(x => x.trim()).includes(t))) return false;
    if (s.consent === "Email allowed" && (!d.consentEmail || !d.email)) return false;
    if (s.consent === "Texts allowed" && (!d.consentSms || !d.phone)) return false;
    if (s.birthdayMonth && !(d.dob && +d.dob.slice(5,7) === MONTHS.indexOf(s.birthdayMonth) + 1)) return false;
    const age = ageOn(d.dob); if (s.minAge && (age === null || age < +s.minAge)) return false; if (s.maxAge && (age === null || age > +s.maxAge)) return false;
    if (s.joinedFrom && !(d.joined && d.joined >= s.joinedFrom)) return false;
    return true; });
}
MOD.segments = { key:"segments", c:"segments", title:"Smart segments", newLabel:"New segment", sub:"Saved filters of people that update themselves, e.g. “Youth at Birmingham who allow texts”.", needs:["segments","members","groups"], search:["name"], name: d => d.name || "Segment",
  defaults: () => ({consent: "Any", statuses: ["Member","Regular attender"]}),
  fields:[{k:"name",label:"Segment name",req:true},{k:"statuses",label:"Status",type:"multi",opts:STATUSES},{k:"campuses",label:"Campus",type:"multi",opts:campusNames},{k:"groups",label:"In any of these groups",type:"multi",opts: () => (R.groups || []).map(g => [g.id, g.data.name])},
    {k:"tags",label:"Has any of these tags",ph:"choir, student"},{k:"consent",label:"Contact permission",type:"select",opts:["Any","Email allowed","Texts allowed"]},{k:"birthdayMonth",label:"Birthday in",type:"select",opts:MONTHS},
    {k:"minAge",label:"Minimum age",type:"number"},{k:"maxAge",label:"Maximum age",type:"number"},{k:"joinedFrom",label:"Joined on or after",type:"date"}],
  columns:[{label:"Segment",html:d => `<b>${esc(d.name)}</b>`},{label:"People now",num:true,v:d => resolveSegment(d).length}],
  rerenderOn:["consent","birthdayMonth"], live: () => { const el = $("#segCount"); if (el) el.textContent = resolveSegment(CM.draft).length; },
  after: d => { const list = resolveSegment(d); return `<div class="panel"><h2><span id="segCount">${list.length}</span> people match</h2><p class="sub">Save to keep this segment. It updates as people change.</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px"><button class="abtn" type="button" id="segCsv">Export CSV</button>${CM.edit !== "new" ? `<button class="abtn pri" type="button" id="segMsg">Write a message to them</button>` : ""}</div>
    <div class="chips">${list.slice(0, 60).map(m => chip(pname(m.data))).join("")}${list.length > 60 ? chip(`+${list.length - 60} more`) : ""}</div></div>`; },
  wire: d => { $$("[data-multi]").forEach(cb => cb.addEventListener("change", () => setTimeout(reAdminKeep, 0)));
    const c = $("#segCsv"); if (c) c.onclick = () => downloadFile(`segment-${today()}.csv`, toCSV(resolveSegment(CM.draft).map(m => m.data), [["firstName","First name"],["lastName","Last name"],["email","Email"],["phone","Phone"],["campus","Campus"],["status","Status"]]));
    const m = $("#segMsg"); if (m) m.onclick = () => { const seg = CM.edit; A.tab = "broadcasts"; CM.edit = null; openRec(MOD.broadcasts, "new", {segment: seg}); }; }
};
function bcRecipients(d){ const seg = (R.segments || []).find(s => s.id === d.segment); return seg ? resolveSegment(seg.data) : []; }
MOD.broadcasts = { key:"broadcasts", c:"broadcasts", title:"Broadcasts", newLabel:"New message", sub:"Send an email to a segment, or copy numbers and text for WhatsApp and SMS.", needs:["broadcasts","segments","members","groups"], search:["subject","message"], filters:["channel","status"],
  name: d => d.subject || "Message", defaults: () => ({channel: "Email", status: "Draft"}), rerenderOn:["segment","channel"],
  fields:[{k:"subject",label:"Subject / title",req:true},{k:"channel",label:"Channel",type:"select",opts:["Email","WhatsApp","SMS"]},{k:"segment",label:"Send to segment",type:"select",opts: () => (R.segments || []).map(s => [s.id, s.data.name]),req:true},
    {k:"message",label:"Message",type:"textarea",rows:9,req:true},{k:"status",label:"Status",type:"select",opts:["Draft","Sent"]}],
  columns:[{label:"Subject",html:d => `<b>${esc(d.subject)}</b>`},{label:"Channel",k:"channel"},{label:"Segment",v:d => ((R.segments || []).find(s => s.id === d.segment) || {data:{}}).data.name || ""},{label:"Status",html:d => chip(d.status || "Draft", d.status === "Sent" ? "ok" : "")},{label:"Sent",v:d => d.sentAt ? fmtDate(d.sentAt.slice(0,10)) : ""}],
  after: (d, isNew) => { const r = bcRecipients(d); const emails = r.filter(m => m.data.email && m.data.consentEmail); const phones = r.filter(m => m.data.phone && m.data.consentSms);
    return `<div class="panel"><h2>Recipients</h2><p class="sub">${r.length} in the segment · ${emails.length} can be emailed · ${phones.length} can be texted (based on their consent).</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap">${d.channel === "Email" ? `<button class="abtn pri" type="button" id="bcSend" ${isNew || !emails.length || d.status === "Sent" ? "disabled" : ""}>Send ${emails.length} emails now</button><button class="abtn" type="button" id="bcEmails">Copy email addresses (for BCC)</button>` : `<button class="abtn pri" type="button" id="bcPhones">Copy ${phones.length} phone numbers</button>`}
      <button class="abtn" type="button" id="bcText">Copy message</button>${d.status !== "Sent" && !isNew ? `<button class="abtn" type="button" id="bcMark">Mark as sent</button>` : ""}</div>
      <p class="hint" style="margin:10px 0 0">${d.channel === "Email" ? "Sending needs RESEND_API_KEY and FROM_EMAIL set in Vercel. Without them, copy the addresses into your email's BCC field." : "For WhatsApp, paste the message into a broadcast list or group. Only people who allowed texts are included."}${isNew ? " Save first to send." : ""}</p></div>`; },
  wire: d => { const r = () => bcRecipients(CM.draft);
    const em = $("#bcEmails"); if (em) em.onclick = () => copyText(r().filter(m => m.data.email && m.data.consentEmail).map(m => m.data.email).join(", "), "Email addresses copied");
    const ph = $("#bcPhones"); if (ph) ph.onclick = () => copyText(r().filter(m => m.data.phone && m.data.consentSms).map(m => m.data.phone).join("\n"), "Phone numbers copied");
    const tx = $("#bcText"); if (tx) tx.onclick = () => copyText(CM.draft.message || "", "Message copied");
    const mk = $("#bcMark"); if (mk) mk.onclick = async () => { CM.draft.status = "Sent"; CM.draft.sentAt = new Date().toISOString(); await saveRec("broadcasts", CM.edit, CM.draft); toast("Marked as sent"); reAdminKeep(); };
    const sd = $("#bcSend"); if (sd) sd.onclick = () => armDelete(sd, async () => { try { const to = r().filter(m => m.data.email && m.data.consentEmail).map(m => m.data.email);
      const res = await api("POST", "/api/records", {op: "send-email", c: "broadcasts", to, subject: CM.draft.subject, text: CM.draft.message});
      CM.draft.status = "Sent"; CM.draft.sentAt = new Date().toISOString(); CM.draft.sentCount = res.sent; await saveRec("broadcasts", CM.edit, CM.draft); toast(`Sent to ${res.sent} people`); reAdminKeep(); } catch(e){ toast(errMsg(e), true); sd.disabled = false; } });
    if (sd) sd.textContent = sd.textContent; }
};
MOD.social = { key:"social", c:"social", title:"Social calendar", newLabel:"Plan a post", sub:"Plan posts across Facebook, Instagram, YouTube, TikTok and WhatsApp.", needs:["social"], views:["calendar","board","list"], calendarBy:"date", boardBy:"status", filters:["status"], search:["caption","campaign"],
  name: d => (d.caption || "Post").slice(0, 60), calLabel: d => `${(d.platforms || []).map(p => p[0]).join("")} ${(d.caption || "Post").slice(0, 30)}`, cardLine: d => esc([fmtDate(d.date), (d.platforms || []).join(", ")].filter(Boolean).join(" · ")),
  defaults: () => ({date: today(), status: "Idea", platforms: ["Facebook","Instagram"], owner: S.me.email}),
  fields:[{k:"date",label:"Post date",type:"date",req:true},{k:"time",label:"Time",type:"time"},{k:"platforms",label:"Platforms",type:"multi",opts:PLATFORMS},{k:"caption",label:"Caption",type:"textarea",rows:5,req:true},{k:"image",label:"Image",type:"image"},
    {k:"status",label:"Status",type:"select",opts:SOCIAL_STATUS},{k:"owner",label:"Owner",type:"user"},{k:"campaign",label:"Campaign / series",ph:"e.g. Harvest Sunday"},{k:"link",label:"Link to include"}],
  columns:[{label:"Date",v:d => fmtDate(d.date)},{label:"Post",html:d => `<b>${esc((d.caption || "").slice(0, 70))}</b>`},{label:"Platforms",v:d => (d.platforms || []).join(", ")},{label:"Status",html:d => chip(d.status || "Idea", stageCls(d.status))}],
  editActions: () => `<button class="abtn" type="button" id="soCopy">Copy caption</button>`, wire: () => { const b = $("#soCopy"); if (b) b.onclick = () => copyText([CM.draft.caption, CM.draft.link].filter(Boolean).join("\n\n"), "Caption copied"); }
};

/* ============================== Tasks, reports, audit ============================== */
MOD.tasks = { key:"tasks", c:"tasks", title:"Tasks", newLabel:"New task", sub:"Follow-ups and to-dos for the team.", needs:["tasks"], views:["board","list"], boardBy:"status", mineFilter:true, search:["title","related","notes"], filters:["assignee","priority"],
  name: d => d.title || "Task", cardLine: d => esc([((USERS || []).find(u => u.email === d.assignee) || {}).name, d.due ? (overdue(d.due) && d.status !== "Done" ? "Overdue " : "Due ") + fmtDate(d.due) : ""].filter(Boolean).join(" · ")),
  defaults: () => ({status: "To do", priority: "Normal", assignee: S.me.email}),
  fields:[{k:"title",label:"Task",req:true},{k:"assignee",label:"Assigned to",type:"user"},{k:"due",label:"Due",type:"date"},{k:"status",label:"Status",type:"select",opts:TASK_STATUS},{k:"priority",label:"Priority",type:"select",opts:["Normal","High","Urgent"]},{k:"related",label:"Related to",ph:"Person, event…"},{k:"notes",label:"Notes",type:"textarea",rows:3}],
  columns:[{label:"Task",html:d => `<b>${esc(d.title)}</b>`},{label:"Assigned to",v:d => ((USERS || []).find(u => u.email === d.assignee) || {}).name || ""},{label:"Due",html:d => d.due ? `<span class="${overdue(d.due) && d.status !== "Done" ? "warnline" : ""}">${esc(fmtDate(d.due))}</span>` : ""},{label:"Status",html:d => chip(d.status || "To do", stageCls(d.status))}]
};
MOD.reports = { key:"reports", title:"Reports", custom:true, needs:["attendance","gifts","funds","members","visitors"],
  render(){ const out = [];
    if (canRead("attendance")){ const wk = {}; (R.attendance || []).forEach(a => { const d = parseD(a.data.date); if (!d) return; d.setDate(d.getDate() - d.getDay()); const k = new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString().slice(0,10); wk[k] = (wk[k] || 0) + (+a.data.adults || 0) + (+a.data.children || 0); });
      const pts = Object.keys(wk).sort().slice(-12).map(k => ({l: "Week of " + fmtDate(k), s: k.slice(5).split("-").reverse().join("/"), v: wk[k]}));
      out.push(`<div class="panel"><h2>Weekly in-person attendance</h2><p class="sub">All services, last 12 weeks.</p>${bars(pts)}</div>`); }
    if (canRead("gifts")){ const mo = {}; (R.gifts || []).forEach(g => { const k = (g.data.date || "").slice(0,7); if (k) mo[k] = (mo[k] || 0) + (+g.data.amount || 0); });
      const keys = []; const d = new Date(); d.setDate(1); for (let i = 11; i >= 0; i--){ const x = new Date(d.getFullYear(), d.getMonth() - i, 1); keys.push(`${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,"0")}`); }
      out.push(`<div class="panel"><h2>Giving by month</h2><p class="sub">Last 12 months.</p>${bars(keys.map(k => ({l: MONTHS[+k.slice(5)-1] + " " + k.slice(0,4), s: MONTHS[+k.slice(5)-1], v: Math.round(mo[k] || 0)})), money)}</div>`);
      const ty = taxYear(today()); const byF = {}; (R.gifts || []).filter(g => taxYear(g.data.date) === ty).forEach(g => byF[g.data.fund] = (byF[g.data.fund] || 0) + (+g.data.amount || 0)); const tot = sum(Object.values(byF), x => x);
      out.push(`<div class="panel"><h2>Giving by fund</h2><p class="sub">Tax year ${ty} · ${money(tot)}</p>${Object.entries(byF).sort((a,b) => b[1]-a[1]).map(([f,v]) => `<div style="display:grid;grid-template-columns:1fr auto;gap:4px 12px;margin-bottom:10px"><span>${esc(fundName(f))}</span><b class="num">${money(v)}</b><div class="prog" style="grid-column:1/-1"><i style="width:${tot ? v / tot * 100 : 0}%"></i></div></div>`).join("") || '<p class="hint">No gifts yet.</p>'}</div>`); }
    if (canRead("members")){ const by = {}; (R.members || []).forEach(m => by[m.data.status || "Unknown"] = (by[m.data.status || "Unknown"] || 0) + 1);
      out.push(`<div class="panel"><h2>People by status</h2><p class="sub">${(R.members || []).length} people.</p><table class="tbl"><tbody>${Object.entries(by).sort((a,b) => b[1]-a[1]).map(([k,v]) => `<tr><td>${esc(k)}</td><td class="num">${v}</td></tr>`).join("")}</tbody></table></div>`);
      const st = {}; (R.visitors || []).forEach(v => st[v.data.stage || "New"] = (st[v.data.stage || "New"] || 0) + 1);
      out.push(`<div class="panel"><h2>Visitor follow-up</h2><p class="sub">Where visitors are now.</p><table class="tbl"><tbody>${STAGES.map(s => `<tr><td>${esc(s)}</td><td class="num">${st[s] || 0}</td></tr>`).join("")}</tbody></table></div>`); }
    return head("Reports", "Trends across attendance, giving and people.") + `<div class="grid2">${out.join("") || '<p class="hint">No reports for your role.</p>'}</div>`; }
};
MOD.audit = { key:"audit", title:"Audit log", custom:true, needs:[],
  render(){ if (!CM.extra.audit){ get("/api/records?c=audit").then(r => { CM.extra.audit = r.items; reAdminKeep(); }).catch(e => toast(errMsg(e), true)); return head("Audit log", "") + `<p class="hint">Loading…</p>`; }
    const q = (CM.extra.aq || "").toLowerCase(); const rows = CM.extra.audit.filter(a => !q || [a.name, a.by, a.action, a.target, a.summary].join(" ").toLowerCase().includes(q));
    return head("Audit log", "Every change made in the admin and every form sent from the website. The latest 5,000 are kept.", `<button class="abtn" type="button" id="auRefresh">Refresh</button><button class="abtn" type="button" id="auCsv">Export CSV</button>`) +
      `<div class="cm-bar"><input class="inp grow" type="search" id="auq" placeholder="Search by person, action or item…" value="${esc(CM.extra.aq || "")}" aria-label="Search the audit log"></div>
      <div class="panel" style="padding:0;overflow:hidden"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>When</th><th>Who</th><th>Action</th><th>Area</th><th>Item</th></tr></thead><tbody>${rows.slice(0, 400).map(a => `<tr><td style="white-space:nowrap">${esc(new Date(a.at).toLocaleString("en-GB", {dateStyle:"medium", timeStyle:"short"}))}</td><td>${esc(a.name || a.by)}</td><td>${chip(a.action, a.action === "delete" ? "red" : a.action === "create" ? "ok" : "")}</td><td>${esc(a.target)}</td><td>${esc(a.summary)}</td></tr>`).join("") || '<tr><td colspan="5" class="hint" style="padding:16px">Nothing yet.</td></tr>'}</tbody></table></div></div>`; },
  wire(){ const q = $("#auq"); if (q) q.oninput = () => { CM.extra.aq = q.value; clearTimeout(q._t); q._t = setTimeout(() => { reAdminKeep(); const n = $("#auq"); if (n){ n.focus(); n.setSelectionRange(n.value.length, n.value.length); } }, 200); };
    const r = $("#auRefresh"); if (r) r.onclick = () => { CM.extra.audit = null; reAdminKeep(); };
    const c = $("#auCsv"); if (c) c.onclick = () => downloadFile(`audit-${today()}.csv`, toCSV(CM.extra.audit, [["at","When"],["name","Who"],["by","Email"],["action","Action"],["target","Area"],["summary","Item"]])); }
};

/* ============================== Dashboard ============================== */
function nextSunday(){ const d = parseD(today()); d.setDate(d.getDate() + ((7 - d.getDay()) % 7)); return new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString().slice(0,10); }
function dashboard(){
  const r = role(); const k = []; const panels = [];
  const kpi = (label, value, small, tab, warn) => k.push(`<a class="kpi" href="#" data-goto="${tab}"><span>${esc(label)}</span><b style="${warn ? "color:var(--warn)" : ""}">${value}</b><small>${small || "&nbsp;"}</small></a>`);
  if (canRead("members")){ const act = (R.members || []).filter(m => ["Member","Regular attender","Youth","Child"].includes(m.data.status)); kpi("People", act.length, (n => `${n} member${n === 1 ? "" : "s"}`)((R.members || []).filter(m => m.data.status === "Member").length), "members"); }
  if (canRead("visitors")){ const nv = (R.visitors || []).filter(v => (v.data.firstVisit || v.data.createdAt || "") >= addDays(today(), -30)).length; const od = (R.visitors || []).filter(v => !["Became a member","Not now"].includes(v.data.stage) && overdue(v.data.nextAction)).length; kpi("New visitors (30 days)", nv, od ? `<span class="down">${od} follow-ups overdue</span>` : "Follow-ups up to date", "visitors"); }
  if (canRead("attendance")){ const last = (R.attendance || []).slice().sort((a,b) => (b.data.date||"").localeCompare(a.data.date||"")).slice(0, 4); const avg = last.length ? Math.round(sum(last, a => (+a.data.adults||0) + (+a.data.children||0)) / last.length) : 0; kpi("Average attendance", avg || "—", last.length ? `Last ${last.length} service${last.length === 1 ? "" : "s"}` : "No services recorded", "attendance"); }
  if (canRead("gifts")){ const m = today().slice(0,7), lm = addDays(m + "-01", -1).slice(0,7); const tm = sum((R.gifts || []).filter(g => (g.data.date||"").startsWith(m)), g => g.data.amount), tl = sum((R.gifts || []).filter(g => (g.data.date||"").startsWith(lm)), g => g.data.amount);
    kpi("Giving this month", money(tm), tl ? `<span class="${tm >= tl ? "up" : "down"}">${tm >= tl ? "▲" : "▼"} ${Math.abs(Math.round((tm - tl) / tl * 100))}%</span> vs last month` : "", "gifts"); }
  if (canRead("care")){ const open = (R.care || []).filter(c => c.data.status !== "Closed"); kpi("Open care cases", open.length, `${open.filter(c => c.data.priority === "Urgent").length} urgent`, "care", open.some(c => c.data.priority === "Urgent")); }
  if (canRead("expenses")){ const w = (R.expenses || []).filter(e => e.data.status === "Submitted"); kpi("Expenses to approve", w.length, w.length ? money(sum(w, e => e.data.amount)) : "All done", "expenses", w.length > 0); }
  if (canRead("rota")){ const ns = nextSunday(); const rs = (R.rota || []).filter(x => x.data.date === ns); const gaps = sum(rs, x => (x.data.assignments || []).filter(a => !a.person).length); kpi("Rota gaps this Sunday", rs.length ? gaps : "—", rs.length ? `${rs.length} team${rs.length === 1 ? "" : "s"} on ${fmtDate(ns)}` : "No rota yet", "rota", gaps > 0); }
  const dirList = R.members || DIR || []; const dbs = dirList.filter(m => dbsIssue(m.data) && m.data.dbsStatus !== "Not needed");
  if (canRead("teams") && dbs.length) kpi("DBS checks to renew", dbs.length, "Expired or due within 60 days", canRead("members") ? "members" : "teams", true);

  if (canRead("tasks")){ const mine = (R.tasks || []).filter(t => t.data.assignee === S.me.email && t.data.status !== "Done").sort((a,b) => (a.data.due || "9").localeCompare(b.data.due || "9"));
    panels.push(`<div class="panel"><h2>My tasks</h2><p class="sub">${mine.length ? `${mine.length} open` : "Nothing assigned to you."}</p>${mine.slice(0, 6).map(t => `<div style="display:flex;justify-content:space-between;gap:10px;padding:7px 0;border-bottom:1px solid var(--grey)"><span>${esc(t.data.title)}</span>${t.data.due ? `<span class="${overdue(t.data.due) ? "warnline" : "hint"}">${esc(fmtDate(t.data.due))}</span>` : ""}</div>`).join("")}<div style="margin-top:10px"><button class="abtn" type="button" data-goto="tasks">All tasks</button></div></div>`); }
  if (canRead("members")){ const wk = []; for (let i = 0; i < 7; i++) wk.push(addDays(today(), i).slice(5)); const bd = (R.members || []).filter(m => m.data.dob && wk.includes(m.data.dob.slice(5))).sort((a,b) => wk.indexOf(a.data.dob.slice(5)) - wk.indexOf(b.data.dob.slice(5)));
    panels.push(`<div class="panel"><h2>Birthdays this week</h2><p class="sub">${bd.length ? "Send them a message!" : "No birthdays in the next 7 days."}</p>${bd.map(m => `<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--grey)"><span>${esc(pname(m.data))}</span><span class="hint">${esc(fmtDate(today().slice(0,4) + "-" + m.data.dob.slice(5)).replace(/ \d{4}$/, ""))}${ageOn(m.data.dob, addDays(today(), 7)) !== null ? ` · turns ${ageOn(m.data.dob, addDays(today(), 7))}` : ""}</span></div>`).join("")}</div>`); }
  if (canRead("attendance")){ const pts = (R.attendance || []).slice().sort((a,b) => (a.data.date||"").localeCompare(b.data.date||"")).slice(-12).map(a => ({l: `${fmtDate(a.data.date)} ${a.data.service || ""}`, s: (a.data.date||"").slice(5).split("-").reverse().join("/"), v: (+a.data.adults||0) + (+a.data.children||0)})); panels.push(`<div class="panel"><h2>Attendance</h2><p class="sub">Last ${pts.length} service${pts.length === 1 ? "" : "s"}.</p>${bars(pts)}</div>`); }
  if (canRead("gifts")){ const keys = []; const d = new Date(); for (let i = 5; i >= 0; i--){ const x = new Date(d.getFullYear(), d.getMonth() - i, 1); keys.push(`${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,"0")}`); }
    panels.push(`<div class="panel"><h2>Giving</h2><p class="sub">Last 6 months.</p>${bars(keys.map(k => ({l: MONTHS[+k.slice(5)-1] + " " + k.slice(0,4), s: MONTHS[+k.slice(5)-1], v: Math.round(sum((R.gifts || []).filter(g => (g.data.date||"").startsWith(k)), g => g.data.amount))})), money)}</div>`); }
  const up = S.events.filter(e => (e.date || "") >= today()).sort((a,b) => (a.date||"").localeCompare(b.date||"")).slice(0, 4);
  if (up.length) panels.push(`<div class="panel"><h2>Coming up</h2><p class="sub">Next events on the website.</p>${up.map(e => { const t = canRead("tickets") ? sum((R.tickets || []).filter(x => x.data.eventId === e.id && x.data.status !== "Cancelled"), x => x.data.guests || 1) : null; return `<div style="display:flex;justify-content:space-between;gap:10px;padding:7px 0;border-bottom:1px solid var(--grey)"><span><b>${esc(e.title)}</b><div class="hint">${esc(fmtDate(e.date))}</div></span>${e.registration && t !== null ? `<span class="chip blue">${t}${e.capacity ? "/" + e.capacity : ""} booked</span>` : ""}</div>`; }).join("")}</div>`);

  const findBox = canRead("members") ? `<div class="panel" style="padding:14px 16px"><label class="hint" for="dashFind" style="display:block;margin-bottom:6px">Find a person</label><input class="inp" id="dashFind" type="search" placeholder="Start typing a name, email or phone…" autocomplete="off"><div id="dashFound"></div></div>` : "";
  const greet = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening";
  const site = _adminTabRef.fn().replace(head("Welcome back", "Manage everything visitors see on the Deeper Life Bible Church, West Midlands website.", `<a class="abtn" href="#home">View website</a>`), "").replace(/<div class="stats">[\s\S]*?<\/div><\/div>\s*/, "");
  return head(`${greet}, ${(S.me.name || "").split(" ")[0]}`, `Here's what's happening at Deeper Life Bible Church, West Midlands.`, `<a class="abtn" href="#home">View website</a>`) + findBox +
    (k.length ? `<div class="kpis">${k.join("")}</div>` : "") + (panels.length ? `<div class="grid2" style="margin-bottom:16px">${panels.join("")}</div>` : "") + `<h2 style="font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin:24px 0 10px">Website</h2>` + site;
}
const DASH_NEEDS = ["members","visitors","attendance","gifts","care","expenses","rota","teams","tasks","tickets"];

/* ============================== Integration ============================== */
const LABELS = { dashboard:"Dashboard", tasks:"Tasks", reports:"Reports", members:"Members", visitors:"Visitors & follow-up", attendance:"Attendance", kids:"Kids check-in", groups:"Small groups", care:"Pastoral care",
  funds:"Funds", gifts:"Gifts & tithes", recurring:"Recurring giving", pledges:"Pledge campaigns", declarations:"Gift Aid declarations", giftaid:"Gift Aid claims", budgets:"Budgets", expenses:"Expenses",
  teams:"Teams", rota:"Sunday rota", availability:"Availability", events:"Events (website)", tickets:"Tickets & check-in", services:"Order of service", bookings:"Room bookings", rooms:"Rooms & resources",
  inbox:"Inbox", segments:"Smart segments", broadcasts:"Broadcasts", social:"Social calendar", content:"Page content", images:"Site images", campuses:"Campuses & times", posts:"Posts & news", sermons:"Sermons", live:"Livestream", ministries:"Ministries", media:"Media library", team:"Users & access", audit:"Audit log" };
const GROUPS = [["", ["dashboard","tasks","reports"]], ["People", ["members","visitors","attendance","kids","groups","care"]], ["Giving", ["funds","gifts","recurring","pledges","declarations","giftaid"]], ["Finance", ["budgets","expenses"]],
  ["Teams & rotas", ["teams","rota","availability"]], ["Services & events", ["events","tickets","services","bookings","rooms"]], ["Communications", ["inbox","segments","broadcasts","social"]],
  ["Website", ["content","images","campuses","posts","sermons","live","ministries","media"]], ["Admin", ["team","audit"]]];
TABS.length = 0; GROUPS.forEach(([, keys]) => keys.forEach(k => TABS.push([k, LABELS[k]])));

const _adminTabRef = { fn: adminTab };
let loading = false;
window.adminTab = function(){
  const isDash = A.tab === "dashboard"; const m = MOD[A.tab];
  if (!isDash && !m) return _adminTabRef.fn();
  let needs = isDash ? DASH_NEEDS.concat(canRead("members") ? [] : ["directory"]) : (m.needs || [m.c]);
  needs = needs.filter(Boolean).map(c => c === "members" && !canRead("members") ? "directory" : c).filter(c => c === "directory" ? !DIR : (canRead(c) && !R[c]));
  if (needs.length || !USERS){
    if (!loading){ loading = true; Promise.all([loadMany(needs.filter(c => c !== "directory")), needs.includes("directory") ? load("directory") : null, users()])
      .catch(e => { toast(errMsg(e), true); needs.forEach(c => { if (c === "directory") DIR = DIR || []; else R[c] = R[c] || []; }); })
      .finally(() => { loading = false; if (S.route === "admin") reAdminKeep(); }); }
    return head(isDash ? "Dashboard" : m.title, "") + `<div class="panel"><p class="hint" style="margin:0">Loading…</p></div>`;
  }
  // quietly refresh anything older than 20 seconds (website forms add visitors, tickets and declarations)
  const stale = (isDash ? DASH_NEEDS : (m.needs || [m.c])).filter(c => c && R[c] && canRead(c) && Date.now() - (R_AT[c] || 0) > 20000);
  if (stale.length && !bgLoading){ bgLoading = true; const before = JSON.stringify(stale.map(c => R[c]));
    loadMany(stale, true).then(() => { if (JSON.stringify(stale.map(c => R[c])) !== before && !CM.dirty && S.route === "admin") reAdminKeep(); }).catch(() => {}).finally(() => { bgLoading = false; }); }
  if (isDash) return dashboard();
  return m.custom ? m.render() : moduleView(m);
};
let bgLoading = false;
const _wire = wireAdmin;
window.wireAdmin = function(){
  _wire();
  const nav = $(".adm-side nav");
  if (nav){ GROUPS.forEach(([g, keys]) => { if (!g) return; const first = keys.map(k => nav.querySelector(`[data-tab="${k}"]`)).find(Boolean); if (first){ const h = document.createElement("div"); h.className = "grp"; h.textContent = g; first.before(h); } });
    $$("[data-tab]", nav).forEach(b => b.addEventListener("click", e => { if (CM.dirty){ e.stopImmediatePropagation(); toast("Save or close the open record first.", true); return; } CM.edit = null; CM.draft = null; }, true)); }
  $$("[data-goto]").forEach(a => a.onclick = e => { e.preventDefault(); if (!canTab(a.dataset.goto)) return; A.tab = a.dataset.goto; CM.edit = null; renderAdmin(); });
  const m = MOD[A.tab];
  if (m && !loading){ if (m.custom) { m.wire && m.wire(); } else wireModule(m); }
  if (A.tab === "dashboard"){ const f = $("#dashFind"); if (f) f.oninput = () => { const q = f.value.trim().toLowerCase(); const out = $("#dashFound"); if (!q){ out.innerHTML = ""; return; }
      const hits = (R.members || []).filter(m => [pname(m.data), m.data.email, m.data.phone].join(" ").toLowerCase().includes(q)).slice(0, 8);
      out.innerHTML = `<div class="search-res">${hits.map(h => `<button type="button" data-find="${esc(h.id)}"><b>${esc(pname(h.data))}</b><span class="hint">${esc([h.data.status, h.data.phone].filter(Boolean).join(" · "))}</span></button>`).join("") || '<p class="hint" style="padding:10px">No one found.</p>'}</div>`;
      $$("[data-find]", out).forEach(b => b.onclick = () => { A.tab = "members"; openRec(MOD.members, b.dataset.find); }); }; }
  if (A.tab === "inbox" && canRead("care")){ $$(".msg").forEach(msg => { if (!/Prayer request/.test(msg.querySelector(".chip")?.textContent || "") || msg.querySelector("[data-tocare]")) return; const acts = msg.querySelector(".rowacts"); const b = document.createElement("button"); b.type = "button"; b.className = "abtn"; b.dataset.tocare = "1"; b.textContent = "Open care case";
      const req = [...msg.querySelectorAll("dt")].find(dt => dt.textContent === "Request")?.nextElementSibling?.textContent || ""; const nm = [...msg.querySelectorAll("dt")].find(dt => dt.textContent === "Name")?.nextElementSibling?.textContent || "";
      b.onclick = () => { A.tab = "care"; loadMany(["care","members"]).finally(() => openRec(MOD.care, "new", {name: nm, type: "Prayer", status: "Open", opened: today(), assignee: S.me.email, summary: req, log: []})); }; acts.prepend(b); }); }
};

window.CMS_READY = true;
if (S.route === "admin") renderAdmin();
})();
