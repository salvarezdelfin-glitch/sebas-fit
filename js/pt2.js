"use strict";
/* ============================================================
   PT 2 · proceso del cliente (3/6/9/12 meses) y rutinas de gimnasio sin cliente
   ============================================================ */
function ptProgDe(t){ return PT_D().programas.find(p=>p.id===t.dataset.p)||ptProgActivo(PTUI.cid); }

/* ---------- ficha: punto de partida y metas ---------- */
function ptFichaCampos(c){
  const n=(id,l,v,ph)=>`<div><label class="mini">${l}</label><input class="inp" id="${id}" type="number" inputmode="decimal" step="0.1" value="${v==null?"":v}" ${ph?`placeholder="${ph}"`:""}></div>`;
  return `<div class="full"><label class="mini" style="margin-top:6px">Punto de partida y metas (para proyectar el proceso)</label></div>
    <div><label class="mini">Sexo (afecta los ritmos de cambio)</label>${ptSel("pc-sexo",[["","Prefiero no decir"],["f","Mujer"],["m","Hombre"]],c.sexo||"")}</div>
    <div class="full"><label class="mini">Estilo de entrenamiento (la rutina se arma con esta división)</label>${ptSel("pc-estilo",Object.keys(PT_ESTILOS).map(k=>[k,PT_ESTILOS[k].nom]),c.estilo||"auto")}</div>
    ${n("pc-edad","Edad (años)",c.edad)}${n("pc-estatura","Estatura (cm)",c.estatura)}${n("pc-peso0","Peso actual (kg)",c.peso0)}${n("pc-grasa0","% de grasa actual",c.grasa0,"opcional")}
    <div class="full"><label class="mini">Meta (con tus palabras)</label><input class="inp" id="pc-metaTexto" value="${esc(c.metaTexto||"")}" placeholder="ej. bajar a 22 % de grasa y marcar glúteo"></div>
    ${n("pc-metaPeso","Peso meta (kg)",c.metaPeso,"opcional")}${n("pc-metaGrasa","% de grasa meta",c.metaGrasa,"opcional")}`;
}
function ptFichaDesdeForm(c){
  const nv=id=>{ const v=fv(id); return v===""?"":Number(v); };
  c.sexo=fv("pc-sexo"); c.estilo=fv("pc-estilo")||"auto"; c.edad=nv("pc-edad"); c.estatura=nv("pc-estatura"); c.peso0=nv("pc-peso0"); c.grasa0=nv("pc-grasa0"); c.metaTexto=fv("pc-metaTexto").trim(); c.metaPeso=nv("pc-metaPeso"); c.metaGrasa=nv("pc-metaGrasa");
  return c;
}
/* si el cliente trae peso, queda como primera medida (para las gráficas y la comparación) */
function ptMedidaInicial(c){
  if(!c.peso0||ptMedidasDe(c.id).length) return;
  PT_D().medidas.push({id:newId("m"),clienteId:c.id,fecha:c.inicio||todayStr(),peso:+c.peso0,grasa:c.grasa0?+c.grasa0:null,cintura:null,cadera:null,pecho:null,brazo:null,muslo:null,inicial:true});
}

/* ---------- pestaña Proceso ---------- */
function ptTabProceso(c){
  const b=pjBase(c);
  if(!b.peso) return `<div class="empty"><b>Falta el punto de partida de ${esc(c.nombre)}.</b><p>Anota su peso, % de grasa y metas y la app proyecta qué cambios va a notar a los 3, 6, 9 y 12 meses.</p><p><button class="btn primary" data-action="pt-editar" data-id="${c.id}">Completar la ficha</button></p></div>`;
  const pts=pjProyectar(c), hs=pjHitos(c,pts), meta=pjMeta(c,pts)||[], meds=ptMedidasDe(c.id), hoy=todayStr();
  const ini=parseLocalDate(c.inicio||(meds[0]&&meds[0].fecha)||hoy), mesesDe=f=>(parseLocalDate(f)-ini)/(30.44*86400000);
  const rPeso=meds.filter(m=>m.peso).map(m=>({x:mesesDe(m.fecha),y:+m.peso})), rGrasa=meds.filter(m=>m.grasa).map(m=>({x:mesesDe(m.fecha),y:+m.grasa}));
  const ms=pjMasas(b.peso,b.grasa), imc=pjImc(b.peso,b.estatura);
  const sig=hs.find(h=>h.fecha>hoy);
  const tiles=`<div class="tiles tiles-4"><div class="tile"><div class="label">Peso inicial</div><div class="value num">${b.peso} kg</div><div class="foot">${imc?"IMC "+r1(imc):"agrega la estatura para el IMC"}</div></div>
    <div class="tile"><div class="label">% de grasa</div><div class="value num">${b.grasa!=null?b.grasa+" %":"—"}</div><div class="foot">${b.grasa!=null?"masa grasa ≈ "+r1(ms.mg)+" kg":"sin dato: se estimó un valor medio"}</div></div>
    <div class="tile"><div class="label">Masa magra</div><div class="value num">${ms.mm!=null?r1(ms.mm)+" kg":"—"}</div><div class="foot">${c.sexo?"":"indica el sexo para ritmos más precisos"}</div></div>
    <div class="tile"><div class="label">Meta</div><div class="value" style="font-size:20px;line-height:1.1">${esc(c.metaTexto||"sin definir")}</div><div class="foot">${c.metaPeso?c.metaPeso+" kg":""}${c.metaPeso&&c.metaGrasa?" · ":""}${c.metaGrasa?c.metaGrasa+" % grasa":""}</div></div></div>`;
  const metaH=meta.length?`<div class="alert-list">${meta.map(m=>`<div class="alert ${m.ok?"ok":"warn"}">${m.ok?"✔":"⚠"} ${esc(m.txt)}</div>`).join("")}</div>`:"";
  const cards=hs.map(h=>{
    const pasado=h.fecha<=hoy;
    const real=meds.filter(m=>m.peso&&Math.abs(parseLocalDate(m.fecha)-parseLocalDate(h.fecha))<=21*86400000).sort((a,z)=>Math.abs(parseLocalDate(a.fecha)-parseLocalDate(h.fecha))-Math.abs(parseLocalDate(z.fecha)-parseLocalDate(h.fecha)))[0];
    const dev=real?r1(real.peso-h.peso):null;
    return `<section class="hito ${sig&&sig.mes===h.mes?"next":""}"><div class="hito-head"><div><span class="mini-lbl">${pasado?"Ya pasó":"Próximo hito"} · ${fmtCorto(h.fecha)}</span><h3>A los ${h.mes} meses</h3></div>
      <div class="hito-nums"><span><b class="num">≈ ${h.peso} kg</b><small>${h.dPeso>0?"+":""}${h.dPeso} kg</small></span><span><b class="num">≈ ${h.grasa} %</b><small>grasa</small></span><span><b class="num">+${h.fuerza[0]}–${h.fuerza[1]} %</b><small>fuerza</small></span>${h.cintura?`<span><b class="num">−${h.cintura[0]}–${h.cintura[1]} cm</b><small>cintura</small></span>`:""}</div></div>
      ${real?`<div class="hito-real ${Math.abs(dev)<=1.5?"ok":"warn"}">Real: <b class="num">${real.peso} kg</b>${real.grasa?" · <b class=\"num\">"+real.grasa+" %</b>":""} (${dev>0?"+":""}${dev} kg vs lo proyectado)</div>`:(pasado?`<div class="hito-real warn">Sin medidas cerca de esta fecha: toma medidas para comparar.</div>`:"")}
      <div class="hito-cols"><div><div class="mini-lbl">Lo que empieza a notar</div><ul>${h.notar.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div><div><div class="mini-lbl">Lo que medimos</div><ul>${h.medir.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div></div></section>`; }).join("");
  return `${tiles}${metaH}<div class="chart-grid" style="margin-top:14px"><section class="card"><h3>Peso: proyección y real</h3>${svgProy(pts,rPeso,"kg","peso",Number(c.metaPeso)||0)}<p class="hint">Línea punteada = proyección · puntos = medidas reales.</p></section>
    <section class="card"><h3>% de grasa: proyección y real</h3>${svgProy(pts,rGrasa,"%","grasa",Number(c.metaGrasa)||0)}</section></div>
    <div class="acts-row" style="margin:6px 0 18px"><button class="btn" data-action="pt-pj-copiar" data-id="${c.id}">⧉ Copiar plan para WhatsApp</button><button class="btn primary" data-action="pt-pdf-informe" data-id="${c.id}">⬇ Informe de progreso (PDF)</button><button class="btn" data-action="pt-pj-print" data-id="${c.id}">⎙ Imprimir</button><button class="btn" data-action="pt-med-nueva" data-id="${c.id}">+ Registrar medidas</button><button class="btn ghost" data-action="pt-editar" data-id="${c.id}">✎ Editar ficha</button></div>
    <div class="hitos">${cards}</div><p class="hint" style="margin-bottom:40px">Estimaciones orientativas basadas en promedios para su nivel y objetivo; dependen de constancia, sueño, comida y genética. Cada hito se revisa con medidas reales y se ajusta el programa.</p>`;
}

/* ---------- rutinas de gimnasio (sin cliente) ---------- */
function ptVistaTabs(){
  return `<div class="tabs"><button data-action="pt-vista" data-v="clientes" class="${state.screen!=="gym"?"on":""}">Clientes</button><button data-action="pt-vista" data-v="plantillas" class="${state.screen==="gym"?"on":""}">Rutinas de gimnasio</button></div>`;
}
const ptPlantillas=()=>PT_D().programas.filter(p=>!p.clienteId);
function viewPlantillas(){
  const L=ptPlantillas().sort((a,b)=>a.creado<b.creado?1:-1);
  const cards=L.map(p=>`<button class="cli-card" data-action="pt-pl-open" data-id="${p.id}"><div class="cc-top"><span class="cc-name">${esc(p.nombre)}</span><span class="chip nv-${p.nivel}">${PT_NIVELES[p.nivel].nom}</span></div>
    <div class="cc-meta">${esc(PT_OBJETIVOS[p.objetivo].nom)} · ${p.diasSem} días/sem · ${p.semanas} semanas</div><div class="cc-stats"><span>${esc(PT_EQUIPO[p.equipo].nom)}</span><span>≈ ${p.minutos} min</span></div></button>`).join("");
  return `<div class="wrap"><header class="page-head"><span class="eyebrow">Personal trainer</span><h1>Rutinas de gimnasio</h1><p class="sub">Genera una rutina por nivel (básico, intermedio o avanzado) sin necesidad de un cliente: guárdala, mándala por WhatsApp o asígnala a alguien.</p></header>
    ${ptVistaTabs()}<div class="toolbar"><span class="spacer"></span><button class="btn primary" data-action="pt-gen-plantilla">+ Nueva rutina</button></div>
    ${cards?`<div class="cli-grid">${cards}</div>`:`<div class="empty"><b>Aún no tienes rutinas guardadas.</b><p>Crea la primera con "Nueva rutina": eliges nivel, objetivo, días, material y lesiones.</p></div>`}</div>`;
}
function viewPlantilla(){
  const prog=PT_D().programas.find(p=>p.id===PTUI.pid);
  if(!prog){ state.screen="gym"; return viewPlantillas(); }
  const act=PT_D().clientes.filter(c=>c.estado==="activo").sort((a,b)=>a.nombre.localeCompare(b.nombre));
  return `<div class="wrap"><div class="back-row"><button class="btn sm ghost" data-action="pt-pl-back">← Rutinas de gimnasio</button></div>
    <header class="page-head"><span class="eyebrow">Rutina de gimnasio · ${PT_NIVELES[prog.nivel].nom}</span><h1>${esc(prog.nombre)}</h1></header>
    <div class="card" style="margin-bottom:16px"><h3>Asignar a un cliente</h3>${act.length?`<div class="arm-input" style="padding:0"><select class="inp" id="pt-asig">${act.map(c=>`<option value="${c.id}">${esc(c.nombre)}</option>`).join("")}</select><button class="btn primary" data-action="pt-asignar" data-p="${prog.id}">Asignar</button></div><p class="hint">Se copia al cliente como su programa activo; esta rutina queda guardada para usarla con otros.</p>`:`<p class="hint">Aún no tienes clientes activos. Crea uno en Clientes.</p>`}
      <div class="acts" style="margin-top:10px"><button class="btn sm ghost" data-action="pt-pl-del" data-id="${prog.id}">Eliminar esta rutina</button></div></div>
    ${ptProgramaBody(prog,null)}</div>`;
}

/* ---------- acciones ---------- */
function ptClick2(a,t){
  const D=PT_D();
  if(a==="pt-vista"){ state.screen=t.dataset.v==="plantillas"?"gym":"clientes"; render(); return true; }
  if(a==="pt-pl-open"){ PTUI.pid=t.dataset.id; PTUI.sem=1; state.screen="plantilla"; render(); window.scrollTo(0,0); return true; }
  if(a==="pt-pl-back"){ state.screen="gym"; render(); return true; }
  if(a==="pt-gen-plantilla"){ state.modal={type:"pt-gen",clienteId:null,data:{nivel:"intermedio",objetivo:"hipertrofia",dias:4,semanas:8,minutos:60,equipo:"gym",lesiones:[]}}; renderOverlay(); return true; }
  if(a==="pt-pl-del"){ const L=D.programas, i=L.findIndex(p=>p.id===t.dataset.id); if(i<0) return true; const [p]=L.splice(i,1); touch(); state.screen="gym"; render(); toastUndo("Rutina eliminada",()=>{ L.splice(Math.min(i,L.length),0,p); touch(); render(); }); return true; }
  if(a==="pt-asignar"){
    const p=D.programas.find(x=>x.id===t.dataset.p), cid=fv("pt-asig"), cl=ptCliente(cid); if(!p||!cl) return true;
    const copia=clone(p); copia.id=newId("pg"); copia.clienteId=cl.id; copia.activo=true; copia.inicio=todayStr(); copia.nombre=p.nombre+" · "+cl.nombre.split(" ")[0]; copia.creado=nowISO();
    D.programas.forEach(x=>{ if(x.clienteId===cl.id) x.activo=false; }); D.programas.push(copia); touch(); PTUI.cid=cl.id; PTUI.tab="programa"; PTUI.sem=1; state.screen="cliente"; render(); toast("Rutina asignada a "+cl.nombre.split(" ")[0]); return true; }
  if(a==="pt-gen-ok"){
    const md=state.modal, c=md.clienteId?ptCliente(md.clienteId):null;
    const cfg={clienteId:c?c.id:null,nivel:fv("pg-nivel"),objetivo:fv("pg-objetivo"),dias:+fv("pg-dias"),semanas:+fv("pg-semanas"),minutos:+fv("pg-min"),equipo:fv("pg-equipo"),cardio:fv("pg-cardio")||"auto",estilo:fv("pg-estilo")||"auto",
      lesiones:PT_ZONAS.filter(([k])=>document.getElementById("pg-z-"+k).checked).map(([k])=>k)};
    if(c) D.programas.forEach(p=>{ if(p.clienteId===c.id) p.activo=false; });
    const prog=ptGenerar(cfg);
    if(c){ prog.nombre=PT_OBJETIVOS[cfg.objetivo].nom+" · "+PT_NIVELES[cfg.nivel].nom+" · "+c.nombre.split(" ")[0]; }
    else { prog.nombre=PT_OBJETIVOS[cfg.objetivo].nom+" · "+PT_NIVELES[cfg.nivel].nom+" · "+prog.diasSem+" días"; prog.activo=false; }
    if(cfg.estilo&&cfg.estilo!=="auto") prog.nombre+=" · "+PT_ESTILOS[cfg.estilo].corto;
    D.programas.push(prog); touch(); closeModal();
    if(c){ PTUI.tab="programa"; PTUI.sem=1; render(); toast("Programa generado"); }
    else { PTUI.pid=prog.id; PTUI.sem=1; state.screen="plantilla"; render(); window.scrollTo(0,0); toast("Rutina generada"); }
    return true; }
  if(a==="pt-cliente-save"){
    const md=state.modal, c=ptFichaDesdeForm(ptClienteDesdeForm(md.data)); if(!c.nombre){ toast("Escribe el nombre"); return true; }
    if(md.id){ const i=D.clientes.findIndex(x=>x.id===md.id); D.clientes[i]=Object.assign(D.clientes[i],c); ptMedidaInicial(D.clientes[i]); touch(); closeModal(); render(); }
    else { c.id=newId("c"); c.creado=nowISO(); D.clientes.push(c); ptMedidaInicial(c); touch(); closeModal(); ptOpen(c.id); }
    return true; }
  if(a==="pt-pj-copiar"){ copyText(pjTexto(ptCliente(t.dataset.id)),"Plan de proceso copiado — pégalo en WhatsApp"); return true; }
  if(a==="pt-pj-print"){ printDoc(pjPrintHtml(ptCliente(t.dataset.id))); return true; }
  return false;
}
