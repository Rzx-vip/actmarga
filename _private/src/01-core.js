(()=>{
'use strict';
const D=document,W=window;
/* =====================================================================
   IGNEEL DRAGONS ACT — Biolink MARGA ACT
   Satu file: CSS + JS + HTML. Data & login admin: jsonbin.io
   ===================================================================== */

/* ---------- util ---------- */
const $=(s,r=D)=>r.querySelector(s),$$=(s,r=D)=>[...r.querySelectorAll(s)];
const h=(tag,a,...kids)=>{
  const e=D.createElement(tag);
  if(a)for(const k in a){
    const v=a[k];if(v==null||v===false)continue;
    if(k==='class')e.className=v;
    else if(k==='style'&&typeof v==='object')Object.assign(e.style,v);
    else if(k.slice(0,2)==='on'&&typeof v==='function')e.addEventListener(k.slice(2),v);
    else if(k==='html')e.innerHTML=v; /* hanya untuk SVG statis buatan sendiri */
    else e.setAttribute(k,v===true?'':v);
  }
  for(const c of kids.flat(2)){if(c==null||c===false)continue;e.append(c.nodeType?c:D.createTextNode(c))}
  return e;
};
const clamp=(n,a,b)=>Math.min(b,Math.max(a,Number(n)||0));
const uid=()=>Math.random().toString(36).slice(2,8);
const clone=o=>JSON.parse(JSON.stringify(o));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const tmo=(p,ms)=>Promise.race([p,new Promise((_,j)=>setTimeout(()=>j(new Error('timeout')),ms))]);
const cssColor=(v,f)=>(typeof v==='string'&&(/^#[0-9a-f]{3,8}$/i.test(v)||/^rgba?\([\d\s.,%]+\)$/i.test(v)||/^[a-z]{3,20}$/i.test(v)))?v:f;
const rgb=hex=>{let x=String(hex||'#000').replace('#','');if(x.length===3)x=[...x].map(c=>c+c).join('');const n=parseInt(x.slice(0,6),16)||0;return[n>>16&255,n>>8&255,n&255]};
const rgba=(hex,a)=>{const[r,g,b]=rgb(hex);return`rgba(${r},${g},${b},${a})`};
const safeUrl=(u,img)=>{
  u=String(u==null?'':u).trim();if(!u)return'';
  if(/^(https?:|mailto:|tel:)/i.test(u))return u;
  if(img&&/^data:image\/(png|jpe?g|webp|gif);base64,[a-z0-9+/=]+$/i.test(u))return u;
  if(!/^[a-z][a-z0-9+.-]*:/i.test(u)&&/^[\w\-./%@+ ,'()&~]+$/.test(u))return encodeURI(u);
  return'';
};
const ph=(t,a,b)=>'data:image/svg+xml;utf8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${cssColor(a,'#0ea5e9')}"/><stop offset="1" stop-color="${cssColor(b,'#1e3a8a')}"/></linearGradient></defs><rect width="640" height="360" fill="url(#g)"/><circle cx="540" cy="50" r="130" fill="#fff" opacity=".08"/><circle cx="80" cy="330" r="160" fill="#fff" opacity=".07"/><text x="320" y="198" font-family="Arial,sans-serif" font-size="44" font-weight="700" fill="#fff" text-anchor="middle">${String(t||'').replace(/[<>&"']/g,'')}</text></svg>`);
const resolveSrc=u=>{u=String(u||'');if(u.slice(0,3)==='ph:'){const p=u.slice(3).split('|');return ph(p[0],p[1],p[2])}return safeUrl(u,true)};
const isVideo=u=>/\.(mp4|webm|mov|m4v|ogv)(\?|#|$)/i.test(String(u||''));
const store=o=>({get:k=>{try{return o.getItem(k)}catch(e){return null}},set:(k,v)=>{try{o.setItem(k,v)}catch(e){}},del:k=>{try{o.removeItem(k)}catch(e){}},json:k=>{try{return JSON.parse(o.getItem(k))}catch(e){return null}}});
let _ls,_ss;
try{_ls=W.localStorage}catch(e){_ls={getItem(){return null},setItem(){},removeItem(){}}}
try{_ss=W.sessionStorage}catch(e){_ss={getItem(){return null},setItem(){},removeItem(){}}}
const LS=store(_ls),SS=store(_ss);

/* ---------- ikon ---------- */
const ICONS={
  whatsapp:{bg:'#25D366',fill:1,p:'<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>'},
  tiktok:{bg:'#000000',fill:1,p:'<path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>'},
  link:{p:'<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'},
  star:{p:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>'},
  user:{p:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>'},
  users:{p:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><circle cx="17" cy="9" r="2.8"/><path d="M17 14c2.8 0 4.5 1.9 4.5 5"/>'},
  crown:{p:'<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/>'},
  globe:{p:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>'},
  play:{p:'<path d="M8 5l11 7-11 7z"/>'},
  heart:{p:'<path d="M12 20s-7.5-4.4-9-9.2C1.8 7 4.2 4 7.2 4c2 0 3.6 1.1 4.8 3 1.2-1.9 2.8-3 4.8-3 3 0 5.4 3 4.2 6.8C19.5 15.6 12 20 12 20z"/>'},
  bolt:{p:'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>'},
  flame:{p:'<path d="M12 22c4 0 7-2.9 7-7 0-3-1.6-5-3-6.5-.3 1.7-1.2 2.7-2.3 3C14 8 12.8 4.5 10 2c.2 3.5-1.5 5.3-3 7.2C5.600 11 5 12.700 5 15c0 4.100 3 7 7 7z"/>'},
  chat:{p:'<path d="M21 12a8 8 0 0 1-11.700 7L3 21l2-5.300A8 8 0 1 1 21 12z"/>'},
  gift:{p:'<rect x="3" y="8" width="18" height="4"/><path d="M5 12v9h14v-9M12 8v13M12 8c-3 0-5-1-5-3s3-2.500 5 3zM12 8c3 0 5-1 5-3s-3-2.500-5 3z"/>'},
  trophy:{p:'<path d="M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3M12 14v4M8 21h8M10 18h4"/>'},
  shield:{p:'<path d="M12 3l8 3v6c0 5-3.500 8-8 9-4.500-1-8-4-8-9V6z"/>'},
  send:{p:'<path d="M21 3L10 14M21 3l-7 18-4-7-7-4z"/>'},
  mail:{p:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>'}
};
const ICON_NAMES=Object.keys(ICONS);
const svgIcon=name=>{const i=ICONS[name]||ICONS.link;return i.fill?`<svg viewBox="0 0 24 24" fill="currentColor">${i.p}</svg>`:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${i.p}</svg>`};
const iconEl=(name,bg)=>{
  name=String(name||'link').trim();
  const wrap=h('span',{class:'ic'});
  if(ICONS[name]){wrap.innerHTML=svgIcon(name);wrap.style.background=bg||ICONS[name].bg||'rgba(255,255,255,.18)'}
  else if(/^(https?:|data:image|ph:)/i.test(name)||/\.(png|jpe?g|webp|gif|svg)$/i.test(name)){const u=resolveSrc(name);if(u)wrap.append(h('img',{src:u,alt:'',draggable:'false'}))}
  else{wrap.textContent=name.slice(0,4);wrap.style.background=bg||'rgba(255,255,255,.18)'}
  return wrap;
};

/* ---------- data default ---------- */
const LOGO='igneel-ACETE-MARGA.webp';
const NS_DEFAULT='igneeldragons-7280448b56';
const WA='https://chat.whatsapp.com/KZiJCR4TnGyDUHEzwAFzHa?s=cl&p=a&mlu=4&ilr=4';
const TT='https://tiktok.com/@anime.creator.tensura';
const SEL='https://seleksi.marga-act.my.id';
const DEF={
  theme:{title:'MARGA ACT',bgMode:'gradient',bg1:'#050b18',bg2:'#0b3a66',bgAngle:165,bgImage:'',text:'#ffffff',accent:'#38bdf8',neon:'#38bdf8',font:'Poppins',fs:15,mw:480,radius:18,cardColor:'#808080',cardOpacity:50,btnStyle:'glass',b1:'#0ea5e9',b2:'#2563eb',btnText:'#ffffff',shine:true,shineEvery:3.4,fx:'particles',fxColor:'#7dd3fc',fxCount:36},
  loader:{bg:'#ffffff',media:'rimuru_gif.gif',size:132,bar:'#111111',track:'#e5e7eb',text:'loading',color:'#111111',minMs:1500},
  blocks:[
    {id:'b_hero',type:'hero',banner:LOGO,blur:14,overlay:35,ratio:'16/9',logo:LOGO,logoSize:120,logoPos:'center',ring:'pulse',logoBorder:'#ffffff',anim:'fade',mt:0},
    {id:'b_title',type:'title',text:'MARGA ACT',badge:true,badgeColor:'#38bdf8',size:26,weight:'800',spacing:1,glow:0,anim:'swipeUp',delay:100,mt:16},
    {id:'b_desc',type:'desc',lines:['Selamat datang di MARGA ACT 🐉\nKomunitas yang tumbuh bareng — yuk gabung dan ikuti seleksinya!'],speed:38,loop:false,align:'center',size:14.5,anim:'swipeUp',delay:200},
    {id:'b_wa',type:'button',label:'Gabung Group Seleksi',sub:'Masuk ke WhatsApp Group',url:WA,icon:'whatsapp',style:'theme',anim:'swipeUp',delay:300,track:true},
    {id:'b_sel',type:'button',label:'Seleksi Disini',sub:'seleksi.marga-act.my.id',url:SEL,icon:'trophy',style:'theme',anim:'swipeUp',delay:360,track:true},
    {id:'b_tt',type:'button',label:'Official TikTok Marga',sub:'@anime.creator.tensura',url:TT,icon:'tiktok',style:'theme',anim:'swipeUp',delay:480,track:true},
    {id:'b_sl',type:'slider',auto:0,arrows:true,dots:true,ratio:'16/9',anim:'swipeUp',mt:22,slides:[
      {img:'https://files.catbox.moe/81lq7d.jpg',title:'Pemilik Group',desc:'Kenalan dengan pemilik group MARGA ACT.',btn:'Chat Pemilik',url:TT,icon:'tiktok'},
      {img:'ph:Admin & Staff|#8b5cf6|#312e81',title:'Admin & Staff',desc:'Tim admin yang siap bantu kamu.',btn:'Hubungi Admin',url:TT,icon:'tiktok'},
      {img:'ph:Info Seleksi|#06b6d4|#0f172a',title:'Info Seleksi',desc:'Cek alur dan syarat seleksi sebelum bergabung.',btn:'Gabung Seleksi',url:TT,icon:'tiktok'},
      {img:'ph:Aturan Group|#f59e0b|#7c2d12',title:'Aturan Group',desc:'Baca aturan biar nyaman bareng-bareng.',btn:'Lihat Aturan',url:TT,icon:'tiktok'},
      {img:'ph:Official TikTok|#ec4899|#4c0519',title:'Official TikTok',desc:'Ikuti konten terbaru kami di TikTok.',btn:'Buka TikTok',url:TT,icon:'tiktok'}
    ]}
  ]
};

/* ---------- state ---------- */
const S={site:null,rec:null,meta:{},authed:false,locked:false,binInfo:[]};
const validBin=b=>/^[A-Za-z0-9]{12,40}$/.test(b||'');
const nsOf=()=>(S.meta&&S.meta.ns)||NS_DEFAULT;

/* ---------- konfigurasi bin: ARRAY {id,key} dari <script id="igneel-config"> ---------- */
const getBins=()=>{
  let a=[];
  try{const e=D.getElementById('igneel-config');const j=e?JSON.parse(e.textContent):{};a=Array.isArray(j.bins)?j.bins:[]}catch(e){}
  a=a.map(x=>typeof x==='string'?{id:x}:x).filter(x=>x&&validBin(String(x.id||'').trim())).map(x=>({id:String(x.id).trim(),key:String(x.key||'').trim()}));
  if(!a.length&&validBin(LS.get('ig_bin')))a=[{id:LS.get('ig_bin'),key:''}];
  const seen={};return a.filter(x=>seen[x.id]?false:(seen[x.id]=1));
};
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
/* key TULIS: hanya di perangkat admin (localStorage), tidak pernah di source */
const wkeys=()=>LS.json('ig_keys')||{};
const wkeyOf=id=>wkeys()[id]||'';
const hasAllKeys=()=>{const b=getBins();return b.length>0&&b.every(x=>wkeyOf(x.id))};
function setKeysFromText(txt){
  const bins=getBins(),lines=String(txt||'').split(/\r?\n/).map(s=>s.trim()).filter(Boolean),m=wkeys();
  const pairs=lines.map(l=>{const i=l.indexOf(':');return i>0&&validBin(l.slice(0,i))?[l.slice(0,i),l.slice(i+1).trim()]:[null,l]});
  pairs.forEach((p,i)=>{
    if(p[0]){m[p[0]]=p[1];return}
    if(lines.length===1)bins.forEach(b=>{m[b.id]=p[1]});
    else if(bins[i])m[bins[i].id]=p[1];
  });
  LS.set('ig_keys',JSON.stringify(m));
  return bins.filter(b=>m[b.id]).length;
}

function normalize(rec){
  const site=(rec&&rec.site)||{};
  return{
    theme:Object.assign(clone(DEF.theme),site.theme||{}),
    loader:Object.assign(clone(DEF.loader),site.loader||{}),
    blocks:(Array.isArray(site.blocks)?site.blocks:clone(DEF.blocks)).filter(b=>b&&typeof b==='object'&&b.type).map(b=>Object.assign({id:'b_'+uid()},b))
  };
}

/* ---------- JSONBin (multi-bin: baca acak + failover, simpan ke semua) ---------- */
const BINAPI='https://api.jsonbin.io/v3/b/';
async function readBin(b){
  const r=await tmo(fetch(`${BINAPI}${b.id}/latest?meta=false`,{cache:'no-store',headers:b.key?{'X-Access-Key':b.key}:{}}),9000);
  if(!r.ok)throw new Error('http '+r.status);
  let rec=await r.json();
  if(rec&&rec.record&&!rec.site)rec=rec.record;
  if(!rec||typeof rec!=='object')throw new Error('format');
  return rec;
}
const cacheRec=rec=>LS.set('ig_cfg',JSON.stringify({t:Date.now(),rec:Object.assign({},rec,{admin:undefined})}));
async function loadRec(fresh){
  const bins=getBins(),c=LS.json('ig_cfg');
  if(!bins.length)return null;
  if(!fresh){
    if(c&&Date.now()-c.t<300000)return c.rec;
    for(const b of shuffle(bins)){try{const rec=await readBin(b);cacheRec(rec);return rec}catch(e){}}
    return c?c.rec:null;
  }
  /* admin: baca SEMUA bin, pakai yang paling baru, laporkan status tiap bin */
  const res=await Promise.all(bins.map((b,i)=>readBin(b).then(rec=>({i,id:b.id,ok:1,rec}),e=>({i,id:b.id,ok:0,err:e.message}))));
  S.binInfo=res.map(r=>({id:r.id,ok:r.ok,err:r.err,updated:r.ok&&r.rec.meta&&r.rec.meta.updated||''}));
  const good=res.filter(r=>r.ok);
  if(!good.length)throw new Error(res.map(r=>`bin ${r.i+1}: ${r.err}`).join(', '));
  good.sort((a,b)=>String(b.rec.meta&&b.rec.meta.updated||'').localeCompare(String(a.rec.meta&&a.rec.meta.updated||'')));
  return good[0].rec;
}
const friendly=(st,m)=>st===401||st===403?(m||'Key ditolak (butuh izin Update)'):st===404?'Bin tidak ditemukan':st===429?'Terlalu banyak permintaan':`HTTP ${st} ${m||''}`;
async function putBin(b,body){
  const key=wkeyOf(b.id);
  if(!key)return{ok:0,err:'Access Key belum diisi'};
  const go=hd=>tmo(fetch(BINAPI+b.id,{method:'PUT',headers:Object.assign({'Content-Type':'application/json'},hd),body}),15000);
  try{
    let r=await go({'X-Access-Key':key});
    if(r.status===401||r.status===403)r=await go({'X-Master-Key':key});
    if(!r.ok){let m='';try{m=(await r.json()).message||''}catch(e){}return{ok:0,err:friendly(r.status,m)}}
    return{ok:1};
  }catch(e){return{ok:0,err:e.message}}
}
async function saveRec(rec){
  const bins=getBins();
  if(!bins.length)throw new Error('Bin ID belum diisi.');
  const body=JSON.stringify(rec);
  if(body.length>99000)throw new Error(`Data ${(body.length/1024).toFixed(1)} KB, melewati batas 100 KB JSONBin gratis. Pakai URL gambar / file di repo, bukan upload besar.`);
  const results=await Promise.all(bins.map(b=>putBin(b,body)));
  const okN=results.filter(r=>r.ok).length;
  if(!okN)throw new Error(results.map((r,i)=>(bins.length>1?`Bin ${i+1}: `:'')+r.err).join(' • '));
  cacheRec(rec);S.rec=rec;
  S.binInfo=bins.map((b,i)=>({id:b.id,ok:results[i].ok,err:results[i].err,updated:rec.meta&&rec.meta.updated||''}));
  return{n:body.length,ok:okN,total:bins.length,fail:results.map((r,i)=>r.ok?null:`Bin ${i+1}: ${r.err}`).filter(Boolean)};
}

/* ---------- login (PBKDF2, tanpa password polos) ---------- */
const enc=new TextEncoder();
const toHex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
const fromHex=s=>Uint8Array.from(s.match(/../g)||[],x=>parseInt(x,16));
async function pbkdf(pass,saltHex,it){
  const k=await crypto.subtle.importKey('raw',enc.encode(pass),'PBKDF2',false,['deriveBits']);
  return toHex(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:fromHex(saltHex),iterations:it},k,256));
}
async function makeAdmin(user,pass){
  const salt=toHex(crypto.getRandomValues(new Uint8Array(16))),it=150000;
  return{user:user.trim(),salt,it,hash:await pbkdf(pass,salt,it)};
}
async function checkAdmin(a,user,pass){return!!(a&&a.hash&&user.trim()===a.user&&await pbkdf(pass,a.salt,a.it||150000)===a.hash)}

/* ---------- statistik asli (Abacus counter, hit nyata) ---------- */
const AB='https://abacus.jasoncameron.dev';
const dayKey=(d=new Date())=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jakarta'}).format(d).replace(/-/g,'');
const cleanKey=k=>String(k).replace(/[^A-Za-z0-9-]/g,'');
async function cHit(k){try{const r=await fetch(`${AB}/hit/${nsOf()}/${cleanKey(k)}`,{keepalive:true});return r.ok?(await r.json()).value:null}catch(e){return null}}
async function cGet(k){try{const r=await tmo(fetch(`${AB}/get/${nsOf()}/${cleanKey(k)}`),8000);if(r.status===404)return 0;return r.ok?(await r.json()).value:null}catch(e){return null}}
function countVisit(){
  if(S.authed||S.locked||LS.get('ig_own')||navigator.webdriver)return;
  if(!SS.get('ig_v')){SS.set('ig_v','1');cHit('v-total');cHit('v-d'+dayKey())}
  if(!LS.get('ig_u')){LS.set('ig_u','1');cHit('v-unique')}
}
const trackClick=id=>{if(!S.authed&&!S.locked&&!LS.get('ig_own'))cHit('c-'+id)};

/* ---------- penjaga anti-ambil-source ---------- */
const G={on:false};
const isDev=/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)||location.protocol==='file:';
function wipe(){
  const css='html,body{margin:0;height:100%;background:#0a4bd6;overflow:hidden}body{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;font-size:0;color:transparent;padding:24px}body::before{content:"JANGAN JAHIL AMBIL SOURCE CODE INI BOS!";font:800 clamp(20px,5.2vw,46px)/1.25 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#fff;letter-spacing:.5px}body::after{content:"Powered By - igneel dragons ACT";font:600 clamp(12px,2.6vw,18px)/1.4 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#cfe3ff;margin-top:16px}';
  try{D.open();D.write('igneeldragons');D.close()}catch(e){}
  try{const sh=new CSSStyleSheet();sh.replaceSync(css);D.adoptedStyleSheets=[sh]}catch(e){const st=D.createElement('style');st.textContent=css;(D.head||D.documentElement).append(st)}
}
function lock(){
  if(G.on||S.authed||isDev)return;
  G.on=true;S.locked=true;
  wipe();
  /* respons 403 asli dari server (lihat vercel.json) supaya tampil di tab Network */
  ['/igneeldragons/403','/igneeldragons/app.js','/igneeldragons/style.css','/igneeldragons/data.json'].forEach(p=>{try{fetch(p,{cache:'no-store'}).catch(()=>{})}catch(e){}});
  setInterval(()=>{const ok=D.body&&D.body.textContent==='igneeldragons'&&((D.adoptedStyleSheets&&D.adoptedStyleSheets.length)||D.querySelector('style'));if(!ok)wipe()},500);
}
function startGuard(){
  if(isDev)return;
  let strikes=0;
  const test=()=>{
    if(S.authed||G.on)return;
    let bad=false;
    try{const t=performance.now();(function(){debugger})();if(performance.now()-t>120)bad=true}catch(e){}
    try{let hit=false;const el=new Image();Object.defineProperty(el,'id',{get(){hit=true;return''}});console.log(el);if(hit)bad=true}catch(e){}
    strikes=bad?strikes+1:0;
    if(strikes>=2)lock();
  };
  setInterval(test,900);
  ['resize','focus','visibilitychange'].forEach(ev=>W.addEventListener(ev,test));
  D.addEventListener('contextmenu',e=>{if(!S.authed)e.preventDefault()});
  D.addEventListener('keydown',e=>{
    if(S.authed)return;
    const k=(e.key||'').toLowerCase(),c=e.ctrlKey||e.metaKey,one=k.length===1;
    if(e.key==='F12'||(one&&c&&e.shiftKey&&'ijck'.includes(k))||(one&&c&&'us'.includes(k))||(one&&e.metaKey&&e.altKey&&'ijc'.includes(k))){e.preventDefault();lock()}
  },true);
}
