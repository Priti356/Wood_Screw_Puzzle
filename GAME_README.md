# Wood Puzzle Screw - Nuts & Bolts Logic Game

A complete, full-stack, hypercasual puzzle and logic game built from the ground up. Inspired by the hit wood screw/nuts & bolts puzzle genre, this web-based game combines realistic 2D rigid-body pendulum physics, dynamic gravity, wood crafting aesthetics, satisfying audio synthesis, and a REST API backend.

---

## 🌟 Highlights & Features

- **Realistic 2D Rigid-Body Physics**:
  - **Multi-Pin Anchoring**: Planks pinned by $\ge 2$ bolts are solidly locked in place.
  - **Single-Pin Pendulum Dynamics**: Planks held by 1 bolt become swinging pendulums that pivot under gravity with angular momentum, inertia, damping, and collision rebounds.
  - **Zero-Pin Free Fall**: Planks with 0 bolts tumble off the screen with gravity, triggering particle bursts and sound effects.
  - **Physical Occlusion**: Planks overlap in 3D layers; a screw can only be removed or inserted if unobstructed by solid wood.

- **20 Master-Crafted Levels**:
  - From introductory single-slat tutorials to intricate multi-tiered scissor linkages, rotating windmill hubs, fortress gates, and the 8-piece "Grandmaster's Lock".
  - Par move targets and 3-star rating evaluation.

- **Power-ups & Boosters**:
  - 🪚 **Extra Hole Booster**: Use the drill to punch a fresh empty hole anywhere on the board to escape deadlock.
  - 🔨 **Hammer Booster**: Smash and splinter any obstructing wooden plank into pieces.
  - ↩️ **Undo Booster**: Rewind your previous bolt moves.

- **In-Game Level Builder & Workshop**:
  - Interactive visual level editor right inside the browser.
  - Place custom backboard holes, choose wood finishes (Oak, Walnut, Pine, Mahogany, Birch, Cherry), customize plank dimensions and angles, insert bolts, and test play with one click.
  - Save directly to the full-stack REST API server or export/import levels.

- **Pure Web Audio API Sound Synthesizer**:
  - Electric screwdriver ratchets and mechanical whirs.
  - Metallic screw insertion and lock impacts.
  - Wooden friction creaks, clunks, and falling thuds.
  - Uplifting 7-note victory fanfare and soothing harmonic workshop ambient chords.
  - Zero external `.mp3` or `.wav` dependencies needed!

- **Procedural Canvas Woodworking Graphics**:
  - Canvas-rendered oak and walnut grain, knots, and chamfered bevel highlights.
  - Dynamic depth-based drop shadows that scale with plank layers.
  - Brushed brass, steel, copper, and gold screw heads with 3D doming and Phillips slots.

---

## 🏗️ Full-Stack Architecture

### 1. Backend (`backend/server.ps1`)
A zero-dependency, lightweight, high-performance HTTP & REST API server powered natively by PowerShell & .NET (`System.Net.Sockets.TcpListener`).

- **REST Endpoints**:
  - `GET /api/levels` — Fetch built-in and user-crafted community levels.
  - `POST /api/levels` — Save new custom levels to persistent JSON storage.
  - `GET /api/progress` — Fetch player stars, unlocked levels, and booster inventory.
  - `POST /api/progress` — Persist game state and level completions.
  - `GET /api/leaderboard` — Retrieve high score rankings sorted by stars and moves.
  - `POST /api/leaderboard` — Submit new player scores.
  - `GET /api/stats` — Server status, timestamp, and level counts.
- **Static File Engine**:
  - Serves HTML, CSS, JavaScript, JSON, and SVG with accurate MIME types and CORS support.
- **Data Persistence**:
  - File-based JSON database stored in `backend/data/`.

### 2. Frontend (`index.html`, `css/`, `js/`)
- `js/api.js`: Unified data layer that connects to the backend REST API, with transparent fallback to `localStorage` when offline.
- `js/physics.js`: Vector mathematics, angular torque, parallel axis theorem, pendulum constraints, and polygon/hole occlusion checks.
- `js/textures.js`: Procedural wood grain generator, bevel shaders, metallic radial gradients, and drop shadows.
- `js/audio.js`: Web Audio API sound generator for sound effects and ambient chords.
- `js/levels.js`: 20 progressive puzzle stages.
- `js/editor.js`: Custom level workshop and level tester.
- `js/game.js`: Canvas rendering loop, touch/mouse interaction, booster logic, particle systems, and modal management.

---

## 🚀 How to Run & Play

### Option 1: Full-Stack Mode (Recommended)
1. Double-click `start-server.bat` (or open PowerShell and run `powershell -ExecutionPolicy Bypass -File backend\server.ps1`).
2. The server will start on `http://127.0.0.1:8080` and automatically open your default web browser.
3. The top bar will display a green pill: **"Server: Online (REST API Active)"**.

### Option 2: Direct Browser Launch (Offline Mode)
1. Double-click `start-game.bat` or simply double-click `index.html`.
2. The game opens in your browser with 100% functionality.
3. High scores and progress are preserved in browser `localStorage`.

---

## 🎮 How to Play
1. **Tap any exposed screw** to unscrew it. It will raise and float with a glowing indicator.
2. **Tap any valid empty hole** on the backboard to drop and fasten the screw into place.
3. Observe how wooden planks swing when held by 1 screw, or fall completely when free.
4. Clear all wooden planks from the board to win!
5. Use boosters if you get stuck or want to clear difficult puzzles in fewer moves.

