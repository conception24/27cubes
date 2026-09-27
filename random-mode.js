(() => {
  const toggle=document.querySelector('#randomModeToggle'),next=document.querySelector('#nextRandom'),summary=document.querySelector('#randomSummary');
  const randomIndex=PUZZLES.length;let worker=null,active=false,serial=0,revision=0;
  const usage={},recent=[];
  const originalColors=Object.fromEntries(PIECES.map(p=>[p.id,p.color]));
  const palette=['blue','green','pink','yellow','violet','cyan'];
  CUBE_COLORS.violet=['#9c87dc','#8070b9','#685691','#c1b3f1'];
  CUBE_COLORS.cyan=['#4cc5ce','#329ba6','#26747f','#8ee0e6'];
  SPECIAL_PIECES.forEach(p=>{pieceById[p.id]={...p,color:'blue'};ALL_PLACEMENTS[p.id]=placementMasks(p);});
  const maps=ROTATIONS.map(rotate=>Array.from({length:27},(_,i)=>{const c=rotate([Math.floor(i/9)-1,Math.floor(i/3)%3-1,i%3-1]);return (c[0]+1)*9+(c[1]+1)*3+c[2]+1;}));
  const catalog=[...PIECES,...SPECIAL_PIECES].map(p=>({id:p.id,volume:p.cubes.length,special:p.id.startsWith('P'),placements:ALL_PLACEMENTS[p.id]}));
  function sync(){
    toggle.textContent=active?'通常問題に戻る':'新パーツ問題を試す';toggle.setAttribute('aria-pressed',String(active));
    next.hidden=!active;summary.hidden=!active;playScreen.classList.toggle('core-rule-mode',active);
  }
  function stop(){revision++;worker?.terminate();worker=null;next.disabled=false;}
  const originalLoad=loadGamePuzzle;
  loadGamePuzzle=function(index){
    if(index!==randomIndex){stop();active=false;for(const [id,color] of Object.entries(originalColors))pieceById[id].color=color;sync();}
    originalLoad(index);
  };
  function generate(){
    if(dragState||pressStart)return;
    stop();active=true;sync();next.disabled=true;summary.textContent='中央コアの解を探索中…';
    const token=revision;
    try{
      worker=new Worker('random-worker.js?v=0.12.1');
      worker.onmessage=({data})=>{
        if(token!==revision)return;
        worker.terminate();worker=null;next.disabled=false;
        if(data.error){summary.textContent=data.error;return;}
        const r=data.result;
        r.pieces.forEach((id,i)=>{pieceById[id].color=palette[i];usage[id]=(usage[id]||0)+1;});
        recent.push(r.pieces.slice().sort().join(','));if(recent.length>10)recent.shift();
        PUZZLES[randomIndex]={id:'CORE-'+String(++serial).padStart(2,'0'),pieces:r.pieces,coreRule:true,hintSolutions:r.solutions,allSolutions:r.solutions};
        loadGamePuzzle(randomIndex);
        summary.textContent='コア候補付き3 ＋ 通常3 · ★を中央へ';
      };
      worker.onerror=()=>{stop();summary.textContent='生成できませんでした。「次のランダム問題」で再試行できます。';};
      worker.postMessage({catalog,maps,usage,recent});
    }catch(error){stop();summary.textContent='生成できませんでした。再読み込みしてお試しください。';}
  }
  toggle.addEventListener('click',()=>{if(active){stop();active=false;sync();loadGamePuzzle(0);}else generate();});
  next.addEventListener('click',generate);
  sync();
})();

