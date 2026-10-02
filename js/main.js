"use strict";
/* ============================================================
   MAIN · Sebas Fit — navegación, ajustes, acceso y arranque
   ============================================================ */
const NAV=[["clases","Clases",["hoy"],"hoy"],["rutinas","Rutinas",["inicio","planner","armar","playlists","guardadas"],"inicio"],
  ["clientes","Clientes",["clientes","cliente"],"clientes"],["cotizador","Cotizador",["cotizador"],"cotizador"],["ajustes","Ajustes",["ajustes"],"ajustes"]];
const SUBNAV_RUT=[["inicio","Generar"],["armar","Armar"],["planner","Rutina"],["playlists","Playlists"],["guardadas","Biblioteca"]];

/* ---------- utilidades de interfaz ---------- */
function copyText(txt,msg){
  const done=()=>toast(msg||"Copiado");
  if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(txt).then(done,()=>fallbackCopy(txt,done)); } else fallbackCopy(txt,done);
}
function fallbackCopy(txt,done){
  const ta=document.createElement("textarea"); ta.value=txt; ta.style.cssText="position:fixed;opacity:0;top:0;left:0"; document.body.appendChild(ta); ta.select();
  try{ document.execCommand("copy"); done(); }catch(e){ toast("No se pudo copiar"); } ta.remove();
}
let undoTimer=null;
function toastUndo(msg,fn){
  let el=document.getElementById("toastU");
  if(!el){ el=document.createElement("div"); el.id="toastU"; el.className="toast-undo"; document.body.appendChild(el); }
  el.innerHTML=`<span></span><button type="button">Deshacer</button>`; el.firstChild.textContent=msg; el.style.display="flex";
  el.querySelector("button").onclick=()=>{ el.style.display="none"; clearTimeout(undoTimer); fn(); };
  clearTimeout(undoTimer); undoTimer=setTimeout(()=>{ el.style.display="none"; },7000);
}
function printDoc(html){
  const el=document.getElementById("printDoc"); el.innerHTML=html; document.body.classList.add("printing-doc");
  const end=()=>{ document.body.classList.remove("printing-doc"); window.removeEventListener("afterprint",end); };
  window.addEventListener("afterprint",end); setTimeout(()=>window.print(),60);
}

/* ---------- instalar en el teléfono / compu ---------- */
let deferredInstall=null;
window.addEventListener("beforeinstallprompt",e=>{ e.preventDefault(); deferredInstall=e; if(state.screen==="hoy") render(); });
function esIOS(){ return /iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1); }
function esStandalone(){ return (window.matchMedia&&window.matchMedia("(display-mode: standalone)").matches)||navigator.standalone===true; }
function installHint(){
  if(esStandalone()||lsGet("sbf_hint_off")) return "";
  if(deferredInstall) return `<div class="wrap"><div class="install-hint"><div><b>Instala Sebas Fit</b><p>Se abre como app, sin barra del navegador, y funciona sin señal.</p></div><div class="acts"><button class="btn primary" data-action="aj-install">Instalar</button><button class="btn ghost" data-action="aj-hint-off">Ahora no</button></div></div></div>`;
  if(esIOS()) return `<div class="wrap"><div class="install-hint"><div><b>Instala Sebas Fit en tu iPhone / iPad</b><p>Toca <b>Compartir</b> <span class="ios-share">⬆︎</span> y luego <b>«Agregar a inicio»</b>. Así abre a pantalla completa, funciona sin señal en el estudio y tus datos quedan más seguros en el dispositivo.</p></div><div class="acts"><button class="btn ghost" data-action="aj-hint-off">Entendido</button></div></div></div>`;
  return "";
}
function actualizarAvisoOffline(){ const el=document.getElementById("auth-offline"); if(el) el.style.display=navigator.onLine===false?"block":"none"; }
window.addEventListener("online",actualizarAvisoOffline); window.addEventListener("offline",actualizarAvisoOffline); actualizarAvisoOffline();

/* ---------- navegación y render ---------- */
function renderNav(){
  nav.innerHTML=NAV.map(([k,l,screens,go])=>`<button data-action="go" data-screen="${go}" class="${screens.includes(state.screen)?"on":""}">${l}</button>`).join("");
}
function subnavHtml(){
  if(!["inicio","planner","armar","playlists","guardadas"].includes(state.screen)) return "";
  return `<div class="wrap subnav"><div class="tabs">${SUBNAV_RUT.map(([k,l])=>`<button data-action="go" data-screen="${k}" class="${state.screen===k?"on":""}" ${k==="planner"&&!state.routine?"disabled":""}>${l}</button>`).join("")}</div></div>`;
}
function render(){
  renderNav();
  const s=state.screen; let h="";
  if(s==="hoy") h=installHint()+viewClases();
  else if(s==="inicio") h=subnavHtml()+viewInicio();
  else if(s==="planner") h=subnavHtml()+(state.routine?viewPlanner():viewInicio());
  else if(s==="armar") h=subnavHtml()+viewArmar();
  else if(s==="playlists") h=subnavHtml()+viewPlaylists();
  else if(s==="guardadas") h=subnavHtml()+viewGuardadas();
  else if(s==="clientes") h=viewClientes();
  else if(s==="cliente") h=viewCliente();
  else if(s==="cotizador") h=viewCotizador();
  else if(s==="ajustes") h=viewAjustes();
  else h=viewClases();
  app.innerHTML=h;
  renderOverlay();
}

/* ---------- Ajustes ---------- */
function viewAjustes(){
  const d=Vault.data, n={cl:d.clases.entries.length,cli:d.pt.clientes.length,ses:d.pt.sesiones.length,rut:(d.sf.saved||[]).length,cot:d.cot.cotizaciones.length};
  return `<div class="wrap"><header class="page-head"><span class="eyebrow">Configuración</span><h1>Ajustes</h1><p class="sub">Tarifas, horario, formas de pago, respaldo y seguridad.</p></header>
    <section class="blk"><div class="blk-head"><h2>Clases en estudios</h2></div><div class="card">${clSettingsHtml()}</div></section>
    ${musSpotAjustesHtml()}
    <section class="blk"><div class="blk-head"><h2>Respaldo y sincronización</h2></div><div class="card">
      <p class="hint" style="margin-top:0">Todo se guarda cifrado en este dispositivo y en la nube (con historial de versiones). Tienes ${n.cl} clases, ${n.cli} clientes, ${n.ses} sesiones, ${n.rut} rutinas guardadas y ${n.cot} cotizaciones.</p>
      <div class="acts-row"><button class="btn" data-action="aj-sync">☁ Subir ahora</button><button class="btn" data-action="aj-backup">⬇ Descargar respaldo</button><button class="btn" data-action="aj-restore">⬆ Cargar respaldo</button>
      <input type="file" id="aj-file" accept="application/json,.json" hidden></div>
      <p class="hint">El respaldo es un archivo cifrado con tu contraseña; solo se puede abrir aquí.</p></div></section>
    <section class="blk"><div class="blk-head"><h2>Seguridad</h2></div><div class="card"><p class="hint" style="margin-top:0">"Recordar en este dispositivo" guarda la llave en este equipo para no pedir la contraseña. Ciérrala si compartes el equipo.</p>
      <div class="acts-row"><button class="btn" data-action="aj-lock">Cerrar sesión en este dispositivo</button></div></div></section>
    <p class="hint" style="text-align:center;margin:24px 0 40px">Sebas Fit · v1</p></div>`;
}
async function ajClick(a){
  if(a==="aj-sync"){ await flushVault(); await pushCloud(); toast("Sincronizado"); return true; }
  if(a==="aj-backup"){
    const blob=await backupBlob(), el=document.createElement("a");
    el.href=URL.createObjectURL(new Blob([JSON.stringify(blob)],{type:"application/json"})); el.download="sebas-fit-respaldo-"+todayStr()+".json"; document.body.appendChild(el); el.click(); el.remove(); return true; }
  if(a==="aj-restore"){ document.getElementById("aj-file").click(); return true; }
  if(a==="aj-lock"){ vaultLock(); return true; }
  if(a==="aj-hint-off"){ lsSet("sbf_hint_off","1"); render(); return true; }
  if(a==="aj-install"){ if(deferredInstall){ deferredInstall.prompt(); deferredInstall=null; } render(); return true; }
  return false;
}

/* ---------- asignar rutina a una clase del horario ---------- */
function modalAsignar(){
  const sched=CL_D().schedule, out=[];
  for(let i=0;i<10;i++){ const d=addDays(todayStr(),i), wd=diaDeFecha(d); sched.filter(s=>s.day===wd).sort((a,b)=>a.time.localeCompare(b.time)).forEach(s=>out.push({d,s})); }
  return modalShell("Asignar a una clase",`<p class="hint" style="margin-top:0">Pon "${esc(state.routine.nombre)}" en una de tus próximas clases del horario. Las futuras quedan como pendientes hasta que las des.</p>
    <div class="picker">${out.map(x=>`<button data-action="asignar-ok" data-date="${x.d}" data-slot="${x.s.id}"><span class="pn">${esc(diaDeFecha(x.d))} ${fmtCorto(x.d)} · ${esc(x.s.time)}</span><span class="pm">${esc(x.s.studio)}</span></button>`).join("")||`<p class="hint">No hay clases en tu horario fijo. Agrégalas en Ajustes.</p>`}</div>`,
    `<button class="btn ghost" data-action="close-modal">Cerrar</button>`);
}

/* ---------- despacho de eventos a los módulos ---------- */
const Mods={
  click(a,t,e){
    if(a.startsWith("cl-")) return clClick(a,t);
    if(a.startsWith("pt-")) return ptClick(a,t,e);
    if(a.startsWith("ct-")) return ctClick(a,t);
    if(a.startsWith("ar-")) return arClick(a,t);
    if(a.startsWith("mu-")) return musClick(a,t);
    if(a.startsWith("aj-")){ ajClick(a); return true; }
    if(a==="go-cot"){ COTUI.draft=cotDraftNuevo(t.dataset.id||null); COTUI.tab="nueva"; state.screen="cotizador"; render(); window.scrollTo(0,0); return true; }
    if(a==="asignar-clase"){ if(!state.routine) return true; state.modal={type:"asignar"}; renderOverlay(); return true; }
    if(a==="asignar-ok"){ const e2=clAsignarRutina(t.dataset.date,t.dataset.slot,state.routine.nombre); closeModal(); render(); toast(e2?"Rutina asignada a la clase":"No se pudo asignar"); return true; }
    return false;
  },
  input(a,t){
    if(a.startsWith("cl-")) return clInput(a,t);
    if(a.startsWith("pt-")) return ptInput(a,t);
    if(a.startsWith("ct-")) return ctInput(a,t);
    if(a.startsWith("ar-")) return arInput(a,t);
    return false;
  },
  change(a,t){
    if(a.startsWith("cl-")) return clChange(a,t);
    if(a.startsWith("pt-")) return ptChange(a,t);
    if(a.startsWith("ct-")) return ctChange(a,t);
    if(a.startsWith("ar-")) return arChange(a,t);
    return false;
  },
  modal(md){
    if(md.type==="asignar") return modalAsignar();
    if(md.type.startsWith("pt-")) return ptModal(md);
    return "";
  },
};
document.addEventListener("change",e=>{
  if(e.target&&e.target.id==="aj-file"){
    const f=e.target.files&&e.target.files[0]; e.target.value=""; if(!f) return;
    f.text().then(txt=>restoreBackup(txt)).then(p=>{
      if(!confirm("¿Reemplazar todo lo que ves ahora con este respaldo ("+p.clases.entries.length+" clases, "+p.pt.clientes.length+" clientes)?")) return;
      Vault.data=p; touch(); hydrateSculpt(); armRegistrarCustom(); ARMS=null; render(); toast("Respaldo cargado");
    }).catch(()=>alert("Ese archivo no es un respaldo válido de esta cuenta."));
    return;
  }
  const t=e.target.closest&&e.target.closest("[data-action]"); if(!t) return;
  Mods.change(t.dataset.action,t,e);
});

/* ---------- acceso y arranque ---------- */
function enterApp(){
  document.getElementById("authgate").classList.add("hidden");
  document.getElementById("appRoot").classList.add("on");
  hydrateSculpt(); armRegistrarCustom(); ARMS=null; state.screen="hoy"; render();
  try{ if(navigator.storage&&navigator.storage.persist) navigator.storage.persist(); }catch(e){}   // pide que el navegador no borre los datos
  musSpotRetorno().then(ok=>{ if(ok){ state.screen="ajustes"; render(); } });
}
function authMsg(text,kind){ const el=document.getElementById("auth-msg"); el.textContent=text||""; el.className="auth-msg"+(text?" "+(kind||"err"):""); }
document.getElementById("lock-form").addEventListener("submit",async ev=>{
  ev.preventDefault();
  const pw=document.getElementById("lock-pw").value, remember=document.getElementById("lock-remember").checked, btn=document.getElementById("lock-btn");
  authMsg(""); btn.disabled=true; btn.textContent="Abriendo…";
  try{ await vaultUnlock(pw,remember); document.getElementById("lock-pw").value=""; enterApp(); }
  catch(e){ authMsg(e.message==="sin-datos"?"No encontré tus datos. Necesito internet la primera vez.":"Contraseña incorrecta."); }
  btn.disabled=false; btn.textContent="Entrar";
});
(async function boot(){
  try{ if(await vaultAutoUnlock()) enterApp(); }catch(e){}
})();
if("serviceWorker" in navigator){
  window.addEventListener("load",()=>{ navigator.serviceWorker.register("sw.js").catch(()=>{}); });
}
