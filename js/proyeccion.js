"use strict";
/* ============================================================
   PROCESO · qué cambios empieza a notar un cliente a los 3, 6, 9 y 12 meses
   Estimaciones orientativas con promedios de la literatura de entrenamiento (ritmos de pérdida de
   grasa, ganancia de masa magra y fuerza según nivel y objetivo). No son promesas: dependen de
   constancia, sueño, comida y genética. El sistema compara después con las medidas reales.
   ============================================================ */
const PJ_MESES=[3,6,9,12];
/* % de aumento de fuerza en los básicos por hito (3,6,9,12 meses) según nivel */
const PJ_FUERZA={basico:[[25,35],[40,55],[50,65],[60,80]],intermedio:[[7,12],[14,20],[19,25],[24,32]],avanzado:[[2,4],[4,7],[6,9],[8,12]]};
const PJ_OBJ_FUERZA={fuerza:1,hipertrofia:.85,gluteo:.8,grasa:.65,salud:.6};
const PJ_ADH=.85;   // adherencia realista: nadie cumple el 100 %

function pjAddMeses(fecha,n){ const d=parseLocalDate(fecha); d.setMonth(d.getMonth()+n); return toDateStr(d); }
function pjBase(c){
  const m0=ptMedidasDe(c.id)[0]||{};
  const peso=Number(c.peso0)||Number(m0.peso)||null, grasa=(c.grasa0!==""&&c.grasa0!=null&&Number(c.grasa0)>0)?Number(c.grasa0):(m0.grasa?Number(m0.grasa):null);
  return {peso,grasa,estatura:Number(c.estatura)||null,sexo:c.sexo||"x"};
}
function pjMasas(peso,grasa){ const mg=grasa!=null?peso*grasa/100:null; return {mg,mm:mg!=null?peso-mg:null}; }
function pjImc(peso,estatura){ return peso&&estatura?peso/Math.pow(estatura/100,2):null; }
/* kg de masa magra que se pueden ganar en el mes m según sexo, nivel y objetivo */
function pjMagraMes(c,m){
  const b=({m:.9,f:.45,x:.65})[c.sexo||"x"]||.65;
  const niv=c.nivel==="basico"?(m<=6?1:.65):c.nivel==="intermedio"?.45:.18;
  const obj=({hipertrofia:1,gluteo:.8,fuerza:.5,grasa:c.nivel==="basico"?.3:.1,salud:.3})[c.objetivo]||.3;
  return b*niv*obj;
}
/* fracción del peso corporal que se pierde en grasa por mes */
function pjGrasaMes(c,grasa){
  if(c.objetivo==="grasa") return (grasa>=32?.026:grasa>=25?.021:grasa>=18?.015:.01)*PJ_ADH;
  if(c.objetivo==="gluteo"&&grasa>=25) return .008*PJ_ADH;
  if(c.objetivo==="salud"&&grasa>=25) return .006*PJ_ADH;
  return 0;
}
/* proyección mes a mes (0..12). Devuelve [{mes,peso,grasa,mg,mm,cinturaCm}] */
function pjProyectar(c){
  const b=pjBase(c); if(!b.peso) return [];
  const sexo=c.sexo||"x", piso=sexo==="f"?16:sexo==="m"?8:12;
  let grasa=b.grasa!=null?b.grasa:(sexo==="f"?30:sexo==="m"?22:26);   // si no hay dato se estima un punto medio
  let {mg,mm}=pjMasas(b.peso,grasa); const out=[{mes:0,peso:b.peso,grasa,mg,mm,cinturaCm:0}]; let perdida=0;
  for(let m=1;m<=12;m++){
    const peso=mg+mm, dMm=pjMagraMes(c,m);
    const dec=m<=3?1:m<=6?.8:m<=9?.6:.45;   // la pérdida se frena con el tiempo (adaptación y mesetas)
    let dMg=-peso*pjGrasaMes(c,grasa)*dec;
    if(c.objetivo==="hipertrofia") dMg=dMm*.15; else if(c.objetivo==="fuerza") dMg=dMm*.05;
    // no bajar de la meta de grasa ni del piso fisiológico
    const meta=Number(c.metaGrasa)>0?Number(c.metaGrasa):null, lim=Math.max(piso,meta||0);
    let nuevoMm=mm+dMm, nuevoMg=mg+dMg;
    if(dMg<0&&(nuevoMg/(nuevoMg+nuevoMm)*100)<lim){ nuevoMg=Math.min(mg,Math.max(0,nuevoMm*lim/(100-lim))); }
    if(nuevoMg<mg) perdida+=mg-nuevoMg;
    mm=nuevoMm; mg=nuevoMg; const p=mm+mg; grasa=mg/p*100;
    out.push({mes:m,peso:p,grasa,mg,mm,cinturaCm:perdida});
  }
  return out;
}
const r1=n=>Math.round(n*10)/10;
function pjHitos(c,pts){
  if(!pts.length) return [];
  const niv=PJ_FUERZA[c.nivel]||PJ_FUERZA.basico, fo=PJ_OBJ_FUERZA[c.objetivo]||.6, inicio=c.inicio||todayStr();
  return PJ_MESES.map((mes,i)=>{
    const p=pts[mes], d0=pts[0], dPeso=p.peso-d0.peso, dMm=p.mm-d0.mm, dMg=p.mg-d0.mg;
    const fz=niv[i].map(x=>Math.round(x*fo));
    const cint=p.cinturaCm>0.3?[Math.round(p.cinturaCm*.8),Math.round(p.cinturaCm*1.2)]:null;
    return {mes,fecha:pjAddMeses(inicio,mes),peso:r1(p.peso),dPeso:r1(dPeso),grasa:r1(p.grasa),dGrasa:r1(p.grasa-d0.grasa),dMagra:r1(dMm),dGrasaKg:r1(dMg),fuerza:fz,cintura:cint,notar:pjNotar(c,mes,{dMm,dMg,cint,fz,p}),medir:PJ_MEDIR};
  });
}
const PJ_MEDIR=["Peso en ayunas (promedio de 3 días)","% de grasa corporal","Cintura, cadera, muslo y brazo","Pruebas de fuerza (3–5 repeticiones en los básicos)","Fotos con la misma luz y ropa","Adherencia a las sesiones (meta ≥ 80 %)"];
function pjNotar(c,mes,x){
  const obj=c.objetivo, out=[];
  if(mes===3){
    out.push("Más energía, mejor sueño y mejor ánimo; la técnica de los ejercicios básicos ya es sólida.");
    out.push("La fuerza sube rápido (adaptación del sistema nervioso): pesos que costaban al inicio ya son calentamiento.");
    out.push("La ropa empieza a quedar distinta aunque la báscula se mueva poco.");
    out.push("El hábito de entrenar queda establecido: el tramo más difícil ya pasó.");
  } else if(mes===6){
    out.push("Los cambios ya se ven en el espejo y otras personas empiezan a notarlos.");
    out.push("La composición cambia: la ropa queda más holgada en cintura y más ajustada en hombros y piernas.");
    out.push("Las cargas de trabajo son claramente mayores y entrenar se siente más fácil.");
  } else if(mes===9){
    out.push("La composición corporal ya es clara; el ritmo de cambio se vuelve más lento y constante, y es normal.");
    out.push("Buen momento para cambiar de ciclo: programa nuevo, variantes nuevas y objetivos más específicos.");
    out.push("Pueden aparecer mesetas: se rompen ajustando volumen, descanso y comida.");
  } else {
    out.push("Transformación sostenida: hábitos consolidados y metas principales alcanzadas o muy cerca.");
    out.push("Se evalúa todo el año (medidas, fuerza, fotos y adherencia) y se diseña la siguiente fase.");
    out.push("Entrena con autonomía: sabe ajustar cargas, descanso y comida.");
  }
  const fz=x.fz[0]+"–"+x.fz[1]+" %";
  if(obj==="grasa"){ if(x.dMg<-.4) out.push("Pierde ≈ "+r1(-x.dMg)+" kg de grasa"+(x.cint?" y la cintura baja ≈ "+x.cint[0]+"–"+x.cint[1]+" cm":"")+"; menos hinchazón y mejor digestión."); }
  else if(obj==="hipertrofia"){ out.push("Gana ≈ "+r1(x.dMm)+" kg de masa magra: cambios en hombros, espalda y brazos."); }
  else if(obj==="gluteo"){ out.push("Glúteo y pierna más firmes y con mejor activación; el pantalón cambia de ajuste."+(x.dMg<-.4?" Grasa ≈ −"+r1(-x.dMg)+" kg.":"")); }
  else if(obj==="fuerza"){ out.push("Fuerza en los básicos: +"+fz+" frente al inicio."); }
  else { out.push("Menos dolores, mejor resistencia al subir escaleras y mayor movilidad."); }
  if(obj!=="fuerza") out.push("Fuerza estimada en los básicos: +"+fz+".");
  return out;
}
/* ¿se alcanza la meta? */
function pjMeta(c,pts){
  if(!pts.length) return null;
  const mg=Number(c.metaGrasa)>0?Number(c.metaGrasa):null, mp=Number(c.metaPeso)>0?Number(c.metaPeso):null, out=[];
  const b=pts[0];
  if(mg){ const dir=mg<b.grasa?-1:1, k=pts.findIndex(p=>dir<0?p.grasa<=mg+.25:p.grasa>=mg-.25);
    out.push(k>0?{txt:"Meta de "+mg+" % de grasa: se alcanza en ≈ "+k+(k===1?" mes":" meses")+" con este ritmo.",ok:true}:{txt:"Meta de "+mg+" % de grasa: con este ritmo llega a ≈ "+r1(pts[12].grasa)+" % en 12 meses. Conviene ajustar la meta o reforzar comida y entrenamiento.",ok:false}); }
  if(mp){ const dir=mp<b.peso?-1:1, k=pts.findIndex(p=>dir<0?p.peso<=mp+.3:p.peso>=mp-.3);
    out.push(k>0?{txt:"Meta de "+mp+" kg: se alcanza en ≈ "+k+(k===1?" mes":" meses")+".",ok:true}:{txt:"Meta de "+mp+" kg: en 12 meses llega a ≈ "+r1(pts[12].peso)+" kg. Revisa si el objetivo es realista.",ok:false}); }
  return out;
}
/* gráfica: proyección (línea) contra medidas reales (puntos) */
function svgProy(pts,reales,unit,campo,metaV){
  const W=340,H=150,P=30, s=pts.map(p=>({x:p.mes,y:p[campo]})), all=s.map(p=>p.y).concat(reales.map(r=>r.y)).concat(metaV?[metaV]:[]);
  const mn=Math.min(...all), mx=Math.max(...all), span=(mx-mn)||1, X=m=>P+m*(W-2*P)/12, Y=v=>H-P-(v-mn)/span*(H-2*P);
  const line=s.map((p,i)=>(i?"L":"M")+X(p.x).toFixed(1)+" "+Y(p.y).toFixed(1)).join(" ");
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Proyección"><path d="${line}" fill="none" stroke="var(--accent)" stroke-width="2.2" stroke-dasharray="5 4"/>
    ${metaV?`<line x1="${P}" x2="${W-P}" y1="${Y(metaV).toFixed(1)}" y2="${Y(metaV).toFixed(1)}" stroke="var(--ok)" stroke-width="1" stroke-dasharray="2 3"/><text x="${W-P}" y="${(Y(metaV)-4).toFixed(1)}" text-anchor="end" class="ct" fill="var(--ok)">meta ${r1(metaV)}</text>`:""}
    ${PJ_MESES.map(m=>`<line x1="${X(m).toFixed(1)}" x2="${X(m).toFixed(1)}" y1="${P-8}" y2="${H-P}" stroke="var(--hairline)" stroke-width="1"/><text x="${X(m).toFixed(1)}" y="${H-10}" text-anchor="middle" class="ct">${m} m</text>`).join("")}
    ${reales.map(r=>`<circle cx="${X(Math.min(12,Math.max(0,r.x))).toFixed(1)}" cy="${Y(r.y).toFixed(1)}" r="4" fill="var(--ok)"/>`).join("")}
    <text x="${P}" y="14" class="ct">${r1(mx)} ${unit}</text><text x="${P}" y="${H-P+12}" class="ct">${r1(mn)} ${unit}</text></svg>`;
}
function pjTexto(c){
  const b=pjBase(c), pts=pjProyectar(c), hs=pjHitos(c,pts), meta=pjMeta(c,pts)||[];
  let t=`*Plan de proceso — ${c.nombre}*\n${PT_NIVELES[c.nivel].nom} · ${PT_OBJETIVOS[c.objetivo].nom}\nPunto de partida: ${b.peso} kg${b.grasa!=null?" · "+b.grasa+" % de grasa":""}${c.metaTexto?"\nMeta: "+c.metaTexto:""}\n`;
  meta.forEach(m=>{ t+="• "+m.txt+"\n"; });
  hs.forEach(h=>{ t+=`\n*A los ${h.mes} meses* (${fmtCorto(h.fecha)})\nPeso estimado ≈ ${h.peso} kg (${h.dPeso>0?"+":""}${h.dPeso}) · grasa ≈ ${h.grasa} %${h.cintura?" · cintura −"+h.cintura[0]+"–"+h.cintura[1]+" cm":""} · fuerza +${h.fuerza[0]}–${h.fuerza[1]} %\n${h.notar.map(x=>"✔ "+x).join("\n")}\n`; });
  t+="\nSon estimaciones orientativas: dependen de constancia, sueño, comida y genética. Cada hito se revisa con medidas reales.";
  return t;
}
function pjPrintHtml(c){
  const b=pjBase(c), pts=pjProyectar(c), hs=pjHitos(c,pts), meta=pjMeta(c,pts)||[];
  return `<div class="pd"><div class="pd-head"><div><div class="pd-brand">SEBAS FIT</div><h1>Plan de proceso</h1><p><b>${esc(c.nombre)}</b> · ${PT_NIVELES[c.nivel].nom} · ${esc(PT_OBJETIVOS[c.objetivo].nom)}</p></div><div class="pd-date">${fmtCorto(c.inicio||todayStr())}</div></div>
    <p>Punto de partida: <b>${b.peso} kg</b>${b.grasa!=null?" · <b>"+b.grasa+" % de grasa</b>":""}${c.metaTexto?" · Meta: "+esc(c.metaTexto):""}</p>${meta.map(m=>`<p>• ${esc(m.txt)}</p>`).join("")}
    ${hs.map(h=>`<h3>A los ${h.mes} meses · ${fmtCorto(h.fecha)}</h3><p>Peso estimado ≈ <b>${h.peso} kg</b> · grasa ≈ <b>${h.grasa} %</b>${h.cintura?" · cintura −"+h.cintura[0]+"–"+h.cintura[1]+" cm":""} · fuerza +${h.fuerza[0]}–${h.fuerza[1]} %</p><ul>${h.notar.map(x=>`<li>${esc(x)}</li>`).join("")}</ul><p class="sm"><b>Medimos:</b> ${h.medir.map(esc).join(" · ")}</p>`).join("")}
    <div class="pd-notes"><p class="sm">Estimaciones orientativas basadas en promedios; dependen de constancia, sueño, comida y genética. Cada hito se revisa con medidas reales y se ajusta el programa.</p></div></div>`;
}
