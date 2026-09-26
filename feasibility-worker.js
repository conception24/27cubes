// Exact completion search. Placed cells stay fixed; unused pieces may rotate freely.
function canComplete(occupied, pieces, catalog) {
  const full=(1<<27)-1, failed=new Set();
  function search(filled,remaining) {
    if(!remaining)return filled===full;
    const key=filled+':'+remaining;
    if(failed.has(key))return false;
    let choices=null;
    const covering=Array.from({length:27},()=>[]);
    const seen=new Set();
    for(let i=0;i<pieces.length;i++) {
      if(!(remaining&(1<<i))||seen.has(pieces[i]))continue;
      seen.add(pieces[i]);
      const available=[];
      for(const mask of catalog[pieces[i]]) {
        if(mask&filled)continue;
        const candidate={index:i,mask};available.push(candidate);
        let bits=mask;
        while(bits){const bit=bits&-bits;covering[31-Math.clz32(bit)].push(candidate);bits^=bit;}
      }
      if(!available.length){failed.add(key);return false;}
      if(!choices||available.length<choices.length)choices=available;
    }
    for(let cell=0;cell<27;cell++) {
      if(filled&(1<<cell))continue;
      if(!covering[cell].length){failed.add(key);return false;}
      if(covering[cell].length<choices.length)choices=covering[cell];
    }
    for(const {index,mask} of choices)if(search(filled|mask,remaining^(1<<index)))return true;
    failed.add(key);return false;
  }
  return search(occupied,(1<<pieces.length)-1);
}
if(typeof WorkerGlobalScope!=='undefined'&&self instanceof WorkerGlobalScope)self.onmessage=({data})=>{
  try { self.postMessage({possible:canComplete(data.occupied,data.pieces,data.catalog)}); }
  catch(error){self.postMessage({error:String(error)});}
};
if(typeof module!=='undefined')module.exports={canComplete};

