"use strict";
/* ============================================================
   APRENDER · la app sigue TU formato de clase y lo afina con lo que haces
   1) Le pegas una clase tuya (como las de tus notas): entiende bloques, pasos, conteos, lados y material.
   2) De cada clase aprende: el orden de tus bloques, cuántos pasos usas, tus cantidades (reps, pulsos, holds),
      el material, y tus estaciones completas (que pasan a ser opciones del generador).
   3) De lo que haces aprende en silencio: lo que quitas, lo que cambias, lo que agregas y lo que apruebas.
   Todo vive en la bóveda cifrada (sf.aprendizaje) y se puede ver, ajustar u olvidar en "Mi formato".
   ============================================================ */
const APR_KEY="sf_aprendizaje";
const APR_PESOS={mucho:.8,medio:.5,poco:.2};
/* lo que ya se sabe de tus dos clases de ejemplo (punto de partida; se va desplazando con tus clases) */
function aprNuevo(){
  return {v:1,clases:2,aprobadas:0,ediciones:0,peso:"mucho",
    estructuras:{"up,leg,glu,abs":2},
    bloques:{up:{n:2,pasos:14},leg:{n:2,pasos:14},glu:{n:2,pasos:12},abs:{n:2,pasos:8}},
    q:{reps:{n:10,sum:90},pulsos:{n:8,sum:176},hold:{n:6,sum:150},falla:{n:2}},
    base:{8:1,10:1},afinidad:{},quitados:{},eq:{},anclas:[],importadas:[],pt:{afin:{},evita:{}}};
}
function aprPerfil(){
  let p=LS.get(APR_KEY,null);
  if(!p||typeof p!=="object"){ p=aprNuevo(); LS.set(APR_KEY,p); }
  p.afinidad=p.afinidad||{}; p.quitados=p.quitados||{}; p.pt=p.pt||{afin:{},evita:{}}; p.anclas=p.anclas||[]; p.importadas=p.importadas||[];
  return p;
}
const aprPeso=()=>APR_PESOS[aprPerfil().peso||"mucho"]||.8;
/* qué tanto prefiere o evita un paso (o una estación entera) */
function aprBoostId(id){
  const p=aprPerfil();
  const val=x=>Math.min(4,p.afinidad[x]||0)-Math.min(4,p.quitados[x]||0);
  let v; const A=typeof EST_ANCHORS!=="undefined"&&EST_ANCHORS[id];
  if(A){ v=A.layers.reduce((m,l)=>Math.max(m,val(l)),-4); return v*0.15*(aprPeso()/0.8); }   // una estación se inclina, no se vuelve la única
  v=val(id);
  return v*0.9*(aprPeso()/0.8);
}
function aprSumar(map,id,n){ map[id]=(map[id]||0)+n; }
function aprMedia(k,def){ const x=aprPerfil().q[k]; return x&&x.n>0&&x.sum?x.sum/x.n:def; }
/* mezcla un conteo generado con el que sueles usar */
function aprAjustarCantidad(k,valor,minimo){
  const x=aprPerfil().q[k]; if(!x||!(x.n>=3)||!x.sum) return valor;
  const w=aprPeso()*Math.min(1,x.n/8), mezcla=valor*(1-w)+(x.sum/x.n)*w;
  return Math.max(minimo||1,k==="pulsos"||k==="hold"?Math.round(mezcla/5)*5||minimo:Math.round(mezcla));
}
/* estructura de bloques que más usas (si hay una clara, el generador la sigue) */
function aprEstructura(modo){
  const p=aprPerfil(), w=aprPeso(); if(modo!=="full"||w<.4) return null;
  const e=Object.entries(p.estructuras||{}).sort((a,b)=>b[1]-a[1])[0]; if(!e||e[1]<2) return null;
  const k=e[0].split(",").filter(x=>["up","leg","glu","abs","plk"].includes(x)); return k.length>=3?k:null;
}
function aprPasosBloque(bk,def){
  const b=aprPerfil().bloques[bk]; if(!b||!(b.n>=2)) return def;
  const w=aprPeso(); return Math.max(2,Math.round(def*(1-w)+(b.pasos/b.n)*w));
}

/* ---------- aprender de una rutina (importada, armada o aprobada) ---------- */
function aprAprender(r,peso,fuente){
  if(!r||r.estilo!=="estacion") return;
  const p=aprPerfil();
  const kinds=r.sections.filter(s=>s.kind==="work"&&s.bk).map(s=>s.bk);
  if(kinds.length>=2) aprSumar(p.estructuras,kinds.join(","),peso);
  r.sections.forEach(S=>{
    if(!S.bk) return;
    const b=p.bloques[S.bk]||(p.bloques[S.bk]={n:0,pasos:0}); b.n+=peso; b.pasos+=S.slots.length*peso;
    S.slots.forEach(s=>{
      aprSumar(p.afinidad,s.ref,peso);
      const q=s.q; if(q){ const k=q.t; const slot=p.q[k]||(p.q[k]={n:0,sum:0});
        if(k==="reps"&&q.n){ slot.n+=peso; slot.sum+=q.n*peso; } else if(k==="pulsos"&&q.n){ slot.n+=peso; slot.sum+=q.n*peso; } else if(k==="hold"&&q.s){ slot.n+=peso; slot.sum+=q.s*peso; } else if(k==="falla"){ slot.n=(slot.n||0)+peso; } }
      const bb=p.eq[S.bk]||(p.eq[S.bk]={}); aprSumar(bb,s.eq||"peso corporal",peso);
    });
  });
  aprSumar(p.base,String(r.base||8),peso);
  if(fuente==="clase") p.clases+=1; else p.aprobadas+=1;
  r.aprendida=true; LS.set(APR_KEY,p);
}
/* "aprobar": guardada, asignada a una clase o usada → se aprende una sola vez por rutina */
function aprAprobar(r){ if(!r||r.estilo!=="estacion"||r.aprendida) return; aprAprender(r,1,"aprobada"); }
/* señales silenciosas de lo que haces con una rutina */
function aprSenal(tipo,ref,ref2){
  const p=aprPerfil(); p.ediciones=(p.ediciones||0)+1;
  if(tipo==="quito") aprSumar(p.quitados,ref,1);
  else if(tipo==="agrego") aprSumar(p.afinidad,ref,1);
  else if(tipo==="cambio"){ aprSumar(p.quitados,ref,1); if(ref2) aprSumar(p.afinidad,ref2,.5); }
  else if(tipo==="favorito") aprSumar(p.afinidad,ref,2);
  else if(tipo==="malo") aprSumar(p.quitados,ref,2);
  LS.set(APR_KEY,p);
}
function aprSenalCantidad(q){
  if(!q) return; const p=aprPerfil(), k=q.t, v=k==="hold"?q.s:q.n; if(!v||k==="trans"||k==="falla") return;
  const s=p.q[k]||(p.q[k]={n:0,sum:0}); s.n+=1; s.sum+=v; LS.set(APR_KEY,p);
}
/* en la PT: ejercicios que cambias o quitas de un programa */
function aprPT(tipo,id){ const p=aprPerfil(); if(tipo==="afin") aprSumar(p.pt.afin,id,1); else aprSumar(p.pt.evita,id,1); LS.set(APR_KEY,p); }
const aprPTBoost=id=>{ const p=aprPerfil(); return Math.min(3,p.pt.afin[id]||0)*.8-Math.min(3,p.pt.evita[id]||0)*1.1; };

/* ============================================================
   ENTENDER UNA CLASE ESCRITA
   ============================================================ */
function aprBk(titulo){
  const t=armNorm(titulo);
  if(/calent|activaci|movilidad/.test(t)) return "prep";
  if(/reto/.test(t)) return "reto";
  if(/cierre|relaj|estir|enfria|final de clase/.test(t)) return "cierre";
  if(/gluteo/.test(t)) return "glu";
  if(/\babs\b|abdom|\bcore\b/.test(t)) return "abs";
  if(/plancha/.test(t)&&!/superior|brazo/.test(t)) return "plk";
  if(/superior|brazo|hombro|pecho|espalda|bicep|tricep|upper/.test(t)) return "up";
  if(/pierna|cuadric|sentadilla|isquio|lower/.test(t)) return "leg";
  return "libre";
}
function aprEsTitulo(l){
  if(/^bloque\s*\d+/i.test(l)) return true;
  if(/^(reto final|cierre|calentamiento|estiramiento|enfriamiento)\b/i.test(l)) return true;
  if(/^\s*(\d+[\.\)]|[-•*·])\s/.test(l)) return false;
  const letras=l.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ]/g,"");
  return letras.length>=4&&letras===letras.toUpperCase()&&l.length<80;
}
function aprNumeros(texto,bk){
  const s=armNorm(texto), enteros=[...s.matchAll(/\d+/g)].map(m=>+m[0]);
  if(/a la falla|hasta la falla/.test(s)) return {t:"falla"};
  const rango=s.match(/(\d+)\s*[-–]\s*(\d+)/), mid=rango?Math.round((+rango[1]+ +rango[2])/2):null;
  const pausa=/pausa de \d+ seg/.test(s);   // "crunch con pausa de 2 segundos x12" son reps, no un hold
  const segs=pausa?null:s.match(/(\d+)\s*(?:[-–]\s*(\d+)\s*)?(?:seg|segundos)\b/);
  const hold=/\bhold\b|isometri|sosten|aguant|mantien/.test(s), pul=/pulso|pulsa/.test(s);
  const por=(/por (lado|pierna)|cada lado|(\d+)\s*por (lado|pierna)/.test(s))?"por lado":null;
  const notaLado=texto.match(/\(\s*\d+\s*por\s*(?:lado|pierna)\s*\)/i);
  if(hold||(segs&&!pul)){ const sec=segs?(segs[2]?Math.round((+segs[1]+ +segs[2])/2):+segs[1]):(mid||null);
    return {t:"hold",s:sec||(/plancha/.test(s)?10:30)}; }
  if(pul){ const n=mid||(enteros.length?enteros[0]:null); return {t:"pulsos",n:n||25}; }
  let n=null;
  const x=s.match(/\bx\s*(\d+)/), pp=s.match(/(\d+)\s*por\s*(?:lado|pierna)/), lead=s.match(/^(\d+)\s+[a-z]/), noun=s.match(/(\d+)\s*(subidas|reps|repeticiones|toques|veces|lagartijas|sentadillas|zancadas)/);
  if(x) n=+x[1]; else if(lead) n=+lead[1]; else if(noun) n=+noun[1]; else if(pp) n=+pp[1]; else if(rango) n=mid;
  if(n==null&&/^(caminas?|subes a pie|subes|bajas? a|regresas?|vuelves|cambias de lado)/.test(s)) return {t:"trans"};
  const o={t:"reps",n:n||null}; if(por) o.por=por; if(notaLado) o.nota=notaLado[0].replace(/[()]/g,"").trim();
  return o;
}
function aprNombre(texto){
  let t=String(texto).replace(/^\s*(\d+[\.\)\-]|[-•*·])\s*/,"").replace(/pausa de (\d+) seg(undos)?/ig,"pausa de $1 §");
  t=t.replace(/\(\s*\d+\s*por\s*(?:lado|pierna)\s*\)/ig,"").replace(/\bx\s*\d+\b/ig,"")
     .replace(/\b\d+\s*[-–]\s*\d+\s*(pulsos|reps|seg|segundos|subidas)?/ig,"").replace(/\b\d+\s*(seg|segundos|pulsos|subidas|reps|repeticiones|veces|por pierna|por lado)\b/ig,"")
     .replace(/^\d+\s+/,"").replace(/\s+\d+\s*$/,"").replace(/§/g,"segundos").replace(/\s{2,}/g," ").replace(/[\s,;:\-–—]+$/,"").trim();
  return t.charAt(0).toUpperCase()+t.slice(1);
}
/* texto → bloques y pasos (sin guardar nada todavía) */
function aprParsear(texto,base){
  const lineas=String(texto||"").split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
  const out={bloques:[],avisos:[]}; let cur=null, lado=null;
  const nuevo=(titulo)=>{ const bk=aprBk(titulo), eqT=(titulo.match(/\(([^)]*)\)/)||[])[1]||"", c=armClasificar(eqT+" "+titulo,bk);
    cur={titulo:titulo.replace(/\s*\([^)]*\)\s*/g," ").replace(/\s+/g," ").trim(),bk,eq:eqT?c.eq:(ARM_EQ_DEF[bk]||"peso corporal"),pasos:[]}; out.bloques.push(cur); lado=null; };
  lineas.forEach(l0=>{
    let l=l0, resto=null;
    const mb=l.match(/^(reto final|cierre|calentamiento)\s*[:\-–—]\s*(.+)$/i); if(mb){ l=mb[1]; resto=mb[2]; }
    const mbl=l.match(/^bloque\s*\d+\s*[-–—:.]?\s*(.*)$/i); if(mbl&&!resto){ l=mbl[1]||l; }
    if(aprEsTitulo(l0)||mb){ if(/^clase\b/i.test(l)&&!cur){ return; } nuevo(l); if(resto) aprPaso(cur,resto,base,lado); return; }
    if(/^lado\s*([ab])\s*:?$/i.test(l0)){ lado=l0.match(/([ab])/i)[1].toUpperCase(); return; }
    if(/^cambias? de lado\s*:?\s*$/i.test(l0)){ lado="B"; return; }
    if(!cur) nuevo("Clase");
    aprPaso(cur,l0,base,lado);
  });
  out.bloques=out.bloques.filter(b=>b.pasos.length);
  if(!out.bloques.length) out.avisos.push("No encontré pasos. Pega la clase con los bloques y ejercicios, uno por línea.");
  out.bloques.forEach(b=>{ if(b.bk==="libre") out.avisos.push("No supe a qué bloque pertenece «"+b.titulo+"»: lo dejé como bloque libre."); });
  return out;
}
function aprPaso(blk,linea,base,lado){
  const limpio=linea.replace(/^\s*(\d+[\.\)\-]|[-•*·])\s*/,"");   // sin el número de la lista
  const nombre=aprNombre(limpio); if(!nombre) return;
  const q=aprNumeros(limpio,blk.bk), c=armClasificar(limpio,blk.bk);
  if(q.t==="reps"&&q.n==null) q.n=base||8;
  // el contexto manda: si el bloque ya viene de una estación conocida, los pasos siguientes se buscan dentro de ella
  const cand=armBuscar(nombre,blk.bk,6).filter(x=>x.sc>=0.7);
  let m=cand[0];
  if(blk.ancla){ const enAncla=cand.find(x=>x.e.anchor===blk.ancla); if(enAncla&&(!m||enAncla.sc>=m.sc-0.45)) m=enAncla; }
  const entry=m&&m.sc>=0.8?m.e:null;
  if(entry&&!blk.ancla&&entry.anchor&&entry.layer!=="x") blk.ancla=entry.anchor;
  blk.pasos.push({texto:linea.replace(/^\s*(\d+[\.\)\-]|[-•*·])\s*/,""),nombre,q,side:lado,f:c.f,eq:(c.eq!=="peso corporal"||!blk.eq)?c.eq:blk.eq,entry,reconocido:!!entry});
}
function aprBase(parsed){
  const cnt={8:0,10:0,12:0}; parsed.bloques.forEach(b=>b.pasos.forEach(p=>{ if(p.q.t==="reps"&&cnt[p.q.n]!=null) cnt[p.q.n]++; }));
  const mejor=Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0]; return mejor&&mejor[1]>0?+mejor[0]:8;
}

/* ---------- convertir lo entendido en rutina + aprender ---------- */
function aprFnAbs(n){ const t=armNorm(n); if(/russian|twist|bicicleta|toe|toque|rotaci|oblic/.test(t)) return "rotacion"; if(/dead|bird|lateral|plancha|estabil/.test(t)) return "estabilidad"; if(/pierna|tijera|talon|elevaci/.test(t)) return "inferior"; return "anterior"; }
function aprPersistir(e){
  const L=armCustomList(), i=L.findIndex(x=>x.id===e.id); const plano=Object.assign({},e); if(i>=0) L[i]=clone(plano); else L.push(clone(plano)); touch();
}
function aprEntrada(p,bk){
  if(p.entry) return p.entry;
  const q=p.q, tpl=q.t==="reps"?{t:"reps",n:q.n,fijo:true}:q.t==="pulsos"?{t:"pulsos",n:q.n,fijo:true}:q.t==="hold"?{t:"hold",s:q.s,fijo:true}:{t:q.t};
  const e=armCrearCustom({nom:p.nombre,blk:bk==="libre"?"libre":bk,f:p.f,eq:p.eq,q:tpl,cue:"De tu clase."});
  p.entry=e; return e;
}
function aprCapa(q,texto,i,total){
  const t=armNorm(texto);
  if(q.t==="falla") return "falla"; if(q.t==="hold") return "hold";
  if(q.t==="pulsos") return /liga/.test(t)?"liga":"pulsos";
  return i===0?"entrada":i<total-2?"varA":"varB";
}
/* una estación completa tuya (pierna / glúteo) se vuelve opción del generador y del armado */
function aprAnclaDeBloque(b){
  const A=b.pasos.filter(p=>(p.side||"A")==="A"), B=b.pasos.filter(p=>p.side==="B");
  const lados=B.length>0&&B.length===A.length, capa=lados?A:b.pasos;
  // ¿es exactamente una estación que ya existe? solo se refuerza
  const ents0=capa.map(p=>p.entry).filter(Boolean);
  if(ents0.length===capa.length){ const anc=[...new Set(ents0.map(e=>e.anchor))]; if(anc.length===1&&EST_ANCHORS[anc[0]]&&!ents0.some(e=>e.custom)) return anc[0]; }
  const ents=capa.map(p=>{ if(p.entry&&!p.entry.custom) p.entry=null; return aprEntrada(p,b.bk); });
  const id="cu_a_"+armHash(ents.map(e=>e.id).join("|"));
  if(EST_ANCHORS[id]) return id;
  ents.forEach((e,i)=>{ e.anchor=id; e.layer=b.bk==="glu"?(i===0?"mov":i===1?"iso":"combo"):aprCapa(capa[i].q,capa[i].nombre,i,ents.length); aprPersistir(e); });
  const eqs={}; ents.forEach(e=>aprSumar(eqs,e.eq,1)); const eq=Object.entries(eqs).sort((a,z)=>z[1]-a[1])[0][0];
  const nom=aprTituloBonito(b.titulo)||ents[0].nom;
  const An=EST_ANCHORS[id]={id,blk:b.bk,eq,pos:ents[0].f||0,lados,layers:ents.map(e=>e.id),anchorNom:nom,custom:1};
  const p=aprPerfil(); if(!p.anclas.some(a=>a.id===id)){ p.anclas.push({id,blk:b.bk,eq,pos:An.pos,lados,layers:An.layers,anchorNom:nom,custom:1}); LS.set(APR_KEY,p); }
  return id;
}
function aprTituloBonito(t){ t=String(t||"").replace(/^(bloque\s*\d+\s*[-–—:.]?\s*)/i,"").trim(); t=t.charAt(0).toUpperCase()+t.slice(1).toLowerCase(); return t; }
/* tren superior: se asignan los pasos a los roles de tu estructura (entrada → plancha → hold → regreso → de pie) */
function aprRolesUp(b){
  let enPie=[], viendoPlancha=false;
  b.pasos.forEach((p,i)=>{
    const q=p.q, t=armNorm(p.nombre), cust=!p.entry||p.entry.custom;
    let rol=null;
    if(q.t==="trans"&&/(pie|regreso)/.test(t)) rol="up_reg";
    else if(!viendoPlancha&&p.f===1&&(q.t==="trans"||(q.t==="reps"&&q.n<=5))) rol="up_ent";
    else if(p.f===1&&q.t==="hold") { rol="up_hold"; viendoPlancha=true; }
    else if(p.f===1&&q.t==="reps"){ rol="up_pl"; viendoPlancha=true; }
    else if(p.f===0&&q.t!=="trans") enPie.push(p);
    if(rol&&cust){ const e=aprEntrada(p,"up"); e.anchor=rol; e.layer=rol==="up_ent"?"entrada":rol==="up_hold"?"hold":rol==="up_reg"?"regreso":"trabajo"; aprPersistir(e); }
  });
  for(let i=0;i<enPie.length;i+=3){ const trio=enPie.slice(i,i+3); if(trio.length<2) continue;
    if(trio.every(p=>p.entry&&!p.entry.custom)) continue;
    const ents=trio.map(p=>aprEntrada(p,"up")), id="up_s_cu_"+armHash(ents.map(e=>e.id).join("|"));
    ents.forEach((e,k)=>{ e.anchor=id; e.layer="s"+(k+1); e.ord=1000+k; aprPersistir(e); }); }
}
function aprOtrosBloques(b){
  b.pasos.forEach(p=>{ if(p.entry&&!p.entry.custom) return; const e=aprEntrada(p,b.bk);
    if(b.bk==="abs"){ e.fn=aprFnAbs(p.nombre); e.anchor="abs_"+e.id; }
    else e.anchor=(b.bk==="reto"?"reto_":b.bk==="plk"?"plk_":b.bk==="cierre"?"cierre_":"x_")+e.id;
    e.layer="x"; aprPersistir(e); });
}
function aprConstruirRutina(parsed,nombre){
  const base=aprBase(parsed), sections=[], eqs=new Set(); let nBloque=0;
  parsed.bloques.forEach(b=>{
    b.pasos.forEach(p=>aprEntrada(p,b.bk));
    if(b.bk==="leg"||b.bk==="glu") aprAnclaDeBloque(b);
    else if(b.bk==="up") aprRolesUp(b);
    else aprOtrosBloques(b);
    const esBloque=!["prep","reto","cierre"].includes(b.bk), kind=b.bk==="prep"?"prep":b.bk==="reto"?"finisher":b.bk==="cierre"?"cool":"work";
    if(esBloque) nBloque++;
    const sec={id:rid(),nom:esBloque?"Bloque "+nBloque+" · "+(b.titulo?aprTituloBonito(b.titulo):ARM_NOM[b.bk]):b.bk==="prep"?"Calentamiento":b.bk==="reto"?"Reto final":"Cierre",
      tag:b.bk==="prep"||b.bk==="cierre"?"prep":(EST_TAG[b.bk]||"core"),kind,slots:[],bk:b.bk==="libre"?undefined:b.bk};
    b.pasos.forEach(p=>{ const e=p.entry, s=slot(e); s.q=Object.assign({},p.q); if(s.q.t==="reps"&&s.q.n==null) s.q.n=base; s.side=p.side||null; s.eq=p.eq||e.eq; s.pat=p.q.t==="hold"||p.q.t==="falla"?"iso":p.q.t==="pulsos"?"pulsos":"reps"; s.trans=e.tr||""; sec.slots.push(s); eqs.add(s.eq); });
    sections.push(sec); });
  const kinds=parsed.bloques.map(b=>b.bk), tiene=k=>kinds.includes(k);
  const modo=(tiene("up")&&(tiene("leg")||tiene("glu")))?"full":(tiene("up")&&!tiene("leg")&&!tiene("glu"))?"upper":((tiene("leg")||tiene("glu"))&&!tiene("up"))?"pierna":(tiene("abs")||tiene("plk"))&&!tiene("up")&&!tiene("leg")?"core":"full";
  const r={id:rid(),metodo:"sculpt",estilo:"estacion",nombre:nombre||"Clase importada",modo,nivel:"media",duracion:45,base,porBloque:null,vueltas:1,rest:"tu formato",sections,creada:Date.now(),material:[...eqs].filter(x=>x!=="peso corporal").concat([...eqs].includes("peso corporal")&&eqs.size===1?["peso corporal"]:[])};
  r.duracion=Math.max(15,Math.round(estimateMinutes(r)/5)*5); estTransiciones(r);
  return r;
}
/* ---------- aprender de todas las rutinas ya guardadas ---------- */
function aprDeGuardadas(){
  let n=0; (state.saved||[]).forEach(r=>{ if(r.estilo==="estacion"&&!r.aprendida){ aprAprender(r,1,"aprobada"); n++; } });
  LS.set("sf_saved",state.saved); return n;
}
/* ---------- al abrir: vuelve a registrar tus estaciones ---------- */
function aprRegistrarGuardado(){
  const p=aprPerfil();
  (p.anclas||[]).forEach(a=>{ if(!EST_ANCHORS[a.id]) EST_ANCHORS[a.id]=Object.assign({},a); });
}
function aprResumen(){ const p=aprPerfil(); return "aprendió de "+p.clases+(p.clases===1?" clase":" clases")+(p.aprobadas?", "+p.aprobadas+" aprobadas":"")+(p.ediciones?" y "+p.ediciones+" ajustes":""); }

/* ============================================================
   PANTALLA "MI FORMATO"
   ============================================================ */
const APRUI={txt:"",nombre:"",prev:null};
function aprTopPasos(mapa,n,pos){
  return Object.entries(mapa).filter(([id,v])=>v>0&&byId[id]).sort((a,b)=>b[1]-a[1]).slice(0,n).map(([id,v])=>({id,v,nom:byId[id].nom}));
}
function viewFormato(){
  const p=aprPerfil(), peso=p.peso||"mucho";
  const est=Object.entries(p.estructuras||{}).sort((a,b)=>b[1]-a[1])[0], estK=est?est[0].split(","):[];
  const prom=(bk)=>{ const b=p.bloques[bk]; return b&&b.n>0?Math.round(b.pasos/b.n*10)/10:null; };
  const media=(k,u)=>{ const m=aprMedia(k,null); return m?Math.round(m)+" "+u:"—"; };
  const base=Object.entries(p.base||{}).sort((a,b)=>b[1]-a[1])[0];
  const fav=aprTopPasos(p.afinidad,6), quit=aprTopPasos(p.quitados,5);
  const eqs=Object.entries(p.eq||{}).map(([bk,m])=>{ const e=Object.entries(m).sort((a,b)=>b[1]-a[1])[0]; return e?ARM_NOM[bk]+": "+e[0]:null; }).filter(Boolean);
  const prevH=APRUI.prev?aprPrevHtml(APRUI.prev):"";
  return `<div class="wrap"><header class="page-head"><span class="eyebrow">Rutinas</span><h1>Mi formato</h1><p class="sub">La app aprende cómo das tu clase: pégale una clase tuya y también aprende de lo que quitas, cambias y apruebas. Cada vez que generes una rutina sigue más tu estilo.</p></header>
    <section class="card apr-form"><h3>Enséñale una clase</h3><p class="hint" style="margin-top:0">Pega el texto de una clase tuya (como lo escribes en tus notas): bloques, ejercicios, conteos y lados. Entiende «8 sentadillas», «hold 30 seg», «pulsos 25-30», «a la falla», «Lado A / cambias de lado», el reto final y el cierre.</p>
      <label class="mini">Nombre (opcional)</label><input class="inp" data-action="ap-nombre" value="${esc(APRUI.nombre)}" placeholder="ej. Sculpt martes 7 am">
      <label class="mini" style="margin-top:10px">La clase</label><textarea class="inp apr-txt" data-action="ap-txt" rows="10" placeholder="BLOQUE 1 – TREN SUPERIOR (mancuernas 5 kg)&#10;1. Caminas con las manos hasta plancha&#10;2. En plancha, toques de hombro x10 (5 por lado)&#10;…">${esc(APRUI.txt)}</textarea>
      <div class="acts" style="margin-top:12px"><button class="btn primary" data-action="ap-entender">Entender esta clase</button>${APRUI.prev?`<button class="btn ghost" data-action="ap-cancelar">Limpiar</button>`:""}</div></section>
    ${prevH}
    <section class="blk" style="margin-top:26px"><div class="blk-head"><div><h2>Lo que aprendió de ti</h2><p>${esc(aprResumen())}</p></div></div>
      <div class="grid-cards">
        <div class="mini-card"><span class="mini-lbl">Orden de tus bloques</span><div class="apr-chips">${estK.length?estK.map(k=>`<span class="chip">${ARM_NOM[k]||k}</span>`).join('<span class="hint">→</span>')+'<span class="hint">→</span><span class="chip">Reto final</span><span class="hint">→</span><span class="chip">Cierre</span>':'<span class="hint">aún sin datos</span>'}</div></div>
        <div class="mini-card"><span class="mini-lbl">Pasos por bloque</span><p class="strong" style="font-size:15px">${["up","leg","glu","abs"].map(k=>`${ARM_NOM[k]} ${prom(k)||"—"}`).join(" · ")}</p></div>
        <div class="mini-card"><span class="mini-lbl">Tus conteos</span><p class="strong" style="font-size:15px">Reps ${media("reps","")} · Pulsos ${media("pulsos","")} · Hold ${media("hold","s")}</p><p class="hint">Base preferida: <b>${base?base[0]:8}</b></p></div>
        <div class="mini-card"><span class="mini-lbl">Material habitual</span><p class="hint" style="margin:0">${eqs.length?esc(eqs.join(" · ")):"aún sin datos"}</p></div>
      </div>
      <div class="grid-cards" style="margin-top:12px"><div class="mini-card"><span class="mini-lbl">Lo que más usas</span>${fav.length?`<ul class="apr-list">${fav.map(x=>`<li>${esc(x.nom)}</li>`).join("")}</ul>`:`<p class="hint">Se llena al aprobar o guardar clases.</p>`}</div>
        <div class="mini-card"><span class="mini-lbl">Lo que sueles quitar</span>${quit.length?`<ul class="apr-list">${quit.map(x=>`<li>${esc(x.nom)}</li>`).join("")}</ul>`:`<p class="hint">Nada todavía: aparece cuando quitas o cambias pasos.</p>`}</div>
        <div class="mini-card"><span class="mini-lbl">Tus estaciones propias</span><p class="strong" style="font-size:15px">${p.anclas.length}</p><p class="hint">Estaciones completas que pasaron a ser opciones del generador.</p></div></div>
      <div class="card" style="margin-top:14px"><label class="mini">Qué tanto seguir mi formato al generar</label><div class="seg">${[["mucho","Mucho"],["medio","Medio"],["poco","Poco"]].map(([k,l])=>`<button data-action="ap-peso" data-v="${k}" class="${peso===k?"on":""}">${l}</button>`).join("")}</div>
        <p class="hint">Mucho: usa tu orden de bloques, tus conteos y tus estaciones favoritas. Poco: variedad de la biblioteca con un toque de tu estilo.</p>
        <div class="acts" style="margin-top:12px"><button class="btn" data-action="ap-guardadas">Aprender de mis rutinas guardadas</button><button class="btn ghost" data-action="ap-olvidar">Olvidar todo lo aprendido</button></div></div></section></div>`;
}
function aprPrevHtml(pv){
  const tot=pv.bloques.reduce((a,b)=>a+b.pasos.length,0), rec=pv.bloques.reduce((a,b)=>a+b.pasos.filter(p=>p.reconocido).length,0);
  return `<section class="blk" style="margin-top:24px"><div class="blk-head"><div><h2>Esto entendí</h2><p>${pv.bloques.length} bloques · ${tot} pasos · ${rec} ya los conocía, ${tot-rec} son nuevos y los aprenderé</p></div><div class="acts"><button class="btn primary" data-action="ap-guardar">Guardar y aprender</button><button class="btn" data-action="ap-abrir">Abrir como rutina</button></div></div>
    ${pv.avisos.length?`<div class="alert-list" style="margin-bottom:12px">${pv.avisos.map(a=>`<div class="alert warn">⚠ ${esc(a)}</div>`).join("")}</div>`:""}
    <div class="sections">${pv.bloques.map(b=>`<section class="sec"><div class="sec-head" style="--tagc:${tagColor(EST_TAG[b.bk]||"core")}"><h3>${esc(b.titulo||ARM_NOM[b.bk])}</h3><span class="s-meta">${ARM_NOM[b.bk]||b.bk} · ${b.pasos.length} pasos</span></div>
      ${b.pasos.map((p,i)=>{ const t=estQTxt(p.q); return `<div class="arm-step"><span class="idx">${String(i+1).padStart(2,"0")}</span><div class="as-main"><div class="as-nom">${esc(p.nombre)} ${p.side?`<span class="chip solid">Lado ${p.side}</span>`:""}<span class="chip ${p.reconocido?"ok":"warn"}">${p.reconocido?"conocido":"nuevo"}</span></div><div class="as-meta"><span class="n">${esc((t.n+" "+t.u).trim())}</span> · ${esc(p.eq)}${p.q.nota?" · "+esc(p.q.nota):""}</div></div></div>`; }).join("")}</section>`).join("")}</div></section>`;
}
function apClick(a,t){
  if(a==="ap-entender"){
    const txt=(document.querySelector(".apr-txt")||{}).value||APRUI.txt; APRUI.txt=txt;
    APRUI.prev=aprParsear(txt,state.cfg.base||8); if(!APRUI.prev.bloques.length){ toast(APRUI.prev.avisos[0]||"No entendí la clase"); APRUI.prev=null; }
    render(); const el=document.querySelector(".apr-form+.blk"); if(el) el.scrollIntoView({behavior:"smooth",block:"start"}); return true; }
  if(a==="ap-cancelar"){ APRUI.prev=null; APRUI.txt=""; APRUI.nombre=""; render(); return true; }
  if(a==="ap-guardar"||a==="ap-abrir"){
    const r=aprConstruirRutina(APRUI.prev,APRUI.nombre.trim()||("Clase importada · "+fmtCorto(todayStr())));
    aprAprender(r,3,"clase"); const p=aprPerfil(); p.importadas.unshift({nombre:r.nombre,fecha:todayStr(),pasos:r.sections.reduce((n,s)=>n+s.slots.length,0)}); p.importadas=p.importadas.slice(0,30); LS.set(APR_KEY,p);
    const snap=deepClone(r); snap.id=rid(); state.saved.unshift(snap); LS.set("sf_saved",state.saved);
    const n=r.sections.reduce((a,s)=>a+s.slots.length,0);
    APRUI.prev=null; APRUI.txt=""; APRUI.nombre="";
    if(a==="ap-abrir"){ state.routine=r; state.cfg.metodo="sculpt"; state.screen="planner"; render(); window.scrollTo(0,0); }
    else render();
    toast("Aprendí de tu clase ("+n+" pasos) y quedó en Biblioteca"); return true; }
  if(a==="ap-peso"){ const p=aprPerfil(); p.peso=t.dataset.v; LS.set(APR_KEY,p); render(); return true; }
  if(a==="ap-guardadas"){ const n=aprDeGuardadas(); render(); toast(n?"Aprendí de "+n+" rutinas guardadas":"No hay rutinas nuevas de las que aprender"); return true; }
  if(a==="ap-olvidar"){
    const antes=clone(aprPerfil()); LS.set(APR_KEY,aprNuevo()); (antes.anclas||[]).forEach(an=>{ delete EST_ANCHORS[an.id]; }); render();
    toastUndo("Se olvidó lo aprendido",()=>{ LS.set(APR_KEY,antes); aprRegistrarGuardado(); render(); }); return true; }
  return false;
}
function apInput(a,t){
  if(a==="ap-txt"){ APRUI.txt=t.value; return true; }
  if(a==="ap-nombre"){ APRUI.nombre=t.value; return true; }
  return false;
}
