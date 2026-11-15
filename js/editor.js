/**
 * Interactive Level Editor for Wood Puzzle Screw & Bolt Game
 * Allows players and designers to build, test-play, and publish custom levels.
 */

const LevelEditor = (function() {
    let isActive = false;
    let editorMode = 'holes'; // 'holes', 'planks', 'screws', 'test'
    let selectedWood = 'oak';
    let selectedPlankType = 'bar';
    let selectedScrewMat = 'brass';
    let plankLength = 260;
    let plankWidth = 46;
    let plankAngleDeg = 0;

    let draftLevel = {
        id: '',
        title: 'My Custom Puzzle',
        description: 'Remove all bolts to solve this custom wood puzzle!',
        holes: [],
        screws: [],
        planks: [],
        parMoves: 6
    };

    let selectedItem = null; // Currently selected object in editor
    let onTestPlayCallback = null;

    function init(testPlayCb) {
        onTestPlayCallback = testPlayCb;
        resetDraft();
    }

    function resetDraft() {
        draftLevel = {
            id: 'custom_' + Date.now(),
            title: 'My Wood Craft',
            description: 'Can you solve my custom wood screw puzzle?',
            holes: [
                { id: 'h1', x: 180, y: 350 },
                { id: 'h2', x: 360, y: 350 },
                { id: 'h3', x: 270, y: 200 }
            ],
            screws: [
                { id: 's1', boardHoleId: 'h1', x: 180, y: 350, material: 'brass' },
                { id: 's2', boardHoleId: 'h2', x: 360, y: 350, material: 'brass' }
            ],
            planks: [
                {
                    id: 'p1',
                    type: 'bar',
                    woodType: 'oak',
                    width: 260,
                    height: 48,
                    x: 270,
                    y: 350,
                    angle: 0,
                    layer: 1,
                    holes: [
                        { x: -90, y: 0 },
                        { x: 90, y: 0 }
                    ]
                }
            ],
            parMoves: 3
        };
        selectedItem = null;
    }

    function getDraft() {
        // Return deep clone of draft level
        return JSON.parse(JSON.stringify(draftLevel));
    }

    function setDraft(level) {
        draftLevel = JSON.parse(JSON.stringify(level));
    }

    // Add backboard hole at (x, y)
    function addHole(x, y) {
        // Snap to 10px grid
        x = Math.round(x / 10) * 10;
        y = Math.round(y / 10) * 10;

        // Check if too close to existing hole
        for (let h of draftLevel.holes) {
            const d = Math.hypot(h.x - x, h.y - y);
            if (d < 30) return null;
        }

        const id = 'h_' + (draftLevel.holes.length + 1) + '_' + Math.floor(Math.random() * 1000);
        const newHole = { id, x, y };
        draftLevel.holes.push(newHole);
        return newHole;
    }

    // Add wooden plank at (x, y)
    function addPlank(x, y) {
        x = Math.round(x / 10) * 10;
        y = Math.round(y / 10) * 10;
        const radAngle = (plankAngleDeg * Math.PI) / 180;
        const id = 'p_' + (draftLevel.planks.length + 1);

        // Generate holes along plank that align with existing board holes
        const holes = [];
        const hw = plankLength / 2;

        if (selectedPlankType === 'bar') {
            holes.push({ x: -hw + 30, y: 0 });
            holes.push({ x: hw - 30, y: 0 });
        } else if (selectedPlankType === 'circle') {
            holes.push({ x: 0, y: 0 });
        } else if (selectedPlankType === 'l_shape') {
            holes.push({ x: -hw + 25, y: -hw + 25 });
            holes.push({ x: -hw + 25, y: hw - 25 });
            holes.push({ x: hw - 25, y: hw - 25 });
        } else if (selectedPlankType === 't_shape') {
            holes.push({ x: -hw + 25, y: -hw + 25 });
            holes.push({ x: 0, y: -hw + 25 });
            holes.push({ x: hw - 25, y: -hw + 25 });
            holes.push({ x: 0, y: hw - 25 });
        }

        const newPlank = {
            id,
            type: selectedPlankType,
            woodType: selectedWood,
            width: plankLength,
            height: plankWidth,
            x,
            y,
            angle: radAngle,
            layer: draftLevel.planks.length + 1,
            holes
        };

        draftLevel.planks.push(newPlank);
        selectedItem = newPlank;
        return newPlank;
    }

    // Toggle screw on a hole
    function toggleScrewAt(x, y) {
        // Find closest hole
        let closestHole = null;
        let minDist = 35;
        for (let h of draftLevel.holes) {
            const d = Math.hypot(h.x - x, h.y - y);
            if (d < minDist) {
                minDist = d;
                closestHole = h;
            }
        }

        if (!closestHole) return;

        // Check if hole already has a screw
        const existingIdx = draftLevel.screws.findIndex(s => s.boardHoleId === closestHole.id);
        if (existingIdx >= 0) {
            // Remove screw
            draftLevel.screws.splice(existingIdx, 1);
        } else {
            // Add screw
            const sId = 's_' + (draftLevel.screws.length + 1);
            draftLevel.screws.push({
                id: sId,
                boardHoleId: closestHole.id,
                x: closestHole.x,
                y: closestHole.y,
                material: selectedScrewMat
            });
        }
    }

    // Delete selected item
    function deleteSelected() {
        if (!selectedItem) return;

        if (selectedItem.boardHoleId) {
            // It's a screw
            draftLevel.screws = draftLevel.screws.filter(s => s !== selectedItem);
        } else if (selectedItem.woodType) {
            // It's a plank
            draftLevel.planks = draftLevel.planks.filter(p => p !== selectedItem);
        } else if (selectedItem.id && selectedItem.id.startsWith('h')) {
            // It's a hole: also delete screws attached to it
            draftLevel.screws = draftLevel.screws.filter(s => s.boardHoleId !== selectedItem.id);
            draftLevel.holes = draftLevel.holes.filter(h => h !== selectedItem);
        }
        selectedItem = null;
    }

    // Align plank holes to existing board holes
    function snapPlankHolesToBoard(plank) {
        if (!plank || !plank.holes) return;
        plank.holes.forEach(hole => {
            const worldHole = Physics.localToWorld(hole.x, hole.y, plank);
            draftLevel.holes.forEach(boardHole => {
                if (Physics.distance(worldHole, boardHole) < 22) {
                    // Snap!
                    const newLocal = Physics.worldToLocal(boardHole.x, boardHole.y, plank);
                    hole.x = Math.round(newLocal.x);
                    hole.y = Math.round(newLocal.y);
                }
            });
        });
    }

    return {
        init,
        resetDraft,
        getDraft,
        setDraft,
        addHole,
        addPlank,
        toggleScrewAt,
        deleteSelected,
        snapPlankHolesToBoard,
        getSelectedItem: () => selectedItem,
        setSelectedItem: (item) => { selectedItem = item; },
        setMode: (m) => { editorMode = m; },
        getMode: () => editorMode,
        setWood: (w) => { selectedWood = w; },
        setPlankType: (t) => { selectedPlankType = t; },
        setPlankLength: (l) => { plankLength = l; },
        setPlankWidth: (w) => { plankWidth = w; },
        setPlankAngle: (a) => { plankAngleDeg = a; },
        setScrewMat: (m) => { selectedScrewMat = m; },
        isActive: () => isActive,
        setActive: (val) => { isActive = val; }
    };
})();

