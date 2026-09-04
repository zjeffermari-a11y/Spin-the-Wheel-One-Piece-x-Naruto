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

    const [isSpinning, setIsSpinning] = useState(false);
    const [currentOutcome, setCurrentOutcome] = useState(null);

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
            return;
        }

        const resolvedIdx = resolveCategory(nextIdx, currentBuild, cats);
        if (resolvedIdx >= cats.length) {
            finishBuild(currentBuild);
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
        setScreen('result');

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
            console.error("Failed to generate lore via Ollama", error);
            setLore({ name: "Unknown Anomaly", epithet: "The Glitched", bio: "A tear in the fabric of the universe created this entity." });
        }
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
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-indigo-500/30">
            {/* Header */}
            <header className="p-6 border-b border-[#222] bg-[#0a0a0a] flex justify-between items-center sticky top-0 z-40">
                <h1 className="text-2xl md:text-3xl font-black tracking-tighter bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
                    SPIN YOUR DESTINY
                </h1>
                <div className="flex gap-4 items-center">
                    {user ? (
                        <div className="flex items-center gap-3 mr-2 bg-[#111] border border-[#222] pl-3 pr-1 py-1 rounded-full">
                            <span className="text-xs text-gray-400 max-w-[100px] truncate" title={user.email}>{user.email}</span>
                            <button onClick={handleLogout} className="p-1.5 bg-[#1a1a1a] hover:bg-red-500/20 rounded-full transition-colors text-gray-400 hover:text-red-400" title="Log Out">
                                <LogOut size={14} />
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => setIsAuthOpen(true)} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 rounded-full transition-colors text-indigo-400 hover:text-indigo-300 text-sm font-bold mr-2" title="Log In / Sign Up">
                            <User size={16} />
                            <span>Sign In</span>
                        </button>
                    )}
                    <button onClick={() => setIsRosterOpen(true)} className="p-2 bg-[#1a1a1a] hover:bg-[#2a2a2a] rounded-full transition-colors text-gray-400 hover:text-white" title="Roster">
                        <Users size={20} />
                    </button>
                    <button onClick={() => setIsSettingsOpen(true)} className="p-2 bg-[#1a1a1a] hover:bg-[#2a2a2a] rounded-full transition-colors text-gray-400 hover:text-white" title="Settings">
                        <Settings size={20} />
                    </button>
                </div>
            </header>

            <main className="p-4 md:p-8">
                <AnimatePresence mode="wait">
                    {screen === 'landing' && (
                        <motion.div
                            key="landing"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex flex-col items-center justify-center min-h-[70vh] text-center"
                        >
                            <h2 className="text-5xl md:text-7xl font-black mb-6 drop-shadow-2xl text-white">FORGE YOUR <span className="text-indigo-500">LEGEND</span></h2>
                            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12">
                                Spin the wheel of fate to combine abilities from across universes. Generate unique characters with dynamic stats, synergies, and AI-powered lore.
                            </p>
                            <button
                                onClick={startCreation}
                                className="px-8 py-4 bg-white text-black hover:bg-gray-200 rounded-full font-black text-xl tracking-wider transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.2)]"
                            >
                                BEGIN CREATION
                            </button>
                        </motion.div>
                    )}

                    {screen === 'spinning' && categories[catIndex] && (
                        <motion.div
                            key="spinning"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto"
                        >
                            {/* Left Column: Wheel */}
                            <div className="flex-1 bg-[#111] p-8 rounded-2xl border border-[#333] shadow-2xl flex flex-col items-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-900/10 to-transparent pointer-events-none" />

                                <h3 className="text-3xl font-black mb-2 text-white drop-shadow-md z-10 text-center uppercase tracking-wider">
                                    {categories[catIndex].name}
                                </h3>
                                <p className="text-gray-400 mb-8 z-10 text-center">{catIndex + 1} OF {categories.length}</p>

                                <div className="relative z-10 w-full max-w-[400px]">
                                    {/* Spin Pointer */}
                                    <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />

                                    <Wheel ref={wheelRef} options={categories[catIndex].options} onTick={playTick} />
                                </div>

                                <div className="flex gap-4 mt-8 z-10 w-full max-w-sm">
                                    <button
                                        onClick={handleSpinClick}
                                        disabled={isSpinning}
                                        className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-800 disabled:text-gray-500 rounded-xl font-bold transition-all shadow-lg text-lg uppercase tracking-wider"
                                    >
                                        Spin
                                    </button>
                                    <button
                                        onClick={handleAutoSpin}
                                        disabled={isSpinning}
                                        className="px-6 py-4 bg-[#222] hover:bg-[#333] disabled:bg-[#111] disabled:text-gray-600 border border-[#444] rounded-xl font-bold transition-all text-lg uppercase tracking-wider"
                                    >
                                        Auto
                                    </button>
                                </div>

                                <AnimatePresence>
                                    {currentOutcome && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 50, scale: 0.5 }}
                                            animate={{ opacity: 1, y: 0, scale: 1, x: ['E', 'L', 'M'].includes(currentOutcome.rarity) ? [-10, 10, -10, 10, 0] : 0 }}
                                            transition={{ duration: 0.3 }}
                                            exit={{ opacity: 0, y: -50, scale: 0.5 }}
                                            className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-30"
                                        >
                                            <div 
                                                className="text-center p-8 rounded-2xl border-2 shadow-[0_0_50px_rgba(255,255,255,0.2)]"
                                                style={{ 
                                                    borderColor: RARITY[currentOutcome.rarity]?.color || '#333',
                                                    boxShadow: `0 0 50px ${RARITY[currentOutcome.rarity]?.color || '#ffffff'}40`
                                                }}
                                            >
                                                <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Acquired</div>
                                                <div className="text-5xl font-black text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">
                                                    {currentOutcome.name}
                                                </div>
                                                <div className="mt-2 text-lg font-bold" style={{ color: RARITY[currentOutcome.rarity]?.color || '#888' }}>
                                                    {RARITY[currentOutcome.rarity]?.name || 'Unknown'}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Right Column: Build Log */}
                            <div className="w-full lg:w-96 flex flex-col gap-4">
                                <div className="bg-[#111] p-6 rounded-2xl border border-[#333] shadow-lg flex-1">
                                    <h4 className="text-xl font-bold mb-4 border-b border-[#333] pb-2 text-white">Current Build</h4>
                                    <div className="space-y-3 overflow-y-auto max-h-[60vh] pr-2">
                                        {categories.map((c) => (
                                            <div key={c.id} className={`p-3 rounded-xl border transition-all ${build[c.id] ? 'bg-[#1a1a1a] border-[#444]' : 'bg-[#0a0a0a] border-[#222] opacity-50'}`}>
                                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{c.name}</div>
                                                <div className="text-sm font-bold truncate" style={{ color: build[c.id] ? (RARITY[build[c.id].rarity]?.color || '#fff') : '#555' }}>
                                                    {build[c.id] ? build[c.id].name : '???'}
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
                            />

                            <div className="mt-8 flex justify-center gap-4">
                                <button
                                    onClick={handleSaveCharacter}
                                    disabled={isSaved}
                                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-800 disabled:text-gray-500 rounded-full font-bold transition-all shadow-lg uppercase tracking-widest text-sm"
                                >
                                    {isSaved ? 'Legend Saved' : 'Save Legend'}
                                </button>
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
