const fs = require('fs');

function patchFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let code = fs.readFileSync(filePath, 'utf8');

    // Replace typical button transitions with the neubrutalist click effect
    // Find generic hover/transitions for primary buttons and add the shadow/translate effect
    
    // For App.jsx specific buttons
    code = code.replace(/className="px-10 py-5 bg-black text-white border-4 border-black hover:bg-white hover:text-black font-display uppercase text-2xl tracking-widest transition-none"/g, 
                        'className="px-10 py-5 bg-red-600 text-white border-4 border-black hover:bg-black font-display uppercase text-2xl tracking-widest shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[8px] hover:translate-y-[8px] transition-all duration-150 active:scale-95 focus:outline-none focus:ring-4 focus:ring-black focus:ring-offset-2"');

    // Spin button
    code = code.replace(/className="flex-1 py-4 bg-black text-white border-4 border-black hover:bg-white hover:text-black disabled:bg-gray-300 disabled:text-gray-500 font-display transition-none text-2xl uppercase tracking-widest"/g, 
                        'className="flex-1 py-4 bg-red-600 text-white border-4 border-black hover:bg-black disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none disabled:transform-none font-display text-2xl uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[6px] hover:translate-y-[6px] transition-all duration-150 active:scale-95 focus:outline-none focus:ring-4 focus:ring-black focus:ring-offset-2"');

    // Skip button
    code = code.replace(/className="px-6 py-4 bg-white text-black hover:bg-black hover:text-white disabled:bg-gray-300 disabled:text-gray-500 border-4 border-black font-display transition-none text-xl uppercase tracking-widest"/g, 
                        'className="px-6 py-4 bg-white text-black hover:bg-black hover:text-white disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none disabled:transform-none border-4 border-black font-display text-xl uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[6px] hover:translate-y-[6px] transition-all duration-150 active:scale-95 focus:outline-none focus:ring-4 focus:ring-black focus:ring-offset-2"');

    // Save Legend button
    code = code.replace(/className="px-8 py-4 bg-black text-white border-4 border-black hover:bg-white hover:text-black disabled:bg-gray-300 disabled:text-gray-500 transition-none font-display uppercase tracking-widest text-xl"/g, 
                        'className="px-8 py-4 bg-red-600 text-white border-4 border-black hover:bg-black disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none disabled:transform-none font-display uppercase tracking-widest text-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[6px] hover:translate-y-[6px] transition-all duration-150 active:scale-95 focus:outline-none focus:ring-4 focus:ring-black focus:ring-offset-2"');

    // Restart Draft button
    code = code.replace(/className="px-8 py-4 bg-white text-black border-4 border-black hover:bg-black hover:text-white transition-none font-display uppercase tracking-widest text-xl"/g, 
                        'className="px-8 py-4 bg-white text-black border-4 border-black hover:bg-black hover:text-white font-display uppercase tracking-widest text-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[6px] hover:translate-y-[6px] transition-all duration-150 active:scale-95 focus:outline-none focus:ring-4 focus:ring-black focus:ring-offset-2"');

    // Log In / Sign Up button
    code = code.replace(/className="flex items-center gap-2 px-4 py-2 bg-black text-white border-4 border-black hover:bg-white hover:text-black transition-none font-display uppercase tracking-widest text-sm mr-2"/g,
                        'className="flex items-center gap-2 px-4 py-2 bg-black text-white border-4 border-black hover:bg-red-600 hover:text-white font-display uppercase tracking-widest text-sm mr-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-black focus:ring-offset-2"');

    // Header buttons (Crew, Settings)
    code = code.replace(/className="p-2 border-4 border-black bg-white hover:bg-black hover:text-white transition-none text-black"/g,
                        'className="p-2 border-4 border-black bg-white hover:bg-red-600 hover:text-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-black focus:ring-offset-2"');

    fs.writeFileSync(filePath, code);
}

patchFile('src/App.jsx');
