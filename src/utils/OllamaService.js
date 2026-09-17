import { CHARACTER_LORE } from '../data/characters';

export class OllamaService {
    constructor() {
    }

    setApiKey(key) {
        // No-op since we moved to server-side AI
    }

    async generateContent(prompt, systemPrompt) {
        try {
            const response = await fetch('/api/generate-lore', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt, systemInstruction: systemPrompt })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`AI API failed (${response.status}): ${errText}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("AI fetch error:", error);
            throw error;
        }
    }

    async generateSynergies(build) {
        const buildSummary = this._getBuildSummary(build);
        const haxBreakdown = this._getHaxBreakdown(build);
        const vesselLore = this._getVesselLoreDirective(build);
        const prompt = `CHARACTER:
${buildSummary}
${haxBreakdown ? `HAX: ${haxBreakdown}` : ''}
${vesselLore ? `\nVESSEL LORE (STRICT OVERRIDE):\n${vesselLore}` : ''}

TASK: Invent 1 unique synergy (under 3 sentences) merging their Devil Fruit, Haki, Dōjutsu, Ninjutsu, or Vessel.

SCHEMA:
{
  "name": "⚡ SYNERGY NAME",
  "desc": "How their abilities merge",
  "bonuses": { "str":0, "spd":0, "dur":0, "iq":0, "haki":0, "pwr":0, "hax":0 }
}`;
        return await this.generateContent(prompt, "Role: Master of anime lore. Create 1 balanced, creative power synergy in pure JSON.");
    }

    async generateBio(build) {
        const buildSummary = this._getBuildSummary(build);
        const haxBreakdown = this._getHaxBreakdown(build);
        
        let stats = { str: 0, spd: 0, dur: 0, iq: 0, haki: 0, pwr: 0, hax: 0 };
        const getVal = (catId) => build[catId] ? (build[catId].val || 50) : 50;
        ['str', 'spd', 'dur', 'iq', 'haki'].forEach(s => { stats[s] += getVal(s); });
        stats.pwr = (getVal('jutsu_nin') + getVal('jutsu_gen') + getVal('jutsu_sen')) / 3 + Math.max(getVal('df'), getVal('dojutsu'), getVal('jutsu_kg'), getVal('jutsu_kt'));
        stats.hax = 0;
        for (const key in build) {
            const item = build[key];
            if (!item || item.name === 'None') continue;
            if (item.tag && item.tag.includes('hax')) stats.hax += (item.val * 0.15);
        }

        const pronouns = build.vessel?.gender === 'F' ? 'she/her' : 'he/him';
        const randomAdj = ['Crimson', 'Shadow', 'Silent', 'Azure', 'Hollow', 'Iron', 'Phantom'][Math.floor(Math.random() * 7)];
        const randomNoun = ['Emperor', 'Wraith', 'Dragon', 'Fang', 'Sage', 'Demon', 'Saint'][Math.floor(Math.random() * 7)];
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const randomLetter = letters.charAt(Math.floor(Math.random() * letters.length));

        const vesselLore = this._getVesselLoreDirective(build);

        const prompt = `CHARACTER:
${buildSummary}
${haxBreakdown ? `HAX: ${haxBreakdown}` : ''}
APEX: ${this._getHighestStats(stats)}
VULNERABLE: ${this._getLowestStats(stats)}
${vesselLore ? `\nVESSEL LORE (STRICT OVERRIDE):\n${vesselLore}` : ''}

MANDATES:
1. NAME/EPITHET: Authentic name (start with ${randomLetter}). Unique epic epithet (no generic titles).
2. COMBAT LORE: Describe how they exploit Apex stats/hax and compensate for Vulnerable stats.
3. FACTION: Embed their faction (${build.faction?.name || 'Unaffiliated'}) creed/goals.
4. BIO (3-4 sentences): 
   - S1: Origin, lineage/vessel, faction.
   - S2: Awakening of fused powers. (If Zoan: describe visual transformation).
   - S3: Combat doctrine/hax exploitation.
   - S4: Reputation (Marines, Kage, etc).
5. SYNERGY: 1 synergy blending powers. If Weapon mismatches Style (e.g. Sniper & Brawler), embrace irony (e.g. use rifle as club).
6. ABILITIES: 2-3 signature moves. If Zoan: 1 Hybrid, 1 Full-Beast move with visual descriptions.

JSON SCHEMA:
{
  "name": "Name",
  "epithet": "Epithet",
  "bio": "Backstory (${pronouns})",
  "custom_synergy": { "name": "", "desc": "", "bonuses": {"str":0,"spd":0,"dur":0,"iq":0,"haki":0,"pwr":0,"hax":0} },
  "signature_abilities": [ { "name": "", "desc": "" } ]
}`;
        return await this.generateContent(prompt, `Role: Lorekeeper for a One Piece x Naruto crossover.
RULES:
1. VISUALS: If Vessel is canon (Zoro=swords, Luffy=straw hat, Naruto=whiskers), include their visual identity.
2. TONE: Cinematic, awe-inspiring, epic.
3. OUTPUT: ONLY valid JSON matching schema. No markdown wrappers.`);
    }

    _getBuildSummary(build) {
        let items = [];
        const vesselGender = build.vessel?.gender === 'F' ? 'female' : 'male';
        
        if (build.race) items.push(`Race: ${build.race.name}`);
        if (build.origin) items.push(`Origin / Birthplace: ${build.origin.name}`);
        if (build.faction) items.push(`Faction / Allegiance: ${build.faction.name}`);
        if (build.vessel && build.vessel.name !== 'None') {
            items.push(`Physical Vessel (Genetic Host): ${build.vessel.name} (Gender: ${vesselGender})`);
        }
        if (build.trait && build.trait.name !== 'None' && build.trait.name !== 'Normal Body') {
            items.push(`Special Trait / Lineage: ${build.trait.name}`);
        }
        if (build.jinchuriki_beast && build.jinchuriki_beast.name !== 'None') {
            items.push(`Tailed Beast Bond: ${build.jinchuriki_beast.name}`);
        }
        
        // Physical & Combat Mastery Tiers
        if (build.str) items.push(`Strength Tier: ${build.str.name} (Benchmarked: ${build.str.val}/100)`);
        if (build.spd) items.push(`Speed Tier: ${build.spd.name} (Benchmarked: ${build.spd.val}/100)`);
        if (build.dur) items.push(`Durability Tier: ${build.dur.name} (Benchmarked: ${build.dur.val}/100)`);
        if (build.combat) items.push(`Combat Mastery: ${build.combat.name} (Benchmarked: ${build.combat.val}/100)`);
        if (build.iq && build.iq.name !== 'None') items.push(`Battle IQ Benchmark: ${build.iq.name}`);
        if (build.chakra_cap) items.push(`Chakra Reserves: ${build.chakra_cap.name}`);

        // Powers & Hax
        if (build.df_type && build.df_type.name !== 'None') {
            items.push(`Devil Fruit Class: ${build.df_type.name}`);
        }
        if (build.df && build.df.name !== 'None') {
            items.push(`Devil Fruit: ${build.df.name}` + (build.df.tag ? ` (Power Core: ${build.df.tag})` : ''));
        }
        if (build.dojutsu && build.dojutsu.name !== 'None') {
            items.push(`Dōjutsu Ocular Power: ${build.dojutsu.name}` + (build.dojutsu.tag ? ` (Hax: ${build.dojutsu.tag})` : ''));
        }
        
        // Jutsu Suite
        if (build.jutsu_nin && build.jutsu_nin.name !== 'None') items.push(`Ninjutsu Benchmark: ${build.jutsu_nin.name}`);
        if (build.jutsu_tai && build.jutsu_tai.name !== 'None') items.push(`Taijutsu Benchmark: ${build.jutsu_tai.name}`);
        if (build.jutsu_gen && build.jutsu_gen.name !== 'None') items.push(`Genjutsu Benchmark: ${build.jutsu_gen.name}`);
        if (build.jutsu_kg && build.jutsu_kg.name !== 'None') items.push(`Kekkei Genkai: ${build.jutsu_kg.name}`);
        if (build.jutsu_kt && build.jutsu_kt.name !== 'None') items.push(`Kekkei Tōta: ${build.jutsu_kt.name}`);
        if (build.jutsu_sen && build.jutsu_sen.name !== 'None') items.push(`Senjutsu / Sage Arts: ${build.jutsu_sen.name}`);

        // Haki Suite
        if (build.haki_obs && build.haki_obs.name !== 'None') items.push(`Observation Haki: ${build.haki_obs.name}`);
        if (build.haki_arm && build.haki_arm.name !== 'None') items.push(`Armament Haki: ${build.haki_arm.name}`);
        if (build.haki_conq && build.haki_conq.name !== 'None') items.push(`Conqueror's Haki: ${build.haki_conq.name}`);

        // Armament & Style
        if (build.weapon && build.weapon.name !== 'None') items.push(`Armament / Weapon: ${build.weapon.name}`);
        if (build.style && build.style.name !== 'None') items.push(`Fighting Style: ${build.style.name}`);
        if (build.summon && build.summon.name !== 'None') items.push(`Summoning Contract: ${build.summon.name}`);
        if (build.potential && build.potential.name !== 'None') items.push(`Growth Potential: ${build.potential.name}`);

        return items.join('\n');
    }

    _getVesselLoreDirective(build) {
        if (!build.vessel || build.vessel.name === 'None') return null;
        const lore = CHARACTER_LORE[build.vessel.name];
        if (!lore) return null;

        return `You MUST adhere to the following canonical traits of this vessel, which override random generation:
- OVERRIDES: ${lore.overrides}
- APPEARANCE: ${lore.appearance}
- PERSONALITY: ${lore.personality}
- ABILITIES: ${lore.abilities}
- HAX: ${lore.hax}`;
    }

    _getHaxBreakdown(build) {
        const haxItems = [];
        for (const key in build) {
            const item = build[key];
            if (!item || item.name === 'None') continue;
            if (item.tag === 'hax' || item.val >= 100) {
                haxItems.push(`${item.name} (${key.toUpperCase()})`);
            }
        }
        return haxItems.length > 0 ? haxItems.join(', ') : null;
    }

    _getHighestStats(stats) {
        const entries = Object.entries(stats);
        entries.sort((a, b) => b[1] - a[1]);
        return entries.slice(0, 3).map(e => `${e[0].toUpperCase()} (${Math.round(e[1])})`).join(', ');
    }

    _getLowestStats(stats) {
        const entries = Object.entries(stats);
        entries.sort((a, b) => a[1] - b[1]);
        return entries.slice(0, 2).map(e => `${e[0].toUpperCase()} (${Math.round(e[1])})`).join(', ');
    }
}
