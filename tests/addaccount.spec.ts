import { test, expect } from './fixtures';

function generateAccountName() {
  const suffix = Math.random().toString(36).substring(2, 7);
  return `TestAccount-${suffix}`;
}

function generateBalance() {
  return (Math.floor(Math.random() * 5000) + 100).toString();
}

test('add 4 new accounts', async ({ loggedInPage: page }) => {
  const accountTypes = ['Checking', 'Savings', 'Credit', 'Checking'];

  await page.getByTestId('sidebar-link-accounts').click();
  await expect(page.getByTestId('accounts-page')).toBeVisible();

  for (let i = 0; i < 4; i++) {
    const accountName = generateAccountName();
    const balance = generateBalance();

    await page.getByTestId('add-account-btn').click();
    await expect(page.getByText('Add New Account')).toBeVisible();

    await page.getByLabel('Account Name').fill(accountName);

    await page.getByTestId('account-form-type-select').click();
    await page.getByRole('option', { name: accountTypes[i] }).click();

    await page.locator('input[name="account_balance_field"]').fill(balance);

    await page.getByTestId('account-form-accept-terms-checkbox').click();

    await page.getByTestId('save-account-form-btn').click();

    await expect(page.getByText(accountName)).toBeVisible();
  }

 // await page.pause();
});