importScripts('random-worker.js?v=0.12.1');
let expanded=[];
self.onmessage=({data})=>{
  try{
    if(data.type==='init'){
      const r=data.solutions?{solutions:data.solutions,exhausted:true}:solveCoreSet(data.set,data.maps,Infinity,20000,data.coreRule);
      if(!r.exhausted)throw Error('全解答の集計が時間内に完了しませんでした');
      expanded=solutionMath.expandSolutions(r.solutions,data.maps);
      self.postMessage({type:'ready',total:expanded.length});
    }else{
      self.postMessage({type:'count',revision:data.revision,total:expanded.length,remaining:solutionMath.countRemaining(expanded,data.placed)});
    }
  }catch(error){self.postMessage({error:error.message});}
};

