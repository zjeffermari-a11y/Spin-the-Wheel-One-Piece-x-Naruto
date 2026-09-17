import React from 'react';
import { RARITY } from '../data/rarity';

const RarityLegend = () => {
    // Calculate total weight
    const totalWeight = Object.values(RARITY).reduce((acc, rarity) => acc + rarity.weight, 0);

    return (
        <div className="absolute top-4 left-4 lg:top-8 lg:left-8 bg-white border border-gray-200 p-4 shadow-sm hover:shadow-md z-10 w-48 hidden md:block">
            <h4 className="text-lg font-display uppercase tracking-widest text-black mb-3 border-b-2 border-black pb-1">
                Drop Rates
            </h4>
            <div className="space-y-2">
                {Object.values(RARITY).map((rarity, index) => {
                    const percentage = ((rarity.weight / totalWeight) * 100).toFixed(1);
                    return (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div 
                                    className="w-4 h-4 border border-gray-200"
                                    style={{ backgroundColor: rarity.color }}
                                />
                                <span className="text-sm font-bold uppercase" style={{ color: rarity.color }}>
                                    {rarity.name}
                                </span>
                            </div>
                            <span className="text-sm font-bold text-gray-700">
                                {percentage}%
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RarityLegend;
