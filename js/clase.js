"use strict";
/* ============================================================
   CLASE · motor de calidad de las clases (Sculpt y Fuerza)
   - Fuerza v2: cada bloque tiene ejercicio principal (pesado), secundario y accesorio, con series,
     repeticiones y descanso propios, y el número de ejercicios se ajusta a la duración elegida.
   - Calificador de calidad: genera varias clases y se queda con la mejor.
   - Duración real: la clase se ajusta al tiempo que pediste y la app aprende tu ritmo.
   ============================================================ */

/* ---------- tu ritmo: la app compara lo que estimó con lo que realmente tardas ---------- */
function claseRitmoFactor(){ const p=(Vault.data.sf||{}).ritmo; return p&&p.n>=2?Math.max(.6,Math.min(1.6,p.f)):1; }
function claseRitmoGuardar(estimado,real){
  if(!(estimado>240&&real>240)) return;
  const sf=Vault.data.sf, p=sf.ritmo||(sf.ritmo={n:0,f:1}); const k=Math.max(.5,Math.min(1.8,real/estimado));
  p.f=p.n?p.f*0.65+k*0.35:k; p.n=Math.min(50,p.n+1); touch();
}

/* ---------- Fuerza: prescripción por rol (P principal · S secundario · A accesorio) ---------- */
const FZ_DIF={
  ligera:   {P:{sets:3,rep:[12,15],rest:45},S:{sets:3,rep:[12,15],rest:40},A:{sets:3,rep:[15,20],rest:30}},
  media:    {P:{sets:3,rep:[8,10],rest:60},S:{sets:3,rep:[10,12],rest:50},A:{sets:3,rep:[12,15],rest:40}},
  pesada:   {P:{sets:4,rep:[6,8],rest:90},S:{sets:3,rep:[8,10],rest:60},A:{sets:3,rep:[10,12],rest:45}},
  muypesada:{P:{sets:5,rep:[3,5],rest:120},S:{sets:4,rep:[5,7],rest:75},A:{sets:3,rep:[8,10],rest:45}}
};
const FZ_ROL={P:"Principal",S:"Secundario",A:"Accesorio"};
const FZ_RIR={P:"deja 1–2 repeticiones en reserva",S:"deja 2 en reserva",A:"llega casi al fallo con buena técnica"};
/* configuración de un ejercicio de fuerza (clases viejas sin rol usan lo general de la rutina) */
function fSlot(s,r){
  const ob=objetivoOf(r.objetivo);
  const rep=s.rep||null, lo=rep?rep[0]:null, hi=rep?rep[1]:null;
  return {sets:s.sets||r.series, rep:rep?(lo===hi?String(lo):lo+"–"+hi):r.rango, mid:rep?(lo+hi)/2:ob.mid, rest:s.rest||r.descanso, rol:s.rol||null};
}
function fzRepSeg(e){ const t=e&&e.tempo?String(e.tempo).split("-").reduce((a,b)=>a+(+b||0),0):0; return t>=3?t:3.2; }
/* tiempo real de un ejercicio: series + descansos + acomodar el material y cuear */
function fzSlotSeg(s,r){
  const f=fSlot(s,r), e=byId[s.ref], reps=f.mid*(e&&e.lado?2:1);
  return f.sets*(reps*fzRepSeg(e)+10)+(f.sets-1)*f.rest+20;
}
function fzCardioSeg(n,p){ return n*(p.work+p.rest)*p.rondas+40; }

/* familias de movimiento: dos ejercicios de la misma familia no se repiten en una clase */
const FZ_FAM=[[/flexion|push-up|pike/,"flexion"],[/press (de )?pecho|press inclinado|svend|apertura de pecho/,"presspecho"],[/press (de )?hombro|arnold|militar/,"presshombro"],
  [/remo|renegado/,"remo"],[/jalon|pull-over|dominada/,"jalon"],[/face pull|aperturas posteriores|y-t-w|superman/,"posterior"],[/sentadilla|goblet|sissy/,"sentadilla"],[/zancada|subida|cosaca|bulgara/,"zancada"],
  [/peso muerto|buenos dias|swing|pull-through/,"bisagra"],[/puente|hip thrust|frog/,"puente"],[/curl.*isquios|nordico/,"isquios"],[/curl|biceps/,"curl"],[/triceps|fondos|frances/,"triceps"],
  [/elevacion lateral|elevaciones laterales|frontales/,"deltoides"],[/pantorrilla/,"pantorrilla"],[/crunch|elevacion de piernas|v-up|v-hold|tijeras|toque|hollow|dead bug|bicicleta|giro|plancha|bird|bear|descenso/,"core"]];
function fzFam(e){
  const n=e.nom.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase();
  for(const [re,k] of FZ_FAM) if(re.test(n)) return k;
  return n.split(" ")[0];
}
function fzScore(e,rol,dif,ctx){
  const pesado=dif==="pesada"||dif==="muypesada", u=state.historia.uso||{}, aj=state.historia.ajuste||{};
  let s=Math.random()*0.9-(u[e.id]||0)*0.9-(aj[e.id]||0)*0.9;
  if(typeof aprBoostId==="function") s+=aprBoostId(e.id)*0.8;
  if(rol!=="A"&&/swing|frog|nordico|sissy|con marcha/i.test(e.nom.normalize("NFD").replace(/[\u0300-\u036f]/g,""))) s-=4;      // movimientos balísticos o de moda no sirven como ejercicio de fuerza
  if(rol==="P"){
    s+=e.comp?3:-1; s+=e.eq==="mancuernas"?2:e.eq==="cubo"?1:(e.eq==="liga"||e.eq==="peso corporal")?(pesado?-2:0):0;
    if(e.pat==="pulsos"||e.pat==="iso") s-=3; if(e.tempo&&pesado) s+=.5; if(e.lado&&!pesado) s-=.3;
  } else if(rol==="S"){ s+=e.comp?2:0; if(e.eq==="liga"&&pesado) s-=1; if(e.pat==="pulsos") s-=1.5; if(e.pat==="iso") s-=1; }
  else { s+=e.comp?-.5:1.5; if(e.pat==="iso"||e.pat==="tempo") s+=.4; }
  if(ctx&&ctx.fams.has(fzFam(e))) s-=6;               // no repetir la misma familia de movimiento
  if(ctx&&ctx.mat&&e.eq===ctx.mat) s+=.4;             // menos cambios de material
  return s;
}
/* qué grupos de pool alimentan cada rol de un bloque */
function fzRolPools(key,modo){
  const full=modo==="full";
  if(key==="push")  return {P:["push"],S:["push"],A:["push","arms"]};
  if(key==="pull")  return {P:["pull"],S:["pull"],A:["pull","arms"]};
  if(key==="arms")  return {P:["arms"],S:["arms"],A:["arms"]};
  if(key==="legs")  return {P:["knee"],S:["hinge"],A:["glute_acc","acc"]};
  if(key==="knee")  return {P:["knee"],S:["knee"],A:["glute_acc","acc"]};
  if(key==="hinge") return {P:["hinge"],S:["hinge"],A:["glute_acc","acc"]};
  if(key==="acc")   return {P:["acc"],S:["acc"],A:["abs"]};
  if(key==="glute_acc") return {P:["glute_acc"],S:["glute_acc"],A:["glute_acc"]};
  if(key==="abs")   return {P:["abs"],S:["abs"],A:["abs"]};
  return {P:[key],S:[key],A:[key]};
}
function fzTodos(grupos){ const seen=new Set(); return grupos.flatMap(g=>fuerzaPool(g)).filter(e=>{ if(seen.has(e.id)) return false; seen.add(e.id); return true; }); }

/* calentamiento y enfriamiento con cantidad propia (no todo "8–10 reps de activación") */
const PREP_Q={w_cadera:"6 por lado",w_brazos:"20 s",w_squat_air:"10 reps",w_tspine:"8 por lado",w_gluteo:"12 por lado",w_flow:"6 reps lentas",w_aprox:"1–2 series ligeras",w_worlds_greatest:"3 por lado",w_banda_hombro:"10 reps",w_leg_swings:"10 por lado",w_march_core:"20 pasos"};
function prepQ(ref,kind){
  if(kind==="prep"&&PREP_Q[ref]) return PREP_Q[ref];
  if(kind==="cool") return ref==="c_resp"||/resp/i.test((byId[ref]||{}).nom||"")?"5 respiraciones":"30 s";
  return null;
}
function fzCalentamiento(modo){
  const pick=ids=>ids.map(i=>byId[i]).filter(Boolean);
  const low=["w_cadera","w_squat_air","w_gluteo","w_leg_swings"], up=["w_brazos","w_tspine","w_banda_hombro","w_flow"], full=["w_cadera","w_brazos","w_squat_air","w_march_core"];
  const set=modo==="torso"?up:modo==="pierna"||modo==="gluteoabs"?low:full;
  return pick(set).map(slot);
}
function fzFinisher(minCardio,dif){
  const fuertes=LIB.filter(e=>e.b==="cardio"), usadas=new Set(), out=[];
  const orden=[0,0,2];                                   // dos de pie y una en el piso al final
  const n=minCardio>=8?3:minCardio>=5?3:2;
  const rondas=minCardio>=8?3:2, work=dif==="muypesada"?45:40, rest=dif==="ligera"?25:dif==="muypesada"?15:20;
  for(let i=0;i<n;i++){
    const pool=shuffle(fuertes.filter(e=>(e.f||0)===orden[i]&&!usadas.has(fzFam(e))&&!usadas.has(e.id)));
    const e=pool[0]||shuffle(fuertes.filter(x=>!usadas.has(x.id)))[0]; if(!e) continue; usadas.add(e.id); usadas.add(fzFam(e)); out.push(e);
  }
  return {slots:out.map(slot),protocolo:{work,rest,rondas}};
}

/* ---------- generador ---------- */
function fzBloque(sd,cfg,dif,F,rest,ctx,used,budget,minEj,manual){
  const pools=fzRolPools(sd.key,cfg.fModo), roles=["P","S","A","A"], slots=[]; let t=0;
  for(let i=0;i<roles.length;i++){
    const rol=roles[i]; if(manual&&slots.length>=manual) break;
    const cand=fzTodos(pools[rol]).filter(e=>!used.has(e.id)&&!slots.some(s=>s.ref===e.id)); if(!cand.length) continue;
    cand.sort((a,b)=>fzScore(b,rol,dif,ctx)-fzScore(a,rol,dif,ctx));
    const e=cand[0], x=slot(e), pr=F[rol];
    x.rol=rol; x.sets=pr.sets; x.rep=pr.rep.slice(); x.rest=rest(rol);
    if(rol==="P") x.nota="Haz 1–2 series de aproximación al 50 % y 70 % antes de la primera serie de trabajo";
    const seg=fzSlotSeg(x,{series:pr.sets,rango:"",objetivo:dif,descanso:0});
    if(!manual&&slots.length>=minEj&&t+seg>budget*1.05) break;           // lo que no cabe, no entra
    slots.push(x); t+=seg; used.add(e.id); ctx.fams.add(fzFam(e)); ctx.mat=e.eq;
  }
  return {slots,t};
}
/* si la clase se pasa del tiempo, se comprime en este orden: cardio, descansos, series del principal, calentamiento */
function fzComprimir(r,objSeg){
  const total=()=>r.sections.reduce((a,S)=>a+sectionSeconds(S,r),0);
  const work=r.sections.filter(S=>S.kind==="work"), fin=r.sections.find(S=>S.kind==="cardioFin"), prep=r.sections.find(S=>S.kind==="prep");
  const pasos=[
    ()=>{ if(fin&&fin.protocolo.rondas>2){ fin.protocolo.rondas--; return true; } return false; },
    ()=>{ let c=false; work.forEach(S=>S.slots.forEach(x=>{ const n=Math.max(30,Math.round(x.rest*0.8/5)*5); if(n<x.rest){ x.rest=n; c=true; } })); return c; },
    ()=>{ let c=false; work.forEach(S=>S.slots.forEach(x=>{ if(x.rol==="P"&&x.sets>3){ x.sets--; c=true; } })); return c; },
    ()=>{ if(prep&&prep.slots.length>3){ prep.slots.pop(); return true; } if(fin&&fin.slots.length>2){ fin.slots.pop(); return true; } return false; },
    ()=>{ let c=false; work.forEach(S=>S.slots.forEach(x=>{ if(x.rol==="S"&&x.sets>2){ x.sets--; c=true; } })); return c; }
  ];
  let g=0; for(const p of pasos){ while(total()>objSeg*1.06&&g++<8&&p()){} }
}
/* si sobra tiempo, se agrega un accesorio más donde quepa */
function fzExpandir(r,cfg,dif,F,rest,ctx,used,objSeg){
  const work=r.sections.filter(S=>S.kind==="work"), total=()=>r.sections.reduce((a,S)=>a+sectionSeconds(S,r),0); let g=0;
  while(g++<6){
    let metido=false;
    for(const S of work){
      if(S.slots.length>=5) continue; const sd=MODES.fuerza[cfg.fModo].secs.find(d=>stripBloque(d.nom)===stripBloque(S.nom)); if(!sd) continue;
      const cand=fzTodos(fzRolPools(sd.key,cfg.fModo).A).filter(e=>!used.has(e.id)); if(!cand.length) continue;
      cand.sort((a,b)=>fzScore(b,"A",dif,ctx)-fzScore(a,"A",dif,ctx));
      const e=cand[0], x=slot(e), pr=F.A; x.rol="A"; x.sets=pr.sets; x.rep=pr.rep.slice(); x.rest=rest("A");
      if(total()+fzSlotSeg(x,r)<=objSeg*1.03){ S.slots.push(x); used.add(e.id); ctx.fams.add(fzFam(e)); metido=true; }
    }
    if(!metido) break;
  }
}
function generateFuerza2(cfg){
  const mode=MODES.fuerza[cfg.fModo], dif=OBJETIVOS[cfg.objetivo]?cfg.objetivo:"media", dur=cfg.fDuracion||55, F=FZ_DIF[dif];
  const ob=objetivoOf(dif), descanso=cfg.descanso||ob.descanso, custom=descanso!==ob.descanso;
  const rest=rol=>custom?Math.max(20,Math.round(descanso*(rol==="P"?1:rol==="S"?.75:.55)/5)*5):F[rol].rest;
  const sections=[], prepSecs=cfg.calent?240:0, coolSecs=cfg.enfr?180:0;
  const cardioMin=dur>=60?8:dur>=50?7:dur>=40?5:4, fin=fzFinisher(cardioMin,dif), cardioSecs=fzCardioSeg(fin.slots.length,fin.protocolo);
  const objSeg=Math.max(15*60,(dur-3)*60*claseRitmoInv()), nb=mode.secs.length, fijo=prepSecs+coolSecs+cardioSecs;
  const presupuesto=Math.max(7*60,(objSeg-fijo)/nb), ctx={fams:new Set(),mat:null}, used=new Set();
  const manual=cfg.fPorBloque&&cfg.fPorBloque!=="auto"?+cfg.fPorBloque:0, minEj=dur>=45?2:1;
  if(cfg.calent) sections.push({id:rid(),nom:"Activación y movilidad",tag:"prep",kind:"prep",slots:fzCalentamiento(cfg.fModo)});
  const fAvg=key=>{ const p=fzTodos(fzRolPools(key,cfg.fModo).P); return p.length?p.reduce((s,e)=>s+(e.f||0),0)/p.length:0; };
  const ordered=mode.secs.map(sd=>[sd,fAvg(sd.key)]).sort((a,b)=>a[1]-b[1]).map(x=>x[0]);
  let sobra=0;
  ordered.forEach((sd,bi)=>{
    const budget=presupuesto+sobra*0.8, B=fzBloque(sd,cfg,dif,F,rest,ctx,used,budget,minEj,manual);
    sobra=Math.max(-presupuesto*.3,budget-B.t);
    sections.push({id:rid(),nom:`Bloque ${bi+1} · ${sd.nom.replace(/^Bloque \d+ · /,"")}`,tag:sd.tag,kind:"work",slots:B.slots});
  });
  sections.push({id:rid(),nom:"Finisher · Cardio metabólico",tag:"cardio",kind:"cardioFin",protocolo:fin.protocolo,slots:fin.slots});
  if(cfg.enfr) sections.push({id:rid(),nom:"Enfriamiento",tag:"prep",kind:"cool",slots:stableFlow(shuffle(LIB.filter(e=>e.b==="cool"&&!e.barre)).slice(0,4).map(slot))});
  const pr0=F.P, r={id:rid(),metodo:"fuerza",v2:true,nombre:`Fuerza · ${mode.nom} · ${dur} min`,fModo:cfg.fModo,objetivo:dif,rango:pr0.rep[0]+"–"+pr0.rep[1],series:pr0.sets,descanso,
    duracion:dur,porBloque:0,sections,creada:Date.now()};
  if(!manual){ fzComprimir(r,objSeg); fzExpandir(r,cfg,dif,F,rest,ctx,used,objSeg); }
  computeTransitions(sections,"fuerza",descanso);
  sections.forEach(S=>{ if(S.kind==="work") S.slots.forEach(s=>{ s.trans=(s.trans||"").replace(/^Descanso \d+ s( · )?/,""); s.restCue=false; }); });
  r.porBloque=Math.round(sections.filter(S=>S.kind==="work").reduce((a,S)=>a+S.slots.length,0)/nb*10)/10;
  return r;
}
const claseRitmoInv=()=>1/claseRitmoFactor();

/* descanso del ejercicio actual en la vista Instructor (con el ajuste manual de ±15 s) */
function ivFRest(){
  const iv=state.iv, r=state.routine, st=iv&&iv.steps?iv.steps[iv.i]:null;
  const base=st&&st.kind==="work"?fSlot(st.slot,r).rest:r.descanso;
  return Math.max(15,Math.min(240,base+((iv&&iv.restAdj)||0)));
}
/* un ejercicio que se añade a mano a una clase de Fuerza queda como accesorio de esa dificultad */
function fzDefecto(r){ const a=(FZ_DIF[r.objetivo]||FZ_DIF.media).A; return {rol:"A",sets:a.sets,rep:a.rep.slice(),rest:a.rest}; }

/* ---------- ajustar la duración de las clases (se aplica al generar) ---------- */

/* ---------- Sculpt por estaciones: llegar a la duración pedida ---------- */
const EST_ABS_FN=["anterior","rotacion","inferior","estabilidad"];
function estUsadosAnclas(r){ return new Set(r.sections.flatMap(S=>S.slots.map(s=>byId[s.ref].anchor)).filter(Boolean)); }
function estBloquesDe(r,bks){ return r.sections.filter(x=>bks.includes(x.bk)); }
function estOpAbs(r,ctx){
  const cand=estBloquesDe(r,["abs","plk"]).filter(S=>S.slots.length<6).sort((a,b)=>a.slots.length-b.slots.length); if(!cand.length) return false;
  const S=cand[0], usados=new Set(r.sections.flatMap(x=>x.slots.map(s=>s.ref)));
  let pool;
  if(S.bk==="plk") pool=estPoolBlk("plk").filter(e=>!usados.has(e.id));
  else { const fn=EST_ABS_FN[S.slots.length%EST_ABS_FN.length]; pool=estPoolBlk("abs").filter(e=>e.fn===fn&&!usados.has(e.id)); if(!pool.length) pool=estPoolBlk("abs").filter(e=>!usados.has(e.id)); }
  const c=estPick(pool,1)[0]; if(!c) return false; S.slots.push(estSlot(c,ctx)); return true;
}
function estOpAbsMenos(r){ const cand=estBloquesDe(r,["abs","plk"]).filter(S=>S.slots.length>3).sort((a,b)=>b.slots.length-a.slots.length); if(!cand.length) return false; cand[0].slots.pop(); return true; }
function estOpTrio(r,ctx){
  const S=estBloquesDe(r,["up"]).sort((a,b)=>a.slots.length-b.slots.length)[0]; if(!S) return false;
  const todos=[...new Set(LIB.filter(e=>e.anchor&&e.anchor.indexOf("up_s_")===0).map(e=>e.anchor))], usados=estUsadosAnclas(r), libres=todos.filter(a=>!usados.has(a)); if(!libres.length) return false;
  const a=estPick(libres.map(x=>({id:x})),1)[0].id; LIB.filter(e=>e.anchor===a).sort((x,y)=>x.ord-y.ord).forEach(e=>S.slots.push(estSlot(e,ctx))); return true;
}
function estOpTrioMenos(r){
  for(const S of estBloquesDe(r,["up"]).sort((a,b)=>b.slots.length-a.slots.length)){
    const anc=[...new Set(S.slots.map(s=>byId[s.ref].anchor).filter(a=>a&&a.indexOf("up_s_")===0))]; if(anc.length<1) continue;
    const a=anc[anc.length-1]; S.slots=S.slots.filter(s=>byId[s.ref].anchor!==a); return true; }
  return false;
}
/* pierna: capas extra (variantes A y B) antes del hold final a la falla */
function estOpPierna(r,ctx){
  for(const S of estBloquesDe(r,["leg"])){
    const An=EST_ANCHORS[S.anchor]; if(!An||An.lados) continue;
    const tiene=new Set(S.slots.map(s=>byId[s.ref].layer)), falta=An.layers.map(i=>byId[i]).filter(e=>["varA","varB"].includes(e.layer)&&!tiene.has(e.layer)); if(!falta.length) continue;
    const i=S.slots.findIndex(s=>byId[s.ref].layer==="falla"); S.slots.splice(i<0?S.slots.length:i,0,estSlot(falta[0],ctx)); return true; }
  return false;
}
function estOpPiernaMenos(r){
  for(const S of estBloquesDe(r,["leg"])){
    const An=EST_ANCHORS[S.anchor]; if(!An||An.lados) continue;
    const i=S.slots.map(s=>byId[s.ref].layer).lastIndexOf("varB"), j=S.slots.map(s=>byId[s.ref].layer).lastIndexOf("varA"), k=i>=0?i:j; if(k<0) continue;
    S.slots.splice(k,1); return true; }
  return false;
}
function estOpCierre(r,ctx){
  const S=r.sections.find(x=>x.bk==="cierre"); if(!S) return false;
  const sig=EST_CIERRE.find(e=>!S.slots.some(s=>s.ref===e.id)); if(!sig||S.slots.length>=4) return false; S.slots.push(estSlot(sig,ctx)); return true;
}
function estOpCierreMenos(r){ const S=r.sections.find(x=>x.bk==="cierre"); if(!S||S.slots.length<=2) return false; S.slots.pop(); return true; }
function estOpGlu(r,ctx){
  const S=r.sections.find(x=>x.bk==="glu"); if(!S) return false; const usados=estUsadosAnclas(r);
  const libres=Object.values(EST_ANCHORS).filter(a=>a.blk==="glu"&&!usados.has(a.id)); if(!libres.length) return false;
  const An=EST_ANCHORS[estPick(libres.map(a=>({id:a.id})),1)[0].id], L=An.layers.map(i=>byId[i]);
  if(An.lados){ L.forEach(e=>S.slots.push(estSlot(e,ctx,"A"))); L.forEach(e=>S.slots.push(estSlot(e,ctx,"B"))); } else L.forEach(e=>S.slots.push(estSlot(e,ctx))); return true;
}
function estOpGluMenos(r){
  const S=r.sections.find(x=>x.bk==="glu"); if(!S) return false; const anc=[...new Set(S.slots.map(s=>byId[s.ref].anchor))]; if(anc.length<2) return false;
  const a=anc[anc.length-1]; S.slots=S.slots.filter(s=>byId[s.ref].anchor!==a); return true;
}
function estAjustarDuracion(r,cfg){
  const ctx={size:"M",dif:r.nivel,base:r.base,eq:new Set(r.material||[])};
  const obj=Math.max(15*60,(cfg.duracion-5)*60/claseRitmoFactor()), tot=()=>r.sections.reduce((a,S)=>a+sectionSeconds(S,r),0), tol=110;
  const mas=[()=>estOpAbs(r,ctx),()=>estOpTrio(r,ctx),()=>estOpPierna(r,ctx),()=>estOpCierre(r,ctx),()=>estOpGlu(r,ctx),()=>estOpAbs(r,ctx)];
  const menos=[()=>estOpCierreMenos(r),()=>estOpAbsMenos(r),()=>estOpPiernaMenos(r),()=>estOpTrioMenos(r),()=>estOpGluMenos(r),()=>estOpAbsMenos(r)];
  let g=0;
  while(g++<12){
    const t=tot(); if(Math.abs(t-obj)<=tol) break;
    const ops=t<obj?mas:menos; let hecho=false;
    for(const op of ops){
      const snap=r.sections.map(S=>Object.assign({},S,{slots:S.slots.slice()}));
      if(!op()){ continue; }
      const t2=tot(); if(t<obj?t2<=obj+tol*1.4:t2>=obj-tol*1.4){ hecho=true; break; }
      r.sections.forEach((S,i)=>{ S.slots=snap[i].slots; });
    }
    if(!hecho) break;
  }
  estTransiciones(r);
  if(typeof estCargas==="function") estCargas(r);
}

/* ============================================================
   CALIFICADOR DE CALIDAD: puntúa una clase y la app se queda con la mejor de varias generadas
   ============================================================ */
function claseCambiosMaterial(r){
  let prev=null,c=0; r.sections.forEach(S=>{ if(S.kind==="prep"||S.kind==="cool") return; S.slots.forEach(s=>{ const e=resolve(s).eq; if(prev!==null&&e!==prev) c++; prev=e; }); }); return c;
}
function claseTarget(r){ return r.metodo==="fuerza"?(r.duracion||55)-3:r.metodo==="barre"?(r.duracion||50)-3:(r.duracion||45)-5; }
function claseCalidad(r){
  const pts=[]; let pen=0; const add=(t,txt,p)=>{ pen+=p||0; pts.push({t,x:txt,p:p||0}); };
  const est=estimateMinutes(r), obj=claseTarget(r), dev=Math.abs(est-obj);
  if(dev<=2) add("ok","Duración ajustada: ≈ "+est+" min de "+r.duracion); else add("warn","Dura ≈ "+est+" min y pediste "+r.duracion+" (ideal ≈ "+obj+")",Math.min(25,(dev-2)*5));
  const cm=claseCambiosMaterial(r), base=r.metodo==="fuerza"?6:8;
  if(cm<=base) add("ok","Pocos cambios de material ("+cm+")"); else add("warn",cm+" cambios de material entre ejercicios",Math.min(15,(cm-base)*1.6));
  const all=r.sections.filter(S=>S.kind!=="prep"&&S.kind!=="cool").flatMap(S=>S.slots), refs=all.map(s=>s.ref);
  const llaves=all.filter(s=>!(s.q&&s.q.t==="trans")).map(s=>s.ref+"|"+(s.side||"")), dup=llaves.length-new Set(llaves).size;   // Lado A y Lado B repiten el ejercicio a propósito if(dup) add("warn","Hay "+dup+" ejercicio(s) repetido(s)",dup*10);
  const u=state.historia.uso||{}, avg=refs.length?refs.reduce((a,x)=>a+(u[x]||0),0)/refs.length:0;
  if(avg>0.55) add("warn","Muy parecida a tus últimas clases",Math.min(12,avg*9)); else add("ok","Variada respecto a tus últimas clases");
  const work=r.sections.filter(S=>S.kind==="work");
  if(r.metodo==="fuerza"){
    const pesado=r.objetivo==="pesada"||r.objetivo==="muypesada";
    work.forEach(S=>{ const P=S.slots[0]; if(!P) return; if(r.v2){ if(P.rol!=="P") add("warn","Un bloque no empieza con su ejercicio principal",6);
        else if(!byId[P.ref].comp&&S.bk!=="acc") add("warn","El principal de \""+S.nom.replace(/^Bloque \d+ · /,"")+"\" no es compuesto",5);
        else if(pesado&&(P.eq==="liga"||P.eq==="peso corporal")) add("warn","El principal de \""+S.nom.replace(/^Bloque \d+ · /,"")+"\" tiene poca carga para dificultad "+objetivoOf(r.objetivo).nom.toLowerCase(),4); } });
    const seg=work.map(S=>sectionSeconds(S,r)), mx=Math.max(...seg), mn=Math.min(...seg); if(mn>0&&mx/mn>1.8) add("warn","Los bloques quedaron desbalanceados en tiempo",6); else add("ok","Bloques equilibrados en tiempo");
    const fams=work.flatMap(S=>S.slots.filter(x=>x.rol!=="A").map(x=>fzFam(byId[x.ref]))); const rep=fams.length-new Set(fams).size; if(rep>1) add("warn","Se repite el tipo de movimiento ("+rep+")",rep*3);
    const fin=r.sections.find(S=>S.kind==="cardioFin"); if(!fin||fin.slots.length<2) add("warn","El finisher de cardio es muy corto",6);
  } else if(r.estilo==="estacion"){
    work.forEach(S=>{ const n=S.slots.length; if(n<4&&S.bk!=="abs"&&S.bk!=="plk") add("warn","\""+S.nom.replace(/^Bloque \d+ · /,"")+"\" quedó con pocos pasos ("+n+")",3); if(n>9) add("warn","\""+S.nom.replace(/^Bloque \d+ · /,"")+"\" tiene demasiados pasos ("+n+")",3); });
    let racha=0,mxr=0; all.forEach(s=>{ const q=s.q&&s.q.t; racha=q==="hold"?racha+1:0; mxr=Math.max(mxr,racha); }); if(mxr>=3) add("warn","Hay "+mxr+" holds seguidos",4);
    if(r.duracion>=45&&!r.sections.some(S=>S.bk==="cierre")) add("warn","Falta el cierre con relajación",5);
    if(typeof aprBoostId==="function"){ const af=work.map(S=>S.anchor?aprBoostId(S.anchor):0); const b=af.reduce((a,x)=>a+x,0)/Math.max(1,af.length); if(b>0.1) add("ok","Sigue tu formato (estaciones que sueles dar)"); }
  }
  const score=Math.max(0,Math.min(100,Math.round(100-pen)));
  return {score,notas:pts,pen};
}
function claseCalidadHtml(r){
  if(r.metodo==="barre") return "";
  const q=claseCalidad(r), col=q.score>=85?"var(--ok,#7fb77e)":q.score>=70?"var(--warn,#e3ab52)":"#d65454", malas=q.notas.filter(n=>n.t==="warn"), buenas=q.notas.filter(n=>n.t==="ok");
  return `<div class="cal-card"><div class="cal-top"><div class="cal-score" style="--c:${col}"><b>${q.score}</b><small>/100</small></div><div><b>Calidad de la clase</b><div class="cal-bar"><i style="width:${q.score}%;background:${col}"></i></div></div></div>
    <div class="cal-notes">${malas.map(n=>`<span class="cal-n warn">⚠ ${esc(n.x)}</span>`).join("")}${buenas.slice(0,4).map(n=>`<span class="cal-n ok">✔ ${esc(n.x)}</span>`).join("")}</div></div>`;
}
