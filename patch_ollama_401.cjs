const fs = require('fs');
let code = fs.readFileSync('src/utils/OllamaService.js', 'utf8');

const target = `                if (!response.ok) {
                    const errText = await response.text();
                    console.warn(\`Groq model \${candidateModel} failed (\${response.status}): \${errText}. Retrying next model...\`);
                    continue;
                }`;

const replacement = `                if (!response.ok) {
                    const errText = await response.text();
                    console.warn(\`Groq model \${candidateModel} failed (\${response.status}): \${errText}. Retrying next model...\`);
                    if (response.status === 401) {
                        console.error("Groq API Key is invalid (401).");
                        try {
                           if (typeof localStorage !== 'undefined') localStorage.removeItem('spin_wheel_groq_api_key');
                        } catch(e) {}
                        return null; // Stop trying if unauthorized
                    }
                    continue;
                }`;

code = code.replace(target, replacement);
fs.writeFileSync('src/utils/OllamaService.js', code);
