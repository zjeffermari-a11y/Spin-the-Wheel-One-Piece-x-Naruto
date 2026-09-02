import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../utils/supabaseClient';
import { X, LogIn, UserPlus, Loader2 } from 'lucide-react';

export default function AuthModal({ isOpen, onClose }) {
    const [mode, setMode] = useState('login'); // 'login' or 'signup'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            if (mode === 'signup') {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                setSuccess('Account created! Check your email to confirm, then log in.');
                setMode('login');
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                onClose();
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setEmail('');
        setPassword('');
        setError('');
        setSuccess('');
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
                        className="relative w-full max-w-md bg-[#111] border border-[#333] rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-[#333] bg-[#1a1a1a] flex justify-between items-center">
                            <h2 className="text-xl font-black uppercase tracking-wider text-white flex items-center gap-2">
                                {mode === 'login' ? <LogIn size={20} /> : <UserPlus size={20} />}
                                {mode === 'login' ? 'Log In' : 'Sign Up'}
                            </h2>
                            <button onClick={onClose} className="p-1 rounded-full hover:bg-[#333] transition-colors text-[#9ca3af] hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {error && (
                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-[#f87171] text-sm">
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-[#4ade80] text-sm">
                                    {success}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm text-[#9ca3af] mb-1 font-medium">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-xl text-white placeholder-[#555] focus:outline-none focus:border-[#6366f1] transition-colors"
                                    placeholder="your@email.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-[#9ca3af] mb-1 font-medium">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-xl text-white placeholder-[#555] focus:outline-none focus:border-[#6366f1] transition-colors"
                                    placeholder="••••••••"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : mode === 'login' ? (
                                    <LogIn size={18} />
                                ) : (
                                    <UserPlus size={18} />
                                )}
                                {loading ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Create Account'}
                            </button>

                            <div className="text-center pt-2">
                                <button
                                    type="button"
                                    onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); resetForm(); }}
                                    className="text-sm text-[#818cf8] hover:text-white transition-colors"
                                >
                                    {mode === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Log In'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
