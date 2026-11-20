"use strict";
/* ============================================================
   DICTADO · dicta tu clase en voz alta y la app la convierte en bloques y ejercicios
   - Botón 🎤: usa el reconocimiento de voz del navegador (Chrome / Android / Safari reciente).
   - Si el navegador no lo tiene: dicta con el micrófono del teclado del iPhone dentro del cuadro de texto.
   - En los dos casos el texto hablado (todo seguido, sin renglones) se ordena solo:
     "bloque uno tren superior con mancuernas, caminas hasta plancha, luego toques de hombro diez..."
     → BLOQUE 1 – TREN SUPERIOR (mancuernas) / 1 paso por renglón, y se aprende como una clase pegada.
   - Mientras hablas ves en vivo lo que va entendiendo, y puedes corregir con la voz: «borra eso».
   ============================================================ */

const DICT_NUM={cero:0,un:1,uno:1,una:1,dos:2,tres:3,cuatro:4,cinco:5,seis:6,siete:7,ocho:8,nueve:9,diez:10,once:11,doce:12,trece:13,catorce:14,quince:15,
  dieciseis:16,diecisiete:17,dieciocho:18,diecinueve:19,veinte:20,veintiuno:21,veintidos:22,veintitres:23,veinticuatro:24,veinticinco:25,veintiseis:26,
  veintisiete:27,veintiocho:28,veintinueve:29,treinta:30,cuarenta:40,cincuenta:50,sesenta:60,setenta:70,ochenta:80,noventa:90,cien:100};
const DICT_DECENAS={treinta:30,cuarenta:40,cincuenta:50,sesenta:60,setenta:70,ochenta:80,noventa:90};
const DICT_ORD={primer:1,primero:1,primera:1,segundo:2,segunda:2,tercer:3,tercero:3,tercera:3,cuarto:4,cuarta:4,quinto:5,quinta:5,sexto:6,sexta:6};
function dictSinAcento(s){ return s.normalize("NFD").replace(/[\u0300-\u036f]/g,""); }
/* "treinta y cinco" → 35, "veinticinco" → 25, "diez" → 10 */
function dictNumeros(t){
  t=t.replace(/\b(treinta|cuarenta|cincuenta|sesenta|setenta|ochenta|noventa)\s+y\s+(uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve)\b/gi,(m,a,b)=>String(DICT_DECENAS[dictSinAcento(a).toLowerCase()]+DICT_NUM[dictSinAcento(b).toLowerCase()]));
  return t.replace(/\b[a-záéíóúñ]+\b/gi,w=>{ const k=dictSinAcento(w).toLowerCase(); if(k==="un"||k==="una") return w; return DICT_NUM[k]!=null?String(DICT_NUM[k]):w; });
}
/* lo que el micrófono suele escuchar mal en una clase de fitness */
const DICT_FIX=[
  [/\b(blog|bloc|bloke|bloq)\b/gi,"bloque"],
  [/\b(aps|apps|abds|ab)\b/gi,"abs"],
  [/\b(jold|hol|hool|holt|jol)\b/gi,"hold"],
  [/\b(jolou|jalou|holou|hollo)\b/gi,"hollow"],
  [/\b(?:a la|hasta la|hasta el|al)\s+(?:faya|falla|fallo)\b/gi,"a la falla"],
  [/\bclan ?shell|clam ?shell|clamchel|klamshell/gi,"clamshell"],
  [/\b(donki|donqui)\b/gi,"donkey"],
  [/\brus(?:s)?ian\s+t(?:w|u)ist\b|\brusian\b/gi,"russian twist"],
  [/\bded\s+bag\b|\bdead\s+buck\b|\bded\s+bug\b/gi,"dead bug"],
  [/\bbird\s+dog\b|\bberd\s+dog\b|\bbur\s+dog\b/gi,"bird dog"],
  [/\bfire\s+hidrant\b|\bfaier\s+hydrant\b|\bfire\s+haidrant\b/gi,"fire hydrant"],
  [/\bplank\b/gi,"plancha"],
  [/\bsquat\b/gi,"sentadilla"],
  [/\bpulso(s)? de\b/gi,"pulsos"],
  [/\bsegs?\b/gi,"segundos"],
  [/\brepeticiones\b/gi,"reps"],
];
/* ¿el texto parece dictado (todo seguido) y no escrito por renglones? */
function dictPareceHablado(t){ const l=String(t||"").split(/\r?\n/).filter(x=>x.trim()).length; return String(t||"").length>60&&l<=3; }
/* texto hablado → texto por renglones que entiende aprParsear */
function dictOrdenar(texto){
  let t=" "+String(texto||"").replace(/\s+/g," ")+" ";
  DICT_FIX.forEach(([re,s])=>{ t=t.replace(re,s); });
  t=dictNumeros(t);
  // "veinticinco a treinta pulsos" → 25-30
  t=t.replace(/\b(\d{1,2})\s+(?:a|o)\s+(\d{1,2})\b(?=\s*(pulsos|segundos|reps|$|[,.]|\s(?:luego|despu)))/gi,"$1-$2");
  // comandos de voz para corregir
  t=t.replace(/\s(?:borra(?:r)?|quita(?:r)?)\s+(?:eso|lo [uú]ltimo|el [uú]ltimo(?: ejercicio)?)\b[,.]?|\sme equivoqu[eé]\b[,.]?/gi,"\n§DEL\n");
  // bloques: «bloque 2», «segundo bloque», «bloque de pierna», «siguiente bloque» (se numeran solos si no dices el número)
  t=t.replace(/\s(?:el\s)?(primer|primero|primera|segundo|segunda|tercer|tercero|tercera|cuarto|cuarta|quinto|quinta|sexto|sexta)\s+bloque\b\s*[,.:;-]?\s*/gi,(m,o)=>"\n§B"+DICT_ORD[dictSinAcento(o).toLowerCase()]+" ");
  t=t.replace(/\s(?:el\s)?bloque\s+(?:n[uú]mero\s+)?(\d+)\s*[,.:;-]?\s*/gi,"\n§B$1 ");
  t=t.replace(/\s(?:el\s|un\s|otro\s|nuevo\s|siguiente\s)?bloque\b(?:\s+de)?\s*[,.:;-]?\s*/gi,"\n§B? ");
  let nb=0; t=t.replace(/§B(\d+|\?)/g,(m,n)=>{ nb=n==="?"?nb+1:+n; return "§B"+nb; });
  t=t.replace(/\s(?:el\s|y\s)?reto(?: final)?\b\s*[,.:;-]?\s*/gi,"\nRETO FINAL: ");
  t=t.replace(/\s(?:el\s|y\s)?(cierre|para cerrar|calentamiento|relajaci[oó]n final)\b\s*[,.:;-]?\s*/gi,(m,k)=>"\n"+(/calent/i.test(k)?"CALENTAMIENTO":"CIERRE")+": ");
  t=t.replace(/\s(?:empiezas?\s(?:con el |por el )?)?(?:lado a|lado derecho)\s*[,.:;-]?\s*/gi,"\nLado A:\n");
  t=t.replace(/\s(?:y\s)?(?:cambias? de lado|cambio de lado|cambiamos de lado|lado b|lado izquierdo)\s*[,.:;-]?\s*/gi,"\nCambias de lado:\n");
  // separadores de pasos: lo que dice una instructora al pasar al siguiente ejercicio
  t=t.replace(/\s*(?:[.;]|,?\s(?:y\s)?(?:luego|despu[eé]s|siguiente(?: ejercicio)?|enseguida|ahora|seguimos con|pasamos a|otro ejercicio)\b|\s(?:ejercicio|n[uú]mero|paso)\s+\d+\b|\spunto(?: y aparte)?\b)\s*/gi,"\n");
  // título del bloque: solo las palabras del grupo muscular + el material ("tren superior con mancuernas de 5 kilos");
  // lo que sigue ya es el primer ejercicio aunque no hayas hecho pausa
  t=t.replace(/§B(\d+)\s*([^\n]*)/g,(m,n,resto)=>{
    const pal=resto.replace(/^[,\s]+/,"").split(/\s+/).filter(Boolean), tit=[], eq=[]; let i=0;
    const norm=w=>dictSinAcento(w||"").toLowerCase().replace(/[,.]/g,"");
    const GRUPO=/^(tren|superior|inferior|pierna|piernas|gluteo|gluteos|abs|abdomen|abdominales|core|brazo|brazos|hombro|hombros|espalda|pecho|planchas?|cuadriceps|isquios|full|body|y|e|parte|alta|baja)$/;
    const MAT=/^(mancuernas?|liga|ligas|polainas?|cubo|silla|pelota|peso|corporal|la|el|las|los|\d+|kilos?|kg|y|de)$/;
    while(i<pal.length&&GRUPO.test(norm(pal[i]))){ tit.push(pal[i]); if(/[,.]$/.test(pal[i++])) break; }
    while(tit.length&&/^(y|e)$/i.test(tit[tit.length-1])){ tit.pop(); i--; }
    if(i<pal.length&&/^(con|de)$/i.test(pal[i])&&MAT.test(norm(pal[i+1]))){ i++; while(i<pal.length&&MAT.test(norm(pal[i]))&&!(/^[0-9]+$/.test(pal[i])&&!/^(kilos?|kg)/i.test(pal[i+1]||""))){ eq.push(pal[i]); if(/[,.]$/.test(pal[i++])) break; } }
    while(eq.length&&/^(y|de|la|el)$/i.test(eq[eq.length-1])) { eq.pop(); i--; }
    const titulo=tit.join(" ").replace(/[,.]$/,"").toUpperCase()+(eq.length?" ("+eq.join(" ").replace(/[,.]$/,"").toLowerCase()+")":"");
    return "BLOQUE "+n+" – "+(titulo||"BLOQUE")+"\n"+pal.slice(i).join(" ").replace(/^[,\s]+/,"");
  });
  const out=[];
  t.split("\n").map(l=>l.replace(/^[\s,]+|[\s,]+$/g,"").replace(/^(y|e|con)\s+/i,"")).filter(Boolean).forEach(l=>{
    if(l==="§DEL"){ for(let k=out.length-1;k>=0;k--){ if(!/^(BLOQUE|RETO|CIERRE|CALENTAMIENTO|Lado|Cambias)/.test(out[k])){ out.splice(k,1); break; } } return; }   // «borra eso»: quita el último ejercicio
    l=l.replace(/\s(?:por|x)\s?(\d{1,2})$/i," x$1");   // "crunch con pausa por doce" = x12
    // "toques de hombro 10" (número al final, dicho de corrido) = 10 repeticiones
    if(!/^(BLOQUE|RETO|CIERRE|CALENTAMIENTO|Lado|Cambias)/i.test(l)&&!/pulso|segundo|hold|falla|por lado|por pierna|-\d/i.test(l)) l=l.replace(/\s(\d{1,2})$/," x$1");
    out.push(l.charAt(0).toUpperCase()+l.slice(1));
  });
  return out.join("\n");
}

/* ---------- micrófono ---------- */
const DICT={rec:null,on:false,prev:"",sesion:"",parcial:"",t0:0,timer:null};
function dictSoportado(){ return !!(window.SpeechRecognition||window.webkitSpeechRecognition); }
function dictTextoCompleto(){ return [DICT.prev,DICT.sesion,DICT.parcial].filter(Boolean).join(" ").replace(/\s+/g," ").trim(); }
/* algunos Android repiten lo ya dicho dentro de cada resultado nuevo: se queda solo con la versión más larga */
function dictUnirFinales(lista){
  const out=[]; lista.forEach(x=>{ x=x.trim(); if(!x) return; const ult=out[out.length-1]; if(ult&&x.toLowerCase().startsWith(ult.toLowerCase())) out[out.length-1]=x; else if(!(ult&&ult.toLowerCase().endsWith(x.toLowerCase()))) out.push(x); });
  return out.join(" ");
}
/* lo que va entendiendo, en vivo, mientras hablas */
function dictVivoHtml(){
  const txt=dictTextoCompleto(); if(!txt) return `<span class="hint">Empieza: «Bloque uno, tren superior con mancuernas…»</span>`;
  const p=aprParsear(dictOrdenar(txt),state.cfg.base||8), ult=p.bloques[p.bloques.length-1], paso=ult&&ult.pasos[ult.pasos.length-1];
  return `<div class="dict-vivo-blq">${p.bloques.map(b=>`<span class="chip">${esc(b.titulo||ARM_NOM[b.bk]||b.bk)} · ${b.pasos.length}</span>`).join("")}</div>${paso?`<div class="hint" style="margin:6px 0 0">Último: <b>${esc(paso.nombre)}</b> · ${esc((estQTxt(paso.q).n+" "+estQTxt(paso.q).u).trim())}</div>`:""}`;
}
function dictPintar(){
  APRUI.txt=dictTextoCompleto();
  const ta=document.querySelector(".apr-txt"); if(ta){ ta.value=APRUI.txt; ta.scrollTop=ta.scrollHeight; }
  const v=document.getElementById("dict-vivo"); if(v) v.innerHTML=dictVivoHtml();
}
function dictEmpezar(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition; if(!SR){ toast("Aquí no puedo escuchar: toca el micrófono del teclado y habla dentro del cuadro"); const ta=document.querySelector(".apr-txt"); if(ta) ta.focus(); return; }
  const rec=new SR(); rec.lang="es-MX"; rec.continuous=true; rec.interimResults=true; rec.maxAlternatives=1;
  DICT.rec=rec; DICT.on=true; DICT.prev=(APRUI.txt||"").trim(); DICT.sesion=""; DICT.parcial=""; DICT.t0=Date.now();
  rec.onresult=ev=>{ const fin=[]; let tmp=""; for(let i=0;i<ev.results.length;i++){ const r=ev.results[i]; if(r.isFinal) fin.push(r[0].transcript); else tmp+=r[0].transcript; }
    DICT.sesion=dictUnirFinales(fin); DICT.parcial=tmp.trim(); dictPintar(); };
  rec.onerror=ev=>{ if(ev.error==="not-allowed"||ev.error==="service-not-allowed"){ DICT.on=false; toast("Permite el micrófono para dictar"); render(); } };
  // el navegador corta tras un silencio: lo dicho se guarda y sigue escuchando hasta que tú lo detienes
  rec.onend=()=>{ DICT.prev=[DICT.prev,DICT.sesion,DICT.parcial].filter(Boolean).join(" ").trim(); DICT.sesion=""; DICT.parcial="";   // ni lo que aún no se confirmaba se pierde
    if(DICT.on){ try{ rec.start(); return; }catch(e){} } DICT.on=false; clearInterval(DICT.timer); render(); };
  try{ rec.start(); }catch(e){ DICT.on=false; toast("No se pudo abrir el micrófono"); return; }
  clearInterval(DICT.timer); DICT.timer=setInterval(()=>{ const el=document.getElementById("dict-reloj"); if(el){ const s=Math.floor((Date.now()-DICT.t0)/1000); el.textContent=Math.floor(s/60)+":"+String(s%60).padStart(2,"0"); } },1000);
  render();
}
function dictDetener(){
  const txt=dictTextoCompleto(); DICT.on=false; clearInterval(DICT.timer); try{ DICT.rec&&DICT.rec.stop(); }catch(e){}
  DICT.prev=""; DICT.sesion=""; DICT.parcial="";
  APRUI.txt=txt?dictOrdenar(txt):(APRUI.txt||"");
  render(); if(APRUI.txt) apClick("ap-entender");
}
function dictBotonesHtml(){
  if(DICT.on) return `<div class="dict-on"><div class="dict-top"><span class="dict-rec"></span><b>Escuchando</b><span class="num hint" id="dict-reloj">0:00</span><button class="btn primary" data-action="ap-dict-parar">⏹ Terminé</button></div>
    <div id="dict-vivo" class="dict-vivo">${dictVivoHtml()}</div>
    <p class="hint" style="margin:6px 0 0">Di «bloque uno, pierna con silla…», «luego…», «lado A», «cambias de lado», «reto final», «cierre». ¿Te equivocaste? Di «borra eso».</p></div>`;
  return `<div class="acts" style="margin:8px 0 0"><button class="btn" data-action="ap-dict-mic">🎤 Dictar mi clase</button>${APRUI.txt&&dictPareceHablado(APRUI.txt)?`<button class="btn ghost" data-action="ap-dict-ordenar">Ordenar lo dictado</button>`:""}</div>
    <details class="dict-ayuda"><summary>¿Cómo dictar?</summary><p class="hint">Habla como das la clase, de corrido:<br><i>«Bloque uno, tren superior con mancuernas. Caminas hasta plancha, luego toques de hombro diez, luego hold de plancha quince segundos… Segundo bloque, pierna con silla. Diez sentadillas, luego hold treinta segundos, luego pulsos veinticinco a treinta, luego hold a la falla. Bloque de glúteo con liga, lado A, clamshell, luego… cambias de lado… Reto final, hollow a la falla. Cierre, reflexión guiada.»</i><br>Si el micrófono no abre (algunos iPhone), toca el cuadro de texto, usa el 🎤 del teclado y al final toca «Entender esta clase».</p></details>`;
}
/* se engancha a la pantalla "Mi formato" sin reescribirla */
(function(){
  const vf=viewFormato;
  viewFormato=function(){ return vf().replace('<div class="acts" style="margin-top:12px"><button class="btn primary" data-action="ap-entender">',dictBotonesHtml()+'<div class="acts" style="margin-top:12px"><button class="btn primary" data-action="ap-entender">')
    .replace("Pega el texto de una clase tuya (como lo escribes en tus notas)","Díctala con 🎤 o pega el texto de una clase tuya (como lo escribes en tus notas)"); };
  const ac=apClick;
  apClick=function(a,t){
    if(a==="ap-dict-mic"){ dictEmpezar(); return true; }
    if(a==="ap-dict-parar"){ dictDetener(); return true; }
    if(a==="ap-dict-ordenar"){ const ta=document.querySelector(".apr-txt"); APRUI.txt=dictOrdenar(ta?ta.value:APRUI.txt); render(); return true; }
    if(a==="ap-entender"){ const ta=document.querySelector(".apr-txt"), v=(ta&&ta.value)||APRUI.txt; if(dictPareceHablado(v)){ APRUI.txt=dictOrdenar(v); if(ta) ta.value=APRUI.txt; } }   // lo dictado con el teclado del iPhone también se ordena solo
    return ac(a,t);
  };
})();
