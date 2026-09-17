const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const targetFinish = `        const calcTier = getTier(overallPower);
        setTier(calcTier);

        const calcBounty = calculateBounty(overallPower, calcTier);
        setBounty(calcBounty);

        autoSpinRef.current = false;
        
        // Do not generate lore immediately to save tokens
        setScreen('result');
        
        if (['L', 'M'].includes(calcTier.rarity)) {
            playEpic();
        } else {
            playThud();
        }
    };`;

const replacementFinish = `        const calcTier = getTier(overallPower);
        setTier(calcTier);

        const calcBounty = calculateBounty(overallPower, calcTier);
        setBounty(calcBounty);

        autoSpinRef.current = false;
        
        // Stay on the spinning screen, just mark build as complete
        setIsBuildComplete(true);
    };`;

code = code.replace(targetFinish, replacementFinish);

const targetAdvance = `    const advanceToCategory = useCallback((nextIdx, currentBuild, cats) => {
        if (nextIdx >= cats.length) {
            setIsBuildComplete(true);
            autoSpinRef.current = false;
            return;
        }

        const resolvedIdx = resolveCategory(nextIdx, currentBuild, cats);
        if (resolvedIdx >= cats.length) {
            setIsBuildComplete(true);
            autoSpinRef.current = false;
            return;
        }`;

const replacementAdvance = `    const advanceToCategory = useCallback((nextIdx, currentBuild, cats) => {
        if (nextIdx >= cats.length) {
            finishBuild(currentBuild);
            return;
        }

        const resolvedIdx = resolveCategory(nextIdx, currentBuild, cats);
        if (resolvedIdx >= cats.length) {
            finishBuild(currentBuild);
            return;
        }`;

code = code.replace(targetAdvance, replacementAdvance);
fs.writeFileSync('src/App.jsx', code);
