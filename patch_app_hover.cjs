const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const targetWheel = `<Wheel ref={wheelRef} options={categories[catIndex].options} onTick={playTick} />`;
const replacementWheel = `<Wheel 
                                        ref={wheelRef} 
                                        options={categories[catIndex].options} 
                                        onTick={playTick} 
                                        onCurrentOptionChange={(opt) => {
                                            if (hoverTextRef.current && opt) {
                                                hoverTextRef.current.innerText = opt.name;
                                                hoverTextRef.current.style.color = RARITY[opt.rarity]?.color || '#000';
                                            }
                                        }}
                                    />
                                </div>
                                <div className="mt-8 h-12 flex items-center justify-center z-10">
                                    <h4 
                                        ref={hoverTextRef} 
                                        className="text-3xl font-display uppercase tracking-widest text-center transition-colors duration-75"
                                    >
                                        ...
                                    </h4>`;

code = code.replace(targetWheel, replacementWheel);
fs.writeFileSync('src/App.jsx', code);
