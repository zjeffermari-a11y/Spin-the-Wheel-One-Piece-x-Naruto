const fs = require('fs');
let code = fs.readFileSync('src/utils/OllamaService.js', 'utf8');

const target = `this.apiKey = (localStorage.getItem('spin_wheel_groq_api_key') || import.meta.env.VITE_GROQ_API_KEY || '').trim();`;

const replacement = `
        let key = '';
        try {
            if (typeof localStorage !== 'undefined') key = localStorage.getItem('spin_wheel_groq_api_key');
            if (!key && typeof import.meta !== 'undefined' && import.meta.env) key = import.meta.env.VITE_GROQ_API_KEY;
        } catch(e) {}
        this.apiKey = (key || '').trim();
`;

code = code.replace(target, replacement);
fs.writeFileSync('src/utils/OllamaService.js', code);
