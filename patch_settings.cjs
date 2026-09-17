const fs = require('fs');
let code = fs.readFileSync('src/components/SettingsModal.jsx', 'utf8');

code = code.replace(/Lore generation is currently powered by the server-side Gemini API. You don't need to provide a Groq key right now, though you can save one if you plan to switch back later./g, "Lore generation is currently powered by Groq on a secured backend server. You don't need to manage your key directly here.");

fs.writeFileSync('src/components/SettingsModal.jsx', code);
