/* Prueba en navegador del panel de Clases 2 (resumen, lo que me deben, historial por mes) */
window.cl2Test=async function(){
  await bootTest(); CL.open={}; CL.res={tab:'semana',back:0}; CL.mesesMas=false;
  const F=[]; const ok=(c,m)=>{ if(!c) F.push(m); }; const info={}; const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const C=CL_D(), hoy=todayStr();
  // datos: 8 meses de clases (varias por semana) y varios cobros
  C.entries.length=0; C.cobros=[]; let k=0;
  for(let d=0;d<240;d++){ const f=addDays(hoy,-d), wd=parseLocalDate(f).getDay(); if(wd===0) continue;
    [['SOHO','09:00',400],['EUPHORIA','07:00',450],['EJE','19:00',350]].forEach(([s,t,a],i)=>{ if((d+i)%3===0||wd===1&&i===1) C.entries.push({id:'e'+(k++),date:f,day:diaDeFecha(f),studio:s,time:t,tipo:'propia',attendance:null,amount:a,nota:'',rutina:'',playlist:'',confirmado:d>0||i!==2,auto:true}); }); }
  C.entries.push({id:'ex1',date:hoy,day:diaDeFecha(hoy),studio:'ALUNNA',time:'18:00',tipo:'propia',attendance:'grupo',amount:380,confirmado:true,auto:true});
  for(let b=1;b<=14;b++){ const q=quincenaFor(hoy,b); C.cobros.push({id:'Q|'+q.startStr,tipo:'Q',studio:null,start:q.startStr,end:q.endStr,recibido:cbEstimate('Q',null,q.startStr,q.endStr),fecha:addDays(q.endStr,1),creado:nowISO()}); }
  info.entradas=C.entries.length; touch();
  state.screen='hoy'; render(); const tx=$('#app').textContent;
  ok(/Cuánto llevas/.test(tx)&&/Lo que me deben/.test(tx)&&/Historial por mes/.test(tx),'secciones nuevas'); ok(!/undefined|NaN/.test(tx),'sin undefined: '+(tx.match(/.{15}(undefined|NaN).{15}/)||[''])[0]);
  // la bitácora larga ya no se pinta toda
  const filas=$$('#app .row').length, cobrosFilas=$$('#app .cb-row').length; info.filasVisibles={clases:filas,cobros:cobrosFilas}; ok(filas<=5&&cobrosFilas===0,'no hay listas largas ('+filas+' clases, '+cobrosFilas+' cobros visibles)');
  ok($$('.cl-mes').length===6&&!!$('[data-action="cl-mas-meses"]'),'6 meses visibles y botón para ver anteriores ('+$$('.cl-mes').length+')');
  // totales de la semana / quincena / mes coinciden con los datos
  const suma=(ini,fin)=>C.entries.filter(e=>e.date>=ini&&e.date<=fin&&e.confirmado!==false).reduce((a,e)=>a+e.amount,0), cuenta=(ini,fin)=>C.entries.filter(e=>e.date>=ini&&e.date<=fin&&e.confirmado!==false).length;
  for(const tab of ['semana','quincena','mes']){ $('[data-action="cl-res-tab"][data-v="'+tab+'"]').click(); const P=clPeriodo(tab,0), t=$('#cl-resumen').textContent;
    ok(t.indexOf(money(suma(P.ini,P.fin)))>=0,tab+': el ganado coincide ('+money(suma(P.ini,P.fin))+')'); ok(new RegExp('Clases dadas\\s*'+cuenta(P.ini,P.fin)).test(t),tab+': las clases coinciden ('+cuenta(P.ini,P.fin)+')'); }
  // pager hacia atrás
  $('[data-action="cl-res-tab"][data-v="semana"]').click(); const l0=$('.cl-pager b').textContent; $('[data-action="cl-res-prev"]').click(); const l1=$('.cl-pager b').textContent; ok(l0!==l1&&!!$('[data-action="cl-res-hoy"]'),'navega a la semana anterior'); $('[data-action="cl-res-hoy"]').click(); ok($('.cl-pager b').textContent===l0,'vuelve a hoy');
  const P1=clPeriodo('semana',1); $('[data-action="cl-res-prev"]').click(); ok($('#cl-resumen').textContent.indexOf(money(suma(P1.ini,P1.fin)))>=0,'semana anterior con su total'); $('[data-action="cl-res-hoy"]').click();
  // por estudio: SOHO (semanal) y quincenales aparecen en su grupo
  $('[data-action="cl-res-tab"][data-v="quincena"]').click(); const t2=$('#cl-resumen').textContent; ok(/Pago semanal/.test(t2)&&/Pago quincenal/.test(t2),'agrupa por forma de pago'); const q0=clPeriodo('quincena',0); const sohoQ=C.entries.filter(e=>e.studio==='SOHO'&&e.date>=q0.ini&&e.date<=q0.fin&&e.confirmado!==false).reduce((a,e)=>a+e.amount,0); ok(t2.indexOf(money(sohoQ))>=0,'SOHO en la quincena: '+money(sohoQ));
  // lo que me deben: SOHO semanal y quincenales
  const dtx=$('#cl-debes').textContent; ok(/Soho te debe esta semana/i.test(dtx),'SOHO te debe esta semana'); const cy=weeklyCycleFor(hoy,'Martes',0); const sohoC=C.entries.filter(e=>e.studio==='SOHO'&&e.date>=cy.startStr&&e.date<=cy.endStr&&e.confirmado!==false).reduce((a,e)=>a+e.amount,0); ok(dtx.indexOf(money(sohoC))>=0,'monto de SOHO del ciclo ('+money(sohoC)+')'); ok(/quincenales/i.test(dtx),'estudios quincenales');
  const pend0=cbPendientes(); info.pendientes=pend0.length; const tot0=pend0.reduce((s,x)=>s+x.est,0);
  if(pend0.length){ const btn=$('#cl-debes [data-action="cl-cobro-save"]'); ok(!!btn,'botón para marcar cobrado'); btn.click(); const tot1=cbPendientes().reduce((s,x)=>s+x.est,0); ok(tot1<tot0,'al marcar cobrado baja lo pendiente ('+money(tot0)+' → '+money(tot1)+')'); }
  // el historial abre un mes a la vez
  const m0=clMesesLista()[1]; $('[data-action="cl-mes"][data-m="'+m0+'"]').click(); const abiertos=$$('.cl-mes.on').length; ok(abiertos===1,'abre solo el mes elegido'); const nFilas=$$('#cl-historial .row').length, esperado=C.entries.filter(e=>e.date.slice(0,7)===m0).length; ok(nFilas===esperado,'muestra las clases de ese mes ('+nFilas+' de '+esperado+')');
  ok(!/undefined|NaN/.test($('#cl-historial').textContent),'historial sin undefined'); $('[data-action="cl-mes"][data-m="'+m0+'"]').click(); ok($$('.cl-mes.on').length===0,'se vuelve a cerrar');
  $('[data-action="cl-mas-meses"]').click(); ok($$('.cl-mes').length===clMesesLista().length,'ver meses anteriores'); $('[data-action="cl-mas-meses"]').click();
  // editar un cobro dentro de un mes recalcula
  const mc=cbList()[0].fecha.slice(0,7); CL.open[mc]=true; clRefreshLists(); const inp=$('#cl-historial [data-action="cl-cobro-edit"][data-f="recibido"]'); if(inp){ const before=cbRecibidoEnMes(mc); inp.value=String((+inp.value||0)+100); inp.dispatchEvent(new Event('change',{bubbles:true})); ok(cbRecibidoEnMes(mc)===before+100,'editar un cobro actualiza el mes'); }
  // el editor del día sigue funcionando
  const antes=C.entries.length; const slot=C.schedule.find(s=>s.day===diaDeFecha(hoy)); if(slot){ CL.day=hoy; render(); const cb=$('[data-action="cl-fixed"][data-slot="'+slot.id+'"]'); if(cb){ cb.checked=!cb.checked; cb.dispatchEvent(new Event('change',{bubbles:true})); ok(C.entries.length!==antes,'el editor del día marca clases'); } }
  // la sección "Más" conserva horario y forma de pago
  ok(/Horario fijo/.test($('#app').textContent)&&/Forma de pago/.test($('#app').textContent),'horario y forma de pago siguen ahí');
  return {fallas:F,info,errs:__errs};
};
