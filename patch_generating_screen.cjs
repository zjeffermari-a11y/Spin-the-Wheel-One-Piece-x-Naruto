const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const target = `                    {screen === 'result' && (
                        <motion.div`;

const replacement = `                    {screen === 'generating' && (
                        <motion.div
                            key="generating"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="w-full max-w-7xl mx-auto flex flex-col items-center justify-center py-32 bg-white border border-gray-200 shadow-sm"
                        >
                            <div className="relative w-48 h-48 mb-12">
                                <div className="absolute inset-0 border-8 border-gray-100 rounded-full"></div>
                                <div className="absolute inset-0 border-8 border-black rounded-full border-t-transparent animate-spin" style={{ animationDuration: '1s' }}></div>
                                <div className="absolute inset-4 border-8 border-rose-500/20 rounded-full border-b-transparent animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-16 h-16 bg-black rounded-full animate-ping"></div>
                                </div>
                            </div>
                            
                            <h2 className="text-5xl md:text-7xl font-display uppercase tracking-widest text-black mb-6 text-center animate-pulse">
                                Forging Destiny
                            </h2>
                            <p className="text-xl text-gray-500 font-body text-center max-w-lg">
                                The energies of the world are converging. Awakening your unique vessel, abilities, and legendary lore...
                            </p>
                        </motion.div>
                    )}

                    {screen === 'result' && (
                        <motion.div`;

code = code.replace(target, replacement);
fs.writeFileSync('src/App.jsx', code);
