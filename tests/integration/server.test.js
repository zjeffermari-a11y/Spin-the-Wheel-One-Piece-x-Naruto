import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { setTimeout as delay } from 'node:timers/promises';

test('production HTTP server validates requests and serves hardened static responses', async t => {
    const port = 14379;
    const child = spawn(process.execPath, ['scripts/start-server.mjs'], {
        windowsHide: true,
        env: { ...process.env, PORT: String(port), GROQ_API_KEY: '', HIGGSFIELD_API_KEY_ID: '', HIGGSFIELD_API_KEY_SECRET: '' },
        stdio: ['ignore', 'pipe', 'pipe']
    });
    t.after(async () => { if (child.exitCode === null) { child.kill(); await once(child, 'exit'); } });
    let ready = false;
    child.stdout.on('data', data => { if (data.toString().includes('Server running')) ready = true; });
    // Do not print child output: local environment loaders may emit sensitive diagnostics.
    child.stderr.resume();
    for (let i = 0; i < 100 && !ready && child.exitCode === null; i++) await delay(50);
    assert.ok(ready, 'isolated server started');
    const base = `http://127.0.0.1:${port}`;
    const root = await fetch(base);
    assert.equal(root.status, 200);
    assert.equal(root.headers.get('x-powered-by'), null);
    assert.equal(root.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(root.headers.get('x-frame-options'), 'DENY');
    assert.match(await root.text(), /<html/);
    const wrongMethod = await fetch(`${base}/api/generate-lore`);
    assert.equal(wrongMethod.status, 405);
    for (const [body, expected] of [['{', 400], [JSON.stringify({ prompt: 'x'.repeat(270000) }), 413], ['{}', 400]]) {
        const response = await fetch(`${base}/api/generate-lore`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
        assert.equal(response.status, expected);
        const text = await response.text();
        assert.ok(JSON.parse(text).error);
        assert.doesNotMatch(text, /SyntaxError|node_modules|stack/);
    }
    const preflight = await fetch(`${base}/api/generate-portrait`, { method: 'OPTIONS', headers: { Origin: 'tauri://localhost' } });
    assert.equal(preflight.status, 204);
    const denied = await fetch(`${base}/api/generate-lore`, { method: 'POST', headers: { Origin: 'https://untrusted.example', 'Content-Type': 'application/json' }, body: '{}' });
    assert.equal(denied.status, 403);
    const sw = await fetch(`${base}/sw.js`);
    assert.equal(sw.headers.get('cache-control'), 'no-cache');
});
