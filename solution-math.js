// All counts are rotation classes, not search paths or piece insertion orders.
(() => {
  function rotateMask(mask,map){let out=0;for(let i=0;i<27;i++)if(mask&(1<<i))out|=1<<map[i];return out;}
  const poseKey=p=>p.piece+':'+p.mask+':'+(p.coreMask||0);
  function expandSolutions(solutions,maps){
    return solutions.map(answer=>{
      const seen=new Set(),variants=[];
      for(const map of maps){
        const v=answer.map(p=>({piece:p.piece,mask:rotateMask(p.mask,map),coreMask:rotateMask(p.coreMask||0,map)}));
        const key=v.map(poseKey).sort().join('|');
        if(!seen.has(key)){seen.add(key);variants.push(v);}
      }
      return variants;
    });
  }
  function countRemaining(expanded,placed){
    return expanded.filter(variants=>variants.some(answer=>{
      const unused=answer.slice();
      for(const p of placed){const i=unused.findIndex(q=>q.piece===p.piece&&q.mask===p.mask&&(q.coreMask||0)===(p.coreMask||0));if(i<0)return false;unused.splice(i,1);}
      return true;
    })).length;
  }
  function earlyFreedom(set,solutions,maps){
    let floor=0;for(let x=0;x<3;x++)for(let z=0;z<3;z++)floor|=1<<(x*9+z);
    const firsts=new Set(),pairs=new Set();
    const pairKey=(a,b)=>a<b?a+'|'+b:b+'|'+a;
    for(const variants of expandSolutions(solutions,maps))for(const answer of variants){
      const grounded=answer.filter(p=>p.mask&floor);
      for(const p of grounded)firsts.add(poseKey(p));
      for(let i=0;i<grounded.length;i++)for(let j=i+1;j<grounded.length;j++)pairs.add(pairKey(poseKey(grounded[i]),poseKey(grounded[j])));
    }
    const poses=set.map(p=>p.placements.filter(q=>q.mask&floor).map(q=>({...q,key:poseKey({...q,piece:p.id})})));
    let totalFirst=0,validFirst=0,secondSum=0;
    for(let i=0;i<poses.length;i++){
      totalFirst+=poses[i].length;
      for(const p of poses[i])if(firsts.has(p.key)){
        validFirst++;let pieceSum=0,availablePieces=0;
        for(let j=0;j<poses.length;j++)if(j!==i){
          let possible=0,all=0;
          for(const q of poses[j])if(!(p.mask&q.mask)){all++;if(pairs.has(pairKey(p.key,q.key)))possible++;}
          if(all){availablePieces++;pieceSum+=possible/all;}
        }
        secondSum+=availablePieces?pieceSum/availablePieces:0;
      }
    }
    const first=validFirst/totalFirst,second=validFirst?secondSum/validFirst:0;
    // The user's main difficulty is move two. Do not let plentiful first moves
    // compensate for a very narrow second move.
    return {first,second,score:second};
  }
  const api={rotateMask,expandSolutions,countRemaining,earlyFreedom};
  if(typeof module!=='undefined')module.exports=api;else self.solutionMath=api;
})();

