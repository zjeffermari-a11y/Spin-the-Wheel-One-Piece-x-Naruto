const fs = require('fs');

function patchAuthModal() {
    let code = fs.readFileSync('src/components/AuthModal.jsx', 'utf8');
    
    // Primary submit button
    code = code.replace(/className="w-full py-3 bg-black text-white font-bold rounded-none hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"/g,
                        'className="w-full py-3 bg-red-600 text-white font-display uppercase tracking-widest border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[6px] hover:translate-y-[6px] transition-all duration-150 disabled:shadow-none disabled:transform-none disabled:opacity-50 flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-black focus:ring-offset-2"');
    
    // Toggle login/signup mode button
    code = code.replace(/<button\n\s*type="button"\n\s*onClick=\{([^}]+)\}\n\s*className="text-\[#6366f1\] hover:text-black font-bold"/g,
                        '<button\n                                    type="button"\n                                    onClick={$1}\n                                    className="text-red-600 hover:text-black font-bold font-display uppercase tracking-widest focus:outline-none focus:underline"');

    // Close button
    code = code.replace(/className="p-1 rounded-none hover:bg-\[#333\] transition-colors text-black hover:text-black"/g,
                        'className="p-2 border-4 border-transparent hover:border-black transition-colors text-black focus:outline-none focus:ring-4 focus:ring-black"');
                        
    fs.writeFileSync('src/components/AuthModal.jsx', code);
}

function patchSettingsModal() {
    let code = fs.readFileSync('src/components/SettingsModal.jsx', 'utf8');
    
    // Save button
    code = code.replace(/className="px-6 py-2 bg-black text-white hover:bg-gray-800 text-black rounded-none font-bold transition-colors shadow-none"/g,
                        'className="px-6 py-2 bg-black text-white border-4 border-black font-display uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-black focus:ring-offset-2"');

    // Close button
    code = code.replace(/className="absolute top-4 right-4 text-gray-400 hover:text-black"/g,
                        'className="absolute top-4 right-4 text-black p-2 border-4 border-transparent hover:border-black transition-colors focus:outline-none focus:ring-4 focus:ring-black"');

    fs.writeFileSync('src/components/SettingsModal.jsx', code);
}

function patchRosterModal() {
    let code = fs.readFileSync('src/components/RosterModal.jsx', 'utf8');
    
    // Delete button
    code = code.replace(/className="absolute top-2 right-2 p-2 bg-white rounded-none shadow text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600 z-10 border border-black"/g,
                        'className="absolute top-2 right-2 p-2 bg-white text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:bg-red-600 hover:text-white transition-all duration-150 z-10 focus:outline-none focus:ring-4 focus:ring-black"');
    
    // Card interaction (not a button but clickable)
    code = code.replace(/className="bg-white border border-black border-4 rounded-none p-4 cursor-pointer hover:border-indigo-500\/50 hover:bg-gray-100 transition-all group relative"/g,
                        'className="bg-white border-4 border-black p-4 cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 transition-all duration-150 group relative focus:outline-none focus:ring-4 focus:ring-black focus:ring-offset-2"');

    // Close button
    code = code.replace(/className="w-10 h-10 rounded-none bg-gray-100 hover:bg-red-500\/20 text-gray-400 hover:text-red-600 flex items-center justify-center transition-colors"/g,
                        'className="w-10 h-10 bg-white border-4 border-black text-black hover:bg-red-600 hover:text-white flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-black focus:ring-offset-2"');

    fs.writeFileSync('src/components/RosterModal.jsx', code);
}

patchAuthModal();
patchSettingsModal();
patchRosterModal();
