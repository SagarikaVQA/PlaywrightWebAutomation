import { test, expect } from './fixtures';

test('verify successful bill payment workflow', async ({ loggedInPage: page }) => {
  // 1. Navigate to Bill Pay page from the sidebar menu
  await page.getByTestId('sidebar-link-bill-pay').click();
  
  // FIX: Target the explicit test ID for the page title container
  await expect(page.getByTestId('bill-pay-page-title')).toBeVisible();

  // 2. Select account from dropdown with ID bill-pay-from-trigger
  const accountDropdown = page.locator('#bill-pay-from-trigger');
  await accountDropdown.click();
  await page.getByRole('option').first().click();

  // 3. Search and select a biller in the input area
  const billerInput = page.locator('#biller-search-input');
  await billerInput.click();
  await billerInput.fill('City Electric');
  
  // Select the specific biller from the visible options list
  await page.getByRole('option', { name: /City Electric/i }).click();

  // 4. Populate the payment amount field manually using the designated spinbutton role
  const amountField = page.getByRole('spinbutton', { name: /Amount/i });
  await amountField.click();
  await amountField.fill('120.50');

  // 5. Select execution date from the calendar input field
  const dateInput = page.locator('#bill-payment-date');
  await dateInput.fill('2026-08-15'); 
  // Explicitly dispatch the native input change event to update form state bindings
  await dateInput.dispatchEvent('change');

  // 6. Click on review payment action item button
  //await page.locator('#review-bill-btn').click();
  await page.getByRole('button', { name: 'Review Payment' }).click();

  // 7. Verify preview context layout and confirm payment
  //await page.locator('#confirm-bill-btn').click();
  await page.getByRole('button', { name: 'Confirm Payment' }).click();

//   // 8. Assert success heading string is visible on screen
//   const successHeading = page.locator('#bill-pay-success-heading');
//   await expect(successHeading).toContainText('Payment Scheduled');
 await expect(page.getByRole('heading', { name: 'Payment Scheduled', level: 1 })).toBeVisible();

    // 9. Extract and print reference number
const referenceNumber = await page.getByTestId('bill-pay-ref-id').textContent();
console.log('Reference Number:', referenceNumber);

  // 10. Click back to baseline view and assert destination URL path matches specification
  await page.getByTestId('back-to-dashboard-btn').click();
  await expect(page).toHaveURL('https://qaplayground.com/bank/bill-pay');
});
