import { CHARACTER_LORE } from '../data/characters';
import { CROSSVERSE_LORE_RULES, getCanonicalLoreBrief } from '../data/loreCodex';

const CREATIVE_MOTIFS = [
    'a funeral bell carried across a storm sea',
    'a shrine lantern reflected in black water',
    'an eclipse splitting a battlefield in two',
    'a storm-serpent coiled around a ruined gate',
    'a red moon over a shattered fortress',
    'a tide of paper talismans through a burning port',
    'a broken crown buried beneath sakura petals',
    'a thunderclap inside an abandoned temple',
    'an iron comet crossing a winter sky',
    'a dragon shadow moving beneath ocean waves'
];

// A new service instance is created for each character, so this module-level
// history is deliberately shared for the active browser session.
const RECENT_EPITHETS = [];
const normalizeEpithet = (epithet) => String(epithet || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const rememberEpithet = (epithet) => {
    const normalized = normalizeEpithet(epithet);
    if (!normalized || RECENT_EPITHETS.includes(normalized)) return;
    RECENT_EPITHETS.push(normalized);
    if (RECENT_EPITHETS.length > 30) RECENT_EPITHETS.shift();
};

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
        const canonicalLore = getCanonicalLoreBrief(build);
        const prompt = `CHARACTER:
${buildSummary}
${haxBreakdown ? `HAX: ${haxBreakdown}` : ''}
${vesselLore ? `\nVESSEL IDENTITY:\n${vesselLore}` : ''}
\n${canonicalLore}

TASK: Invent 1 unique, tactical synergy (under 3 sentences). It must fuse at least two selected sources, state the trigger or sequence, and name one meaningful limitation/counterplay. Do not use a power not present in the build.

SCHEMA:
{
  "name": "⚡ SYNERGY NAME",
  "desc": "How their abilities merge",
  "bonuses": { "str":0, "spd":0, "dur":0, "iq":0, "haki":0, "pwr":0, "hax":0 }
}`;
        return await this.generateContent(prompt, `${CROSSVERSE_LORE_RULES}\n\nRole: Canon-first One Piece x Naruto combat designer. Create 1 balanced, creative power synergy in pure JSON.`);
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

        const pronouns = build.vessel?.gender === 'F' ? 'she/her' : 'they/them';
        const vesselLore = this._getVesselLoreDirective(build);
        const canonicalLore = getCanonicalLoreBrief(build);
        const creativeMotif = CREATIVE_MOTIFS[Math.floor(Math.random() * CREATIVE_MOTIFS.length)];
        const recentEpithetBlock = RECENT_EPITHETS.length
            ? `\nRECENT EPITHETS — do not repeat or closely paraphrase these: ${RECENT_EPITHETS.join(' | ')}`
            : '';

        const prompt = `CHARACTER:
${buildSummary}
${haxBreakdown ? `HAX: ${haxBreakdown}` : ''}
APEX: ${this._getHighestStats(stats)}
VULNERABLE: ${this._getLowestStats(stats)}
${vesselLore ? `\nVESSEL IDENTITY:\n${vesselLore}` : ''}
\n${canonicalLore}
\nCREATIVE IMAGE SEED (use as subtle imagery only; do not name it unless it fits): ${creativeMotif}
${recentEpithetBlock}

OUTPUT CONTRACT:
1. NAME: Create a new, pronounceable 1–2 word name. Never reuse a canon vessel's full name and never force an arbitrary starting letter.
2. EPITHET: Create a fresh 3–7 word epithet whose imagery comes from this exact build’s mechanics, origin, faction, or combat doctrine. It must be memorable even without the character name. Do NOT use generic template titles such as "The Shadow", "The Crimson", "The Silent", "The Azure", "Emperor", "Wraith", "Dragon", "Fang", "Sage", "Demon", "Saint", "God", "Destroyer", or "of Destiny".
3. BIO: Write exactly 4 cinematic sentences about ${pronouns}.
   - Sentence 1: origin, selected lineage/vessel, and faction (${build.faction?.name || 'Unaffiliated'}).
   - Sentence 2: the moment the selected powers fused; describe a Zoan hybrid/full-beast visual if one was selected.
   - Sentence 3: a concrete combat doctrine that exploits APEX and protects VULNERABLE through selected tools.
   - Sentence 4: reputation and the specific fear, promise, or rumor attached to this character.
4. CUSTOM SYNERGY: Fuse at least two selected sources in a causal sequence—not a list. State a setup/trigger, payoff, and one real limit, cost, or counterplay. If weapon and style clash, turn the clash into a deliberate tactic.
5. SIGNATURE ABILITIES: Return exactly 3 distinct original moves: (a) pressure/setup, (b) mobility, defense, or control, (c) finisher. Every description must name the selected source mechanics it uses, explain the tactical effect, and avoid granting an unselected canon technique. If a Zoan is selected, include one hybrid or full-beast move among the three. If a hax is selected, at most one move may hinge on it and its condition must be explicit.
6. Keep the character powerful at the rolled tier, but do not treat an unselected power, a vague bloodline, or a high stat as permission for omnipotence.

JSON SCHEMA:
{
  "name": "Name",
  "epithet": "Epithet",
  "bio": "Backstory (${pronouns})",
  "custom_synergy": { "name": "", "desc": "", "bonuses": {"str":0,"spd":0,"dur":0,"iq":0,"haki":0,"pwr":0,"hax":0} },
  "signature_abilities": [ { "name": "", "desc": "" } ]
}`;
        const systemPrompt = `Role: You are the canon-first lorekeeper and combat choreographer for a One Piece x Naruto crossover.
${CROSSVERSE_LORE_RULES}

QUALITY BAR:
- Silently audit every claim against the selected canon capsules before writing. When a vessel note and a selected power conflict, keep the vessel's visual/personality identity but only use a combat mechanic if it is selected or explicitly present in the vessel note.
- A good fusion has an action chain: source A creates an opening, source B converts it, and a condition keeps it fair. Do not merely rename two powers placed side by side.
- Give every ability a different job and sensory identity. Avoid filler such as "unleashes immense energy", "ultimate attack", "reality-breaking", or "unmatched power" unless the selected mechanic explains exactly how it works.
- Preserve canon uncertainty. Label an unconfirmed vessel detail as a rumor instead of a fact, and never invent an exact Mangekyō ability, Devil Fruit awakening, or shinjutsu from a name alone.
- Tone: cinematic, vivid, and consequential; mechanics: precise and readable.
- OUTPUT: ONLY valid JSON matching the schema. No markdown wrappers or extra keys.`;

        let result = await this.generateContent(prompt, systemPrompt);
        if (RECENT_EPITHETS.includes(normalizeEpithet(result?.epithet))) {
            result = await this.generateContent(`${prompt}\n\nREVISION REQUIRED: The epithet returned a recent collision. Keep every other field fresh, but replace it with a materially different epithet rooted in this build's exact mechanics.`, systemPrompt);
        }
        rememberEpithet(result?.epithet);
        return result;
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

        return `Use this as the vessel's canonical identity, not as a replacement for the rolled build:
- LEGACY IDENTITY: ${lore.overrides}
- APPEARANCE: ${lore.appearance}
- PERSONALITY: ${lore.personality}
- ABILITIES: ${lore.abilities}
- HAX: ${lore.hax}

RECONCILIATION: Preserve the vessel's visual identity, personality, and physical heritage. The explicit CHARACTER rolls are the active current loadout: never replace a rolled Devil Fruit, weapon, faction, eye, or technique with the vessel's native one. If a native vessel power conflicts with a roll, frame it as legacy/history or fuse it only when the mechanics are compatible.`;
    }

    _getHaxBreakdown(build) {
        const haxItems = [];
        for (const key in build) {
            const item = build[key];
            if (!item || item.name === 'None') continue;
            if (item.tag?.split(/\s+/).includes('hax') || item.val >= 100) {
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
