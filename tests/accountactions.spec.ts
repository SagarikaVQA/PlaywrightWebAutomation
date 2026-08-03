import { test, expect } from './fixtures';

function generateAccountName() {
  const suffix = Math.random().toString(36).substring(2, 7);
  return `TestAccount-${suffix}`;
}

async function createAccount(page: import('@playwright/test').Page, name: string, type: string, balance: string) {
  await page.getByTestId('sidebar-link-accounts').click();
  await expect(page.getByTestId('accounts-page')).toBeVisible();

  await page.getByTestId('add-account-btn').click();
  await page.getByLabel('Account Name').fill(name);
  await page.getByTestId('account-form-type-select').click();
  await page.getByRole('option', { name: type }).click();
  await page.locator('input[name="account_balance_field"]').fill(balance);
  await page.getByTestId('account-form-accept-terms-checkbox').click();
  await page.getByTestId('save-account-form-btn').click();
  await expect(page.getByText(name)).toBeVisible();
}

test.describe('view account details', () => {
  test('search, filter, and navigate back on account detail page', async ({ loggedInPage: page }) => {
    await page.getByTestId('sidebar-link-accounts').click();
    await expect(page.getByTestId('accounts-page')).toBeVisible();

    await page.getByTestId('view-account-btn').first().click();
    await expect(page.getByTestId('account-detail-page')).toBeVisible();

    // Valid search
    await page.getByTestId('txn-search-input').fill('Whole Foods');
    const searchResults = page.locator('table tbody tr');
    await expect(searchResults.first()).toContainText('Whole Foods');

    // Invalid search - no matches
    await page.getByTestId('txn-search-input').fill('ZZZ-NON-EXISTENT-TXN');
    await expect(page.getByText('No transactions match your filters.')).toBeVisible();

    // Clear resets the search
    await page.getByText('Clear', { exact: true }).click();
    await expect(page.getByTestId('txn-search-input')).toHaveValue('');
    await expect(searchResults.first()).toBeVisible();

    // Date range with no matches
    await page.getByTestId('txn-date-from-input').fill('2099-01-01');
    await page.getByTestId('txn-date-to-input').fill('2099-01-31');
    await expect(page.getByText('No transactions match your filters.')).toBeVisible();

    // Clear resets the date range too
    await page.getByText('Clear', { exact: true }).click();
    await expect(page.getByTestId('txn-date-from-input')).toHaveValue('');
    await expect(page.getByTestId('txn-date-to-input')).toHaveValue('');

    // Credits filter
    await page.getByRole('button', { name: 'Credits' }).click();
    const creditRows = page.locator('table tbody tr');
    const creditCount = await creditRows.count();
    for (let i = 0; i < creditCount; i++) {
      await expect(creditRows.nth(i).getByText(/^\+\$/)).toBeVisible();
    }

    // Debits filter
    await page.getByRole('button', { name: 'Debits' }).click();
    const debitRows = page.locator('table tbody tr');
    const debitCount = await debitRows.count();
    for (let i = 0; i < debitCount; i++) {
      await expect(debitRows.nth(i).getByText(/^-\$/)).toBeVisible();
    }

    // Back to All
    await page.getByRole('button', { name: 'All' }).click();

    // Navigate back to accounts list
    await page.getByTestId('back-to-accounts-link').click();
    await expect(page.getByTestId('accounts-page')).toBeVisible();
  });
});

test.describe('edit account', () => {
  test('update name, type, and balance', async ({ loggedInPage: page }) => {
    const originalName = generateAccountName();
    const updatedName = generateAccountName();
    await createAccount(page, originalName, 'Checking', '500');

    const row = page.getByTestId('account-row').filter({ hasText: originalName });
    await row.getByTestId('edit-account-btn').click();
    await expect(page.getByTestId('edit-account-dialog')).toBeVisible();

    await page.getByTestId('account-form-name-input').fill(updatedName);
    await page.getByTestId('account-form-type-select').click();
    await page.getByRole('option', { name: 'Savings' }).click();
    await page.locator('input[name="account_balance_field"]').fill('999');

    await page.getByTestId('save-account-form-btn').click();

    const updatedRow = page.getByTestId('account-row').filter({ hasText: updatedName });
    await expect(updatedRow.getByTestId('account-row-name')).toContainText(updatedName);
    await expect(updatedRow.getByTestId('account-row-type-badge')).toHaveText('Savings');
    await expect(updatedRow.getByTestId('account-row-balance')).toContainText('999');
  });

  test('cancel discards changes', async ({ loggedInPage: page }) => {
    const originalName = generateAccountName();
    await createAccount(page, originalName, 'Checking', '500');

    const row = page.getByTestId('account-row').filter({ hasText: originalName });
    await row.getByTestId('edit-account-btn').click();
    await expect(page.getByTestId('edit-account-dialog')).toBeVisible();

    await page.getByTestId('account-form-name-input').fill('Should-Not-Save');
    await page.getByTestId('cancel-account-form-btn').click();

    await expect(page.getByTestId('edit-account-dialog')).not.toBeVisible();
    await expect(page.getByText(originalName)).toBeVisible();
    await expect(page.getByText('Should-Not-Save')).not.toBeVisible();
  });

  test('empty account name is rejected', async ({ loggedInPage: page }) => {
    const originalName = generateAccountName();
    await createAccount(page, originalName, 'Checking', '500');

    const row = page.getByTestId('account-row').filter({ hasText: originalName });
    await row.getByTestId('edit-account-btn').click();
    await expect(page.getByTestId('edit-account-dialog')).toBeVisible();

    await page.getByTestId('account-form-name-input').fill('');
    await page.getByTestId('save-account-form-btn').click();

    // Dialog stays open and the account is not renamed to blank
    await expect(page.getByTestId('edit-account-dialog')).toBeVisible();
  });
});

test.describe('delete account', () => {
  test('cancel keeps the account', async ({ loggedInPage: page }) => {
    const accountName = generateAccountName();
    await createAccount(page, accountName, 'Checking', '250');

    const row = page.getByTestId('account-row').filter({ hasText: accountName });
    await row.getByRole('button', { name: `Delete ${accountName}` }).click();

    await expect(page.getByTestId('delete-account-dialog')).toBeVisible();
    await expect(page.getByTestId('delete-account-name')).toHaveText(accountName);

    await page.getByTestId('cancel-delete-account-btn').click();
    await expect(page.getByTestId('delete-account-dialog')).not.toBeVisible();
    await expect(page.getByText(accountName)).toBeVisible();
  });

  test('confirm removes the account', async ({ loggedInPage: page }) => {
    const accountName = generateAccountName();
    await createAccount(page, accountName, 'Checking', '250');

    const row = page.getByTestId('account-row').filter({ hasText: accountName });
    await row.getByRole('button', { name: `Delete ${accountName}` }).click();

    await expect(page.getByTestId('delete-account-dialog')).toBeVisible();
    await expect(page.getByText(`Are you sure you want to delete ${accountName}? This will also remove its transaction history. This action cannot be undone.`)).toBeVisible();

    await page.getByTestId('confirm-delete-account-btn').click();

    await expect(page.getByTestId('delete-account-dialog')).not.toBeVisible();
    await expect(page.getByText(accountName)).not.toBeVisible();
  });
});
