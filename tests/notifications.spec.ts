import { test, expect } from './fixtures';

test('view notifications and unread count', async ({ loggedInPage: page }) => {
  await page.getByTestId('sidebar-link-notifications').click();
  await expect(page.getByTestId('notifications-page')).toBeVisible();

  // Verify page heading and initial unread count
  await expect(page.getByRole('heading', { name: 'Notifications' })).toBeVisible();
  await expect(page.getByText('2 unread notifications')).toBeVisible();

  // Verify specific notification content
  await expect(page.getByText('Transfer Completed')).toBeVisible();
  await expect(page.getByText(/Your transfer of \$500\.00 to Everyday Checking was successful\./)).toBeVisible();
});

test('mark a single notification as read', async ({ loggedInPage: page }) => {
  await page.getByTestId('sidebar-link-notifications').click();
  await expect(page.getByTestId('notifications-page')).toBeVisible();

  await expect(page.getByText('2 unread notifications')).toBeVisible();

  // Target the exact "Mark read" button using its accessible name
  await page.getByRole('button', { name: /Mark "Transfer Completed" as read/ }).click();

  // Unread count should decrease to 1
  await expect(page.getByText('1 unread notification')).toBeVisible();
});

test('mark all notifications as read', async ({ loggedInPage: page }) => {
  await page.getByTestId('sidebar-link-notifications').click();
  await expect(page.getByTestId('notifications-page')).toBeVisible();

  await page.getByTestId('mark-all-read-btn').click();

  // No mark-read buttons should remain — all notifications are now read
  await expect(page.getByTestId('mark-read-btn')).toHaveCount(0);
});