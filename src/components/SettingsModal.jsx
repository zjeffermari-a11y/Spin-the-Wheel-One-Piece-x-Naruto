import React, { useState, useEffect } from 'react';
import { Settings, X } from 'lucide-react';
import { OllamaService } from '../utils/OllamaService';
import { supabase } from '../utils/supabaseClient';

export default function SettingsModal({ isOpen, onClose }) {
    const [apiKey, setApiKey] = useState('');

    useEffect(() => {
        if (isOpen) {
            const ollamaService = new OllamaService();
            setApiKey(ollamaService.apiKey || '');
        }
    }, [isOpen]);

    const handleSave = async () => {
        const clean = apiKey.trim();
        const ollamaService = new OllamaService();
        ollamaService.setApiKey(clean);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase.auth.updateUser({
                    data: { groq_api_key: clean }
                });
            }
        } catch (e) {
            console.warn('Could not sync key to Supabase user metadata:', e);
        }

        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-md rounded-2xl border border-black border shadow-sm hover:shadow-md p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-black p-2 border border-transparent hover:border-black transition-colors focus:outline-none focus:ring-4 focus:ring-black">
                    <X size={24} />
                </button>
                
                <h3 className="text-2xl font-bold mb-6 text-black flex items-center gap-2">
                    <Settings className="text-indigo-500" /> API Settings
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-400 mb-1">AI Lore Settings</label>
                        <input 
                            type="password" 
                            value={apiKey} 
                            onChange={(e) => setApiKey(e.target.value)} 
                            className="w-full px-4 py-3 bg-white border border-gray-200 text-black font-body focus:outline-none focus:ring-4 focus:ring-black focus:border-black transition-all shadow-inner"
                            placeholder="gsk_..."
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            Lore generation is currently powered by Groq on a secured backend server. You don't need to manage your key directly here.
                        </p>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button 
                        onClick={handleSave}
                        className="px-6 py-2 bg-black text-white border border-gray-200 font-display uppercase tracking-widest shadow-sm hover:shadow-md hover:shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-black focus:ring-offset-2"
                    >
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
}
