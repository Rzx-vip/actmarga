
/* =====================================================================
   ADMIN — login, ringkasan statistik, editor visual, pengaturan
   ===================================================================== */
const A={el:null,box:null,tab:'ov',E:null,changed:false};
let E=null;
const hex6=(v,f)=>{v=String(v||'');if(/^#[0-9a-f]{6}$/i.test(v))return v;if(/^#[0-9a-f]{3}$/i.test(v))return'#'+[...v.slice(1)].map(c=>c+c).join('');return f||'#ffffff'};
const fmtN=v=>v==null?'—':Number(v).toLocaleString('id-ID');
const ib=(t,fn,title)=>h('button',{class:'a-btn sm',type:'button',title:title||'',onclick:e=>{e.preventDefault();e.stopPropagation();fn()}},t);

function openAdmin(){
  if(!A.el){A.el=h('div',{id:'admin'});D.body.append(A.el)}
  A.el.hidden=false;
  if(S.authed)dash();else login();
}
function closeAdmin(){
  if(!A.el)return;
  A.el.hidden=true;
  if(A.changed){A.changed=false;renderLive()}
}
function toast(msg,err){
  const t=h('div',{class:'a-toast'+(err?' err':'')},msg);
  (A.box||A.el).append(t);setTimeout(()=>t.remove(),err?6000:3200);
}
W.addEventListener('beforeunload',e=>{if(A.E&&A.E.dirty){e.preventDefault();e.returnValue=''}});

/* ---------- login / setup ---------- */
let fails=0;
async function login(){
  const box=h('div',{class:'a-box a-sm'});A.box=box;A.el.replaceChildren(box);
  const head=h('div',null,h('h2',{style:{margin:'0 0 2px',fontSize:'18px'}},'🐉 Dashboard Admin'),h('div',{class:'a-lab',style:{margin:'0 0 14px'}},'MARGA ACT • igneel dragons ACT'));
  const msg=h('div',{class:'a-msg'}),cancel=h('button',{class:'a-btn',type:'button',style:{width:'100%',marginTop:'8px'},onclick:closeAdmin},'Batal');
  const say=(t,ok)=>{msg.textContent=t;msg.className='a-msg'+(ok?' ok':'')};
  box.append(head);
  if(!getBins().length){
    const bin=h('input',{class:'a-in',placeholder:'Bin ID JSONBin',autocomplete:'off'});
    const go=h('button',{class:'a-btn pri',type:'button',style:{width:'100%',marginTop:'12px'},onclick:()=>{const v=bin.value.trim();if(!validBin(v))return say('Bin ID tidak valid (huruf/angka, ±24 karakter).');LS.set('ig_bin',v);login()}},'Lanjut');
    box.append(h('div',{class:'a-lab'},'Belum ada Bin ID di file index.html (blok igneel-config). Masukkan satu Bin ID (disimpan di perangkat ini):'),bin,msg,go,cancel);return;
  }
  box.append(h('div',{class:'a-lab'},'Memeriksa data…'),cancel);
  let rec=null;
  try{rec=await loadRec(true)}catch(e){
    box.replaceChildren(head,h('div',{class:'a-msg'},'Tidak bisa membaca bin ('+e.message+'). Pastikan bin berstatus Public dan Bin ID benar.'),h('button',{class:'a-btn',type:'button',style:{width:'100%',marginTop:'12px'},onclick:login},'Coba lagi'),h('button',{class:'a-btn',type:'button',style:{width:'100%',marginTop:'8px'},onclick:()=>{LS.del('ig_bin');login()}},'Ganti Bin ID'),cancel);return;
  }
  const setup=!rec||!rec.admin;
  const user=h('input',{class:'a-in',placeholder:'Username',autocomplete:'username'});
  const pass=h('input',{class:'a-in',type:'password',placeholder:'Password',autocomplete:setup?'new-password':'current-password'});
  const pass2=setup?h('input',{class:'a-in',type:'password',placeholder:'Ulangi password',autocomplete:'new-password'}):null;
  const nb=getBins().length,hasKey=hasAllKeys();
  const key=hasKey?null:h('textarea',{class:'a-in',style:{minHeight:nb>1?'96px':'48px',fontFamily:'monospace',fontSize:'12px'},placeholder:nb>1?'Access Key, SATU PER BARIS (urutan sama dengan bin di file).\nAtau format  binId:key  per baris.\nSatu baris saja = dipakai untuk semua bin.':'JSONBin Access Key (izin Update)',autocomplete:'off',spellcheck:'false'});
  const btn=h('button',{class:'a-btn pri',type:'button',style:{width:'100%',marginTop:'12px'}},setup?'Buat akun & masuk':'Masuk');
  const submit=async()=>{
    if(+LS.get('ig_lock')>Date.now())return say('Terlalu banyak percobaan. Tunggu 30 detik.');
    const u=user.value.trim(),p=pass.value,k=key?key.value.trim():'';
    if(!u||!p)return say('Isi username dan password.');
    btn.disabled=true;say('Memproses…',true);
    try{
      if(setup){
        if(p.length<8)throw new Error('Password minimal 8 karakter.');
        if(p!==pass2.value)throw new Error('Konfirmasi password tidak sama.');
        if(k)setKeysFromText(k);
        if(!hasAllKeys())throw new Error('Access Key belum lengkap untuk semua bin.');
        const admin=await makeAdmin(u,p);
        const next=Object.assign({},rec||{},{admin,site:(rec&&rec.site)||normalize(null),meta:Object.assign({v:1,ns:NS_DEFAULT},(rec&&rec.meta)||{},{updated:new Date().toISOString()})});
        await saveRec(next);
      }else{
        if(!await checkAdmin(rec.admin,u,p)){fails++;if(fails>=5){LS.set('ig_lock',String(Date.now()+30000));fails=0}throw new Error('Username atau password salah.')}
        if(k)setKeysFromText(k);
        S.rec=rec;
      }
      S.meta=S.rec.meta||{};S.authed=true;LS.set('ig_own','1');
      A.E=null;A.tab='ov';dash();
    }catch(e){say(e.message);btn.disabled=false}
  };
  btn.addEventListener('click',submit);
  [user,pass,pass2,key].forEach(i=>i&&i.addEventListener('keydown',e=>{if(e.key==='Enter')submit()}));
  box.replaceChildren(head,h('div',{class:'a-lab'},setup?'Setup pertama — buat username & password admin':'Masuk untuk mengelola website'),user,h('div',{style:{height:'8px'}}),pass,pass2?h('div',{style:{height:'8px'}}):null,pass2,key?h('div',{style:{height:'8px'}}):null,key,hasKey?h('div',{class:'a-lab'},'✓ Access Key tersimpan di perangkat ini ('+nb+' bin)'):null,msg,btn,cancel);
  user.focus();
}
function logout(){
  if(A.E&&A.E.dirty&&!confirm('Ada perubahan belum disimpan. Keluar tanpa menyimpan?'))return;
  LS.del('ig_own');S.authed=false;if(A.E)A.E.dirty=false;location.reload();
}

/* ---------- kerangka dashboard ---------- */
function newE(){
  const site=normalize(S.rec);const s=JSON.stringify(site);
  return{site,sel:site.blocks[0]?site.blocks[0].id:'theme',hist:[s],hi:0,saved:s,dirty:false,dev:390,play:false};
}
function dash(){
  const box=h('div',{class:'a-box'});A.box=box;A.el.replaceChildren(box);
  if(!A.E)A.E=newE();E=A.E;
  const tabs=h('div',{class:'a-tabs'},[['ov','📊 Ringkasan'],['ed','🛠️ Editor'],['st','⚙️ Pengaturan']].map(t=>h('button',{class:'a-btn'+(A.tab===t[0]?' on':''),type:'button',onclick:()=>{A.tab=t[0];dash()}},t[1])));
  const top=h('div',{class:'a-top'},h('h2',null,'🐉 Dashboard'),tabs,h('button',{class:'a-btn',type:'button',onclick:closeAdmin},'👁 Lihat situs'),h('button',{class:'a-btn dan',type:'button',onclick:logout},'Keluar'));
  const body=h('div',{class:'a-body'});box.append(top,body);
  (A.tab==='ed'?editorPane:A.tab==='st'?settingsPane:statsPane)(body);
  body.append(h('button',{class:'a-fab',type:'button','aria-label':'Tambah elemen',title:A.tab==='ed'?'Tambah elemen':'Buka editor',onclick:()=>{if(A.tab!=='ed'){A.tab='ed';dash()}else openPalette()}},'+'));
}

/* ---------- statistik asli ---------- */
async function statsPane(body){
  const pane=h('div',{class:'a-pane'});body.append(pane);
  pane.append(h('div',{class:'a-lab'},'Mengambil data statistik…'));
  const days=[...Array(7)].map((_,i)=>{const d=new Date(Date.now()-(6-i)*864e5);return{k:dayKey(d),l:new Intl.DateTimeFormat('id-ID',{timeZone:'Asia/Jakarta',weekday:'short'}).format(d)}});
  const clicks=[];
  S.site=S.site||normalize(S.rec);
  const sb=(E?E.site:S.site).blocks;
  sb.forEach(b=>{if(b.type==='button')clicks.push({id:b.id,l:b.label||'Tombol'});if(b.type==='slider')(b.slides||[]).forEach((s,i)=>{if(s.btn)clicks.push({id:b.id+'s'+(i+1),l:'Slide '+(i+1)+' — '+(s.title||s.btn)})})});
  const main=await Promise.all([cGet('v-total'),cGet('v-unique'),...days.map(d=>cGet('v-d'+d.k))]);
  const cv=await Promise.all(clicks.map(c=>cGet('c-'+c.id)));
  if(!pane.isConnected)return;
  const tot=main[0],uni=main[1],dv=main.slice(2),today=dv[6];
  const ok=main.some(v=>v!=null);
  const max=Math.max(1,...dv.map(v=>v||0));
  const sum7=dv.every(v=>v==null)?null:dv.reduce((a,v)=>a+(v||0),0);
  const stat=(l,v)=>h('div',{class:'a-card a-stat'},h('span',null,l),h('b',null,fmtN(v)));
  pane.replaceChildren(
    h('div',{class:'a-row',style:{marginBottom:'12px'}},h('h3',{class:'a-h3',style:{margin:0,flex:1}},'Statistik pengunjung'),h('button',{class:'a-btn sm',type:'button',onclick:()=>{A.el&&dash()}},'↻ Segarkan')),
    ok?null:h('div',{class:'a-msg',style:{marginBottom:'12px'}},'Layanan counter (Abacus) tidak bisa dihubungi sekarang. Angka tidak ditampilkan — sengaja tidak ada data palsu/simulasi.'),
    h('div',{class:'a-grid'},stat('Total view',tot),stat('Pengunjung unik',uni),stat('View hari ini',today),stat('View 7 hari',sum7)),
    h('div',{class:'a-card',style:{marginTop:'12px'}},h('span',{class:'a-lab',style:{margin:0}},'View per hari (7 hari terakhir, WIB)'),h('div',{class:'a-bars'},dv.map((v,i)=>h('div',null,h('span',null,fmtN(v)),h('i',{style:{height:Math.max(2,Math.round((v||0)/max*84))+'px'}}),h('span',null,days[i].l))))),
    h('div',{class:'a-card',style:{marginTop:'12px'}},h('span',{class:'a-lab',style:{margin:0}},'Klik tombol'),clicks.length?h('table',{class:'a-tbl'},h('tbody',null,clicks.map((c,i)=>h('tr',null,h('td',null,c.l),h('td',null,fmtN(cv[i])))))):h('div',{class:'a-lab'},'Belum ada tombol.')),
    h('div',{class:'a-lab',style:{marginTop:'12px'}},'Semua angka berasal dari hit nyata (1 view per sesi browser, 1 unik per perangkat). Kunjungan kamu sendiri sebagai admin tidak dihitung.')
  );
}

/* ---------- pengaturan ---------- */
async function saveRecPatch(patch,okMsg){
  try{
    const next=Object.assign({},S.rec,patch);
    await saveRec(next);S.meta=next.meta||{};toast(okMsg||'Tersimpan ✔')
  }catch(e){toast(e.message,true)}
}
function settingsPane(body){
  const pane=h('div',{class:'a-pane'});body.append(pane);
  const adm=S.rec&&S.rec.admin||{};
  const nu=h('input',{class:'a-in',value:adm.user||'',autocomplete:'username'}),np=h('input',{class:'a-in',type:'password',placeholder:'Password baru (min 8 karakter)',autocomplete:'new-password'}),np2=h('input',{class:'a-in',type:'password',placeholder:'Ulangi password baru',autocomplete:'new-password'});
  const kin=h('textarea',{class:'a-in',style:{minHeight:'72px',fontFamily:'monospace',fontSize:'12px'},placeholder:'Tempel Access Key (satu per baris)',autocomplete:'off',spellcheck:'false'});
  const size=(JSON.stringify(Object.assign({},S.rec,{site:E.site})).length/1024).toFixed(1);
  const imp=h('input',{type:'file',accept:'application/json,.json',style:{display:'none'}});
  imp.addEventListener('change',async()=>{
    try{const j=JSON.parse(await imp.files[0].text());const s=normalize({site:j.site||j});E.site=s;E.sel=s.blocks[0]?s.blocks[0].id:'theme';edCommit();E.dirty=true;toast('Backup dimuat ke editor — klik Simpan di tab Editor untuk menerapkan.')}catch(e){toast('File backup tidak valid.',true)}
  });
  pane.append(
    h('h3',{class:'a-h3'},'Akun admin'),
    h('div',{class:'a-card'},h('label',{class:'a-lab',style:{marginTop:0}},'Username'),nu,h('label',{class:'a-lab'},'Password baru'),np,np2,h('div',{style:{marginTop:'10px'}},h('button',{class:'a-btn pri',type:'button',onclick:async()=>{
      if(!nu.value.trim())return toast('Username kosong.',true);if(np.value.length<8)return toast('Password minimal 8 karakter.',true);if(np.value!==np2.value)return toast('Konfirmasi password tidak sama.',true);
      await saveRecPatch({admin:await makeAdmin(nu.value,np.value)},'Akun diperbarui ✔');np.value=np2.value='';
    }},'Perbarui akun'))),
    h('h3',{class:'a-h3'},'JSONBin ('+getBins().length+' bin)'),
    h('div',{class:'a-card'},
      h('div',{class:'a-lab',style:{margin:0}},'Bin dibaca ACAK tiap pengunjung (cadangan otomatis kalau satu gagal); setiap SIMPAN ditulis ke semua bin.'),
      h('div',{style:{margin:'8px 0'}},getBins().map((b,i)=>{const inf=S.binInfo.find(x=>x.id===b.id);return h('div',{class:'a-lab',style:{margin:'3px 0'}},h('b',{style:{color:'#e6edf7'}},'Bin '+(i+1)+': '),b.id.slice(0,6)+'…'+b.id.slice(-4),'  ',wkeyOf(b.id)?'🔑 key tulis ada':'⚠️ key tulis kosong',inf?(inf.ok?'  ✓ terbaca':'  ✕ '+inf.err):'')})),
      h('div',{class:'a-lab'},'Ukuran data: ',h('b',{style:{color:+size>85?'#fbbf24':'#e6edf7'}},size+' KB'),' / 100 KB per bin (batas paket gratis)'),
      h('label',{class:'a-lab'},'Access Key tulis (satu per baris, urutan = urutan bin; atau binId:key). Hanya disimpan di perangkat ini, tidak ada di source code.'),kin,
      h('div',{class:'a-row',style:{marginTop:'10px'}},
        h('button',{class:'a-btn',type:'button',onclick:()=>{if(!kin.value.trim())return toast('Tempel key dulu.',true);const n=setKeysFromText(kin.value);kin.value='';toast('Key tersimpan untuk '+n+' bin ✔');dash()}},'Simpan key'),
        h('button',{class:'a-btn',type:'button',onclick:async()=>{try{await loadRec(true);const ok=S.binInfo.filter(x=>x.ok).length;toast(`Terbaca ${ok}/${S.binInfo.length} bin`+(ok<S.binInfo.length?' — cek detail di daftar':' ✔'),ok<S.binInfo.length);dash()}catch(e){toast('Gagal terhubung: '+e.message,true)}}},'Tes koneksi semua bin'))),
    h('h3',{class:'a-h3'},'Counter statistik'),
    h('div',{class:'a-card'},h('div',{class:'a-lab',style:{margin:0}},'Namespace: ',h('b',{style:{color:'#e6edf7'}},nsOf())),h('div',{class:'a-lab'},'Mengganti namespace memulai hitungan dari nol.'),h('button',{class:'a-btn dan',type:'button',style:{marginTop:'8px'},onclick:async()=>{if(!confirm('Ganti namespace? Hitungan view mulai dari 0 lagi.'))return;await saveRecPatch({meta:Object.assign({v:1},S.rec.meta||{},{ns:'igneeldragons-'+uid()+uid()})},'Namespace diganti ✔');settingsPane0()}},'Reset hitungan (namespace baru)')),
    h('h3',{class:'a-h3'},'Backup & reset'),
    h('div',{class:'a-card a-row'},
      h('button',{class:'a-btn',type:'button',onclick:()=>{const a=h('a',{href:URL.createObjectURL(new Blob([JSON.stringify({site:E.site},null,1)],{type:'application/json'})),download:'backup-biolink.json'});D.body.append(a);a.click();a.remove()}},'⬇ Unduh backup'),
      h('button',{class:'a-btn',type:'button',onclick:()=>imp.click()},'⬆ Muat backup'),imp,
      h('button',{class:'a-btn dan',type:'button',onclick:()=>{if(!confirm('Kembalikan desain ke bawaan? (belum tersimpan sampai kamu klik Simpan)'))return;E.site=normalize(null);E.sel=E.site.blocks[0].id;edCommit();E.dirty=true;toast('Desain bawaan dimuat — klik Simpan di tab Editor.')}},'Reset desain ke bawaan'))
  );
}
function settingsPane0(){if(A.tab==='st')dash()}

/* ---------- editor ---------- */
const edState=()=>{const d=E.dirty;const s=$('.ed-st',A.box);if(s){s.className='ed-st'+(d?' dirty':'');s.textContent=d?'● Belum disimpan':'✓ Tersimpan'}const u=$('[data-a=undo]',A.box),r=$('[data-a=redo]',A.box);if(u)u.disabled=E.hi<=0;if(r)r.disabled=E.hi>=E.hist.length-1};
function edTouch(now){
  E.dirty=JSON.stringify(E.site)!==E.saved;edState();
  clearTimeout(E.pt);E.pt=setTimeout(()=>{edPreview();renderList()},now?0:80);
  clearTimeout(E.ht);E.ht=setTimeout(edCommit,now?0:500);
}
function edCommit(){
  clearTimeout(E.ht);const s=JSON.stringify(E.site);
  if(s!==E.hist[E.hi]){E.hist=E.hist.slice(0,E.hi+1);E.hist.push(s);if(E.hist.length>150)E.hist.shift();E.hi=E.hist.length-1}
  edState();
}
function edRestore(){
  E.site=JSON.parse(E.hist[E.hi]);
  if(E.sel!=='theme'&&E.sel!=='loader'&&!E.site.blocks.some(b=>b.id===E.sel))E.sel=E.site.blocks[0]?E.site.blocks[0].id:'theme';
  E.dirty=JSON.stringify(E.site)!==E.saved;edState();renderList();renderProps();edPreview();
}
function undo(){edCommit();if(E.hi>0){E.hi--;edRestore()}}
function redo(){edCommit();if(E.hi<E.hist.length-1){E.hi++;edRestore()}}
function edPreview(){
  if(!E.stage||!E.stage.isConnected)return;
  const sc=$('.scroll',E.stage),top=sc?sc.scrollTop:0;
  loadFont(E.site.theme.font);
  renderSite(E.site,E.stage,{preview:true,play:E.play,sel:E.sel,onPick:selectBlock});
  E.play=false;
  const s2=$('.scroll',E.stage);if(s2){s2.style.scrollBehavior='auto';s2.scrollTop=top}
  if(E.focus){const el=$(`.blk[data-id="${E.focus}"]`,E.stage);if(el)el.scrollIntoView({block:'center'});E.focus=null}
  if(E.site.theme.title)D.title=E.site.theme.title;
}
function selectBlock(id){
  E.sel=id;renderList();renderProps();edPreview();
  if(matchMedia('(max-width:980px)').matches)setPane('r');
}
function setPane(p){const ed=$('.ed',A.box);if(ed)ed.dataset.pane=p;$$('.ed-tabs .a-btn',A.box).forEach(b=>b.classList.toggle('on',b.dataset.p===p))}
const bsum=b=>String(b.text||b.label||b.title||(Array.isArray(b.lines)&&b.lines[0])||(b.slides&&b.slides.length+' slide')||(b.items&&b.items.length+' ikon')||b.src||b.url||b.banner||'').replace(/\s+/g,' ').slice(0,34);
function renderList(){
  const host=E.ui&&E.ui.list;if(!host)return;
  host.replaceChildren();
  const g=(id,ico,nm)=>h('div',{class:'li'+(E.sel===id?' on':''),onclick:()=>selectBlock(id)},h('span',null,ico),h('span',{class:'nm'},nm));
  host.append(g('theme','🎨','Tema & warna'),g('loader','⏳','Loader (layar muat)'),h('div',{class:'a-lab'},'Urutan blok (seret untuk memindah)'));
  E.site.blocks.forEach((b,i)=>{
    const def=BLK[b.type]||{name:b.type,ico:'❔'};
    const li=h('div',{class:'li'+(E.sel===b.id?' on':'')+(b.hide?' off':''),draggable:'true',onclick:()=>selectBlock(b.id)},
      h('span',null,def.ico),h('span',{class:'nm'},def.name,h('small',null,bsum(b)||'—')),
      h('span',{class:'act'},ib('↑',()=>mvBlock(i,-1),'Naik'),ib('↓',()=>mvBlock(i,1),'Turun'),ib('⧉',()=>dupBlock(i),'Duplikat'),ib(b.hide?'🙈':'👁',()=>{b.hide=!b.hide;edTouch(true)},'Tampil/sembunyi'),ib('🗑',()=>delBlock(i),'Hapus')));
    li.addEventListener('dragstart',e=>{E.drag=i;li.classList.add('drag');try{e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',String(i))}catch(x){}});
    li.addEventListener('dragend',()=>li.classList.remove('drag'));
    li.addEventListener('dragover',e=>{e.preventDefault();li.classList.add('over')});
    li.addEventListener('dragleave',()=>li.classList.remove('over'));
    li.addEventListener('drop',e=>{e.preventDefault();li.classList.remove('over');const f=E.drag;if(f==null||f===i)return;const[x]=E.site.blocks.splice(f,1);E.site.blocks.splice(i,0,x);E.drag=null;edTouch(true)});
    host.append(li);
  });
  host.append(h('button',{class:'a-btn pri',type:'button',style:{width:'100%',marginTop:'6px'},onclick:openPalette},'+ Tambah elemen'));
}
function mvBlock(i,d){const a=E.site.blocks,j=i+d;if(j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]];E.focus=a[j].id;edTouch(true)}
function dupBlock(i){const c=clone(E.site.blocks[i]);c.id='b_'+uid();E.site.blocks.splice(i+1,0,c);E.sel=c.id;E.focus=c.id;edTouch(true);renderProps()}
function delBlock(i){if(!confirm('Hapus blok ini?'))return;const b=E.site.blocks.splice(i,1)[0];if(E.sel===b.id)E.sel=E.site.blocks[0]?E.site.blocks[0].id:'theme';edTouch(true);renderProps()}
function addBlock(type){
  const def=BLK[type];if(!def)return;
  const nb=Object.assign({id:'b_'+uid(),anim:'swipeUp'},clone(def.def),{type});
  const idx=E.site.blocks.findIndex(b=>b.id===E.sel);
  E.site.blocks.splice(idx>=0?idx+1:E.site.blocks.length,0,nb);
  E.sel=nb.id;E.focus=nb.id;edTouch(true);renderProps();
  if(matchMedia('(max-width:980px)').matches)setPane('r');
}
function openPalette(){
  if(A.tab!=='ed'){A.tab='ed';dash();return}
  const pal=h('div',{class:'a-pal',onclick:e=>{if(e.target===pal)pal.remove()}},h('div',null,
    h('div',{class:'a-row'},h('h3',{class:'a-h3',style:{margin:0,flex:1}},'Tambah elemen'),h('button',{class:'a-btn sm',type:'button',onclick:()=>pal.remove()},'✕')),
    h('div',{class:'a-pg'},BLK_TYPES.map(t=>h('button',{type:'button',onclick:()=>{pal.remove();addBlock(t)}},h('b',null,BLK[t].ico),BLK[t].name,h('small',null,BLK[t].desc))))));
  A.box.append(pal);
}

/* ---------- panel properti: form dibangun otomatis dari skema ---------- */
function renderProps(){
  const host=E.ui&&E.ui.props;if(!host)return;host.replaceChildren();
  if(E.sel==='theme'){host.append(h('h3',{class:'a-h3'},'🎨 Tema & warna'));groups(host,THEME_FIELDS,E.site.theme);return}
  if(E.sel==='loader'){host.append(h('h3',{class:'a-h3'},'⏳ Loader'),h('div',{class:'a-lab',style:{margin:'0 0 8px'}},'Loader tampil sebelum data dimuat, jadi perubahan terlihat mulai kunjungan berikutnya (preview tidak menampilkannya).'));groups(host,LOADER_FIELDS,E.site.loader);return}
  const b=E.site.blocks.find(x=>x.id===E.sel);
  if(!b){host.append(h('div',{class:'a-lab'},'Pilih blok di daftar atau di preview untuk mengeditnya.'));return}
  const def=BLK[b.type];
  host.append(h('h3',{class:'a-h3'},def.ico+' '+def.name));
  groups(host,def.fields,b);
}
function groups(host,gs,obj){
  gs.forEach((g,gi)=>{
    const body=h('div');g.f.forEach(f=>body.append(fieldEl(f,obj)));
    host.append(h('details',{class:'a-det',open:gi<2},h('summary',null,g.g),body));
  });
}
async function fileToData(file){
  if(!/^image\/(png|jpe?g|webp)$/.test(file.type))throw new Error('Hanya PNG/JPG/WebP. Untuk GIF/video: taruh file di repo GitHub lalu isi path/URL-nya.');
  const bmp=await createImageBitmap(file),sc=Math.min(1,900/Math.max(bmp.width,bmp.height));
  const c=D.createElement('canvas');c.width=Math.max(1,Math.round(bmp.width*sc));c.height=Math.max(1,Math.round(bmp.height*sc));
  c.getContext('2d').drawImage(bmp,0,0,c.width,c.height);
  let out=c.toDataURL('image/webp',.72);if(out.slice(0,15)!=='data:image/webp')out=c.toDataURL('image/jpeg',.72);
  return out;
}
function fieldEl(f,obj){
  const wrap=h('div'),lab=h('label',{class:'a-lab'},f.l),get=()=>obj[f.k];
  const set=v=>{obj[f.k]=v;edTouch()};
  switch(f.t){
    case'text':case'url':{
      const i=h('input',{class:'a-in',value:get()==null?'':get(),autocomplete:'off',spellcheck:'false'});i.addEventListener('input',()=>set(i.value));wrap.append(lab,i);break}
    case'area':{
      const i=h('textarea',{class:'a-in'},get()==null?'':String(get()));i.addEventListener('input',()=>set(i.value));wrap.append(lab,i);break}
    case'multi':{
      const i=h('textarea',{class:'a-in',style:{minHeight:'120px'}},toLines(obj).join('\n---\n'));i.addEventListener('input',()=>set(i.value.split(/\n-{3,}\n/)));wrap.append(lab,i);break}
    case'media':{
      const i=h('input',{class:'a-in',value:(get()||'').slice(0,5)==='data:'?'':(get()||''),placeholder:(get()||'').slice(0,5)==='data:'?'(gambar upload)':'Tempel URL gambar / GIF / video, atau path file',autocomplete:'off',spellcheck:'false'});
      i.addEventListener('input',()=>set(i.value));
      const fi=h('input',{type:'file',accept:'image/png,image/jpeg,image/webp',style:{display:'none'}});
      fi.addEventListener('change',async()=>{try{const d=await fileToData(fi.files[0]);set(d);i.value='';i.placeholder='(gambar upload)';toast(`Gambar dimasukkan (${(d.length/1024).toFixed(0)} KB). Batas total data 100 KB — lebih hemat pakai file di repo + path.`)}catch(e){toast(e.message,true)}fi.value=''});
      wrap.append(lab,h('div',{class:'a-row'},h('div',{style:{flex:1,minWidth:'120px'}},i),h('button',{class:'a-btn sm',type:'button',onclick:()=>fi.click()},'⬆ Upload'),fi));break}
    case'color':{
      const c=h('input',{type:'color',value:hex6(get(),'#ffffff')}),t=h('span',{class:'a-lab',style:{margin:0,flex:1}},get()||'(ikut tema)');
      c.addEventListener('input',()=>{t.textContent=c.value;set(c.value)});
      wrap.append(lab,h('div',{class:'a-col'},c,t,ib('✕',()=>{obj[f.k]='';t.textContent='(ikut tema)';edTouch()},'Kosongkan')));break}
    case'range':{
      const v=get()==null||get()===''?(f.d!=null?f.d:f.min):Number(get());
      const o=h('output',null,String(v)),i=h('input',{type:'range',min:f.min,max:f.max,step:f.step,value:v});
      i.addEventListener('input',()=>{o.textContent=i.value;set(Number(i.value))});wrap.append(lab,h('div',{class:'a-rg'},i,o));break}
    case'select':{
      const s=h('select',{class:'a-in'},f.o.map(o=>h('option',{value:o[0]},o[1])));s.value=String(get()==null?f.o[0][0]:get());if(s.value!==String(get()==null?f.o[0][0]:get()))s.selectedIndex=0;
      s.addEventListener('change',()=>{set(s.value);if(f.k==='font'||f.k==='bgMode')renderProps()});wrap.append(lab,s);break}
    case'bool':{
      const c=h('input',{type:'checkbox'});c.checked=get()==null?!!f.d:!!get();c.addEventListener('change',()=>set(c.checked));
      wrap.append(h('label',{class:'a-sw'},c,f.l));break}
    case'icon':{
      const cur=String(get()||'link'),isP=ICON_NAMES.includes(cur);
      const s=h('select',{class:'a-in'},ICON_NAMES.map(n=>h('option',{value:n},n)),h('option',{value:'__c'},'Kustom (emoji / URL gambar)'));
      const t=h('input',{class:'a-in',placeholder:'😀 atau https://…/ikon.png',value:isP?'':cur,style:{marginTop:'6px',display:isP?'none':'block'}});
      s.value=isP?cur:'__c';
      s.addEventListener('change',()=>{if(s.value==='__c'){t.style.display='block';t.focus();set(t.value||'⭐')}else{t.style.display='none';set(s.value)}});
      t.addEventListener('input',()=>set(t.value));wrap.append(lab,s,t);break}
    case'list':{
      const arr=Array.isArray(obj[f.k])?obj[f.k]:(obj[f.k]=[]),host=h('div');
      const draw=()=>{
        host.replaceChildren();
        arr.forEach((it,i)=>{
          const inner=h('div');f.f.forEach(sf=>inner.append(fieldEl(sf,it)));
          const mv=d=>{const j=i+d;if(j<0||j>=arr.length)return;[arr[i],arr[j]]=[arr[j],arr[i]];draw();edTouch(true)};
          host.append(h('details',{class:'a-it'},h('summary',null,h('span',null,(i+1)+'. '+(f.title?f.title(it):'Item')),ib('↑',()=>mv(-1)),ib('↓',()=>mv(1)),ib('⧉',()=>{arr.splice(i+1,0,clone(it));draw();edTouch(true)}),ib('🗑',()=>{arr.splice(i,1);draw();edTouch(true)})),inner));
        });
        host.append(h('button',{class:'a-btn sm',type:'button',onclick:()=>{arr.push(clone(f.def||{}));draw();edTouch(true)}},'+ Tambah'));
      };
      draw();wrap.append(lab,host);break}
  }
  return wrap;
}

/* ---------- simpan ---------- */
async function doSave(){
  edCommit();
  const btn=$('[data-a=save]',A.box);if(btn){btn.disabled=true;btn.textContent='Menyimpan…'}
  try{
    const rec=Object.assign({},S.rec,{site:clone(E.site),meta:Object.assign({v:1,ns:NS_DEFAULT},S.rec.meta||{},{updated:new Date().toISOString()})});
    const r=await saveRec(rec);
    E.saved=JSON.stringify(E.site);E.dirty=false;S.site=clone(E.site);S.meta=rec.meta;A.changed=true;
    if(r.fail.length)toast(`Tersimpan di ${r.ok}/${r.total} bin. Gagal → ${r.fail.join(' • ')}`,true);
    else toast(`Tersimpan ✔ (${(r.n/1024).toFixed(1)} KB${r.total>1?', '+r.total+' bin':''}) — langsung live, tanpa deploy ulang`);
  }catch(e){toast(e.message,true)}
  if(btn){btn.disabled=false;btn.textContent='💾 Simpan'}edState();
}

function editorPane(body){
  const ui={};E.ui=ui;
  const bar=h('div',{class:'ed-bar'},
    h('button',{class:'a-btn','data-a':'undo',type:'button',onclick:undo,title:'Ctrl+Z'},'↶ Undo'),
    h('button',{class:'a-btn','data-a':'redo',type:'button',onclick:redo,title:'Ctrl+Y'},'↷ Redo'),
    h('span',{class:'sp1'}),h('span',{class:'ed-st'},''),
    h('button',{class:'a-btn',type:'button',onclick:()=>{E.play=true;edPreview()},title:'Putar ulang animasi di preview'},'▶ Animasi'),
    h('button',{class:'a-btn pri','data-a':'save',type:'button',onclick:doSave,title:'Ctrl+S'},'💾 Simpan'));
  ui.list=h('section',{class:'ed-l'});
  ui.props=h('section',{class:'ed-r'});
  E.stage=h('div',{class:'stage pv'});
  const phone=h('div',{class:'phone',style:{'--pw':E.dev+'px'}},E.stage);
  const dev=h('div',{class:'ed-dev'},[[390,'📱 HP'],[768,'📲 Tablet'],[1100,'🖥 Desktop']].map(d=>h('button',{class:'a-btn sm'+(E.dev===d[0]?' on':''),type:'button',onclick:e=>{E.dev=d[0];phone.style.setProperty('--pw',d[0]+'px');$$('.ed-dev .a-btn',A.box).forEach(x=>x.classList.remove('on'));e.currentTarget.classList.add('on')}},d[1])));
  const center=h('section',{class:'ed-c'},dev,phone);
  const ed=h('div',{class:'ed','data-pane':'c'},bar,h('div',{class:'ed-main'},ui.list,center,ui.props),
    h('div',{class:'ed-tabs'},[['l','☰ Struktur'],['c','👁 Preview'],['r','✎ Properti']].map(p=>h('button',{class:'a-btn'+(p[0]==='c'?' on':''),type:'button','data-p':p[0],onclick:()=>setPane(p[0])},p[1]))));
  body.append(ed);
  renderList();renderProps();edPreview();edState();
}

/* pintasan keyboard di dashboard */
D.addEventListener('keydown',e=>{
  if(!S.authed||!A.el||A.el.hidden||A.tab!=='ed'||!E)return;
  const c=e.ctrlKey||e.metaKey,k=(e.key||'').toLowerCase(),typing=/^(INPUT|TEXTAREA|SELECT)$/.test((e.target||{}).tagName||'');
  if(c&&k==='s'){e.preventDefault();doSave()}
  else if(c&&!typing&&k==='z'){e.preventDefault();e.shiftKey?redo():undo()}
  else if(c&&!typing&&k==='y'){e.preventDefault();redo()}
});
