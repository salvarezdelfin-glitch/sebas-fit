/* Prueba en navegador de: estilos de entrenamiento, cardio, seguimiento, siguiente bloque y PDF (usa boot.js) */
window.pt3Test=async function(){
  await bootTest();
  const F=[]; const ok=(c,m)=>{ if(!c) F.push(m); }; const info={}; const $=s=>document.querySelector(s);
  const D=PT_D();
  // ---------- estilos × nivel × días × material ----------
  const estilos=Object.keys(PT_ESTILOS), esperado={ppl:{3:["Empuje","Tracción","Pierna"]},muscular:{3:["Pecho y tríceps","Espalda y bíceps","Pierna"]},fuerza:{2:["Fuerza A","Fuerza B"]},circuito:{3:["Circuito A","Circuito B","Circuito C"]},fullbody:{3:["Cuerpo completo A","Cuerpo completo B","Cuerpo completo C"]},torsopierna:{4:["Tren superior A","Tren inferior A","Tren superior B","Tren inferior B"]}};
  let n=0, malos=[];
  for(const es of estilos) for(const nv of ['basico','intermedio','avanzado']) for(const dias of [2,3,4,5,6]) for(const eq of ['gym','casa']) for(const ob of ['hipertrofia','grasa']){
    let p; try{ p=ptGenerar({nivel:nv,objetivo:ob,dias,semanas:8,minutos:60,equipo:eq,lesiones:[],estilo:es,cardio:'auto'}); }catch(e){ malos.push(es+nv+dias+eq+' CRASH '+e.message); continue; } n++;
    if(!p.dias.length||p.dias.some(d=>d.ejercicios.length<3)) malos.push(es+'/'+nv+'/'+dias+'/'+eq+' día vacío');
    if(p.dias.some(d=>ptMinDia(d)>75)) malos.push(es+'/'+nv+'/'+dias+'/'+eq+' sesión larga '+Math.max(...p.dias.map(ptMinDia)));
    if(p.estilo!==es) malos.push('estilo no guardado '+es);
    const e=esperado[es]&&esperado[es][p.diasSem]; if(e&&nv!=='basico'||(e&&nv==='basico'&&p.diasSem===dias)){ if(e&&JSON.stringify(p.dias.map(d=>d.nombre.replace(/^Día \d+ — /,'')))!==JSON.stringify(e)) malos.push(es+'/'+nv+'/'+dias+' nombres '+p.dias.map(d=>d.nombre).join('|')); }
    if(es==='circuito'&&p.dias[0].ejercicios.some(s=>s.sets>3)) malos.push('circuito con >3 series');
    if(es==='fuerza'&&!p.dias[0].ejercicios.some(s=>s.rol==='main'&&s.sets>=3&&s.hi<=6)) malos.push('fuerza base sin básicos pesados '+nv);
  }
  info.combos=n; ok(!malos.length,'estilos: '+malos.slice(0,6).join(' || '));
  ok(ptEstiloAviso('ppl','basico',3)!==''&&ptEstiloAviso('auto','basico',3)==='','avisos de estilo');
  // ---------- cardio ----------
  let malCar=[]; for(const ob of Object.keys(PT_OBJETIVOS)) for(const nv of ['basico','intermedio','avanzado']){
    const pg=ptGenerar({nivel:nv,objetivo:ob,dias:3,semanas:12,minutos:60,equipo:'gym',lesiones:[],cardio:'auto'}), t=PT_CARDIO_TBL[ob][nv];
    const s1=ptCardioSemana(pg,1,{edad:30}), s5=ptCardioSemana(pg,5,{edad:30}), s4=ptCardioSemana(pg,4,{edad:30});
    if(s1.length!==t[0]+t[1]) malCar.push(ob+nv+' sesiones '+s1.length); if(!(s5[0].min>s1[0].min)) malCar.push(ob+nv+' no progresa'); if(!(s4[0].min<s5[0].min)) malCar.push(ob+nv+' sin descarga');
    if(!/lpm/.test(JSON.stringify(s1))) malCar.push(ob+nv+' sin pulso'); if(/undefined|NaN/.test(JSON.stringify([s1,s5]))) malCar.push(ob+nv+' undefined');
    const no=ptGenerar({nivel:nv,objetivo:ob,dias:3,semanas:8,minutos:60,equipo:'gym',lesiones:[],cardio:'no'}); if(ptCardioSemana(no,1,null).length) malCar.push('cardio no');
    const mas=ptGenerar({nivel:nv,objetivo:ob,dias:3,semanas:8,minutos:60,equipo:'gym',lesiones:[],cardio:'mas'}); if(ptCardioSemana(mas,1,null).length!==s1.length+1) malCar.push('cardio mas');
  } ok(!malCar.length,'cardio: '+malCar.slice(0,5).join(' || '));
  // ---------- cliente, UI y PDF ----------
  state.screen='clientes'; render(); $('[data-action="pt-nuevo"]').click();
  ok(!!$('#pc-estilo')&&!!$('#pc-edad'),'ficha con estilo y edad');
  const set=(id,v)=>{ const e=document.getElementById(id); if(e) e.value=v; else F.push('falta '+id); };
  set('pc-nombre','Laura Gómez'); set('pc-nivel','basico'); set('pc-objetivo','grasa'); set('pc-estilo','fullbody'); set('pc-edad',34); set('pc-estatura',165); set('pc-peso0',78); set('pc-grasa0',33); set('pc-sexo','f'); set('pc-metaTexto','bajar a 26 % de grasa'); set('pc-dias',3);
  $('[data-action="pt-cliente-save"]').click(); const c=D.clientes[0]; ok(c&&c.edad===34&&c.estilo==='fullbody','cliente guardado con edad y estilo');
  PTUI.tab='programa'; render(); $('[data-action="pt-gen"]').click(); ok(document.getElementById('pg-estilo').value==='fullbody'&&!!$('#pg-cardio'),'el generador hereda el estilo del cliente');
  const sel=document.getElementById('pg-estilo'); sel.value='muscular'; sel.dispatchEvent(new Event('change',{bubbles:true})); ok(/⚠/.test(document.getElementById('pg-estilo-hint').textContent),'aviso al elegir un estilo poco conveniente');
  sel.value='fullbody'; sel.dispatchEvent(new Event('change',{bubbles:true})); $('[data-action="pt-gen-ok"]').click();
  const prog=ptProgActivo(c.id); ok(prog&&prog.estilo==='fullbody'&&/Cuerpo completo/.test(prog.nombre),'programa generado con el estilo ('+(prog&&prog.nombre)+')');
  ok(/Cardio · semana 1/.test($('#app').textContent),'el programa muestra el cardio'); ok(!!$('[data-action="pt-pdf-rutina"]'),'botón Descargar PDF');
  // sesiones registradas para tener datos
  const hoy=todayStr(); const ex=prog.dias[0].ejercicios[0].ex;
  for(let w=0;w<8;w++) for(let k=0;k<3;k++){ const f=addDays(hoy,-(7*(7-w))+k*2-1); if(f>hoy) continue; D.sesiones.push({id:'s'+w+k,clienteId:c.id,progId:prog.id,diaId:prog.dias[k%prog.dias.length].id,diaNombre:'x',fecha:f,semana:w+1,completada:true,energia:3,nota:'',series:[{ex,sets:[{kg:20+w*1.25,reps:10,rir:2},{kg:20+w*1.25,reps:10,rir:2}]}]}); }
  c.inicio=addDays(hoy,-56); prog.inicio=addDays(hoy,-56);
  D.medidas.length=0; D.medidas.push({id:'m1',clienteId:c.id,fecha:addDays(hoy,-56),peso:78,grasa:33,cintura:90,cadera:106,pecho:null,brazo:null,muslo:null,inicial:true},{id:'m2',clienteId:c.id,fecha:addDays(hoy,-1),peso:75.4,grasa:31,cintura:86,cadera:104,pecho:null,brazo:null,muslo:null});
  D.cardios.push({id:'k1',clienteId:c.id,fecha:addDays(hoy,-3),tipo:'Cardio constante',min:30,rpe:5,fc:128});
  // seguimiento
  PTUI.tab='seguimiento'; state.screen='cliente'; PTUI.cid=c.id; render(); const tx=$('#app').textContent; ok(/Constancia/.test(tx)&&/Racha/.test(tx)&&/Revisión y ajustes/.test(tx),'pestaña Seguimiento'); ok(!/undefined|NaN/.test(tx),'seguimiento sin undefined: '+(tx.match(/.{15}(undefined|NaN).{15}/)||[''])[0]);
  const g=ptDiagnostico(c); info.recs=g.recs.map(r=>r.t+':'+r.x.slice(0,70)); info.ad4=g.ad4.pct; info.tend=g.tend; info.racha=g.cs.racha; ok(g.recs.length>=2,'hay recomendaciones');
  // acciones: +serie, cardio, rotar
  const s0=JSON.stringify(prog.dias.map(d=>d.ejercicios.map(e=>e.ex))); const rx0=ptRx(prog,prog.dias[0].ejercicios.find(e=>e.rol==='main'),2).sets;
  ptClick3('pt-rec',{dataset:{k:'series',id:c.id}}); ok(prog.ajusteMain===1&&ptRx(prog,prog.dias[0].ejercicios.find(e=>e.rol==='main'),2).sets===rx0+1,'+1 serie en básicos');
  const c0=ptCardioSemana(prog,1,c).length; ptClick3('pt-rec',{dataset:{k:'cardio',id:c.id}}); ok(ptCardioSemana(prog,1,c).length===c0+1,'+1 cardio');
  ptClick3('pt-rec',{dataset:{k:'rotar',id:c.id}}); ok(JSON.stringify(prog.dias.map(d=>d.ejercicios.map(e=>e.ex)))!==s0,'accesorios rotados'); ok(prog.ajustes.length===3,'cambios registrados');
  // revisión
  ptClick3('pt-rev-nueva',{dataset:{id:c.id}}); document.getElementById('pr-nota').value='Va muy bien'; $('[data-action="pt-rev-save"]').click(); ok(D.revisiones.length===1&&D.revisiones[0].nota==='Va muy bien','revisión guardada');
  // cardio registro
  ptClick3('pt-cardio-nuevo',{dataset:{id:c.id}}); set('pk-min',35); $('[data-action="pt-cardio-save"]').click(); ok(D.cardios.length===2,'cardio registrado');
  // PDFs
  const chk=(u,nom)=>{ const s=[...u].map(b=>String.fromCharCode(b)).join(''); ok(s.startsWith('%PDF-1.4')&&s.trimEnd().endsWith('%%EOF'),nom+' cabecera/final'); const sx=+s.match(/startxref\n(\d+)/)[1]; ok(s.slice(sx,sx+4)==='xref',nom+' xref'); const cnt=+s.match(/\/Size (\d+)/)[1]; const offs=[...s.slice(sx).matchAll(/(\d{10}) 00000 n/g)].map(m=>+m[1]); ok(offs.length===cnt-1&&offs.every((o,i)=>s.slice(o,o+((i+1)+' 0 obj').length)===((i+1)+' 0 obj')),nom+' offsets'); const pages=(s.match(/\/Type\/Page\//g)||[]).length; info[nom]={bytes:u.length,paginas:pages}; return s; };
  const pr=ptPdfRutina(prog,c).bytes(); const s1=chk(pr,'pdfRutina'); ok(/Laura G/.test(s1)&&/34 a/.test(s1)&&/75.4 kg/.test(s1)&&/31 %/.test(s1),'PDF con nombre, edad, peso y grasa');
  const pl=ptPdfRutina(ptGenerar({nivel:'intermedio',objetivo:'hipertrofia',dias:4,semanas:8,minutos:60,equipo:'gym',lesiones:[],estilo:'ppl',cardio:'auto'}),null).bytes(); chk(pl,'pdfPlantilla');
  const inf=ptPdfInforme(c).bytes(); const s3=chk(inf,'pdfInforme'); ok(/Antes y ahora/.test(s3)&&/Constancia/.test(s3),'informe con comparación');
  window.__pdfs={rutina:pr,plantilla:pl,informe:inf};
  // descargar desde el botón no revienta
  let dl=0; const oc=HTMLAnchorElement.prototype.click; HTMLAnchorElement.prototype.click=function(){ if(this.download){ dl++; info.nombreArchivo=this.download; return; } return oc.call(this); };
  PTUI.tab='programa'; render(); $('[data-action="pt-pdf-rutina"]').click(); PTUI.tab='seguimiento'; render(); $('[data-action="pt-pdf-informe"]').click(); HTMLAnchorElement.prototype.click=oc; ok(dl===2,'botones de descarga ('+dl+')');
  // siguiente bloque
  const antes=prog.id; ptClick3('pt-rec',{dataset:{k:'bloque',id:c.id}}); const p2=ptProgActivo(c.id); ok(p2&&p2.id!==antes&&p2.bloque===2&&p2.cambios.length>=2&&!D.programas.find(p=>p.id===antes).activo,'siguiente bloque'); info.cambios=p2.cambios; ok(p2.cardioOffset===prog.semanas,'cardio continúa la progresión');
  const main1=prog.dias[0].ejercicios.filter(e=>e.rol==='main').map(e=>e.ex).join(), main2=p2.dias[0].ejercicios.filter(e=>e.rol==='main').map(e=>e.ex).join(); ok(main1===main2,'conserva los básicos');
  ok(!/undefined|NaN/.test($('#app').textContent),'sin undefined al final');
  // merge conserva las nuevas listas
  const m=mergeData(JSON.parse(JSON.stringify(Vault.data)),JSON.parse(JSON.stringify(Vault.data))); ok(m.pt.cardios.length===D.cardios.length&&m.pt.revisiones.length===1,'merge conserva cardios y revisiones');
  return {fallas:F,info,errs:__errs};
};
