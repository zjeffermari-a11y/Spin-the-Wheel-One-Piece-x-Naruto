import React from 'react';
import { motion } from 'framer-motion';
import { RARITY } from '../data/rarity';

export default function ParticleGlow({ tier }) {
    if (!tier) return null;

    // Only show for high rarities (Epic, Legend, Mythic) or whatever is corresponding to OP/Broken.
    // In getTier, Overpowered is 'E' and Broken is 'L' (and Mythic is 'M' if added).
    if (!['E', 'L', 'M'].includes(tier.rarity)) {
        return null;
    }

    const color = RARITY[tier.rarity]?.color || '#ffd700';

    // Generate random particles
    const particles = Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100, // percentage
        y: Math.random() * 100, // percentage
        size: Math.random() * 10 + 5,
        duration: Math.random() * 2 + 2,
        delay: Math.random() * 2
    }));

    return (
        <div className="absolute -inset-10 z-0 pointer-events-none rounded-xl">
            {/* Base Glow */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.15 }}
                transition={{ duration: 1 }}
                className="absolute inset-10"
                style={{
                    background: `radial-gradient(circle at center, ${color} 0%, transparent 70%)`
                }}
            />
            
            {/* Floating Particles */}
            {particles.map(p => (
                <motion.div
                    key={p.id}
                    className="absolute rounded-full"
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: p.size,
                        height: p.size,
                        backgroundColor: color,
                        boxShadow: `0 0 10px ${color}`
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                        opacity: [0, 0.8, 0],
                        y: [20, -100]
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        delay: p.delay,
                        ease: "easeOut"
                    }}
                />
            ))}
        </div>
    );
}
