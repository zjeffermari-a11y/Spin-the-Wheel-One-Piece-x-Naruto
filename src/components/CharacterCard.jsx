import React, { useRef } from 'react';
import CharacterStats from './CharacterStats';
import { Download, Copy } from 'lucide-react';
import { RARITY } from '../data/rarity';

export default function CharacterCard({ build, stats, overall, bounty, lore, synergies, tier }) {
    const cardRef = useRef(null);

    const handleCopyMarkdown = () => {
        const synergiesMarkdown = synergies && synergies.length > 0 
            ? synergies.map(syn => `- **${syn.name}**: ${syn.desc || syn.synergy_desc}`).join('\n')
            : 'None';
            
        const signatureAbilitiesMarkdown = lore?.signature_abilities && lore.signature_abilities.length > 0
            ? lore.signature_abilities.map(ability => `- **${ability.name}**: ${ability.desc}`).join('\n')
            : 'None';

        const md = `# ${lore?.name || 'Unknown Legend'}
*"${lore?.epithet || 'The Nameless'}"*

**Tier:** ${tier?.name || 'Unknown Tier'}
**Bounty:** ฿ ${Number(bounty) === -1 ? '??? (Unknown)' : bounty?.toLocaleString() || '0'}
**Overall Power:** ${overall || 0}

## Build Profile
- **Race:** ${build.race?.name || 'None'}
- **Origin:** ${build.origin?.name || 'None'}
- **Physical Vessel:** ${build.vessel?.name || 'None'}
- **Devil Fruit:** ${build.df?.name || 'None'}
- **Dōjutsu:** ${build.dojutsu?.name || 'None'}
- **Fighting Style:** ${build.style?.name || 'None'}
- **Weapon:** ${build.weapon?.name || 'None'}
- **Faction:** ${build.faction?.name || 'None'}

## Active Synergies
${synergiesMarkdown}

## Signature Abilities
${signatureAbilitiesMarkdown}

## Lore
${lore?.bio || ''}

## Stats
- **STR:** ${Math.round(stats?.str || 0)}
- **SPD:** ${Math.round(stats?.spd || 0)}
- **DUR:** ${Math.round(stats?.dur || 0)}
- **IQ:** ${Math.round(stats?.iq || 0)}
- **HAKI:** ${Math.round(stats?.haki || 0)}
- **PWR:** ${Math.round(stats?.pwr || 0)}
- **HAX:** ${Math.round(stats?.hax || 0)}
`;
        navigator.clipboard.writeText(md).then(() => {
            alert('Character profile copied to clipboard as Markdown!');
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy to clipboard.');
        });
    };

    const handleDownload = async () => {
        if (!cardRef.current) return;
        const currentScroll = window.scrollY;
        const card = cardRef.current;

        // Briefly position it for html-to-image
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
                backgroundColor: '#111',
                pixelRatio: 2
            });

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [card.offsetWidth, card.offsetHeight]
            });

            pdf.addImage(dataUrl, 'PNG', 0, 0, card.offsetWidth, card.offsetHeight);
            pdf.save(`${lore?.name || 'Legend'}_CharacterCard.pdf`);
        } catch (error) {
            console.error('Failed to generate PDF:', error);
            alert('PDF generation failed. Please try again.');
        } finally {
            card.style.cssText = originalStyle;
            window.scrollTo(0, currentScroll);
        }
    };

    if (!build || Object.keys(build).length === 0) return null;

    const tierClass = tier ? `rarity-${tier.rarity}` : 'rarity-Common';
    const tierColor = tier ? RARITY[tier.rarity]?.color : RARITY.C.color;

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button 
                    onClick={handleCopyMarkdown}
                    className="w-full sm:w-auto justify-center flex items-center gap-2 px-4 py-2 bg-white hover:bg-black hover:text-white border border-gray-200 text-black font-display uppercase tracking-widest cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-black focus:ring-offset-2"
                >
                    <Copy size={18} />
                    Copy Markdown
                </button>
                <button 
                    onClick={handleDownload}
                    className="w-full sm:w-auto justify-center flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-black text-white border border-gray-200 font-display uppercase tracking-widest cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-black focus:ring-offset-2"
                >
                    <Download size={18} />
                    Download PDF
                </button>
            </div>
            
            <div ref={cardRef} className="bg-white overflow-hidden border border-gray-200 manga-panel">
                {/* Header */}
                <div className="p-4 md:p-8 border-b border-gray-200 bg-white relative overflow-hidden bg-halftone">
                    <div className="flex justify-between items-start mb-4 gap-2">
                        <div 
                            className={`px-2 py-1 text-xs md:text-sm md:px-4 font-display uppercase tracking-widest border ${tierClass} bg-white text-black`}
                            style={{ borderColor: tierColor }}
                        >
                            {tier?.name || 'Unknown Tier'}
                        </div>
                        <div className="text-2xl md:text-4xl font-display tracking-widest text-black flex items-center gap-2 bg-white px-2 md:px-3 border border-gray-200">
                            <span>฿</span> {Number(bounty) === -1 ? '???' : bounty?.toLocaleString() || '0'}
                        </div>
                    </div>
                    
                    <h2 className="text-4xl md:text-6xl lg:text-8xl font-display mb-2 uppercase tracking-tight text-black break-words leading-none">
                        {lore?.name || 'UNKNOWN LEGEND'}
                    </h2>
                    <div className="text-lg md:text-2xl lg:text-3xl text-gray-700 font-bold mb-6 font-body uppercase break-words leading-snug">
                        "{lore?.epithet || 'The Nameless'}"
                    </div>
                    
                    <div className="flex flex-wrap gap-2 text-sm md:text-lg font-display uppercase tracking-widest text-black mb-8 bg-white p-2 border border-gray-200 w-fit max-w-full">
                        <span>{build.race?.name || 'Unknown Race'}</span>
                        <span>//</span>
                        <span>{build.origin?.name || 'Unknown Origin'}</span>
                    </div>

                    <div className="bg-white p-2 md:p-4 border border-gray-200">
                        <div className="text-sm md:text-lg font-display uppercase tracking-widest text-black mb-2">OVERALL POWER <span className="text-xl md:text-2xl ml-2">{overall || 0}</span></div>
                        <div className="h-6 md:h-8 bg-white overflow-hidden border border-gray-200">
                            <div 
                                className="h-full bg-black transition-all duration-1000"
                                style={{ width: `${Math.min(100, Math.max(0, (overall / 150) * 100))}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 bg-white border-t border-gray-100">
                    <CharacterStats stats={stats} />
                    
                    <div className="bg-white border border-gray-200 p-4 md:p-6">
                        <h4 className="text-3xl font-display uppercase mb-4 text-black border-b border-gray-200 pb-2">Build Profile</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                            {Object.entries(build).map(([key, item]) => {
                                if (['str', 'spd', 'dur', 'iq', 'combat', 'chakra_cap'].includes(key)) return null;
                                if (!item || item.name === 'None') return null;
                                
                                const label = key.replace(/_/g, ' ').toUpperCase();
                                return (
                                    <div key={key} className="flex flex-col border border-gray-200 p-2 bg-gray-50">
                                        <span className="text-xs text-gray-500 font-display uppercase tracking-widest">{label}</span>
                                        <span className={`text-lg font-bold uppercase font-display res-${item.rarity || 'C'}`} style={{ color: RARITY[item.rarity]?.color }}>
                                            {item.name}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="md:col-span-2 bg-white border border-gray-200 p-4 md:p-6">
                        <h4 className="text-3xl font-display uppercase mb-4 text-black border-b border-gray-200 pb-2">Active Synergies</h4>
                        {synergies && synergies.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {synergies.map((syn, idx) => (
                                    <div key={idx} className="bg-white p-4 border border-gray-200 shadow-sm hover:shadow-md">
                                        <div className="text-xl font-display uppercase text-black mb-1">{syn.name}</div>
                                        <div className="text-sm text-gray-700 mb-2 font-body font-bold">{syn.desc || syn.synergy_desc}</div>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {syn.bonuses && Object.entries(syn.bonuses).map(([stat, val]) => (
                                                val !== 0 ? (
                                                    <span key={stat} className={`text-xs font-display tracking-widest px-2 py-1 border border-gray-200 ${val > 0 ? 'bg-black text-white' : 'bg-red-500 text-white'}`}>
                                                        {stat.toUpperCase()} {val > 0 ? '+' : ''}{val}
                                                    </span>
                                                ) : null
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-gray-500 italic">No active synergies found for this build.</div>
                        )}
                    </div>

                    <div className="md:col-span-2 bg-white border border-gray-200 p-4 md:p-6">
                        <h4 className="text-3xl font-display uppercase mb-4 text-black border-b border-gray-200 pb-2">Signature Abilities</h4>
                        {!lore ? (
                            <div className="text-gray-500 italic font-body">
                                Signature abilities locked. Click "Generate Lore & Abilities" to unlock.
                            </div>
                        ) : lore.signature_abilities && lore.signature_abilities.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {lore.signature_abilities.map((ability, idx) => (
                                    <div key={idx} className="bg-white p-4 border border-gray-200 shadow-sm hover:shadow-md">
                                        <div className="text-xl font-display uppercase text-black mb-1">{ability.name}</div>
                                        <div className="text-sm text-gray-700 font-body font-bold">{ability.desc}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-gray-500 italic">No signature abilities recorded.</div>
                        )}
                    </div>

                    <div className="md:col-span-2 bg-white border border-gray-200 p-4 md:p-6">
                        <h4 className="text-3xl font-display uppercase mb-4 text-black border-b border-gray-200 pb-2">Lore & Legend</h4>
                        {!lore ? (
                            <div className="text-gray-500 italic font-body">
                                Legend unwritten. Click "Generate Lore & Abilities" to forge destiny.
                            </div>
                        ) : !lore.bio ? (
                            <div className="text-red-600 font-display uppercase tracking-widest">Failed to generate lore.</div>
                        ) : (
                            <p className="text-black font-body text-lg leading-relaxed border-l-4 border-rose-500 bg-white pl-4">
                                {lore.bio}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
