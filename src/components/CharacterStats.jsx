import React from 'react';

const STAT_LABELS = {
    str: 'STR',
    spd: 'SPD',
    dur: 'DUR',
    iq: 'IQ',
    haki: 'HAKI',
    pwr: 'PWR',
    hax: 'HAX'
};

export default function CharacterStats({ stats, title = "Base Stats" }) {
    if (!stats) return null;

    return (
        <div className="bg-white/50 p-4 md:p-6 border-2 border-black shadow-brutal-sm">
            <h4 className="text-3xl font-display uppercase mb-4 text-black border-b-4 border-black pb-2">{title}</h4>
            <div className="space-y-4 mt-4">
                {Object.entries(stats).map(([key, rawValue]) => {
                    const value = Number.isFinite(rawValue) ? rawValue : 0;
                    const label = STAT_LABELS[key] || key.toUpperCase();
                    
                    return (
                        <div key={key} className="flex items-center gap-3">
                            <div className="text-sm font-display font-bold uppercase tracking-widest text-gray-800 w-12 text-right">{label}</div>
                            <div className="flex-1 bg-white border-2 border-black h-6 overflow-hidden">
                                <div
                                    className="h-full bg-black transition-all duration-1000 ease-out"
                                    style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
                                />
                            </div>
                            <div className="text-lg font-display text-black w-10 text-right">{Math.round(value)}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
