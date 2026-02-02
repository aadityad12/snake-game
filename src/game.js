import {
  GRID_SIZE,
  initState,
  setDirection,
  advance,
  togglePause,
  restart,
} from "./logic.js";

const board = document.getElementById("board");
const scoreEl = document.getElementById("score");
const scoreP2El = document.getElementById("score-p2");
const highScoreEl = document.getElementById("high-score");
const highScoreWrap = document.getElementById("high-score-wrap");
const scoreLabel = document.getElementById("score-label");
const modeSelect = document.getElementById("mode");
const statusEl = document.getElementById("status");
const startBtn = document.getElementById("start");
const pauseBtn = document.getElementById("pause");
const restartBtn = document.getElementById("restart");
const themeToggle = document.getElementById("theme-toggle");
const dpadP1 = document.querySelector(".dpad.p1");
const dpadP2 = document.querySelector(".dpad.p2");

const BASE_TICK_MS = 500;
const MIN_TICK_MS = 10;
const SPEED_STEP_MS = 10;

let state = initState(modeSelect.value);
let timerId = null;
let currentTickMs = null;
const cells = [];
const HIGH_SCORE_KEY = "snake.highScore";
const THEME_KEY = "snake.theme";
let highScore = loadHighScore();

function loadHighScore() {
  const stored = window.localStorage.getItem(HIGH_SCORE_KEY);
  const parsed = Number.parseInt(stored ?? "0", 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function loadTheme() {
  const stored = window.localStorage.getItem(THEME_KEY);
  return stored === "dark" ? "dark" : "light";
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  if (themeToggle) {
    themeToggle.textContent = theme === "dark" ? "Light Mode" : "Dark Mode";
  }
}

function toggleTheme() {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  window.localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
}

function saveHighScore(nextScore) {
  highScore = nextScore;
  window.localStorage.setItem(HIGH_SCORE_KEY, String(nextScore));
}

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
    cell.classList.remove("snake-1", "snake-2", "head-1", "head-2");
  });

  state.snakes.forEach((snake, snakeIndex) => {
    snake.forEach((segment, index) => {
      const cell = cellAt(segment);
      if (!cell) return;
      const snakeClass = snakeIndex === 0 ? "snake-1" : "snake-2";
      const headClass = snakeIndex === 0 ? "head-1" : "head-2";
      cell.classList.add("snake", snakeClass);
      if (index === 0) cell.classList.add("head", headClass);
    });
  });

  if (state.food) {
    const foodCell = cellAt(state.food);
    if (foodCell) foodCell.classList.add("food");
  }

  scoreEl.textContent = String(state.scores[0] ?? 0);
  if (scoreP2El) scoreP2El.textContent = String(state.scores[1] ?? 0);
  if (highScoreEl) highScoreEl.textContent = String(highScore);

  if (scoreLabel) {
    scoreLabel.textContent = state.mode === "multi" ? "P1" : "Score";
  }

  if (scoreP2El) {
    const p2Wrap = scoreP2El.closest(".score");
    if (p2Wrap) p2Wrap.classList.toggle("hidden", state.mode !== "multi");
  }

  if (highScoreWrap) {
    highScoreWrap.classList.toggle("hidden", state.mode !== "single");
  }

  if (state.status === "ready") {
    statusEl.textContent =
      state.mode === "multi"
        ? "Player 1: WASD. Player 2: arrow keys."
        : "Press Start or hit any arrow/WASD key.";
  } else if (state.status === "paused") {
    statusEl.textContent = "Paused.";
  } else if (state.status === "over") {
    statusEl.textContent = "Game over. Press Restart.";
  } else {
    statusEl.textContent = "";
  }

  startBtn.disabled = state.status !== "ready";
  pauseBtn.disabled = state.status === "ready" || state.status === "over";

  if (modeSelect) {
    modeSelect.value = state.mode;
  }

  if (dpadP2) {
    dpadP2.classList.toggle("hidden", state.mode !== "multi");
  }
}

function tick() {
  state = advance(state);
  updateSpeed();
  if (state.mode === "single" && state.scores[0] > highScore) {
    saveHighScore(state.scores[0]);
  }
  render();

  if (state.status === "over") {
    stopLoop();
  }
}

function startLoop() {
  if (timerId) return;
  currentTickMs = getTickMs();
  timerId = window.setInterval(tick, currentTickMs);
}

function stopLoop() {
  if (!timerId) return;
  window.clearInterval(timerId);
  timerId = null;
  currentTickMs = null;
}

function getTickMs() {
  const totalScore = state.scores.reduce((sum, value) => sum + value, 0);
  const next = BASE_TICK_MS - totalScore * SPEED_STEP_MS;
  return Math.max(MIN_TICK_MS, next);
}

function updateSpeed() {
  if (!timerId) return;
  const desired = getTickMs();
  if (desired !== currentTickMs) {
    window.clearInterval(timerId);
    timerId = window.setInterval(tick, desired);
    currentTickMs = desired;
  }
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
  state = setDirection(state, 0, dir);
  render();
}

function handleDirectionP2(dir) {
  if (state.status === "ready") beginPlay();
  state = setDirection(state, 1, dir);
  render();
}

function onKeyDown(event) {
  const p1Map = {
    w: "up",
    a: "left",
    s: "down",
    d: "right",
    W: "up",
    A: "left",
    S: "down",
    D: "right",
  };

  const p2Map = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
  };

  const dir = p1Map[event.key];
  const dirP2 = p2Map[event.key];

  if (state.mode === "single") {
    const singleDir = dir || dirP2;
    if (singleDir) {
      event.preventDefault();
      handleDirection(singleDir);
      return;
    }
  } else {
    if (dir) {
      event.preventDefault();
      handleDirection(dir);
      return;
    }

    if (dirP2) {
      event.preventDefault();
      handleDirectionP2(dirP2);
      return;
    }
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

function onDpadP2Click(event) {
  const button = event.target.closest("button[data-dir]");
  if (!button) return;
  handleDirectionP2(button.dataset.dir);
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

function onModeChange(event) {
  stopLoop();
  state = initState(event.target.value);
  render();
}

buildBoard();
render();
applyTheme(loadTheme());

window.addEventListener("keydown", onKeyDown);
startBtn.addEventListener("click", onStart);
pauseBtn.addEventListener("click", onPause);
restartBtn.addEventListener("click", onRestart);
if (dpadP1) dpadP1.addEventListener("click", onDpadClick);
if (dpadP2) dpadP2.addEventListener("click", onDpadP2Click);
if (modeSelect) modeSelect.addEventListener("change", onModeChange);
if (themeToggle) themeToggle.addEventListener("click", toggleTheme);
