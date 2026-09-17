const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const target = `        const calcTier = getTier(overallPower);
        setTier(calcTier);

        const calcBounty = calculateBounty(overallPower, calcTier);
        setBounty(calcBounty);

        autoSpinRef.current = false;
        setScreen('result');
        playThud();

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
    };`;

const replacement = `        const calcTier = getTier(overallPower);
        setTier(calcTier);

        const calcBounty = calculateBounty(overallPower, calcTier);
        setBounty(calcBounty);

        autoSpinRef.current = false;
        
        // Show the generating animation while we wait for AI
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

code = code.replace(target, replacement);
fs.writeFileSync('src/App.jsx', code);
