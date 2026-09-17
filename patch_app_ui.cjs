const fs = require('fs');

const filesToPatch = [
    'src/App.jsx',
    'src/components/SettingsModal.jsx',
    'src/components/RosterModal.jsx',
    'src/components/AuthModal.jsx',
    'src/components/CharacterCard.jsx',
    'src/components/RarityLegend.jsx'
];

filesToPatch.forEach(file => {
    let code = fs.readFileSync(file, 'utf8');
    
    // Remove heavy neobrutalist borders
    code = code.replace(/border-4 border-black/g, 'border border-gray-200');
    code = code.replace(/border-4/g, 'border');
    code = code.replace(/border-2 border-black/g, 'border border-gray-200');
    code = code.replace(/border-b-4 border-black/g, 'border-b border-gray-200');
    
    // Replace sharp shadows with soft premium shadows or remove them
    code = code.replace(/shadow-\[.*?rgba\(0,0,0,1\)]/g, 'shadow-sm hover:shadow-md');
    code = code.replace(/shadow-\[.*?rgba\(0,0,0,0\.05\)]/g, 'shadow-inner');
    code = code.replace(/shadow-none/g, '');
    
    // Update red buttons to sophisticated dark buttons
    code = code.replace(/bg-red-600/g, 'bg-zinc-900');
    code = code.replace(/hover:bg-red-700/g, 'hover:bg-zinc-800');
    
    // Translate removals
    code = code.replace(/hover:translate-x-\[.*?\] hover:translate-y-\[.*?\]/g, 'hover:-translate-y-0.5');
    
    // Rounding (neobrutalism usually uses rounded-none, let's use premium rounded-xl)
    code = code.replace(/rounded-none/g, 'rounded-2xl');
    
    fs.writeFileSync(file, code);
});
