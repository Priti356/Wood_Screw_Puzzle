/**
 * API Service for Wood Puzzle Screw & Bolt Game
 * Handles communication with the full-stack backend (PowerShell HTTP server)
 * with transparent fallback to localStorage for offline mode.
 */

const ApiService = (function() {
    // If opened via http:// or https://, use origin, else default to http://127.0.0.1:8080
    let baseUrl = window.location.protocol.startsWith('http') 
        ? window.location.origin 
        : 'http://127.0.0.1:8080';
        
    let isServerOnline = false;

    // Check server status
    async function checkHealth() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1200);
            const res = await fetch(`${baseUrl}/api/stats`, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (res.ok) {
                isServerOnline = true;
                return true;
            }
        } catch (e) {
            isServerOnline = false;
        }
        return false;
    }

    // Default player progress
    const DEFAULT_PROGRESS = {
        unlockedLevel: 1,
        levelStars: { "1": 0 },
        boosters: {
            extraHoles: 3,
            hammers: 2,
            undos: 5
        },
        settings: {
            soundEnabled: true,
            musicEnabled: true,
            hapticsEnabled: true
        },
        totalMoves: 0,
        puzzlesSolved: 0
    };

    // Load progress
    async function getProgress() {
        if (isServerOnline) {
            try {
                const res = await fetch(`${baseUrl}/api/progress`);
                if (res.ok) {
                    const data = await res.json();
                    localStorage.setItem('wood_puzzle_progress', JSON.stringify(data));
                    return data;
                }
            } catch (err) {
                console.warn('Backend fetch failed, using local storage', err);
            }
        }
        // Fallback to local
        const local = localStorage.getItem('wood_puzzle_progress');
        return local ? JSON.parse(local) : DEFAULT_PROGRESS;
    }

    // Save progress
    async function saveProgress(progress) {
        localStorage.setItem('wood_puzzle_progress', JSON.stringify(progress));
        if (isServerOnline) {
            try {
                await fetch(`${baseUrl}/api/progress`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(progress)
                });
            } catch (err) {
                console.warn('Could not sync progress to backend', err);
            }
        }
    }

    // Get leaderboard
    async function getLeaderboard() {
        if (isServerOnline) {
            try {
                const res = await fetch(`${baseUrl}/api/leaderboard`);
                if (res.ok) {
                    const data = await res.json();
                    localStorage.setItem('wood_puzzle_leaderboard', JSON.stringify(data));
                    return data;
                }
            } catch (err) {
                console.warn('Backend fetch leaderboard failed', err);
            }
        }
        const local = localStorage.getItem('wood_puzzle_leaderboard');
        if (local) return JSON.parse(local);
        return [
            { id: 1, name: "MasterWoodcrafter", level: 20, stars: 60, totalMoves: 142, date: "2026-11-01" },
            { id: 2, name: "TimberPro", level: 18, stars: 52, totalMoves: 168, date: "2026-11-02" },
            { id: 3, name: "ScrewWizard", level: 15, stars: 45, totalMoves: 185, date: "2026-11-02" },
            { id: 4, name: "OakMaster", level: 12, stars: 36, totalMoves: 194, date: "2026-11-02" },
            { id: 5, name: "BoltBreaker", level: 10, stars: 30, totalMoves: 210, date: "2026-11-02" }
        ];
    }

    // Submit score to leaderboard
    async function submitScore(entry) {
        if (isServerOnline) {
            try {
                const res = await fetch(`${baseUrl}/api/leaderboard`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(entry)
                });
                if (res.ok) {
                    const data = await res.json();
                    return data.leaderboard;
                }
            } catch (err) {
                console.warn('Leaderboard submission to backend failed', err);
            }
        }
        // Local leaderboard fallback
        let list = await getLeaderboard();
        entry.id = Math.random().toString(36).substr(2, 8);
        entry.date = new Date().toISOString().split('T')[0];
        list.push(entry);
        list.sort((a, b) => b.stars - a.stars || a.totalMoves - b.totalMoves);
        list = list.slice(0, 20);
        localStorage.setItem('wood_puzzle_leaderboard', JSON.stringify(list));
        return list;
    }

    // Get custom community levels
    async function getCustomLevels() {
        if (isServerOnline) {
            try {
                const res = await fetch(`${baseUrl}/api/levels`);
                if (res.ok) {
                    return await res.json();
                }
            } catch (err) {
                console.warn('Backend custom levels fetch failed', err);
            }
        }
        const local = localStorage.getItem('wood_puzzle_custom_levels');
        return local ? JSON.parse(local) : [];
    }

    // Save custom level
    async function saveCustomLevel(levelData) {
        let savedLevel = levelData;
        if (!savedLevel.id) {
            savedLevel.id = 'custom_' + Date.now();
        }
        if (isServerOnline) {
            try {
                const res = await fetch(`${baseUrl}/api/levels`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(savedLevel)
                });
                if (res.ok) {
                    const data = await res.json();
                    savedLevel = data.level;
                }
            } catch (err) {
                console.warn('Backend save custom level failed', err);
            }
        }
        // Also keep in localStorage
        const custom = await getCustomLevels();
        custom.push(savedLevel);
        localStorage.setItem('wood_puzzle_custom_levels', JSON.stringify(custom));
        return savedLevel;
    }

    return {
        checkHealth,
        isOnline: () => isServerOnline,
        getProgress,
        saveProgress,
        getLeaderboard,
        submitScore,
        getCustomLevels,
        saveCustomLevel
    };
})();

