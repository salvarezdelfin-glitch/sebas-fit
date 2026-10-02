"use strict";
/* ============================================================
   COTIZADOR · personal trainer presencial y rutina mandada (a distancia)
   Precios editables; los valores de arranque salen de un estudio de mercado
   (México / CDMX, 2026) posicionado en medio-alto por ser instructora de estudios
   boutique con programación por nivel y seguimiento.
   Datos en Vault.data.cot = {precios, cotizaciones, seq, cfg}
   ============================================================ */
const COT_PRECIOS_DEF={
  presencial:{sesion:850,domicilio:150,evaluacion:600,dur90:1.4,segunda:0.75,tercera:0.65,
    paquetes:[{n:4,desc:5,dias:45},{n:8,desc:10,dias:60},{n:12,desc:15,dias:75}]},
  remoto:{rutina:{basico:900,intermedio:1200,avanzado:1500},plan:{basico:1800,seguimiento:2800,premium:3800},desc3:10,desc6:15,
    addons:{videollamada:500,revision:200,ajuste:350}},
};
const COT_PLANES={
  basico:{nom:"Plan Base",inc:["Rutina mensual personalizada a tu nivel","1 ajuste de programa al mes","Dudas por chat en días hábiles"]},
  seguimiento:{nom:"Plan Seguimiento",inc:["Rutina personalizada con progresión semanal","Ajuste cada semana según tu registro","Revisión de técnica por video (hasta 4 al mes)","Medidas y metas mensuales"]},
  premium:{nom:"Plan Premium",inc:["Todo lo del Plan Seguimiento","2 videollamadas de 45 min al mes","Respuestas con prioridad","Plan de progresión trimestral"]},
};
const COT_RUTINA_INC=["Programa de 4 semanas por nivel, objetivo y material","Cada ejercicio con series, repeticiones, RIR y descansos","Indicaciones de técnica y progresión","Entrega en PDF y WhatsApp"];
const COT_COND=["Las sesiones se agendan con anticipación; cancelaciones o cambios con al menos 12 horas de aviso.","Los paquetes tienen vigencia; las sesiones no usadas al vencer no son reembolsables.","El programa es personalizado y no sustituye valoración médica: si hay lesión o condición de salud, avísame antes de empezar."];
/* referencia de mercado (fuentes consultadas oct-2026) */
const COT_MERCADO=[
  ["Sesión presencial en CDMX","$500 – $1,200 (promedio ≈ $762)","Cronoshare · Superprof"],
  ["Sesión a domicilio en CDMX","$800 – $990 con traslado cercano incluido","Cronoshare"],
  ["Zonas premium (Polanco, Santa Fe, Condesa)","$1,000+ por sesión","Cronoshare · KruxFit"],
  ["Paquete de 8 sesiones","$5,200 – $7,200","Cronoshare"],
  ["Paquetes (descuento habitual)","10 – 20% sobre el precio por sesión","Cronoshare"],
  ["Mensual presencial en CDMX","$4,000 – $8,000 (promedio ≈ $5,000)","KruxFit"],
  ["Entrenamiento online mensual","$800 – $4,000 según seguimiento","Cronoshare · KruxFit"],
  ["Rutina personalizada (PDF)","$500 – $1,500","Tiendas de coaches en México"],
  ["Plan de 12 semanas con alimentación","≈ $4,000","Tiendas de coaches en México"],
];
const COT_FUENTES=[["Cronoshare · cuánto cobra un entrenador","https://www.cronoshare.com.mx/cuanto-cuesta/entrenador-personal"],
  ["Cronoshare · entrenador online","https://www.cronoshare.com.mx/cuanto-cuesta/entrenador-personal-online"],
  ["KruxFit · cuánto cuesta un entrenador en México","https://kruxfit.ai/blog/cuanto-cuesta-entrenador-personal-mexico"],
  ["Superprof · entrenadores en CDMX","https://www.superprof.mx/clases/entrenador-personal/ciudad-de-mexico/"]];
const COTUI={tab:"nueva",draft:null,ver:null};
const COT_D=()=>Vault.data.cot;
function cotPrecios(){ const D=COT_D(); if(!D.precios) D.precios=clone(COT_PRECIOS_DEF); return D.precios; }
function cotCfg(){ const c=COT_D().cfg; if(c.nombre===undefined){ Object.assign(c,{nombre:"Sebas",tel:"",ciudad:"CDMX",vigenciaDias:15,anticipoPct:50,iva:false}); } return c; }
const r50=n=>Math.round(n/50)*50;
function cotDraftNuevo(clienteId){
  const c=clienteId?ptCliente(clienteId):null;
  return {tipo:c&&c.modalidad==="remoto"?"remoto":"presencial",clienteId:clienteId||null,nombre:c?c.nombre:"",tel:c?c.tel||"":"",
    paquete:8,paqueteN:8,sede:"estudio",personas:1,duracion:60,evaluacion:"auto",descExtra:0,
    producto:"plan",nivel:c?c.nivel:"basico",plan:"seguimiento",meses:1,add:{videollamada:0,revision:0,ajuste:0},notas:""};
}
/* ---------- cálculo ---------- */
function cotCalcular(d){
  const P=cotPrecios(), cfg=cotCfg(), L=[]; let desc=0, sesiones=null, incluye=[], titulo="";
  if(d.tipo==="presencial"){
    const pr=P.presencial, n=d.paquete==="otro"?Math.max(1,+d.paqueteN||1):+d.paquete;
    let por=pr.sesion*(d.duracion===90?pr.dur90:1)+(d.sede==="domicilio"?pr.domicilio:0);
    const k=1+(d.personas>=2?pr.segunda:0)+(d.personas>=3?(d.personas-2)*pr.tercera:0);
    por=por*k;
    const pk=pr.paquetes.slice().sort((a,b)=>b.n-a.n).find(p=>n>=p.n), dpct=pk?pk.desc:0, sinDesc=por*n, importe=r50(sinDesc*(1-dpct/100));
    titulo=n===1?"Sesión de personal trainer":"Paquete de "+n+" sesiones";
    L.push({concepto:titulo,detalle:d.duracion+" min · "+(d.sede==="domicilio"?"a domicilio":"en estudio / gimnasio")+" · "+d.personas+(d.personas===1?" persona":" personas")+(n>1?" · "+n+" × "+money(r50(por)):""),qty:1,importe:r50(sinDesc)});
    if(dpct) { L.push({concepto:"Descuento por paquete ("+dpct+"%)",detalle:"",qty:1,importe:-(r50(sinDesc)-importe),desc:true}); desc+=r50(sinDesc)-importe; }
    const evGratis=n>=8;
    if(d.evaluacion==="extra"||(d.evaluacion==="auto"&&!evGratis)) L.push({concepto:"Evaluación inicial",detalle:"Valoración, medidas, objetivos y movilidad",qty:1,importe:pr.evaluacion});
    else if(d.evaluacion!=="no") L.push({concepto:"Evaluación inicial",detalle:"Incluida en paquetes de 8 sesiones o más",qty:1,importe:0});
    sesiones=n; incluye=["Sesión guiada uno a uno, con técnica y progresión","Programa de entrenamiento personalizado por nivel","Seguimiento de cargas y progreso en cada sesión"];
    if(pk) incluye.push("Vigencia del paquete: "+pk.dias+" días");
  } else {
    const pr=P.remoto;
    if(d.producto==="rutina"){
      titulo="Rutina personalizada ("+PT_NIVELES[d.nivel].nom+")";
      L.push({concepto:titulo,detalle:"Programa de 4 semanas · entrega en PDF y WhatsApp",qty:1,importe:pr.rutina[d.nivel]}); incluye=COT_RUTINA_INC;
    } else {
      const m=+d.meses, dpct=m>=6?pr.desc6:m>=3?pr.desc3:0, base=pr.plan[d.plan]*m, importe=r50(base*(1-dpct/100));
      titulo=COT_PLANES[d.plan].nom+" · "+m+(m===1?" mes":" meses");
      L.push({concepto:titulo,detalle:money(pr.plan[d.plan])+" al mes"+(m>1?" × "+m:""),qty:1,importe:base});
      if(dpct){ L.push({concepto:"Descuento por "+m+" meses ("+dpct+"%)",detalle:"",qty:1,importe:-(base-importe),desc:true}); desc+=base-importe; }
      incluye=COT_PLANES[d.plan].inc;
    }
    [["videollamada","Videollamada de 45 min"],["revision","Revisión de técnica por video"],["ajuste","Ajuste extra de programa"]].forEach(([k,l])=>{ const q=+d.add[k]||0; if(q>0) L.push({concepto:l,detalle:q+" × "+money(pr.addons[k]),qty:q,importe:q*pr.addons[k]}); });
  }
  let sub=L.reduce((s,x)=>s+x.importe,0);
  const dx=Math.max(0,Math.min(30,+d.descExtra||0));
  if(dx){ const m=-r50(sub*dx/100); L.push({concepto:"Descuento especial ("+dx+"%)",detalle:"",qty:1,importe:m,desc:true}); sub+=m; desc+=-m; }
  const iva=cfg.iva?Math.round(sub*0.16):0, total=sub+iva, anticipo=Math.round(total*(cfg.anticipoPct||0)/100/10)*10;
  return {lineas:L,subtotal:sub,iva,total,anticipo,descuentos:desc,sesiones,incluye,titulo,porSesion:sesiones?Math.round(sub/sesiones):null};
}
function cotFolio(){ const D=COT_D(); D.seq=(D.seq||0)+1; return "COT-"+String(D.seq).padStart(4,"0"); }
function cotEstadoReal(q){ return q.estado==="enviada"&&q.vigencia<todayStr()?"vencida":q.estado; }
function cotTexto(q){
  const cfg=cotCfg(), c=q.calc, tipo=q.draft.tipo==="presencial"?"Personal trainer presencial":"Entrenamiento a distancia";
  let t=`*${cfg.nombre?cfg.nombre+" · ":""}SEBAS FIT — ${q.folio}*\n${tipo}\nPara: ${q.cliente.nombre||"—"}\nFecha: ${fmtCorto(q.fecha)} · Vigencia: hasta ${fmtCorto(q.vigencia)}\n\n`;
  c.lineas.forEach(l=>{ t+=`• ${l.concepto}${l.detalle?" — "+l.detalle:""}: ${l.importe<0?"-":""}${money(Math.abs(l.importe))}\n`; });
  if(c.iva) t+=`• IVA 16%: ${money(c.iva)}\n`;
  t+=`\n*Total: ${money(c.total)}*${c.porSesion&&c.sesiones>1?` (${money(c.porSesion)} por sesión)`:""}\n`;
  if(cfg.anticipoPct) t+=`Para apartar: ${money(c.anticipo)} (${cfg.anticipoPct}%)\n`;
  t+=`\n*Incluye*\n${c.incluye.map(x=>"✔ "+x).join("\n")}\n\n*Condiciones*\n${COT_COND.map(x=>"• "+x).join("\n")}`;
  if(q.notas) t+=`\n\n${q.notas}`;
  return t;
}
function cotPrintHtml(q){
  const cfg=cotCfg(), c=q.calc;
  return `<div class="pd"><div class="pd-head"><div><div class="pd-brand">SEBAS FIT</div><h1>Cotización ${esc(q.folio)}</h1><p>${q.draft.tipo==="presencial"?"Personal trainer presencial":"Entrenamiento a distancia"}</p></div><div class="pd-date">${fmtCorto(q.fecha)}<br><span class="sm">vigente hasta ${fmtCorto(q.vigencia)}</span></div></div>
    <p><b>Para:</b> ${esc(q.cliente.nombre||"—")}${q.cliente.tel?" · "+esc(q.cliente.tel):""}</p>
    <table><thead><tr><th>Concepto</th><th style="text-align:right">Importe</th></tr></thead><tbody>${c.lineas.map(l=>`<tr><td><b>${esc(l.concepto)}</b>${l.detalle?`<br><span class="sm">${esc(l.detalle)}</span>`:""}</td><td style="text-align:right">${l.importe<0?"-":""}${money(Math.abs(l.importe))}</td></tr>`).join("")}
    ${c.iva?`<tr><td>IVA 16%</td><td style="text-align:right">${money(c.iva)}</td></tr>`:""}<tr><td><b>Total</b></td><td style="text-align:right"><b>${money(c.total)}</b></td></tr></tbody></table>
    ${cfg.anticipoPct?`<p>Para apartar: <b>${money(c.anticipo)}</b> (${cfg.anticipoPct}%).</p>`:""}
    <div class="pd-notes"><b>Incluye</b><ul>${c.incluye.map(x=>`<li>${esc(x)}</li>`).join("")}</ul><b>Condiciones</b><ul>${COT_COND.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>${q.notas?`<p>${esc(q.notas)}</p>`:""}</div></div>`;
}

/* ---------- vistas ---------- */
function viewCotizador(){
  if(!COTUI.draft) COTUI.draft=cotDraftNuevo(null);
  const T=[["nueva","Nueva cotización"],["lista","Cotizaciones ("+COT_D().cotizaciones.length+")"],["precios","Precios y mercado"]];
  const body=COTUI.tab==="lista"?cotLista():COTUI.tab==="precios"?cotPreciosView():cotNueva();
  return `<div class="wrap"><header class="page-head"><span class="eyebrow">Personal trainer</span><h1>Cotizador</h1><p class="sub">Presencial y rutina mandada, con precios basados en el mercado de CDMX. Todos los precios se editan en "Precios y mercado".</p></header>
    <div class="tabs">${T.map(([k,l])=>`<button data-action="ct-tab" data-v="${k}" class="${COTUI.tab===k?"on":""}">${l}</button>`).join("")}</div>${body}</div>`;
}
function seg2(action,key,opts,cur){ return `<div class="seg">${opts.map(([v,l])=>`<button data-action="${action}" data-k="${key}" data-v="${v}" class="${String(cur)===String(v)?"on":""}">${l}</button>`).join("")}</div>`; }
function cotNueva(){
  const d=COTUI.draft, P=cotPrecios(), c=cotCalcular(d), cl=PT_D().clientes;
  const quien=`<div class="form-grid"><div><label class="mini">Cliente</label><select class="inp" data-action="ct-cliente"><option value="">Prospecto nuevo</option>${cl.map(x=>`<option value="${x.id}" ${d.clienteId===x.id?"selected":""}>${esc(x.nombre)}</option>`).join("")}</select></div>
    <div><label class="mini">Nombre</label><input class="inp" data-action="ct-t" data-k="nombre" value="${esc(d.nombre)}" placeholder="Nombre del cliente"></div>
    <div><label class="mini">Teléfono</label><input class="inp" data-action="ct-t" data-k="tel" value="${esc(d.tel)}" inputmode="tel"></div></div>`;
  const tipo=`<div class="seg big">${[["presencial","Personal trainer presencial"],["remoto","Rutina mandada (a distancia)"]].map(([v,l])=>`<button data-action="ct-set" data-k="tipo" data-v="${v}" class="${d.tipo===v?"on":""}">${l}</button>`).join("")}</div>`;
  let cfg="";
  if(d.tipo==="presencial"){
    const pk=P.presencial.paquetes.map(p=>[p.n,p.n+" sesiones"+(p.desc?` (−${p.desc}%)`:"")]);
    cfg=`<div class="form-grid"><div class="full"><label class="mini">Paquete</label>${seg2("ct-set","paquete",[[1,"1 sesión"],...pk,["otro","Otro"]],d.paquete)}${d.paquete==="otro"?`<input class="inp w-auto" style="margin-top:8px;width:140px" type="number" min="1" data-action="ct-t" data-k="paqueteN" value="${d.paqueteN}" aria-label="Número de sesiones">`:""}</div>
      <div><label class="mini">Dónde</label>${seg2("ct-set","sede",[["estudio","Estudio / gimnasio"],["domicilio","A domicilio"]],d.sede)}</div>
      <div><label class="mini">Personas</label>${seg2("ct-set","personas",[[1,"1"],[2,"2"],[3,"3"],[4,"4"]],d.personas)}</div>
      <div><label class="mini">Duración</label>${seg2("ct-set","duracion",[[60,"60 min"],[90,"90 min"]],d.duracion)}</div>
      <div><label class="mini">Evaluación inicial</label>${seg2("ct-set","evaluacion",[["auto","Automática"],["extra","Cobrar"],["no","Sin evaluación"]],d.evaluacion)}</div></div>`;
  } else {
    cfg=`<div class="form-grid"><div class="full"><label class="mini">Producto</label>${seg2("ct-set","producto",[["rutina","Rutina única (4 semanas)"],["plan","Plan mensual con seguimiento"]],d.producto)}</div>
      ${d.producto==="rutina"?`<div class="full"><label class="mini">Nivel del cliente</label>${seg2("ct-set","nivel",Object.keys(PT_NIVELES).map(k=>[k,PT_NIVELES[k].nom+" · "+money(P.remoto.rutina[k])]),d.nivel)}</div>`
        :`<div class="full"><label class="mini">Plan</label>${seg2("ct-set","plan",Object.keys(COT_PLANES).map(k=>[k,COT_PLANES[k].nom+" · "+money(P.remoto.plan[k])]),d.plan)}</div>
        <div class="full"><label class="mini">Duración</label>${seg2("ct-set","meses",[[1,"1 mes"],[3,"3 meses (−"+P.remoto.desc3+"%)"],[6,"6 meses (−"+P.remoto.desc6+"%)"]],d.meses)}</div>`}
      <div class="full"><label class="mini">Extras</label><div class="addons">${[["videollamada","Videollamada 45 min",P.remoto.addons.videollamada],["revision","Revisión de técnica (video)",P.remoto.addons.revision],["ajuste","Ajuste extra de programa",P.remoto.addons.ajuste]].map(([k,l,pr])=>`<label class="addon"><span>${l} <small>${money(pr)}</small></span><input class="inp" type="number" min="0" max="20" data-action="ct-add" data-k="${k}" value="${d.add[k]||0}" aria-label="${l}"></label>`).join("")}</div></div></div>`;
  }
  const extra=`<div class="form-grid"><div><label class="mini">Descuento especial (%)</label><input class="inp" type="number" min="0" max="30" data-action="ct-t" data-k="descExtra" value="${d.descExtra||0}"></div>
    <div class="full"><label class="mini">Nota para el cliente</label><input class="inp" data-action="ct-t" data-k="notas" value="${esc(d.notas)}" placeholder="opcional"></div></div>`;
  const preview=`<aside class="quote-card"><div class="qc-head"><span class="eyebrow">Vista previa</span><h3>${esc(c.titulo)}</h3></div>
    <div class="qc-lines">${c.lineas.map(l=>`<div class="qc-line ${l.desc?"desc":""}"><div><b>${esc(l.concepto)}</b>${l.detalle?`<div class="hint">${esc(l.detalle)}</div>`:""}</div><span class="num">${l.importe<0?"−":""}${money(Math.abs(l.importe))}</span></div>`).join("")}
    ${c.iva?`<div class="qc-line"><div><b>IVA 16%</b></div><span class="num">${money(c.iva)}</span></div>`:""}</div>
    <div class="qc-total"><span>Total</span><b class="num">${money(c.total)}</b></div>
    ${c.porSesion&&c.sesiones>1?`<div class="hint">≈ ${money(c.porSesion)} por sesión</div>`:""}
    ${cotCfg().anticipoPct?`<div class="hint">Anticipo para apartar (${cotCfg().anticipoPct}%): <b>${money(c.anticipo)}</b></div>`:""}
    <ul class="qc-inc">${c.incluye.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>
    <div class="acts"><button class="btn primary" data-action="ct-guardar">Guardar cotización</button><button class="btn" data-action="ct-copiar-draft">⧉ Copiar para WhatsApp</button></div></aside>`;
  return `<div class="cot-grid"><div class="cot-form"><section class="card"><h3>Cliente</h3>${quien}</section><section class="card"><h3>Servicio</h3>${tipo}${cfg}</section><section class="card"><h3>Ajustes</h3>${extra}</section></div>${preview}</div>`;
}
function cotLista(){
  const L=COT_D().cotizaciones.slice().sort((a,b)=>a.creado<b.creado?1:-1);
  if(!L.length) return `<div class="empty"><b>Aún no hay cotizaciones guardadas.</b><p>Crea una en "Nueva cotización".</p></div>`;
  const cols={borrador:"",enviada:"info",aceptada:"ok",pagada:"ok",rechazada:"warn",vencida:"warn"};
  return `<div class="list-lines cot-list">${L.map(q=>{ const es=cotEstadoReal(q);
    return `<div class="cot-row"><div class="cr-main"><b>${esc(q.folio)}</b> · ${esc(q.cliente.nombre||"—")}<div class="hint">${esc(q.calc.titulo)} · ${fmtCorto(q.fecha)} · vigente hasta ${fmtCorto(q.vigencia)}</div></div>
      <b class="num">${money(q.calc.total)}</b><span class="chip ${cols[es]||""}">${es}</span>
      <div class="acts"><button class="btn sm" data-action="ct-copiar" data-id="${q.id}">⧉ WhatsApp</button><button class="btn sm" data-action="ct-print" data-id="${q.id}">⎙ PDF</button>
      ${es==="borrador"?`<button class="btn sm" data-action="ct-estado" data-id="${q.id}" data-v="enviada">Marcar enviada</button>`:""}
      ${["enviada","vencida","borrador"].includes(es)?`<button class="btn sm primary" data-action="ct-aceptar" data-id="${q.id}">Aceptar</button><button class="btn sm ghost" data-action="ct-estado" data-id="${q.id}" data-v="rechazada">Rechazar</button>`:""}
      <button class="del" data-action="ct-del" data-id="${q.id}" aria-label="Eliminar cotización">✕</button></div></div>`; }).join("")}</div>`;
}
function cotPreciosView(){
  const P=cotPrecios(), cfg=cotCfg(), pr=P.presencial, rm=P.remoto;
  const n=(id,l,v,step)=>`<div><label class="mini">${l}</label><input class="inp" type="number" inputmode="decimal" step="${step||1}" data-action="ct-precio" data-id="${id}" value="${v}"></div>`;
  return `<div class="cot-grid"><div class="cot-form">
    <section class="card"><h3>Presencial</h3><div class="form-grid g3">${n("presencial.sesion","Sesión 60 min (MXN)",pr.sesion)}${n("presencial.domicilio","Extra a domicilio",pr.domicilio)}${n("presencial.evaluacion","Evaluación inicial",pr.evaluacion)}
      ${n("presencial.dur90","Factor sesión 90 min",pr.dur90,0.05)}${n("presencial.segunda","2ª persona (factor)",pr.segunda,0.05)}${n("presencial.tercera","3ª persona+ (factor)",pr.tercera,0.05)}</div>
      <h4>Paquetes</h4><div class="form-grid g3">${pr.paquetes.map((p,i)=>`${n("presencial.paquetes."+i+".n","Sesiones",p.n)}${n("presencial.paquetes."+i+".desc","Descuento %",p.desc)}${n("presencial.paquetes."+i+".dias","Vigencia (días)",p.dias)}`).join("")}</div></section>
    <section class="card"><h3>Rutina mandada</h3><div class="form-grid g3">${n("remoto.rutina.basico","Rutina · Básico",rm.rutina.basico)}${n("remoto.rutina.intermedio","Rutina · Intermedio",rm.rutina.intermedio)}${n("remoto.rutina.avanzado","Rutina · Avanzado",rm.rutina.avanzado)}
      ${n("remoto.plan.basico","Plan Base / mes",rm.plan.basico)}${n("remoto.plan.seguimiento","Plan Seguimiento / mes",rm.plan.seguimiento)}${n("remoto.plan.premium","Plan Premium / mes",rm.plan.premium)}
      ${n("remoto.desc3","Desc. 3 meses %",rm.desc3)}${n("remoto.desc6","Desc. 6 meses %",rm.desc6)}${n("remoto.addons.videollamada","Videollamada",rm.addons.videollamada)}${n("remoto.addons.revision","Revisión video",rm.addons.revision)}${n("remoto.addons.ajuste","Ajuste extra",rm.addons.ajuste)}</div></section>
    <section class="card"><h3>Tus datos y condiciones</h3><div class="form-grid g3"><div><label class="mini">Nombre en cotizaciones</label><input class="inp" data-action="ct-cfg" data-k="nombre" value="${esc(cfg.nombre)}"></div>
      <div><label class="mini">Vigencia (días)</label><input class="inp" type="number" data-action="ct-cfg" data-k="vigenciaDias" value="${cfg.vigenciaDias}"></div><div><label class="mini">Anticipo (%)</label><input class="inp" type="number" data-action="ct-cfg" data-k="anticipoPct" value="${cfg.anticipoPct}"></div></div>
      <label class="switch" style="margin-top:12px"><input type="checkbox" data-action="ct-iva" ${cfg.iva?"checked":""}><span class="track"></span>Agregar IVA 16% (si facturas; los precios de arriba no lo incluyen)</label>
      <div class="acts-end"><button class="btn ghost" data-action="ct-reset">Restablecer precios sugeridos</button></div></section></div>
    <aside class="quote-card"><div class="qc-head"><span class="eyebrow">Estudio de mercado · oct 2026</span><h3>Dónde te ubican estos precios</h3></div>
      <div class="mk-list">${COT_MERCADO.map(([a,b,c])=>`<div class="mk-row"><b>${a}</b><span>${b}</span><span class="hint">${c}</span></div>`).join("")}</div>
      <p class="hint" style="margin-top:12px"><b>Tu posicionamiento:</b> sesión base $${pr.sesion} (≈ +${Math.round((pr.sesion/762-1)*100)}% sobre el promedio de CDMX de $762) por dar clase en estudios boutique, programar por nivel y dar seguimiento; por debajo de zonas premium ($1,000+). Paquetes con 5–15% de descuento, como el mercado. El plan de seguimiento ($${rm.plan.seguimiento}/mes) queda en la mitad del rango online ($800–$4,000).</p>
      <p class="hint">Fuentes: ${COT_FUENTES.map(([l,u])=>`<a href="${u}" target="_blank" rel="noopener">${esc(l)}</a>`).join(" · ")}</p></aside></div>`;
}

/* ---------- acciones ---------- */
function cotArmar(d,estadoIni){
  const cfg=cotCfg(), calc=cotCalcular(d), hoy=todayStr();
  return {id:newId("q"),folio:cotFolio(),fecha:hoy,vigencia:addDays(hoy,+cfg.vigenciaDias||15),estado:estadoIni||"borrador",
    cliente:{clienteId:d.clienteId,nombre:d.nombre.trim(),tel:d.tel.trim()},draft:clone(d),calc,notas:d.notas,creado:nowISO()};
}
function cotAceptar(q){
  const D=PT_D(); let c=q.cliente.clienteId?ptCliente(q.cliente.clienteId):null;
  if(!c){ c=Object.assign(ptClienteNuevo(),{id:newId("c"),nombre:q.cliente.nombre||"Cliente nuevo",tel:q.cliente.tel,modalidad:q.draft.tipo==="remoto"?"remoto":"presencial",nivel:q.draft.tipo==="remoto"&&q.draft.producto==="rutina"?q.draft.nivel:"basico",creado:nowISO()}); D.clientes.push(c); q.cliente.clienteId=c.id; }
  const hoy=todayStr();
  if(q.draft.tipo==="presencial"){ const pk=cotPrecios().presencial.paquetes.slice().sort((a,b)=>b.n-a.n).find(p=>q.calc.sesiones>=p.n);
    D.paquetes.push({id:newId("k"),clienteId:c.id,tipo:"presencial",concepto:q.calc.titulo,sesiones:q.calc.sesiones,usadas:0,inicio:hoy,vence:addDays(hoy,pk?pk.dias:30),monto:q.calc.total,cotId:q.id}); }
  else if(q.draft.producto==="plan"){ D.paquetes.push({id:newId("k"),clienteId:c.id,tipo:"plan",concepto:q.calc.titulo,sesiones:0,usadas:0,inicio:hoy,vence:addDays(hoy,30*(+q.draft.meses||1)),monto:q.calc.total,cotId:q.id}); }
  q.estado="aceptada"; touch(); return c;
}
function ctClick(a,t){
  const D=COT_D();
  if(a==="ct-tab"){ COTUI.tab=t.dataset.v; render(); return true; }
  if(a==="ct-set"){ const k=t.dataset.k, v=t.dataset.v; COTUI.draft[k]=["paquete"].includes(k)&&v!=="otro"?+v:(["personas","duracion","meses"].includes(k)?+v:v); render(); return true; }
  if(a==="ct-guardar"){ const d=COTUI.draft; if(!d.nombre.trim()){ toast("Escribe el nombre del cliente"); return true; } D.cotizaciones.push(cotArmar(d)); touch(); COTUI.tab="lista"; COTUI.draft=cotDraftNuevo(null); render(); toast("Cotización guardada"); return true; }
  if(a==="ct-copiar-draft"){ const q=cotArmar(Object.assign({},COTUI.draft,{nombre:COTUI.draft.nombre||"Cliente"}),"borrador"); D.seq--; copyText(cotTexto(q),"Cotización copiada — pégala en WhatsApp"); return true; }
  if(a==="ct-copiar"){ const q=D.cotizaciones.find(x=>x.id===t.dataset.id); copyText(cotTexto(q),"Cotización copiada — pégala en WhatsApp"); if(q.estado==="borrador"){ q.estado="enviada"; touch(); render(); } return true; }
  if(a==="ct-print"){ printDoc(cotPrintHtml(D.cotizaciones.find(x=>x.id===t.dataset.id))); return true; }
  if(a==="ct-estado"){ const q=D.cotizaciones.find(x=>x.id===t.dataset.id); q.estado=t.dataset.v; touch(); render(); return true; }
  if(a==="ct-aceptar"){ const q=D.cotizaciones.find(x=>x.id===t.dataset.id), c=cotAceptar(q); render(); toast("Cotización aceptada · cliente y paquete creados"); setTimeout(()=>{ if(confirm("¿Registrar el anticipo de "+money(q.calc.anticipo)+" como pago de "+c.nombre+"?")){ PT_D().pagos.push({id:newId("p"),clienteId:c.id,fecha:todayStr(),monto:q.calc.anticipo,concepto:"Anticipo "+q.folio,metodo:"Transferencia",cotId:q.id}); touch(); render(); } },50); return true; }
  if(a==="ct-del"){ const i=D.cotizaciones.findIndex(x=>x.id===t.dataset.id); if(i<0) return true; const [q]=D.cotizaciones.splice(i,1); touch(); render(); toastUndo("Cotización eliminada",()=>{ D.cotizaciones.splice(Math.min(i,D.cotizaciones.length),0,q); touch(); render(); }); return true; }
  if(a==="ct-reset"){ if(confirm("¿Volver a los precios sugeridos por el estudio de mercado?")){ D.precios=clone(COT_PRECIOS_DEF); touch(); render(); } return true; }
  return false;
}
function ctInput(a,t){
  if(a==="ct-t"){ COTUI.draft[t.dataset.k]=t.value; return true; }
  return false;
}
function ctChange(a,t){
  const D=COT_D();
  if(a==="ct-t"){ if(["paqueteN","descExtra"].includes(t.dataset.k)) render(); return true; }
  if(a==="ct-cliente"){ const c=t.value?ptCliente(t.value):null; Object.assign(COTUI.draft,{clienteId:t.value||null}); if(c){ COTUI.draft.nombre=c.nombre; COTUI.draft.tel=c.tel||""; COTUI.draft.tipo=c.modalidad==="remoto"?"remoto":"presencial"; COTUI.draft.nivel=c.nivel; } render(); return true; }
  if(a==="ct-add"){ COTUI.draft.add[t.dataset.k]=Math.max(0,+t.value||0); render(); return true; }
  if(a==="ct-precio"){ const path=t.dataset.id.split("."), P=cotPrecios(); let o=P; for(let i=0;i<path.length-1;i++) o=o[path[i]]; o[path[path.length-1]]=Number(t.value)||0; touch(); render(); return true; }
  if(a==="ct-cfg"){ const k=t.dataset.k; cotCfg()[k]=t.type==="number"?(Number(t.value)||0):t.value; touch(); return true; }
  if(a==="ct-iva"){ cotCfg().iva=t.checked; touch(); render(); return true; }
  return false;
}
