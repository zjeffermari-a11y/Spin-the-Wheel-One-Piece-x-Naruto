import test from 'node:test';
import assert from 'node:assert/strict';
import lore from '../api/generate-lore.js';
import portrait from '../api/generate-portrait.js';

function response() {
    return { headers: {}, code: 200, setHeader(k, v) { this.headers[k] = v; }, status(code) { this.code = code; return this; }, json(body) { this.body = body; }, end() {} };
}
test('both generation endpoints accept native preflight without contacting providers', async () => {
    for (const handler of [lore, portrait]) {
        for (const origin of ['http://tauri.localhost', 'https://tauri.localhost', 'tauri://localhost']) {
            const res = response();
            await handler({ method: 'OPTIONS', headers: { origin } }, res);
            assert.equal(res.code, 204);
            assert.equal(res.headers['Access-Control-Allow-Origin'], origin);
            assert.equal(res.headers['Cache-Control'], 'no-store');
        }
        const res = response();
        await handler({ method: 'POST', headers: { origin: 'https://untrusted.example' } }, res);
        assert.equal(res.code, 403);
        assert.equal(res.headers['Access-Control-Allow-Origin'], undefined);
    }
});
