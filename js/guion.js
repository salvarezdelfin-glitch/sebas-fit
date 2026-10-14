"use strict";
/* ============================================================
   GUION DE LA CLASE: minuto a minuto, con la música alineada a cada bloque
   y dentro de la vista Instructor (qué suena, qué sigue, cuánto llevas contra el plan)
   ============================================================ */
function claseSlotSeg(S,s,r){
  if(r.estilo==="estacion"&&S.kind!=="prep") return estSegundos(s.q||(byId[s.ref]&&byId[s.ref].q),r.base||8);
  if(S.kind==="prep") return 60; if(S.kind==="cool") return 45;
  if(S.kind==="cardioFin"){ const p=S.protocolo; return (p.work+p.rest)*p.rondas+40/Math.max(1,S.slots.length); }
  if(r.metodo==="fuerza") return r.v2?fzSlotSeg(s,r):(r.series*(objetivoOf(r.objetivo).mid*3+r.descanso)+10);
  return 60;
}
/* tiempos de cada bloque y de cada paso (suman lo mismo que estimateMinutes) */
function claseGuion(r){
  const f=claseRitmoFactor(); let t=0; const bloques=[];
  r.sections.forEach((S,bi)=>{
    const dur=sectionSeconds(S,r)*f, raw=S.slots.map(s=>claseSlotSeg(S,s,r)||1), sum=raw.reduce((a,b)=>a+b,0)||1; let tt=t;
    const pasos=S.slots.map((s,i)=>{ const d=raw[i]/sum*dur, p={s,t0:tt,t1:tt+d}; tt+=d; return p; });
    bloques.push({S,i:bi,t0:t,t1:t+dur,dur,pasos}); t+=dur;
  });
  return {total:t,bloques};
}
function claseHora(sec){ sec=Math.max(0,Math.round(sec)); return Math.floor(sec/60)+":"+String(sec%60).padStart(2,"0"); }

/* de todas las canciones candidatas, las que mejor llenan el tiempo del bloque (sin pasarse ni quedarse cortas) */
function musElegirSet(rank,target){
  const cand=rank.slice(0,14); if(!cand.length||target<60) return [];
  const maxN=Math.min(6,Math.max(1,Math.ceil(target/150)+1)); let best=null, bv=-1e9;
  const dfs=(i,sel,sum,sc)=>{
    if(sel.length){ const v=sc*0.5-Math.abs(sum-target)/6; if(v>bv){ bv=v; best=sel.slice(); } }
    if(sel.length>=maxN) return;
    for(let j=i;j<cand.length;j++){ const d=cand[j].t.dur; if(sum+d>target+150) continue; sel.push(cand[j]); dfs(j+1,sel,sum+d,sc+cand[j].s); sel.pop(); }
  };
  dfs(0,[],0,0);
  return (best||[cand[0]]).map(x=>x.t);
}
/* la playlist como una sola cola: cuándo empieza cada canción */
function musCola(r){
  const m=musAsegurar(r); let t=0; const q=[];
  m.bloques.forEach((b,bi)=>b.tracks.forEach((tr,ti)=>{ q.push({t:tr,bi,ti,t0:t,t1:t+tr.dur}); t+=tr.dur; }));
  return {q,total:t};
}
/* dónde cae el cambio de cada bloque dentro de las canciones */
function musCortes(r){
  const G=claseGuion(r), C=musCola(r), out=[];
  G.bloques.forEach((b,bi)=>{
    if(bi===0) return; const T=b.t0, x=C.q.find(y=>T>=y.t0&&T<y.t1), nom=b.S.nom.replace(/^Bloque \d+ · /,"");
    if(!x) out.push({bi,nom,T,tipo:"fin"}); else { const off=T-x.t0; out.push({bi,nom,T,off,resta:x.t1-T,tr:x.t,tipo:off<=15||x.t1-T<=15?"ok":"corte"}); }
  });
  return out;
}
function musLineaHtml(r){
  const G=claseGuion(r), C=musCola(r); if(!C.q.length) return "";
  const dif=C.total-G.total, cortes=musCortes(r).filter(c=>c.tipo==="corte");
  return `<div class="card mu-linea"><div class="mu-lh"><b>Guion minuto a minuto</b><span class="hint">Clase ≈ ${claseHora(G.total)} · música ≈ ${claseHora(C.total)}${Math.abs(dif)>20?" ("+(dif>0?"+":"−")+claseHora(Math.abs(dif))+")":" ✔ calza"}</span></div>
    <div class="mu-bar">${G.bloques.map(b=>`<i style="flex:${Math.max(1,b.dur)};background:${tagColor(b.S.tag)}" title="${esc(b.S.nom)} · ${claseHora(b.t0)}–${claseHora(b.t1)}"><span>${esc(b.S.nom.replace(/^Bloque \d+ · /,"").slice(0,16))}</span></i>`).join("")}</div>
    <div class="mu-bar mu-bar-s">${C.q.map((x,k)=>`<i style="flex:${x.t1-x.t0}" class="${k%2?"b":"a"}" title="${esc(x.t.artist+" — "+x.t.title)} · ${claseHora(x.t0)}"></i>`).join("")}</div>
    ${cortes.length?`<p class="hint" style="margin:10px 0 0">Para que el cambio de bloque caiga con la canción: ${cortes.slice(0,4).map(c=>`<b>${esc(c.nom)}</b> empieza en ${claseHora(c.T)}, a ${claseHora(c.off)} de «${esc(c.tr.title)}»`).join(" · ")}. Si lo prefieres, corta la canción ahí o usa ↻ en el bloque.</p>`:`<p class="hint" style="margin:10px 0 0">Los cambios de bloque caen junto con el cambio de canción.</p>`}</div>`;
}

/* ---------- música dentro de la vista Instructor ---------- */
function ivMusicActual(){
  const iv=state.iv, r=state.routine; if(!iv||!r) return null; const C=musCola(r); if(!C.q.length) return null;
  if(!iv.mt0) return {C,k:-1,el:0};
  const el=(Date.now()-iv.mt0)/1000, k=C.q.findIndex(x=>el>=x.t0&&el<x.t1);
  return {C,k:k<0?(el>=C.total?C.q.length:-1):k,el};
}
function ivPlanDelta(){
  const iv=state.iv, r=state.routine; if(!iv||!r) return null;
  if(!iv.g) iv.g=claseGuion(r);
  let n=0, plan=null; for(const b of iv.g.bloques){ for(const p of b.pasos){ if(n===iv.i){ plan=p.t0; } n++; } }
  if(plan==null) return null; return {plan,delta:iv.elapsed-plan};
}
function ivMusicInner(){
  const iv=state.iv, a=ivMusicActual(); if(!a) return "";
  const {C,k,el}=a, pd=ivPlanDelta(), sync=iv.metodo==="sculpt";
  const link=t=>t?esc(t.url||musSearchUrl(t)):"#";
  let izq;
  if(!iv.mt0){ const t=C.q[0].t; izq=`<button class="iv-mbtn go" data-action="mu-iv-go">▶ Empezar música</button><span class="iv-mt">1.ª: <b>${esc(t.title)}</b> · ${esc(t.artist)}${t.bpm?" · ≈"+t.bpm+" BPM":""}</span>`; }
  else if(k>=C.q.length) izq=`<span class="iv-mt">🎧 Playlist terminada</span><button class="iv-mbtn" data-action="mu-iv-ant">⏮</button>`;
  else if(k<0) izq=`<span class="iv-mt">🎧 …</span>`;
  else { const x=C.q[k], nx=C.q[k+1]; izq=`<span class="iv-mt">🎧 <b>${esc(x.t.title)}</b> · ${esc(x.t.artist)}${x.t.bpm?" · ≈"+x.t.bpm+" BPM":""} · queda <b>${claseHora(x.t1-el)}</b>${nx?`<span class="iv-sig"> · sigue: ${esc(nx.t.title)}</span>`:""}</span><button class="iv-mbtn" data-action="mu-iv-ant" aria-label="Anterior">⏮</button><button class="iv-mbtn" data-action="mu-iv-sig" aria-label="Siguiente">⏭</button><a class="iv-mbtn" href="${link(x.t)}" target="_blank" rel="noopener" aria-label="Abrir en Spotify">♫</a>`; }
  const der=`${sync?`<button class="iv-mbtn ${iv.bpmSync===false?"":"on"}" data-action="mu-iv-sync" title="El metrónomo toma el BPM de la canción">BPM♪</button>`:""}${pd?`<span class="iv-plan ${Math.abs(pd.delta)<=45?"ok":pd.delta>0?"late":"early"}">plan ${claseHora(pd.plan)} · ${Math.abs(pd.delta)<=45?"en tiempo":(pd.delta>0?"+":"−")+claseHora(Math.abs(pd.delta))+(pd.delta>0?" atrasada":" adelantada")}</span>`:""}`;
  return izq+`<span class="spacer"></span>`+der;
}
function ivMusicHtml(){ const a=ivMusicActual(); if(!a) return ""; return `<div class="iv-music" id="iv-music">${ivMusicInner()}</div>`; }
function ivMusicTick(){
  const iv=state.iv; if(!iv) return; const el=document.getElementById("iv-music"); if(!el) return;
  const a=ivMusicActual(); if(!a) return;
  if(iv.mt0&&a.k>=0&&a.k<a.C.q.length&&a.k!==iv.mk){                                        // cambió la canción
    iv.mk=a.k; const t=a.C.q[a.k].t;
    if(iv.metodo==="sculpt"&&iv.bpmSync!==false&&t.bpm&&!iv.running){ iv.bpm=Math.max(60,Math.min(180,Math.round(t.bpm))); const ring=document.getElementById("iv-ring"); if(ring&&/^\d+$/.test(ring.textContent.trim())){ ring.textContent=iv.bpm; ring.style.setProperty("--beat",(60/iv.bpm)+"s"); } }
  }
  el.innerHTML=ivMusicInner();
}
function ivMusicClick(a,t){
  const iv=state.iv; if(!iv) return true; const act=ivMusicActual(); if(!act) return true;
  if(a==="mu-iv-go"){ iv.mt0=Date.now(); iv.mk=-1; }
  else if(a==="mu-iv-sig"){ const nx=act.C.q[act.k+1]; if(nx){ iv.mt0=Date.now()-nx.t0*1000; iv.mk=-1; } }
  else if(a==="mu-iv-ant"){ const cur=act.C.q[act.k], prev=act.C.q[Math.max(0,act.k-1)]; const x=cur&&act.el-cur.t0>6?cur:prev||act.C.q[0]; iv.mt0=Date.now()-x.t0*1000; iv.mk=-1; }
  else if(a==="mu-iv-sync"){ iv.bpmSync=iv.bpmSync===false?true:false; }
  ivMusicTick(); return true;
}
/* al salir de la vista Instructor: si llegaste al final, aprende cuánto tardas de verdad */
function claseAlSalir(){
  const iv=state.iv, r=state.routine; if(!iv||!r||!iv.steps) return;
  if(iv.i<iv.steps.length-1&&!iv.finT) return;
  const raw=r.sections.reduce((a,S)=>a+sectionSeconds(S,r),0), real=(iv.finT||iv.elapsed)+60;
  if(real>=raw*0.5&&real<=raw*2) claseRitmoGuardar(raw,real);
}
