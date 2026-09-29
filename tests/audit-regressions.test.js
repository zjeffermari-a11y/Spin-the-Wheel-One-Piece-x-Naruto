import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateBuildStats } from '../src/utils/buildStats.js';
import { calculateSynergies } from '../src/utils/gameLogic.js';
import { generateLocalLore, generateCharacterContent } from '../src/utils/localLore.js';
import lore from '../api/generate-lore.js';
import portrait from '../api/generate-portrait.js';

function setEnv(t, key, value) {
    const previous = process.env[key];
    process.env[key] = value;
    t.after(() => { if (previous === undefined) delete process.env[key]; else process.env[key] = previous; });
}

function response() {
    return { code: 200, headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; }, end() {} };
}

test('zero selections remain zero and absent selections retain legacy defaults', () => {
    assert.equal(calculateBuildStats({ str: { name: 'Zero', val: 0 } }).stats.str, 0);
    assert.equal(calculateBuildStats({}).stats.str, 50);
    const build = Object.fromEntries(['haki_obs', 'haki_arm', 'haki_conq'].map(k => [k, { name: 'None', val: 0 }]));
    assert.equal(calculateBuildStats(build).stats.haki, 0);
});

test('Six Paths requires selected senjutsu, not None or an absent roll', () => {
    for (const jutsu_sen of [undefined, { name: 'None', val: 0 }]) {
        assert.equal(calculateSynergies({ dojutsu: { name: 'Rinnegan' }, jutsu_sen }).list.some(s => s.name.includes('SIX PATHS')), false);
    }
    assert.equal(calculateSynergies({ dojutsu: { name: 'Rinnegan' }, jutsu_sen: { name: 'Sage Mode' } }).list.some(s => s.name.includes('SIX PATHS')), true);
});

test('malformed optional AI fields use local fallback instead of crashing React', async () => {
    for (const fields of [{ epithet: {} }, { custom_synergy: { name: {}, desc: 'bad' } }, { custom_synergy: { name: 'bad', desc: {}, bonuses: {} } }, { custom_synergy: { name: 'bad', desc: 'bad', bonuses: { str: {} } } }]) {
        const result = await generateCharacterContent({ build: {}, mode: 'ai', generateLore: () => ({ ...generateLocalLore({}), ...fields }), generatePortrait: () => null });
        assert.equal(result.lore.generation_source, 'local');
    }
});

test('API rejects invalid bodies before provider access; methods and CORS remain enforced', async t => {
    t.mock.method(globalThis, 'fetch', () => { assert.fail('Unexpected provider request'); });
    for (const handler of [lore, portrait]) {
        for (const body of [undefined, null, [], {}, { prompt: '' }, { prompt: '  ' }, { prompt: {} }, { prompt: 'a'.repeat(32001), systemInstruction: 's' }]) {
            const res = response();
            await handler({ method: 'POST', headers: {}, body }, res);
            assert.equal(res.code, 400);
        }
        const res = response();
        await handler({ method: 'GET', headers: {} }, res);
        assert.equal(res.code, 405);
    }
});

test('provider error bodies and exception details never reach clients', async t => {
    setEnv(t, 'GROQ_API_KEY', 'test-placeholder');
    setEnv(t, 'HIGGSFIELD_API_KEY_ID', 'test-placeholder');
    setEnv(t, 'HIGGSFIELD_API_KEY_SECRET', 'test-placeholder');
    t.mock.method(console, 'error', () => {});
    const fetchMock = t.mock.method(globalThis, 'fetch', async () => ({ ok: false, status: 401, json: async () => ({ detail: 'PRIVATE_PROVIDER_DETAIL' }) }));
    for (const handler of [lore, portrait]) {
        const res = response();
        await handler({ method: 'POST', headers: {}, body: { prompt: 'test', systemInstruction: 'test' } }, res);
        assert.equal(res.code, 502);
        assert.equal(res.body.error, 'Generation service unavailable');
    }
    for (const call of fetchMock.mock.calls) assert.ok(call.arguments[1].signal instanceof AbortSignal);
});

test('provider timeout returns 504 and malformed lore JSON returns 502', async t => {
    setEnv(t, 'GROQ_API_KEY', 'test-placeholder');
    t.mock.method(console, 'error', () => {});
    const mock = t.mock.method(globalThis, 'fetch', async () => { throw new DOMException('private details', 'TimeoutError'); });
    const req = { method: 'POST', headers: {}, body: { prompt: 'test', systemInstruction: 'test' } };
    let res = response();
    await lore(req, res);
    assert.equal(res.code, 504);
    mock.mock.mockImplementation(async () => ({ ok: true, json: async () => ({ choices: [{ message: { content: 'invalid json' } }] }) }));
    res = response();
    await lore(req, res);
    assert.equal(res.code, 502);
});

test('documents remaining exposure: anonymous requests reach paid generation', async t => {
    setEnv(t, 'GROQ_API_KEY', 'test-placeholder');
    const mock = t.mock.method(globalThis, 'fetch', async () => ({ ok: true, json: async () => ({ choices: [{ message: { content: '{"ok":true}' } }] }) }));
    const res = response();
    await lore({ method: 'POST', headers: {}, body: { prompt: 'test', systemInstruction: 'test' } }, res);
    assert.equal(res.code, 200);
    assert.equal(mock.mock.callCount(), 1);
});
