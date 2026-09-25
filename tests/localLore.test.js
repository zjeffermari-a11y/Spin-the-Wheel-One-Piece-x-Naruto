import test from 'node:test';
import assert from 'node:assert/strict';
import { generateLocalLore, generateCharacterContent, isUsableLore } from '../src/utils/localLore.js';
import { saveLocalCharacter } from '../src/utils/localRoster.js';
import { postApi } from '../src/utils/apiClient.js';

const build = { summon: { name: 'Monkey King Enma' }, ambition: { name: 'Protect My Homeland' } };

test('local lore is deterministic, complete and respects Enma awakening', () => {
    const local = generateLocalLore(build);
    assert.ok(isUsableLore(local));
    assert.deepEqual(local, generateLocalLore(build));
    assert.match(local.bio, /Protect My Homeland/);
    assert.match(local.signature_abilities[2].name, /Adamantine Partner/);
    assert.doesNotMatch(JSON.stringify(local), /cloud-riding|hair-clone|Great Sage/);
    const awakened = generateLocalLore({ ...build, awakening: { name: 'Awakened', target: 'summon', stage: 3 } });
    assert.match(awakened.signature_abilities[2].desc, /cloud-riding/);
    assert.ok(isUsableLore(generateLocalLore({})));
});

test('offline and explicit local modes never call either provider', async () => {
    const rejectCall = () => { assert.fail('Network callback must not run'); };
    for (const options of [{ mode: 'local', online: true }, { mode: 'ai', online: false }]) {
        const result = await generateCharacterContent({ build, ...options, generateLore: rejectCall, generatePortrait: rejectCall });
        assert.equal(result.lore.generation_source, 'local');
        assert.equal(result.portraitUrl, null);
    }
});

test('provider failures and malformed lore keep a usable character and independent portrait', async () => {
    for (const generateLore of [() => { throw new Error('Offline'); }, () => ({}), () => null]) {
        const result = await generateCharacterContent({ build, mode: 'ai', generateLore, generatePortrait: () => ({ url: 'https://example.com/portrait.png' }) });
        assert.equal(result.lore.generation_source, 'local');
        assert.ok(isUsableLore(result.lore));
        assert.equal(result.portraitUrl, 'https://example.com/portrait.png');
    }
    const result = await generateCharacterContent({ build, mode: 'ai', generateLore: () => generateLocalLore(build), generatePortrait: () => { throw new Error('Portrait failed'); } });
    assert.equal(result.lore.generation_source, 'ai');
    assert.equal(result.portraitUrl, null);
});

test('local saves preserve source, portrait and old records without overwriting corrupted data', () => {
    let raw = JSON.stringify([{ name: 'Existing' }]);
    const storage = { getItem: () => raw, setItem: (_, value) => { raw = value; } };
    const character = { lore: generateLocalLore(build), portraitUrl: 'https://example.com/image.png' };
    saveLocalCharacter(storage, character);
    assert.deepEqual(JSON.parse(raw), [{ name: 'Existing' }, character]);
    for (const invalid of ['{broken', '{}']) {
        raw = invalid;
        assert.throws(() => saveLocalCharacter(storage, character));
        assert.equal(raw, invalid);
    }
});

test('API client rejects failed requests and aborts stalled requests', async () => {
    const originalFetch = globalThis.fetch;
    try {
        globalThis.fetch = async () => ({ ok: false, status: 503 });
        await assert.rejects(postApi('/api/test', {}), /503/);
        globalThis.fetch = (_, { signal }) => new Promise((resolve, reject) => {
            signal.addEventListener('abort', () => reject(new Error('Aborted')), { once: true });
        });
        await assert.rejects(postApi('/api/test', {}, { timeoutMs: 5 }), /Aborted/);
    } finally { globalThis.fetch = originalFetch; }
});

test('cloud module supports startup without configured credentials', async () => {
    const { supabase } = await import('../src/utils/supabaseClient.js');
    assert.equal(supabase, null);
});
