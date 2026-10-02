"use strict";
/* ============================================================
   PT · biblioteca de ejercicios para personal trainer
   p: patrón · m: músculo principal (para contar volumen semanal)
   t: c compuesto / a aislamiento · n: nivel mínimo (1 básico, 2 intermedio, 3 avanzado)
   need: material requerido (todos) · contra: zonas que conviene evitar si hay lesión
   seg: se prescribe por tiempo (segundos) · uni: unilateral · inc: salto de carga sugerido (kg)
   ============================================================ */
const PT_PATRONES={
  sentadilla:"Sentadilla",bisagra:"Bisagra de cadera",unilateral:"Unilateral",gluteo:"Glúteo",isquios:"Isquios",cuadriceps:"Cuádriceps",
  empuje_h:"Empuje horizontal",empuje_v:"Empuje vertical",traccion_h:"Tracción horizontal",traccion_v:"Tracción vertical",
  hombro_lat:"Hombro lateral",hombro_post:"Hombro posterior",biceps:"Bíceps",triceps:"Tríceps",pantorrilla:"Pantorrilla",core:"Core",cardio:"Cardio"
};
const PT_MUSCULOS=["pecho","espalda","hombro","biceps","triceps","cuadriceps","isquios","gluteo","pantorrillas","core"];
const PT_MUSC_NOM={pecho:"Pecho",espalda:"Espalda",hombro:"Hombro",biceps:"Bíceps",triceps:"Tríceps",cuadriceps:"Cuádriceps",isquios:"Isquios",gluteo:"Glúteo",pantorrillas:"Pantorrillas",core:"Core"};
/* qué material hay en cada lugar de entrenamiento */
const PT_EQUIPO={
  gym:   {nom:"Gimnasio completo",tokens:["pc","man","barra","maq","pol","banco","kb","liga","cubo","dom","pelota"]},
  casa:  {nom:"Casa (mancuernas y liga)",tokens:["pc","man","liga","kb","cubo","pelota"]},
  studio:{nom:"Estudio (tu material de clase)",tokens:["pc","man","liga","cubo","polainas","pelota"]},
};
const PT_NIVELES={
  basico:{nom:"Básico",n:1,desc:"0–6 meses entrenando · aprender patrones, técnica y constancia"},
  intermedio:{nom:"Intermedio",n:2,desc:"6 meses–2 años · progresión de carga y más volumen"},
  avanzado:{nom:"Avanzado",n:3,desc:"2+ años · periodización, RIR bajo y técnicas de intensidad"},
};
const PT_OBJETIVOS={
  hipertrofia:{nom:"Ganar músculo",desc:"Hipertrofia: 6–15 reps, volumen alto"},
  fuerza:{nom:"Fuerza",desc:"Básicos pesados 3–6 reps, descansos largos"},
  grasa:{nom:"Definición / perder grasa",desc:"Pesas + densidad, reps medias-altas y finisher"},
  gluteo:{nom:"Glúteo y pierna",desc:"Énfasis en glúteo, isquios y pierna"},
  salud:{nom:"Salud y acondicionamiento",desc:"Cuerpo completo, técnica, constancia"},
};

const PTLIB=[];
function X(id,nom,p,m,t,n,need,cue,o){ PTLIB.push(Object.assign({id,nom,p,m,t,n,need,cue,contra:[],inc:null},o||{})); }

/* ---- sentadilla ---- */
X("sq_goblet","Sentadilla goblet","sentadilla","cuadriceps","c",1,["man"],"Mancuerna al pecho, codos adentro, baja entre las rodillas con el torso erguido.",{inc:2});
X("sq_prensa","Prensa de pierna","sentadilla","cuadriceps","c",1,["maq"],"Espalda baja pegada, pies al ancho de hombros, no bloquees las rodillas arriba.",{inc:5});
X("sq_caja","Sentadilla a la caja","sentadilla","cuadriceps","c",1,["pc","cubo"],"Siéntate atrás hasta rozar la caja y sube empujando el piso.");
X("sq_peso_corp","Sentadilla con peso corporal","sentadilla","cuadriceps","c",1,["pc"],"Pecho arriba, rodillas siguen la línea de los pies, talones pegados.");
X("sq_liga","Sentadilla con liga sobre rodillas","sentadilla","gluteo","c",1,["liga"],"Empuja las rodillas hacia afuera contra la liga durante todo el recorrido.");
X("sq_smith","Sentadilla en máquina guiada","sentadilla","cuadriceps","c",1,["maq"],"Pies ligeramente adelante, baja controlado hasta paralelo.",{inc:2.5});
X("sq_goblet_pausa","Sentadilla goblet con pausa","sentadilla","cuadriceps","c",2,["man"],"Pausa de 2 s abajo, sin perder la tensión del core.",{inc:2});
X("sq_hack","Sentadilla hack en máquina","sentadilla","cuadriceps","c",2,["maq"],"Rango completo, rodillas siguen los pies, sube sin rebotar.",{inc:5});
X("sq_barra","Sentadilla con barra","sentadilla","cuadriceps","c",2,["barra"],"Barra sobre trapecios, core firme, baja a paralelo o más.",{contra:["espalda"],inc:5});
X("sq_frontal","Sentadilla frontal","sentadilla","cuadriceps","c",3,["barra"],"Codos altos, torso vertical, la barra descansa en hombros.",{contra:["espalda","muneca"],inc:2.5});
X("sq_sumo","Sentadilla sumo con mancuerna","sentadilla","gluteo","c",1,["man"],"Pies muy abiertos, puntas afuera, baja recto y aprieta glúteo al subir.",{inc:2});

/* ---- bisagra ---- */
X("bi_rdl_man","Peso muerto rumano con mancuernas","bisagra","isquios","c",1,["man"],"Cadera atrás, mancuernas pegadas a las piernas, espalda neutra.",{inc:2});
X("bi_kb","Peso muerto con kettlebell","bisagra","isquios","c",1,["kb"],"Bisagra de cadera, empuja el piso y termina con glúteos apretados.",{inc:4});
X("bi_pullthrough","Pull-through en polea","bisagra","gluteo","c",1,["pol"],"Cuerda entre las piernas, empuja la cadera adelante sin arquear la espalda.",{inc:2.5});
X("bi_hiper","Hiperextensión en banco romano","bisagra","gluteo","a",1,["maq"],"Sube con glúteo, no con la lumbar; para en línea con el torso.");
X("bi_buenosdias_liga","Buenos días con liga","bisagra","isquios","c",1,["liga"],"Liga bajo los pies y sobre la espalda, bisagra lenta.");
X("bi_rdl_unil","Peso muerto rumano a una pierna","bisagra","isquios","c",2,["man"],"Pierna de apoyo semiflexionada, cadera cuadrada, baja sintiendo el isquio.",{uni:1,inc:2});
X("bi_rdl_barra","Peso muerto rumano con barra","bisagra","isquios","c",2,["barra"],"Barra pegada a las piernas, espalda neutra, siente el estiramiento de isquios.",{contra:["espalda"],inc:5});
X("bi_swing","Swing con kettlebell","bisagra","gluteo","c",2,["kb"],"La cadera lanza la pesa, brazos solo guían; glúteos apretados arriba.",{contra:["espalda"],inc:4});
X("bi_pm","Peso muerto convencional","bisagra","isquios","c",3,["barra"],"Barra sobre el medio pie, espalda neutra, empuja el piso y bloquea cadera.",{contra:["espalda"],inc:5});
X("bi_pm_sumo","Peso muerto sumo","bisagra","gluteo","c",3,["barra"],"Pies abiertos, rodillas siguen puntas, torso más vertical.",{contra:["espalda"],inc:5});

/* ---- unilateral ---- */
X("un_zanc_atras","Zancada hacia atrás","unilateral","gluteo","c",1,["man"],"Paso largo atrás, torso ligeramente inclinado, empuja con el talón de adelante.",{uni:1,inc:2});
X("un_split","Sentadilla split con mancuernas","unilateral","cuadriceps","c",1,["man"],"Pies fijos en zancada, baja recto y sube sin mover los pies.",{uni:1,inc:2});
X("un_stepup","Subida al cajón (step-up)","unilateral","gluteo","c",1,["man","cubo"],"Todo el pie sobre el cajón, sube con la pierna de arriba sin impulso.",{uni:1,inc:2});
X("un_zanc_lat","Zancada lateral","unilateral","gluteo","c",2,["man"],"Paso al lado, cadera atrás, la pierna extendida queda recta.",{uni:1,inc:2});
X("un_bulgara","Sentadilla búlgara","unilateral","gluteo","c",2,["man","cubo"],"Pie trasero elevado, torso inclinado para más glúteo, baja controlado.",{uni:1,contra:["rodilla"],inc:2});
X("un_zanc_camina","Zancada caminando","unilateral","cuadriceps","c",2,["man"],"Pasos largos, rodilla delantera sobre el pie, sin golpear la trasera.",{uni:1,contra:["rodilla"],inc:2});
X("un_pistol_caja","Sentadilla a una pierna a la caja","unilateral","cuadriceps","c",3,["pc","cubo"],"Baja a la caja con una pierna y sube sin empujar con la otra.",{uni:1,contra:["rodilla"]});

/* ---- glúteo ---- */
X("gl_puente","Puente de glúteo","gluteo","gluteo","c",1,["pc"],"Costillas abajo, empuja con talones, pausa de 1 s arriba.");
X("gl_puente_liga","Puente de glúteo con liga","gluteo","gluteo","c",1,["liga"],"Liga sobre las rodillas, abre mientras subes.");
X("gl_frog","Frog pump","gluteo","gluteo","a",1,["pc"],"Plantas juntas, rodillas abiertas, pulsos cortos con mucha tensión.");
X("gl_hip_man","Hip thrust con mancuerna","gluteo","gluteo","c",1,["man","cubo"],"Espalda alta en el cajón, mancuerna en la cadera, mentón al pecho.",{inc:2.5});
X("gl_hip_maq","Hip thrust en máquina","gluteo","gluteo","c",1,["maq"],"Cinturón bien ajustado, sube con glúteo y pausa arriba.",{inc:5});
X("gl_patada_pol","Patada de glúteo en polea","gluteo","gluteo","a",1,["pol"],"Tobillera en la polea, patada atrás sin arquear la lumbar.",{uni:1,inc:2.5});
X("gl_patada_pol_polainas","Patada de glúteo con polainas","gluteo","gluteo","a",1,["polainas"],"En cuadrupedia, patada atrás con la cadera cuadrada.",{uni:1});
X("gl_abduc_maq","Abducción de cadera en máquina","gluteo","gluteo","a",1,["maq"],"Inclina el torso adelante para activar más glúteo medio.",{inc:5});
X("gl_abduc_liga","Abducción con liga","gluteo","gluteo","a",1,["liga"],"Liga en tobillos o rodillas, pasos laterales o de pie sin balanceo.");
X("gl_almeja","Almeja con liga","gluteo","gluteo","a",1,["liga"],"Acostada de lado, rodillas flexionadas, abre sin rotar la pelvis.",{uni:1});
X("gl_puente_unil","Puente a una pierna","gluteo","gluteo","c",2,["pc"],"Pelvis nivelada, sube con el glúteo de la pierna de apoyo.",{uni:1});
X("gl_hip_barra","Hip thrust con barra","gluteo","gluteo","c",2,["barra","banco"],"Barra con almohadilla, espalda alta en el banco, pausa de 1–2 s arriba.",{inc:5});
X("gl_hiper45","Hiperextensión 45° con énfasis en glúteo","gluteo","gluteo","a",2,["maq"],"Redondea ligeramente la espalda alta y sube empujando con el glúteo.",{inc:2.5});

/* ---- isquios y cuádriceps (aislamiento) ---- */
X("is_curl_tumbado","Curl femoral tumbado","isquios","isquios","a",1,["maq"],"Cadera pegada, sube sin arquear y baja lento (3 s).",{inc:2.5});
X("is_curl_sentado","Curl femoral sentado","isquios","isquios","a",1,["maq"],"Espalda pegada, recorrido completo.",{inc:2.5});
X("is_curl_pelota","Curl de isquios con pelota","isquios","isquios","a",1,["pelota"],"Talones sobre la pelota, sube la cadera y rueda la pelota hacia ti.");
X("is_nordico","Curl nórdico asistido","isquios","isquios","c",3,["pc"],"Baja lento controlando con isquios; ayúdate con las manos al final.",{contra:["rodilla"]});
X("cu_ext","Extensión de cuádriceps","cuadriceps","cuadriceps","a",1,["maq"],"Sube sin balanceo, aprieta 1 s arriba.",{contra:["rodilla"],inc:2.5});
X("cu_pared","Sentadilla isométrica en pared","cuadriceps","cuadriceps","a",1,["pc"],"Espalda en la pared, muslos paralelos, aguanta el tiempo.",{seg:1});

/* ---- empuje horizontal ---- */
X("eh_piso_man","Press de pecho en piso con mancuernas","empuje_h","pecho","c",1,["man"],"Codos a 45°, toca el piso con el tríceps y empuja.",{inc:2});
X("eh_press_man","Press de pecho con mancuernas","empuje_h","pecho","c",1,["man","banco"],"Escápulas atrás y abajo, baja hasta sentir el pecho y empuja.",{inc:2});
X("eh_press_maq","Press de pecho en máquina","empuje_h","pecho","c",1,["maq"],"Asiento a la altura del pecho, empuja sin encoger los hombros.",{inc:5});
X("eh_flexion_rod","Flexión con rodillas apoyadas","empuje_h","pecho","c",1,["pc"],"Cuerpo en línea de rodillas a cabeza, baja el pecho al piso.");
X("eh_flexion_incl","Flexión inclinada (manos elevadas)","empuje_h","pecho","c",1,["pc","cubo"],"Manos en el cajón, cuerpo en tabla, baja con control.");
X("eh_press_liga","Press de pecho con liga","empuje_h","pecho","c",1,["liga"],"Liga tras la espalda, empuja al frente y cierra con control.");
X("eh_flexion","Flexión de brazos","empuje_h","pecho","c",1,["pc"],"Cuerpo en tabla, codos a 45°, pecho al piso.");
X("eh_press_incl","Press inclinado con mancuernas","empuje_h","pecho","c",2,["man","banco"],"Banco a 30°, empuja hacia arriba y ligeramente atrás.",{inc:2});
X("eh_peck","Aperturas en máquina (contractor)","empuje_h","pecho","a",1,["maq"],"Codos ligeramente flexionados, junta con el pecho.",{inc:2.5});
X("eh_apertura_man","Aperturas con mancuernas","empuje_h","pecho","a",2,["man","banco"],"Arco amplio, baja hasta sentir el estiramiento sin dolor en hombro.",{contra:["hombro"],inc:1});
X("eh_cruce_pol","Cruce de poleas","empuje_h","pecho","a",2,["pol"],"Paso adelante, junta las manos frente al pecho.",{inc:2.5});
X("eh_press_banca","Press de banca con barra","empuje_h","pecho","c",2,["barra","banco"],"Escápulas retraídas, pies firmes, baja al pecho medio.",{contra:["hombro"],inc:2.5});
X("eh_flexion_decl","Flexión con pies elevados","empuje_h","pecho","c",2,["pc","cubo"],"Pies en el cajón, más carga al pecho alto.");
X("eh_fondos","Fondos en paralelas","empuje_h","pecho","c",3,["dom"],"Torso inclinado para más pecho, baja hasta 90° de codo.",{contra:["hombro"]});

/* ---- empuje vertical y hombro ---- */
X("ev_press_man","Press de hombro con mancuernas","empuje_v","hombro","c",1,["man"],"Costillas abajo, no arquees la lumbar, empuja en arco.",{contra:["hombro"],inc:1});
X("ev_press_maq","Press de hombro en máquina","empuje_v","hombro","c",1,["maq"],"Espalda pegada, empuja sin bloquear los codos.",{inc:2.5});
X("ev_arnold","Press Arnold","empuje_v","hombro","c",2,["man"],"Gira las palmas mientras subes, controla la bajada.",{contra:["hombro"],inc:1});
X("ev_press_kb","Press con kettlebell","empuje_v","hombro","c",2,["kb"],"Pesa en posición de rack, muñeca neutra, empuja recto.",{inc:2});
X("ev_pike","Flexión pike","empuje_v","hombro","c",2,["pc"],"Cadera alta, cabeza entre los brazos, baja la coronilla al piso.");
X("ev_militar","Press militar con barra","empuje_v","hombro","c",3,["barra"],"Glúteos apretados, barra sube pegada a la cara.",{contra:["hombro","espalda"],inc:2.5});
X("hl_lat_man","Elevaciones laterales con mancuernas","hombro_lat","hombro","a",1,["man"],"Codos ligeramente flexionados, sube hasta la altura del hombro.",{inc:1});
X("hl_lat_liga","Elevaciones laterales con liga","hombro_lat","hombro","a",1,["liga"],"Pisa la liga y sube lateral sin encoger el trapecio.");
X("hl_lat_pol","Elevación lateral en polea","hombro_lat","hombro","a",2,["pol"],"Tensión constante, sube controlado.",{inc:1.25});
X("hp_pajaros","Pájaros (elevaciones posteriores)","hombro_post","hombro","a",1,["man"],"Bisagra de cadera, abre los brazos juntando escápulas.",{inc:1});
X("hp_face_pol","Face pull en polea","hombro_post","hombro","a",1,["pol"],"Tira de la cuerda hacia la cara abriendo los codos.",{inc:2.5});
X("hp_face_liga","Face pull con liga","hombro_post","hombro","a",1,["liga"],"Liga a la altura de la cara, abre y junta escápulas.");
X("hp_peck_inv","Pájaros en máquina","hombro_post","hombro","a",1,["maq"],"Pecho apoyado, abre los brazos sin balanceo.",{inc:2.5});

/* ---- tracción ---- */
X("th_remo_man","Remo a una mano con mancuerna","traccion_h","espalda","c",1,["man"],"Apóyate en cajón o banco, tira el codo al bolsillo.",{uni:1,inc:2});
X("th_remo_maq","Remo en máquina sentado","traccion_h","espalda","c",1,["maq"],"Pecho al soporte, junta escápulas al final.",{inc:5});
X("th_remo_pol","Remo en polea baja","traccion_h","espalda","c",1,["pol"],"Torso fijo, codos pegados, pausa 1 s atrás.",{inc:2.5});
X("th_remo_liga","Remo con liga","traccion_h","espalda","c",1,["liga"],"Liga anclada al frente, tira hacia la cintura.");
X("th_remo_kb","Remo con kettlebell","traccion_h","espalda","c",1,["kb"],"Bisagra de cadera, tira de la pesa hacia la cadera.",{inc:2});
X("th_remo_apoyado","Remo con pecho apoyado","traccion_h","espalda","c",1,["man","banco"],"Pecho en banco inclinado, tira sin impulso.",{inc:2});
X("th_remo_invertido","Remo invertido","traccion_h","espalda","c",2,["dom"],"Cuerpo en tabla bajo la barra, tira el pecho a la barra.");
X("th_remo_barra","Remo con barra","traccion_h","espalda","c",2,["barra"],"Torso a 45°, tira hacia el ombligo con espalda neutra.",{contra:["espalda"],inc:2.5});
X("th_pendlay","Remo Pendlay","traccion_h","espalda","c",3,["barra"],"Barra desde el piso en cada repetición, torso paralelo.",{contra:["espalda"],inc:2.5});
X("tv_jalon","Jalón al pecho","traccion_v","espalda","c",1,["pol"],"Codos hacia abajo y atrás, pecho al frente.",{inc:2.5});
X("tv_jalon_neutro","Jalón agarre neutro","traccion_v","espalda","c",1,["pol"],"Agarre estrecho neutro, baja hasta la clavícula.",{inc:2.5});
X("tv_jalon_liga","Jalón con liga","traccion_v","espalda","c",1,["liga"],"Liga anclada arriba, tira los codos a las costillas.");
X("tv_dom_asist","Dominada asistida","traccion_v","espalda","c",2,["maq"],"Escápulas abajo primero, pecho a la barra.",{inc:2.5});
X("tv_pullover","Pullover con mancuerna","traccion_v","espalda","a",2,["man","banco"],"Brazos casi rectos, siente el dorsal al estirar.",{inc:1});
X("tv_brazos_rectos","Jalón de brazos rectos","traccion_v","espalda","a",2,["pol"],"Brazos casi rectos, baja la barra a los muslos.",{inc:2.5});
X("tv_dominada","Dominada","traccion_v","espalda","c",3,["dom"],"Desde colgado, tira el pecho a la barra sin balancearte.");

/* ---- brazos ---- */
X("bc_curl_man","Curl de bíceps con mancuernas","biceps","biceps","a",1,["man"],"Codos pegados al torso, sube sin balanceo.",{inc:1});
X("bc_martillo","Curl martillo","biceps","biceps","a",1,["man"],"Agarre neutro, controla la bajada.",{inc:1});
X("bc_curl_liga","Curl con liga","biceps","biceps","a",1,["liga"],"Pisa la liga, codos fijos.");
X("bc_curl_z","Curl con barra Z","biceps","biceps","a",1,["barra"],"Muñecas cómodas, sube sin impulso.",{inc:2.5});
X("bc_curl_pol","Curl en polea","biceps","biceps","a",2,["pol"],"Tensión constante, pausa arriba.",{inc:2.5});
X("bc_curl_incl","Curl inclinado con mancuernas","biceps","biceps","a",2,["man","banco"],"Banco a 45°, brazos colgando, estiramiento completo.",{inc:1});
X("tr_ext_pol","Extensión de tríceps en polea","triceps","triceps","a",1,["pol"],"Codos pegados, extiende y aprieta abajo.",{inc:2.5});
X("tr_patada","Patada de tríceps","triceps","triceps","a",1,["man"],"Brazo paralelo al torso, extiende sin balanceo.",{inc:1});
X("tr_overhead","Extensión de tríceps sobre la cabeza","triceps","triceps","a",1,["man"],"Codos apuntando al techo, baja detrás de la cabeza.",{inc:1});
X("tr_ext_liga","Extensión de tríceps con liga","triceps","triceps","a",1,["liga"],"Liga anclada arriba, extiende los codos.");
X("tr_fondos_cubo","Fondos de tríceps en el cajón","triceps","triceps","c",1,["pc","cubo"],"Manos en el borde, codos atrás, hombros bajos.",{contra:["hombro"]});
X("tr_frances","Press francés","triceps","triceps","a",2,["man","banco"],"Codos fijos apuntando arriba, baja a la frente.",{contra:["muneca"],inc:1});
X("tr_cerrado","Press de banca agarre cerrado","triceps","triceps","c",2,["barra","banco"],"Manos al ancho de hombros, codos pegados.",{contra:["hombro","muneca"],inc:2.5});

/* ---- pantorrilla y core ---- */
X("pa_pie","Elevación de talones de pie","pantorrilla","pantorrillas","a",1,["pc"],"Rango completo, pausa arriba, baja lento.");
X("pa_man","Elevación de talones con mancuernas","pantorrilla","pantorrillas","a",1,["man"],"Sube en la punta del pie y baja con estiramiento completo.",{inc:2});
X("pa_maq","Elevación de talones en máquina","pantorrilla","pantorrillas","a",1,["maq"],"Rango completo, 2 s abajo.",{inc:5});
X("pa_sentado","Elevación de talones sentado","pantorrilla","pantorrillas","a",1,["man"],"Mancuerna en rodillas, recorrido completo.",{inc:2});
X("co_plancha","Plancha","core","core","a",1,["pc"],"Costillas abajo, glúteos apretados, cuerpo en tabla.",{seg:1});
X("co_plancha_lat","Plancha lateral","core","core","a",1,["pc"],"Cadera arriba, cuerpo en línea.",{seg:1,uni:1});
X("co_deadbug","Dead bug","core","core","a",1,["pc"],"Lumbar pegada al piso, extiende brazo y pierna contrarios.");
X("co_birddog","Bird dog","core","core","a",1,["pc"],"Cadera cuadrada, extiende brazo y pierna contrarios.");
X("co_crunch","Crunch abdominal","core","core","a",1,["pc"],"Costillas hacia la pelvis, cuello relajado.");
X("co_pallof_liga","Press Pallof con liga","core","core","a",1,["liga"],"Resiste la rotación, extiende los brazos al frente.",{seg:1});
X("co_farmer","Caminata del granjero","core","core","c",1,["man"],"Postura alta, pasos cortos, agarre firme.",{seg:1,inc:2});
X("co_mountain","Escaladores","core","core","a",1,["pc"],"Cadera baja, rodillas al pecho con ritmo.",{seg:1});
X("co_hollow","Hollow hold","core","core","a",2,["pc"],"Lumbar pegada, piernas y hombros elevados.",{seg:1,contra:["espalda"]});
X("co_elev_piernas","Elevación de piernas","core","core","a",2,["pc"],"Lumbar pegada, baja lento sin arquear.",{contra:["espalda"]});
X("co_crunch_pol","Crunch en polea","core","core","a",2,["pol"],"Redondea la columna llevando codos a rodillas.",{inc:2.5});
X("co_lenador","Leñador en polea","core","core","a",2,["pol"],"Rota desde el torso, caderas firmes.",{inc:2.5});
X("co_plancha_desp","Plancha con desplazamiento","core","core","a",2,["pc"],"Alterna apoyo sin mover la cadera.",{seg:1});

/* ---- cardio / finisher ---- */
X("ca_bici","Bicicleta estática por intervalos","cardio","core","c",1,["maq"],"30 s fuerte / 30 s suave.",{seg:1});
X("ca_remo","Remo en ergómetro","cardio","core","c",1,["maq"],"Piernas, tronco, brazos; ritmo constante.",{seg:1});
X("ca_caminata","Caminata inclinada","cardio","core","c",1,["maq"],"Inclinación 8–12%, ritmo que permita hablar.",{seg:1});
X("ca_burpee","Burpees","cardio","core","c",2,["pc"],"Pecho al piso opcional; ritmo sostenido.",{seg:1});
X("ca_sombra","Boxeo de sombra","cardio","core","c",1,["pc"],"Combinaciones ligeras con pies activos.",{seg:1});
X("ca_swing_kb","Swing de kettlebell por tiempo","cardio","gluteo","c",2,["kb"],"Cadera potente, ritmo 20 s trabajo / 10 s pausa.",{seg:1,contra:["espalda"]});

const PT_BY_ID={}; PTLIB.forEach(e=>{ PT_BY_ID[e.id]=e; });

/* ejercicios disponibles: material del lugar, nivel y zonas a evitar */
function ptDisponibles(perfil,nivelN,contra){
  const toks=new Set((PT_EQUIPO[perfil]||PT_EQUIPO.gym).tokens), cs=new Set(contra||[]);
  return PTLIB.filter(e=>e.n<=nivelN && e.need.every(t=>toks.has(t)) && !e.contra.some(c=>cs.has(c)));
}
