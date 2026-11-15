/**
 * Textures & Rendering Engine for Wood Puzzle Screw & Bolt Game
 * Procedural canvas-based wood grain, beveling, metallic shaders, and shadows.
 */

const Textures = (function() {
    // Wood finishes with primary, grain, highlight, shadow colors
    const WOOD_THEMES = {
        oak: {
            base: '#d7a15c',
            grain: '#b87c38',
            highlight: '#f2c88e',
            shadow: '#7e4d1b',
            edgeDark: '#5c3611',
            ringColor: '#633913'
        },
        walnut: {
            base: '#7a4e2d',
            grain: '#533017',
            highlight: '#9e6d45',
            shadow: '#381e0b',
            edgeDark: '#2a1608',
            ringColor: '#301808'
        },
        pine: {
            base: '#e8be78',
            grain: '#cb9a46',
            highlight: '#ffdc9c',
            shadow: '#94661e',
            edgeDark: '#6d470d',
            ringColor: '#6e4a13'
        },
        mahogany: {
            base: '#9e3b2b',
            grain: '#6b2014',
            highlight: '#c85e4c',
            shadow: '#4d140b',
            edgeDark: '#360c06',
            ringColor: '#3a0c06'
        },
        birch: {
            base: '#ecdcb9',
            grain: '#c7b083',
            highlight: '#fff2db',
            shadow: '#9e8457',
            edgeDark: '#755f3a',
            ringColor: '#78623d'
        },
        cherry: {
            base: '#b5583b',
            grain: '#80341e',
            highlight: '#db7b5c',
            shadow: '#541c0e',
            edgeDark: '#3b1208',
            ringColor: '#45160a'
        }
    };

    // Screw materials
    const SCREW_MATERIALS = {
        brass: {
            top: '#ffec9e',
            mid: '#d9ab38',
            dark: '#876210',
            slot: '#422f05'
        },
        steel: {
            top: '#f0f4f8',
            mid: '#b0bac6',
            dark: '#586574',
            slot: '#2d3748'
        },
        copper: {
            top: '#ffcbb5',
            mid: '#cc7a53',
            dark: '#7e3e20',
            slot: '#3d1b0c'
        },
        gold: {
            top: '#fff3b0',
            mid: '#e5b32e',
            dark: '#946e09',
            slot: '#4a3703'
        }
    };

    // Pre-render a rustic wooden background board
    let cachedBackboard = null;

    function createBackboardTexture(width, height) {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = width;
        offCanvas.height = height;
        const ctx = offCanvas.getContext('2d');

        // Warm dark walnut/rosewood tabletop backing
        const baseGrad = ctx.createLinearGradient(0, 0, width, height);
        baseGrad.addColorStop(0, '#3e2312');
        baseGrad.addColorStop(0.5, '#4e2d17');
        baseGrad.addColorStop(1, '#341c0c');
        ctx.fillStyle = baseGrad;
        ctx.fillRect(0, 0, width, height);

        // Draw horizontal wood plank grooves
        const plankHeight = 70;
        const numPlanks = Math.ceil(height / plankHeight);

        for (let i = 0; i < numPlanks; i++) {
            const y = i * plankHeight;
            // Plank fill variation
            ctx.fillStyle = (i % 2 === 0) ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.06)';
            ctx.fillRect(0, y, width, plankHeight);

            // Grain lines
            ctx.strokeStyle = 'rgba(255, 200, 140, 0.04)';
            ctx.lineWidth = 1;
            for (let j = 0; j < 8; j++) {
                const lineY = y + 8 + j * 7 + (Math.sin(j + i) * 3);
                ctx.beginPath();
                ctx.moveTo(0, lineY);
                ctx.bezierCurveTo(
                    width * 0.3, lineY + Math.sin(i * 2 + j) * 4,
                    width * 0.7, lineY - Math.cos(i + j) * 5,
                    width, lineY + 2
                );
                ctx.stroke();
            }

            // Dark groove between boards
            ctx.fillStyle = 'rgba(15, 8, 4, 0.75)';
            ctx.fillRect(0, y + plankHeight - 2, width, 2);
            // Highlight groove edge
            ctx.fillStyle = 'rgba(255, 230, 180, 0.08)';
            ctx.fillRect(0, y + plankHeight, width, 1);
        }

        // Vignette edges (ambient occlusion)
        const radGrad = ctx.createRadialGradient(
            width / 2, height / 2, width * 0.3,
            width / 2, height / 2, width * 0.75
        );
        radGrad.addColorStop(0, 'rgba(0,0,0,0)');
        radGrad.addColorStop(1, 'rgba(0,0,0,0.65)');
        ctx.fillStyle = radGrad;
        ctx.fillRect(0, 0, width, height);

        // Border frame bevel
        ctx.lineWidth = 14;
        ctx.strokeStyle = '#271408';
        ctx.strokeRect(7, 7, width - 14, height - 14);

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#5a341b';
        ctx.strokeRect(14, 14, width - 28, height - 28);

        // Metallic corner brackets
        drawCornerBracket(ctx, 10, 10, 0);
        drawCornerBracket(ctx, width - 10, 10, Math.PI / 2);
        drawCornerBracket(ctx, width - 10, height - 10, Math.PI);
        drawCornerBracket(ctx, 10, height - 10, -Math.PI / 2);

        return offCanvas;
    }

    function drawCornerBracket(ctx, x, y, rot) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);

        ctx.fillStyle = '#614828';
        ctx.strokeStyle = '#9e7943';
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(36, 0);
        ctx.lineTo(36, 12);
        ctx.lineTo(12, 12);
        ctx.lineTo(12, 36);
        ctx.lineTo(0, 36);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Tiny rivets
        ctx.fillStyle = '#cca357';
        ctx.beginPath();
        ctx.arc(24, 6, 2.5, 0, Math.PI * 2);
        ctx.arc(6, 24, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // Render Backboard
    function renderBackboard(ctx, width, height) {
        if (!cachedBackboard || cachedBackboard.width !== width || cachedBackboard.height !== height) {
            cachedBackboard = createBackboardTexture(width, height);
        }
        ctx.drawImage(cachedBackboard, 0, 0);
    }

    // Render an empty or unoccupied hole on the backboard
    function renderBoardHole(ctx, x, y, radius = 18, isHighlighted = false, isValidDrop = false) {
        ctx.save();

        // Recessed outer rim shadow
        ctx.shadowColor = 'rgba(0,0,0,0.85)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 2;

        // Brass collar ring
        const brassGrad = ctx.createLinearGradient(x - radius, y - radius, x + radius, y + radius);
        brassGrad.addColorStop(0, '#5e4318');
        brassGrad.addColorStop(0.3, '#d4a84e');
        brassGrad.addColorStop(0.7, '#8f6826');
        brassGrad.addColorStop(1, '#3b280c');
        ctx.fillStyle = brassGrad;
        ctx.beginPath();
        ctx.arc(x, y, radius + 3, 0, Math.PI * 2);
        ctx.fill();

        // Reset shadow
        ctx.shadowColor = 'transparent';

        // Deep hole interior
        const holeGrad = ctx.createRadialGradient(x, y, 1, x, y, radius);
        holeGrad.addColorStop(0, '#0a0603');
        holeGrad.addColorStop(0.7, '#130d07');
        holeGrad.addColorStop(0.9, '#24170a');
        holeGrad.addColorStop(1, '#38220f');
        ctx.fillStyle = holeGrad;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Internal screw threading spirals inside the hole
        ctx.strokeStyle = 'rgba(255, 215, 120, 0.12)';
        ctx.lineWidth = 1;
        for (let r = 5; r < radius - 3; r += 3) {
            ctx.beginPath();
            ctx.arc(x, y, r, 0.3, Math.PI * 1.6);
            ctx.stroke();
        }

        // Inner rim shadow (top) & light reflection (bottom)
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(x, y, radius, Math.PI * 0.85, Math.PI * 2.15);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 240, 180, 0.45)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 0.85);
        ctx.stroke();

        // Highlight ring when user selected a screw and this hole is valid/open
        if (isHighlighted) {
            const pulse = (Math.sin(Date.now() / 150) + 1) / 2;
            ctx.strokeStyle = isValidDrop ? `rgba(74, 222, 128, ${0.7 + pulse * 0.3})` : 'rgba(239, 68, 68, 0.6)';
            ctx.lineWidth = 3 + pulse * 2;
            ctx.beginPath();
            ctx.arc(x, y, radius + 7 + pulse * 2, 0, Math.PI * 2);
            ctx.stroke();

            if (isValidDrop) {
                // Subtle glowing green indicator
                ctx.fillStyle = `rgba(74, 222, 128, ${0.15 + pulse * 0.1})`;
                ctx.beginPath();
                ctx.arc(x, y, radius + 6, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.restore();
    }

    // Render a Wooden Plank
    function renderPlank(ctx, plank) {
        ctx.save();
        ctx.translate(plank.x, plank.y);
        ctx.rotate(plank.angle);

        const theme = WOOD_THEMES[plank.woodType || 'oak'] || WOOD_THEMES.oak;
        const w = plank.width;
        const h = plank.height;
        const r = Math.min(plank.radius || 18, h / 2, w / 2);

        // Calculate drop shadow offset based on plank layer / z-index
        const z = plank.layer || 1;
        const shadowDist = 6 + z * 5;
        const shadowBlur = 8 + z * 4;

        // Draw shadow first
        ctx.save();
        ctx.shadowColor = `rgba(0, 0, 0, ${0.45 + z * 0.08})`;
        ctx.shadowBlur = shadowBlur;
        ctx.shadowOffsetX = shadowDist * 0.5;
        ctx.shadowOffsetY = shadowDist;

        ctx.fillStyle = '#000000';
        drawPlankPath(ctx, plank, w, h, r);
        ctx.fill();
        ctx.restore();

        // Now draw plank body
        drawPlankPath(ctx, plank, w, h, r);

        // Linear gradient across width
        const bodyGrad = ctx.createLinearGradient(-w / 2, -h / 2, -w / 2, h / 2);
        bodyGrad.addColorStop(0, theme.highlight);
        bodyGrad.addColorStop(0.12, theme.base);
        bodyGrad.addColorStop(0.85, theme.base);
        bodyGrad.addColorStop(1, theme.shadow);
        ctx.fillStyle = bodyGrad;
        ctx.fill();

        // Clip to plank body to draw internal wood grains and texture
        ctx.save();
        ctx.clip();

        // Longitudinal wood grain lines
        ctx.strokeStyle = theme.grain;
        ctx.lineWidth = 1.2;
        const numGrains = Math.floor(h / 7);
        for (let i = 0; i < numGrains; i++) {
            const gy = -h / 2 + 5 + i * 7;
            ctx.beginPath();
            ctx.moveTo(-w / 2 - 10, gy);
            ctx.bezierCurveTo(
                -w / 4, gy + Math.sin(i * 1.5) * 3,
                w / 4, gy - Math.cos(i * 1.2) * 4,
                w / 2 + 10, gy + 1
            );
            ctx.stroke();
        }

        // Subtle wood knot if plank is long enough
        if (w > 140) {
            ctx.save();
            ctx.strokeStyle = theme.ringColor;
            ctx.lineWidth = 1;
            const knotX = (w * 0.22);
            const knotY = (h * 0.08);
            ctx.beginPath();
            ctx.ellipse(knotX, knotY, 14, 5, 0.15, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.ellipse(knotX, knotY, 8, 3, 0.15, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        ctx.restore(); // Remove clip

        // Chamfered Bevel Edge Highlights
        ctx.save();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = theme.highlight;
        ctx.stroke(); // outer stroke
        ctx.restore();

        // Drilled holes through the plank
        if (plank.holes && plank.holes.length > 0) {
            plank.holes.forEach(hole => {
                const hx = hole.x;
                const hy = hole.y;
                const hr = hole.radius || 17;

                ctx.save();
                // Punch hole visually: inner shadow & dark depth
                ctx.beginPath();
                ctx.arc(hx, hy, hr + 1.5, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
                ctx.fill();

                // Dark cutout revealing board beneath
                ctx.beginPath();
                ctx.arc(hx, hy, hr, 0, Math.PI * 2);
                ctx.fillStyle = '#150d06';
                ctx.fill();

                // Hole rim metallic grommet / washer
                ctx.lineWidth = 1.5;
                ctx.strokeStyle = '#caa154';
                ctx.stroke();

                // Inner rim shadow
                ctx.lineWidth = 1.8;
                ctx.strokeStyle = 'rgba(0,0,0,0.85)';
                ctx.beginPath();
                ctx.arc(hx, hy, hr, Math.PI * 0.7, Math.PI * 2.1);
                ctx.stroke();

                ctx.restore();
            });
        }

        ctx.restore();
    }

    // Helper: draw the geometric shape path for a plank
    function drawPlankPath(ctx, plank, w, h, r) {
        ctx.beginPath();
        if (plank.type === 'circle') {
            ctx.arc(0, 0, w / 2, 0, Math.PI * 2);
        } else if (plank.type === 'triangle') {
            const hTri = h * 0.866;
            ctx.moveTo(0, -hTri * 0.6);
            ctx.lineTo(w / 2, hTri * 0.4);
            ctx.lineTo(-w / 2, hTri * 0.4);
            ctx.closePath();
        } else if (plank.type === 'l_shape') {
            // L-bracket geometry
            const legW = plank.legWidth || 38;
            const hw = w / 2;
            const hh = h / 2;
            ctx.moveTo(-hw, -hh);
            ctx.lineTo(-hw + legW, -hh);
            ctx.lineTo(-hw + legW, hh - legW);
            ctx.lineTo(hw, hh - legW);
            ctx.lineTo(hw, hh);
            ctx.lineTo(-hw, hh);
            ctx.closePath();
        } else if (plank.type === 't_shape') {
            // T-bracket
            const legW = plank.legWidth || 38;
            const hw = w / 2;
            const hh = h / 2;
            const topH = plank.topHeight || 40;
            ctx.moveTo(-hw, -hh);
            ctx.lineTo(hw, -hh);
            ctx.lineTo(hw, -hh + topH);
            ctx.lineTo(legW / 2, -hh + topH);
            ctx.lineTo(legW / 2, hh);
            ctx.lineTo(-legW / 2, hh);
            ctx.lineTo(-legW / 2, -hh + topH);
            ctx.lineTo(-hw, -hh + topH);
            ctx.closePath();
        } else {
            // Rounded rectangle bar (default)
            roundedRect(ctx, -w / 2, -h / 2, w, h, r);
        }
    }

    function roundedRect(ctx, x, y, width, height, radius) {
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    // Render a Screw / Bolt
    function renderScrew(ctx, screw, scale = 1, isSelected = false, hover = false) {
        const x = screw.x;
        const y = screw.y;
        const radius = (screw.radius || 16) * scale;
        const mat = SCREW_MATERIALS[screw.material || 'brass'] || SCREW_MATERIALS.brass;

        ctx.save();
        ctx.translate(x, y);

        // Rotation animation when selected/unscrewing
        if (screw.rotation) {
            ctx.rotate(screw.rotation);
        }

        // Floating shadow if selected
        if (isSelected) {
            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
            ctx.shadowBlur = 18;
            ctx.shadowOffsetX = 10;
            ctx.shadowOffsetY = 16;
            ctx.beginPath();
            ctx.arc(0, 0, radius + 2, 0, Math.PI * 2);
            ctx.fillStyle = '#000000';
            ctx.fill();
            ctx.restore();

            // Glowing selection ring
            const glow = (Math.sin(Date.now() / 120) + 1) / 2;
            ctx.strokeStyle = `rgba(255, 230, 100, ${0.75 + glow * 0.25})`;
            ctx.lineWidth = 4 + glow * 2;
            ctx.beginPath();
            ctx.arc(0, 0, radius + 6 + glow * 2, 0, Math.PI * 2);
            ctx.stroke();
        } else {
            // Normal ground shadow
            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
            ctx.shadowBlur = 6;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 4;
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.fillStyle = '#000000';
            ctx.fill();
            ctx.restore();
        }

        // Metal Washer Beneath
        const washerR = radius * 1.25;
        const washGrad = ctx.createRadialGradient(-washerR * 0.3, -washerR * 0.3, washerR * 0.1, 0, 0, washerR);
        washGrad.addColorStop(0, '#f8e6b3');
        washGrad.addColorStop(0.5, '#af822e');
        washGrad.addColorStop(1, '#573d0f');
        ctx.fillStyle = washGrad;
        ctx.beginPath();
        ctx.arc(0, 0, washerR, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, washerR, 0, Math.PI * 2);
        ctx.stroke();

        // Screw Head Outer Dome
        const domeGrad = ctx.createRadialGradient(-radius * 0.35, -radius * 0.35, radius * 0.08, 0, 0, radius);
        domeGrad.addColorStop(0, mat.top);
        domeGrad.addColorStop(0.35, mat.mid);
        domeGrad.addColorStop(0.85, mat.dark);
        domeGrad.addColorStop(1, '#2c1e05');
        ctx.fillStyle = domeGrad;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();

        // Polished Rim Highlight
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(0, 0, radius - 1, Math.PI * 0.75, Math.PI * 1.75);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(0, 0, radius - 1, -Math.PI * 0.25, Math.PI * 0.75);
        ctx.stroke();

        // Drive Socket: Phillips Cross (+) or Hexagon
        const slotLen = radius * 0.7;
        const slotW = radius * 0.28;

        ctx.fillStyle = mat.slot;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 2;
        ctx.shadowOffsetY = 1;

        // Vertical slot
        ctx.beginPath();
        ctx.roundRect 
            ? ctx.roundRect(-slotW / 2, -slotLen, slotW, slotLen * 2, 2)
            : ctx.rect(-slotW / 2, -slotLen, slotW, slotLen * 2);
        ctx.fill();

        // Horizontal slot
        ctx.beginPath();
        ctx.roundRect
            ? ctx.roundRect(-slotLen, -slotW / 2, slotLen * 2, slotW, 2)
            : ctx.rect(-slotLen, -slotW / 2, slotLen * 2, slotW);
        ctx.fill();

        // Slot bottom reflection
        ctx.shadowColor = 'transparent';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(-slotW / 4, slotLen * 0.6, slotW / 2, 2);
        ctx.fillRect(slotLen * 0.6, -slotW / 4, 2, slotW / 2);

        ctx.restore();
    }

    return {
        WOOD_THEMES,
        SCREW_MATERIALS,
        renderBackboard,
        renderBoardHole,
        renderPlank,
        renderScrew
    };
})();

