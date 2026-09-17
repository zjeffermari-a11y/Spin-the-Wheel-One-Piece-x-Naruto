const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const target = `{screen === 'result' && (
                        <motion.div`;

const replacement = `{screen === 'result' && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full relative"
                        >
                            {/* Render halftone burst for high-rarity (Epic, Legend, Mythic) */}
                            {currentOutcome && ['Epic', 'Legend', 'Mythic'].includes(currentOutcome.rarity) && (
                                <HalftoneBurst color={RARITY[currentOutcome.rarity]?.color} />
                            )}
                            <CharacterCard`;

code = code.replace(/{screen === 'result' && \(\s*<motion\.div\s*key="result"\s*initial=\{\{ opacity: 0, y: 30 \}\}\s*animate=\{\{ opacity: 1, y: 0 \}\}\s*className="w-full"\s*>\s*<CharacterCard/m, replacement);

fs.writeFileSync('src/App.jsx', code);
