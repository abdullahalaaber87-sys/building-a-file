import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const baseUrl = process.env.PREVIEW_URL || 'http://localhost:5173';
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));

try {
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });

  assert.equal(await page.getByRole('heading', { name: 'Modules.' }).count(), 1);
  await page.getByRole('switch', { name: 'Toggle FullBright' }).click();
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await page.getByRole('switch', { name: 'Toggle FullBright' }).getAttribute('aria-checked'), 'false');

  await page.getByRole('button', { name: /Movement 06/ }).click();
  assert.equal(await page.locator('.module-entry').count(), 6);
  await page.getByRole('button', { name: /All modules 58/ }).first().click();
  await page.getByRole('searchbox', { name: 'Search modules' }).fill('customcrosshair');
  assert.equal(await page.locator('.module-entry').count(), 1);
  assert.equal(await page.locator('.module-copy strong').first().textContent(), 'CustomCrosshair');
  await page.getByRole('searchbox', { name: 'Search modules' }).fill('');

  await page.getByRole('button', { name: 'HUD settings', exact: true }).click();
  await page.getByRole('button', { name: 'NONE', exact: true }).click();
  await page.keyboard.press('K');
  assert.equal(await page.getByRole('button', { name: 'K', exact: true }).count(), 1);
  await page.keyboard.press('K');
  assert.equal(await page.getByRole('switch', { name: 'Toggle HUD', exact: true }).getAttribute('aria-checked'), 'false');
  await page.keyboard.press('K');
  assert.equal(await page.getByRole('switch', { name: 'Toggle HUD', exact: true }).getAttribute('aria-checked'), 'true');

  await page.getByRole('switch', { name: 'Enable Spotify HUD preview' }).click();
  assert.equal(await page.getByText('Spotify HUD is off').count(), 1);
  await page.getByRole('switch', { name: 'Enable Spotify HUD preview' }).click();
  await page.getByRole('switch', { name: 'Show album artwork' }).click();
  assert.equal(await page.locator('.preview-scene .spotify-art').count(), 0);
  await page.getByRole('switch', { name: 'Show album artwork' }).click();
  await page.getByRole('button', { name: 'Next demo track' }).click();
  assert.equal(await page.locator('.preview-scene .spotify-track-name').textContent(), 'Afterglow');
  await page.getByRole('button', { name: 'Pause demo playback' }).click();
  assert.equal(await page.getByRole('button', { name: 'Play demo playback' }).count(), 1);

  await page.getByRole('button', { name: 'HUD Editor', exact: true }).click();
  assert.equal(await page.locator('.game-watermark').count(), 1);
  assert.equal(await page.locator('.game-coordinates').count(), 1);
  assert.equal(await page.locator('.game-hotbar').count(), 1);
  assert.equal(await page.locator('.game-module-list span').count(), 2);
  const draggable = page.getByRole('button', { name: /Move Spotify HUD/ });
  const before = await draggable.getAttribute('style');
  const box = await draggable.boundingBox();
  assert.ok(box);
  await page.mouse.move(box.x + 40, box.y + 25);
  await page.mouse.down();
  await page.mouse.move(box.x + 145, box.y - 55, { steps: 8 });
  await page.mouse.up();
  const after = await draggable.getAttribute('style');
  assert.notEqual(after, before);

  const watermark = page.getByRole('button', { name: /Move Watermalon watermark/ });
  const watermarkBefore = await watermark.getAttribute('style');
  const watermarkBox = await watermark.boundingBox();
  assert.ok(watermarkBox);
  await page.mouse.move(watermarkBox.x + 24, watermarkBox.y + 12);
  await page.mouse.down();
  await page.mouse.move(watermarkBox.x + 90, watermarkBox.y + 40, { steps: 6 });
  await page.mouse.up();
  assert.notEqual(await watermark.getAttribute('style'), watermarkBefore);

  await page.reload({ waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'HUD Editor', exact: true }).click();
  assert.equal(await page.getByRole('button', { name: /Move Spotify HUD/ }).getAttribute('style'), after);
  assert.notEqual(await page.getByRole('button', { name: /Move Watermalon watermark/ }).getAttribute('style'), watermarkBefore);

  await page.getByRole('button', { name: 'Appearance', exact: true }).first().click();
  await page.getByRole('button', { name: /Electric acid/ }).click();
  assert.equal(await page.locator('.game-shell').evaluate((element) => getComputedStyle(element).getPropertyValue('--accent').trim()), '#c9f36b');
  await page.getByRole('button', { name: 'Reset theme' }).click();
  assert.equal(await page.locator('.game-shell').evaluate((element) => getComputedStyle(element).getPropertyValue('--accent').trim()), '#ff6b8a');

  const window = page.locator('.client-window');
  const initialSize = await window.boundingBox();
  assert.ok(initialSize);
  await page.getByRole('slider', { name: 'Window width' }).focus();
  await page.keyboard.press('ArrowRight');
  const wider = await window.boundingBox();
  assert.ok(wider && wider.width > initialSize.width);
  await page.getByRole('slider', { name: 'Window height' }).focus();
  await page.keyboard.press('ArrowRight');
  const taller = await window.boundingBox();
  assert.ok(taller && taller.height > wider.height);

  const handle = page.getByRole('button', { name: /Resize Click GUI/ });
  const handleBox = await handle.boundingBox();
  assert.ok(handleBox);
  await page.mouse.move(handleBox.x + 8, handleBox.y + 8);
  await page.mouse.down();
  await page.mouse.move(handleBox.x + 42, handleBox.y + 34, { steps: 5 });
  await page.mouse.up();
  const resized = await window.boundingBox();
  assert.ok(resized && resized.width > taller.width && resized.height > taller.height);

  const headerBox = await page.locator('.window-header').boundingBox();
  const windowBeforeMove = await window.boundingBox();
  assert.ok(headerBox && windowBeforeMove);
  await page.mouse.move(headerBox.x + 90, headerBox.y + 10);
  await page.mouse.down();
  await page.mouse.move(headerBox.x + 120, headerBox.y + 28, { steps: 5 });
  await page.mouse.up();
  const windowAfterMove = await window.boundingBox();
  assert.ok(windowAfterMove && windowAfterMove.x !== windowBeforeMove.x && windowAfterMove.y !== windowBeforeMove.y);

  await page.getByRole('button', { name: 'Build notes' }).click();
  assert.equal(await page.getByRole('dialog').count(), 1);
  assert.equal((await page.request.get(`${baseUrl}/CLIENT_PORT.md`)).status(), 200);
  assert.equal((await page.request.get(`${baseUrl}/client-port.zip`)).status(), 200);
  assert.equal((await page.request.get(`${baseUrl}/watermalon-1.0.0.jar`)).status(), 200);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Close client preview' }).click();
  await page.keyboard.press('ShiftRight');
  assert.equal(await page.getByRole('main').count(), 1);
  assert.deepEqual(errors, []);

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.goto(baseUrl, { waitUntil: 'networkidle' });
  const size = await mobile.locator('body').evaluate((element) => ({ scrollWidth: element.scrollWidth, clientWidth: element.clientWidth }));
  assert.equal(size.scrollWidth, size.clientWidth);
  await mobile.getByRole('button', { name: 'HUD Editor', exact: true }).click();
  assert.equal(await mobile.getByRole('button', { name: /Move Spotify HUD/ }).count(), 1);
  console.log('Preview smoke checks passed');
} finally {
  await browser.close();
}