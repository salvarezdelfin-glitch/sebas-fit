"use strict";
/* ============================================================
   APOYO PARA DAR LA CLASE: carga sugerida por bloque y opciones más fácil / más difícil de cada paso
   (para grupos con distintos niveles) — se muestra en la rutina, en la vista Instructor y al exportar
   ============================================================ */
const KG_UP={ligera:"2–3 kg",media:"4–5 kg",pesada:"6–8 kg",muypesada:"8–10 kg"};
const KG_LEG={ligera:"3–4 kg",media:"5–6 kg",pesada:"8–10 kg",muypesada:"10–12 kg"};
const KG_CORE={ligera:"2–3 kg",media:"3–4 kg",pesada:"4–6 kg",muypesada:"5–8 kg"};
const LIGA_DIF={ligera:"liga ligera",media:"liga media",pesada:"liga fuerte",muypesada:"liga fuerte"};
/* carga sugerida de cada bloque de una clase de Sculpt por estaciones */
function estCargas(r){
  const d=r.nivel||"media";
  r.sections.forEach(S=>{
    if(S.kind!=="work") return;
    const eqs=new Set(S.slots.map(s=>(s.eq||byId[s.ref].eq))), partes=[];
    const mancuerna=eqs.has("mancuernas"), liga=eqs.has("liga"), polainas=eqs.has("polainas");
    if(mancuerna) partes.push("mancuernas "+(S.bk==="leg"?KG_LEG[d]:S.bk==="abs"||S.bk==="plk"?KG_CORE[d]:KG_UP[d]));
    if(liga) partes.push(LIGA_DIF[d]);
    if(polainas) partes.push("polainas "+(d==="ligera"?"0.5":d==="media"?"1":"1.5–2")+" kg");
    S.carga=partes.join(" · ");
  });
}
/* opciones para el grupo: cómo hacerlo más fácil o más difícil según el tipo de paso */
function claseOpc(rs){
  const n=(rs.nom||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase(), q=rs.q, eq=rs.eq||"";
  if(q&&q.t==="trans") return null;
  if(rs.rol==="P") return {f:"Baja el peso ~10 % o haz una repetición menos",d:"Pausa de 2 s abajo o una repetición más"};
  if(rs.rol==="S"||rs.rol==="A") return {f:"Menos peso o rango más corto",d:"Más peso o tempo lento 3-1-1"};
  if(/plancha|flexion|push|hollow|bear|escalad/.test(n)) return {f:"Apoya las rodillas o sube las manos al cubo",d:"Eleva un pie o añade una pausa abajo"};
  if(q&&q.t==="falla") return {f:"Termina cuando la técnica se rompa; descansa 5 s y sigue",d:"Añade carga o un movimiento extra al final"};
  if(q&&q.t==="hold") return {f:"Reduce el tiempo unos 10 s y apóyate si hace falta",d:"Suma 10 s o añade carga o liga"};
  if(q&&q.t==="pulsos") return {f:"Pulsos más cortos y sin carga",d:"Más carga o liga más fuerte, mismo rango"};
  if(/abdom|crunch|tijera|bicicleta|dead bug|russian|giro|v-up|v-hold|toque|elevacion de piernas|sit-up/.test(n)||rs.b==="core") return {f:"Rodillas flexionadas y manos en el pecho",d:"Piernas extendidas y mancuerna sobre el pecho"};
  if(rs.lado||/zancada|bulgara|una pierna|subida|curtsy|cosaca/.test(n)) return {f:"Apóyate en la pared o en una silla",d:"Sin apoyo y con carga extra"};
  if(eq==="liga") return {f:"Liga más ligera o más ancha",d:"Liga más fuerte o doble"};
  if(eq==="mancuernas") return {f:"Menos peso o sin peso",d:"Más peso o tempo lento 3-1-1"};
  return {f:"Reduce el rango o el ritmo",d:"Añade carga o una pausa isométrica"};
}
const claseOpcHtml=rs=>{ const o=claseOpc(rs); return o?`<div class="cue opc">↓ ${esc(o.f)} &nbsp;·&nbsp; ↑ ${esc(o.d)}</div>`:""; };
const claseOpcIv=rs=>{ const o=claseOpc(rs); return o?`<div class="iv-opc"><span>↓ Fácil: ${esc(o.f)}</span><span>↑ Difícil: ${esc(o.d)}</span></div>`:""; };
