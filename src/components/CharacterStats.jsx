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
        <div className="bg-gray-50 p-6 border border-gray-200 shadow-sm">
            <h4 className="text-xl font-black mb-4 text-black border-b-2 border-black pb-2 uppercase">{title}</h4>
            <div className="space-y-3">
                {Object.entries(stats).map(([key, rawValue]) => {
                    const value = Number.isFinite(rawValue) ? rawValue : 0;
                    const label = STAT_LABELS[key] || key.toUpperCase();
                    return (
                        <div key={key} className="flex items-center gap-3">
                            <div className="text-sm font-black text-black w-12 text-right uppercase">{label}</div>
                            <div className="flex-1 bg-gray-200 border-2 border-black h-6">
                                <div
                                    className="h-full bg-black transition-all duration-1000 ease-out"
                                    style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
                                />
                            </div>
                            <div className="text-sm font-black text-black w-10 text-right">{Math.round(value)}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
