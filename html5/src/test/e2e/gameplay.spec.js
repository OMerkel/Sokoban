// @ts-check
import { expect, test } from '@playwright/test';

test.describe('Sokoban gameplay', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
    // Level 0 is a deterministic 3-wide push puzzle solved by "UU".
    await page.evaluate(() => localStorage.setItem('SokobanChallenge', '0'));
    await page.reload();
  });

  test('completes level 0 by pushing the box up twice', async ({ page }) => {
    const up = page.locator('#board svg [data-control="move-up"]');
    await up.click();
    await up.click();

    await page.locator('#customMenu').click();
    await page.locator('a[href="#statistics-menu"]').click();
    await expect(page.locator('#completed')).toContainText('successfully completed');
  });

  test('undo reverts the last push', async ({ page }) => {
    const up = page.locator('#board svg [data-control="move-up"]');
    await up.click();

    await page.locator('#customMenu').click();
    await page.locator('#undo').click();

    await page.locator('#customMenu').click();
    await page.locator('a[href="#statistics-menu"]').click();
    await expect(page.locator('#moves')).toHaveText('No');
    await expect(page.locator('#pushes')).toHaveText('zero');
  });

  test('undo reverts the last push when "ctrl+z" is pressed', async ({ page }) => {
    const up = page.locator('#board svg [data-control="move-up"]');
    await up.click();

    await page.keyboard.press('Control+z');

    await page.locator('#customMenu').click();
    await page.locator('a[href="#statistics-menu"]').click();
    await expect(page.locator('#moves')).toHaveText('No');
    await expect(page.locator('#pushes')).toHaveText('zero');
  });

  test('next/previous switch levels and persist the choice across reload', async ({ page }) => {
    await page.locator('#customMenu').click();
    await page.locator('#next').click();

    const headerAfterNext = await page.locator('#myheader').textContent();
    expect(headerAfterNext).toContain('l1');

    await page.reload();
    const headerAfterReload = await page.locator('#myheader').textContent();
    expect(headerAfterReload).toContain('l1');

    await page.locator('#customMenu').click();
    await page.locator('#previous').click();
    const headerAfterPrevious = await page.locator('#myheader').textContent();
    expect(headerAfterPrevious).toContain('l0');
  });

  test('"ctrl+g" and "ctrl+shift+g" switch levels', async ({ page }) => {
    await page.keyboard.press('Control+g');
    const headerAfterNext = await page.locator('#myheader').textContent();
    expect(headerAfterNext).toContain('l1');

    await page.keyboard.press('Control+Shift+g');
    const headerAfterPrevious = await page.locator('#myheader').textContent();
    expect(headerAfterPrevious).toContain('l0');
  });

  test('restart clears the move history for the current level', async ({ page }) => {
    const up = page.locator('#board svg [data-control="move-up"]');
    await up.click();

    await page.locator('#customMenu').click();
    await page.locator('#restart').click();

    await page.locator('#customMenu').click();
    await page.locator('a[href="#statistics-menu"]').click();
    await expect(page.locator('#moves')).toHaveText('No');
  });

  test('completes level 0 by pushing the box up twice with the "w" key', async ({ page }) => {
    await page.keyboard.press('w');
    await page.keyboard.press('w');

    await page.locator('#customMenu').click();
    await page.locator('a[href="#statistics-menu"]').click();
    await expect(page.locator('#completed')).toContainText('successfully completed');
  });

  test('completes level 0 by pushing the box up twice with the ArrowUp key', async ({ page }) => {
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowUp');

    await page.locator('#customMenu').click();
    await page.locator('a[href="#statistics-menu"]').click();
    await expect(page.locator('#completed')).toContainText('successfully completed');
  });

  test('ignores keyboard controls while a subpage covers the game board', async ({ page }) => {
    await page.locator('#customMenu').click();
    await page.locator('a[href="#rules-page"]').click();

    await page.keyboard.press('w');

    await page.locator('#rules-page a[data-rel="back"]').first().click();
    await page.locator('#customMenu').click();
    await page.locator('a[href="#statistics-menu"]').click();
    await expect(page.locator('#moves')).toHaveText('No');
  });
});
