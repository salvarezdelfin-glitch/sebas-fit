"use strict";
/* ============================================================
   PT · clientes de personal trainer
   Programas por nivel (básico / intermedio / avanzado), seguimiento de sesiones,
   progresión de cargas, medidas, paquetes y pagos.
   Datos en Vault.data.pt = {clientes, programas, sesiones, medidas, paquetes, pagos}
   ============================================================ */
const PT_D=()=>Vault.data.pt;
const PTUI={cid:null,tab:"resumen",filtro:"activos",sem:null,ses:null,graf:null,genSel:null,addPat:"sentadilla"};
const PT_TABS=[["resumen","Resumen"],["programa","Programa"],["proceso","Proceso"],["sesion","Sesión"],["progreso","Progreso"],["pagos","Pagos"]];
const PT_ZONAS=[["rodilla","Rodilla"],["hombro","Hombro"],["espalda","Espalda baja"],["muneca","Muñeca"]];
const PT_SCHED={2:"Lun · Jue",3:"Lun · Mié · Vie",4:"Lun · Mar · Jue · Vie",5:"Lun · Mar · Mié · Vie · Sáb",6:"Lun a Sáb"};
const PT_MODALIDAD={presencial:"Presencial",remoto:"Rutina mandada"};

/* ---------- plantillas de día ---------- */
const PT_DIAS_TPL={
  FULL_A:{n:"Cuerpo completo A",s:[["sentadilla","main"],["empuje_h","main"],["traccion_h","main"],["bisagra","acc"],["hombro_lat","iso"],["core","core"]]},
  FULL_B:{n:"Cuerpo completo B",s:[["bisagra","main"],["empuje_v","main"],["traccion_v","main"],["unilateral","acc"],["biceps","iso"],["core","core"]]},
  FULL_C:{n:"Cuerpo completo C",s:[["unilateral","main"],["empuje_h","acc"],["traccion_h","acc"],["gluteo","acc"],["triceps","iso"],["core","core"]]},
  UPPER_A:{n:"Tren superior A",s:[["empuje_h","main"],["traccion_h","main"],["empuje_v","acc"],["traccion_v","acc"],["hombro_lat","iso"],["biceps","iso"],["triceps","iso"]]},
  UPPER_B:{n:"Tren superior B",s:[["traccion_v","main"],["empuje_v","main"],["empuje_h","acc"],["traccion_h","acc"],["hombro_post","iso"],["triceps","iso"],["biceps","iso"]]},
  LOWER_A:{n:"Tren inferior A",s:[["sentadilla","main"],["bisagra","acc"],["unilateral","acc"],["cuadriceps","iso"],["pantorrilla","iso"],["core","core"]]},
  LOWER_B:{n:"Tren inferior B",s:[["bisagra","main"],["sentadilla","acc"],["gluteo","acc"],["isquios","iso"],["pantorrilla","iso"],["core","core"]]},
  PUSH:{n:"Empuje",s:[["empuje_h","main"],["empuje_v","acc"],["empuje_h","acc"],["hombro_lat","iso"],["triceps","iso"],["triceps","iso"]]},
  PULL:{n:"Tracción",s:[["traccion_v","main"],["traccion_h","main"],["traccion_h","acc"],["hombro_post","iso"],["biceps","iso"],["biceps","iso"]]},
  LEGS:{n:"Pierna",s:[["sentadilla","main"],["bisagra","acc"],["unilateral","acc"],["isquios","iso"],["cuadriceps","iso"],["pantorrilla","iso"]]},
  GLU_A:{n:"Glúteo A (cadera)",s:[["gluteo","main"],["sentadilla","acc"],["bisagra","acc"],["gluteo","iso"],["isquios","iso"],["core","core"]]},
  GLU_B:{n:"Glúteo B (unilateral)",s:[["unilateral","main"],["gluteo","main"],["bisagra","acc"],["gluteo","iso"],["pantorrilla","iso"],["core","core"]]},
  UP_LITE:{n:"Tren superior (ligero)",s:[["empuje_h","acc"],["traccion_h","acc"],["empuje_v","iso"],["traccion_v","acc"],["biceps","iso"],["triceps","iso"]]},
};
function ptSplit(nivel,obj,dias){
  if(obj==="gluteo"){
    return ({2:["GLU_A","UP_LITE"],3:["GLU_A","UP_LITE","GLU_B"],4:["GLU_A","UPPER_A","GLU_B","UPPER_B"],5:["GLU_A","UPPER_A","GLU_B","UP_LITE","LOWER_A"],6:["GLU_A","UPPER_A","GLU_B","UPPER_B","LOWER_A","UP_LITE"]})[dias];
  }
  return ({2:["FULL_A","FULL_B"],3:nivel==="avanzado"?["UPPER_A","LOWER_A","FULL_B"]:["FULL_A","FULL_B","FULL_C"],
    4:["UPPER_A","LOWER_A","UPPER_B","LOWER_B"],5:["PUSH","PULL","LEGS","UPPER_A","LOWER_A"],6:["PUSH","PULL","LEGS","PUSH","PULL","LEGS"]})[dias];
}
/* ---------- prescripción base por objetivo / nivel / rol ---------- */
const PT_RX={
  fuerza:     {main:[3,6,150],acc:[6,10,90],iso:[10,12,60],core:[10,15,45]},
  hipertrofia:{main:[6,10,120],acc:[8,12,90],iso:[12,15,60],core:[10,15,45]},
  grasa:      {main:[8,12,90],acc:[10,15,60],iso:[12,20,45],core:[12,20,40]},
  gluteo:     {main:[6,12,120],acc:[8,12,90],iso:[12,20,60],core:[12,20,45]},
  salud:      {main:[8,12,90],acc:[10,15,75],iso:[12,15,60],core:[10,15,45]},
};
const PT_RX_BASICO={main:[8,12,90],acc:[10,15,75],iso:[12,15,60],core:[10,15,45]};
const PT_RX_BASICO_FUERZA={main:[6,10,120],acc:[8,12,90],iso:[10,15,60],core:[10,15,45]};
const PT_SETS={basico:{main:3,acc:2,iso:2,core:2},intermedio:{main:4,acc:3,iso:3,core:3},avanzado:{main:4,acc:3,iso:3,core:3}};
const PT_RIR={basico:3,intermedio:2,avanzado:1};
const PT_SEG={basico:[20,40],intermedio:[30,45],avanzado:[40,60]};
/* volumen directo recomendado por músculo y semana (series) */
const PT_VOL={basico:[6,12],intermedio:[10,16],avanzado:[12,20]};
const PT_VOL_PEQ={basico:[3,8],intermedio:[6,12],avanzado:[8,14]};   // brazos, pantorrillas, core

/* ---------- generador ---------- */
function ptRol(rol,ex){ return rol; }
function ptScore(e,rol,nivelN,obj){
  let s=Math.random()*1.5;
  if(rol==="main"||rol==="acc") s+=(e.t==="c"?2:0); else s+=(e.t==="a"?1:0);
  s+=(e.n===nivelN?2:(e.n===nivelN-1?1:0));
  if(typeof aprPTBoost==="function") s+=aprPTBoost(e.id);   // prefiere lo que cambias a favor, evita lo que quitas
  if(obj==="fuerza"&&rol==="main"&&(e.need.includes("barra")||e.need.includes("maq"))) s+=1;
  if(obj==="gluteo"&&e.m==="gluteo") s+=1;
  return s;
}
function ptPickEx(patron,rol,ctx){
  let pool=ptDisponibles(ctx.equipo,ctx.nivelN,ctx.contra).filter(e=>e.p===patron&&!ctx.dayUsed.has(e.id));
  const fresh=pool.filter(e=>!ctx.used.has(e.id)); if(fresh.length) pool=fresh;
  if(!pool.length) return null;
  pool.sort((a,b)=>ptScore(b,rol,ctx.nivelN,ctx.obj)-ptScore(a,rol,ctx.nivelN,ctx.obj));
  return pool[0];
}
function ptSlot(ex,rol,cfg){
  const tbl=cfg.nivel==="basico"?(cfg.objetivo==="fuerza"?PT_RX_BASICO_FUERZA:PT_RX_BASICO):PT_RX[cfg.objetivo];
  let [lo,hi,rest]=tbl[rol==="core"?"core":rol];
  let sets=PT_SETS[cfg.nivel][rol];
  if(cfg.nivel==="avanzado"&&cfg.objetivo==="fuerza"&&rol==="main") sets=5;
  if(cfg.nivel==="avanzado"&&rol==="acc") sets=4;
  if(ex.seg){ [lo,hi]=PT_SEG[cfg.nivel]; rest=45; }
  if(ex.n===1&&ex.p==="core"&&!ex.seg){ lo=10; hi=15; }
  return {uid:newId("x"),ex:ex.id,rol,sets,lo,hi,rir:ex.seg?null:PT_RIR[cfg.nivel],rest,seg:!!ex.seg,nota:""};
}
function ptMinDia(d){ return Math.round(7+d.ejercicios.reduce((s,x)=>s+x.sets*(0.8+x.rest/60),0)); }
function ptAjustarTiempo(d,minutos){
  while(ptMinDia(d)>minutos+3&&d.ejercicios.length>4){
    let i=-1; for(let k=d.ejercicios.length-1;k>=0;k--){ if(d.ejercicios[k].rol==="iso"||d.ejercicios[k].rol==="core"){ i=k; break; } }
    if(i<0) break; d.ejercicios.splice(i,1);
  }
  // si todavía se pasa, baja series de lo que más tiempo consume (básicos mín. 3, el resto mín. 2)
  let guard=24;
  while(ptMinDia(d)>minutos+3&&guard-->0){
    const c=d.ejercicios.filter(x=>x.sets>(x.rol==="main"?3:2)).sort((a,b)=>b.sets*(0.8+b.rest/60)-a.sets*(0.8+a.rest/60))[0];
    if(!c) break; c.sets--;
  }
}
/* meta de series directas por músculo: rango del nivel, escalada a los días disponibles y al objetivo */
function ptMetaVol(m,prog){
  const grande=["pecho","espalda","hombro","cuadriceps","isquios","gluteo"].includes(m);
  let lo=(grande?PT_VOL:PT_VOL_PEQ)[prog.nivel][0]*Math.min(1,prog.diasSem/4);
  if(prog.objetivo==="salud"||prog.objetivo==="grasa") lo*=0.8;
  if(prog.objetivo==="gluteo"&&["pecho","espalda","hombro","biceps","triceps"].includes(m)) lo*=0.6;
  return Math.max(2,Math.ceil(lo));
}
/* completa los músculos que quedaron bajos: +1 serie a lo que ya hay o añade un ejercicio donde quepa en el tiempo */
function ptEquilibrar(prog){
  const ctx={equipo:prog.equipo,nivelN:PT_NIVELES[prog.nivel].n,contra:prog.lesiones||[],obj:prog.objetivo,used:new Set(),dayUsed:new Set()};
  prog.dias.forEach(d=>d.ejercicios.forEach(s=>ctx.used.add(s.ex)));
  const saltar=new Set();
  for(let pass=0;pass<30;pass++){
    const v=ptVolumen(prog,1);
    const bajos=PT_MUSCULOS.filter(m=>!saltar.has(m)&&v[m]<ptMetaVol(m,prog)).sort((a,b)=>(ptMetaVol(b,prog)-v[b])-(ptMetaVol(a,prog)-v[a]));
    if(!bajos.length) return;
    const m=bajos[0]; let hecho=false;
    const cands=[]; prog.dias.forEach(d=>d.ejercicios.forEach(sl=>{ const e=PT_BY_ID[sl.ex]; if(e&&e.m===m&&e.p!=="cardio"&&sl.sets<(sl.rol==="main"?5:4)) cands.push({d,sl}); }));
    cands.sort((a,b)=>a.sl.sets-b.sl.sets);
    for(const c of cands){ c.sl.sets++; if(ptMinDia(c.d)<=prog.minutos+3){ hecho=true; break; } c.sl.sets--; }
    if(hecho) continue;
    const pool=ptDisponibles(prog.equipo,ctx.nivelN,ctx.contra).filter(e=>e.m===m&&e.p!=="cardio");
    const dias=prog.dias.slice().sort((a,b)=>ptMinDia(a)-ptMinDia(b));
    for(const d of dias){
      const ya=new Set(d.ejercicios.map(s=>s.ex)); let opc=pool.filter(e=>!ya.has(e.id)); const fresh=opc.filter(e=>!ctx.used.has(e.id)); if(fresh.length) opc=fresh;
      if(!opc.length) continue;
      opc.sort((a,b)=>ptScore(b,"iso",ctx.nivelN,prog.objetivo)-ptScore(a,"iso",ctx.nivelN,prog.objetivo));
      const e=opc[0], sl=ptSlot(e,e.t==="c"?"acc":"iso",{nivel:prog.nivel,objetivo:prog.objetivo});
      d.ejercicios.push(sl);
      if(ptMinDia(d)<=prog.minutos+3){ ctx.used.add(e.id); hecho=true; break; }
      d.ejercicios.pop();
    }
    if(!hecho) saltar.add(m);
  }
}
function ptGenerar(cfg){
  const nivelN=PT_NIVELES[cfg.nivel].n;
  let dias=cfg.dias; if(cfg.nivel==="basico") dias=Math.min(dias,4); if(cfg.nivel==="avanzado") dias=Math.max(dias,3);
  const split=ptSplit(cfg.nivel,cfg.objetivo,dias);
  const ctx={equipo:cfg.equipo,nivelN,contra:cfg.lesiones||[],obj:cfg.objetivo,used:new Set(),dayUsed:null};
  const out=split.map((k,i)=>{
    ctx.dayUsed=new Set(); const T=PT_DIAS_TPL[k], ejs=[];
    T.s.forEach(([p,rol])=>{ const ex=ptPickEx(p,rol,ctx); if(ex){ ctx.dayUsed.add(ex.id); ctx.used.add(ex.id); ejs.push(ptSlot(ex,rol,cfg)); } });
    const d={id:newId("d"),clave:k,nombre:"Día "+(i+1)+" — "+T.n,ejercicios:ejs}; ptAjustarTiempo(d,cfg.minutos||60); return d;
  });
  const prog={id:newId("pg"),clienteId:cfg.clienteId||null,nombre:cfg.nombre||(PT_OBJETIVOS[cfg.objetivo].nom+" · "+PT_NIVELES[cfg.nivel].nom),
    nivel:cfg.nivel,objetivo:cfg.objetivo,equipo:cfg.equipo,semanas:cfg.semanas,diasSem:dias,minutos:cfg.minutos||60,lesiones:cfg.lesiones||[],
    inicio:cfg.inicio||todayStr(),activo:true,dias:out,creado:nowISO()};
  ptEquilibrar(prog);
  return prog;
}
/* ---------- fases de la progresión ---------- */
function ptFase(prog,w){
  if(prog.semanas>=4&&w%4===0) return {k:"deload",nom:"Descarga",rirAdj:2,setsAdj:0,deload:true,desc:"Menos series y más margen: recupera para la siguiente fase. Carga ~10% menor."};
  const m=((w-1)%4)+1;
  if(prog.nivel==="basico"){
    if(m===1) return {k:"adap",nom:"Adaptación",rirAdj:1,setsAdj:0,desc:"Aprende los patrones. Cargas cómodas, deja 3–4 repeticiones en reserva."};
    return {k:"prog",nom:m===2?"Aprendizaje":"Progresión",rirAdj:0,setsAdj:0,desc:"Sube la carga cuando completes todas las series en el tope de repeticiones."};
  }
  if(m===1) return {k:"base",nom:"Base",rirAdj:1,setsAdj:0,desc:"Volumen de arranque con margen. Asegura técnica y cargas de trabajo."};
  if(m===2) return {k:"prog",nom:"Progreso",rirAdj:0,setsAdj:0,desc:"Progresión de carga o repeticiones en cada ejercicio."};
  return {k:"pico",nom:"Pico",rirAdj:-1,setsAdj:1,desc:"Más intensidad: una serie extra en los básicos y menos margen."};
}
function ptRx(prog,sl,w){
  const f=ptFase(prog,w); let sets=sl.sets; if(f.setsAdj&&sl.rol==="main") sets+=f.setsAdj; if(f.deload) sets=Math.max(2,Math.ceil(sets*0.6));
  const rir=sl.rir==null?null:Math.max(0,Math.min(5,sl.rir+f.rirAdj));
  return {sets,lo:sl.lo,hi:sl.hi,rir,rest:sl.rest,seg:!!sl.seg,fase:f};
}
function ptRxTxt(rx,uni){
  const rep=rx.seg?rx.lo+"–"+rx.hi+" s":(rx.lo===rx.hi?rx.lo:rx.lo+"–"+rx.hi)+" reps";
  return rx.sets+" × "+rep+(uni&&!rx.seg?" por lado":"")+(rx.rir!=null?" · RIR "+rx.rir:"")+" · desc. "+(rx.rest>=90?Math.round(rx.rest/60*10)/10+" min":rx.rest+" s");
}
function ptSemanaDe(prog,fecha){
  const d=Math.floor((parseLocalDate(fecha)-parseLocalDate(prog.inicio))/86400000);
  return Math.max(1,Math.min(prog.semanas,Math.floor(d/7)+1));
}
/* series directas por músculo en una semana */
function ptVolumen(prog,w){
  const v={}; PT_MUSCULOS.forEach(m=>v[m]=0);
  prog.dias.forEach(d=>d.ejercicios.forEach(sl=>{ const e=PT_BY_ID[sl.ex]; if(e&&e.p!=="cardio") v[e.m]+=ptRx(prog,sl,w).sets; }));
  return v;
}
function ptVolEstado(m,n,prog){
  const grande=["pecho","espalda","hombro","cuadriceps","isquios","gluteo"].includes(m), hi=(grande?PT_VOL:PT_VOL_PEQ)[prog.nivel][1];
  return n<ptMetaVol(m,prog)?"bajo":n>hi?"alto":"ok";
}

/* ---------- consultas ---------- */
const ptCliente=id=>PT_D().clientes.find(c=>c.id===id);
const ptProgActivo=cid=>PT_D().programas.find(p=>p.clienteId===cid&&p.activo);
const ptSesionesDe=cid=>PT_D().sesiones.filter(s=>s.clienteId===cid).sort((a,b)=>a.fecha<b.fecha?1:a.fecha>b.fecha?-1:0);
const ptMedidasDe=cid=>PT_D().medidas.filter(m=>m.clienteId===cid).sort((a,b)=>a.fecha<b.fecha?-1:1);
function ptIngresosMes(){ const mp=todayStr().slice(0,7); return PT_D().pagos.filter(p=>(p.fecha||"").slice(0,7)===mp).reduce((s,p)=>s+(p.monto||0),0); }
function ptE1rm(kg,reps){ return reps>0&&kg>0?kg*(1+Math.min(reps,12)/30):0; }
function ptInc(exId){ const e=PT_BY_ID[exId]; if(!e) return 2; return e.inc!=null?e.inc:(e.t==="c"?2.5:1); }
function ptEsPC(exId){ const e=PT_BY_ID[exId]; return !e||e.need.every(t=>["pc","cubo","liga","pelota","polainas"].includes(t)); }
function roundKg(x){ return Math.round(x*2)/2; }
function ptUltimo(cid,exId,antesDe){
  for(const s of ptSesionesDe(cid)){ if(antesDe&&s.fecha>=antesDe) continue; const x=s.series.find(z=>z.ex===exId&&z.sets.some(t=>t.reps>0)); if(x) return {fecha:s.fecha,sets:x.sets.filter(t=>t.reps>0)}; }
  return null;
}
/* sugiere la carga de hoy a partir de la última vez (doble progresión) */
function ptSugerir(cid,exId,rx){
  const u=ptUltimo(cid,exId);
  if(!u) return {kg:null,txt:ptEsPC(exId)?"Primera vez: usa tu peso corporal o liga y ajusta con el RIR.":"Primera vez: empieza ligero y ajusta con el RIR."};
  const maxKg=Math.max(...u.sets.map(s=>s.kg||0)), pc=ptEsPC(exId);
  const ult=u.sets.map(s=>s.reps).join(", ")+(maxKg?" @ "+maxKg+" kg":"");
  if(rx.fase.deload) return {kg:pc?null:roundKg(maxKg*0.9),txt:"Descarga: "+(pc?"mismas reps, con menos series.":"~10% menos carga ("+roundKg(maxKg*0.9)+" kg)."),ult};
  const allHi=u.sets.every(s=>s.reps>=rx.hi), anyLow=u.sets.some(s=>s.reps<rx.lo);
  const rirs=u.sets.filter(s=>s.rir!==""&&s.rir!=null).map(s=>+s.rir), okRir=!rirs.length||rirs.reduce((a,b)=>a+b,0)/rirs.length>=1;
  if(allHi&&okRir) return {kg:pc?null:roundKg(maxKg+ptInc(exId)),txt:pc?"Llegó al tope de reps → añade repeticiones o pasa a una variante más difícil.":"Llegó al tope de reps → sube a "+roundKg(maxKg+ptInc(exId))+" kg.",ult};
  if(anyLow) return {kg:pc?null:roundKg(maxKg*0.95),txt:pc?"Se quedó corto de reps → baja el rango o revisa técnica.":"Se quedó corto de reps → baja ~5% ("+roundKg(maxKg*0.95)+" kg) o revisa técnica.",ult};
  return {kg:pc?null:maxKg,txt:"Mismo peso: busca +1 repetición por serie.",ult};
}
function ptAdherencia(cid,nSem){
  const prog=ptProgActivo(cid), c=ptCliente(cid), plan=(prog?prog.diasSem:(c&&c.dias))||3, today=todayStr();
  const desde=addDays(weekKeyAndLabel(today).key,-7*(nSem-1)), hechas=ptSesionesDe(cid).filter(s=>s.completada!==false&&s.fecha>=desde&&s.fecha<=today).length;
  return {pct:Math.min(100,Math.round(hechas/(plan*nSem)*100)),hechas,plan:plan*nSem};
}
function ptPRs(cid){
  const best={};
  ptSesionesDe(cid).slice().reverse().forEach(s=>s.series.forEach(x=>x.sets.forEach(t=>{ const e=ptE1rm(t.kg,t.reps); if(e>0&&(!best[x.ex]||e>best[x.ex].e1)) best[x.ex]={e1:e,kg:t.kg,reps:t.reps,fecha:s.fecha}; })));
  return best;
}
function ptPaqueteActivo(cid){ return PT_D().paquetes.filter(p=>p.clienteId===cid&&p.tipo==="presencial"&&(p.sesiones-p.usadas)>0&&(!p.vence||p.vence>=todayStr()))
  .sort((a,b)=>(a.vence||"9999")<(b.vence||"9999")?-1:1)[0]; }
function ptAlertas(c){
  const out=[], hoy=todayStr(), ses=ptSesionesDe(c.id), prog=ptProgActivo(c.id);
  if(c.estado==="activo"){
    const ult=ses[0]; if(prog&&ult){ const dd=Math.floor((parseLocalDate(hoy)-parseLocalDate(ult.fecha))/86400000); if(dd>=10) out.push({t:"warn",x:"Sin sesión hace "+dd+" días — escríbele para retomar."}); }
    if(prog&&!ult) out.push({t:"info",x:"Programa listo, todavía sin sesiones registradas."});
    if(!prog) out.push({t:"info",x:"Sin programa activo: genera uno para empezar."});
    if(prog){ const w=ptSemanaDe(prog,hoy), f=ptFase(prog,w); if(f.deload) out.push({t:"info",x:"Esta semana es de descarga (semana "+w+")."}); if(w>=prog.semanas&&hoy>addDays(prog.inicio,prog.semanas*7)) out.push({t:"warn",x:"El programa terminó: evalúa y genera la siguiente fase."}); }
    const pk=PT_D().paquetes.filter(p=>p.clienteId===c.id&&p.tipo==="presencial").sort((a,b)=>a.inicio<b.inicio?1:-1)[0];
    if(pk){ const rest=pk.sesiones-pk.usadas; if(rest<=0) out.push({t:"warn",x:"Paquete terminado — ofrece renovar."}); else if(rest<=2) out.push({t:"info",x:"Le quedan "+rest+" sesión(es) del paquete."}); if(pk.vence&&pk.vence<hoy&&rest>0) out.push({t:"warn",x:"El paquete venció con "+rest+" sesión(es) sin usar."}); }
    const m=ptMedidasDe(c.id).slice(-1)[0]; if(!m||Math.floor((parseLocalDate(hoy)-parseLocalDate(m.fecha))/86400000)>=30) out.push({t:"info",x:"Toca registrar medidas (cada ~30 días)."});
  }
  const ns=ptNivelSugerido(c); if(ns) out.push({t:"ok",x:ns});
  return out;
}
/* criterios orientativos para pasar al siguiente nivel */
function ptNivelSugerido(c){
  if(c.nivel==="avanzado") return null;
  const ses=ptSesionesDe(c.id), min=c.nivel==="basico"?24:70; if(ses.length<min) return null;
  if(ptAdherencia(c.id,6).pct<80) return null;
  let mejoras=0; const por={};
  ses.slice().reverse().forEach(s=>s.series.forEach(x=>{ const b=Math.max(0,...x.sets.map(t=>ptE1rm(t.kg,t.reps))); if(b>0) (por[x.ex]=por[x.ex]||[]).push(b); }));
  Object.values(por).forEach(a=>{ if(a.length>=3&&Math.max(...a)>=a[0]*1.1) mejoras++; });
  if(mejoras<2) return null;
  return "Podría estar listo para "+(c.nivel==="basico"?"Intermedio":"Avanzado")+": "+ses.length+" sesiones, adherencia ≥80% y progreso sostenido en "+mejoras+" ejercicios (criterio orientativo).";
}

/* ---------- gráficas SVG ---------- */
function svgLine(pts,unit,color){
  if(pts.length<2) return `<p class="hint">Se necesitan al menos 2 registros para graficar.</p>`;
  const W=320,H=130,P=26, ys=pts.map(p=>p.y), mn=Math.min(...ys), mx=Math.max(...ys), span=(mx-mn)||1;
  const x=i=>P+i*(W-2*P)/(pts.length-1), y=v=>H-P-(v-mn)/span*(H-2*P);
  const line=pts.map((p,i)=>(i?"L":"M")+x(i).toFixed(1)+" "+y(p.y).toFixed(1)).join(" ");
  const f=n=>Math.round(n*10)/10;
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfica"><path d="${line}" fill="none" stroke="${color||"var(--accent)"}" stroke-width="2.2" stroke-linejoin="round"/>
    ${pts.map((p,i)=>`<circle cx="${x(i).toFixed(1)}" cy="${y(p.y).toFixed(1)}" r="3" fill="${color||"var(--accent)"}"/>`).join("")}
    <text x="${P}" y="12" class="ct">${f(mx)} ${unit}</text><text x="${P}" y="${H-6}" class="ct">${f(mn)} ${unit}</text>
    <text x="${W-P}" y="${H-6}" text-anchor="end" class="ct">${fmtCorto(pts[pts.length-1].x)}</text><text x="${P+60}" y="${H-6}" class="ct" opacity=".0"> </text></svg>`;
}
function svgBars(vals,labels,fmt,color){
  if(!vals.length) return "";
  const W=320,H=120,P=22, mx=Math.max(1,...vals), bw=(W-2*P)/vals.length;
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfica de barras">${vals.map((v,i)=>{ const h=v/mx*(H-2*P);
    return `<rect x="${(P+i*bw+bw*.15).toFixed(1)}" y="${(H-P-h).toFixed(1)}" width="${(bw*.7).toFixed(1)}" height="${Math.max(h,1).toFixed(1)}" rx="3" fill="${color||"var(--accent)"}" opacity=".85"/>
      <text x="${(P+i*bw+bw/2).toFixed(1)}" y="${H-8}" text-anchor="middle" class="ct">${esc(labels[i])}</text>
      <text x="${(P+i*bw+bw/2).toFixed(1)}" y="${(H-P-h-4).toFixed(1)}" text-anchor="middle" class="ct">${fmt?fmt(v):v}</text>`; }).join("")}</svg>`;
}

/* ---------- vistas ---------- */
function viewClientes(){
  if(PTUI.vista==="plantillas") return viewPlantillas();
  const L=PT_D().clientes, f=PTUI.filtro;
  const vis=L.filter(c=>f==="todos"||(f==="activos"?c.estado==="activo":f==="pausa"?c.estado==="pausa":c.estado==="archivado")).sort((a,b)=>a.nombre.localeCompare(b.nombre));
  const cnt=k=>L.filter(c=>c.estado===k).length;
  const cards=vis.map(c=>{
    const pg=ptProgActivo(c.id), ses=ptSesionesDe(c.id), ad=ptAdherencia(c.id,4), al=ptAlertas(c).filter(a=>a.t==="warn");
    return `<button class="cli-card" data-action="pt-open" data-id="${c.id}"><div class="cc-top"><span class="cc-name">${esc(c.nombre)}</span><span class="chip nv-${c.nivel}">${PT_NIVELES[c.nivel].nom}</span></div>
      <div class="cc-meta">${esc(PT_OBJETIVOS[c.objetivo].nom)} · ${PT_MODALIDAD[c.modalidad]}</div>
      <div class="cc-stats"><span><b class="num">${ad.pct}%</b> adherencia</span><span><b class="num">${ses.length}</b> sesiones</span><span>${pg?"Sem "+ptSemanaDe(pg,todayStr())+"/"+pg.semanas:"sin programa"}</span></div>
      ${al.length?`<div class="cc-alert">⚠ ${esc(al[0].x)}</div>`:""}</button>`;
  }).join("");
  return `<div class="wrap">
    <header class="page-head"><span class="eyebrow">Personal trainer</span><h1>Clientes</h1><p class="sub">Programas por nivel, seguimiento de sesiones y progreso — presencial y rutina mandada.</p></header>
    ${ptVistaTabs()}
    <div class="toolbar"><div class="seg">${[["activos","Activos ("+cnt("activo")+")"],["pausa","En pausa ("+cnt("pausa")+")"],["archivado","Archivados ("+cnt("archivado")+")"],["todos","Todos"]].map(([k,l])=>`<button data-action="pt-filtro" data-v="${k}" class="${f===k?"on":""}">${l}</button>`).join("")}</div>
      <span class="spacer"></span><button class="btn primary" data-action="pt-nuevo">+ Nuevo cliente</button></div>
    ${cards?`<div class="cli-grid">${cards}</div>`:`<div class="empty"><b>Aún no hay clientes${f!=="todos"?" en esta vista":""}.</b><p>Crea el primero con "Nuevo cliente" — o desde una cotización aceptada.</p></div>`}
  </div>`;
}
function viewCliente(){
  const c=ptCliente(PTUI.cid); if(!c){ PTUI.cid=null; return viewClientes(); }
  const tabs=PT_TABS.map(([k,l])=>`<button data-action="pt-tab" data-v="${k}" class="${PTUI.tab===k?"on":""}">${l}</button>`).join("");
  const body=PTUI.tab==="programa"?ptTabPrograma(c):PTUI.tab==="proceso"?ptTabProceso(c):PTUI.tab==="sesion"?ptTabSesion(c):PTUI.tab==="progreso"?ptTabProgreso(c):PTUI.tab==="pagos"?ptTabPagos(c):ptTabResumen(c);
  return `<div class="wrap">
    <div class="back-row"><button class="btn sm ghost" data-action="pt-back">← Clientes</button></div>
    <header class="page-head cli-head"><div><span class="eyebrow">${PT_MODALIDAD[c.modalidad]} · ${esc(PT_EQUIPO[c.equipo].nom)}</span><h1>${esc(c.nombre)}</h1>
      <div class="meta"><span class="chip nv-${c.nivel}">${PT_NIVELES[c.nivel].nom}</span><span class="chip">${esc(PT_OBJETIVOS[c.objetivo].nom)}</span><span class="chip">${c.dias} días/sem</span>
      ${c.estado!=="activo"?`<span class="chip warn">${c.estado}</span>`:""}${(c.lesiones||[]).map(z=>`<span class="chip warn">⚠ ${z}</span>`).join("")}</div></div>
      <div class="acts"><button class="btn sm" data-action="pt-editar" data-id="${c.id}">✎ Editar</button></div></header>
    <div class="tabs">${tabs}</div>${body}</div>`;
}
function ptTabResumen(c){
  const ses=ptSesionesDe(c.id), prog=ptProgActivo(c.id), ad=ptAdherencia(c.id,4), meds=ptMedidasDe(c.id), pk=ptPaqueteActivo(c.id);
  const w=prog?ptSemanaDe(prog,todayStr()):null, f=prog?ptFase(prog,w):null;
  const pesos=meds.filter(m=>m.peso); const dPeso=pesos.length>1?Math.round((pesos[pesos.length-1].peso-pesos[0].peso)*10)/10:null;
  const al=ptAlertas(c);
  const tiles=`<div class="tiles tiles-4"><div class="tile"><div class="label">Adherencia · 4 sem</div><div class="value num money">${ad.pct}%</div><div class="foot">${ad.hechas} de ${ad.plan} sesiones</div></div>
    <div class="tile"><div class="label">Sesiones totales</div><div class="value num">${ses.length}</div><div class="foot">${ses[0]?"última: "+fmtCorto(ses[0].fecha):"ninguna aún"}</div></div>
    <div class="tile"><div class="label">Programa</div><div class="value">${prog?"Sem "+w+"/"+prog.semanas:"—"}</div><div class="foot">${f?esc(f.nom):"sin programa activo"}</div></div>
    <div class="tile"><div class="label">Peso corporal</div><div class="value num">${pesos.length?pesos[pesos.length-1].peso+" kg":"—"}</div><div class="foot">${dPeso!==null?(dPeso>0?"+":"")+dPeso+" kg desde el inicio":"sin medidas"}</div></div></div>`;
  const alH=al.length?`<div class="alert-list">${al.map(a=>`<div class="alert ${a.t}">${a.t==="warn"?"⚠":a.t==="ok"?"✔":"ℹ"} ${esc(a.x)}</div>`).join("")}</div>`:`<p class="hint">Todo en orden.</p>`;
  const pkH=pk?`<div class="pk-bar"><div class="pk-top"><b>Paquete: ${esc(pk.concepto)}</b><span>${pk.usadas}/${pk.sesiones} sesiones${pk.vence?" · vence "+fmtCorto(pk.vence):""}</span></div><div class="bar"><i style="width:${Math.round(pk.usadas/pk.sesiones*100)}%"></i></div></div>`:"";
  const acciones=`<div class="acts-row">${prog?`<button class="btn primary" data-action="pt-ir-sesion">▶ Registrar sesión</button>`:`<button class="btn primary" data-action="pt-gen" data-id="${c.id}">Generar programa</button>`}
    ${c.modalidad==="remoto"&&prog?`<button class="btn" data-action="pt-copiar-checkin" data-id="${c.id}">⧉ Mensaje de check-in</button>`:""}
    <button class="btn" data-action="go-cot" data-id="${c.id}">Cotización</button></div>`;
  return `${tiles}${pkH}<section class="blk"><div class="blk-head"><h2>Para atender</h2></div>${alH}</section>${acciones}
    ${c.notas?`<section class="blk"><div class="blk-head"><h2>Notas</h2></div><p class="note-txt">${esc(c.notas)}</p></section>`:""}`;
}
function ptTabPrograma(c){
  const prog=ptProgActivo(c.id);
  if(!prog) return `<div class="empty"><b>${esc(c.nombre)} no tiene programa activo.</b><p>Genera uno según su nivel (${PT_NIVELES[c.nivel].nom}), objetivo, días y material${(c.lesiones||[]).length?", evitando: "+c.lesiones.join(", "):""}.</p>
    <p><button class="btn primary" data-action="pt-gen" data-id="${c.id}">Generar programa</button></p></div>`;
  return ptProgramaBody(prog,c);
}
function ptProgramaBody(prog,c){
  if(!PTUI.sem||PTUI.sem>prog.semanas) PTUI.sem=ptSemanaDe(prog,todayStr());
  const w=PTUI.sem, f=ptFase(prog,w), vol=ptVolumen(prog,w);
  const volH=PT_MUSCULOS.map(m=>{ const st=ptVolEstado(m,vol[m],prog); return `<div class="vol ${st}" title="${PT_MUSC_NOM[m]}: ${vol[m]} series/sem"><span>${PT_MUSC_NOM[m]}</span><b class="num">${vol[m]}</b></div>`; }).join("");
  const dias=prog.dias.map((d,di)=>`<section class="sec pt-day"><div class="sec-head"><h3>${esc(d.nombre)}</h3><span class="s-meta">${d.ejercicios.length} ejercicios · ≈ ${ptMinDia(d)} min</span><span class="spacer"></span>
      <button class="btn sm" data-action="pt-add-ex" data-p="${prog.id}" data-d="${d.id}">+ Añadir</button>${c?`<button class="btn sm primary" data-action="pt-ir-sesion" data-p="${prog.id}" data-d="${d.id}">▶ Registrar</button>`:""}</div>
      ${d.ejercicios.map((sl,i)=>{ const e=PT_BY_ID[sl.ex]; if(!e) return ""; const rx=ptRx(prog,sl,w);
        return `<div class="ex pt-ex"><div class="ord"><div class="idx">${String(i+1).padStart(2,"0")}</div>
          <button data-action="pt-move" data-p="${prog.id}" data-d="${d.id}" data-u="${sl.uid}" data-dir="-1" ${i===0?"disabled":""} aria-label="Subir">▲</button><button data-action="pt-move" data-p="${prog.id}" data-d="${d.id}" data-u="${sl.uid}" data-dir="1" ${i===d.ejercicios.length-1?"disabled":""} aria-label="Bajar">▼</button></div>
          <div class="body"><div class="name">${esc(e.nom)}</div>
            <div class="badges"><span class="chip">${esc(PT_PATRONES[e.p])}</span><span class="chip">${PT_MUSC_NOM[e.m]}</span><span class="chip">${e.need.map(t=>({pc:"peso corporal",man:"mancuernas",barra:"barra",maq:"máquina",pol:"polea",banco:"banco",kb:"kettlebell",liga:"liga",cubo:"cajón",dom:"barra fija",polainas:"polainas",pelota:"pelota"})[t]).join(" + ")}</span>${sl.rol==="main"?`<span class="chip solid">Básico</span>`:""}</div>
            <div class="scheme"><span class="n">${esc(ptRxTxt(rx,e.uni))}</span></div>
            <div class="cue">${esc(e.cue)}</div>${sl.nota?`<div class="cue" style="color:var(--accent)">✎ ${esc(sl.nota)}</div>`:""}</div>
          <div class="acts"><button class="btn sm" data-action="pt-swap" data-p="${prog.id}" data-d="${d.id}" data-u="${sl.uid}">↺ Cambiar</button><button class="btn sm ghost" data-action="pt-del-ex" data-p="${prog.id}" data-d="${d.id}" data-u="${sl.uid}">✕</button></div></div>`; }).join("")}
    </section>`).join("");
  return `<div class="prog-head"><div><h2 class="prog-name">${esc(prog.nombre)}</h2><p class="hint">${prog.diasSem} días/sem (${PT_SCHED[prog.diasSem]||""}) · ${prog.semanas} semanas · ≈ ${prog.minutos} min por sesión · desde ${fmtCorto(prog.inicio)}</p></div>
    <div class="acts"><button class="btn sm" data-action="pt-copiar-prog" data-id="${prog.id}">⧉ Copiar para WhatsApp</button><button class="btn sm" data-action="pt-print-prog" data-id="${prog.id}">⎙ Imprimir / PDF</button>
    ${c?`<button class="btn sm" data-action="pt-gen" data-id="${c.id}">↻ Nuevo programa</button>`:""}</div></div>
    <div class="phase-card ph-${f.k}"><div class="pager"><button class="pg" data-action="pt-sem" data-d="-1" ${w<=1?"disabled":""} aria-label="Semana anterior">←</button><b>Semana ${w} de ${prog.semanas}</b><button class="pg" data-action="pt-sem" data-d="1" ${w>=prog.semanas?"disabled":""} aria-label="Semana siguiente">→</button></div>
      <div class="ph-body"><span class="chip ph">${esc(f.nom)}</span><span class="hint">${esc(f.desc)}</span></div></div>
    <div class="vol-row"><span class="mini-lbl">Series directas por semana</span><div class="vols">${volH}</div><p class="hint">Verde: dentro del rango recomendado para su nivel · ámbar: bajo o alto. Los básicos también trabajan músculos secundarios.</p></div>
    <div class="sections">${dias}</div>`;
}
function ptTabSesion(c){
  const prog=ptProgActivo(c.id), S=PTUI.ses;
  if(!S||S.clienteId!==c.id){
    const dOpts=prog?prog.dias.map(d=>`<option value="${d.id}" ${PTUI.diaSel===d.id?"selected":""}>${esc(d.nombre)}</option>`).join(""):"";
    const hist=ptSesionesDe(c.id).slice(0,12).map(s=>{ const ton=s.series.reduce((a,x)=>a+x.sets.reduce((b,t)=>b+(t.kg||0)*(t.reps||0),0),0), n=s.series.reduce((a,x)=>a+x.sets.filter(t=>t.reps>0).length,0);
      return `<div class="row-line"><div><b>${fmtCorto(s.fecha)}</b> · ${esc(s.diaNombre||"Sesión libre")}${s.semana?` <span class="hint">sem ${s.semana}</span>`:""}</div><div class="hint">${n} series · ${Math.round(ton).toLocaleString("es-MX")} kg de volumen${s.energia?" · energía "+s.energia+"/5":""}${(s.prs||[]).length?" · 🏆 "+s.prs.length+" PR":""}</div><button class="del" data-action="pt-ses-del" data-id="${s.id}" aria-label="Eliminar sesión">✕</button></div>`; }).join("")||`<p class="hint">Aún no hay sesiones registradas.</p>`;
    return `<section class="blk"><div class="blk-head"><h2>Registrar sesión</h2><p>${c.modalidad==="remoto"?"Anota lo que el cliente te reporta":"Anota series, cargas y repeticiones durante o después de la sesión"}</p></div>
      <div class="card"><div class="form-grid g3"><div><label class="mini">Día del programa</label><select class="inp" id="ps-dia"><option value="">Sesión libre</option>${dOpts}</select></div>
        <div><label class="mini">Fecha</label><input class="inp" type="date" id="ps-fecha" value="${todayStr()}"></div>
        <div><label class="mini">&nbsp;</label><button class="btn primary" style="width:100%" data-action="pt-ses-start">Empezar</button></div></div></div></section>
      <section class="blk"><div class="blk-head"><h2>Últimas sesiones</h2></div><div class="list-lines">${hist}</div></section>`;
  }
  const items=S.series.map((x,i)=>{ const e=PT_BY_ID[x.ex]; if(!e) return "";
    const sug=x.sug||{};
    return `<div class="ses-ex"><div class="ses-head"><b>${esc(e.nom)}</b>${x.plan?`<span class="chip">${esc(ptRxTxt(x.plan,e.uni))}</span>`:`<span class="chip">libre</span>`}</div>
      ${sug.txt?`<div class="hint sug">${sug.ult?`Última vez: ${esc(sug.ult)} · `:""}<b>${esc(sug.txt)}</b></div>`:""}
      <div class="set-grid"><span class="mini-lbl">Serie</span><span class="mini-lbl">${ptEsPC(x.ex)?"kg (opc.)":"kg"}</span><span class="mini-lbl">${e.seg?"seg":"reps"}</span><span class="mini-lbl">RIR</span><span></span>
      ${x.sets.map((t,j)=>`<span class="sn">${j+1}</span>
        <input class="inp" type="number" inputmode="decimal" step="0.5" data-action="pt-set" data-i="${i}" data-j="${j}" data-f="kg" value="${t.kg===""||t.kg==null?"":t.kg}" placeholder="—">
        <input class="inp" type="number" inputmode="numeric" data-action="pt-set" data-i="${i}" data-j="${j}" data-f="reps" value="${t.reps===""||t.reps==null?"":t.reps}" placeholder="${x.plan?(x.plan.lo+"–"+x.plan.hi):""}">
        <input class="inp" type="number" inputmode="numeric" min="0" max="5" data-action="pt-set" data-i="${i}" data-j="${j}" data-f="rir" value="${t.rir===""||t.rir==null?"":t.rir}" placeholder="${x.plan&&x.plan.rir!=null?x.plan.rir:""}">
        <button class="del" data-action="pt-set-del" data-i="${i}" data-j="${j}" aria-label="Quitar serie">✕</button>`).join("")}</div>
      <button class="btn sm ghost" data-action="pt-set-add" data-i="${i}">+ serie</button></div>`; }).join("");
  return `<section class="blk"><div class="blk-head"><div><h2>${esc(S.diaNombre||"Sesión libre")}</h2><p>${fmtCorto(S.fecha)}${S.semana?" · semana "+S.semana+(S.fase?" ("+esc(S.fase)+")":""):""}</p></div><button class="btn sm ghost" data-action="pt-ses-cancel">Cancelar</button></div>
    <div class="ses-list">${items}</div>
    <div class="card"><div class="form-grid g3"><div><label class="mini">Energía (1–5)</label><select class="inp" data-action="pt-ses-f" data-f="energia">${["","1","2","3","4","5"].map(v=>`<option value="${v}" ${String(S.energia||"")===v?"selected":""}>${v||"—"}</option>`).join("")}</select></div>
      <div class="full" style="grid-column:span 2"><label class="mini">Notas (dolor, sueño, cómo se sintió)</label><input class="inp" data-action="pt-ses-f" data-f="nota" value="${esc(S.nota||"")}" placeholder="opcional"></div></div>
      <div class="acts-end"><button class="btn primary" data-action="pt-ses-save">Guardar sesión</button></div></div></section>`;
}
function ptTabProgreso(c){
  const meds=ptMedidasDe(c.id), ses=ptSesionesDe(c.id).slice().reverse(), prs=ptPRs(c.id);
  const exIds=[...new Set(ses.flatMap(s=>s.series.filter(x=>x.sets.some(t=>t.reps>0)).map(x=>x.ex)))];
  if(!PTUI.graf||!exIds.includes(PTUI.graf)) PTUI.graf=exIds[0]||null;
  const e1pts=PTUI.graf?ses.map(s=>{ const x=s.series.find(z=>z.ex===PTUI.graf); const b=x?Math.max(0,...x.sets.map(t=>ptE1rm(t.kg,t.reps))):0; return b>0?{x:s.fecha,y:Math.round(b*10)/10}:null; }).filter(Boolean):[];
  const pesoPts=meds.filter(m=>m.peso).map(m=>({x:m.fecha,y:+m.peso}));
  // volumen semanal (últimas 8 semanas) y adherencia
  const semKeys=[]; for(let i=7;i>=0;i--) semKeys.push(addDays(weekKeyAndLabel(todayStr()).key,-7*i));
  const volSem=semKeys.map(k=>ses.filter(s=>s.fecha>=k&&s.fecha<addDays(k,7)).reduce((a,s)=>a+s.series.reduce((b,x)=>b+x.sets.reduce((z,t)=>z+(t.kg||0)*(t.reps||0),0),0),0));
  const sesSem=semKeys.map(k=>ses.filter(s=>s.fecha>=k&&s.fecha<addDays(k,7)).length), labs=semKeys.map(k=>fmtCorto(k).replace(/ .*/,""));
  const prRows=Object.keys(prs).sort((a,b)=>prs[b].fecha<prs[a].fecha?-1:1).slice(0,10).map(id=>`<div class="row-line"><div><b>${esc(PT_BY_ID[id]?PT_BY_ID[id].nom:id)}</b></div><div class="hint">${prs[id].kg||"—"} kg × ${prs[id].reps} · 1RM est. ${Math.round(prs[id].e1*10)/10} kg · ${fmtCorto(prs[id].fecha)}</div></div>`).join("")||`<p class="hint">Los récords aparecen al registrar sesiones con cargas.</p>`;
  const medRows=meds.slice().reverse().slice(0,10).map(m=>`<div class="row-line"><div><b>${fmtCorto(m.fecha)}</b></div><div class="hint">${[m.peso?m.peso+" kg":"",m.grasa?m.grasa+"% grasa":"",m.cintura?"cintura "+m.cintura:"",m.cadera?"cadera "+m.cadera:"",m.pecho?"pecho "+m.pecho:"",m.brazo?"brazo "+m.brazo:"",m.muslo?"muslo "+m.muslo:""].filter(Boolean).join(" · ")||"—"}</div><button class="del" data-action="pt-med-del" data-id="${m.id}" aria-label="Eliminar medida">✕</button></div>`).join("")||`<p class="hint">Sin medidas registradas.</p>`;
  return `<div class="chart-grid">
    <section class="card"><h3>Peso corporal</h3>${svgLine(pesoPts,"kg","var(--fuerza)")}</section>
    <section class="card"><div class="ch-head"><h3>Fuerza estimada (1RM)</h3>${exIds.length?`<select class="inp w-auto" data-action="pt-graf">${exIds.map(id=>`<option value="${id}" ${id===PTUI.graf?"selected":""}>${esc(PT_BY_ID[id]?PT_BY_ID[id].nom:id)}</option>`).join("")}</select>`:""}</div>${svgLine(e1pts,"kg","var(--accent)")}</section>
    <section class="card"><h3>Volumen por semana (kg)</h3>${svgBars(volSem,labs,v=>v>=1000?Math.round(v/100)/10+"k":Math.round(v),"var(--low)")}</section>
    <section class="card"><h3>Sesiones por semana</h3>${svgBars(sesSem,labs,null,"var(--ok)")}</section></div>
    <section class="blk"><div class="blk-head"><h2>Medidas</h2><button class="btn sm primary" data-action="pt-med-nueva" data-id="${c.id}">+ Registrar medidas</button></div><div class="list-lines">${medRows}</div></section>
    <section class="blk"><div class="blk-head"><h2>Récords personales</h2></div><div class="list-lines">${prRows}</div></section>`;
}
function ptTabPagos(c){
  const pk=PT_D().paquetes.filter(p=>p.clienteId===c.id).sort((a,b)=>a.inicio<b.inicio?1:-1), pg=PT_D().pagos.filter(p=>p.clienteId===c.id).sort((a,b)=>a.fecha<b.fecha?1:-1);
  const total=pg.reduce((s,p)=>s+(p.monto||0),0);
  const pkH=pk.map(p=>{ const rest=p.sesiones?p.sesiones-p.usadas:null; return `<div class="pk-bar"><div class="pk-top"><b>${esc(p.concepto)}</b><span>${p.tipo==="presencial"?p.usadas+"/"+p.sesiones+" sesiones":"plan mensual"}${p.vence?" · vence "+fmtCorto(p.vence):""}</span></div>
    ${p.tipo==="presencial"?`<div class="bar"><i style="width:${Math.min(100,Math.round(p.usadas/p.sesiones*100))}%"></i></div>`:""}<div class="hint">${money(p.monto)}${rest!==null&&rest<=0?" · terminado":""}</div><button class="del" data-action="pt-pk-del" data-id="${p.id}" aria-label="Eliminar paquete">✕</button></div>`; }).join("")||`<p class="hint">Sin paquetes registrados.</p>`;
  const pgH=pg.map(p=>`<div class="row-line"><div><b>${fmtCorto(p.fecha)}</b> · ${esc(p.concepto||"Pago")}</div><div class="hint">${esc(p.metodo||"")}</div><b class="num">${money(p.monto)}</b><button class="del" data-action="pt-pago-del" data-id="${p.id}" aria-label="Eliminar pago">✕</button></div>`).join("")||`<p class="hint">Sin pagos registrados.</p>`;
  return `<section class="blk"><div class="blk-head"><h2>Paquetes y planes</h2><div class="acts"><button class="btn sm" data-action="pt-pk-nuevo" data-id="${c.id}">+ Paquete</button><button class="btn sm" data-action="go-cot" data-id="${c.id}">Nueva cotización</button></div></div>${pkH}</section>
    <section class="blk"><div class="blk-head"><div><h2>Pagos</h2><p>Total recibido de este cliente: <b class="num">${money(total)}</b></p></div><button class="btn sm primary" data-action="pt-pago-nuevo" data-id="${c.id}">+ Registrar pago</button></div><div class="list-lines">${pgH}</div></section>`;
}

/* ---------- textos para enviar ---------- */
function ptProgramaTexto(prog,c,w){
  const wk=w||1, f=ptFase(prog,wk);
  const eq={pc:"peso corporal",man:"mancuernas",barra:"barra",maq:"máquinas",pol:"poleas",banco:"banco",kb:"kettlebell",liga:"liga",cubo:"cajón",dom:"barra fija"};
  let t=`*${prog.nombre}*${c?" — "+c.nombre:""}\n${PT_NIVELES[prog.nivel].nom} · ${PT_OBJETIVOS[prog.objetivo].nom}\n${prog.diasSem} días por semana (${PT_SCHED[prog.diasSem]||""}) · ${prog.semanas} semanas · ≈ ${prog.minutos} min por sesión\nMaterial: ${PT_EQUIPO[prog.equipo].nom}\n\n`;
  prog.dias.forEach(d=>{ t+=`*${d.nombre}*\n`; d.ejercicios.forEach((sl,i)=>{ const e=PT_BY_ID[sl.ex]; if(!e) return; const rx=ptRx(prog,sl,wk);
    t+=`${i+1}. ${e.nom} — ${ptRxTxt(rx,e.uni)}\n   ↳ ${e.cue}${sl.nota?" ("+sl.nota+")":""}\n`; }); t+="\n"; });
  t+=`*Semana ${wk}: ${f.nom}* — ${f.desc}\n\n*Cómo progresar*\n• RIR = repeticiones que te quedan en reserva. RIR 2 = podrías hacer 2 más.\n• Cuando completes todas las series en el tope de repeticiones con técnica limpia, sube la carga la siguiente sesión.\n• Cada 4ª semana es de descarga: menos series, mismo ritmo.\n• Calienta 5–8 min y haz 1–2 series de aproximación en el primer ejercicio.\n• Si algo duele (no molestia muscular), para y avísame.\n`;
  return t;
}
function ptCheckinTexto(c){
  const prog=ptProgActivo(c.id), w=prog?ptSemanaDe(prog,todayStr()):null;
  return `Hola ${c.nombre.split(" ")[0]} 👋 Check-in de la semana${w?" "+w:""}:\n1) ¿Cuántas sesiones hiciste de las ${prog?prog.diasSem:c.dias} planeadas?\n2) ¿Qué ejercicios subieron de peso o repeticiones? (manda kg × reps)\n3) Energía de 1 a 5 y cómo dormiste.\n4) ¿Alguna molestia o dolor?\n5) Tu peso de hoy (en ayunas) y, si quieres, una foto de técnica de tu ejercicio principal.\nCon eso ajusto tu siguiente semana 💪`;
}
function ptPrintHtml(prog,c){
  const f1=ptFase(prog,1);
  const dias=prog.dias.map(d=>`<h3>${esc(d.nombre)}</h3><table><thead><tr><th>#</th><th>Ejercicio</th><th>Series × reps</th><th>RIR</th><th>Desc.</th><th>Semana: kg × reps</th></tr></thead><tbody>
    ${d.ejercicios.map((sl,i)=>{ const e=PT_BY_ID[sl.ex]; if(!e) return ""; const rx=ptRx(prog,sl,1);
      return `<tr><td>${i+1}</td><td><b>${esc(e.nom)}</b><br><span class="sm">${esc(e.cue)}</span></td><td>${rx.sets} × ${rx.seg?rx.lo+"–"+rx.hi+" s":rx.lo+"–"+rx.hi}${e.uni&&!rx.seg?" /lado":""}</td><td>${rx.rir!=null?rx.rir:"—"}</td><td>${rx.rest>=90?Math.round(rx.rest/60*10)/10+" min":rx.rest+" s"}</td><td class="fill"></td></tr>`; }).join("")}</tbody></table>`).join("");
  const fases=Array.from({length:prog.semanas},(_,i)=>{ const f=ptFase(prog,i+1); return `<span class="ph">Sem ${i+1}: ${esc(f.nom)}</span>`; }).join(" ");
  return `<div class="pd"><div class="pd-head"><div><div class="pd-brand">SEBAS FIT</div><h1>${esc(prog.nombre)}</h1><p>${c?"<b>"+esc(c.nombre)+"</b> · ":""}${PT_NIVELES[prog.nivel].nom} · ${esc(PT_OBJETIVOS[prog.objetivo].nom)} · ${prog.diasSem} días/sem · ${prog.semanas} semanas · ≈ ${prog.minutos} min</p></div><div class="pd-date">${fmtCorto(prog.inicio)}</div></div>
    <p class="pd-fases">${fases}</p>${dias}
    <div class="pd-notes"><b>Cómo usar este programa</b><ul><li>RIR = repeticiones en reserva (RIR 2: podrías hacer 2 más).</li><li>Completa todas las series en el tope de reps con técnica limpia → sube la carga la siguiente sesión.</li><li>Cada 4ª semana es de descarga (menos series).</li><li>Calienta 5–8 min. Si hay dolor (no molestia muscular), para y avisa.</li></ul><p class="sm">Semana 1 (${esc(f1.nom)}): ${esc(f1.desc)} Las semanas siguientes ajustan series y RIR automáticamente; anota tus cargas en la columna de la derecha.</p></div></div>`;
}

/* ---------- modales ---------- */
function fv(id){ const el=document.getElementById(id); return el?el.value:""; }
function ptSel(id,opts,cur){ return `<select class="inp" id="${id}">${opts.map(([v,l])=>`<option value="${v}" ${String(cur)===String(v)?"selected":""}>${esc(l)}</option>`).join("")}</select>`; }
function ptModal(md){
  if(md.type==="pt-cliente"){
    const c=md.data, nv=Object.keys(PT_NIVELES).map(k=>[k,PT_NIVELES[k].nom]), ob=Object.keys(PT_OBJETIVOS).map(k=>[k,PT_OBJETIVOS[k].nom]), eq=Object.keys(PT_EQUIPO).map(k=>[k,PT_EQUIPO[k].nom]);
    return modalShell(md.id?"Editar cliente":"Nuevo cliente",`<div class="form-grid">
      <div class="full"><label class="mini">Nombre</label><input class="inp" id="pc-nombre" value="${esc(c.nombre)}" placeholder="Nombre y apellido"></div>
      <div><label class="mini">Teléfono / WhatsApp</label><input class="inp" id="pc-tel" value="${esc(c.tel||"")}" inputmode="tel"></div>
      <div><label class="mini">Correo</label><input class="inp" id="pc-email" value="${esc(c.email||"")}" inputmode="email"></div>
      <div><label class="mini">Nivel</label>${ptSel("pc-nivel",nv,c.nivel)}</div>
      <div><label class="mini">Objetivo</label>${ptSel("pc-objetivo",ob,c.objetivo)}</div>
      <div><label class="mini">Modalidad</label>${ptSel("pc-modalidad",[["presencial","Presencial"],["remoto","Rutina mandada (a distancia)"]],c.modalidad)}</div>
      <div><label class="mini">Dónde entrena</label>${ptSel("pc-equipo",eq,c.equipo)}</div>
      <div><label class="mini">Días por semana</label>${ptSel("pc-dias",[2,3,4,5,6].map(n=>[n,n+" días"]),c.dias)}</div>
      <div><label class="mini">Inicio</label><input class="inp" type="date" id="pc-inicio" value="${c.inicio||todayStr()}"></div>
      ${ptFichaCampos(c)}
      <div class="full"><label class="mini">Lesiones o molestias (el generador evita esos ejercicios)</label><div class="chk-row">${PT_ZONAS.map(([k,l])=>`<label class="fb-check"><input type="checkbox" id="pc-z-${k}" ${(c.lesiones||[]).includes(k)?"checked":""}>${l}</label>`).join("")}</div></div>
      ${md.id?`<div class="full"><label class="mini">Estado</label>${ptSel("pc-estado",[["activo","Activo"],["pausa","En pausa"],["archivado","Archivado"]],c.estado)}</div>`:""}
      <div class="full"><label class="mini">Notas (historial, metas, horarios)</label><textarea class="inp" id="pc-notas" rows="3">${esc(c.notas||"")}</textarea></div></div>`,
      `<button class="btn ghost" data-action="close-modal">Cancelar</button><button class="btn primary" data-action="pt-cliente-save">Guardar</button>`);
  }
  if(md.type==="pt-gen"){
    const g=md.data, nv=Object.keys(PT_NIVELES).map(k=>[k,PT_NIVELES[k].nom+" — "+PT_NIVELES[k].desc]), ob=Object.keys(PT_OBJETIVOS).map(k=>[k,PT_OBJETIVOS[k].nom+" — "+PT_OBJETIVOS[k].desc]), eq=Object.keys(PT_EQUIPO).map(k=>[k,PT_EQUIPO[k].nom]);
    return modalShell("Generar programa",`<div class="form-grid">
      <div class="full"><label class="mini">Nivel</label>${ptSel("pg-nivel",nv,g.nivel)}</div>
      <div class="full"><label class="mini">Objetivo</label>${ptSel("pg-objetivo",ob,g.objetivo)}</div>
      <div><label class="mini">Días por semana</label>${ptSel("pg-dias",[2,3,4,5,6].map(n=>[n,n+" días"]),g.dias)}</div>
      <div><label class="mini">Duración del programa</label>${ptSel("pg-semanas",[4,6,8,12].map(n=>[n,n+" semanas"]),g.semanas)}</div>
      <div><label class="mini">Tiempo por sesión</label>${ptSel("pg-min",[45,60,75].map(n=>[n,n+" min"]),g.minutos)}</div>
      <div><label class="mini">Material</label>${ptSel("pg-equipo",eq,g.equipo)}</div>
      <div class="full"><label class="mini">Evitar por lesión</label><div class="chk-row">${PT_ZONAS.map(([k,l])=>`<label class="fb-check"><input type="checkbox" id="pg-z-${k}" ${(g.lesiones||[]).includes(k)?"checked":""}>${l}</label>`).join("")}</div></div></div>
      <p class="hint" style="margin-top:12px">El programa nuevo reemplaza al activo (queda archivado). Básico: máx. 4 días. Avanzado: mín. 3.</p>`,
      `<button class="btn ghost" data-action="close-modal">Cancelar</button><button class="btn primary" data-action="pt-gen-ok">Generar</button>`);
  }
  if(md.type==="pt-medida"){
    const m=md.data; const f=(id,l,v)=>`<div><label class="mini">${l}</label><input class="inp" id="${id}" type="number" inputmode="decimal" step="0.1" value="${v||""}"></div>`;
    return modalShell("Registrar medidas",`<div class="form-grid g3"><div class="full" style="grid-column:1/-1"><label class="mini">Fecha</label><input class="inp" type="date" id="pm-fecha" value="${m.fecha}"></div>
      ${f("pm-peso","Peso (kg)",m.peso)}${f("pm-grasa","% grasa",m.grasa)}${f("pm-cintura","Cintura (cm)",m.cintura)}${f("pm-cadera","Cadera (cm)",m.cadera)}${f("pm-pecho","Pecho (cm)",m.pecho)}${f("pm-brazo","Brazo (cm)",m.brazo)}${f("pm-muslo","Muslo (cm)",m.muslo)}</div>`,
      `<button class="btn ghost" data-action="close-modal">Cancelar</button><button class="btn primary" data-action="pt-med-save">Guardar</button>`);
  }
  if(md.type==="pt-pago"){
    const p=md.data;
    return modalShell("Registrar pago",`<div class="form-grid"><div><label class="mini">Monto (MXN)</label><input class="inp" type="number" id="pp-monto" inputmode="decimal" value="${p.monto||""}"></div>
      <div><label class="mini">Fecha</label><input class="inp" type="date" id="pp-fecha" value="${p.fecha}"></div>
      <div class="full"><label class="mini">Concepto</label><input class="inp" id="pp-concepto" value="${esc(p.concepto||"")}" placeholder="ej. Anticipo paquete 8 sesiones"></div>
      <div class="full"><label class="mini">Método</label>${ptSel("pp-metodo",["Transferencia","Efectivo","Tarjeta","Otro"].map(x=>[x,x]),p.metodo)}</div></div>`,
      `<button class="btn ghost" data-action="close-modal">Cancelar</button><button class="btn primary" data-action="pt-pago-save">Guardar</button>`);
  }
  if(md.type==="pt-paquete"){
    const p=md.data;
    return modalShell("Nuevo paquete",`<div class="form-grid"><div class="full"><label class="mini">Concepto</label><input class="inp" id="pk-concepto" value="${esc(p.concepto||"")}" placeholder="ej. Paquete 8 sesiones"></div>
      <div><label class="mini">Sesiones</label><input class="inp" type="number" id="pk-sesiones" value="${p.sesiones||8}"></div>
      <div><label class="mini">Monto (MXN)</label><input class="inp" type="number" id="pk-monto" inputmode="decimal" value="${p.monto||""}"></div>
      <div><label class="mini">Inicio</label><input class="inp" type="date" id="pk-inicio" value="${p.inicio}"></div>
      <div><label class="mini">Vence</label><input class="inp" type="date" id="pk-vence" value="${p.vence||""}"></div></div>`,
      `<button class="btn ghost" data-action="close-modal">Cancelar</button><button class="btn primary" data-action="pt-pk-save">Guardar</button>`);
  }
  if(md.type==="pt-swap"||md.type==="pt-add"){
    const prog=PT_D().programas.find(p=>p.id===md.prog), c=ptCliente(prog.clienteId), d=prog.dias.find(x=>x.id===md.d);
    const nivelN=PT_NIVELES[prog.nivel].n, have=new Set(d.ejercicios.map(s=>s.ex));
    let pool, cur=null;
    if(md.type==="pt-swap"){ const sl=d.ejercicios.find(s=>s.uid===md.u); cur=PT_BY_ID[sl.ex]; pool=ptDisponibles(prog.equipo,nivelN,prog.lesiones).filter(e=>e.p===cur.p&&e.id!==cur.id); }
    else pool=ptDisponibles(prog.equipo,nivelN,prog.lesiones).filter(e=>e.p===PTUI.addPat);
    const head=md.type==="pt-add"?`<div style="margin-bottom:10px"><label class="mini">Patrón de movimiento</label><select class="inp" data-action="pt-addpat">${Object.keys(PT_PATRONES).map(k=>`<option value="${k}" ${k===PTUI.addPat?"selected":""}>${PT_PATRONES[k]}</option>`).join("")}</select></div>`:"";
    return modalShell(md.type==="pt-swap"?"Cambiar "+cur.nom:"Añadir ejercicio",`${head}<div class="picker">${pool.map(e=>`<button data-action="${md.type==="pt-swap"?"pt-swap-ok":"pt-add-ok"}" data-ex="${e.id}" ${have.has(e.id)?'disabled style="opacity:.4"':""}><span class="pn">${esc(e.nom)}${have.has(e.id)?" · ya incluido":""}</span><span class="pm">${PT_MUSC_NOM[e.m]} · nivel ${PT_NIVELES[["","basico","intermedio","avanzado"][e.n]].nom} · ${esc(e.cue)}</span></button>`).join("")||`<p class="hint">No hay más opciones con este material, nivel y lesiones.</p>`}</div>`,
      `<button class="btn ghost" data-action="close-modal">Cerrar</button>`);
  }
  return "";
}

/* ---------- acciones ---------- */
function ptOpen(id){ PTUI.cid=id; PTUI.tab="resumen"; PTUI.sem=null; PTUI.ses=null; state.screen="cliente"; render(); window.scrollTo(0,0); }
function ptClienteNuevo(){ return {nombre:"",tel:"",email:"",nivel:"basico",objetivo:"hipertrofia",modalidad:"presencial",equipo:"gym",dias:3,lesiones:[],notas:"",inicio:todayStr(),estado:"activo",sexo:"",estatura:"",peso0:"",grasa0:"",metaTexto:"",metaPeso:"",metaGrasa:""}; }
function ptClienteDesdeForm(base){
  const c=Object.assign({},base);
  c.nombre=fv("pc-nombre").trim(); c.tel=fv("pc-tel").trim(); c.email=fv("pc-email").trim(); c.nivel=fv("pc-nivel"); c.objetivo=fv("pc-objetivo");
  c.modalidad=fv("pc-modalidad"); c.equipo=fv("pc-equipo"); c.dias=+fv("pc-dias")||3; c.inicio=fv("pc-inicio")||todayStr(); c.notas=fv("pc-notas");
  c.lesiones=PT_ZONAS.filter(([k])=>{ const el=document.getElementById("pc-z-"+k); return el&&el.checked; }).map(([k])=>k);
  if(document.getElementById("pc-estado")) c.estado=fv("pc-estado");
  return c;
}
function ptNuevaSesion(c,diaId,fecha){
  const prog=ptProgActivo(c.id), dia=prog&&prog.dias.find(d=>d.id===diaId), semana=prog?ptSemanaDe(prog,fecha):null, S={clienteId:c.id,progId:prog?prog.id:null,diaId:dia?dia.id:null,diaNombre:dia?dia.nombre:null,fecha,semana,fase:null,energia:"",nota:"",series:[]};
  if(dia){ S.fase=ptFase(prog,semana).nom;
    dia.ejercicios.forEach(sl=>{ const rx=ptRx(prog,sl,semana), sug=ptSugerir(c.id,sl.ex,rx);
      S.series.push({ex:sl.ex,plan:rx,sug,sets:Array.from({length:rx.sets},()=>({kg:sug.kg==null?"":sug.kg,reps:"",rir:""}))}); }); }
  return S;
}
function ptGuardarSesion(){
  const S=PTUI.ses, c=ptCliente(S.clienteId), D=PT_D();
  const series=S.series.map(x=>({ex:x.ex,sets:x.sets.map(t=>({kg:t.kg===""?null:+t.kg,reps:t.reps===""?0:+t.reps,rir:t.rir===""?null:+t.rir})).filter(t=>t.reps>0||t.kg)})).filter(x=>x.sets.length);
  if(!series.some(x=>x.sets.some(t=>t.reps>0))){ toast("Anota al menos una serie con repeticiones"); return; }
  // récords: mejor 1RM estimado contra lo anterior
  const prev=ptPRs(c.id), prs=[];
  series.forEach(x=>{ const b=Math.max(0,...x.sets.map(t=>ptE1rm(t.kg,t.reps))); if(b>0&&prev[x.ex]&&b>prev[x.ex].e1*1.001) prs.push(x.ex); });
  const ses={id:newId("s"),clienteId:c.id,progId:S.progId,diaId:S.diaId,diaNombre:S.diaNombre,fecha:S.fecha,semana:S.semana,energia:S.energia?+S.energia:null,nota:S.nota||"",completada:true,series,prs,creado:nowISO()};
  const pk=c.modalidad==="presencial"?ptPaqueteActivo(c.id):null; if(pk){ pk.usadas++; ses.paqueteId=pk.id; }
  D.sesiones.push(ses); touch(); PTUI.ses=null; render();
  toast(prs.length?"🏆 Sesión guardada · récord en "+prs.map(id=>PT_BY_ID[id].nom).slice(0,2).join(", "):"Sesión guardada"+(pk?" · quedan "+(pk.sesiones-pk.usadas)+" del paquete":""));
}
function ptSwapEx(progId,diaId,uid,exId){
  { const _p=PT_D().programas.find(p=>p.id===progId), _d=_p&&_p.dias.find(x=>x.id===diaId), _o=_d&&_d.ejercicios.find(s=>s.uid===uid); if(_o){ aprPT("evita",_o.ex); aprPT("afin",exId); } }
  const prog=PT_D().programas.find(p=>p.id===progId), d=prog.dias.find(x=>x.id===diaId), i=d.ejercicios.findIndex(s=>s.uid===uid), old=d.ejercicios[i], e=PT_BY_ID[exId];
  const tmp=ptSlot(e,old.rol,{nivel:prog.nivel,objetivo:prog.objetivo});
  d.ejercicios[i]=Object.assign(tmp,{uid:old.uid,nota:old.nota});   // conserva la posición; la prescripción se ajusta al ejercicio nuevo
  touch();
}
function ptClick(a,t,ev){
  const D=PT_D();
  if(ptClick2(a,t)) return true;
  if(a==="pt-open"){ ptOpen(t.dataset.id); return true; }
  if(a==="pt-back"){ PTUI.cid=null; PTUI.ses=null; state.screen="clientes"; render(); return true; }
  if(a==="pt-filtro"){ PTUI.filtro=t.dataset.v; render(); return true; }
  if(a==="pt-tab"){ PTUI.tab=t.dataset.v; render(); return true; }
  if(a==="pt-nuevo"){ state.modal={type:"pt-cliente",data:ptClienteNuevo()}; renderOverlay(); return true; }
  if(a==="pt-editar"){ const c=ptCliente(t.dataset.id); state.modal={type:"pt-cliente",id:c.id,data:clone(c)}; renderOverlay(); return true; }
  if(a==="pt-cliente-save"){
    const md=state.modal, c=ptClienteDesdeForm(md.data); if(!c.nombre){ toast("Escribe el nombre"); return true; }
    if(md.id){ const i=D.clientes.findIndex(x=>x.id===md.id); D.clientes[i]=Object.assign(D.clientes[i],c); touch(); closeModal(); render(); }
    else { c.id=newId("c"); c.creado=nowISO(); D.clientes.push(c); touch(); closeModal(); ptOpen(c.id); }
    return true; }
  if(a==="pt-gen"){
    const c=ptCliente(t.dataset.id);
    state.modal={type:"pt-gen",clienteId:c.id,data:{nivel:c.nivel,objetivo:c.objetivo,dias:c.dias,semanas:8,minutos:60,equipo:c.equipo,lesiones:c.lesiones||[]}}; renderOverlay(); return true; }
  if(a==="pt-gen-ok"){
    const md=state.modal, c=ptCliente(md.clienteId);
    const cfg={clienteId:c.id,nivel:fv("pg-nivel"),objetivo:fv("pg-objetivo"),dias:+fv("pg-dias"),semanas:+fv("pg-semanas"),minutos:+fv("pg-min"),equipo:fv("pg-equipo"),
      lesiones:PT_ZONAS.filter(([k])=>document.getElementById("pg-z-"+k).checked).map(([k])=>k)};
    D.programas.forEach(p=>{ if(p.clienteId===c.id) p.activo=false; });
    const prog=ptGenerar(cfg); prog.nombre=PT_OBJETIVOS[cfg.objetivo].nom+" · "+PT_NIVELES[cfg.nivel].nom+" · "+c.nombre.split(" ")[0];
    D.programas.push(prog); touch(); PTUI.tab="programa"; PTUI.sem=1; closeModal(); render(); toast("Programa generado"); return true; }
  if(a==="pt-sem"){ PTUI.sem=Math.max(1,PTUI.sem+Number(t.dataset.d)); render(); return true; }
  if(a==="pt-move"){
    const prog=ptProgDe(t), d=prog.dias.find(x=>x.id===t.dataset.d), i=d.ejercicios.findIndex(s=>s.uid===t.dataset.u), j=i+Number(t.dataset.dir);
    if(j>=0&&j<d.ejercicios.length){ [d.ejercicios[i],d.ejercicios[j]]=[d.ejercicios[j],d.ejercicios[i]]; touch(); render(); } return true; }
  if(a==="pt-del-ex"){
    const prog=ptProgDe(t), d=prog.dias.find(x=>x.id===t.dataset.d), i=d.ejercicios.findIndex(s=>s.uid===t.dataset.u); if(i<0) return true;
    const [sl]=d.ejercicios.splice(i,1); aprPT("evita",sl.ex); touch(); render(); toastUndo("Ejercicio quitado",()=>{ d.ejercicios.splice(Math.min(i,d.ejercicios.length),0,sl); touch(); render(); }); return true; }
  if(a==="pt-swap"){ const prog=ptProgDe(t); state.modal={type:"pt-swap",prog:prog.id,d:t.dataset.d,u:t.dataset.u}; renderOverlay(); return true; }
  if(a==="pt-swap-ok"){ const md=state.modal; ptSwapEx(md.prog,md.d,md.u,t.dataset.ex); closeModal(); render(); return true; }
  if(a==="pt-add-ex"){ const prog=ptProgDe(t); state.modal={type:"pt-add",prog:prog.id,d:t.dataset.d}; renderOverlay(); return true; }
  if(a==="pt-add-ok"){
    const md=state.modal, prog=D.programas.find(p=>p.id===md.prog), d=prog.dias.find(x=>x.id===md.d), e=PT_BY_ID[t.dataset.ex];
    d.ejercicios.push(ptSlot(e,e.t==="c"?"acc":"iso",{nivel:prog.nivel,objetivo:prog.objetivo})); aprPT("afin",e.id); touch(); closeModal(); render(); return true; }
  if(a==="pt-copiar-prog"){ const prog=D.programas.find(p=>p.id===t.dataset.id); const txt=ptProgramaTexto(prog,ptCliente(prog.clienteId),PTUI.sem||1);
    (navigator.clipboard?navigator.clipboard.writeText(txt):Promise.reject()).then(()=>toast("Programa copiado — pégalo en WhatsApp"),()=>toast("No se pudo copiar")); return true; }
  if(a==="pt-copiar-checkin"){ const c=ptCliente(t.dataset.id); (navigator.clipboard?navigator.clipboard.writeText(ptCheckinTexto(c)):Promise.reject()).then(()=>toast("Mensaje copiado"),()=>toast("No se pudo copiar")); return true; }
  if(a==="pt-print-prog"){ const prog=D.programas.find(p=>p.id===t.dataset.id); printDoc(ptPrintHtml(prog,ptCliente(prog.clienteId))); return true; }
  if(a==="pt-ir-sesion"){ PTUI.tab="sesion"; PTUI.ses=null; PTUI.diaSel=t.dataset.d||null; render(); window.scrollTo(0,0); return true; }
  if(a==="pt-ses-start"){
    const c=ptCliente(PTUI.cid); PTUI.diaSel=fv("ps-dia")||null; PTUI.ses=ptNuevaSesion(c,PTUI.diaSel,fv("ps-fecha")||todayStr());
    if(!PTUI.ses.series.length){ // sesión libre: parte con un ejercicio a elegir
      const prog=ptProgActivo(c.id); if(prog&&prog.dias[0]){ /* nada: se añaden con + ejercicio */ } }
    render(); return true; }
  if(a==="pt-ses-cancel"){ PTUI.ses=null; render(); return true; }
  if(a==="pt-ses-save"){ ptGuardarSesion(); return true; }
  if(a==="pt-set-add"){ const x=PTUI.ses.series[+t.dataset.i], last=x.sets[x.sets.length-1]||{kg:"",reps:"",rir:""}; x.sets.push({kg:last.kg,reps:"",rir:""}); render(); return true; }
  if(a==="pt-set-del"){ const x=PTUI.ses.series[+t.dataset.i]; x.sets.splice(+t.dataset.j,1); render(); return true; }
  if(a==="pt-ses-del"){ const L=D.sesiones, i=L.findIndex(s=>s.id===t.dataset.id); if(i<0) return true; const [s]=L.splice(i,1);
    let pk=null; if(s.paqueteId){ pk=D.paquetes.find(p=>p.id===s.paqueteId); if(pk&&pk.usadas>0) pk.usadas--; } touch(); render();
    toastUndo("Sesión eliminada",()=>{ L.splice(Math.min(i,L.length),0,s); if(pk) pk.usadas++; touch(); render(); }); return true; }
  if(a==="pt-med-nueva"){ state.modal={type:"pt-medida",clienteId:t.dataset.id,data:{fecha:todayStr()}}; renderOverlay(); return true; }
  if(a==="pt-med-save"){
    const md=state.modal, n=id=>fv(id)===""?null:+fv(id), m={id:newId("m"),clienteId:md.clienteId,fecha:fv("pm-fecha")||todayStr(),peso:n("pm-peso"),grasa:n("pm-grasa"),cintura:n("pm-cintura"),cadera:n("pm-cadera"),pecho:n("pm-pecho"),brazo:n("pm-brazo"),muslo:n("pm-muslo")};
    if(![m.peso,m.grasa,m.cintura,m.cadera,m.pecho,m.brazo,m.muslo].some(v=>v!=null)){ toast("Anota al menos una medida"); return true; }
    D.medidas.push(m); touch(); closeModal(); render(); return true; }
  if(a==="pt-med-del"){ const L=D.medidas, i=L.findIndex(x=>x.id===t.dataset.id); if(i<0) return true; const [m]=L.splice(i,1); touch(); render(); toastUndo("Medida eliminada",()=>{ L.splice(Math.min(i,L.length),0,m); touch(); render(); }); return true; }
  if(a==="pt-pago-nuevo"){ state.modal={type:"pt-pago",clienteId:t.dataset.id,data:{fecha:todayStr(),metodo:"Transferencia"}}; renderOverlay(); return true; }
  if(a==="pt-pago-save"){
    const md=state.modal, monto=+fv("pp-monto"); if(!(monto>0)){ toast("Escribe el monto"); return true; }
    D.pagos.push({id:newId("p"),clienteId:md.clienteId,fecha:fv("pp-fecha")||todayStr(),monto,concepto:fv("pp-concepto").trim(),metodo:fv("pp-metodo")}); touch(); closeModal(); render(); return true; }
  if(a==="pt-pago-del"){ const L=D.pagos, i=L.findIndex(x=>x.id===t.dataset.id); if(i<0) return true; const [p]=L.splice(i,1); touch(); render(); toastUndo("Pago eliminado",()=>{ L.splice(Math.min(i,L.length),0,p); touch(); render(); }); return true; }
  if(a==="pt-pk-nuevo"){ state.modal={type:"pt-paquete",clienteId:t.dataset.id,data:{inicio:todayStr(),sesiones:8}}; renderOverlay(); return true; }
  if(a==="pt-pk-save"){
    const md=state.modal, n=+fv("pk-sesiones"); if(!(n>0)){ toast("Indica las sesiones"); return true; }
    D.paquetes.push({id:newId("k"),clienteId:md.clienteId,tipo:"presencial",concepto:fv("pk-concepto").trim()||("Paquete "+n+" sesiones"),sesiones:n,usadas:0,inicio:fv("pk-inicio")||todayStr(),vence:fv("pk-vence")||null,monto:+fv("pk-monto")||0}); touch(); closeModal(); render(); return true; }
  if(a==="pt-pk-del"){ const L=D.paquetes, i=L.findIndex(x=>x.id===t.dataset.id); if(i<0) return true; const [p]=L.splice(i,1); touch(); render(); toastUndo("Paquete eliminado",()=>{ L.splice(Math.min(i,L.length),0,p); touch(); render(); }); return true; }
  return false;
}
function ptInput(a,t){
  if(a==="pt-set"){ const x=PTUI.ses.series[+t.dataset.i]; if(x) x.sets[+t.dataset.j][t.dataset.f]=t.value; return true; }
  if(a==="pt-ses-f"&&t.tagName==="INPUT"){ PTUI.ses[t.dataset.f]=t.value; return true; }
  return false;
}
function ptChange(a,t){
  if(a==="pt-ses-f"){ PTUI.ses[t.dataset.f]=t.value; return true; }
  if(a==="pt-graf"){ PTUI.graf=t.value; render(); return true; }
  if(a==="pt-addpat"){ PTUI.addPat=t.value; renderOverlay(); return true; }
  return false;
}
