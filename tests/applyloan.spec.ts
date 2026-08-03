import { test, expect } from './fixtures';

test('apply for a loan', async ({ loggedInPage: page }) => {
  await page.getByTestId('sidebar-link-apply-loan').click();

  // Open the modal — real button text is "Apply for Loan"
  await page.getByRole('button', { name: 'Apply for Loan' }).click();
  await expect(page.getByRole('heading', { name: 'Apply for a Loan' })).toBeVisible();

  // Loan Type
  await page.getByRole('combobox', { name: 'Loan Type' }).click();
  await page.getByRole('option', { name: 'Home' }).click();

  // Loan Amount
  await page.getByRole('spinbutton', { name: 'Loan Amount' }).fill('15000.00');

  // Term Length (default is already "36" per the snapshot, but explicit selection shown below)
  await page.getByRole('combobox', { name: 'Term Length' }).click();
  await page.getByRole('option', { name: '36' }).click();

  // Interest Rate
  await page.getByRole('spinbutton', { name: 'Interest Rate (%)' }).fill('5.0');

  // Disbursement Account
  await page.getByRole('combobox', { name: 'Disbursement Account' }).click();
  await page.getByRole('option').first().click();

  // Purpose
  await page.getByRole('textbox', { name: 'What will this loan be used for?' })
    .fill('Automated business extension development');

  // Review
  await page.getByRole('button', { name: 'Review Application' }).click();

  // Confirm
await expect(page.getByText('Confirm Loan Application')).toBeVisible();
await page.getByRole('button', { name: 'Submit Application' }).click();

// Success
await expect(page.getByTestId('loan-success-heading')).toHaveText('Application Submitted');

const referenceNumber = await page.getByTestId('loan-ref-id').textContent();
console.log('Reference Number:', referenceNumber);

  await page.getByRole('button', { name: 'Back to Dashboard' }).click();
  await expect(page).toHaveURL('https://qaplayground.com/bank/apply-loan');
  // --- Verify loan appears when searching by reference number ---
  await page.getByTestId('sidebar-link-apply-loan').click();
  await page.getByPlaceholder('Search reference or purpose…').fill(referenceNumber ?? '');

  const loanRow = page.locator('table tbody tr').filter({ hasText: referenceNumber ?? '' });
  await expect(loanRow).toBeVisible();
  await expect(loanRow.getByTestId('loan-history-type-badge')).toHaveText('Home');
await expect(loanRow.getByTestId('loan-history-date')).toBeVisible();
await expect(loanRow).toContainText(/pending/i);

  // --- Click the row to open loan details ---
  await loanRow.click();

  await expect(page.getByRole('heading', { name: 'Loan Details' })).toBeVisible();
  await expect(page.getByText(referenceNumber ?? '')).toBeVisible();
  await expect(page.getByText(/Pending|Approved|Closed/i)).toBeVisible();

  // Navigate back
  await page.getByTestId('loan-details-back-btn').click();
  await expect(page.getByRole('heading', { name: 'Apply for a Loan' })).toBeVisible();
});
