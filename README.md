# Snake Game

Classic Snake implemented with vanilla HTML/CSS/JS.

## Run

From this folder:

```bash
python3 -m http.server 5173
```

Then open `http://localhost:5173/` in your browser.

## Controls

- Single player: arrow keys or WASD.
- 2-player mode: P1 uses WASD, P2 uses arrow keys.
- Space to pause/resume.
- On-screen D-pad buttons on small screens (P1 and P2 in 2-player mode).

## High Score

- Tracks the best score for single-player mode only.
- Stored locally in your browser (localStorage).

## Manual Verification Checklist

- Start the game, move with arrows/WASD, and confirm the snake advances one cell per tick.
- Eat food and verify the snake grows by one segment and score increments.
- Hit a wall or the snake itself and verify game-over appears.
- Restart and confirm score resets and a new food location appears.
- Pause/resume and confirm the snake stops/continues moving.
