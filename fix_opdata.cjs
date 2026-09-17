const fs = require('fs');
let code = fs.readFileSync('src/data/opData.js', 'utf8');

// Find the line with Spandam (which doesn't have a comma) and the line with Loki
// We can just replace `"haki": [] }\n  { "id": 40, "name": "Loki"` with `"haki": [] },\n  { "id": 40, "name": "Loki"` or something similar.
code = code.replace(/"haki": \[\] \}  \{ "id": 40, "name": "Loki"/g, '"haki": [] },\n  { "id": 40, "name": "Loki"');

// Or just match Spandam specifically
code = code.replace(/"haki": \[\] \}\s*\{ "id": 40, "name": "Loki"/, '"haki": [] },\n  { "id": 40, "name": "Loki"');

fs.writeFileSync('src/data/opData.js', code);
