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
            if (!supabase) throw new Error('Cloud accounts are not configured. You can create and save characters locally.');
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
                        className="relative w-full max-w-md bg-white border border-black border rounded-2xl shadow-sm hover:shadow-md overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-black border bg-white flex justify-between items-center">
                            <h2 className="text-xl font-black uppercase tracking-wider text-black flex items-center gap-2">
                                {mode === 'login' ? <LogIn size={20} /> : <UserPlus size={20} />}
                                {mode === 'login' ? 'Log In' : 'Sign Up'}
                            </h2>
                            <button onClick={onClose} className="p-2 border border-transparent hover:border-black transition-colors text-black focus:outline-none focus:ring-4 focus:ring-black">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {error && (
                                <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-[#f87171] text-sm">
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="p-3 rounded-2xl bg-green-500/10 border border-green-500/30 text-[#4ade80] text-sm">
                                    {success}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm text-black mb-1 font-medium">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-white border border-gray-200 text-black placeholder-gray-500 font-body focus:outline-none focus:ring-4 focus:ring-black focus:border-black transition-all shadow-inner"
                                    placeholder="your@email.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-black mb-1 font-medium">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 text-black placeholder-gray-500 font-body focus:outline-none focus:ring-4 focus:ring-black focus:border-black transition-all shadow-inner"
                                    placeholder="••••••••"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-black text-white font-bold rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
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
                                    className="text-sm text-[#818cf8] hover:text-black transition-colors"
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
