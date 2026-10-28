
/* =====================================================================
   BOOT — loader → data JSONBin → render → fade-out → statistik
   ===================================================================== */
let LIVE=null;
function renderLive(){
  if(!LIVE||!S.site)return;
  loadFont(S.site.theme.font);
  renderSite(S.site,LIVE,{});startReveal(LIVE);
  if(S.site.theme.title)D.title=S.site.theme.title;
}
async function boot(){
  startGuard();
  const cache=LS.json('ig_cfg');
  const lcfg=(cache&&cache.rec&&cache.rec.site&&cache.rec.site.loader)||DEF.loader;
  const ld=buildLoader(lcfg);D.body.append(ld);
  const fill=$('.ld-bar i',ld),minMs=clamp(lcfg.minMs||1500,500,6000);
  let target=4,shown=0,done=false;const t0=performance.now();
  const bump=v=>{target=Math.max(target,Math.min(100,v))};
  const finished=new Promise(res=>{
    const frame=()=>{
      const cap=Math.min(100,((performance.now()-t0)/minMs)*100);
      const goal=Math.min(target,cap);
      shown+=Math.max((goal-shown)*.1,goal>shown?.12:0);if(shown>goal)shown=goal;
      fill.style.width=shown.toFixed(2)+'%';
      if(shown>=99.9&&target>=100){fill.style.width='100%';res();return}
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });

  let rec=null;
  try{rec=await loadRec(false)}catch(e){}
  bump(35);
  S.rec=rec;S.meta=(rec&&rec.meta)||{};
  S.site=normalize(rec);
  let site=S.site;
  await loadFont(site.theme.font);bump(50);
  await preload(collectAssets(site),f=>bump(50+f*48));
  const stage=h('div',{class:'stage'});LIVE=stage;
  try{renderSite(site,stage,{})}catch(e){S.site=normalize(null);renderSite(S.site,stage,{})}
  D.body.insertBefore(stage,ld);
  if(site.theme.title)D.title=site.theme.title;
  bump(100);
  await finished;
  await sleep(180);
  ld.classList.add('hide');
  startReveal(stage);
  D.body.style.overflow='hidden';
  setTimeout(()=>{ld.remove()},1100);
  countVisit();
}
if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',boot);else boot();
})();
