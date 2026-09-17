const fs = require('fs');
let code = fs.readFileSync('src/data/opData.js', 'utf8');

const newData = `  { "id": 40, "name": "Loki", "crew": "Elbaf", "bounty": "0", "image_keyword": "loki", "rarity": "L", "val": 100, "gender": "M", "haki": ["obs", "arm", "conq"] },
  { "id": 41, "name": "Harald", "crew": "Elbaf", "bounty": "0", "image_keyword": "harald", "rarity": "E", "val": 95, "gender": "M", "haki": ["obs", "arm", "conq"] },
  { "id": 42, "name": "Figarland Shamrock", "crew": "Holy Knights", "bounty": "0", "image_keyword": "shamrock", "rarity": "L", "val": 100, "gender": "M", "haki": ["obs", "arm", "conq"] },
  { "id": 43, "name": "Manmayer Gunko", "crew": "God's Knights", "bounty": "0", "image_keyword": "gunko", "rarity": "E", "val": 95, "gender": "F", "haki": ["obs", "arm", "conq"] },
  { "id": 44, "name": "Shepherd Sommers", "crew": "God's Knights", "bounty": "0", "image_keyword": "sommers", "rarity": "E", "val": 95, "gender": "M", "haki": ["obs", "arm", "conq"] }
];`;

code = code.replace("];", newData);
fs.writeFileSync('src/data/opData.js', code);
