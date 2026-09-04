import React, { useRef, useState } from 'react';
import CharacterStats from './CharacterStats';
import { Download, FileText, Image as ImageIcon, ChevronDown } from 'lucide-react';
import { RARITY } from '../data/rarity';
import { WantedPoster, BingoBook } from './ExportPosters';

export default function CharacterCard({ build, stats, overall, bounty, lore, synergies, tier }) {
    const cardRef = useRef(null);
    const wantedRef = useRef(null);
    const bingoRef = useRef(null);
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

    const handleDownload = async (targetRef, filename, bgColor) => {
        if (!targetRef.current) return;
        const currentScroll = window.scrollY;
        const card = targetRef.current;

        // Briefly make it visible to html-to-image
        const originalStyle = card.style.cssText;
        card.style.position = 'absolute';
        card.style.left = '0';
        card.style.top = '0';
        card.style.zIndex = '-1000';
        card.style.opacity = '1';
        card.style.pointerEvents = 'none';

        try {
            const { toPng } = await import('html-to-image');
            const { jsPDF } = await import('jspdf');

            const dataUrl = await toPng(card, {
                quality: 0.95,
                backgroundColor: bgColor,
                pixelRatio: 2
            });

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [card.offsetWidth, card.offsetHeight]
            });

            pdf.addImage(dataUrl, 'PNG', 0, 0, card.offsetWidth, card.offsetHeight);
            pdf.save(filename);
        } catch (error) {
            console.error('Failed to generate PDF:', error);
            alert('PDF generation failed. Please try again.');
        } finally {
            card.style.cssText = originalStyle;
            window.scrollTo(0, currentScroll);
            setIsExportMenuOpen(false);
        }
    };

    if (!build || Object.keys(build).length === 0) return null;

    const tierClass = tier ? `rarity-${tier.rarity}` : 'rarity-Common';
    const tierColor = tier ? RARITY[tier.rarity]?.color : RARITY.C.color;

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-4">
            <div className="flex justify-end relative">
                <button 
                    onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-lg transition-colors font-bold shadow-lg"
                >
                    <Download size={18} />
                    Export
                    <ChevronDown size={18} className={`transition-transform ${isExportMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isExportMenuOpen && (
                    <div className="absolute top-full mt-2 right-0 bg-[#1a1a1a] border border-[#333] rounded-lg shadow-xl overflow-hidden z-50 w-48">
                        <button 
                            onClick={() => handleDownload(cardRef, `${lore?.name || 'Legend'}_Card.pdf`, '#111')}
                            className="w-full text-left px-4 py-3 hover:bg-[#2a2a2a] flex items-center gap-2 text-sm font-bold transition-colors"
                        >
                            <FileText size={16} className="text-gray-400" /> Standard Card
                        </button>
                        <button 
                            onClick={() => handleDownload(wantedRef, `${lore?.name || 'Legend'}_Wanted.pdf`, '#f4e4bc')}
                            className="w-full text-left px-4 py-3 hover:bg-[#2a2a2a] flex items-center gap-2 text-sm font-bold transition-colors"
                        >
                            <ImageIcon size={16} className="text-yellow-600" /> Wanted Poster
                        </button>
                        <button 
                            onClick={() => handleDownload(bingoRef, `${lore?.name || 'Legend'}_BingoBook.pdf`, '#111')}
                            className="w-full text-left px-4 py-3 hover:bg-[#2a2a2a] flex items-center gap-2 text-sm font-bold transition-colors"
                        >
                            <ImageIcon size={16} className="text-red-500" /> Bingo Book
                        </button>
                    </div>
                )}
            </div>
            
            <div ref={cardRef} className="bg-[#111] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden border border-[#333]">
                {/* Header */}
                <div className="p-8 border-b border-[#222] bg-gradient-to-b from-[#1a1a1a] to-[#111] relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div 
                            className={`px-4 py-1 rounded-full text-sm font-bold border-2 ${tierClass} bg-black/50 backdrop-blur-sm`}
                            style={{ color: tierColor, borderColor: tierColor }}
                        >
                            {tier?.name || 'Unknown Tier'}
                        </div>
                        <div className="text-2xl font-bold tracking-wider text-[#ffd700] flex items-center gap-2 drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">
                            <span className="text-3xl">฿</span> {bounty?.toLocaleString() || '0'}
                        </div>
                    </div>
                    
                    <h2 className="text-4xl md:text-5xl font-black mb-2 tracking-tight text-white drop-shadow-lg">
                        {lore?.name || 'Unknown Legend'}
                    </h2>
                    <div className="text-xl md:text-2xl text-[#818cf8] font-medium italic mb-6">
                        "{lore?.epithet || 'The Nameless'}"
                    </div>
                    
                    <div className="flex gap-4 text-sm font-bold uppercase tracking-wider text-[#9ca3af] mb-8">
                        <span>{build.race?.name || 'Unknown Race'}</span>
                        <span className="text-[#333]">/</span>
                        <span>{build.origin?.name || 'Unknown Origin'}</span>
                    </div>

                    <div className="bg-[#0a0a0a] rounded-xl p-4 border border-[#222]">
                        <div className="text-sm font-bold text-[#6b7280] mb-2">OVERALL POWER <span className="text-white text-lg ml-2">{overall || 0}</span></div>
                        <div className="h-6 bg-[#111] rounded-full overflow-hidden border border-[#333]">
                            <div 
                                className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-1000"
                                style={{ width: `${Math.min(100, Math.max(0, (overall / 150) * 100))}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#0a0a0a]">
                    <CharacterStats stats={stats} />
                    
                    <div className="bg-[#1a1a1a] p-6 rounded-xl shadow-lg border border-[#2a2a2a]">
                        <h4 className="text-xl font-bold mb-4 text-[#e0e0e0] border-b border-[#333] pb-2">Build Profile</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                            {Object.entries(build).map(([key, item]) => {
                                if (['str', 'spd', 'dur', 'iq', 'combat', 'chakra_cap'].includes(key)) return null;
                                if (!item || item.name === 'None') return null;
                                
                                const label = key.replace(/_/g, ' ').toUpperCase();
                                return (
                                    <div key={key} className="flex flex-col">
                                        <span className="text-xs text-[#6b7280] font-bold">{label}</span>
                                        <span className={`text-sm font-bold res-${item.rarity || 'C'}`} style={{ color: RARITY[item.rarity]?.color }}>
                                            {item.name}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="md:col-span-2 bg-[#1a1a1a] p-6 rounded-xl shadow-lg border border-[#2a2a2a]">
                        <h4 className="text-xl font-bold mb-4 text-[#e0e0e0] border-b border-[#333] pb-2">Active Synergies</h4>
                        {synergies && synergies.length > 0 ? (
                            <div className="space-y-4">
                                {synergies.map((syn, idx) => (
                                    <div key={idx} className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 p-4 rounded-lg border border-[#6366f1]/20">
                                        <div className="text-lg font-bold text-[#a5b4fc] mb-1">{syn.name}</div>
                                        <div className="text-sm text-[#d1d5db] italic mb-2">{syn.desc || syn.synergy_desc}</div>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {syn.bonuses && Object.entries(syn.bonuses).map(([stat, val]) => (
                                                val !== 0 ? (
                                                    <span key={stat} className={`text-xs font-bold px-2 py-1 rounded bg-[#0a0a0a] ${val > 0 ? 'text-[#4ade80] border border-[#14532d]' : 'text-[#f87171] border border-[#7f1d1d]'}`}>
                                                        {stat.toUpperCase()} {val > 0 ? '+' : ''}{val}
                                                    </span>
                                                ) : null
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-[#6b7280] italic">No active synergies found for this build.</div>
                        )}
                    </div>

                    <div className="md:col-span-2 bg-[#1a1a1a] p-6 rounded-xl shadow-lg border border-[#2a2a2a]">
                        <h4 className="text-xl font-bold mb-4 text-[#e0e0e0] border-b border-[#333] pb-2">Lore & Legend</h4>
                        {!lore ? (
                            <div className="text-[#818cf8] italic animate-pulse flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-[#6366f1] border-t-transparent rounded-full animate-spin" />
                                Consulting the ancient texts... (Generating lore)
                            </div>
                        ) : !lore.bio ? (
                            <div className="text-[#f87171] italic">Failed to generate lore. Is your Ollama server running?</div>
                        ) : (
                            <p className="text-[#d1d5db] leading-relaxed text-sm md:text-base italic">
                                {lore.bio}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Hidden export templates */}
            <div className="overflow-hidden h-0 w-0 absolute opacity-0 pointer-events-none">
                <WantedPoster ref={wantedRef} build={build} stats={stats} overall={overall} bounty={bounty} lore={lore} />
                <BingoBook ref={bingoRef} build={build} stats={stats} overall={overall} tier={tier} lore={lore} />
            </div>
        </div>
    );
}
