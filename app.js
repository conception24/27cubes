const PIECES = [
  { id: "b1", color: "blue", colorJa: "青", verified: true, cubes: [[0,0,0],[0,1,0],[0,2,0],[1,0,0],[1,1,0]] },
  { id: "b2", color: "blue", colorJa: "青", verified: true, cubes: [[0,0,0],[1,0,0],[1,1,0],[2,1,0],[2,1,1]] },
  { id: "b3", color: "blue", colorJa: "青", verified: true, cubes: [[0,0,0],[0,1,0],[0,2,0],[1,0,0],[1,0,-1]] },
  { id: "b4", color: "blue", colorJa: "青", verified: true, cubes: [[0,0,0],[1,0,0],[0,1,0]] },
  { id: "g1", color: "green", colorJa: "緑", verified: true, cubes: [[0,0,0],[0,1,0],[0,2,0],[1,0,0]] },
  { id: "g2", color: "green", colorJa: "緑", verified: true, cubes: [[0,0,0],[0,1,0],[0,2,0],[-1,1,0]] },
  { id: "g3", color: "green", colorJa: "緑", verified: true, cubes: [[0,0,0],[1,0,0],[1,1,0],[2,1,0],[2,1,-1]] },
  { id: "g4", color: "green", colorJa: "緑", verified: true, cubes: [[0,0,0],[0,1,0],[0,2,0],[-1,2,0],[-1,2,1]] },
  { id: "r1", color: "pink", colorJa: "桃", verified: true, cubes: [[0,0,0],[1,0,0],[1,1,0],[2,1,0]] },
  { id: "r2", color: "pink", colorJa: "桃", verified: true, cubes: [[0,0,0],[1,0,0],[1,1,0],[1,1,1]] },
  { id: "r3", color: "pink", colorJa: "桃", verified: true, cubes: [[0,0,0],[1,0,0],[0,1,0],[1,1,0],[0,0,1]] },
  { id: "r4", color: "pink", colorJa: "桃", verified: true, cubes: [[0,0,0],[0,1,0],[0,2,0],[1,0,0],[0,2,-1]] },
  { id: "y1", color: "yellow", colorJa: "黄", verified: true, cubes: [[0,0,0],[0,1,0],[0,2,0],[1,0,0],[1,2,0]] },
  { id: "y2", color: "yellow", colorJa: "黄", verified: true, cubes: [[0,0,0],[1,0,0],[2,0,0],[1,1,0],[2,0,1]] },
  { id: "y3", color: "yellow", colorJa: "黄", verified: true, cubes: [[0,1,0],[1,1,0],[0,0,1],[0,1,1]] },
  { id: "y4", color: "yellow", colorJa: "黄", verified: true, cubes: [[0,0,0],[0,1,0],[0,2,0],[1,0,0],[0,2,1]] }
];

const COLOR_HEX = { blue: "#3478b8", green: "#168642", pink: "#b84e8c", yellow: "#bf8610" };
const CUBE_COLORS = {
  blue: ["#559be0", "#3478b8", "#29669f", "#83baf0"],
  green: ["#2caf5c", "#168642", "#106f36", "#64d184"],
  pink: ["#ed74b9", "#b84e8c", "#9a3e74", "#f6a2d2"],
  yellow: ["#f2b91b", "#bf8610", "#a36f0b", "#ffd65b"]
};
const PUZZLES = [
  { id:"10-1", pieces:["b3","g1","g4","r2","r3","y3"] },
  { id:"10-2", pieces:["b1","b4","g2","r3","r4","y1"] },
  { id:"10-3", pieces:["b2","b4","g4","r1","r4","y2"] },
  { id:"10-4", pieces:["b1","g2","g3","r1","r2","y1"] },
  { id:"10-5", pieces:["b2","b4","g1","r3","y4","y4"] },
  { id:"10-6", pieces:["b1","b3","g1","g3","r2","y3"] }
];

const pieceEl = document.querySelector("#piece");
const viewport = document.querySelector("#viewport");
const grid = document.querySelector("#pieceGrid");
const title = document.querySelector("#pieceTitle");
const colorLabel = document.querySelector("#pieceColorLabel");
const count = document.querySelector("#cubeCount");
const commentInput = document.querySelector("#pieceComment");
const commentPieceId = document.querySelector("#commentPieceId");
const copyButton = document.querySelector("#copyCommentsBtn");
const saveStatus = document.querySelector("#saveStatus");
const selectedCubeLabel = document.querySelector("#selectedCube");
const verifiedBadge = document.querySelector("#verifiedBadge");
const size = 48;
const comments = JSON.parse(localStorage.getItem("make-cubes-piece-comments") || "{}");
const resolvedCommentIds = ["b2", "b3", "g3", "r4", "y2", "y3", "y4"];
if (!localStorage.getItem("make-cubes-resolution-2026-09-26-2")) {
  resolvedCommentIds.forEach(id => delete comments[id]);
  localStorage.setItem("make-cubes-piece-comments", JSON.stringify(comments));
  localStorage.setItem("make-cubes-resolution-2026-09-26-2", "done");
}
if (!localStorage.getItem("make-cubes-resolution-2026-09-26-3")) {
  delete comments.g3;
  localStorage.setItem("make-cubes-piece-comments", JSON.stringify(comments));
  localStorage.setItem("make-cubes-resolution-2026-09-26-3", "done");
}
let selected = 0;
let rotationX = -24;
let rotationY = 38;
let scale = 1.12;
let dragging = false;
let lastX = 0;
let lastY = 0;
let selectedCubeIndex = null;
let pressedCubeIndex = null;
let dragDistance = 0;

function selectCube(cubeIndex) {
  const current = PIECES[selected];
  const cubeName = `${current.id}-${cubeIndex + 1}`;
  selectedCubeIndex = cubeIndex;
  pieceEl.querySelectorAll(".cube").forEach((el, i) => el.classList.toggle("is-selected", i === cubeIndex));
  selectedCubeLabel.innerHTML = `選択中：<strong>${cubeName}</strong>　座標 [${current.cubes[cubeIndex].join(", ")}]`;
}

function centered(cubes) {
  const xs = cubes.map(c => c[0]), ys = cubes.map(c => c[1]), zs = cubes.map(c => c[2]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const cz = (Math.min(...zs) + Math.max(...zs)) / 2;
  return cubes.map(([x,y,z]) => [x-cx, y-cy, z-cz]);
}

function renderPiece() {
  const current = PIECES[selected];
  pieceEl.innerHTML = "";
  selectedCubeIndex = null;
  selectedCubeLabel.textContent = "キューブをクリックすると名前を表示";
  centered(current.cubes).forEach(([x,y,z], cubeIndex) => {
    const cube = document.createElement("div");
    cube.className = "cube";
    cube.dataset.cubeIndex = cubeIndex;
    const cubeName = `${current.id}-${cubeIndex + 1}`;
    cube.dataset.cubeName = cubeName;
    cube.style.transform = `translate3d(${x*size-size/2}px, ${-y*size-size/2}px, ${z*size}px)`;
    ["front","back","right","left","top","bottom"].forEach(side => {
      const face = document.createElement("div");
      face.className = `face ${side}`;
      face.dataset.cubeName = cubeName;
      cube.appendChild(face);
    });
    pieceEl.appendChild(cube);
  });
  title.textContent = current.id;
  colorLabel.textContent = current.colorJa;
  colorLabel.style.background = COLOR_HEX[current.color];
  pieceEl.dataset.color = current.color;
  verifiedBadge.hidden = !current.verified;
  count.textContent = current.cubes.length;
  commentPieceId.textContent = current.id;
  commentInput.value = comments[current.id] || "";
  document.querySelectorAll(".piece-option").forEach((el, i) => el.classList.toggle("is-active", i === selected));
  updateTransform();
}

function updateTransform() {
  pieceEl.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg) scale3d(${scale},${scale},${scale})`;
}

PIECES.forEach((piece, index) => {
  const button = document.createElement("button");
  button.className = "piece-option";
  button.type = "button";
  button.dataset.pieceId = piece.id;
  button.style.setProperty("--dot", COLOR_HEX[piece.color]);
  button.innerHTML = `<b>${piece.id}</b><span><i></i>${piece.colorJa} · ${piece.cubes.length} cubes</span>${piece.verified ? '<span class="ok">✓ OK済み</span>' : ''}`;
  button.addEventListener("click", () => { selected = index; renderPiece(); });
  grid.appendChild(button);
});

viewport.addEventListener("pointerdown", event => {
  dragging = true; lastX = event.clientX; lastY = event.clientY;
  dragDistance = 0;
  const pressedCube = event.target.closest?.(".cube");
  pressedCubeIndex = pressedCube ? Number(pressedCube.dataset.cubeIndex) : null;
  viewport.setPointerCapture(event.pointerId);
});
viewport.addEventListener("pointermove", event => {
  if (!dragging) return;
  const dx = event.clientX - lastX;
  const dy = event.clientY - lastY;
  dragDistance += Math.abs(dx) + Math.abs(dy);
  rotationY += dx * .55;
  rotationX -= dy * .55;
  rotationX = Math.max(-88, Math.min(88, rotationX));
  lastX = event.clientX; lastY = event.clientY;
  updateTransform();
});
viewport.addEventListener("pointerup", () => {
  if (dragDistance < 7 && pressedCubeIndex !== null) selectCube(pressedCubeIndex);
  dragging = false;
  pressedCubeIndex = null;
});
viewport.addEventListener("pointercancel", () => dragging = false);
viewport.addEventListener("wheel", event => {
  event.preventDefault();
  scale = Math.max(.65, Math.min(1.9, scale - event.deltaY * .001));
  updateTransform();
}, { passive:false });

document.querySelector("#resetBtn").addEventListener("click", () => { rotationX=-24; rotationY=38; scale=1.12; updateTransform(); });
document.querySelector("#zoomInBtn").addEventListener("click", () => { scale=Math.min(1.9,scale+.15); updateTransform(); });
document.querySelector("#zoomOutBtn").addEventListener("click", () => { scale=Math.max(.65,scale-.15); updateTransform(); });
function moveSelection(delta) {
  selected = (selected + delta + PIECES.length) % PIECES.length;
  renderPiece();
}

function updateVerification(piece, isVerified) {
  piece.verified = isVerified;
  if (PIECES[selected] === piece) verifiedBadge.hidden = !isVerified;
  const button = grid.querySelector(`[data-piece-id="${piece.id}"]`);
  if (!button) return;
  let badge = button.querySelector(".ok");
  if (isVerified && !badge) {
    badge = document.createElement("span");
    badge.className = "ok";
    badge.textContent = "✓ OK済み";
    button.appendChild(badge);
  } else if (!isVerified && badge) {
    badge.remove();
  }
}

document.addEventListener("keydown", event => {
  if (event.target.matches("textarea, input, select")) return;
  if (event.key === "ArrowLeft" || event.key === "ArrowUp") moveSelection(-1);
  else if (event.key === "ArrowRight" || event.key === "ArrowDown") moveSelection(1);
  else return;
  event.preventDefault();
});

commentInput.addEventListener("input", () => {
  const id = PIECES[selected].id;
  comments[id] = commentInput.value;
  localStorage.setItem("make-cubes-piece-comments", JSON.stringify(comments));
  updateVerification(PIECES[selected], !commentInput.value.trim());
  saveStatus.textContent = "保存しました";
  window.clearTimeout(commentInput.saveTimer);
  commentInput.saveTimer = window.setTimeout(() => saveStatus.textContent = "自動保存", 900);
});

copyButton.addEventListener("click", async () => {
  const text = PIECES.map(piece => `${piece.id}［${piece.colorJa}］: ${comments[piece.id]?.trim() || "（コメントなし）"}`).join("\n");
  try {
    await navigator.clipboard.writeText(text);
    copyButton.textContent = "コピーしました";
    copyButton.classList.add("is-copied");
    window.setTimeout(() => {
      copyButton.textContent = "全コメントをコピー";
      copyButton.classList.remove("is-copied");
    }, 1600);
  } catch {
    commentInput.value = text;
    commentInput.select();
    saveStatus.textContent = "コメント欄を選択しました。Ctrl+Cでコピーできます";
  }
});

renderPiece();

// --- 3×3×3 solver ---------------------------------------------------------
const puzzleResults = document.querySelector("#puzzleResults");
const solveAllButton = document.querySelector("#solveAllBtn");
const solutionEl = document.querySelector("#solutionCube");
const solutionViewport = document.querySelector("#solutionViewport");
const solverProblem = document.querySelector("#solverProblem");
const solverClock = document.querySelector("#solverClock");
const solverNodes = document.querySelector("#solverNodes");
const pieceLegend = document.querySelector("#pieceLegend");
const pieceById = Object.fromEntries(PIECES.map(p => [p.id, p]));
const solverCache = new Map();
let solutionRotationX = -25, solutionRotationY = 38;
let solutionDragging = false, solutionLastX = 0, solutionLastY = 0;
let animationToken = 0;

function permutationParity(p) {
  let inversions = 0;
  for (let i=0;i<3;i++) for (let j=i+1;j<3;j++) if (p[i] > p[j]) inversions++;
  return inversions % 2 ? -1 : 1;
}

function buildRotations() {
  const permutations = [[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];
  const rotations = [];
  for (const p of permutations) for (const sx of [-1,1]) for (const sy of [-1,1]) for (const sz of [-1,1]) {
    if (permutationParity(p) * sx * sy * sz !== 1) continue;
    rotations.push(([x,y,z]) => { const v=[x,y,z]; return [sx*v[p[0]],sy*v[p[1]],sz*v[p[2]]]; });
  }
  return rotations;
}
const ROTATIONS = buildRotations();

function placementMasks(piece) {
  const seenOrientations = new Set(), placements = [];
  for (const rotate of ROTATIONS) {
    let cells = piece.cubes.map(rotate);
    const mins = [0,1,2].map(axis => Math.min(...cells.map(c => c[axis])));
    cells = cells.map(c => c.map((v,axis) => v-mins[axis]));
    cells.sort((a,b) => a[0]-b[0] || a[1]-b[1] || a[2]-b[2]);
    const key = cells.map(c => c.join(",")).join(";");
    if (seenOrientations.has(key)) continue;
    seenOrientations.add(key);
    const maxs = [0,1,2].map(axis => Math.max(...cells.map(c => c[axis])));
    for (let dx=0;dx<3-maxs[0];dx++) for (let dy=0;dy<3-maxs[1];dy++) for (let dz=0;dz<3-maxs[2];dz++) {
      const shifted = cells.map(([x,y,z]) => [x+dx,y+dy,z+dz]);
      let mask = 0;
      shifted.forEach(([x,y,z]) => mask |= 1 << (x*9+y*3+z));
      placements.push({ mask, cells:shifted });
    }
  }
  return placements;
}
const ALL_PLACEMENTS = Object.fromEntries(PIECES.map(piece => [piece.id, placementMasks(piece)]));

function solvePuzzle(puzzle) {
  const counts = {}, instances = puzzle.pieces.map(id => {
    counts[id] = (counts[id] || 0) + 1;
    return { piece:id, instance:puzzle.pieces.filter(x => x === id).length > 1 ? `${id}#${counts[id]}` : id };
  });
  let nodes = 0, answer = null;
  const started = performance.now();
  function search(remaining, occupied, chosen) {
    nodes++;
    if (!remaining.length) { answer = chosen.slice(); return true; }
    let bestIndex = 0, bestOptions = null;
    for (let i=0;i<remaining.length;i++) {
      const options = ALL_PLACEMENTS[remaining[i].piece].filter(p => !(p.mask & occupied));
      if (!options.length) return false;
      if (!bestOptions || options.length < bestOptions.length) { bestIndex=i; bestOptions=options; }
    }
    const next = remaining[bestIndex];
    const rest = remaining.slice(0,bestIndex).concat(remaining.slice(bestIndex+1));
    for (const placement of bestOptions) {
      chosen.push({ ...next, cells:placement.cells });
      if (search(rest, occupied | placement.mask, chosen)) return true;
      chosen.pop();
    }
    return false;
  }
  search(instances, 0, []);
  return { solved:!!answer, placements:answer || [], nodes, elapsedMs:performance.now()-started };
}

function makeResultButtons() {
  puzzleResults.innerHTML = "";
  PUZZLES.forEach(puzzle => {
    const button = document.createElement("button");
    button.className = "puzzle-result";
    button.type = "button";
    button.dataset.puzzle = puzzle.id;
    button.innerHTML = `<b>${puzzle.id}</b><span>${puzzle.pieces.join(" · ")}</span>`;
    button.addEventListener("click", () => {
      if (!solverCache.has(puzzle.id)) return;
      showSolution(puzzle, solverCache.get(puzzle.id));
    });
    puzzleResults.appendChild(button);
  });
}

function applyCubeColors(cube, color) {
  const [front,side,dark,top] = CUBE_COLORS[color];
  cube.style.setProperty("--front", front);
  cube.style.setProperty("--side", side);
  cube.style.setProperty("--side-dark", dark);
  cube.style.setProperty("--top", top);
}

async function showSolution(puzzle, result) {
  const token = ++animationToken;
  document.querySelectorAll(".puzzle-result").forEach(el => el.classList.toggle("is-active", el.dataset.puzzle === puzzle.id));
  solverProblem.textContent = `${puzzle.id} / ${puzzle.pieces.join(" + ")}`;
  solverClock.innerHTML = `${result.elapsedMs.toFixed(3)} <small>ms</small>`;
  solverNodes.textContent = `${result.nodes.toLocaleString()} nodes / ${result.placements.length} pieces / 27 cubes`;
  solutionEl.innerHTML = "";
  pieceLegend.innerHTML = "";
  result.placements.forEach(({instance,piece,cells}, placementIndex) => {
    const color = pieceById[piece].color;
    const legend = document.createElement("span");
    legend.style.setProperty("--legend", COLOR_HEX[color]);
    legend.textContent = instance;
    pieceLegend.appendChild(legend);
    cells.forEach(([x,y,z], cubeIndex) => {
      const cube = document.createElement("div");
      cube.className = "cube";
      cube.dataset.placement = placementIndex;
      applyCubeColors(cube, color);
      const cubeName = `${instance}-${cubeIndex+1}`;
      cube.style.transform = `translate3d(${(x-1.5)*42}px, ${-(y-1.5)*42}px, ${(z-1)*42}px)`;
      ["front","back","right","left","top","bottom"].forEach(side => {
        const face = document.createElement("div");
        face.className = `face ${side}`;
        face.dataset.cubeName = cubeName;
        cube.appendChild(face);
      });
      solutionEl.appendChild(cube);
    });
  });
  updateSolutionTransform();
  for (let i=0;i<result.placements.length;i++) {
    if (token !== animationToken) return;
    solverNodes.textContent = `配置 ${i+1}/6：${result.placements[i].instance}`;
    solutionEl.querySelectorAll(`[data-placement="${i}"]`).forEach(cube => cube.classList.add("is-placed"));
    await new Promise(resolve => setTimeout(resolve, 190));
  }
  if (token === animationToken) solverNodes.textContent = `✓ 完成 / ${result.nodes.toLocaleString()} nodes / 27 cubes`;
}

function updateSolutionTransform() {
  solutionEl.style.transform = `rotateX(${solutionRotationX}deg) rotateY(${solutionRotationY}deg) scale3d(1.05,1.05,1.05)`;
}
solutionViewport.addEventListener("pointerdown", event => {
  solutionDragging=true; solutionLastX=event.clientX; solutionLastY=event.clientY;
  solutionViewport.setPointerCapture(event.pointerId);
});
solutionViewport.addEventListener("pointermove", event => {
  if (!solutionDragging) return;
  solutionRotationY += (event.clientX-solutionLastX)*.55;
  solutionRotationX -= (event.clientY-solutionLastY)*.55;
  solutionRotationX = Math.max(-88,Math.min(88,solutionRotationX));
  solutionLastX=event.clientX; solutionLastY=event.clientY; updateSolutionTransform();
});
solutionViewport.addEventListener("pointerup", () => solutionDragging=false);
solutionViewport.addEventListener("pointercancel", () => solutionDragging=false);

solveAllButton.addEventListener("click", async () => {
  solveAllButton.disabled = true;
  solveAllButton.textContent = "探索中…";
  solverProblem.textContent = "6問を探索しています";
  solverNodes.textContent = "回転・移動候補を生成中";
  await new Promise(resolve => requestAnimationFrame(resolve));
  for (const puzzle of PUZZLES) {
    const result = solvePuzzle(puzzle);
    solverCache.set(puzzle.id, result);
    const button = puzzleResults.querySelector(`[data-puzzle="${puzzle.id}"]`);
    button.classList.toggle("is-solved", result.solved);
    button.querySelector("span").textContent = result.solved ? `✓ ${result.elapsedMs.toFixed(3)} ms · ${result.nodes} nodes` : "解なし";
  }
  const total = [...solverCache.values()].reduce((sum,r) => sum+r.elapsedMs,0);
  solveAllButton.disabled = false;
  solveAllButton.textContent = `↻ もう一度解く（合計 ${total.toFixed(2)} ms）`;
  await showSolution(PUZZLES[0], solverCache.get(PUZZLES[0].id));
});

makeResultButtons();
updateSolutionTransform();

// --- Landscape touch game (right-handed) ---------------------------------
const playScreen = document.querySelector(".play-screen");
const gameBoard = document.querySelector("#gameBoard");
const boardFrame = document.querySelector("#boardFrame");
const dropPreview = document.querySelector("#dropPreview");
const placedPieces = document.querySelector("#placedPieces");
const boardZone = document.querySelector("#boardZone");
const pieceTray = document.querySelector("#pieceTray");
const rotatePad = document.querySelector("#rotatePad");
const activePieceName = document.querySelector("#activePieceName");
const dragGhost = document.querySelector("#dragGhost");
const gameToast = document.querySelector("#gameToast");
const boardStatus = document.querySelector("#boardStatus");
const gamePuzzleTabs = document.querySelector("#gamePuzzleTabs");
const soundToggle = document.querySelector("#soundToggle");
const reloadButton = document.querySelector("#reloadBtn");
let gamePuzzleIndex = 0;
let gameSolution = null;
let gameInstances = [];
let gamePlaced = new Set();
let activeGamePiece = null;
let gameRotations = {};
let boardRX = -24, boardRY = 38;
let boardDragging = false, boardLastX = 0, boardLastY = 0;
let longPressTimer = null, dragState = null, pressStart = null;
let soundOn = true, audioContext = null;
let manualPlacements = new Map();
let feasibilityWorker=null, feasibilityState='unknown';
let feasibilityRevision=0, feasibilityTimer=null;
let remainingView=false, alignmentFocus=null;
const remainingCells=document.querySelector('#remainingCells');
document.querySelector('#remainingViewBtn').addEventListener('click',()=>{
  remainingView=!remainingView;renderRemainingCells();
});
function renderRemainingCells(){
  boardZone.classList.toggle('show-remaining',remainingView);
  document.querySelector('#remainingViewBtn').setAttribute('aria-pressed',String(remainingView));
  remainingCells.innerHTML='';
  if(!remainingView)return;
  const occupied=new Set([...manualPlacements.values()].flatMap(p=>p.cells.map(c=>c.join(','))));
  for(let x=0;x<3;x++)for(let y=0;y<3;y++)for(let z=0;z<3;z++){
    if(occupied.has([x,y,z].join(',')))continue;
    const cube=document.createElement('div');cube.className='game-cube empty-cell';
    cube.style.setProperty('--cube-size','var(--game-cube-size)');cube.style.transform=gameTransform(x,y,z);gameFaces(cube);remainingCells.appendChild(cube);
  }
}
function updateBoardStatus() {
  boardZone.classList.toggle('is-impossible',feasibilityState==='impossible');
  const progress=`配置 ${gamePlaced.size} / 6`;
  boardStatus.textContent=feasibilityState==='impossible'?`${progress} · この配置からは完成できません`:gamePlaced.size===6?'完成！':`${progress} · ${feasibilityState==='checking'?'確認中…':feasibilityState==='unknown'?'判定を実行できません':'左親指で回転'}`;
}
function checkCompletion() {
  feasibilityWorker?.terminate();feasibilityWorker=null;
  clearTimeout(feasibilityTimer);const revision=++feasibilityRevision;
  feasibilityState='checking';updateBoardStatus();
  let occupied=0;
  for(const placement of manualPlacements.values())for(const [x,y,z] of placement.cells)occupied|=1<<(x*9+y*3+z);
  const pieces=gameInstances.filter(p=>!gamePlaced.has(p.instance)).map(p=>p.piece);
  const catalog=Object.fromEntries([...new Set(pieces)].map(id=>[id,ALL_PLACEMENTS[id].map(p=>p.mask)]));
  const fallback=()=>{
    if(revision!==feasibilityRevision)return;
    feasibilityWorker?.terminate();feasibilityWorker=null;clearTimeout(feasibilityTimer);
    try{feasibilityState=canComplete(occupied,pieces,catalog)?'possible':'impossible';}catch(error){feasibilityState='unknown';}
    updateBoardStatus();
  };
  // Small residual shapes are decided immediately, even if workers are unavailable.
  if(pieces.length<=2||typeof Worker==='undefined'){fallback();return;}
  try {
    const worker=new Worker('feasibility-worker.js?v=0.9.0');feasibilityWorker=worker;
    worker.onmessage=({data})=>{
      if(feasibilityWorker!==worker)return;
      if(data.error){fallback();return;}
      clearTimeout(feasibilityTimer);feasibilityState=data.possible?'possible':'impossible';
      updateBoardStatus();worker.terminate();feasibilityWorker=null;
    };
    worker.onerror=()=>{if(feasibilityWorker!==worker)return;fallback();};
    worker.postMessage({occupied,pieces,catalog});
    feasibilityTimer=setTimeout(fallback,1500);
  }catch(error){fallback();}
}
const initialView=()=>new DOMMatrix().rotateAxisAngle(1,0,0,-18).multiply(new DOMMatrix().rotateAxisAngle(0,1,0,28));
let boardOrientation = initialView();
let boardPointerId = null;
let boardYaw=28,boardPitch=-18;
function applyBoardView(){
  boardOrientation=new DOMMatrix().rotateAxisAngle(1,0,0,boardPitch).multiply(new DOMMatrix().rotateAxisAngle(0,1,0,boardYaw));
  gameBoard.style.transform=boardOrientation.scale(1.04).toString();updateAlignment();
  if(dragState)moveGhost(dragState.lastEvent);
}
const defaultPieceOrientation = initialView;
function screenTurn(matrix,dx,dy) {
  const distance=Math.hypot(dx,dy);
  return distance?new DOMMatrix().rotateAxisAngle(-dy,dx,0,distance*.7).multiply(matrix):matrix;
}

function alignmentAngle(piece,orientation) {
  const snapped=orientedCells(piece,orientation);
  const difference=boardOrientation.multiply(snapped.orientation).inverse().multiply(orientation);
  const cos=(difference.m11+difference.m22+difference.m33-1)/2;
  return Math.acos(Math.max(-1,Math.min(1,cos)))*180/Math.PI;
}

function updateAlignment() {
  for(const item of gameInstances){
    const button=pieceTray.querySelector(`[data-instance="${item.instance}"].tray-piece`);
    if(!button)continue;
    const aligned=alignmentFocus===item.instance&&alignmentAngle(item.piece,gameRotations[item.instance]||defaultPieceOrientation())<=9;
    button.classList.toggle('is-aligned',aligned);
    button.querySelector('.alignment-label').textContent=aligned?'向きOK':'';
  }
}

document.querySelector('#frontViewBtn').addEventListener('click',()=>{
  clearTimeout(longPressTimer);pressStart=null;dragState=null;boardPointerId=null;
  dragGhost.classList.remove('is-visible','has-preview');clearDropPreview();
  boardOrientation=new DOMMatrix();boardYaw=0;boardPitch=0;gameRotations=Object.fromEntries(gameInstances.map(p=>[p.instance,new DOMMatrix()]));alignmentFocus=null;
  gameBoard.style.transform=boardOrientation.scale(1.04).toString();
  renderGameTray();renderPlacedPieces();gameTone('rotate');
});
document.querySelector('#alignRemainingBtn').addEventListener('click',()=>{
  if(pressStart||dragState)return;
  alignmentFocus=null;
  for(const item of gameInstances){
    if(gamePlaced.has(item.instance))continue;
    const current=gameRotations[item.instance]||defaultPieceOrientation();
    gameRotations[item.instance]=boardOrientation.multiply(orientedCells(item.piece,current).orientation);
  }
  renderGameTray();gameTone('rotate');
});

function orientedCells(piece,screenOrientation) {
  const matrix=boardOrientation.inverse().multiply(screenOrientation);
  const source=pieceById[piece].cubes;
  const target=centered(source).map(([x,y,z])=>{const p=matrix.transformPoint({x,y:-y,z});return [p.x,-p.y,p.z];});
  let best=null,bestRotate=null,score=Infinity;
  for(const rotate of ROTATIONS){const cells=source.map(rotate),centers=centered(cells);const error=centers.reduce((s,c,i)=>s+c.reduce((t,v,a)=>t+(v-target[i][a])**2,0),0);if(error<score){score=error;best=cells;bestRotate=rotate;}}
  const mins=[0,1,2].map(a=>Math.min(...best.map(c=>c[a])));
  const columns=[[1,0,0],[0,-1,0],[0,0,1]].map(bestRotate).map(([x,y,z])=>[x,-y,z,0]);
  return {cells:best.map(c=>c.map((v,a)=>v-mins[a])),orientation:new DOMMatrix([...columns.flat(),0,0,0,1])};
}

function nearestDrop(event) {
  const snapped=orientedCells(dragState.piece,dragState.orientation);
  const cells=snapped.cells;
  const occupied=new Set([...manualPlacements.values()].filter(p=>p.instance!==dragState.instance).flatMap(p=>p.cells.map(c=>c.join(','))));
  const rect=boardZone.getBoundingClientRect(), s=parseFloat(getComputedStyle(playScreen).getPropertyValue('--game-cube-size'));
  const matrix=boardOrientation.scale(1.04);
  let best=null,distance=Infinity,previous=null,previousDistance=Infinity;
  const max=[0,1,2].map(a=>Math.max(...cells.map(c=>c[a])));
  for(let x=0;x<3-max[0];x++)for(let y=0;y<3-max[1];y++)for(let z=0;z<3-max[2];z++){
    const shifted=cells.map(c=>[c[0]+x,c[1]+y,c[2]+z]);
    if(shifted.some(c=>occupied.has(c.join(','))))continue;
    const centroid=[0,1,2].map(a=>shifted.reduce((sum,c)=>sum+c[a],0)/shifted.length);
    const p=matrix.transformPoint({x:(centroid[0]-1)*s,y:(1-centroid[1])*s,z:(centroid[2]-1)*s});
    const k=850/(850-p.z);
    const px=rect.left+rect.width*.5+((gameBoard.offsetLeft??rect.width*.5)-rect.width*.5+p.x)*k;
    const py=rect.top+rect.height*.5+((gameBoard.offsetTop??rect.height*.52)-rect.height*.5+p.y)*k;
    const d=Math.hypot(event.clientX-px,event.clientY-py);
    const candidate={instance:dragState.instance,piece:dragState.piece,cells:shifted,orientation:snapped.orientation};
    if(d<distance){distance=d;best=candidate;}
    if(dragState.candidate&&JSON.stringify(shifted)===JSON.stringify(dragState.candidate.cells)){previous=candidate;previousDistance=d;}
  }
  const radius=s*(dragState.pointerType==='touch'?2.2:1.6);
  if(previous&&previousDistance<radius*1.2&&previousDistance<=distance+10)return previous;
  return distance<radius?best:null;
}

function gameTone(kind) {
  if (!soundOn) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    const now=audioContext.currentTime, osc=audioContext.createOscillator(), gain=audioContext.createGain();
    const settings={ tap:[440,.035,"sine"], rotate:[620,.045,"triangle"], lift:[280,.07,"sine"], snap:[760,.13,"sine"], back:[220,.09,"triangle"], done:[980,.22,"sine"] }[kind] || [330,.05,"sine"];
    osc.type=settings[2]; osc.frequency.setValueAtTime(settings[0],now);
    if (kind==="snap") osc.frequency.exponentialRampToValueAtTime(1120,now+settings[1]);
    gain.gain.setValueAtTime(.0001,now); gain.gain.exponentialRampToValueAtTime(.13,now+.008); gain.gain.exponentialRampToValueAtTime(.0001,now+settings[1]);
    osc.connect(gain).connect(audioContext.destination); osc.start(now); osc.stop(now+settings[1]+.02);
  } catch {}
}

function gameFaces(cube, label="") {
  ["front","back","right","left","top","bottom"].forEach(side => {
    const face=document.createElement("div"); face.className=`face ${side}`; face.dataset.cubeName=label; cube.appendChild(face);
  });
}

function gameTransform(x,y,z,sizeVar="var(--game-cube-size)") {
  return `translate3d(calc(${sizeVar} * ${x-1.5}), calc(${sizeVar} * ${.5-y}), calc(${sizeVar} * ${z-1}))`;
}

function buildBoardFrame() {
  boardFrame.innerHTML="";
  for(let x=0;x<3;x++) for(let y=0;y<3;y++) for(let z=0;z<3;z++) {
    const cube=document.createElement("div"); cube.className="frame-cell"; cube.style.setProperty("--cube-size","var(--game-cube-size)");
    cube.style.transform=gameTransform(x,y,z); gameFaces(cube); boardFrame.appendChild(cube);
  }
}

function gameInstanceList(puzzle) {
  const totals={}, seen={}; puzzle.pieces.forEach(id => totals[id]=(totals[id]||0)+1);
  return puzzle.pieces.map(piece => { seen[piece]=(seen[piece]||0)+1; return {piece,instance:totals[piece]>1?`${piece}#${seen[piece]}`:piece}; });
}

function miniPieceModel(pieceId, className="tray-model") {
  const model=document.createElement("div"); model.className=className;
  const piece=pieceById[pieceId];
  const ghost=className==="ghost-model";
  centered(piece.cubes).forEach(([x,y,z]) => {
    const cube=document.createElement("div"); cube.className="cube"; applyCubeColors(cube,piece.color);
    cube.style.transform=ghost
      ? `translate3d(calc(var(--game-cube-size) * ${x} - var(--game-cube-size) / 2),calc(var(--game-cube-size) * ${-y} - var(--game-cube-size) / 2),calc(var(--game-cube-size) * ${z}))`
      : `translate3d(${x*22-11}px,${-y*22-11}px,${z*22}px)`;
    gameFaces(cube); model.appendChild(cube);
  });
  return model;
}

function renderGameTray() {
  pieceTray.innerHTML="";
  gameInstances.forEach(item => {
    const slot=document.createElement("div"); slot.className=`tray-slot${gamePlaced.has(item.instance)?" is-empty":""}`; slot.dataset.instance=item.instance;
    if (!gamePlaced.has(item.instance)) {
      const button=document.createElement("button"); button.className=`tray-piece${activeGamePiece===item.instance?" is-active":""}`;
      button.type="button"; button.dataset.instance=item.instance; button.dataset.piece=item.instance;
      button.setAttribute("aria-label",`${item.instance}。タップで選択、長押しで移動`);
      const model=miniPieceModel(item.piece);
      model.style.transform=(gameRotations[item.instance]||defaultPieceOrientation()).toString();
      button.appendChild(model); slot.appendChild(button);
      const label=document.createElement('span');label.className='alignment-label';button.appendChild(label);
      for(const [direction,symbol,x,y] of [['up','▲',90,0],['down','▼',-90,0],['left','◀',0,-90],['right','▶',0,90]]){
        const arrow=document.createElement('button');arrow.type='button';arrow.className=`turn-arrow turn-${direction}`;arrow.textContent=symbol;
        arrow.setAttribute('aria-label',`${item.instance} ${ {up:'上',down:'下',left:'左',right:'右'}[direction]}へ90度回転`);
        arrow.addEventListener('click',()=>{
          if(dragState||pressStart)return;
          alignmentFocus=item.instance;
          gameRotations[item.instance]=new DOMMatrix().rotate(x,y,0).multiply(gameRotations[item.instance]||defaultPieceOrientation());
          model.style.transform=gameRotations[item.instance].toString();gameTone('rotate');updateAlignment();
        });
        slot.appendChild(arrow);
      }
      for(const [direction,symbol,angle,label] of [['clockwise','↻',90,'時計回り'],['counterclockwise','↺',-90,'反時計回り']]){
        const button=document.createElement('button');button.type='button';button.className=`turn-arrow spin-arrow spin-${direction}`;button.textContent=symbol;
        button.setAttribute('aria-label',`${item.instance} ${label}に90度回転`);
        button.addEventListener('click',()=>{
          if(dragState||pressStart)return;
          alignmentFocus=item.instance;
          gameRotations[item.instance]=new DOMMatrix().rotateAxisAngle(0,0,1,angle).multiply(gameRotations[item.instance]||defaultPieceOrientation());
          model.style.transform=gameRotations[item.instance].toString();gameTone('rotate');updateAlignment();
        });
        slot.appendChild(button);
      }
    }
    pieceTray.appendChild(slot);
  });
  updateAlignment();
}

function renderPlacedPieces(newInstance=null) {
  placedPieces.innerHTML="";
  if (!gameSolution) return;
  [...manualPlacements.values()].forEach(placement => {
    const group=document.createElement("div");
    group.className=`placed-group${activeGamePiece===placement.instance?" is-active":""}${newInstance===placement.instance?" is-magnetic":""}`;
    group.dataset.instance=placement.instance; group.dataset.piece=placement.piece;
    placement.cells.forEach(([x,y,z],i) => {
      const cube=document.createElement("div"); cube.className="game-cube"; cube.style.setProperty("--cube-size","var(--game-cube-size)");
      cube.style.transform=gameTransform(x,y,z); applyCubeColors(cube,pieceById[placement.piece].color); gameFaces(cube,`${placement.instance}-${i+1}`); group.appendChild(cube);
    });
    placedPieces.appendChild(group);
  });
  updateBoardStatus();
  renderRemainingCells();
}

function contactFaces([x,y,z],occupied) {
  const directions={front:[0,0,1],back:[0,0,-1],right:[1,0,0],left:[-1,0,0],top:[0,1,0],bottom:[0,-1,0]};
  return Object.entries(directions).filter(([side,[dx,dy,dz]])=>(side==='bottom'&&y===0)||occupied.has([x+dx,y+dy,z+dz].join(','))).map(([side])=>side);
}

function renderDropPreview(instance) {
  dropPreview.innerHTML="";
  if (!gameSolution) return;
  const candidate=dragState?.candidate; if(!candidate) return;
  const occupied=new Set([...manualPlacements.values()].filter(p=>p.instance!==instance).flatMap(p=>p.cells.map(c=>c.join(","))));
  candidate.cells.forEach(([x,y,z]) => {
    const cube=document.createElement("div"); cube.className='preview-cube'; cube.style.setProperty("--cube-size","var(--game-cube-size)");
    cube.style.transform=gameTransform(x,y,z); gameFaces(cube);
    for(const side of contactFaces([x,y,z],occupied))cube.querySelector(`.${side}`).classList.add('contact-face');
    dropPreview.appendChild(cube);
    if(y===0){
      const footprint=document.createElement('div');footprint.className='contact-footprint';
      footprint.style.transform=`translate3d(calc(var(--game-cube-size)*${x-1.57}),calc(var(--game-cube-size)*.92),calc(var(--game-cube-size)*${z-1})) rotateX(90deg)`;
      dropPreview.appendChild(footprint);
    }
  });
}

function clearDropPreview() { dropPreview.innerHTML=""; boardZone.classList.remove("is-drop-target"); }

function selectGamePiece(instance) {
  alignmentFocus=instance;
  activeGamePiece=instance; rotatePad.hidden=false; activePieceName.textContent=instance; gameTone("tap");
  renderGameTray(); renderPlacedPieces();
}

function showGameToast(text) {
  gameToast.textContent=text; gameToast.classList.add("is-visible"); clearTimeout(gameToast.timer);
  gameToast.timer=setTimeout(()=>gameToast.classList.remove("is-visible"),900);
}

function loadGamePuzzle(index) {
  remainingView=false;alignmentFocus=null;
  clearTimeout(longPressTimer);pressStart=null;dragState=null;boardPointerId=null;dragGhost.classList.remove('is-visible');clearDropPreview();
  gamePuzzleIndex=index; const puzzle=PUZZLES[index];
  document.querySelector("#playTitle").textContent=puzzle.id;
  gameSolution={placements:[]}; manualPlacements.clear(); gameInstances=gameInstanceList(puzzle); gamePlaced.clear(); activeGamePiece=null; gameRotations={};
  rotatePad.hidden=true; boardStatus.textContent="左親指で回転";
  [...gamePuzzleTabs.children].forEach((b,i)=>b.classList.toggle("is-active",i===index));
  renderGameTray(); renderPlacedPieces();checkCompletion();
}

PUZZLES.forEach((puzzle,index) => {
  const button=document.createElement("button"); button.type="button"; button.textContent=puzzle.id; button.addEventListener("click",()=>loadGamePuzzle(index)); gamePuzzleTabs.appendChild(button);
});

document.querySelectorAll("[data-rotate]").forEach(button => button.addEventListener("click",() => {
  if (!activeGamePiece) return; const axis=button.dataset.rotate; gameRotations[activeGamePiece]||={x:0,y:0,z:0}; gameRotations[activeGamePiece][axis]+=90;
  gameTone("rotate"); renderGameTray(); showGameToast(`${activeGamePiece} ${axis.toUpperCase()}軸に90°`);
}));
soundToggle.addEventListener("click",() => { soundOn=!soundOn; soundToggle.setAttribute("aria-pressed",String(soundOn)); soundToggle.textContent=soundOn?"♪ 音 ON":"♪ 音 OFF"; if(soundOn) gameTone("tap"); });
reloadButton.addEventListener("click",() => window.location.reload());

function clearGameSelection() {
  if(!activeGamePiece) return;
  activeGamePiece=null; alignmentFocus=null; rotatePad.hidden=true;
  renderGameTray(); renderPlacedPieces();
}

function startPieceDrag(instance,piece,source,event) {
  const previous=manualPlacements.get(instance);
  const orientation=previous?boardOrientation.multiply(previous.orientation):(gameRotations[instance]||defaultPieceOrientation());
  dragState={instance,piece,source,pointerId:event.pointerId,pointerType:event.pointerType,orientation:new DOMMatrix(orientation.toString()),candidate:null,lastEvent:event,rotationPointer:null};
  activeGamePiece=null; alignmentFocus=null; rotatePad.hidden=true;
  pieceTray.querySelectorAll(".is-active").forEach(el=>el.classList.remove("is-active"));
  placedPieces.querySelectorAll(".is-active").forEach(el=>el.classList.remove("is-active"));
  if(source==="tray") pieceTray.querySelector(`.tray-piece[data-instance="${instance}"]`)?.classList.add("is-dragging-source");
  gameTone("lift");
  if(source==="board") placedPieces.querySelector(`[data-instance="${instance}"]`)?.classList.add("is-lifting");
  dragGhost.innerHTML=""; const model=document.createElement('div');model.className='ghost-model';
  centered(pieceById[piece].cubes).forEach(([x,y,z])=>{const cube=document.createElement('div');cube.className='cube';applyCubeColors(cube,pieceById[piece].color);cube.style.transform=`translate3d(calc(var(--game-cube-size)*${x-.5}),calc(var(--game-cube-size)*${-y-.5}),calc(var(--game-cube-size)*${z}))`;gameFaces(cube);model.appendChild(cube);});
  model.style.transform=dragState.orientation.toString();dragGhost.appendChild(model); dragGhost.classList.add("is-visible"); moveGhost(event);
}

function moveGhost(event) {
  dragState.lastEvent={clientX:event.clientX,clientY:event.clientY,pointerType:event.pointerType};
  const rect=playScreen.getBoundingClientRect();
  const touchOffset=dragState.pointerType==='touch'?(parseFloat(getComputedStyle(playScreen).getPropertyValue('--drag-ghost-offset-x'))||0):0;
  const point={clientX:event.clientX+touchOffset,clientY:event.clientY};
  dragGhost.style.left=`${point.clientX-rect.left}px`; dragGhost.style.top=`${point.clientY-rect.top}px`;
  dragGhost.querySelector('.ghost-model').style.transform=dragState.orientation.toString();
  const boardRect=boardZone.getBoundingClientRect();
  const trayRect=pieceTray.parentElement.getBoundingClientRect();
  const returning=dragState.source==='board'&&event.clientX>=trayRect.left&&event.clientX<=trayRect.right&&event.clientY>=trayRect.top&&event.clientY<=trayRect.bottom;
  const overBoard=!returning&&point.clientX>=boardRect.left&&point.clientX<=boardRect.right&&point.clientY>=boardRect.top&&point.clientY<=boardRect.bottom;
  boardZone.classList.toggle("is-drop-target",overBoard);
  dragState.candidate=overBoard?nearestDrop(point):null;
  dragGhost.classList.toggle('has-preview',!!dragState.candidate);
  if(overBoard) renderDropPreview(dragState.instance); else dropPreview.innerHTML="";
}

function finishPieceDrag(event) {
  if (!dragState) return;
  moveGhost(event);
  const trayRect=pieceTray.parentElement.getBoundingClientRect();
  const onTray=event.clientX>=trayRect.left&&event.clientX<=trayRect.right&&event.clientY>=trayRect.top&&event.clientY<=trayRect.bottom;
  if (dragState.source==='board'&&onTray) {
    gameRotations[dragState.instance]=dragState.orientation;
    manualPlacements.delete(dragState.instance);gamePlaced.delete(dragState.instance);
    gameTone('back');renderGameTray();renderPlacedPieces();checkCompletion();
  } else if (dragState.candidate) {
    manualPlacements.set(dragState.instance,dragState.candidate);
    gamePlaced.add(dragState.instance); activeGamePiece=null;alignmentFocus=null;gameTone("snap"); renderGameTray(); renderPlacedPieces(dragState.instance);checkCompletion();
    if(gamePlaced.size===6){ setTimeout(()=>gameTone("done"),160); showGameToast("完成！ 3×3×3"); }
  } else { gameTone("back"); renderGameTray(); renderPlacedPieces(); }
  dragGhost.classList.remove("is-visible"); dragGhost.innerHTML=""; clearDropPreview(); dragState=null;
}

playScreen.addEventListener("pointerdown",event => {
  if(dragState&&event.pointerId!==dragState.pointerId&&event.pointerType==='touch'){
    if(!dragState.rotationPointer&&event.pointerId!==boardPointerId){
      event.preventDefault();playScreen.setPointerCapture(event.pointerId);
      dragState.rotationPointer={id:event.pointerId,x:event.clientX,y:event.clientY};
    }
    return;
  }
  if(pressStart||dragState||event.pointerId===boardPointerId)return;
  const target=event.target.closest(".tray-piece,.placed-group");
  if(!target){clearGameSelection();return;}
  event.preventDefault(); playScreen.setPointerCapture(event.pointerId); pressStart={x:event.clientX,y:event.clientY,lastX:event.clientX,lastY:event.clientY,target,instance:target.dataset.instance,piece:gameInstances.find(i=>i.instance===target.dataset.instance)?.piece,source:target.classList.contains("placed-group")?"board":"tray",pointerId:event.pointerId,started:performance.now(),mode:"press"};
  longPressTimer=setTimeout(()=>{ if(pressStart?.mode==="press") startPieceDrag(pressStart.instance,pressStart.piece,pressStart.source,{pointerId:pressStart.pointerId,pointerType:event.pointerType,clientX:pressStart.lastX,clientY:pressStart.lastY}); },360);
});
playScreen.addEventListener("pointermove",event => {
  if(dragState?.rotationPointer?.id===event.pointerId){
    const p=dragState.rotationPointer;
    dragState.orientation=screenTurn(dragState.orientation,event.clientX-p.x,event.clientY-p.y);
    p.x=event.clientX;p.y=event.clientY;moveGhost(dragState.lastEvent);return;
  }
  if(dragState&&event.pointerId!==dragState.pointerId) return;
  if(pressStart&&event.pointerId!==pressStart.pointerId) return;
  if(dragState){ moveGhost(event); return; }
  if(!pressStart) return;
  const distance=Math.hypot(event.clientX-pressStart.x,event.clientY-pressStart.y);
  if(pressStart.source==="tray"&&(pressStart.mode==="turn"||distance>8)) {
    if(pressStart.mode!=="turn"){ clearTimeout(longPressTimer); pressStart.mode="turn"; pressStart.target.classList.add("is-turning"); }
    alignmentFocus=pressStart.instance;
    gameRotations[pressStart.instance]=screenTurn(gameRotations[pressStart.instance]||defaultPieceOrientation(),event.clientX-pressStart.lastX,event.clientY-pressStart.lastY);
    const r=gameRotations[pressStart.instance], model=pressStart.target.querySelector(".tray-model");
    if(model) model.style.transform=r.toString();
    updateAlignment();
    pressStart.lastX=event.clientX; pressStart.lastY=event.clientY;
  } else if(pressStart.source==="board") {
    pressStart.lastX=event.clientX;pressStart.lastY=event.clientY;
    // Once selected, a deliberate pull also lifts the piece; finger jitter never cancels the hold.
    if(activeGamePiece===pressStart.instance&&distance>14){clearTimeout(longPressTimer);startPieceDrag(pressStart.instance,pressStart.piece,'board',event);}
  }
});
playScreen.addEventListener("pointerup",event => {
  if(dragState?.rotationPointer?.id===event.pointerId){dragState.rotationPointer=null;return;}
  if(dragState&&event.pointerId!==dragState.pointerId) return;
  if(pressStart&&event.pointerId!==pressStart.pointerId) return;
  clearTimeout(longPressTimer);
  if(dragState) finishPieceDrag(event); else if(pressStart?.mode==="press") selectGamePiece(pressStart.instance); else if(pressStart?.mode==="turn") gameTone("rotate");
  pressStart=null;
});
playScreen.addEventListener("pointercancel",event => { if(dragState?.rotationPointer?.id===event.pointerId){dragState.rotationPointer=null;return;}if(event.pointerId!==(dragState?.pointerId??pressStart?.pointerId))return;clearTimeout(longPressTimer); dragState=null;dragGhost.classList.remove('is-visible');clearDropPreview();renderGameTray();renderPlacedPieces();pressStart=null; });

boardZone.addEventListener("pointerdown",event => {
  if(dragState||pressStart||event.target.closest('button')||boardPointerId!==null||event.target.closest('.placed-group')) return; boardPointerId=event.pointerId;boardLastX=event.clientX; boardLastY=event.clientY; boardZone.setPointerCapture(event.pointerId);
});
boardZone.addEventListener("pointermove",event => {
  if(event.pointerId!==boardPointerId) return;
  boardYaw+=(event.clientX-boardLastX)*.5;boardPitch=Math.max(-85,Math.min(85,boardPitch-(event.clientY-boardLastY)*.5));
  boardLastX=event.clientX;boardLastY=event.clientY;applyBoardView();
});
boardZone.addEventListener("pointerup",event=>{if(event.pointerId!==boardPointerId)return;boardPointerId=null;const nearest=Math.round(boardYaw/90)*90;if(Math.abs(boardYaw-nearest)<7)boardYaw=nearest;if(Math.abs(boardPitch)<7)boardPitch=0;applyBoardView();});
boardZone.addEventListener("pointercancel",event=>{if(event.pointerId===boardPointerId)boardPointerId=null;});

buildBoardFrame();
gameBoard.style.transform=boardOrientation.scale(1.04).toString();
loadGamePuzzle(0);

