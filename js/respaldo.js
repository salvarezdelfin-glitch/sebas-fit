/* ============================================================
   Respaldo semanal: aviso en Clases cuando toca, descarga de un toque (iPhone: hoja de compartir → Archivos / iCloud).
   Estado en Vault.data.sf.respaldo = {ultimo, cada, posponer}
   ============================================================ */
function RESP(){ const sf=Vault.data.sf; return sf.respaldo||(sf.respaldo={ultimo:null,cada:7,posponer:null}); }
function respDias(){ const u=RESP().ultimo; return u?Math.max(0,Math.floor((Date.now()-new Date(u).getTime())/864e5)):null; }
function respHayDatos(){ const d=Vault.data; return !!(d.clases.entries.length||d.pt.clientes.length||(d.sf.saved||[]).length||d.pt.programas.length); }
function respToca(){
  const R=RESP(); if(!R.cada||!respHayDatos()) return false;
  if(R.posponer&&R.posponer>todayStr()) return false;
  const d=respDias(); return d===null||d>=R.cada;
}
function respMarcar(){ const R=RESP(); R.ultimo=nowISO(); R.posponer=null; touch(); render(); }
async function respDescargar(){
  const blob=await backupBlob(), nombre="sebas-fit-respaldo-"+todayStr()+".json", txt=JSON.stringify(blob);
  try{
    const f=new File([txt],nombre,{type:"application/json"});
    if(esIOS()&&navigator.canShare&&navigator.canShare({files:[f]})){ await navigator.share({files:[f],title:nombre}); respMarcar(); toast("Respaldo guardado"); return; }
  }catch(e){ if(e&&e.name==="AbortError") return; }
  const url=URL.createObjectURL(new Blob([txt],{type:"application/json"})), a=document.createElement("a");
  a.href=url; a.download=nombre; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),60000);
  respMarcar(); toast("Respaldo descargado");
}
function respAvisoHtml(){
  if(!respToca()) return "";
  const d=respDias();
  return `<div class="es-aviso rs-aviso"><span><b>Respaldo:</b> ${d===null?"todavía no has descargado ninguno.":"el último fue hace "+d+" día"+(d===1?"":"s")+"."} Toma 2 segundos.</span><span class="rs-btns"><button class="btn primary sm" data-action="aj-backup">⬇ Guardar respaldo</button><button class="btn ghost sm" data-action="aj-resp-despues">Después</button></span></div>`;
}
function respAjustesHtml(){
  const R=RESP(), d=respDias();
  const est=d===null?"Aún no has descargado ningún respaldo.":"Último respaldo: hace "+d+" día"+(d===1?"":"s")+" ("+fmtCorto(R.ultimo.slice(0,10))+").";
  return `<p class="hint"><b>${est}</b> En iPhone se abre la hoja de compartir: elige <i>Guardar en Archivos</i> (iCloud Drive) y queda fuera de la app.</p>
    <div class="field" style="gap:8px"><span class="eyebrow">Recordarme el respaldo</span><div class="seg">${[[7,"Cada semana"],[14,"Cada 2 semanas"],[0,"No recordar"]].map(([v,l])=>`<button data-action="aj-resp-cada" data-v="${v}" class="${(R.cada||0)===v?"on":""}">${l}</button>`).join("")}</div></div>`;
}
const _viewClases1=window.viewClases;
window.viewClases=function(){ return _viewClases1().replace("</header>","</header>"+respAvisoHtml()); };
async function respClick(a,t){
  if(a==="aj-backup"){ await respDescargar(); return true; }
  if(a==="aj-resp-despues"){ RESP().posponer=addDays(todayStr(),2); touch(); render(); return true; }
  if(a==="aj-resp-cada"){ RESP().cada=Number(t.dataset.v)||0; touch(); render(); return true; }
  return false;
}
