const fs = require('fs');
let code = fs.readFileSync('src/utils/OllamaService.js', 'utf8');

const target1 = `        if (!this.apiKey) {
            console.error("No Groq API Key found.");
            return null;
        }`;

const replacement1 = `        if (!this.apiKey) {
            throw new Error("No Groq API Key found. Please add one in Settings.");
        }`;

code = code.replace(target1, replacement1);

const target2 = `                    if (response.status === 401) {
                        console.error("Groq API Key is invalid (401).");
                        try {
                           if (typeof localStorage !== 'undefined') localStorage.removeItem('spin_wheel_groq_api_key');
                        } catch(e) {}
                        return null; // Stop trying if unauthorized
                    }`;

const replacement2 = `                    if (response.status === 401) {
                        try {
                           if (typeof localStorage !== 'undefined') localStorage.removeItem('spin_wheel_groq_api_key');
                        } catch(e) {}
                        throw new Error("Groq API Key is invalid (401). Please check your Settings.");
                    }`;

code = code.replace(target2, replacement2);

const target3 = `        console.error("All Groq models failed to generate content.");
        return null;`;

const replacement3 = `        throw new Error("All Groq models failed to generate content.");`;

code = code.replace(target3, replacement3);

fs.writeFileSync('src/utils/OllamaService.js', code);
