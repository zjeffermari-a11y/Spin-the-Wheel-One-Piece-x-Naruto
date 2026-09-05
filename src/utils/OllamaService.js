const FALLBACK_MODELS = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3.6-27b', 'qwen/qwen3.8-27b'];

export const MASTER_LORE_SYSTEM_PROMPT = `
You are the Grand Sage and Supreme Lorekeeper of a legendary anime crossover universe that seamlessly fuses the worlds of One Piece, Naruto, and Boruto into one unified reality.
You possess encyclopedic mastery of anime worldbuilding, power scaling, battle physics, hax hierarchies, martial arts, and narrative craft.

=======================================================
1. CANON CHARACTER VESSEL UPDATES (CRITICAL VISUALS)
=======================================================
- If the Physical Vessel is "Joyboy": He is an Ancient Giant from the Void Century. Visually, he is a massive fusion of Whitebeard (Edward Newgate) and Garp (Monkey D. Garp).
- If the Physical Vessel is "Imu": DO NOT describe him as a hidden or faceless silhouette. Base appearance: MALE, tanned skin, long white hair, Lunarian-like features, ringed eyes, wearing a black cloak with the "Depths Covenant" symbol. He is Saint Nerona Imu, one of the 20 founders. Note that his Devil's Fruit allows escalating monstrous transformations (giant size, horns, black wings, a tail, blackened arms).

=======================================================
6. NARRATIVE STYLE & GOLD STANDARD
=======================================================
- Write with gravitas, depth, and vivid cinematic anime intensity.
- Avoid generic tropes like "The Dark Shadow" or "Master of Shadows". Invent striking, poetic epithets fitting Eiichiro Oda or Masashi Kishimoto's creative style.
- Give them a unique, culturally fitting name matching their Origin.
- Strictly adhere to the Physical Vessel's biological gender pronouns throughout the entire biography.
`;

export class OllamaService {
    constructor() {
        this.model = 'openai/gpt-oss-120b';
        this.apiKey = (import.meta.env.VITE_GROQ_API_KEY || localStorage.getItem('spin_wheel_groq_api_key') || '').trim();
        this.bestModelPromise = this.fetchBestAvailableModel();
    }

    async fetchBestAvailableModel() {
        if (!this.apiKey) return;
        try {
            const response = await fetch('https://api.groq.com/openai/v1/models', {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                const models = data.data.map(m => m.id);
                
                const validModels = models.filter(m => 
                    !m.includes('whisper') && 
                    !m.includes('guard') && 
                    !m.includes('tool-use')
                );

                const priority = ['120b', '70b', '27b', '20b', '8b'];
                let selected = null;

                for (const p of priority) {
                    selected = validModels.find(m => m.includes(p));
                    if (selected) break;
                }
                
                if (selected) {
                    this.model = selected;
                } else if (validModels.length > 0) {
                    this.model = validModels[0];
                }
                
                console.log('Dynamically selected Groq model:', this.model);
            }
        } catch (error) {
            console.error('Failed to fetch Groq models, using fallback:', error);
        }
    }

    setApiKey(key) {
        const cleanKey = (key || '').trim();
        this.apiKey = cleanKey;
        localStorage.setItem('spin_wheel_groq_api_key', cleanKey);
        this.bestModelPromise = this.fetchBestAvailableModel();
    }

    async generateContent(prompt, systemPrompt = MASTER_LORE_SYSTEM_PROMPT) {
        await this.bestModelPromise;

        if (!this.apiKey) {
            console.error("No Groq API Key found.");
            return null;
        }

        const modelsToTry = [
            this.model,
            ...FALLBACK_MODELS.filter(m => m !== this.model)
        ];

        for (const candidateModel of modelsToTry) {
            const messages = [];
            if (systemPrompt) {
                messages.push({ role: "system", content: systemPrompt });
            }
            messages.push({ role: "user", content: prompt });

            const payload = {
                model: candidateModel,
                messages: messages,
                temperature: 0.7,
                response_format: { type: "json_object" }
            };

            try {
                const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${this.apiKey}`
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    const errText = await response.text();
                    console.warn(`Groq model ${candidateModel} failed (${response.status}): ${errText}. Retrying next model...`);
                    continue;
                }

                const data = await response.json();
                const textContent = data.choices[0].message.content;
                this.model = candidateModel;
                return JSON.parse(textContent);
            } catch (error) {
                console.warn(`Groq request error on model ${candidateModel}:`, error);
            }
        }

        console.error("All Groq models failed to generate content.");
        return null;
    }

    async generateSynergies(build) {
        const buildSummary = this._getBuildSummary(build);
        const haxBreakdown = this._getHaxBreakdown(build);
        const prompt = `
Analyze this comprehensive anime crossover character build and invent 1 brilliant, highly unique synergy that emerges from the fusion of their distinct powers.

CHARACTER SPECIFICATIONS:
${buildSummary}
${haxBreakdown ? `HAX PROFILE: ${haxBreakdown}` : ''}

GUIDELINES:
1. Examine how their Devil Fruit, Haki, Dōjutsu, Ninjutsu, Physical Vessel, or Fighting Style uniquely coalesce.
2. The synergy must feel natural to anime combat science (e.g. infusing Haoshoku into a Sage Technique, utilizing Doa Doa doors to bypass spatial jutsu, using Rokushiki Soru to amplify Lightning release).
3. Provide realistic, balanced stat bonuses between 0 and 15 that correspond strictly to the nature of this power combination.

Return ONLY a valid JSON object matching this schema, with no markdown formatting:
{
    "synergy_name": "Name of the synergy (e.g. '⚡ SAGE OF THE CRACKING VOID', '🥋 DARK JUSTICE: SIX PATHS BLUDGEON')",
    "synergy_desc": "A 1-2 sentence description explaining the combat science of how their abilities combine.",
    "bonuses": { "str": 0, "spd": 0, "dur": 0, "iq": 0, "haki": 0, "pwr": 0, "hax": 0 }
}
`;
        return await this.generateContent(prompt, MASTER_LORE_SYSTEM_PROMPT);
    }

    async generateBio(build, stats, tier, bounty) {
        const buildSummary = this._getBuildSummary(build);
        const haxBreakdown = this._getHaxBreakdown(build);
        const randomLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        const vesselGenderForPrompt = buildSummary.includes('Gender: female') ? 'FEMALE' : 'MALE';
        const pronouns = vesselGenderForPrompt === 'FEMALE' ? 'she/her/hers' : 'he/him/his';
        const forbiddenPronouns = vesselGenderForPrompt === 'FEMALE' ? 'he/him/his' : 'she/her/hers';

        const epithetAdjectives = ['Bloodstained', 'Silent', 'Heavenly', 'Abyssal', 'Phantom', 'Iron', 'Crimson', 'Azure', 'Sovereign', 'Void', 'Divine', 'Fallen', 'Eternal', 'Calamity', 'Radiant', 'Twilight'];
        const epithetNouns = ['Emperor', 'Ghost', 'Asura', 'Dragon', 'Inquisitor', 'Saint', 'Demon', 'Prophet', 'Shatterer', 'Monarch', 'Wraith', 'Seraph', 'Reaper', 'Vanguard', 'Tempest', 'Warlord'];
        const randomAdj = epithetAdjectives[Math.floor(Math.random() * epithetAdjectives.length)];
        const randomNoun = epithetNouns[Math.floor(Math.random() * epithetNouns.length)];

        const prompt = `
Create a wise, precise, and legendary anime biography and an AI-crafted custom synergy for this generated character.

=======================================================
⚠️ CRITICAL PRONOUN & ZOAN MANDATE:
- Character Biological Gender: ${vesselGenderForPrompt}. You MUST use ONLY ${pronouns} throughout the ENTIRE backstory. NEVER use gender-neutral (they/them) pronouns or ${forbiddenPronouns}.
- IF their Devil Fruit Class is Zoan, Ancient Zoan, or Mythical Zoan: You MUST explicitly describe their physical beast appearances/transformations when referencing their "Hybrid Form" and "Full-Zoan Form" in their abilities and lore. (Exception: Hito Hito, Model: Nika uses a white uniform and white vapor cloud instead).
=======================================================

CHARACTER DOSSIER:
${buildSummary}
${haxBreakdown ? `ACTIVE HAX ELEMENTS: ${haxBreakdown}` : ''}

POWER SCALING & STAT AUDIT:
- Power Tier: ${tier}
- World Bounty: ${bounty}
- Exact Stat Array: STR: ${Math.round(stats.str)}, SPD: ${Math.round(stats.spd)}, DUR: ${Math.round(stats.dur)}, IQ: ${Math.round(stats.iq)}, HAKI: ${Math.round(stats.haki)}, PWR: ${Math.round(stats.pwr)}, HAX: ${Math.round(stats.hax)}
- Apex Strengths: ${this._getHighestStats(stats)}
- Tactical Vulnerabilities: ${this._getLowestStats(stats)}

WRITING MANDATES:
1. NAME & EPITHET:
   - Invent a culturally authentic, memorable anime name (fitting Origin: ${build.origin?.name || 'Unknown'}, preferably starting with letter "${randomLetter}").
   - Invent a canon-caliber, epic Epithet strictly unique to this character's exact powers and background (e.g. incorporating themes like "${randomAdj} ${randomNoun}", or creating something entirely original). DO NOT use generic or repeated titles like "The Asura of Mariejois" or "The God-Shatterer".

2. STAT & HAX COMPREHENSION:
   - Reflect their highest stats vividly. If Strength is Planetary or Absolute, mention the atmospheric ruin of their blows. If Speed is FTL or Infinite, describe them appearing before their afterimage disperses. If they possess Dōjutsu or Devil Fruit hax (Rinnegan, Nika, Ope Ope, Truth-Seeking Orbs), explain how they deploy it in battle.
   - Acknowledge their tactical vulnerability based on their lowest stats. Explain how their battle strategy compensates for it.

3. FACTION & PHILOSOPHY:
   - Weave their faction's creed naturally into their legend (${build.faction?.name || 'Unaffiliated'}). If CP0 or CP9, weave in "Dark Justice", government espionage, and cold-blooded execution. If Shinobi/Anbu, weave the Will of Fire or black-ops shadow secrecy. If Akatsuki or Kara, weave revolutionary defiance or cosmic harvest.

4. 3-4 SENTENCE BACKSTORY FORMAT:
   - Sentence 1: Origin, lineage/vessel legacy, and faction allegiance.
   - Sentence 2: The awakening of their rare powers (how their Devil Fruit, Dōjutsu, Haki, or Jutsu fused). (IF ZOAN: Mention their Hybrid or Full-Zoan visual transformation here).
   - Sentence 3: Their signature tactical combat doctrine and how they exploit their hax/stats.
   - Sentence 4: Their dread reputation and current standing in the world (feared by the Marines, Five Kage, or Celestial Dragons).

5. CUSTOM SYNERGY:
   - Create 1 tailored custom synergy with a cool name, description, and stat bonuses (integers between 0 and 15) matching this build.

6. SIGNATURE ABILITIES:
   - Create 2-3 unique signature moves/techniques/hax for this character, synergizing their build components.
   - IF ZOAN: At least one ability MUST be a "Hybrid Form" ability, and one MUST be a "Full-Zoan Form" ability (Unless Nika fruit). For BOTH forms, you MUST explicitly describe what their beast transformation visually looks like.
   - Give each move a creative name and a brief description of its combat effect.

RETURN ONLY A VALID JSON OBJECT MATCHING THIS SCHEMA:
{
    "name": "Their Unique Name",
    "epithet": "Their Epic Epithet",
    "bio": "The 3-4 sentence profound backstory using ${pronouns} pronouns.",
    "custom_synergy": {
        "name": "⚡ SYNERGY NAME",
        "desc": "How their distinct abilities combine into a unified combat technique.",
        "bonuses": { "str": 0, "spd": 0, "dur": 0, "iq": 0, "haki": 0, "pwr": 0, "hax": 0 }
    },
    "signature_abilities": [
        { "name": "Abilty/Move Name", "desc": "Brief combat effect description" }
    ]
}
`;
        return await this.generateContent(prompt, MASTER_LORE_SYSTEM_PROMPT);
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
