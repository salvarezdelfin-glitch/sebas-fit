"use strict";
/* ============================================================
   PDF · escritor mínimo (Helvetica, texto, líneas, rectángulos, tablas y gráficas).
   Sin librerías externas: funciona sin señal y en el iPhone.
   ============================================================ */
const PDF_AW=[278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584];
const PDF_MAP={"′":"'","″":'"',"≈":"~","≥":">=","≤":"<=","→":"->","←":"<-","✓":"x","✔":"x","⚠":"!","≠":"!=","–":"\x96","—":"\x97","•":"\x95","‘":"\x91","’":"\x92","“":"\x93","”":"\x94","…":"\x85"," ":" ","▶":">"};
/* texto → bytes WinAnsi (lo que no existe en la fuente se descarta) */
function pdfEnc(s){
  let o=""; for(const ch of String(s==null?"":s)){ const c=ch.codePointAt(0);
    if(PDF_MAP[ch]!==undefined) o+=PDF_MAP[ch]; else if(c>=32&&c<=126||c>=128&&c<=159||c>=161&&c<=255) o+=ch; else if(c===9||c===10) o+=ch; }
  return o;
}
function pdfAnchoCh(ch){
  const c=ch.charCodeAt(0);
  if(c>=32&&c<=126) return PDF_AW[c-32];
  if(c===0x96) return 556; if(c===0x97) return 1000; if(c===0x95) return 350; if(c===0x85) return 1000; if(c===0x91||c===0x92) return 222; if(c===0x93||c===0x94) return 333;
  if(c===0xD7) return 584; if(c===0xB7) return 278; if(c===0xB0) return 400; if(c===0xBF) return 611; if(c===0xA1) return 333;
  const b=ch.normalize("NFD")[0], cb=b.charCodeAt(0); return cb>=32&&cb<=126?PDF_AW[cb-32]:556;
}
function pdfAncho(t,size,bold){ let w=0; for(const ch of t) w+=pdfAnchoCh(ch); return w*size/1000*(bold?1.06:1); }
function pdfEsc(s){ return s.replace(/\\/g,"\\\\").replace(/\(/g,"\\(").replace(/\)/g,"\\)"); }
const PDF_COL={ink:[.11,.11,.12],gris:[.45,.45,.48],claro:[.93,.93,.94],acento:[.86,.35,.17],verde:[.24,.55,.35],ambar:[.78,.52,.1],blanco:[1,1,1],linea:[.8,.8,.82]};

function pdfNuevo(opt){
  const o=Object.assign({margen:42,pie:"Sebas Fit",titulo:"Sebas Fit"},opt||{});
  const W=595.28,H=841.89,M=o.margen, paginas=[]; let cur=null, y=M;
  const nueva=()=>{ cur=[]; paginas.push(cur); y=M; };
  nueva();
  const rgb=c=>c.map(v=>(+v).toFixed(3)).join(" ");
  const envolver=(t,w,size,bold)=>{
    const out=[]; String(t).split("\n").forEach(par=>{
      const pal=par.split(/\s+/).filter(Boolean); let l="";
      if(!pal.length){ out.push(""); return; }
      pal.forEach(p=>{ const c=l?l+" "+p:p; if(pdfAncho(c,size,bold)<=w||!l) l=c; else { out.push(l); l=p; } });
      out.push(l);
    }); return out;
  };
  const txt=(t,x,base,size,bold,color)=>{ if(t==="") return; cur.push("BT "+rgb(color||PDF_COL.ink)+" rg /F"+(bold?2:1)+" "+size+" Tf "+x.toFixed(2)+" "+(H-base).toFixed(2)+" Td ("+pdfEsc(pdfEnc(t))+") Tj ET"); };
  const A={
    W,H,M,get y(){ return y; },set y(v){ y=v; },
    espacio(n){ y+=n; }, salto(){ nueva(); },
    necesita(h){ if(y+h>H-M-10) nueva(); },
    texto(t,op){ op=Object.assign({size:10,bold:false,color:PDF_COL.ink,x:M,w:W-2*M,align:"left",gap:3,lh:1.28},op||{});
      const l=envolver(pdfEnc(t),op.w,op.size,op.bold);
      l.forEach(s=>{ A.necesita(op.size*op.lh); const aw=pdfAncho(s,op.size,op.bold), x=op.align==="right"?op.x+op.w-aw:op.align==="center"?op.x+(op.w-aw)/2:op.x; txt(s,x,y+op.size*.95,op.size,op.bold,op.color); y+=op.size*op.lh; });
      y+=op.gap; },
    titulo(t,op){ op=Object.assign({size:13,color:PDF_COL.acento},op||{}); A.necesita(op.size*2.4); A.espacio(6); A.texto(t,{size:op.size,bold:true,color:op.color,gap:2}); A.linea(M,y,W-M,y,{color:PDF_COL.linea}); A.espacio(5); },
    rect(x,top,w,h,op){ op=Object.assign({fill:null,stroke:null,lw:.6},op||{}); let s="";
      if(op.fill) s+=rgb(op.fill)+" rg "; if(op.stroke) s+=rgb(op.stroke)+" RG "+op.lw+" w ";
      s+=x.toFixed(2)+" "+(H-top-h).toFixed(2)+" "+w.toFixed(2)+" "+h.toFixed(2)+" re "+(op.fill&&op.stroke?"B":op.fill?"f":"S"); cur.push(s); },
    linea(x1,y1,x2,y2,op){ op=Object.assign({color:PDF_COL.ink,lw:.6,dash:null},op||{});
      cur.push(rgb(op.color)+" RG "+op.lw+" w "+(op.dash?"["+op.dash+"] 0 d ":"[] 0 d ")+x1.toFixed(2)+" "+(H-y1).toFixed(2)+" m "+x2.toFixed(2)+" "+(H-y2).toFixed(2)+" l S"); },
    /* campo "Etiqueta: valor" o con línea para llenar a mano */
    campo(etq,val,x,w){ A.texto(etq,{size:7.5,color:PDF_COL.gris,x,w,gap:0,bold:true}); const v=val===""||val==null?"":String(val);
      if(v) A.texto(v,{size:10.5,x,w,gap:3}); else { A.espacio(11); A.linea(x,y,x+w-8,y,{color:PDF_COL.linea}); A.espacio(5); } },
    /* tabla: cols=[{w:peso relativo, t:"Encabezado", a:"left|right|center"}], filas=[[celda...]] con celda = texto o {t,sub} */
    tabla(cols,filas,op){ op=Object.assign({size:8.8,pad:4,zebra:true,cab:true},op||{});
      const tot=cols.reduce((s,c)=>s+c.w,0), ancho=W-2*M, cw=cols.map(c=>c.w/tot*ancho);
      const cabecera=()=>{ if(!op.cab) return; const h=op.size+op.pad*2+1; A.necesita(h+20); A.rect(M,y,ancho,h,{fill:PDF_COL.claro}); let x=M;
        cols.forEach((c,i)=>{ txt(c.t||"",x+op.pad,y+op.pad+op.size*.9,op.size-.6,true,PDF_COL.gris); x+=cw[i]; }); y+=h; };
      cabecera();
      filas.forEach((f,ri)=>{
        const cel=f.map((c,i)=>{ const t=typeof c==="object"&&c?c.t:c, sub=typeof c==="object"&&c?c.sub:null, w=cw[i]-op.pad*2;
          return {l:envolver(pdfEnc(t==null?"":t),w,op.size,!!(c&&c.b)),s:sub?envolver(pdfEnc(sub),w,op.size-1.6,false):[],b:!!(c&&c.b),color:c&&c.color}; });
        const lh=op.size*1.22, h=Math.max(...cel.map(c=>c.l.length*lh+c.s.length*(op.size-1.6)*1.2))+op.pad*2;
        if(y+h>H-M-10){ nueva(); cabecera(); }
        if(op.zebra&&ri%2) A.rect(M,y,ancho,h,{fill:[.975,.975,.98]});
        let x=M; cel.forEach((c,i)=>{ let by=y+op.pad+op.size*.92;
          c.l.forEach(s=>{ const al=cols[i].a, aw=pdfAncho(s,op.size,c.b), tx=al==="right"?x+cw[i]-op.pad-aw:al==="center"?x+(cw[i]-aw)/2:x+op.pad; txt(s,tx,by,op.size,c.b,c.color||PDF_COL.ink); by+=lh; });
          c.s.forEach(s=>{ txt(s,x+op.pad,by,op.size-1.6,false,PDF_COL.gris); by+=(op.size-1.6)*1.2; }); x+=cw[i]; });
        A.linea(M,y+h,M+ancho,y+h,{color:PDF_COL.linea,lw:.35}); y+=h;
      });
      y+=4; },
    /* gráfica de líneas: series=[{pts:[{x,y}],color,dash,nombre}] ; x = número (p. ej. días) */
    grafica(series,op){ op=Object.assign({w:(W-2*M-16)/2,h:110,unit:"",x:M,titulo:"",xetq:null},op||{});
      const todos=[].concat(...series.map(s=>s.pts)); if(!todos.length) return;
      const top=y; A.rect(op.x,top,op.w,op.h,{stroke:PDF_COL.linea}); if(op.titulo) txt(op.titulo,op.x+6,top+11,8.5,true,PDF_COL.gris);
      let mn=Math.min(...todos.map(p=>p.y)), mx=Math.max(...todos.map(p=>p.y)); const pad=(mx-mn)*.15||1; mn-=pad; mx+=pad;
      const x0=Math.min(...todos.map(p=>p.x)), x1=Math.max(...todos.map(p=>p.x)), sx=p=>op.x+30+(x1===x0?.5:(p-x0)/(x1-x0))*(op.w-42), sy=v=>top+op.h-16-(v-mn)/(mx-mn)*(op.h-34);
      txt(String(Math.round(mx*10)/10)+op.unit,op.x+4,sy(mx)+3,7,false,PDF_COL.gris); txt(String(Math.round(mn*10)/10)+op.unit,op.x+4,sy(mn)+3,7,false,PDF_COL.gris);
      series.forEach(s=>{ const p=s.pts.slice().sort((a,b)=>a.x-b.x); if(p.length>1){ cur.push(rgb(s.color||PDF_COL.acento)+" RG 1.4 w "+(s.dash?"["+s.dash+"] 0 d ":"[] 0 d ")+p.map((q,i)=>sx(q.x).toFixed(1)+" "+(H-sy(q.y)).toFixed(1)+(i?" l":" m")).join(" ")+" S"); }
        if(!s.dash) p.forEach(q=>A.rect(sx(q.x)-1.6,sy(q.y)-1.6,3.2,3.2,{fill:s.color||PDF_COL.acento})); });
      if(op.xetq) op.xetq.forEach(([xv,t])=>txt(t,sx(xv)-8,top+op.h-5,7,false,PDF_COL.gris));
      return top; },
    pie(){ const n=paginas.length; paginas.forEach((pg,i)=>{ cur=pg; txt(o.pie+" · "+(i+1)+"/"+n,M,H-22,7.5,false,PDF_COL.gris); }); },
    bytes(){
      A.pie(); const n=paginas.length, objs=[];
      objs[1]="<</Type/Catalog/Pages 2 0 R>>";
      objs[2]="<</Type/Pages/Kids["+paginas.map((_,i)=>(5+2*i)+" 0 R").join(" ")+"]/Count "+n+">>";
      objs[3]="<</Type/Font/Subtype/Type1/BaseFont/Helvetica/Encoding/WinAnsiEncoding>>";
      objs[4]="<</Type/Font/Subtype/Type1/BaseFont/Helvetica-Bold/Encoding/WinAnsiEncoding>>";
      paginas.forEach((pg,i)=>{ const cont=pg.join("\n"); objs[5+2*i]="<</Type/Page/Parent 2 0 R/MediaBox[0 0 "+W+" "+H+"]/Resources<</Font<</F1 3 0 R/F2 4 0 R>>>>/Contents "+(6+2*i)+" 0 R>>";
        objs[6+2*i]="<</Length "+cont.length+">>\nstream\n"+cont+"\nendstream"; });
      const info=objs.length; objs[info]="<</Title ("+pdfEsc(pdfEnc(o.titulo))+")/Producer (Sebas Fit)>>";
      let out="%PDF-1.4\n%\xE2\xE3\xCF\xD3\n"; const off=[];
      for(let i=1;i<objs.length;i++){ off[i]=out.length; out+=i+" 0 obj\n"+objs[i]+"\nendobj\n"; }
      const xr=out.length; out+="xref\n0 "+objs.length+"\n0000000000 65535 f \n"+off.slice(1).map(p=>String(p).padStart(10,"0")+" 00000 n \n").join("")+"trailer\n<</Size "+objs.length+"/Root 1 0 R/Info "+info+" 0 R>>\nstartxref\n"+xr+"\n%%EOF";
      const u=new Uint8Array(out.length); for(let i=0;i<out.length;i++) u[i]=out.charCodeAt(i)&255; return u;
    }
  };
  return A;
}
/* descarga: en iPhone abre la hoja de compartir (Guardar en Archivos / WhatsApp); en compu baja el archivo */
function pdfDescargar(bytes,nombre){
  const limpio=String(nombre).normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^\w.\- ]+/g,"").trim().replace(/\s+/g,"-")||"documento.pdf";
  const blob=new Blob([bytes],{type:"application/pdf"});
  try{ const f=new File([blob],limpio,{type:"application/pdf"}); if(typeof esIOS==="function"&&esIOS()&&navigator.canShare&&navigator.canShare({files:[f]})){ navigator.share({files:[f],title:limpio}).catch(()=>{}); return; } }catch(e){}
  const url=URL.createObjectURL(blob), a=document.createElement("a"); a.href=url; a.download=limpio; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),60000);
}
