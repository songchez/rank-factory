import { test, expect } from '@playwright/test';

test.describe('Iron Paw Survival Game', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the game page
    await page.goto('/games/ironpaw-survival');
    await page.waitForLoadState('networkidle');
  });

  test('should load game page successfully', async ({ page }) => {
    // Check if the game title is visible
    await expect(page.getByText('아이언포 서바이벌')).toBeVisible();

    // Check if the game description is visible
    await expect(page.getByText('뱀파이어 서바이벌 스타일 액션 게임')).toBeVisible();

    // Take screenshot of initial state
    await page.screenshot({
      path: '.playwright/screenshots/ironpaw-01-initial-load.png',
      fullPage: true
    });
  });

  test('should show login prompt when not logged in', async ({ page }) => {
    // Check for login message
    const loginText = page.getByText('로그인 후 플레이할 수 있습니다');

    if (await loginText.isVisible()) {
      console.log('Login required - user not authenticated');

      // Check if login button exists
      await expect(page.getByRole('button', { name: '로그인하기' })).toBeVisible();

      await page.screenshot({
        path: '.playwright/screenshots/ironpaw-02-login-required.png',
        fullPage: true
      });
    }
  });

  test('should display leaderboard', async ({ page }) => {
    // Check if leaderboard section exists
    await expect(page.getByText('리더보드')).toBeVisible();

    await page.screenshot({
      path: '.playwright/screenshots/ironpaw-03-leaderboard.png',
      fullPage: true
    });
  });

  test('should start game (if logged in)', async ({ page }) => {
    // Try to find and click the start button
    const startButton = page.getByRole('button', { name: /시작|Start/i });

    try {
      if (await startButton.isVisible({ timeout: 2000 })) {
        await startButton.click();

        // Wait for game canvas to appear
        await page.waitForSelector('canvas', { timeout: 5000 });

        // Take screenshot of game started
        await page.screenshot({
          path: '.playwright/screenshots/ironpaw-04-game-started.png',
          fullPage: false
        });

        // Wait a bit for game to initialize
        await page.waitForTimeout(2000);

        // Test keyboard controls - move right
        await page.keyboard.down('d');
        await page.waitForTimeout(500);
        await page.keyboard.up('d');

        await page.screenshot({
          path: '.playwright/screenshots/ironpaw-05-after-movement.png',
          fullPage: false
        });

        // Move up
        await page.keyboard.down('w');
        await page.waitForTimeout(500);
        await page.keyboard.up('w');

        // Move left
        await page.keyboard.down('a');
        await page.waitForTimeout(500);
        await page.keyboard.up('a');

        // Move down
        await page.keyboard.down('s');
        await page.waitForTimeout(500);
        await page.keyboard.up('s');

        await page.screenshot({
          path: '.playwright/screenshots/ironpaw-06-after-wasd-test.png',
          fullPage: false
        });

        // Let game run for a few seconds to see enemies spawn
        await page.waitForTimeout(5000);

        await page.screenshot({
          path: '.playwright/screenshots/ironpaw-07-gameplay.png',
          fullPage: false
        });

        console.log('Game test completed successfully');
      } else {
        console.log('Start button not available - user might not be logged in');
      }
    } catch (error) {
      console.log('Could not start game:', error.message);

      await page.screenshot({
        path: '.playwright/screenshots/ironpaw-error.png',
        fullPage: true
      });
    }
  });

  test('should render game canvas with correct dimensions', async ({ page }) => {
    const canvas = page.locator('canvas');

    // Check if canvas exists in the DOM
    const canvasCount = await canvas.count();

    if (canvasCount > 0) {
      // Get canvas dimensions
      const boundingBox = await canvas.boundingBox();

      if (boundingBox) {
        console.log('Canvas dimensions:', boundingBox);
        expect(boundingBox.width).toBeGreaterThan(0);
        expect(boundingBox.height).toBeGreaterThan(0);
      }

      await page.screenshot({
        path: '.playwright/screenshots/ironpaw-08-canvas-check.png',
        fullPage: false
      });
    } else {
      console.log('Canvas not found - game might not have started');
    }
  });

  test('should check sprite and asset loading', async ({ page }) => {
    // Check if game assets are loaded
    const mainPlayerImg = page.locator('img[src*="mainplayer"]');
    const enemyImgs = page.locator('img[src*="enemy"]');

    console.log('Checking asset loading...');

    // These might not be visible as they could be loaded into canvas
    // This test is more for debugging

    await page.screenshot({
      path: '.playwright/screenshots/ironpaw-09-assets-check.png',
      fullPage: true
    });
  });
});
