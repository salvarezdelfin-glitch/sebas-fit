/* Prueba en navegador de la sección "Yo" (plan de maratón + pesas + comida). Usa boot.js. */
window.yoTest=async function(){
  await bootTest();
  const F=[]; const ok=(c,m)=>{ if(!c) F.push(m); }; const info={};
  const $=s=>document.querySelector(s), setv=(id,v)=>{ const e=document.getElementById(id); if(!e) F.push('falta '+id); else e.value=v; };
  const click=a=>{ const e=$('[data-action="'+a+'"]'); if(!e){ F.push('no hay botón '+a); return false; } e.click(); return true; };
  state.screen='yo'; render(); ok(/Yo/.test($('#nav').textContent),'nav tiene Yo'); ok(/Define la fecha/.test($('#app').textContent),'sin plan pide fecha');
  ok(/Ir a Perfil/.test($('#app').textContent),'estado vacío con botón a Perfil');
  // --- perfil ---
  click('yo-tab'); document.querySelector('[data-action="yo-tab"][data-t="perfil"]').click();
  const carrera=addDays(yoLunes(todayStr()),22*7+6);                       // domingo, 23 semanas
  setv('yo-sexo','m'); setv('yo-edad',33); setv('yo-est',178); setv('yo-peso',92); setv('yo-grasa',17); setv('yo-nivel','intermedio'); setv('yo-km',30); setv('yo-largo',14);
  setv('yo-fecha',carrera); setv('yo-tiempo','4:00'); setv('yo-gmin',8); setv('yo-gmax',12);
  setv('yo-b-sentadilla-kg',90); setv('yo-b-sentadilla-reps',5); setv('yo-b-banca-kg',85); setv('yo-b-banca-reps',5); setv('yo-b-muerto-kg',110); setv('yo-b-muerto-reps',3);
  setv('yo-m-sentadilla',100); setv('yo-m-banca',100); setv('yo-m-muerto',100); setv('yo-ncorrer',4); setv('yo-npesas',3);
  $('[data-action="yo-perfil-save"]').click();
  const pl=yoPlan(); ok(!!pl&&pl.fecha===carrera,'plan creado con la fecha'); ok(YOUI.tab==='hoy','vuelve a Hoy'); ok(YO_D().pesos.length===1,'peso inicial registrado');
  // --- calendario ---
  const cnt=c=>pl.layout.reduce((a,d)=>a+d.filter(x=>x===c).length,0);
  ok(cnt('LR')===1&&cnt('Q')===1&&cnt('E')===2&&cnt('A')===1&&cnt('B')===1&&cnt('C')===1&&cnt('D')===0,'sesiones de la semana: '+JSON.stringify(pl.layout));
  ok(pl.layout.some(d=>!d.length),'hay día libre'); const lrd=pl.layout.findIndex(d=>d.includes('LR'));
  ok(!pl.layout[(lrd+6)%7].some(c=>c==='A'||c==='C'),'ni pierna pesada ni peso muerto el día antes del fondo largo');
  const cl=yoClasesPorDia(); info.clases=cl.join(','); info.layout=pl.layout.map(d=>d.join('+')||'-').join(' | '); info.puntaje=pl.puntaje;
  ok(cl[lrd]<=1,'fondo largo en día con ≤1 clase ('+cl[lrd]+')');
  const dup=yoAcomodo(4,3); ok(JSON.stringify(dup.layout)===JSON.stringify(pl.layout),'acomodo determinista');
  // --- semanas ---
  const S=yoSemanas(), n=S.length; ok(n===23,'23 semanas ('+n+')'); ok(S[n-1].fase==='carrera'&&S[n-2].fase==='afinacion'&&S[n-3].fase==='afinacion'&&S[n-4].fase==='pico','fases al final');
  info.fases=S.map(s=>s.fase[0]).join(''); info.km=S.map(s=>s.km).join(','); info.largo=S.map(s=>s.largo).join(',');
  let sube=true; for(let i=1;i<n;i++){ const a=S[i-1],b=S[i]; if(!['base','construccion','pico'].includes(b.fase)||b.cut||a.cut) continue; if(b.km>a.km*1.12+1) sube=false; } ok(sube,'no sube más de 10 % entre semanas normales');
  ok(S.filter(s=>s.cut).every(s=>(s.i+1)%4===0),'descargas cada 4ª semana'); ok(Math.max(...S.map(s=>s.largo))<=32&&Math.max(...S.map(s=>s.largo))>=28,'fondo máx. entre 28 y 32 ('+Math.max(...S.map(s=>s.largo))+')');
  ok(S.every(s=>s.largo<=0.52*s.km+1||s.fase==='carrera'),'fondo ≤ ~50 % de la semana'); ok(Math.max(...S.map(s=>s.km))<=pl.pico,'no pasa del pico'); ok(Math.max(...S.map(s=>s.km))>=pl.pico*0.9,'llega al pico ('+Math.max(...S.map(s=>s.km))+')');
  ok(S[n-1].km<S[n-4].km*0.5,'semana de carrera baja el volumen');
  // todas las semanas y días se describen sin romper
  let dias=0, malos=[]; S.forEach(s=>yoDiasSemana(s).forEach(d=>{ dias++; d.ses.forEach(x=>{ if(!x.titulo||!x.items.length||/undefined|NaN/.test(x.titulo+x.items.join(' '))) malos.push(s.i+':'+x.code+':'+x.titulo); }); })); ok(!malos.length,'descripciones limpias '+malos.slice(0,4)); info.dias=dias;
  const race=yoDiasSemana(S[n-1]); ok(race[6].ses.some(x=>x.code==='RACE'),'el domingo es el maratón'); ok(!race.slice(0,5).some(d=>d.ses.some(x=>x.code==='A'||x.code==='C')),'sin pierna pesada en la semana de carrera');
  // --- fuerza ---
  const e=yoE1rm('sentadilla'); ok(Math.abs(e-105)<.01,'1RM sentadilla de 90×5 = 105 ('+e+')'); ok(yoKgPara('sentadilla',.8)%2.5===0,'pesos en múltiplos de 2.5'); ok(yoKgPara('muerto',.8)>0,'peso muerto calculado');
  const f0=yoFzaSem(S[0]), f9=yoFzaSem(S.find(s=>s.fase==='pico')); ok(f0.sets>f9.sets,'menos series en el pico ('+f0.sets+' → '+f9.sets+')'); ok(yoFzaSem(S.find(s=>s.cut)).deload,'descarga en semana de descanso');
  YO_D().pesas.push({id:'p1',fecha:addDays(todayStr(),-1),lift:'sentadilla',kg:60,reps:5,series:1,rpe:7}); ok(yoKgPara('sentadilla',.85)<=65,'nunca más de +5 kg sobre lo último ('+yoKgPara('sentadilla',.85)+')'); YO_D().pesas.pop();
  // --- nutrición ---
  const kg=yoPesoActual(); ok(kg===92,'peso actual 92'); const bm=yoBmr(); ok(bm>1700&&bm<2300,'BMR razonable '+Math.round(bm));
  const pesoOk=[]; Object.keys(YO_TIPOS).forEach(t=>{ const nu=yoNutri(t,{sem:S[0],clases:1}); info['n_'+t]=nu.kcal+'/'+nu.P+'/'+nu.C+'/'+nu.F;
    ok(nu.P>=1.8*kg-1&&nu.P<=2.3*kg+1,'proteína 1.8–2.3 g/kg en '+t); ok(nu.C/kg>=YO_TIPOS[t].carb-.1,'carbohidrato mínimo '+t+' ('+nu.gkgC+')'); ok(nu.F/kg>=.84,'grasa ≥ 0.85 g/kg '+t); ok(Math.abs(4*nu.P+4*nu.C+9*nu.F-nu.kcal)<25,'kcal cuadran '+t);
    ok(nu.kcal>=nu.tdee-360,'déficit ≤ 350 kcal '+t); pesoOk.push(nu); });
  const nB=yoNutri('descanso',{sem:S[0],clases:0}), nL=yoNutri('largo',{sem:S[0],clases:0}); ok(nB.kcal<nB.tdee,'con 17 % de grasa hay déficit suave en día ligero en base'); ok(nL.kcal>=nL.tdee-1,'sin déficit en día de fondo largo');
  const nP=yoNutri('rodaje',{sem:S.find(s=>s.fase==='pico'),clases:0}); ok(nP.kcal>=nP.tdee-1,'sin déficit en el pico');
  const nCarga=yoNutri('carga',{sem:S[n-1]}); ok(nCarga.gkgC>=8.9,'carga ≥ 9 g/kg ('+nCarga.gkgC+')');
  let malMenu=[]; Object.keys(YO_TIPOS).forEach(t=>{ const nu=yoNutri(t,{sem:S[0],clases:1}); for(let v=0;v<6;v++){ const m=yoMenu(nu,v); const tot=m.reduce((a,p)=>a+p.P,0), totC=m.reduce((a,p)=>a+p.C,0); const txt=m.map(p=>p.items.join(' ')).join(' ');
    if(/undefined|NaN|\b0 [a-z]/.test(txt)||m.some(p=>!p.items.length)) malMenu.push(t+v+':'+txt.slice(0,120)); if(Math.abs(tot-nu.est.P)>nu.est.P*.3) malMenu.push(t+v+' proteína '+tot+' vs '+nu.est.P); if(totC<nu.est.C*.7||totC>nu.est.C*1.3) malMenu.push(t+v+' carbo '+totC+' vs '+nu.est.C); } }); ok(!malMenu.length,'menús: '+malMenu.slice(0,5).join(' || '));
  info.menuEjemplo=yoMenu(yoNutri('largo',{sem:S[0]}),0).map(p=>p.mom+': '+p.items.join(', ')+' ['+p.kcal+']');
  // --- banda de grasa ---
  const b=yoBanda(); ok(b&&Math.abs(b.lean-92*0.83)<.1,'masa magra 76.4'); ok(b.arriba&&b.kgSobre>0&&b.w12>b.w10&&b.w10>b.w8,'pesos objetivo ordenados'); info.banda=[r1(b.w12),r1(b.w10),r1(b.w8),b.semanas];
  YO_D().perfil.sexo='f'; ok(yoSeguridad().some(x=>/mujeres/.test(x)),'aviso para mujeres'); YO_D().perfil.sexo='m';
  // --- pantallas ---
  const tabs=['hoy','semana','maraton','fuerza','comida','progreso','perfil']; for(const t of tabs){ YOUI.tab=t; state.screen='yo'; try{ render(); }catch(er){ F.push('render '+t+': '+er.message); } ok(!/undefined|NaN/.test($('#app').textContent),'sin undefined/NaN en '+t+': '+($('#app').textContent.match(/.{20}(undefined|NaN).{20}/)||[''])[0]); }
  YOUI.tab='hoy'; render(); ok(/Faltan \d+ semanas/.test($('#app').textContent),'cuenta regresiva'); ok(/¿Cómo amaneciste\?/.test($('#app').textContent),'check-in visible');
  document.querySelector('[data-action="yo-ck"][data-k="sueno"][data-v="2"]').click(); document.querySelector('[data-action="yo-ck"][data-k="energia"][data-v="2"]').click(); document.querySelector('[data-action="yo-ck"][data-k="animo"][data-v="3"]').click();
  ok(yoAjuste().nivel==='bajo','sueño/energía bajos → plan suave ('+JSON.stringify(yoAjuste())+')'); document.querySelector('[data-action="yo-ck"][data-k="dolor"][data-v="6"]').click(); ok(yoAjuste().nivel==='alto','dolor 6 → alto'); document.querySelector('[data-action="yo-ck"][data-k="dolor"][data-v="8"]').click(); ok(yoAjuste().nivel==='rojo','dolor 8 → rojo');
  const z=$('#yo-zona'); z.value='rodilla'; z.dispatchEvent(new Event('input',{bubbles:true})); ok(yoCheckin().zona==='rodilla','guarda la zona del dolor');
  document.querySelector('[data-action="yo-ck"][data-k="dolor"][data-v="0"]').click(); ['sueno','energia','animo'].forEach(k=>document.querySelector('[data-action="yo-ck"][data-k="'+k+'"][data-v="5"]').click()); ok(yoAjuste().nivel==='ok','todo 5 → ok');
  // semana: navegar
  YOUI.tab='semana'; render(); const t0=$('#app').textContent; $('[data-action="yo-sem"][data-d="1"]').click(); ok($('#app').textContent!==t0&&/Semana 2 de 23/.test($('#app').textContent),'navega a la semana siguiente'); YOUI.off=0;
  // registros
  YOUI.tab='progreso'; render(); document.querySelector('[data-action="yo-log"][data-t="peso"]').click(); setv('yp-peso',91.2); setv('yp-grasa',16.2); $('[data-action="yo-save-peso"]').click(); ok(YO_D().pesos.length===2&&yoPesoActual()===91.2,'guarda peso');
  document.querySelector('[data-action="yo-log"][data-t="carrera"]').click(); setv('yc-km',10); setv('yc-min',58); setv('yc-rpe',6); $('[data-action="yo-save-carrera"]').click(); ok(YO_D().carreras.length===1,'guarda carrera');
  YOUI.tab='fuerza'; render(); document.querySelector('[data-action="yo-log"][data-t="pesa"]').click(); setv('ys-lift','banca'); setv('ys-kg',90); setv('ys-reps',5); $('[data-action="yo-save-pesa"]').click(); ok(YO_D().pesas.length===1&&yoE1rm('banca')>=104.9,'guarda serie y sube el 1RM de banca ('+yoE1rm('banca')+')');
  ok(/Meta cumplida/.test($('#app').textContent),'marca la meta de 100 kg cumplida');
  document.querySelector('[data-action="yo-del"][data-k="pesas"]').click(); ok(YO_D().pesas.length===0,'borra serie'); $('#toastU button').click(); ok(YO_D().pesas.length===1,'deshacer borrado');
  // alertas: salto de km
  const lun=yoLunes(todayStr()); YO_D().carreras.length=0; YO_D().carreras.push({id:'a',fecha:addDays(lun,-6),km:15,tipo:'fácil'},{id:'b',fecha:addDays(lun,-4),km:15,tipo:'fácil'},{id:'c',fecha:addDays(lun,0),km:28,tipo:'largo'},{id:'d',fecha:addDays(lun,1),km:6,tipo:'fácil'});
  const hoyIdx=yoDow(todayStr()); const al=yoAlertas().map(x=>x.x).join(' | '); info.alertas=al.slice(0,200); if(hoyIdx>=3) ok(/subieron/.test(al),'alerta de salto de kilómetros');
  ok(/rodaje más largo|largo es/.test(al),'alerta de fondo > 40 % de la semana');
  YO_D().pesos.push({id:'w1',fecha:addDays(todayStr(),-14),peso:95,grasa:17},{id:'w2',fecha:todayStr(),peso:91.2,grasa:16.2}); ok(yoAlertas().some(x=>/demasiado rápido/.test(x.x)),'alerta de pérdida de peso rápida');
  // comida
  YOUI.tab='comida'; YOUI.tipo=null; render(); ok(/Antojo libre/.test($('#app').textContent),'muestra antojo libre'); const kc=yoNutri('descanso',{sem:S[0],clases:0}).libreKcal; click('yo-menu-otra'); ok(YOUI.menuV===1,'otra opción cambia el menú');
  document.querySelector('[data-action="yo-libre"][data-v="0"]').click(); ok(yoNutri('descanso',{sem:S[0],clases:0}).libreKcal===0&&kc>0,'antojo libre ajustable'); document.querySelector('[data-action="yo-tipo"][data-t="largo"]').click(); ok(/Durante la carrera/.test($('#app').textContent),'día largo muestra comida durante la carrera');
  // persistencia: pasa por el guardado y el merge
  const copia=JSON.parse(JSON.stringify(Vault.data)); const merged=mergeData(copia,copia); ok(merged.yo&&merged.yo.pesos.length===YO_D().pesos.length&&merged.yo.plan&&merged.yo.plan.layout,'el merge conserva Yo');
  YOUI.tab='hoy'; render(); return {fallas:F,info,errs:__errs};
};
