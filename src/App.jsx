import React, { useState, useRef, useCallback } from 'react';
import HalftoneBurst from "./components/HalftoneBurst";
import PageLayout from './components/PageLayout';
import Wheel from './components/Wheel';
import RarityLegend from './components/RarityLegend';

import CharacterCard from './components/CharacterCard';
import ParticleGlow from './components/ParticleGlow';
import SettingsModal from './components/SettingsModal';
import RosterModal from './components/RosterModal';
import { initDatabases } from './data/dbInit';
import { devilFruitDB } from './data/categories';
import { calculateSynergies } from './utils/gameLogic';
import { OllamaService } from './utils/OllamaService';
import { RARITY } from './data/rarity';
import { Settings, Users, User, LogOut, ArrowUpRight, Compass, Sparkles, Zap, Layers } from 'lucide-react';
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
    'Ancient Zoan': 'ancient_zoan',
    'Mythical Zoan': 'mythical_zoan'
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
    const [portraitUrl, setPortraitUrl] = useState(null);
    const [isGeneratingPortrait, setIsGeneratingPortrait] = useState(false);

    const [user, setUser] = useState(null);
    const [isAuthOpen, setIsAuthOpen] = useState(false);

    const [isSpinning, setIsSpinning] = useState(false);
    const [currentOutcome, setCurrentOutcome] = useState(null);

    const { playTick, playLock, playEpic, playThud } = useAudio();

    const wheelRef = useRef(null);
    const hoverTextRef = useRef(null);
    const autoSpinRef = useRef(false);
    const buildRef = useRef({});
    const catIndexRef = useRef(0);
    const categoriesRef = useRef([]);

    React.useEffect(() => {
        // SECURITY CLEANUP: Proactively remove any old leaked API keys from returning users' local storage
        localStorage.removeItem('spin_wheel_groq_api_key');

        // Check current session
        const syncUserKey = (session) => {
            const u = session?.user || null;
            setUser(u);
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

    const [isBuildComplete, setIsBuildComplete] = useState(false);

    React.useEffect(() => {
        if (hoverTextRef.current && !isBuildComplete) {
            hoverTextRef.current.innerText = 'Ready for your next trait';
            hoverTextRef.current.style.color = '#74756c';
        }
    }, [catIndex, isBuildComplete]);

    const startCreation = () => {
        const cats = initDatabases();
        setCategories(cats);
        categoriesRef.current = cats;
        setCatIndex(0);
        setCurrentOutcome(null);
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
        setPortraitUrl(null);
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
                    lore: lore,
                    portraitUrl: portraitUrl
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
                
                if (['L', 'M'].includes(outcome.rarity)) {
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
        
        // Stay on the spinning screen, just mark build as complete
        setIsBuildComplete(true);
    };

    const handleGenerateLore = async () => {
        if (!build || Object.keys(build).length === 0) return;
        setScreen('generating');
        setPortraitUrl(null);
        setIsGeneratingPortrait(true);
        
        try {
            const ollama = new OllamaService();
            
            // Build visual prompt description
            const visualTraits = Object.values(build).filter(b => b && b.name !== 'None').map(b => b.name).join(", ");
            const visualPrompt = `A warrior possessing: ${visualTraits}. Tier: ${tier.name}. Power Level: ${overall}.`;

            // Start both generation processes simultaneously
            const lorePromise = ollama.generateBio(build, stats, tier.name, formatBountyStr(bounty, tier));
            const portraitPromise = fetch("/api/generate-portrait", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: visualPrompt })
            }).then(r => r.json()).catch(err => {
                console.error("Portrait error", err);
                return { url: null };
            });

            const [bioData, portraitData] = await Promise.all([lorePromise, portraitPromise]);

            setLore(bioData);
            if (portraitData?.url) {
                setPortraitUrl(portraitData.url);
            }
            setIsGeneratingPortrait(false);

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
            setIsGeneratingPortrait(false);
        }
        
        setScreen('result');
        playEpic();
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
        <PageLayout screen={screen}>
        <div className="min-h-screen text-black font-body">
            <header className="site-header">
                <a className="brand" href="#" aria-label="Summon home" onClick={e => { e.preventDefault(); if (screen === 'landing' || screen === 'result') setScreen('landing'); }}><Compass size={28} strokeWidth={1.6}/><span>SUMMON<span className="brand-dot">.</span></span></a>
                <span className="header-edition">THE CROSSOVER CHARACTER LAB</span>
                <nav className="header-actions" aria-label="Account and collection">
                    <button className="nav-button crew-button" onClick={() => setIsRosterOpen(true)} title="Your crew"><Users size={18}/><span>Your crew</span></button>
                    <button className="nav-button icon-button" onClick={() => setIsSettingsOpen(true)} aria-label="Settings"><Settings size={19}/></button>
                    {user ? <button className="nav-button sign-in" onClick={handleLogout} title={user.email}><LogOut size={16}/><span>Sign out</span></button> : <button className="nav-button sign-in" onClick={() => setIsAuthOpen(true)}><User size={16}/><span>Sign in</span></button>}
                </nav>
            </header>
            <main className="app-main">
                <AnimatePresence mode="wait">
                    {screen === 'landing' && (
                        <motion.div
                            key="landing"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="landing"
                        >
                            <div className="edition-line"><span><span className="status-dot"/> TWO WORLDS. INFINITE POSSIBILITIES.</span><span>VOL. 01 / CHARACTER LAB</span></div>
                            <section className="hero-grid">
                                <div className="hero-copy">
                                    <div className="universe-label"><span>ONE PIECE</span><span className="cross">×</span><span>NARUTO</span></div>
                                    <h2>One spin.<br/>A new <span>legend.</span></h2>
                                    <p>A pirate’s ambition. A shinobi’s power. Spin the wheel to create a character that belongs to both worlds—and only to you.</p>
                                    <button onClick={startCreation} className="primary-action">Forge your legend <ArrowUpRight size={22}/></button>
                                    <div className="hero-note"><span/> No sign-up needed. Just a little fate.</div>
                                </div>
                                <div className="hero-art" aria-hidden="true">
                                    <span className="art-coordinate">FIG. 001 — THE DESTINY ENGINE</span>
                                    <div className="orbit orbit-one"/><div className="orbit orbit-two"/>
                                    <div className="destiny-wheel"><div className="wheel-inner-ring"/><div className="wheel-spoke spoke-one"/><div className="wheel-spoke spoke-two"/><div className="wheel-spoke spoke-three"/><div className="wheel-spoke spoke-four"/><span className="wheel-word word-one">DEVIL FRUIT</span><span className="wheel-word word-two">BLOODLINE</span><span className="wheel-word word-three">HAKI</span><span className="wheel-word word-four">CHAKRA</span><div className="wheel-core"><Compass strokeWidth={1}/></div></div>
                                    <div className="art-pointer"/>
                                    <div className="floating-tag tag-top"><Zap size={17}/><span>BOUNDLESS POTENTIAL</span></div>
                                    <div className="floating-tag tag-bottom"><Sparkles size={20}/><div><small>YOUR NEXT PULL?</small><strong>Something legendary.</strong></div></div>
                                    <span className="art-star">✳</span><span className="art-caption">LET FATE TAKE THE WHEEL ↗</span>
                                </div>
                            </section>
                            <div className="world-strip"><span>GRAND LINE MEETS HIDDEN LEAF</span><span>DEVIL FRUITS <i>✳</i> DŌJUTSU <i>✳</i> HAKI <i>✳</i> CHAKRA</span></div>
                            <section className="how-section" aria-labelledby="how-heading"><div className="section-heading"><span className="eyebrow">A LEGEND IN THE MAKING</span><h3 id="how-heading">Leave your origin to chance.</h3></div><div className="step-grid">
                                <article><span className="step-number">01</span><Compass/><h4>Spin your fate</h4><p>Discover your origin, abilities, and fighting style, one spin at a time.</p></article>
                                <article><span className="step-number">02</span><Layers/><h4>Find your synergy</h4><p>Unexpected combinations unlock a power that’s entirely your own.</p></article>
                                <article><span className="step-number">03</span><Sparkles/><h4>Meet your legend</h4><p>Reveal your stats and story. Save your character and build your crew.</p></article>
                            </div></section>
                            <footer className="site-footer"><span>SUMMON. <span>A FAN-MADE CROSSOVER EXPERIENCE</span></span><span>MADE FOR THE WHAT-IFS.</span></footer>
                        </motion.div>
                    )}

                    {screen === 'spinning' && categories[catIndex] && (
                        <motion.div
                            key="spinning"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="draft-layout"
                        >
                            {/* Left Column: Wheel */}
                            <div className="spin-panel">
                                <div className="draft-eyebrow"><span>THE DESTINY ENGINE</span><span>{isBuildComplete ? "COMPLETE" : "DRAFT IN PROGRESS"}</span></div>
                                <h3 className="text-3xl md:text-5xl font-display mb-2 text-black text-center uppercase tracking-wider">
                                    {categories[catIndex].name}
                                </h3>
                                <p className="spin-step">{isBuildComplete ? "Your build is ready. Bring your legend to life." : `TRAIT ${catIndex + 1} OF ${categories.length}`}</p><div className="draft-progress" role="progressbar" aria-label="Character draft progress" aria-valuenow={Object.keys(build).length} aria-valuemin={0} aria-valuemax={categories.length}><span style={{ width: `${Object.keys(build).length / categories.length * 100}%` }}/></div>

                                <div className="relative z-10 w-full max-w-[400px]">
                                    {/* Spin Pointer */}
                                    <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-black" />

                                    <Wheel 
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
                                        className="text-xl md:text-3xl font-display uppercase tracking-widest text-center transition-colors duration-75"
                                    >
                                        ...
                                    </h4>
                                </div>

                                {!isBuildComplete && (
                                    <div className="flex gap-4 mt-8 z-10 w-full max-w-sm">
                                        <button
                                            onClick={handleSpinClick}
                                            disabled={isSpinning}
                                            className="flex-1 py-4 bg-black text-white border-4 border-black disabled:bg-gray-300 disabled:border-gray-400 disabled:text-gray-500 font-display text-2xl uppercase tracking-widest shadow-brutal hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none disabled:shadow-none disabled:transform-none transition-all duration-75 focus:outline-none"
                                        >
                                            SPIN
                                        </button>
                                        <button
                                            onClick={handleAutoSpin}
                                            disabled={isSpinning}
                                            className="px-6 py-4 bg-white text-black border-4 border-black disabled:bg-gray-200 disabled:border-gray-300 disabled:text-gray-400 font-display text-xl uppercase tracking-widest shadow-brutal hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none disabled:shadow-none disabled:transform-none transition-all duration-75 focus:outline-none"
                                        >
                                            AUTO
                                        </button>
                                    </div>
                                )}

                                {isBuildComplete && (
                                    <div className="flex flex-col gap-4 mt-8 z-10 w-full max-w-sm">
                                        <button
                                            onClick={handleGenerateLore}
                                            className="w-full py-4 bg-red-600 text-white border-4 border-black font-display text-xl uppercase tracking-widest shadow-brutal hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all duration-75 focus:outline-none"
                                        >
                                            GENERATE LORE & VIEW
                                        </button>
                                    </div>
                                )}

                                <AnimatePresence>
                                    {currentOutcome && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 50, scale: 0.5 }}
                                            animate={{ opacity: 1, y: 0, scale: 1, x: ['Legend', 'Mythic'].includes(currentOutcome.rarity) ? [-10, 10, -10, 10, 0] : 0 }}
                                            transition={{ duration: 0.3 }}
                                            exit={{ opacity: 0, y: -50, scale: 0.5 }}
                                            className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-30 overflow-hidden"
                                        >
                                            {/* Exploding halftone burst during intermediate spin reveals too! */}
                                            {['Legend', 'Mythic'].includes(currentOutcome.rarity) && (
                                                <HalftoneBurst color={RARITY[currentOutcome.rarity]?.color} />
                                            )}
                                             <div 
                                                className="text-center p-12 bg-white rounded-sm border-4 shadow-brutal max-w-lg w-full mx-4 relative overflow-hidden"
                                                style={{ 
                                                    borderColor: RARITY[currentOutcome.rarity]?.color || '#111',
                                                }}
                                            >
                                                <div className="text-lg font-bold text-gray-500 uppercase tracking-widest mb-2 font-display">Acquired</div>
                                                <div className="text-6xl font-display text-black uppercase">
                                                    {currentOutcome.name}
                                                </div>
                                                <div className="mt-4 text-2xl font-display uppercase tracking-widest" style={{ color: RARITY[currentOutcome.rarity]?.color || '#111' }}>
                                                    {RARITY[currentOutcome.rarity]?.name || 'Unknown'}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Right Column: Build Log */}
                            <div className="draft-sidebar">
                                <div className="draft-log">
                                    <h4 className="text-2xl font-display mb-4 border-b-4 border-black pb-2 text-black uppercase tracking-widest">Your character <span className="draft-count">{Object.keys(build).length}/{categories.length}</span></h4>
                                    <div className="trait-list">
                                        {categories.map((c) => (
                                            <div key={c.id} className={`p-4 border-2 transition-none ${build[c.id] ? 'bg-white border-black shadow-brutal-sm' : 'bg-gray-100 border-dashed border-gray-400'}`}>
                                                <div className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1 font-display">{c.name}</div>
                                                <div className="text-lg font-bold truncate uppercase" style={{ color: build[c.id] ? (RARITY[build[c.id].rarity]?.color || '#111') : '#9ca3af' }}>
                                                    {build[c.id] ? build[c.id].name : 'Undiscovered'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <RarityLegend />
                            </div>
                        </motion.div>
                    )}

                    {screen === 'generating' && (
                        <motion.div
                            key="generating"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="w-full max-w-7xl mx-auto flex flex-col items-center justify-center py-32 bg-white/90 backdrop-blur-sm border-4 border-black rounded-sm shadow-brutal"
                        >
                            <div className="relative w-48 h-48 mb-12">
                                <div className="absolute inset-0 border-8 border-gray-100 rounded-full"></div>
                                <div className="absolute inset-0 border-8 border-black rounded-full border-t-transparent animate-spin" style={{ animationDuration: '1s' }}></div>
                                <div className="absolute inset-4 border-8 border-rose-500/20 rounded-full border-b-transparent animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-16 h-16 bg-black rounded-full animate-ping"></div>
                                </div>
                            </div>
                            
                            <h2 className="text-5xl md:text-7xl font-display uppercase tracking-widest text-black mb-6 text-center animate-pulse">
                                Forging Destiny
                            </h2>
                            <p className="text-xl text-gray-500 font-body text-center max-w-lg">
                                The energies of the world are converging. Awakening your unique vessel, abilities, and legendary lore...
                            </p>
                        </motion.div>
                    )}

                    {screen === 'result' && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full relative"
                        >
                            <ParticleGlow tier={tier} />
                            {/* Render halftone burst for high-rarity (Epic, Legend, Mythic) */}
                            {currentOutcome && ['Legend', 'Mythic'].includes(currentOutcome.rarity) && (
                                <HalftoneBurst color={RARITY[currentOutcome.rarity]?.color} />
                            )}
                            <div className="relative z-10">
                                <CharacterCard
                                    build={build}
                                    stats={stats}
                                    overall={overall}
                                    bounty={bounty}
                                    tier={tier}
                                    lore={lore}
                                    synergies={synergies}
                                    portraitUrl={portraitUrl}
                                    isGeneratingPortrait={isGeneratingPortrait}
                                />
                            </div>

                            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                                <button
                                    onClick={handleSaveCharacter}
                                    disabled={isSaved}
                                    className="w-full sm:w-auto px-8 py-4 bg-black text-white border-4 border-black disabled:bg-gray-300 disabled:text-gray-500 font-display uppercase tracking-widest text-xl shadow-brutal hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none disabled:shadow-none disabled:transform-none transition-all duration-75 focus:outline-none"
                                >
                                    {isSaved ? 'SAVED' : 'SAVE TO CREW'}
                                </button>
                                <button
                                    onClick={startCreation}
                                    className="w-full sm:w-auto px-8 py-4 bg-white text-black border-4 border-black font-display uppercase tracking-widest text-xl shadow-brutal hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all duration-75 focus:outline-none"
                                >
                                    DRAFT ANOTHER
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
                            className="mb-8 px-10 py-4 bg-white text-black border-4 border-black font-display uppercase tracking-widest text-xl shadow-brutal hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all duration-75 focus:outline-none relative z-10"
                        >
                            RETURN
                        </button>
                        <div className="relative w-full">
                            <ParticleGlow tier={viewingSavedCharacter.tier} />
                            <div className="relative z-10">
                                <CharacterCard
                                    build={viewingSavedCharacter.build}
                                    stats={viewingSavedCharacter.stats}
                                    overall={viewingSavedCharacter.overall}
                                    bounty={viewingSavedCharacter.bounty}
                                    tier={viewingSavedCharacter.tier}
                                    lore={viewingSavedCharacter.lore}
                                    synergies={viewingSavedCharacter.synergies || []}
                                    portraitUrl={viewingSavedCharacter.portraitUrl}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </PageLayout>
    );
}

export default App;
