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
  if(s.pir){ const nums=String(s.pir).match(/\d+/g).map(Number); return {sets:s.sets||nums.length,rep:s.pir,mid:nums.reduce((a,b)=>a+b,0)/nums.length,rest:s.rest||r.descanso,rol:s.rol||null,pir:true}; }
  const rep=s.rep||null, lo=rep?rep[0]:null, hi=rep?rep[1]:null;
  return {sets:s.sets||r.series, rep:rep?(lo===hi?String(lo):lo+"–"+hi):r.rango, mid:rep?(lo+hi)/2:ob.mid, rest:s.rest||r.descanso, rol:s.rol||null};
}
function fzRepSeg(e,s){ const tp=(s&&s.tempo)||(e&&e.tempo)||"", t=tp?String(tp).split("-").reduce((a,b)=>a+(+b||0),0):0; return t>=3?t:3.2; }
/* tiempo real de un ejercicio: series + descansos + acomodar el material y cuear */
function fzSlotSeg(s,r){
  const f=fSlot(s,r), e=byId[s.ref], reps=f.mid*(e&&e.lado?2:1);
  return f.sets*(reps*fzRepSeg(e,s)+10)+(f.sets-1)*f.rest+20;
}
function fzCardioSeg(n,p){ return n*(p.work+p.rest)*p.rondas+40; }
/* una biserie: A y B se alternan sin descanso entre ellos y se descansa al terminar los dos */
function fzTrabajo(s,r){ const f=fSlot(s,r), e=byId[s.ref]; return f.mid*(e&&e.lado?2:1)*fzRepSeg(e,s)+10; }
function fzParSeg(a,b,r){ const fa=fSlot(a,r), fb=fSlot(b,r), sets=Math.min(fa.sets,fb.sets); return sets*(fzTrabajo(a,r)+fzTrabajo(b,r)+15)+(sets-1)*Math.max(fa.rest,fb.rest)+25; }
/* tiempo de un bloque de fuerza (agrupa las biseries) */
function fzSecSeg(S,r){
  let t=0; for(let k=0;k<S.slots.length;k++){ const a=S.slots[k], b=S.slots[k+1]; if(a.par&&b&&b.par===a.par){ t+=fzParSeg(a,b,r); k++; } else t+=fzSlotSeg(a,r); } return t;
}
/* si se quita o se mueve un ejercicio, una biserie debe seguir siendo de dos ejercicios seguidos */
/* los dos ejercicios de una biserie comparten series y descanso */
function fzHarmonizar(r){
  r.sections.forEach(S=>S.slots.forEach(x=>{ if(x.pir){ const a=x.pir.split(" · "); if(a.length!==x.sets) x.pir=a.slice(Math.max(0,a.length-x.sets)).join(" · "); } }));
  r.sections.forEach(S=>{ if(S.kind!=="work") return; for(let k=0;k<S.slots.length-1;k++){ const a=S.slots[k], b=S.slots[k+1]; if(a.par&&b.par===a.par){ a.sets=b.sets=Math.min(a.sets,b.sets); a.rest=b.rest=Math.max(a.rest,b.rest); k++; } } });
}
function fzNormalizarPares(r){
  if(!r||!r.v2) return;
  r.sections.forEach(S=>{ if(S.kind!=="work") return;
    const cuenta={}; S.slots.forEach(s=>{ if(s.par) cuenta[s.par]=(cuenta[s.par]||0)+1; });
    S.slots.forEach((s,k)=>{ if(!s.par) return; const ant=S.slots[k-1], sig=S.slots[k+1], vecino=(ant&&ant.par===s.par)||(sig&&sig.par===s.par); if(cuenta[s.par]!==2||!vecino) delete s.par; });
  });
}

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
/* Qué ejercicio puede ir en cada lugar. Listas cerradas, escritas a mano, para que un bloque tenga sentido:
   empuje = presses y flexiones, con tríceps u hombro como accesorio (nunca un curl);
   tracción = remos y jalones, con bíceps o espalda alta como accesorio (nunca tríceps);
   pierna = sentadilla / zancada / bisagra, con glúteo o pantorrilla como accesorio (nunca un crunch). */
const FZ_L={
  pecho_P:["u_press_pecho","u_press_alt","u_press_incl_pel"],
  hombro_P:["u_press_hombro","u_press_alt_hombro","u_arnold"],
  empuje_S:["u_press_incl_pel","u_flex_tempo","u_flex_declinada","u_pushup_liga","u_press_liga_1a","u_svend","u_press_isopulso","u_press_alt"],
  triceps:["u_fondos","u_flex_diamante","u_patada_tri","u_tri_ext_liga","u_press_frances_piso"],
  deltoides:["u_lat_raise","u_lat_liga","u_front_pulso","u_arnold_iso"],
  remo_P:["u_remo_bilateral","u_remo_1m"],
  traccion_S:["u_remo_renegado","u_pullover","u_jalon_liga","u_remo_liga","u_pullover_pel","u_remo_iso","u_remo_1m","u_remo_bilateral"],
  biceps:["u_curl_tempo","u_curl_martillo","u_curl_iso90","u_21s","u_curl_concentr","u_curl_liga"],
  espalda_alta:["u_reverse_fly","u_face_pull","u_pull_apart","u_ytw","u_rot_ext_liga","u_remo_alto"],
  rodilla_P:["l_squat_tempo","l_squat_cubo","l_squat_1y14","l_zancada_est"],
  rodilla_S:["l_bulgara","l_zancada_est","l_zancada_atras","l_zancada_lat","l_step_up","l_step_lat_cubo","l_cossack","l_zancada_cam"],
  rodilla_A:["l_wall_sit","l_squat_iso_pulso","l_sumo_pulso","l_step_pulso","l_squat_pel_pared","l_calf","l_calf_1p","l_calf_sentada"],
  bisagra_P:["l_rdl","l_hip_thrust","l_rdl_deficit"],
  bisagra_S:["l_hip_thrust","l_rdl_1p","l_hip_thrust_1p","l_puente_tempo","l_good_morning","l_rdl_liga","l_pull_through","l_rdl_pelota","l_rdl"],
  isquios_A:["l_curl_pelota","l_curl_desliz","l_curl_polaina","l_puente_1p_iso","l_puente_pulso","l_puente_marcha"],
  gluteo_A:["l_puente_iso_ab","l_frog_pump","l_kickback","l_kick_polaina","l_abduccion","l_monster_walk","l_curtsy_abd","l_abd_sentada","l_fire_hydrant","l_abd_lat_pol","l_side_lift_pol","l_kick_pel"],
  gluteo_P:["l_hip_thrust_1p","l_puente_tempo","l_curtsy_abd","l_hip_thrust"],
  core_piso:["c_crunch_tempo","c_crunch_peso","c_leg_raise","c_dead_bug","c_reverse_crunch","c_heel_taps","c_leg_polaina","c_dead_bug_pol","c_tijeras","c_giro_ruso","c_bici","c_toe_touch_peso","c_hollow_rock","c_v_up","c_crunch_obl"],
  core_estab:["c_plancha_iso","c_side_plank_iso","c_shoulder_tap","c_bird_dog","c_hollow","c_bear_hold","c_mountain_slow","c_pallof","c_side_dip","c_plancha_reach"],
};
function fzRolPools(key,modo){
  const torso=modo==="torso";
  if(key==="push")  return torso?{P:["@pecho_P"],S:["@empuje_S"],A:["@triceps"]}:{P:["@pecho_P","@hombro_P"],S:["@empuje_S","@hombro_P"],A:["@triceps","@deltoides"]};
  if(key==="pull")  return {P:["@remo_P"],S:["@traccion_S"],A:["@biceps","@espalda_alta"]};
  if(key==="arms")  return {P:["@hombro_P"],S:["@deltoides"],A:["@biceps","@triceps"]};
  if(key==="legs")  return {P:["@rodilla_P"],S:["@bisagra_P","@rodilla_S"],A:["@gluteo_A","@isquios_A","@rodilla_A"]};
  if(key==="knee")  return {P:["@rodilla_P"],S:["@rodilla_S"],A:["@rodilla_A"]};
  if(key==="hinge") return {P:["@bisagra_P"],S:["@bisagra_S"],A:["@isquios_A","@gluteo_A"]};
  if(key==="acc")   return {P:["@gluteo_P"],S:["@gluteo_A"],A:["@core_piso","@core_estab"]};
  if(key==="glute_acc") return {P:["@gluteo_P"],S:["@gluteo_A"],A:["@gluteo_A"]};
  if(key==="abs")   return {P:["@core_piso"],S:["@core_estab"],A:["@core_piso","@core_estab"]};
  return {P:[key],S:[key],A:[key]};
}
function fzLista(g){ return g[0]==="@"?(FZ_L[g.slice(1)]||[]).map(i=>byId[i]).filter(Boolean):fuerzaPool(g); }
function fzTodos(grupos){ const seen=new Set(); return grupos.flatMap(fzLista).filter(e=>{ if(seen.has(e.id)) return false; seen.add(e.id); return true; }); }
/* orden de los bloques: lo más pesado y compuesto primero, el accesorio al final */
const FZ_ORDEN={full:["legs","push","pull"],torso:["push","pull","arms"],pierna:["knee","hinge","acc"],gluteoabs:["hinge","glute_acc","abs"]};
/* estiramientos de lo que se trabajó; de pie primero, al final al piso con respiración */
const FZ_ENFR={torso:["z_pecho","z_cuello","z_gato","z_nino","z_torsion"],pierna:["z_cuadri","z_isquios","z_paloma","bz_figure4","z_nino"],gluteoabs:["z_isquios","z_paloma","bz_figure4","z_cobra","z_torsion"],full:["z_cuadri","z_pecho","z_isquios","z_paloma","z_nino","z_torsion"]};
function fzEnfriamiento(modo){
  const ids=shuffle(FZ_ENFR[modo]||FZ_ENFR.full).slice(0,3);
  return ids.map(i=>byId[i]).filter(Boolean).sort((a,b)=>(a.f||0)-(b.f||0)).concat([byId.z_resp].filter(Boolean)).map(slot);
}
/* los básicos pesados cuentan como compuestos (para elegir el principal y para el calificador) */
["pecho_P","hombro_P","remo_P","rodilla_P","bisagra_P"].forEach(k=>FZ_L[k].forEach(i=>{ if(byId[i]) byId[i].comp=1; }));

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
/* ---------- generador ---------- */
function fzNuevo(e,rol,F,rest){ const x=slot(e), pr=F[rol]; x.rol=rol; x.sets=pr.sets; x.rep=pr.rep.slice(); x.rest=rest(rol); if(typeof temaFzSlot==="function") temaFzSlot(x,rol); return x; }
function fzBloque(sd,cfg,dif,F,rest,ctx,used,budget,minEj,manual){
  const pools=fzRolPools(sd.key,cfg.fModo), bis=cfg.fFormato==="biseries", slots=[]; let t=0, gid=0;
  let unidades=bis?[["P"],["S","A"],["A","A"]]:[["P"],["S"],["A"],["A"]]; if(FZ_TEMA&&FZ_TEMA.id==="cluster") unidades=unidades.slice(0,2);
  const elegir=(rol,propios)=>{ let cand=fzTodos(pools[rol]).filter(e=>!used.has(e.id)&&!slots.some(s=>s.ref===e.id)&&!propios.some(s=>s.ref===e.id)); if(!cand.length) return null;
    const famB=new Set(slots.concat(propios).map(s=>fzFam(byId[s.ref]))), distintos=cand.filter(e=>!famB.has(fzFam(e))); if(distintos.length) cand=distintos;   /* dentro de un bloque, cada ejercicio es un movimiento distinto (no dos curls ni dos puentes) */ cand.sort((a,b)=>fzScore(b,rol,dif,ctx)-fzScore(a,rol,dif,ctx)); return cand[0]; };
  for(const u of unidades){
    if(manual&&slots.length>=manual) break;
    const nuevos=[]; for(const rol of u){ const e=elegir(rol,nuevos); if(!e) break; const x=fzNuevo(e,rol,F,rest); if(rol==="P") x.nota=(x.nota?x.nota+" · ":"")+"Haz 1–2 series de aproximación al 50 % y 70 % antes de la primera serie de trabajo"; nuevos.push(x); }
    if(!nuevos.length) continue;
    let seg;
    if(nuevos.length===2){
      const id="p"+(++gid), pr=Math.round(Math.max(nuevos[0].rest,nuevos[1].rest)*0.85/5)*5, sets=Math.min(nuevos[0].sets,nuevos[1].sets);
      nuevos.forEach(x=>{ x.par=id; x.rest=pr; x.sets=sets; }); nuevos[1].nota="Biserie: sin descanso entre A y B; descansas al terminar los dos";
      seg=fzParSeg(nuevos[0],nuevos[1],{series:sets,rango:"",objetivo:dif,descanso:0});
    } else seg=fzSlotSeg(nuevos[0],{series:nuevos[0].sets,rango:"",objetivo:dif,descanso:0});
    if(!manual&&slots.length>=minEj&&t+seg>budget*1.05) break;           // lo que no cabe, no entra
    nuevos.forEach(x=>{ slots.push(x); used.add(x.ref); ctx.fams.add(fzFam(byId[x.ref])); ctx.mat=byId[x.ref].eq; }); t+=seg;
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
    ()=>{ let c=false; work.forEach(S=>S.slots.forEach(x=>{ if(x.rol==="S"&&x.sets>2){ x.sets--; c=true; } })); return c; },
    // último recurso: quitar el último ejercicio (o biserie) del bloque más largo, dejando al menos dos ejercicios
    ()=>{ const B=work.slice().sort((a,b)=>fzSecSeg(b,r)-fzSecSeg(a,r))[0]; if(!B||B.slots.length<=2) return false; const x=B.slots[B.slots.length-1];
      if(x.par){ const id=x.par, quedan=B.slots.filter(q=>q.par!==id); if(quedan.length>=2) B.slots=quedan; else { B.slots.pop(); B.slots.forEach(q=>{ if(q.par===id) delete q.par; }); } } else B.slots.pop(); return true; }
  ];
  let g=0; for(const p of pasos){ while(total()>objSeg*1.06&&g++<14&&p()){} }
}
/* si sobra tiempo, se agrega un accesorio más (o una biserie de accesorios) donde quepa */
function fzExpandir(r,cfg,dif,F,rest,ctx,used,objSeg){
  const work=r.sections.filter(S=>S.kind==="work"), total=()=>r.sections.reduce((a,S)=>a+sectionSeconds(S,r),0), bis=cfg.fFormato==="biseries"; let g=0, gid=100;
  while(g++<6){
    let metido=false;
    for(const S of work){
      if(S.slots.length>=(bis?7:5)) continue; const sd=MODES.fuerza[cfg.fModo].secs.find(d=>stripBloque(d.nom)===stripBloque(S.nom)); if(!sd) continue;
      const famBloque=new Set(S.slots.map(x=>fzFam(byId[x.ref])));   // ni dos pantorrillas ni dos sentadillas en el mismo bloque
      let cand=fzTodos(fzRolPools(sd.key,cfg.fModo).A).filter(e=>!used.has(e.id)&&!famBloque.has(fzFam(e)));
      if(cand.length<(bis?2:1)) continue;
      cand.sort((a,b)=>fzScore(b,"A",dif,ctx)-fzScore(a,"A",dif,ctx));
      const elegidos=[cand[0]]; if(bis){ const b2=cand.find(e=>fzFam(e)!==fzFam(cand[0])); if(b2) elegidos.push(b2); }   /* sin pareja distinta: entra solo */
      const nuevos=elegidos.map(e=>fzNuevo(e,"A",F,rest));
      if(nuevos.length===2){ const id="p"+(++gid), pr=Math.round(Math.max(nuevos[0].rest,nuevos[1].rest)*0.85/5)*5, sets=Math.min(nuevos[0].sets,nuevos[1].sets); nuevos.forEach(x=>{ x.par=id; x.rest=pr; x.sets=sets; }); nuevos[1].nota="Biserie: sin descanso entre A y B; descansas al terminar los dos"; }
      const extra=nuevos.length===2?fzParSeg(nuevos[0],nuevos[1],r):fzSlotSeg(nuevos[0],r);
      if(total()+extra<=objSeg*1.03){ nuevos.forEach(x=>{ S.slots.push(x); used.add(x.ref); ctx.fams.add(fzFam(byId[x.ref])); }); metido=true; }
    }
    if(!metido) break;
  }
}
function generateFuerza2(cfg){
  const tema=temaPorId("fuerza",cfg._tema); FZ_TEMA=tema; if(tema.id==="densidad") cfg=Object.assign({},cfg,{fFormato:"biseries"});
  const mode=MODES.fuerza[cfg.fModo], dif=OBJETIVOS[cfg.objetivo]?cfg.objetivo:"media", dur=cfg.fDuracion||55, F=FZ_DIF[dif];
  const ob=objetivoOf(dif), descanso=cfg.descanso||ob.descanso, custom=descanso!==ob.descanso;
  const rest=rol=>custom?Math.max(20,Math.round(descanso*(rol==="P"?1:rol==="S"?.75:.55)/5)*5):F[rol].rest;
  const sections=[], prepSecs=cfg.calent?240:0, coolSecs=cfg.enfr?180:0;
  const cardioMin=dur>=60?8:dur>=50?7:dur>=40?5:4, fin=fzFinisher(cardioMin,dif,fzFinFormato()), cardioSecs=fzCardioSeg(fin.slots.length,fin.protocolo);
  const objSeg=Math.max(15*60,(dur-3)*60*claseRitmoInv()), nb=mode.secs.length, fijo=prepSecs+coolSecs+cardioSecs;
  const presupuesto=Math.max(7*60,(objSeg-fijo)/nb), ctx={fams:new Set(),mat:null}, used=new Set();
  const manual=cfg.fPorBloque&&cfg.fPorBloque!=="auto"?+cfg.fPorBloque:0, minEj=dur>=45?2:1;
  if(cfg.calent) sections.push({id:rid(),nom:"Activación y movilidad",tag:"prep",kind:"prep",slots:fzCalentamiento(cfg.fModo)});
  const orden=FZ_ORDEN[cfg.fModo]||[], ordered=mode.secs.slice().sort((a,b)=>(orden.indexOf(a.key)+9)%9-(orden.indexOf(b.key)+9)%9);
  let sobra=0;
  ordered.forEach((sd,bi)=>{
    const budget=presupuesto+sobra*0.8, B=fzBloque(sd,cfg,dif,F,rest,ctx,used,budget,minEj,manual);
    sobra=Math.max(-presupuesto*.3,budget-B.t);
    sections.push({id:rid(),nom:`Bloque ${bi+1} · ${sd.nom.replace(/^Bloque \d+ · /,"")}`,tag:sd.tag,kind:"work",bk:sd.key,slots:B.slots});
  });
  sections.push({id:rid(),nom:"Finisher · "+fin.nom,tag:"cardio",kind:"cardioFin",protocolo:fin.protocolo,formato:fin.formato,slots:fin.slots});
  if(cfg.enfr) sections.push({id:rid(),nom:"Enfriamiento",tag:"prep",kind:"cool",slots:fzEnfriamiento(cfg.fModo)});
  const pr0=F.P, r={id:rid(),metodo:"fuerza",v2:true,tema:tema.id,temaNom:tema.nom,temaDesc:tema.desc,nombre:`Fuerza · ${mode.nom} · ${dur} min${tema.id!=="clasica"?" · "+tema.nom:""}`,fModo:cfg.fModo,objetivo:dif,rango:pr0.rep[0]+"–"+pr0.rep[1],series:pr0.sets,descanso,
    duracion:dur,formato:cfg.fFormato==="biseries"?"biseries":"recto",porBloque:0,sections,creada:Date.now()};
  if(!manual){ fzComprimir(r,objSeg); fzExpandir(r,cfg,dif,F,rest,ctx,used,objSeg); }
  fzHarmonizar(r);
  computeTransitions(sections,"fuerza",descanso);
  sections.forEach(S=>{ if(S.kind==="work") S.slots.forEach(s=>{ s.trans=(s.trans||"").replace(/^Descanso \d+ s( · )?/,""); s.restCue=false; }); });
  r.porBloque=Math.round(sections.filter(S=>S.kind==="work").reduce((a,S)=>a+S.slots.length,0)/nb*10)/10;
  FZ_TEMA=null;
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
  for(const S of cand) if(estOpAbsEn(r,S,ctx)) return true;
  return false;
}
function estOpAbsEn(r,S,ctx){
  const usados=new Set(r.sections.flatMap(x=>x.slots.map(s=>s.ref))), noms=new Set(r.sections.flatMap(x=>x.slots.map(s=>estNomKey(byId[s.ref]))));
  const libre=e=>!usados.has(e.id)&&!noms.has(estNomKey(e));
  let pool;
  if(S.bk==="plk") pool=estPoolBlk("plk").filter(libre);
  else { const fn=EST_ABS_FN[S.slots.length%EST_ABS_FN.length]; pool=estPoolBlk("abs").filter(e=>e.fn===fn&&libre(e)); if(!pool.length) pool=estPoolBlk("abs").filter(libre); }
  const c=estPick(pool,1)[0]; if(!c) return false; S.slots.push(estSlot(c,ctx));
  const orden=S.bk==="plk"?(a,b)=>estPlkOrden(byId[a.ref])-estPlkOrden(byId[b.ref]):(a,b)=>((byId[a.ref].f||0)-(byId[b.ref].f||0))||((EST_FN_ORD[byId[a.ref].fn]??9)-(EST_FN_ORD[byId[b.ref].fn]??9));
  S.slots.sort(orden); return true;
}
function estOpAbsMenos(r){ const cand=estBloquesDe(r,["abs","plk"]).filter(S=>S.slots.length>3).sort((a,b)=>b.slots.length-a.slots.length); if(!cand.length) return false; cand[0].slots.pop(); return true; }
function estOpTrio(r,ctx){
  const S=estBloquesDe(r,["up"]).sort((a,b)=>a.slots.length-b.slots.length)[0]; if(!S||S.slots.length>=7) return false;   /* un bloque de más de 9 pasos ya no se sigue */
  const todos=[...new Set(LIB.filter(e=>e.anchor&&e.anchor.indexOf("up_s_")===0).map(e=>e.anchor))], usados=estUsadosAnclas(r), libres=todos.filter(a=>!usados.has(a)); if(!libres.length) return false;
  const a=estPick(libres.map(x=>({id:x})),1)[0].id; LIB.filter(e=>e.anchor===a).sort((x,y)=>x.ord-y.ord).forEach(e=>S.slots.push(estSlot(e,ctx))); return true;
}
function estOpTrioMenos(r){
  for(const S of estBloquesDe(r,["up"]).sort((a,b)=>b.slots.length-a.slots.length)){
    const anc=[...new Set(S.slots.map(s=>byId[s.ref].anchor).filter(a=>a&&a.indexOf("up_s_")===0))]; if(anc.length<2) continue;   // siempre queda al menos un trío de pie: el bloque no termina en "subes a pie" sin nada
    const a=anc[anc.length-1]; S.slots=S.slots.filter(s=>byId[s.ref].anchor!==a); return true; }
  return false;
}
/* pierna: capas extra (variantes A y B) antes del hold final a la falla */
function estOpPierna(r,ctx){
  for(const S of estBloquesDe(r,["leg"])){
    const An=EST_ANCHORS[S.anchor]; if(!An||An.lados||An.custom) continue;
    const tiene=new Set(S.slots.map(s=>byId[s.ref].layer)), falta=An.layers.map(i=>byId[i]).filter(e=>["varA","varB"].includes(e.layer)&&!tiene.has(e.layer)); if(!falta.length) continue;
    const i=S.slots.findIndex(s=>byId[s.ref].layer==="falla"); S.slots.splice(i<0?S.slots.length:i,0,estSlot(falta[0],ctx)); return true; }
  return false;
}
function estOpPiernaMenos(r){
  for(const S of estBloquesDe(r,["leg"])){
    const An=EST_ANCHORS[S.anchor]; if(!An||An.lados||An.custom) continue;
    const i=S.slots.map(s=>byId[s.ref].layer).lastIndexOf("varB"), j=S.slots.map(s=>byId[s.ref].layer).lastIndexOf("varA"), k=i>=0?i:j; if(k<0) continue;
    S.slots.splice(k,1); return true; }
  return false;
}
function estOpCierre(r,ctx){
  const S=r.sections.find(x=>x.bk==="cierre"); if(!S) return false;
  const sig=shuffle(EST_CIERRE.filter(e=>!S.slots.some(s=>s.ref===e.id)))[0]; if(!sig||S.slots.length>=4) return false; S.slots.push(estSlot(sig,ctx)); return true;
}
function estOpCierreMenos(r){ const S=r.sections.find(x=>x.bk==="cierre"); if(!S||S.slots.length<=2) return false; S.slots.pop(); return true; }
function estOpGlu(r,ctx){
  const S=r.sections.find(x=>x.bk==="glu"); if(!S||S.slots.length>=6) return false; const usados=estUsadosAnclas(r);
  const libres=Object.values(EST_ANCHORS).filter(a=>a.blk==="glu"&&!usados.has(a.id)); if(!libres.length) return false;
  const An=EST_ANCHORS[estPick(libres.map(a=>({id:a.id})),1)[0].id], L=An.layers.map(i=>byId[i]);
  if(An.lados){ L.forEach(e=>S.slots.push(estSlot(e,ctx,"A"))); L.forEach(e=>S.slots.push(estSlot(e,ctx,"B"))); } else L.forEach(e=>S.slots.push(estSlot(e,ctx))); return true;
}
function estOpGluMenos(r){
  const S=r.sections.find(x=>x.bk==="glu"); if(!S) return false; const anc=[...new Set(S.slots.map(s=>byId[s.ref].anchor))]; if(anc.length<2) return false;
  const a=anc[anc.length-1]; if(EST_ANCHORS[a]&&EST_ANCHORS[a].custom) return false;   // lo que tú enseñaste no se recorta
  S.slots=S.slots.filter(s=>byId[s.ref].anchor!==a); return true;
}
/* clase larga: en vez de inflar un bloque a 12 pasos, se agrega UNA estación más (otra posición), antes del abdomen */
function estOpBloqueExtra(r,ctx){
  if(r._extra) return false;
  const tiene=k=>r.sections.some(S=>S.bk===k), modo=r.modo;
  const kinds=modo==="upper"?["up","plk"]:modo==="core"?["plk","abs"]:modo==="pierna"?(tiene("glu")?["leg","glu"]:["glu","leg"]):(tiene("glu")?["leg","up","glu"]:["glu","leg","up"]);
  const tot=()=>r.sections.reduce((a,S)=>a+sectionSeconds(S,r),0), lim=Math.max(15*60,(r.duracion-5)*60/claseRitmoFactor())+110*1.4;
  for(const kind of kinds){
    const usados=estUsadosAnclas(r), c2=Object.assign({},ctx,{size:"M",upHecho:true,noms:new Set(r.sections.flatMap(S=>S.slots.map(s=>estNomKey(byId[s.ref]))))});
    const B=estBloque(kind,0,c2,usados); if(B.slots.length<4) continue;   // una estación de 3 pasos no vale la pena
    const work=r.sections.filter(S=>S.kind==="work"), absI=r.sections.findIndex(S=>S.bk==="abs"||S.bk==="plk"), at=absI>0&&kind!=="plk"&&kind!=="abs"?absI:r.sections.indexOf(work[work.length-1])+1;
    r.sections.splice(at,0,B);
    while(tot()>lim&&B.slots.length>4&&["up","plk","abs"].includes(kind)) B.slots.pop();   // una estación de pierna o glúteo no se corta a la mitad   // se recorta lo justo para que quepa
    if(tot()>lim){ r.sections.splice(at,1); continue; }   // si aun así no cabe, no entra
    r._extra=true;
    r.sections.filter(S=>S.kind==="work").forEach((S,i)=>{ S.nom=S.nom.replace(/^Bloque d+/,"Bloque "+(i+1)); });
    c2.eq.forEach(x=>ctx.eq.add(x)); return true;
  }
  return false;
}
function estAjustarDuracion(r,cfg){
  const ctx={size:"M",dif:r.nivel,base:r.base,eq:new Set(r.material||[])};
  const obj=Math.max(15*60,(cfg.duracion-5)*60/claseRitmoFactor()), tot=()=>r.sections.reduce((a,S)=>a+sectionSeconds(S,r),0), tol=110;
  const mas=[()=>estOpAbs(r,ctx),()=>estOpTrio(r,ctx),()=>estOpPierna(r,ctx),()=>estOpCierre(r,ctx),()=>estOpGlu(r,ctx),()=>estOpAbs(r,ctx),()=>estOpBloqueExtra(r,ctx)];
  const foco=((typeof temaDe==="function"&&temaDe(r))||{}).foco;   // el enfoque del tema no se recorta
  const menos=[()=>estOpAbsMenos(r),()=>foco==="leg"?false:estOpPiernaMenos(r),()=>foco==="up"?false:estOpTrioMenos(r),()=>foco==="glu"?false:estOpGluMenos(r),()=>estOpCierreMenos(r),()=>estOpAbsMenos(r)];   // el cierre es lo último que se recorta: es parte de cómo se siente la clase
  let g=0;
  while(g++<30){
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
  delete r._extra;
  estTransiciones(r);
  if(typeof estCargas==="function") estCargas(r);
}

/* ============================================================
   CALIFICADOR DE CALIDAD: puntúa una clase y la app se queda con la mejor de varias generadas
   ============================================================ */
function claseCambiosMaterial(r){
  let prev=null,c=0; r.sections.forEach(S=>{ if(S.kind==="prep"||S.kind==="cool") return; S.slots.forEach(s=>{ const e=resolve(s).eq; if(prev!==null&&e!==prev) c++; prev=e; }); }); return c;
}
function claseTarget(r){ const b=r.metodo==="fuerza"?(r.duracion||55)-3:r.metodo==="barre"?(r.duracion||50)-3:(r.duracion||45)-5; return b-fqSesgo(r.metodo).min; }
/* lo que tú anotaste de tus últimas clases (feedback.js): sesga qué se considera "buena" */
function fqSesgo(metodo){ return typeof fqSesgos==="function"?fqSesgos(metodo):{min:0,rep:0,ritmo:0,pes:0,lig:0}; }
/* Puntaje estricto: mide en continuo (no basta con "no fallar"): 50 + 50·(cualidades logradas)^1.6 − defectos.
   Un 90+ exige casi todo a la vez: duración exacta, pocos cambios de material, bloques parejos, variedad, ritmo distinto por bloque… */
function claseCalidad(r){
  const pts=[]; let pen=0, bono=0, maxb=0;
  const add=(t,txt,p)=>{ pen+=p||0; pts.push({t,x:txt,p:p||0}); }, cl=(v,a,b)=>Math.max(a,Math.min(b,v));
  const gain=(txt,val,max)=>{ bono+=val; maxb+=max; if(txt&&val/max>=0.7) pts.push({t:"ok",x:txt,p:0}); };
  const sg=fqSesgo(r.metodo), nom=S=>S.nom.replace(/^Bloque \d+ · /,"");
  const est=estimateMinutes(r), obj=claseTarget(r), dev=Math.abs(est-obj);
  gain("Duración ajustada: ≈ "+est+" min de "+r.duracion,6*cl(1-dev/3,0,1),6); if(dev>2) add("warn","Dura ≈ "+est+" min y pediste "+r.duracion+" (ideal ≈ "+obj+")",Math.min(30,(dev-1.5)*8));
  const cm=claseCambiosMaterial(r), base=(r.metodo==="fuerza"?5:7)-sg.ritmo;
  gain("Pocos cambios de material ("+cm+")",4*cl(1-Math.max(0,cm-1)/(base+3),0,1),4); if(cm>base) add("warn",cm+" cambios de material entre ejercicios",Math.min(18,(cm-base)*2));
  const secs=r.sections.filter(S=>S.kind!=="prep"&&S.kind!=="cool"), all=secs.flatMap(S=>S.slots), refs=all.map(s=>s.ref);
  const llaves=all.filter(s=>!(s.q&&s.q.t==="trans")&&!/Ráfaga final/.test(s.nota||"")).map(s=>s.ref+"|"+(s.side||"")), dup=llaves.length-new Set(llaves).size;   // Lado A y Lado B repiten el ejercicio a propósito
  if(dup) add("warn","Hay "+dup+" ejercicio(s) repetido(s)",dup*8);
  const u=state.historia.uso||{}, own=BUMPED.has(r)?1:0, avg=refs.length?refs.reduce((a,x)=>a+Math.max(0,(u[x]||0)-own),0)/refs.length:0, lim=0.4-sg.rep*0.06;
  gain("Variada respecto a tus últimas clases",5*cl(1-avg/(lim*1.3),0,1),5); if(avg>lim) add("warn","Muy parecida a tus últimas clases",Math.min(14,2+(avg-lim)*14));
  const work=r.sections.filter(S=>S.kind==="work"), fAvg=S=>S.slots.length?S.slots.reduce((a,s)=>a+((byId[s.ref]||{}).f||0),0)/S.slots.length:0;
  const nivel=r.metodo==="fuerza"?r.objetivo:r.nivel, suave=nivel==="ligera"||nivel==="media";
  const duros=all.filter(s=>((byId[s.ref]||{}).f||0)>=3).length; if(suave&&duros>2) add("warn","Varios ejercicios muy exigentes para una clase "+(nivel==="ligera"?"ligera":"media")+" ("+duros+")",Math.min(8,(duros-2)*2));
  const fm=work.length?work.reduce((a,S)=>a+fAvg(S),0)/work.length:0;
  if(sg.pes&&fm>2.05) add("warn","Anotaste que se sintieron pesadas: esta carga es alta",sg.pes*2); if(sg.lig&&fm<1.55&&r.metodo!=="barre") add("warn","Anotaste que se sintieron ligeras: esta carga es baja",sg.lig*2);
  for(let i=1;i<work.length;i++) if(fAvg(work[i])>=2.5&&fAvg(work[i-1])>=2.5){ add("warn","Dos bloques muy pesados seguidos",3); break; }
  const seg=work.map(S=>sectionSeconds(S,r)), mx=Math.max(...seg), mn=Math.min(...seg), ratio=mn>0?mx/mn:1, foco=/^foco/.test(r.tema||""), eqs=new Set(all.map(s=>resolve(s).eq).filter(e=>e&&e!=="peso corporal"));
  if(r.metodo==="fuerza"){
    const pesado=r.objetivo==="pesada"||r.objetivo==="muypesada"; let comp=0, nb=0;
    work.forEach(S=>{ const P=S.slots[0]; if(!P) return; nb++; if(r.v2){ if(P.rol!=="P") add("warn","Un bloque no empieza con su ejercicio principal",6);
        else if(!byId[P.ref].comp&&!["acc","glute_acc","abs"].includes(S.bk)) add("warn","El principal de \""+nom(S)+"\" no es compuesto",5);
        else { comp++; if(pesado&&(P.eq==="liga"||P.eq==="peso corporal")) add("warn","El principal de \""+nom(S)+"\" tiene poca carga para dificultad "+objetivoOf(r.objetivo).nom.toLowerCase(),4); } } else comp++; });
    gain("Cada bloque abre con un ejercicio principal compuesto",5*(nb?comp/nb:1),5);
    gain("Bloques equilibrados en tiempo",5*cl(1-(ratio-1)/0.6,0,1),5); if(ratio>1.7) add("warn","Los bloques quedaron desbalanceados en tiempo",Math.min(8,(ratio-1.7)*8+3));
    const fams=work.flatMap(S=>S.slots.filter(x=>x.rol!=="A").map(x=>fzFam(byId[x.ref]))); const rep=fams.length-new Set(fams).size; gain("Cada bloque trabaja un movimiento distinto",4*cl(1-rep/2,0,1),4); if(rep>1) add("warn","Se repite el tipo de movimiento ("+rep+")",rep*3);
    const fin=r.sections.find(S=>S.kind==="cardioFin"); if(!fin||fin.slots.length<2) add("warn","El finisher de cardio es muy corto",6); gain("Finisher de cardio completo",3*cl(((fin&&fin.slots.length)||0)/4,0,1),3);
    gain("Material manejable ("+eqs.size+" tipos)",3*cl((5-eqs.size)/2,0,1),3); if(eqs.size>4) add("warn","Usa "+eqs.size+" tipos de material distintos",(eqs.size-4)*2);
  } else if(r.estilo==="estacion"){
    work.forEach(S=>{ const n=S.slots.length; if(n<4&&S.bk!=="abs"&&S.bk!=="plk") add("warn","\""+nom(S)+"\" quedó con pocos pasos ("+n+")",3); if(n>9) add("warn","\""+nom(S)+"\" tiene demasiados pasos ("+n+")",3);
      const tipos=new Set(S.slots.map(s=>s.q&&s.q.t)); if(n>=5&&tipos.size===1&&S.bk!=="abs") add("warn","\""+nom(S)+"\" es monótono: todo con el mismo tipo de conteo",2); });
    const firmas=work.map(S=>S.slots.map(s=>s.q&&s.q.t).join(">")), igual=firmas.length-new Set(firmas).size;
    const tp=work.length?work.reduce((a,S)=>a+new Set(S.slots.map(s=>s.q&&s.q.t)).size,0)/work.length:0;
    gain("Cada bloque cuenta distinto (holds, pulsos, tempos)",4*cl(tp/3,0,1)*(igual?0.5:1),4); if(igual>0) add("warn","Dos bloques tienen exactamente la misma estructura de conteo",3*igual);
    let racha=0,mxr=0; all.forEach(s=>{ const q=s.q&&s.q.t; racha=q==="hold"?racha+1:0; mxr=Math.max(mxr,racha); }); if(mxr>=3) add("warn","Hay "+mxr+" holds seguidos",4);
    const tieneCierre=r.sections.some(S=>S.bk==="cierre"); if(r.duracion>=45&&!tieneCierre) add("warn","Falta el cierre con relajación",5); gain(r.duracion>=45?"Cierra con relajación":"",3*(tieneCierre?1:0),r.duracion>=45?3:0);
    if(!foco){ gain("Bloques equilibrados en tiempo",5*cl(1-(ratio-1)/1.4,0,1),5); if(ratio>2) add("warn","Los bloques quedaron desbalanceados en tiempo",Math.min(8,(ratio-2)*6+2)); }   // los temas de enfoque agrandan un bloque a propósito
    gain("Material manejable ("+eqs.size+" tipos)",3*cl((6-eqs.size)/3,0,1),3); if(eqs.size>4) add("warn","Usa "+eqs.size+" tipos de material distintos",(eqs.size-4)*2);
    if(typeof aprBoostId==="function"){ const af=work.map(S=>S.anchor?aprBoostId(S.anchor):0); const b=af.reduce((a,x)=>a+x,0)/Math.max(1,af.length); gain("Sigue tu formato (estaciones que sueles dar)",4*cl(b/0.25,0,1),4); }
  }
  if(r.metodo!=="barre"&&typeof claseNovedad==="function") gain("Se siente distinta a tus últimas clases (tema, orden, finisher)",5*claseNovedad(r),5);
  const frac=maxb?bono/maxb:1, score=Math.max(0,Math.min(100,Math.round(50+50*Math.pow(frac,1.6)-pen)));
  return {score,notas:pts,pen};
}
function claseCalidadHtml(r){
  if(r.metodo==="barre") return "";
  const q=claseCalidad(r), col=q.score>=85?"var(--ok,#7fb77e)":q.score>=72?"var(--warn,#e3ab52)":"#d65454", malas=q.notas.filter(n=>n.t==="warn"), buenas=q.notas.filter(n=>n.t==="ok");
  return `<div class="cal-card"><div class="cal-top"><div class="cal-score" style="--c:${col}"><b>${q.score}</b><small>/100</small></div><div><b>Calidad de la clase</b><div class="cal-bar"><i style="width:${q.score}%;background:${col}"></i></div></div></div>
    <div class="cal-notes">${malas.map(n=>`<span class="cal-n warn">⚠ ${esc(n.x)}</span>`).join("")}${buenas.slice(0,4).map(n=>`<span class="cal-n ok">✔ ${esc(n.x)}</span>`).join("")}</div>${typeof fqResumen==="function"&&fqResumen(r.metodo)?`<p class="hint" style="margin:8px 0 0">💬 ${esc(fqResumen(r.metodo))}</p>`:""}</div>`;
}
