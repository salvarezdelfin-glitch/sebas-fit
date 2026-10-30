/* ============================================================
   Mis estudios — un solo lugar para tarifa, horario, forma de pago y plantilla de clase de cada estudio.
   Datos: tarifas/horario/pago siguen en Vault.data.clases (rates, schedule, payinfo); plantillas en Vault.data.sf.estudios.
   ============================================================ */
const ES_DUR={sculpt:[30,45,60],fuerza:[30,45,55,65],barre:[35,50,60]};
const ES_MET={sculpt:"Sculpt",fuerza:"Fuerza",barre:"Barre"};
const ES_DIF=[["ligera","Ligera"],["media","Media"],["pesada","Pesada"],["muypesada","Muy pesada"]];
const ES_TPL0={metodo:"sculpt",dif:"media",dur:45,tema:"auto"};
const ES_DIAS_CORTO={Lunes:"Lun",Martes:"Mar","Miércoles":"Mié",Jueves:"Jue",Viernes:"Vie","Sábado":"Sáb"};
function ES_T(){ const sf=Vault.data.sf; return sf.estudios||(sf.estudios={}); }
const esLlaves=n=>n==="ALUNNA"?["ALUNNA_SOLO","ALUNNA_GROUP"]:[n];
function esLista(){
  const C=CL_D(), out=STUDIOS.slice();
  C.schedule.map(s=>s.studio).concat(C.payinfo.map(p=>p.studio),Object.keys(ES_T())).forEach(n=>{ n=(n||"").trim(); if(n&&!out.some(x=>x.toLowerCase()===n.toLowerCase())) out.push(n); });
  return out;
}
/* qué le falta a cada estudio que sí usas (para que los totales de Clases no salgan en cero sin explicación) */
function esAvisos(){
  const C=CL_D(), corte=addDays(todayStr(),-120), usados=new Set();
  C.schedule.forEach(s=>s.studio&&usados.add(s.studio)); C.payinfo.forEach(p=>p.studio&&usados.add(p.studio)); C.entries.forEach(e=>{ if(e.studio&&(e.date||"")>=corte) usados.add(e.studio); });
  const out=[];
  usados.forEach(n=>{
    const falta=[];
    if(!esLlaves(n).some(k=>C.rates[k]>0)) falta.push("tarifa");
    if(!C.payinfo.some(p=>p.studio===n)) falta.push("forma de pago");
    if(falta.length) out.push({studio:n,falta});
  });
  if(!C.schedule.length) out.push({studio:null,falta:["horario fijo"]});
  return out;
}
function esAvisoHtml(){
  const A=esAvisos(); if(!A.length) return "";
  const txt=A.map(a=>a.studio?`${esc(studioLabel(a.studio))} (${a.falta.join(" y ")})`:`${a.falta[0]}`).join(" · ");
  return `<div class="es-aviso"><span><b>Falta completar:</b> ${txt}. Sin esto los totales pueden salir en cero.</span><button class="btn sm" data-action="go" data-screen="ajustes">Completar en Mis estudios →</button></div>`;
}
/* ---------- tarjeta de cada estudio ---------- */
function esTarjeta(n,i){
  const C=CL_D(), T=Object.assign({},ES_TPL0,ES_T()[n]||{}), pay=C.payinfo.find(p=>p.studio===n);
  const falta=esAvisos().find(a=>a.studio===n);
  const rate=(k,lbl)=>`<div><label class="mini">${lbl}</label><input class="inp" type="number" inputmode="decimal" min="0" data-action="es-rate" data-k="${esc(k)}" data-s="${esc(n)}" value="${C.rates[k]||0}"></div>`;
  const rates=n==="ALUNNA"?rate("ALUNNA_SOLO","Tarifa 1 persona")+rate("ALUNNA_GROUP","Tarifa grupo"):rate(n,"Tarifa por clase");
  const slots=C.schedule.filter(s=>s.studio===n).sort((a,b)=>DIAS_ORDEN.indexOf(a.day)-DIAS_ORDEN.indexOf(b.day)||a.time.localeCompare(b.time))
    .map(s=>`<span class="chip es-slot">${ES_DIAS_CORTO[s.day]||esc(s.day)} ${esc(s.time)}<button class="del" data-action="cl-slot-del" data-id="${s.id}" aria-label="Quitar horario">✕</button></span>`).join("")||`<span class="hint">Sin horario fijo.</span>`;
  const temas=T.metodo==="barre"?"":`<div><label class="mini">Tema</label><select class="inp" data-action="es-tpl" data-s="${esc(n)}" data-f="tema"><option value="auto">Automático</option>${temaLista(T.metodo).map(t=>`<option value="${t.id}" ${T.tema===t.id?"selected":""}>${esc(t.nom)}</option>`).join("")}</select></div>`;
  const opts=(arr,cur)=>arr.map(([v,l])=>`<option value="${v}" ${String(cur)===String(v)?"selected":""}>${l}</option>`).join("");
  return `<section class="es-card ${falta?"falta":""}">
    <div class="es-head"><h3>${esc(studioLabel(n))}</h3>${falta?`<span class="chip warn">falta ${falta.falta.join(" y ")}</span>`:`<span class="chip ok">completo</span>`}${STUDIOS.includes(n)?"":`<button class="link-btn" data-action="es-del" data-s="${esc(n)}">quitar</button>`}</div>
    <div class="es-sec"><span class="eyebrow">Dinero</span><div class="form-grid g3">${rates}
      <div><label class="mini">Pago</label><select class="inp" data-action="es-pay" data-s="${esc(n)}" data-f="frequency"><option value="" ${pay?"":"selected"}>Sin definir</option>${opts([["semanal","Semanal"],["quincenal","Quincenal"]],pay&&pay.frequency)}</select></div>
      <div><label class="mini">Día de pago</label><select class="inp" data-action="es-pay" data-s="${esc(n)}" data-f="payday"><option value="">Sin día</option>${DIAS_ORDEN.map(d=>`<option ${pay&&pay.payday===d?"selected":""}>${d}</option>`).join("")}</select></div></div></div>
    <div class="es-sec"><span class="eyebrow">Horario fijo</span><div class="es-slots">${slots}</div>
      <div class="es-add"><select class="inp" id="es-d-${i}">${DIAS_ORDEN.map(d=>`<option>${d}</option>`).join("")}</select><input class="inp" id="es-t-${i}" type="time"><button class="btn ghost sm" data-action="es-slot-add" data-s="${esc(n)}" data-i="${i}">+ horario</button></div></div>
    <div class="es-sec"><span class="eyebrow">Clase de este estudio (plantilla)</span><div class="form-grid g4">
      <div><label class="mini">Método</label><select class="inp" data-action="es-tpl" data-s="${esc(n)}" data-f="metodo">${opts(Object.entries(ES_MET),T.metodo)}</select></div>
      <div><label class="mini">Dificultad</label><select class="inp" data-action="es-tpl" data-s="${esc(n)}" data-f="dif">${opts(ES_DIF,T.dif)}</select></div>
      <div><label class="mini">Duración</label><select class="inp" data-action="es-tpl" data-s="${esc(n)}" data-f="dur">${ES_DUR[T.metodo].map(d=>`<option value="${d}" ${+T.dur===d?"selected":""}>${d} min</option>`).join("")}</select></div>${temas}</div>
      <p class="hint">En <b>Generar</b> aparece "Para: ${esc(studioLabel(n))}" y carga esto de un toque.</p></div>
  </section>`;
}
function estudiosHtml(){
  const L=esLista(), A=esAvisos();
  return `<div class="set-block"><h3>Mis estudios</h3>
    <p class="hint">Tarifa, horario, forma de pago y el tipo de clase de cada estudio, todo en un solo lugar. ${A.length?`<b>Te falta completar ${A.length} cosa${A.length>1?"s":""}.</b>`:"Todo completo ✓"}</p>
    ${L.map(esTarjeta).join("")}
    <div class="es-new"><input class="inp" id="es-new" placeholder="Otro estudio (nombre)"><button class="btn ghost" data-action="es-add">+ agregar estudio</button></div>
    <p class="hint">Las clases ya registradas conservan el monto con el que se guardaron; las que quedaron en $0 se actualizan al poner la tarifa.</p></div>`;
}
window.clSettingsHtml=estudiosHtml;
/* ---------- "Para: estudio" en Generar ---------- */
function esAplicar(n){
  const T=Object.assign({},ES_TPL0,ES_T()[n]||{}), c=state.cfg; c.metodo=T.metodo; c.para=n;
  if(T.metodo==="fuerza"){ c.objetivo=T.dif; c.descanso=OBJETIVOS[T.dif].descanso; c.fDuracion=+T.dur; }
  else if(T.metodo==="barre"){ const d=BARRE_DIF[T.dif]; c.bDificultad=T.dif; c.bBase=d.bBase; c.bPorBloque=d.bPorBloque; c.bDuracion=+T.dur; }
  else { c.nivel=T.dif; c.duracion=+T.dur; }
  if(T.metodo!=="barre") c.tema=T.tema&&temaLista(T.metodo).some(t=>t.id===T.tema)?T.tema:"auto";
}
function esParaHtml(){
  const T=ES_T(), con=esLista().filter(n=>T[n]);
  if(!con.length) return `<p class="hint es-para-vacio">¿Das clase en varios estudios? <button class="link-btn" data-action="go" data-screen="ajustes">Define una plantilla por estudio en Ajustes → Mis estudios</button> y aquí cargas cada clase de un toque.</p>`;
  return `<div class="es-para"><span class="eyebrow">Para</span>${con.map(n=>`<button class="chip es-chip ${state.cfg.para===n?"on":""}" data-action="es-usar" data-s="${esc(n)}">${esc(studioLabel(n))}</button>`).join("")}<button class="chip es-chip ${state.cfg.para?"":"on"}" data-action="es-libre">Libre</button></div>`;
}
const _viewInicio0=viewInicio;
window.viewInicio=function(){ return _viewInicio0().replace("</header>","</header>"+esParaHtml()); };
const _viewClases0=window.viewClases;
window.viewClases=function(){ return _viewClases0().replace("</header>","</header>"+esAvisoHtml()); };
/* ---------- acciones ---------- */
function esClick(a,t){
  const C=CL_D(), n=t.dataset.s;
  if(a==="es-usar"){ esAplicar(n); render(); return true; }
  if(a==="es-libre"){ state.cfg.para=null; render(); return true; }
  if(a==="es-slot-add"){
    const day=document.getElementById("es-d-"+t.dataset.i).value, time=document.getElementById("es-t-"+t.dataset.i).value;
    if(!time){ toast("Falta la hora"); return true; }
    C.schedule.push({id:newId("s"),day,studio:n,time}); touch(); render(); return true; }
  if(a==="es-add"){
    const el=document.getElementById("es-new"), nom=el.value.trim().replace(/\s+/g," "); if(!nom){ toast("Escribe el nombre del estudio"); return true; }
    const ya=esLista().find(x=>x.toLowerCase()===nom.toLowerCase()); if(ya){ toast("Ese estudio ya está: "+studioLabel(ya)); return true; }
    ES_T()[nom]=Object.assign({},ES_TPL0); if(C.rates[nom]==null) C.rates[nom]=0; touch(); render(); return true; }
  if(a==="es-del"){
    if(!confirm("¿Quitar "+n+" (horario, forma de pago y plantilla)? Las clases ya registradas se quedan.")) return true;
    delete ES_T()[n]; delete C.rates[n]; C.schedule=C.schedule.filter(s=>s.studio!==n); C.payinfo=C.payinfo.filter(p=>p.studio!==n);
    if(state.cfg.para===n) state.cfg.para=null; touch(); render(); return true; }
  return false;
}
function esChange(a,t){
  const C=CL_D(), n=t.dataset.s, f=t.dataset.f;
  if(a==="es-rate"){
    C.rates[t.dataset.k]=Math.max(0,Number(t.value)||0); let k=0;
    C.entries.forEach(e=>{ if(e.studio===n&&e.auto!==false&&!(e.amount>0)){ const m=rateFor(e,C.rates); if(m>0){ e.amount=m; k++; } } });
    touch(); render(); toast("Tarifa guardada"+(k?" · "+k+" clase"+(k>1?"s":"")+" actualizada"+(k>1?"s":""):"")); return true; }
  if(a==="es-pay"){
    let p=C.payinfo.find(x=>x.studio===n);
    if(!p){ if(f==="frequency"&&!t.value) return true; p={id:newId("p"),studio:n,frequency:"semanal",payday:"",note:""}; C.payinfo.push(p); }
    p[f]=t.value; if(!p.frequency) p.frequency="semanal"; touch(); render(); return true; }
  if(a==="es-tpl"){
    const T=ES_T()[n]||(ES_T()[n]=Object.assign({},ES_TPL0));
    T[f]=f==="dur"?+t.value:t.value;
    if(f==="metodo"){ if(!ES_DUR[T.metodo].includes(+T.dur)) T.dur=ES_DUR[T.metodo][1]; T.tema="auto"; }
    touch(); render(); return true; }
  return false;
}
