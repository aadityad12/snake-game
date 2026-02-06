Original prompt: Build a classic Snake game in this repo.

Notes:
- Using `python3 -m http.server 5173` must be run from `snake-game` to serve `index.html` at `/`.

Update:
- Tightened layout spacing and board sizing to avoid scroll on full-screen.
- Added render_game_to_text and advanceTime hooks for automated testing.

Update:
- Moved UI to a right sidebar next to the board to remove vertical scrolling and wasted space on desktop.

Update:
- Added a sidebar controls hint block that updates based on mode.

Update:
- Added wrap-walls toggle (UI + logic) for both modes.

Update:
- Added Speed Level indicator based on tick-speed ramp.

Update:
- Persisted wrap-walls setting to localStorage and applied on load.
