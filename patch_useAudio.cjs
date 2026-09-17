const fs = require('fs');

const code = `import { useRef, useCallback, useEffect } from 'react';

export function useAudio() {
    const audioCtxRef = useRef(null);

    // Initialize AudioContext on first user interaction
    const initAudio = useCallback(() => {
        if (!audioCtxRef.current) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtxRef.current = new AudioContext();
        }
        if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }
        return audioCtxRef.current;
    }, []);

    const playTick = useCallback(() => {
        const ctx = initAudio();
        if (!ctx) return;
        
        // Very short, subtle mechanical click
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.type = 'sine';
        // Quick frequency drop for a clicky transient
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.015);
        
        gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.015);
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.015);
    }, [initAudio]);

    const playThud = useCallback(() => {
        const ctx = initAudio();
        if (!ctx) return;
        
        // Dramatic heavy thud / bass drop
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        // Deep bass sweep
        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.4);
        
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.8, ctx.currentTime + 0.03); // Quick attack
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8); // Long decay
        
        osc.connect(gainNode);
        
        // Add a noise burst for the impact
        const noise = ctx.createBufferSource();
        const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseBuffer.length; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        noise.buffer = noiseBuffer;
        
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.value = 800;
        
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0, ctx.currentTime);
        noiseGain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.01);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        
        gainNode.connect(ctx.destination);
        
        osc.start(ctx.currentTime);
        noise.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.8);
        noise.stop(ctx.currentTime + 0.1);
    }, [initAudio]);

    const playLock = useCallback(() => {
        const ctx = initAudio();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
    }, [initAudio]);

    const playEpic = useCallback(() => {
        const ctx = initAudio();
        if (!ctx) return;
        const frequencies = [440, 554.37, 659.25, 880];
        frequencies.forEach((freq, index) => {
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.value = freq;
            const startTime = ctx.currentTime + (index * 0.1);
            const duration = 1.0;
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
            osc.connect(gainNode);
            gainNode.connect(ctx.destination);
            osc.start(startTime);
            osc.stop(startTime + duration);
        });
    }, [initAudio]);

    useEffect(() => {
        return () => {
            if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
                audioCtxRef.current.close().catch(console.error);
            }
        };
    }, []);

    return { playTick, playLock, playEpic, playThud };
}
`;

fs.writeFileSync('src/hooks/useAudio.js', code);
