"use strict";
/* ============================================================
   CICLOS DE CLASES · que la clase avance semana a semana
   La clase de esta semana es la de la semana pasada, un paso más arriba (holds más largos, más pulsos,
   una capa nueva, un reto con meta). Las que ya vienen contigo sienten su avance; las que llegan nuevas
   se suben sin perderse: la semana 1 es de entrada y cada paso trae su opción fácil.
   ============================================================ */
const CI_RETO={ligera:20,media:30,pesada:40,muypesada:45};
const ciMonday=s=>weekKeyAndLabel(s).key;
const ciActivo=()=>((Vault.data.sf||{}).cicloActivo)||null;
const ciDias=(a,b)=>Math.floor((parseLocalDate(b)-parseLocalDate(a))/86400000);
function ciEtiqueta(k,total){ return k===0?"Entrada":k===total-1?"Reto":(k===total-2&&total>=4)?"Intensidad":"Sube"; }
const CI_ETQ_DESC={Entrada:"Aprenden el ciclo. Ideal para invitar a alguien nueva.",Sube:"La misma clase, un paso más arriba.",Intensidad:"Más trabajo en las partes que ya dominan.",Reto:"Meta colectiva: ver cuánto avanzaron."};

/* ---------- medidas para contar qué cambió ---------- */
function ciMedidas(r){
  const sl=r.sections.filter(S=>S.kind==="work").flatMap(S=>S.slots), avg=a=>a.length?Math.round(a.reduce((x,y)=>x+y,0)/a.length):0;
  if(r.metodo==="fuerza"){
    const P=sl.filter(s=>s.rol==="P"), O=sl.filter(s=>s.rol!=="P"), fin=r.sections.find(S=>S.kind==="cardioFin");
    return {setsP:avg(P.map(s=>s.sets)),repsO:avg(O.map(s=>s.rep?(s.rep[0]+s.rep[1])/2:0)),setsO:avg(O.map(s=>s.sets)),rondas:fin?fin.protocolo.rondas:0,work:fin?fin.protocolo.work:0};
  }
  const q=t=>sl.filter(s=>s.q&&s.q.t===t&&!s.q.fijo);
  return {hold:avg(q("hold").map(s=>s.q.s)),pul:avg(q("pulsos").map(s=>s.q.n)),reps:avg(q("reps").filter(s=>!s.q.por).map(s=>s.q.n)),pasos:sl.length};
}
function ciCambios(prev,cur,metodo){
  const a=ciMedidas(prev), b=ciMedidas(cur), out=[];
  if(metodo==="fuerza"){
    if(b.setsP>a.setsP) out.push("Principal: de "+a.setsP+" a "+b.setsP+" series");
    if(b.repsO>a.repsO) out.push("Secundario y accesorios: +"+Math.round(b.repsO-a.repsO)+" repetición");
    if(b.setsO>a.setsO) out.push("Secundario y accesorios: una serie más");
    if(b.rondas>a.rondas) out.push("Finisher: "+b.rondas+" rondas");
    if(b.work>a.work) out.push("Finisher: "+b.work+" s de trabajo");
    return out;
  }
  if(b.hold>a.hold) out.push("Holds de "+a.hold+" a "+b.hold+" s");
  if(b.pul>a.pul) out.push("Pulsos de "+a.pul+" a "+b.pul);
  if(b.reps>a.reps) out.push("Repeticiones de "+a.reps+" a "+b.reps);
  if(b.pasos>a.pasos) out.push((b.pasos-a.pasos)+" paso"+(b.pasos-a.pasos===1?"":"s")+" nuevo"+(b.pasos-a.pasos===1?"":"s")+" (una capa más)");
  return out;
}

/* ---------- un paso arriba ---------- */
function ciPasoSculpt(prev,k,total){
  const r=deepClone(prev); r.id=rid(); const ctx={size:"M",dif:r.nivel||"media",base:r.base||8,eq:new Set(r.material||[]),tema:temaPorId("sculpt",r.tema)}, base=r.base||8;
  r.sections.forEach(S=>{ if(S.kind!=="work") return; S.slots.forEach(s=>{ const q=s.q; if(!q||q.fijo) return;
    if(q.t==="hold") q.s=Math.min(60,q.s+5); else if(q.t==="pulsos") q.n=Math.min(50,q.n+5); else if(q.t==="reps"&&!q.por&&k%2===0) q.n=Math.min(base+3,q.n+1); }); });
  if(k===2){ estOpPierna(r,ctx); estOpAbs(r,ctx); }
  if(k===total-1&&total>=3){ const L=r.sections.find(S=>S.bk==="leg"); if(L&&!L.slots.some(s=>/Ráfaga final/.test(s.nota||""))){ const p=L.slots.slice().reverse().find(s=>s.q&&s.q.t==="pulsos"&&!s.q.fijo); if(p){ const x=Object.assign({},p,{uid:uid(),q:Object.assign({},p.q,{n:Math.max(15,Math.round(p.q.n*0.6))}),nota:"Ráfaga final: sin pausa"}); const i=L.slots.findIndex(s=>byId[s.ref].layer==="falla"); L.slots.splice(i<0?L.slots.length:i,0,x); } } }
  estCargas(r); if(k>=2) r.sections.forEach(S=>{ if(S.carga&&/mancuernas/.test(S.carga)) S.carga+=" · prueba subir 1 kg"; });
  estTransiciones(r); return r;
}
function ciPasoFuerza(prev,k,total){
  const r=deepClone(prev); r.id=rid();
  r.sections.forEach(S=>{
    if(S.kind==="work") S.slots.forEach(s=>{ if(!s.rol||!s.rep) return; const lo=s.rep[0], hi=s.rep[1];
      if(s.rol==="P"){ if(k===2&&s.sets<5&&!s.pir) s.sets++; if(k===total-1&&!s.pir&&total>=3) s.rep=[Math.max(3,lo-1),Math.max(4,hi-1)]; }
      else { if(k<=2&&!s.pir) s.rep=[lo+1,hi+1]; if(k===2) s.rest=Math.max(30,s.rest-10); } });   // más trabajo sin alargar la clase: se acorta el descanso
    if(S.kind==="cardioFin"){ if(k===2) S.protocolo.rondas++; if(k===total-1) S.protocolo.work=Math.min(60,S.protocolo.work+5); }
  });
  fzHarmonizar(r); return r;
}
/* título, notas y meta de la semana (sobre la clase ya avanzada) */
function ciDecorar(r,o){
  r.ciclo={id:o.cicloId,nombre:o.nombre,n:o.n,de:o.total,v:o.v,etiqueta:o.etq,sube:o.sube,reto:o.reto,nuevas:o.nuevas};
  r.nombre=o.base+" · Semana "+o.n+(o.vars>1?" · Clase "+o.v:"");
  const fs0=r.sections.find(S=>S.kind==="work"&&S.slots.length), first=fs0?fs0.slots[0]:null;
  if(first){ if(first.notaBase===undefined) first.notaBase=first.nota||""; first.nota=("Semana "+o.n+"/"+o.total+" ("+o.etq.toLowerCase()+"): "+(o.sube.length?o.sube.join("; "):"aprenden el ciclo")+(o.n>1?". Si hay alguien nueva: opción fácil.":""))+(first.notaBase?" · "+first.notaBase:""); }
  if(r.metodo!=="fuerza"&&o.reto){ const R=r.sections.find(S=>S.bk==="reto"); if(R&&R.slots[0]) R.slots[0].nota=o.reto; }
  return r;
}
function ciRetoTexto(base,k,total){
  if(base.metodo==="fuerza") return k===total-1?"Semana reto: tu mejor serie del ejercicio principal con técnica limpia":(k===0?"Anota tu carga de partida en el principal":null);
  const meta=(CI_RETO[base.nivel]||30)+5*k;
  return k===0?"Reto de la semana: aguanta "+meta+" s (es el punto de partida del ciclo)":"Reto de la semana: llega a "+meta+" s — la semana pasada la meta era "+(meta-5)+" s";
}
const ciNuevas=k=>k<=1?"Semana ideal para invitar a alguien nueva: todo el ciclo empieza aquí y cada paso trae opción fácil.":"Si llega alguien nueva: que haga la opción fácil de cada paso y se suma sin perderse.";

/* ---------- crear el ciclo ---------- */
function cicloCrear(cfg,total,vars){
  const base=cfg.metodo==="fuerza"?"Fuerza":"Sculpt", bases=[]; for(let v=0;v<vars;v++) bases.push(generate(Object.assign({},cfg)));
  const id=rid(), semanas=[], modoNom=cfg.metodo==="fuerza"?MODES.fuerza[cfg.fModo].nom:MODES.sculpt[cfg.modo].nom, nombre=base+" · "+modoNom+" · ciclo de "+total+" semanas"+(vars>1?" · "+vars+" clases":"");
  let prev=bases.map(b=>deepClone(b));
  for(let k=0;k<total;k++){
    const cur=k===0?prev:prev.map(p=>p.metodo==="fuerza"?ciPasoFuerza(p,k,total):ciPasoSculpt(p,k,total)), etq=ciEtiqueta(k,total);
    const sube=k===0?[]:ciCambios(prev[0],cur[0],cur[0].metodo), reto=ciRetoTexto(cur[0],k,total);
    const clases=cur.map((r,v)=>{ const x=deepClone(r); x.id=rid(); return ciDecorar(x,{cicloId:id,nombre,n:k+1,total,v:String.fromCharCode(65+v),vars,etq,sube,reto,nuevas:ciNuevas(k),base:bases[v].nombre.replace(/ · Semana.*$/,"").replace(/ · Clase [A-Z]$/,"")}); });
    semanas.push({n:k+1,etq,sube,reto,clases,routine:clases[0],resumen:etq+(sube.length?" · "+sube[0]:"")});
    prev=cur;
  }
  return {id,nombre,metodo:cfg.metodo,tipo:"ciclo",variantes:vars,total,semanas,creado:Date.now()};
}

/* ---------- el ciclo en curso ---------- */
function ciSemanaActual(){
  const a=ciActivo(); if(!a) return null; const p=state.programas.find(x=>x.id===a.id); if(!p) return null;
  const i=Math.floor(ciDias(a.inicio,todayStr())/7); return {p,i,n:Math.max(1,Math.min(p.semanas.length,i+1)),termino:i>=p.semanas.length,w:p.semanas[Math.max(0,Math.min(p.semanas.length-1,i))]};
}
/* pone el nombre de la clase de la semana en las clases del horario de esta semana (las alterna si hay A/B) */
function ciAsignarSemana(p,n){
  const w=p.semanas.find(x=>x.n===n); if(!w) return 0; const C=CL_D(), lun=ciMonday(todayStr()), dias=[...new Set(C.schedule.map(s=>s.day))].sort((a,b)=>DIAS_ORDEN.indexOf(a)-DIAS_ORDEN.indexOf(b)); let k=0;
  for(let d=0;d<7;d++){ const f=addDays(lun,d), wd=diaDeFecha(f), idx=dias.indexOf(wd); if(idx<0) continue;
    const cl=w.clases[idx%w.clases.length]; C.schedule.filter(s=>s.day===wd).forEach(s=>{ if(clAsignarRutina(f,s.id,cl.nombre)) k++; }); }
  touch(); return k;
}
function ciCargar(routine){
  state.routine=deepClone(routine); state.routine.id=rid(); const cf=state.cfg, r=state.routine; cf.metodo=r.metodo;
  if(r.metodo==="fuerza"){ cf.fModo=r.fModo; cf.objetivo=r.objetivo; cf.fDuracion=r.duracion; cf.fPorBloque=r.v2?"auto":r.porBloque; cf.fFormato=r.formato||"recto"; cf.descanso=r.descanso; }
  else { cf.estilo=r.estilo||"lista"; cf.modo=r.modo; cf.nivel=r.nivel; cf.duracion=r.duracion; cf.base=r.base; }
  state.screen="planner"; render(); window.scrollTo(0,0);
}
function ciTexto(p){ return p.semanas.map(w=>w.clases.map(c=>routineText(c,false)).join("\n\n")).join("\n\n══════════════════════\n\n"); }

/* ---------- pantallas ---------- */
function cicloBannerHtml(r){
  const c=r.ciclo; if(!c) return "";
  return `<div class="ci-banner"><div class="ci-top"><b>Semana ${c.n} de ${c.de}</b><span class="chip solid">${esc(c.etiqueta)}</span>${c.v&&r.ciclo.nombre.indexOf("clases")>0?`<span class="chip">Clase ${esc(c.v)}</span>`:""}<small>${esc(CI_ETQ_DESC[c.etiqueta]||"")}</small></div>
    ${c.sube.length?`<div class="ci-sube"><span>Lo que sube esta semana</span>${c.sube.map(x=>`<span class="chip">↑ ${esc(x)}</span>`).join("")}</div>`:`<div class="ci-sube"><span>Semana de entrada: la próxima semana esta misma clase sube un paso.</span></div>`}
    ${c.reto?`<div class="ci-reto">🎯 ${esc(c.reto)}</div>`:""}<div class="ci-nuevas">👋 ${esc(c.nuevas)}</div></div>`;
}
function cicloTextoRutina(r){
  const c=r.ciclo; if(!c) return ""; let t="CICLO: Semana "+c.n+" de "+c.de+" ("+c.etiqueta+")"+(c.v?" · Clase "+c.v:"")+"\n";
  t+=c.sube.length?"Lo que sube esta semana: "+c.sube.join("; ")+"\n":"Semana de entrada: la próxima semana esta misma clase sube un paso.\n";
  if(c.reto) t+="Reto de la semana: "+c.reto+"\n"; t+="Para quien llega nueva: "+c.nuevas+"\n"; return t;
}
function cicloHoyBlk(){
  const S=ciSemanaActual();
  if(!S) return `<section class="blk"><div class="card ci-aviso"><div><b>Que tus clases avancen semana a semana</b><p class="hint" style="margin:4px 0 0">Crea un ciclo: cada semana es la misma clase un paso más arriba, así las que ya vienen sienten su avance y las nuevas se suben sin perderse.</p></div><button class="btn primary" data-action="ci-ir">Crear ciclo</button></div></section>`;
  if(S.termino) return `<section class="blk"><div class="card ci-aviso"><div><b>Terminó el ciclo «${esc(S.p.nombre)}»</b><p class="hint" style="margin:4px 0 0">Crea uno nuevo con otros ejercicios y otra forma de empezar.</p></div><button class="btn primary" data-action="ci-ir">Nuevo ciclo</button></div></section>`;
  const w=S.w;
  return `<section class="blk"><div class="blk-head"><div><h2>Esta semana · ${esc(w.etq)}</h2><p>Semana ${S.n} de ${S.p.semanas.length} · ${esc(S.p.nombre)}</p></div><button class="btn" data-action="ci-asignar" data-id="${S.p.id}" data-n="${S.n}">🗓 Poner en mis clases de la semana</button></div>
    <div class="card"><div class="ci-sube">${w.sube.length?w.sube.map(x=>`<span class="chip">↑ ${esc(x)}</span>`).join(""):`<span class="hint">Semana de entrada: aprenden el ciclo.</span>`}</div>${w.reto?`<div class="ci-reto">🎯 ${esc(w.reto)}</div>`:""}
      <div class="acts-row" style="margin-top:12px">${w.clases.map(c=>`<button class="btn primary" data-action="ci-load" data-id="${S.p.id}" data-n="${w.n}" data-v="${c.ciclo.v}">Abrir ${S.p.variantes>1?"clase "+c.ciclo.v:"la clase"}</button>`).join("")}</div></div></section>`;
}
window.subProgramas=function(){
  const c=state.cfg, metodoNom=c.metodo==="fuerza"?"Fuerza":c.metodo==="barre"?"Barre":"Sculpt", modoNom=c.metodo==="fuerza"?MODES.fuerza[c.fModo].nom:c.metodo==="barre"?MODES.barre[c.bModo].nom:MODES.sculpt[c.modo].nom;
  const sem=state.ciSem||4, vars=state.ciVar||1, act=ciSemanaActual(), ciclos=state.programas.filter(p=>p.tipo==="ciclo"), viejos=state.programas.filter(p=>p.tipo!=="ciclo");
  const barre=c.metodo==="barre";
  const tarjeta=p=>{ const mc=p.metodo==="fuerza"?"var(--fuerza)":"var(--sculpt)", activo=act&&act.p.id===p.id;
    return `<div class="prog-card" style="--tag:${mc}"><div class="row" style="justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px"><span class="n" style="font-family:var(--f-display);font-weight:600;font-size:19px">${esc(p.nombre)}${activo?` <span class="chip solid">en curso · semana ${act.n}</span>`:""}</span>
        <div style="display:flex;gap:8px;flex-wrap:wrap">${activo?`<button class="btn sm ghost" data-action="ci-stop">Detener</button>`:`<button class="btn sm primary" data-action="ci-start" data-id="${p.id}">▶ Empezar esta semana</button>`}<button class="btn sm" data-action="ci-export" data-id="${p.id}">⬇ Exportar todo</button><button class="btn sm ghost" data-action="ci-del" data-id="${p.id}">Borrar</button></div></div>
      <div class="week-rows" style="margin-top:10px;display:grid;gap:8px">${p.semanas.map(w=>`<div class="saved-row ci-row ${activo&&act.n===w.n?"hoy":""}"><span class="chip solid" style="color:${mc};border-color:${mc};background:transparent">Semana ${w.n}</span><span class="chip">${esc(w.etq)}</span>
        <span class="ci-ch">${w.sube.length?w.sube.map(x=>`<span class="chip">↑ ${esc(x)}</span>`).join(""):`<span class="hint">aprenden el ciclo</span>`}</span><span class="spacer"></span>
        ${w.clases.map(cl=>`<button class="btn sm primary" data-action="ci-load" data-id="${p.id}" data-n="${w.n}" data-v="${cl.ciclo.v}">${p.variantes>1?"Clase "+cl.ciclo.v:"Abrir"}</button>`).join("")}
        <button class="btn sm" data-action="ci-asignar" data-id="${p.id}" data-n="${w.n}" title="Pone esta clase en el horario de esta semana">🗓</button></div>`).join("")}</div></div>`; };
  return `<div class="panel" style="margin-bottom:18px"><h3 style="margin:0 0 6px">Ciclos: clases que avanzan semana a semana</h3>
      <p class="hint" style="margin:0 0 12px">Cada semana es <b>la misma clase de la semana pasada, un paso más arriba</b>: holds más largos, más pulsos, una capa nueva, un reto con meta. Las que ya vienen contigo sienten su avance y las nuevas se suben sin perderse (la semana 1 es de entrada y cada paso trae su opción fácil).</p>
      ${barre?`<p class="hint">Los ciclos son para Sculpt y Fuerza. Cambia el método en Generar.</p>`:`<p class="hint" style="margin:0 0 10px">Se usa la configuración de <b>Generar</b>: <span class="chip solid">${metodoNom}</span> <span class="chip">${esc(modoNom)}</span></p>
      <label class="mini">Duración del ciclo</label><div class="seg" style="margin:6px 0 12px">${[3,4,6].map(n=>`<button data-action="ci-sem" data-v="${n}" class="${sem===n?"on":""}">${n} semanas</button>`).join("")}</div>
      <label class="mini">Clases distintas por semana</label><div class="seg" style="margin:6px 0 4px">${[1,2,3].map(n=>`<button data-action="ci-var" data-v="${n}" class="${vars===n?"on":""}">${n}</button>`).join("")}</div>
      <p class="hint" style="margin:0 0 14px">Si tus alumnas vienen 2 veces por semana, elige 2: cada día es una clase distinta y las dos avanzan juntas.</p>
      <button class="btn primary" data-action="ci-crear">📈 Crear ciclo</button>`}</div>
    <div class="saved-list">${ciclos.length?ciclos.map(tarjeta).join(""):`<div class="empty"><b>Aún no tienes ciclos.</b><p>Crea uno y empiézalo esta semana.</p></div>`}</div>
    ${viejos.length?`<details class="cl-mas"><summary>Programas anteriores (${viejos.length})</summary><div class="saved-list">${viejos.map(p=>{ const mc=p.metodo==="fuerza"?"var(--fuerza)":p.metodo==="barre"?"var(--barre)":"var(--sculpt)"; return `<div class="prog-card" style="--tag:${mc}"><div class="row" style="justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px"><span class="n" style="font-family:var(--f-display);font-weight:600;font-size:17px">${esc(p.nombre)}</span><div style="display:flex;gap:8px"><button class="btn sm" data-action="prog-export" data-id="${p.id}">⬇ Exportar</button><button class="btn sm ghost" data-action="prog-del" data-id="${p.id}">Borrar</button></div></div>
        <div class="week-rows" style="margin-top:10px;display:grid;gap:8px">${p.semanas.map(w=>`<div class="saved-row"><span class="chip solid">Semana ${w.n}</span><span class="n" style="font-size:14px">${esc(w.routine.nombre)}</span><span class="spacer"></span><button class="btn sm primary" data-action="prog-load" data-id="${p.id}" data-n="${w.n}">Cargar</button></div>`).join("")}</div></div>`; }).join("")}</div></details>`:""}`;
};

/* ---------- eventos ---------- */
function ciClick(a,t){
  if(a==="ci-sem"){ state.ciSem=+t.dataset.v; render(); return true; }
  if(a==="ci-var"){ state.ciVar=+t.dataset.v; render(); return true; }
  if(a==="ci-crear"){ const total=state.ciSem||4, vars=state.ciVar||1, p=cicloCrear(state.cfg,total,vars); state.programas.unshift(p); LS.set("sf_programas",state.programas); render(); toast("Ciclo creado: "+total+" semanas"); return true; }
  if(a==="ci-load"){ const p=state.programas.find(x=>x.id===t.dataset.id), w=p&&p.semanas.find(x=>x.n===+t.dataset.n), cl=w&&(w.clases.find(c=>c.ciclo.v===t.dataset.v)||w.clases[0]); if(cl) ciCargar(cl); return true; }
  if(a==="ci-start"){ const sf=Vault.data.sf; sf.cicloActivo={id:t.dataset.id,inicio:ciMonday(todayStr())}; touch(); render(); toast("Ciclo en curso: esta semana es la semana 1"); return true; }
  if(a==="ci-stop"){ delete Vault.data.sf.cicloActivo; touch(); render(); return true; }
  if(a==="ci-asignar"){ const p=state.programas.find(x=>x.id===t.dataset.id); if(!p) return true; const k=ciAsignarSemana(p,+t.dataset.n); render(); toast(k?"Puesta en "+k+" clase"+(k===1?"":"s")+" de esta semana":"No hay clases en tu horario fijo"); return true; }
  if(a==="ci-export"){ const p=state.programas.find(x=>x.id===t.dataset.id); if(p) copyText(ciTexto(p),"Ciclo completo copiado"); return true; }
  if(a==="ci-del"){ const i=state.programas.findIndex(x=>x.id===t.dataset.id); if(i<0) return true; const [p]=state.programas.splice(i,1); LS.set("sf_programas",state.programas); const act=ciActivo(); if(act&&act.id===p.id) delete Vault.data.sf.cicloActivo; render(); toastUndo("Ciclo borrado",()=>{ state.programas.splice(Math.min(i,state.programas.length),0,p); LS.set("sf_programas",state.programas); render(); }); return true; }
  if(a==="ci-ir"){ state.uiTab="programas"; state.screen="guardadas"; render(); window.scrollTo(0,0); return true; }
  return false;
}
