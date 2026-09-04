import React from 'react';
import { RARITY } from '../data/rarity';
import RadarChart from './RadarChart';

export const WantedPoster = React.forwardRef(({ build, stats, overall, bounty, lore }, ref) => {
    return (
        <div ref={ref} className="w-[800px] h-[1131px] bg-[#f4e4bc] text-[#3e2723] p-12 relative flex flex-col font-serif" style={{ backgroundImage: 'radial-gradient(#e0c9a3 15%, transparent 16%), radial-gradient(#e0c9a3 15%, transparent 16%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px' }}>
            <div className="absolute inset-0 border-[16px] border-[#3e2723] m-8 opacity-90"></div>
            
            <h1 className="text-center text-[80px] font-black tracking-widest mt-8 mb-4 opacity-90 uppercase" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                WANTED
            </h1>
            <h2 className="text-center text-3xl tracking-[0.5em] mb-8 font-bold">DEAD OR ALIVE</h2>
            
            <div className="flex-1 mx-8 border-8 border-[#3e2723] bg-[#e0c9a3] flex flex-col items-center justify-center p-8 relative overflow-hidden shadow-inner">
                {/* Vintage overlay */}
                <div className="absolute inset-0 bg-black opacity-10 mix-blend-overlay"></div>
                <div className="z-10 text-center">
                    <h3 className="text-4xl font-black mb-4 uppercase">{lore?.epithet || 'UNKNOWN'}</h3>
                    <div className="text-2xl font-bold uppercase tracking-widest text-[#5d4037] mb-8">{build.race?.name} / {build.origin?.name}</div>
                    
                    {/* Simplified Stats for poster */}
                    <div className="grid grid-cols-2 gap-x-12 gap-y-6 text-xl text-left font-bold border-t-4 border-b-4 border-[#3e2723] py-8">
                        <div>STR: {Math.round(stats.str)}</div>
                        <div>SPD: {Math.round(stats.spd)}</div>
                        <div>DUR: {Math.round(stats.dur)}</div>
                        <div>HAX: {Math.round(stats.hax)}</div>
                    </div>
                    <div className="mt-8 text-2xl italic font-bold">Power: {overall}</div>
                </div>
            </div>
            
            <div className="mt-8 text-center px-8 flex flex-col justify-end">
                <div className="text-[60px] font-black tracking-tight mb-2 uppercase break-words leading-none">
                    {lore?.name || 'UNKNOWN LEGEND'}
                </div>
                <div className="text-[70px] font-black tracking-tighter flex items-center justify-center gap-4 border-t-[6px] border-[#3e2723] pt-4 mt-4">
                    <span className="text-[50px]">฿</span> {bounty?.toLocaleString() || '0'}
                </div>
                <div className="text-right text-xl font-bold mt-4 tracking-widest">MARINE HQ</div>
            </div>
        </div>
    );
});

export const BingoBook = React.forwardRef(({ build, stats, overall, lore, tier }, ref) => {
    return (
        <div ref={ref} className="w-[800px] h-[1131px] bg-[#111] text-[#e0e0e0] p-12 relative flex flex-col font-mono border-l-[40px] border-[#222]">
            <div className="border-4 border-[#333] p-8 flex-1 flex flex-col relative">
                {/* Stamp */}
                <div className="absolute top-4 right-4 border-4 border-red-800 text-red-800 text-4xl font-black p-4 transform rotate-12 opacity-80 uppercase">
                    CLASSIFIED / {tier?.name || 'S-RANK'}
                </div>
                
                <h1 className="text-5xl font-black mb-12 tracking-widest border-b-2 border-[#333] pb-4 uppercase">
                    BINGO BOOK ENTRY
                </h1>
                
                <div className="flex gap-8 mb-12">
                    <div className="flex-1">
                        <div className="text-xl text-gray-500 mb-2 uppercase">Subject Name</div>
                        <div className="text-4xl font-bold mb-6 text-white uppercase">{lore?.name || 'UNKNOWN'}</div>
                        
                        <div className="text-xl text-gray-500 mb-2 uppercase">Alias / Moniker</div>
                        <div className="text-3xl font-bold mb-6 text-red-400 italic">"{lore?.epithet || 'NONE'}"</div>
                        
                        <div className="text-xl text-gray-500 mb-2 uppercase">Origin / Lineage</div>
                        <div className="text-2xl font-bold mb-2 uppercase">{build.origin?.name}</div>
                        <div className="text-2xl font-bold mb-6 uppercase text-gray-300">{build.trait?.name !== 'None' ? build.trait?.name : ''}</div>
                    </div>
                    
                    <div className="w-[300px] bg-[#0a0a0a] border border-[#333] flex items-center justify-center p-4">
                        <RadarChart stats={stats} size={280} />
                    </div>
                </div>
                
                <div className="mb-8">
                    <div className="text-xl text-gray-500 mb-4 uppercase border-b border-[#333] pb-2">Combat Profile</div>
                    <div className="grid grid-cols-2 gap-4 text-lg">
                        <div><span className="text-gray-500">DF/Power:</span> <span className="font-bold text-purple-400">{build.df?.name || 'None'}</span></div>
                        <div><span className="text-gray-500">Haki (Conq):</span> <span className="font-bold text-yellow-400">{build.haki_conq?.name || 'None'}</span></div>
                        <div><span className="text-gray-500">Dojutsu:</span> <span className="font-bold text-red-500">{build.dojutsu?.name || 'None'}</span></div>
                        <div><span className="text-gray-500">Weapon:</span> <span className="font-bold text-gray-300">{build.weapon?.name || 'None'}</span></div>
                    </div>
                </div>
                
                <div className="flex-1">
                    <div className="text-xl text-gray-500 mb-4 uppercase border-b border-[#333] pb-2">Intelligence Briefing</div>
                    <p className="text-xl leading-relaxed text-gray-300 italic">
                        {lore?.bio || 'No intelligence gathered.'}
                    </p>
                </div>
                
                <div className="mt-8 border-t-2 border-[#333] pt-4 flex justify-between text-gray-600 text-lg uppercase font-bold">
                    <span>File No: {Math.floor(Math.random() * 90000) + 10000}</span>
                    <span>Threat Level: {overall}</span>
                </div>
            </div>
        </div>
    );
});
