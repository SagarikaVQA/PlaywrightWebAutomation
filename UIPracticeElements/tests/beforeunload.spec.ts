import { test, expect } from '@playwright/test';

test.describe('BeforeUnload - Leave Page Warning', () => {

  test('dirty page should show leave-page warning', async ({ browser }) => {
    // 1. Create a fresh context and page to handle safe closing
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('/ui-practice/dialog');

    // 2. Locate the text field using the placeholder from the page snapshot
    const draft = page.getByPlaceholder("Type to make the page 'dirty'…");
    await draft.fill('Test data');

    // 3. Register the dialog event listener BEFORE triggering the action
    page.on('dialog', async dialog => {
      console.log('Dialog type:', dialog.type());
      console.log('Dialog message:', dialog.message());

      expect(dialog.type()).toBe('beforeunload');

      // Dismiss means "Cancel" -> We choose to stay on the page
      await dialog.dismiss();
    });

    // 4. BEST PRACTICE: Trigger the dialog using close with runBeforeUnload
    await page.close({ runBeforeUnload: true });

    // 5. Assert the dismissal worked: the field and its data are still visible
    await expect(draft).toBeVisible();
    await expect(draft).toHaveValue('Test data');

    // Clean up context
    await context.close();
  });

});
