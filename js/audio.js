/**
 * Audio Synthesizer for Wood Puzzle Screw & Bolt Game
 * Pure Web Audio API - zero external assets or downloads required.
 */

const SoundManager = (function() {
    let ctx = null;
    let soundEnabled = true;
    let musicEnabled = true;
    let bgmOscillators = [];
    let bgmGain = null;
    let isBgmPlaying = false;

    function initContext() {
        if (!ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                ctx = new AudioContext();
            }
        }
        if (ctx && ctx.state === 'suspended') {
            ctx.resume();
        }
    }

    // Play unscrewing ratchet sound
    function playUnscrew() {
        if (!soundEnabled) return;
        initContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const duration = 0.35;

        // Mechanical electric ratchet whir
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.linearRampToValueAtTime(380, now + duration * 0.7);
        osc.frequency.exponentialRampToValueAtTime(180, now + duration);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(600, now);
        filter.Q.setValueAtTime(4, now);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.22, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + duration);

        // Clicky ratchets
        for (let i = 0; i < 5; i++) {
            const clickTime = now + (i * 0.06);
            const clickOsc = ctx.createOscillator();
            const clickGain = ctx.createGain();

            clickOsc.type = 'triangle';
            clickOsc.frequency.setValueAtTime(800 + i * 150, clickTime);

            clickGain.gain.setValueAtTime(0.15, clickTime);
            clickGain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.025);

            clickOsc.connect(clickGain);
            clickGain.connect(ctx.destination);

            clickOsc.start(clickTime);
            clickOsc.stop(clickTime + 0.03);
        }
    }

    // Play screw insertion / tighten sound
    function playScrewIn() {
        if (!soundEnabled) return;
        initContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        
        // Fast descending whir
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.18);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.19);

        // Solid metallic "clink-lock" impact at end
        setTimeout(() => {
            if (!ctx) return;
            const t = ctx.currentTime;
            const metal1 = ctx.createOscillator();
            const metal2 = ctx.createOscillator();
            const mGain = ctx.createGain();

            metal1.type = 'sine';
            metal1.frequency.setValueAtTime(1250, t);
            metal1.frequency.exponentialRampToValueAtTime(600, t + 0.15);

            metal2.type = 'sine';
            metal2.frequency.setValueAtTime(1880, t);
            metal2.frequency.exponentialRampToValueAtTime(800, t + 0.12);

            mGain.gain.setValueAtTime(0.35, t);
            mGain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

            metal1.connect(mGain);
            metal2.connect(mGain);
            mGain.connect(ctx.destination);

            metal1.start(t);
            metal2.start(t);
            metal1.stop(t + 0.17);
            metal2.stop(t + 0.17);
        }, 120);
    }

    // Play plank falling & dropping off
    function playWoodFall() {
        if (!soundEnabled) return;
        initContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        // Deep wooden thud with low resonance
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(42, now + 0.35);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.36);

        // Noise buffer for swoosh / clatter
        const bufferSize = ctx.sampleRate * 0.2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(500, now);
        noiseFilter.frequency.linearRampToValueAtTime(150, now + 0.2);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.2, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);

        noise.start(now);
    }

    // Play wood creak / pivot swinging
    function playCreak() {
        if (!soundEnabled) return;
        initContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.linearRampToValueAtTime(190, now + 0.08);
        osc.frequency.linearRampToValueAtTime(95, now + 0.16);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.17);
    }

    // Play Hammer smash power-up
    function playHammer() {
        if (!soundEnabled) return;
        initContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        // Impact + shatter
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.28);

        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);

        // Splinter crack
        const bufferSize = ctx.sampleRate * 0.25;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.05));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.4, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        noise.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noise.start(now);
    }

    // Play Drill powerup
    function playDrill() {
        if (!soundEnabled) return;
        initContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const duration = 0.5;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(650, now);
        osc.frequency.linearRampToValueAtTime(950, now + 0.2);
        osc.frequency.linearRampToValueAtTime(700, now + duration);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
        gain.gain.linearRampToValueAtTime(0.2, now + duration - 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + duration);
    }

    // Victory fanfare
    function playVictory() {
        if (!soundEnabled) return;
        initContext();
        if (!ctx) return;

        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio
        const noteDuration = 0.12;

        notes.forEach((freq, idx) => {
            const startTime = ctx.currentTime + (idx * noteDuration);
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = idx === notes.length - 1 ? 'sine' : 'triangle';
            osc.frequency.setValueAtTime(freq, startTime);

            const duration = idx === notes.length - 1 ? 0.7 : 0.2;
            gain.gain.setValueAtTime(0.22, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + duration + 0.05);
        });
    }

    // UI button click
    function playClick() {
        if (!soundEnabled) return;
        initContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(540, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.04);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
    }

    // Blocked move / error
    function playError() {
        if (!soundEnabled) return;
        initContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        [180, 140].forEach((freq, idx) => {
            const t = now + (idx * 0.08);
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.18, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t);
            osc.stop(t + 0.07);
        });
    }

    // Relaxing background ambient music
    function startMusic() {
        if (!musicEnabled || isBgmPlaying) return;
        initContext();
        if (!ctx) return;

        isBgmPlaying = true;
        bgmGain = ctx.createGain();
        bgmGain.gain.setValueAtTime(0.04, ctx.currentTime);
        bgmGain.connect(ctx.destination);

        // Cozy harmonic chord pad cycling: Cmaj7 - Am7 - Fmaj7 - G
        const chords = [
            [261.63, 329.63, 392.00, 493.88], // Cmaj7
            [220.00, 261.63, 329.63, 392.00], // Am7
            [174.61, 261.63, 329.63, 349.23], // Fmaj7
            [196.00, 246.94, 293.66, 392.00]  // G
        ];

        let chordIdx = 0;
        function playNextChord() {
            if (!isBgmPlaying || !ctx) return;
            const currentChord = chords[chordIdx % chords.length];
            chordIdx++;

            currentChord.forEach(f => {
                const osc = ctx.createOscillator();
                const noteGain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(f, ctx.currentTime);

                // Smooth attack and release
                noteGain.gain.setValueAtTime(0.001, ctx.currentTime);
                noteGain.gain.linearRampToValueAtTime(0.025, ctx.currentTime + 1.2);
                noteGain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 3.8);

                osc.connect(noteGain);
                noteGain.connect(bgmGain);

                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 4.0);
            });

            setTimeout(playNextChord, 3800);
        }

        playNextChord();
    }

    function stopMusic() {
        isBgmPlaying = false;
        if (bgmGain && ctx) {
            bgmGain.gain.setValueAtTime(bgmGain.gain.value, ctx.currentTime);
            bgmGain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
            setTimeout(() => {
                bgmGain = null;
            }, 550);
        }
    }

    return {
        initContext,
        setSoundEnabled: (val) => { soundEnabled = val; },
        setMusicEnabled: (val) => { 
            musicEnabled = val; 
            if (val) startMusic(); else stopMusic();
        },
        playUnscrew,
        playScrewIn,
        playWoodFall,
        playCreak,
        playHammer,
        playDrill,
        playVictory,
        playClick,
        playError,
        startMusic,
        stopMusic
    };
})();

