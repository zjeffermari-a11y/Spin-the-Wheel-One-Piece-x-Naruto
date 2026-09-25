export function saveLocalCharacter(storage, character) {
    const raw = storage.getItem('spinYourDestiny_saves');
    const saved = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(saved)) throw new Error('The local roster is damaged. Existing data was preserved.');
    storage.setItem('spinYourDestiny_saves', JSON.stringify([...saved, character]));
}

export function exportRoster(characters) {
    return JSON.stringify({ format: 'summon-roster', version: 1, characters: characters.map(({ isLocal: _local, id: _cloudId, user_id: _owner, ...character }) => character) }, null, 2);
}

export function importRoster(storage, text) {
    if (text.length > 10_000_000) throw new Error('Backup is too large (maximum 10 MB).');
    const backup = JSON.parse(text);
    if (backup.format !== 'summon-roster' || backup.version !== 1 || !Array.isArray(backup.characters) || backup.characters.length > 1000) throw new Error('Unsupported roster backup.');
    // Import only display data, never remote ownership, IDs or executable markup.
    const allowed = ['build', 'stats', 'overall', 'bounty', 'tier', 'lore', 'synergies', 'portraitUrl'];
    const records = backup.characters.map(record => {
        if (!record || typeof record !== 'object' || !record.build || typeof record.build !== 'object' || Array.isArray(record.build)) throw new Error('A character is missing its build.');
        for (const item of Object.values(record.build)) {
            if (!item || typeof item.name !== 'string' || (item.val !== undefined && (typeof item.val !== 'number' || !Number.isFinite(item.val)))) throw new Error('Invalid character selection.');
        }
        for (const key of ['overall', 'bounty']) {
            if (record[key] !== undefined && !((typeof record[key] === 'number' || typeof record[key] === 'string') && Number.isFinite(Number(record[key])))) throw new Error('Invalid character score.');
        }
        if (record.tier && (typeof record.tier !== 'object' || typeof record.tier.name !== 'string' || (record.tier.rarity !== undefined && typeof record.tier.rarity !== 'string'))) throw new Error('Invalid character tier.');
        if (record.stats && Object.values(record.stats).some(v => typeof v !== 'number' || !Number.isFinite(v))) throw new Error('Invalid character stats.');
        if (record.lore && (typeof record.lore !== 'object' || typeof record.lore.name !== 'string' || typeof record.lore.bio !== 'string')) throw new Error('Invalid character lore.');
        if (record.lore?.epithet !== undefined && typeof record.lore.epithet !== 'string') throw new Error('Invalid character epithet.');
        if (record.lore?.signature_abilities && (!Array.isArray(record.lore.signature_abilities) || record.lore.signature_abilities.some(a => typeof a?.name !== 'string' || typeof a?.desc !== 'string'))) throw new Error('Invalid signature abilities.');
        if (record.synergies && (!Array.isArray(record.synergies) || record.synergies.some(s => typeof s?.name !== 'string' || typeof (s.desc ?? s.synergy_desc) !== 'string'))) throw new Error('Invalid synergies.');
        if (record.synergies?.some(s => s.bonuses && (typeof s.bonuses !== 'object' || Object.values(s.bonuses).some(v => typeof v !== 'number' || !Number.isFinite(v))))) throw new Error('Invalid synergy bonuses.');
        const result = Object.fromEntries(allowed.filter(key => Object.hasOwn(record, key)).map(key => [key, record[key]]));
        if (result.portraitUrl && (typeof result.portraitUrl !== 'string' || !/^https:\/\//.test(result.portraitUrl))) result.portraitUrl = null;
        return result;
    });
    const existing = JSON.parse(storage.getItem('spinYourDestiny_saves') || '[]');
    if (!Array.isArray(existing)) throw new Error('Existing roster is damaged; it was not overwritten.');
    const identities = new Set(existing.map(record => JSON.stringify(record)));
    const additions = records.filter(record => {
        const identity = JSON.stringify(record);
        if (identities.has(identity)) return false;
        identities.add(identity);
        return true;
    });
    storage.setItem('spinYourDestiny_saves', JSON.stringify([...existing, ...additions]));
    return additions.length;
}
