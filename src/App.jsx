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
        setScreen('loading');
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
        <div className="min-h-screen bg-[#F9FAFB] text-black font-inter relative">
            {screen === 'result' && (
                <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
                    {/* Rising particles from bottom */}
                    {[...Array(15)].map((_, i) => (
                        <div key={`rise-${i}`} className="particle" style={{ left: `${Math.random() * 100}%`, width: `${Math.random() * 6 + 4}px`, height: `${Math.random() * 6 + 4}px`, animationDuration: `${Math.random() * 4 + 4}s`, animationDelay: `${Math.random() * 5}s` }} />
                    ))}
                    {/* Scattered drift particles */}
                    {[...Array(20)].map((_, i) => (
                        <div key={`scatter-${i}`} className="particle-scattered" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, width: `${Math.random() * 10 + 4}px`, height: `${Math.random() * 10 + 4}px`, animationDuration: `${Math.random() * 5 + 3}s`, animationDelay: `${Math.random() * 6}s` }} />
                    ))}
                    {/* Sparkle flashes */}
                    {[...Array(10)].map((_, i) => (
                        <div key={`sparkle-${i}`} className="particle-sparkle" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, width: `${Math.random() * 4 + 2}px`, height: `${Math.random() * 4 + 2}px`, animationDuration: `${Math.random() * 2 + 1.5}s`, animationDelay: `${Math.random() * 5}s` }} />
                    ))}
                </div>
            )}
            
            {/* Header */}
            <header className="px-6 py-4 bg-white border-b-2 border-black flex justify-between items-center sticky top-0 z-40">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl md:text-3xl font-bebas tracking-wider uppercase text-black">
                        SUMMON
                    </h1>
                </div>
                <div className="flex gap-4 items-center">
                    {user ? (
                        <div className="flex items-center gap-2 mr-1 bg-white border-2 border-black pl-3 pr-1 py-1">
                            <span className="text-sm font-bold text-black max-w-[80px] truncate" title={user.email}>{user.email}</span>
                            <button onClick={handleLogout} className="p-1.5 hover:bg-gray-100 transition-colors text-black" title="Log Out">
                                <LogOut size={16} strokeWidth={2.5} />
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => setIsAuthOpen(true)} className="flex items-center gap-2 px-5 py-2 bg-black text-white hover:bg-gray-800 transition-colors text-sm font-bebas tracking-widest uppercase" title="Log In / Sign Up">
                            <User size={16} strokeWidth={2.5} />
                            <span>Sign In</span>
                        </button>
                    )}
                    <button onClick={() => setIsRosterOpen(true)} className="p-2 hover:bg-gray-100 transition-colors text-black" title="Roster">
                        <Users size={20} strokeWidth={2.5} />
                    </button>
                    <button onClick={() => setIsSettingsOpen(true)} className="p-2 hover:bg-gray-100 transition-colors text-black" title="Settings">
                        <Settings size={20} strokeWidth={2.5} />
                    </button>
                </div>
            </header>

            <main className="p-4 md:p-12 relative z-10 w-full max-w-[1400px] mx-auto min-h-[calc(100vh-80px)] flex flex-col justify-center">
                <AnimatePresence mode="wait">
                    {screen === 'landing' && (
                        <motion.div
                            key="landing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="bg-white border-2 border-gray-100 w-full max-w-4xl mx-auto py-24 px-8 flex flex-col items-center justify-center text-center shadow-sm"
                        >
                            <h2 className="text-7xl md:text-9xl font-bebas leading-none tracking-normal text-black">
                                FORGE YOUR<br/>
                                <span className="text-[#CC0000]">CREW</span>
                            </h2>
                            <p className="mt-6 text-lg font-bold text-gray-600">
                                Assemble abilities from across dimensions.
                            </p>
                            <button
                                onClick={startCreation}
                                className="mt-12 px-12 py-4 bg-black text-white font-bebas text-2xl tracking-widest uppercase hover:bg-gray-900 transition-colors"
                            >
                                COMMENCE
                            </button>
                        </motion.div>
                    )}

                    {screen === 'spinning' && categories[catIndex] && (
                        <motion.div
                            key="spinning"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full bg-white border-2 border-gray-100 shadow-sm p-6 md:p-12"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_300px] gap-8 md:gap-12 w-full">
                                
                                {/* Left Column: Drop Rates */}
                                <div className="hidden lg:block">
                                    <div className="border-2 border-gray-100 p-4 w-full">
                                        <h4 className="font-bebas text-xl tracking-widest border-b-2 border-black pb-2 mb-4">DROP RATES</h4>
                                        <div className="space-y-3 font-bold text-sm text-gray-600">
                                            <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-500"></div>COMMON</div><span>47.1%</span></div>
                                            <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500"></div>UNCOMMON</div><span>26.2%</span></div>
                                            <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500"></div>RARE</div><span>15.7%</span></div>
                                            <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-3 h-3 bg-purple-500"></div>EPIC</div><span>8.4%</span></div>
                                            <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-3 h-3 bg-yellow-500"></div>LEGEND</div><span>2.1%</span></div>
                                            <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500"></div>MYTHIC</div><span>0.5%</span></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Center Column: Wheel */}
                                <div className="flex flex-col items-center relative min-h-[500px]">
                                    <div className="text-center mb-8">
                                        <h3 className="font-bebas text-5xl tracking-widest text-black">
                                            {spinComplete ? 'BUILD COMPLETE' : categories[catIndex].name.toUpperCase()}
                                        </h3>
                                        <div className="font-bold text-gray-500 tracking-widest mt-1">
                                            {spinComplete ? 'READY' : `${catIndex + 1} // ${categories.length}`}
                                        </div>
                                    </div>

                                    <div className="relative w-full max-w-[400px] aspect-square flex items-center justify-center">
                                        {/* Simple Black Pointer */}
                                        <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 z-20">
                                            <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[28px] border-t-black" />
                                        </div>

                                        <Wheel ref={wheelRef} options={categories[catIndex].options} onTick={playTick} onSegmentChange={setCurrentSegmentName} />
                                    </div>

                                    <div className="mt-8 font-bebas text-3xl tracking-widest text-gray-400">
                                        {currentSegmentName ? currentSegmentName.toUpperCase() : '...'}
                                    </div>

                                    <div className="flex gap-4 mt-8 w-full max-w-sm">
                                        {!spinComplete ? (
                                            <>
                                                <button
                                                    onClick={handleSpinClick}
                                                    disabled={isSpinning}
                                                    className="flex-1 py-4 bg-black text-white font-bebas text-2xl tracking-widest disabled:opacity-50 hover:bg-gray-800 transition-colors"
                                                >
                                                    SPIN
                                                </button>
                                                <button
                                                    onClick={handleAutoSpin}
                                                    disabled={isSpinning}
                                                    className="flex-1 py-4 bg-gray-100 text-black font-bebas text-2xl tracking-widest disabled:opacity-50 hover:bg-gray-200 transition-colors"
                                                >
                                                    AUTO
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={handleGenerateLoreAndProceed}
                                                className="w-full py-4 bg-black text-white font-bebas text-2xl tracking-widest hover:bg-gray-800 transition-colors"
                                            >
                                                GENERATE LORE
                                            </button>
                                        )}
                                    </div>
                                    
                                    <AnimatePresence>
                                        {currentOutcome && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm z-30"
                                            >
                                                <div className="text-center p-8 bg-white border-4 shadow-2xl" style={{ borderColor: RARITY[currentOutcome.rarity]?.color || '#000' }}>
                                                    <div className="font-bold text-gray-500 uppercase tracking-widest mb-2">ACQUIRED</div>
                                                    <div className="text-4xl md:text-5xl font-bebas text-black">
                                                        {currentOutcome.name}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Right Column: Active Draft */}
                                <div className="w-full">
                                    <h4 className="font-bebas text-2xl tracking-widest mb-4">ACTIVE DRAFT</h4>
                                    <div className="space-y-2 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                                        {categories.map((c) => (
                                            <div key={c.id} className="border-b-2 border-gray-100 border-dashed border-l-4 p-3 bg-gray-50" style={{ borderLeftColor: build[c.id] ? (RARITY[build[c.id].rarity]?.color || '#000') : '#E5E7EB' }}>
                                                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">{c.name}</div>
                                                <div className="font-bold uppercase mt-1 truncate" style={{ color: build[c.id] ? (RARITY[build[c.id].rarity]?.color || '#000') : '#9CA3AF' }}>
                                                    {build[c.id] ? build[c.id].name : 'PENDING'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                            </div>
                        </motion.div>
                    )}

                    {screen === 'loading' && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white w-full max-w-4xl mx-auto py-32 px-8 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden"
                        >
                            <div className="relative z-10">
                                <div className="lore-spinner mb-12"></div>
                                <h2 className="text-5xl md:text-7xl font-bebas tracking-widest text-black">
                                    FORGING DESTINY
                                </h2>
                                <p className="mt-4 text-gray-500 font-bold max-w-lg mx-auto">
                                    The energies of the world are converging. Awakening your unique vessel, abilities, and legendary lore...
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {screen === 'result' && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="w-full bg-white shadow-xl relative overflow-hidden"
                        >
                            <div className="relative z-10 p-6 md:p-12">
                                <CharacterCard
                                    build={build}
                                    stats={stats}
                                    overall={overall}
                                    bounty={bounty}
                                    tier={tier}
                                    lore={lore}
                                    synergies={synergies}
                                    isGeneratingLore={false}
                                />

                                <div className="mt-12 flex justify-center gap-4">
                                    {lore && (
                                        <button
                                            onClick={handleSaveCharacter}
                                            disabled={isSaved}
                                            className="px-8 py-4 bg-black text-white disabled:bg-gray-300 font-bebas text-2xl tracking-widest hover:bg-gray-800 transition-colors"
                                        >
                                            {isSaved ? 'SAVED' : 'SAVE TO ROSTER'}
                                        </button>
                                    )}
                                    <button
                                        onClick={startCreation}
                                        className="px-8 py-4 bg-white text-black border-2 border-black font-bebas text-2xl tracking-widest hover:bg-gray-100 transition-colors"
                                    >
                                        COMMENCE AGAIN
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
            <RosterModal isOpen={isRosterOpen} onClose={() => setIsRosterOpen(false)} onLoad={handleLoadCharacter} />
            <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

            {viewingSavedCharacter && (
                <div className="fixed inset-0 z-[100] bg-white/95 overflow-y-auto p-4 md:p-8">
                    <div className="w-full max-w-5xl mx-auto flex flex-col items-center pt-12 pb-20">
                        <button
                            onClick={() => setViewingSavedCharacter(null)}
                            className="mb-8 px-10 py-4 bg-black text-white font-bebas text-2xl tracking-widest hover:bg-gray-800 transition-colors"
                        >
                            CLOSE RECORD
                        </button>
                        <div className="w-full bg-white p-8 shadow-xl relative overflow-hidden">
                            <div className="relative z-10">
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
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
