const fs = require('fs');
let code = fs.readFileSync('src/utils/OllamaService.js', 'utf8');

// Find the line with the syntax error and fix it
code = code.replace(
  "- DO NOT INCLUDE markdown code blocks (like ```json).", 
  "- DO NOT INCLUDE markdown code blocks (like \\`\\`\\`json)."
);

fs.writeFileSync('src/utils/OllamaService.js', code);
