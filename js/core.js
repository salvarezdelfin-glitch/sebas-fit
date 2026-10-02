"use strict";
/* ============================================================
   CORE · Sebas Fit
   Utilidades + bóveda cifrada (AES-GCM, gzip) con respaldo en la nube.
   Todo lo que escribes (clases, rutinas, clientes, cotizaciones) vive en UN
   solo paquete cifrado con tu contraseña. El repo es público pero solo
   contiene código; la nube nunca ve datos sin cifrar.
   Reutiliza la bóveda "clases-semanales" (misma llave y misma contraseña de
   Clases Semanales) para que tu bitácora llegue intacta.
   ============================================================ */
const SB_URL="https://smjktuithhvfmexysvkf.supabase.co", SB_KEY="sb_publishable_h7YxlJXIADT1827fFx6hyg_jtjmnmGZ";
const CLOUD_VAULT="clases-semanales", WRITE_TAG="clases-semanales:write";
const VK={LOCAL:"sbf_vault_v2",REMEMBER:"sbf_key_v2",PENDING:"sbf_pending_v2",SYNCED:"sbf_synced_v2",LEGACY:"sbf_legacy_done",OLD_LOCAL:"bdc_vault_v1"};
const SF_KEYS=["gustos","playlists","saved","historia","historial","musiclib","programas"];

/* ---------- utilidades ---------- */
function lsGet(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
function lsSet(k,v){ try{ localStorage.setItem(k,v); return true; }catch(e){ return false; } }
function lsDel(k){ try{ localStorage.removeItem(k); }catch(e){} }
function b64(buf){ let s="",a=new Uint8Array(buf); for(let i=0;i<a.length;i+=8192) s+=String.fromCharCode.apply(null,a.subarray(i,i+8192)); return btoa(s); }
function unb64(s){ const bin=atob(s), a=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) a[i]=bin.charCodeAt(i); return a; }
function nowISO(){ return new Date().toISOString(); }
function newId(p){ return (p||"i")+Date.now().toString(36)+Math.random().toString(36).slice(2,7); }
function clone(o){ return JSON.parse(JSON.stringify(o)); }

/* ---------- datos: forma del paquete ---------- */
function emptyData(){
  return {app:2, savedAt:null,
    clases:{schedule:[],rates:{EUPHORIA:0,SOHO:0,EJE:0,ALUNNA_SOLO:0,ALUNNA_GROUP:0},payinfo:[],entries:[],cobros:[]},
    sf:{},
    pt:{clientes:[],programas:[],sesiones:[],medidas:[],paquetes:[],pagos:[]},
    cot:{precios:null,cotizaciones:[],seq:0,cfg:{}},
  };
}
/* acepta el formato v1 (Clases Semanales: schedule/rates/payinfo/entries en la raíz) y el v2 */
function migrate(p){
  const d=emptyData();
  if(!p||typeof p!=="object") return d;
  if(p.app===2){
    Object.assign(d.clases,p.clases||{}); Object.assign(d.sf,p.sf||{}); Object.assign(d.pt,p.pt||{}); Object.assign(d.cot,p.cot||{});
  } else {
    d.clases.schedule=p.schedule||[]; d.clases.rates=Object.assign(d.clases.rates,p.rates||{});
    d.clases.payinfo=p.payinfo||[]; d.clases.entries=p.entries||[];
  }
  d.savedAt=p.savedAt||null;
  ["schedule","payinfo","entries","cobros"].forEach(k=>{ if(!Array.isArray(d.clases[k])) d.clases[k]=[]; });
  ["clientes","programas","sesiones","medidas","paquetes","pagos"].forEach(k=>{ if(!Array.isArray(d.pt[k])) d.pt[k]=[]; });
  if(!Array.isArray(d.cot.cotizaciones)) d.cot.cotizaciones=[];
  if(!d.cot.cfg||typeof d.cot.cfg!=="object") d.cot.cfg={};
  if(!d.clases.rates||typeof d.clases.rates!=="object") d.clases.rates=emptyData().clases.rates;
  return d;
}

/* ---------- fusión: nunca perder registros entre dispositivos ---------- */
const ID_ARRAYS=[["clases","schedule"],["clases","payinfo"],["clases","entries"],["clases","cobros"],
  ["pt","clientes"],["pt","programas"],["pt","sesiones"],["pt","medidas"],["pt","paquetes"],["pt","pagos"],
  ["cot","cotizaciones"],["sf","saved"],["sf","programas"],["sf","historial"],["sf","playlists"],["sf","musiclib"]];
/* "newer" gana en conflictos; lo que solo existe en "older" se conserva */
function mergeData(older,newer){
  const out=clone(newer);
  ID_ARRAYS.forEach(([a,b])=>{
    const A=(older[a]||{})[b]; if(!Array.isArray(A)) return;
    out[a]=out[a]||{}; const B=out[a][b];
    if(!Array.isArray(B)){ out[a][b]=clone(A); return; }
    const ids=new Set(B.map(x=>x&&x.id));
    A.forEach(x=>{ if(x&&x.id&&!ids.has(x.id)) B.push(clone(x)); });
  });
  const ga=(older.sf||{}).gustos, gb=(out.sf=out.sf||{}).gustos;
  if(Array.isArray(ga)){ if(!Array.isArray(gb)) out.sf.gustos=clone(ga); else ga.forEach(g=>{ if(!gb.some(x=>String(x).toLowerCase()===String(g).toLowerCase())) gb.push(g); }); }
  if(out.cot&&older.cot&&!out.cot.precios&&older.cot.precios) out.cot.precios=clone(older.cot.precios);
  return out;
}

/* ---------- cripto ---------- */
async function gzipBytes(bytes){
  if(typeof CompressionStream==="undefined"){ try{ return typeof fflate!=="undefined"?fflate.gzipSync(bytes):null; }catch(e){ return null; } }   // iOS < 16.4
  const cs=new CompressionStream("gzip"), w=cs.writable.getWriter(); w.write(bytes); w.close();
  return new Uint8Array(await new Response(cs.readable).arrayBuffer());
}
async function gunzipBytes(bytes){
  if(typeof DecompressionStream==="undefined"){ if(typeof fflate!=="undefined") return fflate.gunzipSync(bytes); throw new Error("sin-gzip"); }
  const ds=new DecompressionStream("gzip"), w=ds.writable.getWriter(); w.write(bytes); w.close();
  return new Uint8Array(await new Response(ds.readable).arrayBuffer());
}
async function deriveKey(pw,meta){
  const base=await crypto.subtle.importKey("raw",new TextEncoder().encode(pw),"PBKDF2",false,["deriveKey"]);
  return crypto.subtle.deriveKey({name:"PBKDF2",salt:unb64(meta.salt),iterations:meta.iter,hash:"SHA-256"},base,{name:"AES-GCM",length:256},true,["encrypt","decrypt"]);
}
async function sealPayload(key,meta,payload){
  const raw=new TextEncoder().encode(JSON.stringify(payload));
  let body=raw, z=0; const g=await gzipBytes(raw); if(g){ body=g; z=1; }
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const ct=await crypto.subtle.encrypt({name:"AES-GCM",iv},key,body);
  return {v:2,z,iter:meta.iter,salt:meta.salt,iv:b64(iv),ct:b64(ct),savedAt:payload.savedAt};
}
async function openBlob(key,blob){
  const pt=await crypto.subtle.decrypt({name:"AES-GCM",iv:unb64(blob.iv)},key,unb64(blob.ct));
  let bytes=new Uint8Array(pt); if(blob.z) bytes=await gunzipBytes(bytes);
  return JSON.parse(new TextDecoder().decode(bytes));
}
async function writeSecretFor(key){
  const raw=await crypto.subtle.exportKey("raw",key), tag=new TextEncoder().encode(WRITE_TAG);
  const buf=new Uint8Array(raw.byteLength+tag.length); buf.set(new Uint8Array(raw),0); buf.set(tag,raw.byteLength);
  const h=await crypto.subtle.digest("SHA-256",buf);
  return Array.prototype.map.call(new Uint8Array(h),b=>b.toString(16).padStart(2,"0")).join("");
}
/* con señal débil una petición puede colgarse: se corta a los N ms para no dejar la app esperando */
async function rpc(fn,args,ms){
  const ac=typeof AbortController!=="undefined"?new AbortController():null, t=ac?setTimeout(()=>ac.abort(),ms||10000):null;
  try{
    const r=await fetch(SB_URL+"/rest/v1/rpc/"+fn,{method:"POST",headers:{apikey:SB_KEY,"Content-Type":"application/json"},body:JSON.stringify(args),signal:ac?ac.signal:undefined});
    if(!r.ok) throw new Error("nube "+r.status);
    return await r.json();
  } finally { if(t) clearTimeout(t); }
}

/* ---------- bóveda ---------- */
const Vault={key:null,meta:null,secret:null,data:null,dirty:false,saveTimer:null,cloudTimer:null,saving:null};

function setSync(kind,text){
  const el=document.getElementById("sync"); if(!el) return;
  el.className="sync "+kind; el.textContent=text; el.title=text;
}
/* El paquete se guarda cifrado en este dispositivo poco después del último cambio y
   se sube a la nube unos segundos más tarde (cada subida queda como una versión). */
function touch(){
  if(!Vault.key||!Vault.data) return;
  Vault.dirty=true; clearTimeout(Vault.saveTimer);
  Vault.saveTimer=setTimeout(saveLocal,500);
}
async function saveLocal(){
  if(!Vault.key||!Vault.data||!Vault.dirty) return;
  Vault.dirty=false; clearTimeout(Vault.saveTimer);
  Vault.data.savedAt=nowISO();
  const blob=await sealPayload(Vault.key,Vault.meta,Vault.data);
  const ok=lsSet(VK.LOCAL,JSON.stringify(blob));
  const b=document.getElementById("conn-banner"); if(b) b.style.display=ok?"none":"block";
  lsSet(VK.PENDING,"1");
  clearTimeout(Vault.cloudTimer); Vault.cloudTimer=setTimeout(pushCloud,4000);
  setSync("busy","● guardando");
}
async function pushCloud(){
  const txt=lsGet(VK.LOCAL); if(!txt||!Vault.secret) return;
  setSync("busy","☁ subiendo…");
  try{
    const blob=JSON.parse(txt);
    await rpc("clases_vault_put",{p_vault:CLOUD_VAULT,p_blob:blob,p_secret:Vault.secret},20000);
    lsDel(VK.PENDING); lsSet(VK.SYNCED,blob.savedAt||"");
    const d=new Date(); setSync("ok","☁ guardado "+String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0"));
  }catch(e){
    lsSet(VK.PENDING,"1"); setSync("warn","● sin conexión — guardado aquí");
  }
}
async function flushVault(){ if(Vault.dirty) await saveLocal(); if(lsGet(VK.PENDING)) pushCloud(); }
window.addEventListener("online",()=>{ if(lsGet(VK.PENDING)) pushCloud(); });
document.addEventListener("visibilitychange",()=>{ if(document.hidden){ if(Vault.dirty) saveLocal(); } else if(lsGet(VK.PENDING)) pushCloud(); });
window.addEventListener("pagehide",()=>{ if(Vault.dirty) saveLocal(); });

/* ---------- carga y desbloqueo ---------- */
async function loadCandidates(){
  const out=[]; let cloudOk=false;
  const l=lsGet(VK.LOCAL); if(l){ try{ out.push({src:"local",blob:JSON.parse(l)}); }catch(e){} }
  // con datos guardados aquí no se espera mucho a la nube (señal débil o sin señal en el estudio)
  const tieneLocal=out.some(x=>x.src==="local"), sinRed=typeof navigator!=="undefined"&&navigator.onLine===false;
  if(!(tieneLocal&&sinRed)){ try{ const c=await rpc("clases_vault_get",{p_vault:CLOUD_VAULT},tieneLocal?4000:15000); if(c&&c.ct){ out.push({src:"cloud",blob:c}); cloudOk=true; } }catch(e){} }
  const o=lsGet(VK.OLD_LOCAL); if(o){ try{ out.push({src:"old",blob:JSON.parse(o)}); }catch(e){} }
  return {out,cloudOk};
}
/* Elige qué versión usar. Sin cambios locales pendientes gana la más nueva. Con cambios
   pendientes: si la nube no cambió desde mi última sincronización gano yo; si cambió en
   otro dispositivo se fusionan (se conserva todo lo que exista en cualquiera de las dos). */
function pickPayload(opened,pending,synced){
  const loc=opened.find(c=>c.src==="local"), cl=opened.find(c=>c.src==="cloud"), old=opened.find(c=>c.src==="old");
  const t=c=>(c&&c.payload.savedAt)||"";
  if(loc&&cl){
    if(t(loc)===t(cl)) return {payload:loc.payload,needPush:false,from:"local"};
    if(!pending) return t(loc)>=t(cl)?{payload:loc.payload,needPush:false,from:"local"}:{payload:cl.payload,needPush:false,from:"cloud"};
    if(t(cl)<=synced) return {payload:loc.payload,needPush:true,from:"local"};
    const merged=t(loc)>=t(cl)?mergeData(cl.payload,loc.payload):mergeData(loc.payload,cl.payload);
    return {payload:merged,needPush:true,from:"merge"};
  }
  const best=[loc,cl,old].filter(Boolean).sort((a,b)=>t(b).localeCompare(t(a)))[0];
  return {payload:best.payload,needPush:false,from:best.src};
}
/* Rutinas guardadas en este navegador por la app anterior de Sculpt (mismo sitio, otra ruta) */
function importLegacySculpt(){
  if(lsGet(VK.LEGACY)) return false;
  const found={}; let any=false;
  SF_KEYS.forEach(k=>{ const v=lsGet("sf_"+k); if(v){ try{ found[k]=JSON.parse(v); any=true; }catch(e){} } });
  lsSet(VK.LEGACY,"1");
  if(!any) return false;
  const legacy=emptyData(); legacy.sf=found;
  Vault.data=mergeData(legacy,Vault.data);
  return true;
}
async function vaultUnlock(pw,remember,rememberedKey){
  const {out}=await loadCandidates();
  if(!out.length) throw new Error("sin-datos");
  const ref=out.find(c=>c.src==="cloud")||out[0];
  const meta={salt:ref.blob.salt,iter:ref.blob.iter};
  const key=rememberedKey||await deriveKey(pw,meta);
  const opened=[];
  for(const c of out){ if(c.blob.salt!==meta.salt) continue; try{ opened.push({src:c.src,payload:migrate(await openBlob(key,c.blob))}); }catch(e){} }
  if(!opened.length) throw new Error("clave");
  const pick=pickPayload(opened,!!lsGet(VK.PENDING),lsGet(VK.SYNCED)||"");
  Vault.key=key; Vault.meta=meta; Vault.data=pick.payload;
  Vault.secret=await writeSecretFor(key);
  if(pick.from==="cloud") lsSet(VK.SYNCED,Vault.data.savedAt||"");
  const imported=importLegacySculpt();
  if(remember){ const raw=await crypto.subtle.exportKey("raw",key); lsSet(VK.REMEMBER,JSON.stringify({salt:meta.salt,k:b64(raw)})); }
  // guarda ya en el formato nuevo (v2 comprimido) y sube si había algo pendiente
  Vault.dirty=true; if(pick.needPush||imported||pick.from!=="local") lsSet(VK.PENDING,"1");
  await saveLocal(); if(lsGet(VK.PENDING)) pushCloud(); else setSync("ok","☁ al día");
  return {from:pick.from,imported};
}
async function vaultAutoUnlock(){
  const saved=lsGet(VK.REMEMBER); if(!saved) return null;
  let rk; try{ rk=JSON.parse(saved); }catch(e){ return null; }
  try{
    const key=await crypto.subtle.importKey("raw",unb64(rk.k),{name:"AES-GCM"},true,["encrypt","decrypt"]);
    return await vaultUnlock("",false,key);
  }catch(e){ lsDel(VK.REMEMBER); return null; }
}
function vaultLock(){ lsDel(VK.REMEMBER); location.reload(); }

/* ---------- respaldo manual ---------- */
async function backupBlob(){ Vault.data.savedAt=nowISO(); return sealPayload(Vault.key,Vault.meta,Vault.data); }
async function restoreBackup(txt){
  const blob=JSON.parse(txt);
  if(blob.salt!==Vault.meta.salt) throw new Error("salt");
  const p=migrate(await openBlob(Vault.key,blob));
  return p;
}

/* ---------- LS: las llaves "sf_*" de Sculpt ahora viven dentro de la bóveda ---------- */
const LS={
  get(k,f){ if(!Vault.data) return f; const v=Vault.data.sf[k.replace(/^sf_/,"")]; return v===undefined?f:v; },
  set(k,v){ if(!Vault.data) return; Vault.data.sf[k.replace(/^sf_/,"")]=v; touch(); },
};
