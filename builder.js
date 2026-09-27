(() => {
  const registeredPieces=SPECIAL_PIECES;
  // Keep the previous batch's local storage intact; the new six slots save separately.
  const storageKey='27cubes-original-piece-drafts-P12-P17-v1',gray='#aab2bd';
  const initial=()=>Array.from({length:6},(_,i)=>({id:'P'+String(i+12).padStart(2,'0'),cells:[[0,0,0],[1,0,0]],cores:[]}));
  let pieces;
  try{const saved=JSON.parse(localStorage.getItem(storageKey));pieces=Array.isArray(saved)&&saved.length===6?saved:initial();}catch{pieces=initial();}
  pieces.forEach(p=>{p.cores=(p.cores||[]).slice(0,1);delete p.color;});
  let selected=0,yaw=38,pitch=-23;
  const undo=[],keyOf=c=>c.join(',');
  const directions={front:[0,0,1],back:[0,0,-1],right:[1,0,0],left:[-1,0,0],top:[0,1,0],bottom:[0,-1,0]};
  const tabs=document.querySelector('#builderPieceTabs'),stage=document.querySelector('#builderStage');
  const name=document.querySelector('#builderPieceTitle'),count=document.querySelector('#builderPieceCount');
  const total=document.querySelector('#builderTotal'),coreMode=document.querySelector('#coreMode');
  const json=document.querySelector('#pieceSetJson'),copyStatus=document.querySelector('.builder-copy-status');
  function save(){try{localStorage.setItem(storageKey,JSON.stringify(pieces));}catch{copyStatus.textContent='自動保存できません。構成をコピーして保存してください。';}}
  function snapshot(){undo.push({pieces:JSON.stringify(pieces),selected});}
  function normalized(piece){
    const mins=[0,1,2].map(a=>Math.min(...piece.cells.map(c=>c[a])));
    const normalize=c=>c.map((v,a)=>v-mins[a]);
    const cubes=piece.cells.map(normalize).sort((a,b)=>a[0]-b[0]||a[1]-b[1]||a[2]-b[2]);
    return {id:piece.id,cubes,coreCandidates:piece.cores.map(normalize)};
  }
  function isUsed(p){const n=normalized(p);return n.coreCandidates.length>0||JSON.stringify(n.cubes)!=='[[0,0,0],[1,0,0]]';}
  function exportSet(){const shapes=pieces.filter(isUsed).map(normalized);return {format:'27cubes-piece-set-v1',grid:[3,3,3],pieces:shapes,totalCubes:shapes.reduce((n,p)=>n+p.cubes.length,0),coreCandidateCount:shapes.reduce((n,p)=>n+p.coreCandidates.length,0)};}
  function model(cells,coreCells,size,interactive=false){
    const root=document.createElement('div');root.className='builder-model';root.style.setProperty('--build-size',size+'px');root.style.setProperty('--piece-color',gray);
    root.style.transform='rotateX('+pitch+'deg) rotateY('+yaw+'deg)';
    const center=[0,1,2].map(a=>(Math.min(...cells.map(c=>c[a]))+Math.max(...cells.map(c=>c[a])))/2);
    const occupied=new Set(cells.map(keyOf));let ghost;
    function position(el,c){el.style.transform='translate3d('+((c[0]-center[0]-.5)*size)+'px,'+((-c[1]+center[1]-.5)*size)+'px,'+((c[2]-center[2])*size)+'px)';}
    function hideGhost(){ghost?.remove();ghost=null;}
    function makeCube(c,preview=false){
      const cube=document.createElement('div');cube.className='builder-cell'+(preview?' builder-ghost':'');position(cube,c);
      for(const [side,d] of Object.entries(directions)){
        const next=c.map((v,a)=>v+d[a]);if(!preview&&occupied.has(keyOf(next)))continue;
        const face=document.createElement(interactive&&!preview?'button':'i');face.className='builder-face '+side;
        const core=coreCells.some(v=>keyOf(v)===keyOf(c));
        if(core&&!preview){face.classList.add('is-core');face.textContent='✦';}
        if(interactive&&!preview){
          face.type='button';face.setAttribute('aria-label',coreMode.checked?'コア候補 '+c.join(','):side+'面に追加 '+next.join(','));
          function previewFace(){if(coreMode.checked)return;hideGhost();ghost=makeCube(next,true);root.appendChild(ghost);}
          face.addEventListener('pointerenter',previewFace);face.addEventListener('pointerleave',hideGhost);
          face.addEventListener('focus',previewFace);face.addEventListener('blur',hideGhost);
          face.addEventListener('click',()=>{
            snapshot();const p=pieces[selected];
            if(coreMode.checked)p.cores=p.cores.some(v=>keyOf(v)===keyOf(c))?[]:[c.slice()];
            else p.cells.push(next);
            save();render();
          });
        }
        cube.appendChild(face);
      }
      return cube;
    }
    cells.forEach(c=>root.appendChild(makeCube(c)));return root;
  }
  function render(){
    const piece=pieces[selected];tabs.innerHTML='';
    pieces.forEach((p,i)=>{
      const button=document.createElement('button');button.type='button';button.className='builder-piece-tab'+(i===selected?' is-selected':'');button.style.setProperty('--piece-color',gray);
      button.innerHTML='<b>'+p.id+'</b><span>'+(isUsed(p)?p.cells.length+' cubes':'未編集・不使用')+'</span>';
      button.addEventListener('click',()=>{selected=i;render();});tabs.appendChild(button);
    });
    stage.innerHTML='';
    const span=Math.max(...[0,1,2].map(a=>Math.max(...piece.cells.map(c=>c[a]))-Math.min(...piece.cells.map(c=>c[a]))+1));
    stage.appendChild(model(piece.cells,piece.cores,Math.min(46,210/(span+1)),true));
    const controls=document.createElement('div');controls.className='builder-view-controls';
    for(const [label,dx,dy] of [['左を見る',-90,0],['右を見る',90,0],['上を見る',0,-45],['下を見る',0,45]]){
      const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',()=>{yaw+=dx;pitch+=dy;render();});controls.appendChild(b);
    }
    stage.appendChild(controls);
    name.textContent=piece.id;name.style.setProperty('--piece-color',gray);count.textContent=piece.cells.length+' ブロック · コア候補 '+piece.cores.length+' / 1';
    const data=exportSet();total.textContent='使用 '+data.pieces.length+' / 6 ピース · 合計 '+data.totalCubes+' ブロック';
    document.querySelector('#undoCube').disabled=!undo.length;json.value=JSON.stringify(data,null,2);
  }
  coreMode.addEventListener('change',render);
  document.querySelector('#undoCube').addEventListener('click',()=>{if(!undo.length)return;const previous=undo.pop();pieces=JSON.parse(previous.pieces);selected=previous.selected;save();render();});
  document.querySelector('#copyPieceSet').addEventListener('click',async event=>{
    const button=event.currentTarget;json.value=JSON.stringify(exportSet(),null,2);
    try{await navigator.clipboard.writeText(json.value);copyStatus.textContent='編集済みの全ピースをコピーしました。チャットに貼り付けてください。';}
    catch{json.focus();json.select();copyStatus.textContent='JSONを選択しました。Ctrl+Cでコピーしてください。';}
    button.textContent='コピー済み';setTimeout(()=>button.textContent='構成をコピー',1500);
  });
  const catalog=document.createElement('section');catalog.className='builder-source-catalog';
  const heading=document.createElement('h3');heading.textContent='既存ピースから取り込む';catalog.appendChild(heading);
  const description=document.createElement('p');description.textContent='クリックすると、選択中の編集枠に形をコピーします。「1つ戻す」で取り消せます。';catalog.appendChild(description);
  const grid=document.createElement('div');grid.className='builder-source-grid';
  [...PIECES,...registeredPieces].forEach(p=>{
    const button=document.createElement('button');button.type='button';button.className='builder-source';button.setAttribute('aria-label',p.id+' を編集中のピースにコピー');
    const label=document.createElement('span');label.textContent=p.id+' · '+p.cubes.length;button.appendChild(label);
    button.appendChild(model(p.cubes,p.coreCandidates||[],22));
    button.addEventListener('click',()=>{snapshot();pieces[selected]={id:pieces[selected].id,cells:p.cubes.map(c=>c.slice()),cores:(p.coreCandidates||[]).map(c=>c.slice())};save();render();copyStatus.textContent=p.id+' を '+pieces[selected].id+' にコピーしました。';});grid.appendChild(button);
  });
  catalog.appendChild(grid);document.querySelector('.builder-panel').appendChild(catalog);
  save();render();
})();

