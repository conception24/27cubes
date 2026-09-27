// Visual mode only: the existing piece geometry, placements and input stay shared.
(() => {
  const toggle=document.querySelector('#cosmicToggle');
  const shell=document.createElement('div');shell.className='cosmic-organism';shell.setAttribute('aria-hidden','true');
  for(const side of ['front','back','right','left','top','bottom']){
    const face=document.createElement('div');face.className=`cosmic-skin ${side}`;
    const eye=document.createElement('i');eye.className='cosmic-eye';face.appendChild(eye);shell.appendChild(face);
  }
  gameBoard.appendChild(shell);
  const panel=document.createElement('div');panel.className='cosmic-readout';
  panel.innerHTML='<span class="cosmic-eyebrow">XENO / 27</span><strong>星のかけらを、ひとつの生命へ。</strong><span class="cosmic-progress" role="status"></span><button type="button" class="cosmic-demo">誕生演出を見る</button>';
  boardZone.appendChild(panel);
  const progress=panel.querySelector('.cosmic-progress'),demoButton=panel.querySelector('button');
  let enabled=false,demo=false,wasBorn=false;
  const names=['ルミナ','ネブラ','セレネ','オルビス','ノヴァ','アステル'];
  function refresh(){
    const born=enabled&&(demo||(gamePlaced.size===6&&feasibilityState==='possible'));
    playScreen.classList.toggle('cosmic-born',born);
    playScreen.classList.toggle('cosmic-demoing',enabled&&demo);
    shell.style.setProperty('--organism-hue',`${gamePuzzleIndex*38}deg`);
    progress.textContent=born?`${names[gamePuzzleIndex]}が目覚めた。`:`融合 ${gamePlaced.size} / 6 · 6つのかけらを収めよう`;
    demoButton.textContent=demo?'パズルに戻る':'誕生演出を見る';
    if(born&&!wasBorn){gameTone('done');}
    wasBorn=born;
  }
  toggle.addEventListener('click',()=>{
    enabled=!enabled;demo=false;
    playScreen.classList.toggle('cosmic-mode',enabled);
    toggle.setAttribute('aria-pressed',String(enabled));
    toggle.textContent=enabled?'通常版に戻る':'宇宙生命体版を試す';
    document.querySelector('.version-label').textContent=enabled?'XENO / 27 v0.9.9':'仕様確認用 v0.9.9';
    refresh();
  });
  demoButton.addEventListener('click',()=>{demo=!demo;refresh();});
  const originalUpdate=updateBoardStatus;
  updateBoardStatus=function(){originalUpdate();refresh();};
  const originalLoad=loadGamePuzzle;
  loadGamePuzzle=function(index){demo=false;wasBorn=false;originalLoad(index);refresh();};
  // A piece interaction exits the visual preview without changing puzzle progress.
  playScreen.addEventListener('pointerdown',event=>{
    if(demo&&event.target.closest('.tray-piece')){demo=false;refresh();}
  },true);
  refresh();
})();

