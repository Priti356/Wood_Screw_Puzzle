/**
 * 20 Masterfully Crafted Puzzle Levels for Wood Puzzle Screw & Bolt Game
 * Logical resolution: 540 x 780
 */

const LEVELS_DATA = [
    // Level 1: Tutorial - First Twist
    {
        id: 1,
        title: "First Twist",
        description: "Unscrew both bolts and place them into empty holes to drop the wooden plank!",
        holes: [
            { id: "h1", x: 170, y: 380 },
            { id: "h2", x: 370, y: 380 },
            { id: "h3", x: 270, y: 220 } // Empty hole
        ],
        screws: [
            { id: "s1", boardHoleId: "h1", x: 170, y: 380, material: "brass" },
            { id: "s2", boardHoleId: "h2", x: 370, y: 380, material: "brass" }
        ],
        planks: [
            {
                id: "p1",
                type: "bar",
                woodType: "oak",
                width: 260,
                height: 48,
                x: 270,
                y: 380,
                angle: 0,
                layer: 1,
                holes: [
                    { x: -100, y: 0 },
                    { x: 100, y: 0 }
                ]
            }
        ],
        parMoves: 2
    },

    // Level 2: The Pendulum
    {
        id: 2,
        title: "The Pendulum",
        description: "Remove one screw to let the plank swing like a pendulum and clear space!",
        holes: [
            { id: "h1", x: 270, y: 240 },
            { id: "h2", x: 270, y: 440 },
            { id: "h3", x: 160, y: 340 },
            { id: "h4", x: 380, y: 340 }
        ],
        screws: [
            { id: "s1", boardHoleId: "h1", x: 270, y: 240, material: "steel" },
            { id: "s2", boardHoleId: "h2", x: 270, y: 440, material: "steel" },
            { id: "s3", boardHoleId: "h3", x: 160, y: 340, material: "brass" }
        ],
        planks: [
            // Vertical bar
            {
                id: "p1",
                type: "bar",
                woodType: "walnut",
                width: 260,
                height: 48,
                x: 270,
                y: 340,
                angle: Math.PI / 2,
                layer: 1,
                holes: [
                    { x: -100, y: 0 },
                    { x: 100, y: 0 }
                ]
            },
            // Horizontal bar overlapping
            {
                id: "p2",
                type: "bar",
                woodType: "pine",
                width: 260,
                height: 48,
                x: 270,
                y: 340,
                angle: 0,
                layer: 2,
                holes: [
                    { x: -110, y: 0 },
                    { x: 110, y: 0 }
                ]
            }
        ],
        parMoves: 3
    },

    // Level 3: Crossroads
    {
        id: 3,
        title: "Crossroads",
        description: "A single central screw fastens both planks together!",
        holes: [
            { id: "h1", x: 270, y: 380 }, // Center shared
            { id: "h2", x: 270, y: 200 }, // Top
            { id: "h3", x: 410, y: 380 }, // Right
            { id: "h4", x: 130, y: 200 }, // Empty left
            { id: "h5", x: 410, y: 560 }  // Empty bottom right
        ],
        screws: [
            { id: "s1", boardHoleId: "h1", x: 270, y: 380, material: "gold" },
            { id: "s2", boardHoleId: "h2", x: 270, y: 200, material: "brass" },
            { id: "s3", boardHoleId: "h3", x: 410, y: 380, material: "brass" }
        ],
        planks: [
            // Vertical plank
            {
                id: "p1",
                type: "bar",
                woodType: "mahogany",
                width: 240,
                height: 48,
                x: 270,
                y: 290,
                angle: Math.PI / 2,
                layer: 1,
                holes: [
                    { x: -90, y: 0 },
                    { x: 90, y: 0 }
                ]
            },
            // Horizontal plank
            {
                id: "p2",
                type: "bar",
                woodType: "oak",
                width: 200,
                height: 48,
                x: 340,
                y: 380,
                angle: 0,
                layer: 2,
                holes: [
                    { x: -70, y: 0 },
                    { x: 70, y: 0 }
                ]
            }
        ],
        parMoves: 4
    },

    // Level 4: Domino Cascade
    {
        id: 4,
        title: "Domino Cascade",
        description: "Three wooden planks resting diagonally. Drop the top one to unblock the rest!",
        holes: [
            { id: "h1", x: 160, y: 230 },
            { id: "h2", x: 380, y: 230 },
            { id: "h3", x: 160, y: 380 },
            { id: "h4", x: 380, y: 380 },
            { id: "h5", x: 160, y: 530 },
            { id: "h6", x: 380, y: 530 },
            { id: "h7", x: 270, y: 150 } // Empty spare
        ],
        screws: [
            { id: "s1", boardHoleId: "h1", x: 160, y: 230, material: "brass" },
            { id: "s2", boardHoleId: "h2", x: 380, y: 230, material: "brass" },
            { id: "s3", boardHoleId: "h3", x: 160, y: 380, material: "steel" },
            { id: "s4", boardHoleId: "h4", x: 380, y: 380, material: "steel" },
            { id: "s5", boardHoleId: "h5", x: 160, y: 530, material: "copper" },
            { id: "s6", boardHoleId: "h6", x: 380, y: 530, material: "copper" }
        ],
        planks: [
            {
                id: "p1",
                type: "bar",
                woodType: "birch",
                width: 280,
                height: 46,
                x: 270,
                y: 230,
                angle: 0.12,
                layer: 3,
                holes: [{ x: -110, y: 0 }, { x: 110, y: 0 }]
            },
            {
                id: "p2",
                type: "bar",
                woodType: "oak",
                width: 280,
                height: 46,
                x: 270,
                y: 380,
                angle: -0.1,
                layer: 2,
                holes: [{ x: -110, y: 0 }, { x: 110, y: 0 }]
            },
            {
                id: "p3",
                type: "bar",
                woodType: "walnut",
                width: 280,
                height: 46,
                x: 270,
                y: 530,
                angle: 0.08,
                layer: 1,
                holes: [{ x: -110, y: 0 }, { x: 110, y: 0 }]
            }
        ],
        parMoves: 6
    },

    // Level 5: The Seesaw
    {
        id: 5,
        title: "The Seesaw",
        description: "A central fulcrum balances this hefty board. Release one side to trigger a spin!",
        holes: [
            { id: "h1", x: 140, y: 380 },
            { id: "h2", x: 270, y: 380 },
            { id: "h3", x: 400, y: 380 },
            { id: "h4", x: 270, y: 220 },
            { id: "h5", x: 270, y: 540 }
        ],
        screws: [
            { id: "s1", boardHoleId: "h1", x: 140, y: 380, material: "brass" },
            { id: "s2", boardHoleId: "h2", x: 270, y: 380, material: "gold" },
            { id: "s3", boardHoleId: "h3", x: 400, y: 380, material: "brass" }
        ],
        planks: [
            {
                id: "p1",
                type: "bar",
                woodType: "cherry",
                width: 320,
                height: 52,
                x: 270,
                y: 380,
                angle: 0,
                layer: 1,
                holes: [
                    { x: -130, y: 0 },
                    { x: 0, y: 0 },
                    { x: 130, y: 0 }
                ]
            }
        ],
        parMoves: 3
    },

    // Level 6: The Triangle
    {
        id: 6,
        title: "The Triangle",
        description: "Three slats fastened into a rigid delta. Free the apex first!",
        holes: [
            { id: "h1", x: 270, y: 220 }, // Apex
            { id: "h2", x: 160, y: 460 }, // Bottom-left
            { id: "h3", x: 380, y: 460 }, // Bottom-right
            { id: "h4", x: 270, y: 560 }  // Empty reserve
        ],
        screws: [
            { id: "s1", boardHoleId: "h1", x: 270, y: 220, material: "brass" },
            { id: "s2", boardHoleId: "h2", x: 160, y: 460, material: "steel" },
            { id: "s3", boardHoleId: "h3", x: 380, y: 460, material: "gold" }
        ],
        planks: [
            // Left leg
            {
                id: "p1",
                type: "bar",
                woodType: "pine",
                width: 290,
                height: 44,
                x: 215,
                y: 340,
                angle: 1.14,
                layer: 2,
                holes: [{ x: -130, y: 0 }, { x: 130, y: 0 }]
            },
            // Right leg
            {
                id: "p2",
                type: "bar",
                woodType: "oak",
                width: 290,
                height: 44,
                x: 325,
                y: 340,
                angle: -1.14,
                layer: 1,
                holes: [{ x: -130, y: 0 }, { x: 130, y: 0 }]
            },
            // Bottom base
            {
                id: "p3",
                type: "bar",
                woodType: "walnut",
                width: 260,
                height: 44,
                x: 270,
                y: 460,
                angle: 0,
                layer: 3,
                holes: [{ x: -110, y: 0 }, { x: 110, y: 0 }]
            }
        ],
        parMoves: 4
    },

    // Level 7: Tight Squeeze
    {
        id: 7,
        title: "Tight Squeeze",
        description: "Four wooden bars held tight with only ONE spare hole! Plan each transfer carefully.",
        holes: [
            { id: "h1", x: 170, y: 260 },
            { id: "h2", x: 370, y: 260 },
            { id: "h3", x: 170, y: 460 },
            { id: "h4", x: 370, y: 460 },
            { id: "h5", x: 270, y: 360 } // Single empty center hole
        ],
        screws: [
            { id: "s1", boardHoleId: "h1", x: 170, y: 260, material: "brass" },
            { id: "s2", boardHoleId: "h2", x: 370, y: 260, material: "brass" },
            { id: "s3", boardHoleId: "h3", x: 170, y: 460, material: "steel" },
            { id: "s4", boardHoleId: "h4", x: 370, y: 460, material: "steel" }
        ],
        planks: [
            // Top horizontal
            {
                id: "p1",
                type: "bar",
                woodType: "oak",
                width: 250,
                height: 44,
                x: 270,
                y: 260,
                angle: 0,
                layer: 2,
                holes: [{ x: -100, y: 0 }, { x: 100, y: 0 }]
            },
            // Left vertical
            {
                id: "p2",
                type: "bar",
                woodType: "cherry",
                width: 250,
                height: 44,
                x: 170,
                y: 360,
                angle: Math.PI / 2,
                layer: 1,
                holes: [{ x: -100, y: 0 }, { x: 100, y: 0 }]
            },
            // Right vertical
            {
                id: "p3",
                type: "bar",
                woodType: "mahogany",
                width: 250,
                height: 44,
                x: 370,
                y: 360,
                angle: Math.PI / 2,
                layer: 1,
                holes: [{ x: -100, y: 0 }, { x: 100, y: 0 }]
            },
            // Bottom horizontal
            {
                id: "p4",
                type: "bar",
                woodType: "walnut",
                width: 250,
                height: 44,
                x: 270,
                y: 460,
                angle: 0,
                layer: 2,
                holes: [{ x: -100, y: 0 }, { x: 100, y: 0 }]
            }
        ],
        parMoves: 5
    },

    // Level 8: The Windmill
    {
        id: 8,
        title: "The Windmill",
        description: "Four rotating blades pinned around a center circle hub.",
        holes: [
            { id: "hc", x: 270, y: 380 }, // Center
            { id: "h1", x: 270, y: 220 }, // North
            { id: "h2", x: 430, y: 380 }, // East
            { id: "h3", x: 270, y: 540 }, // South
            { id: "h4", x: 110, y: 380 }, // West
            { id: "he1", x: 140, y: 180 }, // Empty corner 1
            { id: "he2", x: 400, y: 180 }  // Empty corner 2
        ],
        screws: [
            { id: "sc", boardHoleId: "hc", x: 270, y: 380, material: "gold" },
            { id: "s1", boardHoleId: "h1", x: 270, y: 220, material: "brass" },
            { id: "s2", boardHoleId: "h2", x: 430, y: 380, material: "brass" },
            { id: "s3", boardHoleId: "h3", x: 270, y: 540, material: "brass" },
            { id: "s4", boardHoleId: "h4", x: 110, y: 380, material: "brass" }
        ],
        planks: [
            // Center disk
            {
                id: "hub",
                type: "circle",
                woodType: "cherry",
                width: 90,
                height: 90,
                x: 270,
                y: 380,
                angle: 0,
                layer: 3,
                holes: [{ x: 0, y: 0 }]
            },
            // North-South plank
            {
                id: "blade1",
                type: "bar",
                woodType: "birch",
                width: 360,
                height: 44,
                x: 270,
                y: 380,
                angle: Math.PI / 2,
                layer: 2,
                holes: [{ x: -160, y: 0 }, { x: 0, y: 0 }, { x: 160, y: 0 }]
            },
            // East-West plank
            {
                id: "blade2",
                type: "bar",
                woodType: "oak",
                width: 360,
                height: 44,
                x: 270,
                y: 380,
                angle: 0,
                layer: 1,
                holes: [{ x: -160, y: 0 }, { x: 0, y: 0 }, { x: 160, y: 0 }]
            }
        ],
        parMoves: 6
    },

    // Level 9: Double L-Brackets
    {
        id: 9,
        title: "L-Bracket Trap",
        description: "Two heavy right-angle L-brackets hugging each other tightly.",
        holes: [
            { id: "h1", x: 180, y: 260 },
            { id: "h2", x: 180, y: 440 },
            { id: "h3", x: 360, y: 440 },
            { id: "h4", x: 360, y: 260 },
            { id: "h5", x: 270, y: 170 },
            { id: "h6", x: 270, y: 550 }
        ],
        screws: [
            { id: "s1", boardHoleId: "h1", x: 180, y: 260, material: "brass" },
            { id: "s2", boardHoleId: "h2", x: 180, y: 440, material: "gold" },
            { id: "s3", boardHoleId: "h3", x: 360, y: 440, material: "steel" },
            { id: "s4", boardHoleId: "h4", x: 360, y: 260, material: "copper" }
        ],
        planks: [
            {
                id: "l1",
                type: "l_shape",
                woodType: "walnut",
                width: 220,
                height: 220,
                legWidth: 46,
                x: 270,
                y: 350,
                angle: 0,
                layer: 1,
                holes: [
                    { x: -90, y: -90 },
                    { x: -90, y: 90 },
                    { x: 90, y: 90 }
                ]
            },
            {
                id: "barTop",
                type: "bar",
                woodType: "pine",
                width: 240,
                height: 44,
                x: 270,
                y: 260,
                angle: 0,
                layer: 2,
                holes: [{ x: -90, y: 0 }, { x: 90, y: 0 }]
            }
        ],
        parMoves: 5
    },

    // Level 10: The Gatekeeper
    {
        id: 10,
        title: "The Gatekeeper",
        description: "A wide top beam locks three hanging slats in place.",
        holes: [
            { id: "ht1", x: 160, y: 220 },
            { id: "ht2", x: 270, y: 220 },
            { id: "ht3", x: 380, y: 220 },
            { id: "hb1", x: 160, y: 480 },
            { id: "hb2", x: 270, y: 480 },
            { id: "hb3", x: 380, y: 480 },
            { id: "he",  x: 270, y: 590 }
        ],
        screws: [
            { id: "s1", boardHoleId: "ht1", x: 160, y: 220, material: "steel" },
            { id: "s2", boardHoleId: "ht2", x: 270, y: 220, material: "gold" },
            { id: "s3", boardHoleId: "ht3", x: 380, y: 220, material: "steel" },
            { id: "s4", boardHoleId: "hb1", x: 160, y: 480, material: "brass" },
            { id: "s5", boardHoleId: "hb2", x: 270, y: 480, material: "brass" },
            { id: "s6", boardHoleId: "hb3", x: 380, y: 480, material: "brass" }
        ],
        planks: [
            // Top beam
            {
                id: "gate_top",
                type: "bar",
                woodType: "cherry",
                width: 300,
                height: 50,
                x: 270,
                y: 220,
                angle: 0,
                layer: 2,
                holes: [{ x: -110, y: 0 }, { x: 0, y: 0 }, { x: 110, y: 0 }]
            },
            // Left slat
            {
                id: "slat1",
                type: "bar",
                woodType: "oak",
                width: 300,
                height: 42,
                x: 160,
                y: 350,
                angle: Math.PI / 2,
                layer: 1,
                holes: [{ x: -130, y: 0 }, { x: 130, y: 0 }]
            },
            // Mid slat
            {
                id: "slat2",
                type: "bar",
                woodType: "walnut",
                width: 300,
                height: 42,
                x: 270,
                y: 350,
                angle: Math.PI / 2,
                layer: 1,
                holes: [{ x: -130, y: 0 }, { x: 130, y: 0 }]
            },
            // Right slat
            {
                id: "slat3",
                type: "bar",
                woodType: "birch",
                width: 300,
                height: 42,
                x: 380,
                y: 350,
                angle: Math.PI / 2,
                layer: 1,
                holes: [{ x: -130, y: 0 }, { x: 130, y: 0 }]
            }
        ],
        parMoves: 7
    },

    // Level 11: The Cage
    {
        id: 11,
        title: "The Cage",
        description: "An outer perimeter box trapping two inner diagonal slats.",
        holes: [
            { id: "c1", x: 150, y: 220 },
            { id: "c2", x: 390, y: 220 },
            { id: "c3", x: 150, y: 500 },
            { id: "c4", x: 390, y: 500 },
            { id: "cc", x: 270, y: 360 },
            { id: "ce1", x: 270, y: 140 }
        ],
        screws: [
            { id: "s1", boardHoleId: "c1", x: 150, y: 220, material: "steel" },
            { id: "s2", boardHoleId: "c2", x: 390, y: 220, material: "brass" },
            { id: "s3", boardHoleId: "c3", x: 150, y: 500, material: "brass" },
            { id: "s4", boardHoleId: "c4", x: 390, y: 500, material: "steel" },
            { id: "sc", boardHoleId: "cc", x: 270, y: 360, material: "gold" }
        ],
        planks: [
            // Diagonal 1
            {
                id: "d1",
                type: "bar",
                woodType: "oak",
                width: 390,
                height: 42,
                x: 270,
                y: 360,
                angle: 0.85,
                layer: 1,
                holes: [{ x: -170, y: 0 }, { x: 0, y: 0 }, { x: 170, y: 0 }]
            },
            // Diagonal 2
            {
                id: "d2",
                type: "bar",
                woodType: "pine",
                width: 390,
                height: 42,
                x: 270,
                y: 360,
                angle: -0.85,
                layer: 2,
                holes: [{ x: -170, y: 0 }, { x: 0, y: 0 }, { x: 170, y: 0 }]
            },
            // Horizontal top
            {
                id: "topB",
                type: "bar",
                woodType: "walnut",
                width: 290,
                height: 44,
                x: 270,
                y: 220,
                angle: 0,
                layer: 3,
                holes: [{ x: -120, y: 0 }, { x: 120, y: 0 }]
            }
        ],
        parMoves: 6
    },

    // Level 12: Chain Reaction
    {
        id: 12,
        title: "Chain Reaction",
        description: "Four descending steps. Dropping each slat uncovers the next hole!",
        holes: [
            { id: "h1", x: 140, y: 200 },
            { id: "h2", x: 250, y: 200 },
            { id: "h3", x: 250, y: 330 },
            { id: "h4", x: 360, y: 330 },
            { id: "h5", x: 360, y: 460 },
            { id: "h6", x: 440, y: 460 },
            { id: "h_free", x: 140, y: 460 }
        ],
        screws: [
            { id: "s1", boardHoleId: "h1", x: 140, y: 200, material: "brass" },
            { id: "s2", boardHoleId: "h2", x: 250, y: 200, material: "brass" },
            { id: "s3", boardHoleId: "h3", x: 250, y: 330, material: "steel" },
            { id: "s4", boardHoleId: "h4", x: 360, y: 330, material: "steel" },
            { id: "s5", boardHoleId: "h5", x: 360, y: 460, material: "copper" },
            { id: "s6", boardHoleId: "h6", x: 440, y: 460, material: "copper" }
        ],
        planks: [
            {
                id: "step1",
                type: "bar",
                woodType: "birch",
                width: 160,
                height: 42,
                x: 195,
                y: 200,
                angle: 0,
                layer: 3,
                holes: [{ x: -55, y: 0 }, { x: 55, y: 0 }]
            },
            {
                id: "step2",
                type: "bar",
                woodType: "oak",
                width: 160,
                height: 42,
                x: 305,
                y: 330,
                angle: 0,
                layer: 2,
                holes: [{ x: -55, y: 0 }, { x: 55, y: 0 }]
            },
            {
                id: "step3",
                type: "bar",
                woodType: "cherry",
                width: 140,
                height: 42,
                x: 400,
                y: 460,
                angle: 0,
                layer: 1,
                holes: [{ x: -40, y: 0 }, { x: 40, y: 0 }]
            }
        ],
        parMoves: 6
    },

    // Level 13: Balance Beam
    {
        id: 13,
        title: "Balance Beam",
        description: "Asymmetrical wooden levers with off-center pivots.",
        holes: [
            { id: "h1", x: 180, y: 320 },
            { id: "h2", x: 320, y: 320 },
            { id: "h3", x: 220, y: 460 },
            { id: "h4", x: 360, y: 460 },
            { id: "h5", x: 270, y: 180 }
        ],
        screws: [
            { id: "s1", boardHoleId: "h1", x: 180, y: 320, material: "brass" },
            { id: "s2", boardHoleId: "h2", x: 320, y: 320, material: "gold" },
            { id: "s3", boardHoleId: "h3", x: 220, y: 460, material: "steel" },
            { id: "s4", boardHoleId: "h4", x: 360, y: 460, material: "brass" }
        ],
        planks: [
            {
                id: "beam1",
                type: "bar",
                woodType: "mahogany",
                width: 320,
                height: 46,
                x: 270,
                y: 320,
                angle: 0,
                layer: 2,
                holes: [{ x: -90, y: 0 }, { x: 50, y: 0 }]
            },
            {
                id: "beam2",
                type: "bar",
                woodType: "walnut",
                width: 320,
                height: 46,
                x: 270,
                y: 460,
                angle: 0,
                layer: 1,
                holes: [{ x: -50, y: 0 }, { x: 90, y: 0 }]
            }
        ],
        parMoves: 5
    },

    // Level 14: The Scissors
    {
        id: 14,
        title: "The Scissors",
        description: "An X-scissor crossbar holding high-tension tension slats.",
        holes: [
            { id: "pTopL", x: 170, y: 220 },
            { id: "pTopR", x: 370, y: 220 },
            { id: "pMid",  x: 270, y: 370 },
            { id: "pBotL", x: 170, y: 520 },
            { id: "pBotR", x: 370, y: 520 },
            { id: "pFree", x: 270, y: 150 }
        ],
        screws: [
            { id: "s1", boardHoleId: "pTopL", x: 170, y: 220, material: "brass" },
            { id: "s2", boardHoleId: "pTopR", x: 370, y: 220, material: "brass" },
            { id: "sm", boardHoleId: "pMid",  x: 270, y: 370, material: "gold" },
            { id: "s3", boardHoleId: "pBotL", x: 170, y: 520, material: "steel" },
            { id: "s4", boardHoleId: "pBotR", x: 370, y: 520, material: "steel" }
        ],
        planks: [
            // Left-to-right diagonal
            {
                id: "bladeLR",
                type: "bar",
                woodType: "pine",
                width: 390,
                height: 44,
                x: 270,
                y: 370,
                angle: 0.98,
                layer: 1,
                holes: [{ x: -180, y: 0 }, { x: 0, y: 0 }, { x: 180, y: 0 }]
            },
            // Right-to-left diagonal
            {
                id: "bladeRL",
                type: "bar",
                woodType: "oak",
                width: 390,
                height: 44,
                x: 270,
                y: 370,
                angle: -0.98,
                layer: 2,
                holes: [{ x: -180, y: 0 }, { x: 0, y: 0 }, { x: 180, y: 0 }]
            }
        ],
        parMoves: 6
    },

    // Level 15: T-Bone Junction
    {
        id: 15,
        title: "T-Bone Junction",
        description: "A wide T-shaped bracket pinned against a cross slat.",
        holes: [
            { id: "th1", x: 170, y: 240 },
            { id: "th2", x: 270, y: 240 },
            { id: "th3", x: 370, y: 240 },
            { id: "th4", x: 270, y: 440 },
            { id: "hf1", x: 170, y: 550 },
            { id: "hf2", x: 370, y: 550 }
        ],
        screws: [
            { id: "s1", boardHoleId: "th1", x: 170, y: 240, material: "copper" },
            { id: "s2", boardHoleId: "th2", x: 270, y: 240, material: "gold" },
            { id: "s3", boardHoleId: "th3", x: 370, y: 240, material: "copper" },
            { id: "s4", boardHoleId: "th4", x: 270, y: 440, material: "brass" }
        ],
        planks: [
            {
                id: "t_piece",
                type: "t_shape",
                woodType: "walnut",
                width: 250,
                height: 250,
                legWidth: 46,
                topHeight: 46,
                x: 270,
                y: 330,
                angle: 0,
                layer: 1,
                holes: [
                    { x: -100, y: -90 },
                    { x: 0, y: -90 },
                    { x: 100, y: -90 },
                    { x: 0, y: 110 }
                ]
            },
            {
                id: "barH",
                type: "bar",
                woodType: "cherry",
                width: 250,
                height: 44,
                x: 270,
                y: 240,
                angle: 0,
                layer: 2,
                holes: [{ x: -100, y: 0 }, { x: 100, y: 0 }]
            }
        ],
        parMoves: 5
    },

    // Level 16: The Fortress
    {
        id: 16,
        title: "The Fortress",
        description: "Five interlocked boards forming an impenetrable wooden fortress.",
        holes: [
            { id: "h1", x: 150, y: 230 },
            { id: "h2", x: 270, y: 230 },
            { id: "h3", x: 390, y: 230 },
            { id: "h4", x: 150, y: 420 },
            { id: "h5", x: 270, y: 420 },
            { id: "h6", x: 390, y: 420 },
            { id: "h7", x: 270, y: 570 }
        ],
        screws: [
            { id: "s1", boardHoleId: "h1", x: 150, y: 230, material: "brass" },
            { id: "s2", boardHoleId: "h2", x: 270, y: 230, material: "steel" },
            { id: "s3", boardHoleId: "h3", x: 390, y: 230, material: "brass" },
            { id: "s4", boardHoleId: "h4", x: 150, y: 420, material: "copper" },
            { id: "s5", boardHoleId: "h5", x: 270, y: 420, material: "gold" },
            { id: "s6", boardHoleId: "h6", x: 390, y: 420, material: "copper" }
        ],
        planks: [
            // Top beam
            {
                id: "f_top",
                type: "bar",
                woodType: "oak",
                width: 300,
                height: 44,
                x: 270,
                y: 230,
                angle: 0,
                layer: 3,
                holes: [{ x: -120, y: 0 }, { x: 120, y: 0 }]
            },
            // Left tower
            {
                id: "f_left",
                type: "bar",
                woodType: "mahogany",
                width: 250,
                height: 44,
                x: 150,
                y: 325,
                angle: Math.PI / 2,
                layer: 2,
                holes: [{ x: -95, y: 0 }, { x: 95, y: 0 }]
            },
            // Right tower
            {
                id: "f_right",
                type: "bar",
                woodType: "mahogany",
                width: 250,
                height: 44,
                x: 390,
                y: 325,
                angle: Math.PI / 2,
                layer: 2,
                holes: [{ x: -95, y: 0 }, { x: 95, y: 0 }]
            },
            // Mid beam
            {
                id: "f_mid",
                type: "bar",
                woodType: "birch",
                width: 300,
                height: 44,
                x: 270,
                y: 420,
                angle: 0,
                layer: 1,
                holes: [{ x: -120, y: 0 }, { x: 0, y: 0 }, { x: 120, y: 0 }]
            }
        ],
        parMoves: 8
    },

    // Level 17: Triple Pendulum
    {
        id: 17,
        title: "Triple Pendulum",
        description: "Three hanging wooden slats that swing across each other's path.",
        holes: [
            { id: "h1", x: 180, y: 200 },
            { id: "h2", x: 270, y: 200 },
            { id: "h3", x: 360, y: 200 },
            { id: "h4", x: 180, y: 440 },
            { id: "h5", x: 270, y: 440 },
            { id: "h6", x: 360, y: 440 },
            { id: "h7", x: 270, y: 580 }
        ],
        screws: [
            { id: "s1", boardHoleId: "h1", x: 180, y: 200, material: "steel" },
            { id: "s2", boardHoleId: "h2", x: 270, y: 200, material: "brass" },
            { id: "s3", boardHoleId: "h3", x: 360, y: 200, material: "gold" },
            { id: "s4", boardHoleId: "h4", x: 180, y: 440, material: "brass" },
            { id: "s5", boardHoleId: "h5", x: 270, y: 440, material: "copper" },
            { id: "s6", boardHoleId: "h6", x: 360, y: 440, material: "steel" }
        ],
        planks: [
            {
                id: "p1",
                type: "bar",
                woodType: "walnut",
                width: 290,
                height: 42,
                x: 180,
                y: 320,
                angle: Math.PI / 2,
                layer: 1,
                holes: [{ x: -120, y: 0 }, { x: 120, y: 0 }]
            },
            {
                id: "p2",
                type: "bar",
                woodType: "pine",
                width: 290,
                height: 42,
                x: 270,
                y: 320,
                angle: Math.PI / 2,
                layer: 2,
                holes: [{ x: -120, y: 0 }, { x: 120, y: 0 }]
            },
            {
                id: "p3",
                type: "bar",
                woodType: "oak",
                width: 290,
                height: 42,
                x: 360,
                y: 320,
                angle: Math.PI / 2,
                layer: 3,
                holes: [{ x: -120, y: 0 }, { x: 120, y: 0 }]
            }
        ],
        parMoves: 7
    },

    // Level 18: Cogwheel Lock
    {
        id: 18,
        title: "The Cogwheel",
        description: "Rotating circular wooden hubs interlinked by connecting rods.",
        holes: [
            { id: "c1", x: 200, y: 300 },
            { id: "c2", x: 340, y: 300 },
            { id: "b1", x: 200, y: 470 },
            { id: "b2", x: 340, y: 470 },
            { id: "f1", x: 270, y: 190 },
            { id: "f2", x: 270, y: 580 }
        ],
        screws: [
            { id: "s1", boardHoleId: "c1", x: 200, y: 300, material: "gold" },
            { id: "s2", boardHoleId: "c2", x: 340, y: 300, material: "gold" },
            { id: "s3", boardHoleId: "b1", x: 200, y: 470, material: "steel" },
            { id: "s4", boardHoleId: "b2", x: 340, y: 470, material: "steel" }
        ],
        planks: [
            // Left disk
            {
                id: "disk1",
                type: "circle",
                woodType: "cherry",
                width: 100,
                height: 100,
                x: 200,
                y: 300,
                angle: 0,
                layer: 3,
                holes: [{ x: 0, y: 0 }]
            },
            // Right disk
            {
                id: "disk2",
                type: "circle",
                woodType: "cherry",
                width: 100,
                height: 100,
                x: 340,
                y: 300,
                angle: 0,
                layer: 3,
                holes: [{ x: 0, y: 0 }]
            },
            // Connecting tie bar
            {
                id: "tie",
                type: "bar",
                woodType: "oak",
                width: 200,
                height: 42,
                x: 270,
                y: 300,
                angle: 0,
                layer: 2,
                holes: [{ x: -70, y: 0 }, { x: 70, y: 0 }]
            },
            // Lower bar
            {
                id: "lowBar",
                type: "bar",
                woodType: "walnut",
                width: 200,
                height: 42,
                x: 270,
                y: 470,
                angle: 0,
                layer: 1,
                holes: [{ x: -70, y: 0 }, { x: 70, y: 0 }]
            }
        ],
        parMoves: 6
    },

    // Level 19: The Anchor
    {
        id: 19,
        title: "The Anchor",
        description: "Heavy marine anchor structure held firmly in place by five bolts.",
        holes: [
            { id: "hTop", x: 270, y: 190 },
            { id: "hMid", x: 270, y: 340 },
            { id: "hLeft", x: 140, y: 460 },
            { id: "hRight", x: 400, y: 460 },
            { id: "hBot", x: 270, y: 520 },
            { id: "hSpare", x: 270, y: 620 }
        ],
        screws: [
            { id: "s1", boardHoleId: "hTop", x: 270, y: 190, material: "steel" },
            { id: "s2", boardHoleId: "hMid", x: 270, y: 340, material: "gold" },
            { id: "s3", boardHoleId: "hLeft", x: 140, y: 460, material: "brass" },
            { id: "s4", boardHoleId: "hRight", x: 400, y: 460, material: "brass" },
            { id: "s5", boardHoleId: "hBot", x: 270, y: 520, material: "copper" }
        ],
        planks: [
            // Vertical shank
            {
                id: "shank",
                type: "bar",
                woodType: "mahogany",
                width: 380,
                height: 48,
                x: 270,
                y: 355,
                angle: Math.PI / 2,
                layer: 2,
                holes: [{ x: -165, y: 0 }, { x: -15, y: 0 }, { x: 165, y: 0 }]
            },
            // Horizontal arms
            {
                id: "arms",
                type: "bar",
                woodType: "oak",
                width: 320,
                height: 46,
                x: 270,
                y: 460,
                angle: 0,
                layer: 1,
                holes: [{ x: -130, y: 0 }, { x: 130, y: 0 }]
            }
        ],
        parMoves: 6
    },

    // Level 20: Grandmaster's Lock
    {
        id: 20,
        title: "Grandmaster's Lock",
        description: "The ultimate wooden puzzle! An intricate lattice of 6 boards with zero room for error.",
        holes: [
            { id: "h1", x: 160, y: 220 },
            { id: "h2", x: 380, y: 220 },
            { id: "h3", x: 270, y: 320 },
            { id: "h4", x: 160, y: 440 },
            { id: "h5", x: 380, y: 440 },
            { id: "h6", x: 270, y: 560 },
            { id: "h_free1", x: 270, y: 150 },
            { id: "h_free2", x: 270, y: 640 }
        ],
        screws: [
            { id: "s1", boardHoleId: "h1", x: 160, y: 220, material: "gold" },
            { id: "s2", boardHoleId: "h2", x: 380, y: 220, material: "gold" },
            { id: "s3", boardHoleId: "h3", x: 270, y: 320, material: "brass" },
            { id: "s4", boardHoleId: "h4", x: 160, y: 440, material: "copper" },
            { id: "s5", boardHoleId: "h5", x: 380, y: 440, material: "copper" },
            { id: "s6", boardHoleId: "h6", x: 270, y: 560, material: "steel" }
        ],
        planks: [
            // Top diagonal L-R
            {
                id: "gm1",
                type: "bar",
                woodType: "walnut",
                width: 280,
                height: 42,
                x: 215,
                y: 270,
                angle: 0.74,
                layer: 3,
                holes: [{ x: -80, y: 0 }, { x: 80, y: 0 }]
            },
            // Top diagonal R-L
            {
                id: "gm2",
                type: "bar",
                woodType: "birch",
                width: 280,
                height: 42,
                x: 325,
                y: 270,
                angle: -0.74,
                layer: 2,
                holes: [{ x: -80, y: 0 }, { x: 80, y: 0 }]
            },
            // Bottom horizontal
            {
                id: "gm3",
                type: "bar",
                woodType: "cherry",
                width: 280,
                height: 42,
                x: 270,
                y: 440,
                angle: 0,
                layer: 1,
                holes: [{ x: -110, y: 0 }, { x: 110, y: 0 }]
            },
            // Lower V left
            {
                id: "gm4",
                type: "bar",
                woodType: "oak",
                width: 220,
                height: 42,
                x: 215,
                y: 500,
                angle: 0.83,
                layer: 2,
                holes: [{ x: -75, y: 0 }, { x: 75, y: 0 }]
            },
            // Lower V right
            {
                id: "gm5",
                type: "bar",
                woodType: "pine",
                width: 220,
                height: 42,
                x: 325,
                y: 500,
                angle: -0.83,
                layer: 1,
                holes: [{ x: -75, y: 0 }, { x: 75, y: 0 }]
            }
        ],
        parMoves: 10
    }
];

