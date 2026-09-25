import { resolveBuildMechanics } from '../utils/buildMechanics';
import { CATEGORIES } from '../data/categories';
import React, { useRef } from 'react';
import CharacterStats from './CharacterStats';
import { Download, Copy } from 'lucide-react';
import { RARITY } from '../data/rarity';

export default function CharacterCard({ build, stats, overall, bounty, lore, synergies, tier, portraitUrl, isGeneratingPortrait }) {
    const cardRef = useRef(null);
    const resolved = resolveBuildMechanics(build);
    const categoryLabel = key => CATEGORIES.find(category => category.id === key)?.name || key.replace(/_/g, ' ');

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
**Lore source:** ${lore?.generation_source === 'local' ? 'Local templates' : lore?.generation_source === 'ai' ? 'AI generation' : 'Saved character'}

## Build Profile
${Object.entries(build).filter(([, item]) => item?.name && item.name !== 'None').map(([key, item]) => `- **${categoryLabel(key)}:** ${item.name}`).join('\n')}

## Unlocked Abilities
${resolved.abilities.map(a => `- **${a.name}:** ${a.desc}`).join('\n') || 'Selected base abilities only.'}

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
                    className="w-full sm:w-auto justify-center flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-zinc-100 border-2 border-black text-black font-display uppercase tracking-widest cursor-pointer shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-75 focus:outline-none"
                >
                    <Copy size={18} />
                    Copy Markdown
                </button>
                <button 
                    onClick={handleDownload}
                    className="w-full sm:w-auto justify-center flex items-center gap-2 px-4 py-2 bg-black hover:bg-zinc-800 text-white border-2 border-black font-display uppercase tracking-widest cursor-pointer shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-75 focus:outline-none"
                >
                    <Download size={18} />
                    Download PDF
                </button>
            </div>
            
            <div ref={cardRef} className="bg-[#e8dcc7]/90 backdrop-blur-md overflow-hidden border-4 border-black shadow-brutal pb-8">
                {lore?.generation_source && <p className="px-4 pt-3 text-xs text-center uppercase tracking-widest">{lore.generation_source === 'local' ? 'Local template lore' : 'AI-generated lore'}</p>}
                {/* Poster Header */}
                <div className="pt-8 md:pt-12 px-4 text-center">
                    <h1 className="wanted-text text-7xl md:text-[10rem] text-zinc-900 mb-2 leading-none">WANTED</h1>
                    <h2 className="text-xl md:text-4xl text-zinc-800 tracking-[0.5em] md:tracking-[1em] font-display mb-6 ml-[0.5em] md:ml-[1em]">DEAD OR ALIVE</h2>
                </div>
                
                {/* Center Portrait Frame */}
                <div className="border-4 border-black bg-white/40 m-6 md:m-12 mt-0 aspect-square md:aspect-[4/3] flex flex-col items-center justify-center relative overflow-hidden shadow-brutal-sm">
                    {/* Marine Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                        <div className="text-[20rem] md:text-[30rem] font-display">⚓</div>
                    </div>
                    
                    {isGeneratingPortrait ? (
                        <div className="z-10 flex flex-col items-center justify-center">
                            <div className="w-16 h-16 mb-4 border-8 border-black border-t-transparent rounded-full animate-spin"></div>
                            <div className="font-display uppercase tracking-widest text-xl text-black">Awaiting Visuals...</div>
                        </div>
                    ) : portraitUrl ? (
                        <img 
                            src={portraitUrl} 
                            alt={`${lore?.name || 'Legend'} Portrait`}
                            className="absolute inset-0 w-full h-full object-cover z-10"
                        />
                    ) : (
                        <div className="z-10 text-center flex flex-col items-center justify-center p-8 w-full h-full">
                            <div 
                                className={`text-6xl md:text-9xl mb-4 font-display uppercase tracking-widest res-${tier?.rarity || 'Common'}`}
                                style={{ color: tierColor, textShadow: '2px 2px 0 #000' }}
                            >
                                {tier?.name || 'Unknown Tier'}
                            </div>
                            <div className="text-3xl md:text-5xl font-display uppercase tracking-widest text-black border-t-4 border-b-4 border-black py-4 w-full bg-white/30 backdrop-blur-sm">
                                {build.faction?.name || 'Unknown Faction'}
                            </div>
                        </div>
                    )}
                </div>

                {/* Name & Bounty */}
                <div className="text-center px-4">
                    <h2 className="text-5xl md:text-8xl font-display mb-2 uppercase tracking-tight text-black break-words leading-none px-4">
                        {lore?.name || 'UNKNOWN LEGEND'}
                    </h2>
                    <div className="text-2xl md:text-4xl text-zinc-800 font-bold mb-8 font-body uppercase break-words leading-snug">
                        "{lore?.epithet || 'The Nameless'}"
                    </div>
                    
                    <div className="wanted-text text-5xl md:text-7xl tracking-widest text-black flex items-center justify-center gap-4 mb-4 px-4 break-all">
                        <span>฿</span> {Number(bounty) === -1 ? '???' : bounty?.toLocaleString() || '0'}-
                    </div>
                </div>

                {/* Marine Dossier (Stats & Lore) */}
                <div className="mt-12 mx-4 md:mx-8 border-4 border-black bg-white/70 backdrop-blur-sm">
                    <div className="bg-black text-white p-3 md:p-4 border-b-4 border-black">
                        <h3 className="text-2xl md:text-4xl font-display uppercase tracking-widest text-center">MARINE DOSSIER</h3>
                    </div>
                    <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                        {/* Overall Power Bar */}
                        <div className="md:col-span-2 bg-white/50 p-4 border-2 border-black shadow-brutal-sm">
                            <div className="text-xl md:text-2xl font-display uppercase tracking-widest text-black mb-2 flex justify-between">
                                <span>THREAT LEVEL</span>
                                <span>{overall || 0}</span>
                            </div>
                            <div className="h-8 md:h-10 bg-white/50 overflow-hidden border-2 border-black">
                                <div 
                                    className="h-full bg-black transition-all duration-1000"
                                    style={{ width: `${Math.min(100, Math.max(0, (overall / 150) * 100))}%` }}
                                />
                            </div>
                        </div>
                    <CharacterStats stats={stats} />
                    
                        <div className="bg-white/50 border-2 border-black p-4 md:p-6 shadow-brutal-sm">
                            <h4 className="text-3xl font-display uppercase mb-4 text-black border-b-4 border-black pb-2">Build Profile</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                                {Object.entries(build).map(([key, item]) => {
                                    if (['str', 'spd', 'dur', 'iq'].includes(key)) return null;
                                    if (!item || item.name === 'None') return null;
                                    
                                    const label = categoryLabel(key).toUpperCase();
                                    return (
                                        <div key={key} className="flex flex-col border-2 border-black p-2 bg-gray-50/80">
                                            <span className="text-xs text-gray-800 font-display uppercase tracking-widest font-bold">{label}</span>
                                            <span className={`text-lg font-bold uppercase font-display res-${item.rarity || 'C'}`} style={{ color: RARITY[item.rarity]?.color, textShadow: '1px 1px 0px rgba(0,0,0,0.2)' }}>
                                                {item.name}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {resolved.abilities.length > 0 && (
                            <div className="md:col-span-2 bg-white/50 border-2 border-black p-4 md:p-6 shadow-brutal-sm">
                                <h4 className="text-3xl font-display uppercase mb-4 border-b-4 border-black pb-2">Unlocked Abilities</h4>
                                {resolved.abilities.map(ability => (
                                    <div key={ability.name} className="mb-4">
                                        <h5 className="text-xl font-display">{ability.name}</h5>
                                        <p className="text-sm font-body font-bold">{ability.desc}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="md:col-span-2 bg-white/50 border-2 border-black p-4 md:p-6 shadow-brutal-sm">
                            <h4 className="text-3xl font-display uppercase mb-4 text-black border-b-4 border-black pb-2">Active Synergies</h4>
                            {synergies && synergies.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {synergies.map((syn, idx) => (
                                        <div key={idx} className="bg-white/70 p-4 border-2 border-black shadow-brutal-sm">
                                            <div className="text-xl font-display uppercase text-black mb-1">{syn.name}</div>
                                            <div className="text-sm text-gray-800 mb-2 font-body font-bold">{syn.desc || syn.synergy_desc}</div>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {syn.bonuses && Object.entries(syn.bonuses).map(([stat, val]) => (
                                                    val !== 0 ? (
                                                        <span key={stat} className={`text-xs font-display tracking-widest px-2 py-1 border-2 border-black shadow-[2px_2px_0px_0px_#000] ${val > 0 ? 'bg-black text-white' : 'bg-red-600 text-white'}`}>
                                                            {stat.toUpperCase()} {val > 0 ? '+' : ''}{val}
                                                        </span>
                                                    ) : null
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-gray-800 font-bold italic">No active synergies found for this build.</div>
                            )}
                        </div>

                        <div className="md:col-span-2 bg-white/50 border-2 border-black p-4 md:p-6 shadow-brutal-sm">
                            <h4 className="text-3xl font-display uppercase mb-4 text-black border-b-4 border-black pb-2">Signature Abilities</h4>
                            {!lore ? (
                                <div className="text-gray-800 font-bold italic font-body">
                                    Signature abilities locked. Click "Generate Lore & Abilities" to unlock.
                                </div>
                            ) : lore.signature_abilities && lore.signature_abilities.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {lore.signature_abilities.map((ability, idx) => (
                                        <div key={idx} className="bg-white/70 p-4 border-2 border-black shadow-brutal-sm">
                                            <div className="text-xl font-display uppercase text-black mb-1">{ability.name}</div>
                                            <div className="text-sm text-gray-800 font-body font-bold">{ability.desc}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-gray-800 font-bold italic">No signature abilities recorded.</div>
                            )}
                        </div>

                        <div className="md:col-span-2 bg-white/50 border-2 border-black p-4 md:p-6 shadow-brutal-sm">
                            <h4 className="text-3xl font-display uppercase mb-4 text-black border-b-4 border-black pb-2">Lore & Legend</h4>
                            {!lore ? (
                                <div className="text-gray-800 font-bold italic font-body">
                                    Legend unwritten. Click "Generate Lore & Abilities" to forge destiny.
                                </div>
                            ) : !lore.bio ? (
                                <div className="text-red-600 font-display uppercase tracking-widest font-bold">Failed to generate lore.</div>
                            ) : (
                                <p className="text-black font-body text-lg leading-relaxed border-l-8 border-black bg-white/80 p-6 shadow-brutal-sm">
                                    {lore.bio}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
