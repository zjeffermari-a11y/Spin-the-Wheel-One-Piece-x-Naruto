import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests/browser',
    timeout: 150000,
    workers: 1,
    use: {
        baseURL: 'http://127.0.0.1:4173',
        channel: process.platform === 'win32' ? 'msedge' : undefined,
        viewport: { width: 390, height: 844 },
        trace: 'retain-on-failure'
    },
    webServer: {
        command: 'node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4173 --strictPort',
        url: 'http://127.0.0.1:4173',
        reuseExistingServer: false
    }
});
