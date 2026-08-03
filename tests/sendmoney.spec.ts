import { test, expect } from './fixtures';

function generateRandomAmount(): string {
  return (Math.floor(Math.random() * 50) + 10).toString(); // 10–59, safely small
}

test('send money transaction to payee with balance-aware retry', async ({ loggedInPage: page }) => {
  const paymentNote = 'Automated external payment test';
  const desiredPayee = 'Rahul Sharma';

  await page.getByTestId('sidebar-link-send-money').click();
  await expect(page.getByRole('heading', { name: 'Send Money' })).toBeVisible();

  // From Account
  await page.getByTestId('send-from-account-select').click();
  await page.getByRole('option').first().click();

  // Payee
  const payeeDropdown = page.locator('#payee-select-trigger');
  await payeeDropdown.click();

  const optionsList = page.getByRole('listbox');
  await expect(optionsList).toBeVisible();

  const payeeOptions = page.getByRole('option');
  const allPayees = await payeeOptions.allInnerTexts();
  const payeeExists = allPayees.some(text => text.includes(desiredPayee));

  if (payeeExists) {
    await page.getByRole('option', { name: desiredPayee }).click();
  } else {
    await page.getByTestId('add-payee-btn').click();
    await page.getByLabel('Payee Name').fill(desiredPayee);
    await page.getByLabel('Bank Name').fill('Chase Bank');
    await page.getByLabel('Routing Number').fill('123456789');
    await page.getByLabel('Account Number').fill('9876543210');
    await page.getByTestId('save-add-payee-btn').click();
    await expect(payeeDropdown).toContainText(desiredPayee);
  }

  await page.locator('input[placeholder="e.g. Dinner last night"]').fill(paymentNote);

  const amountField = page.locator('input[placeholder="0.00"]');
  let paymentAmount = generateRandomAmount();
  await amountField.fill(paymentAmount);

  await page.getByTestId('review-send-btn').click();

  // Check for insufficient funds, extract available balance if present, retry with a safe amount
  const insufficientFundsError = page.getByText(/Insufficient funds/i);
  const isInsufficient = await insufficientFundsError
    .waitFor({ state: 'visible', timeout: 3000 })
    .then(() => true)
    .catch(() => false);

  if (isInsufficient) {
    const errorText = await insufficientFundsError.textContent();
    console.log('Insufficient funds error:', errorText);

    const match = errorText?.match(/\$([\d,]+\.\d{2})/);
    const availableBalance = match ? parseFloat(match[1].replace(/,/g, '')) : 0;

    // Pick a safe amount well under the available balance
    paymentAmount = Math.max(1, Math.floor(availableBalance * 0.5)).toString();

    await amountField.clear();
    await amountField.fill(paymentAmount);

    await expect(insufficientFundsError).not.toBeVisible({ timeout: 3000 });
    await page.getByTestId('review-send-btn').click();
  }

  // Confirmation step
  await expect(page.getByTestId('confirm-send-btn')).toBeVisible();
await page.getByTestId('confirm-send-btn').click();

// Success
await expect(page.getByTestId('send-success-heading')).toHaveText('Money Sent Successfully');

const referenceNumber = await page.getByText(/^SND-\d{8}-\d{4}$/).textContent();
console.log('Reference Number:', referenceNumber);

await page.getByTestId('back-to-dashboard-btn').click();
await expect(page).toHaveURL('https://qaplayground.com/bank/send-money');
});