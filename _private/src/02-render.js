
/* =====================================================================
   RENDERER — dipakai halaman publik DAN preview editor
   ===================================================================== */
const ANIMS=[['swipeUp','Swipe up'],['fade','Fade'],['zoom','Zoom'],['left','Dari kiri'],['right','Dari kanan'],['flip','Flip'],['bounce','Bounce'],['none','Tanpa animasi']];
const ANIM_OK=ANIMS.map(a=>a[0]);
const RATIOS=[['16/9','16:9'],['21/9','21:9'],['4/3','4:3'],['1/1','1:1'],['4/5','4:5'],['9/16','9:16']];
const ratioOk=v=>/^\d{1,2}\/\d{1,2}$/.test(v)?v:'16/9';
const FONTS=[['Poppins','400;600;700;800'],['Inter','400;600;700;800'],['Montserrat','400;600;700;800'],['Nunito','400;700;800'],['Outfit','400;600;700;800'],['Kanit','400;600;700;800'],['Space Grotesk','400;500;700'],['Quicksand','400;600;700'],['Rajdhani','500;600;700'],['Orbitron','400;700;900'],['Playfair Display','400;700;800'],['Bebas Neue',''],['Righteous',''],['Audiowide',''],['Bangers',''],['Pacifico',''],['Lobster',''],['Press Start 2P','']];
const CHEV='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>';
const SPARK='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z"/></svg>';
const BADGE='<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="11.5" fill="currentColor"/><path d="M7.2 12.6l3.2 3.2 6.4-6.8" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const toLines=b=>{const l=Array.isArray(b.lines)?b.lines.map(String):[String(b.lines||'')];return l.length?l:['']};
const imgEl=(u,o)=>{
  o=o||{};
  const src=resolveSrc(u)||ph(o.ph||'',o.a,o.b);
  const i=h('img',{src,alt:o.alt||'',draggable:'false',decoding:'async'});
  if(o.lazy)i.loading='lazy';
  i.addEventListener('error',()=>{if(!i.dataset.fb){i.dataset.fb='1';i.src=ph(o.ph||'',o.a,o.b)}});
  return i;
};
const mediaEl=(u,o,play)=>{
  const v=safeUrl(u,true);
  if(v&&isVideo(v)){const e=h('video',{playsinline:'',preload:play?'auto':'metadata'});e.muted=e.defaultMuted=true;e.loop=true;e.src=v;if(play){e.autoplay=true;e.play&&e.play().catch(()=>{})}return e}
  return imgEl(u,o);
};
const embedUrl=u=>{
  u=String(u||'').trim();if(!/^https:\/\//i.test(u))return'';
  let m=u.match(/youtube\.com\/watch\?v=([\w-]{6,})/i)||u.match(/youtu\.be\/([\w-]{6,})/i);
  if(m)return'https://www.youtube.com/embed/'+m[1];
  return u;
};
const tapper=(n,ms,fn)=>{let t=[];return()=>{const now=Date.now();t=t.filter(x=>now-x<ms);t.push(now);if(t.length>=n){t=[];fn()}}};

/* ---------- animasi ngetik ---------- */
function typeInto(box,lines,o){
  const ty=$('.ty',box),cur=h('span',{class:'cur'});
  if(box._stop)box._stop();
  let alive=true,timer;
  box._stop=()=>{alive=false;clearTimeout(timer)};
  if(o.still||(W.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)){ty.textContent=lines[0]||'';ty.append(cur);return}
  let li=0;const sp=clamp(o.speed||40,8,200);
  const run=()=>{
    if(!alive)return;
    const full=lines[li%lines.length]||'';let i=0;
    const tick=()=>{
      if(!alive)return;
      ty.textContent=full.slice(0,i);ty.append(cur);
      if(i<full.length){i++;timer=setTimeout(tick,sp*(.55+Math.random()*.9))}
      else if(o.loop){timer=setTimeout(erase,1900)}
    };
    const erase=()=>{
      if(!alive)return;let j=full.length;
      const d=()=>{if(!alive)return;j-=2;ty.textContent=full.slice(0,Math.max(j,0));ty.append(cur);if(j>0)timer=setTimeout(d,16);else{li++;timer=setTimeout(run,350)}};
      d();
    };
    tick();
  };
  run();
}

/* ---------- tombol (dipakai blok button & slider) ---------- */
function btnEl(o,ctx,idx,trackId,extra){
  const t=ctx.site.theme,own=o.style&&o.style!=='theme';
  const st=own?o.style:t.btnStyle;
  const shine=t.shine!==false&&o.shine!==false;
  const a=h('a',{class:'btn'+(shine?' shine':' noshine'),'data-st':['glass','solid','outline','neon'].includes(st)?st:'glass',href:safeUrl(o.url)||'#',rel:'noopener noreferrer'});
  if(o.newTab!==false)a.target='_blank';
  a.style.setProperty('--b1',cssColor(own?o.c1:t.b1,'#0ea5e9'));
  a.style.setProperty('--b2',cssColor(own?o.c2:t.b2,'#2563eb'));
  a.style.setProperty('--bt',cssColor(own&&o.tc?o.tc:t.btnText,'#fff'));
  a.style.setProperty('--sd',((idx||0)*.8)+'s');
  const txt=h('span',{class:'bt'},h('b',null,o.label||o.btn||'Tombol'));
  if(o.sub)txt.append(h('small',null,o.sub));
  if(extra&&extra.center){a.style.justifyContent='center';a.append(txt)}
  else a.append(iconEl(o.icon,o.iconBg),txt,h('span',{class:'go',html:CHEV}));
  a.append(h('span',{class:'sp',html:SPARK}));
  if(trackId&&o.track!==false)a.addEventListener('click',()=>trackClick(trackId));
  return a;
}

/* ---------- registry blok + skema field editor ---------- */
const F={
  t:(k,l,o)=>Object.assign({k,t:'text',l},o),
  a:(k,l,o)=>Object.assign({k,t:'area',l},o),
  ml:(k,l)=>({k,t:'multi',l}),
  u:(k,l)=>({k,t:'url',l}),
  m:(k,l)=>({k,t:'media',l}),
  c:(k,l)=>({k,t:'color',l}),
  r:(k,l,min,max,step,d)=>({k,t:'range',l,min,max,step:step||1,d}),
  s:(k,l,o)=>({k,t:'select',l,o}),
  b:(k,l,d)=>({k,t:'bool',l,d:!!d}),
  i:(k,l)=>({k,t:'icon',l}),
  ls:(k,l,f,def,title)=>({k,t:'list',l,f,def,title})
};
const WEIGHTS=[['400','Normal'],['600','Semi'],['700','Bold'],['800','Extra bold'],['900','Black']];
const BSTYLES=[['theme','Ikut tema'],['glass','Glass'],['solid','Solid gradien'],['outline','Outline'],['neon','Neon']];
const ALIGNS=[['left','Kiri'],['center','Tengah'],['right','Kanan']];
const COMMON={g:'Animasi & tata letak',f:[F.s('anim','Animasi masuk',ANIMS),F.r('delay','Jeda mulai (ms)',0,2500,50,0),F.r('dur','Durasi (ms)',200,2500,50,750),F.r('mt','Jarak atas (px)',0,120,1,14),F.r('mb','Jarak bawah (px)',0,120,1,0),F.r('op','Opasitas (%)',10,100,1,100),F.b('hide','Sembunyikan blok')]};
const BTN_FIELDS=[F.t('label','Teks tombol'),F.t('sub','Teks kecil (opsional)'),F.u('url','Link / URL'),F.i('icon','Ikon'),F.s('style','Gaya tombol',BSTYLES),F.c('c1','Warna 1 (gaya non-tema)'),F.c('c2','Warna 2 (gaya non-tema)'),F.c('tc','Warna teks'),F.b('shine','Kilau putih (cling)',1),F.b('newTab','Buka di tab baru',1),F.b('track','Hitung klik (statistik)',1)];

const BLK={
  hero:{name:'Banner + Logo',ico:'🖼️',desc:'Banner 16:9 + logo bulat',def:{banner:LOGO,blur:14,overlay:35,ratio:'16/9',logo:LOGO,logoSize:120,logoPos:'center',ring:'pulse',logoBorder:'#ffffff'},
    fields:[{g:'Banner',f:[F.m('banner','Gambar banner'),F.s('ratio','Rasio',RATIOS),F.r('blur','Blur (px)',0,40),F.r('overlay','Gelapkan (%)',0,95)]},
            {g:'Logo bulat',f:[F.m('logo','Gambar logo'),F.r('logoSize','Ukuran (px)',60,240),F.s('logoPos','Posisi',[['center','Tengah banner'],['bottom','Menumpuk di bawah banner']]),F.s('ring','Efek cincin',[['none','Tanpa'],['pulse','Pulse'],['spin','Berputar']]),F.c('logoBorder','Warna border')]},COMMON],
    render(b,ctx){
      const root=h('div',{class:'hero','data-pos':b.logoPos==='bottom'?'bottom':'center'});
      root.style.setProperty('--ls',clamp(b.logoSize||120,60,240)+'px');
      const bn=h('div',{class:'hero-bn'});
      bn.style.setProperty('--ratio',ratioOk(b.ratio));bn.style.setProperty('--bl',clamp(b.blur,0,40)+'px');bn.style.setProperty('--ov',clamp(b.overlay==null?30:b.overlay,0,95)/100);
      bn.append(imgEl(b.banner,{ph:'',a:'#0b3a66',b:'#050b18'}));
      const logo=h('div',{class:'logo','data-ring':['spin','pulse'].includes(b.ring)?b.ring:'none',role:'img','aria-label':'Logo'});
      logo.style.setProperty('--lb',cssColor(b.logoBorder,'#fff'));
      logo.append(imgEl(b.logo,{ph:'ACT',a:'#0ea5e9',b:'#1e3a8a'}));
      if(!ctx.opt.preview)logo.addEventListener('click',tapper(3,1400,()=>openAdmin()));
      root.append(bn,logo);return root;
    }},
  title:{name:'Judul + centang',ico:'🔠',desc:'Nama + badge centang biru',def:{text:'Judul Baru',badge:true,badgeColor:'#38bdf8',size:26,weight:'800',spacing:1,glow:0},
    fields:[{g:'Teks',f:[F.t('text','Teks judul'),F.r('size','Ukuran (px)',12,72),F.s('weight','Ketebalan',WEIGHTS),F.r('spacing','Jarak huruf (px)',-1,12,.5),F.r('glow','Cahaya (px)',0,30),F.c('color','Warna teks (kosong = tema)')]},
            {g:'Centang',f:[F.b('badge','Tampilkan centang',1),F.c('badgeColor','Warna centang')]},COMMON],
    render(b){
      const el=h('div',{class:'ttl'},h('span',null,b.text||''));
      el.style.setProperty('--sz',clamp(b.size||26,12,72)+'px');el.style.setProperty('--wt',String(b.weight||800).replace(/\D/g,'')||'800');
      el.style.setProperty('--sp',(Number(b.spacing)||0)+'px');el.style.setProperty('--gl',clamp(b.glow,0,30)+'px');
      if(b.color)el.style.color=cssColor(b.color,'');
      if(b.badge!==false){const v=h('span',{class:'vb',html:BADGE});v.style.color=cssColor(b.badgeColor,'#38bdf8');el.append(v)}
      return el;
    }},
  desc:{name:'Deskripsi (ngetik)',ico:'⌨️',desc:'Kotak abu transparan + animasi ngetik',def:{lines:['Tulis deskripsi kamu di sini...'],speed:40,loop:false,align:'center',size:14.5},
    fields:[{g:'Isi',f:[F.ml('lines','Teks (pisahkan dengan baris ---  untuk teks bergantian)'),F.r('speed','Kecepatan ngetik (ms/huruf)',10,150),F.b('loop','Ulang terus (hapus lalu ketik teks berikutnya)'),F.s('align','Rata teks',ALIGNS),F.r('size','Ukuran huruf (px)',11,26,.5),F.c('color','Warna teks (kosong = tema)')]},COMMON],
    render(b,ctx){
      const lines=toLines(b),longest=lines.reduce((a,c)=>c.length>a.length?c:a,'');
      const el=h('div',{class:'desc'},h('span',{class:'gh'},longest||' '),h('span',{class:'ty'}));
      el.style.setProperty('--sz',clamp(b.size||14.5,11,26)+'px');el.style.setProperty('--al',['left','center','right'].includes(b.align)?b.align:'center');
      if(b.color)el.style.setProperty('--c',cssColor(b.color,'inherit'));
      el._go=()=>typeInto(el,lines,{speed:b.speed,loop:b.loop,still:ctx.opt.preview&&!ctx.opt.play});
      return el;
    }},
  button:{name:'Tombol link',ico:'🔗',desc:'Tombol URL + ikon + kilau',def:{label:'Tombol Baru',sub:'',url:'https://',icon:'link',style:'theme',track:true,shine:true,newTab:true},
    fields:[{g:'Tombol',f:BTN_FIELDS},COMMON],
    render(b,ctx){const w=h('div',{class:'bw'});w.append(btnEl(b,ctx,ctx.i,b.id));return w}},
  slider:{name:'Slider gambar',ico:'🎞️',desc:'Slide gambar + deskripsi + tombol',def:{auto:0,arrows:true,dots:true,ratio:'16/9',slides:[{img:'ph:Slide Baru|#0ea5e9|#1e3a8a',title:'Judul Slide',desc:'Deskripsi singkat.',btn:'Buka Link',url:'https://',icon:'link'}]},
    fields:[{g:'Slider',f:[F.s('ratio','Rasio gambar',RATIOS),F.r('auto','Geser otomatis (detik, 0 = mati)',0,15),F.b('arrows','Tombol panah  ›',1),F.b('dots','Titik indikator',1),F.c('neon','Warna neon judul (kosong = tema)')]},
            {g:'Slide',f:[F.ls('slides','Daftar slide',[F.m('img','Gambar / GIF / video (URL .mp4 .webm)'),F.t('title','Judul neon'),F.a('desc','Deskripsi pendek'),F.t('btn','Teks tombol'),F.u('url','Link tombol'),F.i('icon','Ikon tombol')],{img:'ph:Slide Baru|#0ea5e9|#1e3a8a',title:'Judul Slide',desc:'Deskripsi singkat.',btn:'Buka Link',url:'https://',icon:'link'},s=>s.title||'Slide')]},COMMON],
    render(b,ctx){
      const slides=Array.isArray(b.slides)?b.slides:[];
      const root=h('div',{class:'slider'}),track=h('div',{class:'sl-track'});
      root.style.setProperty('--ratio',ratioOk(b.ratio));root.style.setProperty('--ng',cssColor(b.neon,ctx.site.theme.neon||'#38bdf8'));
      let cur=0;
      const go=i=>{const n=slides.length;if(!n)return;i=(i+n)%n;const s=track.children[i];if(s)track.scrollTo({left:s.offsetLeft-track.offsetLeft,behavior:'smooth'})};
      slides.forEach((s,i)=>{
        const im=h('div',{class:'sl-img'},mediaEl(s.img,{ph:s.title||'',lazy:i>0,alt:s.title||''},i===0));
        if(b.arrows!==false&&slides.length>1)im.append(h('button',{class:'sl-nav p',type:'button','aria-label':'Sebelumnya',onclick:e=>{e.stopPropagation();go(i-1)}},'‹'),h('button',{class:'sl-nav n',type:'button','aria-label':'Berikutnya',onclick:e=>{e.stopPropagation();go(i+1)}},'›'));
        const card=h('div',{class:'sl-card'},h('h3',{class:'neon'},s.title||''));
        if(s.desc)card.append(h('p',null,s.desc));
        if(s.btn)card.append(btnEl({label:s.btn,url:s.url,icon:s.icon,style:'theme',track:true},ctx,i,b.id+'s'+(i+1)));
        track.append(h('article',{class:'slide'},im,card));
      });
      root.append(track);
      let dots=null;
      if(b.dots!==false&&slides.length>1){dots=h('div',{class:'dots'},slides.map((_,i)=>h('i',{class:i?'':'on',onclick:()=>go(i)})))}
      if(dots)root.append(dots);
      let raf=0;
      track.addEventListener('scroll',()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{const sw=track.children[1]?track.children[1].offsetLeft-track.children[0].offsetLeft:track.clientWidth;cur=Math.round(track.scrollLeft/Math.max(sw,1));$$('video',track).forEach(v=>{const on=v.closest('.slide')===track.children[cur];if(on)v.play&&v.play().catch(()=>{});else v.pause()});if(dots)[...dots.children].forEach((d,i)=>d.classList.toggle('on',i===cur))})},{passive:true});
      const auto=clamp(b.auto,0,15);
      if(auto>0&&slides.length>1&&!ctx.opt.preview){let tm=setInterval(()=>go(cur+1),auto*1000);const pause=()=>{clearInterval(tm);tm=setInterval(()=>go(cur+1),auto*1000+6000)};track.addEventListener('pointerdown',pause);root._stop=()=>clearInterval(tm)}
      return root;
    }},
  text:{name:'Teks',ico:'📝',desc:'Paragraf teks bebas',def:{text:'Tulis teks di sini...',size:15,align:'center',weight:'400'},
    fields:[{g:'Teks',f:[F.a('text','Isi teks'),F.r('size','Ukuran (px)',10,40,.5),F.s('weight','Ketebalan',WEIGHTS),F.s('align','Rata teks',ALIGNS),F.c('color','Warna (kosong = tema)')]},COMMON],
    render(b){const el=h('div',{class:'txt'},b.text||'');el.style.setProperty('--sz',clamp(b.size||15,10,40)+'px');el.style.setProperty('--wt',String(b.weight||400).replace(/\D/g,'')||'400');el.style.setProperty('--al',['left','center','right'].includes(b.align)?b.align:'center');if(b.color)el.style.setProperty('--c',cssColor(b.color,'inherit'));return el}},
  image:{name:'Gambar',ico:'🌄',desc:'Gambar (bisa jadi link)',def:{src:'ph:Gambar|#0ea5e9|#1e3a8a',link:'',ratio:'auto',fit:'cover',radius:18,shadow:true},
    fields:[{g:'Gambar',f:[F.m('src','Gambar'),F.u('link','Link saat diklik (opsional)'),F.s('ratio','Rasio',[['auto','Asli']].concat(RATIOS)),F.s('fit','Pas gambar',[['cover','Penuhi (crop)'],['contain','Utuh']]),F.r('radius','Sudut bulat (px)',0,60),F.b('shadow','Bayangan')]},COMMON],
    render(b){
      const u=safeUrl(b.link);const el=h(u?'a':'div',{class:'img-b'},imgEl(b.src,{ph:'Gambar'}));
      if(u){el.href=u;el.target='_blank';el.rel='noopener noreferrer'}
      el.style.setProperty('--ratio',b.ratio&&b.ratio!=='auto'?ratioOk(b.ratio):'auto');el.style.setProperty('--fit',b.fit==='contain'?'contain':'cover');
      if(b.radius!=null)el.style.setProperty('--r',clamp(b.radius,0,60)+'px');
      if(b.shadow)el.style.boxShadow='0 12px 32px rgba(0,0,0,.4)';
      return el;
    }},
  video:{name:'Video / GIF',ico:'🎬',desc:'Video mp4/webm atau GIF',def:{src:'',poster:'',ratio:'16/9',autoplay:true,loop:true,muted:true,controls:false,radius:18},
    fields:[{g:'Video',f:[F.u('src','URL / path video (.mp4 .webm) atau GIF'),F.m('poster','Poster (gambar sebelum main)'),F.s('ratio','Rasio',[['auto','Asli']].concat(RATIOS)),F.b('autoplay','Putar otomatis (otomatis senyap)'),F.b('loop','Ulang terus',1),F.b('muted','Senyap',1),F.b('controls','Tampilkan kontrol'),F.r('radius','Sudut bulat (px)',0,60)]},COMMON],
    render(b){
      const src=safeUrl(b.src,true);const box=h('div',{class:'vid-b'});
      if(b.radius!=null)box.style.setProperty('--r',clamp(b.radius,0,60)+'px');
      box.style.setProperty('--ratio',b.ratio&&b.ratio!=='auto'?ratioOk(b.ratio):'auto');
      if(!src){box.append(imgEl('',{ph:'Video',a:'#334155',b:'#0f172a'}));return box}
      if(!isVideo(src)){box.append(imgEl(src,{ph:'Media'}));return box}
      const v=h('video',{playsinline:'',preload:'metadata'});
      v.muted=b.muted!==false||!!b.autoplay;v.defaultMuted=v.muted;v.loop=b.loop!==false;v.autoplay=!!b.autoplay;v.controls=!!b.controls;
      const p=resolveSrc(b.poster);if(p)v.poster=p;v.src=src;box.append(v);
      if(b.autoplay)v.play&&v.play().catch(()=>{});
      return box;
    }},
  embed:{name:'Embed (YouTube dll)',ico:'📺',desc:'Iframe https / YouTube',def:{url:'https://',height:315,radius:18},
    fields:[{g:'Embed',f:[F.u('url','URL https (YouTube, Spotify, peta, dll)'),F.r('height','Tinggi (px)',120,720),F.r('radius','Sudut bulat (px)',0,60)]},COMMON],
    render(b){
      const u=embedUrl(b.url);const box=h('div',{class:'emb-b'});
      box.style.setProperty('--h',clamp(b.height||315,120,720)+'px');if(b.radius!=null)box.style.setProperty('--r',clamp(b.radius,0,60)+'px');
      if(u)box.append(h('iframe',{src:u,loading:'lazy',referrerpolicy:'no-referrer',sandbox:'allow-scripts allow-same-origin allow-popups allow-presentation',allow:'autoplay; encrypted-media; picture-in-picture; fullscreen',allowfullscreen:''}));
      else box.append(h('div',{style:{padding:'28px',textAlign:'center',opacity:.7}},'Isi URL https untuk embed'));
      return box;
    }},
  links:{name:'Ikon sosial',ico:'🌐',desc:'Baris ikon bulat link',def:{size:46,gap:12,items:[{icon:'whatsapp',url:'https://'},{icon:'tiktok',url:'https://'}]},
    fields:[{g:'Ikon',f:[F.r('size','Ukuran (px)',28,80),F.r('gap','Jarak (px)',4,30),F.ls('items','Daftar ikon',[F.i('icon','Ikon'),F.u('url','Link')],{icon:'link',url:'https://'},s=>s.icon||'ikon')]},COMMON],
    render(b){
      const el=h('div',{class:'links-b'});el.style.setProperty('--sz',clamp(b.size||46,28,80)+'px');el.style.setProperty('--g',clamp(b.gap==null?12:b.gap,4,30)+'px');
      (b.items||[]).forEach(it=>{const a=h('a',{href:safeUrl(it.url)||'#',target:'_blank',rel:'noopener noreferrer','aria-label':it.icon||'link'},iconEl(it.icon));el.append(a)});
      return el;
    }},
  divider:{name:'Pembatas',ico:'➖',desc:'Garis pemisah',def:{style:'gradient',color:'#38bdf8',thick:2,width:60},
    fields:[{g:'Garis',f:[F.s('style','Gaya',[['line','Garis'],['gradient','Gradien'],['dots','Titik'],['dashed','Putus-putus']]),F.c('color','Warna'),F.r('thick','Tebal (px)',1,12),F.r('width','Lebar (%)',10,100)]},COMMON],
    render(b){const el=h('div',{class:'div-b','data-s':['line','gradient','dots','dashed'].includes(b.style)?b.style:'line'});el.style.setProperty('--c',cssColor(b.color,'#fff'));el.style.setProperty('--th',clamp(b.thick||2,1,12)+'px');el.style.setProperty('--w',clamp(b.width||60,10,100)+'%');return el}},
  spacer:{name:'Spasi kosong',ico:'↕️',desc:'Jarak kosong',def:{height:24},
    fields:[{g:'Spasi',f:[F.r('height','Tinggi (px)',4,240)]},{g:'Animasi & tata letak',f:[F.b('hide','Sembunyikan blok')]}],
    render(b){const el=h('div',{class:'sp-b'});el.style.setProperty('--h',clamp(b.height||24,4,240)+'px');return el}}
};
const BLK_TYPES=Object.keys(BLK);

const THEME_FIELDS=[
  {g:'Judul tab browser',f:[F.t('title','Judul halaman')]},
  {g:'Latar belakang',f:[F.s('bgMode','Jenis latar',[['solid','Warna solid'],['gradient','Gradien'],['image','Gambar']]),F.c('bg1','Warna 1'),F.c('bg2','Warna 2 (gradien)'),F.r('bgAngle','Sudut gradien (°)',0,360),F.m('bgImage','Gambar latar')]},
  {g:'Efek latar',f:[F.s('fx','Efek',[['none','Tanpa'],['particles','Partikel naik'],['bubbles','Gelembung'],['snow','Salju'],['stars','Bintang berkedip']]),F.c('fxColor','Warna efek'),F.r('fxCount','Jumlah partikel',0,120)]},
  {g:'Tipografi & warna',f:[F.s('font','Font',FONTS.map(f=>[f[0],f[0]])),F.r('fs','Ukuran dasar (px)',12,20,.5),F.c('text','Warna teks'),F.c('accent','Warna aksen'),F.c('neon','Warna neon')]},
  {g:'Layout & kartu',f:[F.r('mw','Lebar kolom (px)',340,760,10),F.r('radius','Sudut bulat (px)',0,40),F.c('cardColor','Warna kotak deskripsi'),F.r('cardOpacity','Opasitas kotak (%)',0,100)]},
  {g:'Tombol (default tema)',f:[F.s('btnStyle','Gaya',BSTYLES.slice(1)),F.c('b1','Warna 1'),F.c('b2','Warna 2'),F.c('btnText','Warna teks'),F.b('shine','Kilau putih (cling)',1),F.r('shineEvery','Interval kilau (detik)',1.5,8,.1)]}
];
const LOADER_FIELDS=[{g:'Loader',f:[F.c('bg','Warna latar'),F.u('media','GIF / video loop (.gif .mp4 .webm) — kosong = animasi bawaan'),F.r('size','Ukuran kotak (px)',80,240),F.c('bar','Warna progress bar'),F.c('track','Warna jalur bar'),F.t('text','Teks'),F.c('color','Warna teks'),F.r('minMs','Durasi minimum (ms)',500,6000,100)]}];

/* ---------- tema ---------- */
const fontCss=name=>{const f=FONTS.find(x=>x[0]===name);if(!f)return'';return`https://fonts.googleapis.com/css2?family=${name.replace(/ /g,'+')}${f[1]?':wght@'+f[1]:''}&display=swap`};
function loadFont(name){
  const url=fontCss(name);if(!url)return Promise.resolve();
  if(!$(`link[data-font="${name}"]`))D.head.append(h('link',{rel:'stylesheet',href:url,'data-font':name}));
  return tmo(D.fonts?D.fonts.load(`700 16px "${name}"`).then(()=>D.fonts.ready):Promise.resolve(),3500).catch(()=>{});
}
function applyTheme(stage,t){
  const s=stage.style,font=FONTS.find(f=>f[0]===t.font)?t.font:'Poppins';
  s.setProperty('--font',`'${font}',system-ui,sans-serif`);
  s.setProperty('--tx',cssColor(t.text,'#fff'));s.setProperty('--ac',cssColor(t.accent,'#38bdf8'));s.setProperty('--ng',cssColor(t.neon,'#38bdf8'));
  s.setProperty('--fs',clamp(t.fs||15,12,20)+'px');s.setProperty('--mw',clamp(t.mw||480,340,760)+'px');s.setProperty('--r',clamp(t.radius==null?18:t.radius,0,40)+'px');
  s.setProperty('--card',rgba(cssColor(t.cardColor,'#808080').charAt(0)==='#'?t.cardColor:'#808080',clamp(t.cardOpacity==null?50:t.cardOpacity,0,100)/100));
  s.setProperty('--b1',cssColor(t.b1,'#0ea5e9'));s.setProperty('--b2',cssColor(t.b2,'#2563eb'));s.setProperty('--bt',cssColor(t.btnText,'#fff'));
  s.setProperty('--se',clamp(t.shineEvery||3.4,1.5,8)+'s');
  const c1=cssColor(t.bg1,'#050b18'),c2=cssColor(t.bg2,'#0b3a66');let bg=c1;
  if(t.bgMode==='gradient')bg=`linear-gradient(${clamp(t.bgAngle,0,360)}deg,${c1},${c2})`;
  else if(t.bgMode==='image'){const u=resolveSrc(t.bgImage).replace(/["\\)\n\r]/g,'');if(u)bg=`url("${u}") center/cover no-repeat fixed,${c1}`}
  s.setProperty('--bg',bg);
}

/* ---------- efek latar (canvas) ---------- */
function mountFx(bg,t,stage){
  const mode=t.fx,n=clamp(t.fxCount,0,120);
  if(!mode||mode==='none'||!n||(W.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches))return;
  const cv=h('canvas'),ctx=cv.getContext('2d');bg.append(cv);
  const [cr,cg,cb]=rgb(cssColor(t.fxColor,'#7dd3fc'));
  let w=0,hh=0,ps=[],raf=0,on=true;
  const mk=()=>({x:Math.random()*w,y:Math.random()*hh,r:mode==='bubbles'?4+Math.random()*10:.8+Math.random()*2.6,vy:mode==='snow'?.3+Math.random()*.8:-(.15+Math.random()*.55),vx:(Math.random()-.5)*.3,a:.15+Math.random()*.5,p:Math.random()*6.28});
  const size=()=>{const r=bg.getBoundingClientRect(),d=Math.min(2,W.devicePixelRatio||1);w=r.width;hh=r.height;cv.width=w*d;cv.height=hh*d;ctx.setTransform(d,0,0,d,0,0);ps=Array.from({length:n},mk)};
  size();
  const ro=W.ResizeObserver?new ResizeObserver(size):null;if(ro)ro.observe(bg);
  const loop=()=>{
    if(!on||!cv.isConnected){if(ro)ro.disconnect();return}
    ctx.clearRect(0,0,w,hh);
    for(const p of ps){
      p.p+=.02;if(mode!=='stars'){p.y+=p.vy;p.x+=p.vx+Math.sin(p.p)*.25;if(p.y<-20)p.y=hh+10;if(p.y>hh+20)p.y=-10;if(p.x<-20)p.x=w+10;if(p.x>w+20)p.x=-10}
      const a=mode==='stars'?p.a*(.4+.6*Math.abs(Math.sin(p.p))):p.a;
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,6.283);
      if(mode==='bubbles'){ctx.strokeStyle=`rgba(${cr},${cg},${cb},${a})`;ctx.lineWidth=1.2;ctx.stroke()}
      else{ctx.fillStyle=`rgba(${cr},${cg},${cb},${a})`;ctx.fill()}
    }
    raf=requestAnimationFrame(loop);
  };
  loop();
  stage._fx=()=>{on=false;cancelAnimationFrame(raf);if(ro)ro.disconnect()};
}

/* ---------- render halaman ---------- */
function cleanupStage(stage){
  $$('.desc',stage).forEach(e=>e._stop&&e._stop());
  $$('.slider',stage).forEach(e=>e._stop&&e._stop());
  if(stage._fx)stage._fx();if(stage._io)stage._io.disconnect();
  stage._fx=null;stage._io=null;
}
function renderSite(site,stage,opt){
  opt=opt||{};
  cleanupStage(stage);
  stage.replaceChildren();
  stage.className='stage'+(opt.preview?' pv':'')+(opt.preview&&!opt.play?' noanim':'');
  applyTheme(stage,site.theme);
  const bg=h('div',{class:'bg'}),sc=h('div',{class:'scroll'}),col=h('div',{class:'col'});
  stage.append(bg,sc);sc.append(col);
  mountFx(bg,site.theme,stage);
  site.blocks.forEach((b,i)=>{
    if(b.hide)return;const def=BLK[b.type];if(!def)return;
    let el;try{el=def.render(b,{site,opt,stage,i})}catch(e){return}
    el.classList.add('blk');el.dataset.id=b.id;
    const an=ANIM_OK.includes(b.anim)?b.anim:'swipeUp';
    if(an!=='none'){el.dataset.anim=an;el.style.setProperty('--an','a-'+an)}
    el.style.setProperty('--dl',(clamp(b.delay,0,2500)/1000)+'s');el.style.setProperty('--dur',(clamp(b.dur||750,200,2500)/1000)+'s');
    el.style.setProperty('--op',clamp(b.op==null?100:b.op,10,100)/100);
    if(b.mt!=null&&b.mt!=='')el.style.setProperty('--mt',clamp(b.mt,0,120)+'px');
    if(b.mb!=null&&b.mb!=='')el.style.setProperty('--mb',clamp(b.mb,0,120)+'px');
    if(opt.sel&&opt.sel===b.id)el.classList.add('sel');
    col.append(el);
  });
  const foot=h('div',{class:'foot'},'Powered By - igneel dragons ACT');
  if(!opt.preview)foot.addEventListener('click',tapper(5,2000,()=>openAdmin()));
  col.append(foot);
  if(opt.preview){
    stage.addEventListener('click',e=>{const a=e.target.closest('a');if(a)e.preventDefault()},true);
    if(opt.onPick)col.addEventListener('click',e=>{const b=e.target.closest('.blk');if(b)opt.onPick(b.dataset.id)});
    if(opt.play)startReveal(stage);else $$('.blk',stage).forEach(el=>{el.classList.add('in');el._go&&el._go()});
  }
}
function startReveal(stage){
  const sc=$('.scroll',stage),els=$$('.blk',stage);
  stage.classList.add('go');
  const show=el=>{el.classList.add('in');el._go&&el._go()};
  if(!W.IntersectionObserver){els.forEach(show);return}
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){io.unobserve(e.target);show(e.target)}}),{root:sc,threshold:.08});
  els.forEach(el=>io.observe(el));stage._io=io;
}

/* ---------- loader ---------- */
function buildLoader(cfg){
  cfg=Object.assign({},DEF.loader,cfg||{});
  const el=h('div',{id:'loader',role:'status','aria-label':'Memuat'});
  const st=el.style;
  st.setProperty('--ld-bg',cssColor(cfg.bg,'#fff'));st.setProperty('--ld-size',clamp(cfg.size||132,80,240)+'px');st.setProperty('--ld-bar',cssColor(cfg.bar,'#111'));st.setProperty('--ld-track',cssColor(cfg.track,'#e5e7eb'));st.setProperty('--ld-txt',cssColor(cfg.color,'#111'));
  const box=h('div',{class:'ld-box'});
  const m=safeUrl(cfg.media,true);
  if(m&&isVideo(m)){
    const v=h('video',{loop:'',muted:'',playsinline:'',autoplay:'',preload:'auto'});v.muted=true;v.defaultMuted=true;v.src=m;box.append(v);v.play&&v.play().catch(()=>{});
  }else if(m){const i=h('img',{src:m,alt:'',draggable:'false'});i.addEventListener('error',()=>{box.replaceChildren();box.innerHTML=defaultLoaderSvg(cfg.bar)});box.append(i)}
  else box.innerHTML=defaultLoaderSvg(cfg.bar);
  el.append(box,h('div',{class:'ld-bar'},h('i')),h('div',{class:'ld-txt'},h('span',null,String(cfg.text||'loading').slice(0,24)),h('span',{class:'ld-dots'},h('i',null,'.'),h('i',null,'.'),h('i',null,'.'))));
  return el;
}
const defaultLoaderSvg=c=>{c=cssColor(c,'#111');return`<svg viewBox="0 0 100 100"><rect width="100" height="100" fill="#f3f4f6"/><circle cx="50" cy="50" r="26" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round" stroke-dasharray="42 122"><animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="1.1s" repeatCount="indefinite"/></circle><circle cx="50" cy="50" r="9" fill="${c}"><animate attributeName="r" values="6;12;6" dur="1.1s" repeatCount="indefinite"/></circle></svg>`};

function collectAssets(site,lcfg){
  const u=[];
  site.blocks.forEach(b=>{
    if(b.hide)return;
    if(b.type==='hero')u.push(b.banner,b.logo);
    else if(b.type==='image')u.push(b.src);
    else if(b.type==='video')u.push(b.poster);
    else if(b.type==='slider'&&b.slides&&b.slides[0])u.push(b.slides[0].img);
  });
  if(site.theme.bgMode==='image')u.push(site.theme.bgImage);
  return[...new Set(u.map(x=>resolveSrc(x)).filter(x=>x&&x.slice(0,5)!=='data:'))];
}
function preload(urls,tick){
  if(!urls.length)return Promise.resolve();
  let done=0;
  return Promise.all(urls.map(u=>new Promise(res=>{
    let f=0;const fin=()=>{if(f)return;f=1;done++;tick(done/urls.length);res()};
    if(isVideo(u))return fin();
    const i=new Image();i.onload=i.onerror=fin;i.src=u;setTimeout(fin,7000);
  })));
}
