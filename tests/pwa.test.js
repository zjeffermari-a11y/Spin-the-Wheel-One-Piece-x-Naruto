import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { exportRoster, importRoster } from '../src/utils/localRoster.js';

function worker() {
    const listeners = {};
    const cached = new Map();
    const deleted = [];
    let fetches = 0;
    const context = {
        URL,
        self: { addEventListener: (name, fn) => { listeners[name] = fn; }, location: { origin: 'https://summon.test' }, clients: { claim: async () => {} } },
        caches: { open: async () => ({ addAll: async paths => paths.forEach(path => cached.set(path, 'cached:' + path)), match: async path => cached.get(path) }), keys: async () => ['summon-shell-old', 'summon-shell-test', 'other-app'], delete: async key => deleted.push(key) },
        fetch: async () => { fetches++; throw new Error('offline'); }
    };
    vm.runInNewContext(readFileSync('src/pwa/worker.js','utf8').replace('__CACHE_NAME__', '"summon-shell-test"').replace('__ASSETS__', '["/index.html","/assets/app.js"]'), context);
    return { listeners, cached, deleted, fetches: () => fetches };
}

test('PWA installs shell, serves offline navigation and only removes own obsolete caches', async () => {
    const w = worker();
    let work;
    w.listeners.install({ waitUntil: p => { work = p; } });
    await work;
    w.listeners.activate({ waitUntil: p => { work = p; } });
    await work;
    assert.deepEqual(w.deleted, ['summon-shell-old']);
    for (const [url, mode, expected] of [['/roster', 'navigate', '/index.html'], ['/assets/app.js', 'cors', '/assets/app.js']]) {
        w.listeners.fetch({ request: { method: 'GET', url: 'https://summon.test' + url, mode }, respondWith: p => { work = p; } });
        assert.equal(await work, 'cached:' + expected);
    }
    assert.equal(w.fetches(), 0);
});

test('PWA never intercepts API, writes, remote portraits or unknown files', () => {
    const w = worker();
    for (const request of [
        { method: 'GET', url: 'https://summon.test/api/jobs/1', mode: 'navigate' },
        { method: 'POST', url: 'https://summon.test/api/generate-lore' },
        { method: 'GET', url: 'https://supabase.test/private.png' },
        { method: 'GET', url: 'https://summon.test/private-record.json' }
    ]) w.listeners.fetch({ request, respondWith: () => assert.fail('Private or unknown request intercepted') });
});

test('roster backup imports locally, deduplicates and preserves original data on failure', () => {
    let raw = '[]';
    const storage = { getItem: () => raw, setItem: (_, value) => { raw = value; } };
    const record = { id: 'cloud-id', user_id: 'owner', isLocal: false, build: { summon: { name: 'Monkey King Enma' } }, lore: { name: 'Aren', bio: 'Story', generation_source: 'local' } };
    const backup = exportRoster([record]);
    assert.equal(importRoster(storage, backup), 1);
    assert.equal(importRoster(storage, backup), 0);
    assert.equal(JSON.parse(raw)[0].id, undefined);
    const original = raw;
    for (const invalid of ['invalid', JSON.stringify({ format: 'summon-roster', version: 99, characters: [] }), JSON.stringify({ format: 'summon-roster', version: 1, characters: [{ build: { broken: 12 } }] })]) {
        assert.throws(() => importRoster(storage, invalid));
        assert.equal(raw, original);
    }
});
