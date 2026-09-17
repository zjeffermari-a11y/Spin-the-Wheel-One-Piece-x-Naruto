const fs = require('fs');
let code = fs.readFileSync('src/components/RosterModal.jsx', 'utf8');

const replacement = `
    const loadCharacters = async () => {
        let guestSaves = [];
        try {
            guestSaves = JSON.parse(localStorage.getItem('spinYourDestiny_saves') || '[]');
            // Tag them so we know they are local
            guestSaves = guestSaves.map(s => ({ ...s, isLocal: true }));
        } catch (e) {
            console.error('Error parsing local storage:', e);
        }

        if (user) {
            try {
                const { data, error } = await supabase
                    .from('saved_characters')
                    .select('*')
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                
                const mappedData = data.map(char => ({
                    id: char.id,
                    build: char.build,
                    stats: char.stats,
                    overall: char.overall,
                    bounty: char.bounty,
                    tier: { name: char.tier },
                    lore: char.lore,
                    synergies: char.synergies,
                    isLocal: false
                }));
                
                setSavedCharacters([...mappedData, ...guestSaves]);
            } catch (error) {
                console.error('Error fetching characters:', error);
                setSavedCharacters(guestSaves);
            }
        } else {
            setSavedCharacters(guestSaves);
        }
    };

    const handleDelete = async (char, index, e) => {
        e.stopPropagation();
        
        if (char.id && !char.isLocal) {
            try {
                const { error } = await supabase
                    .from('saved_characters')
                    .delete()
                    .eq('id', char.id);
                
                if (error) throw error;
                
                setSavedCharacters(prev => prev.filter(c => c.id !== char.id));
            } catch (error) {
                console.error('Error deleting character:', error);
                alert('Failed to delete character.');
            }
        } else if (char.isLocal) {
            try {
                let guestSaves = JSON.parse(localStorage.getItem('spinYourDestiny_saves') || '[]');
                // Find and remove it from the actual local storage array
                // We don't have a unique ID for local saves reliably, so we match by stringified content or exact object structure if we added a temporary id.
                // Let's just re-calculate guestSaves from the current state!
                const newSavedCharacters = savedCharacters.filter((_, i) => i !== index);
                const newGuestSaves = newSavedCharacters.filter(c => c.isLocal).map(c => {
                    const copy = { ...c };
                    delete copy.isLocal;
                    return copy;
                });
                localStorage.setItem('spinYourDestiny_saves', JSON.stringify(newGuestSaves));
                setSavedCharacters(newSavedCharacters);
            } catch(e) {
                console.error('Error deleting local save:', e);
            }
        }
    };
`;

code = code.replace(/const loadCharacters = async \(\) => \{[\s\S]*?    return \(/, replacement.trim() + '\n\n    return (');

fs.writeFileSync('src/components/RosterModal.jsx', code);
