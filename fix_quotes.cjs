const fs = require('fs');
let code = fs.readFileSync('src/data/categories.js', 'utf8');

code = code.replace(/name: 'Indra's Arrow'/g, 'name: "Indra\'s Arrow"');
code = code.replace(/name: 'Conqueror's Haki'/g, 'name: "Conqueror\'s Haki"');
code = code.replace(/name: 'Yasopp's Flintlock Rifle'/g, 'name: "Yasopp\'s Flintlock Rifle"');
code = code.replace(/name: 'Van Augur's Rifle'/g, 'name: "Van Augur\'s Rifle"');

fs.writeFileSync('src/data/categories.js', code);
