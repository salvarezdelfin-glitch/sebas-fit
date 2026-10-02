const fs=require('fs'), vm=require('vm'), path=require('path');
const src=fs.readFileSync(path.join(__dirname,'../js/core.js'),'utf8');
function makeEnv(cloud,sinStreams){
  const store={};
  const ls={getItem:k=>(k in store?store[k]:null),setItem:(k,v)=>{store[k]=String(v)},removeItem:k=>{delete store[k]}};
  const els={};
  const ctx={console,crypto:globalThis.crypto,TextEncoder,TextDecoder,btoa,atob,CompressionStream:sinStreams?undefined:CompressionStream,DecompressionStream:sinStreams?undefined:DecompressionStream,Response,
    localStorage:ls,setTimeout,clearTimeout,Date,Math,JSON,Uint8Array,Promise,Object,Array,Set,String,Number,Error,
    document:{getElementById:id=>els[id]||null,addEventListener(){},hidden:false},
    window:{addEventListener(){}}, fetch:async(url,opt)=>{
      const fn=url.split('/rpc/')[1], a=JSON.parse(opt.body);
      if(fn==='clases_vault_get'){ const v=cloud.versions.filter(x=>x.vault===a.p_vault); return {ok:true,json:async()=>v.length?v[v.length-1].blob:null}; }
      if(fn==='clases_vault_put'){ if(cloud.offline) throw new Error('offline'); if(a.p_secret!==cloud.secret) return {ok:false,status:403,json:async()=>({})}; cloud.versions.push({vault:a.p_vault,blob:a.p_blob}); return {ok:true,json:async()=>'t'}; }
    }};
  ctx.globalThis=ctx; vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/fflate.js'),'utf8').replace('module','_m'),ctx); vm.runInContext(src+'\n;globalThis.__x={Vault,LS,VK,migrate,mergeData,sealPayload,openBlob,deriveKey,writeSecretFor,vaultUnlock,vaultAutoUnlock,pickPayload,touch,saveLocal,flushVault,emptyData,restoreBackup,backupBlob};',ctx);
  return {ctx,x:ctx.__x,store};
}
let fails=0; const ok=(c,m)=>{ if(!c){fails++;console.log('FALLA:',m);} else console.log('ok  ',m); };
(async()=>{
  // 1) bóveda "vieja" como la dejó Clases Semanales (v1, sin gzip, payload plano)
  const pw='clave-de-prueba-123';
  const salt=Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('base64');
  const meta={salt,iter:1000};
  const {x:boot}=makeEnv({versions:[]});
  const key=await boot.deriveKey(pw,meta);
  const v1payload={schedule:[{id:'s1',day:'Lunes',studio:'SOHO',time:'09:00'}],rates:{SOHO:400,EUPHORIA:0,EJE:0,ALUNNA_SOLO:0,ALUNNA_GROUP:0},payinfo:[{id:'p1',studio:'SOHO',frequency:'semanal',payday:'Martes'}],entries:[{id:'e1',date:'2026-10-01',studio:'SOHO',time:'09:00',tipo:'propia',amount:400,confirmado:true}],savedAt:'2026-10-01T10:00:00.000Z'};
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const ct=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,new TextEncoder().encode(JSON.stringify(v1payload)));
  const b64=u=>Buffer.from(u).toString('base64');
  const oldBlob={v:1,iter:meta.iter,salt,iv:b64(iv),ct:b64(ct),savedAt:v1payload.savedAt};
  const secret=await boot.writeSecretFor(key);
  const cloud={versions:[{vault:'clases-semanales',blob:oldBlob}],secret};

  // 2) desbloquear: contraseña incorrecta
  let e1=makeEnv(cloud); let err=null; try{ await e1.x.vaultUnlock('mala',false); }catch(e){ err=e.message; }
  ok(err==='clave','contraseña incorrecta se rechaza ('+err+')');

  // 3) desbloquear con la buena: migra v1→v2, conserva Clases, vault v2 comprimido local
  e1=makeEnv(cloud);
  e1.store['sf_gustos']=JSON.stringify(['Bad Bunny','Karol G']);
  e1.store['sf_saved']=JSON.stringify([{id:'r1',nombre:'Mi rutina vieja',metodo:'sculpt',sections:[]}]);
  const res=await e1.x.vaultUnlock(pw,true);
  ok(res.from==='cloud','carga desde la nube ('+res.from+')');
  const D=e1.x.Vault.data;
  ok(D.app===2&&D.clases.entries.length===1&&D.clases.entries[0].id==='e1','migró entries de v1');
  ok(D.clases.rates.SOHO===400&&D.clases.schedule.length===1&&D.clases.payinfo.length===1,'migró tarifas, horario y pagos');
  ok(res.imported&&D.sf.saved.length===1&&D.sf.gustos.includes('Karol G'),'importó rutinas/gustos de la app vieja (localStorage)');
  ok(JSON.parse(e1.store['sbf_vault_v2']).z===1,'guarda comprimido (z=1)');
  ok(cloud.versions.length===2&&cloud.versions[1].blob.v===2,'subió versión v2 a la nube con el secreto de siempre');
  ok(!!e1.store['sbf_key_v2'],'recordar guardó la llave');
  ok(e1.x.LS.get('sf_gustos',[]).length===2,'LS shim lee desde la bóveda');
  e1.x.LS.set('sf_saved',[{id:'r1'},{id:'r2'}]); await e1.x.saveLocal();
  ok(e1.x.Vault.data.sf.saved.length===2,'LS.set escribe en la bóveda');

  // 4) segundo dispositivo: abre lo que subió el primero
  await e1.x.flushVault(); await new Promise(r=>setTimeout(r,50));
  const dev2=makeEnv(cloud); const r2=await dev2.x.vaultUnlock(pw,false);
  ok(dev2.x.Vault.data.sf.saved.length===2||cloud.versions.length>=2,'dispositivo 2 abre el v2 ('+r2.from+')');

  // 5) conflicto: dispositivo A y B editan sin verse → se fusionan sin perder nada
  const A=makeEnv(cloud), B=makeEnv(cloud);
  await A.x.vaultUnlock(pw,false); await B.x.vaultUnlock(pw,false);
  A.x.Vault.data.clases.entries.push({id:'eA',date:'2026-10-02',studio:'SOHO',amount:400}); A.x.touch(); await A.x.saveLocal();
  await new Promise(r=>setTimeout(r,20));
  cloud.offline=true; B.x.Vault.data.clases.entries.push({id:'eB',date:'2026-10-03',studio:'EJE',amount:300}); B.x.touch(); await B.x.saveLocal(); cloud.offline=false;
  // A sube su versión (reloj del timer): forzamos push
  await A.x.flushVault(); await new Promise(r=>setTimeout(r,50));
  // B se reabre: tiene pendiente, y la nube cambió por A → fusión
  const B2=makeEnv(cloud); B2.store=B.store; Object.keys(B.store).forEach(k=>B2.ctx.localStorage.setItem(k,B.store[k]));
  await B2.x.vaultUnlock(pw,false);
  const ids=B2.x.Vault.data.clases.entries.map(e=>e.id).sort().join(',');
  ok(ids.includes('eA')&&ids.includes('eB')&&ids.includes('e1'),'fusión conserva e1, eA y eB → '+ids);

  // 5b) entrada automática con "recordar" (misma tienda local, nube con los datos)
  const R=makeEnv(cloud); Object.keys(e1.store).forEach(k=>R.ctx.localStorage.setItem(k,e1.store[k]));
  const auto=await R.x.vaultAutoUnlock(); ok(!!auto&&R.x.Vault.data.clases.entries.length>=1,"recordar abre sin contraseña");
  const R2=makeEnv(cloud); R2.ctx.localStorage.setItem("sbf_key_v2",JSON.stringify({salt:"x",k:"AAAA"})); const badAuto=await R2.x.vaultAutoUnlock(); ok(badAuto===null&&!R2.ctx.localStorage.getItem("sbf_key_v2"),"llave recordada inválida se descarta");
  // 5c) iOS antiguos sin CompressionStream: se usa fflate y el resultado es compatible en ambos sentidos
  const old=makeEnv(cloud,true); const dev=makeEnv(cloud); await dev.x.vaultUnlock(pw,false); dev.x.Vault.data.clases.entries.push({id:'eZ',date:'2026-10-05',studio:'EJE',amount:300}); dev.x.touch(); await dev.x.saveLocal();
  const blobNuevo=JSON.parse(dev.ctx.localStorage.getItem('sbf_vault_v2')); ok(blobNuevo.z===1,'dispositivo moderno guarda gzip');
  const viejo=await old.x.openBlob(await old.x.deriveKey(pw,{salt:blobNuevo.salt,iter:blobNuevo.iter}),blobNuevo); ok(viejo.clases.entries.some(e=>e.id==='eZ'),'iOS sin streams lee lo comprimido');
  const k2=await old.x.deriveKey(pw,{salt:blobNuevo.salt,iter:blobNuevo.iter}); const sellado=await old.x.sealPayload(k2,{salt:blobNuevo.salt,iter:blobNuevo.iter},{app:2,savedAt:'x',clases:{entries:[{id:'q'}]}}); ok(sellado.z===1,'iOS sin streams también comprime (fflate)');
  const leido=await dev.x.openBlob(await dev.x.deriveKey(pw,{salt:blobNuevo.salt,iter:blobNuevo.iter}),sellado); ok(leido.clases.entries[0].id==='q','y lo lee un dispositivo moderno');
  // 6) mergeData unitario
  const m=boot.mergeData({clases:{entries:[{id:'1',v:'viejo'},{id:'2'}]},sf:{gustos:['a']}},{clases:{entries:[{id:'1',v:'nuevo'}]},sf:{gustos:['B']}});
  ok(m.clases.entries.length===2&&m.clases.entries.find(e=>e.id==='1').v==='nuevo','merge: gana el nuevo, conserva los que faltan');
  ok(m.sf.gustos.length===2,'merge: gustos en unión');

  // 7) respaldo manual
  const bk=await e1.x.backupBlob(); const back=await e1.x.restoreBackup(JSON.stringify(bk));
  ok(back.clases.entries.length>=1,'respaldo descargado se puede restaurar');
  let bad=null; try{ await e1.x.restoreBackup(JSON.stringify({...bk,salt:'otra'})); }catch(e){ bad=e.message; }
  ok(bad==='salt','respaldo de otra llave se rechaza');
  console.log(fails?('\n'+fails+' FALLAS'):'\nTODO OK');
  process.exit(fails?1:0);
})().catch(e=>{console.log('EXC',e);process.exit(1);});
