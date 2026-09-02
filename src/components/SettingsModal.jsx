import React, { useState, useEffect } from 'react';
import { Settings, X } from 'lucide-react';
import { OllamaService } from '../utils/OllamaService';

export default function SettingsModal({ isOpen, onClose }) {
    const [model, setModel] = useState('llama3');
    const [url, setUrl] = useState('http://127.0.0.1:11434');

    useEffect(() => {
        if (isOpen) {
            const ollamaService = new OllamaService();
            setModel(ollamaService.model);
            setUrl(ollamaService.url);
        }
    }, [isOpen]);

    const handleSave = () => {
        const ollamaService = new OllamaService();
        ollamaService.setModel(model.trim(), url.trim());
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#111] w-full max-w-md rounded-2xl border border-[#333] shadow-2xl p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <X size={24} />
                </button>
                
                <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                    <Settings className="text-indigo-500" /> Settings
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-400 mb-1">Ollama Model</label>
                        <input 
                            type="text" 
                            value={model} 
                            onChange={(e) => setModel(e.target.value)} 
                            className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                            placeholder="e.g. llama3"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-400 mb-1">Ollama API URL</label>
                        <input 
                            type="text" 
                            value={url} 
                            onChange={(e) => setUrl(e.target.value)} 
                            className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                            placeholder="http://127.0.0.1:11434"
                        />
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button 
                        onClick={handleSave}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-colors shadow-lg"
                    >
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
}
