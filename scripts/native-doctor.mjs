import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { nativeEnvironment } from './native-env.mjs';

const env = nativeEnvironment();

let missing = false;
const check = (name, present) => {
    console.log(`${present ? 'OK' : 'MISSING'}: ${name}`);
    if (!present) missing = true;
};
for (const tool of ['rustc', 'cargo']) check(tool, spawnSync(tool, ['--version'], { stdio: 'ignore', env }).status === 0);
if (process.platform === 'win32') {
    const vswhere = join(process.env['ProgramFiles(x86)'] || 'C:/Program Files (x86)', 'Microsoft Visual Studio/Installer/vswhere.exe');
    const result = existsSync(vswhere) ? spawnSync(vswhere, ['-latest', '-products', '*', '-requires', 'Microsoft.VisualStudio.Component.VC.Tools.x86.x64', '-property', 'installationPath'], { encoding: 'utf8' }) : null;
    check('Visual Studio C++ build tools', Boolean(result?.status === 0 && result.stdout.trim()));
}
const sdk = env.ANDROID_HOME || env.ANDROID_SDK_ROOT || join(env.LOCALAPPDATA || '', 'Android/Sdk');
check('Android SDK', existsSync(join(sdk, 'platforms')));
check('Android NDK', existsSync(join(sdk, 'ndk')));
check('Java on PATH (version compatibility still needs Android build verification)', spawnSync('java', ['-version'], { stdio: 'ignore', env }).status === 0);
console.log('Native packaging also requires a final app identifier and signing setup before publication.');
process.exitCode = missing ? 1 : 0;
