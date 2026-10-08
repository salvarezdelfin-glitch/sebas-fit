"use strict";
/* ============================================================
   YO · mi entrenamiento fuerte: maratón + pesas (100 kg en todo) + las clases que doy
   + composición corporal (8–12 % de grasa) con comida flexible.
   Motor: calendario, plan de carrera, plan de fuerza, ajuste diario, alertas y nutrición.
   Datos en Vault.data.yo = {perfil,metas,base,plan,carreras,pesas,pesos,config}
   ============================================================ */
const YO_D=()=>Vault.data.yo;
const yoPlan=()=>{ const p=YO_D().plan; return p&&p.inicio?p:null; };
const YO_DIAS=["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
const YO_LIFTS={sentadilla:"Sentadilla",banca:"Press de banca",muerto:"Peso muerto",militar:"Press militar"};
const yoDow=s=>(parseLocalDate(s).getDay()+6)%7;                  // 0 = lunes
const yoLunes=s=>addDays(s,-yoDow(s));
const yoDiffDias=(a,b)=>Math.round((parseLocalDate(b)-parseLocalDate(a))/86400000);
const yoRound=(x,s)=>Math.round(x/s)*s;
const yoMmss=sec=>{ sec=Math.round(sec); return Math.floor(sec/60)+":"+String(sec%60).padStart(2,"0"); };
const yoHmm=sec=>{ const m=Math.round(sec/60); return Math.floor(m/60)+":"+String(m%60).padStart(2,"0"); };
function yoParseT(s){ const m=String(s||"").trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/); if(!m) return 0; return m[3]!=null?(+m[1])*3600+(+m[2])*60+(+m[3]):(+m[1])*3600+(+m[2])*60; }
const yoNum=v=>{ const n=parseFloat(v); return isFinite(n)?n:0; };

/* ---------- perfil y metas (con valores por defecto sin escribirlos) ---------- */
function yoPerfil(){ const p=YO_D().perfil||{}; return Object.assign({sexo:"m",edad:"",estatura:"",peso:"",grasa:"",nivel:"intermedio",kmSemana:25,largo:12},p); }
function yoMetas(){ const m=YO_D().metas||{}; return Object.assign({fecha:"",tiempo:"",grasaMin:8,grasaMax:12,sentadilla:100,banca:100,muerto:100,militar:0},m); }
function yoConfig(){ return Object.assign({libre:15,comida:"flexible"},YO_D().config||{}); }
function yoPesoActual(){ const l=yoPesos(); const u=l[l.length-1]; return u&&u.peso?+u.peso:yoNum(yoPerfil().peso); }
function yoGrasaActual(){ const l=yoPesos().filter(x=>x.grasa); const u=l[l.length-1]; return u?+u.grasa:yoNum(yoPerfil().grasa); }
const yoPesos=()=>YO_D().pesos.slice().sort((a,b)=>a.fecha.localeCompare(b.fecha));
const yoCarreras=()=>YO_D().carreras.slice().sort((a,b)=>a.fecha.localeCompare(b.fecha));
const yoPesas=()=>YO_D().pesas.slice().sort((a,b)=>a.fecha.localeCompare(b.fecha));

/* ---------- ritmos ---------- */
function yoTiempoObj(){ const t=yoParseT(yoMetas().tiempo); if(t>=7200) return t; return {novato:17100,intermedio:15300,avanzado:13500}[yoPerfil().nivel]||15300; }
const yoMP=()=>yoTiempoObj()/42.195;
function yoRitmos(){ const mp=yoMP(); return {mp,facil:[mp+60,mp+90],largo:[mp+45,mp+75],umbral:mp-18,i10:mp-40,i5:mp-50}; }
const yoRango=(r)=>yoMmss(r[0])+"–"+yoMmss(r[1]);

/* ---------- semana tipo: dónde cae cada sesión según tus clases ---------- */
const YO_SES={LR:{n:"Fondo largo",c:3.5},Q:{n:"Calidad",c:3},E:{n:"Rodaje fácil",c:1.4},A:{n:"Pierna pesada",c:3},B:{n:"Empuje + tirón pesado",c:2},C:{n:"Peso muerto",c:3},D:{n:"Torso volumen + core",c:1.6}};
const YO_DURO=["LR","Q","A","C"];
function yoClasesPorDia(){ const c=[0,0,0,0,0,0,0]; CL_D().schedule.forEach(s=>{ const i=YO_DIAS.indexOf(s.day); if(i>=0) c[i]++; }); return c; }
function yoRng(seed){ return ()=>{ seed|=0; seed=seed+0x6D2B79F5|0; let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
/* puntaje de un acomodo (menor = mejor): evita juntar días duros, pone lo duro donde no das clases y deja un día de descanso */
function yoPuntaje(L,cl){
  let s=0; const has=(d,c)=>L[d].includes(c), hard=d=>L[d].some(c=>YO_DURO.includes(c));
  const carga=L.map((a,d)=>a.reduce((t,c)=>t+YO_SES[c].c,0)+cl[d]*1.1);
  if(!L.some(a=>!a.length)) s+=40;
  for(let d=0;d<7;d++){
    const n=(d+1)%7, p=(d+6)%7, x=Math.max(0,carga[d]-4);
    s+=x*x*3;
    if(!L[d].length) s-=cl[d]*1.2;                                   // el descanso cae donde más clases das
    if(L[d].length>2) s+=40;
    else if(L[d].length===2){ const ok=has(d,"E")&&(has(d,"B")||has(d,"D")); s+=ok?2.5:16; }
    if(hard(d)&&hard(n)) s+=7;
    if(has(d,"LR")){ if(has(p,"A")||has(p,"C")) s+=22; if(has(p,"Q")) s+=10; if(has(n,"A")||has(n,"C")) s+=5; s+=cl[d]*4; if(d<5) s+=3; }
    if(has(d,"Q")){ if(has(p,"A")||has(p,"C")) s+=14; s+=cl[d]*3; }
    if((has(d,"A")&&has(p,"C"))||(has(d,"C")&&has(p,"A"))) s+=8;
    if(has(d,"A")||has(d,"C")) s+=Math.max(0,cl[d]-1)*3;
    if(has(d,"B")&&has(n,"B")) s+=6;
  }
  return s;
}
function yoAcomodo(nCorrer,nPesas){
  const cl=yoClasesPorDia(), ses=["LR","Q"]; for(let i=0;i<Math.max(0,nCorrer-2);i++) ses.push("E"); ses.push("A","B","C"); if(nPesas>=4) ses.push("D");
  const armar=asg=>{ const L=Array.from({length:7},()=>[]); asg.forEach((d,k)=>L[d].push(ses[k])); return L; };
  let mejor=null, ms=1e9;
  for(let r=0;r<6;r++){
    const rnd=yoRng(11+r*97), asg=ses.map(()=>Math.floor(rnd()*7)); let cur=yoPuntaje(armar(asg),cl);
    for(let it=0;it<4000;it++){
      const k=Math.floor(rnd()*ses.length), antes=asg[k], to=Math.floor(rnd()*7); if(to===antes) continue;
      asg[k]=to; const nv=yoPuntaje(armar(asg),cl);
      if(nv<=cur||rnd()<Math.exp((cur-nv)/(0.4+(4000-it)/900))) cur=nv; else asg[k]=antes;
    }
    if(cur<ms){ ms=cur; mejor=armar(asg); }
  }
  const orden={LR:0,Q:1,A:2,C:3,B:4,D:5,E:6};
  mejor.forEach(a=>a.sort((x,y)=>(orden[x]-orden[y])));
  return {layout:mejor,puntaje:Math.round(ms*10)/10};
}

/* ---------- plan de maratón ---------- */
function yoPlanCrear(opt){
  const pf=yoPerfil(), m=yoMetas();
  const nCorrer=opt.nCorrer||4, nPesas=opt.nPesas||4, hoy=todayStr(), a=yoAcomodo(nCorrer,nPesas);
  const pico={novato:50,intermedio:62,avanzado:72}[pf.nivel]||62;
  return {inicio:yoLunes(hoy),fecha:m.fecha||"",nCorrer,nPesas,layout:a.layout,puntaje:a.puntaje,km0:Math.max(12,yoNum(pf.kmSemana)||25),largo0:Math.max(6,yoNum(pf.largo)||12),nivel:pf.nivel,pico:opt.pico||pico+(nPesas>=4?-4:0),creado:hoy};
}
function yoNSem(pl){
  if(!pl.fecha) return 0;
  return Math.max(0,Math.round(yoDiffDias(pl.inicio,yoLunes(pl.fecha))/7)+1);
}
function yoFaseDe(i,n){
  if(i===n-1) return "carrera";
  const tp=n>=10?2:(n>=6?1:0); if(i>=n-1-tp) return "afinacion";
  const pk=n>=12?3:(n>=8?2:0); if(i>=n-1-tp-pk) return "pico";
  const bs=n>=14?Math.round((n-1-tp-pk)*0.3):0; return i<bs?"base":"construccion";
}
const YO_FASES={base:"Base",construccion:"Construcción",pico:"Pico",afinacion:"Afinación",carrera:"Semana de carrera"};
let yoSemCache={key:"",v:[]};
function yoSemanas(){
  const pl=yoPlan(); if(!pl||!pl.inicio) return [];
  const key=JSON.stringify([pl.inicio,pl.fecha,pl.nCorrer,pl.km0,pl.largo0,pl.pico,pl.nivel]); if(yoSemCache.key===key) return yoSemCache.v;
  const n=pl.fecha?yoNSem(pl):12, out=[], nEasy=Math.max(0,pl.nCorrer-2), cap=pl.nivel==="novato"?30:32;
  let prog=pl.km0, lrProg=Math.min(cap,Math.max(6,pl.largo0)), tpI=0;
  for(let i=0;i<n;i++){
    const fase=pl.fecha?yoFaseDe(i,n):(i%4===3?"base":"base"), cut=(i+1)%4===0&&(fase==="base"||fase==="construccion"), tp=n>=10?2:(n>=6?1:0);
    let km, lr;
    if(fase==="carrera"){ km=Math.round(pl.pico*0.35); lr=0; }
    else if(fase==="afinacion"){ const f=tp===2?[.75,.55][tpI]:.65; tpI++; km=Math.round(Math.min(pl.pico,prog)*f); lr=Math.round(Math.min(lrProg,[22,14][tpI-1]||16)); }
    else if(cut){ km=Math.round(prog*0.8); lr=Math.round(lrProg*0.75); }
    else { prog=Math.min(prog*(fase==="pico"?1.04:1.1),pl.pico); km=Math.round(prog); lrProg=Math.min(cap,lrProg+(fase==="pico"?2:2.5),Math.max(6,km*(fase==="pico"?0.5:0.4))); lr=Math.round(lrProg); }
    const calKm=fase==="carrera"?Math.round(km*0.3):Math.min(16,Math.max(6,Math.round(km*0.18)));
    const resto=Math.max(0,km-lr-calKm), easy=nEasy?Array.from({length:nEasy},(_,k)=>Math.max(3,Math.round(resto/nEasy))):[];
    out.push({i,lunes:addDays(pl.inicio,i*7),fase,km,largo:lr,calKm,easy,cut});
  }
  yoSemCache={key,v:out}; return out;
}
function yoSemanaDe(fecha){
  const pl=yoPlan(); if(!pl||!pl.inicio) return null; const i=Math.floor(yoDiffDias(pl.inicio,fecha)/7); const s=yoSemanas();
  return i>=0&&i<s.length?s[i]:null;
}
const YO_Q={
  base:["Strides: rodaje fácil + 6 × 20″ rápidos (recupera 60″)","Fartlek: 8 × 1′ fuerte / 1′ suave","Progresivo: los últimos 15′ a ritmo moderado"],
  construccion:["Tempo continuo de 20–35′ a ritmo de umbral","Intervalos: 5–8 × 1 km a ritmo de 10K (90″ de trote)","Tempo en bloques: 3 × 8′ a umbral (2′ de trote)","Crucero: 4 × 2 km a ritmo de umbral (1′ de trote)"],
  pico:["Ritmo de maratón: 2 × 5 km a MP (3′ de trote)","Bloque largo a MP: 8–10 km seguidos dentro del entreno","Agudeza: 6 × 800 m a ritmo de 5K (2′ de trote)"],
  afinacion:["Ritmo de maratón: 3 × 2 km a MP (2′ de trote)","4 × 1 km a ritmo de 10K con recuperación completa"],
  carrera:["Activación: 4 × 1 km a MP con trote largo entre cada uno"]
};
function yoDescQ(sem){
  const r=yoRitmos(), lista=YO_Q[sem.fase]||YO_Q.base, desc=lista[sem.i%lista.length];
  const rit={base:"suave–moderado",construccion:"umbral ≈ "+yoMmss(r.umbral)+"/km · 10K ≈ "+yoMmss(r.i10)+"/km",pico:"MP ≈ "+yoMmss(r.mp)+"/km",afinacion:"MP ≈ "+yoMmss(r.mp)+"/km",carrera:"MP ≈ "+yoMmss(r.mp)+"/km"}[sem.fase];
  return {titulo:"Calidad · "+sem.calKm+" km",items:["Calentamiento 2 km fácil + 4 strides","Principal: "+desc+" ("+rit+")","Enfriamiento 2 km fácil (total ≈ "+sem.calKm+" km)"],dur:Math.round(sem.calKm*r.mp/60*1.1)};
}
function yoDescLR(sem){
  const r=yoRitmos(); const mpKm=sem.fase==="pico"?Math.max(3,Math.round(sem.largo*0.3)):0, prog=sem.fase==="construccion"&&sem.i%3===2?3:0;
  const items=["Ritmo fácil conversacional: "+yoRango(r.largo)+" por km"];
  if(mpKm&&!sem.cut) items.push("Últimos "+mpKm+" km a ritmo de maratón ("+yoMmss(r.mp)+"/km)"); else if(prog) items.push("Últimos "+prog+" km progresivos, sin forzar");
  items.push("Practica la comida de carrera: 40–60 g de carbohidrato por hora (gel, plátano, bebida) y ~500 ml/h con sodio");
  items.push("Usa los tenis, el short y la mezcla de bebida que llevarás el día del maratón");
  return {titulo:"Fondo largo · "+sem.largo+" km"+(sem.cut?" (semana de descarga)":""),items,dur:Math.round(sem.largo*(r.largo[0]+r.largo[1])/2/60)};
}
function yoDescE(km,k){
  const r=yoRitmos();
  return {titulo:"Rodaje fácil · "+km+" km",items:["Ritmo fácil: "+yoRango(r.facil)+" por km (que puedas platicar)",k%2===0?"Al final 4 × 20″ strides sueltos":"Sin prisa: es para recuperar y sumar kilómetros"],dur:Math.round(km*(r.facil[0]+r.facil[1])/2/60)};
}

/* ---------- plan de fuerza ---------- */
const YO_FZA={base:[[4,5,.75],[4,5,.78],[4,4,.82]],construccion:[[3,4,.80],[3,4,.83],[3,3,.86]],pico:[[2,3,.84],[2,3,.86],[2,3,.84]],afinacion:[[2,3,.78],[2,2,.72]],carrera:[[2,2,.70]]};
function yoFzaSem(sem){
  if(sem.cut) return {sets:3,reps:5,pct:.65,deload:true};
  const t=YO_FZA[sem.fase]||YO_FZA.base, e=t[sem.i%t.length]; return {sets:e[0],reps:e[1],pct:e[2],deload:false};
}
/* mejor estimación de 1RM: lo más reciente que registraste; si no hay, tu punto de partida */
function yoE1rm(lift){
  const y=YO_D(), lim=addDays(todayStr(),-56);
  const rec=y.pesas.filter(p=>p.lift===lift&&p.fecha>=lim&&p.reps>=1&&p.reps<=10).map(p=>ptE1rm(+p.kg,+p.reps));
  if(rec.length) return Math.max(...rec);
  const b=y.base&&y.base[lift]; return b&&b.kg?ptE1rm(+b.kg,+b.reps||1):0;
}
function yoKgPara(lift,pct){
  const e=yoE1rm(lift); if(!e) return 0; let kg=yoRound(e*pct,2.5);
  const ult=yoPesas().filter(p=>p.lift===lift).slice(-1)[0];
  if(ult&&kg>+ult.kg+5) kg=+ult.kg+5;                                  // nunca saltes más de 5 kg sobre lo último que hiciste
  return kg;
}
const YO_ACC={
  A:["Peso muerto rumano 3 × 6 (peso moderado, bisagra limpia)","Zancada búlgara 3 × 8 por pierna (RPE 7)","Hip thrust 3 × 8","Core pesado (rueda o Pallof) 3 × 10","Pantorrilla de pie 3 × 12 (protege tendón de Aquiles)"],
  B:["Remo con barra 4 × 6","Press militar 3 × 5","Dominadas (con lastre si puedes) 3 × 6–8","Face pull 3 × 15","Tríceps + curl 2 × 10"],
  C:["Sentadilla frontal o con pausa 3 × 5 (65 % de tu sentadilla)","Hip thrust 3 × 6","Dominadas 3 × (repeticiones − 2)","Cargada de maleta (farmer) 3 × 30 m"],
  D:["Press inclinado con mancuernas 3 × 8–10","Remo unilateral 3 × 10","Press de hombro con mancuernas 3 × 8","Elevaciones laterales 3 × 15","Curl + tríceps 3 × 12","Core: plancha y paseo de granjero 3 × 30–40″"]
};
function yoDescLift(code,sem){
  const f=yoFzaSem(sem), pesadoAbajo=sem.km>=Math.round(yoPlan().pico*0.85);
  const set=(lift,k)=>{ const kg=yoKgPara(lift,f.pct); let s=f.sets; if(k==="pierna"&&pesadoAbajo) s=Math.max(2,s-1); if(lift==="muerto") s=Math.min(3,s);
    return YO_LIFTS[lift]+" "+s+" × "+f.reps+(kg?" @ "+kg+" kg":" (pon tu peso de partida en Perfil)")+(f.deload?" · descarga":" · RPE "+(f.pct>=.84?"8":"7")); };
  const acc=(YO_ACC[code]||[]).slice(0,sem.fase==="pico"||sem.fase==="afinacion"?3:undefined);
  if(code==="A") return {titulo:"Pierna pesada",items:[set("sentadilla","pierna"),...acc],dur:65};
  if(code==="B") return {titulo:"Empuje + tirón pesado",items:[set("banca"),...acc],dur:60};
  if(code==="C") return {titulo:"Peso muerto",items:[set("muerto","pierna"),...acc],dur:60};
  return {titulo:"Torso volumen + core",items:acc,dur:50};
}

/* ---------- el día y la semana ---------- */
function yoDiasSemana(sem){
  const pl=yoPlan(), cl=yoClasesPorDia(), out=[]; let k=0;
  const raceIdx=pl.fecha&&sem.fase==="carrera"?yoDow(pl.fecha):-1;
  for(let d=0;d<7;d++){
    const fecha=addDays(sem.lunes,d), ses=[]; let nota="";
    const L=pl.layout[d]||[];
    if(raceIdx>=0){
      if(d===raceIdx) ses.push({code:"RACE",titulo:"MARATÓN · 42.2 km",items:["Sal 5–10″ más lento que tu ritmo meta durante los primeros 5 km","Meta "+yoHmm(yoTiempoObj())+" · ritmo ≈ "+yoMmss(yoMP())+"/km","Desde el km 5: 40–60 g de carbohidrato por hora y agua en cada estación","Km 30–35 es donde se decide: sostén el ritmo, no lo adelantes"],dur:Math.round(yoTiempoObj()/60)});
      else if(d===raceIdx-1) nota="Descanso. Camina, hidrátate, prepara tu kit y cena arroz o pasta sin experimentos.";
      else if(d===raceIdx-2) ses.push(Object.assign(yoDescE(5,0),{code:"E",titulo:"Rodaje suave · 5 km + 4 strides"}));
      else if(d===raceIdx-3&&L.some(c=>c==="B"||c==="D")) ses.push({code:"B",titulo:"Torso ligero (sin piernas)",items:["Press de banca 2 × 5 @ 60 %","Remo 2 × 8","Movilidad de cadera y tobillo 10′"],dur:35});
      else if(d>raceIdx) nota="Recuperación activa: camina, estira, come bien. Nada duro por 1–2 semanas.";
      else if(L.includes("E")) ses.push(Object.assign(yoDescE(4,0),{code:"E"}));
    } else {
      L.forEach(c=>{
        if(c==="LR") ses.push(Object.assign({code:c},yoDescLR(sem)));
        else if(c==="Q") ses.push(Object.assign({code:c},yoDescQ(sem)));
        else if(c==="E"){ ses.push(Object.assign({code:c},yoDescE(sem.easy[k]||4,k))); k++; }
        else ses.push(Object.assign({code:c},yoDescLift(c,sem)));
      });
    }
    out.push({d,fecha,dia:YO_DIAS[d],clases:cl[d],ses,nota});
  }
  return out;
}
const yoSemanaHoy=()=>yoSemanaDe(todayStr());
function yoDiaHoy(){ const s=yoSemanaHoy(); if(!s) return null; return yoDiasSemana(s)[yoDow(todayStr())]; }
function yoCargaSemana(sem){
  const dias=yoDiasSemana(sem), duros=dias.filter(d=>d.ses.some(x=>YO_DURO.includes(x.code)||x.code==="RACE")).length;
  const dobles=dias.filter(d=>d.ses.length>1).length, clases=dias.reduce((a,d)=>a+d.clases,0), sesiones=dias.reduce((a,d)=>a+d.ses.length,0);
  const avisos=[]; if(duros>4) avisos.push("Tienes "+duros+" días duros: recorta calidad o una sesión de pesas");
  if(dobles>2) avisos.push(dobles+" días con doble sesión: cuida sueño y comida");
  if(!dias.some(d=>!d.ses.length)) avisos.push("No hay un día sin entrenar: deja uno libre");
  return {duros,dobles,clases,sesiones,avisos};
}

/* ---------- cómo amaneciste (autorregulación) ---------- */
function yoCheckin(fecha){ return (YO_D().config.checkin||{})[fecha||todayStr()]||null; }
function yoAjuste(fecha){
  const c=yoCheckin(fecha); if(!c) return null;
  const sc=((+c.sueno||3)+(+c.energia||3)+(+c.animo||3))/15, dolor=+c.dolor||0;
  if(dolor>=7) return {nivel:"rojo",texto:"Dolor "+dolor+"/10: hoy no entrenes la zona y, si no cede en 48 h o te limita al caminar, ve con un fisioterapeuta o médico del deporte.",factor:0};
  if(dolor>=4) return {nivel:"alto",texto:"Dolor "+dolor+"/10"+(c.zona?" en "+c.zona:"")+": cambia correr por bici o alberca y no cargues esa zona. Si se repite 2 días, consulta.",factor:.5};
  if(sc<.5) return {nivel:"bajo",texto:"Vienes cargado (sueño/energía/ánimo bajos): hazlo suave —quita la calidad, una serie menos y deja 2–3 repeticiones en el tanque—.",factor:.7};
  if(sc<.7) return {nivel:"medio",texto:"Estado regular: sigue el plan pero con RPE ≤ 8 y salta la última serie si el calentamiento se siente pesado.",factor:.9};
  return {nivel:"ok",texto:"Vas bien: ejecuta el plan como está escrito.",factor:1};
}

/* ---------- alertas de lesión / sobrecarga ---------- */
function yoKmSemanaReal(lunes){ const fin=addDays(lunes,6); return YO_D().carreras.filter(c=>c.fecha>=lunes&&c.fecha<=fin).reduce((a,c)=>a+(+c.km||0),0); }
function yoAlertas(){
  const y=YO_D(), out=[], hoy=todayStr(), lun=yoLunes(hoy), ant=addDays(lun,-7);
  const kA=yoKmSemanaReal(lun), kP=yoKmSemanaReal(ant);
  const diaIdx=yoDow(hoy);
  if(kP>=15&&kA>kP*1.1&&diaIdx>=3) out.push({t:"warn",x:"Tus kilómetros subieron "+Math.round((kA/kP-1)*100)+" % contra la semana pasada ("+r1(kP)+" → "+r1(kA)+" km). Pasar de +10 % es la causa más común de lesión: frena esta semana."});
  const sem=y.carreras.filter(c=>c.fecha>=lun);
  const largo=sem.reduce((m,c)=>Math.max(m,+c.km||0),0);
  const plan=yoSemanaHoy(), den=Math.max(kA,plan?plan.km:0);
  if(kA>=20&&largo/den>.5) out.push({t:"warn",x:"Tu rodaje más largo es "+Math.round(largo/den*100)+" % de los km de la semana (por arriba de ~50 % se carga de más). Reparte kilómetros en rodajes fáciles."});
  const d7=[...Array(7)].map((_,k)=>addDays(hoy,-k)); const act=d7.filter(f=>y.carreras.some(c=>c.fecha===f)||y.pesas.some(p=>p.fecha===f)).length;
  if(act>=7) out.push({t:"warn",x:"Llevas 7 días seguidos entrenando: toma hoy o mañana completamente libre."});
  const rpeAlto=d7.filter(f=>y.carreras.some(c=>c.fecha===f&&+c.rpe>=8)||y.pesas.some(p=>p.fecha===f&&+p.rpe>=9)).length;
  if(rpeAlto>3) out.push({t:"warn",x:rpeAlto+" días muy intensos en 7 días (RPE alto): baja la intensidad de al menos uno."});
  const ch=y.config.checkin||{}, dolores=Object.keys(ch).sort().slice(-3).filter(f=>(+ch[f].dolor||0)>=4);
  if(dolores.length>=2) out.push({t:"bad",x:"Dolor ≥ 4/10 en "+dolores.length+" de tus últimos check-ins: no lo corras encima. Descansa esa zona y consulta si sigue."});
  const pes=yoPesos().filter(p=>p.peso);
  if(pes.length>=2){ const a=pes[pes.length-1], b=pes.filter(p=>yoDiffDias(p.fecha,a.fecha)>=10)[0]; if(b){ const sem2=yoDiffDias(b.fecha,a.fecha)/7, perd=(b.peso-a.peso)/b.peso*100/sem2;
    if(perd>0.7) out.push({t:"bad",x:"Estás bajando "+r1(perd)+" % del peso por semana: es demasiado rápido para un maratón con pesas. Come más (sobre todo carbohidrato) antes de que baje tu fuerza."}); } }
  const g=yoGrasaActual(); if(g&&g<9) out.push({t:"warn",x:"Con "+g+" % de grasa estás en el extremo bajo: no hagas déficit; vigila sueño, ánimo, lesiones y libido, y comenta con un médico si notas bajas."});
  ["sentadilla","banca","muerto"].forEach(l=>{
    const rec=y.pesas.filter(p=>p.lift===l&&p.reps<=8), lim=addDays(hoy,-28); const mejor=Math.max(0,...rec.filter(p=>p.fecha<lim&&p.fecha>=addDays(hoy,-84)).map(p=>ptE1rm(+p.kg,+p.reps))), act2=Math.max(0,...rec.filter(p=>p.fecha>=lim).map(p=>ptE1rm(+p.kg,+p.reps)));
    if(mejor&&act2&&act2<mejor*.93) out.push({t:"warn",x:YO_LIFTS[l]+" bajó ~"+Math.round((1-act2/mejor)*100)+" % en el último mes: suele ser cansancio acumulado o falta de comida, no pérdida de fuerza. Revisa sueño y carbohidrato."});
  });
  return out;
}

/* ---------- composición corporal ---------- */
function yoBanda(){
  const m=yoMetas(), peso=yoPesoActual(), g=yoGrasaActual(), pf=yoPerfil(); if(!peso||!g) return null;
  const lean=peso*(1-g/100), w=p=>lean/(1-p/100), kgSobre=Math.max(0,peso-w(m.grasaMax));
  const semanas=kgSobre>0?Math.ceil(kgSobre/(peso*0.004)):0;
  return {peso,g,lean,w12:w(m.grasaMax),w10:w(10),w8:w(m.grasaMin),kgSobre,semanas,enBanda:g>=m.grasaMin&&g<=m.grasaMax,arriba:g>m.grasaMax,debajo:g<m.grasaMin,mujer:pf.sexo==="f"};
}
function yoSeguridad(){
  const b=yoBanda(), n=[];
  n.push("Entre 10 y 12 % es lo más sostenible mientras haces maratón y pesas pesadas; 8 % es muy bajo y conviene tocarlo solo unas semanas, fuera del pico de kilómetros.");
  n.push("Bajar de ~10 % con mucho volumen se asocia a lesiones por estrés, sueño malo, defensas bajas y caída hormonal (RED-S). Si notas eso, sube la comida.");
  if(yoPerfil().sexo==="f") n.push("En mujeres 8–12 % está por debajo del rango saludable (≈ 14–20 % en atletas): usa una banda más alta y consúltalo con tu médico.");
  n.push("Antes de empezar un bloque fuerte: chequeo médico, electrocardiograma si tienes más de 35 años, y análisis de ferritina, vitamina D y tiroides.");
  n.push("Esto es orientación deportiva general, no sustituye a un médico ni a un nutriólogo.");
  return n;
}

/* ---------- nutrición ---------- */
function yoBmr(){
  const pf=yoPerfil(), kg=yoPesoActual(), g=yoGrasaActual();
  if(!kg) return 0;
  if(g) return 370+21.6*kg*(1-g/100);                                     // Katch-McArdle
  const h=yoNum(pf.estatura)||175, e=yoNum(pf.edad)||30; return 10*kg+6.25*h-5*e+(pf.sexo==="f"?-161:5);
}
const YO_TIPOS={
  descanso:{n:"Descanso / solo clases",carb:3},pesas:{n:"Día de pesas",carb:4},rodaje:{n:"Rodaje fácil",carb:5},calidad:{n:"Calidad (tempo / series)",carb:6},
  largo:{n:"Fondo largo",carb:7},carga:{n:"Carga de carbohidrato (2 días antes)",carb:9},carrera:{n:"Día del maratón",carb:8}
};
function yoTipoDeDia(dia){
  if(!dia) return "descanso"; const c=dia.ses.map(s=>s.code);
  if(c.includes("RACE")) return "carrera"; if(c.includes("LR")) return "largo"; if(c.includes("Q")) return "calidad"; if(c.includes("E")) return "rodaje"; if(c.some(x=>"ABCD".includes(x))) return "pesas"; return "descanso";
}
function yoNutri(tipo,opt){
  opt=opt||{}; const kg=yoPesoActual(), g=yoGrasaActual(), m=yoMetas(), cfg=yoConfig(); if(!kg) return null;
  const sem=opt.sem||yoSemanaHoy(), fase=sem?sem.fase:"base", clases=opt.clases!=null?opt.clases:(yoClasesPorDia().reduce((a,b)=>a+b,0)/7);
  const r=yoRitmos(); let ej=0;
  const kmE=sem&&sem.easy[0]?sem.easy[0]:8;
  if(tipo==="rodaje") ej+=kmE*kg; else if(tipo==="calidad") ej+=(sem?sem.calKm:9)*kg*1.05; else if(tipo==="largo") ej+=(sem&&sem.largo?sem.largo:18)*kg; else if(tipo==="carrera") ej+=42.2*kg*.4;     // parte del gasto se repone durante la carrera (geles) y al día siguiente
  if(tipo==="pesas"||opt.pesas) ej+=3.5*kg; if(tipo==="rodaje"&&opt.pesas) ej+=3.5*kg*.7;
  ej+=clases*3*kg;
  let tdee=yoBmr()*1.3+ej, nota="Mantenimiento: comes lo que gastas.";
  const arribaDeBanda=g&&g>m.grasaMax, ligero=["descanso","pesas","rodaje"].includes(tipo)&&["base","construccion"].includes(fase);
  let f=1;
  if(g&&g<m.grasaMin+1){ f=1.04; nota="Estás en el límite bajo de tu banda: no hay déficit y se añade un poco para proteger salud y rendimiento."; }
  else if(arribaDeBanda&&ligero){ f=.9; nota="Déficit suave (≈ −10 %, máx. ~350 kcal) solo en días ligeros y fuera del pico, para bajar ~0.3–0.4 % del peso por semana sin tocar tu fuerza."; }
  else if(arribaDeBanda) nota="Hoy el entreno es duro o cerca del pico: sin déficit, mantienes para rendir.";
  let kcal=tdee*f; if(f<1) kcal=Math.max(kcal,tdee-350);
  const T=YO_TIPOS[tipo]; const prot=(f<1?2.2:2.0)*kg;
  let fat=Math.max(.85*kg,.2*kcal/9), carb=(kcal-4*prot-9*fat)/4;
  if(carb<T.carb*kg){ carb=T.carb*kg; kcal=4*prot+9*fat+4*carb; if(f>=1&&tipo!=="descanso") nota+=" (se subieron las calorías para cubrir el carbohidrato que pide este día)"; }
  const libre=Math.max(0,Math.min(25,cfg.libre))/100, L=kcal*libre;
  const fatS=Math.max(.7*kg,fat-.5*L/9), carbS=(kcal-L-4*prot-9*fatS)/4;
  const ml=35*kg+600*(ej>kg*8?Math.max(1,ej/ (kg*10)):.5);
  return {tipo,nombre:T.n,kcal:Math.round(kcal),tdee:Math.round(tdee),P:Math.round(prot),C:Math.round(carb),F:Math.round(fat),gkgC:r1(carb/kg),libreKcal:Math.round(L),
    est:{P:Math.round(prot),C:Math.round(Math.max(0,carbS)),F:Math.round(fatS)},agua:Math.round(ml/100)/10,nota,fase};
}
const YO_MOMENTOS={
  descanso:[["Desayuno",.27],["Comida",.33],["Colación",.12],["Cena",.28]],
  pesas:[["Desayuno",.24],["Pre-entreno",.08],["Comida",.28],["Post-entreno",.14],["Cena",.26]],
  rodaje:[["Desayuno",.25],["Pre-entreno",.08],["Comida",.29],["Post-entreno",.12],["Cena",.26]],
  calidad:[["Desayuno",.24],["Pre-entreno",.1],["Comida",.28],["Post-entreno",.14],["Cena",.24]],
  largo:[["Pre-largo (2–3 h antes)",.2],["Post-largo (30′ después)",.18],["Comida",.28],["Colación",.08],["Cena",.26]],
  carga:[["Desayuno",.22],["Colación",.12],["Comida",.3],["Colación",.12],["Cena",.24]],
  carrera:[["Desayuno (3 h antes)",.3],["Durante la carrera",0],["Post-carrera",.25],["Comida",.25],["Cena",.2]]
};
const YO_ALIM={
  prot:[
    {n:"huevo",u:"huevos",P:6,C:.5,F:5,paso:1,max:3,m:"d"},{n:"pechuga de pollo",g:100,P:31,C:0,F:3.6,paso:.5,max:3,m:"cs"},{n:"res magra (bistec)",g:100,P:26,C:0,F:8,paso:.5,max:2.5,m:"cs"},
    {n:"pescado blanco",g:100,P:22,C:0,F:2,paso:.5,max:3,m:"cs"},{n:"atún en agua",u:"lata(s) de atún",P:26,C:0,F:1,paso:1,max:2,m:"cs"},{n:"salmón",g:100,P:22,C:0,F:12,paso:.5,max:2,m:"cs"},
    {n:"camarones",g:100,P:20,C:.5,F:1,paso:.5,max:3,m:"cs"},{n:"yogurt griego natural",g:200,P:20,C:8,F:4,paso:.5,max:2,m:"dp"},{n:"requesón",g:110,P:14,C:4,F:5,paso:.5,max:2,m:"dp"},
    {n:"queso panela",g:50,P:9,C:1,F:7,paso:1,max:3,m:"cs"},{n:"proteína whey (scoop)",u:"scoop de whey",P:24,C:3,F:1.5,paso:.5,max:1.5,m:"p"}
  ],
  carb:[
    {n:"avena",g:40,P:5,C:27,F:2.7,paso:.5,max:3,m:"dp"},{n:"tortilla de maíz",u:"tortillas de maíz",P:1.2,C:12,F:.7,paso:1,max:6,m:"dcs"},{n:"arroz cocido",u:"taza(s) de arroz",P:4,C:44,F:.4,paso:.5,max:3,m:"cs"},
    {n:"frijoles de la olla",u:"taza(s) de frijoles",P:14,C:40,F:1,paso:.5,max:1.5,m:"dcs"},{n:"camote o papa",g:150,P:2.5,C:28,F:.2,paso:.5,max:3,m:"cs"},{n:"pan integral",u:"rebanadas de pan integral",P:3.5,C:12,F:1,paso:1,max:5,m:"dsp"},
    {n:"pasta cocida",u:"taza(s) de pasta",P:8,C:40,F:1.3,paso:.5,max:3,m:"cs"},{n:"plátano",u:"plátano(s)",P:1.2,C:27,F:.4,paso:1,max:3,m:"dp"},{n:"fruta (mango, papaya, piña)",u:"taza(s) de fruta",P:1,C:15,F:.3,paso:.5,max:3,m:"dp"},
    {n:"miel",u:"cda(s) de miel",P:0,C:17,F:0,paso:1,max:4,m:"p"}
  ],
  fat:[{n:"aguacate",u:"aguacate(s)",P:3,C:12,F:26,paso:.25,max:1,m:"dcs"},{n:"nueces o almendras",g:15,P:3,C:3,F:9,paso:1,max:3,m:"dcsp"},{n:"aceite de oliva",u:"cdita(s) de aceite de oliva",P:0,C:0,F:4.5,paso:1,max:3,m:"cs"},{n:"crema de cacahuate",u:"cda(s) de crema de cacahuate",P:4,C:3,F:8,paso:1,max:2,m:"dp"}]
};
function yoQty(n){ const e=Math.floor(n), r=n-e; const fr={0:"",.25:"¼",.5:"½",.75:"¾"}[Math.round(r*4)/4]||""; return (e?e:"")+fr||"0"; }
function yoPlato(mom,P,C,F,v){
  const MAPA={Desayuno:["d","d"],"Pre-entreno":["p","p"],"Post-entreno":["p","p"],Colación:["p","p"],Comida:["c","c"],Cena:["s","s"],"Post-carrera":["c","c"],"Pre-largo":["d","p"],"Post-largo":["p","p"]};
  const k=Object.keys(MAPA).find(x=>mom.indexOf(x)===0), LP=k?MAPA[k][0]:"d", LC=k?MAPA[k][1]:"d", liviano=LP==="p";
  const elige=(arr,idx,L)=>{ const op=arr.filter(a=>a.m.includes(L)); return (op.length?op:arr)[idx%(op.length||arr.length)]; };
  const items=[]; let p=0,c=0,f=0;
  const add=(a,u)=>{ if(u<=0) return; items.push(a.g?yoRound(u*a.g,5)+" g de "+a.n:(a.u?yoQty(u)+" "+a.u:yoQty(u)+" "+a.n)); p+=a.P*u; c+=a.C*u; f+=a.F*u; };
  const unidades=(a,meta,por)=>Math.min(a.max,Math.max(0,Math.round(meta/por/a.paso)*a.paso));
  const cb=elige(YO_ALIM.carb,v+1,LC); add(cb,unidades(cb,C,cb.C));
  if(C-c>25){ const c2=elige(YO_ALIM.carb.filter(a=>a!==cb),v+2,LC); add(c2,unidades(c2,C-c,c2.C)); }
  const pr=liviano&&P<30?YO_ALIM.prot.find(a=>a.n.indexOf("yogurt")===0):elige(YO_ALIM.prot,v,LP), pFalta=Math.max(0,P-p);
  if(pr.n==="huevo"){ const h=Math.min(3,Math.max(1,Math.round(pFalta/6))); add(pr,h); const cl=Math.round((P-p)/3.6/2)*2; if(cl>0){ items.push(cl+" claras"); p+=cl*3.6; } }
  else add(pr,Math.max(pr.paso,unidades(pr,pFalta,pr.P)));
  if(!liviano||F>8){ const fa=elige(YO_ALIM.fat,v,LP==="d"?"d":LC); add(fa,unidades(fa,F-f,fa.F)); }
  if(LC==="c"||LC==="s") items.push("verduras a gusto (1–2 tazas)");
  return {mom,items,P:Math.round(p),C:Math.round(c),F:Math.round(f),kcal:Math.round(4*p+4*c+9*f)};
}
function yoMenu(n,v){
  if(!n) return [];
  return YO_MOMENTOS[n.tipo].filter(m=>m[1]>0).map(([mom,sh],i)=>yoPlato(mom,n.est.P*sh,n.est.C*sh,n.est.F*sh,(v||0)+i));
}
const YO_SUPLEMENTOS=["Creatina monohidratada 3–5 g al día (todos los días, con agua): la mejor evidencia para fuerza y recuperación; no necesita carga.","Cafeína 3 mg/kg una hora antes de la calidad o la carrera, si ya la toleras; no la estrenes el día del maratón.","Electrolitos (sodio) en rodajes de más de 90 min y en clima caluroso.","Vitamina D, hierro/ferritina y omega-3: solo según tus análisis de sangre; no los tomes a ciegas."];
function yoCarrera(){
  const kg=yoPesoActual(); if(!kg) return null;
  return {carbHora:"40–60 g/h (hasta 75–90 g/h si ya entrenaste el estómago)",liquido:"400–700 ml/h, con 300–600 mg de sodio por litro",cafeina:Math.round(kg*3)+" mg de cafeína (≈ "+r1(kg*3/80)+" cafés) si la toleras",
    carga:"Dos días antes: "+Math.round(kg*9)+" g de carbohidrato al día (poca fibra, nada nuevo)",desayuno:"3 h antes: "+Math.round(kg*2)+" g de carbohidrato + algo de proteína suave (avena con plátano, pan con miel)"};
}
