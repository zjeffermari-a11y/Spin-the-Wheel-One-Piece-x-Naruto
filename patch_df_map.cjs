const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const target = `const DF_TYPE_MAP = {
    'Paramecia': 'paramecia',
    'Logia': 'logia',
    'Zoan': 'zoan',
    'Ancient Zoan': 'ancient',
    'Mythical Zoan': 'mythical'
};`;

const replacement = `const DF_TYPE_MAP = {
    'Paramecia': 'paramecia',
    'Logia': 'logia',
    'Zoan': 'zoan',
    'Ancient Zoan': 'ancient_zoan',
    'Mythical Zoan': 'mythical_zoan'
};`;

code = code.replace(target, replacement);
fs.writeFileSync('src/App.jsx', code);
