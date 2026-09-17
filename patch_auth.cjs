const fs = require('fs');
let code = fs.readFileSync('src/components/AuthModal.jsx', 'utf8');

code = code.replace(/className="w-full py-3 bg-black text-black/g, 'className="w-full py-3 bg-black text-white');

fs.writeFileSync('src/components/AuthModal.jsx', code);
