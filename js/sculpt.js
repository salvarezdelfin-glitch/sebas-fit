"use strict";

/* ============================================================
   1. BIBLIOTECA DE EJERCICIOS
   b: upper|lower|core|prep|cool|cardio
   sub (upper): empuje|traccion|hombro-brazo
   sub (lower): cuadriceps|gluteo|isquios   mov: rodilla|bisagra|accesorio
   pat: reps|pulsos|iso|tempo    f: flujo 0 de pie · 1 cuadrupedia · 2 piso
   comp: compuesto (prioridad en Fuerza)
   ============================================================ */
const LIB = [
  /* UPPER · empuje */
  {id:"u_press_pecho",  b:"upper",sub:"empuje",nom:"Press de pecho en piso",     eq:"mancuernas",   pat:"tempo",tempo:"3-1-1",lado:false,f:2,comp:1,cue:"Codos a 45°, baja controlada, empuja sin bloquear."},
  {id:"u_arnold",       b:"upper",sub:"empuje",nom:"Press Arnold sentada",       eq:"mancuernas",   pat:"reps", tempo:null, lado:false,f:2,comp:1,cue:"Gira de palmas al pecho a palmas al frente."},
  {id:"u_flex_tempo",   b:"upper",sub:"empuje",nom:"Flexión con tempo",          eq:"peso corporal",pat:"tempo",tempo:"3-1-1",lado:false,f:2,comp:1,cue:"Cuerpo en tabla, baja 3 tiempos, sube explosiva."},
  {id:"u_press_hombro", b:"upper",sub:"empuje",nom:"Press de hombro de pie",     eq:"mancuernas",   pat:"reps", tempo:null, lado:false,f:0,comp:1,cue:"Costillas abajo, no arquees la lumbar."},
  {id:"u_fondos",       b:"upper",sub:"empuje",nom:"Fondos de tríceps en el cubo",eq:"cubo",        pat:"reps", tempo:null, lado:false,f:1,comp:0,cue:"Manos en el borde del cubo, codos atrás, hombros bajos."},
  {id:"u_pushup_pulso", b:"upper",sub:"empuje",nom:"Flexión con pulso abajo",    eq:"peso corporal",pat:"pulsos",tempo:null,lado:false,f:2,comp:0,cue:"Pecho a 5 cm del piso, pulsa."},
  {id:"u_press_isopulso",b:"upper",sub:"empuje",nom:"Press de pecho: iso + pulsos",eq:"mancuernas", pat:"iso",  tempo:null, lado:false,f:2,comp:0,cue:"Sostén a media altura y añade micro-pulsos."},
  {id:"u_press_alt",    b:"upper",sub:"empuje",nom:"Press de pecho alterno",      eq:"mancuernas",   pat:"reps", tempo:null, lado:false,f:2,comp:1,cue:"Una mancuerna arriba fija mientras la otra baja, core firme."},
  {id:"u_press_incl_pel",b:"upper",sub:"empuje",nom:"Press inclinado sobre la pelota",eq:"pelota",   pat:"tempo",tempo:"2-1-1",lado:false,f:2,comp:1,cue:"Hombros y cabeza sobre la pelota, cadera alta, empuja."},
  {id:"u_flex_diamante",b:"upper",sub:"empuje",nom:"Flexión diamante",            eq:"peso corporal",pat:"reps", tempo:null, lado:false,f:2,comp:0,cue:"Manos juntas bajo el pecho, codos rozando el costado."},
  {id:"u_flex_declinada",b:"upper",sub:"empuje",nom:"Flexión con pies en el cubo",eq:"cubo",        pat:"tempo",tempo:"3-1-1",lado:false,f:2,comp:1,cue:"Pies elevados, más peso al pecho, cuerpo en tabla."},
  {id:"u_svend",        b:"upper",sub:"empuje",nom:"Press Svend con pelota",       eq:"pelota",      pat:"iso",  tempo:null, lado:false,f:0,comp:0,cue:"Aprieta la pelota entre las palmas y extiende al frente."},
  {id:"u_press_liga_1a",b:"upper",sub:"empuje",nom:"Press de pecho con liga",      eq:"liga",        pat:"pulsos",tempo:null,lado:false,f:0,comp:0,cue:"Liga tras la espalda, empuja al frente y pulsa en el cierre."},
  {id:"u_pushup_liga",  b:"upper",sub:"empuje",nom:"Flexión con sobrecarga de liga",eq:"liga",       pat:"tempo",tempo:"3-1-1",lado:false,f:2,comp:1,cue:"Liga sobre la espalda, baja lento, sube con fuerza."},

  /* UPPER · tracción */
  {id:"u_remo_1m",      b:"upper",sub:"traccion",nom:"Remo a una mano en plancha",eq:"mancuernas",  pat:"reps", tempo:null, lado:true, f:2,comp:1,cue:"Cadera cuadrada, tira el codo al bolsillo."},
  {id:"u_reverse_fly",  b:"upper",sub:"traccion",nom:"Aperturas posteriores",     eq:"mancuernas",  pat:"tempo",tempo:"2-1-2",lado:false,f:0,comp:0,cue:"Bisagra de cadera, junta las escápulas."},
  {id:"u_pullover",     b:"upper",sub:"traccion",nom:"Pull-over en piso",         eq:"mancuernas",  pat:"reps", tempo:null, lado:false,f:2,comp:1,cue:"Brazos casi rectos, costillas selladas."},
  {id:"u_remo_liga",    b:"upper",sub:"traccion",nom:"Remo con liga",             eq:"liga",        pat:"reps", tempo:null, lado:false,f:0,comp:1,cue:"Ancla la liga, aprieta 1 s en el rango corto."},
  {id:"u_face_pull",    b:"upper",sub:"traccion",nom:"Face pull con liga",        eq:"liga",        pat:"pulsos",tempo:null,lado:false,f:0,comp:0,cue:"Puños a las sienes, codos altos."},
  {id:"u_remo_iso",     b:"upper",sub:"traccion",nom:"Remo isométrico",           eq:"mancuernas",  pat:"iso",  tempo:null, lado:false,f:0,comp:0,cue:"Sostén con codos atrás, escápulas juntas."},
  {id:"u_superman",     b:"upper",sub:"traccion",nom:"Superman con pulso",        eq:"peso corporal",pat:"pulsos",tempo:null,lado:false,f:2,comp:0,cue:"Alarga antes de subir, mirada al piso."},
  {id:"u_remo_renegado",b:"upper",sub:"traccion",nom:"Remo renegado",             eq:"mancuernas",  pat:"reps", tempo:null, lado:true, f:2,comp:1,cue:"Plancha ancha, rema sin que gire la cadera."},
  {id:"u_remo_bilateral",b:"upper",sub:"traccion",nom:"Remo bilateral inclinado", eq:"mancuernas",  pat:"tempo",tempo:"2-1-2",lado:false,f:0,comp:1,cue:"Bisagra a 45°, tira ambos codos al bolsillo."},
  {id:"u_pull_apart",   b:"upper",sub:"traccion",nom:"Aperturas de liga",          eq:"liga",        pat:"pulsos",tempo:null,lado:false,f:0,comp:0,cue:"Liga al frente, ábrela hasta el pecho, escápulas juntas."},
  {id:"u_ytw",          b:"upper",sub:"traccion",nom:"Y-T-W en el piso",           eq:"peso corporal",pat:"reps",tempo:null,lado:false,f:2,comp:0,cue:"Boca abajo, dibuja las tres letras con los brazos."},
  {id:"u_jalon_liga",   b:"upper",sub:"traccion",nom:"Jalón dorsal con liga sentada",eq:"liga",      pat:"reps", tempo:null,lado:false,f:2,comp:1,cue:"Liga arriba anclada, jala los codos a las costillas."},
  {id:"u_remo_alto",    b:"upper",sub:"traccion",nom:"Remo alto con liga",         eq:"liga",        pat:"reps", tempo:null,lado:false,f:0,comp:0,cue:"Codos por encima de las muñecas, hasta el pecho."},
  {id:"u_pullover_pel", b:"upper",sub:"traccion",nom:"Pull-over con pelota",       eq:"pelota",      pat:"tempo",tempo:"2-1-2",lado:false,f:2,comp:0,cue:"Pelota entre las manos, baja tras la cabeza sin arquear."},

  /* UPPER · hombro & brazo */
  {id:"u_curl_tempo",   b:"upper",sub:"hombro-brazo",nom:"Curl de bíceps con tempo",eq:"mancuernas",pat:"tempo",tempo:"3-0-1",lado:false,f:0,comp:0,cue:"Codos pegados, baja lento 3 tiempos."},
  {id:"u_curl_martillo",b:"upper",sub:"hombro-brazo",nom:"Curl martillo",          eq:"mancuernas",pat:"reps", tempo:null, lado:false,f:0,comp:0,cue:"Muñecas neutras, sin balanceo."},
  {id:"u_lat_raise",    b:"upper",sub:"hombro-brazo",nom:"Elevaciones laterales",  eq:"mancuernas",pat:"reps", tempo:null, lado:false,f:0,comp:0,cue:"Guía con los codos hasta la línea del hombro."},
  {id:"u_front_pulso",  b:"upper",sub:"hombro-brazo",nom:"Elevaciones frontales con pulso",eq:"mancuernas",pat:"pulsos",tempo:null,lado:false,f:0,comp:0,cue:"Pulsa en el rango medio, tronco firme."},
  {id:"u_patada_tri",   b:"upper",sub:"hombro-brazo",nom:"Patada de tríceps",      eq:"mancuernas",pat:"reps", tempo:null, lado:true, f:0,comp:0,cue:"Codo alto y fijo, extiende hasta bloquear."},
  {id:"u_curl_iso90",   b:"upper",sub:"hombro-brazo",nom:"Curl isométrico a 90°",  eq:"mancuernas",pat:"iso",  tempo:null, lado:false,f:0,comp:0,cue:"Antebrazos paralelos al piso, no cedas."},
  {id:"u_21s",          b:"upper",sub:"hombro-brazo",nom:"Bíceps 21 (3 × 7)",      eq:"mancuernas",pat:"reps", tempo:null, lado:false,f:0,comp:0,cue:"7 abajo, 7 arriba, 7 completas sin parar."},
  {id:"u_pike_pushup",  b:"upper",sub:"hombro-brazo",nom:"Pike push-up",           eq:"peso corporal",pat:"reps",tempo:null,lado:false,f:2,comp:1,cue:"Cadera alta en V, baja la coronilla entre las manos."},
  {id:"u_lat_liga",     b:"upper",sub:"hombro-brazo",nom:"Elevación lateral con liga",eq:"liga",     pat:"reps", tempo:null,lado:false,f:0,comp:0,cue:"Pisa la liga, sube a la línea del hombro sin encoger."},
  {id:"u_press_alt_hombro",b:"upper",sub:"hombro-brazo",nom:"Press militar alterno",eq:"mancuernas",pat:"reps", tempo:null,lado:false,f:0,comp:1,cue:"Sube una mientras la otra espera arriba, core firme."},
  {id:"u_curl_concentr",b:"upper",sub:"hombro-brazo",nom:"Curl concentrado",       eq:"mancuernas",pat:"tempo",tempo:"3-0-1",lado:true, f:0,comp:0,cue:"Codo apoyado en el muslo, baja lento sin soltar tensión."},
  {id:"u_curl_liga",    b:"upper",sub:"hombro-brazo",nom:"Curl de bíceps con liga", eq:"liga",      pat:"pulsos",tempo:null,lado:false,f:0,comp:0,cue:"Pisa la liga, sube a 90° y pulsa sin bajar del todo."},
  {id:"u_tri_ext_liga", b:"upper",sub:"hombro-brazo",nom:"Extensión de tríceps con liga",eq:"liga", pat:"reps", tempo:null,lado:false,f:0,comp:0,cue:"Liga anclada arriba, extiende hasta bloquear el codo."},
  {id:"u_press_frances_piso",b:"upper",sub:"hombro-brazo",nom:"Press francés en el piso",eq:"mancuernas",pat:"tempo",tempo:"3-0-1",lado:false,f:2,comp:0,cue:"Tumbada, baja las mancuernas a las orejas, codos fijos."},
  {id:"u_rot_ext_liga", b:"upper",sub:"hombro-brazo",nom:"Rotación externa con liga",eq:"liga",     pat:"reps", tempo:null,lado:true, f:0,comp:0,cue:"Codo pegado al costado, abre el antebrazo hacia fuera."},
  {id:"u_arnold_iso",   b:"upper",sub:"hombro-brazo",nom:"Arnold con pausa arriba", eq:"mancuernas",pat:"iso",  tempo:null,lado:false,f:0,comp:0,cue:"Gira, sube y sostén 2 s arriba antes de bajar."},

  /* LOWER · cuádriceps (rodilla) */
  {id:"l_squat_tempo",  b:"lower",sub:"cuadriceps",mov:"rodilla",nom:"Sentadilla con tempo",   eq:"mancuernas",   pat:"tempo",tempo:"3-1-1",lado:false,f:0,comp:1,cue:"Peso en medio pie, rodillas siguen los dedos."},
  {id:"l_sumo_pulso",   b:"lower",sub:"cuadriceps",mov:"rodilla",nom:"Sentadilla sumo con pulso",eq:"mancuernas", pat:"pulsos",tempo:null,lado:false,f:0,comp:0,cue:"Puntas abiertas, pulsa abajo abriendo rodillas."},
  {id:"l_zancada_est",  b:"lower",sub:"cuadriceps",mov:"rodilla",nom:"Zancada estática",       eq:"mancuernas",   pat:"reps", tempo:null,lado:true, f:0,comp:1,cue:"Torso vertical, baja la rodilla trasera."},
  {id:"l_wall_sit",     b:"lower",sub:"cuadriceps",mov:"rodilla",nom:"Sentadilla isométrica en pared",eq:"peso corporal",pat:"iso",tempo:null,lado:false,f:0,comp:0,cue:"Muslos paralelos, espalda plana contra el muro."},
  {id:"l_step_up",      b:"lower",sub:"cuadriceps",mov:"rodilla",nom:"Subida al cubo",          eq:"cubo",         pat:"reps", tempo:null,lado:true, f:0,comp:1,cue:"Empuja con el talón de arriba, no rebotes."},
  {id:"l_squat_jump",   b:"lower",sub:"cuadriceps",mov:"rodilla",nom:"Sentadilla con salto",    eq:"peso corporal",pat:"reps", tempo:null,lado:false,f:0,comp:0,cue:"Aterriza suave, cae directo a la siguiente."},
  {id:"l_zancada_cam",  b:"lower",sub:"cuadriceps",mov:"rodilla",nom:"Zancada caminando",       eq:"mancuernas",   pat:"reps", tempo:null,lado:false,f:0,comp:1,cue:"Paso largo, rodilla trasera baja, pecho arriba."},
  {id:"l_bulgara",      b:"lower",sub:"cuadriceps",mov:"rodilla",nom:"Zancada búlgara en el cubo",eq:"mancuernas", pat:"tempo",tempo:"3-1-1",lado:true,f:0,comp:1,cue:"Pie de atrás en el cubo, baja recto, rodilla estable."},
  {id:"l_step_pulso",   b:"lower",sub:"cuadriceps",mov:"rodilla",nom:"Subida al cubo con pulso",eq:"polainas",     pat:"pulsos",tempo:null,lado:true,f:0,comp:0,cue:"Sube y pulsa la rodilla libre arriba sin apoyar."},
  {id:"l_squat_cubo",   b:"lower",sub:"cuadriceps",mov:"rodilla",nom:"Sentadilla al cubo",      eq:"mancuernas",   pat:"tempo",tempo:"3-1-1",lado:false,f:0,comp:1,cue:"Roza el cubo con el glúteo y sube sin dejarte caer."},
  {id:"l_squat_pel_pared",b:"lower",sub:"cuadriceps",mov:"rodilla",nom:"Sentadilla con pelota en la pared",eq:"pelota",pat:"tempo",tempo:"3-1-1",lado:false,f:0,comp:1,cue:"Pelota en la lumbar contra la pared, baja a paralelo."},
  {id:"l_zancada_atras",b:"lower",sub:"cuadriceps",mov:"rodilla",nom:"Zancada hacia atrás",    eq:"mancuernas",   pat:"reps", tempo:null,lado:true, f:0,comp:1,cue:"Paso atrás controlado, rodilla trasera al suelo."},
  {id:"l_zancada_lat",  b:"lower",sub:"cuadriceps",mov:"rodilla",nom:"Zancada lateral",        eq:"mancuernas",   pat:"reps", tempo:null,lado:true, f:0,comp:1,cue:"Empuja la cadera atrás en la pierna que se dobla."},
  {id:"l_cossack",      b:"lower",sub:"cuadriceps",mov:"rodilla",nom:"Sentadilla cosaca",       eq:"peso corporal",pat:"tempo",tempo:"2-1-1",lado:true, f:0,comp:0,cue:"Peso a un lado, la otra pierna estirada, talón al suelo."},
  {id:"l_squat_iso_pulso",b:"lower",sub:"cuadriceps",mov:"rodilla",nom:"Sentadilla iso con pulsos",eq:"peso corporal",pat:"pulsos",tempo:null,lado:false,f:0,comp:0,cue:"Mantén paralelo y pulsa 2 cm arriba y abajo."},
  {id:"l_step_lat_cubo",b:"lower",sub:"cuadriceps",mov:"rodilla",nom:"Subida lateral al cubo",  eq:"cubo",         pat:"reps", tempo:null,lado:true, f:0,comp:1,cue:"De lado al cubo, sube empujando con el talón de arriba."},
  {id:"l_sissy",        b:"lower",sub:"cuadriceps",mov:"rodilla",nom:"Sentadilla sissy en la barra",eq:"cubo",     pat:"tempo",tempo:"3-1-1",lado:false,f:0,comp:0,cue:"Apoyo ligero en el cubo, lleva las rodillas al frente."},
  {id:"l_squat_1y14",   b:"lower",sub:"cuadriceps",mov:"rodilla",nom:"Sentadilla 1 y 1/4",      eq:"mancuernas",   pat:"tempo",tempo:"2-1-1",lado:false,f:0,comp:1,cue:"Baja del todo, sube un cuarto, baja y sube completo."},

  /* LOWER · glúteo (bisagra / accesorio) */
  {id:"l_puente_tempo", b:"lower",sub:"gluteo",mov:"bisagra",nom:"Puente de glúteo con tempo",  eq:"mancuernas",   pat:"tempo",tempo:"2-2-1",lado:false,f:2,comp:1,cue:"Sube, aprieta 2 s arriba, baja controlado."},
  {id:"l_puente_pulso", b:"lower",sub:"gluteo",mov:"bisagra",nom:"Puente de glúteo con pulsos", eq:"mancuernas",   pat:"pulsos",tempo:null,lado:false,f:2,comp:0,cue:"Cadera alta y fija, micro-pulsos desde el glúteo."},
  {id:"l_hip_thrust",   b:"lower",sub:"gluteo",mov:"bisagra",nom:"Hip thrust en el cubo",       eq:"mancuernas",   pat:"reps", tempo:null,lado:false,f:1,comp:1,cue:"Escápulas en el cubo, barbilla al pecho, bloquea arriba."},
  {id:"l_kickback",     b:"lower",sub:"gluteo",mov:"accesorio",nom:"Patada de glúteo en cuadrupedia",eq:"liga",     pat:"pulsos",tempo:null,lado:true,f:1,comp:0,cue:"Talón al techo, sin arquear la lumbar."},
  {id:"l_abduccion",    b:"lower",sub:"gluteo",mov:"accesorio",nom:"Abducción de pie con liga", eq:"liga",         pat:"reps", tempo:null,lado:true,f:0,comp:0,cue:"Tronco quieto, abre desde la cadera."},
  {id:"l_puente_iso_ab",b:"lower",sub:"gluteo",mov:"bisagra",nom:"Puente iso + apertura",       eq:"liga",         pat:"iso",  tempo:null,lado:false,f:2,comp:0,cue:"Sostén el puente y abre/cierra rodillas contra la liga."},
  {id:"l_rdl",          b:"lower",sub:"gluteo",mov:"bisagra",nom:"Peso muerto rumano",          eq:"mancuernas",   pat:"tempo",tempo:"3-1-1",lado:false,f:0,comp:1,cue:"Bisagra de cadera, mancuernas rozando la pierna."},
  {id:"l_fire_hydrant", b:"lower",sub:"gluteo",mov:"accesorio",nom:"Fire hydrant con pulso",    eq:"polainas",     pat:"pulsos",tempo:null,lado:true,f:1,comp:0,cue:"Abre la rodilla a 90°, cadera sin rotar."},
  {id:"l_kick_polaina", b:"lower",sub:"gluteo",mov:"accesorio",nom:"Patada de glúteo de pie",   eq:"polainas",     pat:"pulsos",tempo:null,lado:true,f:0,comp:0,cue:"Inclina el tronco, empuja el talón atrás y arriba."},
  {id:"l_abd_lat_pol",  b:"lower",sub:"gluteo",mov:"accesorio",nom:"Elevación lateral de pierna",eq:"polainas",    pat:"tempo",tempo:"2-1-2",lado:true,f:2,comp:0,cue:"Tumbada de lado, pie flex, sube sin rotar la cadera."},
  {id:"l_puente_marcha",b:"lower",sub:"gluteo",mov:"bisagra",nom:"Puente con marcha",           eq:"polainas",     pat:"reps", tempo:null,lado:true,f:2,comp:0,cue:"Cadera alta y estable, despega un pie sin que caiga."},
  {id:"l_hip_thrust_1p",b:"lower",sub:"gluteo",mov:"bisagra",nom:"Hip thrust a una pierna",     eq:"peso corporal",pat:"reps",tempo:null,lado:true,f:1,comp:1,cue:"Escápulas en el cubo, una pierna extendida, empuja con el talón."},
  {id:"l_frog_pump",   b:"lower",sub:"gluteo",mov:"bisagra",nom:"Frog pump (rana)",             eq:"peso corporal",pat:"pulsos",tempo:null,lado:false,f:2,comp:0,cue:"Plantas juntas, rodillas abiertas, sube la cadera y aprieta."},
  {id:"l_pull_through", b:"lower",sub:"gluteo",mov:"bisagra",nom:"Pull-through con liga",        eq:"liga",         pat:"reps", tempo:null,lado:false,f:0,comp:1,cue:"Liga entre las piernas anclada atrás, bisagra y empuja la cadera al frente."},
  {id:"l_rdl_liga",    b:"lower",sub:"gluteo",mov:"bisagra",nom:"Peso muerto rumano con liga",  eq:"liga",         pat:"tempo",tempo:"3-1-1",lado:false,f:0,comp:1,cue:"Pisa la liga, bisagra de cadera, espalda larga."},
  {id:"l_monster_walk",b:"lower",sub:"gluteo",mov:"accesorio",nom:"Caminata monster con liga",  eq:"liga",         pat:"reps", tempo:null,lado:false,f:0,comp:0,cue:"Liga en los tobillos, pasos adelante y atrás en semisentadilla."},
  {id:"l_abd_sentada", b:"lower",sub:"gluteo",mov:"accesorio",nom:"Abducción sentada con liga", eq:"liga",         pat:"pulsos",tempo:null,lado:false,f:2,comp:0,cue:"Liga sobre las rodillas, abre contra la resistencia y pulsa."},
  {id:"l_side_lift_pol",b:"lower",sub:"gluteo",mov:"accesorio",nom:"Elevación lateral + círculo",eq:"polainas",    pat:"pulsos",tempo:null,lado:true,f:2,comp:0,cue:"Tumbada de lado, sube la pierna y dibuja círculos pequeños."},
  {id:"l_curtsy_abd",  b:"lower",sub:"gluteo",mov:"accesorio",nom:"Curtsy con abducción",       eq:"liga",         pat:"reps", tempo:null,lado:true,f:0,comp:0,cue:"Cruza atrás y al subir abre la pierna al lado."},
  {id:"l_kick_pel",    b:"lower",sub:"gluteo",mov:"accesorio",nom:"Patada de glúteo con pelota",eq:"pelota",       pat:"pulsos",tempo:null,lado:true,f:1,comp:0,cue:"Pelota tras la rodilla, empuja el talón al techo sin soltarla."},

  /* LOWER · isquios & pantorrilla */
  {id:"l_rdl_1p",       b:"lower",sub:"isquios",mov:"bisagra",nom:"Peso muerto a una pierna",   eq:"mancuernas",   pat:"tempo",tempo:"3-0-1",lado:true,f:0,comp:1,cue:"Cadera cuadrada, alarga la pierna libre atrás."},
  {id:"l_curl_pelota",  b:"lower",sub:"isquios",mov:"accesorio",nom:"Curl de isquios con pelota",eq:"pelota",      pat:"reps", tempo:null,lado:false,f:2,comp:0,cue:"Cadera alta, arrastra la pelota con los talones."},
  {id:"l_good_morning", b:"lower",sub:"isquios",mov:"bisagra",nom:"Buenos días con liga",       eq:"liga",         pat:"tempo",tempo:"3-1-1",lado:false,f:0,comp:1,cue:"Rodillas blandas, espalda larga, siente el estiramiento."},
  {id:"l_calf",         b:"lower",sub:"isquios",mov:"accesorio",nom:"Elevación de pantorrilla", eq:"mancuernas",   pat:"reps", tempo:null,lado:false,f:0,comp:0,cue:"Sube al máximo, pausa arriba, baja lento."},
  {id:"l_calf_pulso",   b:"lower",sub:"isquios",mov:"accesorio",nom:"Pantorrilla con pulsos",   eq:"peso corporal",pat:"pulsos",tempo:null,lado:false,f:0,comp:0,cue:"Talones altos, pulsos cortos y rápidos."},
  {id:"l_puente_1p_iso",b:"lower",sub:"isquios",mov:"bisagra",nom:"Puente a una pierna iso",    eq:"peso corporal",pat:"iso",  tempo:null,lado:true,f:2,comp:0,cue:"Sostén con una pierna, la otra extendida."},
  {id:"l_curl_polaina", b:"lower",sub:"isquios",mov:"accesorio",nom:"Curl de isquios tumbada",  eq:"polainas",     pat:"pulsos",tempo:null,lado:false,f:2,comp:0,cue:"Boca abajo, lleva los talones al glúteo y pulsa."},
  {id:"l_rdl_pelota",   b:"lower",sub:"isquios",mov:"bisagra",nom:"Peso muerto con pelota rodando",eq:"pelota",    pat:"tempo",tempo:"3-1-1",lado:false,f:0,comp:0,cue:"Rueda la pelota al frente en bisagra, espalda larga."},
  {id:"l_curl_desliz",  b:"lower",sub:"isquios",mov:"accesorio",nom:"Curl de isquios deslizante",eq:"peso corporal",pat:"tempo",tempo:"2-0-2",lado:false,f:2,comp:0,cue:"Puente alto, arrastra los talones con una toalla y vuelve lento."},
  {id:"l_rdl_deficit",  b:"lower",sub:"isquios",mov:"bisagra",nom:"Peso muerto rumano en déficit",eq:"mancuernas",pat:"tempo",tempo:"3-1-1",lado:false,f:0,comp:1,cue:"De pie sobre el cubo, baja más profundo estirando el isquio."},
  {id:"l_swing",        b:"lower",sub:"isquios",mov:"bisagra",nom:"Swing con mancuerna",         eq:"mancuernas",   pat:"reps", tempo:null,lado:false,f:0,comp:1,cue:"El impulso viene de la cadera, no de los brazos."},
  {id:"l_nordic",       b:"lower",sub:"isquios",mov:"bisagra",nom:"Curl nórdico asistido",       eq:"peso corporal",pat:"tempo",tempo:"4-0-0",lado:false,f:1,comp:0,cue:"Rodillas fijas, baja el tronco lo más lento que controles."},
  {id:"l_calf_1p",      b:"lower",sub:"isquios",mov:"accesorio",nom:"Pantorrilla a una pierna en el cubo",eq:"cubo",pat:"reps",tempo:null,lado:true,f:0,comp:0,cue:"Media punta en el borde del cubo, rango completo."},
  {id:"l_calf_sentada", b:"lower",sub:"isquios",mov:"accesorio",nom:"Pantorrilla sentada con peso",eq:"mancuernas",pat:"pulsos",tempo:null,lado:false,f:2,comp:0,cue:"Mancuerna sobre las rodillas, sube y baja los talones."},

  /* CORE */
  {id:"c_crunch_tempo", b:"core",sub:"abdomen",nom:"Crunch con tempo",            eq:"peso corporal",pat:"tempo",tempo:"2-0-2",lado:false,f:2,comp:0,cue:"Enrolla vértebra a vértebra, sin tirar del cuello."},
  {id:"c_crunch_pulso", b:"core",sub:"abdomen",nom:"Crunch con pulso arriba",     eq:"peso corporal",pat:"pulsos",tempo:null,lado:false,f:2,comp:0,cue:"Mantén la contracción y pulsa hacia el techo."},
  {id:"c_leg_raise",    b:"core",sub:"abdomen",nom:"Elevación de piernas",        eq:"peso corporal",pat:"reps", tempo:null,lado:false,f:2,comp:0,cue:"Lumbar pegada al piso, baja hasta donde controles."},
  {id:"c_dead_bug",     b:"core",sub:"abdomen",nom:"Dead bug",                    eq:"peso corporal",pat:"reps", tempo:null,lado:true, f:2,comp:0,cue:"Brazo y pierna opuestos, ombligo hacia dentro."},
  {id:"c_crunch_peso",  b:"core",sub:"abdomen",nom:"Crunch con peso al pecho",    eq:"mancuernas",   pat:"reps", tempo:null,lado:false,f:2,comp:0,cue:"Peso en el esternón, sube con exhalación."},
  {id:"c_vhold",        b:"core",sub:"abdomen",nom:"V-hold isométrico",           eq:"peso corporal",pat:"iso",  tempo:null,lado:false,f:2,comp:0,cue:"Pecho arriba, pierna larga, respira."},
  {id:"c_heel_taps",    b:"core",sub:"abdomen",nom:"Toque de talones",            eq:"peso corporal",pat:"reps", tempo:null,lado:true, f:2,comp:0,cue:"Hombros despegados, alcanza el talón lateralmente."},
  {id:"c_leg_polaina",  b:"core",sub:"abdomen",nom:"Elevación de piernas con carga",eq:"polainas",   pat:"tempo",tempo:"2-0-2",lado:false,f:2,comp:0,cue:"Lumbar clavada, baja lento sin arquear."},
  {id:"c_pelota_pass",  b:"core",sub:"abdomen",nom:"Traspaso de pelota",          eq:"pelota",       pat:"reps", tempo:null,lado:false,f:2,comp:0,cue:"Pásala de manos a pies en cada rep, cuerpo largo."},
  {id:"c_dead_bug_pol", b:"core",sub:"abdomen",nom:"Dead bug con polainas",       eq:"polainas",     pat:"reps", tempo:null,lado:true, f:2,comp:0,cue:"Extiende la pierna a ras de mat, costillas abajo."},
  {id:"c_v_up",         b:"core",sub:"abdomen",nom:"V-up completo",               eq:"peso corporal",pat:"reps", tempo:null,lado:false,f:2,comp:0,cue:"Manos y pies se encuentran arriba, baja largo y controlado."},
  {id:"c_tijeras",      b:"core",sub:"abdomen",nom:"Tijeras (flutter kicks)",    eq:"peso corporal",pat:"pulsos",tempo:null,lado:false,f:2,comp:0,cue:"Piernas bajas y largas, lumbar clavada, aletea rápido."},
  {id:"c_crunch_pel",   b:"core",sub:"abdomen",nom:"Crunch sobre la pelota",      eq:"pelota",       pat:"tempo",tempo:"2-0-2",lado:false,f:2,comp:0,cue:"Lumbar apoyada en la pelota, rango completo arriba y abajo."},
  {id:"c_reverse_crunch",b:"core",sub:"abdomen",nom:"Crunch inverso",            eq:"peso corporal",pat:"reps",tempo:null,lado:false,f:2,comp:0,cue:"Lleva las rodillas al pecho despegando la cadera, sin impulso."},
  {id:"c_leg_lower_liga",b:"core",sub:"abdomen",nom:"Descenso de piernas con liga",eq:"liga",        pat:"tempo",tempo:"3-0-1",lado:false,f:2,comp:0,cue:"Liga en los pies anclada arriba, baja hasta donde controles."},
  {id:"c_hollow_rock",  b:"core",sub:"abdomen",nom:"Hollow rock (balanceo)",     eq:"peso corporal",pat:"reps", tempo:null,lado:false,f:2,comp:0,cue:"Cuerpo en banana rígida, mécete desde el core, no de las piernas."},
  {id:"c_toe_touch_peso",b:"core",sub:"abdomen",nom:"Toque de puntas con mancuerna",eq:"mancuernas",pat:"reps",tempo:null,lado:false,f:2,comp:0,cue:"Piernas al techo, alcanza los tobillos despegando los omóplatos."},

  {id:"c_giro_ruso",    b:"core",sub:"oblicuos",nom:"Giro ruso",                  eq:"mancuernas",   pat:"reps", tempo:null,lado:true, f:2,comp:0,cue:"Rota desde el tronco, no solo los brazos."},
  {id:"c_bici",         b:"core",sub:"oblicuos",nom:"Bicicleta lenta",            eq:"peso corporal",pat:"reps", tempo:null,lado:true, f:2,comp:0,cue:"Codo a rodilla opuesta, extiende del todo la otra pierna."},
  {id:"c_side_dip",     b:"core",sub:"oblicuos",nom:"Plancha lateral con descenso",eq:"peso corporal",pat:"pulsos",tempo:null,lado:true,f:2,comp:0,cue:"Baja la cadera 5 cm y vuelve a subir."},
  {id:"c_side_plank_iso",b:"core",sub:"oblicuos",nom:"Plancha lateral isométrica", eq:"peso corporal",pat:"iso", tempo:null,lado:true, f:2,comp:0,cue:"Cuerpo en línea, cadera arriba, hombro fuerte."},
  {id:"c_lenador",      b:"core",sub:"oblicuos",nom:"Leñador con liga",           eq:"liga",         pat:"reps", tempo:null,lado:true, f:0,comp:0,cue:"Traza la diagonal de la cadera al hombro opuesto."},
  {id:"c_crunch_obl",   b:"core",sub:"oblicuos",nom:"Crunch oblicuo con pulso",   eq:"peso corporal",pat:"pulsos",tempo:null,lado:true,f:2,comp:0,cue:"Codo a la rodilla del mismo lado y pulsa."},
  {id:"c_russian_pel",  b:"core",sub:"oblicuos",nom:"Giro ruso con pelota",       eq:"pelota",       pat:"reps", tempo:null,lado:true,f:2,comp:0,cue:"Toca el mat a cada lado, gira desde el tronco, pies flotando."},
  {id:"c_windmill",     b:"core",sub:"oblicuos",nom:"Molino con mancuerna",       eq:"mancuernas",   pat:"reps", tempo:null,lado:true,f:0,comp:0,cue:"Brazo arriba fijo, baja la mano libre por la pierna, mirada al peso."},
  {id:"c_side_bend",    b:"core",sub:"oblicuos",nom:"Inclinación lateral con mancuerna",eq:"mancuernas",pat:"reps",tempo:null,lado:true,f:0,comp:0,cue:"Baja recta por el costado y sube contrayendo el oblicuo."},
  {id:"c_pallof",       b:"core",sub:"oblicuos",nom:"Press Pallof con liga",      eq:"liga",         pat:"iso",  tempo:null,lado:true,f:0,comp:0,cue:"Liga anclada al lado, extiende los brazos y resiste la rotación."},
  {id:"c_copenhagen",   b:"core",sub:"oblicuos",nom:"Plancha Copenhague asistida",eq:"peso corporal",pat:"iso", tempo:null,lado:true,f:2,comp:0,cue:"Pie de arriba en el cubo, sube la cadera y sostén en línea."},
  {id:"c_side_plank_reach",b:"core",sub:"oblicuos",nom:"Plancha lateral con threading",eq:"peso corporal",pat:"reps",tempo:null,lado:true,f:2,comp:0,cue:"Pasa el brazo bajo el torso y vuelve a abrir al techo."},

  {id:"c_plancha_iso",  b:"core",sub:"estabilidad",nom:"Plancha alta isométrica", eq:"peso corporal",pat:"iso",  tempo:null,lado:false,f:2,comp:0,cue:"Glúteo y abdomen activos, nuca larga."},
  {id:"c_shoulder_tap", b:"core",sub:"estabilidad",nom:"Plancha con toque de hombro",eq:"peso corporal",pat:"reps",tempo:null,lado:true,f:2,comp:0,cue:"Caderas sin bambolearse, base ancha."},
  {id:"c_bird_dog",     b:"core",sub:"estabilidad",nom:"Bird-dog con tempo",      eq:"peso corporal",pat:"tempo",tempo:"2-2-2",lado:true,f:1,comp:0,cue:"Alarga brazo y pierna opuestos, pausa, vuelve."},
  {id:"c_hollow",       b:"core",sub:"estabilidad",nom:"Hollow hold",             eq:"peso corporal",pat:"iso",  tempo:null,lado:false,f:2,comp:0,cue:"Lumbar clavada al piso, brazos y piernas largos."},
  {id:"c_puente_pelota",b:"core",sub:"estabilidad",nom:"Puente en pelota iso",    eq:"pelota",       pat:"iso",  tempo:null,lado:false,f:2,comp:0,cue:"Pies sobre la pelota, cadera alta y quieta."},
  {id:"c_bear_hold",    b:"core",sub:"estabilidad",nom:"Bear hold isométrico",    eq:"peso corporal",pat:"iso",  tempo:null,lado:false,f:1,comp:0,cue:"Rodillas a 3 cm del piso, espalda como una mesa."},
  {id:"c_mountain_slow",b:"core",sub:"estabilidad",nom:"Escaladores lentos",      eq:"peso corporal",pat:"reps", tempo:null,lado:true,f:2,comp:0,cue:"Rodilla al pecho con control, cadera baja."},
  {id:"c_plancha_row",  b:"core",sub:"estabilidad",nom:"Plancha con remo de liga", eq:"liga",         pat:"reps", tempo:null,lado:true,f:2,comp:0,cue:"Liga anclada al frente, rema un brazo sin girar la cadera."},
  {id:"c_pike_pelota",  b:"core",sub:"estabilidad",nom:"Pike con pies en la pelota",eq:"pelota",      pat:"reps", tempo:null,lado:false,f:2,comp:0,cue:"Rueda la pelota hacia las manos subiendo la cadera en V."},
  {id:"c_stir_pot",     b:"core",sub:"estabilidad",nom:"Revolver la olla en la pelota",eq:"pelota",   pat:"iso",  tempo:null,lado:false,f:1,comp:0,cue:"Antebrazos en la pelota, dibuja círculos lentos sin mover la cadera."},
  {id:"c_plancha_saw",  b:"core",sub:"estabilidad",nom:"Plancha con vaivén",      eq:"peso corporal",pat:"pulsos",tempo:null,lado:false,f:2,comp:0,cue:"Desde antebrazos, mécete adelante y atrás sobre los dedos."},
  {id:"c_plancha_reach",b:"core",sub:"estabilidad",nom:"Plancha con alcance de brazo",eq:"peso corporal",pat:"reps",tempo:null,lado:true,f:2,comp:0,cue:"Estira un brazo al frente sin que caiga la cadera."},
  {id:"c_dead_bug_liga",b:"core",sub:"estabilidad",nom:"Dead bug con anclaje de liga",eq:"liga",     pat:"reps", tempo:null,lado:true,f:2,comp:0,cue:"Sostén la liga sobre el pecho y extiende la pierna opuesta."},

  /* CALENTAMIENTO */
  {id:"w_cadera",  b:"prep",nom:"Movilidad de cadera 90/90",eq:"peso corporal",pat:"reps",tempo:null,lado:true, f:2,comp:0,cue:"Rota de un lado al otro sentada, pecho alto."},
  {id:"w_brazos",  b:"prep",nom:"Círculos de brazos",       eq:"peso corporal",pat:"reps",tempo:null,lado:false,f:0,comp:0,cue:"Círculos grandes, adelante y atrás."},
  {id:"w_squat_air",b:"prep",nom:"Sentadilla al aire",      eq:"peso corporal",pat:"reps",tempo:null,lado:false,f:0,comp:0,cue:"Rango completo y suave, despierta las piernas."},
  {id:"w_tspine",  b:"prep",nom:"Rotación torácica en cuadrupedia",eq:"peso corporal",pat:"reps",tempo:null,lado:true,f:1,comp:0,cue:"Mano en la nuca, abre el codo al techo."},
  {id:"w_gluteo",  b:"prep",nom:"Activación de glúteo con liga",eq:"liga",     pat:"reps",tempo:null,lado:false,f:0,comp:0,cue:"Pasos laterales con tensión constante."},
  {id:"w_flow",    b:"prep",nom:"Plancha a perro abajo",    eq:"peso corporal",pat:"reps",tempo:null,lado:false,f:1,comp:0,cue:"Fluye entre las dos posiciones con la respiración."},
  {id:"w_aprox",   b:"prep",nom:"Serie de aproximación",    eq:"mancuernas",   pat:"reps",tempo:null,lado:false,f:0,comp:0,cue:"Repite el patrón del bloque 1 con carga ligera."},

  /* ENFRIAMIENTO */
  {id:"z_pecho",   b:"cool",nom:"Estiramiento de pecho en pared",eq:"peso corporal",pat:"iso",tempo:null,lado:true, f:0,comp:0,cue:"Antebrazo en la pared, gira el tronco lejos."},
  {id:"z_cuadri",  b:"cool",nom:"Cuádriceps de pie",         eq:"peso corporal",pat:"iso",tempo:null,lado:true, f:0,comp:0,cue:"Rodillas juntas, empuja la cadera al frente."},
  {id:"z_isquios", b:"cool",nom:"Estiramiento de isquios",   eq:"peso corporal",pat:"iso",tempo:null,lado:true, f:2,comp:0,cue:"Pierna extendida, bisagra desde la cadera."},
  {id:"z_gato",    b:"cool",nom:"Gato–camello",              eq:"peso corporal",pat:"reps",tempo:null,lado:false,f:1,comp:0,cue:"Moviliza la columna al ritmo de la respiración."},
  {id:"z_nino",    b:"cool",nom:"Postura del niño",          eq:"peso corporal",pat:"iso",tempo:null,lado:false,f:2,comp:0,cue:"Rodillas abiertas, brazos largos, respira al fondo."},
  {id:"z_resp",    b:"cool",nom:"Respiración 4·7·8",         eq:"peso corporal",pat:"iso",tempo:null,lado:false,f:2,comp:0,cue:"Inhala 4, sostén 7, exhala 8. Baja pulsaciones."},

  /* BARRE · brazos (pesas ligeras) */
  {id:"ba_biceps_2a",  b:"barre",sub:"brazos",nom:"Bíceps en segunda posición", eq:"mancuernas",   pat:"pulsos",tempo:null,lado:false,f:0,comp:0,cue:"Piernas en segunda, codos fijos, pulsos cortos y controlados."},
  {id:"ba_tri_frances",b:"barre",sub:"brazos",nom:"Tríceps a la francesa de pie",eq:"mancuernas",  pat:"tempo",tempo:"2-0-1",lado:false,f:0,comp:0,cue:"Codos junto a las orejas, extiende sin abrir."},
  {id:"ba_circulos",   b:"barre",sub:"brazos",nom:"Círculos micro de brazos",   eq:"mancuernas",   pat:"pulsos",tempo:null,lado:false,f:0,comp:0,cue:"Brazos en cruz, círculos pequeños, hombros abajo."},
  {id:"ba_press_lat",  b:"barre",sub:"brazos",nom:"Press lateral con pulso",    eq:"mancuernas",   pat:"pulsos",tempo:null,lado:false,f:0,comp:0,cue:"Sube a la línea del hombro y pulsa arriba."},
  {id:"ba_remo_ballet",b:"barre",sub:"brazos",nom:"Remo inclinado ballet",      eq:"mancuernas",   pat:"reps", tempo:null,lado:false,f:0,comp:0,cue:"Bisagra ligera, tira los codos alto, cuello largo."},
  {id:"ba_iso_cruz",   b:"barre",sub:"brazos",nom:"Isométrico en cruz",         eq:"mancuernas",   pat:"iso",  tempo:null,lado:false,f:0,comp:0,cue:"Brazos en T, sostén hasta que tiemble."},
  {id:"ba_press_pecho",b:"barre",sub:"brazos",nom:"Press de pecho de pie con pulso",eq:"mancuernas", pat:"pulsos",tempo:null,lado:false,f:0,comp:0,cue:"Codos a la altura del pecho, empuja al frente y pulsa."},
  {id:"ba_curl_2a_pulso",b:"barre",sub:"brazos",nom:"Curl en segunda con pulso", eq:"mancuernas",   pat:"pulsos",tempo:null,lado:false,f:0,comp:0,cue:"Sube a 90°, pulsa arriba sin bajar del todo, codos quietos."},
  {id:"ba_tri_dips_cubo",b:"barre",sub:"brazos",nom:"Fondos ballet en el cubo",  eq:"cubo",         pat:"pulsos",tempo:null,lado:false,f:0,comp:0,cue:"Manos en el borde del cubo, codos atrás, pulsos cortos abajo."},
  {id:"ba_serratus",   b:"barre",sub:"brazos",nom:"Serratus punch con pelota",   eq:"pelota",       pat:"pulsos",tempo:null,lado:false,f:0,comp:0,cue:"Brazos largos al frente con la pelota, empuja desde la escápula."},
  {id:"ba_lat_liga",   b:"barre",sub:"brazos",nom:"Elevación lateral con liga",  eq:"liga",         pat:"pulsos",tempo:null,lado:false,f:0,comp:0,cue:"Pisa la liga, sube a la T y pulsa sin encoger el cuello."},

  /* BARRE · muslos en la barra */
  {id:"ba_plie1",      b:"barre",sub:"muslos",nom:"Plié en primera posición",   eq:"peso corporal",pat:"tempo",tempo:"2-1-1",lado:false,f:0,comp:0,cue:"Talones juntos, puntas afuera, baja recta como un ascensor."},
  {id:"ba_plie2_pulso",b:"barre",sub:"muslos",nom:"Plié ancho con pulso",       eq:"peso corporal",pat:"pulsos",tempo:null,lado:false,f:0,comp:0,cue:"Segunda posición, rodillas sobre los tobillos, pulsa abajo."},
  {id:"ba_releve_plie",b:"barre",sub:"muslos",nom:"Relevé en plié",             eq:"peso corporal",pat:"pulsos",tempo:null,lado:false,f:0,comp:0,cue:"Talones altos y juntos, baja el coxis, pulsa."},
  {id:"ba_chair",      b:"barre",sub:"muslos",nom:"Silla en la barra (chair)",  eq:"cubo",         pat:"iso",  tempo:null,lado:false,f:0,comp:0,cue:"Manos en el cubo, muslos paralelos, sostén."},
  {id:"ba_curtsy",     b:"barre",sub:"muslos",nom:"Curtsy con pulso",           eq:"peso corporal",pat:"pulsos",tempo:null,lado:true, f:0,comp:0,cue:"Cruza atrás en diagonal, tronco alto, pulsa abajo."},
  {id:"ba_releve",     b:"barre",sub:"muslos",nom:"Elevación en puntas (relevé)",eq:"cubo",        pat:"reps", tempo:null,lado:false,f:0,comp:0,cue:"Apoyo ligero en el cubo, sube lento al máximo, baja controlado."},
  {id:"ba_plie_pelota",b:"barre",sub:"muslos",nom:"Plié con pelota entre muslos",eq:"pelota",      pat:"iso",  tempo:null,lado:false,f:0,comp:0,cue:"Aprieta la pelota, sostén el plié y añade micro-pulsos."},
  {id:"ba_plie1_releve",b:"barre",sub:"muslos",nom:"Plié en primera con relevé", eq:"peso corporal",pat:"reps",tempo:null,lado:false,f:0,comp:0,cue:"Baja en plié, sube estirando y elévate a media punta."},
  {id:"ba_wide2_hold", b:"barre",sub:"muslos",nom:"Segunda posición sostenida",  eq:"peso corporal",pat:"iso", tempo:null,lado:false,f:0,comp:0,cue:"Muslos paralelos al piso, coxis abajo, sostén hasta temblar."},
  {id:"ba_plie_liga",  b:"barre",sub:"muslos",nom:"Plié con liga en los muslos", eq:"liga",         pat:"pulsos",tempo:null,lado:false,f:0,comp:0,cue:"Empuja las rodillas contra la liga mientras pulsas abajo."},
  {id:"ba_attitude",   b:"barre",sub:"muslos",nom:"Attitude en la barra",        eq:"cubo",         pat:"pulsos",tempo:null,lado:true,f:0,comp:0,cue:"Apoyo en el cubo, rodilla doblada al frente, pulsa arriba."},
  {id:"ba_plie_talon", b:"barre",sub:"muslos",nom:"Plié con elevación de talón alterna",eq:"peso corporal",pat:"reps",tempo:null,lado:true,f:0,comp:0,cue:"Mantén el plié y sube un talón cada vez sin subir la cadera."},
  {id:"ba_chair_pel",  b:"barre",sub:"muslos",nom:"Silla con pelota en la pared", eq:"pelota",       pat:"iso", tempo:null,lado:false,f:0,comp:0,cue:"Pelota en la lumbar contra la pared, muslos paralelos, sostén."},

  /* BARRE · glúteos */
  {id:"ba_arabesque",  b:"barre",sub:"gluteos",nom:"Elevación en arabesque",    eq:"polainas",     pat:"pulsos",tempo:null,lado:true,f:0,comp:0,cue:"Apoyo en el cubo, pierna larga atrás, pulsa desde el glúteo."},
  {id:"ba_bent_knee",  b:"barre",sub:"gluteos",nom:"Rodilla doblada al techo",  eq:"polainas",     pat:"pulsos",tempo:null,lado:true,f:1,comp:0,cue:"Cuadrupedia, talón al techo, cadera cuadrada."},
  {id:"ba_patada_liga",b:"barre",sub:"gluteos",nom:"Patada trasera en la barra", eq:"liga",         pat:"pulsos",tempo:null,lado:true,f:0,comp:0,cue:"Inclina el tronco, empuja el talón atrás contra la liga."},
  {id:"ba_puente_pel", b:"barre",sub:"gluteos",nom:"Puente con pelota y pulso",  eq:"pelota",       pat:"pulsos",tempo:null,lado:false,f:2,comp:0,cue:"Pies sobre la pelota o rodillas apretándola, cadera alta."},
  {id:"ba_clam",       b:"barre",sub:"gluteos",nom:"Almeja (clam) con liga",     eq:"liga",         pat:"reps", tempo:null,lado:true,f:2,comp:0,cue:"Tumbada de lado, abre la rodilla sin rotar la cadera."},
  {id:"ba_puente_iso", b:"barre",sub:"gluteos",nom:"Puente iso + talón elevado", eq:"peso corporal",pat:"iso",  tempo:null,lado:false,f:2,comp:0,cue:"Sube a media punta, sostén el puente alto y quieto."},
  {id:"ba_arabesque_iso",b:"barre",sub:"gluteos",nom:"Arabesque sostenido",      eq:"cubo",         pat:"iso",  tempo:null,lado:true,f:0,comp:0,cue:"Apoyo en el cubo, pierna larga atrás a la altura de la cadera, sostén."},
  {id:"ba_pretzel",    b:"barre",sub:"gluteos",nom:"Pretzel (glúteo sentada)",   eq:"peso corporal",pat:"pulsos",tempo:null,lado:true,f:2,comp:0,cue:"Sentada con la pierna cruzada atrás, elévala pulsando desde el glúteo."},
  {id:"ba_bridge_releve",b:"barre",sub:"gluteos",nom:"Puente en relevé con pulso",eq:"peso corporal",pat:"pulsos",tempo:null,lado:false,f:2,comp:0,cue:"Puente alto sobre medias puntas, pulsa la cadera hacia el techo."},
  {id:"ba_kick_diag_liga",b:"barre",sub:"gluteos",nom:"Patada diagonal con liga", eq:"liga",         pat:"pulsos",tempo:null,lado:true,f:0,comp:0,cue:"Empuja el talón en diagonal atrás y afuera contra la liga."},
  {id:"ba_bent_circle",b:"barre",sub:"gluteos",nom:"Círculos de rodilla doblada", eq:"polainas",     pat:"pulsos",tempo:null,lado:true,f:1,comp:0,cue:"Cuadrupedia, rodilla a 90°, dibuja círculos con el talón arriba."},
  {id:"ba_gluteo_pel_rod",b:"barre",sub:"gluteos",nom:"Puente con pelota entre rodillas",eq:"pelota", pat:"pulsos",tempo:null,lado:false,f:2,comp:0,cue:"Aprieta la pelota entre las rodillas mientras pulsas la cadera arriba."},

  /* BARRE · abdomen (C-curve en el mat) */
  {id:"ba_ccurve",     b:"barre",sub:"abdomen",nom:"C-curve con pulso",         eq:"peso corporal",pat:"pulsos",tempo:null,lado:false,f:2,comp:0,cue:"Enrolla la columna en C, rueda atrás una vértebra y pulsa."},
  {id:"ba_round_pel",  b:"barre",sub:"abdomen",nom:"Round-back con pelota",      eq:"pelota",       pat:"pulsos",tempo:null,lado:false,f:2,comp:0,cue:"Pelota entre las manos, empuja al frente manteniendo la C."},
  {id:"ba_obl_ccurve", b:"barre",sub:"abdomen",nom:"Oblicuos en C-curve",       eq:"peso corporal",pat:"pulsos",tempo:null,lado:true, f:2,comp:0,cue:"Gira el tronco hacia un lado sin perder la C, pulsa."},
  {id:"ba_plancha_dip",b:"barre",sub:"abdomen",nom:"Plancha con caída de cadera",eq:"peso corporal",pat:"pulsos",tempo:null,lado:true, f:2,comp:0,cue:"Antebrazos, gira la cadera y toca el mat, alterna."},
  {id:"ba_leg_ballet", b:"barre",sub:"abdomen",nom:"Elevación de piernas ballet",eq:"peso corporal",pat:"tempo",tempo:"2-0-2",lado:false,f:2,comp:0,cue:"Piernas largas en V, baja lento sin despegar la lumbar."},
  {id:"ba_hollow",     b:"barre",sub:"abdomen",nom:"Hollow con brazos largos",  eq:"peso corporal",pat:"iso",  tempo:null,lado:false,f:2,comp:0,cue:"Brazos por encima de la cabeza, lumbar clavada, sostén."},
  {id:"ba_ccurve_twist",b:"barre",sub:"abdomen",nom:"C-curve con giro y pulso", eq:"peso corporal",pat:"pulsos",tempo:null,lado:true,f:2,comp:0,cue:"Mantén la C, gira el tronco a un lado y pulsa atrás."},
  {id:"ba_low_ccurve", b:"barre",sub:"abdomen",nom:"C-curve bajo en tabletop",  eq:"peso corporal",pat:"pulsos",tempo:null,lado:false,f:2,comp:0,cue:"Rodillas a 90° flotando, rueda más atrás sin soltar la C."},
  {id:"ba_teaser",     b:"barre",sub:"abdomen",nom:"Teaser ballet sostenido",   eq:"peso corporal",pat:"iso",  tempo:null,lado:false,f:2,comp:0,cue:"V con las piernas largas y brazos al frente, sostén y respira."},
  {id:"ba_bicycle_bal",b:"barre",sub:"abdomen",nom:"Bicicleta lenta en C-curve",eq:"peso corporal",pat:"pulsos",tempo:null,lado:true,f:2,comp:0,cue:"Codo a rodilla opuesta despacio, la otra pierna larga."},
  {id:"ba_plank_leg",  b:"barre",sub:"abdomen",nom:"Plancha con elevación de pierna",eq:"polainas", pat:"pulsos",tempo:null,lado:true,f:2,comp:0,cue:"Antebrazos, sube una pierna recta y pulsa sin mover la cadera."},
  {id:"ba_crunch_pel_ext",b:"barre",sub:"abdomen",nom:"Crunch con pelota arriba",eq:"pelota",      pat:"reps", tempo:null,lado:false,f:2,comp:0,cue:"Pelota estirada por encima de la cabeza, sube en bloque."},

  /* BARRE · calentamiento */
  {id:"bw_rolldown", b:"prep",barre:1,nom:"Roll-down de columna",  eq:"peso corporal",pat:"reps",tempo:null,lado:false,f:0,comp:0,cue:"Baja vértebra a vértebra y sube enrollando lento."},
  {id:"bw_plie_suave",b:"prep",barre:1,nom:"Pliés suaves en primera",eq:"peso corporal",pat:"reps",tempo:null,lado:false,f:0,comp:0,cue:"Rango cómodo, calienta rodillas y tobillos."},
  {id:"bw_port_bras",b:"prep",barre:1,nom:"Port de bras",          eq:"peso corporal",pat:"reps",tempo:null,lado:false,f:0,comp:0,cue:"Brazos que dibujan círculos amplios con la respiración."},
  {id:"bw_releve_prep",b:"prep",barre:1,nom:"Relevés de tobillo",  eq:"peso corporal",pat:"reps",tempo:null,lado:false,f:0,comp:0,cue:"Sube y baja los talones despacio para despertar la pantorrilla."},
  {id:"bw_cat_flow", b:"prep",barre:1,nom:"Gato-camello con respiración",eq:"peso corporal",pat:"reps",tempo:null,lado:false,f:1,comp:0,cue:"Moviliza toda la columna al ritmo de inhalar y exhalar."},

  /* BARRE · estiramiento profundo */
  {id:"bz_figure4", b:"cool",barre:1,nom:"Figura 4 sentada",       eq:"peso corporal",pat:"iso",tempo:null,lado:true, f:2,comp:0,cue:"Tobillo sobre la rodilla, lleva el pecho al frente."},
  {id:"bz_split",   b:"cool",barre:1,nom:"Apertura hacia split",   eq:"peso corporal",pat:"iso",tempo:null,lado:true, f:2,comp:0,cue:"Desliza con control, respira en el estiramiento, sin rebotar."},
  {id:"bz_fold",    b:"cool",barre:1,nom:"Flexión de pie en la barra",eq:"cubo",       pat:"iso",tempo:null,lado:false,f:0,comp:0,cue:"Manos en el cubo, alarga la columna hacia delante."},
  {id:"bz_mariposa",b:"cool",barre:1,nom:"Mariposa con enrollado", eq:"peso corporal",pat:"iso",tempo:null,lado:false,f:2,comp:0,cue:"Plantas juntas, redondea la espalda hacia los pies."},
  {id:"bz_pigeon",  b:"cool",barre:1,nom:"Paloma en el mat",       eq:"peso corporal",pat:"iso",tempo:null,lado:true, f:2,comp:0,cue:"Espinilla al frente, cadera cuadrada, baja el pecho."},
  {id:"bz_quad_lado",b:"cool",barre:1,nom:"Cuádriceps tumbada de lado",eq:"peso corporal",pat:"iso",tempo:null,lado:true,f:2,comp:0,cue:"Talón al glúteo, rodillas juntas, empuja la cadera al frente."},

  /* CARDIO (finisher Fuerza) */
  {id:"k_climb",   b:"cardio",nom:"Escaladores",             eq:"peso corporal",pat:"reps",tempo:null,lado:false,f:2,comp:0,cue:"Rodillas rápidas al pecho, cadera baja."},
  {id:"k_skater",  b:"cardio",nom:"Patinador lateral",       eq:"peso corporal",pat:"reps",tempo:null,lado:true, f:0,comp:0,cue:"Salto amplio lado a lado, aterriza suave."},
  {id:"k_jumpsq",  b:"cardio",nom:"Sentadilla con salto",    eq:"peso corporal",pat:"reps",tempo:null,lado:false,f:0,comp:0,cue:"Baja completa, explota arriba, aterriza blando."},
  {id:"k_knees",   b:"cardio",nom:"Rodillas altas",          eq:"peso corporal",pat:"reps",tempo:null,lado:false,f:0,comp:0,cue:"Rodillas por encima de la cadera, brazos activos."},
  {id:"k_burpee",  b:"cardio",nom:"Burpee a plancha",        eq:"peso corporal",pat:"reps",tempo:null,lado:false,f:0,comp:0,cue:"Baja a plancha, vuelve y salta. Ritmo constante."},
  {id:"k_lunge_j", b:"cardio",nom:"Zancada con salto",       eq:"peso corporal",pat:"reps",tempo:null,lado:true, f:0,comp:0,cue:"Cambia de pierna en el aire, tronco erguido."},
  {id:"k_jack",    b:"cardio",nom:"Jumping jacks",           eq:"peso corporal",pat:"reps",tempo:null,lado:false,f:0,comp:0,cue:"Ritmo constante, brazos completos por encima de la cabeza."},
  {id:"k_plank_jack",b:"cardio",nom:"Plancha jack",          eq:"peso corporal",pat:"reps",tempo:null,lado:false,f:2,comp:0,cue:"En plancha alta, abre y cierra los pies con salto, cadera quieta."},
  {id:"k_tuck",    b:"cardio",nom:"Salto con rodillas al pecho",eq:"peso corporal",pat:"reps",tempo:null,lado:false,f:0,comp:0,cue:"Explota arriba llevando las rodillas al pecho, aterriza blando."},
  {id:"k_sprawl",  b:"cardio",nom:"Sprawl (burpee sin flexión)",eq:"peso corporal",pat:"reps",tempo:null,lado:false,f:0,comp:0,cue:"Baja las manos, salta los pies atrás y vuelve rápido."},
  {id:"k_star",    b:"cardio",nom:"Salto estrella",          eq:"peso corporal",pat:"reps",tempo:null,lado:false,f:0,comp:0,cue:"Salta abriendo brazos y piernas en X, aterriza en semisentadilla."},
  {id:"k_squat_pulse_j",b:"cardio",nom:"Sentadilla con pulso y salto",eq:"peso corporal",pat:"reps",tempo:null,lado:false,f:0,comp:0,cue:"Dos pulsos abajo y un salto explosivo arriba."},

  /* CALENTAMIENTO general (extra) */
  {id:"w_worlds_greatest",b:"prep",nom:"El mejor estiramiento del mundo",eq:"peso corporal",pat:"reps",tempo:null,lado:true,f:2,comp:0,cue:"Zancada, codo al suelo por dentro, abre el pecho al techo."},
  {id:"w_banda_hombro",b:"prep",nom:"Dislocaciones de hombro con liga",eq:"liga",pat:"reps",tempo:null,lado:false,f:0,comp:0,cue:"Liga ancha, pásala de adelante hacia atrás con brazos rectos."},
  {id:"w_leg_swings",b:"prep",nom:"Balanceos de pierna",eq:"peso corporal",pat:"reps",tempo:null,lado:true,f:0,comp:0,cue:"Adelante-atrás y lado a lado, apóyate en la pared."},
  {id:"w_march_core",b:"prep",nom:"Marcha con activación de core",eq:"peso corporal",pat:"reps",tempo:null,lado:false,f:0,comp:0,cue:"Rodillas altas controladas, ombligo adentro, no arquees."},

  /* ENFRIAMIENTO general (extra) */
  {id:"z_paloma",  b:"cool",nom:"Postura de la paloma",     eq:"peso corporal",pat:"iso",tempo:null,lado:true, f:2,comp:0,cue:"Espinilla al frente, baja el pecho, respira en la cadera."},
  {id:"z_torsion", b:"cool",nom:"Torsión espinal tumbada",  eq:"peso corporal",pat:"iso",tempo:null,lado:true, f:2,comp:0,cue:"Rodillas a un lado, mirada al lado opuesto, hombros en el mat."},
  {id:"z_cobra",   b:"cool",nom:"Cobra suave",              eq:"peso corporal",pat:"iso",tempo:null,lado:false,f:2,comp:0,cue:"Empuja el pecho al frente, hombros lejos de las orejas."},
  {id:"z_cuello",  b:"cool",nom:"Estiramiento de cuello y trapecio",eq:"peso corporal",pat:"iso",tempo:null,lado:true,f:0,comp:0,cue:"Oreja al hombro, mano suave sobre la cabeza, sin tirar."},
];
const byId = Object.fromEntries(LIB.map(e=>[e.id,e]));
const PROPS = ["mancuernas","liga","polainas","cubo","pelota","peso corporal"];
const EQ_VERB = {mancuernas:"Toma las mancuernas",liga:"Toma la liga",polainas:"Ponte las polainas",cubo:"Acerca el cubo",pelota:"Toma la pelota","peso corporal":"Suelta el material"};
const FLUJO_TXT = {0:"de pie",1:"cuadrupedia",2:"piso"};

/* ============================================================
   2. MÉTODOS, MODOS Y PARÁMETROS
   ============================================================ */
const MODES = {
  sculpt:{
    full:  {nom:"Full Body", desc:"De pie → piso, un solo arco · 3 bloques", flow:true,
            secs:[{key:"upper",  sub:null,nom:"Bloque 1 · De pie",tag:"up"},
                  {key:"lower",  sub:null,nom:"Bloque 2 · De pie → colchoneta",tag:"low"},
                  {key:"pisocore",sub:null,nom:"Bloque 3 · En el piso: glúteo y abdomen",tag:"core"}]},
    upper: {nom:"Solo Upper Body", desc:"Brazo, torso y hombro",
            secs:[{key:"upper",sub:"empuje",nom:"Bloque 1 · Empuje",tag:"up"},
                  {key:"upper",sub:"traccion",nom:"Bloque 2 · Tracción / Espalda",tag:"up"},
                  {key:"upper",sub:"hombro-brazo",nom:"Bloque 3 · Hombro y Brazo",tag:"up"}]},
    pierna:{nom:"Solo Pierna", desc:"Cuádriceps, glúteo e isquios",
            secs:[{key:"lower",sub:"cuadriceps",nom:"Bloque 1 · Cuádriceps",tag:"low"},
                  {key:"lower",sub:"gluteo",nom:"Bloque 2 · Glúteo",tag:"low"},
                  {key:"lower",sub:"isquios",nom:"Bloque 3 · Isquios y Pantorrilla",tag:"low"}]},
    core:  {nom:"Solo Abdomen / Core", desc:"Abdomen, oblicuos y piso",
            secs:[{key:"core",sub:"abdomen",nom:"Bloque 1 · Abdomen",tag:"core"},
                  {key:"core",sub:"oblicuos",nom:"Bloque 2 · Oblicuos",tag:"core"},
                  {key:"core",sub:"estabilidad",nom:"Bloque 3 · Piso y Estabilidad",tag:"core"}]},
  },
  fuerza:{
    full:  {nom:"Fuerza Full", desc:"Empuje · Tracción · Tren inferior",
            secs:[{key:"push",nom:"Bloque 1 · Empuje",tag:"up"},
                  {key:"pull",nom:"Bloque 2 · Tracción",tag:"up"},
                  {key:"legs",nom:"Bloque 3 · Tren inferior",tag:"low"}]},
    torso: {nom:"Fuerza Tren Superior", desc:"Empuje · Tracción · Hombro y brazo",
            secs:[{key:"push",nom:"Bloque 1 · Empuje",tag:"up"},
                  {key:"pull",nom:"Bloque 2 · Tracción",tag:"up"},
                  {key:"arms",nom:"Bloque 3 · Hombro y Brazo",tag:"up"}]},
    pierna:{nom:"Fuerza Tren Inferior", desc:"Rodilla · Bisagra · Accesorio",
            secs:[{key:"knee", nom:"Bloque 1 · Dominante de rodilla",tag:"low"},
                  {key:"hinge",nom:"Bloque 2 · Bisagra de cadera",tag:"low"},
                  {key:"acc",  nom:"Bloque 3 · Accesorio + core",tag:"core"}]},
    gluteoabs:{nom:"Fuerza Glúteo & Abs", desc:"Bisagra · Glúteo · Abdomen",
            secs:[{key:"hinge",    nom:"Bloque 1 · Bisagra de cadera",tag:"low"},
                  {key:"glute_acc",nom:"Bloque 2 · Glúteo",tag:"low"},
                  {key:"abs",      nom:"Bloque 3 · Abdomen",tag:"core"}]},
  },
  barre:{
    full:  {nom:"Barre Full", desc:"Brazos · Muslos · Glúteos · Abdomen",
            secs:[{key:"brazos", sub:"brazos", nom:"Bloque 1 · Brazos",tag:"up"},
                  {key:"muslos", sub:"muslos", nom:"Bloque 2 · Muslos en la barra",tag:"low"},
                  {key:"gluteos",sub:"gluteos",nom:"Bloque 3 · Glúteos",tag:"low"},
                  {key:"abdomen",sub:"abdomen",nom:"Bloque 4 · Abdomen",tag:"core"}]},
    express:{nom:"Barre Express", desc:"Brazos · Muslos · Abdomen",
            secs:[{key:"brazos", sub:"brazos", nom:"Bloque 1 · Brazos",tag:"up"},
                  {key:"muslos", sub:"muslos", nom:"Bloque 2 · Muslos en la barra",tag:"low"},
                  {key:"abdomen",sub:"abdomen",nom:"Bloque 3 · Abdomen",tag:"core"}]},
    piernas:{nom:"Barre Piernas & Glúteos", desc:"Muslos · Glúteos · Abdomen",
            secs:[{key:"muslos", sub:"muslos", nom:"Bloque 1 · Muslos en la barra",tag:"low"},
                  {key:"gluteos",sub:"gluteos",nom:"Bloque 2 · Glúteos",tag:"low"},
                  {key:"abdomen",sub:"abdomen",nom:"Bloque 3 · Abdomen",tag:"core"}]},
  },
};
/* Dificultad — mismo lenguaje de 4 niveles en las 3 clases: Ligera · Media · Pesada · Muy pesada */
const NIVELES = {
  ligera:    {nom:"Ligera",     vueltas:2,rest:"30 s entre bloques",desc:"2 vueltas · técnica y activación"},
  media:     {nom:"Media",      vueltas:2,rest:"20 s entre bloques",desc:"2 vueltas · ritmo sostenido"},
  pesada:    {nom:"Pesada",     vueltas:3,rest:"15 s entre bloques",desc:"3 vueltas · alta densidad"},
  muypesada: {nom:"Muy pesada", vueltas:3,rest:"10 s entre bloques",desc:"3 vueltas · al fallo, sin pausas"},
};
const DURACIONES = {30:{nota:"express · 3 estaciones"},45:{nota:"formato estándar · 4 estaciones"},60:{nota:"clase larga · pasos extra"}};
const OBJETIVOS = {
  ligera:    {nom:"Ligera",     rango:"12–15",mid:13,series:3, descanso:45, desc:"Volumen alto · carga baja"},
  media:     {nom:"Media",      rango:"10–12",mid:11,series:3, descanso:60, desc:"Estándar · carga media"},
  pesada:    {nom:"Pesada",     rango:"6–8",  mid:7, series:4, descanso:80, desc:"Carga alta · 4 series"},
  muypesada: {nom:"Muy pesada", rango:"3–5",  mid:4, series:5, descanso:110,desc:"Máxima carga · casi al fallo"},
};
const BARRE_DIF = {
  ligera:    {nom:"Ligera",     bBase:8, bPorBloque:4, desc:"Cuentas cortas, técnica"},
  media:     {nom:"Media",      bBase:8, bPorBloque:5, desc:"Ritmo sostenido"},
  pesada:    {nom:"Pesada",     bBase:16,bPorBloque:5, desc:"Más cuentas, más ardor"},
  muypesada: {nom:"Muy pesada", bBase:32,bPorBloque:6, desc:"Al fallo, cuentas largas"},
};
/* con fallback a "media": rutinas guardadas antes de este cambio pueden traer claves viejas
   (principiante/intermedio/avanzado, fuerza/hipertrofia/potencia) — nunca deben tronar la app */
function nivelOf(k){ return NIVELES[k] || NIVELES.media; }
function objetivoOf(k){ return OBJETIVOS[k] || OBJETIVOS.media; }
function barreDifOf(k){ return BARRE_DIF[k] || BARRE_DIF.media; }

/* ============================================================
   3. ESTADO
   ============================================================ */
function makeState(){
 const st = {
  screen:"inicio",
  cfg:{
    metodo:"sculpt",
    estilo:"estacion", modo:"full", nivel:"media", duracion:45, base:8, porBloque:6,
    fModo:"full", objetivo:"media", fPorBloque:4, fDuracion:55, descanso:60,
    bModo:"full", bDificultad:"media", bBase:8, bPorBloque:5, bDuracion:50,
    calent:true, enfr:true,
  },
  gustos:LS.get("sf_gustos",["Zion & Lennox","Yandel","Farruko","Bad Bunny","Danny Ocean","Pitbull","Black Eyed Peas","Michael Jackson"]),
  routine:null,
  playlists:LS.get("sf_playlists",[
    {id:pid(),nom:"Sculpt Fluida",tipo:"Full Body",url:"https://open.spotify.com/playlist/3Jp4EkDmya5tMHqX8ygqUq",bpmMin:108,bpmMax:124,energia:"Alta",notas:"Reggaetón clásico y perreo (Zion & Lennox, Yandel, Farruko, Bad Bunny). Arranque a 100, cierre suave. En tu Spotify."},
    {id:pid(),nom:"Fuerza y Cardio Mix",tipo:"Fuerza",url:"https://open.spotify.com/playlist/3UKfdBeeQH0wrwvQF9rQxJ",bpmMin:88,bpmMax:104,energia:"Media",notas:"Reggaetón con pegada + hip-hop (Farruko, Eminem, MJ). Cardio final 128–142. En tu Spotify."},
    {id:pid(),nom:"Barre Clase Intensiva",tipo:"Barre",url:"https://open.spotify.com/playlist/42m9g70CvLSdxHQtB90HEv",bpmMin:118,bpmMax:128,energia:"Media",notas:"Reggaetón melódico + pop urbano (Danny Ocean, Bad Bunny). Constante, cierre lento tipo HUMBE. En tu Spotify."},
  ]),
  saved:LS.get("sf_saved",[]),
  historia:LS.get("sf_historia",{sigs:[],uso:{},ajuste:{}}),
  historial:LS.get("sf_historial",[]),
  musicLib:LS.get("sf_musiclib",[]),
  programas:LS.get("sf_programas",[]),
  uiTab:"rutinas", uiSemanas:4,
  iv:null, modal:null,
 };
 st.historia.ajuste = st.historia.ajuste || {};
 return st;
}
let state = makeState();
/* tras desbloquear la bóveda se vuelve a leer todo desde los datos cifrados */
function hydrateSculpt(){ const keep={screen:state.screen}; state=makeState(); state.screen=keep.screen; }
/* los bloques se renombran "Bloque N · X" al ordenarse; se comparan sin ese prefijo */
function stripBloque(n){ return String(n).replace(/^Bloque \d+ · /,""); }
function secDef(defs,S){ return defs.find(x=>stripBloque(x.nom)===stripBloque(S.nom)); }
function pid(){return "p"+Math.random().toString(36).slice(2,9);}
function uid(){return "x"+Math.random().toString(36).slice(2,9);}
function rid(){return "r"+Math.random().toString(36).slice(2,9);}

/* ============================================================
   4. GENERADOR
   ============================================================ */
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]];}return a;}

/* ---- variedad: nunca la misma rutina dos veces ---- */
function routineSig(r){
  return r.metodo+"|"+r.sections.filter(s=>s.kind==="work")
    .flatMap(s=>s.slots.map(x=>x.ref)).sort().join(",");
}
function freshSort(pool){
  const u=state.historia.uso, aj=state.historia.ajuste;
  const score=e=>(u[e.id]||0)+(aj[e.id]||0);
  return pool.map((e,i)=>[e,i]).sort((A,B)=>(score(A[0])-score(B[0]))||A[1]-B[1]).map(x=>x[0]);
}
function bumpHistoria(r){
  const h=state.historia;
  h.sigs.unshift(routineSig(r)); h.sigs=h.sigs.slice(0,12);
  for(const k in h.uso){ h.uso[k]*=0.5; if(h.uso[k]<0.28) delete h.uso[k]; }
  r.sections.forEach(s=>{ if(s.kind==="work") s.slots.forEach(x=>{ h.uso[x.ref]=(h.uso[x.ref]||0)+1; }); });
  LS.set("sf_historia",h);
}

/* ---- retroalimentación de clase: ajusta qué tan seguido vuelve a salir un ejercicio ---- */
function registrarFeedback(routine,energia,malos,favorito,notaMusica,notaLibre){
  const h=state.historia;
  for(const k in h.ajuste){ h.ajuste[k]*=0.6; if(Math.abs(h.ajuste[k])<0.15) delete h.ajuste[k]; }
  malos.forEach(id=>{ h.ajuste[id]=(h.ajuste[id]||0)+1.6; });
  if(favorito){ h.ajuste[favorito]=(h.ajuste[favorito]||0)-1.1; }
  LS.set("sf_historia",h);
  const entry={id:rid(),fecha:Date.now(),metodo:routine.metodo,nombre:routine.nombre,
    energia,malos:malos.slice(),favorito:favorito||null,notaMusica:notaMusica||"",notaLibre:notaLibre||""};
  state.historial.unshift(entry);
  state.historial=state.historial.slice(0,200);
  LS.set("sf_historial",state.historial);
}

/* ---- programa de progresión semanal ---- */
function resumenCfg(c){
  if(c.metodo==="sculpt") return `${nivelOf(c.nivel).nom} · ${c.porBloque}/bloque`;
  if(c.metodo==="fuerza") return `${objetivoOf(c.objetivo).nom} · ${c.fPorBloque}/bloque`;
  return `${barreDifOf(c.bDificultad).nom} · ${c.bBase} cuentas`;
}
function stepProgramCfg(base,i,total){
  const c=deepClone(base);
  const t = total<=1 ? 1 : i/(total-1);
  if(c.metodo==="sculpt"){
    const niveles=["ligera","media","pesada","muypesada"];
    c.nivel=niveles[Math.min(3,Math.round(t*3))];
    c.porBloque=Math.max(4,Math.min(6,4+Math.round(t*2)));
  } else if(c.metodo==="fuerza"){
    const orden=["ligera","media","pesada","muypesada"];
    c.objetivo=orden[Math.min(3,Math.round(t*3))];
    c.descanso=objetivoOf(c.objetivo).descanso;
    c.fPorBloque=Math.max(3,Math.min(4,3+Math.round(t)));
  } else if(c.metodo==="barre"){
    const orden=["ligera","media","pesada","muypesada"];
    c.bDificultad=orden[Math.min(3,Math.round(t*3))];
    c.bBase=barreDifOf(c.bDificultad).bBase;
    c.bPorBloque=barreDifOf(c.bDificultad).bPorBloque;
  }
  return c;
}
function generateProgram(baseCfg,nSemanas){
  const semanas=[];
  for(let i=0;i<nSemanas;i++){
    const wcfg=stepProgramCfg(baseCfg,i,nSemanas);
    const routine=generate(wcfg);
    semanas.push({n:i+1,routine,resumen:resumenCfg(wcfg)});
  }
  return semanas;
}

/* ---- biblioteca musical (BPM real) ---- */
function bpmDist(bpm,lo,hi){ if(bpm>=lo&&bpm<=hi) return 0; return Math.min(Math.abs(bpm-lo),Math.abs(bpm-hi)); }
function matchTracks(r){
  if(!state.musicLib.length) return null;
  const secs=r.sections.filter(s=>["prep","work","finisher","cardioFin","cool"].includes(s.kind));
  const used=new Set(); let any=false;
  const out=secs.map(S=>{
    const m=sectionMood(S,r);
    const mins=sectionSeconds(S,r)/60;
    const want=Math.max(1,Math.round(mins/3.6));
    let cand=state.musicLib.filter(t=>!used.has(t.id)&&bpmDist(Number(t.bpm),m.lo,m.hi)<=10);
    cand=cand.sort((a,b)=>bpmDist(Number(a.bpm),m.lo,m.hi)-bpmDist(Number(b.bpm),m.lo,m.hi)).slice(0,want);
    cand.forEach(t=>used.add(t.id));
    if(cand.length) any=true;
    return {nom:S.nom.replace(/^Bloque \d+ · /,''),rango:`${m.lo}–${m.hi}`,canciones:cand,tag:S.tag};
  });
  return any?out:null;
}
const EQ_RANK={"mancuernas":0,"liga":1,"polainas":2,"cubo":3,"pelota":4,"peso corporal":5};
function stableFlow(slots){
  // ordena por posición (de pie → piso) y agrupa por material para minimizar cambios
  return slots.map((s,i)=>[s,i]).sort((A,B)=>{
    const a=byId[A[0].ref], b=byId[B[0].ref];
    return (a.f||0)-(b.f||0) || (EQ_RANK[A[0].eq]??9)-(EQ_RANK[B[0].eq]??9) || A[1]-B[1];
  }).map(x=>x[0]);
}
/* enforceFlow: toda la clase en un solo arco de posición — de pie → cuadrupedia → piso,
   sin volver a subir. Reordena TODOS los ejercicios de trabajo del principio al fin
   y los reparte en los bloques respetando su tamaño. Para clases fluidas (Sculpt, Barre). */
function enforceFlow(sections){
  const kinds=["work","finisher"];
  const flat=[];
  sections.forEach(s=>{ if(kinds.includes(s.kind)) s.slots.forEach(sl=>flat.push(sl)); });
  const sorted=flat.map((sl,i)=>[sl,i]).sort((A,B)=>{
    const a=byId[A[0].ref], b=byId[B[0].ref];
    return (a.f||0)-(b.f||0) || (EQ_RANK[A[0].eq]??9)-(EQ_RANK[B[0].eq]??9) || A[1]-B[1];
  }).map(x=>x[0]);
  let k=0;
  sections.forEach(s=>{ if(kinds.includes(s.kind)){ const n=s.slots.length; s.slots=sorted.slice(k,k+n); k+=n; } });
}
function relabelByPosition(sections){
  const work=sections.filter(s=>s.kind==="work");
  work.forEach((s,i)=>{
    const fs=s.slots.map(sl=>byId[sl.ref].f||0);
    const stand=fs.filter(f=>f===0).length, floor=fs.filter(f=>f===2).length;
    let etiqueta = stand===fs.length ? "De pie"
      : floor===fs.length ? "En el mat"
      : stand>=floor ? "De pie y bajada al mat" : "En el mat";
    s.nom=`Bloque ${i+1} · ${etiqueta}`;
    if(i===work.length-1 && etiqueta==="En el mat") s.nom=`Bloque ${i+1} · En el mat: glúteo y abdomen`;
  });
}
function slot(ex){return {uid:uid(),ref:ex.id,pat:ex.pat,base:null,tempo:ex.tempo,lado:ex.lado,eq:ex.eq,nota:"",trans:""};}

/* ---- SCULPT ---- */
function subAvgF(sd){ const p=sculptPool(sd,new Set()); return p.length?p.reduce((s,e)=>s+(e.f||0),0)/p.length:0; }
function sculptPool(sd,used){
  let pool;
  if(sd.key==="pisocore") pool = LIB.filter(e=>((e.b==="core")||(e.b==="lower"&&(e.f||0)===2)) && !used.has(e.id));
  else pool = LIB.filter(e=>e.b===sd.key && (!sd.sub||e.sub===sd.sub) && !used.has(e.id));
  if(pool.length<3) pool = LIB.filter(e=>(sd.key==="pisocore"?(e.b==="core"):e.b===sd.key) && !used.has(e.id));
  return pool;
}
function pickSculpt(sd,count,used){
  let pool=freshSort(shuffle(sculptPool(sd,used)));
  const chosen=[];
  for(const t of ["iso","pulsos"]){ const c=pool.find(e=>e.pat===t&&!chosen.includes(e)); if(c&&chosen.length<count)chosen.push(c); }
  for(const e of pool){ if(chosen.length>=count)break; if(!chosen.includes(e))chosen.push(e); }
  chosen.forEach(e=>used.add(e.id));
  return chosen.slice(0,count);
}
function generateSculpt(cfg){
  if((cfg.estilo||"estacion")==="estacion") return generateEstacion(cfg);   // tu forma real de dar clase
  const mode=MODES.sculpt[cfg.modo];
  const per=cfg.porBloque||6, nv=nivelOf(cfg.nivel);
  const used=new Set(), sections=[];
  if(cfg.calent) sections.push({id:rid(),nom:"Calentamiento",tag:"prep",kind:"prep",
    slots:stableFlow(shuffle(LIB.filter(e=>e.b==="prep"&&e.id!=="w_aprox")).slice(0,4).map(slot))});
  // ordena los bloques del más de pie al más de piso, para un arco continuo sin volver a subir
  const orderedSecs=mode.secs.map(sd=>[sd,subAvgF(sd)]).sort((a,b)=>a[1]-b[1]).map(x=>x[0]);
  orderedSecs.forEach((sd,i)=>{
    sections.push({id:rid(),nom:`Bloque ${i+1} · ${sd.nom.replace(/^Bloque \d+ · /,'')}`,tag:sd.tag,kind:"work",
      slots:stableFlow(pickSculpt(sd,per,used).map(slot))});
  });
  // finisher de core en el piso
  const iso=shuffle(LIB.filter(e=>e.b==="core"&&e.pat==="iso"));
  const pul=shuffle(LIB.filter(e=>e.b==="core"&&e.pat==="pulsos"&&!iso.includes(e)));
  const fin=[iso[0],pul[0]].filter(Boolean);
  sections.push({id:rid(),nom:"Finisher · Core en el piso",tag:"core",kind:"finisher",slots:fin.map(slot)});
  if(cfg.enfr) sections.push({id:rid(),nom:"Enfriamiento",tag:"prep",kind:"cool",
    slots:stableFlow(shuffle(LIB.filter(e=>e.b==="cool"&&!e.barre)).slice(0,4).map(slot))});
  enforceFlow(sections); relabelByPosition(sections);   // toda clase Sculpt: un solo arco de posición, sin volver a pararse
  computeTransitions(sections,"sculpt",null);
  return {
    id:rid(), metodo:"sculpt",
    nombre:`Sculpt · ${mode.nom} · ${cfg.duracion} min`,
    modo:cfg.modo, nivel:cfg.nivel, duracion:cfg.duracion, base:cfg.base, porBloque:per,
    vueltas:nv.vueltas, rest:nv.rest, sections, creada:Date.now(),
  };
}

/* ---- FUERZA ---- */
function fuerzaPool(key){
  if(key==="push") return LIB.filter(e=>e.b==="upper"&&e.sub==="empuje");
  if(key==="pull") return LIB.filter(e=>e.b==="upper"&&e.sub==="traccion");
  if(key==="arms") return LIB.filter(e=>e.b==="upper"&&e.sub==="hombro-brazo");
  if(key==="legs") return LIB.filter(e=>e.b==="lower"&&e.comp);
  if(key==="knee") return LIB.filter(e=>e.b==="lower"&&e.mov==="rodilla");
  if(key==="hinge")return LIB.filter(e=>e.b==="lower"&&e.mov==="bisagra");
  if(key==="acc")  return LIB.filter(e=>(e.b==="lower"&&e.mov==="accesorio")||(e.b==="core"&&["abdomen","estabilidad"].includes(e.sub)));
  if(key==="glute_acc") return LIB.filter(e=>e.b==="lower"&&e.sub==="gluteo");
  if(key==="abs")  return LIB.filter(e=>e.b==="core"&&["abdomen","oblicuos"].includes(e.sub)&&(e.f||0)===2);
  return [];
}
function pickFuerza(key,count,used){
  let pool=fuerzaPool(key).filter(e=>!used.has(e.id));
  let strong=pool.filter(e=>e.pat!=="pulsos");
  if(strong.length<count) strong=pool;
  strong=freshSort(shuffle(strong)).sort((a,b)=>(b.comp||0)-(a.comp||0)||(a.f||0)-(b.f||0));
  const chosen=strong.slice(0,count);
  chosen.forEach(e=>used.add(e.id));
  return chosen;
}
function generateFuerza(cfg){
  const mode=MODES.fuerza[cfg.fModo];
  const per=cfg.fPorBloque||3, ob=objetivoOf(cfg.objetivo);
  const descanso=cfg.descanso||ob.descanso;
  const used=new Set(), sections=[];
  if(cfg.calent) sections.push({id:rid(),nom:"Activación y movilidad",tag:"prep",kind:"prep",
    slots:stableFlow(shuffle(LIB.filter(e=>e.b==="prep"&&!e.barre)).slice(0,4).map(slot))});
  // ordena los bloques del más de pie al más de piso para minimizar transiciones
  const fAvg=key=>{ const p=fuerzaPool(key); return p.length?p.reduce((s,e)=>s+(e.f||0),0)/p.length:0; };
  const ordered=mode.secs.map(sd=>[sd,fAvg(sd.key)]).sort((a,b)=>a[1]-b[1]).map(x=>x[0]);
  ordered.forEach((sd,i)=>{
    sections.push({id:rid(),nom:`Bloque ${i+1} · ${sd.nom.replace(/^Bloque \d+ · /,'')}`,tag:sd.tag,kind:"work",
      slots:stableFlow(pickFuerza(sd.key,per,used).map(slot))});  // compuestos y de pie primero
  });
  const cardio=shuffle(LIB.filter(e=>e.b==="cardio")).slice(0,3);
  sections.push({id:rid(),nom:"Finisher · Cardio metabólico",tag:"cardio",kind:"cardioFin",
    protocolo:{work:40,rest:20,rondas:3}, slots:cardio.map(slot)});
  if(cfg.enfr) sections.push({id:rid(),nom:"Enfriamiento",tag:"prep",kind:"cool",
    slots:stableFlow(shuffle(LIB.filter(e=>e.b==="cool"&&!e.barre)).slice(0,4).map(slot))});
  computeTransitions(sections,"fuerza",descanso);
  return {
    id:rid(), metodo:"fuerza",
    nombre:`Fuerza · ${mode.nom} · ${cfg.fDuracion} min`,
    fModo:cfg.fModo, objetivo:cfg.objetivo, rango:ob.rango, series:ob.series, descanso,
    duracion:cfg.fDuracion, porBloque:per, sections, creada:Date.now(),
  };
}
/* ---- BARRE ---- */
function barrePool(sub,used){
  let pool=LIB.filter(e=>e.b==="barre"&&e.sub===sub&&!used.has(e.id));
  if(pool.length<3) pool=LIB.filter(e=>e.b==="barre"&&e.sub===sub);
  return pool;
}
function pickBarre(sub,count,used){
  let pool=freshSort(shuffle(barrePool(sub,used)));
  const chosen=[];
  for(const t of ["iso"]){ const c=pool.find(e=>e.pat===t&&!chosen.includes(e)); if(c&&chosen.length<count)chosen.push(c); }
  for(const e of pool){ if(chosen.length>=count)break; if(!chosen.includes(e))chosen.push(e); }
  chosen.forEach(e=>used.add(e.id));
  return chosen.slice(0,count);
}
function generateBarre(cfg){
  const mode=MODES.barre[cfg.bModo];
  const per=cfg.bPorBloque||5;
  const used=new Set(), sections=[];
  if(cfg.calent) sections.push({id:rid(),nom:"Calentamiento",tag:"prep",kind:"prep",
    slots:stableFlow(shuffle(LIB.filter(e=>e.b==="prep"&&(e.barre||["w_brazos","w_squat_air","w_flow"].includes(e.id)))).slice(0,4).map(slot))});
  const bAvg=sub=>{ const p=LIB.filter(e=>e.b==="barre"&&e.sub===sub); return p.length?p.reduce((s,e)=>s+(e.f||0),0)/p.length:0; };
  const orderedSecs=mode.secs.map(sd=>[sd,bAvg(sd.sub)]).sort((a,b)=>a[1]-b[1]).map(x=>x[0]);
  orderedSecs.forEach((sd,i)=>{
    sections.push({id:rid(),nom:`Bloque ${i+1} · ${sd.nom.replace(/^Bloque \d+ · /,'')}`,tag:sd.tag,kind:"work",
      slots:stableFlow(pickBarre(sd.sub,per,used).map(slot))});
  });
  if(cfg.enfr) sections.push({id:rid(),nom:"Estiramiento profundo",tag:"prep",kind:"cool",
    slots:stableFlow(shuffle(LIB.filter(e=>e.b==="cool")).sort((a,b)=>(b.barre||0)-(a.barre||0)).slice(0,4).map(slot))});
  computeTransitions(sections,"barre",null);   // bloques ya ordenados de pie→piso + stableFlow interno
  return {
    id:rid(), metodo:"barre",
    nombre:`Barre · ${mode.nom} · ${cfg.bDuracion} min`,
    bModo:cfg.bModo, bDificultad:cfg.bDificultad||"media", base:cfg.bBase, porBloque:per, duracion:cfg.bDuracion,
    vueltas:2, rest:"sin pausa · flujo continuo", sections, creada:Date.now(),
  };
}
function _generate(cfg){
  if(cfg.metodo==="fuerza") return generateFuerza(cfg);
  if(cfg.metodo==="barre")  return generateBarre(cfg);
  return generateSculpt(cfg);
}
function generate(cfg){
  let r, t=0;
  do { r=_generate(cfg); t++; } while(t<7 && state.historia.sigs.includes(routineSig(r)));
  bumpHistoria(r);
  return r;
}

function computeTransitions(sections,metodo,descanso){
  let prevEq=null, prevF=null, prevKind=null;
  sections.forEach(sec=>{
    sec.slots.forEach(s=>{
      const ex=byId[s.ref];
      const cur=s.eq, curF=ex.f||0;
      let parts=[];
      if(metodo==="fuerza" && (sec.kind==="work")){
        parts.push(`Descanso ${descanso} s`);
        if(prevEq!==null && cur!==prevEq && EQ_VERB[cur]) parts.push(EQ_VERB[cur]);
      } else {
        // sculpt · fluidez de posición (continua entre bloques de trabajo)
        const corte = prevF===null || sec.kind==="prep" || sec.kind==="cool" || prevKind==="prep" || prevKind==="cool";
        if(corte){
          if(cur!=="peso corporal" && EQ_VERB[cur]) parts.push(EQ_VERB[cur]);
        } else {
          if(curF>prevF) parts.push(curF===2?"Baja al mat":"A cuadrupedia");
          else if(curF<prevF) parts.push(curF===0?"Ponte de pie":"A cuadrupedia");
          else if(curF===2) parts.push("Sin levantarte");
          if(cur!==prevEq && EQ_VERB[cur]) parts.push(EQ_VERB[cur]);
        }
      }
      s.trans=parts.join(" · ");
      s.restCue = metodo==="fuerza" && sec.kind==="work";
      prevEq=cur; prevF=curF; prevKind=sec.kind;
    });
  });
}

/* ============================================================
   5. RESOLUCIÓN / FORMATO
   ============================================================ */
function resolve(s){
  const ex=byId[s.ref];
  return {
    nom:ex.nom, cue:ex.cue, b:ex.b, sub:ex.sub, f:ex.f||0,
    pat:s.pat||ex.pat, base:s.base||null,
    tempo:s.tempo!==undefined?s.tempo:ex.tempo,
    lado:s.lado!==undefined?s.lado:ex.lado,
    eq:s.eq||ex.eq, nota:s.nota||"", trans:s.trans||"",
    q:s.q||null, side:s.side||null,
  };
}
function schemeText(rs,routine,kind){
  if(rs.q){ const t=estQTxt(rs.q); return {n:t.n,u:t.u,tempo:"",station:true,qt:rs.q.t}; }   // paso de estación: reps, hold, pulsos o a la falla
  if(kind==="prep") return {n:"8–10",u:"reps de activación",tempo:""};
  if(kind==="cool") return {n:"20–30",u:"s de sostén",tempo:""};
  if(routine.metodo==="fuerza" && (kind==="work")){
    return {n:`${routine.series} × ${routine.rango}`,u:"reps",tempo:rs.tempo?("tempo "+rs.tempo):"",strength:true};
  }
  if(kind==="cardioFin"){
    const p=routine.sections.find(x=>x.kind==="cardioFin").protocolo;
    return {n:`${p.work} s`,u:`trabajo / ${p.rest} s · ${p.rondas} rondas`,tempo:""};
  }
  if(routine.metodo==="barre"){
    const b=rs.base||routine.base||16;
    if(rs.pat==="iso")    return {n:"20–40",u:"s de sostén",tempo:rs.tempo?("tempo "+rs.tempo):""};
    if(rs.pat==="pulsos") return {n:b,u:"pulsos · hasta que tiemble",tempo:""};
    if(rs.pat==="tempo")  return {n:Math.round(b/2),u:"reps lentas",tempo:rs.tempo?("tempo "+rs.tempo):""};
    return {n:b,u:"reps",tempo:""};
  }
  const base=rs.base||routine.base||9;
  if(rs.pat==="iso")    return {n:base,u:"tempos en iso",tempo:rs.tempo?("tempo "+rs.tempo):""};
  if(rs.pat==="pulsos") return {n:base,u:"pulsos",tempo:""};
  if(rs.pat==="tempo")  return {n:base,u:"reps",tempo:rs.tempo?("tempo "+rs.tempo):""};
  return {n:base,u:"reps",tempo:""};
}
function fmtClock(sec){const m=Math.floor(sec/60),s=Math.max(0,sec%60);return m+":"+String(s).padStart(2,"0");}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));}
function tagColor(tag){ return {up:"var(--up)",low:"var(--low)",core:"var(--core)",cardio:"var(--cardio)"}[tag] || "var(--prep)"; }
function metodoColor(m){ return {fuerza:"var(--fuerza)",barre:"var(--barre)"}[m] || "var(--sculpt)"; }
function playlistFor(routine){
  const want = routine.metodo==="fuerza" ? "Fuerza"
    : routine.metodo==="barre" ? "Barre"
    : ({full:"Full Body",upper:"Upper",pierna:"Pierna",core:"Core"})[routine.modo];
  return state.playlists.find(p=>p.tipo===want) || state.playlists.find(p=>p.tipo==="General") || null;
}
function sectionSeconds(S,r){
  if(r.estilo==="estacion"&&S.kind!=="prep") return estSegundosSec(S,r);
  if(S.kind==="prep") return 240;
  if(S.kind==="cool") return 180;
  if(S.kind==="cardioFin"){ const p=S.protocolo; return S.slots.length*(p.work+p.rest)*p.rondas + 40; }
  if(S.kind==="finisher"){ let sec=15; S.slots.forEach(s=>{sec += (resolve(s).lado?2:1)*30 + 8;}); return sec; }
  if(r.metodo==="fuerza"){
    const mid=objetivoOf(r.objetivo).mid; let sec=0;
    S.slots.forEach(s=>{ sec += r.series*(mid*3 + r.descanso) + 10; });
    return sec;
  }
  if(r.metodo==="barre"){
    let block=0; S.slots.forEach(s=>{ block += (resolve(s).lado?2:1)*44 + 8; });
    return 2*block + 15;
  }
  let block=0; S.slots.forEach(s=>{ block += (resolve(s).lado?2:1)*28 + 6; });
  return nivelOf(r.nivel).vueltas*block + 20;
}
function estimateMinutes(r){
  let sec=0;
  r.sections.forEach(S=>{ sec += sectionSeconds(S,r); });
  return Math.round(sec/60);
}

/* ---- brief de playlist ---- */
/* la música sigue el mood y la intensidad de CADA bloque de la rutina */
function sectionMood(S,r){
  if(r.estilo==="estacion"){ const m=estMood(S,r); if(m) return m; }
  if(S.kind==="prep")   return {lo:96, hi:108, en:"entrada en calor, groove suave"};
  if(S.kind==="cool")   return {lo:66, hi:82,  en:"bajar pulsaciones, lento y respirado"};
  if(S.kind==="cardioFin") return {lo:130,hi:145,en:"máxima intensidad, subidón para los intervalos"};
  if(S.kind==="finisher")  return {lo:112,hi:126,en:"quema final, insistente y sin bajar"};
  // bloque de trabajo: intensidad según la mezcla de patrones
  const n=S.slots.length||1; let hi=0, iso=0, lado=0;
  S.slots.forEach(s=>{ const rs=resolve(s); if(rs.pat==="pulsos"||rs.pat==="reps")hi++; else if(rs.pat==="iso")iso++; if(rs.lado)lado++; });
  if(r.metodo==="fuerza") return {lo:88, hi:104, en:"groove con pegada, constante para levantar en series"};
  if(iso/n>0.4)  return {lo:100,hi:113,en:"marcado y sostenido, aguanta los isométricos"};
  if(hi/n>0.6)   return {lo:116,hi:127,en:"alto y bailable, empuja cada pulso"};
  return {lo:110,hi:121,en:"ritmo medio-alto y constante"};
}
/* ---- la app propone artistas por nivel de energía, no solo repite tus favoritos ---- */
const ARTISTAS_ENERGIA = {
  suave: ["HUMBE","Rauw Alejandro","Kali Uchis","Feid"],
  media: ["Zion & Lennox","Wisin & Yandel","Carlitos Rossy","Jhayco"],
  alta:  ["Bad Bunny","Farruko","Ozuna","Myke Towers"],
  maxima:["Pitbull","Black Eyed Peas","Don Omar","Arcángel"],
};
function energiaTier(lo,hi){
  const mid=(lo+hi)/2;
  if(mid<90) return "suave";
  if(mid<110) return "media";
  if(mid<125) return "alta";
  return "maxima";
}
function sugerirArtistas(tier,n){
  const tenidos=new Set(state.gustos.map(g=>g.toLowerCase()));
  const pool=(ARTISTAS_ENERGIA[tier]||[]).filter(a=>!tenidos.has(a.toLowerCase()));
  return pool.slice(0,n||2);
}
function playlistBrief(r){
  const min=estimateMinutes(r);
  const artistas=state.gustos.slice(0,5).join(", ");
  const secs=r.sections.filter(s=>["prep","work","finisher","cardioFin","cool"].includes(s.kind));
  const curva=secs.map(S=>{
    const m=sectionMood(S,r);
    const tier=energiaTier(m.lo,m.hi);
    return {nom:S.nom.replace(/^Bloque \d+ · /,''),bpm:`${m.lo}–${m.hi}`,en:m.en,tier,sugeridos:sugerirArtistas(tier,2)};
  });
  const arco=curva.map(c=>`${c.nom} ${c.bpm} BPM (${c.en})${c.sugeridos.length?' — prueba '+c.sugeridos.join(' o '):''}`).join("; ");
  const estiloTxt = r.metodo==="fuerza"
      ? `reggaetón con pegada y hip-hop de gimnasio al estilo de ${artistas}`
      : r.metodo==="barre"
      ? `reggaetón melódico y pop urbano bailable al estilo de ${artistas}, sin baladas en la parte de trabajo`
      : `reggaetón clásico, perreo y pop urbano bailable al estilo de ${artistas}`;
  const cierre = r.metodo==="fuerza"
      ? "y termina con un tema tranquilo para estirar"
      : r.metodo==="barre"
      ? "y cierra con 4–5 minutos lentos (70–80 BPM) para estirar"
      : "y cierra suave para el enfriamiento";
  const nombreClase = r.metodo==="fuerza"?`Fuerza ${MODES.fuerza[r.fModo].nom}`:r.metodo==="barre"?`Barre ${MODES.barre[r.bModo].nom}`:`Sculpt ${MODES.sculpt[r.modo].nom}`;
  const prompt=`Crea una playlist de ${min} minutos para dar una clase de ${nombreClase}. Estilo: ${estiloTxt}. La energía debe seguir la clase bloque por bloque: ${arco}; ${cierre}. Que el ritmo esté siempre bien marcado para contar repeticiones y pulsos.`;
  return {min,curva,prompt};
}

/* ============================================================
   6. RENDER
   ============================================================ */
const app=document.getElementById("app");
const nav=document.getElementById("nav");
const overlay=document.getElementById("overlay");

/* ---------- INICIO ---------- */
function viewInicio(){
  const c=state.cfg;
  const modes=MODES[c.metodo];
  const modoKey=c.metodo==="fuerza"?c.fModo:c.metodo==="barre"?c.bModo:c.modo;
  const params=c.metodo==="fuerza"?fuerzaParams(c):c.metodo==="barre"?barreParams(c):sculptParams(c);
  const pv=previewCounts(c);
  return `
  <div class="wrap">
    <header class="hero">
      <span class="eyebrow">Planificador de clases</span>
      <h1>Tres clases,<br>un estudio<span class="o">.</span></h1><!-- Sculpt · Fuerza · Barre -->
      <p><b>Sculpt</b>: estaciones en capas (entrada, hold, pulsos, liga, a la falla), conteo en 8, reto final y cierre. <b>Fuerza</b>: por patrón de movimiento, series con descanso, cierra con cardio. <b>Barre</b>: ballet, pulsos y sostenes en 8, continua, termina estirando. Elige una y genera la rutina + el brief de playlist.</p>
    </header>

    <div class="setup">
      <div class="field">
        <label class="lbl"><span class="eyebrow">Método</span></label>
        <div class="metodo-grid">
          <button class="metodo ${c.metodo==='sculpt'?'on':''}" data-action="set-metodo" data-v="sculpt" style="--tag:var(--sculpt)">
            <span class="t">Sculpt</span>
            <span class="d">Estaciones en capas · base 8 · reto final y cierre</span>
          </button>
          <button class="metodo ${c.metodo==='fuerza'?'on':''}" data-action="set-metodo" data-v="fuerza" style="--tag:var(--fuerza)">
            <span class="t">Fuerza</span>
            <span class="d">Por patrón · series con descanso · termina en cardio</span>
          </button>
          <button class="metodo ${c.metodo==='barre'?'on':''}" data-action="set-metodo" data-v="barre" style="--tag:var(--barre)">
            <span class="t">Barre</span>
            <span class="d">Ballet · pulsos y sostenes en 8 · fluida · termina estirando</span>
          </button>
        </div>
      </div>

      <div class="field">
        <label class="lbl"><span class="eyebrow">1 · Tipo de clase</span></label>
        <div class="mode-grid" style="${Object.keys(modes).length<4?'grid-template-columns:repeat('+Object.keys(modes).length+',1fr)':''}">
          ${Object.entries(modes).map(([k,m],i)=>`
            <button class="mode ${modoKey===k?'on':''}" data-action="set-modo" data-v="${k}">
              <span class="num">0${i+1}</span>
              <span class="t">${m.nom}</span>
              <span class="blocks">
                ${(c.metodo==='sculpt'&&(c.estilo||'estacion')==='estacion')?estModoBloquesHtml(k):m.secs.map(s=>`<span class="b-${s.tag==='up'?'up':s.tag==='low'?'low':'core'}">${s.nom.replace(/^Bloque \d+ · /,'')}</span>`).join("")}
              </span>
            </button>`).join("")}
        </div>
      </div>

      ${params}

      <div class="panel">
        <div class="field" style="gap:12px">
          <label class="lbl"><span class="eyebrow">Perfil musical</span></label>
          <p class="hint">Se usa para el brief de playlist de cada rutina. Tomado de tu Spotify — edítalo cuando quieras.</p>
          <div class="tastes">
            ${state.gustos.map((g,i)=>`<span class="taste">${esc(g)}<button data-action="taste-del" data-i="${i}" aria-label="Quitar">✕</button></span>`).join("")}
            <button class="btn ghost sm" data-action="taste-add">+ Añadir artista</button>
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="toggle-line">
          <label class="switch"><input type="checkbox" data-action="toggle" data-k="calent" ${c.calent?'checked':''}><span class="track"></span>Incluir calentamiento</label>
          <label class="switch"><input type="checkbox" data-action="toggle" data-k="enfr" ${c.enfr?'checked':''}><span class="track"></span>Incluir enfriamiento</label>
        </div>
      </div>

      <div class="cta-row">
        <button class="btn primary big" data-action="generate">⚡ Generar rutina</button>
        <span class="est">${pv}</span>
      </div>
      <p class="hint" style="margin-top:2px">Cada rutina sale distinta: rota los ejercicios y nunca repite una clase ya generada. Pulsa <b>Regenerar</b> las veces que quieras.</p>
      <div class="mini-links">
        <button class="btn ghost sm" data-action="go" data-screen="playlists">🎧 Playlists</button>
        <button class="btn ghost sm" data-action="go" data-screen="guardadas">💾 Guardadas (${state.saved.length})</button>
      </div>
    </div>
  </div>`;
}
function sculptParams(c){
  return `
  <div class="field">
    <label class="lbl"><span class="eyebrow">2 · Dificultad</span></label>
    <div class="opt-row">
      ${Object.entries(NIVELES).map(([k,n])=>`
        <button class="opt ${c.nivel===k?'on':''}" data-action="set-nivel" data-v="${k}">
          <span class="t">${n.nom}</span><span class="d">${(c.estilo||'estacion')==='estacion'?EST_DESC[k]:n.desc}</span>
        </button>`).join("")}
    </div>
  </div>
  <div class="field">
    <label class="lbl"><span class="eyebrow">3 · Duración</span></label>
    <div class="opt-row">
      ${Object.keys(DURACIONES).map(d=>`
        <button class="opt ${String(c.duracion)===d?'on':''}" data-action="set-dur" data-v="${d}">
          <span class="t">${d} min</span><span class="d">${DURACIONES[d].nota}</span>
        </button>`).join("")}
    </div>
  </div>
  <div class="panel">
    <div class="field" style="gap:14px">
      <label class="lbl"><span class="eyebrow">Estilo de clase</span></label>
      <div class="seg"><button data-action="set-estilo" data-v="estacion" class="${(c.estilo||"estacion")==="estacion"?'on':''}">Estaciones · como tus clases</button><button data-action="set-estilo" data-v="lista" class="${c.estilo==="lista"?'on':''}">Lista de ejercicios</button></div>
      ${(c.estilo||"estacion")==="estacion"?`<p class="hint"><b>Estaciones</b>: cada bloque es una posición trabajada en capas — entrada, hold, pulsos, liga, variante y hold a la falla. Glúteo con <b>Lado A</b> completo y luego <b>Lado B</b>, abdomen con 4 movimientos distintos, <b>Reto final</b> y <b>Cierre</b> con relajación. Material: mancuernas, silla o cubo, liga y polainas.</p>`
      :`<div class="seg">${[4,5,6].map(n=>`<button data-action="set-porbloque" data-v="${n}" class="${c.porBloque===n?'on':''}">3 bloques × ${n}</button>`).join("")}</div>
      <p class="hint">Formato anterior: <b>3 bloques de 6</b> ejercicios sueltos en mat.</p>`}
      <label class="lbl" style="margin-top:4px"><span class="eyebrow" style="color:var(--muted)">Sistema de repeticiones</span></label>
      <div class="seg">${[8,10,12].map(b=>`<button data-action="set-base" data-v="${b}" class="${c.base===b?'on':''}">Bloques de ${b}</button>`).join("")}</div>
      <p class="hint">Cada serie se cuenta en bloques de <b>${c.base}</b> — reps, pulsos o tempos en iso. Por defecto <b>8</b>.</p>
    </div>
  </div>`;
}
function fuerzaParams(c){
  const ob=objetivoOf(c.objetivo);
  return `
  <div class="field">
    <label class="lbl"><span class="eyebrow">2 · Dificultad</span></label>
    <div class="opt-row">
      ${Object.entries(OBJETIVOS).map(([k,o])=>`
        <button class="opt ${c.objetivo===k?'on':''}" data-action="set-objetivo" data-v="${k}">
          <span class="t">${o.nom}</span><span class="d">${o.desc}</span>
        </button>`).join("")}
    </div>
  </div>
  <div class="field">
    <label class="lbl"><span class="eyebrow">3 · Duración</span></label>
    <div class="opt-row">
      ${[45,55,65].map(d=>`
        <button class="opt ${c.fDuracion===d?'on':''}" data-action="set-fdur" data-v="${d}">
          <span class="t">${d} min</span><span class="d">${d===45?'directo':d===55?'estándar':'completa'}</span>
        </button>`).join("")}
    </div>
  </div>
  <div class="panel">
    <div class="field" style="gap:14px">
      <label class="lbl"><span class="eyebrow">Estructura</span></label>
      <div class="seg">${[3,4,5].map(n=>`<button data-action="set-fporbloque" data-v="${n}" class="${c.fPorBloque===n?'on':''}">3 bloques × ${n}</button>`).join("")}</div>
      <p class="hint">Fuerza va por patrón: <b>Empuje · Tracción · Tren inferior</b> (o Rodilla · Bisagra · Accesorio). Compuestos primero, ${ob.series} series por ejercicio.</p>
      <label class="lbl" style="margin-top:4px"><span class="eyebrow" style="color:var(--muted)">Descanso entre series</span></label>
      <div class="seg">${[45,60,90,120].map(d=>`<button data-action="set-descanso" data-v="${d}" class="${c.descanso===d?'on':''}">${d} s</button>`).join("")}</div>
    </div>
  </div>`;
}
function barreParams(c){
  return `
  <div class="field">
    <label class="lbl"><span class="eyebrow">2 · Duración</span></label>
    <div class="opt-row">
      ${[35,50,60].map(d=>`
        <button class="opt ${c.bDuracion===d?'on':''}" data-action="set-bdur" data-v="${d}">
          <span class="t">${d} min</span><span class="d">${d===35?'express':d===50?'estándar':'completa'}</span>
        </button>`).join("")}
    </div>
  </div>
  <div class="field">
    <label class="lbl"><span class="eyebrow">3 · Dificultad</span></label>
    <div class="opt-row">
      ${Object.entries(BARRE_DIF).map(([k,d])=>`
        <button class="opt ${c.bDificultad===k?'on':''}" data-action="set-bdificultad" data-v="${k}">
          <span class="t">${d.nom}</span><span class="d">${d.desc} · ${d.bBase} cuentas</span>
        </button>`).join("")}
    </div>
  </div>
  <div class="panel">
    <div class="field" style="gap:14px">
      <label class="lbl"><span class="eyebrow">Estructura</span></label>
      <p class="hint">Barre por bloques: <b>Brazos · Muslos en la barra · Glúteos · Abdomen</b>, encadenados sin pausa. La barra la hace el cubo o la pared. Termina estirando en el mat.</p>
      <p class="hint">Pulsos y sostenes en cuentas de <b>${c.bBase}</b> — trabaja al fallo, "hasta que tiemble". Por defecto <b>8</b>.</p>
    </div>
  </div>`;
}
function previewCounts(c){
  if(c.metodo==="fuerza"){
    const ob=objetivoOf(c.objetivo);
    return `≈ <b>${c.fDuracion}</b> min · <b>${c.fPorBloque*3}</b> ejercicios · ${ob.series} series × ${ob.rango} · +cardio`;
  }
  if(c.metodo==="barre"){
    const nb=MODES.barre[c.bModo].secs.length;
    let ej=c.bPorBloque*nb; if(c.calent)ej+=4; if(c.enfr)ej+=4;
    return `≈ <b>${c.bDuracion}</b> min · <b>${ej}</b> ejercicios · ${barreDifOf(c.bDificultad).nom} · cuentas de ${c.bBase}`;
  }
  if((c.estilo||"estacion")==="estacion"){
    const nb=((c.duracion<=30?EST_MODOS_S:EST_MODOS)[c.modo]||EST_MODOS.full).length;
    return `≈ <b>${c.duracion}</b> min · <b>${nb}</b> estaciones + reto final${c.enfr?" + cierre":""} · ${nivelOf(c.nivel).nom} · base ${c.base}`;
  }
  let ej=c.porBloque*3+2;
  if(c.calent)ej+=4; if(c.enfr)ej+=4;
  return `≈ <b>${c.duracion}</b> min · <b>${ej}</b> ejercicios · ${nivelOf(c.nivel).vueltas} vueltas · base ${c.base}`;
}

/* ---------- PLANNER ---------- */
function viewPlanner(){
  const r=state.routine, esF=r.metodo==="fuerza", esB=r.metodo==="barre";
  const mode=MODES[r.metodo][esF?r.fModo:esB?r.bModo:r.modo];
  const nWork=r.sections.filter(s=>s.kind==="work").length;
  const pl=playlistFor(r), brief=playlistBrief(r), est=estimateMinutes(r);
  let gi=0;
  return `
  <div class="wrap">
    <header class="plan-head">
      <div class="row1">
        <div>
          <span class="eyebrow">Rutina generada · ${esF?'Fuerza':esB?'Barre':'Sculpt'}</span>
          <h2><input class="rname" data-action="rename" value="${esc(r.nombre)}" aria-label="Nombre"></h2>
          <div class="meta">
            <span class="chip solid" style="color:${metodoColor(r.metodo)};border-color:${metodoColor(r.metodo)};background:transparent">${mode.nom}</span>
            ${esF?`
              <span class="chip">${objetivoOf(r.objetivo).nom}</span>
              <span class="chip">${r.series} series</span>
              <span class="chip">${nWork} × ${r.porBloque}</span>
              <span class="chip">descanso ${r.descanso}s</span>
            `:esB?`
              <span class="chip">${barreDifOf(r.bDificultad).nom}</span>
              <span class="chip">${nWork} bloques × ${r.porBloque}</span>
              <span class="chip">cuentas de ${r.base}</span>
              <span class="chip">fluida</span>
            `:`
              <span class="chip">${nivelOf(r.nivel).nom}</span>
              ${r.estilo==="estacion"?`<span class="chip">${nWork} bloques</span><span class="chip">estaciones</span><span class="chip">base ${r.base}</span>`:`<span class="chip">${nWork} × ${r.porBloque}</span><span class="chip">${r.vueltas} vueltas</span><span class="chip">base ${r.base}</span>`}
            `}
            ${(r.material&&r.material.length)?`<span class="chip mat" title="Material necesario">🎒 ${esc(r.material.join(" · "))}</span>`:''}
            <span class="chip">≈ ${est} min</span>
          </div>
        </div>
        <div class="plan-actions">
          <button class="btn primary" data-action="export">⬇ Exportar</button>
          <button class="btn" data-action="instructor">▶ Vista Instructor</button>
          <button class="btn" data-action="regen">↻ Regenerar</button>
          <button class="btn" data-action="save">💾 Guardar</button>
          <button class="btn" data-action="asignar-clase">🗓 Asignar a clase</button>
          <button class="btn" data-action="registrar-feedback">📋 Registrar clase</button>
        </div>
      </div>
    </header>

    ${musResumenHtml(r)}

    <div class="sections">
      ${r.sections.map(S=>{
        const tagc=tagColor(S.tag);
        const isWork=S.kind==='work';
        return `
        <section class="sec">
          <div class="sec-head" style="--tagc:${tagc}">
            <h3>${esc(S.nom)}</h3>
            <span class="s-meta">${S.slots.length} ${r.estilo==="estacion"?(S.slots.length===1?'paso':'pasos'):(S.slots.length===1?'ejercicio':'ejercicios')}${r.estilo==="estacion"?' · ≈ '+Math.max(1,Math.round(sectionSeconds(S,r)/60))+' min':isWork&&esF?' · '+r.series+' series':isWork&&esB?' · 2 vueltas':isWork?' · '+r.vueltas+'×'+r.base:''}</span>
            <span class="spacer"></span>
            <button class="btn sm" data-action="add-ex" data-sec="${S.id}">+ Añadir</button>
          </div>
          ${S.slots.map((s,i)=>{
            const rs=resolve(s); gi++;
            const sc=schemeText(rs,r,S.kind);
            return `
            <div class="ex" data-sec="${S.id}" data-uid="${s.uid}">
              <div class="ord">
                <div class="idx">${String(gi).padStart(2,'0')}</div>
                <button data-action="move" data-dir="-1" data-sec="${S.id}" data-uid="${s.uid}" ${i===0?'disabled':''} aria-label="Subir">▲</button>
                <button data-action="move" data-dir="1" data-sec="${S.id}" data-uid="${s.uid}" ${i===S.slots.length-1?'disabled':''} aria-label="Bajar">▼</button>
              </div>
              <div class="body">
                <div class="name">${esc(rs.nom)}</div>
                <div class="badges">
                  <span class="chip">${esc(rs.eq)}</span>
                  <span class="chip">${rs.pat==='iso'?'Isométrico':rs.pat==='pulsos'?'Pulsos':rs.pat==='tempo'?'Control de tempo':'Dinámico'}</span>
                  ${byId[s.ref].comp&&esF?'<span class="chip solid">Compuesto</span>':''}
                  ${rs.lado?'<span class="chip">Por lado</span>':''}${rs.side?`<span class="chip solid">Lado ${rs.side}</span>`:''}
                  ${!esF?`<span class="chip">${FLUJO_TXT[rs.f]}</span>`:''}
                </div>
                <div class="scheme"><span class="n">${sc.n}</span> ${sc.u}${sc.tempo?' · '+sc.tempo:''}${rs.lado&&!sc.strength?' · por lado':''}</div>
                <div class="cue">${esc(rs.cue)}</div>
                ${rs.nota?`<div class="cue" style="color:var(--accent)">✎ ${esc(rs.nota)}</div>`:''}
                ${rs.trans?`<div class="trans ${s.restCue?'rest':''}">${esc(rs.trans)}</div>`:(esF||r.estilo==="estacion")?'':`<div class="trans" style="opacity:.55">sin pausa · enlaza</div>`}
              </div>
              <div class="acts">
                <button class="btn sm" data-action="swap" data-sec="${S.id}" data-uid="${s.uid}">↺ Cambiar</button>
                <button class="btn sm" data-action="edit" data-sec="${S.id}" data-uid="${s.uid}">✎ Editar</button>
                <button class="btn sm ghost" data-action="del" data-sec="${S.id}" data-uid="${s.uid}">✕</button>
              </div>
            </div>`;
          }).join("")}
          ${S.slots.length===0?`<div class="ex"><div></div><div class="body"><div class="cue">Bloque vacío — añade un ejercicio.</div></div><div></div></div>`:''}
        </section>`;
      }).join("")}
    </div>
  </div>`;
}

/* ---------- PLAYLISTS ---------- */
/* viewPlaylists vive ahora en musica.js */

/* ---------- BIBLIOTECA (rutinas guardadas · historial · programas) ---------- */
function viewGuardadas(){
  const tab=state.uiTab||"rutinas";
  return `
  <div class="wrap">
    <header class="plan-head">
      <span class="eyebrow">Biblioteca</span>
      <h2>Rutinas, historial y progresión</h2>
      <div class="plan-actions" style="margin-top:14px">
        <button class="btn ghost" data-action="go" data-screen="inicio">← Volver al generador</button>
      </div>
    </header>
    <div class="seg" style="margin:18px 0 4px">
      <button data-action="set-uitab" data-v="rutinas" class="${tab==='rutinas'?'on':''}">💾 Guardadas (${state.saved.length})</button>
      <button data-action="set-uitab" data-v="historial" class="${tab==='historial'?'on':''}">📋 Historial de clases (${state.historial.length})</button>
      <button data-action="set-uitab" data-v="programas" class="${tab==='programas'?'on':''}">📈 Programas (${state.programas.length})</button>
    </div>
    ${tab==="historial"?subHistorial():tab==="programas"?subProgramas():subRutinas()}
  </div>`;
}
function subRutinas(){
  return `
    <div class="saved-list">
      ${state.saved.length===0?`<div class="empty">Todavía no has guardado ninguna rutina.<p>Genera una clase y pulsa <b>Guardar</b>.</p></div>`:''}
      ${state.saved.map(r=>{
        const esF=r.metodo==="fuerza", esB=r.metodo==="barre";
        const mode=MODES[r.metodo][esF?r.fModo:esB?r.bModo:r.modo];
        const n=r.sections.reduce((a,s)=>a+s.slots.length,0);
        return `
        <div class="saved-row">
          <span class="n">${esc(r.nombre)}</span>
          <span class="chip solid" style="color:${metodoColor(r.metodo)};border-color:${metodoColor(r.metodo)};background:transparent">${esF?'Fuerza':esB?'Barre':'Sculpt'}</span>
          <span class="chip">${mode.nom}</span>
          <span class="chip">${n} ejercicios</span>
          <span class="spacer"></span>
          <button class="btn sm primary" data-action="sv-load" data-id="${r.id}">Cargar</button>
          <button class="btn sm" data-action="sv-dup" data-id="${r.id}">Duplicar</button>
          <button class="btn sm ghost" data-action="sv-del" data-id="${r.id}">Borrar</button>
        </div>`;
      }).join("")}
    </div>`;
}
function subHistorial(){
  return `
    <p class="hint" style="margin:0 0 12px">Se registra desde el botón <b>📋 Registrar clase</b> en la rutina, después de darla. Cada registro ajusta qué tan seguido vuelven a salir esos ejercicios.</p>
    <div class="saved-list">
      ${state.historial.length===0?`<div class="empty">Sin clases registradas todavía.<p>Da una clase, vuelve a su rutina y registra cómo fue.</p></div>`:''}
      ${state.historial.map(h=>`
        <div class="saved-row" style="flex-direction:column;align-items:flex-start;gap:7px">
          <div class="row" style="width:100%;align-items:center;flex-wrap:wrap">
            <span class="n">${esc(h.nombre)}</span>
            <span class="chip solid" style="color:${metodoColor(h.metodo)};border-color:${metodoColor(h.metodo)};background:transparent">${h.metodo==='fuerza'?'Fuerza':h.metodo==='barre'?'Barre':'Sculpt'}</span>
            <span class="chip">${esc(h.energia)}</span>
            <span class="chip">${new Date(h.fecha).toLocaleDateString('es-MX',{day:'2-digit',month:'short',year:'numeric'})}</span>
            <span class="spacer"></span>
            <button class="btn sm ghost" data-action="hist-del" data-id="${h.id}">Borrar</button>
          </div>
          ${h.malos.length?`<div class="hint">⚠ No aterrizaron: ${h.malos.map(id=>esc(byId[id]?byId[id].nom:id)).join(', ')}</div>`:''}
          ${h.favorito?`<div class="hint">⭐ Favorito: ${esc(byId[h.favorito]?byId[h.favorito].nom:h.favorito)}</div>`:''}
          ${h.notaMusica?`<div class="hint">🎵 ${esc(h.notaMusica)}</div>`:''}
          ${h.notaLibre?`<div class="hint">📝 ${esc(h.notaLibre)}</div>`:''}
        </div>`).join("")}
    </div>`;
}
function subProgramas(){
  const c=state.cfg;
  const metodoNom=c.metodo==='fuerza'?'Fuerza':c.metodo==='barre'?'Barre':'Sculpt';
  const modoNom=c.metodo==='fuerza'?MODES.fuerza[c.fModo].nom:c.metodo==='barre'?MODES.barre[c.bModo].nom:MODES.sculpt[c.modo].nom;
  const semanas=state.uiSemanas||4;
  return `
    <div class="panel" style="margin-bottom:18px">
      <p class="hint" style="margin-bottom:10px">Se usa la configuración actual de <b>Inicio</b>: <span class="chip solid">${metodoNom}</span> <span class="chip">${esc(modoNom)}</span>. Cambia el tipo de clase ahí antes de generar si quieres otro programa.</p>
      <label class="mini">Semanas de progresión</label>
      <div class="seg" style="margin:8px 0 14px">${[3,4,6,8].map(n=>`<button data-action="set-semanas" data-v="${n}" class="${semanas===n?'on':''}">${n} semanas</button>`).join("")}</div>
      <button class="btn primary" data-action="crear-programa">📈 Generar programa de progresión</button>
    </div>
    <div class="saved-list">
      ${state.programas.length===0?`<div class="empty">Sin programas todavía.<p>Genera uno para subir intensidad semana a semana, no solo variar ejercicios.</p></div>`:''}
      ${state.programas.map(p=>{ const mc=p.metodo==='fuerza'?'var(--fuerza)':p.metodo==='barre'?'var(--barre)':'var(--sculpt)'; return `
        <div class="prog-card" style="--tag:${mc}">
          <div class="row" style="justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
            <span class="n" style="font-family:var(--f-display);font-weight:600;font-size:19px">${esc(p.nombre)}</span>
            <div style="display:flex;gap:8px">
              <button class="btn sm" data-action="prog-export" data-id="${p.id}">⬇ Exportar todo</button>
              <button class="btn sm ghost" data-action="prog-del" data-id="${p.id}">Borrar</button>
            </div>
          </div>
          <div class="week-rows" style="margin-top:10px;display:grid;gap:8px">
            ${p.semanas.map(w=>`
              <div class="saved-row">
                <span class="chip solid" style="color:${mc};border-color:${mc};background:transparent">Semana ${w.n}</span>
                <span class="n" style="font-size:15px">${esc(w.routine.nombre)}</span>
                <span class="chip">${esc(w.resumen)}</span>
                <span class="spacer"></span>
                <button class="btn sm primary" data-action="prog-load" data-id="${p.id}" data-n="${w.n}">Cargar</button>
              </div>`).join("")}
          </div>
        </div>`; }).join("")}
    </div>`;
}

/* ============================================================
   7. OVERLAY
   ============================================================ */
function renderOverlay(){
  if(state.iv){ overlay.innerHTML=viewInstructor(); bindInstructor(); document.body.style.overflow="hidden"; return; }
  document.body.style.overflow="";
  if(!state.modal){ overlay.innerHTML=""; return; }
  overlay.innerHTML=viewModal();
  const box=document.getElementById("exp-txt"); if(box){ box.focus(); box.select(); return; }
  const f=overlay.querySelector("input,textarea"); if(f)f.focus();
}
function viewModal(){
  const md=state.modal;
  if(md.type==="edit")   return modalEdit(md);
  if(md.type==="picker") return modalPicker(md);
  if(md.type==="playlist")return modalPlaylist(md);
  if(md.type==="save")   return modalSave(md);
  if(md.type==="taste")  return modalTaste(md);
  if(md.type==="export") return modalExport(md);
  if(md.type==="feedback") return modalFeedback(md);
  if(md.type==="song") return modalSong(md);
  return Mods.modal(md)||"";
}
function modalShell(title,body,foot){
  return `<div class="scrim" data-action="scrim"><div class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}">
    <div class="modal-head"><h3>${esc(title)}</h3><button class="x" data-action="close-modal" aria-label="Cerrar">✕</button></div>
    <div class="modal-body">${body}</div>${foot?`<div class="modal-foot">${foot}</div>`:''}</div></div>`;
}
function modalEdit(md){
  const S=state.routine.sections.find(x=>x.id===md.sec);
  const s=S.slots.find(x=>x.uid===md.uid), rs=resolve(s);
  const base=s.base||state.routine.base;
  if(s.q&&state.routine.estilo==="estacion") return modalEditPaso(S,s,rs);
  return modalShell("Editar ejercicio",`
    <div style="font-family:var(--f-display);font-weight:600;font-size:22px">${esc(rs.nom)}</div>
    <div class="kv" style="color:var(--muted);font-size:12px;margin:4px 0 16px">${esc(byId[s.ref].cue)}</div>
    <div class="form-grid">
      <div class="full"><label class="mini">Patrón</label>
        <div class="seg">${["reps","pulsos","iso","tempo"].map(p=>`<button data-action="ed-pat" data-v="${p}" class="${rs.pat===p?'on':''}">${p==='reps'?'Reps':p==='pulsos'?'Pulsos':p==='iso'?'Isométrico':'Tempo'}</button>`).join("")}</div>
      </div>
      ${state.routine.metodo==='sculpt'?`<div><label class="mini">Base de conteo</label><div class="seg">${[8,10,12].map(b=>`<button data-action="ed-base" data-v="${b}" class="${base===b?'on':''}">${b}</button>`).join("")}</div></div>`
        :state.routine.metodo==='barre'?`<div><label class="mini">Cuentas</label><div class="seg">${[8,16,32].map(b=>`<button data-action="ed-base" data-v="${b}" class="${base===b?'on':''}">${b}</button>`).join("")}</div></div>`:''}
      <div><label class="mini">Tempo (3-1-1)</label><input class="inp" data-action="ed-tempo" value="${esc(rs.tempo||'')}" placeholder="opcional" ${rs.pat!=='tempo'&&rs.pat!=='iso'?'disabled':''}></div>
      <div class="full"><label class="mini">Material</label>
        <div class="seg">${PROPS.map(e=>`<button data-action="ed-eq" data-v="${e}" class="${rs.eq===e?'on':''}">${e}</button>`).join("")}</div>
      </div>
      <div class="full"><label class="switch"><input type="checkbox" data-action="ed-lado" ${rs.lado?'checked':''}><span class="track"></span>Por lado (A / B)</label></div>
      <div class="full"><label class="mini">Nota para la clase</label><input class="inp" data-action="ed-nota" value="${esc(rs.nota)}" placeholder="ej. bajar peso, foco excéntrico…"></div>
    </div>`,
    `<button class="btn ghost" data-action="close-modal">Cerrar</button><button class="btn primary" data-action="ed-done">Listo</button>`);
}
function modalPicker(md){
  const S=state.routine.sections.find(x=>x.id===md.sec), r=state.routine;
  let pool;
  if(S.kind==="prep") pool=LIB.filter(e=>e.b==="prep");
  else if(S.kind==="cool") pool=LIB.filter(e=>e.b==="cool");
  else if(S.kind==="cardioFin") pool=LIB.filter(e=>e.b==="cardio");
  else if(r.metodo==="fuerza"){
    const sd=secDef(MODES.fuerza[r.fModo].secs,S);
    pool=sd?fuerzaPool(sd.key):[];
  } else if(r.metodo==="barre"){
    const sd=secDef(MODES.barre[r.bModo].secs,S);
    pool=sd?barrePool(sd.sub,new Set()):LIB.filter(e=>e.b==="barre");
  } else {
    const sd=secDef(MODES.sculpt[r.modo].secs,S);
    pool=sd?sculptPool(sd,new Set()):LIB.filter(e=>e.b===(S.tag==='up'?'upper':S.tag==='low'?'lower':'core'));
  }
  if(r.estilo==="estacion") pool=estPickerPool(S,pool);
  const have=new Set(S.slots.map(s=>s.ref));
  return modalShell("Añadir a "+S.nom,`
    ${armPickerExtra(S)}
    <div class="picker">
      ${pool.map(e=>`<button data-action="pick-ex" data-sec="${S.id}" data-ex="${e.id}" ${have.has(e.id)?'disabled style="opacity:.4"':''}>
        <span class="pn">${esc(e.nom)}${have.has(e.id)?' · ya incluido':''}</span>
        <span class="pm">${esc(e.eq)} · ${e.q?estQLabel(e.q)+' · ':''}${e.pat==='iso'?'isométrico':e.pat==='pulsos'?'pulsos':e.pat==='tempo'?'tempo '+(e.tempo||''):'dinámico'}${e.lado?' · por lado':''}${!r.metodo||r.metodo==='sculpt'?' · '+FLUJO_TXT[e.f||0]:''}</span>
      </button>`).join("")}
    </div>`,
    `<button class="btn ghost" data-action="close-modal">Cerrar</button>`);
}
function modalPlaylist(md){
  const p=md.data;
  const tipos=["Full Body","Upper","Pierna","Core","Fuerza","Barre","Calentamiento","Enfriamiento","General"];
  const ens=["Baja","Media","Alta","Picos"];
  return modalShell(md.id?"Editar playlist":"Nueva playlist",`
    <div class="form-grid">
      <div class="full"><label class="mini">Nombre</label><input class="inp" id="pl-nom" value="${esc(p.nom)}"></div>
      <div class="full"><label class="mini">Tipo de clase</label><div class="seg">${tipos.map(t=>`<button data-action="plf-tipo" data-v="${t}" class="${p.tipo===t?'on':''}">${t}</button>`).join("")}</div></div>
      <div><label class="mini">BPM mín</label><input class="inp" id="pl-min" type="number" value="${p.bpmMin}"></div>
      <div><label class="mini">BPM máx</label><input class="inp" id="pl-max" type="number" value="${p.bpmMax}"></div>
      <div class="full"><label class="mini">Energía</label><div class="seg">${ens.map(t=>`<button data-action="plf-en" data-v="${t}" class="${p.energia===t?'on':''}">${t}</button>`).join("")}</div></div>
      <div class="full"><label class="mini">Enlace</label><input class="inp" id="pl-url" value="${esc(p.url)}" placeholder="https://open.spotify.com/…"></div>
      <div class="full"><label class="mini">Notas</label><input class="inp" id="pl-notas" value="${esc(p.notas)}"></div>
    </div>`,
    `<button class="btn ghost" data-action="close-modal">Cancelar</button><button class="btn primary" data-action="plf-save">Guardar</button>`);
}
function modalSave(){
  return modalShell("Guardar rutina",`
    <label class="mini">Nombre</label>
    <input class="inp" id="sv-nom" value="${esc(state.routine.nombre)}">
    <p class="hint" style="margin-top:10px;color:var(--muted-2)">Se guarda en este navegador.</p>`,
    `<button class="btn ghost" data-action="close-modal">Cancelar</button><button class="btn primary" data-action="sv-confirm">Guardar</button>`);
}
function modalTaste(){
  return modalShell("Añadir artista",`
    <label class="mini">Artista o estilo</label>
    <input class="inp" id="taste-nom" placeholder="ej. Daddy Yankee">`,
    `<button class="btn ghost" data-action="close-modal">Cancelar</button><button class="btn primary" data-action="taste-save">Añadir</button>`);
}

/* ============================================================
   8. VISTA INSTRUCTOR
   ============================================================ */
function buildSteps(r){
  const steps=[];
  r.sections.forEach(S=>S.slots.forEach(s=>steps.push({secNom:S.nom,tag:S.tag,kind:S.kind,protocolo:S.protocolo,slot:s})));
  return steps;
}
function launchInstructor(){
  const r=state.routine, steps=buildSteps(r);
  if(steps.length===0)return;
  if(r.metodo==="fuerza"){
    state.iv={metodo:"fuerza",steps,i:0,serie:1,phase:"idle",left:0,total:0,descanso:r.descanso,elapsed:0};
  }else{
    const pl=playlistFor(r);
    state.iv={metodo:"sculpt",steps,i:0,set:0,running:false,elapsed:0,
      bpm:pl?Math.round((pl.bpmMin+pl.bpmMax)/2):112};
  }
  renderOverlay();
  try{ if(navigator.wakeLock) navigator.wakeLock.request("screen").then(l=>{ if(state.iv) state.iv.wl=l; else l.release(); }).catch(()=>{}); }catch(e){}   // que no se apague la pantalla
}
function ivStep(){return state.iv.steps[state.iv.i];}
function ivResolve(){return resolve(ivStep().slot);}
function nineCount(){
  const st=ivStep(), rs=ivResolve(), sc=schemeText(rs,state.routine,st.kind);
  if(state.routine.metodo==="barre") return 8;   // cuenta musical de 8
  if(rs.q) return state.routine.base||8;          // estación: se cuenta en bloques de la base (8/10/12)
  const n=Number(sc.n); return (n>=1&&n<=12)?n:9;
}

function viewInstructor(){
  return state.iv.metodo==="fuerza"?ivFuerza():ivSculpt();
}
function ivShellTop(steps,i,extra){
  return `<div class="iv-top">
    <button class="iv-x" data-action="iv-exit">✕ Salir</button>
    <div class="iv-prog"><i style="width:${(i/Math.max(1,steps.length-1))*100}%"></i></div>
    <span class="clock" id="iv-clock">0:00</span>
    <span class="count-lbl">${i+1}/${steps.length} ${extra||''}</span>
  </div>`;
}
function ivNext(steps,i,r){
  const nx=steps[i+1];
  if(!nx) return `<div class="iv-next"><span class="lbl">Sigue</span><span class="nm">— Fin de la clase —</span></div>`;
  const nrs=resolve(nx.slot), nsc=schemeText(nrs,r,nx.kind);
  return `<div class="iv-next"><span class="lbl">Sigue</span><span class="nm">${esc(nrs.nom)}</span><span class="nq">${nsc.n} ${nsc.u.split(' ')[0]} · ${esc(nrs.eq)}</span></div>`;
}

function ivSculpt(){
  const iv=state.iv, r=state.routine, steps=iv.steps, st=steps[iv.i];
  const rs=resolve(st.slot), sc=schemeText(rs,r,st.kind);
  const tagc=tagColor(st.tag);
  const qt=rs.q?rs.q.t:null, timed=qt==="hold"||qt==="falla", isTrans=qt==="trans";
  const n=(timed||isTrans)?0:nineCount();
  const sides=rs.lado?2:1;
  const totalSets=rs.q?Math.max(1,Math.ceil((rs.q.n||n)/(n||1))):((st.kind==='work'||st.kind==='finisher')? r.vueltas*sides : sides);
  const sideLabel=rs.side?('Lado '+rs.side):(rs.lado?(iv.set%2===0?'Lado A':'Lado B'):'');
  const ringTxt=timed?(iv.hold?(qt==="hold"?iv.hold.left:iv.hold.el):(qt==="hold"?rs.q.s:0)):iv.bpm;
  const mainBtn=timed
    ? `<button class="wide ${iv.hold?'':'go'}" data-action="iv-hold">${iv.hold?'⏹ Detener':(qt==="hold"?'▶ Cronómetro '+rs.q.s+' s':'▶ Cronómetro')}</button>`
    : isTrans ? `<button class="wide go" data-action="iv-next">Listo · siguiente ›</button>`
    : `<button class="wide ${iv.running?'':'go'}" data-action="iv-toggle">${iv.running?'⏸ Pausa':'▶ Marcar '+(rs.q&&rs.q.n?rs.q.n:n)}</button>`;
  return `<div class="iv">
    ${ivShellTop(steps,iv.i,'· '+FLUJO_TXT[rs.f])}
    <div class="iv-stage" data-action="iv-next-tap">
      <div class="iv-pulse">
        <div class="iv-ring" id="iv-ring" style="--beat:${60/iv.bpm}s">${ringTxt}</div>
        <small>${timed?(qt==="hold"?"SEG":"TIEMPO"):"BPM"}</small>
        <div class="iv-sets" id="iv-sets">${timed||isTrans?'':'Serie '+Math.min(iv.set+1,totalSets)+'/'+totalSets}</div>
      </div>
      <div class="iv-sec"><span class="dot" style="background:${tagc}"></span><span>${esc(st.secNom)}</span></div>
      <h2 class="iv-name">${esc(rs.nom)}</h2>
      <div class="iv-badges">
        <span class="chip">${esc(rs.eq)}</span>
        <span class="chip">${rs.pat==='iso'?'Isométrico':rs.pat==='pulsos'?'Pulsos':rs.pat==='tempo'?'Tempo '+(rs.tempo||''):'Dinámico'}</span>
        ${rs.trans?`<span class="chip solid">${esc(rs.trans)}</span>`:''}
      </div>
      <div class="iv-scheme">
        <div class="iv-reps">${sc.n}<span class="u">${sc.u}</span></div>
        ${sc.tempo?`<div class="iv-tempo">${esc(sc.tempo)}</div>`:''}
        ${sideLabel?`<div class="iv-side">${sideLabel}</div>`:''}
      </div>
      ${n?`<div class="iv-nine" id="iv-nine">${Array.from({length:n},(_,k)=>`<i data-k="${k}"></i>`).join("")}</div>`:''}
      <div class="iv-cue">${esc(rs.cue)}${rs.nota?` — <span style="color:var(--accent)">${esc(rs.nota)}</span>`:''}</div>
    </div>
    ${ivNext(steps,iv.i,r)}
    <div class="iv-ctrl">
      <button data-action="iv-prev">‹ Ant.</button>
      ${mainBtn}
      <div class="bpm-ctl">
        <button data-action="iv-bpm" data-d="-2" aria-label="Bajar BPM">–</button>
        <button data-action="iv-bpm" data-d="2" aria-label="Subir BPM">+</button>
        <button data-action="iv-tap">TAP</button>
      </div>
      <button data-action="iv-next">Sig. ›</button>
    </div>
    <div class="iv-hint">← → paso · espacio: metrónomo o cronómetro · ↑ ↓ BPM · Esc: salir</div>
  </div>`;
}

function ivFuerza(){
  const iv=state.iv, r=state.routine, steps=iv.steps, st=steps[iv.i];
  const rs=resolve(st.slot), sc=schemeText(rs,r,st.kind);
  const tagc=tagColor(st.tag);
  const isWork=st.kind==='work';
  const isCardio=st.kind==='cardioFin';
  const series=r.series;
  let ringTxt, ringCls="", btnTxt, btnCls="go";
  if(iv.phase==="rest"||iv.phase==="work"){ ringTxt=iv.left; ringCls=iv.phase==="rest"?"rest":""; btnTxt="⏭ Saltar"; btnCls=""; }
  else if(isWork){ ringTxt="▶"; btnTxt=`Serie hecha ▸ descanso ${iv.descanso}s`; }
  else if(isCardio){ ringTxt="▶"; btnTxt=`▶ ${st.protocolo.work}s trabajo`; }
  else { ringTxt="—"; btnTxt="Siguiente ›"; btnCls=""; }

  return `<div class="iv">
    ${ivShellTop(steps,iv.i,isWork?'· serie '+iv.serie+'/'+series:'')}
    <div class="iv-stage" data-action="iv-next-tap">
      <div class="iv-pulse">
        <div class="iv-ring ${ringCls}" id="iv-ring">${ringTxt}</div>
        <small>${iv.phase==="rest"?"DESCANSO":iv.phase==="work"?"TRABAJO":"SEG"}</small>
        <div class="iv-sets" id="iv-sets">${isWork?`Serie ${iv.serie}/${series}`:isCardio?`Ronda · circuito`:''}</div>
      </div>
      <div class="iv-sec"><span class="dot" style="background:${tagc}"></span><span>${esc(st.secNom)}</span></div>
      <h2 class="iv-name">${esc(rs.nom)}</h2>
      <div class="iv-badges">
        <span class="chip">${esc(rs.eq)}</span>
        ${byId[st.slot.ref].comp?'<span class="chip solid">Compuesto</span>':''}
        ${rs.tempo?`<span class="chip">Tempo ${esc(rs.tempo)}</span>`:''}
        ${rs.lado?'<span class="chip">Por lado</span>':''}
      </div>
      <div class="iv-scheme">
        <div class="iv-reps" style="font-size:clamp(34px,7vw,84px)">${sc.n}<span class="u">${sc.u}</span></div>
      </div>
      ${isWork?`<div class="iv-pills">${Array.from({length:series},(_,k)=>`<i class="${k+1<iv.serie?'done':k+1===iv.serie?'now':''}">${k+1}</i>`).join("")}</div>`:''}
      <div class="iv-cue">${esc(rs.cue)}${rs.nota?` — <span style="color:var(--accent)">${esc(rs.nota)}</span>`:''}</div>
    </div>
    ${ivNext(steps,iv.i,r)}
    <div class="iv-ctrl">
      <button data-action="iv-prev">‹ Ant.</button>
      <button class="wide ${btnCls}" data-action="iv-f-action">${btnTxt}</button>
      ${isWork?`<div class="bpm-ctl"><button data-action="iv-rest" data-d="-15">–15s</button><button data-action="iv-rest" data-d="15">+15s</button></div>`:''}
      <button data-action="iv-next">Sig. ›</button>
    </div>
    <div class="iv-hint">← → ejercicio · espacio: temporizador · Esc: salir</div>
  </div>`;
}

/* ---- audio ---- */
let AC=null, tickTimer=null, rafId=null, noteQueue=[], nextNoteTime=0, schedBeat=0, clockTimer=null, tapTimes=[], fTimer=null;
function ensureAC(){ if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(e){}} if(AC&&AC.state==="suspended")AC.resume(); return AC; }
function beep(t,freq,gain,dur){ if(!AC)return; const o=AC.createOscillator(),g=AC.createGain();
  o.frequency.value=freq;o.type="sine";
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(gain,t+0.001);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  o.connect(g).connect(AC.destination);o.start(t);o.stop(t+dur+0.02); }

/* ---- SCULPT: metrónomo de 9 ---- */
function sculptMeta(){
  const iv=state.iv,r=state.routine,st=ivStep(),rs=resolve(st.slot);
  const n=nineCount(), sides=rs.lado?2:1;
  if(rs.q) return {n,totalSets:Math.max(1,Math.ceil((rs.q.n||n)/n)),rs,cnt:rs.q.n||0};
  const totalSets=(st.kind==='work'||st.kind==='finisher')? r.vueltas*sides : sides;
  return {n,totalSets,rs,cnt:0};
}
function startMetro(){
  const iv=state.iv; if(iv.running)return; ensureAC(); if(!AC)return;
  iv.running=true; nextNoteTime=AC.currentTime+0.06; schedBeat=0; noteQueue=[];
  tickTimer=setInterval(metroSched,25); rafId=requestAnimationFrame(metroDraw);
  syncSculptBtn();
}
function stopMetro(){ const iv=state.iv; if(!iv)return; iv.running=false;
  clearInterval(tickTimer);tickTimer=null;cancelAnimationFrame(rafId);rafId=null;noteQueue=[]; syncSculptBtn(); }
function metroSched(){
  const iv=state.iv; if(!iv||!AC)return;
  const {n}=sculptMeta(); const spb=60/iv.bpm;
  while(nextNoteTime < AC.currentTime+0.12){
    const beatInSet=schedBeat%n, setNo=Math.floor(schedBeat/n);
    beep(nextNoteTime, beatInSet===0?1500:880, beatInSet===0?0.5:0.28, 0.09);
    noteQueue.push({t:nextNoteTime,beat:beatInSet,setNo});
    nextNoteTime+=spb; schedBeat++;
  }
}
function metroDraw(){
  const iv=state.iv; if(!iv||!iv.running)return;
  const {n,totalSets,rs,cnt}=sculptMeta();
  const nine=document.getElementById("iv-nine"), ring=document.getElementById("iv-ring"), setsEl=document.getElementById("iv-sets");
  while(noteQueue.length && noteQueue[0].t<=AC.currentTime){
    const ev=noteQueue.shift();
    if(ev.setNo>=totalSets||(cnt&&ev.setNo*n+ev.beat>=cnt)){ stopMetro(); if(nine)[...nine.children].forEach(d=>d.classList.add("on")); if(setsEl)setsEl.textContent="✓ completo"; return; }
    iv.set=ev.setNo;
    if(nine){ if(ev.beat===0)[...nine.children].forEach(d=>d.classList.remove("on"));
      [...nine.children].forEach((d,k)=>{ d.classList.toggle("on",k<=ev.beat); d.classList.toggle("beat",k===ev.beat); }); }
    if(ring){ ring.classList.remove("tick"); void ring.offsetWidth; ring.classList.add("tick"); }
    if(setsEl){ const sd=rs.lado?(ev.setNo%2===0?' · Lado A':' · Lado B'):''; setsEl.textContent=`Serie ${Math.min(ev.setNo+1,totalSets)}/${totalSets}${sd}`; }
  }
  rafId=requestAnimationFrame(metroDraw);
}
function syncSculptBtn(){
  const b=document.querySelector('[data-action="iv-toggle"]'); if(!b||!state.iv)return;
  const rq=resolve(ivStep().slot).q, n=(rq&&rq.n)?rq.n:nineCount();
  b.textContent=state.iv.running?'⏸ Pausa':'▶ Marcar '+n;
  b.classList.toggle("go",!state.iv.running);
}
function changeBpm(d){ const iv=state.iv; if(!iv||iv.metodo!=='sculpt')return;
  iv.bpm=Math.max(60,Math.min(180,iv.bpm+d));
  const ring=document.getElementById("iv-ring"); if(ring){ring.textContent=iv.bpm;ring.style.setProperty("--beat",(60/iv.bpm)+"s");} }
function tapTempo(){ const now=performance.now(); tapTimes.push(now); tapTimes=tapTimes.filter(x=>now-x<3000);
  if(tapTimes.length>=2){ const d=[]; for(let i=1;i<tapTimes.length;i++)d.push(tapTimes[i]-tapTimes[i-1]);
    const avg=d.reduce((a,b)=>a+b,0)/d.length; changeBpm(Math.round(60000/avg)-state.iv.bpm); } }

/* ---- FUERZA: temporizador de series / intervalos ---- */
function fClearTimer(){ if(fTimer){clearInterval(fTimer);fTimer=null;} }
function fRun(seconds,phase,onEnd){
  const iv=state.iv; ensureAC();
  iv.phase=phase; iv.total=seconds; iv.left=seconds;
  renderOverlay();
  fClearTimer();
  fTimer=setInterval(()=>{
    iv.left--;
    const ring=document.getElementById("iv-ring");
    if(ring)ring.textContent=Math.max(0,iv.left);
    if(iv.left<=0){ fClearTimer();
      if(AC){ beep(AC.currentTime,1200,0.4,0.12); beep(AC.currentTime+0.15,1200,0.4,0.12); }
      onEnd&&onEnd();
    }
  },1000);
}
function fAction(){
  const iv=state.iv, st=ivStep();
  if(iv.phase==="rest"||iv.phase==="work"){ // saltar
    fClearTimer(); const wasWork=iv.phase==="work"; iv.phase="idle";
    if(wasWork){ fRun(st.protocolo.rest,"rest",()=>{iv.phase="idle";renderOverlay();}); }
    else { iv.phase="idle"; renderOverlay(); }
    return;
  }
  if(st.kind==="work"){
    if(iv.serie>=state.routine.series){ ivGoto(1); return; }
    iv.serie++;
    fRun(iv.descanso,"rest",()=>{ iv.phase="idle"; renderOverlay(); });
  } else if(st.kind==="cardioFin"){
    fRun(st.protocolo.work,"work",()=>{ fRun(st.protocolo.rest,"rest",()=>{iv.phase="idle";renderOverlay();}); });
  } else {
    ivGoto(1);
  }
}
function changeRest(d){ const iv=state.iv; if(!iv)return; iv.descanso=Math.max(15,Math.min(240,iv.descanso+d));
  const b=document.querySelector('[data-action="iv-f-action"]'); if(b&&iv.phase==="idle")b.textContent=`Serie hecha ▸ descanso ${iv.descanso}s`; }

/* ---- navegación instructor ---- */
function ivGoto(delta){
  const iv=state.iv, ni=iv.i+delta;
  if(ni<0||ni>=iv.steps.length)return;
  if(iv.metodo==="sculpt"){ stopMetro(); ivHoldStop(); } else {fClearTimer();iv.phase="idle";iv.serie=1;}
  iv.i=ni; iv.set=0;
  renderOverlay();
}
function ivExit(){
  if(state.iv&&state.iv.metodo==="sculpt"){ stopMetro(); ivHoldStop(); } fClearTimer();
  clearInterval(clockTimer);clockTimer=null; try{ if(state.iv&&state.iv.wl) state.iv.wl.release(); }catch(e){} state.iv=null; renderOverlay();
}
function ivClockTick(){ const iv=state.iv; if(!iv)return; iv.elapsed++;
  const el=document.getElementById("iv-clock"); if(el)el.textContent=fmtClock(iv.elapsed); }
function bindInstructor(){ if(!clockTimer)clockTimer=setInterval(ivClockTick,1000); if(state.iv.metodo==="sculpt")syncSculptBtn(); }

/* ============================================================
   9. EVENTOS
   ============================================================ */
document.addEventListener("click",e=>{
  const t=e.target.closest("[data-action]"); if(!t)return;
  const a=t.dataset.action, c=state.cfg;
  if(Mods.click(a,t,e)) return;

  if(a==="go"){ const s=t.dataset.screen; if(s==="planner"&&!state.routine)return; state.screen=s; render(); window.scrollTo(0,0); return; }
  if(a==="set-metodo"){ c.metodo=t.dataset.v; render(); return; }
  if(a==="set-modo"){ if(c.metodo==="fuerza")c.fModo=t.dataset.v; else if(c.metodo==="barre")c.bModo=t.dataset.v; else c.modo=t.dataset.v; render(); return; }
  if(a==="set-bbase"){ c.bBase=Number(t.dataset.v); render(); return; }
  if(a==="set-bporbloque"){ c.bPorBloque=Number(t.dataset.v); render(); return; }
  if(a==="set-bdificultad"){ const d=BARRE_DIF[t.dataset.v]; c.bDificultad=t.dataset.v; c.bBase=d.bBase; c.bPorBloque=d.bPorBloque; render(); return; }
  if(a==="set-bdur"){ c.bDuracion=Number(t.dataset.v); render(); return; }
  if(a==="set-nivel"){ c.nivel=t.dataset.v; render(); return; }
  if(a==="set-estilo"){ c.estilo=t.dataset.v; render(); return; }
  if(a==="set-dur"){ c.duracion=Number(t.dataset.v); render(); return; }
  if(a==="set-base"){ c.base=Number(t.dataset.v); render(); return; }
  if(a==="set-porbloque"){ c.porBloque=Number(t.dataset.v); render(); return; }
  if(a==="set-objetivo"){ c.objetivo=t.dataset.v; c.descanso=OBJETIVOS[t.dataset.v].descanso; render(); return; }
  if(a==="set-fdur"){ c.fDuracion=Number(t.dataset.v); render(); return; }
  if(a==="set-fporbloque"){ c.fPorBloque=Number(t.dataset.v); render(); return; }
  if(a==="set-descanso"){ c.descanso=Number(t.dataset.v); render(); return; }
  if(a==="taste-add"){ state.modal={type:"taste"}; renderOverlay(); return; }
  if(a==="taste-del"){ state.gustos.splice(Number(t.dataset.i),1); LS.set("sf_gustos",state.gustos); render(); return; }
  if(a==="taste-save"){ const v=document.getElementById("taste-nom").value.trim(); if(v){state.gustos.push(v);LS.set("sf_gustos",state.gustos);} closeModal(); render(); return; }
  if(a==="taste-quickadd"){ const v=t.dataset.name; if(v && !state.gustos.some(g=>g.toLowerCase()===v.toLowerCase())){ state.gustos.push(v); LS.set("sf_gustos",state.gustos); toast(v+" añadido a tus gustos"); render(); } return; }
  if(a==="generate"){ state.routine=generate(c); state.screen="planner"; render(); window.scrollTo(0,0); return; }

  if(a==="regen"){ state.routine=generate(c); render(); return; }
  if(a==="instructor"){ launchInstructor(); return; }
  if(a==="save"){ state.modal={type:"save"}; renderOverlay(); return; }
  if(a==="export"){ state.modal={type:"export"}; renderOverlay(); return; }
  if(a==="exp-copy"){ copyRoutine(); return; }
  if(a==="exp-pdf"){ closeModal(); setTimeout(()=>window.print(),80); return; }
  if(a==="pl-copy"){ navigator.clipboard?.writeText(document.getElementById("pl-prompt").textContent).then(()=>toast("Prompt copiado — pégalo en Spotify"),()=>toast("No se pudo copiar")); return; }
  if(a==="move"){ moveSlot(t.dataset.sec,t.dataset.uid,Number(t.dataset.dir)); return; }
  if(a==="del"){ delSlot(t.dataset.sec,t.dataset.uid); return; }
  if(a==="swap"){ swapSlot(t.dataset.sec,t.dataset.uid); return; }
  if(a==="edit"){ state.modal={type:"edit",sec:t.dataset.sec,uid:t.dataset.uid}; renderOverlay(); return; }
  if(a==="add-ex"){ state.modal={type:"picker",sec:t.dataset.sec}; renderOverlay(); return; }

  if(a==="close-modal"||a==="scrim"){ if(a==="scrim"&&e.target!==t)return; closeModal(); return; }
  if(a==="ed-q"){ editarCantidad(t.dataset.k,t.dataset.v); return; }
  if(a==="ed-side"){ setSlotField("side",t.dataset.v||null); return; }
  if(a==="ed-pat"){ setSlotField("pat",t.dataset.v); return; }
  if(a==="ed-base"){ setSlotField("base",Number(t.dataset.v)); return; }
  if(a==="ed-eq"){ setSlotField("eq",t.dataset.v); return; }
  if(a==="ed-done"){ recomputeAndRender(); closeModal(); return; }
  if(a==="pick-ex"){ addPicked(t.dataset.sec,t.dataset.ex); return; }

  if(a==="pl-new"){ state.modal={type:"playlist",data:{nom:"",tipo:"General",url:"",bpmMin:110,bpmMax:122,energia:"Media",notas:""}}; renderOverlay(); return; }
  if(a==="pl-edit"){ const p=state.playlists.find(x=>x.id===t.dataset.id); state.modal={type:"playlist",id:p.id,data:{...p}}; renderOverlay(); return; }
  if(a==="pl-del"){ state.playlists=state.playlists.filter(x=>x.id!==t.dataset.id); LS.set("sf_playlists",state.playlists); render(); return; }
  if(a==="plf-tipo"){ state.modal.data.tipo=t.dataset.v; renderOverlay(); return; }
  if(a==="plf-en"){ state.modal.data.energia=t.dataset.v; renderOverlay(); return; }
  if(a==="plf-save"){ savePlaylist(); return; }
  if(a==="sv-confirm"){ doSave(); return; }
  if(a==="sv-load"){ loadSaved(t.dataset.id); return; }
  if(a==="sv-dup"){ const r=state.saved.find(x=>x.id===t.dataset.id); if(r){const cl=deepClone(r);cl.id=rid();cl.nombre=r.nombre+" (copia)";state.saved.unshift(cl);LS.set("sf_saved",state.saved);render();} return; }
  if(a==="sv-del"){ state.saved=state.saved.filter(x=>x.id!==t.dataset.id); LS.set("sf_saved",state.saved); render(); return; }

  if(a==="set-uitab"){ state.uiTab=t.dataset.v; render(); return; }
  if(a==="hist-del"){ state.historial=state.historial.filter(x=>x.id!==t.dataset.id); LS.set("sf_historial",state.historial); render(); return; }

  if(a==="registrar-feedback"){ state.modal={type:"feedback",data:{energia:"Media",malos:[],favorito:"",notaMusica:"",notaLibre:""}}; renderOverlay(); return; }
  if(a==="fb-en"){ state.modal.data.energia=t.dataset.v; renderOverlay(); return; }
  if(a==="fb-guardar"){
    const d=state.modal.data;
    registrarFeedback(state.routine,d.energia,d.malos,d.favorito,d.notaMusica,d.notaLibre);
    closeModal(); toast("Clase registrada — ajusta las próximas rutinas");
    return;
  }

  if(a==="set-semanas"){ state.uiSemanas=Number(t.dataset.v); render(); return; }
  if(a==="crear-programa"){
    const cf=state.cfg;
    const metodoNom=cf.metodo==='fuerza'?'Fuerza':cf.metodo==='barre'?'Barre':'Sculpt';
    const modoNom=cf.metodo==='fuerza'?MODES.fuerza[cf.fModo].nom:cf.metodo==='barre'?MODES.barre[cf.bModo].nom:MODES.sculpt[cf.modo].nom;
    const n=state.uiSemanas||4;
    const semanas=generateProgram(cf,n);
    state.programas.unshift({id:rid(),nombre:`${metodoNom} · ${modoNom} · ${n} semanas`,metodo:cf.metodo,semanas,creado:Date.now()});
    LS.set("sf_programas",state.programas); render(); toast("Programa generado");
    return;
  }
  if(a==="prog-del"){ state.programas=state.programas.filter(x=>x.id!==t.dataset.id); LS.set("sf_programas",state.programas); render(); return; }
  if(a==="prog-load"){
    const p=state.programas.find(x=>x.id===t.dataset.id); const w=p&&p.semanas.find(x=>x.n===Number(t.dataset.n));
    if(!w)return;
    state.routine=deepClone(w.routine); state.routine.id=rid();
    const cf=state.cfg; cf.metodo=w.routine.metodo;
    if(w.routine.metodo==='fuerza'){ cf.fModo=w.routine.fModo;cf.objetivo=w.routine.objetivo;cf.fDuracion=w.routine.duracion;cf.fPorBloque=w.routine.porBloque;cf.descanso=w.routine.descanso; }
    else if(w.routine.metodo==='barre'){ cf.bModo=w.routine.bModo;cf.bDificultad=w.routine.bDificultad||"media";cf.bBase=w.routine.base;cf.bPorBloque=w.routine.porBloque;cf.bDuracion=w.routine.duracion; }
    else { cf.estilo=w.routine.estilo||"lista";cf.modo=w.routine.modo;cf.nivel=w.routine.nivel;cf.duracion=w.routine.duracion;cf.base=w.routine.base;if(w.routine.porBloque)cf.porBloque=w.routine.porBloque; }
    state.screen='planner'; render(); window.scrollTo(0,0);
    return;
  }
  if(a==="prog-export"){
    const p=state.programas.find(x=>x.id===t.dataset.id); if(!p)return;
    const txt=p.semanas.map(w=>routineText(w.routine,false)).join("\n\n══════════════════════\n\n");
    navigator.clipboard?.writeText(txt).then(()=>toast("Programa completo copiado"),()=>toast("No se pudo copiar"));
    return;
  }

  if(a==="song-new"){ state.modal={type:"song",data:{titulo:"",artista:"",bpm:120,energia:"Media",url:"",notas:""}}; renderOverlay(); return; }
  if(a==="song-edit"){ const s=state.musicLib.find(x=>x.id===t.dataset.id); state.modal={type:"song",id:s.id,data:{...s}}; renderOverlay(); return; }
  if(a==="song-del"){ state.musicLib=state.musicLib.filter(x=>x.id!==t.dataset.id); LS.set("sf_musiclib",state.musicLib); render(); return; }
  if(a==="songf-en"){ state.modal.data.energia=t.dataset.v; renderOverlay(); return; }
  if(a==="songf-save"){ saveSong(); return; }

  if(a==="iv-exit"){ ivExit(); return; }
  if(a==="iv-prev"){ ivGoto(-1); return; }
  if(a==="iv-next"){ ivGoto(1); return; }
  if(a==="iv-next-tap"){ if(e.target.closest(".iv-ctrl,.iv-pulse"))return; ivGoto(1); return; }
  if(a==="iv-hold"){ ivHoldToggle(); return; }
  if(a==="iv-toggle"){ state.iv.running?stopMetro():startMetro(); return; }
  if(a==="iv-bpm"){ changeBpm(Number(t.dataset.d)); return; }
  if(a==="iv-tap"){ ensureAC(); tapTempo(); return; }
  if(a==="iv-f-action"){ fAction(); return; }
  if(a==="iv-rest"){ changeRest(Number(t.dataset.d)); return; }
});

document.addEventListener("input",e=>{
  const t=e.target.closest("[data-action]"); if(!t)return;
  const a=t.dataset.action;
  if(Mods.input(a,t,e)) return;
  if(a==="rename"){ state.routine.nombre=t.value; return; }
  if(a==="toggle"){ state.cfg[t.dataset.k]=t.checked; render(); return; }
  if(a==="ed-qn"){ editarCantidad("n",t.value,true); return; }
  if(a==="ed-tempo"){ setSlotField("tempo",t.value,true); return; }
  if(a==="ed-nota"){ setSlotField("nota",t.value,true); return; }
  if(a==="ed-lado"){ setSlotField("lado",t.checked,true); return; }
  if(a==="fb-malo"){ const id=t.dataset.id, arr=state.modal.data.malos, i=arr.indexOf(id); if(t.checked&&i===-1)arr.push(id); if(!t.checked&&i>-1)arr.splice(i,1); return; }
  if(a==="fb-favorito"){ state.modal.data.favorito=t.value; return; }
  if(a==="fb-musica"){ state.modal.data.notaMusica=t.value; return; }
  if(a==="fb-nota"){ state.modal.data.notaLibre=t.value; return; }
});

document.addEventListener("keydown",e=>{
  const k=e.key;
  if(state.iv){
    if(k==="ArrowRight"||k==="Right"){e.preventDefault();ivGoto(1);}
    else if(k==="ArrowLeft"||k==="Left"){e.preventDefault();ivGoto(-1);}
    else if(k===" "||k==="Spacebar"){e.preventDefault(); if(state.iv.metodo==="sculpt"){ const q=resolve(ivStep().slot).q; if(q&&(q.t==="hold"||q.t==="falla")) ivHoldToggle(); else state.iv.running?stopMetro():startMetro(); } else fAction();}
    else if((k==="ArrowUp"||k==="Up")&&state.iv.metodo==="sculpt"){e.preventDefault();changeBpm(2);}
    else if((k==="ArrowDown"||k==="Down")&&state.iv.metodo==="sculpt"){e.preventDefault();changeBpm(-2);}
    else if(k==="Escape"||k==="Esc"){ivExit();}
    return;
  }
  if(state.modal&&(k==="Escape"||k==="Esc"))closeModal();
});

/* ============================================================
   10. MUTACIONES
   ============================================================ */
function deepClone(o){return JSON.parse(JSON.stringify(o));}
function findSlot(secId,u){ const S=state.routine.sections.find(x=>x.id===secId); return {S,s:S&&S.slots.find(x=>x.uid===u)}; }
function reTrans(){ const r=state.routine; if(r.estilo==="estacion") estTransiciones(r); else computeTransitions(r.sections, r.metodo, r.descanso); }
function moveSlot(secId,u,dir){ const {S}=findSlot(secId,u); const i=S.slots.findIndex(x=>x.uid===u), j=i+dir;
  if(j<0||j>=S.slots.length)return; [S.slots[i],S.slots[j]]=[S.slots[j],S.slots[i]]; reTrans(); render(); }
function delSlot(secId,u){ const {S}=findSlot(secId,u); S.slots=S.slots.filter(x=>x.uid!==u); reTrans(); render(); }
function swapSlot(secId,u){
  const r=state.routine, {S,s}=findSlot(secId,u);
  let pool;
  if(S.kind==="prep")pool=LIB.filter(e=>e.b==="prep");
  else if(S.kind==="cool")pool=LIB.filter(e=>e.b==="cool");
  else if(S.kind==="cardioFin")pool=LIB.filter(e=>e.b==="cardio");
  else if(r.metodo==="fuerza"){ const sd=secDef(MODES.fuerza[r.fModo].secs,S); pool=sd?fuerzaPool(sd.key):[]; }
  else if(r.metodo==="barre"){ const sd=secDef(MODES.barre[r.bModo].secs,S); pool=sd?barrePool(sd.sub,new Set()):LIB.filter(e=>e.b==="barre"); }
  else { const sd=secDef(MODES.sculpt[r.modo].secs,S); pool=sd?sculptPool(sd,new Set()):LIB.filter(e=>e.b===byId[s.ref].b); }
  const inUse=new Set(r.sections.flatMap(x=>x.slots.map(z=>z.ref)));
  if(r.estilo==="estacion"&&byId[s.ref].q){ const st=estSwapPool(S,s); if(st.length) pool=st; }
  let cand=shuffle(pool).find(e=>!inUse.has(e.id)) || shuffle(pool).find(e=>e.id!==s.ref);
  if(!cand)return;
  const i=S.slots.findIndex(x=>x.uid===u); const old=S.slots[i];
  S.slots[i]=(cand.q&&r.estilo==="estacion")?estSlot(cand,{base:r.base||8,dif:r.nivel},old.side):slot(cand); reTrans(); render();
}
function addPicked(secId,exId){ const r=state.routine, S=r.sections.find(x=>x.id===secId), ex=byId[exId];
  S.slots.push(ex.q&&r.estilo==="estacion"?estSlot(ex,{base:r.base||8,dif:r.nivel}):slot(ex)); reTrans(); closeModal(); render(); }
function setSlotField(f,v,silent){ const md=state.modal, {s}=findSlot(md.sec,md.uid); if(!s)return; s[f]=v; if(!silent)renderOverlay(); }
function recomputeAndRender(){ reTrans(); render(); }
function closeModal(){ state.modal=null; renderOverlay(); }

function savePlaylist(){
  const d=state.modal.data, g=id=>document.getElementById(id);
  d.nom=g("pl-nom").value.trim()||"Playlist";
  d.bpmMin=Math.max(50,Math.min(200,Number(g("pl-min").value)||100));
  d.bpmMax=Math.max(d.bpmMin,Math.min(200,Number(g("pl-max").value)||d.bpmMin+10));
  d.url=g("pl-url").value.trim(); d.notas=g("pl-notas").value.trim();
  if(state.modal.id){ const i=state.playlists.findIndex(x=>x.id===state.modal.id); state.playlists[i]={...state.playlists[i],...d}; }
  else state.playlists.unshift({id:pid(),...d});
  LS.set("sf_playlists",state.playlists); closeModal(); render();
}
function saveSong(){
  const d=state.modal.data, g=id=>document.getElementById(id);
  d.titulo=g("sg-titulo").value.trim()||"Canción";
  d.artista=g("sg-artista").value.trim()||"—";
  d.bpm=Math.max(50,Math.min(220,Number(g("sg-bpm").value)||120));
  d.url=g("sg-url").value.trim(); d.notas=g("sg-notas").value.trim();
  if(state.modal.id){ const i=state.musicLib.findIndex(x=>x.id===state.modal.id); state.musicLib[i]={...state.musicLib[i],...d}; }
  else state.musicLib.unshift({id:pid(),...d});
  LS.set("sf_musiclib",state.musicLib); closeModal(); render();
}
function doSave(){
  const nom=document.getElementById("sv-nom").value.trim()||state.routine.nombre;
  state.routine.nombre=nom;
  const snap=deepClone(state.routine); snap.id=rid(); snap.creada=Date.now();
  state.saved.unshift(snap); LS.set("sf_saved",state.saved); closeModal(); render(); toast("Rutina guardada");
}
function loadSaved(id){
  const r=state.saved.find(x=>x.id===id); if(!r)return;
  state.routine=deepClone(r); state.routine.id=rid();
  const c=state.cfg; c.metodo=r.metodo;
  if(r.metodo==="fuerza"){ c.fModo=r.fModo;c.objetivo=r.objetivo;c.fDuracion=r.duracion;c.fPorBloque=r.porBloque;c.descanso=r.descanso; }
  else if(r.metodo==="barre"){ c.bModo=r.bModo;c.bDificultad=r.bDificultad||"media";c.bBase=r.base;c.bPorBloque=r.porBloque;c.bDuracion=r.duracion; }
  else { c.estilo=r.estilo||"lista";c.modo=r.modo;c.nivel=r.nivel;c.duracion=r.duracion;c.base=r.base;if(r.porBloque)c.porBloque=r.porBloque; }
  state.screen="planner"; render(); window.scrollTo(0,0);
}

function routineText(r,incluirPlaylist){
  const esF=r.metodo==="fuerza", esB=r.metodo==="barre";
  const mode=MODES[r.metodo][esF?r.fModo:esB?r.bModo:r.modo];
  const est=estimateMinutes(r);
  const nWork=r.sections.filter(s=>s.kind==="work").length;
  let out=`${r.nombre}\n`;
  out+= esF ? `${objetivoOf(r.objetivo).nom} · ${r.series} series · descanso ${r.descanso}s · ~${est} min reales\n`
       : esB ? `${barreDifOf(r.bDificultad).nom} · ${nWork} bloques × ${r.porBloque} · pulsos y sostenes en cuentas de ${r.base} · ~${est} min reales\nClase fluida: encadena sin pausa, de pie → piso. La barra la hace el cubo o la pared. Termina estirando.\n`
       : r.estilo==="estacion" ? `${nivelOf(r.nivel).nom} · ${nWork} estaciones + reto final · base ${r.base} · ~${est} min\n${(r.material&&r.material.length)?"Material: "+r.material.join(", ")+"\n":""}`
       : `${nivelOf(r.nivel).nom} · ${nWork} bloques × ${r.porBloque} · ${r.vueltas} vueltas · base ${r.base} · ~${est} min reales\nClase fluida: de pie → piso, sin volver a subir. Termina en el mat.\n`;
  r.sections.forEach(S=>{
    out+=`\n${S.nom.toUpperCase()}\n`;
    S.slots.forEach((s,i)=>{
      const rs=resolve(s), sc=schemeText(rs,r,S.kind);
      out+=`${String(i+1).padStart(2)}. ${rs.nom}\n`;
      out+=`    ${sc.n} ${sc.u}${sc.tempo?' · '+sc.tempo:''}${rs.lado&&!sc.strength?' · por lado':''}${rs.side?' · Lado '+rs.side:''}  |  ${rs.eq}\n`;
      if(rs.nota)  out+=`    Nota: ${rs.nota}\n`;
      if(rs.trans) out+=`    -> ${rs.trans}\n`;
    });
  });
  if(incluirPlaylist){
    const b=playlistBrief(r);
    out+=`\n———\nPLAYLIST SPOTIFY (${b.min} min) — pega esto en la playlist con IA:\n${b.prompt}\n`;
  }
  return out;
}
function copyRoutine(){
  navigator.clipboard?.writeText(routineText(state.routine,true))
    .then(()=>toast("Rutina copiada — pégala en tus notas"),()=>toast("No se pudo copiar"));
}
function modalExport(){
  const txt=routineText(state.routine,true);
  return modalShell("Exportar rutina",`
    <p class="hint" style="margin:0 0 10px;color:var(--muted-2)">Cópiala a tus notas o guárdala como PDF (elige “Guardar como PDF” en el diálogo de impresión).</p>
    <textarea class="exp-box" id="exp-txt" readonly>${esc(txt)}</textarea>`,
    `<button class="btn ghost" data-action="close-modal">Cerrar</button>
     <button class="btn" data-action="exp-pdf">📄 Guardar PDF</button>
     <button class="btn primary" data-action="exp-copy">⧉ Copiar para notas</button>`);
}

function modalFeedback(){
  const r=state.routine, d=state.modal.data;
  const exList=[]; const seen=new Set();
  r.sections.forEach(S=>{ if(S.kind!=="prep"&&S.kind!=="cool") S.slots.forEach(s=>{ if(!seen.has(s.ref)){ seen.add(s.ref); exList.push({id:s.ref,nom:byId[s.ref].nom}); } }); });
  return modalShell("¿Cómo fue la clase?",`
    <div style="margin-bottom:16px">
      <label class="mini">Energía general</label>
      <div class="seg" style="margin-top:6px">${["Baja","Media","Alta","Excelente"].map(en=>`<button data-action="fb-en" data-v="${en}" class="${d.energia===en?'on':''}">${en}</button>`).join("")}</div>
    </div>
    <div style="margin-bottom:16px">
      <label class="mini">Ejercicios que NO aterrizaron (opcional)</label>
      <div class="picker" style="margin-top:6px;max-height:32vh">
        ${exList.map(e=>`<label class="fb-check"><input type="checkbox" data-action="fb-malo" data-id="${e.id}" ${d.malos.includes(e.id)?'checked':''}> ${esc(e.nom)}</label>`).join("")}
      </div>
    </div>
    <div style="margin-bottom:16px">
      <label class="mini">Ejercicio favorito de hoy (opcional)</label>
      <select class="inp" data-action="fb-favorito" style="margin-top:6px">
        <option value="">— ninguno —</option>
        ${exList.map(e=>`<option value="${e.id}" ${d.favorito===e.id?'selected':''}>${esc(e.nom)}</option>`).join("")}
      </select>
    </div>
    <div style="margin-bottom:16px"><label class="mini">¿Qué canción pegó o qué cambiarías de la música?</label><input class="inp" data-action="fb-musica" value="${esc(d.notaMusica)}" placeholder="opcional" style="margin-top:6px"></div>
    <div><label class="mini">Nota libre</label><textarea class="inp" data-action="fb-nota" rows="3" placeholder="opcional" style="margin-top:6px">${esc(d.notaLibre)}</textarea></div>`,
    `<button class="btn ghost" data-action="close-modal">Cancelar</button><button class="btn primary" data-action="fb-guardar">Guardar</button>`);
}
function modalSong(md){
  const s=md.data;
  return modalShell(md.id?"Editar canción":"Añadir canción",`
    <div class="form-grid">
      <div class="full"><label class="mini">Título</label><input class="inp" id="sg-titulo" value="${esc(s.titulo)}"></div>
      <div class="full"><label class="mini">Artista</label><input class="inp" id="sg-artista" value="${esc(s.artista)}"></div>
      <div><label class="mini">BPM real</label><input class="inp" id="sg-bpm" type="number" value="${s.bpm}"></div>
      <div><label class="mini">Energía</label><div class="seg">${["Baja","Media","Alta","Picos"].map(en=>`<button data-action="songf-en" data-v="${en}" class="${s.energia===en?'on':''}">${en}</button>`).join("")}</div></div>
      <div class="full"><label class="mini">Enlace (opcional)</label><input class="inp" id="sg-url" value="${esc(s.url||'')}" placeholder="https://open.spotify.com/track/…"></div>
      <div class="full"><label class="mini">Notas</label><input class="inp" id="sg-notas" value="${esc(s.notas||'')}" placeholder="para qué bloque la usas, etc."></div>
    </div>`,
    `<button class="btn ghost" data-action="close-modal">Cancelar</button><button class="btn primary" data-action="songf-save">Guardar</button>`);
}

let toastT=null;
function toast(msg){
  let el=document.getElementById("toast");
  if(!el){ el=document.createElement("div"); el.id="toast";
    el.style.cssText="position:fixed;left:50%;bottom:28px;transform:translateX(-50%);background:var(--accent);color:#1a0d06;font-weight:700;padding:11px 20px;border-radius:10px;z-index:200;box-shadow:var(--shadow);font-size:14px;max-width:90vw;text-align:center";
    document.body.appendChild(el); }
  el.textContent=msg; el.style.opacity="1"; clearTimeout(toastT);
  toastT=setTimeout(()=>{el.style.transition="opacity .4s";el.style.opacity="0";},2000);
}

