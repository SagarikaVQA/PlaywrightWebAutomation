import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('https://qaplayground.com/bank/login');
  await expect(page).toHaveTitle(/QA Playground/);
});

test('valid login', async ({ page }) => {
  await page.goto('https://qaplayground.com/bank/login');

  await page.getByTestId('login-username-input').fill('standard_user');
  await page.getByTestId('login-password-input').fill('bank_sauce');
  await page.getByTestId('login-submit-btn').click();

  await expect(page.getByTestId('bank-dashboard-page')).toBeVisible();
  await expect(page.getByTestId('dashboard-welcome-message')).toBeVisible();
});
