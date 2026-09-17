const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

const target1 = `    const advanceToCategory = useCallback((nextIdx, currentBuild, cats) => {
        if (nextIdx >= cats.length) {
            finishBuild(currentBuild);
            return;
        }

        const resolvedIdx = resolveCategory(nextIdx, currentBuild, cats);
        if (resolvedIdx >= cats.length) {
            finishBuild(currentBuild);
            return;
        }`;

const replacement1 = `    const advanceToCategory = useCallback((nextIdx, currentBuild, cats) => {
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
code = code.replace(target1, replacement1);

const targetStart = `    const startCreation = () => {
        const cats = initDatabases();
        setCategories(cats);
        categoriesRef.current = cats;
        setCatIndex(0);
        catIndexRef.current = 0;
        setBuild({});
        buildRef.current = {};
        setStats({ str: 0, spd: 0, dur: 0, iq: 0, haki: 0, pwr: 0, hax: 0 });
        setOverall(0);
        setBounty(0);
        setTier(null);
        setLore(null);
        setSynergies([]);
        setIsSaved(false);
        autoSpinRef.current = false;
        setScreen('spinning');
    };`;

const replacementStart = `    const [isBuildComplete, setIsBuildComplete] = useState(false);

    const startCreation = () => {
        const cats = initDatabases();
        setCategories(cats);
        categoriesRef.current = cats;
        setCatIndex(0);
        catIndexRef.current = 0;
        setBuild({});
        buildRef.current = {};
        setStats({ str: 0, spd: 0, dur: 0, iq: 0, haki: 0, pwr: 0, hax: 0 });
        setOverall(0);
        setBounty(0);
        setTier(null);
        setLore(null);
        setSynergies([]);
        setIsSaved(false);
        setIsBuildComplete(false);
        autoSpinRef.current = false;
        setScreen('spinning');
    };`;
code = code.replace(targetStart, replacementStart);

fs.writeFileSync('src/App.jsx', code);
