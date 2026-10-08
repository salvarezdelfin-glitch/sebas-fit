"use strict";
/* ============================================================
   YO · pantallas (Hoy, Semana, Maratón, Fuerza, Comida, Progreso, Perfil)
   ============================================================ */
const YOUI={tab:"hoy",off:0,tipo:null,menuV:0,msgPlan:""};
const YO_TABS=[["hoy","Hoy"],["semana","Semana"],["maraton","Maratón"],["fuerza","Fuerza"],["comida","Comida"],["progreso","Progreso"],["perfil","Perfil"]];
const yoDia=(f)=>YO_DIAS[yoDow(f)]+" "+fmtCorto(f);
const yoTile=(l,v,f)=>`<div class="tile"><div class="label">${l}</div><div class="value num">${v}</div><div class="foot">${f||""}</div></div>`;

function viewYo(){
  const pl=yoPlan(), m=yoMetas(), sem=yoSemanaHoy(), n=pl&&pl.fecha?yoNSem(pl):0;
  const cuenta=pl&&pl.fecha?(()=>{ const d=yoDiffDias(todayStr(),pl.fecha); return d>0?"Faltan "+Math.floor(d/7)+" semanas y "+(d%7)+" días para el maratón":(d===0?"¡Hoy es el maratón!":"Maratón completado"); })():"Define la fecha de tu maratón en Perfil";
  return `<div class="wrap"><header class="page-head"><span class="eyebrow">Mi entrenamiento fuerte</span><h1>Yo</h1><p class="sub">${esc(cuenta)}${sem?" · semana "+(sem.i+1)+" de "+n+" · "+YO_FASES[sem.fase]:""}</p></header>
    <div class="tabs">${YO_TABS.map(([k,l])=>`<button data-action="yo-tab" data-t="${k}" class="${YOUI.tab===k?"on":""}">${l}</button>`).join("")}</div>
    ${({hoy:yoTabHoy,semana:yoTabSemana,maraton:yoTabMaraton,fuerza:yoTabFuerza,comida:yoTabComida,progreso:yoTabProgreso,perfil:yoTabPerfil})[YOUI.tab]()}
    <p class="hint" style="margin:28px 0 40px">Orientación deportiva general; no sustituye a un médico ni a un nutriólogo. Si algo duele, para.</p></div>`;
}
function yoVacio(txt){
  return `<div class="empty"><b>${txt||"Aún no hay plan."}</b><p>Llena tu <b>Perfil</b> (peso, % de grasa, tu mejor serie en cada levantamiento, fecha del maratón) y la app arma tu plan con tus clases como parte de la carga.</p><p><button class="btn primary" data-action="yo-tab" data-t="perfil">Ir a Perfil</button></p></div>`;
}
const yoAlertasHtml=()=>{ const a=yoAlertas(); return a.length?`<section class="blk"><div class="blk-head"><h2>Cuidado con…</h2></div><div class="alert-list">${a.map(x=>`<div class="alert ${x.t==="bad"?"bad":"warn"}">⚠ ${esc(x.x)}</div>`).join("")}</div></section>`:""; };

/* ---------- HOY ---------- */
function yoSiguiente(){
  const sems=yoSemanas(), hoy=todayStr(); for(const sem of sems){ for(const d of yoDiasSemana(sem)){ if(d.fecha>hoy&&d.ses.length) return d; } } return null;
}
const yoMiniSemana=(sem)=>`<div class="card yo-mini">${yoDiasSemana(sem).map(d=>`<div class="yo-mini-r ${d.fecha===todayStr()?"hoy":""}"><b>${d.dia.slice(0,3)}</b><span>${d.ses.length?d.ses.map(x=>esc(x.titulo)).join(" + "):'<i>libre</i>'}${d.clases?` <small>🎤${d.clases}</small>`:""}</span></div>`).join("")}</div>`;
function yoSesHtml(s,aj){
  const dur=s.dur?`<span class="yo-dur">≈ ${s.dur}′</span>`:"", ed="ABCD".includes(s.code)?`<button class="yo-edit" data-action="yo-rut-edit" data-c="${s.code}">✎ Editar${s.propia?" · propia":""}</button>`:"";
  return `<div class="yo-ses ${YO_DURO.includes(s.code)||s.code==="RACE"?"duro":""}"><div class="yo-ses-h"><b>${esc(s.titulo)}</b>${dur}${ed}</div>${aj&&aj.factor<1&&s.code!=="RACE"?`<div class="yo-ajuste">Hoy: ${aj.factor<=.5?"cambia o salta esta sesión":"recorta ~"+Math.round((1-aj.factor)*100)+" % (menos volumen, mismo ritmo cómodo)"}</div>`:""}<ul>${s.items.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div>`;
}
function yoChips(k,vals,cur){ return `<div class="yo-chips">${vals.map(v=>`<button class="yo-chip ${String(cur)===String(v)?"on":""}" data-action="yo-ck" data-k="${k}" data-v="${v}">${v}</button>`).join("")}</div>`; }
function yoTabHoy(){
  const pl=yoPlan(); if(!pl) return yoVacio();
  const sem=yoSemanaHoy(), hoy=todayStr(), c=yoCheckin()||{}, aj=yoAjuste();
  if(!sem) return `<div class="empty"><b>Tu plan ya terminó o aún no empieza.</b><p>Ajusta la fecha del maratón en Perfil y vuelve a generar el plan.</p></div>`;
  const dia=yoDiaHoy(), tipo=yoTipoDeDia(dia), n=yoNutri(tipo,{sem,clases:dia.clases,pesas:dia.ses.some(s=>"ABCD".includes(s.code))&&tipo==="rodaje"});
  const ck=`<section class="blk"><div class="blk-head"><h2>¿Cómo amaneciste?</h2></div><div class="card">
    <div class="yo-ck"><span>Sueño</span>${yoChips("sueno",[1,2,3,4,5],c.sueno)}</div><div class="yo-ck"><span>Energía</span>${yoChips("energia",[1,2,3,4,5],c.energia)}</div><div class="yo-ck"><span>Ánimo</span>${yoChips("animo",[1,2,3,4,5],c.animo)}</div>
    <div class="yo-ck"><span>Dolor (0–10)</span>${yoChips("dolor",[0,1,2,3,4,5,6,7,8,9,10],c.dolor)}</div>
    <div class="yo-ck"><span>¿Dónde?</span><input class="inp" id="yo-zona" data-action="yo-zona" placeholder="ej. rodilla derecha" value="${esc(c.zona||"")}" style="max-width:260px"></div>
    ${aj?`<div class="alert ${aj.nivel==="ok"?"ok":aj.nivel==="rojo"||aj.nivel==="alto"?"bad":"warn"}" style="margin-top:12px">${esc(aj.texto)}</div>`:`<p class="hint">Marca sueño, energía y ánimo (5 = excelente) y el plan de hoy se ajusta solo.</p>`}</div></section>`;
  const sig=dia.ses.length?null:yoSiguiente(), sigHtml=sig?`<section class="blk"><div class="blk-head"><h2>Siguiente: ${esc(yoDia(sig.fecha))}</h2></div>${sig.ses.map(x=>yoSesHtml(x,null)).join("")}</section>`:"";
  const sesiones=dia.ses.length?dia.ses.map(s=>yoSesHtml(s,aj)).join(""):`<div class="card"><b>Hoy descansas.</b><p class="hint" style="margin-bottom:0">${esc(dia.nota||"Camina, estira, duerme bien. Es cuando te vuelves más fuerte.")}</p></div>`;
  const clases=dia.clases?`<div class="yo-clases">🎤 Hoy das <b>${dia.clases}</b> clase${dia.clases>1?"s":""}: cuentan como carga moderada${dia.clases>1?" (y se suma al día)":""}. ${dia.ses.some(s=>YO_DURO.includes(s.code))&&dia.clases>1?"Si te sientes pesado, esta sesión dura es la que se recorta primero.":""}</div>`:"";
  const comida=n?`<section class="blk"><div class="blk-head"><h2>Comida de hoy · ${esc(n.nombre)}</h2><button class="btn ghost" data-action="yo-tab" data-t="comida">Ver menú</button></div><div class="tiles tiles-4">${yoTile("Calorías",n.kcal,"≈ lo que gastas hoy")}${yoTile("Proteína",n.P+" g","2 g por kg")}${yoTile("Carbohidrato",n.C+" g",n.gkgC+" g/kg")}${yoTile("Grasa",n.F+" g","+ agua "+n.agua+" L")}</div></section>`:`<p class="hint">Agrega tu peso en Perfil para ver tus calorías y macros de hoy.</p>`;
  return `${yoAlertasHtml()}${clases}<section class="blk"><div class="blk-head"><h2>${esc(yoDia(hoy))}</h2></div>${sesiones}</section>${sigHtml}<section class="blk"><div class="blk-head"><h2>Mi semana</h2><button class="btn ghost" data-action="yo-tab" data-t="semana">Ver detalle</button></div>${yoMiniSemana(sem)}</section>${ck}${comida}`;
}

/* ---------- SEMANA ---------- */
function yoSemanaVista(){ const s=yoSemanas(); if(!s.length) return null; const base=yoSemanaHoy(); const i=Math.min(s.length-1,Math.max(0,(base?base.i:0)+YOUI.off)); return s[i]; }
function yoTabSemana(){
  const pl=yoPlan(); if(!pl) return yoVacio();
  const sem=yoSemanaVista(); if(!sem) return yoVacio("No hay semanas en el plan.");
  const dias=yoDiasSemana(sem), carga=yoCargaSemana(sem), hoy=todayStr(), r=yoRitmos(), total=yoSemanas().length;
  const fila=d=>`<div class="yo-dia ${d.fecha===hoy?"hoy":""}"><div class="yo-dia-n"><b>${d.dia}</b><small>${fmtCorto(d.fecha)}</small>${d.clases?`<span class="yo-badge">🎤 ${d.clases}</span>`:""}</div>
    <div class="yo-dia-b">${d.ses.length?d.ses.map(s=>`<details open class="yo-det ${YO_DURO.includes(s.code)||s.code==="RACE"?"duro":""}"><summary>${esc(s.titulo)}${s.dur?` <small>≈ ${s.dur}′</small>`:""}</summary><ul>${s.items.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></details>`).join(""):`<span class="yo-lib">${esc(d.nota||"Libre")}</span>`}</div></div>`;
  return `<div class="yo-nav"><button class="btn ghost" data-action="yo-sem" data-d="-1" ${sem.i<=0?"disabled":""}>‹</button><div><b>Semana ${sem.i+1} de ${total}</b><small>${fmtCorto(sem.lunes)} · ${YO_FASES[sem.fase]}${sem.cut?" · descarga":""}</small></div><button class="btn ghost" data-action="yo-sem" data-d="1" ${sem.i>=total-1?"disabled":""}>›</button></div>
    <div class="tiles tiles-4">${yoTile("Kilómetros",sem.km,"semana")}${yoTile("Fondo largo",sem.largo?sem.largo+" km":"—",sem.largo?yoRango(r.largo)+"/km":"carrera")}${yoTile("Sesiones",carga.sesiones,carga.dobles+" días dobles")}${yoTile("Clases que das",carga.clases,carga.duros+" días duros")}</div>
    ${carga.avisos.length?`<div class="alert-list">${carga.avisos.map(x=>`<div class="alert warn">⚠ ${esc(x)}</div>`).join("")}</div>`:""}
    <div class="yo-semana">${dias.map(fila).join("")}</div>
    <div class="acts-row" style="margin:14px 0"><button class="btn" data-action="yo-copiar-sem">⧉ Copiar la semana</button><button class="btn ghost" data-action="yo-plan-regen">↻ Reacomodar según mis clases</button></div>
    <p class="hint">Las sesiones duras (fondo, calidad, pierna pesada y jalón con peso muerto) se colocan donde das menos clases, nunca pegadas al fondo largo, y cada semana dejas un día libre. Si cambias tu horario en Ajustes, toca "Reacomodar".</p>`;
}

/* ---------- MARATÓN ---------- */
function yoSvgKm(sem){
  const W=340,H=150,P=22, mx=Math.max(...sem.map(s=>s.km),10), bw=(W-2*P)/sem.length, hoy=yoSemanaHoy(), col={base:"#8fa6a0",construccion:"var(--accent)",pico:"#c2573b",afinacion:"#b99c4a",carrera:"#3b6fb6"};
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Kilómetros por semana">${sem.map((s,i)=>{ const h=s.km/mx*(H-2*P-6), x=P+i*bw;
    return `<rect x="${(x+bw*.1).toFixed(1)}" y="${(H-P-h).toFixed(1)}" width="${(bw*.8).toFixed(1)}" height="${Math.max(h,1).toFixed(1)}" rx="2" fill="${col[s.fase]}" opacity="${s.cut?.55:.9}"${hoy&&hoy.i===i?` stroke="var(--ink)" stroke-width="1.6"`:""}/>${i%4===0?`<text x="${(x+bw/2).toFixed(1)}" y="${H-8}" text-anchor="middle" class="ct">${i+1}</text>`:""}`; }).join("")}
    <text x="${P}" y="11" class="ct">${mx} km</text></svg>`;
}
function yoTabMaraton(){
  const pl=yoPlan(); if(!pl) return yoVacio();
  if(!pl.fecha) return `<div class="empty"><b>Falta la fecha del maratón.</b><p>Pon la fecha y la meta de tiempo en Perfil y regenera el plan.</p><p><button class="btn primary" data-action="yo-tab" data-t="perfil">Ir a Perfil</button></p></div>`;
  const sem=yoSemanas(), r=yoRitmos(), n=sem.length, pico=Math.max(...sem.map(s=>s.km)), lrMax=Math.max(...sem.map(s=>s.largo));
  const aviso=n<8?`<div class="alert warn">⚠ Solo hay ${n} semanas hasta la carrera: es un plan comprimido y no llega al volumen ideal. Si puedes, elige una fecha más lejana; si no, la meta de tiempo debe ser prudente.</div>`:(n<12?`<div class="alert warn">⚠ ${n} semanas es poco para un maratón fuerte desde ${pl.km0} km/sem. Sube kilómetros con paciencia (máx. +10 % por semana).</div>`:"");
  const rc=yoCarrera(), sH=yoSemanaHoy(), carH=sH?yoDiasSemana(sH).filter(d=>d.ses.some(x=>x.code==="E"||x.code==="Q"||x.code==="LR"||x.code==="RACE")):[];
  const carSec=carH.length?`<section class="blk"><div class="blk-head"><h2>Mis carreras de esta semana</h2></div>${carH.map(d=>d.ses.filter(x=>["E","Q","LR","RACE"].includes(x.code)).map(x=>yoSesHtml(Object.assign({},x,{titulo:d.dia+" · "+x.titulo}),null)).join("")).join("")}</section>`:"";
  return `${aviso}${carSec}<div class="tiles tiles-4">${yoTile("Meta",yoHmm(yoTiempoObj()),"ritmo "+yoMmss(r.mp)+"/km")}${yoTile("Semanas",n,"hasta el "+fmtCorto(pl.fecha))}${yoTile("Pico",pico+" km","por semana")}${yoTile("Fondo máx.",lrMax+" km","a 3 semanas de afinar")}</div>
    <section class="blk"><div class="blk-head"><h2>Kilómetros por semana</h2></div><div class="card">${yoSvgKm(sem)}<p class="hint" style="margin-bottom:0"><span class="yo-dot" style="background:#8fa6a0"></span>Base <span class="yo-dot" style="background:var(--accent)"></span>Construcción <span class="yo-dot" style="background:#c2573b"></span>Pico <span class="yo-dot" style="background:#b99c4a"></span>Afinación <span class="yo-dot" style="background:#3b6fb6"></span>Carrera · barras claras = semanas de descarga · el borde marca la semana actual.</p></div></section>
    <section class="blk"><div class="blk-head"><h2>Tus ritmos</h2></div><div class="card yo-ritmos"><div><small>Fácil</small><b>${yoRango(r.facil)}</b></div><div><small>Fondo largo</small><b>${yoRango(r.largo)}</b></div><div><small>Maratón (MP)</small><b>${yoMmss(r.mp)}</b></div><div><small>Umbral</small><b>${yoMmss(r.umbral)}</b></div><div><small>10K</small><b>${yoMmss(r.i10)}</b></div></div></section>
    <section class="blk"><div class="blk-head"><h2>Semana por semana</h2></div><div class="card" style="padding:0;overflow-x:auto"><table class="yo-tabla"><thead><tr><th>#</th><th>Lunes</th><th>Fase</th><th>km</th><th>Largo</th></tr></thead><tbody>${sem.map(s=>`<tr class="${yoSemanaHoy()&&yoSemanaHoy().i===s.i?"hoy":""}"><td>${s.i+1}</td><td>${fmtCorto(s.lunes)}</td><td>${YO_FASES[s.fase]}${s.cut?" · descarga":""}</td><td>${s.km}</td><td>${s.largo||"—"}</td></tr>`).join("")}</tbody></table></div></section>
    ${rc?`<section class="blk"><div class="blk-head"><h2>Plan de comida de carrera</h2></div><div class="card"><ul class="yo-ul"><li><b>Carbohidrato durante:</b> ${rc.carbHora}</li><li><b>Líquido:</b> ${rc.liquido}</li><li><b>Cafeína:</b> ${rc.cafeina}</li><li><b>Carga:</b> ${rc.carga}</li><li><b>Desayuno:</b> ${rc.desayuno}</li></ul><p class="hint" style="margin-bottom:0">Ensáyalo en tus fondos largos: nada nuevo el día de la carrera.</p></div></section>`:""}`;
}

/* ---------- FUERZA ---------- */
function yoTabFuerza(){
  const y=YO_D(), m=yoMetas(), sem=yoSemanaHoy(), f=sem?yoFzaSem(sem):{sets:3,reps:5,pct:.8}, lifts=["sentadilla","banca","muerto"].concat(m.militar?["militar"]:[]);
  const card=l=>{
    const e=yoE1rm(l), meta=m[l]||0, pct=meta&&e?Math.min(100,Math.round(e/meta*100)):0, kg=yoKgPara(l,f.pct);
    const hist=yoPesas().filter(p=>p.lift===l&&p.reps<=10).map(p=>({x:p.fecha,y:Math.round(ptE1rm(+p.kg,+p.reps)*10)/10}));
    return `<div class="card yo-lift"><div class="yo-lift-h"><div><h3>${YO_LIFTS[l]}</h3><small>1RM estimado <b class="num">${e?r1(e)+" kg":"—"}</b>${meta?" · meta "+meta+" kg":""}</small></div><button class="btn" data-action="yo-log" data-t="pesa" data-l="${l}">+ Registrar serie</button></div>
      ${meta?`<div class="yo-bar"><i style="width:${pct}%"></i></div><p class="hint">${e>=meta?"✔ Meta cumplida: ahora el objetivo es sostenerla y subir "+(l==="muerto"?"con técnica":"de a 2.5 kg")+" sin dolor.":"Te faltan ≈ "+r1(meta-e)+" kg para "+meta+" kg."}</p>`:""}
      ${e&&sem?`<div class="yo-hoy-kg">Esta semana (${YO_FASES[sem.fase].toLowerCase()}${f.deload?" · descarga":""}): <b>${l==="muerto"?Math.min(3,f.sets):f.sets} × ${f.reps} @ ${kg} kg</b></div>`:(!e?`<p class="hint">Pon tu mejor serie reciente en Perfil (o registra una serie) para calcular tus pesos.</p>`:"")}
      ${hist.length>=2?svgLine(hist,"kg"):""}</div>`;
  };
  const rutSem=sem||yoSemanas()[0], rutinas=rutSem?[...new Set(yoPlan().layout.flat().filter(c=>"ABCD".includes(c)))].sort().map(c=>yoDescLift(c,rutSem)):[];
  const rutHtml=rutinas.length?`<section class="blk"><div class="blk-head"><h2>Mis rutinas de pesas · semana ${rutSem.i+1}</h2></div>${rutinas.map(x=>yoSesHtml(x,null)).join("")}<p class="hint">Cada semana los pesos se recalculan solos con tu mejor serie registrada.</p></section>`:"";
  const ult=yoPesas().slice(-8).reverse();
  return `<div class="alert ok" style="margin-bottom:14px">Meta: ${["sentadilla","banca","muerto"].map(l=>YO_LIFTS[l]+" "+(m[l]||"—")).join(" · ")} kg. Subes de a 2.5 kg sólo cuando la serie sale limpia con 2 repeticiones en el tanque; en semanas de mucho kilometraje mantienes el peso y recortas series, no kilos.</div>
    ${rutHtml}<div class="yo-lifts">${lifts.map(card).join("")}</div>
    <section class="blk"><div class="blk-head"><h2>Reglas para no lesionarte</h2></div><div class="card"><ul class="yo-ul"><li>Calienta con 3–4 series progresivas; la primera serie de trabajo nunca es la primera vez que cargas el peso.</li><li>Nunca saltes más de 5 kg sobre lo último que hiciste (la app ya lo respeta).</li><li>Pierna pesada y jalón con peso muerto: no el día antes del fondo largo ni de la calidad.</li><li>Una semana de cada cuatro es de descarga (−35 % de carga); coincide con la de menos kilómetros.</li><li>Los últimos 10 días antes del maratón no hay pierna pesada.</li><li>Técnica antes que kilos: si baja la técnica, baja el peso.</li></ul></div></section>
    <section class="blk"><div class="blk-head"><h2>Últimas series</h2></div><div class="card">${ult.length?ult.map(p=>`<div class="yo-reg"><span><b>${YO_LIFTS[p.lift]}</b> ${p.kg} kg × ${p.reps}${p.series>1?" × "+p.series:""}${p.rpe?" · RPE "+p.rpe:""}</span><small>${fmtCorto(p.fecha)} · 1RM ≈ ${r1(ptE1rm(+p.kg,+p.reps))}</small><button class="x" data-action="yo-del" data-k="pesas" data-id="${p.id}" aria-label="Borrar">✕</button></div>`).join(""):`<p class="hint" style="margin:0">Aún no has registrado series.</p>`}</div></section>`;
}

/* ---------- COMIDA ---------- */
function yoTabComida(){
  if(!yoPesoActual()) return yoVacio("Falta tu peso.");
  const dia=yoDiaHoy(), tipoHoy=dia?yoTipoDeDia(dia):"descanso", tipo=YOUI.tipo||tipoHoy, sem=yoSemanaHoy();
  const n=yoNutri(tipo,{sem,clases:dia&&tipo===tipoHoy?dia.clases:null}), menu=yoMenu(n,YOUI.menuV), cfg=yoConfig(), rc=yoCarrera();
  const pills=Object.keys(YO_TIPOS).map(k=>`<button class="yo-chip wide ${tipo===k?"on":""}" data-action="yo-tipo" data-t="${k}">${YO_TIPOS[k].n}${k===tipoHoy?" · hoy":""}</button>`).join("");
  return `<div class="yo-chips" style="flex-wrap:wrap;margin-bottom:12px">${pills}</div>
    <div class="tiles tiles-4">${yoTile("Calorías",n.kcal,"gastas ≈ "+n.tdee)}${yoTile("Proteína",n.P+" g",r1(n.P/yoPesoActual())+" g/kg")}${yoTile("Carbohidrato",n.C+" g",n.gkgC+" g/kg")}${yoTile("Grasa",n.F+" g","agua ≈ "+n.agua+" L")}</div>
    <div class="alert ok" style="margin-bottom:16px">${esc(n.nota)}</div>
    <section class="blk"><div class="blk-head"><h2>Cómo se come ese día</h2><button class="btn ghost" data-action="yo-menu-otra">↻ Otra opción</button></div>
      <div class="yo-menu">${menu.map(p=>`<div class="yo-plato"><div class="yo-plato-h"><b>${esc(p.mom)}</b><small>${p.kcal} kcal · P ${p.P} · C ${p.C} · G ${p.F}</small></div><ul>${p.items.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div>`).join("")}</div>
      <div class="card yo-libre"><b>Antojo libre ≈ ${n.libreKcal} kcal</b><p class="hint">Lo que se te antoje (tacos, pizza, helado, cerveza). No se compensa, no se "gana": el 80 % sólido de tu día ya cubre tu rendimiento. Ajusta cuánto:</p><div class="yo-chips">${[0,10,15,20].map(v=>`<button class="yo-chip ${cfg.libre===v?"on":""}" data-action="yo-libre" data-v="${v}">${v} %</button>`).join("")}</div></div></section>
    ${tipo==="largo"||tipo==="carrera"?`<section class="blk"><div class="blk-head"><h2>Durante la carrera / el fondo</h2></div><div class="card"><ul class="yo-ul"><li>Carbohidrato: ${rc.carbHora}.</li><li>Líquido: ${rc.liquido}.</li><li>Empieza a los 30–40 min; no esperes tener hambre ni sed.</li></ul></div></section>`:""}
    <section class="blk"><div class="blk-head"><h2>La cena</h2></div><div class="card"><ul class="yo-ul"><li>Proteína ${Math.round(n.est.P*.26)} g aprox. + verduras + carbohidrato <b>sin miedo</b>: cenar carbohidrato ayuda a recuperar y a dormir.</li><li>La noche antes del fondo largo, la calidad o la carrera, el carbohidrato de la cena sube (arroz, pasta, camote, tortillas).</li><li>Si cenas tarde por tus clases, hazla ligera y fácil de digerir; completa lo que falte en un desayuno fuerte.</li></ul></div></section>
    <section class="blk"><div class="blk-head"><h2>Reglas simples (sin restringirte)</h2></div><div class="card"><ul class="yo-ul"><li><b>Nada está prohibido.</b> Aproximadamente 80 % de lo que comes es comida de verdad; el otro 20 % es lo que te guste.</li><li>Proteína en cada comida (25–40 g); frutas y verduras de colores todos los días.</li><li>No saltes comidas en días de fondo, calidad o pierna pesada: ahí se construye el rendimiento.</li><li>Tomas ≈ ${n.agua} L de agua en el día, más lo que sudes; en fondos largos agrega electrolitos.</li><li>Un mal día de comida no se "paga": en la siguiente comida vuelves a lo normal.</li><li>El déficit (si hace falta) es chico y sólo en días ligeros fuera del pico; bajar rápido te cuesta fuerza y te lesiona.</li></ul></div></section>
    <section class="blk"><div class="blk-head"><h2>Suplementos (conservador)</h2></div><div class="card"><ul class="yo-ul">${YO_SUPLEMENTOS.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div></section>`;
}

/* ---------- PROGRESO ---------- */
function yoTabProgreso(){
  const b=yoBanda(), m=yoMetas(), pes=yoPesos(), car=yoCarreras().slice(-8).reverse();
  const pPeso=pes.filter(p=>p.peso).map(p=>({x:p.fecha,y:+p.peso})), pGr=pes.filter(p=>p.grasa).map(p=>({x:p.fecha,y:+p.grasa}));
  const sems=yoSemanas(), hoy=yoSemanaHoy(), ult=[...Array(8)].map((_,k)=>addDays(yoLunes(todayStr()),-7*(7-k)));
  const real=ult.map(l=>Math.round(yoKmSemanaReal(l)));
  const bandaHtml=b?`<div class="tiles tiles-4">${yoTile("Peso",r1(b.peso)+" kg","masa magra ≈ "+r1(b.lean)+" kg")}${yoTile("% de grasa",b.g+" %","banda "+m.grasaMin+"–"+m.grasaMax+" %")}${yoTile("A "+m.grasaMax+" %","≈ "+r1(b.w12)+" kg",b.arriba?"−"+r1(b.kgSobre)+" kg":"ya llegaste")}${yoTile("A 10 % / "+m.grasaMin+" %",r1(b.w10)+" / "+r1(b.w8),"con tu masa magra actual")}</div>
    <div class="alert ${b.enBanda?"ok":b.debajo?"bad":"warn"}" style="margin-bottom:14px">${b.enBanda?"Estás dentro de tu banda: mantén, come sin déficit y deja que el entreno recomponga.":b.debajo?"Estás por debajo de tu banda: sube comida, no más déficit.":"Para llegar a "+m.grasaMax+" % con seguridad: ≈ "+b.semanas+" semanas bajando máx. 0.4 % del peso por semana, sólo en días ligeros y fuera del pico. Tu masa magra se protege con proteína ≥ 2 g/kg y las pesas pesadas."}</div>`
    :`<div class="empty"><b>Registra tu peso y % de grasa.</b><p>Con ellos calculo tu masa magra y el peso al que corresponde 12, 10 u 8 %.</p></div>`;
  return `${yoAlertasHtml()}${bandaHtml}<div class="acts-row" style="margin-bottom:14px"><button class="btn primary" data-action="yo-log" data-t="peso">+ Peso / % de grasa</button><button class="btn" data-action="yo-log" data-t="carrera">+ Carrera</button><button class="btn" data-action="yo-log" data-t="pesa">+ Serie de pesas</button></div>
    <div class="chart-grid"><section class="card"><h3>Peso</h3>${svgLine(pPeso,"kg")}</section><section class="card"><h3>% de grasa</h3>${svgLine(pGr,"%","#c2573b")}</section></div>
    <section class="card" style="margin-top:14px"><h3>Kilómetros reales por semana</h3>${svgBars(real,ult.map(l=>fmtCorto(l)),null)}${hoy?`<p class="hint" style="margin-bottom:0">Plan de esta semana: ${hoy.km} km.</p>`:""}</section>
    <section class="blk"><div class="blk-head"><h2>Últimas carreras</h2></div><div class="card">${car.length?car.map(c=>`<div class="yo-reg"><span><b>${r1(+c.km)} km</b>${c.min?" en "+c.min+" min · "+yoMmss(c.min*60/c.km)+"/km":""} · ${esc(c.tipo||"fácil")}${c.rpe?" · RPE "+c.rpe:""}${+c.dolor>=3?` · dolor ${c.dolor}`:""}</span><small>${fmtCorto(c.fecha)}</small><button class="x" data-action="yo-del" data-k="carreras" data-id="${c.id}" aria-label="Borrar">✕</button></div>`).join(""):`<p class="hint" style="margin:0">Sin carreras registradas.</p>`}</div></section>
    <section class="blk"><div class="blk-head"><h2>Cuidado de tu salud</h2></div><div class="card"><ul class="yo-ul">${yoSeguridad().map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div></section>`;
}

/* ---------- PERFIL ---------- */
function yoTabPerfil(){
  const p=yoPerfil(), m=yoMetas(), y=YO_D(), pl=yoPlan(), base=y.base||{};
  const n=(id,l,v,ph,st)=>`<div><label class="mini">${l}</label><input class="inp" id="${id}" type="number" inputmode="decimal" step="${st||"any"}" value="${v===""||v==null||v===0?"":v}" ${ph?`placeholder="${ph}"`:""}></div>`;
  const bl=l=>`<div class="full yo-base"><b>${YO_LIFTS[l]}</b><div class="form-grid g3">${n("yo-b-"+l+"-kg","Mejor serie reciente (kg)",base[l]&&base[l].kg)}${n("yo-b-"+l+"-reps","Repeticiones",base[l]&&base[l].reps)}${n("yo-m-"+l,"Meta (kg)",m[l])}</div></div>`;
  return `<section class="card"><h3>Mis datos</h3><div class="form-grid g3"><div><label class="mini">Sexo</label>${ptSel("yo-sexo",[["m","Hombre"],["f","Mujer"]],p.sexo)}</div>${n("yo-edad","Edad",p.edad)}${n("yo-est","Estatura (cm)",p.estatura)}${n("yo-peso","Peso actual (kg)",p.peso)}${n("yo-grasa","% de grasa",p.grasa)}
      <div><label class="mini">Nivel corriendo</label>${ptSel("yo-nivel",[["novato","Novato"],["intermedio","Intermedio"],["avanzado","Avanzado"]],p.nivel)}</div>${n("yo-km","Km por semana ahora",p.kmSemana)}${n("yo-largo","Rodaje más largo reciente (km)",p.largo)}</div></section>
    <section class="card" style="margin-top:14px"><h3>Mis metas</h3><div class="form-grid g3"><div><label class="mini">Fecha del maratón</label><input class="inp" id="yo-fecha" type="date" value="${m.fecha||""}"></div><div><label class="mini">Tiempo meta (h:mm)</label><input class="inp" id="yo-tiempo" placeholder="ej. 4:00" value="${esc(m.tiempo||"")}"></div><div></div>${n("yo-gmin","% de grasa mínimo",m.grasaMin)}${n("yo-gmax","% de grasa máximo",m.grasaMax)}</div></section>
    <section class="card" style="margin-top:14px"><h3>Mis levantamientos</h3><p class="hint" style="margin-top:0">Tu mejor serie bien hecha de las últimas semanas (ej. 80 kg × 5). De ahí salen tus pesos de cada día. La meta es tu 1RM estimado.</p><div class="form-grid">${["sentadilla","banca","muerto","militar"].map(bl).join("")}</div></section>
    <section class="card" style="margin-top:14px"><h3>Mi plan</h3><div class="form-grid g3"><div><label class="mini">Días que corro</label>${ptSel("yo-ncorrer",[[4,"4 días"],[5,"5 días (mete dobles)"]],pl?pl.nCorrer:4)}</div><div><label class="mini">Días de pesas</label>${ptSel("yo-npesas",[[3,"3 días"],[4,"4 días (fuerte)"]],pl?pl.nPesas:3)}</div></div>
      <p class="hint">El plan toma tu horario de clases (Ajustes) para colocar lo duro en los días con menos clases.${pl?" Plan actual creado el "+fmtCorto(pl.creado)+".":""}</p>
      <div class="acts-row"><button class="btn primary" data-action="yo-perfil-save">${pl?"Guardar y regenerar plan":"Guardar y crear mi plan"}</button></div>${YOUI.msgPlan?`<p class="hint">${esc(YOUI.msgPlan)}</p>`:""}</section>`;
}

/* ---------- modales de registro ---------- */
function yoModal(md){
  const f=(id,l,v,t,st)=>`<div><label class="mini">${l}</label><input class="inp" id="${id}" type="${t||"number"}" ${t?"":`inputmode="decimal" step="${st||"any"}"`} value="${v==null?"":v}"></div>`;
  if(md.type==="yo-peso") return modalShell("Peso y % de grasa",`<div class="form-grid g3">${f("yp-fecha","Fecha",todayStr(),"date")}${f("yp-peso","Peso (kg)","")}${f("yp-grasa","% de grasa","")}</div>`,`<button class="btn ghost" data-action="close-modal">Cancelar</button><button class="btn primary" data-action="yo-save-peso">Guardar</button>`);
  if(md.type==="yo-carrera") return modalShell("Registrar carrera",`<div class="form-grid g3">${f("yc-fecha","Fecha",todayStr(),"date")}${f("yc-km","Kilómetros","")}${f("yc-min","Minutos","")}<div><label class="mini">Tipo</label>${ptSel("yc-tipo",["fácil","calidad","largo","carrera"].map(x=>[x,x]),"fácil")}</div>${f("yc-rpe","Esfuerzo (1–10)","")}${f("yc-dolor","Dolor (0–10)",0)}</div>`,`<button class="btn ghost" data-action="close-modal">Cancelar</button><button class="btn primary" data-action="yo-save-carrera">Guardar</button>`);
  if(md.type==="yo-pesa") return modalShell("Registrar serie",`<div class="form-grid g3"><div><label class="mini">Levantamiento</label>${ptSel("ys-lift",Object.keys(YO_LIFTS).map(k=>[k,YO_LIFTS[k]]),md.lift||"sentadilla")}</div>${f("ys-fecha","Fecha",todayStr(),"date")}${f("ys-kg","Peso (kg)","")}${f("ys-reps","Repeticiones","")}${f("ys-series","Series",1)}${f("ys-rpe","RPE (6–10)","")}</div>`,`<button class="btn ghost" data-action="close-modal">Cancelar</button><button class="btn primary" data-action="yo-save-pesa">Guardar</button>`);
  if(md.type==="yo-rut"){ const code=md.code, cu=yoCustom(code), sem=yoSemanaHoy()||yoSemanas()[0], lines=cu&&cu.lines&&cu.lines.length?cu.lines:yoRutinaBase(code,sem);
    return modalShell("Editar rutina",`<div class="form-grid"><div class="full"><label class="mini">Nombre</label><input class="inp" id="yr-titulo" value="${esc((cu&&cu.titulo)||YO_TITULO[code])}"></div><div class="full"><label class="mini">Ejercicios (uno por línea)</label><textarea class="inp" id="yr-lineas" rows="11" style="font-family:var(--f-mono);font-size:13px">${esc(lines.join(String.fromCharCode(10)))}</textarea></div></div><p class="hint">Cambia, quita o agrega lo que quieras: series, repeticiones, ejercicios. Una línea que sea <b>@sentadilla</b>, <b>@banca</b>, <b>@muerto</b> o <b>@militar</b> pone la serie principal con tus kilos calculados.</p>`,`<button class="btn ghost" data-action="yo-rut-reset">Restablecer</button><button class="btn ghost" data-action="close-modal">Cancelar</button><button class="btn primary" data-action="yo-rut-save">Guardar</button>`); }
  return "";
}

/* ---------- eventos ---------- */
function yoSemTexto(sem){
  const dias=yoDiasSemana(sem); return "Semana "+(sem.i+1)+" · "+YO_FASES[sem.fase]+" · "+sem.km+" km\n\n"+dias.map(d=>d.dia+" "+fmtCorto(d.fecha)+(d.clases?" (🎤 "+d.clases+" clase"+(d.clases>1?"s":"")+")":"")+": "+(d.ses.length?d.ses.map(s=>s.titulo).join(" + "):(d.nota||"libre"))).join("\n");
}
function yoClick(a,t){
  const y=YO_D(), nv=id=>{ const v=parseFloat(fv(id)); return isFinite(v)?v:""; };
  if(a==="yo-tab"){ YOUI.tab=t.dataset.t; YOUI.off=0; state.screen="yo"; render(); window.scrollTo(0,0); return true; }
  if(a==="yo-sem"){ YOUI.off+=+t.dataset.d; render(); return true; }
  if(a==="yo-tipo"){ YOUI.tipo=t.dataset.t; YOUI.menuV=0; render(); return true; }
  if(a==="yo-menu-otra"){ YOUI.menuV++; render(); return true; }
  if(a==="yo-libre"){ y.config=Object.assign({},y.config,{libre:+t.dataset.v}); touch(); render(); return true; }
  if(a==="yo-copiar-sem"){ const s=yoSemanaVista(); if(s) copyText(yoSemTexto(s),"Semana copiada"); return true; }
  if(a==="yo-ck"){ const ch=Object.assign({},y.config.checkin||{}); const hoy=todayStr(); ch[hoy]=Object.assign({},ch[hoy]||{},{[t.dataset.k]:+t.dataset.v}); y.config=Object.assign({},y.config,{checkin:ch}); touch(); render(); return true; }
  if(a==="yo-log"){ state.modal={type:"yo-"+t.dataset.t,lift:t.dataset.l}; renderOverlay(); return true; }
  if(a==="yo-save-peso"){ const p=nv("yp-peso"), g=nv("yp-grasa"); if(!p&&!g){ toast("Escribe al menos el peso"); return true; }
    y.pesos.push({id:newId("yw"),fecha:fv("yp-fecha")||todayStr(),peso:p||null,grasa:g||null}); touch(); closeModal(); render(); toast("Guardado"); return true; }
  if(a==="yo-save-carrera"){ const km=nv("yc-km"); if(!km){ toast("Escribe los kilómetros"); return true; }
    y.carreras.push({id:newId("yr"),fecha:fv("yc-fecha")||todayStr(),km,min:nv("yc-min")||null,tipo:fv("yc-tipo"),rpe:nv("yc-rpe")||null,dolor:nv("yc-dolor")||0}); touch(); closeModal(); render(); toast("Carrera guardada"); return true; }
  if(a==="yo-save-pesa"){ const kg=nv("ys-kg"), reps=nv("ys-reps"); if(!kg||!reps){ toast("Escribe peso y repeticiones"); return true; }
    y.pesas.push({id:newId("yl"),fecha:fv("ys-fecha")||todayStr(),lift:fv("ys-lift"),kg,reps,series:nv("ys-series")||1,rpe:nv("ys-rpe")||null}); touch(); closeModal(); render(); toast("Serie guardada"); return true; }
  if(a==="yo-del"){ const arr=y[t.dataset.k], i=arr.findIndex(x=>x.id===t.dataset.id); if(i<0) return true; const [x]=arr.splice(i,1); touch(); render(); toastUndo("Registro borrado",()=>{ arr.splice(Math.min(i,arr.length),0,x); touch(); render(); }); return true; }
  if(a==="yo-rut-edit"){ state.modal={type:"yo-rut",code:t.dataset.c}; renderOverlay(); return true; }
  if(a==="yo-rut-save"){ const code=state.modal.code, lines=(document.getElementById("yr-lineas").value||"").split(String.fromCharCode(10)).map(x=>x.trim()).filter(Boolean); if(!lines.length){ toast("Escribe al menos un ejercicio"); return true; }
    const rut=Object.assign({},y.config.rutinas||{}); rut[code]={titulo:fv("yr-titulo").trim()||YO_TITULO[code],lines}; y.config=Object.assign({},y.config,{rutinas:rut}); touch(); closeModal(); render(); toast("Rutina guardada"); return true; }
  if(a==="yo-rut-reset"){ const code=state.modal.code, rut=Object.assign({},y.config.rutinas||{}); delete rut[code]; y.config=Object.assign({},y.config,{rutinas:rut}); touch(); closeModal(); render(); toast("Rutina restablecida"); return true; }
  if(a==="yo-plan-regen"){ yoGuardarPlan(); render(); toast("Plan reacomodado"); return true; }
  if(a==="yo-perfil-save"){
    const pf=Object.assign({},y.perfil,{sexo:fv("yo-sexo"),edad:nv("yo-edad"),estatura:nv("yo-est"),peso:nv("yo-peso"),grasa:nv("yo-grasa"),nivel:fv("yo-nivel"),kmSemana:nv("yo-km")||25,largo:nv("yo-largo")||12});
    const mt=Object.assign({},y.metas,{fecha:fv("yo-fecha"),tiempo:fv("yo-tiempo").trim(),grasaMin:nv("yo-gmin")||8,grasaMax:nv("yo-gmax")||12});
    const base=Object.assign({},y.base);
    ["sentadilla","banca","muerto","militar"].forEach(l=>{ const kg=nv("yo-b-"+l+"-kg"), r=nv("yo-b-"+l+"-reps"); if(kg) base[l]={kg,reps:r||1}; else delete base[l]; mt[l]=nv("yo-m-"+l)||0; });
    y.perfil=pf; y.metas=mt; y.base=base;
    if(pf.peso&&!y.pesos.length) y.pesos.push({id:newId("yw"),fecha:todayStr(),peso:pf.peso,grasa:pf.grasa||null});
    yoGuardarPlan(+fv("yo-ncorrer")||4,+fv("yo-npesas")||3);
    YOUI.tab="hoy"; touch(); render(); toast("Plan listo"); return true; }
  return false;
}
function yoGuardarPlan(nCorrer,nPesas){
  const y=YO_D(), old=y.plan; yoSemCache={key:"",v:[]};
  y.plan=yoPlanCrear({nCorrer:nCorrer||(old&&old.nCorrer)||4,nPesas:nPesas||(old&&old.nPesas)||4}); touch();
  YOUI.msgPlan="";
}
function yoInput(a,t){
  if(a==="yo-zona"){ const y=YO_D(), ch=Object.assign({},y.config.checkin||{}), hoy=todayStr(); ch[hoy]=Object.assign({},ch[hoy]||{},{zona:t.value}); y.config=Object.assign({},y.config,{checkin:ch}); touch(); return true; }
  return false;
}
