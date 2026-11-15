/**
 * Main Game Controller for Wood Puzzle Screw & Bolt Game
 * Manages rendering loop, user interaction, animations, boosters, particles, and modals.
 */

const Game = (function() {
    // Logical board coordinates
    const BOARD_WIDTH = 540;
    const BOARD_HEIGHT = 780;

    let canvas, ctx;
    let scale = 1;
    let offsetX = 0;
    let offsetY = 0;

    let currentLevelIndex = 0; // 0-indexed (Level 1 is index 0)
    let allLevels = [];
    let gameState = {
        holes: [],
        screws: [],
        planks: [],
        width: BOARD_WIDTH,
        height: BOARD_HEIGHT
    };

    let selectedScrew = null;
    let movingScrew = null; // { screw, startX, startY, targetX, targetY, targetHoleId, progress, duration }
    let undoHistory = [];
    let moveCount = 0;
    let gameTimer = 0;
    let timerInterval = null;
    let isGameOver = false;
    let activeBooster = null; // 'extraHole', 'hammer'

    let particles = [];
    let playerProgress = null;

    // Initialize the game
    async function init() {
        canvas = document.getElementById('gameCanvas');
        ctx = canvas.getContext('2d');

        handleResize();
        window.addEventListener('resize', handleResize);
        setupInputHandlers();

        // Check backend server connection
        const online = await ApiService.checkHealth();
        updateServerStatusBadge(online);

        // Load progress
        playerProgress = await ApiService.getProgress();

        // Load built-in levels + any custom levels
        const customLevels = await ApiService.getCustomLevels();
        allLevels = [...LEVELS_DATA, ...customLevels];

        // Init Level Editor
        LevelEditor.init(startTestPlay);

        // Load initial level (highest unlocked or level 1)
        const startLevel = Math.min(playerProgress.unlockedLevel || 1, allLevels.length);
        loadLevel(startLevel - 1);

        // Update UI
        updateUI();

        // Start animation loop
        let lastTime = performance.now();
        function loop(now) {
            const dt = (now - lastTime) / 1000;
            lastTime = now;

            update(dt);
            render();

            requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);
    }

    function updateServerStatusBadge(isOnline) {
        const badge = document.getElementById('serverStatusBadge');
        if (!badge) return;
        if (isOnline) {
            badge.className = 'status-badge online';
            badge.innerHTML = '<span class="dot"></span> Server: Online (REST API Active)';
        } else {
            badge.className = 'status-badge offline';
            badge.innerHTML = '<span class="dot"></span> Server: Standalone (Local Storage)';
        }
    }

    // Handle high DPI resize and aspect-fit
    function handleResize() {
        const container = document.getElementById('canvasContainer');
        if (!container || !canvas) return;

        const rect = container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        // Maintain BOARD_WIDTH : BOARD_HEIGHT aspect ratio
        const aspect = BOARD_WIDTH / BOARD_HEIGHT;
        let w = rect.width;
        let h = rect.height;

        if (w / h > aspect) {
            w = h * aspect;
        } else {
            h = w / aspect;
        }

        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;

        scale = (w / BOARD_WIDTH) * dpr;
        offsetX = 0;
        offsetY = 0;
    }

    // Transform screen mouse/touch coordinates into logical game board coordinates
    function screenToLogical(clientX, clientY) {
        const rect = canvas.getBoundingClientRect();
        const px = clientX - rect.left;
        const py = clientY - rect.top;
        const dpr = window.devicePixelRatio || 1;

        return {
            x: (px * dpr) / scale,
            y: (py * dpr) / scale
        };
    }

    // Load a specific level
    function loadLevel(index) {
        if (index < 0 || index >= allLevels.length) index = 0;
        currentLevelIndex = index;
        const levelData = allLevels[index];

        // Deep copy level data
        gameState.holes = JSON.parse(JSON.stringify(levelData.holes));
        gameState.screws = JSON.parse(JSON.stringify(levelData.screws));
        gameState.planks = JSON.parse(JSON.stringify(levelData.planks));
        gameState.parMoves = levelData.parMoves || 6;
        gameState.title = levelData.title;

        // Reset plank physics state
        gameState.planks.forEach(p => {
            p.state = 'fixed';
            p.angularVelocity = 0;
            p.vx = 0;
            p.vy = 0;
        });

        // Callbacks for plank falls
        gameState.onPlankStartFall = function(plank) {
            spawnWoodChips(plank.x, plank.y, 16);
        };
        gameState.onPlankRemoved = function(plank) {
            checkVictory();
        };

        selectedScrew = null;
        movingScrew = null;
        undoHistory = [];
        moveCount = 0;
        isGameOver = false;
        activeBooster = null;
        particles = [];

        // Restart timer
        if (timerInterval) clearInterval(timerInterval);
        gameTimer = 0;
        timerInterval = setInterval(() => {
            if (!isGameOver) {
                gameTimer++;
                updateTimerDisplay();
            }
        }, 1000);

        updateUI();
        document.getElementById('levelTitleDisplay').textContent = levelData.title;
        document.getElementById('currentLevelNum').textContent = levelData.id;
    }

    function updateTimerDisplay() {
        const mins = Math.floor(gameTimer / 60).toString().padStart(2, '0');
        const secs = (gameTimer % 60).toString().padStart(2, '0');
        const timerElem = document.getElementById('timerDisplay');
        if (timerElem) timerElem.textContent = `${mins}:${secs}`;
    }

    // Save state before move for Undo booster
    function saveHistory() {
        const snapshot = {
            screws: JSON.parse(JSON.stringify(gameState.screws)),
            planks: JSON.parse(JSON.stringify(gameState.planks)),
            moveCount: moveCount
        };
        undoHistory.push(snapshot);
        if (undoHistory.length > 20) undoHistory.shift();
    }

    // Check if player won
    function checkVictory() {
        if (isGameOver) return;

        // Check if all planks are removed
        const remaining = gameState.planks.filter(p => p.state !== 'removed');
        if (remaining.length === 0) {
            isGameOver = true;
            if (timerInterval) clearInterval(timerInterval);

            // Calculate stars
            let stars = 1;
            if (moveCount <= gameState.parMoves) {
                stars = 3;
            } else if (moveCount <= gameState.parMoves * 1.5) {
                stars = 2;
            }

            // Confetti celebration
            spawnConfetti(BOARD_WIDTH / 2, BOARD_HEIGHT / 2, 70);
            SoundManager.playVictory();

            // Save progress
            const levelId = allLevels[currentLevelIndex].id.toString();
            const currentStars = playerProgress.levelStars[levelId] || 0;
            if (stars > currentStars) {
                playerProgress.levelStars[levelId] = stars;
            }

            if (currentLevelIndex + 2 > playerProgress.unlockedLevel) {
                playerProgress.unlockedLevel = currentLevelIndex + 2;
            }
            playerProgress.totalMoves += moveCount;
            playerProgress.puzzlesSolved += 1;

            ApiService.saveProgress(playerProgress);

            // Submit to leaderboard
            ApiService.submitScore({
                name: "Craftsman",
                level: currentLevelIndex + 1,
                stars: Object.values(playerProgress.levelStars).reduce((a, b) => a + b, 0),
                totalMoves: playerProgress.totalMoves
            });

            // Show level complete modal after brief delay
            setTimeout(() => {
                showVictoryModal(stars);
            }, 600);
        }
    }

    // Show Level Complete modal
    function showVictoryModal(stars) {
        const modal = document.getElementById('victoryModal');
        const starsContainer = document.getElementById('victoryStars');
        starsContainer.innerHTML = '';

        for (let i = 1; i <= 3; i++) {
            const span = document.createElement('span');
            span.className = i <= stars ? 'star filled' : 'star empty';
            span.innerHTML = '★';
            starsContainer.appendChild(span);
        }

        document.getElementById('victoryMoves').textContent = moveCount;
        document.getElementById('victoryPar').textContent = gameState.parMoves;
        document.getElementById('victoryTime').textContent = document.getElementById('timerDisplay').textContent;

        modal.classList.add('active');
    }

    // Setup User Input Handlers
    function setupInputHandlers() {
        const getPos = (e) => {
            if (e.touches && e.touches.length > 0) {
                return screenToLogical(e.touches[0].clientX, e.touches[0].clientY);
            }
            return screenToLogical(e.clientX, e.clientY);
        };

        const handleClick = (e) => {
            e.preventDefault();
            SoundManager.initContext();
            if (isGameOver) return;

            const pos = getPos(e);

            // Level Editor Mode handling
            if (LevelEditor.isActive()) {
                handleEditorClick(pos);
                return;
            }

            // Booster Mode handling
            if (activeBooster === 'extraHole') {
                useExtraHoleBooster(pos.x, pos.y);
                return;
            }
            if (activeBooster === 'hammer') {
                useHammerBooster(pos.x, pos.y);
                return;
            }

            // Normal Gameplay: Clicking a screw or a hole
            handleGameClick(pos.x, pos.y);
        };

        canvas.addEventListener('click', handleClick);
        canvas.addEventListener('touchstart', handleClick, { passive: false });
    }

    // Handle clicks when in Level Editor mode
    function handleEditorClick(pos) {
        const mode = LevelEditor.getMode();
        if (mode === 'holes') {
            const newHole = LevelEditor.addHole(pos.x, pos.y);
            if (newHole) {
                gameState.holes.push(newHole);
                SoundManager.playClick();
                spawnWoodDust(pos.x, pos.y, 6);
            }
        } else if (mode === 'planks') {
            const newPlank = LevelEditor.addPlank(pos.x, pos.y);
            if (newPlank) {
                gameState.planks.push(newPlank);
                LevelEditor.snapPlankHolesToBoard(newPlank);
                SoundManager.playClick();
            }
        } else if (mode === 'screws') {
            LevelEditor.toggleScrewAt(pos.x, pos.y);
            const draft = LevelEditor.getDraft();
            gameState.screws = draft.screws;
            SoundManager.playScrewIn();
        }
    }

    // Game interaction logic
    function handleGameClick(x, y) {
        // 1. Check if clicking on an existing screw
        const clickedScrew = findClickedScrew(x, y);

        if (clickedScrew) {
            // Can this screw be accessed? (Check if an unaligned plank is covering it)
            if (isScrewCoveredByWood(clickedScrew)) {
                SoundManager.playError();
                spawnSparks(clickedScrew.x, clickedScrew.y, '#f87171');
                return;
            }

            if (selectedScrew === clickedScrew) {
                // Clicking already selected screw -> screw it back down
                selectedScrew.state = 'screwed';
                selectedScrew = null;
                SoundManager.playClick();
            } else {
                // Select and unscrew this bolt!
                if (selectedScrew) {
                    selectedScrew.state = 'screwed';
                }
                selectedScrew = clickedScrew;
                selectedScrew.state = 'selected';
                selectedScrew.rotation = 0;
                SoundManager.playUnscrew();
                spawnWoodDust(clickedScrew.x, clickedScrew.y, 8);
            }
            updateUI();
            return;
        }

        // 2. If a screw is currently selected, check if player clicked a valid empty hole
        if (selectedScrew) {
            const clickedHole = findClickedHole(x, y);

            if (clickedHole) {
                // Hole already occupied by another screw?
                const isOccupied = gameState.screws.some(s => s !== selectedScrew && s.boardHoleId === clickedHole.id);
                if (isOccupied) {
                    SoundManager.playError();
                    return;
                }

                // Check if this hole is blocked by any plank
                let isBlocked = false;
                for (let plank of gameState.planks) {
                    if (Physics.isBoardHoleBlockedByPlank(clickedHole, plank)) {
                        isBlocked = true;
                        break;
                    }
                }

                if (isBlocked) {
                    // Blocked by wood!
                    SoundManager.playError();
                    spawnSparks(clickedHole.x, clickedHole.y, '#f87171');
                    return;
                }

                // VALID DROP! Move screw to this hole!
                saveHistory();

                // Start screw moving animation
                const targetHoleId = clickedHole.id;
                movingScrew = {
                    screw: selectedScrew,
                    startX: selectedScrew.x,
                    startY: selectedScrew.y,
                    targetX: clickedHole.x,
                    targetY: clickedHole.y,
                    targetHoleId: targetHoleId,
                    progress: 0,
                    duration: 0.22
                };

                selectedScrew.state = 'moving';
                selectedScrew = null;
                moveCount++;
                updateUI();
            }
        }
    }

    // Find screw at (x, y)
    function findClickedScrew(x, y) {
        for (let i = gameState.screws.length - 1; i >= 0; i--) {
            const s = gameState.screws[i];
            const d = Math.hypot(s.x - x, s.y - y);
            if (d <= (s.radius || 18) * 1.35) {
                return s;
            }
        }
        return null;
    }

    // Find backboard hole at (x, y)
    function findClickedHole(x, y) {
        for (let h of gameState.holes) {
            const d = Math.hypot(h.x - x, h.y - y);
            if (d <= 26) {
                return h;
            }
        }
        return null;
    }

    // Check if screw is covered by a plank that lacks an aligned hole
    function isScrewCoveredByWood(screw) {
        // Planks with higher layer can cover lower ones
        for (let plank of gameState.planks) {
            if (plank.state === 'falling' || plank.state === 'removed') continue;
            if (Physics.isPointInsidePlank(screw.x, screw.y, plank)) {
                // Check if plank has an aligned hole
                let hasHole = false;
                for (let h of plank.holes) {
                    const worldHole = Physics.localToWorld(h.x, h.y, plank);
                    if (Physics.distance(worldHole, screw) <= 12) {
                        hasHole = true;
                        break;
                    }
                }
                if (!hasHole) {
                    return true; // Plank wood is covering the screw!
                }
            }
        }
        return false;
    }

    // Boosters implementation
    function activateBooster(type) {
        if (isGameOver) return;
        SoundManager.playClick();

        if (type === 'undo') {
            performUndo();
            return;
        }

        if (activeBooster === type) {
            activeBooster = null; // Toggle off
        } else {
            if (playerProgress.boosters[type === 'extraHole' ? 'extraHoles' : 'hammers'] <= 0) {
                alert('No more boosters remaining! Complete puzzles to earn more.');
                return;
            }
            activeBooster = type;
        }
        updateUI();
    }

    function useExtraHoleBooster(x, y) {
        // Check bounds
        if (x < 60 || x > BOARD_WIDTH - 60 || y < 120 || y > BOARD_HEIGHT - 120) {
            SoundManager.playError();
            return;
        }

        // Add hole
        const newId = 'h_extra_' + Date.now();
        gameState.holes.push({ id: newId, x, y });

        SoundManager.playDrill();
        spawnWoodDust(x, y, 25);

        playerProgress.boosters.extraHoles--;
        ApiService.saveProgress(playerProgress);
        activeBooster = null;
        updateUI();
    }

    function useHammerBooster(x, y) {
        // Find which plank was clicked
        let clickedPlank = null;
        for (let i = gameState.planks.length - 1; i >= 0; i--) {
            const p = gameState.planks[i];
            if (p.state !== 'removed' && Physics.isPointInsidePlank(x, y, p)) {
                clickedPlank = p;
                break;
            }
        }

        if (!clickedPlank) {
            SoundManager.playError();
            return;
        }

        // Destroy the plank!
        clickedPlank.state = 'removed';
        SoundManager.playHammer();
        spawnWoodSplinters(clickedPlank.x, clickedPlank.y, clickedPlank.woodType, 30);

        playerProgress.boosters.hammers--;
        ApiService.saveProgress(playerProgress);
        activeBooster = null;
        updateUI();

        checkVictory();
    }

    function performUndo() {
        if (undoHistory.length === 0) {
            SoundManager.playError();
            return;
        }
        if (playerProgress.boosters.undos <= 0) {
            alert('No more Undo boosters remaining!');
            return;
        }

        const prev = undoHistory.pop();
        gameState.screws = prev.screws;
        gameState.planks = prev.planks;
        moveCount = prev.moveCount;
        selectedScrew = null;
        movingScrew = null;

        playerProgress.boosters.undos--;
        ApiService.saveProgress(playerProgress);
        SoundManager.playUnscrew();
        updateUI();
    }

    // Particle system
    function spawnWoodDust(x, y, count = 10) {
        for (let i = 0; i < count; i++) {
            particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 80,
                vy: (Math.random() - 0.5) * 80 - 20,
                radius: Math.random() * 3 + 1,
                color: '#d4a373',
                alpha: 1,
                decay: Math.random() * 2 + 1.5
            });
        }
    }

    function spawnWoodChips(x, y, count = 15) {
        for (let i = 0; i < count; i++) {
            particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 120,
                vy: Math.random() * -100 - 30,
                radius: Math.random() * 4 + 2,
                color: '#b08968',
                alpha: 1,
                decay: Math.random() * 1.5 + 1
            });
        }
    }

    function spawnWoodSplinters(x, y, woodType, count = 25) {
        const theme = Textures.WOOD_THEMES[woodType] || Textures.WOOD_THEMES.oak;
        for (let i = 0; i < count; i++) {
            particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 260,
                vy: (Math.random() - 0.5) * 260,
                radius: Math.random() * 6 + 3,
                angle: Math.random() * Math.PI * 2,
                vRot: (Math.random() - 0.5) * 15,
                color: Math.random() > 0.5 ? theme.base : theme.shadow,
                alpha: 1,
                decay: Math.random() * 1.2 + 0.8
            });
        }
    }

    function spawnSparks(x, y, color = '#fef08a') {
        for (let i = 0; i < 8; i++) {
            particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 100,
                vy: (Math.random() - 0.5) * 100,
                radius: Math.random() * 2.5 + 1,
                color: color,
                alpha: 1,
                decay: 3.5
            });
        }
    }

    function spawnConfetti(x, y, count = 50) {
        const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#fbbf24'];
        for (let i = 0; i < count; i++) {
            particles.push({
                x: x + (Math.random() - 0.5) * 200,
                y: y + (Math.random() - 0.5) * 100,
                vx: (Math.random() - 0.5) * 280,
                vy: -Math.random() * 300 - 50,
                radius: Math.random() * 5 + 3,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 1,
                decay: Math.random() * 0.8 + 0.6
            });
        }
    }

    // Main Update Step
    function update(dt) {
        if (LevelEditor.isActive() && LevelEditor.getMode() !== 'test') {
            return;
        }

        // Animate moving screw
        if (movingScrew) {
            movingScrew.progress += dt / movingScrew.duration;
            const t = Math.min(movingScrew.progress, 1);
            // Ease out cubic
            const ease = 1 - Math.pow(1 - t, 3);

            movingScrew.screw.x = movingScrew.startX + (movingScrew.targetX - movingScrew.startX) * ease;
            movingScrew.screw.y = movingScrew.startY + (movingScrew.targetY - movingScrew.startY) * ease;
            movingScrew.screw.rotation = ease * Math.PI * 4; // 2 complete revolutions

            if (t >= 1) {
                // Landed in hole!
                movingScrew.screw.x = movingScrew.targetX;
                movingScrew.screw.y = movingScrew.targetY;
                movingScrew.screw.boardHoleId = movingScrew.targetHoleId;
                movingScrew.screw.state = 'screwed';
                SoundManager.playScrewIn();
                spawnSparks(movingScrew.targetX, movingScrew.targetY, '#fde047');
                movingScrew = null;
            }
        }

        // Selected screw continuous rotation
        if (selectedScrew) {
            selectedScrew.rotation = (selectedScrew.rotation || 0) + dt * 4;
        }

        // Step physics
        Physics.updatePhysics(gameState, dt);

        // Update particles
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += 200 * dt; // gravity on particles
            if (p.vRot) p.angle += p.vRot * dt;
            p.alpha -= p.decay * dt;
            if (p.alpha <= 0) {
                particles.splice(i, 1);
            }
        }
    }

    // Main Render Loop
    function render() {
        ctx.save();
        ctx.scale(scale, scale);

        // 1. Draw Wood Backboard
        Textures.renderBackboard(ctx, BOARD_WIDTH, BOARD_HEIGHT);

        // 2. Draw Board Holes
        gameState.holes.forEach(hole => {
            const isOcc = gameState.screws.some(s => s.boardHoleId === hole.id && s.state !== 'selected' && s.state !== 'moving');
            const isHighlighted = (selectedScrew !== null && !isOcc);

            let isValid = false;
            if (isHighlighted) {
                // Check if blocked by plank
                let blocked = false;
                for (let p of gameState.planks) {
                    if (Physics.isBoardHoleBlockedByPlank(hole, p)) {
                        blocked = true;
                        break;
                    }
                }
                isValid = !blocked;
            }

            Textures.renderBoardHole(ctx, hole.x, hole.y, 18, isHighlighted, isValid);
        });

        // 3. Draw Wooden Planks (sorted by layer)
        const sortedPlanks = [...gameState.planks].sort((a, b) => (a.layer || 1) - (b.layer || 1));
        sortedPlanks.forEach(plank => {
            if (plank.state !== 'removed') {
                Textures.renderPlank(ctx, plank);
            }
        });

        // 4. Draw Fixed Screws
        gameState.screws.forEach(screw => {
            if (screw.state !== 'selected' && screw.state !== 'moving') {
                Textures.renderScrew(ctx, screw, 1, false);
            }
        });

        // 5. Draw Floating or Moving Screw
        if (movingScrew) {
            Textures.renderScrew(ctx, movingScrew.screw, 1.25, true);
        } else if (selectedScrew) {
            Textures.renderScrew(ctx, selectedScrew, 1.35, true);
        }

        // 6. Draw Particles
        particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.fillStyle = p.color;
            ctx.translate(p.x, p.y);
            if (p.angle) ctx.rotate(p.angle);
            ctx.beginPath();
            ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        // 7. Active Booster Cursor Overlay
        if (activeBooster === 'extraHole') {
            renderBoosterBadge(ctx, 'Drill Mode: Click to Drill Extra Hole', '#38bdf8');
        } else if (activeBooster === 'hammer') {
            renderBoosterBadge(ctx, 'Hammer Mode: Click Plank to Smash', '#f87171');
        }

        ctx.restore();
    }

    function renderBoosterBadge(ctx, text, color) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.roundRect ? ctx.roundRect(BOARD_WIDTH / 2 - 160, 40, 320, 36, 18) : ctx.rect(BOARD_WIDTH / 2 - 160, 40, 320, 36);
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = color;
        ctx.font = 'bold 14px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(text, BOARD_WIDTH / 2, 63);
        ctx.restore();
    }

    // Update UI HUD Counters
    function updateUI() {
        document.getElementById('moveCount').textContent = moveCount;
        document.getElementById('parMoves').textContent = gameState.parMoves || 6;
        if (playerProgress && playerProgress.boosters) {
            document.getElementById('extraHoleCount').textContent = playerProgress.boosters.extraHoles;
            document.getElementById('hammerCount').textContent = playerProgress.boosters.hammers;
            document.getElementById('undoCount').textContent = playerProgress.boosters.undos;
        }

        // Booster active button styling
        document.getElementById('boosterDrill').classList.toggle('active', activeBooster === 'extraHole');
        document.getElementById('boosterHammer').classList.toggle('active', activeBooster === 'hammer');
    }

    // Level Navigation
    function nextLevel() {
        closeModals();
        loadLevel(currentLevelIndex + 1);
    }

    function restartLevel() {
        closeModals();
        loadLevel(currentLevelIndex);
    }

    function closeModals() {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    }

    // Level Select Modal
    function openLevelSelect() {
        const modal = document.getElementById('levelSelectModal');
        const grid = document.getElementById('levelSelectGrid');
        grid.innerHTML = '';

        allLevels.forEach((lvl, idx) => {
            const btn = document.createElement('div');
            const isUnlocked = (idx + 1) <= (playerProgress.unlockedLevel || 1);
            const stars = playerProgress.levelStars[lvl.id.toString()] || 0;

            btn.className = `level-card ${isUnlocked ? 'unlocked' : 'locked'} ${idx === currentLevelIndex ? 'current' : ''}`;
            
            let starsHtml = '';
            for (let s = 1; s <= 3; s++) {
                starsHtml += `<span class="card-star ${s <= stars ? 'active' : ''}">★</span>`;
            }

            btn.innerHTML = `
                <div class="level-num">${lvl.id}</div>
                <div class="level-card-title">${lvl.title}</div>
                <div class="card-stars">${isUnlocked ? starsHtml : '<span class="lock-icon">🔒</span>'}</div>
            `;

            if (isUnlocked) {
                btn.onclick = () => {
                    closeModals();
                    loadLevel(idx);
                };
            }
            grid.appendChild(btn);
        });

        modal.classList.add('active');
    }

    // Leaderboard Modal
    async function openLeaderboard() {
        const modal = document.getElementById('leaderboardModal');
        const listContainer = document.getElementById('leaderboardList');
        listContainer.innerHTML = '<div class="loading-spinner">Loading Leaderboard...</div>';
        modal.classList.add('active');

        const scores = await ApiService.getLeaderboard();
        listContainer.innerHTML = '';

        scores.forEach((item, idx) => {
            const row = document.createElement('div');
            row.className = `leaderboard-row ${idx === 0 ? 'top-1' : idx === 1 ? 'top-2' : idx === 2 ? 'top-3' : ''}`;
            row.innerHTML = `
                <div class="rank">#${idx + 1}</div>
                <div class="name">${item.name}</div>
                <div class="stars">★ ${item.stars}</div>
                <div class="moves">${item.totalMoves} moves</div>
            `;
            listContainer.appendChild(row);
        });
    }

    // Settings Modal
    function openSettings() {
        document.getElementById('settingsModal').classList.add('active');
    }

    // Start Test Play for Custom Level
    function startTestPlay(draft) {
        allLevels.push(draft);
        loadLevel(allLevels.length - 1);
        LevelEditor.setActive(false);
        document.getElementById('editorModal').classList.remove('active');
    }

    return {
        init,
        loadLevel,
        nextLevel,
        restartLevel,
        closeModals,
        openLevelSelect,
        openLeaderboard,
        openSettings,
        activateBooster,
        getAllLevels: () => allLevels
    };
})();

// Start game when page loads
window.addEventListener('DOMContentLoaded', () => {
    Game.init();
});
