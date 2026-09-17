const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const target = `                                <div className="flex gap-4 mt-8 z-10 w-full max-w-sm">
                                    <button
                                        onClick={handleSpinClick}
                                        disabled={isSpinning}
                                        className="flex-1 py-4 bg-zinc-900 text-white border border-gray-200 hover:bg-black disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none disabled:transform-none font-display text-2xl uppercase tracking-widest shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 active:scale-95 focus:outline-none focus:ring-4 focus:ring-black focus:ring-offset-2"
                                    >
                                        SPIN
                                    </button>
                                    <button
                                        onClick={handleAutoSpin}
                                        disabled={isSpinning}
                                        className="px-6 py-4 bg-white text-black hover:bg-black hover:text-white disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none disabled:transform-none border border-gray-200 font-display text-xl uppercase tracking-widest shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 active:scale-95 focus:outline-none focus:ring-4 focus:ring-black focus:ring-offset-2"
                                    >
                                        AUTO
                                    </button>
                                </div>`;

const replacement = `                                <div className="flex gap-4 mt-8 z-10 w-full max-w-sm">
                                    <button
                                        onClick={handleSpinClick}
                                        disabled={isSpinning || isBuildComplete}
                                        className="flex-1 py-4 bg-zinc-900 text-white border border-gray-200 hover:bg-black disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none disabled:transform-none font-display text-2xl uppercase tracking-widest shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 active:scale-95 focus:outline-none focus:ring-4 focus:ring-black focus:ring-offset-2"
                                    >
                                        {isBuildComplete ? 'COMPLETE' : 'SPIN'}
                                    </button>
                                    <button
                                        onClick={handleAutoSpin}
                                        disabled={isSpinning || isBuildComplete}
                                        className="px-6 py-4 bg-white text-black hover:bg-black hover:text-white disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none disabled:transform-none border border-gray-200 font-display text-xl uppercase tracking-widest shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 active:scale-95 focus:outline-none focus:ring-4 focus:ring-black focus:ring-offset-2"
                                    >
                                        AUTO
                                    </button>
                                </div>

                                {isBuildComplete && (
                                    <div className="flex flex-col gap-4 mt-4 z-10 w-full max-w-sm">
                                        <button
                                            onClick={handleGenerateLore}
                                            className="w-full py-4 bg-indigo-600 text-white border border-indigo-700 hover:bg-indigo-700 font-display text-xl uppercase tracking-widest shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 active:scale-95 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-offset-2"
                                        >
                                            GENERATE LORE & VIEW
                                        </button>
                                        <button
                                            onClick={() => {
                                                setScreen('result');
                                                if (['L', 'M'].includes(tier?.rarity)) {
                                                    playEpic();
                                                } else {
                                                    playThud();
                                                }
                                            }}
                                            className="w-full py-4 bg-white text-black border border-gray-200 hover:bg-gray-50 font-display text-xl uppercase tracking-widest shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 active:scale-95 focus:outline-none focus:ring-4 focus:ring-gray-300 focus:ring-offset-2"
                                        >
                                            VIEW RESULT (NO LORE)
                                        </button>
                                    </div>
                                )}`;

code = code.replace(target, replacement);
fs.writeFileSync('src/App.jsx', code);
