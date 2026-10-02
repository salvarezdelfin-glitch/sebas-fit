"use strict";
/* ============================================================
   CLASES · bitácora de tus clases en estudios (antes "Clases Semanales")
   Horario fijo, clases dadas, tarifas, depósitos semanales / quincenales.
   Datos en Vault.data.clases = {schedule, rates, payinfo, entries}
   ============================================================ */
const DIAS=["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
const DIAS_ORDEN=["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
const MESES=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
const MESES_LARGO=["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
const STUDIOS=["EUPHORIA","SOHO","EJE","ALUNNA"];
const CL={day:null,wBack:0,qBack:0};
const CL_D=()=>Vault.data.clases;

const mxn=new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN",maximumFractionDigits:0});
function money(n){ return mxn.format(n||0); }
function pad(n){ return String(n).padStart(2,"0"); }
function toDateStr(d){ return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate()); }
function todayStr(){ return toDateStr(new Date()); }
function parseLocalDate(s){ const p=s.split("-"); return new Date(+p[0],+p[1]-1,+p[2]); }
function diaDeFecha(s){ return DIAS[parseLocalDate(s).getDay()]; }
function fmtCorto(s){ const d=parseLocalDate(s); return d.getDate()+" "+MESES[d.getMonth()]; }
function addDays(s,n){ const d=parseLocalDate(s); d.setDate(d.getDate()+n); return toDateStr(d); }

function mondayOf(s){ const d=parseLocalDate(s), dow=d.getDay(), diff=(dow===0?-6:1-dow); const m=new Date(d); m.setDate(d.getDate()+diff); return m; }
function weekKeyAndLabel(s){
  const mon=mondayOf(s), sun=new Date(mon); sun.setDate(mon.getDate()+6);
  return {key:toDateStr(mon),endKey:toDateStr(sun),
    label:"Semana del "+mon.getDate()+" "+MESES[mon.getMonth()]+" – "+sun.getDate()+" "+MESES[sun.getMonth()]+" "+sun.getFullYear()};
}
/* Ciclo semanal anclado al día de pago: los 7 días que terminan el día anterior al pago son lo que
   se deposita ese día. Ej. pago "Martes" → ciclo martes–lunes, depositado el martes siguiente. */
function weeklyCycleFor(s,paydayName,back){
  let payIdx=DIAS.indexOf(paydayName); if(payIdx===-1) payIdx=2;
  const d=parseLocalDate(s); d.setDate(d.getDate()-7*(back||0));
  const diff=(d.getDay()-payIdx+7)%7;
  const start=new Date(d); start.setDate(d.getDate()-diff);
  const end=new Date(start); end.setDate(start.getDate()+6);
  const dep=new Date(start); dep.setDate(start.getDate()+7);
  return {startStr:toDateStr(start),endStr:toDateStr(end),depositStr:toDateStr(dep)};
}
function shiftQuincena(s,n){
  const d=parseLocalDate(s), y=d.getFullYear(), m=d.getMonth(), half=d.getDate()<=15?0:1;
  const total=(y*12+m)*2+half-(n||0), mi=Math.floor(total/2), nh=((total%2)+2)%2;
  return new Date(Math.floor(mi/12),((mi%12)+12)%12,nh===0?1:16);
}
/* Quincena mexicana: 1–15 y 16–fin de mes */
function quincenaFor(s,back){
  const ref=back?shiftQuincena(s,back):parseLocalDate(s), y=ref.getFullYear(), m=ref.getMonth(), day=ref.getDate();
  let start,end;
  if(day<=15){ start=new Date(y,m,1); end=new Date(y,m,15); } else { start=new Date(y,m,16); end=new Date(y,m+1,0); }
  return {startStr:toDateStr(start),endStr:toDateStr(end),
    label:start.getDate()+" "+MESES[start.getMonth()]+" – "+end.getDate()+" "+MESES[end.getMonth()]+" "+end.getFullYear()};
}
function rateFor(entry,rates){
  if(entry.studio==="ALUNNA") return entry.attendance==="solo"?rates.ALUNNA_SOLO:rates.ALUNNA_GROUP;
  return rates[entry.studio]!=null?rates[entry.studio]:0;
}
function studioClass(s){ return STUDIOS.indexOf(s)!==-1?s:"OTHER"; }
function studioLabel(s){ return STUDIOS.indexOf(s)!==-1?(s.charAt(0)+s.slice(1).toLowerCase()):s; }
function stChip(s){ return `<span class="chip st st-${studioClass(s)}">${esc(s)}</span>`; }
const sumConf=list=>list.filter(e=>e.confirmado!==false).reduce((a,e)=>a+(e.amount||0),0);

/* ---------- vistas ---------- */
function viewClases(){
  if(!CL.day) CL.day=todayStr();
  const d=new Date(), lbl=DIAS[d.getDay()]+" "+d.getDate()+" de "+MESES_LARGO[d.getMonth()]+" de "+d.getFullYear();
  return `<div class="wrap">
    <header class="page-head"><span class="eyebrow">Panel de clases</span><h1>Clases</h1><p class="sub">${esc(lbl.charAt(0).toUpperCase()+lbl.slice(1))}</p></header>
    <section class="blk"><div class="tiles" id="cl-tiles">${clTiles()}</div></section>
    ${clBoardBlk()}
    <section class="blk"><div class="blk-head"><h2>Última rutina por estudio</h2><p>Para saber si repetir o cambiar</p></div><div class="grid-cards" id="cl-routines">${clRoutines()}</div></section>
    ${clPayInfoBlk()}
    ${clPayoutsBlk()}
    ${clCobrosBlk()}
    ${clDayBlk()}
    <section class="blk"><div class="blk-head"><h2>Bitácora</h2><p>Agrupada por semana, más reciente primero</p></div><div id="cl-entries">${clEntriesHtml()}</div></section>
  </div>`;
}

function clTiles(){
  const C=CL_D(), today=todayStr(), wk=weekKeyAndLabel(today), q=quincenaFor(today,0), mp=today.slice(0,7);
  const E=C.entries;
  const wkE=E.filter(e=>e.date>=wk.key&&e.date<=wk.endKey), qE=E.filter(e=>e.date>=q.startStr&&e.date<=q.endStr), mE=E.filter(e=>e.date&&e.date.slice(0,7)===mp);
  const tot=l=>{ const c=l.filter(e=>e.confirmado!==false); return {n:c.length,pend:l.length-c.length,pay:sumConf(l)}; };
  const w=tot(wkE), qt=tot(qE), m=tot(mE);
  const brk=l=>{ const by={}; l.forEach(e=>{ if(e.confirmado!==false) by[e.studio]=(by[e.studio]||0)+(e.amount||0); });
    return Object.keys(by).sort((a,b)=>(STUDIOS.indexOf(a)<0?99:STUDIOS.indexOf(a))-(STUDIOS.indexOf(b)<0?99:STUDIOS.indexOf(b))).map(s=>studioLabel(s)+" "+money(by[s])).join(" · "); };
  const pend=p=>p?p+" pendiente(s) de confirmar":"";
  const pt=(typeof ptIngresosMes==="function")?ptIngresosMes():0;
  const rec=cbRecibidoEnMes(mp), porCobrar=cbPendientes().reduce((s,x)=>s+x.est,0);
  return tile("Clases · semana (lun–dom)",w.n,pend(w.pend))+tile("Pago estimado · semana",money(w.pay),"",1)+
    tile("Clases · quincena",qt.n,pend(qt.pend))+tile("Pago estimado · quincena",money(qt.pay),brk(qE),1)+
    tile("Clases · mes",m.n,pend(m.pend))+tile("Pago estimado · mes",money(m.pay),brk(mE),1)+
    tile("Recibido · este mes",money(rec),"lo que ya te depositaron",1)+
    tile("Por cobrar",money(porCobrar),porCobrar?"períodos cerrados sin marcar como cobrados":"todo al día",1)+
    (pt?tile("Personal trainer · mes",money(pt),"pagos de clientes registrados",1):"");
}
function tile(label,value,foot,isMoney){
  return `<div class="tile"><div class="label">${esc(label)}</div><div class="value num${isMoney?" money":""}">${value}</div>${foot?`<div class="foot">${esc(foot)}</div>`:""}</div>`;
}
function clBoardBlk(){
  const by={}; DIAS_ORDEN.forEach(d=>by[d]=[]); CL_D().schedule.forEach(s=>{ if(by[s.day]) by[s.day].push(s); });
  const cols=DIAS_ORDEN.map(d=>{
    const sl=by[d].sort((a,b)=>a.time.localeCompare(b.time)).map(s=>`<div class="slot st-${studioClass(s.studio)}"><span class="t num">${esc(s.time)}</span><span class="s">${esc(s.studio)}</span></div>`).join("")||`<div class="board-note">Libre</div>`;
    return `<div class="day-col"><h3>${d}</h3>${sl}</div>`;
  }).join("");
  return `<section class="blk"><div class="blk-head"><h2>Horario fijo</h2><button class="link-btn" data-action="go" data-screen="ajustes">editar horario →</button></div><div class="board-scroll"><div class="board">${cols}</div></div></section>`;
}
function clRoutines(){
  const latest={};
  CL_D().entries.forEach(e=>{ if(!e.rutina&&!e.playlist) return; const k=e.date+" "+(e.time||"00:00"), c=latest[e.studio]; if(!c||k>(c.date+" "+(c.time||"00:00"))) latest[e.studio]=e; });
  return STUDIOS.map(s=>{ const e=latest[s];
    if(!e) return `<div class="mini-card">${stChip(s)}<p class="hint">Sin rutina registrada aún.</p></div>`;
    return `<div class="mini-card">${stChip(s)}<p class="strong">${esc(e.rutina||"—")}</p>${e.playlist?`<p class="hint">🎵 ${esc(e.playlist)}</p>`:""}<p class="date-lbl">${fmtCorto(e.date)}</p></div>`;
  }).join("");
}
function clPayInfoBlk(){
  const P=CL_D().payinfo;
  const cards=P.map(p=>`<div class="mini-card">${stChip(p.studio)}<span class="freq ${p.frequency==="semanal"?"sem":"qui"}">${p.frequency==="semanal"?"Semanal":"Quincenal"}</span>${p.note?`<p class="hint">${esc(p.note)}</p>`:""}</div>`).join("")||`<p class="hint">Sin información de pago registrada. Agrégala en Ajustes.</p>`;
  return `<section class="blk"><div class="blk-head"><div><h2>Forma de pago</h2><p>Para no confundirte con los días de pago</p></div><button class="link-btn" data-action="go" data-screen="ajustes">editar →</button></div><div class="grid-cards">${cards}</div></section>`;
}
function payoutCard(chips,count,total,range,pending,needsPayday,sub,cobro){
  const ch=Array.isArray(chips)?`<div class="pc-chips">${chips.map(stChip).join("")}</div>`:stChip(chips);
  return `<div class="payout-card">${ch}<div class="pc-lbl">Esperado</div><div class="payout-amount num">${money(total)}</div>
    <div class="hint">${count} clase${count===1?"":"s"}${sub?" · "+sub:""}</div><div class="payout-range">${esc(range)}</div>
    ${pending?`<div class="warn-txt">${pending} pendiente(s) sin confirmar — no incluida(s)</div>`:""}
    ${needsPayday?`<div class="warn-txt">Configura el día de pago en Ajustes para un cálculo exacto</div>`:""}
    ${cobro||""}</div>`;
}

/* ---------- cobros: lo que realmente recibí ----------
   Cada semana (por estudio) y cada quincena se puede marcar como cobrada con el monto real.
   Se compara contra lo esperado y se lleva la cuenta de lo recibido y de lo que falta por cobrar. */
function cbList(){ const C=CL_D(); if(!Array.isArray(C.cobros)) C.cobros=[]; return C.cobros; }
function cbKey(tipo,studio,start){ return tipo==="Q"?"Q|"+start:"W|"+studio+"|"+start; }
function cbGet(key){ return cbList().find(c=>c.id===key); }
function cbQuincenalStudios(){ return CL_D().payinfo.filter(p=>p.frequency!=="semanal").map(p=>p.studio); }
function cbEstimate(tipo,studio,start,end){
  const E=CL_D().entries;
  if(tipo==="W") return sumConf(E.filter(e=>e.studio===studio&&e.date>=start&&e.date<=end));
  const qs=cbQuincenalStudios(); return sumConf(E.filter(e=>qs.includes(e.studio)&&e.date>=start&&e.date<=end));
}
function cbDiffHtml(rec,est){
  const d=rec-est; if(!d) return `<span class="diff ok">justo lo esperado</span>`;
  return `<span class="diff ${d<0?"neg":"pos"}">${d<0?"faltan ":"sobran "}${money(Math.abs(d))}</span>`;
}
function cbPeriodLabel(c){
  if(c.tipo==="Q"){ const q=quincenaFor(c.start,0); return "Quincena "+q.label; }
  return "Semana "+fmtCorto(c.start)+" – "+fmtCorto(c.end);
}
function cbRow(tipo,studio,start,end,defDate){
  const key=cbKey(tipo,studio,start), c=cbGet(key), est=cbEstimate(tipo,studio,start,end);
  if(c) return `<div class="cb done"><div class="cb-main">✔ Recibido <b class="num">${money(c.recibido)}</b> <span class="hint">el ${fmtCorto(c.fecha)}</span> ${cbDiffHtml(c.recibido,est)}</div><button class="link-btn" data-action="cl-cobro-del" data-id="${esc(key)}">deshacer</button></div>`;
  const t=todayStr(), fecha=defDate&&defDate<t?defDate:t;
  return `<div class="cb"><label class="mini">¿Cuánto recibiste?</label>
    <div class="cb-inputs"><input class="inp" type="number" inputmode="decimal" data-cb="amt" value="${est}" aria-label="Monto recibido"><input class="inp" type="date" data-cb="fecha" value="${fecha}" aria-label="Fecha en que lo recibiste">
    <button class="btn sm" data-action="cl-cobro-save" data-tipo="${tipo}" data-studio="${esc(studio||"")}" data-start="${start}" data-end="${end}">Marcar cobrado</button></div></div>`;
}
/* períodos ya cerrados con clases confirmadas que todavía no marcas como cobrados */
function cbPendientes(){
  const C=CL_D(), today=todayStr(), out=[];
  C.payinfo.filter(p=>p.frequency==="semanal").forEach(p=>{
    for(let b=1;b<=12;b++){ const cy=weeklyCycleFor(today,p.payday||"Martes",b); if(cy.endStr>=today) continue;
      const est=cbEstimate("W",p.studio,cy.startStr,cy.endStr);
      if(est>0&&!cbGet(cbKey("W",p.studio,cy.startStr))) out.push({tipo:"W",studio:p.studio,start:cy.startStr,end:cy.endStr,est,def:cy.depositStr}); } });
  if(cbQuincenalStudios().length){
    for(let b=1;b<=8;b++){ const q=quincenaFor(today,b), est=cbEstimate("Q",null,q.startStr,q.endStr);
      if(est>0&&!cbGet(cbKey("Q",null,q.startStr))) out.push({tipo:"Q",studio:null,start:q.startStr,end:q.endStr,est,def:addDays(q.endStr,1)}); } }
  return out.sort((a,b)=>a.end<b.end?1:-1);
}
function cbRecibidoEnMes(mp){ return cbList().filter(c=>c.fecha&&c.fecha.slice(0,7)===mp).reduce((s,c)=>s+(c.recibido||0),0); }
function clCobrosBlk(){ return `<section class="blk"><div class="blk-head"><div><h2>Lo que he recibido</h2><p>Marca cada semana y cada quincena cuando te depositen — así sabes cuánto entró y qué falta</p></div></div><div id="cl-cobros">${clCobrosHtml()}</div></section>`; }
function clCobrosHtml(){
  const L=cbList().slice().sort((a,b)=>(b.fecha||"")<(a.fecha||"")?-1:(b.fecha||"")>(a.fecha||"")?1:0), pend=cbPendientes(), mp=todayStr().slice(0,7);
  const prev=toDateStr(new Date(new Date().getFullYear(),new Date().getMonth()-1,1)).slice(0,7);
  const porCobrar=pend.reduce((s,x)=>s+x.est,0);
  const resumen=`<div class="tiles tiles-3"><div class="tile"><div class="label">Recibido este mes</div><div class="value num money">${money(cbRecibidoEnMes(mp))}</div></div>
    <div class="tile"><div class="label">Recibido el mes pasado</div><div class="value num">${money(cbRecibidoEnMes(prev))}</div></div>
    <div class="tile"><div class="label">Por cobrar / sin marcar</div><div class="value num ${porCobrar?"warn-num":""}">${money(porCobrar)}</div><div class="foot">${pend.length} período(s) cerrado(s)</div></div></div>`;
  const pendHtml=pend.length?`<div class="sub-head"><h3>Por marcar como cobrado</h3></div><div class="grid-cards">${pend.map(x=>`<div class="payout-card">${x.tipo==="Q"?stChip("QUINCENAL"):stChip(x.studio)}<div class="pc-lbl">Esperado</div><div class="payout-amount num">${money(x.est)}</div><div class="payout-range">${esc(cbPeriodLabel(x))}</div>${cbRow(x.tipo,x.studio,x.start,x.end,x.def)}</div>`).join("")}</div>`:"";
  let hist="", cur="";
  L.forEach(c=>{ const m=(c.fecha||"").slice(0,7);
    if(m!==cur){ cur=m; const [y,mo]=m.split("-"); hist+=`<div class="week-head"><strong>${MESES_LARGO[(+mo||1)-1]} ${y}</strong><span>recibido ${money(cbRecibidoEnMes(m))}</span></div>`; }
    const est=cbEstimate(c.tipo,c.studio,c.start,c.end);
    hist+=`<div class="cb-row"><div class="cb-who">${c.tipo==="Q"?stChip("QUINCENAL"):stChip(c.studio)}<span class="hint">${esc(cbPeriodLabel(c))}</span></div>
      <div class="cb-est hint">esperado ${money(est)}</div>
      <input class="inp w-amount" type="number" inputmode="decimal" data-action="cl-cobro-edit" data-id="${esc(c.id)}" data-f="recibido" value="${c.recibido||0}" aria-label="Monto recibido">
      <input class="inp w-date" type="date" data-action="cl-cobro-edit" data-id="${esc(c.id)}" data-f="fecha" value="${c.fecha||""}" aria-label="Fecha">
      ${cbDiffHtml(c.recibido||0,est)}<button class="del" data-action="cl-cobro-del" data-id="${esc(c.id)}" aria-label="Quitar cobro">✕</button></div>`; });
  return resumen+pendHtml+`<div class="sub-head"><h3>Historial de lo recibido</h3></div>`+(hist?`<div class="cb-list">${hist}</div>`:`<p class="hint">Aún no has marcado ningún cobro. Usa "Marcar cobrado" en las tarjetas de Depósitos.</p>`);
}
function clPayoutsBlk(){ return `<section class="blk"><div class="blk-head"><div><h2>Depósitos</h2><p>Cuánto te van a depositar — y cuánto te depositaron antes</p></div></div><div id="cl-payouts">${clPayoutsHtml()}</div></section>`; }
function clPayoutsHtml(){
  const C=CL_D(), today=todayStr(), E=C.entries;
  const wk=C.payinfo.filter(p=>p.frequency==="semanal"), qq=C.payinfo.filter(p=>p.frequency!=="semanal");
  let wh="";
  wk.forEach(p=>{
    const cy=weeklyCycleFor(today,p.payday||"Martes",CL.wBack);
    const inC=E.filter(e=>e.studio===p.studio&&e.date>=cy.startStr&&e.date<=cy.endStr), conf=inC.filter(e=>e.confirmado!==false);
    const range="Semana "+fmtCorto(cy.startStr)+" – "+fmtCorto(cy.endStr)+(CL.wBack>0?" · depositado ":" → depósito ")+fmtCorto(cy.depositStr);
    wh+=payoutCard(p.studio,conf.length,sumConf(inC),range,inC.length-conf.length,!p.payday,"",cbRow("W",p.studio,cy.startStr,cy.endStr,cy.depositStr));
  });
  const wLabel=CL.wBack===0?"Semana actual":CL.wBack===1?"Semana pasada":"Hace "+CL.wBack+" semanas";
  let qh="";
  if(qq.length){
    const q=quincenaFor(today,CL.qBack); let tot=0,cnt=0,pend=0; const parts=[];
    qq.forEach(p=>{ const l=E.filter(e=>e.studio===p.studio&&e.date>=q.startStr&&e.date<=q.endStr), c=l.filter(e=>e.confirmado!==false), sub=sumConf(l);
      tot+=sub; cnt+=c.length; pend+=l.length-c.length; if(l.length) parts.push(studioLabel(p.studio)+" "+money(sub)); });
    qh=payoutCard(qq.map(p=>p.studio),cnt,tot,q.label,pend,false,parts.join(" · "),cbRow("Q",null,q.startStr,q.endStr,addDays(q.endStr,1)));
  }
  const qLabel=CL.qBack===0?"Quincena actual":CL.qBack===1?"Quincena pasada":"Hace "+CL.qBack+" quincenas";
  // total del periodo actual (sin importar qué semana/quincena se esté viendo arriba)
  let grand=0,pendT=0; const parts=[];
  wk.forEach(p=>{ const cy=weeklyCycleFor(today,p.payday||"Martes",0), l=E.filter(e=>e.studio===p.studio&&e.date>=cy.startStr&&e.date<=cy.endStr), t=sumConf(l);
    pendT+=l.length-l.filter(e=>e.confirmado!==false).length; if(l.length){ grand+=t; parts.push(studioLabel(p.studio)+" "+money(t)); } });
  if(qq.length){ const q=quincenaFor(today,0); let t=0,has=false;
    qq.forEach(p=>{ const l=E.filter(e=>e.studio===p.studio&&e.date>=q.startStr&&e.date<=q.endStr); t+=sumConf(l); pendT+=l.length-l.filter(e=>e.confirmado!==false).length; if(l.length) has=true; });
    if(has){ grand+=t; parts.push("Quincenales "+money(t)); } }
  return `<div class="sub-head"><h3>Semanales</h3><div class="pager"><button class="pg" data-action="cl-wprev" aria-label="semana anterior">←</button><span>${wLabel}</span><button class="pg" data-action="cl-wnext" ${CL.wBack<=0?"disabled":""} aria-label="semana siguiente">→</button></div></div>
    <div class="grid-cards">${wh||`<p class="hint">Agrega un estudio semanal en Ajustes → Forma de pago para ver sus depósitos.</p>`}</div>
    <div class="sub-head"><h3>Quincenales (combinado)</h3><div class="pager"><button class="pg" data-action="cl-qprev" aria-label="quincena anterior">←</button><span>${qLabel}</span><button class="pg" data-action="cl-qnext" ${CL.qBack<=0?"disabled":""} aria-label="quincena siguiente">→</button></div></div>
    <div class="grid-cards">${qh||`<p class="hint">Agrega un estudio quincenal en Ajustes → Forma de pago para ver el combinado.</p>`}</div>
    <div class="payout-total"><div class="pt-label">Total combinado — lo que vas a recibir (semana + quincena en curso)</div><div class="pt-amount num">${money(grand)}</div>
      ${parts.length?`<div class="pt-sub">${parts.map(esc).join(" · ")}${pendT?" · "+pendT+" pendiente(s) sin confirmar, no incluidas":""}</div>`:""}</div>`;
}

/* ---------- editor del día ---------- */
function clFixedMatch(dayEntries,slot,used){ return dayEntries.find(e=>!used[e.id]&&e.studio===slot.studio&&e.time===slot.time&&e.tipo==="propia"); }
function clDayBlk(){ return `<section class="blk"><div class="blk-head"><h2>Editor del día</h2><p>Marca lo que diste — se guarda al instante</p></div><div class="card" id="cl-day">${clDayHtml()}</div></section>`; }
function clDayHtml(){
  const C=CL_D(), wd=diaDeFecha(CL.day);
  const fixed=C.schedule.filter(s=>s.day===wd).sort((a,b)=>a.time.localeCompare(b.time));
  const dayE=C.entries.filter(e=>e.date===CL.day), used={};
  const nav=`<div class="day-nav"><button class="pg" data-action="cl-dayprev" aria-label="día anterior">←</button>
    <input type="date" class="inp w-auto" data-action="cl-dayset" value="${CL.day}"><span class="weekday">${wd}</span>
    <button class="pg" data-action="cl-daynext" aria-label="día siguiente">→</button>${CL.day!==todayStr()?`<button class="btn sm ghost" data-action="cl-daytoday">Hoy</button>`:""}</div>`;
  const fx=fixed.map(s=>{
    const m=clFixedMatch(dayE,s,used); if(m) used[m.id]=1;
    const amt=m?m.amount:rateFor({studio:s.studio,attendance:"grupo"},C.rates);
    const det=m?`<div class="check-details">
        ${s.studio==="ALUNNA"?`<select class="inp w-sel" data-action="cl-f" data-id="${m.id}" data-f="attendance"><option value="grupo" ${m.attendance!=="solo"?"selected":""}>Grupo</option><option value="solo" ${m.attendance==="solo"?"selected":""}>1 persona</option></select>`:""}
        <input class="inp mini" list="dl-rutinas" placeholder="Rutina (ej. Sculpt 11)" data-action="cl-t" data-id="${m.id}" data-f="rutina" value="${esc(m.rutina||"")}">
        <input class="inp mini" list="dl-playlists" placeholder="Playlist" data-action="cl-t" data-id="${m.id}" data-f="playlist" value="${esc(m.playlist||"")}">
        ${state.routine?`<button class="btn sm ghost" data-action="cl-userutina" data-id="${m.id}" title="Poner el nombre de la rutina que tienes abierta">Usar rutina actual</button>`:""}
        ${m.confirmado===false?`<span class="status pending">pendiente</span><button class="btn sm" data-action="cl-confirm" data-id="${m.id}">Confirmar</button>`:""}
      </div>`:"";
    return `<div class="check-row-wrap"><label class="check-row"><input type="checkbox" data-action="cl-fixed" data-slot="${s.id}" ${m?"checked":""}>${stChip(s.studio)}<span class="time num">${esc(s.time)}</span><span class="amount num">${money(amt)}</span></label>${det}</div>`;
  }).join("")||`<p class="hint">Sin horario fijo este día.</p>`;
  const extras=dayE.filter(e=>!used[e.id]).map(clExtraRow).join("")||`<p class="hint">Sin clases extra registradas este día.</p>`;
  const conf=dayE.filter(e=>e.confirmado!==false), pend=dayE.length-conf.length;
  const total=dayE.length?`Total del día: <strong>${conf.length} clase${conf.length===1?"":"s"}</strong> · <strong class="num">${money(sumConf(dayE))}</strong>${pend?" · "+pend+" pendiente(s) sin confirmar":""} — se suma a tu pago de la semana y del mes.`:"Sin clases registradas este día todavía.";
  return `${nav}<div id="cl-fixed">${fx}</div>
    <div class="extra-head"><h3>Clases extra / suplencias ese día</h3><button class="btn sm ghost" data-action="cl-extra-add">+ agregar clase extra</button></div>
    <p class="hint" style="margin:-2px 0 10px">El estudio de una clase extra es texto libre — escribe el nombre si suples en un estudio donde no eres coach fijo.</p>
    <div id="cl-extras">${extras}</div>
    <datalist id="dl-studios">${STUDIOS.map(s=>`<option value="${s}">`).join("")}</datalist>
    <datalist id="dl-rutinas">${clRutinaOpts()}</datalist>
    <datalist id="dl-playlists">${(state.playlists||[]).map(p=>`<option value="${esc(p.nom)}">`).join("")}</datalist>
    <div class="day-total">${total}</div>`;
}
function clRutinaOpts(){
  const names=[]; (state.saved||[]).forEach(r=>{ if(r.nombre&&!names.includes(r.nombre)) names.push(r.nombre); });
  if(state.routine&&state.routine.nombre&&!names.includes(state.routine.nombre)) names.unshift(state.routine.nombre);
  return names.map(n=>`<option value="${esc(n)}">`).join("");
}
function clExtraRow(e){
  const f=(label,cls,inner)=>`<div class="mini-field ${cls}"><label>${label}</label>${inner}</div>`;
  return `<div class="extra-row" data-id="${e.id}">
    ${f("Estudio","w-studio",`<input class="inp" list="dl-studios" placeholder="Nombre del estudio" data-action="cl-f" data-id="${e.id}" data-f="studio" value="${esc(e.studio||"")}">`)}
    ${f("Hora","w-time",`<input class="inp" type="time" data-action="cl-f" data-id="${e.id}" data-f="time" value="${e.time||""}">`)}
    ${f("Tipo","w-tipo",`<select class="inp" data-action="cl-f" data-id="${e.id}" data-f="tipo"><option value="propia" ${e.tipo==="propia"?"selected":""}>Propia</option><option value="suplencia" ${e.tipo==="suplencia"?"selected":""}>Suplencia</option></select>`)}
    ${e.studio==="ALUNNA"?f("Asistencia","w-tipo",`<select class="inp" data-action="cl-f" data-id="${e.id}" data-f="attendance"><option value="grupo" ${e.attendance!=="solo"?"selected":""}>Grupo</option><option value="solo" ${e.attendance==="solo"?"selected":""}>1 persona</option></select>`):""}
    ${f("Monto","w-amount",`<input class="inp" type="number" inputmode="decimal" data-action="cl-f" data-id="${e.id}" data-f="amount" value="${e.amount||0}">`)}
    ${f("Rutina","w-text",`<input class="inp" list="dl-rutinas" placeholder="ej. Sculpt 11" data-action="cl-t" data-id="${e.id}" data-f="rutina" value="${esc(e.rutina||"")}">`)}
    ${f("Playlist","w-text",`<input class="inp" list="dl-playlists" placeholder="nombre" data-action="cl-t" data-id="${e.id}" data-f="playlist" value="${esc(e.playlist||"")}">`)}
    <label class="check"><input type="checkbox" data-action="cl-f" data-id="${e.id}" data-f="confirmado" ${e.confirmado!==false?"checked":""}> confirmada</label>
    ${f("Nota","w-nota",`<input class="inp" placeholder="opcional" data-action="cl-t" data-id="${e.id}" data-f="nota" value="${esc(e.nota||"")}">`)}
    <button class="del" data-action="cl-del" data-id="${e.id}" title="eliminar" aria-label="Eliminar clase">✕</button></div>`;
}
function clEntriesHtml(){
  const E=CL_D().entries;
  if(!E.length) return `<div class="empty">Aún no hay clases registradas. Marca una en el editor del día.</div>`;
  const sorted=E.slice().sort((a,b)=>a.date!==b.date?(a.date<b.date?1:-1):((b.time||"")<(a.time||"")?-1:(b.time||"")>(a.time||"")?1:0));
  const groups={}, order=[];
  sorted.forEach(e=>{ if(!e.date) return; const wk=weekKeyAndLabel(e.date); if(!groups[wk.key]){ groups[wk.key]={label:wk.label,items:[]}; order.push(wk.key); } groups[wk.key].items.push(e); });
  return order.map(k=>{ const g=groups[k], conf=g.items.filter(e=>e.confirmado!==false);
    return `<div class="week-group"><div class="week-head"><strong>${g.label}</strong><span>${conf.length} clase(s) confirmada(s) · ${money(sumConf(g.items))}</span></div>
      <div class="rows-scroll"><div class="rows">${g.items.map(clEntryRow).join("")}</div></div></div>`; }).join("");
}
function clEntryRow(e){
  const ok=e.confirmado!==false, info=[];
  if(e.rutina) info.push("Rutina: "+esc(e.rutina)); if(e.playlist) info.push("🎵 "+esc(e.playlist)); if(e.nota) info.push(esc(e.nota));
  return `<div class="row"><button class="date-btn" data-action="cl-goday" data-date="${e.date}" title="Abrir este día en el editor">${fmtCorto(e.date)}</button>
    ${stChip(e.studio)}<span class="time num">${e.time||"—"}</span>
    <span class="type"><span class="badge ${e.tipo==="suplencia"?"sup":"pro"}">${e.tipo==="suplencia"?"Suplencia":"Propia"}</span></span>
    <span class="amount">${money(e.amount)}</span>
    <button class="status-btn" data-action="cl-confirm-toggle" data-id="${e.id}"><span class="status ${ok?"ok":"pending"}">${ok?"confirmada":"pendiente"}</span></button>
    <button class="del" data-action="cl-del" data-id="${e.id}" title="eliminar" aria-label="Eliminar clase">✕</button>
    ${info.length?`<div class="row-note">${info.join(" · ")}</div>`:""}</div>`;
}

/* ---------- ajustes de Clases (se muestran dentro de la pantalla Ajustes) ---------- */
function clSettingsHtml(){
  const C=CL_D(), r=C.rates, byDay={}; DIAS_ORDEN.forEach(d=>byDay[d]=[]); C.schedule.forEach(s=>{ if(byDay[s.day]) byDay[s.day].push(s); });
  const slots=DIAS_ORDEN.map(d=>byDay[d].sort((a,b)=>a.time.localeCompare(b.time)).map(s=>`<div class="slot-edit-row"><strong style="width:84px">${d}</strong>${stChip(s.studio)}<span class="time num">${esc(s.time)}</span><button class="del" data-action="cl-slot-del" data-id="${s.id}" aria-label="Eliminar horario">✕</button></div>`).join("")).join("")||`<p class="hint">Sin horarios fijos.</p>`;
  const rate=(id,lbl,v)=>`<div><label class="mini">${lbl}</label><input class="inp" type="number" inputmode="decimal" id="${id}" value="${v||0}"></div>`;
  const pay=C.payinfo.map(p=>`<div class="payinfo-row" data-id="${p.id}">
      <input class="inp" list="dl-studios" data-action="cl-p" data-id="${p.id}" data-f="studio" value="${esc(p.studio)}">
      <select class="inp" data-action="cl-p" data-id="${p.id}" data-f="frequency"><option value="semanal" ${p.frequency==="semanal"?"selected":""}>Semanal</option><option value="quincenal" ${p.frequency==="quincenal"?"selected":""}>Quincenal</option></select>
      <select class="inp" data-action="cl-p" data-id="${p.id}" data-f="payday" title="Día de pago (para el depósito semanal)"><option value="">Sin día de pago</option>${DIAS_ORDEN.map(d=>`<option ${p.payday===d?"selected":""}>${d}</option>`).join("")}</select>
      <input class="inp" placeholder="nota (ej. paga los martes)" data-action="cl-p" data-id="${p.id}" data-f="note" value="${esc(p.note||"")}">
      <button class="del" data-action="cl-pay-del" data-id="${p.id}" aria-label="Eliminar estudio">✕</button></div>`).join("")||`<p class="hint">Sin estudios registrados.</p>`;
  return `<div class="set-block"><h3>Tarifas por clase (MXN)</h3>
      <div class="form-grid g3">${rate("r-EUPHORIA","EUPHORIA",r.EUPHORIA)}${rate("r-SOHO","SOHO",r.SOHO)}${rate("r-EJE","EJE",r.EJE)}${rate("r-ALUNNA_SOLO","Alunna (1 persona)",r.ALUNNA_SOLO)}${rate("r-ALUNNA_GROUP","Alunna (grupo)",r.ALUNNA_GROUP)}</div>
      <div class="acts-end"><button class="btn" data-action="cl-rates-save">Guardar tarifas</button></div>
      <p class="hint">Las clases ya registradas conservan el monto con el que se guardaron.</p></div>
    <div class="set-block"><h3>Horario fijo semanal</h3><div class="slot-list">${slots}</div>
      <div class="form-grid g4" style="margin-top:12px">
        <div><label class="mini">Día</label><select class="inp" id="s-day">${DIAS_ORDEN.map(d=>`<option>${d}</option>`).join("")}</select></div>
        <div><label class="mini">Estudio</label><input class="inp" id="s-studio" list="dl-studios" value="EUPHORIA"></div>
        <div><label class="mini">Hora</label><input class="inp" id="s-time" type="time"></div>
        <div><label class="mini">&nbsp;</label><button class="btn ghost" style="width:100%" data-action="cl-slot-add">+ agregar horario</button></div></div></div>
    <div class="set-block"><h3>Forma de pago por estudio</h3><div>${pay}</div>
      <div class="form-grid g4" style="margin-top:12px">
        <div><label class="mini">Estudio</label><input class="inp" id="p-studio" list="dl-studios" placeholder="Nombre del estudio"></div>
        <div><label class="mini">Frecuencia</label><select class="inp" id="p-freq"><option value="semanal">Semanal</option><option value="quincenal">Quincenal</option></select></div>
        <div><label class="mini">Día de pago</label><select class="inp" id="p-payday"><option value="">Sin definir</option>${DIAS_ORDEN.map(d=>`<option ${d==="Martes"?"selected":""}>${d}</option>`).join("")}</select></div>
        <div><label class="mini">&nbsp;</label><button class="btn ghost" style="width:100%" data-action="cl-pay-add">+ agregar estudio</button></div>
        <div class="full" style="grid-column:1/-1"><label class="mini">Nota</label><input class="inp" id="p-note" placeholder="ej. paga los martes"></div></div></div>
    <datalist id="dl-studios">${STUDIOS.map(s=>`<option value="${s}">`).join("")}</datalist>`;
}

/* ---------- acciones ---------- */
function clRefreshLists(){
  const set=(id,h)=>{ const el=document.getElementById(id); if(el) el.innerHTML=h; };
  set("cl-tiles",clTiles()); set("cl-routines",clRoutines()); set("cl-entries",clEntriesHtml()); set("cl-payouts",clPayoutsHtml()); set("cl-cobros",clCobrosHtml());
}
function clFind(id){ return CL_D().entries.find(e=>e.id===id); }
function clNewEntry(o){
  const C=CL_D(), e=Object.assign({id:newId("e"),date:CL.day,day:diaDeFecha(CL.day),studio:"SOHO",time:null,tipo:"suplencia",attendance:null,amount:0,
    nota:"",rutina:"",playlist:"",confirmado:true,auto:true,createdAt:nowISO()},o||{});
  e.day=diaDeFecha(e.date);
  if(e.auto) e.amount=rateFor(e,C.rates);
  C.entries.push(e); touch(); return e;
}
function clDelEntry(id){
  const C=CL_D(), i=C.entries.findIndex(e=>e.id===id); if(i<0) return;
  const [e]=C.entries.splice(i,1); touch(); render();
  toastUndo("Clase eliminada",()=>{ C.entries.splice(Math.min(i,C.entries.length),0,e); touch(); render(); });
}
/* asigna una rutina a una clase del horario (la crea pendiente si es futura) — se usa desde la vista Rutina */
function clAsignarRutina(date,slotId,rutinaNombre){
  const C=CL_D(), s=C.schedule.find(x=>x.id===slotId); if(!s) return null;
  let e=C.entries.find(x=>x.date===date&&x.studio===s.studio&&x.time===s.time&&x.tipo==="propia");
  if(!e){ const prev=CL.day; CL.day=date; e=clNewEntry({studio:s.studio,time:s.time,tipo:"propia",attendance:s.studio==="ALUNNA"?"grupo":null,confirmado:date<=todayStr()}); CL.day=prev; }
  e.rutina=rutinaNombre; touch(); return e;
}
function clClick(a,t){
  const C=CL_D();
  if(a==="cl-dayprev"){ CL.day=addDays(CL.day,-1); render(); return true; }
  if(a==="cl-daynext"){ CL.day=addDays(CL.day,1); render(); return true; }
  if(a==="cl-daytoday"){ CL.day=todayStr(); render(); return true; }
  if(a==="cl-goday"){ CL.day=t.dataset.date; render(); const el=document.getElementById("cl-day"); if(el) el.scrollIntoView({behavior:"smooth",block:"start"}); return true; }
  if(a==="cl-wprev"){ CL.wBack++; clRefreshLists(); return true; }
  if(a==="cl-wnext"){ if(CL.wBack>0) CL.wBack--; clRefreshLists(); return true; }
  if(a==="cl-qprev"){ CL.qBack++; clRefreshLists(); return true; }
  if(a==="cl-qnext"){ if(CL.qBack>0) CL.qBack--; clRefreshLists(); return true; }
  if(a==="cl-extra-add"){ clNewEntry({}); render(); return true; }
  if(a==="cl-del"){ clDelEntry(t.dataset.id); return true; }
  if(a==="cl-confirm"||a==="cl-confirm-toggle"){ const e=clFind(t.dataset.id); if(e){ e.confirmado=e.confirmado===false; touch(); render(); } return true; }
  if(a==="cl-userutina"){ const e=clFind(t.dataset.id); if(e&&state.routine){ e.rutina=state.routine.nombre; touch(); render(); } return true; }
  if(a==="cl-cobro-save"){
    const box=t.closest(".cb"), amt=Number(box.querySelector('[data-cb="amt"]').value), fecha=box.querySelector('[data-cb="fecha"]').value||todayStr();
    if(!(amt>=0)||box.querySelector('[data-cb="amt"]').value===""){ toast("Escribe cuánto recibiste"); return true; }
    const d=t.dataset, key=cbKey(d.tipo,d.studio,d.start);
    if(!cbGet(key)) cbList().push({id:key,tipo:d.tipo,studio:d.tipo==="Q"?null:d.studio,start:d.start,end:d.end,recibido:amt,fecha,creado:nowISO()});
    touch(); clRefreshLists(); toast("Cobro registrado · "+money(amt)); return true; }
  if(a==="cl-cobro-del"){
    const L=cbList(), i=L.findIndex(c=>c.id===t.dataset.id); if(i<0) return true; const [c]=L.splice(i,1); touch(); clRefreshLists();
    toastUndo("Cobro quitado",()=>{ L.splice(Math.min(i,L.length),0,c); touch(); clRefreshLists(); }); return true; }
  if(a==="cl-rates-save"){
    ["EUPHORIA","SOHO","EJE","ALUNNA_SOLO","ALUNNA_GROUP"].forEach(k=>{ C.rates[k]=Number(document.getElementById("r-"+k).value)||0; });
    touch(); toast("Tarifas guardadas"); return true; }
  if(a==="cl-slot-add"){
    const time=document.getElementById("s-time").value, studio=document.getElementById("s-studio").value.trim();
    if(!time||!studio){ toast("Falta la hora o el estudio"); return true; }
    C.schedule.push({id:newId("s"),day:document.getElementById("s-day").value,studio,time}); touch(); render(); return true; }
  if(a==="cl-slot-del"){
    const i=C.schedule.findIndex(s=>s.id===t.dataset.id); if(i<0) return true; const [s]=C.schedule.splice(i,1); touch(); render();
    toastUndo("Horario eliminado",()=>{ C.schedule.splice(Math.min(i,C.schedule.length),0,s); touch(); render(); }); return true; }
  if(a==="cl-pay-add"){
    const studio=document.getElementById("p-studio").value.trim(); if(!studio){ toast("Escribe el estudio"); return true; }
    C.payinfo.push({id:newId("p"),studio,frequency:document.getElementById("p-freq").value,payday:document.getElementById("p-payday").value,note:document.getElementById("p-note").value.trim()});
    touch(); render(); return true; }
  if(a==="cl-pay-del"){
    const i=C.payinfo.findIndex(p=>p.id===t.dataset.id); if(i<0) return true; const [p]=C.payinfo.splice(i,1); touch(); render();
    toastUndo("Estudio eliminado",()=>{ C.payinfo.splice(Math.min(i,C.payinfo.length),0,p); touch(); render(); }); return true; }
  return false;
}
/* texto libre: se guarda sin redibujar para no perder el foco al teclear */
function clInput(a,t){
  if(a==="cl-t"){ const e=clFind(t.dataset.id); if(e){ e[t.dataset.f]=t.value; touch(); } return true; }
  return false;
}
function clChange(a,t){
  const C=CL_D();
  if(a==="cl-t"){ clRefreshLists(); return true; }
  if(a==="cl-dayset"){ CL.day=t.value||todayStr(); render(); return true; }
  if(a==="cl-fixed"){
    const slot=C.schedule.find(s=>s.id===t.dataset.slot); if(!slot) return true;
    const dayE=C.entries.filter(e=>e.date===CL.day);
    if(t.checked){ clNewEntry({studio:slot.studio,time:slot.time,tipo:"propia",attendance:slot.studio==="ALUNNA"?"grupo":null}); render(); }
    else {
      const m=clFixedMatch(dayE,slot,{}); if(m) clDelEntry(m.id);   // con deshacer: no se pierde la rutina/playlist de golpe
    }
    return true; }
  if(a==="cl-f"){
    const e=clFind(t.dataset.id); if(!e) return true; const f=t.dataset.f;
    let v=t.type==="checkbox"?t.checked:t.value;
    if(f==="amount"){ v=Number(v)||0; e.auto=false; }
    if(f==="time"&&!v) v=null;
    e[f]=v;
    if((f==="studio"||f==="attendance")&&e.auto!==false){ if(f==="studio"&&e.studio!=="ALUNNA") e.attendance=null; if(f==="studio"&&e.studio==="ALUNNA"&&!e.attendance) e.attendance="grupo"; e.amount=rateFor(e,C.rates); }
    touch(); render(); return true; }
  if(a==="cl-cobro-edit"){
    const c=cbGet(t.dataset.id); if(c){ const f=t.dataset.f; c[f]=f==="recibido"?(Number(t.value)||0):t.value; touch(); clRefreshLists(); } return true; }
  if(a==="cl-p"){ const p=C.payinfo.find(x=>x.id===t.dataset.id); if(p){ p[t.dataset.f]=t.value; touch(); render(); } return true; }
  return false;
}
