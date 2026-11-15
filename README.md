# 🪵 Wood Screw Puzzle – Nuts & Bolts Game

An interactive full-stack wooden screw puzzle game built using HTML, CSS, JavaScript, and PowerShell. Players solve mechanical puzzles by strategically removing and rearranging screws to clear wooden planks from the board.

## 🎮 Project Overview

Wood Screw Puzzle is a browser-based logic game that combines puzzle-solving, physics-based interactions, and an interactive user interface. It includes multiple levels, game boosters, custom level creation, and player progress tracking.

## ✨ Key Features

- **20 Puzzle Levels:** Multiple levels with increasing difficulty.
- **Interactive Gameplay:** Remove and reposition screws to solve puzzles.
- **Physics-Based Mechanics:** Wooden planks swing and fall based on screw positions and gravity.
- **Game Boosters:**
  - Extra Hole – Create an additional hole.
  - Hammer – Remove an obstructing plank.
  - Undo – Reverse the previous move.
- **Custom Level Editor:** Create, customize, and test puzzle levels.
- **Leaderboard:** Store and retrieve player rankings.
- **Progress Tracking:** Save player progress and level completion.
- **Sound Effects:** Interactive audio using the Web Audio API.
- **Offline Mode:** Play directly in your browser using local storage.

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Game structure |
| CSS3 | Styling and responsive interface |
| JavaScript | Game logic and interactions |
| Canvas API | Game graphics and rendering |
| Web Audio API | Sound effects |
| PowerShell | Backend server |
| REST API | Frontend-backend communication |
| JSON | Data storage |

## 📂 Project Structure

```text
Wood_Screw_Puzzle/
│
├── backend/
│   ├── data/
│   │   ├── custom_levels.json
│   │   ├── leaderboard.json
│   │   └── progress.json
│   └── server.ps1
│
├── css/
│   └── style.css
│
├── js/
│   ├── api.js
│   ├── audio.js
│   ├── editor.js
│   ├── game.js
│   ├── levels.js
│   ├── physics.js
│   └── textures.js
│
├── index.html
├── GAME_README.md
├── start-game.bat
└── start-server.bat
```

## 🚀 How to Run the Project

### Option 1: Full-Stack Mode

1. Download or clone this repository.
2. Open the project folder.
3. Double-click `start-server.bat`.
4. The local server starts and opens the game in your browser.
5. Access the game at `http://127.0.0.1:8080`.

### Option 2: Offline Mode

1. Open the project folder.
2. Double-click `start-game.bat` or `index.html`.
3. Start playing in your browser.

## 🎯 How to Play

1. Select an exposed screw on the wooden board.
2. Move the screw to a valid empty hole.
3. Observe how the wooden planks move and fall.
4. Clear all wooden planks to complete the level.
5. Use boosters when you need help solving a puzzle.

## 📖 Documentation

For detailed information about the game architecture, backend API, physics mechanics, and gameplay, see [GAME_README.md](GAME_README.md).

## 👩‍💻 Developer

**Priti Kumari**

GitHub: [Priti356](https://github.com/Priti356)

---

⭐ If you find this project interesting, consider giving the repository a star!
