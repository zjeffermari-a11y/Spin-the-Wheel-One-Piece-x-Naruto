const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const target = `{currentOutcome && (
                                        <motion.div`;

const replacement = `{currentOutcome && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 50, scale: 0.5 }}
                                            animate={{ opacity: 1, y: 0, scale: 1, x: ['Epic', 'Legend', 'Mythic'].includes(currentOutcome.rarity) ? [-10, 10, -10, 10, 0] : 0 }}
                                            transition={{ duration: 0.3 }}
                                            exit={{ opacity: 0, y: -50, scale: 0.5 }}
                                            className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-30 overflow-hidden"
                                        >
                                            {/* Exploding halftone burst during intermediate spin reveals too! */}
                                            {['Epic', 'Legend', 'Mythic'].includes(currentOutcome.rarity) && (
                                                <HalftoneBurst color={RARITY[currentOutcome.rarity]?.color} />
                                            )}
                                             <div`;

code = code.replace(/\{currentOutcome && \(\s*<motion\.div\s*initial=\{\{ opacity: 0, y: 50, scale: 0\.5 \}\}\s*animate=\{\{ opacity: 1, y: 0, scale: 1, x: \['E', 'L', 'M'\].includes\(currentOutcome\.rarity\) \? \[-10, 10, -10, 10, 0\] : 0 \}\}\s*transition=\{\{ duration: 0\.3 \}\}\s*exit=\{\{ opacity: 0, y: -50, scale: 0\.5 \}\}\s*className="absolute inset-0 flex items-center justify-center bg-black\/80 backdrop-blur-md z-30"\s*>\s*<div/m, replacement);

fs.writeFileSync('src/App.jsx', code);
