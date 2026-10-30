/* Prueba en navegador: menú agrupado, Mis estudios (tarifas/horario/pago/plantilla) y "Para:" en Generar */
window.esTest=async function(){
  await bootTest(); delete Vault.data.sf.estudios;
  const F=[]; const ok=(c,m)=>{ if(!c) F.push(m); }; const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const ch=(el,v)=>{ el.value=v; el.dispatchEvent(new Event('change',{bubbles:true})); };
  // ---------- menú ----------
  state.screen='hoy'; render(); const nav=$$('#nav button, nav button').map(b=>b.textContent.trim());
  ok(nav.length<=6&&!nav.includes('Gym')&&!nav.includes('Cotizador'),'menú inferior con ≤6 botones y sin Gym/Cotizador ('+nav.join(',')+')');
  ['gym','cotizador','clientes'].forEach(s=>{ state.screen=s; render(); const on=$$('#nav button.on, nav button.on').map(b=>b.textContent.trim()); ok(on.length===1&&on[0]==='Clientes','pantalla '+s+' resalta Clientes ('+on+')'); const tabs=$$('.tabs button').map(b=>b.textContent.trim()); ok(['Clientes','Rutinas de gimnasio','Cotizador'].every(x=>tabs.includes(x)),'pantalla '+s+' muestra las 3 pestañas ('+tabs+')'); });
  state.screen='clientes'; render(); $$('.tabs button').find(b=>b.textContent==='Cotizador').click(); ok(state.screen==='cotizador','la pestaña Cotizador abre el cotizador');
  $$('.tabs button').find(b=>b.textContent==='Rutinas de gimnasio').click(); ok(state.screen==='gym','la pestaña Rutinas de gimnasio abre Gym');
  // ---------- avisos de lo que falta ----------
  const C=CL_D(); C.rates.SOHO=0; C.payinfo.length=0; C.schedule.length=0; C.entries.length=0; C.schedule.push({id:newId('s'),day:'Lunes',studio:'SOHO',time:'09:00'});
  C.entries.push({id:newId('e'),date:todayStr(),studio:'SOHO',time:'09:00',amount:0,auto:true,status:'done'});
  let A=esAvisos(); ok(A.some(a=>a.studio==='SOHO'&&a.falta.includes('tarifa')&&a.falta.includes('forma de pago')),'avisa que a SOHO le falta tarifa y forma de pago');
  state.screen='hoy'; render(); ok(/Falta completar/.test($('#app').textContent)&&/SOHO/.test($('#app').textContent),'Clases muestra el aviso');
  // ---------- Mis estudios en Ajustes ----------
  state.screen='ajustes'; render(); let tx=$('#app').textContent; ok(/Mis estudios/.test(tx)&&$$('.es-card').length>=4,'Ajustes lista los estudios ('+$$('.es-card').length+')');
  ok(!/undefined|NaN/.test(tx),'Ajustes sin undefined');
  const rate=$('[data-action="es-rate"][data-s="SOHO"]'); ch(rate,'450'); ok(C.rates.SOHO===450,'guarda la tarifa de SOHO'); ok(C.entries[0].amount===450,'la clase que estaba en $0 se actualiza ('+C.entries[0].amount+')');
  ch($('[data-action="es-pay"][data-s="SOHO"][data-f="frequency"]'),'semanal'); ch($('[data-action="es-pay"][data-s="SOHO"][data-f="payday"]'),'Martes');
  const p=C.payinfo.find(x=>x.studio==='SOHO'); ok(p&&p.frequency==='semanal'&&p.payday==='Martes','crea la forma de pago de SOHO');
  A=esAvisos(); ok(!A.some(a=>a.studio==='SOHO'),'SOHO ya no tiene faltantes');
  // horario
  const i=esLista().indexOf('EUPHORIA'); document.getElementById('es-d-'+i).value='Jueves'; document.getElementById('es-t-'+i).value='07:00'; $('[data-action="es-slot-add"][data-s="EUPHORIA"]').click();
  ok(C.schedule.some(s=>s.studio==='EUPHORIA'&&s.day==='Jueves'&&s.time==='07:00'),'agrega un horario desde la tarjeta del estudio');
  // alunna: dos tarifas
  ok($$('[data-action="es-rate"][data-s="ALUNNA"]').length===2,'Alunna tiene tarifa solo y grupo'); ch($('[data-action="es-rate"][data-k="ALUNNA_SOLO"]'),'300'); ok(C.rates.ALUNNA_SOLO===300,'guarda tarifa Alunna 1 persona');
  // estudio nuevo
  document.getElementById('es-new').value='Studio X'; $('[data-action="es-add"]').click(); ok(esLista().includes('Studio X')&&$$('.es-card').length>=5,'agrega un estudio nuevo');
  $('[data-action="es-del"][data-s="Studio X"]').click(); ok(!esLista().includes('Studio X'),'quita el estudio nuevo');
  // ---------- plantillas ----------
  ch($('[data-action="es-tpl"][data-s="SOHO"][data-f="metodo"]'),'fuerza'); ch($('[data-action="es-tpl"][data-s="SOHO"][data-f="dif"]'),'pesada'); ch($('[data-action="es-tpl"][data-s="SOHO"][data-f="dur"]'),'65');
  ch($('[data-action="es-tpl"][data-s="EUPHORIA"][data-f="dif"]'),'ligera'); ch($('[data-action="es-tpl"][data-s="EUPHORIA"][data-f="dur"]'),'30');
  const T=ES_T(); ok(T.SOHO.metodo==='fuerza'&&T.SOHO.dif==='pesada'&&T.SOHO.dur===65,'guarda plantilla de SOHO'); ok(T.EUPHORIA.metodo==='sculpt'&&T.EUPHORIA.dur===30,'guarda plantilla de Euphoria');
  ch($('[data-action="es-tpl"][data-s="SOHO"][data-f="metodo"]'),'barre'); ok(ES_T().SOHO.dur===50&&!$('[data-action="es-tpl"][data-s="SOHO"][data-f="tema"]'),'al cambiar a Barre ajusta duración y quita temas'); ch($('[data-action="es-tpl"][data-s="SOHO"][data-f="metodo"]'),'fuerza'); ch($('[data-action="es-tpl"][data-s="SOHO"][data-f="dur"]'),'65'); ch($('[data-action="es-tpl"][data-s="SOHO"][data-f="dif"]'),'pesada');
  // ---------- Generar ----------
  state.screen='inicio'; render(); const chips=$$('.es-chip').map(b=>b.textContent.trim()); ok(chips.includes('Soho')&&chips.includes('Euphoria')&&chips.includes('Libre'),'Generar muestra "Para:" ('+chips+')');
  $('[data-action="es-usar"][data-s="SOHO"]').click(); const c=state.cfg; ok(c.metodo==='fuerza'&&c.objetivo==='pesada'&&c.fDuracion===65&&c.para==='SOHO','SOHO carga Fuerza pesada 65 ('+[c.metodo,c.objetivo,c.fDuracion]+')');
  $('[data-action="es-usar"][data-s="EUPHORIA"]').click(); ok(c.metodo==='sculpt'&&c.nivel==='ligera'&&c.duracion===30,'Euphoria carga Sculpt ligera 30');
  const r=generate(Object.assign({},c)); ok(r&&r.sections&&r.sections.length>0,'se genera una clase con la plantilla');
  $('[data-action="es-libre"]').click(); ok(!state.cfg.para,'Libre quita el estudio');
  ok(!/undefined|NaN/.test($('#app').textContent),'Generar sin undefined');
  return {fallas:F,errs:__errs};
};

/* Prueba: respaldo semanal */
window.rsTest=async function(){
  await bootTest(); delete Vault.data.sf.respaldo;
  const F=[]; const ok=(c,m)=>{ if(!c) F.push(m); }; const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const C=CL_D(); ok(respHayDatos(),'hay datos de prueba');
  state.screen='hoy'; render(); ok(respToca()&&/Respaldo:/.test($('#app').textContent)&&/todavía no has descargado/.test($('#app').textContent),'sin respaldo previo, Clases avisa');
  $('[data-action="aj-resp-despues"]').click(); ok(!respToca()&&!/Respaldo:/.test($('#app').textContent),'"Después" lo pospone');
  RESP().posponer=null; let bajadas=0; const orig=HTMLAnchorElement.prototype.click; HTMLAnchorElement.prototype.click=function(){ if(this.download&&/respaldo/.test(this.download)) bajadas++; else orig.call(this); };
  render(); $('[data-action="aj-backup"]').click(); await new Promise(r=>setTimeout(r,700));
  HTMLAnchorElement.prototype.click=orig; ok(bajadas===1,'el botón descarga un archivo de respaldo ('+bajadas+')'); ok(RESP().ultimo&&respDias()===0,'marca la fecha del último respaldo'); ok(!respToca(),'ya no avisa');
  RESP().ultimo=new Date(Date.now()-8*864e5).toISOString(); ok(respToca(),'a los 8 días vuelve a avisar'); RESP().ultimo=new Date(Date.now()-3*864e5).toISOString(); ok(!respToca(),'a los 3 días no avisa');
  RESP().cada=14; RESP().ultimo=new Date(Date.now()-10*864e5).toISOString(); ok(!respToca(),'con recordatorio de 2 semanas, 10 días no avisa'); RESP().cada=0; RESP().ultimo=null; ok(!respToca(),'"No recordar" lo apaga');
  state.screen='ajustes'; render(); $('[data-action="aj-resp-cada"][data-v="7"]').click(); ok(RESP().cada===7,'elige recordar cada semana'); ok(/Aún no has descargado/.test($('#app').textContent)&&!/undefined|NaN/.test($('#app').textContent),'Ajustes muestra el estado del respaldo');
  // el archivo se puede cargar de vuelta
  const blob=await backupBlob(); const p=await restoreBackup(JSON.stringify(blob)); ok(p&&p.clases&&p.sf&&p.sf.respaldo,'el respaldo incluye el estado del respaldo y se puede restaurar');
  return {fallas:F,errs:__errs};
};

/* Prueba: "¿Cómo se sintió?" + calificador estricto */
window.fqTest=async function(){
  await bootTest(); delete Vault.data.sf.fq;
  const F=[]; const ok=(c,m)=>{ if(!c) F.push(m); }; const info={}; const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const cs=Object.assign({},state.cfg,{metodo:'sculpt',estilo:'estacion',modo:'full',nivel:'media',duracion:45,base:8,calent:true,enfr:true,tema:'auto'});
  // ---------- toque rápido ----------
  state.cfg=cs; let r=generate(cs); state.routine=r; state.screen='planner'; render();
  ok(!!$('[data-action="fq-abrir"]'),'el planner tiene el botón "¿Cómo se sintió?"');
  $('[data-action="fq-abrir"]').click(); ok(state.modal&&state.modal.type==='fq'&&$$('.fq-tags .chip').length===8,'abre el modal con 8 opciones ('+$$('.fq-tags .chip').length+')');
  ok($('[data-action="fq-guardar"]').disabled,'no deja guardar sin elegir nada');
  $('[data-action="fq-tag"][data-k="larga"]').click(); $('[data-action="fq-tag"][data-k="corta"]').click(); ok(state.modal.data.tags.join()==='corta','larga y corta se excluyen');
  $('[data-action="fq-tag"][data-k="perfecta"]').click(); ok(state.modal.data.tags.join()==='perfecta','perfecta limpia lo negativo'); $('[data-action="fq-tag"][data-k="repetida"]').click(); ok(state.modal.data.tags.join()==='repetida','un negativo quita perfecta');
  $('[data-action="fq-tag"][data-k="larga"]').click(); $('[data-action="fq-guardar"]').click();
  ok(!state.modal&&FQ().length===1&&FQ()[0].tags.includes('larga')&&FQ()[0].tags.includes('repetida')&&FQ()[0].m==='sculpt'&&FQ()[0].tema===r.tema,'guarda el toque con método y tema');
  // ---------- efectos ----------
  let sg=fqSesgos('sculpt'); ok(sg.min===1&&sg.rep===1,'sesgos: larga → −1 min, repetida → +1 ('+JSON.stringify(sg)+')'); ok(fqSesgos('fuerza').min===0,'los sesgos son por método');
  const t0=(()=>{ delete Vault.data.sf.fq; return claseTarget(r); })(); FQ().unshift({id:'a',f:1,m:'sculpt',tema:'pulsos',tags:['larga']},{id:'b',f:1,m:'sculpt',tema:'pulsos',tags:['larga']}); ok(claseTarget(r)===t0-2,'si se siente larga, el objetivo de duración baja ('+t0+' → '+claseTarget(r)+')');
  delete Vault.data.sf.fq; FQ().push({id:'c',f:1,m:'sculpt',tema:'pulsos',tags:['perfecta']},{id:'d',f:1,m:'sculpt',tema:'escalera',tags:['repetida']});
  ok(fqTemaPeso('sculpt','pulsos')>1&&fqTemaPeso('sculpt','escalera')<1&&fqTemaPeso('sculpt','otro')===1,'temas que pegaron suben, los repetidos bajan ('+fqTemaPeso('sculpt','pulsos')+' / '+fqTemaPeso('sculpt','escalera')+')');
  let veces={pulsos:0,escalera:0}; for(let i=0;i<400;i++){ const T=temaElegir('sculpt',Object.assign({},cs,{tema:'auto'})); if(veces[T.id]!==undefined) veces[T.id]++; } ok(veces.pulsos>veces.escalera*1.4,'el generador elige más el tema que pegó ('+JSON.stringify(veces)+')');
  ok(/Tus últimas clases/.test(fqResumen('sculpt')),'resumen de lo que anotaste'); state.routine=r; state.screen='planner'; render(); ok(/Tus últimas clases/.test($('#app').textContent),'el planner muestra tu feedback junto a la calidad');
  // ---------- salir de Instructor ----------
  delete Vault.data.sf.fq; state.routine=r; launchInstructor(); ivGoto(1); ivExit(); ok(!state.modal||state.modal.type!=='fq','salir sin terminar no pregunta');
  launchInstructor(); let g=0; while(state.iv.i<state.iv.steps.length-1&&g++<120){ ivGoto(1); fClearTimer(); } ivExit(); ok(state.modal&&state.modal.type==='fq','al terminar la clase y salir, pregunta cómo se sintió'); closeModal();
  // ---------- estudio y ciclo ----------
  state.cfg.para='SOHO'; const rp=generate(Object.assign({},cs,{para:'SOHO'})); ok(rp.para==='SOHO','la clase recuerda para qué estudio fue'); fqGuardar(rp,['perfecta']); ok(FQ()[0].para==='SOHO','el feedback guarda el estudio'); state.cfg.para=null;
  const p=cicloCrear(cs,4,1); const rc=p.semanas[1].clases[0]; fqGuardar(p.semanas[0].clases[0],['pesada']); ok(FQ()[0].ciclo&&FQ()[0].ciclo.n===1,'el feedback guarda la semana del ciclo'); state.routine=rc; state.screen='planner'; render(); ok(/Lo que anotaste en esta etapa/.test($('#app').textContent)&&/muy pesada/.test($('#app').textContent),'el planner del ciclo muestra lo anotado');
  // ---------- calificador estricto ----------
  const sc=[]; const bump=window.bumpHistoria; window.bumpHistoria=()=>{}; const cf=Object.assign({},cs); for(let i=0;i<20;i++){ sc.push(claseCalidad(_generate(Object.assign({},cf,{_tema:'clasica'}))).score); } window.bumpHistoria=bump;
  const prom=sc.reduce((a,b)=>a+b)/sc.length, sd=Math.sqrt(sc.reduce((a,b)=>a+(b-prom)**2,0)/sc.length); info.sculptCrudo=Math.round(prom)+' ±'+Math.round(sd); ok(prom<92&&prom>55,'una clase Sculpt sin filtro ya no saca ~100 (prom '+Math.round(prom)+')'); ok(sd>=2,'el puntaje distingue unas clases de otras (σ='+sd.toFixed(1)+')');
  const sf=[]; const cff=Object.assign({},state.cfg,{metodo:'fuerza',fModo:'full',objetivo:'pesada',fDuracion:55,fPorBloque:'auto',fFormato:'biseries',descanso:80,calent:true,enfr:true,tema:'auto'}); for(let i=0;i<12;i++) sf.push(claseCalidad(generate(cff)).score); const pf=sf.reduce((a,b)=>a+b)/sf.length; info.fuerzaFinal=Math.round(pf); ok(pf<97,'Fuerza tampoco satura en 100 (prom '+Math.round(pf)+')');
  const pickS=[]; for(let i=0;i<10;i++) pickS.push(claseCalidad(generate(cs)).score); const pp=pickS.reduce((a,b)=>a+b)/10; info.sculptFinal=Math.round(pp); ok(pp>=Math.min(prom,70)-3,'la mejor de 10 no sale peor que una al azar');
  // no se castiga a sí misma por estar en el historial
  const rr=generate(Object.assign({},cs,{tema:'clasica'})); const q1=claseCalidad(rr); const q2=claseCalidad(JSON.parse(JSON.stringify(rr))); ok(q1.score>=q2.score-12,'estar en el historial no la hunde ('+q1.score+' vs copia '+q2.score+')');
  // ráfaga final no cuenta como repetido
  const rf=generate(Object.assign({},cs,{tema:'rafaga'})); ok(!claseCalidad(rf).notas.some(n=>/repetido/.test(n.x)),'la "ráfaga final" no se cuenta como ejercicio repetido');
  // barre no revienta
  const rb=generate(Object.assign({},state.cfg,{metodo:'barre',bModo:'full',bDificultad:'media',bBase:8,bPorBloque:5,bDuracion:50,calent:true,enfr:true})); let eb=null; try{ claseCalidad(rb); }catch(e){ eb=String(e); } ok(!eb,'el calificador no falla con Barre '+eb);
  ok(!/undefined|NaN/.test($('#app').textContent),'sin undefined'); return {fallas:F,info,errs:__errs};
};
