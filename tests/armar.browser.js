/* Prueba en navegador de "Armar clase" y de escribir ejercicios propios (usa boot.js) */
window.armTest=async function(){
  await bootTest();
  const F=[]; const ok=(c,m)=>{ if(!c) F.push(m); };
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const inp=(el,v)=>{ el.value=v; el.dispatchEvent(new Event('input',{bubbles:true})); };
  const clk=(sel,why)=>{ const el=$(sel); if(!el) throw new Error('no existe '+sel+' ('+why+')'); el.click(); };
  let stage='inicio';
  try{
  stage='clasificar';
  const c1=armClasificar('hold 30 seg sentadilla sumo con liga',null); ok(c1.blk==='leg'&&c1.q.t==='hold'&&c1.q.s===30&&c1.eq==='liga','clasifica hold sumo liga '+JSON.stringify(c1));
  const c2=armClasificar('donkey kick x12',null); ok(c2.blk==='glu'&&c2.q.t==='reps'&&c2.q.n===12&&c2.f===1,'clasifica donkey '+JSON.stringify(c2));
  const c3=armClasificar('russian twist con mancuerna',null); ok(c3.blk==='abs'&&c3.f===2&&c3.eq==='mancuernas','clasifica russian '+JSON.stringify(c3));
  const c4=armClasificar('pulsos pequeños 25',null); ok(c4.q.t==='pulsos'&&c4.q.n===25,'pulsos 25');
  ok(armBuscar('sentadilla sumo',null,5).length>0&&/sumo/i.test(armBuscar('sentadilla sumo',null,5)[0].e.nom),'búsqueda sumo');
  stage='pantalla'; state.screen='armar'; render(); ok($('.empty'),'estado vacío');
  clk('[data-action="ar-new-block"][data-bk="leg"]','pierna'); ok(ARMS.blocks.length===1,'bloque pierna');
  stage='autocompletar'; inp($('#ar-txt'),'sentadilla sumo'); ok($$('#ar-auto [data-action="ar-pick"]').length>0,'autocompleta');
  const top=armBuscar('sentadilla sumo','leg',1)[0].e; ok(top.b==='st'&&top.layer==='entrada','la estación gana la búsqueda: '+top.id);
  clk('#ar-auto [data-action="ar-pick"]','pick'); const b=ARMS.blocks[0]; ok(b.steps.length===1,'paso añadido');
  ok(ARM.sug.some(s=>s.g==='misma'),'sugerencias misma estación: '+ARM.sug.map(s=>s.g+':'+s.label).slice(0,5).join(' | '));
  stage='cadena'; let guard=0; while(guard++<10){ const s=ARM.sug.findIndex(x=>x.g==='misma'&&x.kind==='lib'); if(s<0) break; clk('[data-action="ar-sug"][data-i="'+s+'"]','capa'); }
  ok(b.steps.length===7,'estación completa de 7 pasos ('+b.steps.length+'): '+b.steps.map(s=>byId[s.ref].layer).join(',')); ok(byId[b.steps[b.steps.length-1].ref].layer==='falla','termina en falla');
  stage='propio'; inp($('#ar-txt'),'paso lateral con salto suave'); clk('[data-action="ar-add"]','add propio');
  const last=b.steps[b.steps.length-1], e=byId[last.ref]; ok(e.custom&&/^paso lateral/i.test(e.nom),'ejercicio propio creado: '+e.nom); ok(armCustomList().length>=1,'guardado en bóveda');
  ok(ARM.sug.some(s=>s.g==='misma'&&s.kind==='gen'),'ladder genérico: '+ARM.sug.filter(s=>s.g==='misma').map(s=>s.label).join(' | '));
  const gi=ARM.sug.findIndex(s=>s.kind==='gen'&&/Hold/.test(s.label)); ok(gi>=0,'hold sugerido'); if(gi>=0){ clk('[data-action="ar-sug"][data-i="'+gi+'"]','hold gen'); ok(/Hold en paso lateral/i.test(byId[b.steps[b.steps.length-1].ref].nom),'ladder hold propio'); }
  stage='cantidad'; const hs=b.steps.find(s=>s.q&&s.q.t==='hold'); const q0=hs.q.s; clk('[data-action="ar-q"][data-u="'+hs.uid+'"][data-d="1"]','+'); ok(hs.q.s===q0+5,'+5 s');
  stage='mover'; const u=b.steps[1].uid; clk('[data-action="ar-mv"][data-u="'+u+'"][data-d="1"]','mv'); ok(b.steps[2].uid===u,'mover');
  stage='sig bloque'; const sg=ARM.sug.findIndex(s=>s.kind==='bloque'); ok(sg>=0,'sugiere siguiente bloque'); if(sg>=0){ clk('[data-action="ar-sug"][data-i="'+sg+'"]','sig'); ok(ARMS.blocks.length===2,'abre bloque siguiente: '+ARMS.blocks.map(x=>x.bk)); }
  stage='glu'; clk('[data-action="ar-new-block"][data-bk="glu"]','glu'); const g=ARMS.blocks[ARMS.blocks.length-1]; const ia=ARM.sug.findIndex(s=>s.kind==='ancla'); ok(ia>=0,'ancla glu sugerida'); clk('[data-action="ar-sug"][data-i="'+ia+'"]','ancla'); ok(g.steps.length>=3,'ancla glúteo ('+g.steps.length+')');
  stage='abs'; clk('[data-action="ar-new-block"][data-bk="abs"]','abs'); const ab=ARMS.blocks[ARMS.blocks.length-1]; for(let k=0;k<4;k++){ const i=ARM.sug.findIndex(s=>s.g==='bloque'&&s.kind==='lib'); if(i<0){ F.push('abs: sin sugerencias en k='+k); break; } clk('[data-action="ar-sug"][data-i="'+i+'"]','abs paso'); }
  ok(new Set(ab.steps.map(s=>byId[s.ref].fn)).size===4,'abs 4 funciones: '+ab.steps.map(s=>byId[s.ref].fn));
  stage='usar'; ARMS.nombre='Mi clase armada'; clk('[data-action="ar-use"]','usar'); const r=state.routine; ok(r&&r.nombre==='Mi clase armada'&&r.estilo==='estacion'&&state.screen==='planner','rutina creada y abre planner');
  ok(r.sections.some(s=>s.kind==='finisher')&&r.sections.some(s=>s.kind==='cool'),'reto y cierre'); ok(estimateMinutes(r)>10,'estimado '+estimateMinutes(r));
  launchInstructor(); for(let i=0;i<state.iv.steps.length;i++){ state.iv.i=i; ok(viewInstructor().length>100,'instructor paso '+i); } ivExit();
  ok(/Lado A/.test(routineText(r,false)),'exporta lados');
  stage='persistencia'; const customN=armCustomList().length; hydrateSculpt(); armRegistrarCustom(); ARMS=null; armInit(); ok(ARMS.blocks.length>=3,'borrador persiste'); ok(customN>=1&&byId[armCustomList()[0].id],'propios se re-registran');
  stage='picker'; state.routine=r; state.screen='planner'; render(); const sec=r.sections.find(s=>s.kind==='work'); clk('[data-action="add-ex"][data-sec="'+sec.id+'"]','add-ex'); ok($('#ar-pk-txt'),'campo escribir en picker');
  const n0=sec.slots.length; inp($('#ar-pk-txt'),'Plancha lateral con elevación de cadera por lado'); clk('[data-action="ar-pk-add"]','pk-add'); ok(sec.slots.length===n0+1,'añade escrito al bloque');
  stage='fuerza'; state.cfg.metodo='fuerza'; state.routine=generate(state.cfg); state.screen='planner'; render(); const fs=state.routine.sections.find(s=>s.kind==='work'); clk('[data-action="add-ex"][data-sec="'+fs.id+'"]','f add-ex'); ok($('#ar-pk-txt')&&$$('.arm-pk .sug-btn').length>0,'fuerza: escribir + sugerencias ('+$$('.arm-pk .sug-btn').length+')');
  inp($('#ar-pk-txt'),'press de pecho con liga'); const nf=fs.slots.length; clk('[data-action="ar-pk-add"]','f pk-add'); ok(fs.slots.length===nf+1,'fuerza: añade escrito');
  stage='barre'; state.cfg.metodo='barre'; state.routine=generate(state.cfg); state.screen='planner'; render(); const bs=state.routine.sections.find(s=>s.kind==='work'); clk('[data-action="add-ex"][data-sec="'+bs.id+'"]','b add-ex'); ok($('#ar-pk-txt'),'barre: picker'); closeModal();
  }catch(e){ F.push('EXC en '+stage+': '+e.message); }
  return {fallas:F,errs:__errs};
};
