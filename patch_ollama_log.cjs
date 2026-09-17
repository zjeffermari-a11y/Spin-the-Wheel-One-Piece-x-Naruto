const fs = require('fs');
let code = fs.readFileSync('src/utils/OllamaService.js', 'utf8');

const target = `                return JSON.parse(textContent);
            } catch (error) {
                console.warn(\`Groq request error on model \${candidateModel}:\`, error);
            }`;

const replacement = `                try {
                    return JSON.parse(textContent);
                } catch (parseError) {
                    console.error(\`Failed to parse JSON for \${candidateModel}. Raw output:\`, textContent);
                    throw parseError;
                }
            } catch (error) {
                console.warn(\`Groq request error on model \${candidateModel}:\`, error);
            }`;

code = code.replace(target, replacement);
fs.writeFileSync('src/utils/OllamaService.js', code);
