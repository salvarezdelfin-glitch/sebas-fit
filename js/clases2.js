"use strict";
/* ============================================================
   CLASES 2 · panel claro del dinero de tus clases
   Hoy → Resumen (semana / quincena / mes, con desglose por estudio) → Lo que me deben →
   Historial por mes (solo abre el mes que quieres, sin listas interminables) → Más (horario, rutinas, forma de pago)
   ============================================================ */
CL.res={tab:"semana",back:0}; CL.open={}; CL.mesesMas=false;
const CL_TABS=[["semana","Semana"],["quincena","Quincena"],["mes","Mes"]];
const clMesNom=m=>{ const [y,mo]=m.split("-"); const n=MESES_LARGO[(+mo||1)-1]; return n.charAt(0).toUpperCase()+n.slice(1)+" "+y; };

/* ---------- períodos y totales ---------- */
function clPeriodo(tab,back){
  const hoy=todayStr();
  if(tab==="semana"){ const wk=weekKeyAndLabel(addDays(hoy,-7*back)); return {ini:wk.key,fin:wk.endKey,label:wk.label,corto:fmtCorto(wk.key)}; }
  if(tab==="quincena"){ const q=quincenaFor(hoy,back); return {ini:q.startStr,fin:q.endStr,label:"Quincena "+q.label,corto:fmtCorto(q.startStr)}; }
  const d=new Date(), m=new Date(d.getFullYear(),d.getMonth()-back,1), f=new Date(m.getFullYear(),m.getMonth()+1,0);
  return {ini:toDateStr(m),fin:toDateStr(f),label:clMesNom(toDateStr(m).slice(0,7)),corto:MESES[m.getMonth()]};
}
function clStats(ini,fin){
  const E=CL_D().entries.filter(e=>e.date&&e.date>=ini&&e.date<=fin), conf=E.filter(e=>e.confirmado!==false), por={};
  conf.forEach(e=>{ const x=por[e.studio]||(por[e.studio]={n:0,total:0}); x.n++; x.total+=e.amount||0; });
  return {n:conf.length,pend:E.length-conf.length,total:sumConf(E),por};
}
const clOrdenEstudio=s=>STUDIOS.indexOf(s)<0?99:STUDIOS.indexOf(s);
function clFrecuencia(studio){ const p=CL_D().payinfo.find(x=>x.studio===studio); return p?(p.frequency==="semanal"?"semanal":"quincenal"):"otros"; }

/* ---------- resumen ---------- */
function clResumenHtml(){
  const R=CL.res, P=clPeriodo(R.tab,R.back), S=clStats(P.ini,P.fin), sts=Object.keys(S.por).sort((a,b)=>clOrdenEstudio(a)-clOrdenEstudio(b));
  const grupos=[["semanal","Pago semanal"],["quincenal","Pago quincenal"],["otros","Otros / suplencias"]];
  let filas=""; grupos.forEach(([g,nom])=>{ const l=sts.filter(s=>clFrecuencia(s)===g); if(!l.length) return;
    filas+=`<tr class="g"><td colspan="3">${nom}</td></tr>`+l.map(s=>`<tr><td>${stChip(s)}</td><td class="n">${S.por[s].n}</td><td class="n">${money(S.por[s].total)}</td></tr>`).join("");
    if(l.length>1) filas+=`<tr class="sub"><td>Subtotal</td><td class="n">${l.reduce((a,s)=>a+S.por[s].n,0)}</td><td class="n">${money(l.reduce((a,s)=>a+S.por[s].total,0))}</td></tr>`; });
  const tabla=sts.length?`<table class="yo-tabla cl-tabla"><thead><tr><th>Estudio</th><th class="n">Clases</th><th class="n">Ganado</th></tr></thead><tbody>${filas}<tr class="tot"><td>Total</td><td class="n">${S.n}</td><td class="n">${money(S.total)}</td></tr></tbody></table>`:`<p class="hint">Sin clases confirmadas en este período.</p>`;
  const mp=P.ini.slice(0,7), recibido=R.tab==="mes"?cbRecibidoEnMes(mp):null;
  const tiles=`<div class="tiles tiles-4">${tile("Clases dadas",S.n,S.pend?S.pend+" por confirmar":"")}${tile("Ganado",money(S.total),"según tus tarifas",1)}${R.tab==="mes"?tile("Recibido",money(recibido),"lo que ya te depositaron",1)+tile("Promedio por clase",S.n?money(S.total/S.n):"—",""):tile("Promedio por clase",S.n?money(S.total/S.n):"—","")+tile("Clases por día",(S.n/Math.max(1,R.tab==="semana"?7:R.tab==="quincena"?15:30)).toFixed(1).replace(".0",""),"")}</div>`;
  // tendencia: los últimos 8 períodos
  const vals=[], labs=[]; for(let b=7;b>=0;b--){ const p=clPeriodo(R.tab,R.back+b); vals.push(Math.round(clStats(p.ini,p.fin).total)); labs.push(b%2===0?p.corto:""); }
  const grafica=typeof svgBars==="function"&&vals.some(v=>v>0)?`<div class="cl-graf"><div class="mini-lbl">Ganado en los últimos 8 períodos</div>${svgBars(vals,labs,v=>v>=1000?(Math.round(v/100)/10)+"k":v)}</div>`:"";
  return `<div class="cl-pager"><button class="pg" data-action="cl-res-prev" aria-label="Período anterior">←</button><b>${esc(P.label)}</b><button class="pg" data-action="cl-res-next" ${R.back<=0?"disabled":""} aria-label="Período siguiente">→</button>${R.back>0?`<button class="btn sm ghost" data-action="cl-res-hoy">Hoy</button>`:""}</div>
    ${tiles}<div class="cl-dos">${tabla}${grafica}</div>`;
}
function clResumenBlk(){
  return `<section class="blk"><div class="blk-head"><div><h2>Cuánto llevas</h2><p>Clases dadas y dinero ganado, por estudio</p></div><div class="seg">${CL_TABS.map(([k,l])=>`<button data-action="cl-res-tab" data-v="${k}" class="${CL.res.tab===k?"on":""}">${l}</button>`).join("")}</div></div><div id="cl-resumen">${clResumenHtml()}</div></section>`;
}

/* ---------- lo que me deben ---------- */
function clDebesHtml(){
  const C=CL_D(), today=todayStr(), E=C.entries, pend=cbPendientes(), cerrado=pend.reduce((s,x)=>s+x.est,0), cards=[];
  C.payinfo.filter(p=>p.frequency==="semanal").forEach(p=>{
    const cy=weeklyCycleFor(today,p.payday||"Martes",0), inC=E.filter(e=>e.studio===p.studio&&e.date>=cy.startStr&&e.date<=cy.endStr), conf=inC.filter(e=>e.confirmado!==false);
    cards.push(`<div class="payout-card">${stChip(p.studio)}<div class="pc-lbl">${esc(studioLabel(p.studio))} te debe esta semana</div><div class="payout-amount num">${money(sumConf(inC))}</div>
      <div class="hint">${conf.length} clase${conf.length===1?"":"s"} · del ${fmtCorto(cy.startStr)} al ${fmtCorto(cy.endStr)}</div><div class="payout-range">Te depositan el ${esc(DIAS[parseLocalDate(cy.depositStr).getDay()])} ${fmtCorto(cy.depositStr)}</div>${inC.length-conf.length?`<div class="warn-txt">${inC.length-conf.length} pendiente(s) sin confirmar, no incluida(s)</div>`:""}</div>`); });
  const qq=C.payinfo.filter(p=>p.frequency!=="semanal");
  if(qq.length){ const q=quincenaFor(today,0); let tot=0,cnt=0; const partes=[];
    qq.forEach(p=>{ const l=E.filter(e=>e.studio===p.studio&&e.date>=q.startStr&&e.date<=q.endStr); tot+=sumConf(l); cnt+=l.filter(e=>e.confirmado!==false).length; if(l.length) partes.push(studioLabel(p.studio)+" "+money(sumConf(l))); });
    cards.push(`<div class="payout-card"><div class="pc-chips">${qq.map(p=>stChip(p.studio)).join("")}</div><div class="pc-lbl">Estudios quincenales · esta quincena</div><div class="payout-amount num">${money(tot)}</div>
      <div class="hint">${cnt} clase${cnt===1?"":"s"}${partes.length?" · "+partes.join(" · "):""}</div><div class="payout-range">${esc(q.label)} · te depositan al cerrar la quincena</div></div>`); }
  const lista=pend.slice(0,4).map(x=>`<div class="payout-card">${x.tipo==="Q"?stChip("QUINCENAL"):stChip(x.studio)}<div class="pc-lbl">Esperado</div><div class="payout-amount num">${money(x.est)}</div><div class="payout-range">${esc(cbPeriodLabel(x))}</div>${cbRow(x.tipo,x.studio,x.start,x.end,x.def)}</div>`).join("");
  const resto=pend.slice(4).map(x=>`<div class="payout-card">${x.tipo==="Q"?stChip("QUINCENAL"):stChip(x.studio)}<div class="pc-lbl">Esperado</div><div class="payout-amount num">${money(x.est)}</div><div class="payout-range">${esc(cbPeriodLabel(x))}</div>${cbRow(x.tipo,x.studio,x.start,x.end,x.def)}</div>`).join("");
  return `${cards.length?`<div class="grid-cards">${cards.join("")}</div>`:`<p class="hint">Agrega tus estudios y cómo te pagan en Más → Forma de pago (Ajustes).</p>`}
    <div class="cl-cerrado ${cerrado?"hay":""}"><div><b>Pendiente de cobrar (períodos ya cerrados)</b><span class="hint">${pend.length?pend.length+" período(s) sin marcar como cobrado":"Todo al día"}</span></div><b class="num ${cerrado?"warn-num":""}">${money(cerrado)}</b></div>
    ${pend.length?`<div class="grid-cards">${lista}</div>${resto?`<details class="cl-mas"><summary>Ver ${pend.length-4} más</summary><div class="grid-cards">${resto}</div></details>`:""}`:""}`;
}
function clDebesBlk(){ return `<section class="blk"><div class="blk-head"><div><h2>Lo que me deben</h2><p>Qué te toca cobrar y de qué estudio — marca "cobrado" cuando te depositen</p></div></div><div id="cl-debes">${clDebesHtml()}</div></section>`; }

/* ---------- historial por mes (solo se abre el mes que quieres) ---------- */
function clMesesLista(){
  const C=CL_D(), set=new Set(); C.entries.forEach(e=>{ if(e.date) set.add(e.date.slice(0,7)); }); cbList().forEach(c=>{ if(c.fecha) set.add(c.fecha.slice(0,7)); });
  return [...set].sort().reverse();
}
function clMesDetalle(m){
  const ini=m+"-01", fin=toDateStr(new Date(+m.slice(0,4),+m.slice(5,7),0)), S=clStats(ini,fin), E=CL_D().entries.filter(e=>e.date>=ini&&e.date<=fin).sort((a,b)=>a.date!==b.date?(a.date<b.date?1:-1):((b.time||"")<(a.time||"")?-1:1));
  const porEst=Object.keys(S.por).sort((a,b)=>clOrdenEstudio(a)-clOrdenEstudio(b)).map(s=>`<span class="chip">${esc(s)} · ${S.por[s].n} · ${money(S.por[s].total)}</span>`).join(" ");
  const cobros=cbList().filter(c=>(c.fecha||"").slice(0,7)===m).sort((a,b)=>(b.fecha||"")<(a.fecha||"")?-1:1).map(c=>{ const est=cbEstimate(c.tipo,c.studio,c.start,c.end);
    return `<div class="cb-row"><div class="cb-who">${c.tipo==="Q"?stChip("QUINCENAL"):stChip(c.studio)}<span class="hint">${esc(cbPeriodLabel(c))}</span></div><div class="cb-est hint">esperado ${money(est)}</div>
      <input class="inp w-amount" type="number" inputmode="decimal" data-action="cl-cobro-edit" data-id="${esc(c.id)}" data-f="recibido" value="${c.recibido||0}" aria-label="Monto recibido"><input class="inp w-date" type="date" data-action="cl-cobro-edit" data-id="${esc(c.id)}" data-f="fecha" value="${c.fecha||""}" aria-label="Fecha">
      ${cbDiffHtml(c.recibido||0,est)}<button class="del" data-action="cl-cobro-del" data-id="${esc(c.id)}" aria-label="Quitar cobro">✕</button></div>`; }).join("");
  return `<div class="cl-mes-det"><div class="chips-row">${porEst||`<span class="hint">Sin clases confirmadas</span>`}</div>
    ${cobros?`<div class="sub-head"><h3>Cobros recibidos este mes</h3></div><div class="cb-list">${cobros}</div>`:""}
    ${E.length?`<div class="sub-head"><h3>Clases del mes (${E.length})</h3></div><div class="rows-scroll"><div class="rows">${E.map(clEntryRow).join("")}</div></div>`:""}</div>`;
}
function clHistorialHtml(){
  const todos=clMesesLista(), hoyM=todayStr().slice(0,7), meses=CL.mesesMas?todos:todos.slice(0,6);
  if(!todos.length) return `<div class="empty">Aún no hay clases registradas. Marca una en "Hoy".</div>`;
  return meses.map(m=>{ const ini=m+"-01", fin=toDateStr(new Date(+m.slice(0,4),+m.slice(5,7),0)), S=clStats(ini,fin), rec=cbRecibidoEnMes(m), abierto=!!CL.open[m], dif=rec-S.total;
    return `<div class="cl-mes ${abierto?"on":""}"><button class="cl-mes-h" data-action="cl-mes" data-m="${m}" aria-expanded="${abierto}"><span class="cl-mes-n">${abierto?"▾":"▸"} ${esc(clMesNom(m))}${m===hoyM?` <small>en curso</small>`:""}</span>
      <span class="cl-mes-v"><b>${S.n}</b> clases</span><span class="cl-mes-v">ganado <b class="num">${money(S.total)}</b></span><span class="cl-mes-v">recibido <b class="num">${money(rec)}</b></span>
      <span class="cl-mes-v dif ${m===hoyM||Math.abs(dif)<1?"":dif<0?"neg":"pos"}">${m===hoyM?"":Math.abs(dif)<1?"al corriente":(dif<0?"faltan ":"sobran ")+money(Math.abs(dif))}</span></button>${abierto?clMesDetalle(m):""}</div>`; }).join("")
    +(todos.length>6?`<button class="btn ghost sm" data-action="cl-mas-meses" style="margin-top:10px">${CL.mesesMas?"Ver solo los últimos 6 meses":"Ver meses anteriores ("+(todos.length-6)+")"}</button>`:"");
}
function clHistorialBlk(){ return `<section class="blk"><div class="blk-head"><div><h2>Historial por mes</h2><p>Toca un mes para ver sus clases y cobros</p></div></div><div id="cl-historial">${clHistorialHtml()}</div></section>`; }

/* ---------- vista ---------- */
window.viewClases=function(){
  if(!CL.day) CL.day=todayStr();
  const d=new Date(), lbl=DIAS[d.getDay()]+" "+d.getDate()+" de "+MESES_LARGO[d.getMonth()]+" de "+d.getFullYear();
  return `<div class="wrap">
    <header class="page-head"><span class="eyebrow">Panel de clases</span><h1>Clases</h1><p class="sub">${esc(lbl.charAt(0).toUpperCase()+lbl.slice(1))}</p></header>
    ${clDayBlk()}
    ${typeof cicloHoyBlk==="function"?cicloHoyBlk():""}
    ${clResumenBlk()}
    ${clDebesBlk()}
    ${clHistorialBlk()}
    <details class="cl-mas blk"><summary>Más: horario fijo, última rutina por estudio y forma de pago</summary>${clBoardBlk()}
      <section class="blk"><div class="blk-head"><h2>Última rutina por estudio</h2><p>Para saber si repetir o cambiar</p></div><div class="grid-cards" id="cl-routines">${clRoutines()}</div></section>${clPayInfoBlk()}</details>
  </div>`;
};
const _clRefresh0=clRefreshLists;
window.clRefreshLists=function(){ _clRefresh0(); const set=(id,h)=>{ const el=document.getElementById(id); if(el) el.innerHTML=h; }; set("cl-resumen",clResumenHtml()); set("cl-debes",clDebesHtml()); set("cl-historial",clHistorialHtml()); };
const _clClick0=clClick;
window.clClick=function(a,t){
  if(a==="cl-res-tab"){ CL.res.tab=t.dataset.v; CL.res.back=0; render(); return true; }
  if(a==="cl-res-prev"){ CL.res.back++; clRefreshLists(); return true; }
  if(a==="cl-res-next"){ if(CL.res.back>0) CL.res.back--; clRefreshLists(); return true; }
  if(a==="cl-res-hoy"){ CL.res.back=0; clRefreshLists(); return true; }
  if(a==="cl-mes"){ CL.open[t.dataset.m]=!CL.open[t.dataset.m]; clRefreshLists(); return true; }
  if(a==="cl-mas-meses"){ CL.mesesMas=!CL.mesesMas; clRefreshLists(); return true; }
  return _clClick0(a,t);
};
