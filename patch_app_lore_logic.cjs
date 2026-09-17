const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const targetFinish = `        // Show the generating animation while we wait for AI
        setScreen('generating');

        // Generate Lore async
        try {
            const ollama = new OllamaService();
            const bioData = await ollama.generateBio(finalBuild, finalStats, calcTier.name, formatBountyStr(calcBounty, calcTier));
            setLore(bioData);
            if (bioData && bioData.custom_synergy) {
                setSynergies(prev => {
                    const current = prev || [];
                    if (current.some(s => s.name === bioData.custom_synergy.name)) return current;
                    return [...current, bioData.custom_synergy];
                });
            }
        } catch (error) {
            console.warn("Could not generate lore:", error.message);
            setLore({ name: "Unknown Anomaly", epithet: "The Glitched", bio: "A tear in the fabric of the universe created this entity." });
        }

        // Now move to final result screen
        setScreen('result');
        
        if (['L', 'M'].includes(calcTier.rarity)) {
            playEpic();
        } else {
            playThud();
        }
    };`;

const replacementFinish = `        // Do not generate lore immediately to save tokens
        setScreen('result');
        
        if (['L', 'M'].includes(calcTier.rarity)) {
            playEpic();
        } else {
            playThud();
        }
    };

    const handleGenerateLore = async () => {
        if (!build || Object.keys(build).length === 0) return;
        setScreen('generating');
        
        try {
            const ollama = new OllamaService();
            const bioData = await ollama.generateBio(build, stats, tier.name, formatBountyStr(bounty, tier));
            setLore(bioData);
            if (bioData && bioData.custom_synergy) {
                setSynergies(prev => {
                    const current = prev || [];
                    if (current.some(s => s.name === bioData.custom_synergy.name)) return current;
                    return [...current, bioData.custom_synergy];
                });
            }
        } catch (error) {
            console.warn("Could not generate lore:", error.message);
            setLore({ name: "Unknown Anomaly", epithet: "The Glitched", bio: "A tear in the fabric of the universe created this entity." });
        }
        
        setScreen('result');
        playEpic();
    };`;

code = code.replace(targetFinish, replacementFinish);

const targetButtons = `                            <div className="mt-8 flex justify-center gap-4">
                                <button
                                    onClick={handleSaveCharacter}`;

const replacementButtons = `                            <div className="mt-8 flex flex-wrap justify-center gap-4">
                                {!lore && (
                                    <button
                                        onClick={handleGenerateLore}
                                        className="px-8 py-4 bg-indigo-600 text-white border border-indigo-700 hover:bg-indigo-700 font-display uppercase tracking-widest text-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 active:scale-95 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-offset-2"
                                    >
                                        GENERATE LORE & ABILITIES
                                    </button>
                                )}
                                <button
                                    onClick={handleSaveCharacter}`;

code = code.replace(targetButtons, replacementButtons);

fs.writeFileSync('src/App.jsx', code);
