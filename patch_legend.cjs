const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const importStatement = `import RarityLegend from './components/RarityLegend';\n`;
if (!code.includes('import RarityLegend')) {
    code = code.replace(/import Wheel from '\.\/components\/Wheel';/, `import Wheel from './components/Wheel';\n${importStatement}`);
}

const targetDiv = `<div className="flex-1 bg-white p-8 border-4 border-black flex flex-col items-center relative overflow-hidden">`;
const replacementDiv = `<div className="flex-1 bg-white p-8 border-4 border-black flex flex-col items-center relative overflow-hidden">
                                <RarityLegend />`;

code = code.replace(targetDiv, replacementDiv);

fs.writeFileSync('src/App.jsx', code);
