import {
  GRID_SIZE,
  initState,
  setDirection,
  advance,
  togglePause,
  restart,
  positionsEqual,
} from "./logic.js";

const board = document.getElementById("board");
const scoreEl = document.getElementById("score");
const statusEl = document.getElementById("status");
const startBtn = document.getElementById("start");
const pauseBtn = document.getElementById("pause");
const restartBtn = document.getElementById("restart");
const dpad = document.querySelector(".dpad");

const TICK_MS = 140;

let state = initState();
let timerId = null;
const cells = [];

function buildBoard() {
  board.innerHTML = "";
  cells.length = 0;

  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.x = String(x);
      cell.dataset.y = String(y);
      board.appendChild(cell);
      cells.push(cell);
    }
  }
}

function cellAt(pos) {
  return cells[pos.y * GRID_SIZE + pos.x];
}

function render() {
  cells.forEach((cell) => {
    cell.classList.remove("snake", "head", "food");
  });

  state.snake.forEach((segment, index) => {
    const cell = cellAt(segment);
    if (!cell) return;
    cell.classList.add("snake");
    if (index === 0) cell.classList.add("head");
  });

  if (state.food) {
    const foodCell = cellAt(state.food);
    if (foodCell) foodCell.classList.add("food");
  }

  scoreEl.textContent = String(state.score);

  if (state.status === "ready") {
    statusEl.textContent = "Press Start or hit any arrow/WASD key.";
  } else if (state.status === "paused") {
    statusEl.textContent = "Paused.";
  } else if (state.status === "over") {
    statusEl.textContent = "Game over. Press Restart.";
  } else {
    statusEl.textContent = "";
  }

  startBtn.disabled = state.status !== "ready";
  pauseBtn.disabled = state.status === "ready" || state.status === "over";
}

function tick() {
  state = advance(state);
  render();

  if (state.status === "over") {
    stopLoop();
  }
}

function startLoop() {
  if (timerId) return;
  timerId = window.setInterval(tick, TICK_MS);
}

function stopLoop() {
  if (!timerId) return;
  window.clearInterval(timerId);
  timerId = null;
}

function beginPlay() {
  if (state.status === "ready") {
    state = { ...state, status: "playing" };
    startLoop();
    render();
  }
}

function handleDirection(dir) {
  if (state.status === "ready") beginPlay();
  state = setDirection(state, dir);
  render();
}

function onKeyDown(event) {
  const map = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
    w: "up",
    a: "left",
    s: "down",
    d: "right",
    W: "up",
    A: "left",
    S: "down",
    D: "right",
  };

  const dir = map[event.key];
  if (dir) {
    event.preventDefault();
    handleDirection(dir);
  }

  if (event.key === " ") {
    event.preventDefault();
    togglePauseGame();
  }
}

function togglePauseGame() {
  const next = togglePause(state);
  if (next !== state) {
    state = next;
    if (state.status === "paused") {
      stopLoop();
    } else {
      startLoop();
    }
    render();
  }
}

function onDpadClick(event) {
  const button = event.target.closest("button[data-dir]");
  if (!button) return;
  handleDirection(button.dataset.dir);
}

function onStart() {
  beginPlay();
}

function onRestart() {
  stopLoop();
  state = restart(state);
  render();
}

function onPause() {
  togglePauseGame();
}

buildBoard();
render();

window.addEventListener("keydown", onKeyDown);
startBtn.addEventListener("click", onStart);
pauseBtn.addEventListener("click", onPause);
restartBtn.addEventListener("click", onRestart);
if (dpad) dpad.addEventListener("click", onDpadClick);
