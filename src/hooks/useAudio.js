import { useRef, useCallback, useEffect } from 'react';

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

        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        // Short, crisp tick
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, ctx.currentTime);

        gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.02);
    }, [initAudio]);

    const playLock = useCallback(() => {
        const ctx = initAudio();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        // Pleasant chime/ding for locking in
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5

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

        // Play a major chord arpeggio
        const frequencies = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
        
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

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
                audioCtxRef.current.close().catch(console.error);
            }
        };
    }, []);

    return { playTick, playLock, playEpic };
}
