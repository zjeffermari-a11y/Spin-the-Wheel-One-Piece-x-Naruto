const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// Replace ['Epic', 'Legend', 'Mythic'] with ['Legend', 'Mythic']
code = code.replace(/\['Epic', 'Legend', 'Mythic'\]/g, "['Legend', 'Mythic']");
code = code.replace(/\['E', 'L', 'M'\]/g, "['L', 'M']"); // For the scale/x shake effect

fs.writeFileSync('src/App.jsx', code);
