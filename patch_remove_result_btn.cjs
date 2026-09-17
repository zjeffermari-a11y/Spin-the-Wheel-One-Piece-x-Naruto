const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const target = `                            <div className="mt-8 flex flex-wrap justify-center gap-4">
                                {!lore && (
                                    <button
                                        onClick={handleGenerateLore}
                                        className="px-8 py-4 bg-indigo-600 text-white border border-indigo-700 hover:bg-indigo-700 font-display uppercase tracking-widest text-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 active:scale-95 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-offset-2"
                                    >
                                        GENERATE LORE & ABILITIES
                                    </button>
                                )}
                                <button
                                    onClick={handleSaveCharacter}`;

const replacement = `                            <div className="mt-8 flex justify-center gap-4">
                                <button
                                    onClick={handleSaveCharacter}`;

code = code.replace(target, replacement);
fs.writeFileSync('src/App.jsx', code);
