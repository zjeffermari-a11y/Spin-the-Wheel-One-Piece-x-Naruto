import React, { useState, useRef, useCallback } from 'react';
import Wheel from './components/Wheel';
import CharacterCard from './components/CharacterCard';
import SettingsModal from './components/SettingsModal';
import RosterModal from './components/RosterModal';
import { initDatabases } from './data/dbInit';
import { devilFruitDB } from './data/categories';
import { calculateSynergies } from './utils/gameLogic';
import { OllamaService } from './utils/OllamaService';
import { RARITY } from './data/rarity';
import { Settings, Users, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthModal from './components/AuthModal';
import { supabase } from './utils/supabaseClient';
import { useAudio } from './hooks/useAudio';

function shuffleArray(array) {
    const a = [...array];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const TAILED_BEASTS = [
    { name: 'Shukaku (1-Tail)', rarity: 'C', val: 75, tag: 'beast_1' },
    { name: 'Matatabi (2-Tails)', rarity: 'U', val: 78, tag: 'beast_2' },
    { name: 'Isobu (3-Tails)', rarity: 'U', val: 80, tag: 'beast_3' },
    { name: 'Son Gokū (4-Tails)', rarity: 'R', val: 82, tag: 'beast_4' },
    { name: 'Kokuō (5-Tails)', rarity: 'R', val: 84, tag: 'beast_5' },
    { name: 'Saiken (6-Tails)', rarity: 'E', val: 86, tag: 'beast_6' },
    { name: 'Chōmei (7-Tails)', rarity: 'E', val: 88, tag: 'beast_7' },
    { name: 'Gyūki (8-Tails)', rarity: 'L', val: 92, tag: 'beast_8' },
    { name: 'Kurama (9-Tails)', rarity: 'L', val: 95, tag: 'beast_9' }
];

const DF_TYPE_MAP = {
    'Paramecia': 'paramecia',
    'Logia': 'logia',
    'Zoan': 'zoan',
    'Ancient Zoan': 'ancient',
    'Mythical Zoan': 'mythical'
};

function App() {
    const [screen, setScreen] = useState('landing'); // landing, spinning, result
    const [categories, setCategories] = useState([]);
    const [catIndex, setCatIndex] = useState(0);
    const [build, setBuild] = useState({});
    const [stats, setStats] = useState({ str: 0, spd: 0, dur: 0, iq: 0, haki: 0, pwr: 0, hax: 0 });
    const [overall, setOverall] = useState(0);
    const [bounty, setBounty] = useState(0);
    const [tier, setTier] = useState(null);
    const [lore, setLore] = useState(null);
    const [synergies, setSynergies] = useState([]);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isRosterOpen, setIsRosterOpen] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [viewingSavedCharacter, setViewingSavedCharacter] = useState(null);

    const [user, setUser] = useState(null);
    const [isAuthOpen, setIsAuthOpen] = useState(false);

    const [isGeneratingLore, setIsGeneratingLore] = useState(false);
    const [spinComplete, setSpinComplete] = useState(false);

    const [isSpinning, setIsSpinning] = useState(false);
    const [currentOutcome, setCurrentOutcome] = useState(null);
    const [currentSegmentName, setCurrentSegmentName] = useState('');

    const { playTick, playLock, playEpic } = useAudio();

    const wheelRef = useRef(null);
    const autoSpinRef = useRef(false);
    const buildRef = useRef({});
    const catIndexRef = useRef(0);
    const categoriesRef = useRef([]);

    React.useEffect(() => {
        // Check current session
        const syncUserKey = (session) => {
            const u = session?.user || null;
            setUser(u);
            if (u?.user_metadata?.groq_api_key) {
                localStorage.setItem('spin_wheel_groq_api_key', u.user_metadata.groq_api_key);
            }
        };

        supabase.auth.getSession().then(({ data: { session } }) => {
            syncUserKey(session);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            syncUserKey(session);
        });

        return () => subscription.unsubscribe();
    }, []);

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
        setIsGeneratingLore(false);
        setSpinComplete(false);
        autoSpinRef.current = false;
        setScreen('spinning');
    };

    const handleSaveCharacter = async () => {
        try {
            const charData = { build, stats, overall, bounty, tier, lore, synergies };
            
            if (user) {
                // Save to Supabase
                const { error } = await supabase.from('saved_characters').insert([{
                    user_id: user.id,
                    name: lore?.name || 'Unknown',
                    epithet: lore?.epithet || '',
                    bio: lore?.bio || '',
                    tier: tier?.name || 'Unknown',
                    bounty: bounty.toString(),
                    overall: overall,
                    build: build,
                    stats: stats,
                    synergies: synergies,
                    lore: lore
                }]);
                
                if (error) throw error;
            } else {
                // Fallback to localStorage for guests
                const saved = JSON.parse(localStorage.getItem('spinYourDestiny_saves') || '[]');
                saved.push(charData);
                localStorage.setItem('spinYourDestiny_saves', JSON.stringify(saved));
            }
            
            setIsSaved(true);
            alert('Legend successfully saved to your roster!');
        } catch (e) {
            console.error('Failed to save character:', e);
            alert('Error saving character. Please try again.');
        }
    };

    const handleLoadCharacter = (charData) => {
        setViewingSavedCharacter(charData);
        setIsRosterOpen(false);
    };

    // Resolve dynamic categories (skip or populate options)
    const resolveCategory = useCallback((idx, currentBuild, cats) => {
        const cat = cats[idx];
        if (!cat) return idx; // out of bounds

        // Jinchuriki beast: skip if trait is not Jinchūriki
        if (cat.isDynamic && cat.id === 'jinchuriki_beast') {
            const parentChoice = currentBuild[cat.parentCatId];
            if (!parentChoice || parentChoice.name !== 'Jinchūriki') {
                currentBuild[cat.id] = { name: 'None', rarity: 'C', val: 0, tag: 'none' };
                buildRef.current = { ...currentBuild };
                setBuild({ ...currentBuild });
                return resolveCategory(idx + 1, currentBuild, cats);
            }
            cat.options = [...TAILED_BEASTS];
        }

        // Devil Fruit: skip if df_type is None
        if (cat.isDynamic && cat.parentCatId === 'df_type') {
            const parentChoice = currentBuild[cat.parentCatId];
            if (!parentChoice || parentChoice.name === 'None') {
                currentBuild[cat.id] = { name: 'None', rarity: 'C', val: 0, tag: 'none' };
                buildRef.current = { ...currentBuild };
                setBuild({ ...currentBuild });
                return resolveCategory(idx + 1, currentBuild, cats);
            }
            const dbType = DF_TYPE_MAP[parentChoice.name] || parentChoice.name.toLowerCase();
            const pool = shuffleArray(devilFruitDB.filter(f => f.type === dbType));
            cat.options = pool.slice(0, 20);
        }

        // Skip any category with no options (shouldn't happen, but safety)
        if (!cat.options || cat.options.length === 0) {
            currentBuild[cat.id] = { name: 'None', rarity: 'C', val: 0, tag: 'none' };
            buildRef.current = { ...currentBuild };
            setBuild({ ...currentBuild });
            return resolveCategory(idx + 1, currentBuild, cats);
        }

        return idx;
    }, []);

    const advanceToCategory = useCallback((nextIdx, currentBuild, cats) => {
        if (nextIdx >= cats.length) {
            finishBuild(currentBuild);
            setSpinComplete(true);
            return;
        }

        const resolvedIdx = resolveCategory(nextIdx, currentBuild, cats);
        if (resolvedIdx >= cats.length) {
            finishBuild(currentBuild);
            setSpinComplete(true);
            return;
        }

        catIndexRef.current = resolvedIdx;
        setCatIndex(resolvedIdx);

        if (autoSpinRef.current) {
            setTimeout(() => doSpin(resolvedIdx, currentBuild, cats), 400);
        }
    }, []);

    const doSpin = useCallback((idx, currentBuild, cats) => {
        if (idx >= cats.length) return;

        setIsSpinning(true);
        const currentCategory = cats[idx];
        const options = currentCategory.options;
        const targetIndex = Math.floor(Math.random() * options.length);
        const outcome = options[targetIndex];

        const duration = autoSpinRef.current ? 1200 : 3000;

        if (wheelRef.current) {
            wheelRef.current.spinTo(targetIndex, duration, () => {
                // Show result overlay
                setCurrentOutcome(outcome);
                
                if (['E', 'L', 'M'].includes(outcome.rarity)) {
                    playEpic();
                } else {
                    playLock();
                }

                // Lock the outcome into the build
                const newBuild = { ...currentBuild, [currentCategory.id]: outcome };
                buildRef.current = newBuild;
                setBuild(newBuild);

                const displayTime = autoSpinRef.current ? 600 : 1200;
                setTimeout(() => {
                    setCurrentOutcome(null);
                    setIsSpinning(false);
                    advanceToCategory(idx + 1, newBuild, cats);
                }, displayTime);
            });
        }
    }, [advanceToCategory]);

    const handleSpinClick = () => {
        if (isSpinning) return;
        doSpin(catIndexRef.current, buildRef.current, categoriesRef.current);
    };

    const handleAutoSpin = () => {
        if (isSpinning) return;
        autoSpinRef.current = true;
        doSpin(catIndexRef.current, buildRef.current, categoriesRef.current);
    };

    const finishBuild = async (finalBuild) => {
        const getVal = (catId) => finalBuild[catId] ? (finalBuild[catId].val || 50) : 50;

        // Calculate synergies
        const hardcoded = calculateSynergies(finalBuild);
        const synergyStats = { str: 0, spd: 0, dur: 0, iq: 0, haki: 0, pwr: 0, hax: 0 };
        let overallMultiplier = 1.0;

        ['str', 'spd', 'dur', 'iq', 'haki'].forEach(s => { synergyStats[s] += (hardcoded.bonuses[s] || 0); });
        synergyStats.pwr += ((hardcoded.bonuses.chrk || 0) + (hardcoded.bonuses.abl || 0));
        synergyStats.hax += (hardcoded.bonuses.hax || 0);
        overallMultiplier += ((hardcoded.bonuses.overall || 0) / 100);

        // Calculate final stats using the original formula
        const chrk = ((getVal('jutsu_nin') + getVal('jutsu_gen') + getVal('jutsu_sen')) / 3);
        const abl = Math.max(getVal('df'), getVal('dojutsu'), getVal('jutsu_kg'), getVal('jutsu_kt'));
        let baseHax = 0;
        for (const key in finalBuild) {
            const item = finalBuild[key];
            if (!item || item.name === 'None') continue;
            
            if (item.tag === 'hax') {
                baseHax += 30;
            } else if (item.val >= 100) {
                baseHax += 20;
            } else if (item.val >= 95) {
                baseHax += 10;
            }
        }
        const hax = baseHax;
        const finalStats = {
            str: getVal('str') + (finalBuild.race?.baseStats ? (finalBuild.race.baseStats.str - 50) * 0.5 : 0) + synergyStats.str,
            spd: getVal('spd') + (finalBuild.race?.baseStats ? (finalBuild.race.baseStats.spd - 50) * 0.5 : 0) + (getVal('jutsu_tai') * 0.2) + synergyStats.spd,
            dur: getVal('dur') + (finalBuild.race?.baseStats ? (finalBuild.race.baseStats.dur - 50) * 0.5 : 0) + (getVal('jutsu_tai') * 0.2) + synergyStats.dur,
            iq: getVal('iq') + synergyStats.iq,
            haki: (getVal('haki_obs') * 0.4 + getVal('haki_arm') * 0.4 + getVal('haki_conq') * 0.6) + synergyStats.haki,
            pwr: ((chrk + abl) / 1.5) + synergyStats.pwr,
            hax: hax + synergyStats.hax
        };
        for (let k in finalStats) finalStats[k] = Math.min(100, Math.max(0, finalStats[k]));

        const potMult = finalBuild.potential ? finalBuild.potential.val : 1.0;
        const avg = Object.values(finalStats).reduce((a, b) => a + b, 0) / 7;
        const overallPower = Math.min(100, Math.max(0, (avg * potMult) * overallMultiplier));

        setStats(finalStats);
        setOverall(parseFloat(overallPower.toFixed(1)));
        setSynergies(hardcoded.list);

        const calcTier = getTier(overallPower);
        setTier(calcTier);

        const calcBounty = calculateBounty(overallPower, calcTier);
        setBounty(calcBounty);

        autoSpinRef.current = false;
    };

    const handleGenerateLore = async () => {
        setIsGeneratingLore(true);
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
            console.error("Failed to generate lore via Ollama", error);
            setLore({ name: "Unknown Anomaly", epithet: "The Glitched", bio: "A tear in the fabric of the universe created this entity." });
        } finally {
            setIsGeneratingLore(false);
        }
    };

    const handleGenerateLoreAndProceed = async () => {
        await handleGenerateLore();
        setScreen('result');
    };

    const getTier = (power) => {
        if (power <= 25) return { name: 'Weak', rarity: 'C', class: 'tier-weak' };
        if (power <= 45) return { name: 'Average', rarity: 'U', class: 'tier-average' };
        if (power <= 65) return { name: 'Strong', rarity: 'R', class: 'tier-strong' };
        if (power <= 85) return { name: 'Overpowered', rarity: 'E', class: 'tier-op' };
        return { name: 'Broken', rarity: 'L', class: 'tier-broken' };
    };

    const calculateBounty = (power, tierObj) => {
        if (power <= 25) return Math.floor((power / 25) * 50000000);
        if (power <= 45) return 50000000 + Math.floor(((power - 25) / 20) * 450000000); // 50M to 500M
        if (power <= 65) return 500000000 + Math.floor(((power - 45) / 20) * 2500000000); // 500M to 3B
        if (power <= 85) return 3000000000 + Math.floor(((power - 65) / 20) * 7000000000); // 3B to 10B
        return -1; // Broken handles formatBountyStr independently
    };

    const formatBountyStr = (num, tierObj) => {
        if (tierObj && tierObj.name === 'Broken') return '₿ ??? (Unknown)';
        return '₿ ' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30" style={{ fontFamily: "'Chakra Petch', 'Segoe UI', system-ui, sans-serif" }}>
            {/* Noise texture overlay */}
            <div className="fixed inset-0 pointer-events-none z-[1] opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27noise%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23noise)%27/%3E%3C/svg%3E")', backgroundRepeat: 'repeat' }} />

            {/* Header */}
            <header className="px-6 py-4 border-b border-[#1a1a1a] bg-[#080808]/90 backdrop-blur-md flex justify-between items-center sticky top-0 z-40">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-xs font-black">⚡</div>
                    <h1 className="text-xl md:text-2xl font-black tracking-tight text-white uppercase">
                        Spin Your <span className="text-orange-500">Destiny</span>
                    </h1>
                </div>
                <div className="flex gap-3 items-center">
                    {user ? (
                        <div className="flex items-center gap-2 mr-1 bg-[#111] border border-[#1a1a1a] pl-3 pr-1 py-1 rounded-lg">
                            <span className="text-xs text-gray-500 max-w-[80px] truncate" title={user.email}>{user.email}</span>
                            <button onClick={handleLogout} className="p-1.5 hover:bg-red-500/20 rounded-md transition-colors text-gray-500 hover:text-red-400" title="Log Out">
                                <LogOut size={14} />
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => setIsAuthOpen(true)} className="flex items-center gap-2 px-3 py-1.5 bg-orange-600/10 hover:bg-orange-600/20 border border-orange-500/20 rounded-lg transition-colors text-orange-400 hover:text-orange-300 text-sm font-bold" title="Log In / Sign Up">
                            <User size={14} />
                            <span>Sign In</span>
                        </button>
                    )}
                    <button onClick={() => setIsRosterOpen(true)} className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors text-gray-500 hover:text-white" title="Roster">
                        <Users size={18} />
                    </button>
                    <button onClick={() => setIsSettingsOpen(true)} className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors text-gray-500 hover:text-white" title="Settings">
                        <Settings size={18} />
                    </button>
                </div>
            </header>

            <main className="p-4 md:p-8 relative z-[2]">
                <AnimatePresence mode="wait">
                    {screen === 'landing' && (
                        <motion.div
                            key="landing"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex flex-col items-center justify-center min-h-[70vh] text-center relative"
                        >
                            {/* Background kanji */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] text-[20rem] font-black select-none pointer-events-none">運命</div>
                            
                            <div className="text-sm font-bold text-orange-500/60 uppercase tracking-[0.5em] mb-4">One Piece × Naruto</div>
                            <h2 className="text-5xl md:text-7xl font-black mb-6 text-white uppercase tracking-tight">
                                Forge Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Legend</span>
                            </h2>
                            <p className="text-base md:text-lg text-gray-500 max-w-xl mx-auto mb-12 leading-relaxed">
                                Spin the wheel of fate. Combine abilities from across universes. Generate unique characters with dynamic stats, synergies, and AI-powered lore.
                            </p>
                            <button
                                onClick={startCreation}
                                className="group relative px-10 py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white rounded-lg font-black text-lg tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-orange-900/30 uppercase"
                            >
                                <span className="relative z-10">Begin Creation</span>
                                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-orange-600 to-red-600 blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />
                            </button>
                        </motion.div>
                    )}

                    {screen === 'spinning' && categories[catIndex] && (
                        <motion.div
                            key="spinning"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto"
                        >
                            {/* Left Column: Wheel */}
                            <div className="flex-1 bg-[#0a0a0a] p-6 md:p-8 rounded-xl border border-[#1a1a1a] flex flex-col items-center relative overflow-hidden">
                                {/* Category header */}
                                <div className="flex items-center gap-3 mb-6 z-10">
                                    <div className="px-3 py-1 bg-orange-600/10 border border-orange-500/20 rounded text-xs font-bold text-orange-400 uppercase tracking-widest">
                                        {spinComplete ? 'Done' : `${catIndex + 1}/${categories.length}`}
                                    </div>
                                    <h3 className="text-2xl font-black text-white uppercase tracking-wide">
                                        {spinComplete ? 'Build Complete' : categories[catIndex].name}
                                    </h3>
                                </div>

                                <div className="relative z-10 w-full max-w-[380px]">
                                    {/* Spin Pointer — sharper, glowing */}
                                    <div className="absolute top-[-16px] left-1/2 -translate-x-1/2 z-20">
                                        <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[24px] border-t-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
                                    </div>

                                    <Wheel ref={wheelRef} options={categories[catIndex].options} onTick={playTick} onSegmentChange={setCurrentSegmentName} />
                                </div>

                                {/* Live Readout — the name ticker */}
                                <div className="w-full max-w-sm mt-4 z-10">
                                    <div className="bg-[#111] border border-[#1a1a1a] rounded-lg px-4 py-3 text-center overflow-hidden">
                                        <div className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em] mb-1">Currently On</div>
                                        <div className="text-lg md:text-xl font-black text-white truncate transition-all duration-75" key={currentSegmentName}>
                                            {currentSegmentName || '---'}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-6 z-10 w-full max-w-sm">
                                    {!spinComplete ? (
                                        <>
                                            <button
                                                onClick={handleSpinClick}
                                                disabled={isSpinning}
                                                className="flex-1 py-3.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-500 rounded-lg font-bold transition-all text-base uppercase tracking-wider"
                                            >
                                                Spin
                                            </button>
                                            <button
                                                onClick={handleAutoSpin}
                                                disabled={isSpinning}
                                                className="px-5 py-3.5 bg-[#151515] hover:bg-[#1a1a1a] disabled:opacity-40 border border-[#222] rounded-lg font-bold transition-all text-base uppercase tracking-wider text-gray-400 hover:text-white"
                                            >
                                                Auto
                                            </button>
                                        </>
                                    ) : (
                                        <div className="flex flex-col gap-3 w-full">
                                            {isGeneratingLore ? (
                                                <button
                                                    disabled
                                                    className="w-full py-3.5 bg-orange-900/30 text-orange-300/60 rounded-lg font-bold transition-all text-base uppercase tracking-wider flex items-center justify-center gap-2"
                                                >
                                                    <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                                                    Generating Lore...
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={handleGenerateLoreAndProceed}
                                                    className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 rounded-lg font-bold transition-all text-base uppercase tracking-wider"
                                                >
                                                    Generate Lore & View
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <AnimatePresence>
                                    {currentOutcome && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 50, scale: 0.5 }}
                                            animate={{ opacity: 1, y: 0, scale: 1, x: ['E', 'L', 'M'].includes(currentOutcome.rarity) ? [-8, 8, -8, 8, 0] : 0 }}
                                            transition={{ duration: 0.3 }}
                                            exit={{ opacity: 0, y: -50, scale: 0.5 }}
                                            className="absolute inset-0 flex items-center justify-center bg-black/85 backdrop-blur-md z-30"
                                        >
                                            <div 
                                                className="text-center p-8 rounded-xl border shadow-lg bg-[#0a0a0a]/80"
                                                style={{ 
                                                    borderColor: RARITY[currentOutcome.rarity]?.color || '#333',
                                                    boxShadow: `0 0 40px ${RARITY[currentOutcome.rarity]?.color || '#ffffff'}30`
                                                }}
                                            >
                                                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.4em] mb-3">Acquired</div>
                                                <div className="text-3xl md:text-4xl font-black text-white">
                                                    {currentOutcome.name}
                                                </div>
                                                <div className="mt-3 text-sm font-bold uppercase tracking-widest" style={{ color: RARITY[currentOutcome.rarity]?.color || '#888' }}>
                                                    {RARITY[currentOutcome.rarity]?.name || 'Unknown'}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Right Column: Build Log */}
                            <div className="w-full lg:w-80 flex flex-col gap-4">
                                <div className="bg-[#0a0a0a] p-4 rounded-xl border border-[#1a1a1a] flex-1">
                                    <h4 className="text-sm font-bold mb-3 pb-2 border-b border-[#1a1a1a] text-gray-400 uppercase tracking-widest">Build Log</h4>
                                    <div className="space-y-1.5 overflow-y-auto max-h-[65vh] pr-1 custom-scrollbar">
                                        {categories.map((c) => (
                                            <div key={c.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${build[c.id] ? 'bg-[#111]' : 'opacity-30'}`}>
                                                <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: build[c.id] ? (RARITY[build[c.id].rarity]?.color || '#333') : '#1a1a1a' }} />
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">{c.name}</div>
                                                    <div className="text-xs font-bold truncate" style={{ color: build[c.id] ? (RARITY[build[c.id].rarity]?.color || '#fff') : '#333' }}>
                                                        {build[c.id] ? build[c.id].name : '—'}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {screen === 'result' && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full"
                        >
                            <CharacterCard
                                build={build}
                                stats={stats}
                                overall={overall}
                                bounty={bounty}
                                tier={tier}
                                lore={lore}
                                synergies={synergies}
                                isGeneratingLore={isGeneratingLore}
                            />

                            <div className="mt-8 flex justify-center gap-4">
                                {lore && (
                                    <button
                                        onClick={handleSaveCharacter}
                                        disabled={isSaved}
                                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-800 disabled:text-gray-500 rounded-full font-bold transition-all shadow-lg uppercase tracking-widest text-sm"
                                    >
                                        {isSaved ? 'Legend Saved' : 'Save Legend'}
                                    </button>
                                )}
                                <button
                                    onClick={startCreation}
                                    className="px-8 py-3 bg-[#222] hover:bg-[#333] border border-[#444] rounded-full font-bold transition-all shadow-lg uppercase tracking-widest text-sm"
                                >
                                    Create Another Legend
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
            <RosterModal isOpen={isRosterOpen} onClose={() => setIsRosterOpen(false)} onLoad={handleLoadCharacter} />
            <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

            {viewingSavedCharacter && (
                <div className="fixed inset-0 z-[100] bg-black/95 overflow-y-auto p-4 md:p-8">
                    <div className="w-full max-w-5xl mx-auto flex flex-col items-center pt-4 pb-20">
                        <button
                            onClick={() => setViewingSavedCharacter(null)}
                            className="mb-8 px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-black transition-all shadow-lg uppercase tracking-widest text-lg shadow-indigo-500/20"
                        >
                            Back to Current Action
                        </button>
                        <CharacterCard
                            build={viewingSavedCharacter.build}
                            stats={viewingSavedCharacter.stats}
                            overall={viewingSavedCharacter.overall}
                            bounty={viewingSavedCharacter.bounty}
                            tier={viewingSavedCharacter.tier}
                            lore={viewingSavedCharacter.lore}
                            synergies={viewingSavedCharacter.synergies || []}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
