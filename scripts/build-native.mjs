import { spawnSync } from 'node:child_process';
import { loadEnv } from 'vite';

const configured = loadEnv('production', process.cwd(), 'VITE_');
const apiUrl = process.env.VITE_API_BASE_URL || configured.VITE_API_BASE_URL || 'https://spin-the-wheel-one-piece-x-naruto.vercel.app';
if (new URL(apiUrl).protocol !== 'https:') throw new Error('Native builds require an HTTPS API URL');

const result = spawnSync(process.execPath, ['node_modules/vite/bin/vite.js', 'build', '--outDir', 'dist-native'], {
    stdio: 'inherit', env: { ...process.env, VITE_BUILD_TARGET: 'native', VITE_API_BASE_URL: apiUrl }
});
process.exit(result.status ?? 1);
