import React from 'react';

const RadarChart = ({ stats, size = 200 }) => {
    const statKeys = ['str', 'spd', 'dur', 'iq', 'haki', 'pwr', 'hax'];
    const center = size / 2;
    const radius = (size / 2) - 30; // padding for labels
    
    // Calculate coordinates for a given value and index
    const getPoint = (value, index) => {
        // -Math.PI / 2 starts it at the top
        const angle = (Math.PI * 2 * index) / statKeys.length - Math.PI / 2;
        // Normalize value (0-100) to radius
        const distance = (Math.max(0, Math.min(100, value)) / 100) * radius;
        return {
            x: center + distance * Math.cos(angle),
            y: center + distance * Math.sin(angle)
        };
    };

    // Generate grid polygons (e.g., 20%, 40%, 60%, 80%, 100%)
    const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];
    const gridPolygons = gridLevels.map(level => {
        const points = statKeys.map((_, i) => {
            const p = getPoint(100 * level, i);
            return `${p.x},${p.y}`;
        }).join(' ');
        return <polygon key={level} points={points} fill="none" stroke="#333" strokeWidth="1" />;
    });

    // Generate axes lines
    const axes = statKeys.map((_, i) => {
        const p = getPoint(100, i);
        return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="#333" strokeWidth="1" />;
    });

    // Generate the actual stats polygon
    const statPoints = statKeys.map((key, i) => {
        const value = stats[key] || 0;
        const p = getPoint(value, i);
        return `${p.x},${p.y}`;
    }).join(' ');

    // Generate labels
    const labels = statKeys.map((key, i) => {
        const p = getPoint(125, i); // Push labels outside
        const val = Math.round(stats[key] || 0);
        return (
            <g key={key} transform={`translate(${p.x}, ${p.y})`}>
                <text 
                    textAnchor="middle" 
                    dominantBaseline="middle" 
                    fill="#9ca3af" 
                    fontSize="10" 
                    fontWeight="bold"
                    transform="translate(0, -6)"
                >
                    {key.toUpperCase()}
                </text>
                <text 
                    textAnchor="middle" 
                    dominantBaseline="middle" 
                    fill="#ffffff" 
                    fontSize="12" 
                    fontWeight="bold"
                    transform="translate(0, 6)"
                >
                    {val}
                </text>
            </g>
        );
    });

    return (
        <div className="relative w-full flex justify-center items-center p-4">
            <svg width={size} height={size} className="overflow-visible filter drop-shadow-[0_0_15px_rgba(79,70,229,0.2)]">
                {/* Grid */}
                {gridPolygons}
                {axes}
                
                {/* Stats Polygon */}
                <polygon 
                    points={statPoints} 
                    fill="rgba(99, 102, 241, 0.3)" 
                    stroke="#6366f1" 
                    strokeWidth="2" 
                    className="transition-all duration-1000 ease-out"
                />
                
                {/* Data Points */}
                {statKeys.map((key, i) => {
                    const value = stats[key] || 0;
                    const p = getPoint(value, i);
                    return (
                        <circle 
                            key={key} 
                            cx={p.x} 
                            cy={p.y} 
                            r={3} 
                            fill="#ffffff" 
                            stroke="#6366f1" 
                            strokeWidth="1.5" 
                        />
                    );
                })}
                
                {/* Labels */}
                {labels}
            </svg>
        </div>
    );
};

export default RadarChart;
