/**
 * Physics Engine for Wood Puzzle Screw & Bolt Game
 * Simulates rigid body pendulums, multi-pin fixed constraints,
 * gravity, angular acceleration, torque, and fall dynamics.
 */

const Physics = (function() {
    const GRAVITY = 1100; // px/s^2
    const ANGULAR_DAMPING = 2.2; // air and pivot friction
    const RESTITUTION = 0.28; // bounce against other screws

    // Rotate point (x, y) by angle (radians)
    function rotatePoint(x, y, angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return {
            x: x * cos - y * sin,
            y: x * sin + y * cos
        };
    }

    // Transform local plank point to world space
    function localToWorld(localX, localY, plank) {
        const rot = rotatePoint(localX, localY, plank.angle);
        return {
            x: plank.x + rot.x,
            y: plank.y + rot.y
        };
    }

    // Transform world point to plank local space
    function worldToLocal(worldX, worldY, plank) {
        const dx = worldX - plank.x;
        const dy = worldY - plank.y;
        return rotatePoint(dx, dy, -plank.angle);
    }

    // Distance between two points
    function distance(p1, p2) {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Check if a world point lies inside a plank's boundary
    function isPointInsidePlank(worldX, worldY, plank) {
        const local = worldToLocal(worldX, worldY, plank);
        const w = plank.width;
        const h = plank.height;
        const r = Math.min(plank.radius || 18, h / 2, w / 2);

        if (plank.type === 'circle') {
            return (local.x * local.x + local.y * local.y) <= (w / 2) * (w / 2);
        } else if (plank.type === 'triangle') {
            const hTri = h * 0.866;
            // Point inside triangle
            const p0 = { x: 0, y: -hTri * 0.6 };
            const p1 = { x: w / 2, y: hTri * 0.4 };
            const p2 = { x: -w / 2, y: hTri * 0.4 };
            return pointInTriangle(local, p0, p1, p2);
        } else if (plank.type === 'l_shape') {
            const legW = plank.legWidth || 38;
            const hw = w / 2;
            const hh = h / 2;
            const inVertical = (local.x >= -hw && local.x <= -hw + legW && local.y >= -hh && local.y <= hh);
            const inHorizontal = (local.x >= -hw && local.x <= hw && local.y >= hh - legW && local.y <= hh);
            return inVertical || inHorizontal;
        } else if (plank.type === 't_shape') {
            const legW = plank.legWidth || 38;
            const hw = w / 2;
            const hh = h / 2;
            const topH = plank.topHeight || 40;
            const inTop = (local.x >= -hw && local.x <= hw && local.y >= -hh && local.y <= -hh + topH);
            const inStem = (local.x >= -legW / 2 && local.x <= legW / 2 && local.y >= -hh + topH && local.y <= hh);
            return inTop || inStem;
        } else {
            // Rounded rect
            return (
                local.x >= -w / 2 && local.x <= w / 2 &&
                local.y >= -h / 2 && local.y <= h / 2
            );
        }
    }

    function pointInTriangle(pt, v1, v2, v3) {
        const d1 = sign(pt, v1, v2);
        const d2 = sign(pt, v2, v3);
        const d3 = sign(pt, v3, v1);
        const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0);
        const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0);
        return !(hasNeg && hasPos);
    }

    function sign(p1, p2, p3) {
        return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
    }

    // Check if a hole in the backboard is covered by a plank without an aligned hole
    function isBoardHoleBlockedByPlank(boardHole, plank) {
        if (plank.state === 'falling' || plank.state === 'removed') return false;

        // Check if the board hole is inside the plank
        if (!isPointInsidePlank(boardHole.x, boardHole.y, plank)) {
            return false;
        }

        // It is inside the plank. Does the plank have an aligned hole at this exact spot?
        for (let i = 0; i < plank.holes.length; i++) {
            const worldHole = localToWorld(plank.holes[i].x, plank.holes[i].y, plank);
            if (distance(worldHole, boardHole) <= 12) {
                // Aligned! The hole passes through!
                return false;
            }
        }

        // Inside plank, but no hole passes through => BLOCKED!
        return true;
    }

    // Check which screws currently pin a plank
    function getPinnedScrewsForPlank(plank, screws) {
        if (plank.state === 'falling' || plank.state === 'removed') return [];

        const pinned = [];
        screws.forEach(screw => {
            if (screw.state === 'selected' || screw.state === 'moving') return;
            for (let i = 0; i < plank.holes.length; i++) {
                const worldHole = localToWorld(plank.holes[i].x, plank.holes[i].y, plank);
                if (distance(worldHole, screw) <= 12) {
                    pinned.push({
                        screw: screw,
                        holeIndex: i,
                        localHole: plank.holes[i]
                    });
                    break;
                }
            }
        });
        return pinned;
    }

    // Physics step
    function updatePhysics(gameState, dt) {
        // Clamp dt to avoid tunneling
        dt = Math.min(dt, 0.033);

        const planks = gameState.planks;
        const screws = gameState.screws;

        planks.forEach(plank => {
            if (plank.state === 'removed') return;

            // Find all active screws pinning this plank
            const pinned = getPinnedScrewsForPlank(plank, screws);
            plank.pinnedScrews = pinned;

            if (pinned.length >= 2) {
                // Fixed rigid: cannot move or rotate
                plank.state = 'fixed';
                plank.angularVelocity = 0;
                plank.vx = 0;
                plank.vy = 0;
            }
            else if (pinned.length === 1) {
                // Pendulum pivot around single screw
                plank.state = 'pivoting';
                plank.vx = 0;
                plank.vy = 0;

                const pin = pinned[0];
                const pivotScrew = pin.screw;
                const localHole = pin.localHole;

                // Center of mass in world space
                const cmWorld = { x: plank.x, y: plank.y };
                // Vector from pivot to center of mass
                const rx = cmWorld.x - pivotScrew.x;
                const ry = cmWorld.y - pivotScrew.y;
                const rDistSq = rx * rx + ry * ry;

                // Mass and moment of inertia
                const mass = (plank.width * plank.height) / 1000;
                const icm = (1 / 12) * mass * (plank.width * plank.width + plank.height * plank.height);
                const iPivot = icm + mass * rDistSq;

                // Torque = r_x * (mass * g)
                const torque = rx * mass * GRAVITY;
                const angularAccel = (torque / Math.max(iPivot, 50)) - (ANGULAR_DAMPING * plank.angularVelocity);

                plank.angularVelocity += angularAccel * dt;
                // Clamp max angular velocity
                plank.angularVelocity = Math.max(-12, Math.min(12, plank.angularVelocity));

                const oldAngle = plank.angle;
                plank.angle += plank.angularVelocity * dt;

                // Constrain position so localHole aligns exactly with pivotScrew
                const rotHole = rotatePoint(localHole.x, localHole.y, plank.angle);
                plank.x = pivotScrew.x - rotHole.x;
                plank.y = pivotScrew.y - rotHole.y;

                // Check collision of plank edges against other screws (stoppers)
                screws.forEach(otherScrew => {
                    if (otherScrew === pivotScrew) return;
                    if (otherScrew.state === 'selected' || otherScrew.state === 'moving') return;

                    if (isPointInsidePlank(otherScrew.x, otherScrew.y, plank)) {
                        // Rebound
                        plank.angle = oldAngle;
                        const rotOld = rotatePoint(localHole.x, localHole.y, plank.angle);
                        plank.x = pivotScrew.x - rotOld.x;
                        plank.y = pivotScrew.y - rotOld.y;
                        plank.angularVelocity = -plank.angularVelocity * RESTITUTION;
                        if (Math.abs(plank.angularVelocity) > 0.5 && SoundManager) {
                            SoundManager.playCreak();
                        }
                    }
                });
            }
            else {
                // 0 pins: FALLING!
                if (plank.state !== 'falling') {
                    plank.state = 'falling';
                    plank.vx = (Math.random() - 0.5) * 60;
                    plank.vy = 50;
                    if (SoundManager) SoundManager.playWoodFall();
                    if (gameState.onPlankStartFall) {
                        gameState.onPlankStartFall(plank);
                    }
                }

                // Gravity & velocity updates
                plank.vy += GRAVITY * dt;
                plank.x += plank.vx * dt;
                plank.y += plank.vy * dt;
                plank.angularVelocity *= 0.99;
                plank.angle += plank.angularVelocity * dt;

                // Check if completely off-screen
                if (plank.y > gameState.height + 250) {
                    plank.state = 'removed';
                    if (gameState.onPlankRemoved) {
                        gameState.onPlankRemoved(plank);
                    }
                }
            }
        });
    }

    return {
        GRAVITY,
        rotatePoint,
        localToWorld,
        worldToLocal,
        distance,
        isPointInsidePlank,
        isBoardHoleBlockedByPlank,
        getPinnedScrewsForPlank,
        updatePhysics
    };
})();

