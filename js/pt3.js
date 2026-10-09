"use strict";
/* ============================================================
   PT 3 · cardio en las rutinas, seguimiento (constancia, revisión mensual, siguiente bloque)
   y PDF (rutina con datos del cliente + informe de progreso)
   ============================================================ */

/* ---------- estilos de entrenamiento: no todos los clientes entrenan como empuje / jalón / pierna ---------- */
const PT_ESTILOS={
  auto:{nom:"Automático (recomendado para su nivel y objetivo)",corto:"",quien:"La app elige la división según nivel, objetivo y días."},
  fullbody:{nom:"Cuerpo completo",corto:"Cuerpo completo",quien:"Principiantes, poco tiempo o 2–3 días por semana. Cada sesión trabaja todo el cuerpo."},
  torsopierna:{nom:"Torso / pierna",corto:"Torso-pierna",quien:"Intermedios con 4 días: cada músculo se entrena 2 veces por semana."},
  ppl:{nom:"Empuje / jalón / pierna",corto:"Empuje-jalón-pierna",quien:"Intermedios y avanzados con 3 a 6 días que ya toleran más volumen."},
  muscular:{nom:"Por músculo (pecho, espalda, hombro y brazo, pierna)",corto:"Por músculo",quien:"Avanzados que buscan volumen y les gusta enfocar un músculo por día."},
  gluteo:{nom:"Glúteo y pierna (más frecuencia)",corto:"Glúteo y pierna",quien:"Quien quiere énfasis en glúteo, isquios y pierna, con tren superior de apoyo."},
  fuerza:{nom:"Fuerza base (pocos básicos pesados)",corto:"Fuerza base",quien:"Quien quiere ganar fuerza con sentadilla, press, peso muerto y remo; sesiones cortas y pesadas."},
  circuito:{nom:"Circuito funcional (quema de calorías)",corto:"Circuito",quien:"Principiantes, poco tiempo o quien busca acondicionamiento: rondas con descansos cortos."}
};
const PT_RX_CIRC={main:[10,15,45],acc:[12,15,40],iso:[12,20,30],core:[15,20,30]};
const PT_RX_FB={main:[3,5,180],acc:[6,8,120],iso:[8,12,75],core:[8,12,60]};
Object.assign(PT_DIAS_TPL,{
  CIRC_A:{n:"Circuito A",s:[["sentadilla","main"],["empuje_h","acc"],["traccion_h","acc"],["unilateral","acc"],["hombro_lat","iso"],["core","core"]]},
  CIRC_B:{n:"Circuito B",s:[["bisagra","main"],["empuje_v","acc"],["traccion_v","acc"],["gluteo","acc"],["biceps","iso"],["core","core"]]},
  CIRC_C:{n:"Circuito C",s:[["unilateral","main"],["empuje_h","acc"],["traccion_h","acc"],["sentadilla","acc"],["triceps","iso"],["core","core"]]},
  FB_A:{n:"Fuerza A",s:[["sentadilla","main"],["empuje_h","main"],["traccion_h","main"],["core","core"]]},
  FB_B:{n:"Fuerza B",s:[["bisagra","main"],["empuje_v","main"],["traccion_v","main"],["core","core"]]},
  PECHO:{n:"Pecho y tríceps",s:[["empuje_h","main"],["empuje_h","acc"],["empuje_v","acc"],["hombro_lat","iso"],["triceps","iso"],["triceps","iso"]]},
  ESPALDA:{n:"Espalda y bíceps",s:[["traccion_v","main"],["traccion_h","main"],["traccion_h","acc"],["hombro_post","iso"],["biceps","iso"],["biceps","iso"]]},
  HOMBRO:{n:"Hombro y brazo",s:[["empuje_v","main"],["hombro_lat","iso"],["hombro_post","iso"],["biceps","iso"],["triceps","iso"],["core","core"]]}
});
function ptSplitEstilo(estilo,nivel,dias){
  const S={
    fullbody:{2:["FULL_A","FULL_B"],3:["FULL_A","FULL_B","FULL_C"],4:["FULL_A","FULL_B","FULL_C","FULL_A"],5:["FULL_A","FULL_B","FULL_C","FULL_A","FULL_B"],6:["FULL_A","FULL_B","FULL_C","FULL_A","FULL_B","FULL_C"]},
    torsopierna:{2:["UPPER_A","LOWER_A"],3:["UPPER_A","LOWER_A","UPPER_B"],4:["UPPER_A","LOWER_A","UPPER_B","LOWER_B"],5:["UPPER_A","LOWER_A","UPPER_B","LOWER_B","FULL_C"],6:["UPPER_A","LOWER_A","UPPER_B","LOWER_B","UP_LITE","LOWER_A"]},
    ppl:{2:["UPPER_A","LOWER_A"],3:["PUSH","PULL","LEGS"],4:["PUSH","PULL","LEGS","UPPER_A"],5:["PUSH","PULL","LEGS","UPPER_A","LOWER_A"],6:["PUSH","PULL","LEGS","PUSH","PULL","LEGS"]},
    muscular:{2:["UPPER_A","LOWER_A"],3:["PECHO","ESPALDA","LEGS"],4:["PECHO","ESPALDA","LEGS","HOMBRO"],5:["PECHO","ESPALDA","LEGS","HOMBRO","LOWER_B"],6:["PECHO","ESPALDA","LEGS","HOMBRO","LOWER_B","UP_LITE"]},
    gluteo:{2:["GLU_A","UP_LITE"],3:["GLU_A","UP_LITE","GLU_B"],4:["GLU_A","UPPER_A","GLU_B","UPPER_B"],5:["GLU_A","UPPER_A","GLU_B","UP_LITE","LOWER_A"],6:["GLU_A","UPPER_A","GLU_B","UPPER_B","LOWER_A","UP_LITE"]},
    fuerza:{2:["FB_A","FB_B"],3:["FB_A","FB_B","FB_A"],4:["FB_A","FB_B","FB_A","FB_B"],5:["FB_A","FB_B","FB_A","FB_B","FB_A"],6:["FB_A","FB_B","FB_A","FB_B","FB_A","FB_B"]},
    circuito:{2:["CIRC_A","CIRC_B"],3:["CIRC_A","CIRC_B","CIRC_C"],4:["CIRC_A","CIRC_B","CIRC_C","CIRC_A"],5:["CIRC_A","CIRC_B","CIRC_C","CIRC_A","CIRC_B"],6:["CIRC_A","CIRC_B","CIRC_C","CIRC_A","CIRC_B","CIRC_C"]}
  };
  return S[estilo]?S[estilo][dias]:null;
}
/* aviso si el estilo no es el más conveniente para su nivel */
function ptEstiloAviso(estilo,nivel,dias){
  if(estilo==="ppl"&&nivel==="basico") return "Empuje / jalón / pierna exige volumen y técnica: para un principiante suele ir mejor cuerpo completo.";
  if(estilo==="muscular"&&nivel!=="avanzado") return "La división por músculo rinde más a personas avanzadas; en básicos e intermedios conviene más frecuencia (torso/pierna o cuerpo completo).";
  if(estilo==="fuerza"&&nivel==="basico") return "La fuerza base va bien a principiantes si aprenden la técnica primero: empieza ligero y sube poco a poco.";
  if(estilo==="fullbody"&&dias>=5) return "Con 5–6 días de cuerpo completo cuida la recuperación; mejor torso/pierna o empuje/jalón/pierna.";
  return "";
}

/* ---------- cardio ---------- */
const PT_CARDIO_TBL={   // [sesiones de cardio constante, sesiones de intervalos, minutos de arranque]
  grasa:{basico:[3,0,25],intermedio:[2,1,30],avanzado:[2,2,35]},
  hipertrofia:{basico:[1,0,20],intermedio:[2,0,20],avanzado:[2,0,25]},
  fuerza:{basico:[1,0,20],intermedio:[1,0,20],avanzado:[2,0,20]},
  gluteo:{basico:[2,0,20],intermedio:[2,1,25],avanzado:[2,1,30]},
  salud:{basico:[3,0,25],intermedio:[3,1,30],avanzado:[3,1,35]}
};
const PT_CARDIO_EQ={gym:["Caminadora con inclinación","Bicicleta","Elíptica","Remo","Escaladora"],casa:["Caminata rápida o trote","Saltar la cuerda","Bicicleta","Subir escaleras"],studio:["Caminata rápida o trote","Saltar la cuerda","Bicicleta","Subir escaleras"]};
/* cardio de la semana w del programa (sube ~5′ cada 2 semanas, baja en descarga) */
function ptCardioSemana(prog,w,c){
  const cc=prog.cardioCfg||{modo:"auto",extra:0}; if(cc.modo==="no") return [];
  const t=(PT_CARDIO_TBL[prog.objetivo]||PT_CARDIO_TBL.salud)[prog.nivel]||[2,0,20];
  const nl=Math.min(5,t[0]+(cc.extra||0)+(cc.modo==="mas"?1:0)), nh=t[1], base=t[2];
  const we=w+(prog.cardioOffset||0), f=ptFase(prog,w), cap={basico:40,intermedio:50,avanzado:60}[prog.nivel]||45;
  let min=Math.min(cap,base+5*Math.floor((we-1)/2)); if(f.deload) min=Math.max(15,Math.round(min*.7/5)*5);
  const edad=c&&+c.edad>0?+c.edad:null, fcmax=edad?220-edad:null;
  const zl=fcmax?Math.round(fcmax*.6)+"–"+Math.round(fcmax*.7)+" lpm":null, zh=fcmax?Math.round(fcmax*.85)+"–"+Math.round(fcmax*.92)+" lpm":null;
  const eq=PT_CARDIO_EQ[prog.equipo]||PT_CARDIO_EQ.casa, out=[];
  for(let i=0;i<nl;i++) out.push({tipo:"LISS",nombre:"Cardio constante",min,eq:eq[(i+w)%eq.length],items:["Ritmo conversacional (esfuerzo 4–5 de 10)"+(zl?" · pulso "+zl:""),"Si es en caminadora: inclinación 5–10 % y sin sostenerte de los barandales"]});
  for(let i=0;i<nh;i++){
    const wk=prog.nivel==="avanzado"?[40,40]:[30,60]; let n=Math.min(10,6+Math.floor((we-1)/2)); if(f.deload) n=Math.max(4,n-3);
    out.push({tipo:"HIIT",nombre:"Intervalos",min:10+Math.round(n*(wk[0]+wk[1])/60),eq:eq[(i+w+1)%eq.length],items:["Calentamiento 5′ suave","Principal: "+n+" × "+wk[0]+"″ fuerte (esfuerzo 8–9 de 10"+(zh?", pulso "+zh:"")+") / "+wk[1]+"″ suave","Enfriamiento 5′ + estirar"]});
  }
  return out;
}
const ptCardioLinea=s=>s.tipo==="HIIT"?"Intervalos "+s.min+"′ ("+s.eq+")":"Cardio "+s.min+"′ ("+s.eq+")";
/* agrupa sesiones iguales: "3 × Cardio 25′ (Bicicleta, Elíptica, Remo)" */
function ptCardioResumen(L){
  const g={}; L.forEach(s=>{ const k=s.tipo+s.min; (g[k]=g[k]||{s,eq:[]}).eq.push(s.eq); });
  return Object.values(g).map(x=>(x.eq.length>1?x.eq.length+" × ":"")+(x.s.tipo==="HIIT"?"Intervalos ":"Cardio ")+x.s.min+"′ ("+[...new Set(x.eq)].join(", ")+")").join("  ·  ");
}
function ptCardioHtml(prog,c,w){
  const L=ptCardioSemana(prog,w,c);
  if(!L.length) return `<section class="blk"><div class="blk-head"><h2>Cardio</h2></div><p class="hint">Este programa no incluye cardio. Puedes agregarlo desde Seguimiento → "+1 sesión de cardio".</p></section>`;
  return `<section class="blk"><div class="blk-head"><h2>Cardio · semana ${w}</h2>${c?`<button class="btn sm" data-action="pt-cardio-nuevo" data-id="${c.id}">+ Registrar cardio</button>`:""}</div>
    <div class="card pt-cardio">${L.map(s=>`<div class="pc-row"><span class="chip ${s.tipo==="HIIT"?"warn":""}">${s.tipo==="HIIT"?"Intervalos":"Constante"}</span><div><b>${esc(s.nombre)} · ${s.min} min</b> <small>${esc(s.eq)}</small><ul>${s.items.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div></div>`).join("")}
    <p class="hint" style="margin-bottom:0">Colócalo en días sin pesas (o después de las pesas si es corto). Cada 2 semanas sube ~5 min y las semanas de descarga baja ~30 %.${c&&+c.edad>0?"":" Agrega la edad del cliente para ver sus zonas de pulso."}</p></div></section>`;
}

/* ---------- datos del cliente para los documentos ---------- */
function ptDatosCliente(c){
  if(!c) return null;
  const meds=ptMedidasDe(c.id), uPeso=meds.filter(m=>m.peso).slice(-1)[0], uGr=meds.filter(m=>m.grasa).slice(-1)[0];
  const peso=uPeso?+uPeso.peso:(+c.peso0||null), grasa=uGr?+uGr.grasa:(+c.grasa0>0?+c.grasa0:null), b=pjBase(c);
  const ms=peso&&grasa!=null?pjMasas(peso,grasa):{mg:null,mm:null};
  return {nombre:c.nombre,edad:+c.edad>0?+c.edad:null,estatura:+c.estatura>0?+c.estatura:null,peso,grasa,mm:ms.mm,mg:ms.mg,pesoIni:b.peso,grasaIni:b.grasa,meds,imc:peso&&c.estatura?pjImc(peso,+c.estatura):null,meta:c.metaTexto||""};
}
const ptFechaLarga=s=>{ const d=parseLocalDate(s); return d.getDate()+" "+MESES[d.getMonth()]+" "+d.getFullYear(); };

/* ---------- seguimiento: constancia, tendencia y diagnóstico ---------- */
const ptLunes=s=>addDays(s,-((parseLocalDate(s).getDay()+6)%7));
function ptSemanasHist(cid,n){
  const l0=ptLunes(todayStr()), ses=ptSesionesDe(cid).filter(s=>s.completada!==false), car=PT_D().cardios.filter(x=>x.clienteId===cid);
  return Array.from({length:n},(_,i)=>{ const l=addDays(l0,-7*(n-1-i)), f=addDays(l,6); return {lunes:l,ses:ses.filter(s=>s.fecha>=l&&s.fecha<=f).length,car:car.filter(x=>x.fecha>=l&&x.fecha<=f).length}; });
}
function ptConstancia(c){
  const prog=ptProgActivo(c.id), plan=prog?prog.diasSem:c.dias, h=ptSemanasHist(c.id,12), meta=Math.ceil(plan*.8); let racha=0;
  for(let i=h.length-1;i>=0;i--){ if(i===h.length-1&&h[i].ses<meta) continue; if(h[i].ses>=meta) racha++; else break; }
  return {h,plan,racha,meta};
}
/* cambio promedio del 1RM estimado: últimas 4 semanas contra las 4 anteriores */
function ptTendencia(cid){
  const hoy=todayStr(), a=addDays(hoy,-28), b=addDays(hoy,-56), best={};
  ptSesionesDe(cid).forEach(s=>s.series.forEach(x=>{ const e=Math.max(0,...x.sets.map(t=>ptE1rm(t.kg,t.reps))); if(e<=0) return; const r=best[x.ex]=best[x.ex]||{rec:0,prev:0};
    if(s.fecha>=a) r.rec=Math.max(r.rec,e); else if(s.fecha>=b) r.prev=Math.max(r.prev,e); }));
  const v=Object.values(best).filter(r=>r.rec&&r.prev).map(r=>(r.rec/r.prev-1)*100);
  return {n:v.length,pct:v.length?r1(v.reduce((s,x)=>s+x,0)/v.length):null};
}
function ptDiagnostico(c){
  const prog=ptProgActivo(c.id), ad4=ptAdherencia(c.id,4), cs=ptConstancia(c), tend=ptTendencia(c.id), ses=ptSesionesDe(c.id), hoy=todayStr(), recs=[];
  const dias=Math.max(0,Math.floor((parseLocalDate(hoy)-parseLocalDate(c.inicio||(ses.length?ses[ses.length-1].fecha:hoy)))/86400000)), meses=dias/30.44;
  const w=prog?ptSemanaDe(prog,hoy):null, terminado=prog&&hoy>addDays(prog.inicio,prog.semanas*7);
  const rv=PT_D().revisiones.filter(r=>r.clienteId===c.id).sort((a,b)=>a.fecha<b.fecha?1:-1)[0], diasRev=rv?Math.floor((parseLocalDate(hoy)-parseLocalDate(rv.fecha))/86400000):null;
  if(!prog){ recs.push({t:"info",x:"No hay un programa activo: genera uno para empezar el seguimiento.",accion:"bloque",btn:"Generar programa"}); return {prog,ad4,cs,tend,recs,meses,w,terminado,diasRev,rv}; }
  if(ses.length<3){ recs.push({t:"info",x:"Todavía hay pocos datos ("+ses.length+" sesiones). Registra al menos 3 para que la app recomiende cambios."}); }
  else {
    if(ad4.pct<60) recs.push({t:"warn",x:"Constancia baja ("+ad4.pct+" %). Antes de subir la exigencia, ajusta horarios y simplifica: el siguiente bloque se arma con "+Math.max(2,prog.diasSem-1)+" días para que sí se cumpla."});
    else if(ad4.pct<80) recs.push({t:"info",x:"Constancia regular ("+ad4.pct+" %). Mantén el programa y busca llegar a 80 % o más antes de subirlo."});
    else recs.push({t:"ok",x:"Buena constancia: "+ad4.pct+" % en 4 semanas"+(cs.racha>1?" y racha de "+cs.racha+" semanas cumpliendo.":".")});
    if(ad4.pct>=70&&tend.n>=2){
      if(tend.pct>=3){ const can=(prog.ajusteMain||0)<2; recs.push({t:"ok",x:"La fuerza va subiendo (+"+tend.pct+" % en promedio): está listo para más trabajo.",accion:can?"series":null,btn:"+1 serie en los básicos"}); }
      else if(tend.pct>-4&&ses.length>=10) recs.push({t:"warn",x:"Fuerza estancada ("+(tend.pct>0?"+":"")+tend.pct+" %). Cambia los accesorios por variantes nuevas, revisa sueño y comida y respeta la semana de descarga.",accion:"rotar",btn:"Cambiar accesorios"});
      else if(tend.pct<=-4) recs.push({t:"warn",x:"La fuerza bajó ("+tend.pct+" %): probable cansancio. Haz una descarga, revisa sueño y comida y no subas cargas esta semana."});
    }
    const meds=ptMedidasDe(c.id), pts=pjProyectar(c);
    if(pts.length&&meds.length>=2&&meses>=1){
      const act=meds.filter(m=>m.peso).slice(-1)[0], esp=pts[Math.min(12,Math.max(1,Math.round(meses)))];
      if(act&&esp){
        const d=+act.peso-esp.peso;
        if(["grasa","gluteo"].includes(c.objetivo)&&d>1.5&&ad4.pct>=70) recs.push({t:"warn",x:"Su peso va ~"+r1(d)+" kg arriba de lo proyectado a "+r1(meses)+" meses. Con buena constancia, sube el gasto: más cardio y revisa la comida.",accion:"cardio",btn:"+1 sesión de cardio"});
        else if(["grasa","gluteo"].includes(c.objetivo)&&d<=0.5) recs.push({t:"ok",x:"Su peso va igual o mejor que lo proyectado ("+(d<0?"":"+")+r1(d)+" kg)."});
      }
      const g0=pjBase(c).grasa, gA=meds.filter(m=>m.grasa).slice(-1)[0];
      if(["hipertrofia","fuerza"].includes(c.objetivo)&&g0!=null&&gA&&+gA.grasa-g0>=2) recs.push({t:"warn",x:"El % de grasa subió "+r1(+gA.grasa-g0)+" puntos: suma cardio y vigila el excedente de comida.",accion:"cardio",btn:"+1 sesión de cardio"});
    }
    const plan=ptCardioSemana(prog,w||1,c).length, hechos=cs.h.slice(-4).reduce((s,x)=>s+x.car,0);
    if(plan&&hechos<plan*4*.5&&ses.length>=6) recs.push({t:"info",x:"Registró "+hechos+" de ~"+(plan*4)+" cardios de las últimas 4 semanas. El cardio es parte del programa: pídele que lo anote."});
    const ns=ptNivelSugerido(c); if(ns) recs.push({t:"ok",x:ns,accion:"nivel",btn:"Subir de nivel y generar el siguiente bloque"});
  }
  if(terminado||(w&&w>=prog.semanas)) recs.push({t:"warn",x:"El bloque de "+prog.semanas+" semanas está por terminar o ya terminó: toca el siguiente bloque (conserva los básicos, renueva accesorios y sigue subiendo el cardio).",accion:"bloque",btn:"Generar el siguiente bloque"});
  if(diasRev==null?ses.length>=8:diasRev>=28) recs.push({t:"info",x:"Toca la revisión mensual: toma medidas, guarda la revisión y revisa estas recomendaciones.",accion:"revision",btn:"Guardar revisión de hoy"});
  return {prog,ad4,cs,tend,recs,meses,w,terminado,diasRev,rv};
}
function ptAjusteLog(prog,txt){ prog.ajustes=(prog.ajustes||[]); prog.ajustes.push({fecha:todayStr(),txt}); }
/* cambia los accesorios por variantes del mismo patrón (los básicos se conservan) */
function ptRotarAccesorios(prog){
  const nivelN=PT_NIVELES[prog.nivel].n; let n=0;
  prog.dias.forEach(d=>{ d.ejercicios.forEach((sl,i)=>{
    if(sl.rol==="main"||sl.rol==="core") return; const old=PT_BY_ID[sl.ex]; if(!old) return;
    const usados=new Set(d.ejercicios.map(x=>x.ex));
    const pool=ptDisponibles(prog.equipo,nivelN,prog.lesiones||[]).filter(e=>e.p===old.p&&e.id!==old.id&&!usados.has(e.id));
    if(!pool.length) return; pool.sort((a,b)=>ptScore(b,sl.rol,nivelN,prog.objetivo)-ptScore(a,sl.rol,nivelN,prog.objetivo));
    d.ejercicios[i]=Object.assign(ptSlot(pool[0],sl.rol,{nivel:prog.nivel,objetivo:prog.objetivo,estilo:prog.estilo}),{uid:sl.uid,nota:sl.nota}); n++; }); });
  return n;
}
/* siguiente bloque: conserva los básicos (para seguir progresando), renueva accesorios, sube el cardio */
function ptSiguienteBloque(c,opt){
  opt=opt||{}; const D=PT_D(), prev=ptProgActivo(c.id), ad=ptAdherencia(c.id,6).pct, cambios=[];
  const orden=["basico","intermedio","avanzado"]; let nivel=prev?prev.nivel:c.nivel;
  if(opt.subir&&orden.indexOf(nivel)<2){ nivel=orden[orden.indexOf(nivel)+1]; cambios.push("Sube de nivel: "+PT_NIVELES[nivel].nom+"."); c.nivel=nivel; }
  let dias=prev?prev.diasSem:c.dias; if(prev&&ad<60&&dias>2){ dias--; cambios.push("Constancia de "+ad+" %: baja a "+dias+" días por semana para que se cumpla."); }
  const cfg={clienteId:c.id,nivel,objetivo:c.objetivo,dias,semanas:12,minutos:prev?prev.minutos:60,equipo:c.equipo,lesiones:c.lesiones||[],cardio:prev&&prev.cardioCfg?prev.cardioCfg.modo:"auto",estilo:prev?prev.estilo:"auto",evitar:prev?prev.dias.flatMap(d=>d.ejercicios.filter(s=>s.rol!=="main").map(s=>s.ex)):[]};
  const prog=ptGenerar(cfg); prog.nombre=PT_OBJETIVOS[c.objetivo].nom+" · "+PT_NIVELES[nivel].nom+" · "+c.nombre.split(" ")[0]+" · Bloque "+(((prev&&prev.bloque)||1)+1);
  prog.bloque=((prev&&prev.bloque)||1)+1; prog.prevId=prev?prev.id:null;
  if(prev){
    prog.cardioOffset=(prev.cardioOffset||0)+prev.semanas; prog.cardioCfg.extra=prev.cardioCfg?prev.cardioCfg.extra||0:0;
    let conservados=0;
    if(!opt.subir) prog.dias.forEach((d,i)=>{ const pd=prev.dias[i]; if(!pd) return; const mains=pd.ejercicios.filter(s=>s.rol==="main"); let k=0;
      d.ejercicios.forEach((sl,j)=>{ if(sl.rol!=="main") return; const m=mains[k++]; if(m&&PT_BY_ID[m.ex]&&ptDisponibles(c.equipo,PT_NIVELES[nivel].n,c.lesiones||[]).some(e=>e.id===m.ex)){ d.ejercicios[j]=Object.assign(ptSlot(PT_BY_ID[m.ex],"main",{nivel,objetivo:c.objetivo,estilo:prev.estilo}),{uid:sl.uid}); conservados++; } }); });
    if(conservados) cambios.push("Conserva "+conservados+" ejercicios básicos para seguir subiendo cargas.");
    cambios.push("Renueva los accesorios con variantes nuevas.");
    cambios.push("Cardio: arranca en "+(ptCardioSemana(prog,1,c)[0]||{min:0}).min+" min (continúa la progresión del bloque anterior).");
    prev.activo=false; prev.terminado=todayStr();
  }
  prog.cambios=cambios; D.programas.push(prog); touch();
  return prog;
}

/* ---------- vista: pestaña Seguimiento ---------- */
function ptTabSeguimiento(c){
  const g=ptDiagnostico(c), prog=g.prog, meds=ptMedidasDe(c.id), dd=ptDatosCliente(c);
  const rvs=PT_D().revisiones.filter(r=>r.clienteId===c.id).sort((a,b)=>a.fecha<b.fecha?1:-1), car=PT_D().cardios.filter(x=>x.clienteId===c.id).sort((a,b)=>a.fecha<b.fecha?1:-1).slice(0,6);
  const dPeso=dd.pesoIni&&dd.peso?r1(dd.peso-dd.pesoIni):null, dGr=dd.grasaIni!=null&&dd.grasa!=null?r1(dd.grasa-dd.grasaIni):null;
  const tiles=`<div class="tiles tiles-4"><div class="tile"><div class="label">Constancia · 4 sem</div><div class="value num money">${g.ad4.pct}%</div><div class="foot">${g.ad4.hechas} de ${g.ad4.plan} sesiones</div></div>
    <div class="tile"><div class="label">Racha</div><div class="value num">${g.cs.racha}</div><div class="foot">semanas con ≥ ${g.cs.meta} de ${g.cs.plan} sesiones</div></div>
    <div class="tile"><div class="label">Fuerza</div><div class="value num">${g.tend.pct==null?"—":(g.tend.pct>0?"+":"")+g.tend.pct+"%"}</div><div class="foot">${g.tend.n?"1RM estimado, últimas 4 sem vs 4 previas":"faltan sesiones para comparar"}</div></div>
    <div class="tile"><div class="label">Cuerpo</div><div class="value num">${dPeso==null?"—":(dPeso>0?"+":"")+dPeso+" kg"}</div><div class="foot">${dGr==null?"registra % de grasa":(dGr>0?"+":"")+dGr+" pts de grasa"} · mes ${Math.max(1,Math.ceil(g.meses||1))}</div></div></div>`;
  const barras=svgBars(g.cs.h.map(x=>x.ses),g.cs.h.map((x,i)=>i%3===0?fmtCorto(x.lunes):""),null);
  const recH=g.recs.map((r,i)=>`<div class="alert ${r.t}"><div class="rec-row"><span>${r.t==="warn"?"⚠":r.t==="ok"?"✔":"ℹ"} ${esc(r.x)}</span>${r.accion?`<button class="btn sm ${r.t==="warn"?"primary":""}" data-action="pt-rec" data-k="${r.accion}" data-id="${c.id}">${esc(r.btn)}</button>`:""}</div></div>`).join("");
  const cambios=prog?[...(prog.cambios||[]).map(x=>({f:prog.inicio,x})),...(prog.ajustes||[]).map(a=>({f:a.fecha,x:a.txt}))]:[];
  return `${tiles}<div class="chart-grid" style="margin-top:14px"><section class="card"><h3>Sesiones por semana (12 semanas)</h3>${barras}<p class="hint" style="margin-bottom:0">Meta: ${g.cs.plan} por semana.</p></section>
    <section class="card"><h3>Cardio por semana</h3>${svgBars(g.cs.h.map(x=>x.car),g.cs.h.map((x,i)=>i%3===0?fmtCorto(x.lunes):""),null,"var(--warn)")}<p class="hint" style="margin-bottom:0">Registros de cardio cada semana.</p></section></div>
    <section class="blk"><div class="blk-head"><h2>Revisión y ajustes</h2></div><div class="alert-list">${recH}</div></section>
    <div class="acts-row" style="margin:6px 0 18px"><button class="btn primary" data-action="pt-rev-nueva" data-id="${c.id}">Guardar revisión</button><button class="btn" data-action="pt-cardio-nuevo" data-id="${c.id}">+ Registrar cardio</button><button class="btn" data-action="pt-med-nueva" data-id="${c.id}">+ Medidas</button>
      <button class="btn" data-action="pt-rec" data-k="bloque" data-id="${c.id}">Siguiente bloque</button><button class="btn" data-action="pt-pdf-informe" data-id="${c.id}">⬇ Informe de progreso (PDF)</button></div>
    ${cambios.length?`<section class="blk"><div class="blk-head"><h2>Cambios al programa</h2></div><div class="card"><ul class="yo-ul">${cambios.map(x=>`<li><small>${fmtCorto(x.f)}</small> ${esc(x.x)}</li>`).join("")}</ul></div></section>`:""}
    <section class="blk"><div class="blk-head"><h2>Historial de revisiones</h2></div><div class="card">${rvs.length?rvs.map(r=>`<div class="yo-reg"><span><b>${ptFechaLarga(r.fecha)}</b> · constancia ${r.adh}% · racha ${r.racha}${r.fuerza!=null?" · fuerza "+(r.fuerza>0?"+":"")+r.fuerza+"%":""}${r.peso?" · "+r.peso+" kg":""}${r.grasa?" · "+r.grasa+" %":""}${r.nota?"<br><small>"+esc(r.nota)+"</small>":""}</span><button class="x" data-action="pt-rev-del" data-id="${r.id}" aria-label="Borrar">✕</button></div>`).join(""):`<p class="hint" style="margin:0">Aún no hay revisiones. Guarda una cada mes para ver cómo evoluciona.</p>`}</div></section>
    <section class="blk"><div class="blk-head"><h2>Cardio registrado</h2></div><div class="card">${car.length?car.map(x=>`<div class="yo-reg"><span><b>${x.min} min</b> · ${esc(x.tipo)}${x.rpe?" · esfuerzo "+x.rpe+"/10":""}${x.fc?" · "+x.fc+" lpm":""}</span><small>${fmtCorto(x.fecha)}</small><button class="x" data-action="pt-cardio-del" data-id="${x.id}" aria-label="Borrar">✕</button></div>`).join(""):`<p class="hint" style="margin:0">Sin cardio registrado.</p>`}</div></section>`;
}

/* ---------- modales ---------- */
function ptModal3(md){
  const f=(id,l,v,t)=>`<div><label class="mini">${l}</label><input class="inp" id="${id}" type="${t||"number"}" ${t?"":'inputmode="decimal" step="any"'} value="${v==null?"":v}"></div>`;
  if(md.type==="pt-cardio") return modalShell("Registrar cardio",`<div class="form-grid g3">${f("pk-fecha","Fecha",todayStr(),"date")}${f("pk-min","Minutos","")}<div><label class="mini">Tipo</label>${ptSel("pk-tipo",["Cardio constante","Intervalos","Caminata","Otro"].map(x=>[x,x]),"Cardio constante")}</div>${f("pk-rpe","Esfuerzo (1–10)","")}${f("pk-fc","Pulso promedio","")}</div>`,`<button class="btn ghost" data-action="close-modal">Cancelar</button><button class="btn primary" data-action="pt-cardio-save">Guardar</button>`);
  if(md.type==="pt-rev"){ const c=ptCliente(md.clienteId), g=ptDiagnostico(c), dd=ptDatosCliente(c);
    return modalShell("Guardar revisión",`<p class="hint" style="margin-top:0">Se guarda una foto de hoy: constancia ${g.ad4.pct} %, racha ${g.cs.racha}, fuerza ${g.tend.pct==null?"—":g.tend.pct+" %"}${dd.peso?", peso "+dd.peso+" kg":""}${dd.grasa!=null?", grasa "+dd.grasa+" %":""}. Si tomaste medidas hoy, regístralas primero en "+ Medidas".</p><div class="form-grid"><div class="full"><label class="mini">Notas de la revisión (cómo se siente, qué se cambia)</label><textarea class="inp" id="pr-nota" rows="3"></textarea></div></div>`,`<button class="btn ghost" data-action="close-modal">Cancelar</button><button class="btn primary" data-action="pt-rev-save">Guardar</button>`); }
  return "";
}

/* ---------- acciones ---------- */
function ptClick3(a,t){
  const D=PT_D();
  if(a==="pt-cardio-nuevo"){ state.modal={type:"pt-cardio",clienteId:t.dataset.id}; renderOverlay(); return true; }
  if(a==="pt-cardio-save"){ const min=parseFloat(fv("pk-min")); if(!min){ toast("Escribe los minutos"); return true; }
    D.cardios.push({id:newId("k"),clienteId:state.modal.clienteId,fecha:fv("pk-fecha")||todayStr(),tipo:fv("pk-tipo"),min,rpe:parseFloat(fv("pk-rpe"))||null,fc:parseFloat(fv("pk-fc"))||null}); touch(); closeModal(); render(); toast("Cardio guardado"); return true; }
  if(a==="pt-cardio-del"){ const i=D.cardios.findIndex(x=>x.id===t.dataset.id); if(i<0) return true; const [x]=D.cardios.splice(i,1); touch(); render(); toastUndo("Cardio borrado",()=>{ D.cardios.splice(Math.min(i,D.cardios.length),0,x); touch(); render(); }); return true; }
  if(a==="pt-rev-nueva"){ state.modal={type:"pt-rev",clienteId:t.dataset.id}; renderOverlay(); return true; }
  if(a==="pt-rev-save"){ const c=ptCliente(state.modal.clienteId), g=ptDiagnostico(c), dd=ptDatosCliente(c);
    D.revisiones.push({id:newId("rv"),clienteId:c.id,fecha:todayStr(),adh:g.ad4.pct,racha:g.cs.racha,fuerza:g.tend.pct,peso:dd.peso,grasa:dd.grasa,nota:(fv("pr-nota")||"").trim(),recs:g.recs.map(r=>r.x)}); touch(); closeModal(); render(); toast("Revisión guardada"); return true; }
  if(a==="pt-rev-del"){ const i=D.revisiones.findIndex(x=>x.id===t.dataset.id); if(i<0) return true; const [x]=D.revisiones.splice(i,1); touch(); render(); toastUndo("Revisión borrada",()=>{ D.revisiones.splice(Math.min(i,D.revisiones.length),0,x); touch(); render(); }); return true; }
  if(a==="pt-rec"){ const c=ptCliente(t.dataset.id), prog=ptProgActivo(c.id), k=t.dataset.k;
    if(k==="series"&&prog){ prog.ajusteMain=(prog.ajusteMain||0)+1; ptAjusteLog(prog,"+1 serie en los ejercicios básicos (por buen progreso de fuerza)."); touch(); render(); toast("Listo: +1 serie en los básicos"); return true; }
    if(k==="cardio"&&prog){ prog.cardioCfg=prog.cardioCfg||{modo:"auto",extra:0}; if(prog.cardioCfg.modo==="no") prog.cardioCfg.modo="auto"; prog.cardioCfg.extra=Math.min(2,(prog.cardioCfg.extra||0)+1); ptAjusteLog(prog,"+1 sesión de cardio por semana."); touch(); render(); toast("Cardio aumentado"); return true; }
    if(k==="rotar"&&prog){ const n=ptRotarAccesorios(prog); ptAjusteLog(prog,"Accesorios renovados ("+n+" ejercicios nuevos); los básicos se conservan."); touch(); render(); toast(n+" accesorios cambiados"); return true; }
    if(k==="revision"){ state.modal={type:"pt-rev",clienteId:c.id}; renderOverlay(); return true; }
    if(k==="bloque"||k==="nivel"){ const p=ptSiguienteBloque(c,{subir:k==="nivel"}); PTUI.tab="programa"; PTUI.sem=1; render(); window.scrollTo(0,0); toast("Bloque "+p.bloque+" listo"); return true; }
    return true; }
  if(a==="pt-pdf-rutina"){ const prog=D.programas.find(p=>p.id===t.dataset.id); if(!prog) return true; const c=ptCliente(prog.clienteId);
    pdfDescargar(ptPdfRutina(prog,c).bytes(),"Rutina "+(c?c.nombre+" ":"")+prog.nombre+".pdf"); return true; }
  if(a==="pt-pdf-informe"){ const c=ptCliente(t.dataset.id); if(!c) return true; pdfDescargar(ptPdfInforme(c).bytes(),"Informe de progreso "+c.nombre+" "+todayStr()+".pdf"); return true; }
  return false;
}

/* ---------- PDF: rutina con los datos del cliente ---------- */
function ptPdfFila(d,campos){
  const y0=d.y; let ymax=y0, x=d.M; const total=campos.reduce((s,c)=>s+c[2],0), ancho=d.W-2*d.M;
  campos.forEach(([e,v,w])=>{ d.y=y0; const ww=w/total*ancho; d.campo(e,v,x,ww); ymax=Math.max(ymax,d.y); x+=ww; }); d.y=ymax;
}
function ptPdfDatos(d,c,fechaIni){
  const dd=ptDatosCliente(c), z=(v,u)=>v==null||v===""?"":v+(u||"");
  d.titulo("Datos del cliente");
  ptPdfFila(d,[["NOMBRE",c?c.nombre:"",3],["EDAD",dd?z(dd.edad," años"):"",1],["ESTATURA",dd?z(dd.estatura," cm"):"",1.1],["INICIO",fechaIni?ptFechaLarga(fechaIni):"",1.4]]);
  ptPdfFila(d,[["PESO",dd?z(dd.peso," kg"):"",1.3],["% DE GRASA",dd?z(dd.grasa," %"):"",1.3],["MASA MAGRA",dd&&dd.mm!=null?r1(dd.mm)+" kg":"",1.3],["IMC",dd&&dd.imc?r1(dd.imc):"",1],["META",dd?dd.meta:"",3]]);
}
function ptPdfRutina(prog,c){
  const d=pdfNuevo({titulo:prog.nombre,pie:"Sebas Fit · "+prog.nombre+(c?" · "+c.nombre:"")}), AC=PDF_COL.acento, G=PDF_COL.gris;
  d.texto("SEBAS FIT · ENTRENAMIENTO PERSONAL",{size:8.5,bold:true,color:AC,gap:1});
  d.texto(prog.nombre,{size:20,bold:true,gap:3});
  d.texto(PT_NIVELES[prog.nivel].nom+" · "+PT_OBJETIVOS[prog.objetivo].nom+" · "+prog.diasSem+" días por semana ("+(PT_SCHED[prog.diasSem]||"")+") · "+prog.semanas+" semanas · ≈ "+prog.minutos+" min por sesión · "+PT_EQUIPO[prog.equipo].nom+(prog.estilo&&prog.estilo!=="auto"?" · Estilo: "+PT_ESTILOS[prog.estilo].corto:""),{size:9.5,color:G});
  ptPdfDatos(d,c,prog.inicio);
  d.titulo("Fases del programa");
  d.texto(Array.from({length:prog.semanas},(_,i)=>"Sem "+(i+1)+": "+ptFase(prog,i+1).nom).join("   ·   "),{size:8.5,color:G});
  prog.dias.forEach(dia=>{
    d.titulo(dia.nombre+"  ·  ≈ "+ptMinDia(dia)+" min");
    d.tabla([{w:.35,t:"#"},{w:4.2,t:"Ejercicio"},{w:1.7,t:"Series × reps"},{w:.6,t:"RIR",a:"center"},{w:.9,t:"Desc.",a:"center"},{w:1.1,t:"Sem 1"},{w:1.1,t:"Sem 2"},{w:1.1,t:"Sem 3"},{w:1.1,t:"Sem 4"}],
      dia.ejercicios.map((sl,i)=>{ const e=PT_BY_ID[sl.ex]; if(!e) return null; const rx=ptRx(prog,sl,1);
        return [String(i+1),{t:e.nom,sub:e.cue,b:true},rx.sets+" × "+(rx.seg?rx.lo+"–"+rx.hi+" s":rx.lo+"–"+rx.hi)+(e.uni&&!rx.seg?" /lado":""),rx.rir!=null?String(rx.rir):"—",rx.rest>=90?(Math.round(rx.rest/60*10)/10)+" min":rx.rest+" s","","","",""]; }).filter(Boolean),{size:8.6});
  });
  d.texto("Anota en las columnas Sem: kg × repeticiones de la serie principal. Cuando completes todas las series en el tope de repeticiones con técnica limpia, sube la carga la siguiente sesión.",{size:8.5,color:G});
  const cs=Array.from({length:prog.semanas},(_,i)=>({s:i+1,f:ptFase(prog,i+1).nom,l:ptCardioSemana(prog,i+1,c)}));
  if(cs.some(x=>x.l.length)){
    d.titulo("Cardio");
    d.tabla([{w:.6,t:"Sem"},{w:1.2,t:"Fase"},{w:6,t:"Cardio de la semana"}],cs.map(x=>[String(x.s),x.f,ptCardioResumen(x.l)||"—"]),{size:8.6});
    const ej=ptCardioSemana(prog,Math.max(2,prog.semanas>=3?3:1),c);
    d.texto("Cardio constante: ritmo en el que puedes platicar (esfuerzo 4–5 de 10)."+(c&&+c.edad>0?" Pulso objetivo: "+Math.round((220-c.edad)*.6)+"–"+Math.round((220-c.edad)*.7)+" lpm.":"")+" Intervalos: bloques fuertes (esfuerzo 8–9) alternados con descanso activo. Cada 2 semanas sube ~5 min; en semanas de descarga baja ~30 %.",{size:8.5,color:G});
  }
  const dd=ptDatosCliente(c);
  d.titulo("Mis medidas (llena una fila cada mes)");
  const filas=[[prog.inicio?ptFechaLarga(prog.inicio):"",dd&&dd.pesoIni?String(dd.pesoIni):"",dd&&dd.grasaIni!=null?String(dd.grasaIni):"","","","","","","Inicio"]];
  for(let i=0;i<6;i++) filas.push(["","","","","","","","",""]);
  d.tabla([{w:1.5,t:"Fecha"},{w:1,t:"Peso (kg)"},{w:1,t:"% grasa"},{w:1,t:"Cintura"},{w:1,t:"Cadera"},{w:1,t:"Pecho"},{w:1,t:"Brazo"},{w:1,t:"Muslo"},{w:1.6,t:"Notas"}],filas,{size:9,pad:6,zebra:false});
  d.titulo("Cómo usar este programa");
  ["RIR = repeticiones en reserva: RIR 2 significa que podrías hacer 2 más.","Calienta 5–8 minutos y haz 1–2 series de aproximación en el primer ejercicio.","Cada 4ª semana es de descarga: menos series y más margen para recuperar.","Duerme 7–9 horas, come suficiente proteína y toma agua. El progreso se ve cada mes: mide siempre en las mismas condiciones.","Si hay dolor (no molestia muscular), para y avisa a tu entrenador."].forEach(x=>d.texto("•  "+x,{size:9,gap:1}));
  return d;
}

/* ---------- PDF: informe de progreso ---------- */
function ptPdfInforme(c){
  const d=pdfNuevo({titulo:"Informe de progreso · "+c.nombre,pie:"Sebas Fit · Informe de progreso · "+c.nombre}), AC=PDF_COL.acento, G=PDF_COL.gris, dd=ptDatosCliente(c), g=ptDiagnostico(c), prog=ptProgActivo(c.id), hoy=todayStr();
  d.texto("SEBAS FIT · ENTRENAMIENTO PERSONAL",{size:8.5,bold:true,color:AC,gap:1});
  d.texto("Informe de progreso",{size:20,bold:true,gap:2});
  d.texto(PT_NIVELES[c.nivel].nom+" · "+PT_OBJETIVOS[c.objetivo].nom+" · generado el "+ptFechaLarga(hoy),{size:9.5,color:G});
  ptPdfDatos(d,c,c.inicio);
  /* antes y ahora */
  const meds=dd.meds, m0=meds[0]||{}, m1=meds[meds.length-1]||{};
  const campo=(k,etq,u)=>{ const a=k==="peso"?(dd.pesoIni||m0.peso):k==="grasa"?(dd.grasaIni!=null?dd.grasaIni:m0.grasa):m0[k], b=meds.filter(m=>m[k]).slice(-1)[0], bv=b?+b[k]:null, av=a?+a:null; if(av==null&&bv==null) return null;
    const dif=av!=null&&bv!=null?r1(bv-av):null, bueno=dif==null?null:(["peso","grasa","cintura","cadera"].includes(k)?(["grasa","gluteo"].includes(c.objetivo)?dif<0:null):dif>0);
    return [etq,av!=null?r1(av)+u:"—",bv!=null?r1(bv)+u:"—",{t:dif==null?"—":(dif>0?"+":"")+dif+u,b:true,color:bueno==null?PDF_COL.ink:bueno?PDF_COL.verde:PDF_COL.ambar}]; };
  const filas=[campo("peso","Peso"," kg"),campo("grasa","% de grasa"," %"),campo("cintura","Cintura"," cm"),campo("cadera","Cadera"," cm"),campo("pecho","Pecho"," cm"),campo("brazo","Brazo"," cm"),campo("muslo","Muslo"," cm")].filter(Boolean);
  if(dd.mm!=null&&dd.pesoIni&&dd.grasaIni!=null){ const i0=pjMasas(dd.pesoIni,dd.grasaIni); filas.splice(2,0,["Masa magra",r1(i0.mm)+" kg",r1(dd.mm)+" kg",{t:(dd.mm-i0.mm>0?"+":"")+r1(dd.mm-i0.mm)+" kg",b:true,color:dd.mm>=i0.mm?PDF_COL.verde:PDF_COL.ambar}],["Masa grasa",r1(i0.mg)+" kg",r1(dd.mg)+" kg",{t:(dd.mg-i0.mg>0?"+":"")+r1(dd.mg-i0.mg)+" kg",b:true,color:dd.mg<=i0.mg?PDF_COL.verde:PDF_COL.ambar}]); }
  d.titulo("Antes y ahora");
  if(filas.length) d.tabla([{w:2,t:"Medida"},{w:1.4,t:"Inicio",a:"right"},{w:1.4,t:"Actual",a:"right"},{w:1.4,t:"Cambio",a:"right"}],filas,{size:9.5,pad:5}); else d.texto("Aún no hay medidas registradas. Anota peso, % de grasa y perímetros cada mes para ver la comparación.",{size:9.5,color:G});
  /* gráficas */
  const ini=parseLocalDate(c.inicio||(meds[0]&&meds[0].fecha)||hoy), dias=f=>Math.round((parseLocalDate(f)-ini)/86400000), pts=pjProyectar(c);
  const sPeso=meds.filter(m=>m.peso).map(m=>({x:dias(m.fecha),y:+m.peso})), sGr=meds.filter(m=>m.grasa).map(m=>({x:dias(m.fecha),y:+m.grasa}));
  const proy=k=>pts.length?pts.slice(0,Math.min(13,pts.length)).map(p=>({x:Math.round(p.mes*30.44),y:r1(k==="peso"?p.peso:p.grasa)})):[];
  if(sPeso.length>=1||sGr.length>=1){
    d.titulo("Evolución"); const w=(d.W-2*d.M-14)/2, top=d.y; d.necesita(130);
    const t0=d.y; if(sPeso.length) d.grafica([{pts:proy("peso"),dash:"3 3",color:G},{pts:sPeso,color:AC}],{titulo:"Peso (kg) · línea punteada = proyección",unit:"",w,h:118,x:d.M});
    d.y=t0; if(sGr.length) d.grafica([{pts:proy("grasa"),dash:"3 3",color:G},{pts:sGr,color:AC}],{titulo:"% de grasa · línea punteada = proyección",unit:"",w,h:118,x:d.M+w+14}); d.y=t0+126;
  }
  /* constancia */
  d.titulo("Constancia");
  d.tabla([{w:2,t:"Indicador"},{w:3,t:"Resultado"}],[["Sesiones registradas",String(ptSesionesDe(c.id).length)],["Constancia últimas 4 semanas",g.ad4.pct+" % ("+g.ad4.hechas+" de "+g.ad4.plan+" sesiones)"],["Racha cumpliendo ≥ 80 %",g.cs.racha+" semanas"],["Cardio registrado (4 semanas)",g.cs.h.slice(-4).reduce((s,x)=>s+x.car,0)+" sesiones"],["Tiempo entrenando","≈ "+r1(g.meses)+" meses"]],{size:9.5,pad:5});
  /* fuerza */
  const first={}, best={}; ptSesionesDe(c.id).slice().reverse().forEach(s=>s.series.forEach(x=>{ const e=Math.max(0,...x.sets.map(t=>ptE1rm(t.kg,t.reps))); if(e<=0) return; if(!first[x.ex]) first[x.ex]=e; if(!best[x.ex]||e>best[x.ex]) best[x.ex]=e; }));
  const fz=Object.keys(best).map(k=>({k,a:first[k],b:best[k],p:(best[k]/first[k]-1)*100})).filter(x=>PT_BY_ID[x.k]).sort((a,b)=>b.p-a.p).slice(0,8);
  if(fz.length){ d.titulo("Fuerza"); d.tabla([{w:3.4,t:"Ejercicio"},{w:1.3,t:"1RM inicial",a:"right"},{w:1.3,t:"1RM actual",a:"right"},{w:1,t:"Mejora",a:"right"}],fz.map(x=>[PT_BY_ID[x.k].nom,r1(x.a)+" kg",r1(x.b)+" kg",{t:(x.p>=0?"+":"")+Math.round(x.p)+" %",b:true,color:x.p>0?PDF_COL.verde:PDF_COL.ink}]),{size:9.2,pad:4.5}); d.texto("1RM estimado a partir de las mejores series registradas (fórmula de Epley).",{size:8,color:G}); }
  /* qué cambió y qué sigue */
  if(prog){
    const cambios=[...(prog.cambios||[]),...(prog.ajustes||[]).map(a=>ptFechaLarga(a.fecha)+": "+a.txt)];
    d.titulo("Programa actual y cambios"); d.texto(prog.nombre+" · "+prog.diasSem+" días por semana · semana "+ptSemanaDe(prog,hoy)+" de "+prog.semanas,{size:9.5,gap:2});
    cambios.forEach(x=>d.texto("•  "+x,{size:9,gap:1}));
    const cardio=ptCardioSemana(prog,ptSemanaDe(prog,hoy),c); if(cardio.length) d.texto("Cardio esta semana: "+ptCardioResumen(cardio),{size:9,gap:1});
  }
  const rec=g.recs.filter(r=>r.t!=="info"||r.accion==null);
  if(rec.length){ d.titulo("Siguientes pasos"); rec.forEach(r=>d.texto("•  "+r.x,{size:9.3,gap:2})); }
  /* proyección */
  if(pts.length){ const hs=pjHitos(c,pts); d.titulo("Lo que viene: 3, 6, 9 y 12 meses");
    d.tabla([{w:1,t:"Mes"},{w:1.2,t:"Peso",a:"right"},{w:1.2,t:"% grasa",a:"right"},{w:5,t:"Lo que empieza a notar"}],hs.map(h=>[String(h.mes),"≈ "+h.peso+" kg","≈ "+h.grasa+" %",h.notar.slice(0,2).join(" ")]),{size:8.8,pad:4.5}); d.texto("Estimaciones orientativas basadas en promedios; dependen de constancia, sueño, comida y genética.",{size:8,color:G}); }
  const rvs=PT_D().revisiones.filter(r=>r.clienteId===c.id).sort((a,b)=>a.fecha<b.fecha?-1:1);
  if(rvs.length){ d.titulo("Historial de revisiones"); d.tabla([{w:1.5,t:"Fecha"},{w:1,t:"Constancia",a:"right"},{w:.9,t:"Racha",a:"right"},{w:1,t:"Peso",a:"right"},{w:1,t:"% grasa",a:"right"},{w:4,t:"Notas"}],rvs.map(r=>[ptFechaLarga(r.fecha),r.adh+" %",String(r.racha),r.peso?r.peso+" kg":"—",r.grasa?r.grasa+" %":"—",r.nota||""]),{size:8.8,pad:4.5}); }
  return d;
}
