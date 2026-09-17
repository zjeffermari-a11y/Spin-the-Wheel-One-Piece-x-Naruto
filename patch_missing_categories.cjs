const fs = require('fs');
let code = fs.readFileSync('src/data/categories.js', 'utf8');

const target = `{ id: 'origin', name: 'Origin', desc: 'Where were you born?',`;
const replacement = `{ id: 'vessel', name: 'Physical Vessel', desc: 'Whose base physical body do you possess?', options: [] },
    { id: 'origin', name: 'Origin', desc: 'Where were you born?',`;

code = code.replace(target, replacement);

const target2 = `{ id: 'chakra_cap', name: 'Chakra Reserves', desc: 'Total chakra pool',`;
const replacement2 = `{ id: 'iq', name: 'Battle IQ', desc: 'Tactical thinking and adaptability', options: [] },
    { id: 'chakra_cap', name: 'Chakra Reserves', desc: 'Total chakra pool',`;

code = code.replace(target2, replacement2);

const target3 = `{ id: 'str', name: 'Strength Benchmark', desc: 'Raw physical power tier',`;
const replacement3 = `{ id: 'jinchuriki_beast', name: 'Tailed Beast', desc: 'Which Tailed Beast resides within you?', options: [], isDynamic: true, parentCatId: 'trait' },
    { id: 'str', name: 'Strength Benchmark', desc: 'Raw physical power tier',`;

code = code.replace(target3, replacement3);

fs.writeFileSync('src/data/categories.js', code);
