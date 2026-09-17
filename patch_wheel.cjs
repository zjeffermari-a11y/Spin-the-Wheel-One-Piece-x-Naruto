const fs = require('fs');
let code = fs.readFileSync('src/components/Wheel.jsx', 'utf8');

code = code.replace(/if \(options\.length > 25\) \{[\s\S]*?continue;\s*\}/g, '');

fs.writeFileSync('src/components/Wheel.jsx', code);
