const fs = require('fs');
let code = fs.readFileSync('src/components/CharacterCard.jsx', 'utf8');

code = code.replace(/bg-halftone manga-panel/g, 'bg-zinc-50 border border-gray-200 rounded-3xl shadow-xl overflow-hidden');
code = code.replace(/border-t-4 border-black/g, 'border-t border-gray-100');
code = code.replace(/border-l-8 border-black/g, 'border-l-4 border-rose-500 bg-white');
code = code.replace(/shadow-\[12px_12px_0px_0px_rgba\(0,0,0,1\)]/g, 'shadow-2xl');

fs.writeFileSync('src/components/CharacterCard.jsx', code);
