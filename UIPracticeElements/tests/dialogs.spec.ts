import { test, expect } from '@playwright/test';

test.describe('Alerts and Dialogs', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/ui-practice/dialog');
  });


  // 1. Simple Alert
  test('ALD_001 - Handle simple alert', async ({ page }) => {

    page.once('dialog', async dialog => {

      expect(dialog.type()).toBe('alert');

      expect(dialog.message()).toContain(
        'Hello! This is a simple alert'
      );

      await dialog.accept();
    });

    await page.getByRole('button', {
      name: 'Show Simple Alert'
    }).click();
  });


  // 2. Delayed Alert
  test('ALD_002 - Handle delayed alert', async ({ page }) => {

    page.once('dialog', async dialog => {

      expect(dialog.type()).toBe('alert');

      await dialog.accept();
    });

    await page.getByRole('button', {
      name: /Show Delayed Alert/
    }).click();
  });


  // 3. Delete Account - Confirm dialog
  test('ALD_003 - Accept delete account confirmation', async ({ page }) => {

    page.once('dialog', async dialog => {

      expect(dialog.type()).toBe('confirm');

      await dialog.accept();
    });

    await page.getByRole('button', {
      name: 'Delete Account'
    }).click();
  });


  // 4. Delete Account - Cancel confirmation
  test('ALD_004 - Cancel delete account confirmation', async ({ page }) => {

    page.once('dialog', async dialog => {

      expect(dialog.type()).toBe('confirm');

      await dialog.dismiss();
    });

    await page.getByRole('button', {
      name: 'Delete Account'
    }).click();
  });


  // 5. Prompt
  test('ALD_005 - Enter name in prompt', async ({ page }) => {

    page.once('dialog', async dialog => {

      expect(dialog.type()).toBe('prompt');

      await dialog.accept('Sagarika');
    });

    await page.getByRole('button', {
      name: 'Enter Your Name'
    }).click();

    await expect(
      page.getByText(/Sagarika/i)
    ).toBeVisible();
  });


  // 6. Cancel Prompt
  test('ALD_006 - Cancel name prompt', async ({ page }) => {

    page.once('dialog', async dialog => {

      expect(dialog.type()).toBe('prompt');

      await dialog.dismiss();
    });

    await page.getByRole('button', {
      name: 'Enter Your Name'
    }).click();
  });


  // 7. Success Toast
  test('ALD_007 - Verify success toast', async ({ page }) => {

    await page.getByRole('button', {
      name: 'Trigger Success Toast'
    }).click();

    const toast = page.getByText(
      'Saved successfully!'
    );

    await expect(toast).toBeVisible();

    await expect(toast).toBeHidden({
      timeout: 5000
    });
  });


  // 8. Error Toast
  test('ALD_008 - Verify error toast', async ({ page }) => {

    await page.getByRole('button', {
      name: 'Trigger Error Toast'
    }).click();

    const toast = page.getByText(
      'Something went wrong.'
    );

    await expect(toast).toBeVisible();

    await expect(toast).toBeHidden({
      timeout: 5000
    });
  });

});