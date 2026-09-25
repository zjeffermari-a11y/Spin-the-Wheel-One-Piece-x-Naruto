import React, { useState, useEffect } from 'react';
import { Settings, X } from 'lucide-react';
import { OllamaService } from '../utils/OllamaService';
import { supabase } from '../utils/supabaseClient';

export default function SettingsModal({ isOpen, onClose }) {
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
                        <p className="text-xs text-gray-500 mt-2">
                            Create Offline Character uses local templates without sending a request. AI lore and portraits require internet access and a configured backend; unavailable AI lore falls back to local templates. You do not need your own API key.
                        </p>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 bg-black text-white border border-gray-200 font-display uppercase tracking-widest shadow-sm hover:shadow-md hover:shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-black focus:ring-offset-2"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
