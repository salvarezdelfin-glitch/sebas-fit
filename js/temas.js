"use strict";
/* ============================================================
   TEMAS DE CLASE: que dos clases seguidas se SIENTAN distintas, no solo que cambie un ejercicio.
   Cada clase elige un tema (la app evita repetir el de las últimas) que cambia el ritmo, las cantidades,
   el orden de los bloques, el enfoque, el cierre y, en Fuerza, la forma de las series y el finisher.
   ============================================================ */
const TEMAS_SCULPT=[
  {id:"clasica",nom:"Clásica",desc:"Tu formato de siempre",peso:1.4,m:{hold:1,pul:1,reps:1},orden:[["up","leg","glu","abs"]],mood:0},
  {id:"pulsos",nom:"Quema de pulsos",desc:"Más pulsos, holds cortos y una ráfaga final en pierna",peso:1,m:{hold:.7,pul:1.5,reps:1.15},orden:[["up","leg","glu","abs"],["leg","up","glu","abs"]],mood:6,nota:{pulsos:"Ráfaga: sin pausa entre pulsos"},post:"rafaga"},
  {id:"isometria",nom:"Isométrica",desc:"Holds largos y poco rebote: aguantar y respirar",peso:1,m:{hold:1.6,pul:.7,reps:.85},orden:[["up","leg","glu","abs"],["leg","up","glu","abs"]],mood:-6,nota:{hold:"Respira largo, no sueltes"}},
  {id:"escalera",nom:"Escalera",desc:"En cada bloque la cuenta baja: 12 · 10 · 8 · 6",peso:1,m:{hold:1,pul:1,reps:1},orden:[["up","leg","glu","abs"],["leg","up","glu","abs"]],mood:2,post:"escalera",nota:{reps:"Escalera: baja la cuenta cada vuelta"}},
  {id:"tempo",nom:"Tempo lento",desc:"Menos repeticiones y más control: 3 segundos bajando",peso:1,m:{hold:1.2,pul:.8,reps:.6},orden:[["up","leg","glu","abs"],["leg","up","glu","abs"]],mood:-8,nota:{reps:"3 s bajando · 1 s abajo · sube con fuerza"}},
  {id:"piramide",nom:"Pirámide de holds",desc:"En cada bloque los holds suben: 10 · 20 · 30 · 40 s",peso:1,m:{hold:1,pul:1,reps:1},orden:[["up","leg","glu","abs"],["leg","up","glu","abs"]],mood:0,post:"piramide",nota:{hold:"Pirámide: cada hold dura más"}},
  {id:"foco_glu",nom:"Enfoque glúteo",desc:"Dos estaciones de glúteo y tren superior más corto",peso:.9,foco:"glu",m:{hold:1.1,pul:1.1,reps:1},orden:[["up","leg","glu","abs"]],mood:-2},
  {id:"foco_pierna",nom:"Enfoque pierna",desc:"Pierna con todas las capas y ráfaga final",peso:.9,foco:"leg",m:{hold:1.15,pul:1.2,reps:1},orden:[["leg","up","glu","abs"],["up","leg","glu","abs"]],mood:2,post:"rafaga"},
  {id:"foco_brazos",nom:"Enfoque tren superior",desc:"Dos tríos de brazos y espalda: más mancuernas",peso:.9,foco:"up",m:{hold:1,pul:1,reps:1.1},orden:[["up","leg","glu","abs"]],mood:2}
];
const TEMAS_FUERZA=[
  {id:"clasica",nom:"Clásica",desc:"Principal pesado, secundario y accesorios",peso:1.3},
  {id:"piramide",nom:"Pirámide",desc:"El principal baja repeticiones y sube la carga: 10 · 8 · 6 · 5",peso:1},
  {id:"tempo",nom:"Tempo y control",desc:"Bajas en 4 segundos: menos repeticiones, más tensión",peso:1},
  {id:"densidad",nom:"Densidad",desc:"Descansos cortos y casi todo en biseries",peso:1},
  {id:"volumen",nom:"Volumen",desc:"Una serie más y más repeticiones: bombeo",peso:1},
  {id:"cluster",nom:"Fuerza 5×5",desc:"Principal 5 × 5 con descanso largo y pocos accesorios",peso:.9}
];
let FZ_TEMA=null;   // tema de la clase de Fuerza que se está armando
const temaLista=m=>m==="fuerza"?TEMAS_FUERZA:TEMAS_SCULPT;
const temaPorId=(m,id)=>temaLista(m).find(t=>t.id===id)||temaLista(m)[0];
const temaDe=r=>r&&r.metodo!=="barre"?temaPorId(r.metodo,r.tema):null;
/* elige el tema de esta clase: el que tú fijaste, o uno que no se parezca a las últimas */
function temaElegir(metodo,cfg){
  const lista=temaLista(metodo); let pool=lista; if(metodo!=="fuerza"&&(cfg.modo!=="full"||(cfg.duracion&&cfg.duracion<=30))) pool=lista.filter(t=>!t.foco);   // los enfoques necesitan tiempo: no en clases de 30 min
  const pin=cfg.tema; if(pin&&pin!=="auto"){ const t=lista.find(x=>x.id===pin); if(t) return t; }
  const rec=((state.historia.temas||[]).filter(x=>x.m===metodo).map(x=>x.t));
  const w=pool.map(t=>{ let p=t.peso||1; const i=rec.indexOf(t.id); if(i===0) p*=0.02; else if(i===1) p*=0.25; else if(i===2) p*=0.55; if(typeof fqTemaPeso==="function") p*=fqTemaPeso(metodo,t.id); return p; });
  let x=Math.random()*w.reduce((a,b)=>a+b,0); for(let i=0;i<pool.length;i++){ x-=w[i]; if(x<=0) return pool[i]; } return pool[0];
}
function temaRegistrar(r){
  if(!r||r.metodo==="barre"||!r.tema) return; const h=state.historia; h.temas=h.temas||[]; h.temas.unshift({m:r.metodo,t:r.tema}); h.temas=h.temas.slice(0,10);
  if(r.metodo==="fuerza"){ const f=r.sections.find(S=>S.kind==="cardioFin"); if(f&&f.formato){ h.fins=h.fins||[]; h.fins.unshift(f.formato); h.fins=h.fins.slice(0,4); } }
  h.huellas=h.huellas||[]; h.huellas.unshift(claseHuella(r)); h.huellas=h.huellas.slice(0,6);
}
/* huella: lo que hace que una clase "se sienta" como otra (no solo los ejercicios) */
function claseHuella(r){
  const w=r.sections.filter(S=>S.kind==="work");
  return {m:r.metodo,tema:r.tema||"",orden:w.map(S=>S.bk||S.tag).join(">"),leg:(w.find(S=>S.bk==="leg")||{}).anchor||"",glu:(w.find(S=>S.bk==="glu")||{}).anchor||"",
    reto:((r.sections.find(S=>S.bk==="reto")||{slots:[{}]}).slots[0]||{}).ref||"",fin:(r.sections.find(S=>S.kind==="cardioFin")||{}).formato||"",
    refs:w.flatMap(S=>S.slots.map(s=>s.ref))};
}
/* 0 = idéntica a las últimas, 1 = totalmente distinta */
function claseNovedad(r){
  let hs=(state.historia.huellas||[]).filter(x=>x.m===r.metodo); if(BUMPED.has(r)) hs=hs.slice(1); hs=hs.slice(0,3); if(!hs.length) return 1;
  const h=claseHuella(r), A=new Set(h.refs); let pen=0;
  hs.forEach((x,i)=>{ const w=i===0?1:i===1?.6:.35; const B=new Set(x.refs); let inter=0; A.forEach(k=>{ if(B.has(k)) inter++; }); const jac=inter/Math.max(1,A.size+B.size-inter);
    pen+=w*(jac*2+(x.tema===h.tema&&h.tema?1.2:0)+(x.orden===h.orden?.5:0)+(x.leg&&x.leg===h.leg?.7:0)+(x.glu&&x.glu===h.glu?.7:0)+(x.reto&&x.reto===h.reto?.5:0)+(x.fin&&x.fin===h.fin?.6:0)); });
  return Math.max(0,1-pen/3.2);
}

/* ---------- Sculpt: lo que el tema cambia después de armar los bloques ---------- */
function temaPostSculpt(r){
  const T=temaDe(r); if(!T||r.metodo!=="sculpt"||r.estilo!=="estacion") return; const base=r.base||8;
  r.sections.forEach(S=>{
    if(S.kind!=="work") return; const libres=S.slots.filter(s=>s.q&&!s.q.fijo);
    if(T.post==="escalera"){
      const reps=libres.filter(s=>s.q.t==="reps"&&!s.q.por), f=[1.5,1.25,1,.75]; reps.forEach((s,i)=>{ s.q.n=Math.max(4,Math.round(base*f[Math.min(i,f.length-1)])); });
      libres.filter(s=>s.q.t==="pulsos").forEach((s,i)=>{ s.q.n=Math.max(15,35-5*i); });
    }
    if(T.post==="piramide") libres.filter(s=>s.q.t==="hold").forEach((s,i)=>{ s.q.s=Math.min(50,10+10*i); });
    if(T.nota){ const usados={}; libres.forEach(s=>{ const k=s.q.t==="pulsos"?"pulsos":s.q.t==="hold"?"hold":s.q.t==="reps"?"reps":null; if(!k||!T.nota[k]) return; usados[k]=(usados[k]||0)+1; if(usados[k]===1&&!s.nota) s.nota=T.nota[k]; }); }
    if(T.post==="rafaga"&&S.bk==="leg"&&!S.slots.some(s=>/Ráfaga final/.test(s.nota||""))){
      const p=S.slots.slice().reverse().find(s=>s.q&&s.q.t==="pulsos"); if(p){ const x=Object.assign({},p,{uid:uid(),q:Object.assign({},p.q,{n:Math.max(15,Math.round(p.q.n*0.6)),fijo:false}),nota:"Ráfaga final: sin pausa"}); const i=S.slots.findIndex(s=>byId[s.ref].layer==="falla"); S.slots.splice(i<0?S.slots.length:i,0,x); }
    }
  });
}

/* ---------- Fuerza: lo que el tema cambia en cada ejercicio ---------- */
function temaFzSlot(x,rol){
  const tm=FZ_TEMA; if(!tm||tm.id==="clasica") return; const lo=x.rep[0], hi=x.rep[1];
  if(tm.id==="piramide"&&rol==="P"){ const n=x.sets>=4?4:3; x.sets=n; x.pir=(n===4?[hi+2,hi,lo,Math.max(3,lo-1)]:[hi+1,hi,lo]).join(" · "); x.nota="Pirámide: sube la carga en cada serie"; }
  else if(tm.id==="tempo"){ if(rol==="A"){ x.tempo="3-0-1"; } else { x.tempo="4-1-1"; x.rep=[Math.max(3,lo-2),Math.max(4,hi-2)]; x.nota="Baja en 4 segundos y pausa 1 s abajo"; } }
  else if(tm.id==="densidad"){ x.rest=Math.max(30,Math.round(x.rest*0.6/5)*5); x.rep=[lo+2,hi+2]; }
  else if(tm.id==="volumen"&&rol!=="P"){ x.sets=Math.min(4,x.sets+1); x.rep=[lo+2,hi+2]; x.rest=Math.max(30,x.rest-10); }
  else if(tm.id==="cluster"){ if(rol==="P"){ x.sets=5; x.rep=[5,5]; x.rest=Math.max(90,x.rest); } else if(rol==="S"){ x.sets=3; x.rep=[6,8]; } else { x.sets=2; x.rep=[10,12]; } }
}
/* formas de cerrar la clase: no siempre el mismo circuito */
const FZ_FIN={circuito:{nom:"Circuito metabólico",n:3,work:40,rest:20},tabata:{nom:"Tabata 20/10",n:2,work:20,rest:10},largo:{nom:"Intervalos largos 50/10",n:2,work:50,rest:10},escalera:{nom:"Escalera 30/15",n:4,work:30,rest:15}};
function fzFinFormato(){ const rec=(state.historia.fins||[]).slice(0,2), op=Object.keys(FZ_FIN).filter(f=>!rec.includes(f)); return op[Math.floor(Math.random()*op.length)]; }
function fzFinisher(minCardio,dif,fmt){
  const F=FZ_FIN[fmt]||FZ_FIN.circuito, n=F.n; let work=F.work, rest=F.rest;
  if(fmt==="circuito"){ work=dif==="muypesada"?45:40; rest=dif==="ligera"?25:dif==="muypesada"?15:20; }
  const rondas=Math.max(2,Math.round((minCardio*60-40)/(n*(work+rest)))), orden=n===2?[0,2]:n===3?[0,0,2]:[0,0,0,2];
  const fuertes=LIB.filter(e=>e.b==="cardio"), usadas=new Set(), out=[];
  for(let i=0;i<n;i++){
    const pool=shuffle(fuertes.filter(e=>(e.f||0)===orden[i]&&!usadas.has(fzFam(e))&&!usadas.has(e.id)));
    const e=pool[0]||shuffle(fuertes.filter(x=>!usadas.has(x.id)))[0]; if(!e) continue; usadas.add(e.id); usadas.add(fzFam(e)); out.push(e);
  }
  return {slots:out.map(slot),protocolo:{work,rest,rondas},formato:fmt,nom:F.nom};
}

/* selector del tema en la pantalla Generar */
function temaSegHtml(c){
  const m=c.metodo==="fuerza"?"fuerza":"sculpt"; let lista=temaLista(m); if(m==="sculpt"&&c.modo!=="full") lista=lista.filter(t=>!t.foco);
  const cur=c.tema||"auto", sel=cur==="auto"?null:lista.find(t=>t.id===cur);
  return `<div class="seg" style="flex-wrap:wrap">${[["auto","Automático (cambia cada vez)"]].concat(lista.map(t=>[t.id,t.nom])).map(([k,l])=>`<button data-action="set-tema" data-v="${k}" class="${cur===k?"on":""}">${esc(l)}</button>`).join("")}</div><p class="hint">${sel?esc(sel.desc):"La app elige un tema distinto al de tus últimas clases: cambia el ritmo, el orden, las cantidades y el cierre."}</p>`;
}
