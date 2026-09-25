import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

export function nativeEnvironment() {
    const env = { ...process.env };
    const cargo = join(homedir(), '.cargo', 'bin');
    if (process.platform === 'win32') {
        const local = env.LOCALAPPDATA;
        if (local) {
            env.ANDROID_HOME ||= join(local, 'Android', 'Sdk');
            const jdkRoot = join(local, 'SummonToolchain', 'jdk');
            if (!env.JAVA_HOME && existsSync(jdkRoot)) {
                const name = readdirSync(jdkRoot).find(name => existsSync(join(jdkRoot, name, 'bin', 'java.exe')));
                if (name) env.JAVA_HOME = join(jdkRoot, name);
            }
            const ndk = join(env.ANDROID_HOME, 'ndk', '29.0.14206865');
            if (!env.NDK_HOME && existsSync(ndk)) env.NDK_HOME = ndk;
        }
        // Windows environment names are case insensitive; avoid duplicate PATH keys.
        const currentPath = env.Path || env.PATH || '';
        delete env.PATH;
        env.Path = [cargo, env.JAVA_HOME && join(env.JAVA_HOME, 'bin'), currentPath].filter(Boolean).join(';');
    }
    return env;
}
