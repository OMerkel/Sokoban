// @ts-check
import { expect, test } from '@playwright/test';

test.describe('Sokoban application shell', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
  });

  test('shows the game board by default with all subpages hidden', async ({ page }) => {
    await expect(page.locator('#game-page')).toBeVisible();
    await expect(page.locator('#board svg')).toBeVisible();
    await expect(page.locator('#rules-page')).toBeHidden();
    await expect(page.locator('#options-menu')).toBeHidden();
    await expect(page.locator('#statistics-menu')).toBeHidden();
    await expect(page.locator('#about-page')).toBeHidden();
  });

  test('opens the hamburger menu revealing the side navigation panel', async ({ page }) => {
    await expect(page.locator('#left-panel')).not.toHaveClass(/open/);
    await page.locator('#customMenu').click();
    await expect(page.locator('#left-panel')).toHaveClass(/open/);
  });

  test('navigates to the rules subpage, hiding the game board, then back', async ({ page }) => {
    await page.locator('#customMenu').click();
    await page.locator('a[href="#rules-page"]').click();
    await expect(page.locator('#rules-page')).toBeVisible();
    await expect(page.locator('#game-page')).toBeHidden();

    await page.locator('#rules-page a[data-rel="back"]').first().click();
    await expect(page.locator('#game-page')).toBeVisible();
    await expect(page.locator('#rules-page')).toBeHidden();
  });

  test('navigates to the options subpage and back', async ({ page }) => {
    await page.locator('#customMenu').click();
    await page.locator('a[href="#options-menu"]').click();
    await expect(page.locator('#options-menu')).toBeVisible();
    await expect(page.locator('#game-page')).toBeHidden();

    await page.locator('#customOkOptions').click();
    await expect(page.locator('#game-page')).toBeVisible();
    await expect(page.locator('#options-menu')).toBeHidden();
  });

  test('navigates to the statistics subpage and back', async ({ page }) => {
    await page.locator('#customMenu').click();
    await page.locator('a[href="#statistics-menu"]').click();
    await expect(page.locator('#statistics-menu')).toBeVisible();
    await expect(page.locator('#game-page')).toBeHidden();

    await page.locator('#customBackStatistics').click();
    await expect(page.locator('#game-page')).toBeVisible();
  });

  test('navigates to the about subpage and back', async ({ page }) => {
    await page.locator('#customMenu').click();
    await page.locator('a[href="#about-page"]').click();
    await expect(page.locator('#about-page')).toBeVisible();
    await expect(page.locator('#game-page')).toBeHidden();

    await page.locator('#customBackAbout').click();
    await expect(page.locator('#game-page')).toBeVisible();
  });
});
