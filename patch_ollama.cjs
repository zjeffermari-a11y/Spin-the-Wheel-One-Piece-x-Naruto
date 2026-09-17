const fs = require('fs');
let code = fs.readFileSync('src/utils/OllamaService.js', 'utf8');

const target = `const textContent = data.choices[0].message.content;
                this.model = candidateModel;
                return JSON.parse(textContent);`;

const replacement = `let textContent = data.choices[0].message.content || "";
                textContent = textContent.replace(/\\s*\`\`\`json\\s*/gi, '').replace(/\\s*\`\`\`\\s*/gi, '').trim();
                this.model = candidateModel;
                return JSON.parse(textContent);`;

code = code.replace(target, replacement);
fs.writeFileSync('src/utils/OllamaService.js', code);
