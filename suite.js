/* Church Suite for Deeper Life West Midlands — schema-driven admin over /api/suite.
   Same signed session as the main site (#admin). Money is integer pence everywhere. */
"use strict";
const RANK = { owner:4, admin:3, editor:2, pastoral:1 };
const S = { me:null, view:"dashboard", cache:{}, q:"", modalOpen:false };
const $ = s => document.querySelector(s);
const esc = s => String(s==null?"":s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const rank = () => RANK[S.me && S.me.role] || 0;
const money = p => p==null||p===""?"":"£" + ((parseInt(p)||0)/100).toFixed(2);
const nice = d => d ? new Date(d + ((String(d).length===10)?"T12:00:00":"")).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}) : "";
const moneyIn = v => { const n = String(v==null?"":v).replace(/[£,\s]/g,""); return n===""?"":String(Math.round(parseFloat(n)*100)); };
const moneyOut = v => v==null||v===""?"":((parseInt(v)||0)/100).toFixed(2);

async function api(op, params={}, body=null){
  const q = new URLSearchParams({op, ...params}).toString();
  const res = await fetch("/api/suite?"+q, body ? {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body)} : {});
  const j = await res.json().catch(()=>({error:"Bad response from the server."}));
  if(!res.ok) throw new Error(j.error || ("Error "+res.status));
  return j;
}
const get = (m) => S.cache[m] || (S.cache[m] = api("list",{m}).then(r=>r.rows));
const inval = (...ms) => ms.forEach(m=>delete S.cache[m]);

/* ---------------- schema ---------------- */
const F = (k,l,t,o={}) => ({k,l,t,...o});
const MODS = [
 {key:"members", name:"Members", group:"People", read:1, write:2,
  cols:["fullName","phone","email","status","household"],
  fields:[F("fullName","Full name","text",{req:1}),F("phone","Phone","text"),F("email","Email","text"),F("address","Address","text"),F("birthday","Date of birth","date"),F("household","Household","text"),F("status","Status","sel",{opts:["active","new","visitor","inactive"]}),F("role","Church role","sel",{opts:["member","volunteer","leader","staff"]}),F("joined","Member since","date"),F("tags","Tags","tags",{hint:"e.g. worship, youth, comma separated"}),F("notes","Notes","ta"),F("dbs","DBS check","sel",{restricted:1,opts:["not needed","pending","clear","expired"]}),F("dbsDate","DBS date","date",{restricted:1}),F("safeguardingNotes","Safeguarding notes (restricted)","ta",{restricted:1})]},
 {key:"visitors", name:"Visitors & follow-up", group:"People", read:1, write:2,
  cols:["fullName","visitDate","campus","status","assignedTo"],
  fields:[F("fullName","Name","text",{req:1}),F("contact","Contact (phone/email)","text"),F("visitDate","Visit date","date",{req:1}),F("campus","Campus","text"),F("status","Follow-up status","sel",{opts:["new","contacted","visited","integrated","done"]}),F("assignedTo","Assigned to","ref",{ref:"members"}),F("nextAction","Next action date","date"),F("notes","Notes","ta")]},
 {key:"attendance", name:"Attendance", group:"People", read:1, write:2,
  cols:["date","service","campus","adults","children","total"],
  fields:[F("date","Date","date",{req:1}),F("service","Service","sel",{opts:["Sunday Worship","Bible Study","Revival & Prayer","Special Programme","Other"]}),F("campus","Campus","text"),F("adults","Adults","num"),F("children","Children","num"),F("total","Total headcount","num"),F("notes","Notes","ta")]},
 {key:"groups", name:"Small groups", group:"People", read:1, write:2,
  cols:["name","leader","meets"],
  fields:[F("name","Group name","text",{req:1}),F("leader","Leader","ref",{ref:"members"}),F("meets","Meets","text",{hint:"e.g. Wednesdays 7pm, Perry Barr"}),F("membersList","Members","tags"),F("notes","Notes","ta")]},
 {key:"care", name:"Pastoral care", group:"People", read:1, write:1, needOwner:1,
  cols:["person","date","type","status"],
  fields:[F("person","Person","text"),F("date","Date","date"),F("type","Type","sel",{opts:["prayer request","visit note","care flag","follow-up"]}),F("summary","Summary","ta"),F("confidential","Confidential (pastoral team only)","chk"),F("status","Status","sel",{opts:["open","in progress","closed"]})]},
 {key:"funds", name:"Funds", group:"Giving", read:3, write:3,
  cols:["name","target"],
  fields:[F("name","Fund name","text",{req:1}),F("purpose","Purpose","text"),F("target","Target","money")]},
 {key:"gifts", name:"Gifts & tithes", group:"Giving", read:3, write:3,
  cols:["date","memberId","amount","fund","method","giftAid"],
  fields:[F("date","Date","date",{req:1}),F("memberId","Member","ref",{ref:"members"}),F("amount","Amount","money",{req:1}),F("fund","Fund","text",{hint:"e.g. General, Building, Missions"}),F("method","Method","sel",{opts:["card","cash","bank transfer","standing order","online"]}),F("recurring","Part of a recurring plan","chk"),F("giftAid","Gift Aid declaration applies","chk"),F("note","Reference / note","text")]},
 {key:"plans", name:"Recurring giving", group:"Giving", read:3, write:3,
  cols:["memberId","amount","frequency","status"],
  fields:[F("memberId","Member","ref",{ref:"members"}),F("amount","Amount","money",{req:1}),F("fund","Fund","text"),F("frequency","Frequency","sel",{opts:["weekly","monthly"]}),F("started","Started","date"),F("status","Status","sel",{opts:["active","paused","ended"]})]},
 {key:"pledges", name:"Pledge campaigns", group:"Giving", read:3, write:3,
  cols:["campaign","memberId","amount","fulfilled"],
  fields:[F("campaign","Campaign","text",{req:1}),F("memberId","Member","ref",{ref:"members"}),F("amount","Pledged","money",{req:1}),F("fulfilled","Fulfilled so far","money"),F("startDate","From","date"),F("endDate","To","date")]},
 {key:"budgets", name:"Budgets", group:"Finance", read:3, write:3,
  cols:["period","fund","category","amount"],
  fields:[F("period","Period (year)","text",{req:1,hint:"e.g. 2026"}),F("fund","Fund","text"),F("category","Category","text",{req:1}),F("amount","Budgeted","money",{req:1})]},
 {key:"expenses", name:"Expenses", group:"Finance", read:3, write:3,
  cols:["date","category","fund","amount","status"],
  fields:[F("date","Date","date",{req:1}),F("fund","Fund","text"),F("category","Category","text",{req:1}),F("amount","Amount","money",{req:1}),F("requestedBy","Requested by","text"),F("status","Status","sel",{opts:["submitted","approved","paid","declined"]}),F("note","Note / receipt reference","text")]},
 {key:"teams", name:"Teams", group:"Teams & rotas", read:2, write:2,
  cols:["name","leader"],
  fields:[F("name","Team name","text",{req:1}),F("leader","Leader","ref",{ref:"members"}),F("membersList","Members","tags"),F("notes","Notes","ta")]},
 {key:"rota", name:"Sunday rota", group:"Teams & rotas", read:2, write:2,
  cols:["date","service","team","role","personId","status"],
  fields:[F("date","Service date","date",{req:1}),F("service","Service","sel",{opts:["Sunday Worship","Bible Study","Revival & Prayer","Special Programme"]}),F("team","Team","ref",{ref:"teams"}),F("role","Role","text",{hint:"e.g. Usher lead, Sound"}),F("personId","Person","ref",{ref:"members"}),F("status","Status","sel",{opts:["to confirm","confirmed","standby","declined"]})]},
 {key:"unavail", name:"Availability", group:"Teams & rotas", read:2, write:2,
  cols:["personId","from","to","reason"],
  fields:[F("personId","Person","ref",{ref:"members"}),F("from","Unavailable from","date",{req:1}),F("to","Until","date"),F("reason","Reason","text")]},
 {key:"events", name:"Events & ticketing", group:"Services & events", read:2, write:2,
  cols:["title","date","location","capacity","ticketPrice"],
  fields:[F("title","Title","text",{req:1}),F("date","Date","date",{req:1}),F("time","Time","text"),F("location","Location","text"),F("description","Description","ta"),F("public","Show on the public website","chk"),F("capacity","Capacity","num"),F("ticketPrice","Ticket price","money"),F("rsvps","RSVPs received","num")]},
 {key:"bookings", name:"Room & resource bookings", group:"Services & events", read:2, write:2,
  cols:["room","date","start","end","bookedBy","status"],
  fields:[F("room","Room","sel",{opts:["Main hall","Classroom 1","Classroom 2","Office","Kitchen","Other"]}),F("date","Date","date",{req:1}),F("start","From","text"),F("end","Until","text"),F("bookedBy","Booked by","text"),F("purpose","Purpose","text"),F("status","Status","sel",{opts:["requested","confirmed","declined"]})]},
 {key:"orders", name:"Order of service", group:"Services & events", read:2, write:2,
  cols:["date","service"],
  fields:[F("date","Date","date",{req:1}),F("service","Service","sel",{opts:["Sunday Worship","Bible Study","Revival & Prayer","Special Programme"]}),F("items","Run order (one item per line: time | item | person)","ta",{fw:1}),F("songs","Songs","ta"),F("media","Media / slides","ta")]},
 {key:"segments", name:"Smart segments", group:"Communications", read:3, write:3,
  cols:["name","rule"],
  fields:[F("name","Segment name","text",{req:1}),F("rule","Who is in it","sel",{opts:["everyone","visitors last 30 days","giving members","under 18s","team leaders","inactive members"]}),F("notes","Notes","ta")]},
 {key:"broadcasts", name:"Broadcasts", group:"Communications", read:3, write:3,
  cols:["title","segment","channels","status","sentAt"],
  fields:[F("title","Title","text",{req:1}),F("segment","Send to","ref",{ref:"segments"}),F("channels","Channels","sel",{opts:["WhatsApp","SMS","Email"]}),F("message","Message","ta",{fw:1}),F("status","Status","sel",{opts:["draft","approved","sent"]}),F("sentAt","Sent on","date"),F("stats","Delivery notes","text")]},
 {key:"social", name:"Social calendar", group:"Communications", read:2, write:2,
  cols:["date","platform","copy","status"],
  fields:[F("date","Post date","date",{req:1}),F("platform","Platform","sel",{opts:["Facebook","Instagram","X","YouTube","TikTok"]}),F("copy","Copy","ta",{fw:1}),F("status","Status","sel",{opts:["draft","approved","scheduled","posted"]}),F("link","Link","text")]},
];
const GROUPS = ["People","Giving","Finance","Teams & rotas","Services & events","Communications"];
const byKey = k => MODS.find(m=>m.key===k);
const memberName = id => { const m=(S.cache._members||[]).find(x=>x.id===id); return m ? (m.fullName||m.email||id) : (id||""); };

/* ---------------- shell ---------------- */
function paintNav(){
  const r = rank(), can = m => r >= m.read && (!m.needOwner || ["owner","admin","pastoral"].includes(S.me.role));
  const link = (k,name,on) => `<a href="#${k}" class="${on?"on":""}"><span class="dot"></span>${name}</a>`;
  let h = link("dashboard","Dashboard", S.view==="dashboard");
  for(const g of GROUPS){
    const items = MODS.filter(m=>m.group===g && can(m));
    if(!items.length) continue;
    h += `<div class="grp">${g}</div>` + items.map(m=>link(m.key,m.name,S.view===m.key)).join("");
  }
  if(r>=3) h += `<div class="grp">Admin</div>` + link("audit","Audit log",S.view==="audit");
  $("#nav").innerHTML = h;
  $("#who").innerHTML = `<b>${esc(S.me.name||S.me.email)}</b><br>${esc(S.me.role)} · <a href="/#admin">main admin</a>`;
}
function toast(msg, err){
  const d = document.createElement("div");
  d.className = "notice" + (err?" err":"");
  d.style.cssText = "position:fixed;bottom:18px;left:50%;transform:translateX(-50%);z-index:99;max-width:90vw";
  d.textContent = msg; document.body.appendChild(d);
  setTimeout(()=>d.remove(), err?6000:3500);
}

/* ---------------- generic CRUD ---------------- */
function colVal(m, row, c){
  const f = m.fields.find(f=>f.k===c);
  let v = row[c];
  if(f){
    if(f.t==="money") return money(v);
    if(f.t==="date") return nice(v);
    if(f.t==="chk") return v ? "✓" : "";
    if(f.t==="ref") return memberName(v);
  }
  if(Array.isArray(v)) return v.join(", ");
  return esc(v);
}
function rowsFor(m, rows){
  const q = S.q.trim().toLowerCase();
  let out = rows;
  if(q) out = out.filter(r=>Object.values(r).some(v=>String(v).toLowerCase().includes(q)));
  return out.slice().sort((a,b)=>String(b.date||b.createdAt||"").localeCompare(String(a.date||a.createdAt||"")));
}
async function viewModule(key){
  const m = byKey(key), r = rank();
  const rows = await get(key);
  const writable = r >= m.write;
  const canExport = r >= 3 && !(key==="members" && r<3);
  const cols = m.cols.filter(c=>!(m.fields.find(f=>f.k===c)||{}).restricted || r>=3);
  let extra = "";
  if(key==="visitors") extra = `<button class="btn" id="fuBoard">Follow-up board</button>`;
  if(key==="gifts") extra = `<button class="btn" id="gaReport">Gift Aid report (CSV)</button>`;
  if(key==="attendance") extra = `<canvas id="attChart" width="640" height="150" style="max-width:100%;display:block"></canvas>`;
  if(key==="budgets"||key==="expenses") extra = `<button class="btn" id="vaView">Budgets vs actuals</button>`;
  if(key==="rota") extra = `<button class="btn" id="rotaGrid">Rota grid & reminders</button>`;
  if(key==="segments") extra = `<button class="btn" id="segCount">Count people in each segment</button>`;
  const restrictedNote = (key==="members" && r<3) ? `<div class="notice">Safeguarding fields are hidden from your role and only visible to admins and the pastor.</div>` : "";
  $("#main").innerHTML = `
   <h1>${m.name}</h1>
   <p class="sub">${rows.length} record${rows.length===1?"":"s"}${writable?"":" · read-only for your role"}</p>
   ${restrictedNote}
   <div class="row">
    <input id="q" placeholder="Search…" value="${esc(S.q)}" style="max-width:280px">
    ${writable?`<button class="btn pri" id="add">Add ${m.name.toLowerCase().replace(/&.*/,"").trim()}</button>`:""}
    ${r>=3?`<button class="btn" id="imp">Import CSV</button>`:""}
    ${canExport?`<button class="btn" id="exp">Export CSV</button>`:""}
    ${extra}
   </div>
   <div class="panel"><table><thead><tr>${cols.map(c=>`<th>${esc((m.fields.find(f=>f.k===c)||{}).l||c)}</th>`).join("")}<th></th></tr></thead>
   <tbody>${rowsFor(m,rows).map(row=>`<tr data-id="${row.id}">${cols.map(c=>`<td>${colVal(m,row,c)}</td>`).join("")}
     <td style="text-align:right;white-space:nowrap">${writable?`<button class="link" data-edit="${row.id}">Edit</button>`:""}
     ${r>=m.write?` `:""}${(r>=m.del&&m.key!=="gifts")||r>=4?`<button class="link" data-del="${row.id}" style="color:var(--err)">Delete</button>`:""}</td></tr>`).join("") || `<tr><td colspan="${cols.length+1}" class="badge">Nothing here yet.</td></tr>`}</tbody></table></div>`;
  $("#q").addEventListener("input", e=>{ S.q = e.target.value; viewModule(key); });
  const bind = (id,fn)=>{ const el=$("#"+id); if(el) el.onclick = fn; };
  bind("add", ()=>form(m));
  bind("imp", ()=>importCsv(m));
  bind("exp", ()=>{ location.href = "/api/suite?op=export&m="+key; });
  bind("fuBoard", ()=>followupBoard());
  bind("gaReport", ()=>giftAidCsv(rows));
  bind("vaView", ()=>budgetsVsActuals());
  bind("rotaGrid", ()=>rotaGrid());
  bind("segCount", ()=>segmentCounts());
  if($("#attChart")) drawAttChart(rows);
  document.querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>form(m, rows.find(x=>x.id===b.dataset.edit)));
  document.querySelectorAll("[data-del]").forEach(b=>b.onclick=async()=>{
    if(!confirm("Delete this record? This can't be undone.")) return;
    try{ await api("del",{m:key},{id:b.dataset.del}); inval(key); toast("Deleted."); viewModule(key);}catch(e){toast(e.message,1);}
  });
}
function form(m, row){
  const r = rank();
  const fields = m.fields.filter(f=>!f.restricted || r>=3);
  const val = k => row ? (row[k]==null?"":row[k]) : "";
  const refOpts = f => {
    const list = f.ref==="members" ? S.cache._members||[] : S.cache[f.ref]||[];
    return `<option value=""></option>` + list.map(x=>`<option value="${x.id}" ${val(f.k)===x.id?"selected":""}>${esc(x.fullName||x.name||x.id)}</option>`).join("");
  };
  const ctrl = f => {
    if(f.t==="sel") return `<select name="${f.k}"><option value=""></option>${f.opts.map(o=>`<option ${val(f.k)===o?"selected":""}>${o}</option>`).join("")}</select>`;
    if(f.t==="ta") return `<textarea name="${f.k}">${esc(val(f.k))}</textarea>`;
    if(f.t==="chk") return `<label style="display:flex;gap:8px;align-items:center;font-size:14px;color:var(--fg);font-weight:500"><input type="checkbox" name="${f.k}" style="width:auto" ${val(f.k)?"checked":""}> ${f.l}</label>`;
    if(f.t==="money") return `<input name="${f.k}" inputmode="decimal" placeholder="0.00" value="${esc(moneyOut(val(f.k)))}">`;
    if(f.t==="ref") return `<select name="${f.k}">${refOpts(f)}</select>`;
    if(f.t==="num") return `<input name="${f.k}" type="number" value="${esc(val(f.k))}">`;
    if(f.t==="date") return `<input name="${f.k}" type="date" value="${esc(val(f.k))}">`;
    if(f.t==="tags") return `<input name="${f.k}" value="${esc(Array.isArray(val(f.k))?val(f.k).join(", "):val(f.k))}" placeholder="${esc(f.hint||"comma separated")}">`;
    return `<input name="${f.k}" value="${esc(val(f.k))}">`;
  };
  openModal(`<h3>${row?"Edit":"New"} · ${m.name}</h3>
   <form class="f" id="frm">${fields.map(f=>`<div class="${f.fw||f.t==="ta"?"fw":""}"><label>${f.l}${f.req?" *":""}</label>${ctrl(f)}${f.hint?`<div class="badge">${f.hint}</div>`:""}</div>`).join("")}
   <div class="acts fw"><button type="button" class="btn" id="cancel">Cancel</button><button type="submit" class="btn pri">Save</button></div></form>`);
  $("#cancel").onclick = closeModal;
  $("#frm").onsubmit = async e => {
    e.preventDefault();
    const data = {};
    for(const f of fields){
      let v;
      const el = $("#frm").elements[f.k]; if(!el) continue;
      if(f.t==="chk") v = el.checked;
      else if(f.t==="money") v = moneyIn(el.value);
      else if(f.t==="num") v = el.value===""?"":parseInt(el.value);
      else if(f.t==="tags") v = el.value.split(",").map(x=>x.trim()).filter(Boolean);
      else v = el.value;
      data[f.k] = v;
    }
    try{ await api("save",{m:m.key},{id:row&&row.id, data}); closeModal(); inval(m.key); toast("Saved."); viewModule(m.key);}catch(err){toast(err.message,1);}
  };
}
function importCsv(m){
  openModal(`<h3>Import CSV · ${m.name}</h3><p class="sub">First row must be headers matching the field names (e.g. fullName, phone, email). Maximum 2,000 rows.</p>
   <input type="file" id="csvf" accept=".csv,text/csv"><div class="acts"><button class="btn" id="cancel">Cancel</button></div>`);
  $("#cancel").onclick = closeModal;
  $("#csvf").onchange = e => {
    const file = e.target.files[0]; if(!file) return;
    const rd = new FileReader();
    rd.onload = async () => {
      try{
        const rows = parseCsv(String(rd.result));
        const head = rows.shift().map(h=>h.trim());
        const out = rows.filter(r=>r.some(c=>c.trim())).map(r=>{ const o={}; head.forEach((h,i)=>{ const f=m.fields.find(f=>f.k===h); if(!f) return; let v=r[i]==null?"":r[i].trim(); o[h] = f.t==="chk" ? /^(y|yes|true|1)$/i.test(v) : f.t==="money" ? moneyIn(v) : f.t==="tags" ? v.split(";").map(x=>x.trim()).filter(Boolean) : f.t==="num" ? (v===""?"":parseInt(v)) : v; }); return o; });
        await api("import",{m:m.key},{rows:out});
        closeModal(); inval(m.key); toast(`Imported ${out.length} records.`); viewModule(m.key);
      }catch(err){ toast(err.message,1); }
    };
    rd.readAsText(file);
  };
}
function parseCsv(text){
  const rows=[]; let row=[], cur="", inQ=false;
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(inQ){ if(c==='"'){ if(text[i+1]==='"'){cur+='"';i++;} else inQ=false; } else cur+=c; }
    else if(c==='"') inQ=true;
    else if(c===","){ row.push(cur); cur=""; }
    else if(c==="\n"||c==="\r"){ if(cur!==""||row.length){ row.push(cur); rows.push(row); row=[]; cur=""; } if(c==="\r"&&text[i+1]==="\n") i++; }
    else cur+=c;
  }
  if(cur!==""||row.length){ row.push(cur); rows.push(row); }
  return rows;
}

/* ---------------- modal ---------------- */
function openModal(html){ S.modalOpen=true; $("#modal").innerHTML = `<div class="overlay" id="ovl"><div class="sheet">${html}</div></div>`; $("#ovl").onclick = e => { if(e.target.id==="ovl") closeModal(); }; }
function closeModal(){ S.modalOpen=false; $("#modal").innerHTML=""; }

/* ---------------- dashboard ---------------- */
async function viewDashboard(){
  let d; try{ d = await api("dashboard"); }catch(e){ $("#main").innerHTML=`<h1>Dashboard</h1><div class="notice err">${esc(e.message)}</div>`; return; }
  const fin = d.givingThisMonth != null;
  $("#main").innerHTML = `
   <h1>Dashboard</h1><p class="sub">The church week at a glance.</p>
   <div class="cards">
    <div class="card"><div class="k">Members</div><div class="v">${d.members}</div><div class="n">${d.activeMembers} active</div></div>
    <div class="card"><div class="k">Visitors this month</div><div class="v">${d.visitors}</div><div class="n">${d.followup} need follow-up</div></div>
    <div class="card"><div class="k">Last attendance</div><div class="v">${d.lastAttendance?d.lastAttendance.total:"—"}</div><div class="n">${d.lastAttendance?nice(d.lastAttendance.date):"no gatherings logged"}</div></div>
    ${fin?`<div class="card"><div class="k">Giving this month</div><div class="v">${money(d.givingThisMonth)}</div><div class="n">all funds</div></div>
    <div class="card"><div class="k">Expenses to approve</div><div class="v">${d.openExpenses}</div><div class="n">awaiting sign-off</div></div>`:""}
   </div>
   ${fin && Object.keys(d.givingByFund||{}).length ? `<div class="panel"><b style="font-family:Archivo">Giving by fund this month</b><table><thead><tr><th>Fund</th><th>Total</th></tr></thead><tbody>${Object.entries(d.givingByFund).map(([f,v])=>`<tr><td>${esc(f)}</td><td>${money(v)}</td></tr>`).join("")}</tbody></table></div>`:""}
   <div class="panel"><b style="font-family:Archivo">Upcoming events</b>${d.events.length?`<table><tbody>${d.events.map(e=>`<tr><td style="width:110px">${nice(e.date)}</td><td><b>${esc(e.title)}</b></td><td>${esc(e.location||"")}</td></tr>`).join("")}</tbody></table>`:`<p class="sub" style="margin:8px 0 0">Nothing scheduled yet.</p>`}</div>
   ${rank()<3?`<div class="notice">You're signed in as ${esc(S.me.role)}: giving and finance are hidden from this view.</div>`:""}`;
}

/* ---------------- special views ---------------- */
async function followupBoard(){
  const {rows} = await api("followup");
  const stages = ["new","contacted","visited","integrated"];
  openModal(`<h3>Follow-up board</h3><p class="sub">Every visitor still in the 30-day journey, oldest first.</p>
   ${stages.map(st=>{ const rs=rows.filter(r=>(r.status||"new")===st); return rs.length?`<div class="panel"><b>${st}</b><table><tbody>${rs.map(r=>`<tr><td style="width:110px"><span class="pill ${r.days>21?"err":r.days>10?"warn":"ok"}">${r.days}d</span></td><td><b>${esc(r.fullName)}</b></td><td>${esc(r.assignedTo||"unassigned")}</td><td>${nice(r.nextAction)}</td></tr>`).join("")}</tbody></table></div>`:""; }).join("") || `<p class="sub">All caught up.</p>`}
   <div class="acts"><button class="btn" id="cancel">Close</button></div>`);
  $("#cancel").onclick = closeModal;
}
function drawAttChart(rows){
  const c = $("#attChart"); if(!c||!rows.length) return;
  const data = rows.slice().sort((a,b)=>String(a.date).localeCompare(String(b.date))).slice(-14);
  const ctx = c.getContext("2d"), W=c.width, H=c.height;
  ctx.clearRect(0,0,W,H);
  const max = Math.max(10,...data.map(d=>parseInt(d.total)||parseInt(d.adults)||0));
  ctx.strokeStyle="rgba(255,255,255,.15)"; ctx.beginPath();
  for(let i=0;i<=3;i++){ const y=10+(H-30)*i/3; ctx.moveTo(40,y); ctx.lineTo(W-10,y); ctx.stroke(); ctx.fillStyle="#93A3BA"; ctx.font="10px sans-serif"; ctx.fillText(String(Math.round(max*(1-i/3))),4,y+3); }
  ctx.strokeStyle="#2389F7"; ctx.lineWidth=2; ctx.beginPath();
  data.forEach((d,i)=>{ const x=40+(W-60)*i/Math.max(1,data.length-1), y=10+(H-30)*(1-((parseInt(d.total)||parseInt(d.adults)||0)/max)); i?ctx.lineTo(x,y):ctx.moveTo(x,y); });
  ctx.stroke();
  ctx.fillStyle="#93A3BA"; ctx.font="9px sans-serif";
  data.forEach((d,i)=>{ if(data.length<=8||i%2===0){ const x=40+(W-60)*i/Math.max(1,data.length-1); ctx.fillText(String(d.date).slice(5),x-12,H-4); } });
}
function giftAidCsv(rows){
  const fyStart = new Date(new Date().getFullYear(),3,6).toISOString().slice(0,10);
  const ga = rows.filter(g=>g.giftAid && (g.date||"")>=fyStart);
  if(!ga.length) return toast("No Gift Aid gifts in this tax year yet.");
  const csv = "date,member,amount_pounds,fund,method\n" + ga.map(g=>`${g.date||""},${memberName(g.memberId)},${((parseInt(g.amount)||0)/100).toFixed(2)},${g.fund||"General"},${g.method||""}`).join("\n");
  download(`giftaid-${fyStart}.csv`, csv);
  toast(`${ga.length} Gift Aid gifts, HMRC-ready CSV downloaded.`);
}
function download(name, text){
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text],{type:"text/csv"})); a.download = name; a.click();
}
async function budgetsVsActuals(){
  const [bud, gif, exp, fun] = await Promise.all([get("budgets"), get("gifts"), get("expenses"), get("funds")]);
  const y = String(new Date().getFullYear());
  const inB = b => (b.period||"").includes(y);
  const spentBy = {}; exp.filter(e=>inB(e)&&e.status!=="declined").forEach(e=>{ const k=(e.fund||"General")+"|"+(e.category||""); spentBy[k]=(spentBy[k]||0)+(parseInt(e.amount)||0); });
  const recvBy = {}; gif.filter(g=>(g.date||"").startsWith(y)).forEach(g=>{ recvBy[g.fund||"General"]=(recvBy[g.fund||"General"]||0)+(parseInt(g.amount)||0); });
  openModal(`<h3>Budgets vs actuals · ${y}</h3>
   <div class="panel"><table><thead><tr><th>Fund</th><th>Category</th><th>Budgeted</th><th>Spent</th><th>Left</th></tr></thead><tbody>
   ${bud.filter(inB).map(b=>{ const k=(b.fund||"General")+"|"+(b.category||""), sp=spentBy[k]||0, le=(parseInt(b.amount)||0)-sp; return `<tr><td>${esc(b.fund||"General")}</td><td>${esc(b.category)}</td><td>${money(b.amount)}</td><td>${money(sp)}</td><td style="color:${le<0?"var(--err)":"var(--ok)"}">${money(le)}</td></tr>`; }).join("") || `<tr><td colspan="5">No budgets set for ${y}.</td></tr>`}
   </tbody></table></div>
   <div class="panel"><b>Fund inflow ${y}</b><table><tbody>${Object.entries(recvBy).map(([f,v])=>`<tr><td>${esc(f)}</td><td>${money(v)}</td></tr>`).join("")||`<tr><td>No gifts recorded yet.</td></tr>`}</tbody></table></div>
   <div class="acts"><button class="btn" id="cancel">Close</button></div>`);
  $("#cancel").onclick = closeModal;
}
async function rotaGrid(){
  const [rota, unav] = await Promise.all([get("rota"), get("unavail")]);
  const byDate = {};
  rota.forEach(r=>{ (byDate[r.date||""] = byDate[r.date||""]||[]).push(r); });
  const dates = Object.keys(byDate).sort();
  const conflicts = [];
  dates.forEach(d=>{ const seen={}; byDate[d].forEach(r=>{ if(r.personId && r.status!=="declined"){ if(seen[r.personId]) conflicts.push([d, memberName(r.personId)]); seen[r.personId]=1; } }); });
  const unavailOn = p => unav.filter(u=>u.personId===p && (!u.to || u.to >= new Date().toISOString().slice(0,10))).map(u=>`${nice(u.from)}${u.to?" – "+nice(u.to):""} ${u.reason||""}`.trim());
  openModal(`<h3>Rota grid</h3>
   ${conflicts.length?`<div class="notice err"><b>Clashes:</b> ${conflicts.map(c=>esc(c[1])+" is down twice on "+nice(c[0])).join("; ")}</div>`:`<div class="notice">No double-bookings.</div>`}
   ${dates.slice(0,12).map(d=>`<div class="panel"><b>${nice(d)}</b><table><tbody>${byDate[d].map(r=>`<tr><td>${esc(r.service||"")}</td><td>${esc(r.team?memberName(r.team===undefined?"":r.team):"")}${esc(r.teamName||memberName(r.team))}</td><td>${esc(r.role||"")}</td><td><b>${esc(r.personId?memberName(r.personId):"—")}</b></td><td><span class="pill ${r.status==="confirmed"?"ok":r.status==="declined"?"err":"warn"}">${esc(r.status||"to confirm")}</span></td><td class="badge">${esc((r.personId&&unavailOn(r.personId)[0])||"")}</td></tr>`).join("")}</tbody></table></div>`).join("")}
   <div class="panel"><b>Reminder drafts</b><p class="sub">Copy these into WhatsApp/SMS — nothing sends itself.</p>${dates.slice(0,2).map(d=>`<div style="white-space:pre-wrap;background:var(--navy3);border:1px solid var(--line);border-radius:10px;padding:10px;font-size:13px;margin-bottom:8px">Hi! Here's your duty for ${nice(d)}:\n${byDate[d].filter(r=>r.personId&&r.status!=="declined").map(r=>`• ${r.role||"Team"} — ${memberName(r.personId)}`).join("\n")}\nIf you can't make it, reply here and we'll arrange a swap. Thank you for serving!</div>`).join("")}</div>
   <div class="acts"><button class="btn" id="cancel">Close</button></div>`);
  $("#cancel").onclick = closeModal;
}
async function segmentCounts(){
  const [mem, vis, gif, teams] = await Promise.all([get("members"), get("visitors"), get("gifts"), get("teams")]);
  const cutoff = new Date(Date.now()-30*864e5).toISOString().slice(0,10);
  const segs = {
    "everyone": mem.length,
    "visitors last 30 days": vis.filter(v=>(v.visitDate||"")>=cutoff).length,
    "giving members": new Set(gif.map(g=>g.memberId).filter(Boolean)).size,
    "under 18s": mem.filter(m=>m.birthday && (new Date().getFullYear()-new Date(m.birthday).getFullYear())<18).length,
    "team leaders": new Set(teams.map(t=>t.leader).filter(Boolean)).size,
    "inactive members": mem.filter(m=>m.status==="inactive").length
  };
  openModal(`<h3>Segment counts</h3><div class="panel"><table><tbody>${Object.entries(segs).map(([k,v])=>`<tr><td>${k}</td><td style="text-align:right"><b>${v}</b></td></tr>`).join("")}</tbody></table></div>
  <div class="acts"><button class="btn" id="cancel">Close</button></div>`);
  $("#cancel").onclick = closeModal;
}

/* ---------------- audit ---------------- */
async function viewAudit(){
  const {rows} = await api("audit");
  $("#main").innerHTML = `<h1>Audit log</h1><p class="sub">Last ${rows.length} actions across the suite.</p>
   <div class="panel"><table><thead><tr><th>When</th><th>Who</th><th>Action</th><th>Module</th><th>Record</th></tr></thead><tbody>
   ${rows.map(a=>`<tr><td>${esc((a.at||"").replace("T"," ").slice(0,16))}</td><td>${esc(a.by)}</td><td>${esc(a.action)}</td><td>${esc(a.m||"")}</td><td class="badge">${esc(a.id||"")}</td></tr>`).join("")||`<tr><td colspan="5">No activity yet.</td></tr>`}</tbody></table></div>`;
}

/* ---------------- router ---------------- */
async function route(){
  const key = (location.hash||"#dashboard").slice(1);
  if(key==="dashboard") await viewDashboard();
  else if(key==="audit" && rank()>=3) await viewAudit();
  else if(byKey(key)) await viewModule(key);
  else await viewDashboard();
  paintNav();
}
async function boot(){
  try{
    const r = await fetch("/api/auth"); const j = await r.json();
    if(!j.user){ location.href = "/#admin"; return; }
    S.me = j.user;
    S.cache._members = await get("members").catch(()=>[]);
    paintNav(); await route();
    window.addEventListener("hashchange", route);
  }catch(e){
    $("#main").innerHTML = `<h1>Church Suite</h1><div class="notice err">${esc(e.message||"Couldn't load.")} <a href="/#admin">Sign in from the main admin page</a> and try again.</div>`;
  }
}
boot();
