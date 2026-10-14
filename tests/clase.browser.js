/* Prueba en navegador del motor de clases: Fuerza v2, duración, calidad y música (usa boot.js) */
window.claseTest=async function(){
  await bootTest();
  const F=[]; const ok=(c,m)=>{ if(!c) F.push(m); }; const info={}; const $=s=>document.querySelector(s);
  // ---------- FUERZA v2 ----------
  const cfgF=(o)=>Object.assign({},state.cfg,{metodo:'fuerza',fModo:'full',objetivo:'media',fDuracion:55,fPorBloque:'auto',calent:true,enfr:true},o||{});
  const rows=[]; let malos=[];
  for(const modo of ['full','torso','pierna','gluteoabs']) for(const nivel of ['ligera','media','pesada','muypesada']) for(const d of [30,45,55,65]) for(let k=0;k<2;k++){
    const r=generate(cfgF({fModo:modo,objetivo:nivel,fDuracion:d,descanso:OBJETIVOS[nivel].descanso})), est=estimateMinutes(r), work=r.sections.filter(s=>s.kind==='work');
    rows.push({d,est});
    if(!r.v2) malos.push('no v2'); if(work.length!==3) malos.push('bloques '+work.length);
    if(work.some(s=>s.slots.length<1||(d>=45&&s.slots.length<2))) malos.push(modo+nivel+d+' bloque corto '+work.map(s=>s.slots.length));
    if(work.some(s=>s.slots[0].rol!=='P')) malos.push('el primero no es principal');
    if(Math.abs(est-(d-3))>(d===30?13:7)) malos.push(modo+'/'+nivel+'/'+d+' duración '+est);
    const refs=work.flatMap(s=>s.slots.map(x=>x.ref)); if(new Set(refs).size!==refs.length) malos.push('ejercicio repetido');
    const fam=work.flatMap(s=>s.slots.filter(x=>x.rol!=='A').map(x=>fzFam(byId[x.ref]))); if(new Set(fam).size<fam.length-1) malos.push(modo+nivel+d+' familias repetidas '+fam);
    const P=work[0].slots[0]; const esp=FZ_DIF[nivel].P; if(P.sets>esp.sets||P.sets<3||P.rep[0]!==esp.rep[0]) malos.push('prescripción del principal '+P.sets+'x'+P.rep+' vs '+esp.sets);
    const fin=r.sections.find(s=>s.kind==='cardioFin'); if(fin.slots.length<2||new Set(fin.slots.map(x=>x.ref)).size!==fin.slots.length) malos.push('finisher');
    const prep=r.sections.find(s=>s.kind==='prep'); if(!prep||prep.slots.length<3) malos.push('calentamiento');
  }
  ok(!malos.length,'Fuerza: '+malos.slice(0,6).join(' || '));
  info.fuerzaDur=[30,45,55,65].map(d=>{ const a=rows.filter(x=>x.d===d).map(x=>x.est); return d+':'+Math.min(...a)+'-'+Math.max(...a); }).join(' ');
  // cada dificultad usa otras reps y descansos; el número de ejercicios crece con la duración
  const mediaEj=d=>{ const a=[]; for(let i=0;i<6;i++){ const r=generate(cfgF({objetivo:'media',fDuracion:d,descanso:60})); a.push(r.sections.filter(s=>s.kind==='work').reduce((x,s)=>x+s.slots.length,0)); } return a.reduce((x,y)=>x+y,0)/a.length; };
  const e30=mediaEj(30), e65=mediaEj(65); ok(e65>e30+1.5,'más duración = más ejercicios ('+e30+' → '+e65+')');
  const r=generate(cfgF({objetivo:'pesada',descanso:80,fDuracion:55}));
  const rt=routineText(r); ok(/principal 4 × 6–8/.test(rt)&&/descanso \d+ s/.test(rt)&&!/undefined|NaN/.test(rt),'texto de la clase'); ok(!/reps de activación/.test(rt),'calentamiento con cantidades propias');
  // planner
  state.routine=r; state.screen='planner'; render(); const tx=$('#app').textContent; ok(/Principal/.test(tx)&&/Accesorio|Secundario/.test(tx),'el planner muestra los roles'); ok(!/undefined|NaN/.test(tx),'planner sin undefined');
  // cambiar y añadir conservan el rol
  const S=r.sections.find(s=>s.kind==='work'), s0=S.slots[1], rolAntes=s0.rol, repAntes=JSON.stringify(s0.rep); swapSlot(S.id,s0.uid); ok(S.slots[1].rol===rolAntes&&JSON.stringify(S.slots[1].rep)===repAntes,'cambiar un ejercicio conserva rol y series');
  const n0=S.slots.length; const nuevo=fuerzaPool('push')[0]; addPicked(S.id,nuevo.id); ok(S.slots.length===n0+1&&S.slots[n0].rol==='A'&&S.slots[n0].sets>=2,'añadir queda como accesorio');
  // vista Instructor
  state.routine=generate(cfgF({objetivo:'pesada',descanso:80,fDuracion:55})); state.screen='planner'; render(); launchInstructor(); ok(!!state.iv&&state.iv.metodo==='fuerza','lanza Instructor');
  const rr=state.routine; let guard=0, visited=0, errInst=null;
  try{ while(state.iv&&state.iv.i<state.iv.steps.length-1&&guard++<60){ const st=state.iv.steps[state.iv.i]; const html=viewInstructor(); if(/undefined|NaN/.test(html)) errInst='undefined en paso '+state.iv.i;
      if(st.kind==='work'){ const sets=fSlot(st.slot,rr).sets; ok(state.iv.descanso===fSlot(st.slot,rr).rest,'descanso del paso '+state.iv.i+': '+state.iv.descanso+' vs '+fSlot(st.slot,rr).rest); ok(new RegExp('Serie 1/'+sets).test(html),'serie 1/'+sets); }
      visited++; ivGoto(1); fClearTimer(); } }catch(e){ errInst=String(e&&e.stack||e).slice(0,200); }
  ok(!errInst,'Instructor Fuerza: '+errInst); info.pasosInstructor=visited; ivExit();
  // ---------- los dos estilos viejos siguen abriendo ----------
  const vieja=JSON.parse(JSON.stringify(generate(cfgF({objetivo:'media'})))); delete vieja.v2; vieja.sections.forEach(S=>S.slots.forEach(s=>{ delete s.rol; delete s.sets; delete s.rep; delete s.rest; }));
  state.routine=vieja; state.screen='planner'; render(); ok(/series/.test($('#app').textContent)&&!/undefined|NaN/.test($('#app').textContent),'una clase guardada antes sigue abriendo'); ok(/3 × 10–12|3 × 8–10/.test(routineText(vieja)),'y usa su prescripción general');
  // ---------- SCULPT: llega a la duración pedida ----------
  const durS=[]; let malS=[];
  for(const modo of ['full','upper','pierna','core']) for(const nivel of ['ligera','media','pesada','muypesada']) for(const d of [30,45,60]) for(let k=0;k<3;k++){
    const r=generate(Object.assign({},state.cfg,{metodo:'sculpt',estilo:'estacion',modo,nivel,duracion:d,base:8,calent:false,enfr:true})), est=estimateMinutes(r);
    durS.push({d,est}); if(Math.abs(est-(d-5))>(modo==='core'&&d===60?20:d===30?5:4)) malS.push(modo+'/'+nivel+'/'+d+' → '+est);
    const work=r.sections.filter(S=>S.kind==='work'); if(work.some(S=>S.slots.length<3)) malS.push(modo+nivel+d+' bloque de <3 pasos');
    if(!r.sections.some(S=>S.bk==='reto')) malS.push('sin reto'); if(d>=45&&!r.sections.some(S=>S.bk==='cierre')) malS.push('sin cierre');
    if(/undefined|NaN/.test(routineText(r))) malS.push('texto con undefined');
  }
  ok(!malS.length,'Sculpt duración: '+malS.slice(0,6).join(' || ')); info.sculptDur=[30,45,60].map(d=>{ const a=durS.filter(x=>x.d===d).map(x=>x.est); return d+':'+Math.min(...a)+'-'+Math.max(...a); }).join(' ');
  // ---------- CALIDAD ----------
  const prom=(f,n)=>{ let a=0; for(let i=0;i<n;i++) a+=f(); return a/n; };
  { const bh=bumpHistoria; bumpHistoria=()=>{}; const cs=()=>Object.assign({},state.cfg,{metodo:'sculpt',estilo:'estacion',modo:'full',nivel:'media',duracion:45,base:8,calent:false,enfr:true}); const med=a=>{ a=a.slice().sort((x,y)=>x-y); return a[Math.floor(a.length/2)]; }; let ganó=0, sum=0; for(let i=0;i<20;i++){ const c0=[...Array(10)].map(()=>claseCalidad(_generate(cs())).score), g=claseCalidad(generate(cs())).score; sum+=g; if(g>=med(c0)) ganó++; } bumpHistoria=bh; ok(ganó>=15,'Sculpt: generate() elige una clase por encima de la mediana ('+ganó+'/20)'); info.sculptMediana=ganó+'/20 · calidad media '+Math.round(sum/20); ok(sum/20>=85,'calidad media de Sculpt ≥ 85 ('+Math.round(sum/20)+')'); }
  { const bh=bumpHistoria; bumpHistoria=()=>{}; const med=a=>{ a=a.slice().sort((x,y)=>x-y); return a[Math.floor(a.length/2)]; }; let ganó=0; for(let i=0;i<20;i++){ const c0=[...Array(10)].map(()=>claseCalidad(_generate(cfgF({objetivo:'pesada',descanso:80}))).score), g=claseCalidad(generate(cfgF({objetivo:'pesada',descanso:80}))).score; if(g>=med(c0)) ganó++; } bumpHistoria=bh; ok(ganó>=15,'Fuerza: generate() elige una clase por encima de la mediana ('+ganó+'/20)'); info.fuerzaMediana=ganó+'/20'; }
  state.routine=generate(Object.assign({},state.cfg,{metodo:'sculpt',estilo:'estacion',modo:'full',nivel:'media',duracion:45,base:8,calent:false,enfr:true})); state.screen='planner'; render();
  ok(/Calidad de la clase/.test($('#app').textContent)&&!!$('.cal-score'),'el planner muestra la calidad'); ok(!/undefined|NaN/.test($('#app').textContent),'planner sin undefined');
  // ---------- GUION Y MÚSICA ----------
  { let malM=[]; const difs=[];
    const cfgs=[Object.assign({},state.cfg,{metodo:'sculpt',estilo:'estacion',modo:'full',nivel:'media',duracion:45,base:8,calent:false,enfr:true}),
      Object.assign({},state.cfg,{metodo:'sculpt',estilo:'estacion',modo:'pierna',nivel:'pesada',duracion:60,base:8,calent:false,enfr:true}),
      cfgF({objetivo:'media',fDuracion:55}),cfgF({objetivo:'pesada',fDuracion:45,descanso:80})];
    for(const c of cfgs) for(let k=0;k<8;k++){
      const r=generate(c); r.musica=null; const m=musAsegurar(r), G=claseGuion(r), C=musCola(r), ids=C.q.map(x=>x.t.id);
      difs.push(C.total-G.total); if(Math.abs(C.total-G.total)>200) malM.push((r.metodo)+' música '+claseHora(C.total)+' vs clase '+claseHora(G.total));
      if(new Set(ids).size!==ids.length) malM.push('canción repetida'); if(C.q.some(x=>!(x.t.dur>0))) malM.push('canción sin duración');
      if(Math.abs(G.total-estimateMinutes(r)*60)>130) malM.push('guion '+claseHora(G.total)+' ≠ estimado '+estimateMinutes(r));
      let fin=0; const desvios=m.bloques.map((b,bi)=>{ fin+=b.tracks.reduce((a,t)=>a+t.dur,0); return Math.abs(fin-G.bloques[bi].t1); }); if(desvios.filter(d=>d<=130).length<desvios.length*0.7) malM.push('los bloques no calzan con las canciones '+desvios.map(Math.round));
      const pasos=G.bloques.flatMap(b=>b.pasos); if(pasos.some((p,i)=>i&&p.t0+0.01<pasos[i-1].t0)||Math.abs(pasos[pasos.length-1].t1-G.total)>1) malM.push('tiempos de los pasos');
      const cierre=r.sections.findIndex(S=>S.bk==='cierre'); if(cierre>=0&&!m.bloques[cierre].tracks.every(t=>t.tag==='c'||t.usr)) malM.push('cierre sin música de relajación');
      if(/undefined|NaN/.test(musLineaHtml(r)+musTexto(r))) malM.push('guion con undefined');
    }
    ok(!malM.length,'Música/guion: '+malM.slice(0,5).join(' || ')); info.musicaDif=Math.round(difs.reduce((a,b)=>a+Math.abs(b),0)/difs.length)+' s de diferencia media';
    // pantalla Playlists
    state.routine=generate(cfgs[0]); state.screen='playlists'; render(); ok(/Guion minuto a minuto/.test($('#app').textContent)&&!/undefined|NaN/.test($('#app').textContent),'pantalla Playlists con guion');
    // Instructor con música (Sculpt)
    state.screen='planner'; render(); launchInstructor(); const iv=state.iv; ok(!!$('#iv-music')&&/Empezar música/.test($('#iv-music').textContent),'Instructor ofrece empezar la música');
    document.querySelector('[data-action="mu-iv-go"]').click(); ok(!!iv.mt0&&/Ahora|🎧/.test($('#iv-music').textContent),'música en marcha');
    const C=musCola(state.routine), seg=C.q[1]; iv.mt0=Date.now()-(seg.t0+10)*1000; iv.mk=-1; iv.running=false; ivMusicTick(); ok(iv.mk===1&&$('#iv-music').textContent.indexOf(seg.t.title)>=0,'sabe qué canción suena por el tiempo');
    if(seg.t.bpm) ok(iv.bpm===Math.round(seg.t.bpm),'el metrónomo toma el BPM de la canción ('+iv.bpm+' vs '+seg.t.bpm+')');
    document.querySelector('[data-action="mu-iv-sig"]').click(); ok(iv.mk===2||C.q.length<3,'siguiente canción'); document.querySelector('[data-action="mu-iv-ant"]').click(); ok(iv.mk===1||iv.mk===2||iv.mk===-1,'canción anterior');
    document.querySelector('[data-action="mu-iv-sync"]').click(); ok(iv.bpmSync===false,'se puede apagar BPM = canción');
    iv.elapsed=ivPlanDelta().plan+120; ivMusicTick(); ok(/atrasada/.test($('#iv-music').textContent),'avisa cuando vas atrasada contra el plan');
    ivExit();
    // Fuerza también lleva música
    state.routine=generate(cfgF({objetivo:'media',fDuracion:55})); state.screen='planner'; render(); launchInstructor(); ok(!!$('#iv-music'),'Instructor de Fuerza con música'); ivExit();
    // aprende tu ritmo al terminar
    delete Vault.data.sf.ritmo; for(let i=0;i<3;i++){ state.routine=generate(cfgs[0]); state.screen='planner'; render(); launchInstructor(); const raw=state.routine.sections.reduce((a,S)=>a+sectionSeconds(S,state.routine),0); state.iv.i=state.iv.steps.length-1; state.iv.finT=Math.round(raw*1.2); state.iv.elapsed=Math.round(raw*1.2); ivExit(); }
    const rf=Vault.data.sf.ritmo; ok(rf&&rf.n===3&&rf.f>1.12&&rf.f<1.3,'aprende tu ritmo (factor '+(rf&&rf.f.toFixed(2))+')'); info.ritmo=rf&&rf.f.toFixed(2);
    const e1=estimateMinutes(state.routine); delete Vault.data.sf.ritmo; const e0=estimateMinutes(state.routine); ok(e1>e0,'con tu ritmo la estimación crece ('+e0+' → '+e1+')');
  }
  // ---------- APOYO: carga sugerida y opciones fácil / difícil ----------
  { const r=generate(Object.assign({},state.cfg,{metodo:'sculpt',estilo:'estacion',modo:'full',nivel:'pesada',duracion:45,base:8,calent:false,enfr:true}));
    const conMan=r.sections.filter(S=>S.kind==='work'&&S.slots.some(s=>s.eq==='mancuernas')); ok(conMan.length>=2&&conMan.every(S=>/mancuernas \d/.test(S.carga||'')),'carga sugerida por bloque ('+conMan.map(S=>S.carga).join(' | ')+')');
    ok(/Carga sugerida: mancuernas/.test(routineText(r)),'la carga va en el texto exportado');
    let malO=[]; for(let i=0;i<30;i++){ const x=generate(i%2?cfgF({objetivo:'pesada',descanso:80}):Object.assign({},state.cfg,{metodo:'sculpt',estilo:'estacion',modo:['full','upper','pierna','core'][i%4],nivel:'media',duracion:45,base:8,calent:false,enfr:true}));
      x.sections.forEach(S=>S.slots.forEach(s=>{ const o=claseOpc(resolve(s)); if(o&&(!o.f||!o.d||/undefined/.test(o.f+o.d))) malO.push(S.nom); })); }
    ok(!malO.length,'opciones fácil/difícil completas '+malO.slice(0,3)); state.routine=r; state.screen='planner'; render(); ok(/Carga sugerida/.test($('#app').textContent)&&!!$('.cue.opc'),'el planner muestra carga y opciones');
    launchInstructor(); ok(!!$('.iv-opc'),'el Instructor muestra fácil / difícil'); ok(/kg/.test($('.iv').textContent),'y la carga'); ivExit(); }
  return {fallas:F,info,errs:__errs};
};
