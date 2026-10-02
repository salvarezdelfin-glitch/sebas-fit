"use strict";
/* ============================================================
   ESTACIONES · la forma real de dar tu clase de Sculpt
   Un bloque = UNA posición trabajada en capas (entrada → hold → pulsos → liga → variante → a la falla),
   glúteo con Lado A completo y luego Lado B, abdomen con 4 movimientos distintos, Reto final y Cierre.
   Cada paso es un ejercicio de la biblioteca (LIB, b:"st") con su cantidad: reps, hold en segundos,
   pulsos o "a la falla". Las cantidades salen de la base (8/10/12) y de la dificultad.
   ============================================================ */

/* ---------- cantidades ---------- */
const EST_DIF={
  ligera:   {hold:.67,pul:.8, extra:0,nom:"Ligera"},
  media:    {hold:1,  pul:1,  extra:0,nom:"Media"},
  pesada:   {hold:1.33,pul:1.2,extra:0,nom:"Pesada"},
  muypesada:{hold:1.5,pul:1.4,extra:1,nom:"Muy pesada"},
};
function estDif(k){ return EST_DIF[k]||EST_DIF.media; }
function r5(n){ return n>=20?Math.round(n/5)*5:Math.round(n); }
/* q (plantilla) → cantidad concreta */
function estQ(q,base,difKey){
  const d=estDif(difKey), o={t:q.t};
  if(q.t==="reps"){ o.n=q.n||Math.round(base*(q.f||1)); }
  else if(q.t==="pulsos"){ o.n=r5(Math.min(40,base*(q.f||3)*d.pul)); }
  else if(q.t==="hold"){ o.s=Math.max(10,Math.round(q.s*d.hold/5)*5); }
  if(q.por) o.por=q.por;
  if(q.nota) o.nota=q.nota;
  return o;
}
function estQTxt(q){
  if(!q) return null;
  if(q.t==="reps") return {n:q.n,u:"reps"+(q.por?" "+q.por:"")};
  if(q.t==="pulsos") return {n:q.n,u:"pulsos"+(q.por?" "+q.por:"")};
  if(q.t==="hold") return q.s>=90?{n:Math.round(q.s/60)+" min",u:"· guiada"}:{n:q.s,u:"s · hold"+(q.por?" "+q.por:"")};
  if(q.t==="falla") return {n:"A la falla",u:""};
  return {n:"—",u:"transición"};
}
function estSegundos(q,base){
  if(!q) return 60;
  if(q.t==="trans") return 35;
  if(q.t==="falla") return 110;
  if(q.t==="hold") return 50+q.s;
  if(q.t==="pulsos") return 55+(q.n||20)*1.2;
  return 55+(q.n||base)*(q.por?4.5:3);
}

/* ---------- registro de pasos en la biblioteca ---------- */
const EST_ANCHORS={};   // id → {blk,nom,eq,pos,lados,layers:[ids]}
let EST_SEQ=0;
/* P(id, nombre, bloque, ancla, capa, material, posición, q, cue, extra) */
function P(id,nom,blk,anchor,layer,eq,f,q,cue,o){
  o=o||{};
  const pat=q.t==="hold"||q.t==="falla"?"iso":q.t==="pulsos"?"pulsos":"reps";
  const e=Object.assign({id:"st_"+id,b:"st",blk,anchor,layer,nom,eq,pat,tempo:null,lado:false,f,comp:0,cue:cue||"",q,tr:o.tr||"",ord:EST_SEQ++},o);
  delete e.tr; e.tr=o.tr||"";
  LIB.push(e); byId[e.id]=e;
  const A=EST_ANCHORS[anchor]||(EST_ANCHORS[anchor]={id:anchor,blk,eq,pos:f,lados:!!o.lados,layers:[],anchorNom:o.anchorNom||nom});
  if(layer!=="x") A.layers.push(e.id);
  return e;
}
const Qr=(f,x)=>Object.assign({t:"reps",f},x||{}), Qn=(n,x)=>Object.assign({t:"reps",n},x||{}), Qh=(s,x)=>Object.assign({t:"hold",s},x||{}), Qp=(f,x)=>Object.assign({t:"pulsos",f},x||{}), QF={t:"falla"}, QT={t:"trans"};

/* ====== TREN SUPERIOR (mancuernas) ====== */
P("up_ent_manos","Caminas con las manos hasta plancha","up","up_ent","entrada","mancuernas",1,QT,"Desde pie, bisagra, camina las manos hasta plancha alta con mancuernas.",{tr:"Bajas a plancha"});
P("up_ent_lag","Bajas a plancha alta y haces 3 lagartijas (en rodillas si hace falta)","up","up_ent","entrada","mancuernas",1,Qn(3),"Cuerpo en tabla; baja el pecho entre las mancuernas.",{tr:"Bajas a plancha"});
P("up_ent_rod","Bajas a plancha y apoyas rodillas con control","up","up_ent","entrada","mancuernas",1,QT,"Mano bajo hombro, core activo; rodillas al piso suave.",{tr:"Bajas a plancha"});
P("up_pl_hombro","Toques de hombro en plancha","up","up_pl","trabajo","mancuernas",1,Qn(10,{nota:"5 por lado"}),"Cadera quieta, toca el hombro contrario sin balancear.");
P("up_pl_remo","Remo alterno con mancuerna en plancha","up","up_pl","trabajo","mancuernas",1,Qn(10,{nota:"5 por lado"}),"Cadera cuadrada, tira el codo al bolsillo.");
P("up_pl_arrastre","Arrastre de mancuerna en plancha","up","up_pl","trabajo","mancuernas",1,Qn(10,{nota:"5 por lado"}),"Pasa la mancuerna por debajo del cuerpo sin girar la cadera.");
P("up_pl_remo_lag","Lagartija con remo","up","up_pl","trabajo","mancuernas",1,Qn(8),"Baja, sube y remas una mancuerna; alterna lado.");
P("up_hold_alta","Hold de plancha alta","up","up_hold","hold","peso corporal",1,Qh(10),"Hombros sobre manos, glúteos apretados.");
P("up_hold_ante","Hold de plancha en antebrazos","up","up_hold","hold","peso corporal",1,Qh(15),"Codos bajo hombros, cuerpo en línea.");
P("up_hold_rod","Hold de plancha con mancuernas, rodillas al pecho alternas","up","up_hold","hold","mancuernas",1,Qh(15),"Controla la cadera mientras alternas.");
P("up_reg_pie","Caminas de regreso y subes a pie","up","up_reg","regreso","mancuernas",0,QT,"Caminas las manos hacia los pies y subes vertebra por vértebra.",{tr:"Subes a pie"});
P("up_reg_mancs","Subes a pie con las mancuernas","up","up_reg","regreso","mancuernas",0,QT,"Pasos cortos, sube con el pecho abierto.",{tr:"Subes a pie"});
// de pie — tríos con sentido (hombro / espalda y brazo / brazos)
P("up_s_lat","Laterales con mancuerna","up","up_s_hombro","s1","mancuernas",0,Qr(1.25),"Codos suaves, sube hasta la altura del hombro sin encoger el cuello.");
P("up_s_fro","Frontales con mancuerna","up","up_s_hombro","s2","mancuernas",0,Qr(1.25),"Brazos al frente hasta el hombro, sin balanceo.");
P("up_s_pre","Press de hombro con mancuerna","up","up_s_hombro","s3","mancuernas",0,Qr(1.25),"Costillas abajo, no arquees la lumbar.");
P("up_s_remoinc","Remo inclinado con ambas mancuernas","up","up_s_espalda","s1","mancuernas",0,Qr(1.25),"Bisagra de cadera, espalda larga, tira los codos atrás.");
P("up_s_curlpress","Curl de bíceps a press de hombro (un solo movimiento)","up","up_s_espalda","s2","mancuernas",0,Qr(1.25),"Sube el curl y sin pausa empuja al techo.");
P("up_s_y","Aperturas en «Y» inclinado hacia adelante","up","up_s_espalda","s3","mancuernas",0,Qr(1.25),"Brazos en Y, junta escápulas, cuello largo.");
P("up_s_martillo","Curl martillo con mancuerna","up","up_s_brazos","s1","mancuernas",0,Qr(1.25),"Codos pegados al torso, agarre neutro.");
P("up_s_tri","Extensión de tríceps sobre la cabeza","up","up_s_brazos","s2","mancuernas",0,Qr(1.25),"Codos hacia el techo, baja detrás de la cabeza.");
P("up_s_patada","Patada de tríceps inclinado","up","up_s_brazos","s3","mancuernas",0,Qr(1.25),"Brazo pegado al torso, extiende y aprieta.");
P("up_s_arnold","Press Arnold","up","up_s_mix","s1","mancuernas",0,Qr(1.25),"Gira las palmas al subir, controla la bajada.");
P("up_s_mentón","Remo al mentón con mancuernas","up","up_s_mix","s2","mancuernas",0,Qr(1.25),"Codos arriba, mancuernas cerca del cuerpo.");
P("up_s_pajaros","Pájaros inclinados","up","up_s_mix","s3","mancuernas",0,Qr(1.25),"Abre los brazos con codos suaves, junta escápulas.");

/* ====== PIERNA ====== */
/* L(ancla, nombre, material, posición, [entrada, hold, pulsos, liga, varA, varB, falla]) */
function legAnchor(id,anchorNom,eq,t){
  // t: {ent:[nom,q,cue], hold:[nom,cue], pul:[nom,q,cue], liga:[nom,q,cue], vA:[nom,q,cue], vB:[nom,q,cue], falla:[nom,cue]}
  const o={anchorNom,lados:false};
  P(id+"_ent",t.ent[0],"leg",id,"entrada",eq,0,t.ent[1],t.ent[2],o);
  P(id+"_hold",t.hold[0],"leg",id,"hold",eq,0,Qh(30),t.hold[1],o);
  P(id+"_pul",t.pul[0],"leg",id,"pulsos",eq,0,t.pul[1],t.pul[2],o);
  if(t.liga) P(id+"_liga",t.liga[0],"leg",id,"liga","liga",0,t.liga[1],t.liga[2],o);
  if(t.vA) P(id+"_vA",t.vA[0],"leg",id,"varA",t.vA[3]||eq,0,t.vA[1],t.vA[2],o);
  if(t.vB) P(id+"_vB",t.vB[0],"leg",id,"varB",t.vB[3]||eq,0,t.vB[1],t.vB[2],o);
  P(id+"_falla",t.falla[0],"leg",id,"falla",eq,0,QF,t.falla[1],o);
}
legAnchor("silla","Sentadilla a la silla","cubo",{
  ent:["Sentadillas para bajar a la silla",Qr(1),"Cadera atrás hasta rozar la silla; sube empujando el piso."],
  hold:["Hold puro abajo, sentada en la silla","Peso en talones, espalda larga, rodillas sobre los pies."],
  pul:["Pulsos pequeños desde abajo, sin pararte",Qp(3),"Rango corto, tensión constante en cuádriceps y glúteo."],
  liga:["Liga arriba de las rodillas: abres y cierras las piernas",Qp(2.5),"Empuja las rodillas contra la liga sin perder la posición."],
  vA:["Subes y bajas en puntas, sigues en la silla",Qr(2.5),"Talones arriba y abajo con control, rodillas quietas."],
  vB:["Te congelas en puntas y pulsas",Qp(2),"Quédate arriba en puntas y pulsa pequeño."],
  falla:["Hold final a la falla","Aguanta hasta que tiemble; respira constante."]});
legAnchor("sumo","Sentadilla sumo con mancuerna","mancuernas",{
  ent:["Sentadillas sumo con mancuerna al centro",Qr(1.25),"Puntas afuera, baja recto, mancuerna colgando entre las piernas."],
  hold:["Hold abajo en sumo","Rodillas empujando hacia afuera, pecho arriba."],
  pul:["Pulsos pequeños en sumo",Qp(3),"Rango corto, sin subir del todo."],
  liga:["Liga arriba de las rodillas: en sumo empujas las rodillas hacia afuera",Qp(2.5),"Abre contra la liga en cada pulso."],
  vA:["Zancada hacia atrás alterna",Qr(1.25,{por:"por pierna"}),"Paso largo atrás, torso erguido, sube sin impulso.","mancuernas"],
  vB:["En zancada: pulsos de un lado y cambias de lado",Qp(2,{por:"por lado"}),"Rodilla delantera sobre el tobillo, pulsos cortos.","mancuernas"],
  falla:["Hold final en sumo con talones arriba, a la falla","Talones fuera del piso, rodillas abiertas, hasta que no puedas más."]});
legAnchor("goblet","Sentadilla goblet","mancuernas",{
  ent:["Sentadillas goblet con mancuerna al pecho",Qr(1.25),"Codos adentro, baja entre las rodillas con el pecho arriba."],
  hold:["Hold abajo en goblet","Codos entre las rodillas, talones pesados."],
  pul:["Pulsos pequeños en goblet",Qp(3),"Quédate abajo y pulsa en un rango corto."],
  liga:["Liga arriba de las rodillas: goblet con empuje hacia afuera",Qp(2.5),"No dejes que las rodillas se cierren."],
  vA:["Goblet profundo con pausa de 2 segundos",Qr(1),"Pausa abajo sin relajar el torso."],
  vB:["Goblet en puntas: pulsos con talones arriba",Qp(2),"Sube a puntas y pulsa; equilibrio con el core."],
  falla:["Hold final en goblet a la falla","Aguanta abajo con la mancuerna hasta que tiemble."]});
legAnchor("pared","Sentadilla en pared","peso corporal",{
  ent:["Sentadillas con la espalda en la pared",Qr(1.25),"Baja hasta muslos paralelos, espalda pegada."],
  hold:["Hold en pared (wall sit)","Muslos paralelos, peso en talones."],
  pul:["Pulsos pequeños dentro del wall sit",Qp(3),"Sube y baja pocos centímetros."],
  liga:["Wall sit con liga sobre las rodillas: abres y cierras",Qp(2.5),"Rodillas abren contra la liga."],
  vA:["Subes y bajas en puntas en el wall sit",Qr(2.5),"Talones arriba y abajo sin mover la espalda."],
  vB:["Congelas en puntas y pulsas",Qp(2),"Arriba en puntas, pulsos pequeños."],
  falla:["Wall sit final a la falla","Aguanta hasta que tiemble."]});
legAnchor("rdl","Peso muerto rumano","mancuernas",{
  ent:["Peso muerto rumano con mancuernas",Qr(1.25),"Cadera atrás, mancuernas pegadas a las piernas, espalda larga."],
  hold:["Hold a media bajada del rumano","Aguanta con isquios activos, rodillas suaves."],
  pul:["Pulsos cortos en la bajada",Qp(2.5),"Rango corto, siente el isquio."],
  vA:["Rumano a una pierna con mancuerna",Qr(1,{por:"por lado"}),"Cadera cuadrada, pierna libre atrás en línea."],
  vB:["Buenos días con mancuerna al pecho",Qr(1.25),"Bisagra pura; espalda neutra."],
  falla:["Hold final de bisagra a la falla","Aguanta la posición con peso en talones."]});
// unilaterales (se hacen Lado A completo y luego Lado B)
function legUni(id,anchorNom,eq,t){
  const o={anchorNom,lados:true};
  P(id+"_ent",t.ent[0],"leg",id,"entrada",eq,0,t.ent[1],t.ent[2],o);
  P(id+"_hold",t.hold[0],"leg",id,"hold",eq,0,Qh(20),t.hold[1],o);
  P(id+"_pul",t.pul[0],"leg",id,"pulsos",eq,0,t.pul[1],t.pul[2],o);
  if(t.falla) P(id+"_falla",t.falla[0],"leg",id,"falla",eq,0,QF,t.falla[1],o);
}
legUni("split","Zancada split","mancuernas",{
  ent:["Zancadas en split (la pierna de adelante trabaja)",Qr(1.25),"Pies fijos, baja recto y sube sin empujar con la de atrás."],
  hold:["Hold abajo en zancada","Rodilla delantera sobre el tobillo, torso erguido."],
  pul:["Pulsos pequeños abajo en zancada",Qp(2),"Rango corto con tensión constante."],
  falla:["Hold final en zancada a la falla","Aguanta hasta que tiemble."]});
legUni("bulgara","Sentadilla búlgara","cubo",{
  ent:["Sentadillas búlgaras con el pie atrás en el cubo",Qr(1),"Torso ligeramente inclinado, baja con control."],
  hold:["Hold abajo en búlgara","Peso en el talón delantero."],
  pul:["Pulsos pequeños en búlgara",Qp(2),"No subas del todo."]});

/* ====== GLÚTEO ====== */
function gluAnchor(id,anchorNom,eq,pos,lados,t){
  const o={anchorNom,lados};
  P(id+"_1",t[0][0],"glu",id,"mov",eq,pos,t[0][1],t[0][2],o);
  P(id+"_2",t[1][0],"glu",id,"iso",eq,pos,t[1][1],t[1][2],o);
  P(id+"_3",t[2][0],"glu",id,"combo",eq,pos,t[2][1],t[2][2],o);
}
gluAnchor("donkey","Cuatro puntos: patada y hydrant","polainas",1,true,[
  ["Patada de glúteo hacia atrás (donkey kick)",Qr(1.25),"Cadera cuadrada, empuja el talón al techo sin arquear la lumbar."],
  ["Isometría arriba: hold con la pierna en alto",Qh(20),"Aprieta glúteo, pierna a la altura de la cadera."],
  ["Fire hydrant + patada hacia atrás",Qr(1.25),"Abre la rodilla al lado y extiende atrás en un solo movimiento."]]);
gluAnchor("clam","Clamshell (acostada de lado)","liga",2,true,[
  ["Clamshell: abres y cierras",Qr(2),"Pies juntos, caderas apiladas, abre sin rotar la pelvis."],
  ["Isometría de clamshell: hold abierto",Qh(20),"Rodilla arriba abierta, aprieta el glúteo medio."],
  ["Clamshell + patada frontal",Qr(1.25),"Abre y extiende la pierna al frente."]]);
gluAnchor("lateral","Elevación lateral acostada","polainas",2,true,[
  ["Elevación lateral de pierna",Qr(1.5),"Pierna recta, punta al frente, sube sin balancear."],
  ["Hold con la pierna arriba",Qh(20),"Aguanta arriba con la cadera apilada."],
  ["Elevación lateral + círculos pequeños",Qp(2),"Círculos cortos hacia atrás sin mover el torso."]]);
gluAnchor("puenteu","Puente a una pierna","peso corporal",2,true,[
  ["Puente a una pierna: sube y baja",Qr(1.25),"Pelvis nivelada, empuja con el talón."],
  ["Hold arriba en puente a una pierna",Qh(20),"Cadera arriba, glúteo apretado."],
  ["Pulsos arriba en puente a una pierna",Qp(2),"Rango corto con la cadera arriba."]]);
gluAnchor("puenteb","Puente de glúteo con liga","liga",2,false,[
  ["Puente de glúteo con liga: sube y baja",Qr(1.5),"Liga sobre las rodillas, abre mientras subes."],
  ["Hold arriba con la liga abierta",Qh(30),"Costillas abajo, glúteo apretado."],
  ["Pulsos arriba con liga",Qp(3),"Pulsos pequeños con la cadera arriba."]]);
gluAnchor("frog","Frog pump","peso corporal",2,false,[
  ["Frog pump: plantas juntas, rodillas abiertas",Qr(2),"Sube la cadera apretando glúteo."],
  ["Hold arriba en frog pump",Qh(20),"Aprieta fuerte, respira."],
  ["Pulsos cortos arriba en frog pump",Qp(3),"Pulsos de pocos centímetros."]]);

/* ====== ABS (mancuernas) — 4 funciones, un movimiento de cada una ====== */
const EST_ABS=[];
function A(id,nom,fn,q,cue,eq,f){ EST_ABS.push(P(id,nom,"abs","abs_"+id,"x",eq||"mancuernas",f==null?2:f,q,cue,{fn})); }
A("a_crunch","Crunch con mancuerna al pecho","anterior",Qr(1.5),"Costillas hacia la pelvis, cuello largo.");
A("a_situp","Sit-up con mancuerna, subes con los brazos arriba","anterior",Qr(1.25),"Sube sin tirar del cuello, baja controlado.");
A("a_crunchinv","Crunch inverso con mancuerna entre los pies","anterior",Qr(1.25),"Sube la cadera del piso con control.");
A("a_russian","Russian twist con mancuerna","rotacion",Qr(2,{nota:"8 por lado"}),"Torso largo, rota desde las costillas.");
A("a_toe","Toe touches con mancuerna, piernas a 90°","rotacion",Qr(1.5),"Lleva la mancuerna a los pies, hombros fuera del piso.");
A("a_bici","Bicicleta lenta y controlada","rotacion",Qr(2.5),"Codo a rodilla contraria sin jalar el cuello.","peso corporal");
A("a_elev","Elevación de piernas con mancuerna entre los pies","inferior",Qr(1.25),"Lumbar pegada, baja lento sin arquear.");
A("a_tijeras","Tijeras bajas","inferior",Qr(2.5),"Lumbar pegada, piernas largas.","peso corporal");
A("a_talones","Toques de talón alternos","inferior",Qr(2.5),"Core activo, rodillas a 90°.","peso corporal");
A("a_dead","Dead bug con mancuerna","estabilidad",Qr(1.25,{nota:"5 por lado"}),"Lumbar pegada, extiende brazo y pierna contrarios.");
A("a_lateral","Plancha lateral con elevación de cadera","estabilidad",Qr(1.25,{por:"por lado"}),"Codo bajo el hombro, cadera sube y baja.","peso corporal",1);
A("a_bird","Bird dog con mancuerna","estabilidad",Qr(1.25,{nota:"5 por lado"}),"Cadera cuadrada, extiende lento.","mancuernas",1);
// planchas (modo core)
const EST_PLK=[];
function PL(id,nom,q,cue){ EST_PLK.push(P(id,nom,"plk","plk_"+id,"x","peso corporal",1,q,cue)); }
PL("p_alta","Hold de plancha alta",Qh(30),"Hombros sobre manos, glúteos apretados.");
PL("p_ante","Hold de plancha en antebrazos",Qh(30),"Codos bajo hombros, cuerpo en línea.");
PL("p_hombro","Plancha con toques de hombro",Qn(16,{nota:"8 por lado"}),"Cadera quieta.");
PL("p_rodilla","Plancha con rodilla al codo",Qn(12,{nota:"6 por lado"}),"Controla la cadera.");
PL("p_lat","Plancha lateral hold",Qh(20,{por:"por lado"}),"Cuerpo en línea, cadera arriba.");
PL("p_mount","Escaladores lentos",Qn(20),"Rodillas al pecho, cadera baja.");

/* ====== RETO FINAL y CIERRE ====== */
const EST_RETO=[];
function R(id,nom,q,cue){ EST_RETO.push(P(id,nom,"reto","reto_"+id,"x","peso corporal",2,q,cue)); }
R("r_hollow","Hueco abdominal (hollow hold): brazos y piernas extendidos, aguantas",QF,"Lumbar pegada al piso; baja las piernas solo hasta donde no se despegue.");
R("r_rock","Hollow hold con balanceo (hollow rock): aguantas lo más posible",QF,"Cuerpo rígido como una banana, balancea sin perder la forma.");
R("r_plank","Plancha alta a la falla",QF,"Cuerpo en línea hasta que no puedas más.");
R("r_vsit","Bote (V-sit) hold a la falla",QF,"Pecho abierto, piernas y torso formando una V.");
R("r_lat","Plancha lateral a la falla",QF,"Cadera arriba, cuerpo en línea; después cambias de lado.");
const EST_CIERRE=[
  P("c_refl","Reflexión guiada: respiración y agradecimiento","cierre","cierre","x","peso corporal",2,Qh(120),"Acostada, ojos cerrados, manos en el abdomen. Respira profundo y suelta la clase.",{tr:"Te acuestas"}),
  P("c_song","2–3 canciones de relajación","cierre","cierre","x","peso corporal",2,QT,"Música suave (60–75 BPM) mientras estiran y relajan.",{tr:"Pones música suave"}),
  P("c_nino","Postura del niño y estiramiento de espalda","cierre","cierre","x","peso corporal",2,Qh(45),"Cadera a talones, brazos largos al frente.",{}),
  P("c_mariposa","Mariposa o estiramiento de cadera","cierre","cierre","x","peso corporal",2,Qh(45),"Plantas juntas, rodillas caen sin forzar.",{}),
];

/* ============================================================
   GENERADOR
   ============================================================ */
const EST_NOM={up:"Tren superior",leg:"Pierna",glu:"Glúteo",abs:"Abs",plk:"Planchas"};
const EST_TAG={up:"up",leg:"low",glu:"low",abs:"core",plk:"core"};
function estPick(arr,n,uso){
  const u=(state.historia&&state.historia.uso)||{}, aj=(state.historia&&state.historia.ajuste)||{};
  const sc=x=>(u[x.id||x]||0)+(aj[x.id||x]||0)+Math.random()*0.9;
  return arr.slice().sort((a,b)=>sc(a)-sc(b)).slice(0,n);
}
function estSlot(step,ctx,side){
  const q=estQ(step.q,ctx.base,ctx.dif);
  const s=slot(step); s.q=q; s.base=null; s.lado=false; s.side=side||null; s.eq=step.eq; s.trans=step.tr||"";
  return s;
}
function estAnchorSteps(A,size,difKey){
  const L=A.layers.map(id=>byId[id]);
  const by=k=>L.find(x=>x.layer===k);
  const d=estDif(difKey);
  if(A.blk==="leg"&&!A.lados){
    let order=["entrada","hold","pulsos","liga","varA","varB","falla"];
    if(difKey==="ligera"||size==="S") order=["entrada","hold","pulsos","liga","falla"];
    return order.map(by).filter(Boolean);
  }
  return L;   // unilaterales y glúteo: capas tal cual
}
function estBloque(kind,idx,ctx,used){
  const size=ctx.size, dif=ctx.dif, sec={id:rid(),nom:"",tag:EST_TAG[kind],kind:"work",slots:[],bk:kind};
  const add=(step,side)=>sec.slots.push(estSlot(step,ctx,side));
  if(kind==="up"){
    const ent=estPick(LIB.filter(e=>e.anchor==="up_ent"),1)[0], pl=estPick(LIB.filter(e=>e.anchor==="up_pl"),1)[0], hold=estPick(LIB.filter(e=>e.anchor==="up_hold"),1)[0], reg=estPick(LIB.filter(e=>e.anchor==="up_reg"),1)[0];
    [ent,pl,hold,reg].forEach(s=>add(s));
    const trios=estPick(["up_s_hombro","up_s_espalda","up_s_brazos","up_s_mix"].map(a=>({id:a})),size==="L"?2:1).map(x=>x.id);
    trios.forEach((a,k)=>{ const steps=LIB.filter(e=>e.anchor===a).sort((x,y)=>x.ord-y.ord); (size==="S"?steps.slice(0,2):steps).forEach(s=>add(s)); });
    sec.nom="Bloque "+idx+" · Tren superior (mancuernas)"; ctx.eq.add("mancuernas");
  } else if(kind==="leg"){
    const anchors=Object.values(EST_ANCHORS).filter(a=>a.blk==="leg"&&!used.has(a.id));
    const A=estPick(anchors.map(a=>({id:a.id})),1)[0], An=EST_ANCHORS[A.id]; used.add(An.id);
    if(An.lados){
      const L=An.layers.map(i=>byId[i]);
      L.forEach(s=>add(s,"A")); L.forEach(s=>add(s,"B"));
    } else {
      estAnchorSteps(An,size,dif).forEach(s=>add(s));
      if(dif==="muypesada"&&size!=="S"){ const f=byId[An.layers.find(i=>byId[i].layer==="pulsos")]; if(f){ const x=estSlot(f,ctx); x.q=Object.assign({},x.q,{n:Math.round(x.q.n*0.6)}); x.nota="Sin descanso: ráfaga final"; sec.slots.push(x); } }
    }
    sec.nom="Bloque "+idx+" · Pierna ("+An.anchorNom.toLowerCase()+")"; ctx.eq.add(An.eq==="cubo"?"silla o cubo":An.eq); sec.slots.some(s=>byId[s.ref].layer==="liga")&&ctx.eq.add("liga");
    sec.anchor=An.id;
  } else if(kind==="glu"){
    const anchors=Object.values(EST_ANCHORS).filter(a=>a.blk==="glu"&&!used.has(a.id));
    const A=estPick(anchors.map(a=>({id:a.id})),size==="L"?2:1);
    A.forEach(x=>{ const An=EST_ANCHORS[x.id]; used.add(An.id); const L=An.layers.map(i=>byId[i]);
      if(An.lados){ L.forEach(s=>add(s,"A")); L.forEach(s=>add(s,"B")); } else L.forEach(s=>add(s)); ctx.eq.add(An.eq); });
    const An0=EST_ANCHORS[A[0].id]; sec.nom="Bloque "+idx+" · Glúteo ("+An0.anchorNom.toLowerCase()+")"; sec.anchor=An0.id;
  } else if(kind==="abs"){
    const n=size==="S"?3:size==="L"?6:4, fns=["anterior","rotacion","inferior","estabilidad"], chosen=[];
    for(let i=0;i<n;i++){ const fn=fns[i%fns.length]; const c=estPick(EST_ABS.filter(e=>e.fn===fn&&!chosen.includes(e)),1)[0]; if(c) chosen.push(c); }
    // de más suave a más exigente: anterior, rotación, inferior, estabilidad
    chosen.forEach(s=>add(s)); sec.nom="Bloque "+idx+" · Abs (mancuernas)"; sec.tag="core"; ctx.eq.add("mancuernas");
  } else if(kind==="plk"){
    estPick(EST_PLK,size==="S"?3:size==="L"?6:4).forEach(s=>add(s)); sec.nom="Bloque "+idx+" · Planchas"; ctx.eq.add("peso corporal");
  }
  return sec;
}
const EST_MODOS={
  full:["up","leg","glu","abs"],
  upper:["up","up","plk","abs"],
  pierna:["leg","leg","glu","abs"],
  core:["abs","plk","abs"],
};
/* clase corta (30 min): una estación menos para que quepa */
const EST_MODOS_S={full:["up","leg","abs"],upper:["up","plk","abs"],pierna:["leg","glu","abs"],core:["abs","plk","abs"]};
function generateEstacion(cfg){
  const mode=MODES.sculpt[cfg.modo], size=cfg.duracion<=30?"S":cfg.duracion>=60?"L":"M", base=cfg.base||8, dif=cfg.nivel||"media";
  const ctx={size,dif,base,eq:new Set()}, used=new Set(), sections=[];
  if(cfg.calent) sections.push({id:rid(),nom:"Calentamiento",tag:"prep",kind:"prep",slots:shuffle(LIB.filter(e=>e.b==="prep"&&e.id!=="w_aprox")).slice(0,4).map(slot)});
  let kinds=(size==="S"?EST_MODOS_S[cfg.modo]:EST_MODOS[cfg.modo])||EST_MODOS.full;
  kinds.forEach((k,i)=>sections.push(estBloque(k,i+1,ctx,used)));
  const reto=estPick(EST_RETO,1)[0];
  sections.push({id:rid(),nom:"Reto final",tag:"core",kind:"finisher",slots:[estSlot(reto,ctx)],bk:"reto"});
  if(cfg.enfr){
    const cs=EST_CIERRE.slice(0,2); if(size==="L") cs.push(EST_CIERRE[2]);
    sections.push({id:rid(),nom:"Cierre",tag:"prep",kind:"cool",slots:cs.map(s=>estSlot(s,ctx)),bk:"cierre"});
  }
  const r={id:rid(),metodo:"sculpt",estilo:"estacion",nombre:`Sculpt · ${mode.nom} · ${cfg.duracion} min`,modo:cfg.modo,nivel:dif,duracion:cfg.duracion,base,porBloque:null,
    vueltas:1,rest:"una pasada por estación",sections,creada:Date.now(),material:[...ctx.eq]};
  estTransiciones(r);
  return r;
}
/* transiciones: lo que cuenta la instructora al pasar de un paso a otro */
const EST_POS={0:"de pie",1:"en plancha / cuatro puntos",2:"en el mat"};
function estTransiciones(r){
  let prev=null;
  r.sections.forEach(S=>S.slots.forEach(s=>{
    const e=byId[s.ref]; let parts=[];
    if(e.tr) parts.push(e.tr);
    else if(prev){
      const pf=byId[prev.ref].f||0, cf=e.f||0;
      if(cf!==pf) parts.push(cf===0?"Ponte de pie":cf===1?"A cuatro puntos / plancha":"Baja al mat");
      else if(s.side==="B"&&prev.side==="A") parts.push("Cambias de lado");
      if(s.eq!==prev.eq&&EQ_VERB[s.eq]&&(s.eq!=="peso corporal"||S.bk==="cierre"||S.bk==="reto")) parts.push(EQ_VERB[s.eq]);
    }
    if(s.side==="B"&&prev&&prev.side==="A"&&!parts.some(x=>/lado/i.test(x))) parts.unshift("Cambias de lado");
    s.trans=parts.join(" · "); prev=s;
  }));
}
function estSegundosSec(S,r){
  let t=30; const base=r.base||8;
  S.slots.forEach(s=>{ t+=estSegundos(s.q||(byId[s.ref]&&byId[s.ref].q),base); });
  return t;
}

/* ============================================================
   integración con la rutina: etiquetas, cambiar/añadir, música por bloque, edición y cronómetro
   ============================================================ */
function estQLabel(q){ return q.t==="reps"?"reps":q.t==="pulsos"?"pulsos":q.t==="hold"?"hold":q.t==="falla"?"a la falla":"transición"; }
/* "Cambiar" un paso: otro del mismo bloque, mismo tipo de cantidad y misma posición */
function estSwapPool(S,s){
  const e=byId[s.ref];
  let p=LIB.filter(x=>x.b==="st"&&x.blk===e.blk&&x.id!==e.id&&x.q.t===e.q.t&&(x.f||0)===(e.f||0));
  const mismaCapa=p.filter(x=>x.layer===e.layer); if(mismaCapa.length>=2) p=mismaCapa;
  if(!p.length) p=LIB.filter(x=>x.b==="st"&&x.blk===e.blk&&x.id!==e.id);
  return p;
}
/* "Añadir": pasos de estación del bloque primero, y debajo la biblioteca clásica */
function estPickerPool(S,pool){
  if(!S.bk) return pool;
  const st=LIB.filter(e=>e.b==="st"&&e.blk===S.bk);
  const ids=new Set(st.map(e=>e.id));
  return st.concat(pool.filter(e=>!ids.has(e.id)));
}
/* la música sigue la energía de cada bloque */
function estMood(S,r){
  const M={up:{lo:108,hi:120,en:"arranque con energía: plancha y mancuernas"},leg:{lo:98,hi:110,en:"marcado y sostenido para holds y pulsos"},
    glu:{lo:94,hi:106,en:"groove más lento y controlado para cuatro puntos"},abs:{lo:108,hi:120,en:"constante y empujando, abdomen"},
    plk:{lo:108,hi:120,en:"constante, aguanta las planchas"},reto:{lo:122,hi:132,en:"subidón para el reto final"},cierre:{lo:60,hi:78,en:"relajación: reflexión y respiración"}};
  return M[S.bk]||null;
}
function modalEditPaso(S,s,rs){
  const q=s.q, e=byId[s.ref], t=q.t;
  const seg=(act,k,vals,cur,fmt)=>`<div class="seg">${vals.map(v=>`<button data-action="${act}" data-k="${k}" data-v="${v}" class="${String(cur)===String(v)?"on":""}">${fmt?fmt(v):v}</button>`).join("")}</div>`;
  return modalShell("Editar paso",`
    <div style="font-family:var(--f-display);font-weight:600;font-size:22px">${esc(rs.nom)}</div>
    <div class="kv" style="color:var(--muted);font-size:12px;margin:4px 0 16px">${esc(e.cue)}</div>
    <div class="form-grid">
      <div class="full"><label class="mini">Tipo de conteo</label>${seg("ed-q","t",["reps","pulsos","hold","falla"],t,v=>({reps:"Repeticiones",pulsos:"Pulsos",hold:"Hold (segundos)",falla:"A la falla"})[v])}</div>
      ${t==="reps"||t==="pulsos"?`<div class="full"><label class="mini">${t==="reps"?"Repeticiones":"Pulsos"}</label>${seg("ed-q","n",t==="reps"?[3,5,8,10,12,15,20]:[10,15,20,25,30,35],q.n)}<input class="inp" style="margin-top:8px;width:120px" type="number" min="1" data-action="ed-qn" value="${q.n||""}" aria-label="Cantidad exacta"></div>`:""}
      ${t==="hold"?`<div class="full"><label class="mini">Segundos</label>${seg("ed-q","s",[10,15,20,30,40,45,60],q.s)}</div>`:""}
      <div class="full"><label class="mini">Lado</label>${seg("ed-side","side",["","A","B"],s.side||"",v=>v===""?"Sin lado":"Lado "+v)}</div>
      <div class="full"><label class="mini">Material</label><div class="seg">${PROPS.map(x=>`<button data-action="ed-eq" data-v="${x}" class="${rs.eq===x?"on":""}">${x}</button>`).join("")}</div></div>
      <div class="full"><label class="mini">Nota para la clase</label><input class="inp" data-action="ed-nota" value="${esc(rs.nota)}" placeholder="ej. baja peso, foco en el glúteo…"></div>
    </div>`,
    `<button class="btn ghost" data-action="close-modal">Cerrar</button><button class="btn primary" data-action="ed-done">Listo</button>`);
}
function editarCantidad(k,v,silent){
  const md=state.modal, {s}=findSlot(md.sec,md.uid); if(!s||!s.q) return;
  const base=state.routine.base||8;
  if(k==="t"){ const por=s.q.por, nota=s.q.nota;
    s.q=v==="hold"?{t:"hold",s:30}:v==="falla"?{t:"falla"}:v==="pulsos"?{t:"pulsos",n:base*3>=30?30:25}:{t:"reps",n:base};
    if(por) s.q.por=por; if(nota) s.q.nota=nota;
    s.pat=v==="reps"?"reps":v==="pulsos"?"pulsos":"iso"; }
  else if(k==="n"){ s.q.n=Math.max(1,Number(v)||1); }
  else if(k==="s"){ s.q.s=Math.max(5,Number(v)||30); }
  if(!silent) renderOverlay();
}
/* cronómetro de holds (cuenta regresiva) y de "a la falla" (cuenta hacia arriba) */
function ivHoldStop(){ const iv=state.iv; if(!iv) return; if(iv.holdT){ clearInterval(iv.holdT); iv.holdT=null; } iv.hold=null; }
function ivHoldToggle(){
  const iv=state.iv; if(!iv) return; const q=resolve(ivStep().slot).q; if(!q) return;
  if(iv.hold){ ivHoldStop(); renderOverlay(); return; }
  ensureAC(); iv.hold={left:q.t==="hold"?q.s:0,el:0};
  iv.holdT=setInterval(()=>{
    const h=iv.hold; if(!h){ clearInterval(iv.holdT); iv.holdT=null; return; }
    const ring=document.getElementById("iv-ring");
    if(q.t==="hold"){
      h.left--; if(ring) ring.textContent=Math.max(0,h.left);
      if(h.left>0&&h.left<=3&&AC) beep(AC.currentTime,880,0.3,0.08);
      if(h.left<=0){ if(AC){ beep(AC.currentTime,1200,0.4,0.12); beep(AC.currentTime+0.15,1200,0.4,0.12); } ivHoldStop(); renderOverlay(); }
    } else { h.el++; if(ring) ring.textContent=h.el; }
  },1000);
  renderOverlay();
}

const EST_DESC={ligera:"holds de 20 s · pulsos suaves · sin variantes extra",media:"holds de 30 s · ritmo sostenido",pesada:"holds de 40 s · más pulsos",muypesada:"holds de 45 s · pulsos al máximo + ráfaga final"};
function estModoBloquesHtml(k){
  const cls={up:"up",leg:"low",glu:"low",abs:"core",plk:"core"};
  return ((state.cfg.duracion<=30?EST_MODOS_S:EST_MODOS)[k]||EST_MODOS.full).map(b=>'<span class="b-'+cls[b]+'">'+EST_NOM[b]+'</span>').join("")+'<span class="b-core">Reto final</span>';
}
