// ===============================
// 🎮 CONFIG & UI ELEMENTS
// ===============================

// --- ดึง element UI จากหน้า HTML ---
const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const resetBtn = document.getElementById("reset");
const currentPlayerEl = document.getElementById("current-player");
const pieceBtns = document.querySelectorAll(".piece-btn");

const smallLeftEl = document.getElementById("small-left");
const mediumLeftEl = document.getElementById("medium-left");
const largeLeftEl = document.getElementById("large-left");

const modeSelect = document.getElementById("mode");
const difficultySelect = document.getElementById("difficulty");

// ฟังก์ชันแปลงชื่อ X/O เป็นชื่อสี
function playerName(player) {
  return player === "X" ? "ผู้เล่นสีแดง" : "ผู้เล่นสีฟ้า";
}

// ===============================
// 🎮 GAME STATE
// ===============================

let mode = "2p";
let difficulty = "easy";
let currentPlayer = "X";
let selectedSize = null;
let selectedFrom = null;

// กระดาน 9 ช่อง แต่ละช่องเป็น stack
let board = Array(9).fill(null).map(() => []);

// จำนวนหมากที่เหลือ
let piecesLeft = {
  X: { small: 2, medium: 2, large: 2 },
  O: { small: 2, medium: 2, large: 2 }
};

// ===============================
// 🎛️ UI STATE CONTROL
// ===============================

function cancelSelectAll() {
  selectedSize = null;
  selectedFrom = null;
  pieceBtns.forEach(b => b.classList.remove("selected"));
  clearSelectedFrom();
  statusEl.textContent = `ตาของ${playerName(currentPlayer)}`;
}

modeSelect && modeSelect.addEventListener("change", e => mode = e.target.value);
difficultySelect && difficultySelect.addEventListener("change", e => difficulty = e.target.value);

// ===============================
// 🧱 BOARD CREATION + RENDERING
// ===============================

function createBoard() {
  boardEl.innerHTML = "";
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;
    cell.addEventListener("click", () => handleCellClick(i));
    boardEl.appendChild(cell);
  }
}

function renderBoard() {
  document.querySelectorAll(".cell").forEach((cell, i) => {
    cell.innerHTML = "";
    const stack = board[i];
    if (stack.length) {
      const top = stack[stack.length - 1];
      const piece = document.createElement("div");
      piece.classList.add("piece", top.player, top.size);
      cell.appendChild(piece);
    }
  });

  clearSelectedFrom();
  if (selectedFrom !== null) highlightSelectedFrom(selectedFrom);
}

function highlightSelectedFrom(i) {
  clearSelectedFrom();
  document.querySelectorAll(".cell")[i].classList.add("selected-from");
}

function clearSelectedFrom() {
  document.querySelectorAll(".cell").forEach(c => c.classList.remove("selected-from"));
}

// ===============================
// 👆 CELL CLICK HANDLING
// ===============================

function handleCellClick(index) {
  if (selectedFrom === index) return cancelSelectAll();

  const top = board[index][board[index].length - 1];

  // เลือกหมากเพื่อย้าย
  if (top && top.player === currentPlayer) {
    selectedFrom = index;
    selectedSize = null;
    pieceBtns.forEach(b => b.classList.remove("selected"));
    highlightSelectedFrom(index);
    statusEl.textContent = `เลือกจุดปลายทาง`;
    return;
  }

  // ย้ายหมาก
  if (selectedFrom !== null) {
    const movingPiece = board[selectedFrom][board[selectedFrom].length - 1];
    if (!movingPiece) return;
    if (!canPlace(index, currentPlayer, movingPiece.size, true)) return;

    board[selectedFrom].pop();
    board[index].push(movingPiece);

    clearSelectedFrom();
    selectedFrom = null;
    renderBoard();

    if (checkWinner()) return endGame(`${playerName(currentPlayer)} ชนะ!`);
    switchTurn();
    if (mode === "1p" && currentPlayer === "O") setTimeout(botMove, 600);
    return;
  }

  // วางหมาก
  if (selectedSize) {
    if (!canPlace(index, currentPlayer, selectedSize, false)) return;
    board[index].push({ player: currentPlayer, size: selectedSize });
    piecesLeft[currentPlayer][selectedSize]--;

    renderBoard();

    if (checkWinner()) return endGame(`${playerName(currentPlayer)} ชนะ!`);
    switchTurn();
    if (mode === "1p" && currentPlayer === "O") setTimeout(botMove, 600);
    return;
  }

  statusEl.textContent = `เลือกขนาดหมาก หรือแตะหมากของคุณเพื่อย้าย`;
}

// ===============================
// ✔️ MOVE VALIDATION
// ===============================

function canPlace(index, player, size, isMove = false) {
  const sizeOrder = ["small", "medium", "large"];
  const newVal = sizeOrder.indexOf(size);
  const stack = board[index];
  const top = stack[stack.length - 1];
  const topVal = top ? sizeOrder.indexOf(top.size) : -1;

  if (newVal <= topVal) return false;
  if (!isMove && piecesLeft[player][size] <= 0) return false;
  return true;
}

// ===============================
// 🔄 TURN CONTROL
// ===============================

function switchTurn() {
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  currentPlayerEl.textContent = currentPlayer;
  cancelSelectAll();
  updatePieceCounts();
}

// ===============================
// 🏆 WIN CHECKING
// ===============================

function checkWinner() {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (let [a,b,c] of wins) {
    const A = board[a][board[a].length - 1];
    const B = board[b][board[b].length - 1];
    const C = board[c][board[c].length - 1];
    if (A && B && C && A.player === B.player && B.player === C.player) return true;
  }
  return false;
}

function detectWinnerPlayer() {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (let [a,b,c] of wins) {
    const A = board[a][board[a].length - 1];
    const B = board[b][board[b].length - 1];
    const C = board[c][board[c].length - 1];
    if (A && B && C && A.player === B.player && B.player === C.player) return A.player;
  }
  return null;
}

// ===============================
// 🖼️ WIN POPUP
// ===============================

function showWinPopup(text) {
  const overlay = document.createElement("div");
  overlay.id = "win-overlay";
  overlay.innerHTML = `<div class="win-text">${text}</div>`;
  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.style.opacity = "0";
    setTimeout(() => overlay.remove(), 800);
  }, 1800);
}

function endGame(msg) {
  statusEl.textContent = `🎉 ${msg}`;
  document.querySelectorAll(".cell").forEach(c => c.style.pointerEvents = "none");
  showWinPopup(msg);
}

// ===============================
// 🔢 PIECE COUNTS UI
// ===============================

function updatePieceCounts() {
  smallLeftEl.textContent = piecesLeft[currentPlayer].small;
  mediumLeftEl.textContent = piecesLeft[currentPlayer].medium;
  largeLeftEl.textContent = piecesLeft[currentPlayer].large;
}

// ===============================
// 🤖 BOT ENGINE (MOVE GENERATION)
// ===============================

function generateAllMoves(player) {
  const sizeOrder = ["small","medium","large"];
  const moves = [];

  // วางหมากใหม่
  for (let s of sizeOrder) {
    if (piecesLeft[player][s] > 0) {
      for (let i = 0; i < 9; i++)
        if (canPlace(i, player, s)) moves.push({ type:"place", index:i, size:s });
    }
  }

  // ย้ายหมาก
  for (let from = 0; from < 9; from++) {
    const stack = board[from];
    if (!stack.length) continue;
    const top = stack[stack.length - 1];
    if (top.player !== player) continue;
    for (let to = 0; to < 9; to++)
      if (to !== from && canPlace(to, player, top.size, true))
        moves.push({ type:"move", from, to, size: top.size });
  }

  return moves;
}

// ===============================
// 🤖 BOT EXECUTION HELPERS
// ===============================

function applyMove(m, player) {
  if (m.type === "place") {
    board[m.index].push({ player, size: m.size });
    piecesLeft[player][m.size]--;
  } else {
    const mv = board[m.from].pop();
    board[m.to].push(mv);
  }
  renderBoard();
}

function undoMoveGeneric(m, player) {
  if (m.type === "place") {
    board[m.index].pop();
    piecesLeft[player][m.size]++;
  } else {
    const mv = board[m.to].pop();
    board[m.from].push(mv);
  }
}

// ===============================
// 🤖 BOT SEARCH (MINIMAX)
// ===============================

function minimaxBestMove(bot) {
  const opponent = bot === "O" ? "X" : "O";
  let bestScore = -Infinity, bestMove = null;
  const moves = generateAllMoves(bot);
  const depthLimit = 6;

  for (let m of moves) {
    applyMove(m, bot);
    let score = minimax(1, false, bot, opponent, -Infinity, Infinity, depthLimit);
    undoMoveGeneric(m, bot);
    if (score > bestScore) bestScore = score, bestMove = m;
  }
  return bestMove;
}

function minimax(depth, isMax, bot, human, alpha, beta, limit) {
  const winner = detectWinnerPlayer();
  if (winner === bot) return 100 - depth;
  if (winner === human) return -100 + depth;
  if (depth >= limit) return 0;

  const player = isMax ? bot : human;
  const moves = generateAllMoves(player);
  if (!moves.length) return 0;

  let bestScore = isMax ? -Infinity : Infinity;

  for (let m of moves) {
    applyMove(m, player);
    const score = minimax(depth+1, !isMax, bot, human, alpha, beta, limit);
    undoMoveGeneric(m, player);

    if (isMax) {
      bestScore = Math.max(bestScore, score);
      alpha = Math.max(alpha, score);
    } else {
      bestScore = Math.min(bestScore, score);
      beta = Math.min(beta, score);
    }

    if (beta <= alpha) break;
  }
  return bestScore;
}

// ===============================
// 🤖 BOT MOVE SELECTION
// ===============================

function botMove() {
  const bot = "O";
  const moves = generateAllMoves(bot);
  if (!moves.length) return endGame("เสมอ!");

  const move =
    difficulty === "easy"   ? moves[Math.floor(Math.random()*moves.length)] :
    difficulty === "medium" ? findWinningMoveGeneric(bot) || findBlockingMoveGeneric(bot) || moves[Math.floor(Math.random()*moves.length)] :
    difficulty === "hard"   ? findWinningMoveGeneric(bot) || findBlockingMoveGeneric(bot) || moves[Math.floor(Math.random()*moves.length)] :
    minimaxBestMove(bot) || moves[Math.floor(Math.random()*moves.length)];

  applyMove(move, bot);
  if (checkWinner()) return endGame(`🤖 บอทสีฟ้า (${difficulty}) ชนะ!`);
  switchTurn();
}

function findWinningMoveGeneric(player) {
  const moves = generateAllMoves(player);
  for (let m of moves) {
    applyMove(m, player);
    const win = checkWinner();
    undoMoveGeneric(m, player);
    if (win) return m;
  }
  return null;
}

function findBlockingMoveGeneric(bot) {
  const opponent = bot === "O" ? "X" : "O";
  const oppWin = findWinningMoveGeneric(opponent);
  if (!oppWin) return null;

  const moves = generateAllMoves(bot);
  for (let m of moves) {
    applyMove(m, bot);
    const stillWin = findWinningMoveGeneric(opponent);
    undoMoveGeneric(m, bot);
    if (!stillWin) return m;
  }
  return null;
}

// ===============================
// 🟦 PIECE BUTTON EVENTS
// ===============================

pieceBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    if (selectedSize === btn.dataset.size) return cancelSelectAll();
    pieceBtns.forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    selectedSize = btn.dataset.size;
    selectedFrom = null;
    clearSelectedFrom();
    statusEl.textContent = `เลือกช่องที่จะวางหมากขนาด ${selectedSize}`;
  });
});

// ===============================
// 🔁 RESET GAME
// ===============================

resetBtn.addEventListener("click", () => {
  currentPlayer = "X";
  cancelSelectAll();
  board = Array(9).fill(null).map(() => []);
  piecesLeft = { X:{small:2,medium:2,large:2}, O:{small:2,medium:2,large:2} };
  createBoard();
  renderBoard();
  currentPlayerEl.textContent = "X";
  updatePieceCounts();
  statusEl.textContent = "ผู้เล่นสีแดง เริ่มก่อน";
});

// ===============================
// ▶️ INIT
// ===============================

createBoard();
renderBoard();
updatePieceCounts();
