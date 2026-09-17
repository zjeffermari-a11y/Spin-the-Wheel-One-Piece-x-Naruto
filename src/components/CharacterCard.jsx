import React, { useRef } from 'react';
import CharacterStats from './CharacterStats';
import { Download, Copy } from 'lucide-react';
import { RARITY } from '../data/rarity';

export default function CharacterCard({ build, stats, overall, bounty, lore, synergies, tier, isGeneratingLore }) {
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
**Bounty:** ฿ ${bounty === -1 ? '??? (Unknown)' : bounty?.toLocaleString() || '0'}
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
            <div className="flex justify-end gap-3 min-h-[40px]">
                {lore && (
                    <>
                        <button 
                            onClick={handleCopyMarkdown}
                            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 border-2 border-black text-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform active:translate-y-1 active:shadow-none font-black uppercase cursor-pointer"
                        >
                            <Copy size={18} />
                            Copy Markdown
                        </button>
                        <button 
                            onClick={handleDownload}
                            className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 text-white border-2 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform active:translate-y-1 active:shadow-none font-black uppercase cursor-pointer"
                        >
                            <Download size={18} />
                            Download PDF
                        </button>
                    </>
                )}
            </div>
            
            <div ref={cardRef} className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                {/* Header */}
                <div className="p-8 border-b-4 border-black bg-white relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div 
                            className={`px-4 py-1 rounded-none text-sm font-black border-4 ${tierClass} bg-white`}
                            style={{ color: tierColor, borderColor: tierColor }}
                        >
                            {tier?.name || 'Unknown Tier'}
                        </div>
                        <div className="text-3xl font-black tracking-tighter text-black flex items-center gap-2">
                            <span className="text-4xl">฿</span> {bounty === -1 ? '??? (UNKNOWN)' : bounty?.toLocaleString() || '0'}
                        </div>
                    </div>
                    
                    <h2 className="text-5xl md:text-6xl font-black mb-2 tracking-tighter text-black uppercase">
                        {lore?.name || 'Unknown Legend'}
                    </h2>
                    <div className="text-2xl md:text-3xl text-red-600 font-black italic mb-6 uppercase tracking-tight">
                        "{lore?.epithet || 'The Nameless'}"
                    </div>
                    
                    <div className="flex gap-4 text-base font-black uppercase tracking-widest text-gray-600 mb-8">
                        <span>{build.race?.name || 'Unknown Race'}</span>
                        <span className="text-black">/</span>
                        <span>{build.origin?.name || 'Unknown Origin'}</span>
                    </div>

                    <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
                        <div className="text-base font-black text-black mb-2 uppercase">OVERALL POWER <span className="text-red-600 text-xl ml-2">{overall || 0}</span></div>
                        <div className="h-6 bg-gray-200 border-2 border-black overflow-hidden">
                            <div 
                                className="h-full bg-red-600 transition-all duration-1000"
                                style={{ width: `${Math.min(100, Math.max(0, (overall / 150) * 100))}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50">
                    <CharacterStats stats={stats} />
                    
                    <div className="bg-white p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <h4 className="text-xl font-black mb-4 text-black border-b-4 border-black pb-2 uppercase">Build Profile</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                            {Object.entries(build).map(([key, item]) => {
                                if (['str', 'spd', 'dur', 'iq', 'combat', 'chakra_cap'].includes(key)) return null;
                                if (!item || item.name === 'None') return null;
                                
                                const label = key.replace(/_/g, ' ').toUpperCase();
                                return (
                                    <div key={key} className="flex flex-col">
                                        <span className="text-xs text-gray-500 font-black uppercase">{label}</span>
                                        <span className={`text-sm font-black uppercase res-${item.rarity || 'C'}`} style={{ color: RARITY[item.rarity]?.color }}>
                                            {item.name}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="md:col-span-2 bg-white p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <h4 className="text-xl font-black mb-4 text-black border-b-4 border-black pb-2 uppercase">Active Synergies</h4>
                        {synergies && synergies.length > 0 ? (
                            <div className="space-y-4">
                                {synergies.map((syn, idx) => (
                                    <div key={idx} className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                        <div className="text-xl font-black text-black mb-1 uppercase">{syn.name}</div>
                                        <div className="text-base text-gray-700 font-medium mb-3">{syn.desc || syn.synergy_desc}</div>
                                        <div className="flex flex-wrap gap-2">
                                            {syn.bonuses && Object.entries(syn.bonuses).map(([stat, val]) => (
                                                val !== 0 ? (
                                                    <span key={stat} className={`text-sm font-black px-2 py-1 uppercase border-2 border-black ${val > 0 ? 'bg-green-400 text-black' : 'bg-red-400 text-black'}`}>
                                                        {stat.toUpperCase()} {val > 0 ? '+' : ''}{val}
                                                    </span>
                                                ) : null
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-gray-500 font-black uppercase">No active synergies found for this build.</div>
                        )}
                    </div>

                    <div className="md:col-span-2 bg-white p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <h4 className="text-xl font-black mb-4 text-black border-b-4 border-black pb-2 uppercase">Signature Abilities</h4>
                        {!lore && !isGeneratingLore ? (
                            <div className="text-gray-500 font-black uppercase">Lore has not been generated yet.</div>
                        ) : !lore && isGeneratingLore ? (
                            <div className="text-red-600 font-black uppercase tracking-widest animate-pulse">
                                Forging signature moves...
                            </div>
                        ) : lore.signature_abilities && lore.signature_abilities.length > 0 ? (
                            <div className="space-y-4">
                                {lore.signature_abilities.map((ability, idx) => (
                                    <div key={idx} className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                        <div className="text-xl font-black text-red-600 mb-1 uppercase">{ability.name}</div>
                                        <div className="text-base text-black font-medium">{ability.desc}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-gray-500 font-black uppercase">No signature abilities recorded.</div>
                        )}
                    </div>

                    <div className="md:col-span-2 bg-white p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <h4 className="text-xl font-black mb-4 text-black border-b-4 border-black pb-2 uppercase">Lore & Legend</h4>
                        {!lore && !isGeneratingLore ? (
                            <div className="text-gray-500 font-black uppercase">Lore has not been generated yet.</div>
                        ) : !lore && isGeneratingLore ? (
                            <div className="text-red-600 font-black uppercase tracking-widest animate-pulse">
                                Consulting the ancient texts...
                            </div>
                        ) : !lore.bio ? (
                            <div className="text-red-600 font-black uppercase">Failed to generate lore. Is your Ollama server running?</div>
                        ) : (
                            <p className="text-black font-medium leading-relaxed text-base md:text-lg">
                                {lore.bio}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
