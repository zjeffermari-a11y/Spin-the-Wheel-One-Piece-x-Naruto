const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const target = `className="text-center p-8 border-8 bg-white"`;
const replacement = `className="text-center p-12 bg-white rounded-3xl shadow-2xl border-2 max-w-lg w-full mx-4 relative overflow-hidden"`;

code = code.replace(target, replacement);

// And fix border-black if any are left
code = code.replace(/border-black/g, 'border-zinc-900');

fs.writeFileSync('src/App.jsx', code);
