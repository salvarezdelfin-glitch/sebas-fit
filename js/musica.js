"use strict";
/* ============================================================
   MÚSICA · la app arma la playlist de cada clase, canción por canción
   - Catálogo propio (~150 temas) con BPM aproximado y energía; tus canciones y tus artistas pesan más.
   - Cada bloque de la rutina recibe canciones según su energía y duración: arranque, pierna, glúteo,
     abs, reto final y relajación para el cierre.
   - Abrir en Spotify: un toque por canción (búsqueda), copiar la lista, o crear la playlist directo
     en tu cuenta (opcional, se conecta una sola vez).
   ============================================================ */
/* artista|canción|bpm|energía(1-5)|estilo|duración en seg (opcional)
   estilo: r reggaetón/urbano · p pop y dance · h hip-hop · l latino pop · e electrónica · c relajación */
const MUS_RAW=`
Bad Bunny|Safaera|98|4|r|295
Bad Bunny|Yonaguni|90|3|r
Bad Bunny|Me Porto Bonito|92|4|r
Bad Bunny|Tití Me Preguntó|108|4|r
Bad Bunny|Efecto|97|3|r
Bad Bunny|Moscow Mule|99|3|r
Bad Bunny|Ojitos Lindos|96|2|r
Bad Bunny|Callaíta|92|4|r
Bad Bunny|Dákiti|109|4|r
Bad Bunny|Mía|97|3|r
Bad Bunny|Yo Perreo Sola|96|4|r
Bad Bunny|La Noche de Anoche|100|3|r
Bad Bunny|Vete|96|3|r
Daddy Yankee|Gasolina|96|5|r
Daddy Yankee|Dura|95|4|r
Daddy Yankee|Con Calma|94|4|r
Daddy Yankee|Rompe|92|4|r
Daddy Yankee|Limbo|96|4|r
Don Omar|Danza Kuduro|130|5|r
Don Omar|Dale Don Dale|96|4|r
Don Omar|Salió el Sol|100|4|r
Don Omar|Virtual Diva|89|3|r
Wisin & Yandel|Rakata|93|4|r
Wisin & Yandel|Sexy Movimiento|95|4|r
Wisin & Yandel|Estoy Enamorado|96|3|r
Yandel|Explícale|96|3|r
Zion & Lennox|Yo Voy|95|4|r
Zion & Lennox|Pierdo la Cabeza|94|3|r
Zion & Lennox|Casos Perdidos|94|3|r
Zion & Lennox|Hace Tiempo|95|3|r
Farruko|Pepas|130|5|r
Farruko|Krippy Kush|93|4|r
Farruko|Passion Whine|95|4|r
Ozuna|Taki Taki|96|4|r
Ozuna|Se Preparó|94|4|r
Ozuna|Caramelo|92|3|r
Ozuna|El Farsante|94|3|r
J Balvin|Mi Gente|105|5|r
J Balvin|Ginza|94|4|r
J Balvin|Safari|98|4|r
J Balvin|Ay Vamos|94|4|r
J Balvin|Loco Contigo|97|4|r
Karol G|Tusa|101|4|r
Karol G|Bichota|98|4|r
Karol G|Provenza|110|4|r
Karol G|Mi Cama|95|3|r
Rauw Alejandro|Todo de Ti|127|4|r
Rauw Alejandro|Desesperados|98|3|r
Rauw Alejandro|Fantasías|99|4|r
Feid|Normal|100|3|r
Feid|Ferxxo 100|98|3|r
Feid|Classy 101|96|3|r
Anuel AA|Ella Quiere Beber|94|4|r
Maluma|Felices los 4|94|4|r
Maluma|Hawái|90|3|r
Maluma|Corazón|100|4|r
Nicky Jam|El Perdón|90|3|r
Nicky Jam|X|94|4|r
Danny Ocean|Me Rehúso|104|3|r
Becky G|Mayores|94|4|r
Becky G|Sin Pijama|94|4|r
Rosalía|Con Altura|98|4|r
Anitta|Envolver|95|4|r
Shakira|Hips Don't Lie|100|4|l
Shakira|Waka Waka (This Time for Africa)|127|5|l
Shakira|Whenever, Wherever|107|3|l
Shakira|La Tortura|100|3|l
Shakira|Bzrp Music Sessions, Vol. 53|122|4|l
Jennifer Lopez|On the Floor|130|5|p
Jennifer Lopez|Waiting for Tonight|126|4|p
Luis Fonsi|Despacito|89|3|l
Camila Cabello|Havana|105|3|l
Ricky Martin|Livin' la Vida Loca|140|5|l
Marc Anthony|Vivir Mi Vida|128|5|l
Gente de Zona|La Gozadera|100|4|l
Pitbull|Timber|130|5|p
Pitbull|Give Me Everything|129|5|p
Pitbull|I Know You Want Me (Calle Ocho)|126|5|p
Pitbull|Don't Stop the Party|127|5|p
Pitbull|Hotel Room Service|130|5|p
Pitbull|Fireball|122|4|p
Pitbull|Rain Over Me|128|5|p
Pitbull|Feel This Moment|126|4|p
The Black Eyed Peas|I Gotta Feeling|128|5|p
The Black Eyed Peas|Let's Get It Started|100|4|h
The Black Eyed Peas|Pump It|154|5|h
The Black Eyed Peas|Don't Phunk with My Heart|108|4|p
The Black Eyed Peas|Boom Boom Pow|130|5|p
The Black Eyed Peas|Just Can't Get Enough|130|5|p
The Black Eyed Peas|Ritmo (Bad Boys for Life)|94|4|r
The Black Eyed Peas|Mamacita|94|4|r
Michael Jackson|Billie Jean|117|4|p
Michael Jackson|Beat It|139|5|p
Michael Jackson|Smooth Criminal|126|5|p
Michael Jackson|Thriller|118|4|p
Michael Jackson|Don't Stop 'Til You Get Enough|119|4|p
Michael Jackson|Bad|114|4|p
Michael Jackson|Black or White|115|4|p
Michael Jackson|Rock with You|114|3|p
Michael Jackson|Wanna Be Startin' Somethin'|123|4|p
Michael Jackson|The Way You Make Me Feel|115|4|p
Eminem|Lose Yourself|171|5|h
Eminem|Without Me|112|4|h
Eminem|The Real Slim Shady|104|4|h
Eminem|Till I Collapse|171|5|h
Eminem|Not Afraid|82|3|h
Eminem|Godzilla|166|5|h
Cardi B|I Like It|136|5|h
Cardi B|WAP|133|5|h
50 Cent|In Da Club|90|4|h
Kanye West|Stronger|104|4|h
Nelly|Hot in Herre|107|4|h
Missy Elliott|Work It|101|4|h
Dua Lipa|Levitating|103|4|p
Dua Lipa|Don't Start Now|124|4|p
Dua Lipa|Physical|147|5|p
Dua Lipa|New Rules|116|4|p
The Weeknd|Can't Feel My Face|108|4|p
The Weeknd|Blinding Lights|171|5|p
The Weeknd|Save Your Tears|118|4|p
Lizzo|About Damn Time|109|4|p
Lizzo|Juice|120|4|p
Lizzo|Good as Hell|96|4|p
Beyoncé|Crazy in Love|99|4|p
Beyoncé|Run the World (Girls)|127|5|p
Beyoncé|Formation|123|4|p
Beyoncé|Single Ladies (Put a Ring on It)|97|4|p
Rihanna|Don't Stop the Music|122|4|p
Rihanna|Work|92|3|p
Rihanna|We Found Love|128|5|p
Rihanna|Only Girl (In the World)|126|5|p
Calvin Harris|Feel So Close|128|5|e
Calvin Harris|This Is What You Came For|124|4|e
Calvin Harris|One Kiss|124|4|e
David Guetta|Titanium|126|5|e
David Guetta|Play Hard|130|5|e
Avicii|Wake Me Up|124|4|e
Avicii|Levels|126|5|e
Swedish House Mafia|Don't You Worry Child|129|5|e
Martin Garrix|Animals|128|5|e
Zedd|Clarity|128|4|e
Daft Punk|Harder, Better, Faster, Stronger|123|5|e
Daft Punk|Get Lucky|116|4|e
Bruno Mars|Uptown Funk|115|5|p
Bruno Mars|24K Magic|107|4|p
Bruno Mars|Treasure|116|4|p
Justin Timberlake|Can't Stop the Feeling!|113|4|p
Justin Timberlake|SexyBack|117|4|p
Ariana Grande|7 rings|140|4|p
Ariana Grande|Into You|108|4|p
Katy Perry|Firework|124|4|p
Katy Perry|Roar|90|3|p
Doja Cat|Say So|111|4|p
Kesha|TiK ToK|120|4|p
Flo Rida|Good Feeling|128|5|p
Ed Sheeran|Shape of You|96|3|p
Kali Uchis|Telepatía|83|2|r
Marconi Union|Weightless|60|1|c|489
Erik Satie|Gymnopédie No. 1|60|1|c|190
Claude Debussy|Clair de Lune|64|1|c|300
Ludovico Einaudi|Nuvole Bianche|60|1|c|357
Ludovico Einaudi|Experience|76|1|c|315
Yiruma|River Flows in You|65|1|c|188
Enya|Only Time|76|1|c|218
Sia|Breathe Me|74|1|c|272
Norah Jones|Don't Know Why|81|1|c|186
Jack Johnson|Better Together|78|1|c|207
Coldplay|The Scientist|73|1|c|309
Hans Zimmer|Time|60|1|c|275
Sade|By Your Side|90|1|c|254
`;
const MUS_CAT=MUS_RAW.trim().split("\n").map((l,i)=>{ const p=l.split("|"); return {id:"m"+i,artist:p[0],title:p[1],bpm:+p[2],e:+p[3],tag:p[4],dur:+p[5]||205,cat:1}; });
const MUS_ESTILOS={mix:{nom:"Mi mezcla",desc:"Tus artistas + lo que mejor calza",w:{}},r:{nom:"Reggaetón y urbano",desc:"Perreo, dembow, trap latino",w:{r:3,l:1}},
  p:{nom:"Pop y dance",desc:"Pop, electrónica, clásicos",w:{p:3,e:2}},h:{nom:"Hip-hop",desc:"Rap y hip-hop de gimnasio",w:{h:3,r:1}},sorp:{nom:"Sorpréndeme",desc:"Mezcla amplia, sin tus favoritos",w:{p:1,r:1,h:1,e:1,l:1}}};
function musTier(lo,hi){ const m=(lo+hi)/2; return m<85?1:m<100?2:m<112?3:m<126?4:5; }
function musFmt(sec){ return Math.floor(sec/60)+":"+String(Math.round(sec%60)).padStart(2,"0"); }
function musSearchUrl(t){ return "https://open.spotify.com/search/"+encodeURIComponent(t.artist+" "+t.title); }
function musUsuario(){ return (state.musicLib||[]).map(s=>({id:"u"+s.id,artist:s.artista,title:s.titulo,bpm:Number(s.bpm),e:({Baja:2,Media:3,Alta:4,Picos:5})[s.energia]||3,tag:"u",dur:205,url:s.url,usr:1})); }
function musGusto(artist){ const a=artist.toLowerCase(); return (state.gustos||[]).some(g=>{ g=g.toLowerCase(); return a===g||a.includes(g)||g.includes(a); }); }

/* ---------- selección ---------- */
function musScore(t,mood,estilo,usados,recent){
  const lo=mood.lo, hi=mood.hi, d=t.bpm>=lo&&t.bpm<=hi?0:Math.min(Math.abs(t.bpm-lo),Math.abs(t.bpm-hi));
  if(d>16) return -99;
  const tier=musTier(lo,hi); let s=6-d*0.3-Math.abs(t.e-tier)*0.9;
  if(mood.cierre){ if(t.tag!=="c"&&!t.usr) return -99; s+=2; } else if(t.tag==="c") return -99;
  const E=MUS_ESTILOS[estilo]||MUS_ESTILOS.mix;
  if(estilo!=="sorp"&&(musGusto(t.artist)||t.usr)) s+=t.usr?3:2; else if(estilo==="sorp"&&musGusto(t.artist)) s-=1.5;
  s+=(E.w[t.tag]||0)*0.9;
  if(usados.has(t.id)) return -99;
  s-=(recent[t.id]||0)*1.6;
  return s+Math.random()*1.3;
}
function musArmar(r,estilo){
  estilo=estilo||"mix";
  const pool=musUsuario().concat(MUS_CAT), usados=new Set(), recent=(state.historia&&state.historia.musica)||{};
  const bloques=r.sections.map(S=>{
    const mood=Object.assign({},sectionMood(S,r)), need=Math.max(120,sectionSeconds(S,r));
    if(S.kind==="cool") mood.cierre=true;
    if(S.bk==="cierre") mood.cierre=true;
    const rank=pool.map(t=>({t,s:musScore(t,mood,estilo,usados,recent)})).filter(x=>x.s>-50).sort((a,b)=>b.s-a.s);
    const tracks=[]; let total=0, lastArtist=null;
    for(const x of rank){ if(total>=need-45) break; if(x.t.artist===lastArtist&&rank.length>tracks.length+3) continue;
      tracks.push(x.t); total+=x.t.dur; usados.add(x.t.id); lastArtist=x.t.artist; }
    if(!mood.cierre&&S.kind!=="finisher") tracks.sort((a,b)=>a.bpm-b.bpm);   // dentro del bloque, de menos a más
    return {secId:S.id,nom:S.nom.replace(/^Bloque \d+ · /,""),lo:mood.lo,hi:mood.hi,en:mood.en,seg:need,tracks:tracks.map(t=>Object.assign({},t))};
  });
  return {estilo,creada:Date.now(),bloques};
}
function musAsegurar(r){
  const m=r.musica, ok=m&&m.bloques&&m.bloques.length===r.sections.length&&m.bloques.every((b,i)=>b.secId===r.sections[i].id);
  if(!ok) r.musica=musArmar(r,(m&&m.estilo)||"mix");   // la rutina cambió: se rehace la música
  return r.musica;
}
function musTodas(m){ return m.bloques.flatMap(b=>b.tracks); }
function musTexto(r){
  const m=musAsegurar(r); let out="Playlist · "+r.nombre+"\n";
  m.bloques.forEach(b=>{ if(!b.tracks.length) return; out+="\n"+b.nom.toUpperCase()+" ("+b.lo+"–"+b.hi+" BPM)\n"; b.tracks.forEach((t,i)=>{ out+=(i+1)+". "+t.artist+" — "+t.title+"\n"; }); });
  return out;
}
function musRegistrarUso(r){
  const h=state.historia; h.musica=h.musica||{};
  Object.keys(h.musica).forEach(k=>{ h.musica[k]*=0.6; if(h.musica[k]<0.2) delete h.musica[k]; });
  musTodas(musAsegurar(r)).forEach(t=>{ h.musica[t.id]=(h.musica[t.id]||0)+1; });
  LS.set("sf_historia",h);
}

/* ---------- vista ---------- */
function viewPlaylists(){
  const r=state.routine;
  return `<div class="wrap"><header class="page-head"><span class="eyebrow">Música</span><h1>Playlist de la clase</h1><p class="sub">La app arma las canciones por bloque según la energía de cada parte de tu clase. Tú solo la abres en Spotify.</p></header>
    ${r?musClaseHtml(r):`<div class="empty"><b>Genera o abre una rutina para armar su música.</b><p>Cada bloque recibe canciones con la energía justa: arranque, pierna, glúteo, abs, reto final y relajación.</p><p><button class="btn primary" data-action="go" data-screen="inicio">Generar rutina</button></p></div>`}
    ${musMisHtml()}</div>`;
}
function musClaseHtml(r){
  const m=musAsegurar(r), all=musTodas(m), total=all.reduce((a,t)=>a+t.dur,0), cls=estimateMinutes(r);
  const sp=musSpotEstado();
  const est=Object.keys(MUS_ESTILOS).map(k=>`<button data-action="mu-estilo" data-v="${k}" class="${m.estilo===k?"on":""}" title="${esc(MUS_ESTILOS[k].desc)}">${MUS_ESTILOS[k].nom}</button>`).join("");
  const bl=m.bloques.map((b,bi)=>`<section class="sec mu-block"><div class="sec-head" style="--tagc:${tagColor((r.sections[bi]||{}).tag)}"><h3>${esc(b.nom)}</h3><span class="s-meta">${b.lo}–${b.hi} BPM · ${b.tracks.length} canciones</span><span class="spacer"></span>
      <button class="btn sm" data-action="mu-regen-bloque" data-i="${bi}">↻ Otras</button></div>
      <div class="mu-en">${esc(b.en)}</div>
      ${b.tracks.map((t,ti)=>`<div class="mu-track"><span class="idx">${String(ti+1).padStart(2,"0")}</span><div class="mt-main"><div class="mt-title">${esc(t.title)}</div><div class="mt-art">${esc(t.artist)}${t.usr?' <span class="chip solid">tuya</span>':''}</div></div>
        <span class="mt-bpm num">${t.bpm?"≈ "+t.bpm:"—"}</span><span class="mt-dur num">${musFmt(t.dur)}</span>
        <div class="mt-acts"><a class="btn sm primary" href="${esc(t.url||musSearchUrl(t))}" target="_blank" rel="noopener">▶ Spotify</a><button class="pg" data-action="mu-swap" data-b="${bi}" data-t="${ti}" title="Cambiar canción" aria-label="Cambiar canción">↻</button><button class="del" data-action="mu-del" data-b="${bi}" data-t="${ti}" aria-label="Quitar canción">✕</button></div></div>`).join("")||`<div class="mu-empty">Sin canciones para esta energía — pulsa "Otras" o cambia el estilo.</div>`}
    </section>`).join("");
  return `<div class="card mu-top"><div class="mu-head"><div><h3>${esc(r.nombre)}</h3><p class="hint">Clase ≈ ${cls} min · playlist ≈ ${Math.round(total/60)} min · ${all.length} canciones</p></div>
      <div class="acts"><button class="btn primary" data-action="mu-copiar">⧉ Copiar lista</button>${sp.listo?`<button class="btn" data-action="mu-crear-spotify">＋ Crear en mi Spotify</button>`:`<button class="btn" data-action="go" data-screen="ajustes" title="Conectar una sola vez">＋ Crear en Spotify…</button>`}<button class="btn ghost" data-action="mu-regen">↻ Rehacer todo</button></div></div>
    <label class="mini" style="margin-top:12px">Estilo</label><div class="seg">${est}</div>
    <p class="hint" style="margin-top:10px">BPM aproximado de referencia (Spotify ya no los publica): úsalo como guía. Tus artistas favoritos y tus canciones pesan más. La búsqueda de Spotify abre la canción en la app.</p></div>
    <div class="sections">${bl}</div>`;
}
function musMisHtml(){
  const P=state.playlists||[], L=state.musicLib||[];
  return `<section class="blk" style="margin-top:34px"><div class="blk-head"><div><h2>Mis playlists</h2><p>Las que ya tienes en Spotify, para abrirlas rápido y ligarlas a tus clases</p></div><button class="btn sm" data-action="pl-new">+ Añadir enlace</button></div>
    <div class="grid-cards">${P.map(p=>`<div class="mini-card"><span class="strong">${esc(p.nom)}</span><span class="hint">${esc(p.tipo)} · ${p.bpmMin}–${p.bpmMax} BPM</span>
      <div class="acts" style="margin-top:6px">${p.url?`<a class="btn sm primary" href="${esc(p.url)}" target="_blank" rel="noopener">▶ Abrir</a>`:""}<button class="btn sm" data-action="pl-edit" data-id="${p.id}">Editar</button><button class="btn sm ghost" data-action="pl-del" data-id="${p.id}">✕</button></div></div>`).join("")||`<p class="hint">Sin playlists.</p>`}</div></section>
    <section class="blk"><div class="blk-head"><div><h2>Mis canciones</h2><p>Agrega canciones tuyas (con su BPM si lo sabes): la app las prefiere al armar la música</p></div><button class="btn sm" data-action="song-new">+ Añadir canción</button></div>
    <div class="list-lines">${L.map(s=>`<div class="row-line"><div><b>${esc(s.titulo)}</b> <span class="hint">${esc(s.artista)}</span></div><span class="chip solid">${s.bpm} BPM</span><span class="chip">${esc(s.energia)}</span>
      ${s.url?`<a class="btn sm" href="${esc(s.url)}" target="_blank" rel="noopener">▶</a>`:""}<button class="btn sm" data-action="song-edit" data-id="${s.id}">Editar</button><button class="del" data-action="song-del" data-id="${s.id}" aria-label="Borrar">✕</button></div>`).join("")||`<p class="hint">Sin canciones tuyas todavía.</p>`}</div></section>`;
}
/* resumen compacto para la vista Rutina */
function musResumenHtml(r){
  const m=musAsegurar(r), all=musTodas(m), prim=m.bloques.find(b=>b.tracks.length&&b.tracks[0]);
  return `<div class="pl-brief mu-mini"><div class="row" style="justify-content:space-between"><h3>🎧 Música de la clase</h3><span class="chip">${all.length} canciones · ≈ ${Math.round(all.reduce((a,t)=>a+t.dur,0)/60)} min</span></div>
    <p class="hint" style="margin:6px 0 0">${m.bloques.filter(b=>b.tracks.length).slice(0,5).map(b=>esc(b.nom)+": <b>"+esc(b.tracks[0].artist)+"</b>").join(" · ")}…</p>
    <div class="acts" style="margin-top:10px"><button class="btn primary sm" data-action="go" data-screen="playlists">Ver y abrir en Spotify</button><button class="btn sm" data-action="mu-copiar">⧉ Copiar lista</button></div></div>`;
}

/* ---------- acciones ---------- */
function musClick(a,t){
  const r=state.routine;
  if(a==="mu-estilo"){ r.musica=musArmar(r,t.dataset.v); render(); return true; }
  if(a==="mu-regen"){ r.musica=musArmar(r,musAsegurar(r).estilo); render(); return true; }
  if(a==="mu-regen-bloque"){ const m=musAsegurar(r), i=+t.dataset.i, nuevo=musArmar(r,m.estilo); const usados=new Set(m.bloques.flatMap((b,j)=>j===i?[]:b.tracks.map(x=>x.id)));
    m.bloques[i].tracks=nuevo.bloques[i].tracks.filter(x=>!usados.has(x.id)); render(); return true; }
  if(a==="mu-swap"){ const m=musAsegurar(r), b=m.bloques[+t.dataset.b], S=r.sections[+t.dataset.b], mood=Object.assign({},sectionMood(S,r)); if(S.bk==="cierre") mood.cierre=true;
    const usados=new Set(musTodas(m).map(x=>x.id)), pool=musUsuario().concat(MUS_CAT);
    const c=pool.map(x=>({x,s:musScore(x,mood,m.estilo,usados,(state.historia.musica||{}))})).filter(z=>z.s>-50).sort((p,q)=>q.s-p.s)[0];
    if(c){ b.tracks[+t.dataset.t]=Object.assign({},c.x); render(); } else toast("No hay otra canción con esa energía"); return true; }
  if(a==="mu-del"){ const m=musAsegurar(r); m.bloques[+t.dataset.b].tracks.splice(+t.dataset.t,1); render(); return true; }
  if(a==="mu-copiar"){ copyText(musTexto(r),"Lista copiada"); musRegistrarUso(r); return true; }
  if(a==="mu-crear-spotify"){ musCrearEnSpotify(r); return true; }
  if(a==="mu-spot-conectar"){ const id=(document.getElementById("mu-cid").value||"").trim(); if(!id){ toast("Pega tu Client ID"); return true; }
    (Vault.data.sf.spotify=Vault.data.sf.spotify||{}).clientId=id; touch(); musSpotAuth(); return true; }
  if(a==="mu-spot-desconectar"){ lsDel("sbf_spot_tok"); delete (Vault.data.sf.spotify||{}).clientId; touch(); render(); toast("Spotify desconectado"); return true; }
  return false;
}

/* ============================================================
   SPOTIFY (opcional): crear la playlist directo en tu cuenta
   Conexión PKCE desde el navegador; se registra una app gratuita en developer.spotify.com
   y se pega el Client ID en Ajustes una sola vez.
   ============================================================ */
const SPOT_SCOPES="playlist-modify-private playlist-modify-public";
function musRedirect(){ return location.origin+location.pathname; }
function musSpotEstado(){
  const cid=((Vault.data&&Vault.data.sf.spotify)||{}).clientId||"", tok=musTok();
  return {clientId:cid,conectado:!!tok,listo:!!cid&&!!tok};
}
function musTok(){ try{ const t=JSON.parse(lsGet("sbf_spot_tok")||"null"); return t&&t.exp>Date.now()+30000?t:null; }catch(e){ return null; } }
function b64url(buf){ return btoa(String.fromCharCode.apply(null,new Uint8Array(buf))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,""); }
async function musSpotAuth(pend){
  const cid=Vault.data.sf.spotify.clientId, ver=b64url(crypto.getRandomValues(new Uint8Array(48))), st=b64url(crypto.getRandomValues(new Uint8Array(12)));
  const ch=b64url(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(ver)));
  lsSet("sbf_spot_pkce",JSON.stringify({ver,st,pend:!!pend})); await flushVault();
  location.href="https://accounts.spotify.com/authorize?"+new URLSearchParams({client_id:cid,response_type:"code",redirect_uri:musRedirect(),code_challenge_method:"S256",code_challenge:ch,scope:SPOT_SCOPES,state:st});
}
/* al volver de Spotify con ?code=… (se llama después de desbloquear) */
async function musSpotRetorno(){
  const q=new URLSearchParams(location.search), code=q.get("code"); if(!code) return false;
  let p; try{ p=JSON.parse(lsGet("sbf_spot_pkce")||"null"); }catch(e){} history.replaceState(null,"",location.pathname);
  if(!p||p.st!==q.get("state")){ toast("No se pudo verificar la conexión con Spotify"); return false; }
  const cid=((Vault.data.sf.spotify)||{}).clientId;
  try{
    const r=await fetch("https://accounts.spotify.com/api/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({grant_type:"authorization_code",code,redirect_uri:musRedirect(),client_id:cid,code_verifier:p.ver})});
    const j=await r.json(); if(!r.ok) throw new Error(j.error_description||j.error||"error");
    lsSet("sbf_spot_tok",JSON.stringify({access:j.access_token,exp:Date.now()+(j.expires_in||3600)*1000})); lsDel("sbf_spot_pkce");
    toast("Spotify conectado ✔"); return true;
  }catch(e){ toast("Spotify: "+e.message); return false; }
}
async function spApi(path,opt){
  const t=musTok(); if(!t) throw new Error("Vuelve a conectar Spotify");
  const r=await fetch("https://api.spotify.com/v1"+path,Object.assign({headers:{Authorization:"Bearer "+t.access,"Content-Type":"application/json"}},opt||{}));
  if(r.status===401){ lsDel("sbf_spot_tok"); throw new Error("La sesión de Spotify venció, conéctala de nuevo"); }
  const txt=await r.text(); let j=null; try{ j=txt?JSON.parse(txt):null; }catch(e){}
  if(!r.ok){ const err=new Error((j&&j.error&&j.error.message)||("Spotify "+r.status)); err.status=r.status; throw err; }
  return j;
}
async function musCrearEnSpotify(r){
  const m=musAsegurar(r), tracks=musTodas(m); if(!tracks.length){ toast("No hay canciones"); return; }
  toast("Creando playlist en Spotify…");
  try{
    const uris=[], faltan=[];
    for(const t of tracks){
      let uri=null;
      if(t.url&&/open\.spotify\.com\/track\//.test(t.url)){ const mm=t.url.match(/track\/([A-Za-z0-9]+)/); if(mm) uri="spotify:track:"+mm[1]; }
      if(!uri){
        let j=await spApi("/search?"+new URLSearchParams({q:"track:"+t.title+" artist:"+t.artist,type:"track",limit:"1"}));
        let it=j&&j.tracks&&j.tracks.items&&j.tracks.items[0];
        if(!it){ j=await spApi("/search?"+new URLSearchParams({q:t.artist+" "+t.title,type:"track",limit:"1"})); it=j&&j.tracks&&j.tracks.items&&j.tracks.items[0]; }
        if(it) uri=it.uri;
      }
      if(uri) uris.push(uri); else faltan.push(t.title);
    }
    if(!uris.length) throw new Error("No encontré ninguna canción");
    const pl=await spApi("/me/playlists",{method:"POST",body:JSON.stringify({name:"Sebas Fit · "+r.nombre,description:"Armada por Sebas Fit para tu clase",public:false})});
    for(let i=0;i<uris.length;i+=90){
      const body=JSON.stringify({uris:uris.slice(i,i+90)});
      try{ await spApi("/playlists/"+pl.id+"/tracks",{method:"POST",body}); }
      catch(e){ if(e.status===404||e.status===410) await spApi("/playlists/"+pl.id+"/items",{method:"POST",body}); else throw e; }
    }
    const url=(pl.external_urls&&pl.external_urls.spotify)||("https://open.spotify.com/playlist/"+pl.id);
    state.playlists.unshift({id:pid(),nom:"Sebas Fit · "+r.nombre,tipo:"General",url,bpmMin:Math.min(...m.bloques.map(b=>b.lo)),bpmMax:Math.max(...m.bloques.map(b=>b.hi)),energia:"Media",notas:"Creada por la app ("+uris.length+" canciones)"});
    LS.set("sf_playlists",state.playlists); musRegistrarUso(r); render();
    toast("Playlist creada"+(faltan.length?" · no encontré "+faltan.length:"")); window.open(url,"_blank");
  }catch(e){ toast("Spotify: "+e.message); }
}
/* tarjeta de conexión (se muestra en Ajustes) */
function musSpotAjustesHtml(){
  const e=musSpotEstado();
  return `<section class="blk"><div class="blk-head"><div><h2>Spotify (opcional)</h2><p>Para crear la playlist de cada clase directo en tu cuenta con un toque</p></div></div><div class="card">
    ${e.listo?`<p class="hint" style="margin-top:0">✔ Conectado. En la pantalla Playlists verás "Crear en mi Spotify".</p><div class="acts-row"><button class="btn" data-action="mu-spot-conectar">Reconectar</button><button class="btn ghost" data-action="mu-spot-desconectar">Desconectar</button></div>`
    :`<ol class="hint" style="margin:0 0 12px;padding-left:18px"><li>Entra a <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener">developer.spotify.com/dashboard</a> y crea una app (gratis).</li><li>En "Redirect URIs" agrega exactamente: <b class="num">${esc(musRedirect())}</b></li><li>Copia el <b>Client ID</b> y pégalo aquí.</li></ol>
    <div class="arm-input" style="padding:0"><input class="inp" id="mu-cid" placeholder="Client ID de Spotify" value="${esc(e.clientId)}" autocomplete="off"><button class="btn primary" data-action="mu-spot-conectar">Conectar</button></div>
    <p class="hint">Sin esto la app sigue funcionando: abre cada canción en Spotify con un toque y copia la lista completa.</p>`}</div></section>`;
}
