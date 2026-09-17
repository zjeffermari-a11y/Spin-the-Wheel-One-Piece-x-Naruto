const fs = require('fs');
let code = fs.readFileSync('src/data/categories.js', 'utf8');

code = code.replace(/name: 'Senriku \(Van Augur's Rifle\)'/g, 'name: "Senriku (Van Augur\'s Rifle)"');

fs.writeFileSync('src/data/categories.js', code);
