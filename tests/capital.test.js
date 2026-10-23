/* Pruebas del motor de cálculo de Finanzas (CAP). Usan datos ficticios y valores calculados a mano.
   Uso: node tests/capital.test.js */
const fs=require('fs'), vm=require('vm'), path=require('path');
const src=fs.readFileSync(path.join(__dirname,'../js/finanzas.js'),'utf8');
const m=src.match(/\/\*CAPITAL-START\*\/([\s\S]*?)\/\*CAPITAL-END\*\//);
if(!m){ console.log('FALLA: no encuentro el motor entre CAPITAL-START y CAPITAL-END'); process.exit(1); }
const ctx={}; vm.createContext(ctx); vm.runInContext(m[1]+';this.CAP=CAP;',ctx); const CAP=ctx.CAP;
let fails=0; const ok=(c,msg)=>{ if(!c){fails++;console.log('FALLA:',msg);} else console.log('ok  ',msg); };
const eq=(a,b,msg)=>ok(Math.abs(a-b)<0.005,msg+' (esperado '+b+', obtenido '+a+')');

/* ---- caso base, hecho a mano ----
   hoy 2026-10-22 · saldo 5,000 · pago de 1,500 el 30-oct · ingreso confirmado de 4,000 el 5-nov · esencial 100/día
   Hasta el 5-nov son 14 días: lo esencial es 1,400. Disponible antes = 5,000 − 1,500 − 1,400 = 2,100. */
const base={hoy:'2026-10-22',saldoLiquido:5000,reservas:[],pagos:[{concepto:'Renta',monto:1500,fecha:'2026-10-30'}],
  ingresos:[{concepto:'Quincena',monto:4000,fecha:'2026-11-05',estado:'confirmado'}],gastoEsencialDiario:100,reservaSeguridad:0,tipo:'gusto',pago:'contado',puedeEsperar:true};

const d=CAP.disponible(base);
eq(d.disponible,2100,'disponible hoy = 5000 − 1500 − 1400');
ok(d.diasHastaIngreso===14,'14 días hasta el siguiente ingreso confirmado');

let r=CAP.compra({...base,precio:2000});
eq(r.disponibleAntes,2100,'compra 2000: disponible antes'); eq(r.disponibleDespues,100,'compra 2000: disponible después = 100');
ok(r.veredicto==='ESPERAR','no basta con que el saldo sea positivo: quedan 100 < colchón 300 → MEJOR ESPERAR ('+r.veredicto+')');
ok(r.fechaViable==='2026-11-05','la compra cabría el día del ingreso confirmado ('+r.fechaViable+')');

r=CAP.compra({...base,precio:500}); eq(r.disponibleDespues,1600,'compra 500: después = 1600');
ok(r.veredicto==='VIABLE','compra 500 deja 1600 ≥ 2×colchón → VIABLE ('+r.veredicto+')');

r=CAP.compra({...base,precio:2200}); eq(r.disponibleDespues,-100,'compra 2200: déficit de 100');
ok(r.veredicto==='NO','compra que deja déficit → NO RECOMENDABLE');
ok(/100/.test(r.alternativa)||r.fechaViable,'da una alternativa concreta');

r=CAP.compra({...base,precio:1700}); eq(r.disponibleDespues,400,'compra 1700: después = 400');
ok(r.veredicto==='CONDICIONES','400 está entre 1× y 2× el colchón → CON CONDICIONES ('+r.veredicto+')');

/* necesidad que no puede esperar y deja menos que el colchón → con condiciones, no "esperar" */
r=CAP.compra({...base,precio:2000,tipo:'necesidad',puedeEsperar:false}); ok(r.veredicto==='CONDICIONES','necesidad que no puede esperar → CON CONDICIONES');

/* sin ingreso confirmado: provisional y sin contar el dinero que solo se espera */
const sinIng={...base,ingresos:[{concepto:'Quincena',monto:4000,fecha:'2026-11-05',estado:'esperado'}]};
r=CAP.compra({...sinIng,precio:500}); ok(r.provisional===true,'sin ingreso confirmado la respuesta es provisional');
ok(r.diasHastaIngreso===null,'no cuenta un ingreso solo esperado');
ok(r.veredicto!=='VIABLE','provisional nunca es VIABLE a secas ('+r.veredicto+')');
// 30 días: esencial 3000; pagos 1500 el 30-oct caen dentro → antes = 5000−1500−3000 = 500 → después = 0
eq(r.disponibleAntes,500,'sin ingreso: 5000 − 1500 − 30 días×100 = 500');

/* un ingreso confirmado retrasado no se cuenta antes de su fecha */
const tarde={...base,ingresos:[{concepto:'Pago',monto:4000,fecha:'2026-11-20',estado:'confirmado'}]};
eq(CAP.disponible(tarde).disponible,5000-1500-29*100,'ingreso confirmado el 20-nov: esencial de 29 días');

/* reservas y reserva de seguridad se restan una vez */
eq(CAP.disponible({...base,reservas:[{concepto:'Meta laptop',monto:300}],reservaSeguridad:200}).disponible,2100-300-200,'reservas y reserva de seguridad restan una sola vez');

/* datos inválidos */
ok(CAP.compra({...base,precio:0}).error,'precio 0 → pide el precio');
ok(CAP.compra({...base,precio:-50}).error,'precio negativo → pide el precio');
const f=CAP.compra({...base,saldoLiquido:NaN,gastoEsencialDiario:0,precio:100}); ok(f.faltan.length>=1&&f.provisional,'si faltan datos lo dice y es provisional');

/* ---- crédito ---- */
const c0=CAP.cuota(1200,12,0); eq(c0.cuota,100,'12 meses sin intereses: 1200/12 = 100'); eq(c0.intereses,0,'sin intereses: costo extra 0');
const c1=CAP.cuota(1000,12,24); // cuota francesa: 1000·0.02/(1−1.02^-12) = 94.56
eq(c1.cuota,94.56,'cuota a 24% anual, 12 meses = 94.56'); eq(c1.total,1134.72,'total 94.56×12 = 1134.72'); eq(c1.intereses,134.72,'intereses 134.72');
r=CAP.compra({...base,precio:6000,pago:'credito',credito:{meses:12,tasaAnual:60},ingresoMensualBase:8000,obligacionesMensuales:2000,esencialMensual:3000});
ok(r.credito&&r.credito.intereses>0,'a crédito calcula intereses'); eq(r.margenMensual.carga,Math.round((2000+r.credito.cuota)/80*10)/10,'la carga de pagos es un porcentaje del ingreso mensual (cuota '+r.credito.cuota+')'); ok(r.veredicto==='NO'||r.veredicto==='ESPERAR','crédito caro con carga alta no se recomienda ('+r.veredicto+')');
ok(r.riesgos.some(x=>/tasa anual/.test(x)),'avisa de una tasa anual muy alta');

/* ---- deudas: avalancha vs bola de nieve ----
   A: saldo 300, 10% anual, mínimo 50 · B: saldo 2000, 40% anual, mínimo 100 · extra 100.
   Mes 1 avalancha: A 300+2.50−50 = 252.50 · B 2000+66.67−100−100(extra) = 1866.67 */
const deudas=[{id:'a',nombre:'A',saldo:300,tasaAnual:10,pagoMinimo:50},{id:'b',nombre:'B',saldo:2000,tasaAnual:40,pagoMinimo:100}];
const av=CAP.simulaDeudas(deudas,100,'avalancha',true), bo=CAP.simulaDeudas(deudas,100,'bola',true);
eq(av.traza[0][0],252.5,'avalancha mes 1: deuda A = 252.50'); eq(av.traza[0][1],1866.67,'avalancha mes 1: deuda B = 1866.67');
// bola de nieve: el extra va a A (la más pequeña): A 300+2.5−150 = 152.50 · B 2066.67−100 = 1966.67
eq(bo.traza[0][0],152.5,'bola mes 1: A = 152.50'); eq(bo.traza[0][1],1966.67,'bola mes 1: B = 1966.67');
ok(av.intereses<=bo.intereses,'la avalancha nunca paga más intereses que la bola de nieve');
ok(av.meses>0&&av.orden.length===2&&!av.noAmortiza,'las dos deudas se liquidan y quedan ordenadas');
const E=CAP.estrategiaDeudas(deudas,100); eq(E.ahorroIntereses,bo.intereses-av.intereses,'el ahorro de intereses es la diferencia exacta');
const sin=CAP.estrategiaDeudas([{id:'x',nombre:'X',saldo:100,tasaAnual:null,pagoMinimo:50}],0); ok(sin.sinTasa.includes('X'),'avisa de deudas sin tasa registrada');
const mala=CAP.simulaDeudas([{id:'z',nombre:'Z',saldo:100000,tasaAnual:60,pagoMinimo:100}],0,'avalancha'); ok(mala.noAmortiza,'si el mínimo no cubre los intereses, lo marca como que no se liquida');
eq(CAP.simulaDeudas([{id:'q',nombre:'Q',saldo:1000,tasaAnual:0,pagoMinimo:100}],0,'avalancha').meses,10,'1000 al 0% con 100 al mes = 10 meses');

/* ---- proyección ---- */
const pr=CAP.proyeccion({hoy:'2026-10-22',saldoLiquido:1000,pagos:[{monto:200,fecha:'2026-10-25'}],ingresos:[{monto:1000,fecha:'2026-10-28',estado:'confirmado'},{monto:1000,fecha:'2026-10-29',estado:'esperado'}],gastoEsencialDiario:50},10);
// base: 1000 + 1000 + 700 − 200 − 10×50 = 2000 · conservador: 1000 + 1000 − 200 − 10×57.5 = 1225 · optimista: 1000+2000−200−10×45 = 2350
eq(pr.base.final,2000,'proyección base a 10 días = 2000'); eq(pr.conservador.final,1225,'conservador = 1225'); eq(pr.optimista.final,2350,'optimista = 2350');
ok(pr.conservador.final<pr.base.final&&pr.base.final<pr.optimista.final,'conservador < base < optimista');

/* ---- patrimonio ---- */
const pat=CAP.patrimonio([{nombre:'Cuenta',valor:3000},{nombre:'Fondo',valor:2000},{nombre:'Bici',valor:null}],[{nombre:'Tarjeta',valor:1500},{nombre:'Préstamo',valor:500}]);
eq(pat.neto,3000,'patrimonio = 5000 − 2000'); ok(pat.sinValor.includes('Bici'),'no cuenta activos sin valor conocido y los avisa');

/* ---- precisión de centavos ---- */
eq(CAP.disponible({...base,saldoLiquido:0.1+0.2,pagos:[],ingresos:[],gastoEsencialDiario:0}).disponible,0.3,'0.1 + 0.2 = 0.30 exacto (sin coma flotante)');

console.log(fails?`\n${fails} prueba(s) con falla`:'\nTodas las pruebas pasaron'); process.exit(fails?1:0);
