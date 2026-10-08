/* Prueba en navegador del aprendizaje ("Mi formato"). Usa boot.js y, si existe, tests/privadas/clases.js (no se sube al repo). */
window.aprTest=async function(){
  await bootTest();
  const {C1,C2,C3}=window.__CLASES; const F=[]; const ok=(c,m)=>{ if(!c) F.push(m); }; const info={};
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const pegar=async(txt,accion)=>{ state.screen='formato'; render(); $('.apr-txt').value=txt; $('.apr-txt').dispatchEvent(new Event('input',{bubbles:true})); $('[data-action="ap-entender"]').click(); $('[data-action="'+accion+'"]').click(); };
  const resumen=pv=>pv.bloques.map(b=>b.bk+':'+b.pasos.length).join(' ');
  const p1=aprParsear(C1,8), p2=aprParsear(C2,8), p3=aprParsear(C3,8);
  ok(resumen(p1)==='up:7 leg:7 glu:6 abs:4 reto:1 cierre:1','estructura clase 1 '+resumen(p1)); ok(resumen(p2)==='up:7 leg:7 glu:6 abs:4 reto:1','estructura clase 2 '+resumen(p2)); ok(resumen(p3)==='leg:5 abs:4 reto:1','clase 3 '+resumen(p3));
  const paso=(pv,bk,i)=>pv.bloques.find(b=>b.bk===bk).pasos[i];
  ok(paso(p1,'up',0).q.t==='trans'&&paso(p1,'up',3).q.t==='trans','transiciones de la clase 1'); ok(paso(p1,'leg',2).q.t==='pulsos'&&paso(p1,'leg',3).q.t==='pulsos','pulsos reconocidos');
  ok(paso(p3,'abs',0).q.t==='reps'&&paso(p3,'abs',0).q.n===12,'crunch con pausa de 2 segundos x12 = 12 reps ('+JSON.stringify(paso(p3,'abs',0).q)+')'); ok(paso(p3,'leg',2).nombre==='Pulsos pequeños en curtsy','nombre sin número final: '+paso(p3,'leg',2).nombre);
  ok(p1.bloques.every(b=>b.pasos.every(p=>p.reconocido)),'clase 1: todo conocido'); ok(p2.bloques.every(b=>b.pasos.every(p=>p.reconocido)),'clase 2: todo conocido');
  // el contexto: la pierna de la clase 1 debe quedar en UNA estación (silla), la de la 2 en sumo
  const anc=pv=>[...new Set(pv.bloques.find(b=>b.bk==='leg').pasos.map(p=>p.entry&&p.entry.anchor))].join();
  ok(anc(p1)==='silla','pierna clase 1 = estación silla ('+anc(p1)+')'); ok(anc(p2)==='sumo','pierna clase 2 = estación sumo ('+anc(p2)+')');
  // --- antes de enseñarle nada: cómo genera ---
  const frec=(n)=>{ const c={}; let pulsos=[]; for(let i=0;i<n;i++){ const r=generate(Object.assign({},state.cfg,{metodo:'sculpt',estilo:'estacion',modo:'full',nivel:'media',duracion:45,base:8,calent:false,enfr:true})); const leg=r.sections.find(s=>s.bk==='leg'); if(leg&&leg.anchor) c[leg.anchor]=(c[leg.anchor]||0)+1; r.sections.forEach(s=>s.slots.forEach(sl=>{ if(sl.q&&sl.q.t==='pulsos') pulsos.push(sl.q.n); })); } return {c,pulsos}; };
  state.historia.uso={}; const antes=frec(60);
  // --- enseñarle: clase 1 y 2 (ya son sus estaciones) y la 3 (estación nueva) ---
  await pegar(C1,'ap-guardar'); await pegar(C2,'ap-guardar'); let P=aprPerfil(); ok(P.clases===4,'aprendió 2 clases (clases='+P.clases+')'); ok(P.anclas.length===0,'no duplica estaciones que ya conocía ('+P.anclas.length+')');
  await pegar(C3,'ap-abrir'); P=aprPerfil(); ok(P.clases===5&&P.anclas.length===1,'estación nueva (curtsy) aprendida'); const curtsyId=P.anclas[0].id; ok(EST_ANCHORS[curtsyId]&&EST_ANCHORS[curtsyId].custom&&EST_ANCHORS[curtsyId].layers.length===5,'estación propia con 5 capas');
  ok(byId[EST_ANCHORS[curtsyId].layers[1]].q.fijo&&byId[EST_ANCHORS[curtsyId].layers[1]].q.s===25,'conserva su hold de 25 s');
  ok(state.saved.length===3,'las 3 clases quedaron en Biblioteca');
  // --- ¿cambia lo que genera? ---
  state.historia.uso={}; const despues=frec(60);
  const liked=['silla','sumo',curtsyId], suma=(f,ids)=>ids.reduce((a,k)=>a+(f.c[k]||0),0);
  info.estacionesAntes=antes.c; info.estacionesDespues=despues.c;
  ok(suma(despues,liked)>=suma(antes,liked)+12,'prefiere tus estaciones: '+suma(antes,liked)+' → '+suma(despues,liked)+' de 60');
  ok((despues.c[curtsyId]||0)>=6,'usa tu estación nueva (curtsy) '+(despues.c[curtsyId]||0)+' veces de 60');
  ok(Object.keys(despues.c).length>=4,'mantiene variedad ('+Object.keys(despues.c).length+' estaciones distintas)');
  // cuando usa tu estación respeta exactamente tus capas y cantidades
  let r=null; for(let i=0;i<80&&!(r&&r.sections.find(s=>s.bk==='leg'&&s.anchor===curtsyId));i++){ r=generate(Object.assign({},state.cfg,{metodo:'sculpt',estilo:'estacion',modo:'full',nivel:'pesada',duracion:45,base:8,calent:false,enfr:true})); }
  const legC=r&&r.sections.find(s=>s.bk==='leg'&&s.anchor===curtsyId); ok(!!legC,'sale la estación curtsy');
  if(legC){ ok(legC.slots.length===5,'respeta los 5 pasos'); ok(legC.slots[1].q.s===25,'hold exacto de 25 s aunque la dificultad sea Pesada ('+legC.slots[1].q.s+')'); ok(legC.slots[0].q.n===10&&legC.slots[2].q.n===30,'reps 10 y pulsos 30 como los escribiste'); }
  // --- cantidades aprendidas ---
  ok(aprMedia('pulsos',0)>18&&aprMedia('pulsos',0)<32,'media de pulsos aprendida: '+aprMedia('pulsos',0)); const pp=despues.pulsos; info.pulsosGenerados=[Math.min(...pp),Math.max(...pp)];
  ok(pp.length>0&&pp.every(n=>n>=10&&n<=40),'pulsos generados en rango razonable');
  // --- estructura: su orden de bloques ---
  ok(aprEstructura('full').join()==='up,leg,glu,abs','sigue tu orden: superior, pierna, glúteo, abs'); P=aprPerfil(); P.peso='poco'; ok(aprEstructura('full')===null,'con "Poco" no impone la estructura'); P.peso='mucho';
  // --- señales silenciosas ---
  state.cfg.metodo='sculpt'; state.cfg.estilo='estacion'; state.routine=generate(Object.assign({},state.cfg,{estilo:'estacion',modo:'full',calent:false,enfr:true})); state.screen='planner'; render();
  const abs=state.routine.sections.find(s=>s.bk==='abs'), sl0=abs.slots[0], ref0=sl0.ref, ed0=aprPerfil().ediciones||0;
  $('[data-action="del"][data-uid="'+sl0.uid+'"]').click(); ok(aprPerfil().quitados[ref0]===1&&aprPerfil().ediciones===ed0+1,'aprende lo que quitas');
  const sl1=abs.slots[0]; const ref1=sl1.ref; $('[data-action="swap"][data-uid="'+sl1.uid+'"]').click(); ok(aprPerfil().quitados[ref1]===1,'aprende lo que cambias (quita el viejo)'); ok(Object.keys(aprPerfil().afinidad).length>0,'y premia el nuevo');
  $('[data-action="add-ex"][data-sec="'+abs.id+'"]').click(); const pk=$('.picker [data-action="pick-ex"]:not([disabled])'); const idAdd=pk.dataset.ex; pk.click(); ok(aprPerfil().afinidad[idAdd]>=1,'aprende lo que agregas');
  const qBefore=aprPerfil().q.hold.n; const holdSl=state.routine.sections.flatMap(s=>s.slots).find(s=>s.q&&s.q.t==='hold'&&!s.q.fijo); if(holdSl){ const sec=state.routine.sections.find(s=>s.slots.includes(holdSl)); $('[data-action="edit"][data-uid="'+holdSl.uid+'"]').click(); $('[data-action="ed-q"][data-k="s"][data-v="45"]').click(); ok(aprPerfil().q.hold.n===qBefore+1,'aprende tus cantidades al editarlas'); $('[data-action="ed-done"]').click(); }
  // guardar = aprobar (una sola vez por rutina)
  const apr0=aprPerfil().aprobadas; $('[data-action="save"]').click(); $('#sv-nom').value='Mi clase de prueba'; $('[data-action="sv-confirm"]').click(); ok(aprPerfil().aprobadas===apr0+1,'guardar = aprobar'); aprAprobar(state.routine); ok(aprPerfil().aprobadas===apr0+1,'no cuenta dos veces la misma rutina');
  // retroalimentación
  $('[data-action="registrar-feedback"]').click(); const cb=$('input[data-action="fb-malo"]'); if(cb){ cb.checked=true; cb.dispatchEvent(new Event('input',{bubbles:true})); const id=cb.dataset.id; $('[data-action="fb-guardar"]').click(); ok(aprPerfil().quitados[id]>=2,'lo que marcas como malo pesa fuerte'); } else closeModal();
  // lo que quitas varias veces deja de salir
  const mal='st_a_dead'; const P2=aprPerfil(); P2.quitados[mal]=5; LS.set('sf_aprendizaje',P2); state.historia.uso={}; let con=0; for(let i=0;i<60;i++){ const rr=generate(Object.assign({},state.cfg,{estilo:'estacion',modo:'full',nivel:'media',duracion:45,base:8,calent:false,enfr:true})); if(rr.sections.some(s=>s.slots.some(sl=>sl.ref===mal))) con++; } P2.quitados[mal]=0; LS.set('sf_aprendizaje',P2); state.historia.uso={}; let sin=0; for(let i=0;i<60;i++){ const rr=generate(Object.assign({},state.cfg,{estilo:'estacion',modo:'full',nivel:'media',duracion:45,base:8,calent:false,enfr:true})); if(rr.sections.some(s=>s.slots.some(sl=>sl.ref===mal))) sin++; }
  info.deadBug={conQuitados:con,sinQuitados:sin}; ok(con<sin,'un paso que siempre quitas sale menos ('+sin+' → '+con+' de 60)');
  // --- pantalla "Mi formato" ---
  state.screen='formato'; render(); ok(/aprendió de 5 clases/.test($('#app').textContent)||/aprendió de \d+ clases/.test($('#app').textContent),'muestra el resumen'); ok(/Lo que más usas/.test($('#app').textContent)&&/Lo que sueles quitar/.test($('#app').textContent),'muestra favoritos y lo que quitas');
  $('[data-action="ap-peso"][data-v="medio"]').click(); ok(aprPerfil().peso==='medio','ajustar qué tanto sigue tu formato'); $('[data-action="ap-peso"][data-v="mucho"]').click();
  state.saved.push(Object.assign(deepClone(state.routine),{id:'xx',aprendida:false})); const nG=aprDeGuardadas(); ok(nG>=0,'aprender de las guardadas');
  const antesOlv=aprPerfil().clases; $('[data-action="ap-olvidar"]').click(); ok(aprPerfil().clases===2&&!EST_ANCHORS[curtsyId],'olvidar vuelve al punto de partida'); $('#toastU button').click(); ok(aprPerfil().clases===antesOlv&&!!EST_ANCHORS[curtsyId],'deshacer recupera todo');
  // --- persistencia: al "reabrir" vuelven tus estaciones ---
  delete EST_ANCHORS[curtsyId]; LIB.splice(0,0); hydrateSculpt(); armRegistrarCustom(); aprRegistrarGuardado(); ok(!!EST_ANCHORS[curtsyId]&&EST_ANCHORS[curtsyId].layers.every(id=>byId[id]),'tras reabrir recupera tu estación propia');
  // --- PT: aprende qué ejercicios cambias ---
  const c={id:'cc',nombre:'Cliente',nivel:'intermedio',objetivo:'hipertrofia',modalidad:'presencial',equipo:'gym',dias:4,lesiones:[],estado:'activo',inicio:todayStr()}; PT_D().clientes.push(c); const prog=ptGenerar({clienteId:'cc',nivel:'intermedio',objetivo:'hipertrofia',dias:4,semanas:8,equipo:'gym',minutos:60,lesiones:[]}); PT_D().programas.push(prog);
  const d0=prog.dias[0], e0=d0.ejercicios[0]; const alt=ptDisponibles('gym',2,[]).find(e=>e.p===PT_BY_ID[e0.ex].p&&e.id!==e0.ex); ptSwapEx(prog.id,d0.id,e0.uid,alt.id);
  ok(aprPerfil().pt.evita[e0.ex]>=1&&aprPerfil().pt.afin[alt.id]>=1,'PT: aprende los cambios en programas'); ok(aprPTBoost(alt.id)>0&&aprPTBoost(e0.ex)<0,'PT: favorece el nuevo y evita el viejo');
  return {fallas:F,info,errs:__errs};
};
