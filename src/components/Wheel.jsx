import React, { useRef, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';
import { RARITY } from '../data/rarity';

const Wheel = forwardRef(({ options, onTick, onSegmentChange }, ref) => {
    const canvasRef = useRef(null);
    const rotationRef = useRef(0);

    // Calculate which segment the pointer (top-center) is currently over
    const getPointerSegment = useCallback((rotation) => {
        if (!options || options.length === 0) return null;
        const arc = (Math.PI * 2) / options.length;
        // The pointer is at -Math.PI/2 (top). We need to figure out which
        // segment that maps to given the current rotation.
        let pointerAngle = (-Math.PI / 2 - rotation) % (Math.PI * 2);
        if (pointerAngle < 0) pointerAngle += Math.PI * 2;
        const index = Math.floor(pointerAngle / arc) % options.length;
        return options[index] || null;
    }, [options]);

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
        ctx.rotate(rotationRef.current);

        let currentAngle = 0;
        const arc = (Math.PI * 2) / options.length;
        const isLargeWheel = options.length > 20;

        for (let i = 0; i < options.length; i++) {
            const opt = options[i];
            const startAngle = currentAngle;
            const endAngle = startAngle + arc;
            
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, r, startAngle, endAngle);
            ctx.closePath();
            
            // Use rarity color with alternating brightness for readability
            const baseColor = RARITY[opt.rarity]?.color || '#333';
            ctx.fillStyle = i % 2 === 0 ? baseColor : darkenColor(baseColor, 0.7);
            ctx.fill();
            ctx.strokeStyle = '#0a0a0a';
            ctx.lineWidth = isLargeWheel ? 1 : 3;
            ctx.stroke();

            // Only draw text for smaller wheels (<=20 slices)
            if (!isLargeWheel) {
                ctx.save();
                ctx.rotate(startAngle + arc / 2);
                ctx.textAlign = 'right';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#ffffff';
                const fontSize = Math.max(10, Math.min(18, Math.floor(r * arc * 0.4)));
                ctx.font = `bold ${fontSize}px sans-serif`;
                ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
                ctx.shadowBlur = 4;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;
                ctx.fillText(opt.name.substring(0, 16), r - 25, 0);
                ctx.restore();
            }
            
            currentAngle += arc;
        }

        // Outer ring glow
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Center hub
        const gradient = ctx.createRadialGradient(0, 0, 10, 0, 0, 45);
        gradient.addColorStop(0, '#333');
        gradient.addColorStop(1, '#111');
        ctx.beginPath();
        ctx.arc(0, 0, 40, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Center dot
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();

        ctx.restore();
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        rotationRef.current = 0;
        draw(ctx, canvas);
        // Report initial segment
        const seg = getPointerSegment(0);
        if (seg && onSegmentChange) onSegmentChange(seg.name);
    }, [options]);

    useImperativeHandle(ref, () => ({
        spinTo: (targetIndex, durationMs, callback) => {
            if (!options || options.length === 0) return;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            const targetArc = (Math.PI * 2) / options.length;
            const startAngle = targetIndex * targetArc;
            const centerAngle = startAngle + targetArc / 2;

            const randomOffset = (Math.random() - 0.5) * (targetArc * 0.8);
            const targetAngle = -Math.PI / 2 - centerAngle + randomOffset;
            const fullRotations = Math.PI * 2 * (durationMs > 2000 ? 5 : 2);
            
            let currentNorm = rotationRef.current % (Math.PI * 2);
            if (currentNorm < 0) currentNorm += Math.PI * 2;
            
            let targetNorm = targetAngle % (Math.PI * 2);
            if (targetNorm < 0) targetNorm += Math.PI * 2;
            
            let diff = targetNorm - currentNorm;
            if (diff < 0) diff += Math.PI * 2;

            const totalRotation = rotationRef.current + diff + fullRotations;
            const startTime = performance.now();
            const startRot = rotationRef.current;
            const easeOut = t => 1 - (--t) * t * t * t;

            let isFinished = false;
            let rafId = null;
            let timeoutId = null;
            let lastReportedSegment = null;

            const finish = () => {
                if (isFinished) return;
                isFinished = true;
                if (rafId) cancelAnimationFrame(rafId);
                if (timeoutId) clearTimeout(timeoutId);
                rotationRef.current = totalRotation;
                draw(ctx, canvas);
                // Report final segment
                const finalSeg = getPointerSegment(totalRotation);
                if (finalSeg && onSegmentChange) onSegmentChange(finalSeg.name);
                if (callback) callback();
            };

            const animate = (time) => {
                if (isFinished) return;
                let elapsed = time - startTime;
                if (elapsed >= durationMs) {
                    finish();
                    return;
                }
                
                let progress = elapsed / durationMs;
                let eased = easeOut(progress);
                
                let prevRot = rotationRef.current;
                rotationRef.current = startRot + (totalRotation - startRot) * eased;
                
                // Trigger tick sound if a segment boundary is crossed
                const segmentAngle = (Math.PI * 2) / options.length;
                const prevSegmentCount = Math.floor(prevRot / segmentAngle);
                const newSegmentCount = Math.floor(rotationRef.current / segmentAngle);
                
                if (prevSegmentCount !== newSegmentCount) {
                    if (onTick) onTick();
                }

                // Report current segment name for live readout
                const currentSeg = getPointerSegment(rotationRef.current);
                if (currentSeg && currentSeg.name !== lastReportedSegment) {
                    lastReportedSegment = currentSeg.name;
                    if (onSegmentChange) onSegmentChange(currentSeg.name);
                }
                
                draw(ctx, canvas);
                rafId = requestAnimationFrame(animate);
            };

            rafId = requestAnimationFrame(animate);

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

// Helper: darken a hex color
function darkenColor(hex, factor) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${Math.floor(r * factor)}, ${Math.floor(g * factor)}, ${Math.floor(b * factor)})`;
}

export default Wheel;
