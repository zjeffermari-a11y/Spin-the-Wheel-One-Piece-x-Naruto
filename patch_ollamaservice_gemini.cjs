const fs = require('fs');
let code = fs.readFileSync('src/utils/OllamaService.js', 'utf8');

const targetMethod = `    async generateBio(build) {
        const buildSummary = this._getBuildSummary(build);`;

const targetMethodContent = code.substring(code.indexOf(targetMethod), code.indexOf(`return await this.generateContent(prompt, \`You are the Grand Sage and Supreme Lorekeeper`));

const fullReplacement = `    async generateBio(build) {
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

        const prompt = \`Craft the ultimate legendary biography and lore sheet for this anime crossover character.

CHARACTER SPECIFICATIONS:
\${buildSummary}
\${haxBreakdown ? \`HAX PROFILE: \${haxBreakdown}\` : ''}

POWER SCALING SUMMARY:
- Apex Strengths: \${this._getHighestStats(stats)}
- Tactical Vulnerabilities: \${this._getLowestStats(stats)}

WRITING MANDATES:
1. NAME & EPITHET:
   - Invent a culturally authentic, memorable anime name (fitting Origin: \${build.origin?.name || 'Unknown'}, preferably starting with letter "\${randomLetter}").
   - Invent a canon-caliber, epic Epithet strictly unique to this character's exact powers and background (e.g. incorporating themes like "\${randomAdj} \${randomNoun}", or creating something entirely original). DO NOT use generic or repeated titles like "The Asura of Mariejois" or "The God-Shatterer".
2. STAT & HAX COMPREHENSION:
   - Reflect their highest stats vividly. If Strength is Planetary or Absolute, mention the atmospheric ruin of their blows. If Speed is FTL or Infinite, describe them appearing before their afterimage disperses. If they possess Dōjutsu or Devil Fruit hax (Rinnegan, Nika, Ope Ope, Truth-Seeking Orbs), explain how they deploy it in battle.
   - Acknowledge their tactical vulnerability based on their lowest stats. Explain how their battle strategy compensates for it.
3. FACTION & PHILOSOPHY:
   - Weave their faction's creed naturally into their legend (\${build.faction?.name || 'Unaffiliated'}). If CP0 or CP9, weave in "Dark Justice", government espionage, and cold-blooded execution. If Shinobi/Anbu, weave the Will of Fire or black-ops shadow secrecy. If Akatsuki or Kara, weave revolutionary defiance or cosmic harvest.
4. 3-4 SENTENCE BACKSTORY FORMAT:
   - Sentence 1: Origin, lineage/vessel legacy, and faction allegiance.
   - Sentence 2: The awakening of their rare powers (how their Devil Fruit, Dōjutsu, Haki, or Jutsu fused). (IF ZOAN: Mention their Hybrid or Full-Zoan visual transformation here).
   - Sentence 3: Their signature tactical combat doctrine and how they exploit their hax/stats.
   - Sentence 4: Their dread reputation and current standing in the world (feared by the Marines, Five Kage, or Celestial Dragons).
5. CUSTOM SYNERGY & MISMATCHES:
   - Create 1 tailored custom synergy with a cool name, description, and stat bonuses (integers between 0 and 15).
   - IMPORTANT: If their Weapon completely mismatches their Fighting Style (e.g., Weapon: "Sniper/Rifle" but Style: "Brawler" or "Swordsman"), you MUST embrace the irony! Invent a hilarious, highly creative, or brutal combat synergy (e.g., using a heavy sniper rifle as a blunt club, swinging a gun by the strap like a flail, or attaching chakra blades to the barrel). Make the mismatch their defining genius!
6. SIGNATURE ABILITIES:
   - Create 2-3 unique signature moves/techniques/hax for this character, synergizing their build components.
   - IF ZOAN: At least one ability MUST be a "Hybrid Form" ability, and one MUST be a "Full-Zoan Form" ability (Unless Nika fruit). For BOTH forms, you MUST explicitly describe what their beast transformation visually looks like.
   - Give each move a creative name and a brief description of its combat effect.

RETURN ONLY A VALID JSON OBJECT MATCHING THIS SCHEMA:
{
    "name": "Their Unique Name",
    "epithet": "Their Epic Epithet",
    "bio": "The 3-4 sentence profound backstory using \${pronouns} pronouns.",
    "custom_synergy": {
        "name": "⚡ SYNERGY NAME",
        "desc": "How their distinct abilities combine into a unified combat technique.",
        "bonuses": { "str": 0, "spd": 0, "dur": 0, "iq": 0, "haki": 0, "pwr": 0, "hax": 0 }
    },
    "signature_abilities": [
        { "name": "Abilty/Move Name", "desc": "Brief combat effect description" }
    ]
}\`;
        
        const systemInstruction = \`You are the Grand Sage and Supreme Lorekeeper of a legendary anime crossover universe that seamlessly fuses the worlds of One Piece, Naruto, and Boruto into one unified reality.
You possess encyclopedic mastery of anime worldbuilding, power scaling, battle physics, hax hierarchies, martial arts, and narrative craft.

=======================================================
1. CANON CHARACTER VESSEL UPDATES (CRITICAL VISUALS)
=======================================================
If the Vessel is a canon character, YOU MUST INCORPORATE THEIR VISUAL IDENTITY into the narrative.
- If Vessel is Zoro, mention his green hair and three swords (even if he got a new style/weapon).
- If Vessel is Luffy, mention his straw hat and rubbery origins.
- If Vessel is Naruto, mention his whiskers and orange/black thematic colors.
- If Vessel is Gojo, mention his white hair and blindfold (even if crossover).
The Vessel dictates their soul and body!

=======================================================
2. NARRATIVE TONE & STYLE
=======================================================
- Write with immense cinematic gravity, awe-inspiring scale, and dramatic flair.
- Use words like 'cataclysmic', 'ethereal', 'inexorable', 'sovereign', 'apex', 'unfathomable'.
- The bio must sound like it was written by a terrified historian or a reverent disciple documenting a god-level threat.
- Avoid generic cliches ("He was born in a small village"). Jump straight into the legendary lore.

=======================================================
3. TECHNICAL EXECUTION (STRICT JSON)
=======================================================
- You will return ONLY valid, minified JSON.
- DO NOT INCLUDE markdown code blocks (like \`\`\`json).
- DO NOT include any conversational text before or after the JSON.
- Follow the provided JSON schema EXACTLY.
- ALL generated content must be in valid JSON. No trailing commas, no unescaped quotes.\`;

        try {
            const response = await fetch('/api/generate-lore', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt, systemInstruction })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(\`Gemini API failed (\${response.status}): \${errText}\`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Gemini fetch error:", error);
            throw error;
        }
    }`;

// Replace the original generateBio with the new Gemini-backed generateBio
const fullMethod = targetMethodContent + `return await this.generateContent(prompt, \`You are the Grand Sage and Supreme Lorekeeper of a legendary anime crossover universe that seamlessly fuses the worlds of One Piece, Naruto, and Boruto into one unified reality.
You possess encyclopedic mastery of anime worldbuilding, power scaling, battle physics, hax hierarchies, martial arts, and narrative craft.

=======================================================
1. CANON CHARACTER VESSEL UPDATES (CRITICAL VISUALS)
=======================================================
If the Vessel is a canon character, YOU MUST INCORPORATE THEIR VISUAL IDENTITY into the narrative.
- If Vessel is Zoro, mention his green hair and three swords (even if he got a new style/weapon).
- If Vessel is Luffy, mention his straw hat and rubbery origins.
- If Vessel is Naruto, mention his whiskers and orange/black thematic colors.
- If Vessel is Gojo, mention his white hair and blindfold (even if crossover).
The Vessel dictates their soul and body!

=======================================================
2. NARRATIVE TONE & STYLE
=======================================================
- Write with immense cinematic gravity, awe-inspiring scale, and dramatic flair.
- Use words like 'cataclysmic', 'ethereal', 'inexorable', 'sovereign', 'apex', 'unfathomable'.
- The bio must sound like it was written by a terrified historian or a reverent disciple documenting a god-level threat.
- Avoid generic cliches ("He was born in a small village"). Jump straight into the legendary lore.

=======================================================
3. TECHNICAL EXECUTION (STRICT JSON)
=======================================================
- You will return ONLY valid, minified JSON.
- DO NOT INCLUDE markdown code blocks (like \`\`\`json).
- DO NOT include any conversational text before or after the JSON.
- Follow the provided JSON schema EXACTLY.
- ALL generated content must be in valid JSON. No trailing commas, no unescaped quotes.\`);
    }`;

code = code.replace(fullMethod, fullReplacement);

fs.writeFileSync('src/utils/OllamaService.js', code);
