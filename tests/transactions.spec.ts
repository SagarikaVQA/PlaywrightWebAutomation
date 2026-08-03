import { test, expect } from './fixtures';

function generateAccountName() {
  const suffix = Math.random().toString(36).substring(2, 7);
  return `TestAccount-${suffix}`;
}

test('create account, transfer, then verify in transactions', async ({ loggedInPage: page }) => {
  const accountName = generateAccountName();

  // --- Create account ---
  await page.getByTestId('sidebar-link-accounts').click();
  await expect(page.getByTestId('accounts-page')).toBeVisible();

  await page.getByTestId('add-account-btn').click();
  await page.getByLabel('Account Name').fill(accountName);
  await page.getByTestId('account-form-type-select').click();
  await page.getByRole('option', { name: 'Checking' }).click();
  await page.locator('input[name="account_balance_field"]').fill('500');
  await page.getByTestId('account-form-accept-terms-checkbox').click();
  await page.getByTestId('save-account-form-btn').click();
  await expect(page.getByText(accountName)).toBeVisible();

  // --- Transfer FROM this new account to Everyday Checking ---
  await page.getByTestId('sidebar-link-transfer').click();
  await page.getByTestId('transfer-from-select').click();
  await page.getByRole('option', { name: new RegExp(accountName) }).click();

  await page.getByTestId('transfer-to-select').click();
  await page.getByRole('option', { name: /Everyday Checking/ }).click();

  await page.getByRole('spinbutton', { name: 'Amount' }).fill('50');
  await page.getByTestId('review-transfer-btn').click();
  await expect(page.getByTestId('transfer-confirm-title')).toBeVisible();
  await page.getByTestId('confirm-transfer-btn').click();
  await expect(page.getByText('Transfer Successful')).toBeVisible();
  await page.getByRole('button', { name: 'Back to Dashboard' }).click();

  // --- Verify it shows up in Transactions ---
  await page.getByTestId('sidebar-link-transactions').click();
  await page.getByTestId('all-txn-search-input').fill(accountName);

  const searchResults = page.locator('table tbody tr');
  await expect(searchResults.first()).toContainText(accountName);
});

test('search transactions - valid and invalid filters', async ({ loggedInPage: page }) => {
  await page.getByTestId('sidebar-link-transactions').click();
  await expect(page.getByTestId('transactions-page')).toBeVisible();

  const allRows = page.locator('table tbody tr');
  await expect(allRows.first()).toBeVisible();

  // Search for a guaranteed non-existent account
  await page.getByTestId('all-txn-search-input').fill('ZZZ-NON-EXISTENT');
  await expect(page.getByText('No transactions match your filters.')).toBeVisible();

  // Clear search
  await page.getByText('Clear').click();
  await expect(page.getByTestId('all-txn-search-input')).toHaveValue('');
});

test('filter transactions by credits and debits', async ({ loggedInPage: page }) => {
  await page.getByTestId('sidebar-link-transactions').click();
  await expect(page.getByTestId('transactions-page')).toBeVisible();

  // Credits
  await page.getByRole('button', { name: 'Credits' }).click();
  const creditRows = page.locator('table tbody tr');
  const creditCount = await creditRows.count();
  for (let i = 0; i < creditCount; i++) {
    await expect(creditRows.nth(i).getByText(/^\+\$/)).toBeVisible();
  }

  // Debits
  await page.getByRole('button', { name: 'Debits' }).click();
  const debitRows = page.locator('table tbody tr');
  const debitCount = await debitRows.count();
  for (let i = 0; i < debitCount; i++) {
    await expect(debitRows.nth(i).getByText(/^-\$/)).toBeVisible();
  }

  // Reset to All
  await page.getByRole('button', { name: 'All' }).click();
});

test('download transactions CSV', async ({ loggedInPage: page }) => {
  await page.getByTestId('sidebar-link-transactions').click();
  await expect(page.getByTestId('transactions-page')).toBeVisible();

  // Start waiting for download before clicking button
  const downloadPromise = page.waitForEvent('download');
  await page.getByTestId('download-all-transactions-btn').click();
  const download = await downloadPromise;

  // Assert correct file extension
  expect(download.suggestedFilename()).toContain('.csv');

  // Stream data into memory using web-standard streams
  const readableStream = await download.createReadStream();
  if (readableStream) {
    let content = '';
    const decoder = new TextDecoder('utf-8');

    for await (const chunk of readableStream) {
      // Safely decode chunks into a string without using Node Buffer
      content += decoder.decode(chunk as BufferSource, { stream: true });
    }
    content += decoder.decode(); // Flush the decoder stream

    // Assert file integrity
    expect(content.length).toBeGreaterThan(0);
    
    const firstLine = content.split('\n')[0].toLowerCase();
    expect(firstLine).toContain('date');
    expect(firstLine).toContain('amount');
  }
});