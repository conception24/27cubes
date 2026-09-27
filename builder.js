(() => {
  const colors=['#58a8ed','#43c77a','#ef84c1','#f4c344','#a58af2','#5ad9d0'];
  const key='27cubes-original-piece-set-v1';
  const initial=()=>Array.from({length:6},(_,i)=>({id:`P${String(i+1).padStart(2,'0')}`,color:colors[i],cells:[[0,0,0],[1,0,0]],cores:[]}));
  let pieces;
  try{const saved=JSON.parse(localStorage.getItem(key));pieces=Array.isArray(saved)&&saved.length===6?saved:initial();}catch{pieces=initial();}
  let selected=0,ghostKey=null;
  const undo=[];
  const tabs=document.querySelector('#builderPieceTabs'),stage=document.querySelector('#builderStage');
  const name=document.querySelector('#builderPieceTitle'),count=document.querySelector('#builderPieceCount');
  const total=document.querySelector('#builderTotal'),coreMode=document.querySelector('#coreMode');
  const json=document.querySelector('#pieceSetJson'),copyStatus=document.querySelector('.builder-copy-status');
  const keyOf=c=>c.join(','),directions=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
  const offset=(c,d)=>c.map((v,i)=>v+d[i]);
  function snapshot(){return JSON.stringify(pieces);}
  function save(){localStorage.setItem(key,snapshot());}
  function normalized(piece){
    const mins=[0,1,2].map(a=>Math.min(...piece.cells.map(c=>c[a])));
    const cells=piece.cells.map(c=>c.map((v,a)=>v-mins[a])).sort((a,b)=>a[0]-b[0]||a[1]-b[1]||a[2]-b[2]);
    const coreSet=new Set(piece.cores.map(c=>keyOf(c.map((v,a)=>v-mins[a]))));
    return {id:piece.id,color:piece.color,cubes:cells,coreCandidates:cells.filter(c=>coreSet.has(keyOf(c)))};
  }
  function exportSet(){const shapes=pieces.map(normalized);return {format:'27cubes-piece-set-v1',grid:[3,3,3],pieces:shapes,totalCubes:shapes.reduce((n,p)=>n+p.cubes.length,0),coreCandidateCount:shapes.reduce((n,p)=>n+p.coreCandidates.length,0)};}
  function render(){
    const piece=pieces[selected],occupied=new Set(piece.cells.map(keyOf)),targets=new Map();
    piece.cells.forEach(c=>directions.forEach(d=>{const next=offset(c,d),k=keyOf(next);if(!occupied.has(k))targets.set(k,next);}));
    tabs.innerHTML='';
    pieces.forEach((p,i)=>{const button=document.createElement('button');button.type='button';button.className=`builder-piece-tab${i===selected?' is-selected':''}`;button.style.setProperty('--piece-color',p.color);button.innerHTML=`<b>${p.id}</b><span>${p.cells.length} cubes</span>`;button.addEventListener('click',()=>{selected=i;ghostKey=null;render();});tabs.appendChild(button);});
    stage.innerHTML='';const extent=[0,1,2].map(a=>({min:Math.min(...piece.cells.map(c=>c[a])),max:Math.max(...piece.cells.map(c=>c[a]))}));
    const min=extent.map(e=>e.min),max=extent.map(e=>e.max),middle=max.map((v,a)=>(v-min[a])/2);
    function place(el,c){const x=(c[0]-middle[0]-(c[2]-middle[2]))*27;const y=(c[0]-middle[0]+c[2]-middle[2])*14-(c[1]-middle[1])*29;el.style.left=`calc(50% + ${x}px)`;el.style.top=`calc(50% + ${y}px)`;}
    function cubeElement(c,ghost=false){
      const cell=document.createElement(ghost?'button':'button');cell.type='button';cell.className=`builder-cell${ghost?' builder-ghost':''}${piece.cores.some(core=>keyOf(core)===keyOf(c))?' is-core':''}`;cell.style.setProperty('--piece-color',piece.color);place(cell,c);
      const cube=document.createElement('div');cube.className='builder-cube';
      for(const side of ['front','back','right','left','top','bottom']){const face=document.createElement('i');face.className=`builder-face ${side}`;cube.appendChild(face);}
      if(piece.cores.some(core=>keyOf(core)===keyOf(c))){const mark=document.createElement('span');mark.className='core-glyph';mark.textContent='✦';cube.appendChild(mark);}
      cell.appendChild(cube);
      if(ghost){cell.setAttribute('aria-label',`ブロックを追加 ${c.join(',')}`);cell.addEventListener('mouseenter',()=>{ghostKey=keyOf(c);stage.querySelectorAll('.builder-ghost').forEach(g=>g.classList.toggle('is-current',g===cell));});cell.addEventListener('mouseleave',()=>{if(ghostKey===keyOf(c))ghostKey=null;});cell.addEventListener('focus',()=>{ghostKey=keyOf(c);cell.classList.add('is-current');});cell.addEventListener('click',()=>{if(pieces.reduce((n,p)=>n+p.cells.length,0)>=27){copyStatus.textContent='合計27ブロックに達しています';return;}undo.push(snapshot());piece.cells.push(c);ghostKey=null;save();render();});}
      else {cell.setAttribute('aria-label',`${piece.id} ブロック ${c.join(',')}${cell.classList.contains('is-core')?' コア候補':''}`);cell.addEventListener('click',()=>{if(!coreMode.checked)return;undo.push(snapshot());const found=piece.cores.findIndex(core=>keyOf(core)===keyOf(c));if(found<0)piece.cores.push(c.slice());else piece.cores.splice(found,1);save();render();});}
      return cell;
    }
    piece.cells.forEach(c=>stage.appendChild(cubeElement(c)));
    targets.forEach(c=>stage.appendChild(cubeElement(c,true)));
    name.textContent=piece.id;name.style.setProperty('--piece-color',piece.color);count.textContent=`${piece.cells.length} ブロック · コア候補 ${piece.cores.length}`;
    total.textContent=`全6ピース ${pieces.reduce((n,p)=>n+p.cells.length,0)} / 27 ブロック`;
    document.querySelector('#undoCube').disabled=!undo.length;
    json.value=JSON.stringify(exportSet(),null,2);
  }
  document.querySelector('#undoCube').addEventListener('click',()=>{if(!undo.length)return;pieces=JSON.parse(undo.pop());save();render();});
  document.querySelector('#copyPieceSet').addEventListener('click',async event=>{
    json.value=JSON.stringify(exportSet(),null,2);json.focus();json.select();
    try{await navigator.clipboard.writeText(json.value);copyStatus.textContent='コピーしました。このJSONをチャットに貼り付けてください。';}
    catch{copyStatus.textContent='JSONを選択しました。コピーしてチャットに貼り付けてください。';}
    event.currentTarget.textContent='コピー済み';setTimeout(()=>event.currentTarget.textContent='構成をコピー',1500);
  });
  render();
})();

