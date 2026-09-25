import { chromium, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

// Connect only to the dedicated test instance started with a temporary WebView2 profile.
const browser = await chromium.connectOverCDP('http://127.0.0.1:9223');
try {
    const context = browser.contexts()[0];
    const page = context.pages()[0] || await context.waitForEvent('page');
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await expect(page.getByRole('button', { name: 'COMMENCE', exact: true })).toBeVisible();
    console.log('Windows WebView loaded:', page.url());
    await context.setOffline(true);
    await page.reload();
    await expect(page.getByRole('button', { name: 'COMMENCE', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'COMMENCE', exact: true }).click();
    await page.getByRole('button', { name: 'AUTO', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Create Offline Character', exact: true })).toBeVisible({ timeout: 120000 });
    await page.getByRole('button', { name: 'Create Offline Character', exact: true }).click();
    await expect(page.getByText('Local template lore', { exact: true })).toBeVisible();
    page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: /save/i }).first().click();
    const savedName = await page.evaluate(() => JSON.parse(localStorage.getItem('spinYourDestiny_saves'))[0].lore.name);
    await page.reload();
    await page.getByTitle('Crew', { exact: true }).click();
    await page.getByText(savedName, { exact: true }).click();
    await expect(page.getByText('Local template lore', { exact: true })).toBeVisible();
    await mkdir('test-results', { recursive: true });
    await page.screenshot({ path: 'test-results/windows-offline-character.png', fullPage: true });
    expect(errors).toEqual([]);
    console.log('Windows offline build, local save and reopen passed.');
} finally { await browser.close(); }
