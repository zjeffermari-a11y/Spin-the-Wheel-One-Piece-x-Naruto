import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { RARITY } from '../data/rarity';

const Wheel = forwardRef(({ options }, ref) => {
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
        ctx.rotate(rotationRef.current);

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
            
            ctx.fillStyle = RARITY[opt.rarity]?.color || '#333';
            ctx.fill();
            ctx.strokeStyle = '#1a1a1a';
            ctx.lineWidth = 4;
            ctx.stroke();

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
            
            currentAngle += arc;
        }

        ctx.beginPath();
        ctx.arc(0, 0, 40, 0, Math.PI * 2);
        ctx.fillStyle = '#1a1a1a';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.restore();
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        rotationRef.current = 0;
        draw(ctx, canvas);
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
            const startTime = performance.now();
            const startRot = rotationRef.current;
            const easeOut = t => 1 - (--t) * t * t * t;

            const animate = (time) => {
                let elapsed = time - startTime;
                if (elapsed > durationMs) elapsed = durationMs;
                
                let progress = elapsed / durationMs;
                let eased = easeOut(progress);
                
                rotationRef.current = startRot + (totalRotation - startRot) * eased;
                draw(ctx, canvas);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    if (callback) callback();
                }
            };
            requestAnimationFrame(animate);
        }
    }));

    return (
        <div className="relative wheel-container max-w-md mx-auto aspect-square">
            <canvas ref={canvasRef} width={500} height={500} className="w-full h-full object-contain" />
        </div>
    );
});

export default Wheel;
