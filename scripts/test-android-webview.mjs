import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

// Use an ADB forward to this app's debug WebView, never a general browser session.
const targets = await (await fetch('http://127.0.0.1:9224/json')).json();
const target = targets.find(item => item.url === 'http://tauri.localhost/');
assert.ok(target, 'Summon WebView must be running');
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
let sequence = 0;
const pending = new Map();
const errors = [];
function send(method, params = {}) {
    return new Promise((resolve, reject) => {
        const id = ++sequence;
        const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Timed out: ${method}`)); }, 15000);
        pending.set(id, { resolve, reject, timer });
        socket.send(JSON.stringify({ id, method, params }));
    });
}
socket.onmessage = event => {
    const message = JSON.parse(event.data);
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
    if (message.method === 'Page.javascriptDialogOpening') void send('Page.handleJavaScriptDialog', { accept: true });
    const request = pending.get(message.id);
    if (request) {
        clearTimeout(request.timer);
        pending.delete(message.id);
        if (message.error) request.reject(new Error(JSON.stringify(message.error)));
        else request.resolve(message.result);
    }
};
async function evaluate(expression) {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    assert.ok(!result.exceptionDetails, JSON.stringify(result.exceptionDetails));
    return result.result.value;
}
async function waitFor(expression, timeout = 150000) {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
        if (await evaluate(expression)) return;
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    throw new Error(`Condition timed out: ${expression}`);
}
const click = label => evaluate(`(() => { const b = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === ${JSON.stringify(label)}); if (!b || b.disabled) return false; b.click(); return true; })()`);
try {
    await send('Runtime.enable');
    await send('Page.enable');
    await send('Network.enable');
    await send('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 });
    if (process.argv.includes('--reopen')) {
        assert.ok(await evaluate(`(() => { const b = document.querySelector('button[title="Crew"]'); b?.click(); return !!b; })()`));
        await waitFor(`document.body.innerText.toLowerCase().includes('your legends roster')`, 10000);
        const savedName = await evaluate(`JSON.parse(localStorage.getItem('spinYourDestiny_saves') || '[]').at(-1)?.lore?.name`);
        assert.ok(savedName, 'Saved character survived process restart');
        assert.ok(await evaluate(`(() => { const el = [...document.querySelectorAll('*')].find(el => el.children.length === 0 && el.textContent.trim() === ${JSON.stringify(savedName)}); el?.click(); return !!el; })()`));
    } else {
        if (!await evaluate(`document.body.textContent.includes('Local template lore')`)) {
            await click('COMMENCE');
            await click('AUTO');
            await waitFor(`[...document.querySelectorAll('button')].some(b => b.textContent.trim() === 'Create Offline Character')`);
            assert.ok(await click('Create Offline Character'));
        }
        await waitFor(`document.body.textContent.includes('Local template lore')`, 15000);
        const before = await evaluate(`JSON.parse(localStorage.getItem('spinYourDestiny_saves') || '[]').length`);
        assert.ok(await evaluate(`(() => { const b = [...document.querySelectorAll('button')].find(b => /save/i.test(b.textContent)); b?.click(); return !!b; })()`));
        await waitFor(`JSON.parse(localStorage.getItem('spinYourDestiny_saves') || '[]').length > ${before}`, 15000);
    }
    await waitFor(`document.body.textContent.includes('Local template lore')`, 15000);
    await mkdir('test-results', { recursive: true });
    const screenshot = await send('Page.captureScreenshot', { format: 'png' });
    await writeFile('test-results/android-offline-character.png', Buffer.from(screenshot.data, 'base64'));
    assert.deepEqual(errors, []);
    console.log(process.argv.includes('--reopen') ? 'Android saved character reopened after process restart.' : 'Android offline wheel completion, local generation and saving passed.');
} finally {
    await send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
    socket.close();
}

