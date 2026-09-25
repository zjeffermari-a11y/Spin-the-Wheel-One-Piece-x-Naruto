import { test, expect } from '@playwright/test';

test('production app reopens offline and builds, saves and reopens a local character', async ({ page, context }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/');
    await expect(page.getByText('Ready to reopen offline on this device.')).toBeVisible();
    await page.evaluate(() => navigator.serviceWorker.ready);
    await context.setOffline(true);
    await page.reload();
    await expect(page.getByText('Offline — local character creation and saves are available.')).toBeVisible();
    await page.getByRole('button', { name: 'COMMENCE', exact: true }).click();
    await page.getByRole('button', { name: 'AUTO', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Create Offline Character', exact: true })).toBeVisible({ timeout: 120000 });
    await page.getByRole('button', { name: 'Create Offline Character', exact: true }).click();
    await expect(page.getByText('Local template lore', { exact: true })).toBeVisible();
    await expect(page.getByText('Created on this device using templates.')).toBeVisible();
    page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: /save/i }).first().click();
    await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('spinYourDestiny_saves') || '[]').length)).toBe(1);
    await page.screenshot({ path: 'test-results/offline-character-mobile.png', fullPage: true });
    await page.reload();
    await page.getByTitle('Crew', { exact: true }).click();
    await expect(page.getByText('Your Legends Roster')).toBeVisible();
    const savedName = await page.evaluate(() => JSON.parse(localStorage.getItem('spinYourDestiny_saves'))[0].lore.name);
    await page.getByText(savedName, { exact: true }).click();
    await expect(page.getByText('Local template lore', { exact: true })).toBeVisible();
    expect(errors).toEqual([]);
});

test('manifest and cache contain local assets only, excluding server output', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Ready to reopen offline on this device.')).toBeVisible();
    const result = await page.evaluate(async () => {
        const manifest = await fetch('/manifest.webmanifest').then(r => r.json());
        const keys = await caches.keys();
        const cache = await caches.open(keys.find(k => k.startsWith('summon-shell-')));
        return { manifest, assets: (await cache.keys()).map(r => r.url) };
    });
    expect(result.manifest.display).toBe('standalone');
    expect(result.assets.some(url => /woff2$/.test(url))).toBe(true);
    expect(result.assets.every(url => url.startsWith('http://127.0.0.1:4173/'))).toBe(true);
    expect(result.assets.some(url => /server\.cjs|\/api\//.test(url))).toBe(false);
});
