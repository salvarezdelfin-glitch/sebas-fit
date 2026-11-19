"use strict";
/* ============================================================
   DICTADO · dicta tu clase en voz alta y la app la convierte en bloques y ejercicios
   - Botón 🎤: usa el reconocimiento de voz del navegador (Chrome / Android / Safari reciente).
   - Si el navegador no lo tiene: dicta con el micrófono del teclado del iPhone dentro del cuadro de texto.
   - En los dos casos el texto hablado (todo seguido, sin renglones) se ordena solo:
     "bloque uno tren superior con mancuernas, caminas hasta plancha, luego toques de hombro diez..."
     → BLOQUE 1 – TREN SUPERIOR (mancuernas) / 1 paso por renglón, y se aprende como una clase pegada.
   ============================================================ */

const DICT_NUM={cero:0,un:1,uno:1,una:1,dos:2,tres:3,cuatro:4,cinco:5,seis:6,siete:7,ocho:8,nueve:9,diez:10,once:11,doce:12,trece:13,catorce:14,quince:15,
  dieciseis:16,diecisiete:17,dieciocho:18,diecinueve:19,veinte:20,veintiuno:21,veintidos:22,veintitres:23,veinticuatro:24,veinticinco:25,veintiseis:26,
  veintisiete:27,veintiocho:28,veintinueve:29,treinta:30,cuarenta:40,cincuenta:50,sesenta:60,setenta:70,ochenta:80,noventa:90,cien:100};
const DICT_DECENAS={treinta:30,cuarenta:40,cincuenta:50,sesenta:60,setenta:70,ochenta:80,noventa:90};
function dictSinAcento(s){ return s.normalize("NFD").replace(/[\u0300-\u036f]/g,""); }
/* "treinta y cinco" → 35, "veinticinco" → 25, "diez" → 10 */
function dictNumeros(t){
  t=t.replace(/\b(treinta|cuarenta|cincuenta|sesenta|setenta|ochenta|noventa)\s+y\s+(uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve)\b/gi,(m,a,b)=>String(DICT_DECENAS[dictSinAcento(a).toLowerCase()]+DICT_NUM[dictSinAcento(b).toLowerCase()]));
  return t.replace(/\b[a-záéíóúñ]+\b/gi,w=>{ const k=dictSinAcento(w).toLowerCase(); if(k==="un"||k==="una") return w; return DICT_NUM[k]!=null?String(DICT_NUM[k]):w; });
}
/* ¿el texto parece dictado (todo seguido) y no escrito por renglones? */
function dictPareceHablado(t){ const l=String(t||"").split(/\r?\n/).filter(x=>x.trim()).length; return t.length>60&&l<=3; }
/* texto hablado → texto por renglones que entiende aprParsear */
function dictOrdenar(texto){
  let t=" "+String(texto||"").replace(/\s+/g," ")+" ";
  t=t.replace(/\b(jold|hol|hool|holt)\b/gi,"hold").replace(/\bpulso(s)? de\b/gi,"pulsos").replace(/\bsegs?\b/gi,"segundos");
  t=dictNumeros(t);
  // marcas de estructura
  t=t.replace(/\s(?:el\s)?bloque\s+(?:n[uú]mero\s+)?(\d+)\s*[,.:;-]?\s*/gi,"\n§B$1 ");
  t=t.replace(/\s(?:el\s)?reto final\s*[,.:;-]?\s*/gi,"\nRETO FINAL: ");
  t=t.replace(/\s(?:el\s)?(cierre|calentamiento)\s*[,.:;-]?\s*/gi,(m,k)=>"\n"+k.toUpperCase()+": ");
  t=t.replace(/\s(?:empiezas? (?:con el |por el )?)?lado a\s*[,.:;-]?\s*/gi,"\nLado A:\n");
  t=t.replace(/\s(?:y\s)?(?:cambias? de lado|cambio de lado|lado b)\s*[,.:;-]?\s*/gi,"\nCambias de lado:\n");
  // separadores de pasos: lo que dice una instructora al pasar al siguiente ejercicio
  t=t.replace(/\s*(?:[.;]|,?\s(?:y\s)?(?:luego|despu[eé]s|siguiente(?: ejercicio)?|enseguida|ahora)\b|\s(?:ejercicio|n[uú]mero|paso)\s+\d+\b|\spunto(?: y aparte)?\b)\s*/gi,"\n");
  // título del bloque: solo las palabras del grupo muscular + el material ("tren superior con mancuernas de 5 kilos");
  // lo que sigue ya es el primer ejercicio aunque no hayas hecho pausa
  t=t.replace(/§B(\d+)\s+([^\n]*)/g,(m,n,resto)=>{
    const pal=resto.replace(/^[,\s]+/,"").split(/\s+/), tit=[], eq=[]; let i=0;
    const GRUPO=/^(tren|superior|inferior|pierna|piernas|gluteo|gluteos|abs|abdomen|abdominales|core|brazo|brazos|hombro|hombros|espalda|pecho|planchas?|cuadriceps|isquios|full|body|y|e|parte|alta|baja)$/;
    const MAT=/^(mancuernas?|liga|ligas|polainas?|cubo|silla|pelota|peso|corporal|la|el|las|los|\d+|kilos?|kg|y|de)$/;
    while(i<pal.length&&GRUPO.test(dictSinAcento(pal[i]).toLowerCase().replace(/[,.]/g,""))){ tit.push(pal[i]); if(/[,.]$/.test(pal[i++])) break; }
    if(i<pal.length&&/^(con|de)$/i.test(pal[i])&&MAT.test(dictSinAcento(pal[i+1]||"").toLowerCase().replace(/[,.]/g,""))){ i++; while(i<pal.length&&MAT.test(dictSinAcento(pal[i]).toLowerCase().replace(/[,.]/g,""))&&!(/^[0-9]+$/.test(pal[i])&&!/^(kilos?|kg)/i.test(pal[i+1]||""))){ eq.push(pal[i]); if(/[,.]$/.test(pal[i++])) break; } }
    while(eq.length&&/^(y|de|la|el)$/i.test(eq[eq.length-1])) { eq.pop(); i--; }
    const titulo=tit.join(" ").replace(/[,.]$/,"").toUpperCase()+(eq.length?" ("+eq.join(" ").replace(/[,.]$/,"").toLowerCase()+")":"");
    return "BLOQUE "+n+" – "+(titulo||"BLOQUE")+"\n"+pal.slice(i).join(" ").replace(/^[,\s]+/,"");
  });
  const lineas=t.split("\n").map(l=>l.replace(/^[\s,]+|[\s,]+$/g,"")).filter(Boolean).map(l=>{
    l=l.replace(/\s(?:por|x)\s?(\d{1,2})$/i," x$1");   // "crunch con pausa por doce" = x12
    // "toques de hombro 10" (número al final, dicho de corrido) = 10 repeticiones
    if(!/^(BLOQUE|RETO|CIERRE|CALENTAMIENTO|Lado|Cambias)/i.test(l)&&!/pulso|segundo|hold|falla|por lado|por pierna/i.test(l)) l=l.replace(/\s(\d{1,2})$/," x$1");
    return l.charAt(0).toUpperCase()+l.slice(1); });
  return lineas.join("\n");
}

/* ---------- micrófono ---------- */
const DICT={rec:null,on:false,base:"",parcial:""};
function dictSoportado(){ return !!(window.SpeechRecognition||window.webkitSpeechRecognition); }
function dictEmpezar(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition; if(!SR){ toast("Este navegador no dicta: toca el micrófono del teclado y habla dentro del cuadro"); const ta=document.querySelector(".apr-txt"); if(ta) ta.focus(); return; }
  const rec=new SR(); rec.lang="es-MX"; rec.continuous=true; rec.interimResults=true;
  DICT.rec=rec; DICT.on=true; DICT.base=(APRUI.txt||"").trim(); DICT.parcial="";
  rec.onresult=ev=>{ let fin="", tmp=""; for(let i=ev.resultIndex;i<ev.results.length;i++){ const r=ev.results[i]; if(r.isFinal) fin+=r[0].transcript+" "; else tmp+=r[0].transcript; }
    if(fin) DICT.base=(DICT.base+" "+fin).trim(); DICT.parcial=tmp; APRUI.txt=(DICT.base+(tmp?" "+tmp:"")).trim();
    const ta=document.querySelector(".apr-txt"); if(ta){ ta.value=APRUI.txt; ta.scrollTop=ta.scrollHeight; } };
  rec.onerror=ev=>{ if(ev.error==="not-allowed"||ev.error==="service-not-allowed") toast("Permite el micrófono para dictar"); };
  rec.onend=()=>{ if(DICT.on){ try{ rec.start(); return; }catch(e){} } DICT.on=false; render(); };   // el navegador corta tras un silencio: sigue escuchando hasta que tú lo detienes
  try{ rec.start(); }catch(e){ DICT.on=false; toast("No se pudo abrir el micrófono"); }
  render();
}
function dictDetener(){
  DICT.on=false; try{ DICT.rec&&DICT.rec.stop(); }catch(e){}
  APRUI.txt=(DICT.base||APRUI.txt||"").trim();
  if(APRUI.txt) APRUI.txt=dictOrdenar(APRUI.txt);
  render(); if(APRUI.txt) apClick("ap-entender");
}
function dictBotonesHtml(){
  return `<div class="acts" style="margin:8px 0 0">${DICT.on?`<button class="btn primary" data-action="ap-dict-parar">⏹ Terminé de dictar</button><span class="hint" style="align-self:center">Escuchando… di «bloque uno…», «luego…», «lado A», «cambias de lado», «reto final», «cierre»</span>`
    :`<button class="btn" data-action="ap-dict-mic">🎤 Dictar mi clase</button>${APRUI.txt&&dictPareceHablado(APRUI.txt)?`<button class="btn ghost" data-action="ap-dict-ordenar">Ordenar lo dictado</button>`:""}`}</div>`;
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
