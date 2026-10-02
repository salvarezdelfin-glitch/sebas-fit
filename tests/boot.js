/* Arranque de pruebas en el navegador: nube simulada + datos de Clases en formato viejo (v1). No toca la nube real. */
window.bootTest=async function(opts){
  opts=opts||{};
  window.__errs=[]; window.addEventListener('error',e=>__errs.push(e.message)); window.addEventListener('unhandledrejection',e=>__errs.push('promise: '+(e.reason&&e.reason.message||e.reason)));
  window.confirm=()=>true;
  const fake={versions:[],secret:null}; window.__fake=fake;
  const realFetch=window.__realFetch||window.fetch.bind(window); window.__realFetch=realFetch;
  window.fetch=async(url,opt)=>{ if(String(url).includes('/rest/v1/rpc/')){ const fn=String(url).split('/rpc/')[1], a=JSON.parse(opt.body);
    if(fn==='clases_vault_get'){ const v=fake.versions; return {ok:true,json:async()=>v.length?v[v.length-1]:null}; }
    if(fn==='clases_vault_put'){ if(a.p_secret!==fake.secret) return {ok:false,status:403,json:async()=>({})}; fake.versions.push(a.p_blob); return {ok:true,json:async()=>'t'}; } }
    return realFetch(url,opt); };
  const pw='prueba123', salt=btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16)))), meta={salt,iter:1000};
  const key=await deriveKey(pw,meta); fake.secret=await writeSecretFor(key);
  const hoy=todayStr(), ayer=addDays(hoy,-1), hace8=addDays(hoy,-8);
  const v1={schedule:[{id:'s1',day:diaDeFecha(hoy),studio:'SOHO',time:'09:00'},{id:'s2',day:diaDeFecha(hoy),studio:'ALUNNA',time:'18:00'},{id:'s3',day:'Lunes',studio:'EUPHORIA',time:'07:00'},{id:'s4',day:'Miércoles',studio:'EJE',time:'19:00'}],
   rates:{SOHO:400,EUPHORIA:450,EJE:350,ALUNNA_SOLO:250,ALUNNA_GROUP:380},
   payinfo:[{id:'p1',studio:'SOHO',frequency:'semanal',payday:'Martes'},{id:'p2',studio:'EUPHORIA',frequency:'quincenal',payday:''},{id:'p3',studio:'ALUNNA',frequency:'quincenal',payday:''}],
   entries:[{id:'e1',date:ayer,day:diaDeFecha(ayer),studio:'SOHO',time:'09:00',tipo:'propia',attendance:null,amount:400,nota:'',rutina:'Sculpt 11',playlist:'Sculpt Fluida',confirmado:true},
    {id:'e2',date:hace8,day:diaDeFecha(hace8),studio:'SOHO',time:'09:00',tipo:'propia',attendance:null,amount:400,nota:'',rutina:'',playlist:'',confirmado:true},
    {id:'e3',date:ayer,day:diaDeFecha(ayer),studio:'EUPHORIA',time:'07:00',tipo:'propia',attendance:null,amount:450,nota:'',rutina:'',playlist:'',confirmado:true}],savedAt:'2026-10-01T10:00:00.000Z'};
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const ct=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,new TextEncoder().encode(JSON.stringify(v1)));
  fake.versions.push({v:1,iter:1000,salt,iv:b64(iv),ct:b64(ct),savedAt:v1.savedAt});
  try{ localStorage.clear(); }catch(e){}
  const r=await vaultUnlock(pw,false); enterApp(); return r;
};
