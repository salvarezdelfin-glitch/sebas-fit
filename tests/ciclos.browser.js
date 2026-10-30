/* Prueba en navegador de los ciclos de clases (progresión semana a semana) */
window.ciTest=async function(){
  await bootTest(); state.programas=[]; delete Vault.data.sf.cicloActivo;
  const F=[]; const ok=(c,m)=>{ if(!c) F.push(m); }; const info={}; const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const refs=r=>new Set(r.sections.filter(S=>S.kind==='work').flatMap(S=>S.slots.map(s=>s.ref)));
  const cs=Object.assign({},state.cfg,{metodo:'sculpt',estilo:'estacion',modo:'full',nivel:'media',duracion:45,base:8,calent:false,enfr:true,tema:'auto'});
  // ---------- Sculpt: 4 semanas, 2 clases por semana ----------
  const p=cicloCrear(cs,4,2);
  ok(p.tipo==='ciclo'&&p.semanas.length===4&&p.semanas.every(w=>w.clases.length===2),'ciclo de 4 semanas con 2 clases'); ok(p.semanas.map(w=>w.etq).join()==='Entrada,Sube,Intensidad,Reto','etiquetas de las semanas ('+p.semanas.map(w=>w.etq)+')');
  ok(p.semanas.every((w,i)=>w.clases.every(c=>new RegExp('Semana '+(i+1)).test(c.nombre))),'cada clase lleva su semana en el nombre ('+p.semanas[1].clases[0].nombre+')');
  for(let v=0;v<2;v++){ const r1=p.semanas[0].clases[v]; for(let k=1;k<4;k++){ const rk=p.semanas[k].clases[v], a=refs(r1), b=refs(rk); ok([...a].every(x=>b.has(x)),'clase '+(v?'B':'A')+' semana '+(k+1)+' conserva los ejercicios de la semana 1'); } }
  const m=(w,v)=>ciMedidas(p.semanas[w].clases[v]);
  ok(m(3,0).hold>=m(0,0).hold+10||m(0,0).hold===0,'los holds suben ('+m(0,0).hold+' → '+m(3,0).hold+')'); ok(m(3,0).pul>=m(0,0).pul+10||m(0,0).pul===0,'los pulsos suben ('+m(0,0).pul+' → '+m(3,0).pul+')'); ok(m(2,0).pasos>m(0,0).pasos,'en la semana 3 aparece una capa nueva ('+m(0,0).pasos+' → '+m(2,0).pasos+' pasos)');
  const mins=p.semanas.map(w=>estimateMinutes(w.clases[0])); info.minutos=mins.join(','); ok(mins.every((x,i)=>!i||x>=mins[i-1]-1)&&mins[3]<=mins[0]*1.4,'la clase crece poco en duración ('+mins+')');
  ok(p.semanas[0].sube.length===0&&p.semanas.slice(1).every(w=>w.sube.length>=1),'cada semana dice qué sube ('+p.semanas[1].sube.join('; ')+')');
  ok(p.semanas.every(w=>w.clases.every(c=>{ const R=c.sections.find(S=>S.bk==='reto'); return R&&/Reto de la semana/.test(R.slots[0].nota||''); })),'cada semana tiene su reto con meta'); ok(/aguanta 30 s/.test(p.semanas[0].clases[0].sections.find(S=>S.bk==='reto').slots[0].nota)&&/llega a 45 s/.test(p.semanas[3].clases[0].sections.find(S=>S.bk==='reto').slots[0].nota),'la meta del reto sube 5 s por semana');
  const first=p.semanas[2].clases[0].sections.find(S=>S.kind==='work').slots[0]; ok(/Semana 3\/4/.test(first.nota),'el primer paso recuerda qué sube ('+first.nota.slice(0,60)+')');
  const t=routineText(p.semanas[1].clases[0]); ok(/CICLO: Semana 2 de 4/.test(t)&&/Lo que sube esta semana/.test(t)&&/Reto de la semana/.test(t)&&/llega nueva/.test(t)&&!/undefined|NaN/.test(t),'texto exportado con el ciclo');
  const jac=(a,b)=>[...a].filter(x=>b.has(x)).length/new Set([...a,...b]).size; ok(jac(refs(p.semanas[0].clases[0]),refs(p.semanas[0].clases[1]))<0.5,'las dos clases de la semana son distintas');
  // ---------- pantallas ----------
  state.cfg=Object.assign(state.cfg,cs); state.programas=[p]; state.uiTab='programas'; state.screen='guardadas'; render(); let tx=$('#app').textContent; ok(/Crear ciclo/.test(tx)&&/Semana 1/.test(tx)&&/Empezar esta semana/.test(tx)&&!/undefined|NaN/.test(tx),'pestaña Programas con el ciclo');
  $('[data-action="ci-sem"][data-v="6"]').click(); ok(state.ciSem===6,'elige 6 semanas'); $('[data-action="ci-var"][data-v="3"]').click(); ok(state.ciVar===3,'elige 3 clases'); state.ciSem=4; state.ciVar=1;
  $('[data-action="ci-crear"]').click(); ok(state.programas.length===2&&state.programas[0].variantes===1,'crear ciclo desde la pantalla');
  state.programas=[p]; render(); $('[data-action="ci-load"][data-n="3"][data-v="B"]').click(); ok(state.screen==='planner'&&state.routine.ciclo&&state.routine.ciclo.n===3&&state.routine.ciclo.v==='B','abrir la clase B de la semana 3'); ok(!!$('.ci-banner')&&/Lo que sube esta semana/.test($('.ci-banner').textContent),'el planner muestra el banner del ciclo');
  // ---------- ciclo en curso ----------
  state.screen='hoy'; render(); ok(/Crear ciclo/.test($('#app').textContent)&&/avancen semana a semana/.test($('#app').textContent),'sin ciclo, Clases invita a crear uno');
  Vault.data.sf.cicloActivo={id:p.id,inicio:addDays(ciMonday(todayStr()),-7)}; render(); tx=$('#app').textContent; ok(/Esta semana · Sube/.test(tx)&&/Semana 2 de 4/.test(tx),'Clases muestra la semana en curso ('+(tx.match(/Esta semana · \w+/)||[''])[0]+')');
  const C=CL_D(); C.schedule.length=0; C.entries.length=0; [['Lunes','SOHO','09:00'],['Martes','EUPHORIA','07:00'],['Miércoles','SOHO','09:00'],['Jueves','EJE','19:00']].forEach(([d,s,h])=>C.schedule.push({id:newId('s'),day:d,studio:s,time:h}));
  $('[data-action="ci-asignar"]').click(); const asig=C.entries.filter(e=>e.rutina); ok(asig.length===4,'pone la clase en las 4 clases de la semana ('+asig.length+')');
  const nombres=[...new Set(asig.map(e=>e.rutina))]; ok(nombres.length===2&&nombres.every(n=>/Semana 2/.test(n)),'alterna clase A y B por día ('+nombres.length+')');
  Vault.data.sf.cicloActivo={id:p.id,inicio:addDays(ciMonday(todayStr()),-7*5)}; render(); ok(/Terminó el ciclo/.test($('#app').textContent),'avisa cuando el ciclo terminó');
  Vault.data.sf.cicloActivo={id:p.id,inicio:addDays(ciMonday(todayStr()),7)}; ok(ciSemanaActual().n===1,'si empieza la próxima semana, aún es la 1');
  // ---------- Fuerza ----------
  const cf=Object.assign({},state.cfg,{metodo:'fuerza',fModo:'full',objetivo:'pesada',fDuracion:55,fPorBloque:'auto',fFormato:'recto',descanso:80,calent:true,enfr:true,tema:'clasica'});
  const pf=cicloCrear(cf,4,1); const mf=w=>ciMedidas(pf.semanas[w].clases[0]);
  ok(pf.semanas.length===4&&pf.semanas.every(w=>w.clases[0].v2),'ciclo de Fuerza'); ok([...refs(pf.semanas[0].clases[0])].every(x=>refs(pf.semanas[3].clases[0]).has(x)),'Fuerza conserva los ejercicios');
  ok(mf(2).setsP>=mf(0).setsP&&mf(3).rondas>mf(0).rondas&&mf(1).repsO>mf(0).repsO,'Fuerza sube series, repeticiones y rondas ('+JSON.stringify(mf(0))+' → '+JSON.stringify(mf(3))+')'); ok(pf.semanas[3].reto&&/Semana reto/.test(pf.semanas[3].reto),'la última semana es de reto'); ok(pf.semanas.every(w=>!/undefined|NaN/.test(routineText(w.clases[0]))),'texto de Fuerza sin undefined');
  const minF=pf.semanas.map(w=>estimateMinutes(w.clases[0])); info.minutosFuerza=minF.join(','); ok(minF[3]<=minF[0]*1.35,'Fuerza no se alarga demasiado ('+minF+')');
  // Instructor con una clase del ciclo
  ciCargar(pf.semanas[2].clases[0]); launchInstructor(); let g=0,err=null; try{ while(state.iv.i<state.iv.steps.length-1&&g++<90){ const h2=viewInstructor(); if(/undefined|NaN/.test(h2)) err='undefined'; ivGoto(1); fClearTimer(); } }catch(e){ err=String(e); } ok(!err,'Instructor abre una clase del ciclo: '+err); ivExit();
  // ---------- borrar / programas anteriores ----------
  state.programas=[p].concat(generateProgram(Object.assign({},cs,{metodo:'sculpt'}),3).length?[{id:rid(),nombre:'Programa viejo',metodo:'sculpt',semanas:generateProgram(cs,3),creado:Date.now()}]:[]); state.screen='guardadas'; state.uiTab='programas'; render(); ok(/Programas anteriores/.test($('#app').textContent),'los programas viejos siguen ahí'); const pv=state.programas[1]; $('[data-action="prog-load"][data-id="'+pv.id+'"][data-n="2"]').click(); ok(state.screen==='planner','un programa viejo se puede cargar');
  state.screen='guardadas'; render(); $('[data-action="ci-del"][data-id="'+p.id+'"]').click(); ok(!state.programas.find(x=>x.id===p.id),'borrar el ciclo'); $('#toastU button').click(); ok(!!state.programas.find(x=>x.id===p.id),'deshacer el borrado');
  state.cfg.metodo='barre'; state.screen='guardadas'; render(); ok(/son para Sculpt y Fuerza/.test($('#app').textContent),'en Barre avisa que los ciclos son de Sculpt y Fuerza'); state.cfg.metodo='sculpt';
  return {fallas:F,info,errs:__errs};
};
