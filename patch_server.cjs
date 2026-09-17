const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'model: "llama-3.3-70b-versatile",',
  'model: "openai/gpt-oss-120b", // User preferred model'
);

fs.writeFileSync('server.ts', code);
