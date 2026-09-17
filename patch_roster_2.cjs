const fs = require('fs');
let code = fs.readFileSync('src/components/RosterModal.jsx', 'utf8');

const replacement = `
    const loadCharacters = async () => {
        let guestSaves = [];
        try {
            guestSaves = JSON.parse(localStorage.getItem('spinYourDestiny_saves') || '[]');
            // Ensure guestSaves is an array and tag them so we know they are local
            if (Array.isArray(guestSaves)) {
                guestSaves = guestSaves.map(s => ({ ...s, isLocal: true }));
            } else {
                guestSaves = [];
            }
        } catch (e) {
            console.error('Error parsing local storage:', e);
            guestSaves = [];
        }

        if (user) {
            try {
                // Fetch from cloud database
                const { data, error } = await supabase
                    .from('saved_characters')
                    .select('*')
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                
                const mappedData = data ? data.map(char => ({
                    id: char.id,
                    build: char.build,
                    stats: char.stats,
                    overall: char.overall,
                    bounty: char.bounty,
                    tier: { name: char.tier },
                    lore: char.lore,
                    synergies: char.synergies,
                    isLocal: false
                })) : [];
                
                // Merge cloud saves with local offline saves
                setSavedCharacters([...mappedData, ...guestSaves]);
            } catch (error) {
                console.error('Error fetching characters:', error);
                setSavedCharacters(guestSaves);
            }
        } else {
            setSavedCharacters(guestSaves);
        }
    };
`;

code = code.replace(/const loadCharacters = async \(\) => \{[\s\S]*?    const handleDelete/m, replacement.trim() + '\n\n    const handleDelete');

fs.writeFileSync('src/components/RosterModal.jsx', code);
