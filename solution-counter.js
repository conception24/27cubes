(() => {
  const label=document.querySelector('#solutionCount');
  const maps=ROTATIONS.map(rotate=>Array.from({length:27},(_,i)=>{
    const c=rotate([Math.floor(i/9)-1,Math.floor(i/3)%3-1,i%3-1]);
    return (c[0]+1)*9+(c[1]+1)*3+c[2]+1;
  }));
  let worker=null,puzzleRef=null,revision=0,total=null,failed=false;
  const mask=cells=>cells.reduce((m,[x,y,z])=>m|(1<<(x*9+y*3+z)),0);
  function update(){
    const puzzle=PUZZLES[gamePuzzleIndex];
    if(puzzleRef!==puzzle){
      worker?.terminate();worker=null;puzzleRef=puzzle;total=null;failed=false;
      label.textContent='解答 集計中…';
      try{
        const next=new Worker('solution-worker.js?v=0.12.0');worker=next;
        const fail=()=>{if(worker!==next)return;failed=true;label.textContent='解答数 集計できません';next.terminate();worker=null;};
        next.onmessage=({data})=>{
          if(worker!==next)return;
          if(data.error){fail();return;}
          if(data.type==='ready'){total=data.total;update();return;}
          if(data.revision!==revision)return;
          label.textContent=`解答 ${data.remaining.toLocaleString()} / ${data.total.toLocaleString()}`;
          label.classList.toggle('no-solutions',data.remaining===0);
        };
        next.onerror=fail;
        next.postMessage({type:'init',set:puzzle.pieces.map(id=>({id,placements:ALL_PLACEMENTS[id]})),maps,coreRule:!!puzzle.coreRule,solutions:puzzle.allSolutions});
      }catch(error){failed=true;label.textContent='解答数 集計できません';}
    }
    revision++;label.classList.remove('no-solutions');
    if(!worker||failed)return;
    if(total!==null)label.textContent=`解答 … / ${total.toLocaleString()}`;
    worker.postMessage({type:'count',revision,placed:[...manualPlacements.values()].map(p=>({piece:p.piece,mask:mask(p.cells),coreMask:puzzle.coreRule?mask(coreCellsForPlacement(p)):0}))});
  }
  const original=checkCompletion;
  checkCompletion=function(){original();update();};
  update();
})();

