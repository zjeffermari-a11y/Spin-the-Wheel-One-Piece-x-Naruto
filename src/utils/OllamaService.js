const FALLBACK_MODELS = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3.6-27b', 'qwen/qwen3.8-27b'];

export class OllamaService {
    constructor() {
        this.model = 'openai/gpt-oss-120b'; // Reliable 2026 free developer model
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
                
                // Exclude audio and specialized models
                const validModels = models.filter(m => 
                    !m.includes('whisper') && 
                    !m.includes('guard') && 
                    !m.includes('tool-use')
                );

                // Priority list based on 2026 Groq availability
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

    async generateContent(prompt, systemPrompt = "You are a helpful assistant.") {
        await this.bestModelPromise; // Wait for the best model to be determined

        if (!this.apiKey) {
            console.error("No Groq API Key found.");
            return null;
        }

        // Try candidate model first, then fallback to other active models if an error occurs
        const modelsToTry = [
            this.model,
            ...FALLBACK_MODELS.filter(m => m !== this.model)
        ];

        for (const candidateModel of modelsToTry) {
            const payload = {
                model: candidateModel,
                messages: [{ role: "user", content: prompt }],
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
                    continue; // Try next fallback model
                }

                const data = await response.json();
                const textContent = data.choices[0].message.content;
                this.model = candidateModel; // Lock in the working model
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
        const prompt = `
            You are an expert anime lore writer for a crossover universe that merges One Piece and Naruto/Boruto into a single world.
            WORLD CONTEXT:
            - This universe contains factions from both series: Pirates, Marines, Shinobi, Akatsuki, Kara (from Boruto), Tenryuubito (World Nobles/Celestial Dragons), Gorosei (The Five Elders who rule the World Government), Knight of God (Holy Knights who serve the Tenryuubito), Cipher Pol (CP0 / CP9 — World Government covert assassins and intelligence agency), Ōtsutsuki Clan, and Revolutionary Army.
            - Characters like Boruto Uzumaki, Kawaki, Sarada Uchiha, Mitsuki, Isshiki Otsutsuki, and Eida exist from the Boruto era.
            - Joyboy is a legendary ancient figure, and Imu is the secret sovereign of the World Government.
            - "Yamato (One Piece)" is Kaido's child from Wano, while "Yamato (Naruto)" is the Wood-style Anbu captain.
            - "Mu (Naruto)" is the invisible 2nd Tsuchikage, while "Imu (One Piece)" is the World Government's hidden ruler.
            Analyze this character build and invent 1 unique synergy that emerges from the combination of their abilities.
            IMPORTANT: Do not mention any benchmark character names (like Might Guy, Sakazuki, etc.) as if they are actual people. They are just power level references.
            POWER RULE: Base the synergy ONLY on the specific powers listed in the Build Info. Do not hallucinate random elemental powers.
            FACTION RULE: If the character belongs to a faction, the synergy flavor should reflect that faction's identity (e.g., a Gorosei member might have authority-themed synergies, a Kara member might have scientific ninja tools themes, a Tenryuubito might have divine privilege themes, a CP0/CP9 operative might have covert assassination and Dark Justice themes).
            Character Build:
            ${buildSummary}
            Return ONLY a valid JSON object matching this exact schema, with no markdown formatting:
            { "synergy_name": "Name of the synergy (e.g. 'God of Flames', 'Void Walker')", "synergy_desc": "A 1-sentence description of how their specific abilities combine to create this effect.", "bonuses": { "str": 0, "spd": 0, "dur": 0, "iq": 0, "haki": 0, "pwr": 0, "overall": 0 } }
            The bonuses should be integers between 0 and 15 that make sense for this specific combination.
        `;
        return await this.generateContent(prompt);
    }

    async generateBio(build, stats, tier, bounty) {
        const buildSummary = this._getBuildSummary(build);
        const randomLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        const vesselGenderForPrompt = buildSummary.includes('Gender: female') ? 'FEMALE' : 'MALE';
        const pronouns = vesselGenderForPrompt === 'FEMALE' ? 'she/her/hers' : 'he/him/his';
        const forbiddenPronouns = vesselGenderForPrompt === 'FEMALE' ? 'he/him/his' : 'she/her/hers';
        const prompt = `
            You are an expert anime lore writer for a crossover universe that merges One Piece and Naruto/Boruto into a single world.
            
            ⚠️ CRITICAL — CHARACTER GENDER: This character is ${vesselGenderForPrompt}. You MUST use ${pronouns} pronouns throughout the ENTIRE biography. 
            NEVER use gender-neutral (they/them) pronouns. NEVER use ${forbiddenPronouns}. If you use the wrong pronouns, the entire system will crash. Check every single sentence.
            
            WORLD CONTEXT:
            - This universe contains factions from both series: Pirates, Marines, Shinobi, Akatsuki, Kara (Boruto's villain organization that uses scientific ninja tools and Otsutsuki power), Tenryuubito (the World Nobles/Celestial Dragons who rule from Mary Geoise), Gorosei (The Five Elders — the highest authority in the World Government, wielding ancient powers), Knight of God (Holy Knights who serve as elite enforcers for the Tenryuubito), Cipher Pol (CP0 / CP9 — the secret intelligence and covert assassination branches of the World Government), Ōtsutsuki Clan (godlike alien beings who harvest worlds), and Revolutionary Army.
            - Boruto-era characters exist: Boruto Uzumaki (Naruto's son with Jougan and Karma), Kawaki (vessel of Isshiki with body modification powers), Sarada Uchiha (Sasuke's daughter, future Hokage candidate), Mitsuki (Orochimaru's synthetic son with Sage Transformation), Isshiki Otsutsuki (god-tier alien with Sukunahikona and Daikokuten), and Eida (has the power of Omniscience/All-Knowing — can see everything in the present and past).
            - Joyboy is the legendary warrior from the Void Century who first possessed the Nika power and opposed the World Government's ancestors. Imu is the immortal secret sovereign who sits on the Empty Throne.
            - "Yamato (One Piece)" is Kaido's child who ate the Inu Inu no Mi Model: Okuchi no Makami. "Yamato (Naruto)" is the Wood Release Anbu captain (codename Tenzo).
            - "Mu (Naruto)" is the invisible 2nd Tsuchikage with Particle Style. "Imu (One Piece)" is the hidden ruler of the World Government.
            Write a 3-4 sentence epic anime biography/backstory for this newly generated character. Invent a unique, fitting anime name and an epithet for them. Explain how they acquired these powers and their reputation.
            IMPORTANT: Do not mention any benchmark character names (like Sakazuki, Might Guy, etc.) as actual people in their lore! They are just references for how strong their abilities are. Also, make sure their lore makes sense with their stats - if they have low physical strength but high chakra, explain they rely on magic, etc.
            NAME RULE: The character's first name MUST be highly unique and original. NEVER use the name "Kaito" or other generic tropes. Try to start their name with the letter "${randomLetter}" and make it fit their Origin (${build.origin?.name || 'Unknown'}).
            GENDER RULE: This character is ${vesselGenderForPrompt}. You MUST use ONLY ${pronouns} pronouns. The Physical Vessel determines gender — ignore the Race or other attributes. NEVER use the wrong pronouns.
            POWER RULE: Do not invent random elemental powers based on their name. Only reference the specific powers listed in their Build Info.
            FACTION RULE: If the character has a faction, weave it into their backstory. For example:
            - A "Tenryuubito" is a World Noble born into extreme privilege and divine authority.
            - A "Gorosei" member is one of the Five Elders wielding ancient forbidden power.
            - A "Knight of God" is an elite holy enforcer serving the World Nobles.
            - A "CP0" or "CP9" operative is an elite covert assassin or secret agent for the World Government (Cipher Pol), enforcing "Dark Justice", executing covert missions or protecting Celestial Dragons with deadly Rokushiki martial arts and absolute secrecy.
            - A "Kara" member uses scientific ninja tools and seeks Otsutsuki power.
            - An "Ōtsutsuki Clan" member is a godlike alien harvesting worlds for power.
            Build Info: ${buildSummary} | Tier: ${tier} | Bounty: ${bounty}
            Highest Stats: ${this._getHighestStats(stats)} | Weakest Stats: ${this._getLowestStats(stats)}
            REMINDER: Character is ${vesselGenderForPrompt} — use ${pronouns} pronouns.
            Return ONLY a valid JSON object matching this schema exactly, with no markdown formatting: { "name": "Their Invented Name", "epithet": "Their Epithet (e.g. The Blood Demon)", "bio": "The 3-4 sentence backstory here (using ${pronouns} pronouns)." }
        `;
        return await this.generateContent(prompt);
    }

    _getBuildSummary(build) {
        let items = [];
        const vesselGender = build.vessel?.gender === 'F' ? 'female' : 'male';
        if (build.race) items.push(`Race: ${build.race.name}`);
        if (build.origin) items.push(`Origin: ${build.origin.name}`);
        if (build.faction) items.push(`Faction: ${build.faction.name}`);
        if (build.vessel && build.vessel.name !== 'None') {
            items.push(`Physical Vessel: ${build.vessel.name} (Gender: ${vesselGender})`);
        }
        if (build.trait && build.trait.name !== 'None' && build.trait.name !== 'Normal Body') items.push(`Special Trait: ${build.trait.name}`);
        if (build.df_type && build.df_type.name !== 'None') items.push(`Devil Fruit Type: ${build.df_type.name}`);
        if (build.df && build.df.name !== 'None') {
            items.push(`Devil Fruit: ${build.df.name}` + (build.df.tag ? ` (Power Theme: ${build.df.tag})` : ''));
        }
        if (build.dojutsu && build.dojutsu.name !== 'None') items.push(`Dojutsu: ${build.dojutsu.name}`);
        if (build.weapon && build.weapon.name !== 'None') items.push(`Weapon: ${build.weapon.name}`);
        if (build.haki_obs && build.haki_obs.name !== 'None') items.push(`Observation Haki (Level: ${build.haki_obs.name})`);
        if (build.haki_arm && build.haki_arm.name !== 'None') items.push(`Armament Haki (Level: ${build.haki_arm.name})`);
        if (build.haki_conq && build.haki_conq.name !== 'None') items.push(`Conqueror's Haki (Level: ${build.haki_conq.name})`);
        if (build.jinchuriki_beast && build.jinchuriki_beast.name !== 'None') items.push(`Tailed Beast: ${build.jinchuriki_beast.name}`);
        if (build.style && build.style.name !== 'None') items.push(`Fighting Style: ${build.style.name}`);
        return items.join('\n');
    }

    _getHighestStats(stats) {
        const entries = Object.entries(stats);
        entries.sort((a, b) => b[1] - a[1]);
        return entries.slice(0, 3).map(e => `${e[0].toUpperCase()} (${Math.round(e[1])})`).join(', ');
    }

    _getLowestStats(stats) {
        const entries = Object.entries(stats);
        entries.sort((a, b) => a[1] - b[1]);
        return entries.slice(0, 3).map(e => `${e[0].toUpperCase()} (${Math.round(e[1])})`).join(', ');
    }
}
