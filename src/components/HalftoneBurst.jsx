import React from 'react';
import { motion } from 'framer-motion';

const BurstParticle = ({ angle, distance, size, color, shape, delay }) => {
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;
    
    return (
        <motion.div
            initial={{ x: 0, y: 0, scale: 0, rotate: 0 }}
            animate={{ 
                x: tx, 
                y: ty, 
                scale: [0, 1.5, 0],
                rotate: 180 + Math.random() * 180
            }}
            transition={{ 
                duration: 0.8 + Math.random() * 0.4, 
                ease: [0.19, 1, 0.22, 1], // easeOutExpo
                delay: delay
            }}
            className="absolute origin-center"
            style={{
                width: size,
                height: size,
                backgroundColor: color,
                border: '4px solid #111111',
                borderRadius: shape === 'circle' ? '50%' : '0%',
                zIndex: 0
            }}
        />
    );
};

export default function HalftoneBurst({ color }) {
    // Generate a mix of particles
    const particles = Array.from({ length: 60 }).map((_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const distance = 100 + Math.random() * 600; // Explode outward
        const size = 15 + Math.random() * 30; // Chonky particles
        
        // 60% black, 20% white, 20% rarity color
        const rand = Math.random();
        let pColor = '#111111';
        if (rand > 0.8) pColor = color || '#ff0000';
        else if (rand > 0.6) pColor = '#ffffff';

        const shape = Math.random() > 0.5 ? 'circle' : 'square';
        const delay = Math.random() * 0.1;

        return { angle, distance, size, pColor, shape, delay, id: i };
    });

    return (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10 overflow-hidden">
            {/* Expanding shockwave ring */}
            <motion.div
                initial={{ scale: 0.1, opacity: 1, borderWidth: '30px' }}
                animate={{ scale: 5, opacity: 0, borderWidth: '0px' }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="absolute rounded-full border-black"
                style={{ width: '200px', height: '200px' }}
            />
            
            {/* Comic flash starburst */}
            <motion.div
                initial={{ scale: 0, opacity: 1, rotate: -20 }}
                animate={{ scale: [0, 1.5, 1.8], opacity: [1, 1, 0], rotate: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="absolute bg-white"
                style={{
                    width: '300px', height: '300px',
                    clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                    backgroundColor: color || '#ff0000',
                    border: '8px solid black'
                }}
            />

            {particles.map(p => (
                <BurstParticle 
                    key={p.id}
                    angle={p.angle}
                    distance={p.distance}
                    size={p.size}
                    color={p.pColor}
                    shape={p.shape}
                    delay={p.delay}
                />
            ))}
        </div>
    );
}
