/* Dictado: texto hablado (como lo entrega el micrófono, sin renglones ni puntuación) → clase entendida */
window.dictTest=async function(){
  const fallas=[], ok=(c,m)=>{ if(!c) fallas.push(m); };
  const P=t=>aprParsear(dictOrdenar(t),8), pasos=p=>p.bloques.reduce((a,b)=>a+b.pasos.length,0);

  // 1. clase completa dicha de corrido, con errores típicos del micrófono (blog, jold, faya, clam shell, ded bag)
  const c1=P("blog uno tren superior con mancuernas de cinco kilos caminas con las manos hasta plancha luego en plancha toques de hombro diez luego jold de plancha quince segundos luego caminas de regreso y subes a pie luego laterales con mancuerna luego frontales luego press de hombro segundo bloque pierna con silla y liga ocho sentadillas para bajar a silla luego hold puro treinta segundos luego pulsos pequeños veinticinco a treinta luego liga arriba de rodillas abres y cierras veinte pulsos luego hold final hasta la faya bloque de glúteo con liga lado a clam shell abres y cierras luego isometría de clamshell veinte segundos cambias de lado clam shell abres y cierras luego isometría de clamshell veinte segundos bloque cuatro aps con mancuernas crunch con mancuerna al pecho luego russian twist luego ded bag reto final hollow a la falla cierre reflexión guiada");
  const bk=c1.bloques.map(b=>b.bk).join(",");
  ok(bk==="up,leg,glu,abs,reto,cierre","bloques en orden (up,leg,glu,abs,reto,cierre): "+bk);
  const up=c1.bloques[0]; ok(up&&up.pasos.length===7,"tren superior con 7 pasos ("+(up&&up.pasos.length)+")");
  ok(up&&/mancuernas/.test(up.eq),"material del bloque: mancuernas ("+(up&&up.eq)+")");
  ok(up&&up.pasos[1].q.n===10,"«toques de hombro diez» = 10 reps");
  ok(up&&up.pasos[2].q.t==="hold"&&up.pasos[2].q.s===15,"«jold … quince segundos» = hold 15 s");
  const leg=c1.bloques[1]; ok(leg&&leg.pasos[0].q.n===8,"«ocho sentadillas» = 8 reps");
  ok(leg&&leg.pasos[2].q.t==="pulsos"&&leg.pasos[2].q.n>=25&&leg.pasos[2].q.n<=30,"«pulsos veinticinco a treinta» ≈ 27 pulsos ("+(leg&&leg.pasos[2].q.n)+")");
  ok(leg&&leg.pasos[leg.pasos.length-1].q.t==="falla","«hasta la faya» = a la falla");
  const glu=c1.bloques[2]; ok(glu&&glu.pasos.filter(p=>p.side==="A").length===2&&glu.pasos.filter(p=>p.side==="B").length===2,"lado A y lado B con 2 pasos cada uno");
  ok(glu&&glu.pasos.every(p=>/clamshell/i.test(p.nombre)),"«clam shell» se entiende como clamshell");
  const abs=c1.bloques[3]; ok(abs&&abs.pasos.some(p=>/dead bug/i.test(p.nombre)),"«ded bag» = dead bug");
  ok(c1.avisos.length===0,"sin avisos: "+c1.avisos.join(" | "));

  // 2. «borra eso» quita el último ejercicio dicho
  const c2=P("bloque uno abs crunch con mancuerna luego plancha lateral borra eso luego bicicleta lenta luego tijeras bajas");
  ok(c2.bloques[0]&&c2.bloques[0].pasos.map(p=>p.nombre).join("|")==="Crunch con mancuerna|Bicicleta lenta|Tijeras bajas","«borra eso» quita la plancha lateral: "+(c2.bloques[0]&&c2.bloques[0].pasos.map(p=>p.nombre).join("|")));

  // 3. bloques sin número se numeran solos y los ordinales funcionan
  const o3=dictOrdenar("bloque de pierna sentadilla sumo diez luego hold treinta segundos tercer bloque abs crunch doce");
  ok(/BLOQUE 1 – PIERNA/.test(o3)&&/BLOQUE 3 – ABS/.test(o3),"«bloque de pierna» = 1 y «tercer bloque» = 3:\n"+o3);

  // 4. con puntuación del teclado del iPhone (frases con punto)
  const c4=P("Bloque 1, pierna. Diez sentadillas sumo con mancuerna. Hold abajo en sumo treinta segundos. Pulsos en sumo treinta. Hold final a la falla. Bloque 2, abs. Crunch con pausa de dos segundos por doce. Bicicleta lenta. Reto final, bote a la falla.");
  ok(c4.bloques.map(b=>b.bk).join(",")==="leg,abs,reto","dictado del teclado: "+c4.bloques.map(b=>b.bk).join(","));
  ok(c4.bloques[1]&&c4.bloques[1].pasos[0].q.n===12,"«por doce» = 12 reps");

  // 5. lo dictado se une bien aunque el navegador repita frases (Android)
  ok(dictUnirFinales(["bloque uno","bloque uno tren superior","luego plancha"])==="bloque uno tren superior luego plancha","une resultados repetidos del micrófono");

  // 6. pantalla: el botón y la ayuda aparecen; «Entender» ordena solo lo dictado con el teclado
  state.screen="formato"; APRUI.txt=""; APRUI.prev=null; render();
  ok(!!document.querySelector('[data-action="ap-dict-mic"]'),"botón 🎤 Dictar mi clase");
  ok(!!document.querySelector('.dict-ayuda'),"ayuda «¿Cómo dictar?»");
  const ta=document.querySelector(".apr-txt"); ta.value="bloque uno pierna diez sentadillas sumo con mancuerna luego hold abajo en sumo treinta segundos luego pulsos en sumo treinta luego hold final a la falla"; ta.dispatchEvent(new Event("input",{bubbles:true}));
  document.querySelector('[data-action="ap-entender"]').click(); await new Promise(r=>setTimeout(r,100));
  ok(APRUI.prev&&APRUI.prev.bloques.length===1&&APRUI.prev.bloques[0].pasos.length===4,"«Entender» ordena y entiende lo dictado (1 bloque, 4 pasos)");
  return {fallas,errs:(window.__errs||[]).slice()};
};
