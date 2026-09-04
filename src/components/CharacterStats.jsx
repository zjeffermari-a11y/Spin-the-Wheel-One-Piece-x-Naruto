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
        <div className="bg-[#1a1a1a] p-4 rounded-xl shadow-lg border border-[#2a2a2a]">
            <h4 className="text-xl font-bold mb-4 text-[#e0e0e0] border-b border-[#333] pb-2">{title}</h4>
            <div className="space-y-3">
                {Object.entries(stats).map(([key, rawValue]) => {
                    const value = Number.isFinite(rawValue) ? rawValue : 0;
                    const label = STAT_LABELS[key] || key.toUpperCase();
                    return (
                        <div key={key} className="flex items-center gap-3">
                            <div className="text-sm font-bold text-[#9ca3af] w-12 text-right uppercase">{label}</div>
                            <div className="flex-1 bg-[#0a0a0a] rounded-full h-4 overflow-hidden border border-[#333]">
                                <div
                                    className="h-full bg-gradient-to-r from-indigo-600 to-cyan-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                                    style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
                                />
                            </div>
                            <div className="text-sm font-bold text-white w-10 text-right">{Math.round(value)}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
