import { test, expect } from './fixtures';

test('transfer money between accounts (dynamic)', async ({ loggedInPage: page }) => {
  // Go to Accounts and check how many exist
  await page.getByTestId('sidebar-link-accounts').click();
  await expect(page.getByTestId('accounts-page')).toBeVisible();

  const accountRows = page.getByTestId('accounts-table').locator('tbody tr');
let accountCount = await accountRows.count();
  // Ensure at least 2 accounts exist — add more if needed
  while (accountCount < 2) {
    await page.getByTestId('add-account-btn').click();
    await expect(page.getByText('Add New Account')).toBeVisible();

    const newName = `AutoAccount${Date.now()}`;
    await page.getByLabel('Account Name').fill(newName);

    await page.getByTestId('account-form-type-select').click();
    await page.getByRole('option', { name: 'Checking' }).click();

    await page.locator('input[name="account_balance_field"]').fill('500');
    await page.getByTestId('account-form-accept-terms-checkbox').click();
    await page.getByTestId('save-account-form-btn').click();

    await expect(page.getByText(newName)).toBeVisible();
    accountCount = await accountRows.count();
  }

  // Go to Transfer
  await page.getByTestId('sidebar-link-transfer').click();
  await expect(page.getByText('Transfer Money')).toBeVisible();

  // Open "From Account" dropdown and pick the first available option
  await page.getByTestId('transfer-from-select').click();
  const fromOptions = page.getByRole('option');
  const fromText = await fromOptions.first().textContent();
  await fromOptions.first().click();

  // Open "To Account" dropdown and pick the first option that isn't the "From" one
  await page.getByTestId('transfer-to-select').click();
  const toOptions = page.getByRole('option');
  const toCount = await toOptions.count();

  let picked = false;
  for (let i = 0; i < toCount; i++) {
    const text = await toOptions.nth(i).textContent();
    if (text !== fromText) {
      await toOptions.nth(i).click();
      picked = true;
      break;
    }
  }
  expect(picked).toBeTruthy();

  // Amount
  await page.getByRole('spinbutton', { name: 'Amount' }).fill('100');

  // Memo
  await page.getByPlaceholder(/Rent, vacation fund/).fill('automated transfer');

  // Review + confirm
  await page.getByTestId('review-transfer-btn').click();
  await expect(page.getByTestId('transfer-confirm-title')).toBeVisible();
  await page.getByTestId('confirm-transfer-btn').click();

  // Success
  //await expect(page.getByText('Transfer Successful')).toBeVisible();
  await expect(page.getByTestId('transfer-success-heading')).toBeVisible();
  await page.getByRole('button', { name: 'Back to Dashboard' }).click();
  await expect(page.getByText('Transfer Money')).toBeVisible();
});