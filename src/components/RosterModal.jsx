import { exportRoster, importRoster } from '../utils/localRoster';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../utils/supabaseClient';

export default function RosterModal({ isOpen, onClose, onLoad }) {
    const [savedCharacters, setSavedCharacters] = useState([]);
    const [user, setUser] = useState(null);
    const [backupStatus, setBackupStatus] = useState('');

    useEffect(() => {
        // Get initial session
        if (!supabase) return;
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user || null);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (isOpen) {
            loadCharacters();
        }
    }, [isOpen, user]);

    const loadCharacters = async () => {
        let guestSaves = [];
        try {
            guestSaves = JSON.parse(localStorage.getItem('spinYourDestiny_saves') || '[]');
            // Ensure guestSaves is an array and tag them so we know they are local
            if (Array.isArray(guestSaves)) {
                guestSaves = guestSaves.map(s => ({ ...s, isLocal: true }));
            } else {
                guestSaves = [];
            }
        } catch (e) {
            console.error('Error parsing local storage:', e);
            guestSaves = [];
        }

        if (user) {
            try {
                // Fetch from cloud database
                const { data, error } = await supabase
                    .from('saved_characters')
                    .select('*')
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                
                const mappedData = data ? data.map(char => ({
                    id: char.id,
                    build: char.build,
                    stats: char.stats,
                    overall: char.overall,
                    bounty: char.bounty,
                    tier: typeof char.tier === 'object' ? char.tier : { name: char.tier, rarity: { Weak: 'C', Average: 'U', Strong: 'R', Overpowered: 'E', Broken: 'L' }[char.tier] || 'C' },
                    lore: char.lore,
                    portraitUrl: char.portraitUrl,
                    synergies: char.synergies,
                    isLocal: false
                })) : [];
                
                // Merge cloud saves with local offline saves
                setSavedCharacters([...mappedData, ...guestSaves]);
            } catch (error) {
                console.error('Error fetching characters:', error);
                setSavedCharacters(guestSaves);
            }
        } else {
            setSavedCharacters(guestSaves);
        }
    };

    const handleDelete = async (char, index, e) => {
        e.stopPropagation();
        
        if (char.id && !char.isLocal) {
            try {
                const { error } = await supabase
                    .from('saved_characters')
                    .delete()
                    .eq('id', char.id);
                
                if (error) throw error;
                
                setSavedCharacters(prev => prev.filter(c => c.id !== char.id));
            } catch (error) {
                console.error('Error deleting character:', error);
                alert('Failed to delete character.');
            }
        } else if (char.isLocal) {
            try {
                let guestSaves = JSON.parse(localStorage.getItem('spinYourDestiny_saves') || '[]');
                // Find and remove it from the actual local storage array
                // We don't have a unique ID for local saves reliably, so we match by stringified content or exact object structure if we added a temporary id.
                // Let's just re-calculate guestSaves from the current state!
                const newSavedCharacters = savedCharacters.filter((_, i) => i !== index);
                const newGuestSaves = newSavedCharacters.filter(c => c.isLocal).map(c => {
                    const copy = { ...c };
                    delete copy.isLocal;
                    return copy;
                });
                localStorage.setItem('spinYourDestiny_saves', JSON.stringify(newGuestSaves));
                setSavedCharacters(newSavedCharacters);
            } catch(e) {
                console.error('Error deleting local save:', e);
            }
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-4xl max-h-[85vh] bg-white border border-black border rounded-2xl shadow-sm hover:shadow-md overflow-hidden flex flex-col"
                    >
                        <div className="p-6 border-b border-black border flex justify-between items-center bg-white">
                            <h2 className="text-2xl font-black uppercase tracking-wider text-black">Your Legends Roster</h2>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 bg-white border border-gray-200 text-black hover:bg-zinc-900 hover:text-white flex items-center justify-center shadow-sm hover:shadow-md hover:shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-black focus:ring-offset-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        
                        <div className="px-6 py-3 border-b border-black flex flex-wrap gap-3 items-center">
                            <button className="px-3 py-2 border-2 border-black" onClick={() => {
                                const blob = new Blob([exportRoster(savedCharacters)], { type: 'application/json' });
                                const url = URL.createObjectURL(blob);
                                const link = document.createElement('a');
                                link.href = url;
                                link.download = 'summon-roster.json';
                                link.click();
                                setTimeout(() => URL.revokeObjectURL(url), 1000);
                                setBackupStatus('Backup exported. Remote portraits are links, not offline image copies.');
                            }}>Export Backup</button>
                            <label className="px-3 py-2 border-2 border-black cursor-pointer">
                                Import Backup
                                <input aria-label="Import roster backup" type="file" accept="application/json,.json" className="sr-only" onChange={async event => {
                                    const file = event.target.files?.[0];
                                    event.target.value = '';
                                    if (!file) return;
                                    try {
                                        if (file.size > 10_000_000) throw new Error('Backup is too large (maximum 10 MB).');
                                        const count = importRoster(localStorage, await file.text());
                                        setBackupStatus(count + ' characters imported on this device.');
                                        await loadCharacters();
                                    } catch (error) { setBackupStatus('Import failed: ' + error.message); }
                                }} />
                            </label>
                            <p role="status" className="text-sm">{backupStatus}</p>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                            {savedCharacters.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-50"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                                    <p className="text-xl">No legends saved yet.</p>
                                    <p className="text-sm mt-2">Spin your destiny and save your creations to see them here.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {savedCharacters.map((char, index) => (
                                        <div 
                                            key={index}
                                            onClick={() => onLoad(char)}
                                            className="bg-white border border-gray-200 p-4 cursor-pointer shadow-sm hover:shadow-md hover:shadow-sm hover:shadow-md hover:-translate-y-1 hover:-translate-x-1 transition-all duration-150 group relative focus:outline-none focus:ring-4 focus:ring-black focus:ring-offset-2"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-lg font-bold text-black uppercase tracking-wider">{char.lore?.name || char.build?.vessel?.name || 'Unknown'}</h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold px-2 py-1 rounded bg-black/50 text-gray-700 border border-indigo-900">
                                                        {char.tier?.name || 'Unknown'} Tier
                                                    </span>
                                                    <button 
                                                        onClick={(e) => handleDelete(char, index, e)}
                                                        className="text-gray-500 hover:text-red-600 transition-colors"
                                                        title="Delete Character"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-400 mb-3 line-clamp-2">
                                                {char.lore?.bio || 'No lore generated.'}
                                            </div>
                                            <div className="flex justify-between items-center text-xs text-gray-500">
                                                <span>Overall: {char.overall}</span>
                                                <span className="text-[#ffd700] flex items-center gap-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path><path d="M12 18V6"></path></svg>
                                                    {char.bounty}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
