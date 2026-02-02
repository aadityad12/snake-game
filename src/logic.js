export const GRID_SIZE = 20;

export const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const DEFAULT_DIRECTION = "right";

export function initState(mode = "single", rng = Math.random) {
  const mid = Math.floor(GRID_SIZE / 2);
  const snakes =
    mode === "multi"
      ? [
          [
            { x: mid - 4, y: mid },
            { x: mid - 5, y: mid },
          ],
          [
            { x: mid + 4, y: mid },
            { x: mid + 5, y: mid },
          ],
        ]
      : [
          [
            { x: mid - 1, y: mid },
            { x: mid - 2, y: mid },
          ],
        ];

  const directions = mode === "multi" ? ["right", "left"] : [DEFAULT_DIRECTION];

  const base = {
    mode,
    snakes,
    directions,
    nextDirections: [...directions],
    food: null,
    scores: directions.map(() => 0),
    status: "ready",
  };

  return {
    ...base,
    food: placeFood(base, rng),
  };
}

export function setDirection(state, playerIndex, direction) {
  if (!DIRECTIONS[direction]) return state;
  if (playerIndex < 0 || playerIndex >= state.snakes.length) return state;
  if (isOpposite(direction, state.directions[playerIndex])) return state;

  const nextDirections = [...state.nextDirections];
  nextDirections[playerIndex] = direction;
  return { ...state, nextDirections };
}

export function advance(state, rng = Math.random) {
  if (state.status === "over" || state.status === "paused") return state;

  const nextDirections = [...state.nextDirections];
  const nextHeads = state.snakes.map((snake, index) => {
    const head = snake[0];
    const delta = DIRECTIONS[nextDirections[index]];
    return { x: head.x + delta.x, y: head.y + delta.y };
  });

  const willGrow = nextHeads.map(
    (nextHead) => state.food && positionsEqual(nextHead, state.food)
  );

  const collisionBodies = state.snakes.map((snake, index) => {
    const end = willGrow[index] ? snake.length : Math.max(snake.length - 1, 1);
    return snake.slice(1, end);
  });

  let collision = false;

  nextHeads.forEach((nextHead) => {
    if (hitsWall(nextHead)) collision = true;
  });

  for (let i = 0; i < nextHeads.length; i += 1) {
    for (let j = i + 1; j < nextHeads.length; j += 1) {
      if (positionsEqual(nextHeads[i], nextHeads[j])) collision = true;
      const headI = state.snakes[i][0];
      const headJ = state.snakes[j][0];
      if (positionsEqual(nextHeads[i], headJ) && positionsEqual(nextHeads[j], headI)) {
        collision = true;
      }
    }
  }

  for (let i = 0; i < nextHeads.length; i += 1) {
    if (hitsSelf(nextHeads[i], collisionBodies[i])) collision = true;
    for (let j = 0; j < collisionBodies.length; j += 1) {
      if (i === j) continue;
      if (hitsSelf(nextHeads[i], collisionBodies[j])) collision = true;
    }
  }

  if (collision) {
    return { ...state, status: "over" };
  }

  const nextSnakes = state.snakes.map((snake, index) => {
    const nextSnake = [nextHeads[index], ...snake];
    if (!willGrow[index]) nextSnake.pop();
    return nextSnake;
  });

  const nextScores = state.scores.map(
    (score, index) => score + (willGrow[index] ? 1 : 0)
  );

  let nextFood = state.food;
  if (willGrow.some(Boolean)) {
    nextFood = placeFood({ ...state, snakes: nextSnakes }, rng);
  }

  return {
    ...state,
    snakes: nextSnakes,
    directions: nextDirections,
    nextDirections,
    food: nextFood,
    scores: nextScores,
    status: "playing",
  };
}

export function togglePause(state) {
  if (state.status === "over" || state.status === "ready") return state;
  return { ...state, status: state.status === "paused" ? "playing" : "paused" };
}

export function restart(state, rng = Math.random) {
  return initState(state.mode, rng);
}

export function placeFood(state, rng = Math.random) {
  const empty = [];
  const occupied = new Set(
    state.snakes.flat().map((pos) => `${pos.x},${pos.y}`)
  );

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
