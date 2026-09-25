import { spawnSync } from 'node:child_process';
import { nativeEnvironment } from './native-env.mjs';

const result = spawnSync(process.execPath, ['node_modules/@tauri-apps/cli/tauri.js', ...process.argv.slice(2)], {
    stdio: 'inherit', env: nativeEnvironment()
});
process.exit(result.status ?? 1);
