import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../utils/supabaseClient';

export default function RosterModal({ isOpen, onClose, onLoad }) {
    const [savedCharacters, setSavedCharacters] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Get initial session
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
        if (user) {
            try {
                const { data, error } = await supabase
                    .from('saved_characters')
                    .select('*')
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                
                // Map the Supabase data to match the expected format
                const mappedData = data.map(char => ({
                    id: char.id, // Keep Supabase ID for deletion
                    build: char.build,
                    stats: char.stats,
                    overall: char.overall,
                    bounty: char.bounty,
                    tier: { name: char.tier },
                    lore: char.lore,
                    synergies: char.synergies
                }));
                
                setSavedCharacters(mappedData);
            } catch (error) {
                console.error('Error fetching characters:', error);
                setSavedCharacters([]);
            }
        } else {
            // Fallback for guests
            const saved = JSON.parse(localStorage.getItem('spinYourDestiny_saves') || '[]');
            setSavedCharacters(saved);
        }
    };

    const handleDelete = async (char, index, e) => {
        e.stopPropagation();
        
        if (user && char.id) {
            try {
                const { error } = await supabase
                    .from('saved_characters')
                    .delete()
                    .eq('id', char.id);
                    
                if (error) throw error;
                
                const updated = savedCharacters.filter(c => c.id !== char.id);
                setSavedCharacters(updated);
            } catch (error) {
                console.error('Error deleting character:', error);
                alert('Failed to delete character.');
            }
        } else {
            // Fallback for guests
            const updated = savedCharacters.filter((_, i) => i !== index);
            localStorage.setItem('spinYourDestiny_saves', JSON.stringify(updated));
            setSavedCharacters(updated);
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
                        className="relative w-full max-w-4xl max-h-[85vh] bg-[#111] border border-[#333] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                    >
                        <div className="p-6 border-b border-[#333] flex justify-between items-center bg-[#1a1a1a]">
                            <h2 className="text-2xl font-black uppercase tracking-wider text-white">Your Legends Roster</h2>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-full bg-[#222] hover:bg-red-500/20 text-gray-400 hover:text-red-500 flex items-center justify-center transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
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
                                            className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4 cursor-pointer hover:border-indigo-500/50 hover:bg-[#222] transition-all group relative"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-lg font-bold text-white uppercase tracking-wider">{char.build?.vessel?.name || 'Unknown'}</h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold px-2 py-1 rounded bg-black/50 text-indigo-400 border border-indigo-900">
                                                        {char.tier?.name || 'Unknown'} Tier
                                                    </span>
                                                    <button 
                                                        onClick={(e) => handleDelete(char, index, e)}
                                                        className="text-gray-500 hover:text-red-500 transition-colors"
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
