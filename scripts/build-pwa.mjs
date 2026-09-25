import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

async function filesAt(directory, prefix = '') {
    const items = await readdir(directory, { withFileTypes: true });
    const result = [];
    for (const item of items) {
        const relative = prefix + item.name;
        if (item.isDirectory()) result.push(...await filesAt(join(directory, item.name), relative + '/'));
        else if (item.name !== 'sw.js') result.push(relative);
    }
    return result.sort();
}

const files = await filesAt('dist');
// This script only runs on the frontend output. Never precache API/server code.
if (!files.includes('index.html') || files.some(file => /server\.(cjs|js)|\.map$/.test(file))) throw new Error('Unexpected frontend output');
const hash = createHash('sha256');
for (const file of files) { hash.update(file); hash.update(await readFile(join('dist', file))); }
const template = await readFile('src/pwa/worker.js', 'utf8');
hash.update(template);
const version = hash.digest('hex').slice(0, 16);
const output = template.replace('__CACHE_NAME__', JSON.stringify(`summon-shell-${version}`)).replace('__ASSETS__', JSON.stringify(files.map(file => '/' + file)));
await writeFile('dist/sw.js', output);
console.log(`PWA shell ${version}: ${files.length} local assets`);
