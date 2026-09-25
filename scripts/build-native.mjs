import { spawnSync } from 'node:child_process';

const result = spawnSync(process.execPath, ['node_modules/vite/bin/vite.js', 'build', '--outDir', 'dist-native'], {
    stdio: 'inherit', env: { ...process.env, VITE_BUILD_TARGET: 'native' }
});
process.exit(result.status ?? 1);
