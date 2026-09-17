const fs = require('fs');
let code = fs.readFileSync('src/data/categories.js', 'utf8');

code = code.replace(/'Ice Release \(Haku\)'/g, "'Ice Release'");
code = code.replace(/'Wood Sage Mode \(Hashirama\)'/g, "'Wood Sage Mode'");
// The user just mentioned jutsu categories, but let's clean up weapons too just in case?
// Actually, weapons having character names makes sense (e.g., "Yoru", "Enma", "Murakumogiri"). I'll leave weapons alone.
// What about jutsu?
code = code.replace(/'Reanimation Jutsu \(Edo Tensei\)'/g, "'Edo Tensei'");
code = code.replace(/'Flying Thunder God \(Hiraishin\)'/g, "'Hiraishin'");
code = code.replace(/'Tengai Shinsei \(Shattered Heaven\)'/g, "'Tengai Shinsei'");
code = code.replace(/'Wood Release \(Mokuton\)'/g, "'Wood Release'");
code = code.replace(/'Particle Style: Atomic Dismantling'/g, "'Particle Style: Dismantling Jutsu'");
// "Sharingan (1 Tomoe)" is fine.

fs.writeFileSync('src/data/categories.js', code);
