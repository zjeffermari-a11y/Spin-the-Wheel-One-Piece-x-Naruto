const fs = require('fs');
let code = fs.readFileSync('src/utils/OllamaService.js', 'utf8');

// Replace the constructor key logic to prioritize env
code = code.replace(/let key = '';\s*try \{\s*if \(typeof localStorage !== 'undefined'\) key = localStorage\.getItem\('spin_wheel_groq_api_key'\);\s*if \(!key && typeof import\.meta !== 'undefined' && import\.meta\.env\) key = import\.meta\.env\.VITE_GROQ_API_KEY;\s*\} catch\(e\) \{\}/g, 
`let key = '';
        try {
            if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GROQ_API_KEY) {
                key = import.meta.env.VITE_GROQ_API_KEY;
            } else if (typeof localStorage !== 'undefined') {
                key = localStorage.getItem('spin_wheel_groq_api_key');
            }
        } catch(e) {}`);

fs.writeFileSync('src/utils/OllamaService.js', code);
