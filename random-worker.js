const CENTER=1<<13,FULL=(1<<27)-1;
function shuffled(list){const a=list.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function canonicalSolution(solution,maps){
  const maskAfter=(mask,map)=>{let n=0;for(let i=0;i<27;i++)if(mask&(1<<i))n|=1<<map[i];return n;};
  return maps.map(map=>solution.slice().sort((a,b)=>a.piece.localeCompare(b.piece)).map(p=>p.piece+':'+maskAfter(p.mask,map)+':'+maskAfter(p.coreMask||0,map)).join('|')).sort()[0];
}
function solveCoreSet(set,maps,limit=3,budgetMs=250){
  const started=performance.now(),answers=[],keys=new Set();let nodes=0,timedOut=false;
  const options=set.map(p=>shuffled(p.placements.filter(q=>!(q.mask&CENTER)||(q.coreMask&CENTER))));
  function search(remaining,filled,chosen){
    if(answers.length>=limit||timedOut)return;
    if((++nodes&255)===0&&performance.now()-started>budgetMs){timedOut=true;return;}
    if(!remaining){if(filled!==FULL)return;const key=canonicalSolution(chosen,maps);if(!keys.has(key)){keys.add(key);answers.push(chosen.map(p=>({...p})));}return;}
    let choices=null;const covering=Array.from({length:27},()=>[]);
    for(let i=0;i<set.length;i++){
      if(!(remaining&(1<<i)))continue;
      const available=[];
      for(const p of options[i]){
        if(p.mask&filled)continue;
        const entry={i,p};available.push(entry);
        let bits=p.mask;while(bits){const bit=bits&-bits;covering[31-Math.clz32(bit)].push(entry);bits^=bit;}
      }
      if(!available.length)return;
      if(!choices||available.length<choices.length)choices=available;
    }
    for(let cell=0;cell<27;cell++)if(!(filled&(1<<cell))){
      if(!covering[cell].length)return;
      if(covering[cell].length<choices.length)choices=covering[cell];
    }
    for(const {i,p} of choices){
      search(remaining^(1<<i),filled|p.mask,chosen.concat({...p,piece:set[i].id,instance:set[i].id}));
      if(answers.length>=limit||timedOut)return;
    }
  }
  // One centered pose per candidate piece removes whole-cube rotational symmetry.
  for(const i of shuffled(set.map((_,i)=>i))){
    const center=options[i].find(p=>p.coreMask&CENTER);if(!center)continue;
    search(((1<<set.length)-1)^(1<<i),center.mask,[{...center,piece:set[i].id,instance:set[i].id}]);
    if(answers.length>=limit||timedOut)break;
  }
  return {solutions:answers,exhausted:!timedOut&&answers.length<limit,nodes,elapsedMs:performance.now()-started};
}
function coreCombinations(catalog){
  const sets=[];
  function choose(at,chosen,volume){
    if(chosen.length===6){if(volume===27)sets.push(chosen);return;}
    for(let i=at;i<catalog.length;i++)if(volume+catalog[i].volume<=27)choose(i+1,chosen.concat(catalog[i]),volume+catalog[i].volume);
  }
  choose(0,[],0);return sets;
}
function generateCorePuzzle({catalog,maps,usage={},recent=[]}){
  const started=performance.now(),special=catalog.filter(p=>p.special),old=catalog.filter(p=>!p.special);
  const signature=set=>set.map(p=>p.id).sort().join(',');
  const ranked=coreCombinations(special).map(set=>({set,score:set.reduce((n,p)=>n+(usage[p.id]||0),0)+Math.random()*5+(recent.includes(signature(set))?1000:0)})).sort((a,b)=>a.score-b.score);
  let fallback=null,attempts=0;
  function attempt(set){
    attempts++;const r=solveCoreSet(set,maps,3,250);
    if(r.solutions.length){const answer={...r,pieces:set.map(p=>p.id),specialCount:set.filter(p=>p.special).length,attempts,elapsedMs:performance.now()-started};if(r.solutions.length>=2)return answer;if(!fallback)fallback=answer;}
  }
  for(const {set} of ranked){const found=attempt(set);if(found)return found;if(performance.now()-started>7000)break;}
  // Prefer all-special output even when only one answer was found.
  if(fallback)return fallback;
  for(let n=0;n<160&&performance.now()-started<11000;n++){
    const set=shuffled(special).slice(0,5).concat(shuffled(old).slice(0,1));
    if(set.reduce((v,p)=>v+p.volume,0)!==27)continue;
    const found=attempt(set);if(found)return found;
  }
  if(fallback)return fallback;
  throw Error('時間内に問題が見つかりませんでした。もう一度お試しください。');
}
if(typeof self!=='undefined'&&typeof WorkerGlobalScope!=='undefined'&&self instanceof WorkerGlobalScope){
  self.onmessage=({data})=>{try{self.postMessage({result:generateCorePuzzle(data)});}catch(error){self.postMessage({error:error.message});}};
}
if(typeof module!=='undefined')module.exports={solveCoreSet,generateCorePuzzle,coreCombinations,canonicalSolution};

