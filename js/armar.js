"use strict";
/* ============================================================
   ARMAR CLASE · tú escribes los ejercicios, la app propone cuáles pueden seguir
   - Entiende lo que escribes (bloque, posición, material, conteo) aunque no esté en la biblioteca.
   - Sugiere: capas de la misma estación (hold → pulsos → liga → a la falla), estaciones completas
     del bloque, y el siguiente bloque. Funciona con ejercicios propios que se guardan.
   - También mejora el "+ Añadir" de cualquier rutina (Sculpt, Fuerza y Barre).
   ============================================================ */
const ARM_ORDEN=["up","leg","glu","abs","reto","cierre"];
const ARM_NOM={up:"Tren superior",leg:"Pierna",glu:"Glúteo",abs:"Abs",plk:"Planchas",reto:"Reto final",cierre:"Cierre",libre:"Libre"};
const ARM_EQ_DEF={up:"mancuernas",leg:"liga",glu:"polainas",abs:"mancuernas",plk:"peso corporal",reto:"peso corporal",cierre:"peso corporal",libre:"peso corporal"};
const ARM_UP_PASOS=[["up_ent","Entrada a plancha"],["up_pl","Trabajo en plancha"],["up_hold","Hold de plancha"],["up_reg","Regreso a pie"]];
let ARM={sug:[],cache:{}};

/* ---------- ejercicios propios (se guardan en la bóveda y se registran al abrir) ---------- */
function armCustomList(){ if(!Vault.data) return []; return Vault.data.sf.custom||(Vault.data.sf.custom=[]); }
function armRegistrar(e){ if(!byId[e.id]){ LIB.push(e); byId[e.id]=e; } return byId[e.id]; }
function armRegistrarCustom(){ armCustomList().forEach(c=>armRegistrar(Object.assign({b:"st",comp:0,tempo:null,lado:false},c))); }
function armHash(s){ let h=5381; for(let i=0;i<s.length;i++) h=((h<<5)+h+s.charCodeAt(i))|0; return Math.abs(h).toString(36); }
function armCrearCustom(a){
  // a: {nom, blk, f, eq, q, cue}
  const q=a.q||{t:"reps",n:8}, id="cu_"+armHash(a.nom.toLowerCase()+"|"+q.t);
  if(byId[id]) return byId[id];
  const e={id,b:"st",blk:a.blk||"libre",anchor:"cu_"+id,layer:"x",nom:a.nom,eq:a.eq||"peso corporal",pat:q.t==="hold"||q.t==="falla"?"iso":q.t==="pulsos"?"pulsos":"reps",
    tempo:null,lado:false,f:a.f==null?0:a.f,comp:0,cue:a.cue||"Ejercicio propio.",q:{t:q.t,n:q.n,s:q.s,f:q.f},tr:"",custom:1};
  const list=armCustomList(); if(!list.some(x=>x.id===id)){ list.push(clone(e)); touch(); }
  return armRegistrar(e);
}

/* ---------- entender lo que escribes ---------- */
function armNorm(s){ return String(s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,""); }
const ARM_STOP=new Set(["con","de","del","la","el","los","las","en","a","al","y","un","una","por","para","hasta","sobre","tu","se","lo"]);
function armTokens(s){ return armNorm(s).replace(/[^a-z0-9 ]/g," ").split(/\s+/).filter(t=>t.length>=3&&!ARM_STOP.has(t)).map(t=>t.replace(/(es|s)$/,"")); }
function armClasificar(txt,bkActivo){
  const t=armNorm(txt), has=re=>re.test(t);
  let q;
  const seg=t.match(/(\d+)\s*(seg|segundos|s\b)/), pul=t.match(/(\d+)\s*pulsos?/)||t.match(/pulsos?\s*(?:x|de)?\s*(\d+)/), rep=t.match(/(?:x|por)\s*(\d+)\b/)||t.match(/(\d+)\s*(reps?|repeticiones|veces)/);
  if(has(/a la falla|hasta la falla|falla\b/)) q={t:"falla"};
  else if(has(/\bhold\b|isometri|sosten|aguant|mantien/)) q={t:"hold",s:seg?+seg[1]:30};
  else if(has(/pulso/)) q={t:"pulsos",n:pul?+pul[1]:25};
  else if(seg) q={t:"hold",s:+seg[1]};
  else q={t:"reps",n:rep?+rep[1]:8};
  const reglas=[
    ["abs",/abdom|\babs\b|crunch|russian|twist|hollow|hueco|dead bug|bicicleta|toe touch|sit.?up|elevacion de piernas|tijeras|plancha lateral|bote|v.?sit|core/],
    ["glu",/gluteo|donkey|clamshell|almeja|hydrant|patada|puente|frog|abduccion|lateral de pierna/],
    ["leg",/sentadilla|zancada|silla|sumo|goblet|bulgara|peso muerto|rumano|puntas|talones|wall sit|pared|curtsy|estocada|cuadricep|isquio|pierna/],
    ["up",/curl|press|remo|lateral|frontal|apertura|triceps|biceps|hombro|flexion|lagartija|plancha|pajaros|pecho|espalda|brazo|mancuerna/],
  ];
  const hits=reglas.filter(([k,re])=>re.test(t)).map(r=>r[0]);
  let blk=hits.includes(bkActivo)?bkActivo:(hits[0]||bkActivo||"libre");
  if(/hollow|hueco|a la falla/.test(t)&&/hollow|hueco|bote|plancha/.test(t)&&bkActivo==="reto") blk="reto";
  let f=0;
  if(has(/plancha|cuatro puntos|gateo|cuadrupedia|donkey|hydrant|bird dog/)) f=1;
  if(has(/acostad|piso|\bmat\b|puente|crunch|sit.?up|hollow|hueco|clamshell|almeja|dead bug|bicicleta|tijeras|elevacion de piernas|russian|toe|frog|de lado/)) f=2;
  if(has(/plancha/)&&!has(/lateral/)) f=1;
  let eq=ARM_EQ_DEF[blk]||"peso corporal";
  if(has(/liga|banda/)) eq="liga"; else if(has(/mancuerna|pesa/)) eq="mancuernas"; else if(has(/polaina|tobillera/)) eq="polainas"; else if(has(/silla|cubo|banco|step/)) eq="cubo"; else if(has(/pelota/)) eq="pelota";
  else if(blk==="glu"&&!has(/liga|polaina/)) eq=has(/puente|frog|clamshell/)?"peso corporal":"polainas";
  return {q,blk,f,eq,hits};
}
/* mejor coincidencia en la biblioteca (pasos de estación, ejercicios propios y biblioteca clásica) */
function armBuscar(txt,bk,max){
  const tk=armTokens(txt); if(!tk.length) return [];
  const out=[];
  LIB.forEach(e=>{
    if(e.b==="prep"||e.b==="cool"||e.b==="cardio") return;
    const et=armTokens(e.nom); if(!et.length) return;
    const inter=tk.filter(x=>et.some(y=>y===x||(x.length>=4&&(y.startsWith(x)||x.startsWith(y))))).length;
    if(!inter) return;
    let sc=inter/Math.max(tk.length,1)*0.6+inter/et.length*0.4;
    if(armTokens(e.nom).join(" ").includes(tk.join(" "))) sc+=0.5;   // el texto completo está dentro del nombre
    if(bk&&e.blk===bk) sc+=0.12; if(e.b==="st") sc+=(e.layer==="entrada"?0.25:0.05);   // las estaciones traen sus capas
    if(e.b!=="st"&&e.b!=="prep") sc-=0.02;
    out.push({e,sc});
  });
  return out.sort((a,b)=>b.sc-a.sc).slice(0,max||8);
}

/* ---------- el borrador de la clase ---------- */
function armEstado(){
  let b=LS.get("sf_armar",null);
  if(!b||!Array.isArray(b.blocks)){ b={nombre:"",dif:"media",base:8,blocks:[],active:null,q:"",chain:null,calent:true,cierre:true,reto:true}; }
  return b;
}
function armGuardar(){ LS.set("sf_armar",ARMS); }
let ARMS=null;
function armInit(){ if(!ARMS) ARMS=armEstado(); }
function armBloque(id){ return ARMS.blocks.find(b=>b.id===id); }
function armActivo(){ return ARMS.blocks.find(b=>b.id===ARMS.active)||ARMS.blocks[ARMS.blocks.length-1]||null; }
function armNuevoBloque(bk){
  const b={id:rid(),bk,steps:[]}; ARMS.blocks.push(b); ARMS.active=b.id; ARMS.chain=null; return b;
}
/* un paso del borrador: referencia a un ejercicio + cantidad ya resuelta */
function armPaso(entry,side){
  const q=entry.q?estQ(entry.q,ARMS.base,ARMS.dif):null;
  return {uid:uid(),ref:entry.id,q,side:side||null,eq:entry.eq,nota:"",tr:entry.tr||""};
}
function armAgregarEntrada(b,entry,side,esLadder){
  b.steps.push(armPaso(entry,side));
  if(!esLadder){
    const isLayer=entry.anchor&&EST_ANCHORS[entry.anchor]&&entry.layer!=="x";
    ARMS.chain=isLayer?{anchor:entry.anchor}:{base:armLimpiar(entry.nom),blk:b.bk,f:entry.f||0,eq:entry.eq,q:(entry.q&&entry.q.t)||"reps"};
  }
}
function armLimpiar(nom){
  return String(nom).replace(/\(.*?\)/g,"").replace(/\bx\s*\d+\b/gi,"").replace(/\b\d+\s*(reps?|pulsos|seg|segundos|s)\b/gi,"").replace(/^(hold|pulsos?|isometr[ií]a)( \w+)?( en| de| del)?\s*/i,"").replace(/\s+/g," ").trim().replace(/[:,.]$/,"");
}

/* ---------- sugerencias ---------- */
function armSugerir(b){
  const out=[]; const add=(g,o)=>{ if(out.filter(x=>x.g===g).length<7) out.push(Object.assign({g},o)); };
  const steps=b?b.steps:[], last=steps[steps.length-1], e=last?byId[last.ref]:null, chain=ARMS.chain;
  const usadas=new Set(ARMS.blocks.flatMap(x=>x.steps.map(s=>(byId[s.ref]||{}).anchor)));
  if(!b) return out;
  // 1) misma estación (capas)
  if(e&&chain&&chain.anchor&&EST_ANCHORS[chain.anchor]){
    const A=EST_ANCHORS[chain.anchor], L=A.layers.map(i=>byId[i]);
    const idx=L.findIndex(x=>x.id===e.id);
    if(A.lados){
      const sideAct=last.side||"A", sinLado=steps.filter(s=>(byId[s.ref]||{}).anchor===A.id&&(s.side||"A")===sideAct).length;
      if(sinLado<L.length){ const nx=L[sinLado]; if(nx) add("misma",{label:nx.nom,sub:"capa "+(sinLado+1)+" · Lado "+sideAct,kind:"lib",ref:nx.id,side:sideAct}); }
      else if(sideAct==="A") add("misma",{label:"Repetir la estación en Lado B",sub:L.length+" pasos",kind:"ladoB",anchor:A.id});
    } else if(idx>=0){ L.slice(idx+1).slice(0,3).forEach(nx=>add("misma",{label:nx.nom,sub:"siguiente capa",kind:"lib",ref:nx.id})); }
  } else if(e&&chain&&chain.base){
    const base=chain.base, kind=(last.q&&last.q.t)||"reps", blk=chain.blk||b.bk, f=chain.f||0;
    const esPierna=blk==="leg"||blk==="glu";
    const ladder={reps:["hold","pulsos","liga","falla"],hold:["pulsos","liga","falla"],pulsos:["liga","falla"],falla:[]}[kind]||["hold","pulsos","falla"];
    const hecho=new Set(steps.map(s=>(s.q||{}).t+"|"+(byId[s.ref]||{}).nom));
    ladder.forEach(k=>{
      if(k==="liga"&&!esPierna) return;
      const m={hold:{nom:"Hold en "+base,q:{t:"hold",s:30},cue:"Mantén la posición, respira constante."},
        pulsos:{nom:"Pulsos pequeños en "+base,q:{t:"pulsos",f:3},cue:"Rango corto con tensión constante."},
        liga:{nom:base+" con liga arriba de las rodillas: pulsos",q:{t:"pulsos",f:2.5},cue:"Empuja contra la liga sin perder la posición.",eq:"liga"},
        falla:{nom:"Hold final de "+base+" a la falla",q:{t:"falla"},cue:"Aguanta hasta que tiemble; respira."}}[k];
      add("misma",{label:m.nom,sub:{hold:"hold 30 s",pulsos:"pulsos",liga:"pulsos con liga",falla:"a la falla"}[k],kind:"gen",attrs:{nom:m.nom,blk,f,eq:m.eq||chain.eq,q:m.q,cue:m.cue}});
    });
  }
  // 2) bloque: qué sigue según la estructura de tus clases
  if(b.bk==="up"){
    const ancs=new Set(steps.map(s=>(byId[s.ref]||{}).anchor));
    const falta=ARM_UP_PASOS.find(([a])=>!ancs.has(a));
    if(falta){ LIB.filter(x=>x.anchor===falta[0]).forEach(x=>add("bloque",{label:x.nom,sub:falta[1],kind:"lib",ref:x.id})); }
    else ["up_s_hombro","up_s_espalda","up_s_brazos","up_s_mix"].filter(a=>!ancs.has(a)).forEach(a=>{ const L=LIB.filter(x=>x.anchor===a).sort((x,y)=>x.ord-y.ord); add("bloque",{label:"Trío: "+L.map(x=>x.nom.split(" ")[0]).join(" · "),sub:"3 pasos de pie",kind:"lista",refs:L.map(x=>x.id)}); });
  } else if(b.bk==="leg"||b.bk==="glu"){
    Object.values(EST_ANCHORS).filter(a=>a.blk===b.bk&&!usadas.has(a.id)).sort((x,y)=>(y.eq===(e&&e.eq)?1:0)-(x.eq===(e&&e.eq)?1:0)).forEach(a=>add("bloque",{label:a.anchorNom,sub:"estación completa · "+a.layers.length+" pasos"+(a.lados?" × 2 lados":""),kind:"ancla",anchor:a.id}));
  } else if(b.bk==="abs"||b.bk==="plk"||b.bk==="reto"||b.bk==="cierre"){
    const pool=b.bk==="abs"?EST_ABS:b.bk==="plk"?EST_PLK:b.bk==="reto"?EST_RETO:EST_CIERRE, en=new Set(steps.map(s=>s.ref));
    const fns=new Set(steps.map(s=>(byId[s.ref]||{}).fn));
    pool.filter(x=>!en.has(x.id)).sort((x,y)=>(fns.has(x.fn)?1:0)-(fns.has(y.fn)?1:0)).forEach(x=>add("bloque",{label:x.nom,sub:b.bk==="abs"?"función: "+x.fn:"",kind:"lib",ref:x.id}));
  }
  // 3) relacionados de la biblioteca (misma zona, posición que no sube, mismo material primero)
  if(e){
    LIB.filter(x=>x.b==="st"&&x.blk===b.bk&&x.id!==e.id&&(x.f||0)>=(e.f||0)&&!(x.anchor&&usadas.has(x.anchor))&&x.layer!=="falla"&&x.layer!=="hold"&&x.layer!=="pulsos")
      .sort((x,y)=>(y.eq===e.eq?1:0)-(x.eq===e.eq?1:0)||Math.random()-.5).slice(0,5).forEach(x=>add("rel",{label:x.nom,sub:"mismo bloque · "+(FLUJO_TXT[x.f||0]),kind:"lib",ref:x.id}));
  }
  // 4) siguiente bloque
  const pos=ARM_ORDEN.indexOf(b.bk);
  if(steps.length>=3){
    ARM_ORDEN.slice(pos+1).filter(k=>!ARMS.blocks.some(x=>x.bk===k)).slice(0,2).forEach(k=>add("sig",{label:"Pasar a: "+ARM_NOM[k],sub:"siguiente bloque",kind:"bloque",bk:k}));
  }
  return out;
}
function armAplicarSug(s){
  let b=armActivo(); if(!b&&s.kind!=="bloque") b=armNuevoBloque("libre");
  if(s.kind==="lib"){ armAgregarEntrada(b,byId[s.ref],s.side,false); }
  else if(s.kind==="lista"){ s.refs.forEach(id=>armAgregarEntrada(b,byId[id],null,false)); }
  else if(s.kind==="gen"){ const e=armCrearCustom(s.attrs); armAgregarEntrada(b,e,null,true); }
  else if(s.kind==="ancla"){ const A=EST_ANCHORS[s.anchor], L=A.layers.map(i=>byId[i]);
    if(A.lados){ L.forEach(x=>b.steps.push(armPaso(x,"A"))); L.forEach(x=>b.steps.push(armPaso(x,"B"))); }
    else (estAnchorSteps(A,"M",ARMS.dif)).forEach(x=>b.steps.push(armPaso(x)));
    ARMS.chain={anchor:A.id}; }
  else if(s.kind==="ladoB"){ const A=EST_ANCHORS[s.anchor]; A.layers.map(i=>byId[i]).forEach(x=>b.steps.push(armPaso(x,"B"))); }
  else if(s.kind==="bloque"){ armNuevoBloque(s.bk); }
  armGuardar();
}
function armAgregarTexto(txt){
  txt=txt.trim(); if(!txt) return;
  let b=armActivo(); const bkA=b?b.bk:null;
  const m=armBuscar(txt,bkA,1)[0];
  if(m&&m.sc>=0.75){ if(!b) b=armNuevoBloque(m.e.blk&&ARM_NOM[m.e.blk]?m.e.blk:"libre"); armAgregarEntrada(b,m.e,null,false); return; }
  const c=armClasificar(txt,bkA);
  if(!b) b=armNuevoBloque(c.blk);
  const e=armCrearCustom({nom:txt.charAt(0).toUpperCase()+txt.slice(1),blk:b.bk==="libre"?c.blk:b.bk,f:c.f,eq:c.eq,q:c.q.t==="reps"||c.q.t==="pulsos"?(c.q.t==="reps"?{t:"reps",n:c.q.n}:{t:"pulsos",n:c.q.n}):c.q});
  armAgregarEntrada(b,e,null,false);
}

/* ---------- crear la rutina a partir del borrador ---------- */
function armArmarRutina(){
  const S=ARMS, sections=[], ctx={size:"M",dif:S.dif,base:S.base,eq:new Set()};
  if(S.calent) sections.push({id:rid(),nom:"Calentamiento",tag:"prep",kind:"prep",slots:shuffle(LIB.filter(e=>e.b==="prep"&&e.id!=="w_aprox")).slice(0,4).map(slot)});
  let i=0;
  S.blocks.filter(b=>b.steps.length&&b.bk!=="reto"&&b.bk!=="cierre").forEach(b=>{ i++;
    const sec={id:rid(),nom:"Bloque "+i+" · "+(ARM_NOM[b.bk]||"Libre"),tag:EST_TAG[b.bk]||"core",kind:"work",slots:[],bk:b.bk==="libre"?undefined:b.bk};
    b.steps.forEach(st=>{ const e=byId[st.ref]; if(!e) return; const s=slot(e); s.q=st.q||(e.q?estQ(e.q,S.base,S.dif):null); if(!s.q) delete s.q; s.side=st.side||null; s.eq=st.eq||e.eq; s.nota=st.nota||""; s.trans=st.tr||""; sec.slots.push(s); ctx.eq.add(s.eq); });
    sections.push(sec); });
  const reto=S.blocks.find(b=>b.bk==="reto"&&b.steps.length);
  if(reto) sections.push({id:rid(),nom:"Reto final",tag:"core",kind:"finisher",bk:"reto",slots:reto.steps.map(st=>{ const e=byId[st.ref], s=slot(e); s.q=st.q||estQ(e.q,S.base,S.dif); return s; })});
  else if(S.reto) sections.push({id:rid(),nom:"Reto final",tag:"core",kind:"finisher",bk:"reto",slots:[estSlot(estPick(EST_RETO,1)[0],ctx)]});
  const ci=S.blocks.find(b=>b.bk==="cierre"&&b.steps.length);
  if(ci) sections.push({id:rid(),nom:"Cierre",tag:"prep",kind:"cool",bk:"cierre",slots:ci.steps.map(st=>{ const e=byId[st.ref], s=slot(e); s.q=st.q||estQ(e.q,S.base,S.dif); return s; })});
  else if(S.cierre) sections.push({id:rid(),nom:"Cierre",tag:"prep",kind:"cool",bk:"cierre",slots:EST_CIERRE.slice(0,2).map(x=>estSlot(x,ctx))});
  const r={id:rid(),metodo:"sculpt",estilo:"estacion",nombre:S.nombre.trim()||"Mi clase de Sculpt",modo:"full",nivel:S.dif,duracion:45,base:S.base,porBloque:null,vueltas:1,rest:"armada por ti",sections,creada:Date.now(),material:[...ctx.eq]};
  r.duracion=Math.max(15,Math.round(estimateMinutes(r)/5)*5);
  estTransiciones(r);
  return r;
}

/* ---------- vista ---------- */
function armQtxt(q){ const t=estQTxt(q); return t?(t.n+" "+t.u).trim():""; }
function viewArmar(){
  armInit();
  const S=ARMS, act=armActivo(); if(act&&!S.active) S.active=act.id;
  ARM.sug=act?armSugerir(act):[];
  const grupos={misma:"Sigue en la misma estación",bloque:"Para este bloque",rel:"Otros ejercicios del bloque",sig:"Después de este bloque"};
  const sugH=Object.keys(grupos).map(g=>{ const L=ARM.sug.map((s,i)=>[s,i]).filter(([s])=>s.g===g); if(!L.length) return "";
    return `<div class="sug-group"><div class="mini-lbl">${grupos[g]}</div><div class="sug-list">${L.map(([s,i])=>`<button class="sug-btn" data-action="ar-sug" data-i="${i}"><b>${esc(s.label)}</b>${s.sub?`<span>${esc(s.sub)}</span>`:""}</button>`).join("")}</div></div>`; }).join("");
  const bloques=S.blocks.map((b,bi)=>{
    const on=b.id===(act&&act.id);
    return `<section class="sec arm-block ${on?"on":""}"><div class="sec-head" style="--tagc:${tagColor(EST_TAG[b.bk]||"core")}"><h3>Bloque ${bi+1} · ${ARM_NOM[b.bk]||"Libre"}</h3><span class="s-meta">${b.steps.length} pasos</span><span class="spacer"></span>
      ${on?"":`<button class="btn sm" data-action="ar-focus" data-id="${b.id}">Editar</button>`}<button class="btn sm ghost" data-action="ar-del-block" data-id="${b.id}" aria-label="Quitar bloque">✕</button></div>
      ${b.steps.map((st,i)=>{ const e=byId[st.ref]||{nom:"?"}; return `<div class="arm-step"><span class="idx">${String(i+1).padStart(2,"0")}</span><div class="as-main"><div class="as-nom">${esc(e.nom)}${e.custom?` <span class="chip">propio</span>`:""}${st.side?` <span class="chip solid">Lado ${st.side}</span>`:""}</div><div class="as-meta">${st.q?`<span class="n">${esc(armQtxt(st.q))}</span> · `:""}${esc(st.eq||e.eq||"")}</div></div>
        <div class="as-acts">${st.q&&(st.q.t==="reps"||st.q.t==="pulsos"||st.q.t==="hold")?`<button class="pg" data-action="ar-q" data-b="${b.id}" data-u="${st.uid}" data-d="-1" aria-label="Menos">−</button><button class="pg" data-action="ar-q" data-b="${b.id}" data-u="${st.uid}" data-d="1" aria-label="Más">+</button>`:""}
        <button class="pg" data-action="ar-mv" data-b="${b.id}" data-u="${st.uid}" data-d="-1" ${i===0?"disabled":""} aria-label="Subir">▲</button><button class="pg" data-action="ar-mv" data-b="${b.id}" data-u="${st.uid}" data-d="1" ${i===b.steps.length-1?"disabled":""} aria-label="Bajar">▼</button><button class="del" data-action="ar-del" data-b="${b.id}" data-u="${st.uid}" aria-label="Quitar">✕</button></div></div>`; }).join("")||`<div class="arm-empty">Bloque vacío — escribe tu primer ejercicio abajo.</div>`}
      ${on?`<div class="arm-input"><input class="inp" id="ar-txt" data-action="ar-txt" list="" placeholder="Escribe un ejercicio… (ej. sentadilla búlgara, hold 30 seg, russian twist)" value="${esc(S.q||"")}" autocomplete="off"><button class="btn primary" data-action="ar-add">+ Añadir</button></div>
        <div id="ar-auto">${armAutoHtml()}</div>`:""}
    </section>`; }).join("");
  const tipos=["up","leg","glu","abs","plk","libre"];
  return `<div class="wrap"><header class="page-head"><span class="eyebrow">Rutinas</span><h1>Armar clase</h1><p class="sub">Escribe los ejercicios que quieres hacer y yo te propongo cuáles pueden seguir: la misma estación en capas (hold, pulsos, liga, a la falla), estaciones completas del bloque o el siguiente bloque. Lo que escribas y no esté en mi biblioteca también funciona.</p></header>
    <div class="card arm-top"><div class="form-grid g3"><div><label class="mini">Nombre de la clase</label><input class="inp" data-action="ar-nombre" value="${esc(S.nombre)}" placeholder="ej. Sculpt martes 7 am"></div>
      <div><label class="mini">Dificultad</label><div class="seg">${Object.keys(EST_DIF).map(k=>`<button data-action="ar-dif" data-v="${k}" class="${S.dif===k?"on":""}">${EST_DIF[k].nom}</button>`).join("")}</div></div>
      <div><label class="mini">Base de conteo</label><div class="seg">${[8,10,12].map(b=>`<button data-action="ar-base" data-v="${b}" class="${S.base===b?"on":""}">${b}</button>`).join("")}</div></div></div></div>
    <div class="arm-grid"><div class="arm-main">${bloques||`<div class="empty"><b>Empieza eligiendo un bloque.</b><p>Por ejemplo "Pierna", y escribe tu primer ejercicio.</p></div>`}
      <div class="arm-newblock"><span class="mini-lbl">Añadir bloque</span><div class="seg">${tipos.map(k=>`<button data-action="ar-new-block" data-bk="${k}">${ARM_NOM[k]}</button>`).join("")}</div></div></div>
      <aside class="arm-side">${act?`<div class="card"><h3>Te sugiero seguir con…</h3>${sugH||`<p class="hint">Escribe tu primer ejercicio y aquí te propongo cómo seguir.</p>`}</div>`:`<div class="card"><p class="hint">Elige un bloque para ver sugerencias.</p></div>`}
      <div class="card"><h3>Cierre de la clase</h3><label class="switch"><input type="checkbox" data-action="ar-opt" data-k="calent" ${S.calent?"checked":""}><span class="track"></span>Calentamiento</label>
        <label class="switch" style="margin-top:8px"><input type="checkbox" data-action="ar-opt" data-k="reto" ${S.reto?"checked":""}><span class="track"></span>Reto final automático</label>
        <label class="switch" style="margin-top:8px"><input type="checkbox" data-action="ar-opt" data-k="cierre" ${S.cierre?"checked":""}><span class="track"></span>Cierre con reflexión y relajación</label>
        <div class="acts" style="margin-top:14px"><button class="btn primary" data-action="ar-use" ${S.blocks.some(b=>b.steps.length)?"":"disabled"}>Usar esta clase →</button><button class="btn ghost" data-action="ar-reset">Empezar de nuevo</button></div></div></aside></div></div>`;
}
function armAutoHtml(){
  const txt=ARMS.q; if(!txt||txt.trim().length<2) return "";
  const b=armActivo(), L=armBuscar(txt,b&&b.bk,6);
  return `<div class="auto-list">${L.map(x=>`<button data-action="ar-pick" data-ref="${x.e.id}"><b>${esc(x.e.nom)}</b><span>${x.e.q?esc(armQtxt(estQ(x.e.q,ARMS.base,ARMS.dif))):""} · ${esc(x.e.eq)}</span></button>`).join("")}
    <button class="auto-own" data-action="ar-add">+ Usar «${esc(txt.trim())}» como ejercicio propio</button></div>`;
}

/* ---------- acciones ---------- */
function arClick(a,t){
  armInit(); const S=ARMS;
  if(a==="ar-new-block"){ armNuevoBloque(t.dataset.bk); armGuardar(); render(); return true; }
  if(a==="ar-focus"){ S.active=t.dataset.id; S.chain=null; armGuardar(); render(); return true; }
  if(a==="ar-del-block"){ S.blocks=S.blocks.filter(b=>b.id!==t.dataset.id); if(S.active===t.dataset.id) S.active=null; armGuardar(); render(); return true; }
  if(a==="ar-sug"){ const s=ARM.sug[+t.dataset.i]; if(s){ armAplicarSug(s); S.q=""; render(); } return true; }
  if(a==="ar-pick"){ let b=armActivo()||armNuevoBloque("libre"); armAgregarEntrada(b,byId[t.dataset.ref],null,false); S.q=""; armGuardar(); render(); return true; }
  if(a==="ar-add"){ const el=document.getElementById("ar-txt"); armAgregarTexto(el?el.value:S.q); S.q=""; armGuardar(); render(); const n=document.getElementById("ar-txt"); if(n) n.focus(); return true; }
  if(a==="ar-del"){ const b=armBloque(t.dataset.b); b.steps=b.steps.filter(s=>s.uid!==t.dataset.u); armGuardar(); render(); return true; }
  if(a==="ar-mv"){ const b=armBloque(t.dataset.b), i=b.steps.findIndex(s=>s.uid===t.dataset.u), j=i+Number(t.dataset.d); if(j>=0&&j<b.steps.length){ [b.steps[i],b.steps[j]]=[b.steps[j],b.steps[i]]; armGuardar(); render(); } return true; }
  if(a==="ar-q"){ const b=armBloque(t.dataset.b), s=b.steps.find(x=>x.uid===t.dataset.u), d=Number(t.dataset.d), q=s.q;
    if(q.t==="hold") q.s=Math.max(5,q.s+5*d); else q.n=Math.max(1,q.n+(q.t==="pulsos"?5:1)*d); armGuardar(); render(); return true; }
  if(a==="ar-dif"){ S.dif=t.dataset.v; armGuardar(); render(); return true; }
  if(a==="ar-base"){ S.base=Number(t.dataset.v); armGuardar(); render(); return true; }
  if(a==="ar-reset"){ if(confirm("¿Borrar el borrador y empezar de nuevo?")){ ARMS=null; LS.set("sf_armar",null); armInit(); render(); } return true; }
  if(a==="ar-use"){
    const r=armArmarRutina(); state.routine=r; state.cfg.metodo="sculpt"; state.screen="planner"; render(); window.scrollTo(0,0); toast("Clase lista · ≈ "+estimateMinutes(r)+" min"); return true; }
  // "+ Añadir" de cualquier rutina: escribir un ejercicio propio
  if(a==="ar-pk-add"){
    const md=state.modal, el=document.getElementById("ar-pk-txt"), txt=el?el.value.trim():""; if(!txt){ toast("Escribe el ejercicio"); return true; }
    const r=state.routine, Sx=r.sections.find(x=>x.id===md.sec), c=armClasificar(txt,Sx.bk||(Sx.tag==="up"?"up":Sx.tag==="core"?"abs":"leg"));
    const m=armBuscar(txt,Sx.bk,1)[0]; let e;
    if(m&&m.sc>=0.75) e=m.e; else e=armCrearCustom({nom:txt.charAt(0).toUpperCase()+txt.slice(1),blk:Sx.bk||c.blk,f:c.f,eq:c.eq,q:r.estilo==="estacion"?(c.q.t==="reps"?{t:"reps",n:r.base||8}:c.q):{t:"reps",n:r.base||8}});
    addPicked(md.sec,e.id); return true; }
  return false;
}
function arInput(a,t){
  armInit();
  if(a==="ar-txt"){ ARMS.q=t.value; const box=document.getElementById("ar-auto"); if(box) box.innerHTML=armAutoHtml(); return true; }
  if(a==="ar-nombre"){ ARMS.nombre=t.value; armGuardar(); return true; }
  if(a==="ar-pk-txt"){ return true; }
  return false;
}
function arChange(a,t){
  armInit();
  if(a==="ar-opt"){ ARMS[t.dataset.k]=t.checked; armGuardar(); return true; }
  return false;
}
document.addEventListener("keydown",e=>{
  if(e.key==="Enter"&&e.target&&e.target.id==="ar-txt"){ e.preventDefault(); arClick("ar-add",e.target); }
  if(e.key==="Enter"&&e.target&&e.target.id==="ar-pk-txt"){ e.preventDefault(); arClick("ar-pk-add",e.target); }
});

/* ---------- el "+ Añadir" de cualquier rutina: escribir + sugerencias de qué sigue ---------- */
function armPickerExtra(S){
  const r=state.routine, last=S.slots[S.slots.length-1], e=last?byId[last.ref]:null;
  let sug=[];
  if(e){
    const have=new Set(S.slots.map(s=>s.ref));
    let pool=[]; try{ pool=armPoolPara(S); }catch(x){}
    sug=pool.filter(x=>!have.has(x.id)).map(x=>{ let sc=Math.random()*.8;
      if(x.sub&&x.sub===e.sub) sc+=3; if((x.f||0)===(e.f||0)) sc+=2; else if((x.f||0)>(e.f||0)) sc+=1; else sc-=2;
      if(x.eq===e.eq) sc+=2; if(x.pat!==e.pat) sc+=1; if(x.comp&&r.metodo==="fuerza") sc+=1; return {x,sc}; }).sort((a,b)=>b.sc-a.sc).slice(0,6).map(z=>z.x);
  }
  return `<div class="arm-pk"><label class="mini">Escribe tu ejercicio</label><div class="arm-input"><input class="inp" id="ar-pk-txt" data-action="ar-pk-txt" placeholder="ej. sentadilla búlgara con mancuerna" autocomplete="off"><button class="btn primary" data-action="ar-pk-add">+ Añadir</button></div>
    ${sug.length?`<label class="mini" style="margin-top:12px">Pueden seguir después de «${esc(e.nom)}»</label><div class="sug-list">${sug.map(x=>`<button class="sug-btn" data-action="pick-ex" data-sec="${S.id}" data-ex="${x.id}"><b>${esc(x.nom)}</b><span>${esc(x.eq)} · ${FLUJO_TXT[x.f||0]}</span></button>`).join("")}</div>`:""}</div>
    <label class="mini" style="margin-top:14px">O elige de la biblioteca</label>`;
}
function armPoolPara(S){
  const r=state.routine;
  if(S.kind==="prep") return LIB.filter(e=>e.b==="prep");
  if(S.kind==="cool") return LIB.filter(e=>e.b==="cool").concat(S.bk==="cierre"?LIB.filter(e=>e.blk==="cierre"):[]);
  if(S.kind==="cardioFin") return LIB.filter(e=>e.b==="cardio");
  if(r.metodo==="fuerza"){ const sd=secDef(MODES.fuerza[r.fModo].secs,S); return sd?fuerzaPool(sd.key):[]; }
  if(r.metodo==="barre"){ const sd=secDef(MODES.barre[r.bModo].secs,S); return sd?barrePool(sd.sub,new Set()):LIB.filter(e=>e.b==="barre"); }
  if(S.bk) return LIB.filter(e=>e.b==="st"&&e.blk===S.bk);
  const sd=secDef(MODES.sculpt[r.modo].secs,S); return sd?sculptPool(sd,new Set()):LIB.filter(e=>e.b===(S.tag==="up"?"upper":S.tag==="low"?"lower":"core"));
}
