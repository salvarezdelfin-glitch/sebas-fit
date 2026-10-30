/* ============================================================
   Cómo se sintió: un toque después de dar la clase. Lo que anotas ajusta las próximas:
   duración objetivo, qué tanto se castiga repetir, tolerancia a cambios de material, carga, y qué temas salen más.
   Estado: Vault.data.sf.fq = [{id,f,m,tema,para,ciclo:{id,n,v}|null,est,tags[]}] (las últimas 60)
   ============================================================ */
const FQ_TAGS=[["perfecta","🔥 Quedó perfecta"],["larga","⏱ Se sintió larga"],["corta","⚡ Se sintió corta"],["pesada","🏋 Muy pesada"],["ligera","🪶 Muy ligera"],["repetida","🔁 Se sintió repetida"],["sinritmo","🧩 Muchos cambios, sin ritmo"],["musica","🎧 La música no pegó"]];
const FQ_TXT={perfecta:"quedó perfecta",larga:"se sintió larga",corta:"se sintió corta",pesada:"muy pesada",ligera:"muy ligera",repetida:"se sintió repetida",sinritmo:"sin ritmo",musica:"la música no pegó"};
const FQ_EXCL={perfecta:["larga","corta","pesada","ligera","repetida","sinritmo","musica"],larga:["corta","perfecta"],corta:["larga","perfecta"],pesada:["ligera","perfecta"],ligera:["pesada","perfecta"],repetida:["perfecta"],sinritmo:["perfecta"],musica:["perfecta"]};
function FQ(){ const sf=Vault.data.sf; return sf.fq||(sf.fq=[]); }
const fqRec=(metodo,n)=>FQ().filter(x=>!metodo||x.m===metodo).slice(0,n);
const fqN=(L,tag)=>L.filter(x=>x.tags.includes(tag)).length;
/* sesgos que lee el generador y el calificador (de tus últimas 4 clases del mismo método) */
function fqSesgos(metodo){
  const L=fqRec(metodo,4), pes=fqN(L,"pesada")-fqN(L,"ligera");
  return {min:Math.max(-3,Math.min(3,fqN(L,"larga")-fqN(L,"corta"))),rep:Math.min(3,fqN(L,"repetida")),ritmo:Math.min(2,fqN(L,"sinritmo")),pes:Math.min(2,Math.max(0,pes)),lig:Math.min(2,Math.max(0,-pes))};
}
function fqResumen(metodo){
  const L=fqRec(metodo,4); if(!L.length) return ""; const c={}; L.forEach(x=>x.tags.forEach(t=>{ c[t]=(c[t]||0)+1; }));
  const t=Object.keys(c).filter(k=>k!=="musica"||c[k]>0).sort((a,b)=>c[b]-c[a]).slice(0,3).map(k=>FQ_TXT[k]+(c[k]>1?" ×"+c[k]:""));
  return t.length?"Tus últimas clases: "+t.join(", ")+". Las próximas se ajustan a eso.":"";
}
/* los temas que "pegaron" salen más; los que se sintieron repetidos o sin ritmo, menos */
function fqTemaPeso(metodo,tema){
  let p=1; fqRec(metodo,10).filter(x=>x.tema===tema).forEach(x=>{ if(x.tags.includes("perfecta")) p*=1.4; if(x.tags.some(t=>t==="repetida"||t==="sinritmo"||t==="musica")) p*=0.7; });
  return Math.max(0.35,Math.min(2,p));
}
function fqGuardar(r,tags){
  if(!r||!tags.length) return;
  FQ().unshift({id:rid(),f:Date.now(),m:r.metodo,tema:r.tema||"",para:r.para||"",ciclo:r.ciclo?{id:r.ciclo.id,n:r.ciclo.n,v:r.ciclo.v}:null,est:typeof estimateMinutes==="function"?estimateMinutes(r):0,tags:tags.slice()});
  Vault.data.sf.fq=FQ().slice(0,60); touch();
}
function fqAbrir(r){ if(!r) return; state.modal={type:"fq",data:{tags:[],r}}; renderOverlay(); }
function fqModal(md){
  const d=md.data, r=d.r;
  return modalShell("¿Cómo se sintió la clase?",`<p class="hint" style="margin-top:0">${esc(r.nombre||"")}. Un toque y listo: la app ajusta las próximas clases${r.ciclo?" (y lo guarda en la semana "+r.ciclo.n+" de tu ciclo)":""}.</p>
    <div class="fq-tags">${FQ_TAGS.map(([k,l])=>`<button class="chip es-chip ${d.tags.includes(k)?"on":""}" data-action="fq-tag" data-k="${k}">${l}</button>`).join("")}</div>
    <p class="hint"><button class="link-btn" data-action="fq-detalle">Más detalle: ejercicios, música, notas →</button></p>`,
    `<button class="btn ghost" data-action="close-modal">Saltar</button><button class="btn primary" data-action="fq-guardar" ${d.tags.length?"":"disabled"}>Guardar</button>`);
}
function fqClick(a,t){
  if(a==="fq-abrir"){ fqAbrir(state.routine); return true; }
  if(!state.modal||state.modal.type!=="fq") return true;
  const d=state.modal.data;
  if(a==="fq-tag"){ const k=t.dataset.k; if(d.tags.includes(k)) d.tags=d.tags.filter(x=>x!==k); else d.tags=d.tags.filter(x=>!(FQ_EXCL[k]||[]).includes(x)).concat(k); renderOverlay(); return true; }
  if(a==="fq-guardar"){ fqGuardar(d.r,d.tags); closeModal(); render(); toast("Anotado — las próximas clases se ajustan"); return true; }
  if(a==="fq-detalle"){ fqGuardar(d.r,d.tags); state.modal={type:"feedback",data:{energia:"Media",malos:[],favorito:"",notaMusica:"",notaLibre:""}}; renderOverlay(); return true; }
  return false;
}
/* al terminar la clase en Instructor y salir, pregunta cómo se sintió */
const _ivExit0=ivExit;
window.ivExit=function(){
  const iv=state.iv, r=state.routine, fin=!!(iv&&r&&iv.steps&&(iv.i>=iv.steps.length-1||iv.finT));
  _ivExit0(); if(fin) fqAbrir(r);
};
/* el estudio ("Para:") viaja con la clase para saber dónde la diste */
const _generate0=generate;
window.generate=function(cfg){ const r=_generate0(cfg); if(r&&cfg&&cfg.para) r.para=cfg.para; return r; };
/* nota del ciclo: lo que anotaste la semana anterior */
function fqCicloNota(ciclo){
  if(!ciclo) return ""; const L=FQ().filter(x=>x.ciclo&&x.ciclo.id===ciclo.id&&(x.ciclo.n===ciclo.n-1||x.ciclo.n===ciclo.n)).slice(0,4); if(!L.length) return "";
  const c={}; L.forEach(x=>x.tags.forEach(t=>{ c[t]=(c[t]||0)+1; })); const txt=Object.keys(c).map(k=>FQ_TXT[k]).join(", ");
  return `<p class="hint fq-nota">💬 Lo que anotaste en esta etapa del ciclo: ${esc(txt)}. Ajusta el reto de la semana si hace falta.</p>`;
}
const _cicloBanner0=cicloBannerHtml;
window.cicloBannerHtml=function(r){ return _cicloBanner0(r)+(r&&r.ciclo?fqCicloNota(r.ciclo):""); };
const _cicloHoy0=cicloHoyBlk;
window.cicloHoyBlk=function(){ const h=_cicloHoy0(); try{ const w=typeof ciSemanaActual==="function"?ciSemanaActual():null, ac=Vault.data.sf.cicloActivo; if(w&&ac&&w.n) return h+fqCicloNota({id:ac.id,n:w.n}); }catch(e){} return h; };
