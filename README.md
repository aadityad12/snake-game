# Snake Game

Classic Snake implemented with vanilla HTML/CSS/JS.

## Run

From this folder:

```bash
python3 -m http.server 5173
```

Then open `http://localhost:5173/` in your browser.

## Controls

- Arrow keys or WASD to steer.
- Player 2 uses IJKL in 2-player mode.
- Space to pause/resume.
- On-screen D-pad buttons on small screens (P1 and P2 in 2-player mode).

## Manual Verification Checklist

- Start the game, move with arrows/WASD, and confirm the snake advances one cell per tick.
- Eat food and verify the snake grows by one segment and score increments.
- Hit a wall or the snake itself and verify game-over appears.
- Restart and confirm score resets and a new food location appears.
- Pause/resume and confirm the snake stops/continues moving.
