"use strict";
/* ============================================================
   FINANZAS · plan de pago, deudas, gastos y ahorro
   Lee tus clases dadas y lo cobrado directo de Clases (Vault.data.clases) y los pagos de
   clientes de personal trainer; guarda lo suyo en Vault.data.fin = {cfg, tx, debts}.
   Todo vive en la misma bóveda cifrada: nada de importar ni sincronizar a mano.
   Orientación general con tus propios números — no es asesoría financiera profesional.
   ============================================================ */
const FI={tab:"hoy",month:null,planPeriod:"quincenal",cobroPer:"semanal",filter:"",ftype:"all",sim:{monto:"",meses:"1",tarjeta:""},whatif:2,flN:1,flMonto:"",open:new Set(),memo:null};
const FI_POT="https://salvarezdelfin-glitch.github.io/potenciador-de-conceptos/";
const FI_CATS=[
  {id:"clases-part",name:"Clases particulares",type:"income"},{id:"otros-ing",name:"Otros ingresos",type:"income"},
  {id:"estudio",name:"Renta de estudio",type:"expense"},{id:"transporte",name:"Transporte",type:"expense"},{id:"comida",name:"Comida",type:"expense"},
  {id:"equipo",name:"Equipo y ropa",type:"expense"},{id:"servicios",name:"Servicios",type:"expense"},{id:"salud",name:"Salud",type:"expense"},
  {id:"ocio",name:"Ocio",type:"expense"},{id:"otros-gas",name:"Otros gastos",type:"expense"},
  {id:"deudas",name:"Pago de deudas",type:"expense"},{id:"ahorro",name:"Ahorro / Fondo de emergencia",type:"expense"}];
const FI_TABS=[["hoy","Hoy"],["deudas","Deudas"],["gastos","Gastos"],["crecer","Crecer"]];

/* ---------- datos ---------- */
function FI_D(){
  const d=Vault.data; if(!d.fin) d.fin={cfg:{},tx:[],debts:[]};
  const f=d.fin; if(!f.cfg||typeof f.cfg!=="object"||Array.isArray(f.cfg)) f.cfg={};
  if(!Array.isArray(f.tx)) f.tx=[]; if(!Array.isArray(f.debts)) f.debts=[];
  return f;
}
function fiCfg(){
  const c=FI_D().cfg;
  if(!Array.isArray(c.accounts)||!c.accounts.length) c.accounts=[{id:"efectivo",name:"Efectivo"},{id:"debito",name:"Tarjeta débito"},{id:"credito",name:"Tarjeta crédito"}];
  if(!Array.isArray(c.categories)) c.categories=FI_CATS.map(x=>({...x}));
  FI_CATS.filter(x=>x.id==="deudas"||x.id==="ahorro").forEach(x=>{ if(!c.categories.some(y=>y.id===x.id)) c.categories.push({...x}); });
  if(!c.budgets||typeof c.budgets!=="object") c.budgets={};
  if(!c.fuenteCortes||typeof c.fuenteCortes!=="object") c.fuenteCortes={};
  if(!Array.isArray(c.gastosFijos)) c.gastosFijos=[];
  return c;
}
function fiSet(patch,msg){ Object.assign(fiCfg(),patch); touch(); render(); if(msg) toast(msg); }
function fiDelCfg(keys,msg){ const c=fiCfg(); keys.forEach(k=>delete c[k]); touch(); render(); if(msg) toast(msg); }

/* ---------- utilidades ---------- */
const fiSum=(a,f)=>a.reduce((s,x)=>s+f(x),0);
const fiClamp=(n,a,b)=>Math.min(b,Math.max(a,n));
const fiLin=(x,x0,y0,x1,y1)=>y0+(fiClamp(x,x0,x1)-x0)/(x1-x0)*(y1-y0);
const fiPct=n=>Math.round(n*100)+"%";
const fiR2=n=>Math.round(n*100)/100;
const fiTitle=s=>{ s=String(s||"").trim(); return s?s.charAt(0).toUpperCase()+s.slice(1).toLowerCase():s; };
const fiPl=(n,a,b)=>n===1?a:b;
const fiDays=(a,b)=>Math.round((parseLocalDate(b)-parseLocalDate(a))/86400000);
const fiMx0=new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN",maximumFractionDigits:0});
const fiMx2=new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN",minimumFractionDigits:2,maximumFractionDigits:2});
function fiFmt(n){ n=Number(n)||0; if(Math.abs(n)<.005) n=0; return Math.abs(n-Math.round(n))<.005?fiMx0.format(Math.round(n)):fiMx2.format(n); }
const fiK=n=>n>=1000?"$"+(n/1000).toFixed(n>=10000?0:1).replace(/\.0$/,"")+"k":"$"+Math.round(n);
function fiShiftMonth(k,n){ const [y,m]=k.split("-").map(Number), d=new Date(y,m-1+n,1); return d.getFullYear()+"-"+pad(d.getMonth()+1); }
function fiMonthLabel(k){ const [y,m]=k.split("-").map(Number); const t=new Intl.DateTimeFormat("es-MX",{month:"long",year:"numeric"}).format(new Date(y,m-1,1)); return t.charAt(0).toUpperCase()+t.slice(1); }
function fiNextDay(day,from){
  const t=parseLocalDate(from); let y=t.getFullYear(), m=t.getMonth();
  const dd=(yy,mm)=>Math.min(day,new Date(yy,mm+1,0).getDate());
  if(t.getDate()>dd(y,m)){ m++; if(m>11){ m=0; y++; } }
  return toDateStr(new Date(y,m,dd(y,m)));
}
const fiQLabel=q=>Number(q.startStr.slice(8))+"–"+Number(q.endStr.slice(8))+" "+MESES[parseLocalDate(q.endStr).getMonth()];
function fiCatColor(id){ let h=0; for(const c of String(id)) h=(h*31+c.charCodeAt(0))%360; return {fg:`hsl(${h} 55% 72%)`,bg:`hsl(${h} 35% 20%)`}; }
const fiCat=id=>fiCfg().categories.find(c=>c.id===id);
const fiAcct=id=>fiCfg().accounts.find(a=>a.id===id);
function fiGuessAcct(f){ f=(f||"").toLowerCase(); return f.includes("efectivo")?"efectivo":(f.includes("credito")||f.includes("crédito")?"credito":"debito"); }

/* ============================================================
   DOMINIO
   ============================================================ */
const fiIsConsumo=t=>t.type==="expense"&&t.categoryId!=="ahorro"&&t.categoryId!=="deudas";
const fiTx=()=>FI_D().tx;
const fiTxIn=(a,b)=>fiTx().filter(t=>t.date>=a&&t.date<=b);
const fiConsumoIn=(a,b)=>fiSum(fiTxIn(a,b).filter(fiIsConsumo),t=>t.amount);
const fiFondo=()=>fiSum(fiTx().filter(t=>t.type==="expense"&&t.categoryId==="ahorro"),t=>t.amount);

/* Ingresos: lo que das (clases confirmadas) o lo que cobras (cobros marcados), + clientes PT + lo que anotes a mano */
function fiBasis(){ return fiCfg().baseIngreso==="cobrado"?"cobrado":"devengado"; }
function fiEvents(basis){
  basis=basis||fiBasis();
  if(!FI.memo) FI.memo={};
  if(FI.memo[basis]) return FI.memo[basis];
  const ev=[];
  if(basis==="cobrado") cbList().forEach(c=>{ if(c.fecha&&c.recibido>0) ev.push({date:c.fecha,amount:c.recibido,src:"cobro",estudio:c.tipo==="Q"?"Quincenal":fiTitle(c.studio),clases:0}); });
  else CL_D().entries.forEach(e=>{ if(e.confirmado!==false&&e.date&&e.amount>0) ev.push({date:e.date,amount:e.amount,src:"clases",estudio:fiTitle(e.studio),clases:1}); });
  ((Vault.data.pt||{}).pagos||[]).forEach(p=>{ if(p.fecha&&p.monto>0) ev.push({date:p.fecha,amount:p.monto,src:"pt",estudio:"Clientes PT",clases:0}); });
  fiFl().cobros.forEach(c=>{ if(c.estado==="Cancelado") return; (c.pagos||[]).forEach(p=>{ if(p.fecha&&p.mxn>0) ev.push({date:p.fecha,amount:p.mxn,src:"freelance",estudio:c.cliente||"Proyecto freelance",clases:0}); }); });
  fiTx().forEach(t=>{ if(t.type==="income"&&t.date) ev.push({date:t.date,amount:t.amount,src:"manual",estudio:t.note||(fiCat(t.categoryId)||{name:"Otros"}).name,clases:0}); });
  return FI.memo[basis]=ev;
}
const fiIncomeIn=(a,b)=>fiSum(fiEvents().filter(e=>e.date>=a&&e.date<=b),e=>e.amount);

/* proyectos freelance: Potenciador de Conceptos deja un resumen (cotizaciones y cobros) en localStorage —mismo sitio—
   y aquí se copia a la bóveda para que viaje cifrado a tus otros dispositivos */
function fiFl(){ const f=FI_D().freelance; return {cobros:(f&&Array.isArray(f.cobros))?f.cobros:[],cotizaciones:(f&&Array.isArray(f.cotizaciones))?f.cotizaciones:[],ts:(f&&f.ts)||null}; }
function fiSyncFreelance(){
  const raw=lsGet("pc_fin_resumen"); if(!raw) return false;
  let r; try{ r=JSON.parse(raw); }catch(e){ return false; }
  if(!r||!r.ts||!Array.isArray(r.cobros)||!Array.isArray(r.cotizaciones)) return false;
  const F=FI_D(); if(F.freelance&&(F.freelance.ts||"")>=r.ts) return false;
  F.freelance=r; touch(); return true;
}
function fiFlStats(){
  const fl=fiFl(), mp=todayStr().slice(0,7), cobros=fl.cobros.filter(c=>c.estado!=="Cancelado");
  const pagos=[]; cobros.forEach(c=>(c.pagos||[]).forEach(p=>pagos.push({...p,cliente:c.cliente,proyecto:c.proyecto})));
  const Q=fl.cotizaciones, en=s=>Q.filter(q=>q.estado===s), enviadas=en("Enviada"), aceptadas=en("Aceptada"), pagadas=en("Pagada"), rechazadas=en("Rechazada");
  const cerradas=aceptadas.concat(pagadas), decididas=cerradas.length+rechazadas.length;
  return {fl,hay:!!(Q.length||cobros.length),enviadas,aceptadas,pagadas,rechazadas,cerradas,
    porCobrar:fiSum(cobros,c=>Math.max(0,(c.mxn||0)-(c.pagado||0))),cobradoMes:fiSum(pagos.filter(p=>(p.fecha||"").slice(0,7)===mp),p=>p.mxn),cobradoTotal:fiSum(pagos,p=>p.mxn),
    tasa:decididas>=3?cerradas.length/decididas:null,prom:cerradas.length?fiSum(cerradas,q=>q.mxn||0)/cerradas.length:0};
}

/* deudas */
function fiDebtStats(d){
  const meses=Math.max(1,Number(d.meses)||1), montoTotal=Number(d.montoTotal||0);
  const miParte=(d.miParte!=null&&d.miParte!=="")?Math.max(0,Number(d.miParte)||0):montoTotal;
  const pagoMensual=miParte/meses;
  const montoPagado=d.montoPagado!=null?Math.max(0,Number(d.montoPagado)||0):Math.max(0,Number(d.mesesPagados||0))*pagoMensual;
  const saldo=Math.max(0,miParte-montoPagado), pagados=pagoMensual>0?montoPagado/pagoMensual:0;
  const liquidada=montoPagado>=miParte-.01, restantes=liquidada?0:Math.max(1,Math.ceil(saldo/pagoMensual-1e-9));
  return {meses,montoTotal,miParte,pagoMensual,montoPagado,saldo,pagados,liquidada,restantes,compartida:miParte<montoTotal-.01};
}
/* lo que ya debería estar pagado según las fechas: un pago mensual por cada mes que pasó desde que empezó la deuda */
function fiDebtDebido(d){
  const st=fiDebtStats(d), a=d.fechaInicio; if(!a||st.liquidada) return {esperado:st.montoPagado,falta:0};
  const t=todayStr(), meses=(Number(t.slice(0,4))-Number(a.slice(0,4)))*12+Number(t.slice(5,7))-Number(a.slice(5,7))-(Number(t.slice(8))<Number(a.slice(8))?1:0);
  const esperado=fiR2(Math.min(st.miParte,Math.max(0,meses)*st.pagoMensual));
  return {esperado,falta:Math.max(0,fiR2(esperado-st.montoPagado))};
}
const fiDebtsActive=()=>FI_D().debts.filter(d=>!fiDebtStats(d).liquidada);
const fiDeudaMensual=()=>fiSum(fiDebtsActive(),d=>fiDebtStats(d).pagoMensual);
const fiSaldoDeudas=()=>fiSum(FI_D().debts,d=>fiDebtStats(d).saldo);
const fiDebtsOf=key=>FI_D().debts.filter(d=>(d.fuente||"").trim().toLowerCase()===key);
const fiMsiMensual=key=>fiSum(fiDebtsOf(key),d=>{ const s=fiDebtStats(d); return s.liquidada?0:s.pagoMensual; });
const fiUsoDeudas=key=>fiSum(fiDebtsOf(key),d=>{ const s=fiDebtStats(d); return s.liquidada?0:(s.compartida?s.montoTotal:s.saldo); });

/* tarjetas */
function fiAutoAdded(key,e){
  return fiSum(fiTx().filter(t=>{
    if(t.type!=="expense"||t.corteKey!==key) return false;
    if(e.saldoDesdeTs) return t.createdAt?t.createdAt>=e.saldoDesdeTs:t.date>toDateStr(new Date(e.saldoDesdeTs));
    return true;
  }),t=>t.amount);
}
function fiCard(key){
  const e=fiCfg().fuenteCortes[key]||{}, baseline=Number(e.saldoManual||0), auto=fiAutoAdded(key,e), saldo=baseline+auto;
  const msi=fiMsiMensual(key), limite=Number(e.limite||0), uso=saldo+fiUsoDeudas(key), hoy=todayStr();
  const pagoD=e.pago?fiNextDay(e.pago,hoy):null;
  return {key,e,saldo,msi,aPagar:saldo+msi,limite,uso,auto,util:limite>0?uso/limite:null,disponible:limite>0?Math.max(0,limite-uso):null,
    corteD:fiNextDay(e.corte||1,hoy),pagoD,diasPago:pagoD?fiDays(hoy,pagoD):null};
}

/* clases por estudio (últimos N días) */
function fiPorEstudio(days){
  const since=addDays(todayStr(),-(days-1)), map={};
  fiEvents("devengado").filter(e=>e.date>=since).forEach(e=>{ const o=map[e.estudio]||(map[e.estudio]={estudio:e.estudio,clases:0,total:0,src:e.src}); o.clases+=e.clases; o.total+=e.amount; });
  const rows=Object.values(map).sort((a,b)=>b.total-a.total), total=fiSum(rows,r=>r.total);
  rows.forEach(r=>{ r.share=total?r.total/total:0; r.prom=r.clases?r.total/r.clases:0; });
  return {rows,total,clases:fiSum(rows,r=>r.clases)};
}
function fiAvgRate(){
  const since=addDays(todayStr(),-59), E=CL_D().entries.filter(e=>e.confirmado!==false&&e.date>=since&&e.amount>0);
  if(E.length) return fiSum(E,e=>e.amount)/E.length;
  const r=Object.values(CL_D().rates||{}).map(Number).filter(n=>n>0); return r.length?fiSum(r,n=>n)/r.length:0;
}

/* modelo de ingreso: promedio de las últimas quincenas COMPLETAS (la primera parcial y la última si hay datos viejos se descartan) */
function fiModel(){
  const ev=fiEvents().slice().sort((a,b)=>a.date.localeCompare(b.date));
  if(!ev.length) return {hasData:false,qs:[],avg:0,min:0,fallback:0,first:null,last:null,stale:true,daysSince:null};
  const today=todayStr(), first=ev[0].date, last=ev[ev.length-1].date, daysSince=fiDays(last,today), stale=daysSince>10;
  const fq=quincenaFor(first,0), firstOk=first<=addDays(fq.startStr,2);
  let q=quincenaFor(last,0); if(q.endStr>=today||stale) q=quincenaFor(q.startStr,1);
  const qs=[];
  while(qs.length<4&&(q.startStr>fq.startStr||(q.startStr===fq.startStr&&firstOk))){ qs.push({q,total:fiIncomeIn(q.startStr,q.endStr)}); q=quincenaFor(q.startStr,1); }
  const vals=qs.map(x=>x.total), span=Math.max(1,fiDays(first,last)+1);
  return {hasData:true,qs,avg:vals.length?fiSum(vals,v=>v)/vals.length:0,min:vals.length?Math.min(...vals):0,fallback:fiSum(ev,e=>e.amount)/span*15,first,last,stale,daysSince};
}
/* gastos de siempre (aproximados): cada uno en pesos por quincena o por mes */
function fiGastosAprox(period){
  return fiSum(fiCfg().gastosFijos,g=>{ const m=Number(g.monto)||0; return period==="quincenal"?(g.freq==="mes"?m/2:m):(g.freq==="mes"?m:m*2); });
}
function fiPlan(period){
  const c=fiCfg(), m=fiModel(), p=c.metaAhorroPct!=null?Number(c.metaAhorroPct):20;
  const autoQ=(c.modoBase==="minimo"?m.min:m.avg)||m.fallback||0;
  const manualQ=c.ingresoQuincenalManual!=null, manualM=c.ingresoMensualManual!=null;
  const baseQ=manualQ?Number(c.ingresoQuincenalManual):autoQ, baseM=manualM?Number(c.ingresoMensualManual):baseQ*2;
  const base=period==="quincenal"?baseQ:baseM, deudas=period==="quincenal"?fiDeudaMensual()/2:fiDeudaMensual();
  const resto=Math.max(0,base-deudas), ahorroMeta=resto*p/100, G=fiGastosAprox(period);
  const ahorro=G>0?Math.min(ahorroMeta,Math.max(0,resto-G)):ahorroMeta, gasto=resto-ahorro;   // lo que gastas de siempre va primero; el ahorro nunca pasa de lo que sobra
  return {period,base,manual:period==="quincenal"?manualQ:manualM,deudas,resto,ahorro,ahorroMeta,G,faltaAhorro:ahorroMeta-ahorro,gasto,pct:p,autoQ,model:m,over:base>0&&deudas>base};
}
function fiHeroModel(){
  const today=todayStr(), q=quincenaFor(today,0), p=fiPlan("quincenal");
  const gastado=fiConsumoIn(q.startStr,today), restante=p.gasto-gastado, diasRest=fiDays(today,q.endStr)+1;
  return {q,p,gastado,restante,diasRest,porDia:restante>0?restante/diasRest:0};
}
function fiConsumoProm(){
  const today=todayStr(), cur=today.slice(0,7), vals=[];
  for(let i=1;i<=2;i++){ const k=fiShiftMonth(cur,-i), v=fiSum(fiTx().filter(t=>fiIsConsumo(t)&&t.date.slice(0,7)===k),t=>t.amount); if(v>0) vals.push(v); }
  if(vals.length) return fiSum(vals,v=>v)/vals.length;
  const day=Number(today.slice(8)), mtd=fiSum(fiTx().filter(t=>fiIsConsumo(t)&&t.date.slice(0,7)===cur),t=>t.amount);
  return day>=7?mtd/day*30:mtd;
}

/* ---------- clases dadas y lo cobrado, por semana / quincena ---------- */
function fiPeriods(kind,n){
  const today=todayStr(), out=[];
  for(let i=0;i<n;i++){
    let start,end;
    if(kind==="semanal"){ start=toDateStr(mondayOf(addDays(today,-7*i))); end=addDays(start,6); }
    else { const q=quincenaFor(today,i); start=q.startStr; end=q.endStr; }
    out.push({start,end,label:fmtCorto(start)+" – "+fmtCorto(end),actual:i===0});
  }
  return out;
}
function fiClasesEn(a,b){ const E=CL_D().entries.filter(e=>e.date>=a&&e.date<=b&&e.confirmado!==false); return {n:E.length,monto:fiSum(E,e=>e.amount||0)}; }
function fiRecibidoEn(a,b){
  const cobros=fiSum(cbList().filter(c=>c.fecha&&c.fecha>=a&&c.fecha<=b),c=>c.recibido||0);
  const pt=fiSum(((Vault.data.pt||{}).pagos||[]).filter(p=>p.fecha&&p.fecha>=a&&p.fecha<=b),p=>p.monto||0);
  return {cobros,pt,total:cobros+pt};
}

/* ---------- diagnóstico ---------- */
function fiDiag(){
  const c=fiCfg(), today=todayStr(), m=fiModel(), pM=fiPlan("mensual"), pQ=fiPlan("quincenal"), h=fiHeroModel();
  const deudaMes=fiDeudaMensual(), dti=pM.base>0?deudaMes/pM.base:null;
  const cards=Object.keys(c.fuenteCortes).map(fiCard), lim=cards.filter(x=>x.limite>0), totLim=fiSum(lim,x=>x.limite), totUso=fiSum(lim,x=>x.uso);
  const util=totLim>0?totUso/totLim:null, fondo=fiFondo(), esencial=deudaMes+fiConsumoProm(), mesesFondo=esencial>0?fondo/esencial:null;
  const diasTrans=Math.max(1,fiDays(h.q.startStr,today)+1), diasTot=fiDays(h.q.startStr,h.q.endStr)+1;
  const proy=h.gastado/diasTrans*diasTot, ritmo=h.p.gasto>0&&h.gastado>0?proy/h.p.gasto:null;
  const sDeuda=dti==null?12:dti<=.2?25:dti<=.35?fiLin(dti,.2,25,.35,15):dti<=.5?fiLin(dti,.35,15,.5,5):fiLin(dti,.5,5,.75,0);
  const sFondo=mesesFondo==null?10:fiClamp(mesesFondo/3*25,0,25);
  const sCred=util==null?20:util<=.3?25:util<=.5?fiLin(util,.3,25,.5,15):util<=.75?fiLin(util,.5,15,.75,5):fiLin(util,.75,5,1,0);
  const sRitmo=ritmo==null?12:ritmo<=1?25:ritmo<=1.2?fiLin(ritmo,1,25,1.2,12):fiLin(ritmo,1.2,12,1.6,0);
  const parts=[{name:"Deudas vs. ingreso",val:dti==null?"—":fiPct(dti),pts:sDeuda},{name:"Fondo de emergencia",val:mesesFondo==null?"—":mesesFondo.toFixed(1)+" meses",pts:sFondo},
    {name:"Uso de crédito",val:util==null?"sin límites":fiPct(util),pts:sCred},{name:"Ritmo de gasto",val:ritmo==null?"sin datos":fiPct(ritmo)+" del plan",pts:sRitmo}];
  const score=m.hasData?Math.round(fiSum(parts,p=>p.pts)):null;
  const label=score==null?"Faltan datos":score>=80?"Excelente":score>=60?"Buena":score>=40?"En construcción":"Requiere atención";

  const ins=[], push=(sev,t,p,act)=>ins.push({sev,t,p,act});
  if(!m.hasData) push(3,"Aún no hay ingresos registrados","Sin tus clases o cobros no puedo calcular tu plan. Marca las clases que das en Clases.",{label:"Ir a Clases",go:"hoy"});
  else if(m.stale) push(3,`No hay ingresos desde el ${fmtCorto(m.last)}`,`Hace ${m.daysSince} días que no registras clases ni cobros; el plan usa datos viejos. Marca lo que diste en Clases.`,{label:"Ir a Clases",go:"hoy"});
  cards.forEach(x=>{
    if(x.pagoD!=null&&x.aPagar>0&&x.diasPago<=7) push(x.diasPago<=3?3:2,`Paga ~${fiFmt(x.aPagar)} en ${fiTitle(x.key)} antes del ${fmtCorto(x.pagoD)}`,`Vence ${x.diasPago===0?"hoy":x.diasPago===1?"mañana":"en "+x.diasPago+" días"}. Pagar el total del estado de cuenta evita intereses; el pago mínimo no.`,{label:"Ver tarjetas",tab:"deudas"});
    if(x.util!=null&&x.util>.5) push(x.util>.75?3:2,`${fiTitle(x.key)} está al ${fiPct(x.util)} de su límite`,`Varias guías de crédito sugieren mantener el uso por debajo de ~30%. Te quedan ${fiFmt(x.disponible)} disponibles.`,{label:"Ver tarjetas",tab:"deudas"});
  });
  if(dti!=null){
    if(dti>.35) push(3,`Tus deudas se llevan el ${fiPct(dti)} de tu ingreso`,"Referencia común: por debajo de ~35% es manejable y lo ideal es menos de 20%. Conviene no sumar compras a meses hasta bajar de ahí.",{label:"Ver deudas",tab:"deudas"});
    else if(dti>.2) push(2,`Tus deudas son el ${fiPct(dti)} de tu ingreso`,"Está en zona manejable, pero cada compra a meses nueva la sube. Revisa el simulador antes de comprar.",{label:"Probar una compra",tab:"hoy"});
    else if(deudaMes>0) push(1,`Tus deudas son el ${fiPct(dti)} de tu ingreso`,"Está en zona sana (menos de 20%).");
  }
  if(fondo<=0) push(2,"Aún no tienes fondo de emergencia",esencial>0?`Una referencia común es juntar 3 meses de gastos esenciales: ~${fiFmt(esencial*3)}. Empieza con lo que te salga cómodo cada quincena.`:"Empieza apartando algo cada quincena; la referencia común es cubrir 3 meses de gastos.",{label:"Ir al fondo",tab:"crecer"});
  else if(mesesFondo!=null&&mesesFondo<3) push(1,`Tu fondo cubre ${mesesFondo.toFixed(1)} meses`,`Meta común: 3 meses (~${fiFmt(esencial*3)}). Te faltan ${fiFmt(esencial*3-fondo)}.`,{label:"Aportar",tab:"crecer"});
  else if(mesesFondo!=null) push(1,"Tu fondo ya cubre 3 meses o más","Buen colchón. Lo que apartes de más puede ir a metas o a reducir deudas.");
  const aportQ=fiSum(fiTxIn(h.q.startStr,today).filter(t=>t.type==="expense"&&t.categoryId==="ahorro"),t=>t.amount);
  if(pQ.ahorro>0&&diasTrans/diasTot>=.5&&aportQ<pQ.ahorro*.5) push(2,"Todavía no apartas tu ahorro de esta quincena",`Tu plan pide ${fiFmt(pQ.ahorro)} y llevas ${fiFmt(aportQ)}. Págate primero: apártalo antes de gastar el resto.`,{label:"Aportar al fondo",tab:"crecer",prefill:Math.round(pQ.ahorro-aportQ)});
  if(h.p.gasto>0){
    if(h.restante<0) push(3,`Te pasaste ${fiFmt(-h.restante)} de tu gasto de esta quincena`,"Lo que falta de la quincena, solo esencial. Si hay ingresos extra, no los trates como parte de tu base.",{label:"Ver gastos",tab:"gastos"});
    else if(ritmo!=null&&ritmo>1.1) push(2,"Vas gastando más rápido de lo que tu plan permite",`A este ritmo cerrarías la quincena en ~${fiFmt(proy)} contra ${fiFmt(h.p.gasto)} permitidos.`,{label:"Ver gastos",tab:"gastos"});
  }
  const actualQ=fiIncomeIn(h.q.startStr,today);
  if(pQ.base>0&&!m.stale&&actualQ>pQ.base*1.1){ const extra=actualQ-pQ.base;
    push(1,`Llevas ${fiFmt(extra)} por encima de tu base esta quincena`,`Idea proporcional a lo que entró: ${fiFmt(extra*.5)} al fondo o a deudas y ${fiFmt(extra*.5)} para disfrutar. Lo que entra arriba de tu base no está contado en tu plan.`,{label:"Aportar al fondo",tab:"crecer",prefill:Math.round(extra*.5)}); }
  if(pQ.manual&&m.avg>0&&Math.abs(pQ.base-m.avg)/m.avg>.25) push(2,"Tu ingreso quincenal manual no coincide con tus datos",`Tienes ${fiFmt(pQ.base)} escrito a mano y tus últimas quincenas promedian ${fiFmt(m.avg)}. Si el automático te representa mejor, úsalo.`,{label:"Usar automático",action:"fi-plan-auto"});
  const ip=fiPorEstudio(60);
  if(ip.rows.length>=2&&ip.rows[0].share>.5) push(2,`${ip.rows[0].estudio} es el ${fiPct(ip.rows[0].share)} de tu ingreso`,"Depender de un solo lugar es riesgoso: si cambian tus horarios, tu ingreso baja de golpe.",{label:"Ver ingresos",tab:"crecer"});
  const cur=today.slice(0,7), prev=fiShiftMonth(cur,-1), day=Number(today.slice(8));
  if(day>=10&&pM.gasto>0){
    const tot=(k,id)=>fiSum(fiTx().filter(t=>fiIsConsumo(t)&&t.date.slice(0,7)===k&&t.categoryId===id),t=>t.amount);
    [...new Set(fiTx().filter(t=>fiIsConsumo(t)&&t.date.slice(0,7)===cur).map(t=>t.categoryId))].forEach(id=>{
      const proj=tot(cur,id)/day*30, before=tot(prev,id), nm=(fiCat(id)||{name:id}).name;
      if(before>0&&proj>before*1.3&&proj-before>pM.gasto*.05) push(2,`${nm} va ${fiPct(proj/before-1)} arriba del mes pasado`,`A este ritmo cerraría en ~${fiFmt(proj)} contra ${fiFmt(before)} el mes pasado.`,{label:"Ver gastos",tab:"gastos"});
      else if(!c.budgets[id]&&proj>pM.gasto*.25&&!before) push(2,`${nm} se está llevando mucho`,`A este ritmo serían ~${fiFmt(proj)} al mes, más de la cuarta parte de lo que tienes para gastar.`,{label:"Ver gastos",tab:"gastos"});
    });
  }
  if(fiTx().filter(t=>fiIsConsumo(t)&&t.date>=addDays(today,-13)).length<3) push(2,"Casi no registras gastos","Sin tus gastos reales no puedo decirte si vas bien. Anota cada gasto (toma 5 segundos), aunque sean los de más de $100.",{label:"+ Gasto",action:"fi-add-tx"});
  const fs=fiFlStats();
  if(fs.hay){
    const viejas=fs.enviadas.filter(q=>q.ts&&Date.now()-q.ts>7*864e5);
    if(viejas.length) push(2,`${viejas.length} ${fiPl(viejas.length,"cotización enviada sin respuesta","cotizaciones enviadas sin respuesta")} (${fiFmt(fiSum(viejas,q=>q.mxn||0))})`,"Pasaron más de 7 días. Un mensaje de seguimiento suele costar poco y es cuando más proyectos se cierran.",{label:"Ver proyectos",tab:"crecer"});
    if(fs.porCobrar>0) push(2,`Te deben ${fiFmt(fs.porCobrar)} de proyectos freelance`,"Es dinero ya ganado que todavía no entra; cobrarlo a tiempo cuenta como ingreso para tu plan.",{label:"Ver proyectos",tab:"crecer"});
  }
  if(pQ.base>0&&pQ.pct<10) push(1,`Tu meta de ahorro es ${pQ.pct}%`,"Muchas guías sugieren 10–20% como punto de partida; ajústalo según tu situación.");
  ins.sort((a,b)=>b.sev-a.sev);
  return {score,label,parts,insights:ins.slice(0,5),m};
}

/* ---------- simulador de compra ---------- */
function fiSimulate(monto,meses,tarjeta){
  const pM=fiPlan("mensual"), h=fiHeroModel(), deudaMes=fiDeudaMensual(), cuota=monto/meses, tarifa=fiAvgRate(), lines=[]; let v;
  if(tarifa>0) lines.push(`Equivale a ~${(monto/tarifa).toFixed(1)} clases dadas (a ${fiFmt(tarifa)} por clase).`);
  if(h.p.gasto<=0) v="sin-plan";
  else if(meses===1){ const ratio=h.restante>0?monto/h.restante:Infinity; v=ratio<=.6?"ok":ratio<=1?"justo":"no";
    lines.push(h.restante>0?`Te quedan ${fiFmt(h.restante)} para gastar esta quincena; esto sería el ${fiPct(ratio)}.`:"Esta quincena ya no tienes margen para gastar."); }
  else { const ratio=pM.gasto>0?cuota/pM.gasto:Infinity; v=ratio<=.2?"ok":ratio<=.4?"justo":"no";
    lines.push(`A ${meses} meses son ${fiFmt(cuota)} al mes: el ${fiPct(ratio)} de lo que tienes para gastar cada mes.`);
    if(pM.base>0){ const nuevo=(deudaMes+cuota)/pM.base; lines.push(`Tus deudas pasarían de ${fiPct(deudaMes/pM.base)} a ${fiPct(nuevo)} de tu ingreso mensual.`); if(nuevo>.4) v="no"; else if(nuevo>.35&&v==="ok") v="justo"; } }
  if(tarjeta){ const c=fiCard(tarjeta); if(c.limite>0){ const nu=(c.uso+monto)/c.limite;
    lines.push(`${fiTitle(tarjeta)} pasaría de ${fiPct(c.util||0)} a ${fiPct(nu)} de su límite${nu>1?" (excede el límite)":""}.`); if(nu>1) v="no"; else if(nu>.75&&v==="ok") v="justo"; } }
  return {v,lines};
}

/* ============================================================
   VISTAS
   ============================================================ */
function viewFinanzas(){
  fiSyncFreelance(); FI.memo=null; fiCfg();
  if(!FI.month) FI.month=todayStr().slice(0,7);
  const body=FI.tab==="deudas"?fiViewDeudas():FI.tab==="gastos"?fiViewGastos():FI.tab==="crecer"?fiViewCrecer():fiViewHoy();
  return `<div class="wrap fi"><header class="page-head"><span class="eyebrow">Plan de pago · deudas · ahorro</span><h1>Finanzas</h1>
    <p class="sub">Se arma solo con tus clases dadas y lo que cobras en Clases. Orientación general con tus números, no es asesoría financiera profesional.</p></header>
    <div class="subnav" style="padding:0"><div class="tabs">${FI_TABS.map(([k,l])=>`<button data-action="fi-tab" data-tab="${k}" class="${FI.tab===k?"on":""}">${l}</button>`).join("")}</div></div>
    ${body}</div>`;
}

/* ---------- HOY ---------- */
function fiViewHoy(){
  const m=fiModel(); let alert="";
  if(!m.hasData) alert=`<div class="fi-notice warn"><span><b>Aún no hay ingresos.</b> Marca las clases que das (o los cobros) en Clases y aquí se calcula tu plan.</span><button class="btn sm" data-action="go" data-screen="hoy">Ir a Clases</button></div>`;
  else if(m.stale) alert=`<div class="fi-notice warn"><span><b>Tu último ingreso es del ${fmtCorto(m.last)}</b> (hace ${m.daysSince} días). El plan usa datos viejos: marca tus clases en Clases.</span><button class="btn sm" data-action="go" data-screen="hoy">Ir a Clases</button></div>`;
  return `${alert}${fiHero()}${fiGastosCard()}${fiCobrosBlk()}
    <div class="fi-grid2 blk">${fiDiagCard()}${fiPlanCard()}</div>
    <section class="blk"><div class="card">${fiSimCard()}</div></section>`;
}
function fiHero(){
  const h=fiHeroModel(), p=h.p; let amt,cls="",sub,pc=0,color="var(--ok)";
  if(p.base<=0){ amt="—"; sub="Aún no tengo ingresos para calcular. Marca tus clases en Clases o escribe tu ingreso en el plan."; }
  else if(h.restante<=0){ amt=fiFmt(0); cls="neg"; pc=100; color="var(--danger)"; sub=(h.restante<0?`Ya te pasaste ${fiFmt(-h.restante)} de lo que tu plan permite esta quincena. `:"Ya usaste todo lo que tu plan permite esta quincena. ")+"Lo que falta, solo lo esencial."; }
  else { amt=fiFmt(Math.floor(h.porDia)); sub=`Te quedan ${fiFmt(h.restante)} para ${h.diasRest} ${fiPl(h.diasRest,"día","días")} (hasta el ${fmtCorto(h.q.endStr)}).`; pc=fiClamp(h.gastado/p.gasto*100,0,100); color=pc>=85?"var(--danger)":pc>=65?"var(--warn)":"var(--ok)"; }
  return `<section class="blk"><div class="fi-hero"><span class="eyebrow">Hoy puedes gastar</span><div class="fi-hero-amt ${cls}">${amt}</div><p class="fi-hero-sub">${sub}</p>
    <div class="fi-meter"><i style="width:${pc}%;background:${color}"></i></div>
    <div class="fi-hero-foot"><span>Gastado ${fiFmt(h.gastado)} de ${fiFmt(Math.max(0,p.gasto))} · quincena ${fiQLabel(h.q)}</span><span>${p.base>0?`Base ${fiFmt(p.base)} − deudas ${fiFmt(p.deudas)} − ahorro ${fiFmt(p.ahorro)}`:""}</span></div></div></section>`;
}

/* mis gastos de siempre (aprox) + cuánto apartar siempre al fondo de emergencia */
const FI_GF_SUG=["Comida","Súper","Transporte / gasolina","Celular e internet","Salidas","Suscripciones","Salud","Ropa y equipo"];
function fiGastosCard(){
  const c=fiCfg(), L=c.gastosFijos, p=fiPlan(FI.planPeriod==="mensual"?"mensual":"quincenal"), per=p.period==="mensual"?"mes":"quincena";
  const ah=fiFondo(), meta=Number(c.fondoMeta||0), q=quincenaFor(todayStr(),0), pQ=fiPlan("quincenal");
  const aportQ=fiSum(fiTxIn(q.startStr,todayStr()).filter(t=>t.type==="expense"&&t.categoryId==="ahorro"),t=>t.amount), falta=Math.max(0,pQ.ahorro-aportQ);
  const rows=L.map(g=>`<div class="fi-gf-row"><input class="inp" value="${esc(g.nombre||"")}" placeholder="¿En qué?" data-action="fi-gf-edit" data-id="${esc(g.id)}" data-field="nombre" aria-label="Concepto">
    <input class="inp" type="number" inputmode="decimal" min="0" step="50" value="${g.monto||""}" placeholder="$0" data-action="fi-gf-edit" data-id="${esc(g.id)}" data-field="monto" aria-label="Monto aproximado">
    <select class="inp" data-action="fi-gf-edit" data-id="${esc(g.id)}" data-field="freq" aria-label="Cada cuándo"><option value="q" ${g.freq!=="mes"?"selected":""}>por quincena</option><option value="mes" ${g.freq==="mes"?"selected":""}>por mes</option></select>
    <button class="btn sm ghost" data-action="fi-gf-del" data-id="${esc(g.id)}" aria-label="Quitar">✕</button></div>`).join("");
  let veredicto="";
  if(p.base<=0) veredicto=`<p class="hint">Cuando tengas ingresos aquí te digo cuánto apartar.</p>`;
  else {
    const por100=p.ahorro/p.base*100;
    if(!L.some(g=>Number(g.monto)>0)) veredicto=`<p class="hint">Anota cuánto gastas más o menos en cada cosa y te calculo cuánto apartar siempre. Con lo que ya sé, tu meta es ${fiFmt(p.ahorroMeta)} por ${per} (${p.pct}% de lo que te queda después de deudas).</p>`;
    else if(p.faltaAhorro>0.5) veredicto=`<div class="fi-verdict ${p.ahorro>0?"justo":"no"}"><b>Con esos gastos, apartas ${fiFmt(p.ahorro)} por ${per}</b><ul><li>Tu meta era ${fiFmt(p.ahorroMeta)}: te faltan ${fiFmt(p.faltaAhorro)}.</li><li>Recorta ~${fiFmt(p.faltaAhorro)} por ${per} de lo de arriba, o suma ingreso, para llegar a tu meta.</li></ul></div>`;
    else veredicto=`<div class="fi-verdict ok"><b>Aparta ${fiFmt(p.ahorro)} por ${per}, siempre</b><ul><li>Gastas ~${fiFmt(p.G)} de siempre y te quedan ${fiFmt(Math.max(0,p.gasto-p.G))} de colchón para imprevistos.</li></ul></div>`;
    veredicto+=p.ahorro>0?`<p class="hint">Regla simple que sube y baja con tus ingresos: de cada $100 que te entran, aparta <b class="num">${fiFmt(por100)}</b> en cuanto cobres.</p>`:"";
  }
  const fondo=`<div class="fi-gf-fondo"><div><span class="eyebrow">Todo el ahorro va al fondo de emergencia</span><div class="hint" style="margin:2px 0 0">${fiFmt(ah)}${meta>0?" de "+fiFmt(meta):" ahorrados"}${pQ.ahorro>0?` · esta quincena llevas ${fiFmt(aportQ)} de ${fiFmt(pQ.ahorro)}`:""}</div>
    ${meta>0?`<div class="fi-meter thin" style="margin-top:6px"><i style="width:${fiClamp(ah/meta*100,0,100)}%;background:var(--ok)"></i></div>`:""}</div>
    ${falta>=1?`<button class="btn primary sm" data-action="fi-fondo-quick" data-monto="${Math.round(falta)}">Ya aparté ${fiFmt(Math.round(falta))}</button>`:(pQ.ahorro>0?'<span class="chip ok">cumplido</span>':"")}</div>`;
  return `<section class="blk"><div class="card"><div class="fi-card-head"><h3>Mis gastos de siempre</h3><span class="hint">aproximados · el ahorro se calcula con ellos</span></div>
    <div class="fi-gf">${rows||'<p class="hint" style="margin-top:0">Todavía no anotas nada. Pon lo que gastas más o menos, sin exactitud.</p>'}</div>
    <div class="fi-gf-row fi-gf-add"><input class="inp" id="fg-n" list="fg-sug" placeholder="Comida, transporte…"><datalist id="fg-sug">${FI_GF_SUG.map(x=>`<option value="${x}">`).join("")}</datalist>
      <input class="inp" id="fg-m" type="number" inputmode="decimal" min="0" step="50" placeholder="$0"><select class="inp" id="fg-f"><option value="q">por quincena</option><option value="mes">por mes</option></select>
      <button class="btn sm" data-action="fi-gf-add">+ Agregar</button></div>
    ${L.length?`<p class="hint">Total aprox: <b class="num">${fiFmt(fiGastosAprox("quincenal"))}</b> por quincena · <b class="num">${fiFmt(fiGastosAprox("mensual"))}</b> al mes (sin contar deudas)</p>`:""}
    ${veredicto}${fondo}</div></section>`;
}

/* clases dadas y lo cobrado, semanal y quincenal */
function fiCobrosBlk(){
  const today=todayStr(), wk=fiPeriods("semanal",1)[0], qq=fiPeriods("quincenal",1)[0], mp=today.slice(0,7), mStart=mp+"-01";
  const cW=fiClasesEn(wk.start,wk.end), cQ=fiClasesEn(qq.start,qq.end), cM=fiClasesEn(mStart,today);
  const rW=fiRecibidoEn(wk.start,wk.end), rQ=fiRecibidoEn(qq.start,qq.end), rM=fiRecibidoEn(mStart,today);
  const pend=cbPendientes(), porCobrar=fiSum(pend,x=>x.est);
  const tile=(label,n,monto,rec)=>`<div class="fi-per"><div class="eyebrow">${label}</div>
    <div class="fi-per-row"><span class="fi-per-k">Clases dadas</span><span class="num">${n}</span></div>
    <div class="fi-per-row"><span class="fi-per-k">Estimado</span><span class="num">${fiFmt(monto)}</span></div>
    <div class="fi-per-row fi-per-rec"><span class="fi-per-k">Cobrado</span><b class="num">${fiFmt(rec.total)}</b></div>
    ${rec.pt?`<div class="hint" style="margin:0">incluye ${fiFmt(rec.pt)} de clientes PT</div>`:""}</div>`;
  const per=FI.cobroPer, P=fiPeriods(per,6);
  const rows=P.map(p=>{ const c=fiClasesEn(p.start,p.end), r=fiRecibidoEn(p.start,p.end);
    return `<div class="fi-trow ${p.actual?"cur":""}"><span>${p.label}${p.actual?` <span class="chip solid">en curso</span>`:""}</span><span class="num">${c.n}</span><span class="num">${fiFmt(c.monto)}</span><span class="num fi-ok">${fiFmt(r.total)}</span></div>`; }).join("");
  const pendHtml=pend.length?`<div class="sub-head"><h3>Por marcar como cobrado · ${fiFmt(porCobrar)}</h3></div><div class="fi-pend">${pend.slice(0,6).map(x=>{ const key=cbKey(x.tipo,x.studio,x.start), fecha=x.def&&x.def<today?x.def:today;
      return `<div class="fi-pend-row"><div>${x.tipo==="Q"?stChip("QUINCENAL"):stChip(x.studio)}<div class="hint" style="margin:2px 0 0">${esc(cbPeriodLabel(x))} · esperado ${fiFmt(x.est)}</div></div>
        <input class="inp" type="number" inputmode="decimal" id="fp-a-${esc(key)}" value="${x.est}" aria-label="Monto recibido"><input class="inp" type="date" id="fp-f-${esc(key)}" value="${fecha}" aria-label="Fecha">
        <button class="btn sm" data-action="fi-cobro-save" data-tipo="${x.tipo}" data-studio="${esc(x.studio||"")}" data-start="${x.start}" data-end="${x.end}">Marcar cobrado</button></div>`; }).join("")}</div>`:`<p class="hint">Todo lo cerrado ya está marcado como cobrado.</p>`;
  return `<section class="blk"><div class="blk-head"><div><h2>Clases y cobros</h2><p>Lo que diste y lo que ya te depositaron — viene directo de Clases</p></div><button class="link-btn" data-action="go" data-screen="hoy">abrir Clases →</button></div>
    <div class="fi-pers">${tile("Esta semana (lun–dom)",cW.n,cW.monto,rW)}${tile("Esta quincena",cQ.n,cQ.monto,rQ)}${tile("Este mes",cM.n,cM.monto,rM)}
      <div class="fi-per fi-per-warn"><div class="eyebrow">Por cobrar</div><div class="fi-per-big num ${porCobrar?"warn-num":""}">${fiFmt(porCobrar)}</div><div class="hint" style="margin:0">${pend.length?pend.length+" "+fiPl(pend.length,"período cerrado","períodos cerrados")+" sin marcar":"todo al día"}</div></div></div>
    <div class="card" style="margin-top:14px"><div class="fi-card-head"><h3>Historial</h3><div class="seg"><button class="${per==="semanal"?"on":""}" data-action="fi-cobro-per" data-per="semanal">Semanal</button><button class="${per==="quincenal"?"on":""}" data-action="fi-cobro-per" data-per="quincenal">Quincenal</button></div></div>
      <div class="fi-table"><div class="fi-trow fi-thead"><span>Periodo</span><span>Clases</span><span>Estimado</span><span>Cobrado</span></div>${rows}</div>
      <p class="hint">“Cobrado” es lo que te depositaron en ese periodo (se marca en Clases o aquí abajo); puede ser de clases de un periodo anterior.</p>${pendHtml}</div></section>`;
}

function fiDiagCard(){
  const d=fiDiag(), tone=p=>p>=18?"var(--ok)":p>=10?"var(--warn)":"var(--danger)";
  const sc=d.score==null?"var(--muted-2)":d.score>=60?"var(--ok)":d.score>=40?"var(--warn)":"var(--danger)";
  const ins=d.insights.length?d.insights.map(i=>{
    const btn=i.act?(i.act.tab?`<button class="btn sm" data-action="fi-goto" data-tab="${i.act.tab}" ${i.act.prefill?`data-prefill="${i.act.prefill}"`:""}>${esc(i.act.label)}</button>`:i.act.go?`<button class="btn sm" data-action="go" data-screen="${i.act.go}">${esc(i.act.label)}</button>`:`<button class="btn sm" data-action="${i.act.action}">${esc(i.act.label)}</button>`):"";
    return `<div class="fi-insight"><span class="fi-sev s${i.sev}">${i.sev===3?"Urgente":i.sev===2?"Ojo":"Bien"}</span><div><b>${esc(i.t)}</b><p>${esc(i.p)}</p>${btn}</div></div>`; }).join(""):`<p class="hint">Todo en orden por ahora.</p>`;
  return `<div class="card"><div class="fi-card-head"><h3>Tu diagnóstico</h3><span class="hint">salud financiera, 0–100</span></div>
    <div class="fi-score"><div class="fi-score-num" style="color:${sc}">${d.score==null?"—":d.score}</div><div><div class="strong" style="margin:0">${d.label}</div><div class="hint" style="margin:0">según deudas, fondo, crédito y ritmo de gasto</div></div></div>
    <div class="fi-parts">${d.parts.map(p=>`<div><div class="fi-part-top"><span>${p.name}</span><b>${esc(p.val)}</b></div><div class="fi-meter thin"><i style="width:${p.pts/25*100}%;background:${tone(p.pts)}"></i></div></div>`).join("")}</div>
    <div class="fi-insights">${ins}</div></div>`;
}

function fiPlanCard(){
  const c=fiCfg(), period=FI.planPeriod, p=fiPlan(period), m=p.model, has=p.base>0, basis=fiBasis();
  const s1=has?Math.min(100,p.deudas/p.base*100):0, s2=has?fiClamp(p.ahorro/p.base*100,0,100-s1):0, s3=has?Math.max(0,100-s1-s2):0;
  let ctx;
  if(period==="quincenal"){ const q=quincenaFor(todayStr(),0);
    ctx=m.qs.length?`${m.qs.length===1?"Tu última quincena completa":`Tus últimas ${m.qs.length} quincenas completas`}: ${m.qs.map(x=>fiFmt(x.total)).join(" · ")}. Esta quincena (${fiQLabel(q)}) llevas ${fiFmt(fiIncomeIn(q.startStr,todayStr()))}.`:"Todavía no hay una quincena completa con datos; el cálculo usa tu ritmo diario."; }
  else ctx="El ingreso mensual es el doble de tu ingreso quincenal base, salvo que lo escribas a mano.";
  const note=p.over?`<p class="hint" style="color:var(--danger)">Tus deudas de ${period==="quincenal"?"la quincena":"el mes"} (${fiFmt(p.deudas)}) superan tu ingreso. Hace falta más plazo, más ingreso o pagar menos por periodo en alguna.</p>`:(!has?`<p class="hint">Pon tu ingreso para ver el reparto.</p>`:"");
  return `<div class="card"><div class="fi-card-head"><h3>Plan de pago</h3><div class="seg"><button class="${period==="quincenal"?"on":""}" data-action="fi-plan-period" data-period="quincenal">Quincenal</button><button class="${period==="mensual"?"on":""}" data-action="fi-plan-period" data-period="mensual">Mensual</button></div></div>
    <p class="hint" style="margin-top:0">${ctx}</p>
    <div class="form-grid" style="grid-template-columns:1fr 130px;margin:12px 0 14px">
      <div><label class="mini">Ingreso ${period==="quincenal"?"quincenal":"mensual"} ${p.manual?'<span class="chip warn">manual</span>':'<span class="chip">automático</span>'}</label><input class="inp" type="number" inputmode="decimal" min="0" step="50" value="${Math.round(p.base)}" data-action="fi-plan-ingreso"></div>
      <div><label class="mini">Meta de ahorro %</label><input class="inp" type="number" inputmode="decimal" min="0" max="100" step="1" value="${p.pct}" data-action="fi-plan-pct"></div></div>
    ${has?`<div class="fi-planbar"><div style="width:${s1}%;background:var(--cardio)"></div><div style="width:${s2}%;background:var(--ok)"></div><div style="width:${s3}%;background:var(--accent)"></div></div>`:""}
    <div class="fi-legend"><span><i style="background:var(--cardio)"></i>Deudas ${fiFmt(p.deudas)}</span><span><i style="background:var(--ok)"></i>Ahorro ${fiFmt(p.ahorro)}</span><span><i style="background:var(--accent)"></i>Para gastar ${fiFmt(p.gasto)}</span></div>
    ${note}
    <div class="acts-row" style="margin-top:12px"><div class="seg"><button class="${c.modoBase==="minimo"?"":"on"}" data-action="fi-plan-modo" data-modo="promedio">Base: promedio</button><button class="${c.modoBase==="minimo"?"on":""}" data-action="fi-plan-modo" data-modo="minimo">Base: mi mínimo</button></div>
      <div class="seg"><button class="${basis==="devengado"?"on":""}" data-action="fi-plan-basis" data-basis="devengado">Lo que doy</button><button class="${basis==="cobrado"?"on":""}" data-action="fi-plan-basis" data-basis="cobrado">Lo que cobro</button></div>
      ${p.manual?`<button class="btn sm ghost" data-action="fi-plan-auto">Usar automático</button>`:""}</div>
    <p class="hint">“Lo que doy” cuenta tus clases confirmadas; “Lo que cobro” cuenta solo los cobros que marcaste. Con ingresos variables, “mi mínimo” arma el plan con tu peor quincena reciente: lo que entre de más es extra.</p></div>`;
}

function fiSimHtml(){
  const s=FI.sim, monto=Number(s.monto)||0, meses=Number(s.meses)||1;
  if(monto<=0) return `<p class="hint">Escribe cuánto cuesta y te muestro cómo pega en tu plan.</p>`;
  const r=fiSimulate(monto,meses,s.tarjeta), title={ok:"Cabe en tu plan",justo:"Se puede, pero queda ajustado",no:"Con tus números, hoy no cuadra","sin-plan":"Necesito tus ingresos para opinar"}[r.v];
  return `<div class="fi-verdict ${r.v}"><b>${title}</b><ul>${r.lines.map(l=>`<li>${esc(l)}</li>`).join("")}</ul></div>`;
}
function fiSimCard(){
  const cards=Object.keys(fiCfg().fuenteCortes);
  return `<div class="fi-card-head"><h3>¿Me conviene comprarlo?</h3><span class="hint">prueba antes de gastar</span></div>
    <div class="form-grid g3"><div><label class="mini">Precio</label><input class="inp" id="fs-monto" type="number" inputmode="decimal" min="0" step="50" placeholder="$0" value="${esc(FI.sim.monto)}" data-action="fi-sim"></div>
      <div><label class="mini">Pago</label><select class="inp" id="fs-meses" data-action="fi-sim">${[[1,"De contado"],[3,"3 meses"],[6,"6 meses"],[9,"9 meses"],[12,"12 meses"],[18,"18 meses"],[24,"24 meses"]].map(([v,l])=>`<option value="${v}" ${String(FI.sim.meses)===String(v)?"selected":""}>${l}</option>`).join("")}</select></div>
      <div><label class="mini">Tarjeta</label><select class="inp" id="fs-tarjeta" data-action="fi-sim"><option value="">Ninguna</option>${cards.map(k=>`<option value="${esc(k)}" ${FI.sim.tarjeta===k?"selected":""}>${esc(fiTitle(k))}</option>`).join("")}</select></div></div>
    <div id="fs-result" style="margin-top:12px">${fiSimHtml()}</div>`;
}

/* ---------- DEUDAS ---------- */
function fiViewDeudas(){
  const pM=fiPlan("mensual"), deudaMes=fiDeudaMensual(), act=fiDebtsActive(), D=FI_D().debts;
  const dti=pM.base>0?deudaMes/pM.base:null, maxM=act.length?Math.max(...act.map(d=>fiDebtStats(d).restantes)):0;
  let libre="—",libreSub=""; if(maxM>0){ const t=new Date(); t.setMonth(t.getMonth()+maxM); libre=maxM+" "+fiPl(maxM,"mes","meses"); libreSub=new Intl.DateTimeFormat("es-MX",{month:"long",year:"numeric"}).format(t); } else if(D.length) libre="¡Ya!";
  const dc=dti==null?"var(--ink)":dti>.35?"var(--danger)":dti>.2?"var(--warn)":"var(--ok)";
  const sorted=D.slice().sort((a,b)=>{ const x=fiDebtStats(a),y=fiDebtStats(b); return x.liquidada!==y.liquidada?(x.liquidada?1:-1):x.restantes-y.restantes; });
  const cards=sorted.map(d=>{ const st=fiDebtStats(d), pc=fiClamp(st.montoPagado/Math.max(st.miParte,1)*100,0,100);
    let fin=""; if(!st.liquidada){ const t=new Date(); t.setMonth(t.getMonth()+st.restantes); fin="Termina ~"+new Intl.DateTimeFormat("es-MX",{month:"short",year:"numeric"}).format(t).replace(/\./g,""); }
    return `<article class="fi-item click ${st.liquidada?"paid":""}" data-action="fi-debt-open" data-id="${esc(d.id)}" tabindex="0">
      <div class="fi-item-head"><span class="fi-tag">${esc(d.fuente||"—")}</span><span class="hint" style="margin:0">${st.restantes>0?`faltan ${st.restantes} ${fiPl(st.restantes,"pago","pagos")}`:"liquidada"}</span></div>
      <div class="strong" style="margin:0">${esc(d.concepto||"Sin descripción")}</div>
      ${st.compartida?`<div class="hint" style="margin:0">de ${fiFmt(st.montoTotal)} en total — tu parte: ${fiFmt(st.miParte)}</div>`:""}
      <div class="fi-meter thin"><i style="width:${pc}%;background:${st.liquidada?"var(--ok)":"var(--cardio)"}"></i></div>
      <div class="fi-item-meta"><span>${fiFmt(st.pagoMensual)} / mes · ${esc(fin)}</span><span class="num fi-big" style="color:${st.liquidada?"var(--ok)":"var(--danger)"}">${st.liquidada?"Liquidada":fiFmt(st.saldo)}</span></div>
      ${st.liquidada?"":`<div style="display:flex;justify-content:flex-end"><button class="btn sm" data-action="fi-debt-pay" data-id="${esc(d.id)}">+ Registrar pago (${fiFmt(Math.min(st.pagoMensual,st.saldo))})</button></div>`}</article>`; }).join("");
  const rated=act.filter(d=>d.tasa!=null&&d.tasa!==""); let strat="";
  if(act.length&&rated.length===act.length){ const mx=rated.slice().sort((a,b)=>(b.tasa||0)-(a.tasa||0))[0];
    strat=(mx.tasa||0)>0?`Referencia general: si te sobra dinero, la deuda con mayor tasa (${esc(mx.concepto||"la de mayor tasa")}, ${mx.tasa}%) es la que más te cuesta cada mes.`:"Referencia general: tus deudas registradas son sin intereses, así que adelantar pagos no te ahorra dinero; el dinero extra rinde más en tu fondo de emergencia."; }
  const atraso=act.map(d=>({d,x:fiDebtDebido(d)})).filter(o=>o.x.falta>=1), faltaTot=fiSum(atraso,o=>o.x.falta);
  const aviso=atraso.length?`<div class="fi-notice warn"><span><b>Por las fechas, ya debería estar pagado ${fiFmt(faltaTot)} más</b> (${atraso.map(o=>esc(o.d.concepto||"deuda")+" "+fiFmt(o.x.falta)).join(", ")}). Si ya lo pagaste, márcalo y quedas al corriente.</span><button class="btn sm primary" data-action="fi-debt-alcorriente">Ya pagué todo al corriente</button></div>`:"";
  return `<section class="blk"><div class="blk-head"><h2>Deudas</h2><button class="btn primary sm" data-action="fi-debt-add">+ Nueva deuda</button></div>
    ${aviso}<div class="tiles tiles-3" style="margin-top:14px"><div class="tile"><div class="label">Debes en total</div><div class="value num" style="color:var(--danger)">${fiFmt(fiSaldoDeudas())}</div></div>
      <div class="tile"><div class="label">Pagos al mes</div><div class="value num">${fiFmt(deudaMes)}</div><div class="foot">${dti==null?"":`<span style="color:${dc}">${fiPct(dti)}</span> de tu ingreso`}</div></div>
      <div class="tile"><div class="label">Libre de deudas en</div><div class="value num">${libre}</div><div class="foot">${esc(libreSub)}</div></div></div>
    <div class="grid-cards" style="margin-top:14px">${D.length?cards:`<p class="hint">Sin deudas registradas. Agrega una con “+ Nueva deuda”.</p>`}</div>${strat?`<p class="hint" style="margin-top:12px">${strat}</p>`:""}</section>${fiCortesBlk()}`;
}
function fiCortesBlk(){
  const keys=Object.keys(fiCfg().fuenteCortes);
  const cards=keys.map(key=>{ const c=fiCard(key), e=c.e, ok="corte:"+key;
    const chip=c.pagoD==null?"":`<span class="chip ${c.diasPago<=3?"warn":""}">Vence ${fmtCorto(c.pagoD)} · ${c.diasPago===0?"hoy":c.diasPago+" "+fiPl(c.diasPago,"día","días")}</span>`;
    const uc=c.util==null?"":c.util>=.75?"var(--danger)":c.util>=.5?"var(--warn)":"var(--ok)";
    return `<article class="fi-item"><div class="fi-item-head"><span class="fi-tag dark">${esc(fiTitle(key))}</span>${chip}</div>
      <div><div class="hint" style="margin:0">A pagar al corte</div><div class="num fi-big" style="color:${c.aPagar>0?"var(--danger)":"var(--muted-2)"}">${c.aPagar>0?fiFmt(c.aPagar):"Sin cargos"}</div>
        <div class="hint" style="margin:0">${c.msi>0?`${fiFmt(c.saldo)} del corte + ${fiFmt(c.msi)} en mensualidades`:"Actualiza el saldo cuando revises tu banco"}</div></div>
      ${c.util!=null?`<div><div class="fi-meter thin"><i style="width:${fiClamp(c.util*100,0,100)}%;background:${uc}"></i></div><div class="hint" style="margin:4px 0 0">${fiPct(c.util)} usado · disponible ~${fiFmt(c.disponible)} de ${fiFmt(c.limite)}</div></div>`:""}
      <details class="fi-more" data-det="${esc(ok)}" ${FI.open.has(ok)?"open":""}><summary>Ajustar datos de la tarjeta</summary>
        <div class="fi-mini">
          <span>Día de corte</span><input class="inp" type="number" min="1" max="31" value="${e.corte||""}" data-action="fi-corte-field" data-key="${esc(key)}" data-field="corte">
          <span>Día límite de pago</span><input class="inp" type="number" min="1" max="31" value="${e.pago||""}" placeholder="—" data-action="fi-corte-field" data-key="${esc(key)}" data-field="pago">
          <span>Saldo del corte $</span><input class="inp" type="number" min="0" step="0.01" value="${c.saldo.toFixed(2)}" data-action="fi-corte-field" data-key="${esc(key)}" data-field="saldoManual">
          <span>Límite de crédito $</span><input class="inp" type="number" min="0" step="100" value="${c.limite||""}" placeholder="—" data-action="fi-corte-field" data-key="${esc(key)}" data-field="limite"></div>
        ${c.auto>0?`<p class="hint">Incluye ${fiFmt(c.auto)} en gastos que marcaste a esta tarjeta desde tu último ajuste.</p>`:""}
        <button class="btn sm ghost" data-action="fi-corte-del" data-key="${esc(key)}">Quitar tarjeta</button></details></article>`; }).join("");
  return `<section class="blk"><div class="blk-head"><div><h2>Tarjetas y cortes</h2><p>cuánto pagar y cuándo</p></div></div>
    <div class="grid-cards">${keys.length?cards:`<p class="hint">Agrega una tarjeta con su día de corte para ver cuánto pagar.</p>`}</div>
    <div class="card" style="margin-top:14px"><div class="fi-card-head"><h3>Agregar tarjeta</h3></div><div class="form-grid g4">
      <div><label class="mini">Tarjeta</label><input class="inp" id="fc-fuente" list="fi-fuentes" placeholder="Ej. NU"></div><div><label class="mini">Día de corte</label><input class="inp" id="fc-corte" type="number" min="1" max="31"></div>
      <div><label class="mini">Día de pago</label><input class="inp" id="fc-pago" type="number" min="1" max="31"></div><div><label class="mini">Límite $</label><input class="inp" id="fc-limite" type="number" min="0" step="100"></div></div>
      <div class="acts-end"><button class="btn" data-action="fi-corte-add">+ Agregar</button></div><datalist id="fi-fuentes"><option value="NU"><option value="Banorte"><option value="Efectivo"></datalist></div></section>`;
}

/* ---------- GASTOS ---------- */
function fiMonthTx(k){ return fiTx().filter(t=>t.date.slice(0,7)===k); }
function fiViewGastos(){
  const k=FI.month, mt=fiMonthTx(k), ev=fiEvents().filter(e=>e.date.slice(0,7)===k);
  const ingreso=fiSum(ev,e=>e.amount), consumo=fiSum(mt.filter(fiIsConsumo),t=>t.amount), deudas=fiSum(mt.filter(t=>t.type==="expense"&&t.categoryId==="deudas"),t=>t.amount), ahorro=fiSum(mt.filter(t=>t.type==="expense"&&t.categoryId==="ahorro"),t=>t.amount);
  const libre=ingreso-consumo-deudas-ahorro, bas=fiBasis()==="cobrado"?"cobrado":"dado en clases";
  return `<div class="toolbar"><div class="pager"><button class="pg" data-action="fi-month" data-d="-1" aria-label="Mes anterior">←</button><span>${fiMonthLabel(k)}</span><button class="pg" data-action="fi-month" data-d="1" aria-label="Mes siguiente">→</button></div><span class="spacer"></span>
      <button class="btn sm ghost" data-action="fi-export">Exportar CSV</button><button class="btn primary sm" data-action="fi-add-tx">+ Movimiento</button></div>
    <div class="tiles tiles-4"><div class="tile"><div class="label">Ingresos</div><div class="value num" style="color:var(--ok)">${fiFmt(ingreso)}</div><div class="foot">${bas}</div></div>
      <div class="tile"><div class="label">Gastos</div><div class="value num" style="color:var(--danger)">${fiFmt(consumo)}</div><div class="foot">${ingreso>0?fiPct(consumo/ingreso)+" de tus ingresos":"sin contar deudas ni ahorro"}</div></div>
      <div class="tile"><div class="label">Pagos de deudas</div><div class="value num">${fiFmt(deudas)}</div><div class="foot">${ingreso>0?fiPct(deudas/ingreso)+" de tus ingresos":"este mes"}</div></div>
      <div class="tile"><div class="label">Ahorro aportado</div><div class="value num" style="color:var(--ok)">${fiFmt(ahorro)}</div><div class="foot">${ingreso>0?fiPct(ahorro/ingreso)+" de tus ingresos":"al fondo"}</div></div></div>
    <p class="fi-free">${ingreso>0?(libre>=0?`Te sobraron <b class="num">${fiFmt(libre)}</b> sin asignar este mes. Idea: mándalos al fondo o a deudas antes de que se gasten solos.`:`Este mes gastaste <b class="num" style="color:var(--danger)">${fiFmt(-libre)}</b> más de lo que entró.`):"Sin ingresos este mes todavía."}</p>
    <div class="fi-grid2 blk"><div class="card"><div class="fi-card-head"><h3>Ingresos vs. gastos</h3><span class="hint">últimos 6 meses</span></div>${fiTrend()}</div><div class="card"><div class="fi-card-head"><h3>Gastos por categoría</h3><span class="hint">${fiMonthLabel(k)}</span></div>${fiDonut()}</div></div>
    ${fiBudgets()}${fiAccounts()}${fiLedger()}`;
}
function fiTrend(){
  const months=[]; for(let i=5;i>=0;i--) months.push(fiShiftMonth(FI.month,-i));
  const rows=months.map(k=>({k,inc:fiSum(fiEvents().filter(e=>e.date.slice(0,7)===k),e=>e.amount),exp:fiSum(fiMonthTx(k).filter(t=>t.type==="expense"&&t.categoryId!=="ahorro"),t=>t.amount)}));
  const mx=Math.max(1,...rows.map(r=>Math.max(r.inc,r.exp)))*1.15, W=640,H=230,base=190,top=22; let s="";
  [0,.5,1].forEach(f=>{ const y=base-(base-top)*f/1.15; s+=`<line x1="34" y1="${y.toFixed(1)}" x2="${W}" y2="${y.toFixed(1)}" stroke="var(--hairline-soft)"/><text x="30" y="${(y+3).toFixed(1)}" text-anchor="end" font-family="IBM Plex Mono" font-size="9.5" fill="var(--muted-2)">${f===0?"$0":fiK(mx/1.15*f)}</text>`; });
  rows.forEach((r,i)=>{ const w=(W-34)/rows.length, gx=34+i*w, bW=w*.3, g=w*.06, hi=r.inc/mx*(base-top), he=r.exp/mx*(base-top), cur=r.k===FI.month;
    s+=`<rect x="${(gx+w/2-g/2-bW).toFixed(1)}" y="${(base-hi).toFixed(1)}" width="${bW.toFixed(1)}" height="${Math.max(0,hi).toFixed(1)}" rx="3" fill="var(--ok)"/><rect x="${(gx+w/2+g/2).toFixed(1)}" y="${(base-he).toFixed(1)}" width="${bW.toFixed(1)}" height="${Math.max(0,he).toFixed(1)}" rx="3" fill="var(--cardio)"/>`;
    s+=`<text x="${(gx+w/2).toFixed(1)}" y="${base+18}" text-anchor="middle" font-family="IBM Plex Mono" font-size="10.5" font-weight="${cur?700:400}" fill="${cur?"var(--ink)":"var(--muted-2)"}">${MESES[Number(r.k.slice(5))-1]}</text>`; });
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block" role="img" aria-label="Ingresos y gastos de los últimos 6 meses">${s}</svg>
    <div class="fi-legend"><span><i style="background:var(--ok)"></i>Ingresos</span><span><i style="background:var(--cardio)"></i>Gastos y pagos de deuda</span></div>`;
}
function fiDonut(){
  const cur=fiMonthTx(FI.month).filter(fiIsConsumo), prev=fiMonthTx(fiShiftMonth(FI.month,-1)).filter(fiIsConsumo), tot={}, pt={};
  cur.forEach(t=>tot[t.categoryId]=(tot[t.categoryId]||0)+t.amount); prev.forEach(t=>pt[t.categoryId]=(pt[t.categoryId]||0)+t.amount);
  const rows=Object.keys(tot).map(id=>({id,name:(fiCat(id)||{name:id}).name,amount:tot[id]})).sort((a,b)=>b.amount-a.amount), total=fiSum(rows,r=>r.amount), gasto=fiPlan("mensual").gasto;
  const cx=90,cy=90,r=68,sw=24,circ=2*Math.PI*r; let arcs="";
  if(total<=0) arcs=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--raised-2)" stroke-width="${sw}"/>`;
  else { let acc=0; rows.forEach(row=>{ const dash=row.amount/total*circ; arcs+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${fiCatColor(row.id).fg}" stroke-width="${sw}" stroke-dasharray="${dash.toFixed(2)} ${circ.toFixed(2)}" stroke-dashoffset="${(-acc).toFixed(2)}" transform="rotate(-90 ${cx} ${cy})"/>`; acc+=dash; }); }
  const svg=`<svg viewBox="0 0 180 180" style="width:170px;height:170px;flex:none" role="img" aria-label="Gastos por categoría">${arcs}<text x="${cx}" y="${cy-3}" text-anchor="middle" font-family="IBM Plex Mono" font-weight="600" font-size="15" fill="var(--ink)">${total>0?esc(fiFmt(total)):"—"}</text><text x="${cx}" y="${cy+14}" text-anchor="middle" font-family="Hanken Grotesk" font-size="10" fill="var(--muted-2)">gastado</text></svg>`;
  const list=rows.length?rows.map(row=>{ const bud=fiCfg().budgets[row.id]!=null, horm=!bud&&gasto>0&&row.amount>gasto*.25, p0=pt[row.id], dl=p0>0?row.amount/p0-1:null;
    const dh=dl!=null&&Math.abs(dl)>=.15?`<span class="fi-delta" style="color:${dl>0?"var(--danger)":"var(--ok)"}" title="vs. mes anterior">${dl>0?"▲":"▼"}${Math.round(Math.abs(dl)*100)}%</span>`:"";
    return `<div class="fi-donut-item"><span class="dot" style="background:${fiCatColor(row.id).fg}"></span><span class="name">${esc(row.name)}</span>${dh}${horm?`<span class="chip warn" title="Se lleva más de la cuarta parte de tu gasto mensual y no tiene presupuesto">alto</span>`:""}<span class="num amt">${fiFmt(row.amount)}</span><span class="hint" style="margin:0;min-width:30px;text-align:right">${total>0?Math.round(row.amount/total*100):0}%</span></div>`; }).join(""):`<p class="hint">Sin gastos registrados este mes.</p>`;
  return `<div class="fi-donut">${svg}<div class="fi-donut-list">${list}</div></div>`;
}
function fiBudgets(){
  const mt=fiMonthTx(FI.month).filter(fiIsConsumo), B=fiCfg().budgets, ids=Object.keys(B).filter(id=>B[id]!=null);
  const unt=fiCfg().categories.filter(c=>c.type==="expense"&&c.id!=="ahorro"&&c.id!=="deudas"&&!ids.includes(c.id));
  const rows=ids.map(id=>{ const c=fiCat(id)||{name:id}, sp=fiSum(mt.filter(t=>t.categoryId===id),t=>t.amount), b=Number(B[id]||0), pc=b>0?Math.min(100,sp/b*100):0, over=b>0&&sp>b;
    return `<div class="fi-brow"><div class="fi-bname">${esc(c.name)}</div><div class="fi-bmeter"><div class="fi-meter thin"><i style="width:${pc}%;background:${over?"var(--danger)":fiCatColor(id).fg}"></i></div><div class="hint num" style="margin:4px 0 0;color:${over?"var(--danger)":"var(--muted-2)"}">${fiFmt(sp)}${b>0?" / "+fiFmt(b):" · sin límite"}</div></div>
      <div class="fi-bctl"><span class="hint" style="margin:0">$</span><input class="inp fi-sm" type="number" min="0" step="50" value="${b||0}" data-action="fi-budget-amount" data-cat="${esc(id)}" aria-label="Presupuesto ${esc(c.name)}"><button class="del" data-action="fi-budget-del" data-cat="${esc(id)}" aria-label="Quitar presupuesto">✕</button></div></div>`; }).join("");
  return `<section class="blk"><div class="blk-head"><h2>Presupuestos</h2><button class="btn sm" data-action="fi-budget-auto">Sugerir según mi plan</button></div><div class="card">
    ${rows||`<p class="hint">Sin presupuestos todavía. Agrega uno abajo o deja que los sugiera según tu plan y lo que ya gastas.</p>`}
    <div class="form-grid g3" style="margin-top:14px"><div><label class="mini">Categoría</label><select class="inp" id="fb-cat">${unt.length?unt.map(c=>`<option value="${esc(c.id)}">${esc(c.name)}</option>`).join(""):`<option value="">Ya agregaste todas</option>`}</select></div>
      <div><label class="mini">Tope mensual</label><input class="inp" id="fb-monto" type="number" min="0" step="50" placeholder="$0"></div><div><label class="mini">&nbsp;</label><button class="btn ghost" style="width:100%" data-action="fi-budget-add" ${unt.length?"":"disabled"}>+ Agregar</button></div></div></div></section>`;
}
function fiAcctBalance(a){
  const since=a.saldoDesde||"0000-00-00", cobroAcct=fiCfg().cuentaCobros||"debito";
  const man=fiTx().filter(t=>t.accountId===a.id&&t.date>=since);
  let cash=0; if(a.id===cobroAcct) cash=fiSum(fiEvents("cobrado").filter(e=>e.date>=since),e=>e.amount);
  return Number(a.saldoInicial||0)+fiSum(man.filter(t=>t.type==="income"),t=>t.amount)-fiSum(man.filter(t=>t.type==="expense"),t=>t.amount)+(a.id===cobroAcct?cash-fiSum(fiTx().filter(t=>t.type==="income"&&t.accountId===a.id&&t.date>=since),t=>t.amount):0);
}
function fiAccounts(){
  const accs=fiCfg().accounts, total=fiSum(accs,fiAcctBalance);
  return `<section class="blk"><div class="blk-head"><div><h2>Cuentas</h2><p>saldo total <b class="num" style="color:var(--ink)">${fiFmt(total)}</b></p></div></div>
    <div class="grid-cards">${accs.map((a,i)=>{ const b=fiAcctBalance(a); return `<div class="fi-item"><div class="hint" style="margin:0;text-transform:uppercase;letter-spacing:.06em;font-weight:700">${esc(a.name)}</div><div class="num fi-big" style="color:${b<0?"var(--danger)":"var(--ink)"}">${fiFmt(b)}</div>
      <div class="fi-item-meta"><span>Saldo inicial $</span><input class="inp fi-sm" type="number" step="0.01" value="${a.saldoInicial||0}" data-action="fi-cuenta-saldo" data-i="${i}" aria-label="Saldo inicial ${esc(a.name)}"></div></div>`; }).join("")}</div>
    <p class="hint">El saldo suma tus movimientos y lo que cobras (a ${esc((fiAcct(fiCfg().cuentaCobros||"debito")||{name:"débito"}).name)}). Pon tu saldo inicial real para que coincida con tu banco.</p></section>`;
}
function fiLedgerRows(){
  const k=FI.month, q=FI.filter.trim().toLowerCase(), rows=[];
  fiMonthTx(k).forEach(t=>rows.push({kind:"tx",t,date:t.date,type:t.type,text:(t.note||"")+" "+((fiCat(t.categoryId)||{}).name||"")}));
  const agg={}; fiEvents().filter(e=>e.src!=="manual"&&e.date.slice(0,7)===k).forEach(e=>{ const key=e.date+"|"+e.src+"|"+e.estudio, o=agg[key]||(agg[key]={date:e.date,src:e.src,estudio:e.estudio,amount:0,n:0}); o.amount+=e.amount; o.n+=e.clases||1; });
  Object.values(agg).forEach(o=>rows.push({kind:"ev",o,date:o.date,type:"income",text:o.estudio+" clases cobro"}));
  return rows.filter(r=>(FI.ftype==="all"||r.type===FI.ftype)&&(!q||r.text.toLowerCase().includes(q))).sort((a,b)=>b.date.localeCompare(a.date));
}
function fiLedgerHtml(){
  const L=fiLedgerRows();
  return L.length?L.map(r=>{ const d=parseLocalDate(r.date), dow=DIAS[d.getDay()].slice(0,3).toLowerCase();
    if(r.kind==="ev"){ const o=r.o; return `<div class="fi-lrow ro" data-action="go" data-screen="hoy" title="Ver en Clases"><div class="fi-ldate"><b>${pad(d.getDate())}</b>${dow}</div><div><div class="fi-lnote">${esc(o.estudio)}${o.src==="clases"?` · ${o.n} ${fiPl(o.n,"clase","clases")}`:""}</div><div class="fi-lmeta"><span class="chip">${o.src==="clases"?"clases":o.src==="cobro"?"cobro":o.src==="freelance"?"proyecto":"clientes PT"}</span></div></div><div class="fi-lacc"></div><div class="num fi-lamt income">+${fiFmt(o.amount)}</div><span></span></div>`; }
    const t=r.t, c=fiCat(t.categoryId)||{name:"Sin categoría"}, a=fiAcct(t.accountId)||{name:"—"}, col=fiCatColor(t.categoryId);
    return `<div class="fi-lrow" data-action="fi-open-tx" data-id="${esc(t.id)}" tabindex="0"><div class="fi-ldate"><b>${pad(d.getDate())}</b>${dow}</div><div><div class="fi-lnote">${esc(t.note||c.name)}</div><div class="fi-lmeta"><span class="fi-pill" style="color:${col.fg};background:${col.bg}">${esc(c.name)}</span>${t.recurring?`<span class="chip">recurrente</span>`:""}${t.corteKey?`<span class="chip">${esc(fiTitle(t.corteKey))}</span>`:""}</div></div>
      <div class="fi-lacc">${esc(a.name)}</div><div class="num fi-lamt ${t.type}">${t.type==="income"?"+":"−"}${fiFmt(t.amount)}</div><button class="del" data-action="fi-del-tx" data-id="${esc(t.id)}" aria-label="Eliminar movimiento">✕</button></div>`; }).join(""):`<p class="hint" style="padding:14px 0">No hay movimientos que coincidan. Agrega uno con “+ Movimiento”.</p>`;
}
function fiLedger(){
  return `<section class="blk"><div class="blk-head"><h2>Movimientos</h2><p id="fl-count">${fiLedgerRows().length} movimientos</p></div><div class="card">
    <div class="toolbar" style="margin-bottom:8px"><input class="inp" style="flex:1;min-width:160px" type="search" placeholder="Buscar por nota o categoría…" value="${esc(FI.filter)}" data-action="fi-search" aria-label="Buscar movimientos"><div class="seg">${[["all","Todos"],["income","Ingresos"],["expense","Gastos"]].map(([v,l])=>`<button class="${FI.ftype===v?"on":""}" data-action="fi-ftype" data-t="${v}">${l}</button>`).join("")}</div></div>
    <div class="fi-ledger" id="fl-list">${fiLedgerHtml()}</div></div></section>`;
}

/* ---------- CRECER ---------- */
function fiViewCrecer(){ return fiFondo_()+fiIngresosBlk()+fiFreelanceBlk()+fiDatosBlk(); }
function fiFlWhatHtml(){
  const s=fiFlStats(), n=Number(FI.flN)||0, m=Number(FI.flMonto)||s.prom||0, pM=fiPlan("mensual");
  if(!(m>0)) return `<p class="hint">Pon el monto de un proyecto (por ejemplo lo que sueles cotizar) para ver cuánto sumaría.</p>`;
  const total=n*m, base=pM.base;
  return `<p class="hint" style="font-size:13.5px;color:var(--ink-dim)">${n} ${fiPl(n,"proyecto cerrado","proyectos cerrados")} al mes de ~${fiFmt(m)} = <b class="num" style="color:var(--ok)">+${fiFmt(total)}</b> al mes${base>0?` (${fiPct(total/base)} de tu ingreso mensual actual)`:""}.${s.tasa!=null?` Con tu tasa de cierre (${fiPct(s.tasa)}) necesitarías cotizar ~${Math.ceil(n/Math.max(s.tasa,.05))} al mes.`:" Aún no tengo suficientes cotizaciones decididas para calcular tu tasa de cierre."}</p>`;
}
function fiFreelanceBlk(){
  const s=fiFlStats(), Q=s.fl.cotizaciones.slice().sort((a,b)=>(b.ts||0)-(a.ts||0)).slice(0,6);
  const cobroDe=q=>s.fl.cobros.find(c=>c.folio===q.folio);
  const chip=e=>`<span class="chip ${e==="Pagada"||e==="Aceptada"?"ok":e==="Rechazada"?"warn":"info"}">${esc(e||"Enviada")}</span>`;
  const lista=Q.map(q=>{ const c=cobroDe(q), deb=c?Math.max(0,(c.mxn||0)-(c.pagado||0)):null;
    return `<div class="fi-srow"><span><span class="strong" style="margin:0">${esc(q.cliente||"Sin cliente")}</span><span class="hint" style="margin:0"> · ${esc(q.proyecto||q.folio)}</span></span><span>${chip(q.estado)}</span><span class="num" style="text-align:right">${fiFmt(q.mxn||0)}</span>${c?`<div class="hint" style="grid-column:1/-1;margin:0">${deb>0?"por cobrar "+fiFmt(deb):"cobrado completo"}</div>`:""}</div>`; }).join("");
  const kpi=(l,v,f)=>`<div class="fi-per"><div class="eyebrow">${l}</div><div class="fi-per-big num">${v}</div><div class="hint" style="margin:0">${f}</div></div>`;
  return `<section class="blk"><div class="blk-head"><div><h2>Proyectos freelance</h2><p>cotizaciones y cobros de Potenciador de Conceptos</p></div><a class="link-btn" href="${FI_POT}" target="_blank" rel="noopener">abrir Potenciador →</a></div>
    ${s.hay?`<div class="fi-pers">${kpi("Cotizado en espera",fiFmt(fiSum(s.enviadas,q=>q.mxn||0)),s.enviadas.length+" "+fiPl(s.enviadas.length,"cotización","cotizaciones"))}${kpi("Aceptado",fiFmt(fiSum(s.cerradas,q=>q.mxn||0)),s.cerradas.length+" "+fiPl(s.cerradas.length,"proyecto","proyectos"))}${kpi("Por cobrar",fiFmt(s.porCobrar),"ya ganado, aún no entra")}${kpi("Cobrado este mes",fiFmt(s.cobradoMes),fiFmt(s.cobradoTotal)+" en total")}</div>
      <div class="card" style="margin-top:14px"><div class="fi-card-head"><h3>Últimas cotizaciones</h3>${s.tasa!=null?`<span class="hint">tasa de cierre ${fiPct(s.tasa)}</span>`:""}</div>${lista||`<p class="hint">Sin cotizaciones guardadas todavía.</p>`}</div>`
    :`<div class="card"><p class="hint" style="margin:0;font-size:13.5px;color:var(--ink-dim)">Todavía no hay proyectos aquí. Cuando guardes una cotización o un cobro en <b>Potenciador de Conceptos</b> (Cotizador freelance y Cobros) aparece solo: abre esa app una vez en este dispositivo y se conecta. Los pagos que registres ahí cuentan como ingreso en tu plan.</p></div>`}
    <div class="card" style="margin-top:14px"><div class="fi-card-head"><h3>¿Y si caen proyectos?</h3><span class="hint">calculadora</span></div>
      <div class="form-grid"><div><label class="mini">Proyectos cerrados al mes</label><input class="inp" id="fl-n" type="number" inputmode="numeric" min="0" max="20" step="1" value="${esc(FI.flN)}" data-action="fi-flwhat"></div>
        <div><label class="mini">Monto por proyecto $</label><input class="inp" id="fl-m" type="number" inputmode="decimal" min="0" step="500" placeholder="${s.prom?Math.round(s.prom):"ej. lo que sueles cotizar"}" value="${esc(FI.flMonto)}" data-action="fi-flwhat"></div></div>
      <div id="fl-result" style="margin-top:8px">${fiFlWhatHtml()}</div></div></section>`;
}
function fiFondo_(){
  const c=fiCfg(), ah=fiFondo(), meta=Number(c.fondoMeta||0), esencial=fiDeudaMensual()+fiConsumoProm(), sug=Math.round(esencial*3/100)*100;
  const meses=esencial>0?ah/esencial:null, pc=meta>0?fiClamp(ah/meta*100,0,100):0, pQ=fiPlan("quincenal"), q=quincenaFor(todayStr(),0);
  const aportQ=fiSum(fiTxIn(q.startStr,todayStr()).filter(t=>t.type==="expense"&&t.categoryId==="ahorro"),t=>t.amount);
  return `<section class="blk"><div class="blk-head"><div><h2>Fondo de emergencia</h2><p>tu colchón si algo sale mal</p></div></div><div class="card">
    <div class="fi-fondo-top"><div class="num fi-big2">${fiFmt(ah)}<span class="hint" style="margin:0 0 0 6px"> ${meta>0?"de "+fiFmt(meta):"ahorrados"}</span></div><label class="hint" style="display:flex;align-items:center;gap:6px;margin:0">meta $ <input class="inp fi-sm" style="width:110px" type="number" min="0" step="100" value="${meta||""}" placeholder="—" data-action="fi-fondo-meta" aria-label="Meta del fondo"></label></div>
    <div class="fi-meter"><i style="width:${pc}%;background:var(--ok)"></i></div>
    <p class="hint">${meta>0?`${Math.round(pc)}% de tu meta${ah>=meta?" — ¡cumplida!":""}`:"Ponle una meta para ver tu avance."}${meses!=null?` · cubre ${meses.toFixed(1)} ${fiPl(Math.round(meses*10)/10,"mes","meses")} de tus gastos esenciales`:""}</p>
    ${sug>0&&!meta?`<p class="hint">Meta sugerida: <b class="num">${fiFmt(sug)}</b> (3 meses de tus deudas + gastos). <button class="btn sm" data-action="fi-fondo-sugerida" data-v="${sug}">Usar</button></p>`:""}
    ${pQ.ahorro>0?`<p class="hint">Tu plan pide <b class="num">${fiFmt(pQ.ahorro)}</b> esta quincena; llevas <b class="num">${fiFmt(aportQ)}</b>${aportQ>=pQ.ahorro?" — cumplido.":" — te faltan "+fiFmt(pQ.ahorro-aportQ)+"."}</p>`:""}
    <div class="form-grid g3" style="margin-top:12px"><div><label class="mini">Monto que aportas</label><input class="inp" id="ff-monto" type="number" inputmode="decimal" min="0" step="50" placeholder="$0"></div>
      <div><label class="mini">Sale de</label><select class="inp" id="ff-cuenta">${c.accounts.map(a=>`<option value="${esc(a.id)}" ${a.id==="debito"?"selected":""}>${esc(a.name)}</option>`).join("")}</select></div><div><label class="mini">&nbsp;</label><button class="btn primary" style="width:100%" data-action="fi-fondo-add">+ Aportar</button></div></div></div></section>`;
}
function fiWhatIfHtml(){
  const tarifa=fiAvgRate(), n=Number(FI.whatif)||0, pM=fiPlan("mensual");
  if(tarifa<=0) return `<p class="hint">Marca algunas clases para calcular.</p>`;
  const extra=n*tarifa*52/12;
  return `<p class="hint" style="font-size:13.5px;color:var(--ink-dim)">${n} ${fiPl(n,"clase extra","clases extra")} por semana a ~${fiFmt(tarifa)} cada una = <b class="num" style="color:var(--ok)">+${fiFmt(extra)}</b> al mes (${fiFmt(extra/2)} por quincena). Con tu meta de ahorro (${pM.pct}%), ${fiFmt(extra*pM.pct/100)} serían para el fondo.</p>`;
}
function fiIngresosBlk(){
  const ip=fiPorEstudio(60), tarifa=fiAvgRate(), pM=fiPlan("mensual"), deudaMes=fiDeudaMensual(), m=fiModel(), c=fiCfg();
  const span=m.first?Math.min(60,fiDays(m.first,todayStr())+1):60, porSem=span>0?ip.clases/(span/7):0;
  const mejor=ip.rows.filter(r=>r.src==="clases").sort((a,b)=>b.prom-a.prom)[0], meta=Number(c.metaIngreso||0), falta=meta>pM.base?meta-pM.base:0;
  const rows=ip.rows.map(r=>`<div class="fi-srow"><span class="strong" style="margin:0">${esc(r.estudio)}</span><span class="hint" style="margin:0;text-align:right">${r.clases>0?r.clases+" "+fiPl(r.clases,"clase","clases")+" · "+fiFmt(r.prom)+" c/u":"pagos"}</span><span class="num" style="text-align:right">${fiFmt(r.total)}</span><div class="fi-meter thin" style="grid-column:1/-1"><i style="width:${r.share*100}%;background:${fiCatColor(r.estudio).fg}"></i></div></div>`).join("");
  return `<section class="blk"><div class="blk-head"><div><h2>Cómo generar más ingreso</h2><p>tus últimos 60 días</p></div></div><div class="card">
    ${ip.rows.length?rows:`<p class="hint">Aún no hay ingresos en los últimos 60 días.</p>`}
    ${ip.rows.length?`<p class="hint" style="margin-top:10px;font-size:13.5px;color:var(--ink-dim)">Das ~${porSem.toFixed(1)} clases por semana. ${mejor?`Tu estudio mejor pagado por clase es <b>${esc(mejor.estudio)}</b> (${fiFmt(mejor.prom)}).`:""} ${tarifa>0&&deudaMes>0?`Tus pagos de deuda equivalen a ~${(deudaMes/tarifa).toFixed(1)} clases al mes.`:""}</p>`:""}
    <div class="sub-head"><h3>¿Y si das más clases?</h3></div>
    <div class="form-grid" style="grid-template-columns:170px"><div><label class="mini">Clases extra por semana</label><input class="inp" id="fw-n" type="number" inputmode="numeric" min="0" max="30" step="1" value="${esc(FI.whatif)}" data-action="fi-whatif"></div></div>
    <div id="fw-result" style="margin-top:8px">${fiWhatIfHtml()}</div>
    <div class="sub-head"><h3>Meta de ingreso mensual</h3></div>
    <div class="form-grid" style="grid-template-columns:200px"><div><label class="mini">Quiero ganar al mes</label><input class="inp" type="number" inputmode="decimal" min="0" step="500" placeholder="$0" value="${meta||""}" data-action="fi-meta-ingreso"></div></div>
    ${meta>0?`<p class="hint" style="margin-top:10px;font-size:13.5px;color:var(--ink-dim)">${falta>0&&tarifa>0?`Tu base actual es ${fiFmt(pM.base)}: te faltan <b class="num">${fiFmt(falta)}</b>, unas <b>${(falta/(tarifa*52/12)).toFixed(1)}</b> clases más por semana a tu tarifa promedio.`:`Tu base actual (${fiFmt(pM.base)}) ya cubre esa meta.`}</p>`:""}</div></section>`;
}
function fiDatosBlk(){
  const f=FI_D(), vacio=!f.debts.length&&!f.tx.length&&!Object.keys(f.cfg).length;
  return `<section class="blk"><div class="blk-head"><div><h2>Mis datos</h2><p>${vacio?"Aún no hay datos de finanzas aquí":f.debts.length+" deudas · "+f.tx.length+" movimientos"}</p></div></div><div class="card">
    <p class="hint" style="margin-top:0">Si ya llevabas tus finanzas en Libro Mayor, impórtalas una sola vez con el archivo <b>libro-mayor-datos.json</b>. Lo que ya exista no se duplica. Tus clases y cobros no se importan: ya vienen de Clases.</p>
    <div class="acts-row"><button class="btn" data-action="fi-import">Importar archivo de Libro Mayor</button><button class="btn ghost" data-action="fi-export">Exportar movimientos (CSV)</button></div>
    <input type="file" id="fi-file" accept="application/json,.json" data-action="fi-import-file" hidden></div></section>`;
}

/* ============================================================
   MODALES
   ============================================================ */
function fiModal(md){
  if(md.type==="fi-tx") return fiModalTx(md);
  if(md.type==="fi-debt") return fiModalDebt(md);
  return "";
}
function fiCatOpts(type,sel){ return fiCfg().categories.filter(c=>c.type===type).map(c=>`<option value="${esc(c.id)}" ${c.id===sel?"selected":""}>${esc(c.name)}</option>`).join(""); }
function fiModalTx(md){
  const ex=md.id?fiTx().find(t=>t.id===md.id):null, p=ex||md.preset||{}, type=p.type||"expense", c=fiCfg();
  return modalShell(ex?"Editar movimiento":"Nuevo movimiento",`
    <div class="seg big" style="margin-bottom:14px" id="fx-type"><button data-action="fi-type" data-v="income" class="${type==="income"?"on":""}">Ingreso</button><button data-action="fi-type" data-v="expense" class="${type==="expense"?"on":""}">Gasto</button></div>
    <div class="form-grid"><div><label class="mini">Monto</label><input class="inp" id="fx-amount" type="number" inputmode="decimal" min="0" step="0.01" value="${p.amount||""}"></div>
      <div><label class="mini">Fecha</label><input class="inp" id="fx-date" type="date" value="${p.date||todayStr()}"></div>
      <div class="full"><label class="mini">Categoría</label><select class="inp" id="fx-cat">${fiCatOpts(type,p.categoryId)}</select></div>
      <div><label class="mini">Cuenta</label><select class="inp" id="fx-acc">${c.accounts.map(a=>`<option value="${esc(a.id)}" ${(p.accountId||"debito")===a.id?"selected":""}>${esc(a.name)}</option>`).join("")}</select></div>
      <div><label class="mini">Tarjeta con corte (opcional)</label><select class="inp" id="fx-corte"><option value="">Ninguna</option>${Object.keys(c.fuenteCortes).map(k=>`<option value="${esc(k)}" ${p.corteKey===k?"selected":""}>${esc(fiTitle(k))}</option>`).join("")}</select></div>
      <div class="full"><label class="mini">Nota</label><input class="inp" id="fx-note" placeholder="Opcional" value="${esc(p.note||"")}"></div>
      <div class="full"><label class="switch"><input type="checkbox" id="fx-rec" ${p.recurring?"checked":""}><span class="track"></span>Es un movimiento recurrente</label></div></div>
    <p class="hint" id="fx-hint" style="margin-top:10px">Las clases que das y los cobros no se anotan aquí: se marcan en Clases.</p>`,
    `${ex?`<button class="btn ghost" data-action="fi-tx-del" data-id="${esc(ex.id)}">Eliminar</button>`:""}<button class="btn ghost" data-action="close-modal">Cancelar</button><button class="btn primary" data-action="fi-tx-save" data-id="${ex?esc(ex.id):""}">Guardar</button>`);
}
function fiModalDebt(md){
  const ex=md.id?FI_D().debts.find(d=>d.id===md.id):null, st=ex?fiDebtStats(ex):null;
  return modalShell(ex?"Editar deuda":"Nueva deuda",`
    <div class="form-grid"><div><label class="mini">Tarjeta / fuente</label><input class="inp" id="fd-fuente" list="fi-fuentes" value="${esc(ex?ex.fuente:"")}"></div><div><label class="mini">Fecha de inicio</label><input class="inp" id="fd-fecha" type="date" value="${esc(ex?ex.fechaInicio:todayStr())}"></div>
      <div class="full"><label class="mini">Concepto</label><input class="inp" id="fd-concepto" placeholder="Ej. Laptop, viaje, préstamo…" value="${esc(ex?ex.concepto:"")}"></div>
      <div><label class="mini">Monto total</label><input class="inp" id="fd-monto" type="number" inputmode="decimal" min="0" step="0.01" value="${ex?ex.montoTotal:""}"></div><div><label class="mini">Meses totales</label><input class="inp" id="fd-meses" type="number" inputmode="numeric" min="1" step="1" value="${ex?ex.meses:12}"></div>
      <div class="full"><label class="mini">Tu parte (si la compartes)</label><input class="inp" id="fd-miparte" type="number" inputmode="decimal" min="0" step="0.01" placeholder="Vacío si es toda tuya" value="${ex&&ex.miParte!=null?ex.miParte:""}"></div>
      <div><label class="mini">Ya llevas pagado (tu parte)</label><input class="inp" id="fd-pagado" type="number" inputmode="decimal" min="0" step="0.01" value="${st?fiR2(st.montoPagado):0}"></div><div><label class="mini">Tasa anual % (0 = sin intereses)</label><input class="inp" id="fd-tasa" type="number" inputmode="decimal" min="0" step="0.1" placeholder="Opcional" value="${ex&&ex.tasa!=null?ex.tasa:""}"></div>
      <div class="full"><label class="mini">Notas</label><input class="inp" id="fd-notas" placeholder="Opcional" value="${esc(ex?ex.notas:"")}"></div></div>`,
    `${ex?`<button class="btn ghost" data-action="fi-debt-del" data-id="${esc(ex.id)}">Eliminar</button>`:""}<button class="btn ghost" data-action="close-modal">Cancelar</button><button class="btn primary" data-action="fi-debt-save" data-id="${ex?esc(ex.id):""}">Guardar</button>`);
}

/* ============================================================
   ACCIONES
   ============================================================ */
const fiV=id=>{ const el=document.getElementById(id); return el?el.value:""; };
function fiCsv(){
  const rows=[["Fecha","Tipo","Origen","Categoría","Cuenta","Monto","Nota"]];
  fiEvents().filter(e=>e.src!=="manual").forEach(e=>rows.push([e.date,"Ingreso",e.src==="clases"?"Clases":e.src==="cobro"?"Cobro":e.src==="freelance"?"Proyecto freelance":"Clientes PT","","",e.amount,e.estudio]));
  fiTx().forEach(t=>rows.push([t.date,t.type==="income"?"Ingreso":"Gasto","Manual",(fiCat(t.categoryId)||{}).name||"",(fiAcct(t.accountId)||{}).name||"",t.amount,t.note||""]));
  rows.sort((a,b)=>a===rows[0]?-1:b===rows[0]?1:String(a[0]).localeCompare(String(b[0])));
  return rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
}
function fiNewTx(o){ const t={id:newId("f"),createdAt:nowISO(),...o}; fiTx().push(t); touch(); return t; }

function fiClick(a,t){
  const c=fiCfg(), D=FI_D();
  if(a==="fi-tab"){ FI.tab=t.dataset.tab; render(); window.scrollTo(0,0); return true; }
  if(a==="fi-goto"){ FI.tab=t.dataset.tab; render(); window.scrollTo(0,0); if(t.dataset.prefill){ const i=document.getElementById("ff-monto"); if(i){ i.value=t.dataset.prefill; i.focus(); } } return true; }
  if(a==="fi-add-tx"){ state.modal={type:"fi-tx",id:null}; renderOverlay(); return true; }
  if(a==="fi-open-tx"){ state.modal={type:"fi-tx",id:t.dataset.id}; renderOverlay(); return true; }
  if(a==="fi-type"){
    const type=t.dataset.v; document.querySelectorAll("#fx-type button").forEach(b=>b.classList.toggle("on",b.dataset.v===type));
    document.getElementById("fx-cat").innerHTML=fiCatOpts(type); return true; }
  if(a==="fi-tx-save"){
    const amount=Number(fiV("fx-amount")); if(!(amount>0)){ toast("Ingresa un monto válido"); return true; }
    const type=(document.querySelector("#fx-type button.on")||{dataset:{v:"expense"}}).dataset.v, id=t.dataset.id, ex=id?fiTx().find(x=>x.id===id):null;
    const data={type,amount,categoryId:fiV("fx-cat"),accountId:fiV("fx-acc"),corteKey:fiV("fx-corte")||null,date:fiV("fx-date")||todayStr(),note:fiV("fx-note").trim(),recurring:document.getElementById("fx-rec").checked};
    if(ex) Object.assign(ex,data); else fiNewTx(data);
    touch(); closeModal(); render(); toast(ex?"Movimiento actualizado":"Movimiento agregado"); return true; }
  if(a==="fi-tx-del"||a==="fi-del-tx"){
    const L=fiTx(), i=L.findIndex(x=>x.id===t.dataset.id); if(i<0) return true; const [x]=L.splice(i,1); touch(); if(a==="fi-tx-del") closeModal(); render();
    toastUndo("Movimiento eliminado",()=>{ L.splice(Math.min(i,L.length),0,x); touch(); render(); }); return true; }
  if(a==="fi-month"){ FI.month=fiShiftMonth(FI.month,Number(t.dataset.d)); render(); return true; }
  if(a==="fi-ftype"){ FI.ftype=t.dataset.t; render(); return true; }
  if(a==="fi-export"){
    const el=document.createElement("a"); el.href=URL.createObjectURL(new Blob([fiCsv()],{type:"text/csv;charset=utf-8"})); el.download="finanzas-"+todayStr()+".csv"; document.body.appendChild(el); el.click(); el.remove(); toast("CSV exportado"); return true; }
  if(a==="fi-plan-period"){ FI.planPeriod=t.dataset.period; render(); return true; }
  if(a==="fi-plan-modo"){ fiSet({modoBase:t.dataset.modo==="minimo"?"minimo":"promedio"}); return true; }
  if(a==="fi-plan-basis"){ fiSet({baseIngreso:t.dataset.basis==="cobrado"?"cobrado":"devengado"}); return true; }
  if(a==="fi-plan-auto"){ fiDelCfg(FI.planPeriod==="quincenal"?["ingresoQuincenalManual"]:["ingresoMensualManual"],"Usando tu ingreso automático"); return true; }
  if(a==="fi-cobro-per"){ FI.cobroPer=t.dataset.per; render(); return true; }
  if(a==="fi-cobro-save"){
    const d=t.dataset, key=cbKey(d.tipo,d.studio,d.start), amt=document.getElementById("fp-a-"+key), fec=document.getElementById("fp-f-"+key);
    if(!amt||amt.value===""||!(Number(amt.value)>=0)){ toast("Escribe cuánto recibiste"); return true; }
    if(!cbGet(key)) cbList().push({id:key,tipo:d.tipo,studio:d.tipo==="Q"?null:d.studio,start:d.start,end:d.end,recibido:Number(amt.value),fecha:(fec&&fec.value)||todayStr(),creado:nowISO()});
    touch(); render(); toast("Cobro registrado · "+money(Number(amt.value))); return true; }
  if(a==="fi-debt-add"){ state.modal={type:"fi-debt",id:null}; renderOverlay(); return true; }
  if(a==="fi-debt-open"){ state.modal={type:"fi-debt",id:t.dataset.id}; renderOverlay(); return true; }
  if(a==="fi-debt-save"){
    const monto=Number(fiV("fd-monto")), fuente=fiV("fd-fuente").trim(); if(!(monto>0)||!fuente){ toast("Completa la tarjeta/fuente y un monto válido"); return true; }
    const mp=fiV("fd-miparte"), tasa=fiV("fd-tasa"), ex=t.dataset.id?D.debts.find(d=>d.id===t.dataset.id):null;
    const data={fuente,concepto:fiV("fd-concepto").trim(),montoTotal:monto,meses:Math.max(1,Math.round(Number(fiV("fd-meses")))||1),miParte:mp===""?null:Math.max(0,Number(mp)||0),
      montoPagado:Math.max(0,Number(fiV("fd-pagado"))||0),tasa:tasa===""?null:Math.max(0,Number(tasa)||0),fechaInicio:fiV("fd-fecha")||todayStr(),notas:fiV("fd-notas").trim()};
    if(ex){ delete ex.mesesPagados; Object.assign(ex,data); } else D.debts.push({id:newId("d"),...data});
    touch(); closeModal(); render(); toast(ex?"Deuda actualizada":"Deuda agregada"); return true; }
  if(a==="fi-debt-del"){
    if(!confirm("¿Eliminar esta deuda? Los pagos que ya registraste como gasto no se borran.")) return true;
    const i=D.debts.findIndex(d=>d.id===t.dataset.id); if(i<0) return true; const [x]=D.debts.splice(i,1); touch(); closeModal(); render();
    toastUndo("Deuda eliminada",()=>{ D.debts.splice(Math.min(i,D.debts.length),0,x); touch(); render(); }); return true; }
  if(a==="fi-debt-alcorriente"){
    let n=0; fiDebtsActive().forEach(d=>{ const x=fiDebtDebido(d); if(x.falta>=1){ d.montoPagado=x.esperado; delete d.mesesPagados; n++; } });
    if(n){ touch(); render(); toast("Listo: "+n+" "+fiPl(n,"deuda al corriente","deudas al corriente")); } return true; }
  if(a==="fi-debt-pay"){
    const d=D.debts.find(x=>x.id===t.dataset.id); if(!d) return true; const st=fiDebtStats(d), pay=fiR2(Math.min(st.pagoMensual,st.saldo));
    d.montoPagado=fiR2(st.montoPagado+pay); delete d.mesesPagados;
    fiNewTx({type:"expense",amount:pay,categoryId:"deudas",accountId:fiGuessAcct(d.fuente),date:todayStr(),note:(fiTitle(d.fuente)+" — "+(d.concepto||"")).trim(),recurring:false});
    render(); toast(d.montoPagado>=st.miParte-.01?"Pago registrado: deuda liquidada":"Pago registrado como gasto"); return true; }
  if(a==="fi-corte-add"){
    const fuente=fiV("fc-fuente").trim(), corte=fiClamp(Number(fiV("fc-corte"))||0,0,31), pago=Number(fiV("fc-pago"))||0, lim=Number(fiV("fc-limite"))||0;
    if(!fuente||!corte){ toast("Escribe la tarjeta y el día de corte"); return true; }
    const e={corte,pago:pago?fiClamp(pago,1,31):null,saldoManual:0}; if(lim>0) e.limite=lim; c.fuenteCortes[fuente.toLowerCase()]=e; touch(); render(); toast("Tarjeta agregada"); return true; }
  if(a==="fi-corte-del"){ if(!confirm("¿Quitar esta tarjeta? Tus deudas y movimientos no se borran.")) return true; delete c.fuenteCortes[t.dataset.key]; touch(); render(); toast("Tarjeta quitada"); return true; }
  if(a==="fi-budget-add"){ const id=fiV("fb-cat"); if(!id){ toast("Elige una categoría"); return true; } c.budgets[id]=Math.max(0,Number(fiV("fb-monto"))||0); touch(); render(); toast("Presupuesto agregado"); return true; }
  if(a==="fi-budget-del"){ delete c.budgets[t.dataset.cat]; touch(); render(); toast("Presupuesto quitado"); return true; }
  if(a==="fi-budget-auto"){
    const gasto=fiPlan("mensual").gasto, cur=todayStr().slice(0,7), tot={};
    for(let i=1;i<=2;i++) fiTx().filter(x=>fiIsConsumo(x)&&x.date.slice(0,7)===fiShiftMonth(cur,-i)).forEach(x=>tot[x.categoryId]=(tot[x.categoryId]||0)+x.amount/2);
    const ids=Object.keys(tot).filter(id=>tot[id]>0&&c.budgets[id]==null), sum=fiSum(Object.keys(tot),id=>tot[id]);
    if(!ids.length||gasto<=0){ toast(gasto<=0?"Primero necesito tus ingresos para calcular":"Registra gastos de al menos un mes completo para sugerir"); return true; }
    ids.forEach(id=>{ c.budgets[id]=Math.max(50,Math.round(gasto*(tot[id]/sum)/50)*50); }); touch(); render(); toast(ids.length+" "+fiPl(ids.length,"presupuesto sugerido","presupuestos sugeridos")+" según tu plan"); return true; }
  if(a==="fi-fondo-add"){
    const m=Math.max(0,Number(fiV("ff-monto"))||0); if(!(m>0)){ toast("Pon cuánto vas a aportar"); return true; }
    fiNewTx({type:"expense",amount:m,categoryId:"ahorro",accountId:fiV("ff-cuenta")||"debito",date:todayStr(),note:"Aportación al fondo de emergencia",recurring:false}); render(); toast("Aportación registrada"); return true; }
  if(a==="fi-gf-add"){
    const nombre=fiV("fg-n").trim(), monto=Math.max(0,Number(fiV("fg-m"))||0);
    if(!nombre||!(monto>0)){ toast("Escribe en qué y cuánto, más o menos"); return true; }
    c.gastosFijos.push({id:newId("g"),nombre,monto,freq:fiV("fg-f")==="mes"?"mes":"q"}); touch(); render(); toast("Agregado"); return true; }
  if(a==="fi-gf-del"){ const i=c.gastosFijos.findIndex(g=>g.id===t.dataset.id); if(i<0) return true; const [x]=c.gastosFijos.splice(i,1); touch(); render(); toastUndo("Quitado",()=>{ c.gastosFijos.splice(Math.min(i,c.gastosFijos.length),0,x); touch(); render(); }); return true; }
  if(a==="fi-fondo-quick"){
    const m=Math.max(0,Number(t.dataset.monto)||0); if(!(m>0)) return true;
    fiNewTx({type:"expense",amount:m,categoryId:"ahorro",accountId:"debito",date:todayStr(),note:"Aportación al fondo de emergencia",recurring:false}); render(); toast("Apartado al fondo: "+fiFmt(m)); return true; }
  if(a==="fi-fondo-sugerida"){ fiSet({fondoMeta:Number(t.dataset.v)},"Meta del fondo actualizada"); return true; }
  if(a==="fi-import"){ const f=document.getElementById("fi-file"); if(f) f.click(); return true; }
  return false;
}
/* escribir sin redibujar (no perder el foco) */
function fiInput(a,t){
  if(a==="fi-search"){ FI.filter=t.value; const l=document.getElementById("fl-list"), n=document.getElementById("fl-count"); if(l) l.innerHTML=fiLedgerHtml(); if(n) n.textContent=fiLedgerRows().length+" movimientos"; return true; }
  if(a==="fi-sim"){ FI.sim={monto:fiV("fs-monto"),meses:fiV("fs-meses"),tarjeta:fiV("fs-tarjeta")}; const r=document.getElementById("fs-result"); if(r) r.innerHTML=fiSimHtml(); return true; }
  if(a==="fi-whatif"){ FI.whatif=t.value; const r=document.getElementById("fw-result"); if(r) r.innerHTML=fiWhatIfHtml(); return true; }
  if(a==="fi-flwhat"){ FI.flN=fiV("fl-n"); FI.flMonto=fiV("fl-m"); const r=document.getElementById("fl-result"); if(r) r.innerHTML=fiFlWhatHtml(); return true; }
  return a.startsWith("fi-");
}
/* confirmar un campo (al salir o dar Enter): se guarda y se redibuja */
function fiChange(a,t){
  const c=fiCfg();
  if(a==="fi-plan-ingreso"){ const v=Math.max(0,Number(t.value)||0); fiSet({[FI.planPeriod==="quincenal"?"ingresoQuincenalManual":"ingresoMensualManual"]:v},"Ingreso actualizado"); return true; }
  if(a==="fi-plan-pct"){ fiSet({metaAhorroPct:fiClamp(Number(t.value)||0,0,100)},"Meta de ahorro actualizada"); return true; }
  if(a==="fi-corte-field"){
    const key=t.dataset.key, f=t.dataset.field, e=c.fuenteCortes[key]; if(!e) return true;
    if(f==="saldoManual"){ e.saldoManual=Math.max(0,Number(t.value)||0); e.saldoDesdeTs=nowISO(); }
    else if(f==="limite") e.limite=Math.max(0,Number(t.value)||0);
    else e[f]=t.value===""?null:fiClamp(Number(t.value)||1,1,31);
    touch(); render(); toast("Actualizado"); return true; }
  if(a==="fi-gf-edit"){
    const g=c.gastosFijos.find(x=>x.id===t.dataset.id); if(!g) return true; const f=t.dataset.field;
    if(f==="monto") g.monto=Math.max(0,Number(t.value)||0); else if(f==="freq") g.freq=t.value==="mes"?"mes":"q"; else g.nombre=t.value.trim();
    touch(); render(); return true; }
  if(a==="fi-budget-amount"){ c.budgets[t.dataset.cat]=Math.max(0,Number(t.value)||0); touch(); render(); toast("Presupuesto actualizado"); return true; }
  if(a==="fi-cuenta-saldo"){ const ac=c.accounts[Number(t.dataset.i)]; if(ac){ ac.saldoInicial=Number(t.value)||0; ac.saldoDesde=todayStr(); touch(); render(); toast("Saldo inicial actualizado"); } return true; }
  if(a==="fi-fondo-meta"){ fiSet({fondoMeta:Math.max(0,Number(t.value)||0)},"Meta del fondo actualizada"); return true; }
  if(a==="fi-meta-ingreso"){ fiSet({metaIngreso:Math.max(0,Number(t.value)||0)},"Meta guardada"); return true; }
  if(a==="fi-import-file"){
    const f=t.files&&t.files[0]; t.value=""; if(!f) return true;
    f.text().then(txt=>{ const n=fiImport(JSON.parse(txt)); touch(); render(); toast(n.debts+" deudas y "+n.tx+" movimientos importados"); }).catch(()=>alert("Ese archivo no es un respaldo válido de Libro Mayor."));
    return true; }
  return a.startsWith("fi-");
}
/* si Potenciador actualiza su resumen mientras Finanzas está abierta (otra pestaña), se refleja solo */
window.addEventListener("storage",e=>{ if(e.key==="pc_fin_resumen"&&Vault.data&&state.screen==="finanzas"&&fiSyncFreelance()) render(); });
/* enlace de carga: sebas-fit/#fin=<datos>. El fragmento (#) nunca viaja a ningún servidor; se borra de la barra y se importa al desbloquear */
(function(){
  let raw=null;
  try{ const m=/[#&]fin=([A-Za-z0-9_-]+)/.exec(location.hash); if(m){ raw=m[1]; sessionStorage.setItem("fiSeed",raw); history.replaceState(null,"",location.pathname+location.search); } else raw=sessionStorage.getItem("fiSeed"); }catch(e){}
  if(!raw) return;
  const t=setInterval(()=>{
    if(!(typeof Vault!=="undefined"&&Vault.data)) return;
    clearInterval(t);
    try{
      const b=raw.replace(/-/g,"+").replace(/_/g,"/"), bin=atob(b+"=".repeat((4-b.length%4)%4));
      const r=fiImport(JSON.parse(new TextDecoder().decode(Uint8Array.from(bin,c=>c.charCodeAt(0)))));
      touch(); sessionStorage.removeItem("fiSeed"); state.screen="finanzas"; FI.tab="hoy"; render();
      toast(r.debts||r.tx?`Cargué ${r.debts} deuda(s) y ${r.tx} movimiento(s)`:"Tus datos ya estaban cargados");
    }catch(e){ try{ sessionStorage.removeItem("fiSeed"); }catch(_){} toast("No pude leer el enlace de carga"); }
  },400);
})();
/* importa lo que llevabas en Libro Mayor (una vez): config, deudas y movimientos manuales — sin duplicar */
function fiImport(p){
  if(!p||typeof p!=="object") throw new Error("formato");
  const F=FI_D(); let nd=0,nt=0;
  if(p.cfg&&typeof p.cfg==="object"){
    const mine=fiCfg(), fresh=!F.debts.length&&!F.tx.length&&!Object.keys(mine.budgets).length&&!Object.keys(mine.fuenteCortes).length;
    Object.keys(p.cfg).forEach(k=>{
      if(k==="budgets"||k==="fuenteCortes") mine[k]=Object.assign({},p.cfg[k],mine[k]);   // lo que ya tengas aquí gana
      else if(fresh||mine[k]==null) mine[k]=p.cfg[k];
    });
  }
  const seenD=new Set(F.debts.map(d=>(d.fuente||"")+"|"+(d.concepto||"")+"|"+d.montoTotal));
  (p.debts||[]).forEach(d=>{ const k=(d.fuente||"")+"|"+(d.concepto||"")+"|"+d.montoTotal;
    if(seenD.has(k)){ const ex=F.debts.find(y=>(y.fuente||"")+"|"+(y.concepto||"")+"|"+y.montoTotal===k); if(ex&&Number(d.montoPagado)>Number(ex.montoPagado||0)){ ex.montoPagado=Number(d.montoPagado); delete ex.mesesPagados; } return; } const x={...d}; x.id=x.id&&!F.debts.some(y=>y.id===x.id)?x.id:newId("d"); F.debts.push(x); nd++; });
  const seenT=new Set(F.tx.map(t=>t.id));
  (p.tx||[]).forEach(t=>{ if(!t||!t.date||seenT.has(t.id)) return; const x={...t}; if(!x.id) x.id=newId("f"); F.tx.push(x); nt++; });
  return {debts:nd,tx:nt};
}

/* en Bolsillo (/finanzas/) lo que sea de clases, rutinas, etc. se abre en Sebas Fit completa */
document.addEventListener("click",e=>{
  if(!window.APP_MODE) return;
  const t=e.target.closest&&e.target.closest('[data-action="go"]'); if(!t||t.dataset.screen==="finanzas"||t.dataset.screen==="ajustes") return;
  e.preventDefault(); e.stopPropagation(); location.href="../";
},true);
