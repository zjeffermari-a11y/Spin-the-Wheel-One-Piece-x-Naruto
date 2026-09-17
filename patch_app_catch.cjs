const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const target = `console.error("Failed to generate lore via Ollama", error);`;
const replacement = `console.warn("Could not generate lore:", error.message);`;

code = code.replace(target, replacement);
fs.writeFileSync('src/App.jsx', code);
