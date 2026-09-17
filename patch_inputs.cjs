const fs = require('fs');

function patchAuthModal() {
    let code = fs.readFileSync('src/components/AuthModal.jsx', 'utf8');
    
    // Inputs
    code = code.replace(/className="w-full px-4 py-3 bg-white border border-black border-4 rounded-none text-black placeholder-\[#555\] focus:outline-none focus:border-\[#6366f1\] transition-colors"/g,
                        'className="w-full px-4 py-3 bg-white border-4 border-black text-black placeholder-gray-500 font-body focus:outline-none focus:ring-4 focus:ring-black focus:border-black transition-all shadow-[inset_4px_4px_0px_0px_rgba(0,0,0,0.05)]"');

    fs.writeFileSync('src/components/AuthModal.jsx', code);
}

function patchSettingsModal() {
    let code = fs.readFileSync('src/components/SettingsModal.jsx', 'utf8');
    
    // Inputs
    code = code.replace(/className="w-full bg-white border border-black border-4 rounded-none px-4 py-2 text-black focus:outline-none focus:border-indigo-500"/g,
                        'className="w-full px-4 py-3 bg-white border-4 border-black text-black font-body focus:outline-none focus:ring-4 focus:ring-black focus:border-black transition-all shadow-[inset_4px_4px_0px_0px_rgba(0,0,0,0.05)]"');

    fs.writeFileSync('src/components/SettingsModal.jsx', code);
}

patchAuthModal();
patchSettingsModal();
