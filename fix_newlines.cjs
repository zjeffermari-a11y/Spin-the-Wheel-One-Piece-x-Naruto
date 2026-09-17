const fs = require('fs');
let code = fs.readFileSync('src/utils/OllamaService.js', 'utf8');

code = code.replace("return items.join('\n');", "return items.join('\\n');");
fs.writeFileSync('src/utils/OllamaService.js', code);
