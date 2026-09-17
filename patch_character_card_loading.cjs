const fs = require('fs');
let code = fs.readFileSync('src/components/CharacterCard.jsx', 'utf8');

const target1 = `                        {!lore ? (
                            <div className="text-black font-display uppercase tracking-widest animate-pulse flex items-center gap-2">
                                <div className="w-4 h-4 bg-black animate-ping" />
                                Forging signature moves...
                            </div>
                        ) : lore.signature_abilities && lore.signature_abilities.length > 0 ? (`;

const replacement1 = `                        {!lore ? (
                            <div className="text-gray-500 italic font-body">
                                Signature abilities locked. Click "Generate Lore & Abilities" to unlock.
                            </div>
                        ) : lore.signature_abilities && lore.signature_abilities.length > 0 ? (`;
code = code.replace(target1, replacement1);

const target2 = `                        {!lore ? (
                            <div className="text-black font-display uppercase tracking-widest animate-pulse flex items-center gap-2">
                                <div className="w-4 h-4 bg-black animate-ping" />
                                Consulting the ancient texts...
                            </div>
                        ) : !lore.bio ? (`;

const replacement2 = `                        {!lore ? (
                            <div className="text-gray-500 italic font-body">
                                Legend unwritten. Click "Generate Lore & Abilities" to forge destiny.
                            </div>
                        ) : !lore.bio ? (`;
code = code.replace(target2, replacement2);

fs.writeFileSync('src/components/CharacterCard.jsx', code);
