export const GRID_SIZE = 20;

export const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const DEFAULT_DIRECTION = "right";

export function initState(rng = Math.random) {
  const mid = Math.floor(GRID_SIZE / 2);
  const snake = [
    { x: mid - 1, y: mid },
    { x: mid - 2, y: mid },
  ];

  const base = {
    snake,
    direction: DEFAULT_DIRECTION,
    nextDirection: DEFAULT_DIRECTION,
    food: null,
    score: 0,
    status: "ready",
  };

  return {
    ...base,
    food: placeFood(base, rng),
  };
}

export function setDirection(state, direction) {
  if (!DIRECTIONS[direction]) return state;
  if (isOpposite(direction, state.direction)) return state;
  return { ...state, nextDirection: direction };
}

export function advance(state, rng = Math.random) {
  if (state.status === "over" || state.status === "paused") return state;

  const direction = state.nextDirection;
  const head = state.snake[0];
  const delta = DIRECTIONS[direction];
  const nextHead = { x: head.x + delta.x, y: head.y + delta.y };

  const ateFood = state.food && positionsEqual(nextHead, state.food);
  const bodyToCheck = ateFood ? state.snake : state.snake.slice(0, -1);

  if (hitsWall(nextHead) || hitsSelf(nextHead, bodyToCheck)) {
    return { ...state, status: "over" };
  }

  const nextSnake = [nextHead, ...state.snake];
  if (!ateFood) nextSnake.pop();

  let nextFood = state.food;
  let nextScore = state.score;

  if (ateFood) {
    nextScore += 1;
    nextFood = placeFood({ ...state, snake: nextSnake }, rng);
  }

  return {
    ...state,
    snake: nextSnake,
    direction,
    food: nextFood,
    score: nextScore,
    status: "playing",
  };
}

export function togglePause(state) {
  if (state.status === "over" || state.status === "ready") return state;
  return { ...state, status: state.status === "paused" ? "playing" : "paused" };
}

export function restart(state, rng = Math.random) {
  return initState(rng);
}

export function placeFood(state, rng = Math.random) {
  const empty = [];
  const occupied = new Set(state.snake.map((pos) => `${pos.x},${pos.y}`));

  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const key = `${x},${y}`;
      if (!occupied.has(key)) empty.push({ x, y });
    }
  }

  if (empty.length === 0) return null;
  const index = Math.floor(rng() * empty.length);
  return empty[index];
}

export function hitsWall(pos) {
  return pos.x < 0 || pos.x >= GRID_SIZE || pos.y < 0 || pos.y >= GRID_SIZE;
}

export function hitsSelf(pos, snake) {
  return snake.some((segment) => positionsEqual(segment, pos));
}

export function positionsEqual(a, b) {
  return a.x === b.x && a.y === b.y;
}

export function isOpposite(a, b) {
  return (
    (a === "up" && b === "down") ||
    (a === "down" && b === "up") ||
    (a === "left" && b === "right") ||
    (a === "right" && b === "left")
  );
}
