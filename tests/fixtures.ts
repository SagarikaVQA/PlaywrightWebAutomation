import { test as base, expect } from '@playwright/test';

type MyFixtures = {
  loggedInPage: import('@playwright/test').Page;
};

export const test = base.extend<MyFixtures>({
  loggedInPage: async ({ page }, use) => {
    await page.goto('https://qaplayground.com/bank/login');
    await page.getByTestId('login-username-input').fill('standard_user');
    await page.getByTestId('login-password-input').fill('bank_sauce');
    await page.getByTestId('login-submit-btn').click();
    await expect(page.getByTestId('dashboard-welcome-message')).toBeVisible();

    await use(page);
  },
});

export { expect };