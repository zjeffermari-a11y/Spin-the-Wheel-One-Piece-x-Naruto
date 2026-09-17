import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { RARITY } from '../data/rarity';

const Wheel = forwardRef(({ options, onTick, onCurrentOptionChange }, ref) => {
    const canvasRef = useRef(null);
    const rotationRef = useRef(0);

    const draw = (ctx, canvas) => {
        if (!options || options.length === 0) return;

        const W = canvas.width;
        const H = canvas.height;
        const cx = W / 2;
        const cy = H / 2;
        const r = Math.min(W, H) / 2 - 10;
        
        ctx.clearRect(0, 0, W, H);
        ctx.save();
        ctx.translate(cx, cy);
        // Let CSS handle rotation, so we just draw from 0

        let currentAngle = 0;
        const arc = (Math.PI * 2) / options.length;

        for (let i = 0; i < options.length; i++) {
            const opt = options[i];
            const startAngle = currentAngle;
            const endAngle = startAngle + arc;
            
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, r, startAngle, endAngle);
            ctx.closePath();
            
            ctx.fillStyle = RARITY[opt.rarity]?.color || (i % 2 === 0 ? '#ffffff' : '#f4f4f5');
            ctx.fill();
            ctx.strokeStyle = '#111111';
            ctx.lineWidth = 4;
            ctx.stroke();

            ctx.save();
            ctx.rotate(startAngle + arc / 2);
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#ffffff';

            const fontSize = Math.max(8, Math.min(18, Math.floor(r * arc * 0.4)));
            

            ctx.font = `bold ${fontSize}px sans-serif`;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.fillText(opt.name.substring(0, 16), r - 25, 0);
            ctx.restore();
            
            currentAngle += arc;
        }

        ctx.beginPath();
        ctx.arc(0, 0, 40, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = 8;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fillStyle = '#111111';
        ctx.fill();

        ctx.restore();
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        // Ensure canvas has the proper initial rotation
        canvas.style.transition = 'none';
        canvas.style.transform = `rotate(${rotationRef.current}rad)`;
        
        draw(ctx, canvas);
    }, [options]);

    useImperativeHandle(ref, () => ({
        spinTo: (targetIndex, durationMs, callback) => {
            if (!options || options.length === 0) return;

            const canvas = canvasRef.current;
            
            const targetArc = (Math.PI * 2) / options.length;
            const startAngle = targetIndex * targetArc;
            const centerAngle = startAngle + targetArc / 2;
            const randomOffset = (Math.random() - 0.5) * (targetArc * 0.8);

            // Target angle logic updated for top-center placement (-Math.PI / 2)
            const targetAngle = -Math.PI / 2 - centerAngle + randomOffset;
            const fullRotations = Math.PI * 2 * (durationMs > 2000 ? 5 : 2);
            
            let currentNorm = rotationRef.current % (Math.PI * 2);
            if (currentNorm < 0) currentNorm += Math.PI * 2;
            
            let targetNorm = targetAngle % (Math.PI * 2);
            if (targetNorm < 0) targetNorm += Math.PI * 2;
            
            let diff = targetNorm - currentNorm;
            if (diff < 0) diff += Math.PI * 2;

            const totalRotation = rotationRef.current + diff + fullRotations;
            const startRot = rotationRef.current;

            // Apply CSS transition and transform
            canvas.style.transition = `transform ${durationMs}ms cubic-bezier(0.165, 0.84, 0.44, 1)`;
            canvas.style.transform = `rotate(${totalRotation}rad)`;

            let isFinished = false;
            let rafId = null;
            let timeoutId = null;

            const finish = () => {
                if (isFinished) return;
                isFinished = true;
                if (rafId) cancelAnimationFrame(rafId);
                if (timeoutId) clearTimeout(timeoutId);

                rotationRef.current = totalRotation;
                canvas.style.transition = 'none';
                canvas.style.transform = `rotate(${totalRotation}rad)`;

                if (callback) callback();
            };

            // Track ticks using getComputedStyle to read the matrix
            let lastAngle = null;
            let accumulatedAngle = startRot;

            const trackTicks = () => {
                if (isFinished) return;
                
                const style = window.getComputedStyle(canvas);
                const matrix = style.getPropertyValue('transform');
                
                if (matrix !== 'none') {
                    const values = matrix.split('(')[1].split(')')[0].split(',');
                    const a = parseFloat(values[0]);
                    const b = parseFloat(values[1]);
                    const currentAngle = Math.atan2(b, a); // Between -PI and PI
                    
                    if (lastAngle !== null) {
                        let diff = currentAngle - lastAngle;
                        
                        // Handle wrap-around (e.g. going from PI to -PI)
                        if (diff < -Math.PI) diff += Math.PI * 2;
                        if (diff > Math.PI) diff -= Math.PI * 2;
                        
                        let prevRot = accumulatedAngle;
                        accumulatedAngle += diff;
                        
                        const segmentAngle = (Math.PI * 2) / options.length;
                        const prevSegmentCount = Math.floor(prevRot / segmentAngle);
                        const newSegmentCount = Math.floor(accumulatedAngle / segmentAngle);
                        
                        if (prevSegmentCount !== newSegmentCount) {
                            if (onTick) onTick();
                        }
                        
                        // HUD update logic
                        let normalizedRot = accumulatedAngle % (Math.PI * 2);
                        if (normalizedRot < 0) normalizedRot += Math.PI * 2;
                        
                        let topAngle = -Math.PI / 2 - normalizedRot;
                        if (topAngle < 0) topAngle += Math.PI * 2;
                        
                        let hoveredIndex = Math.floor(topAngle / segmentAngle) % options.length;
                        if (hoveredIndex < 0) hoveredIndex += options.length;
                        
                        if (onCurrentOptionChange) {
                           onCurrentOptionChange(options[hoveredIndex]);
                        }
                    }
                    lastAngle = currentAngle;
                }
                
                rafId = requestAnimationFrame(trackTicks);
            };

            rafId = requestAnimationFrame(trackTicks);

            timeoutId = setTimeout(() => {
                finish();
            }, durationMs + 50);
        }
    }));

    return (
        <div className="relative wheel-container max-w-md mx-auto aspect-square">
            <canvas ref={canvasRef} width={500} height={500} className="w-full h-full object-contain" />
        </div>
    );
});

export default Wheel;
