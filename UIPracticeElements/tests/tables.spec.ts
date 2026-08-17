import { test, expect } from './fixtures/tablesPage.fixture';

test('search and edit product dynamically', async ({ tablePage, page }) => {
  await tablePage.navigate();

  await tablePage.searchProduct('ipad Air');
  await expect(page.getByText('iPad Air')).toBeVisible();

  await tablePage.editProductCategoryByName('iPad Air', 'Tablets updated');
  await expect(page.getByText('Tablets updated')).toBeVisible();

  await tablePage.deleteProductByName('iPad Air');
  await expect(page.getByText('iPad Air')).not.toBeVisible();

  await tablePage.clearProductSearch();
});

test('edit and delete department', async ({ tablePage, page }) => {
  await tablePage.navigate();

  await tablePage.editDepartment('1', { name: 'Aarav Sharmac', salary: '85001' });
  await tablePage.toggleDepartmentStatus('1');

  await expect(page.getByText('Aarav Sharmac')).toBeVisible();
  await expect(page.getByText('$85,001')).toBeVisible();

  await tablePage.deleteDepartment('1');
  await expect(page.getByText('Aarav Sharmac')).not.toBeVisible();
});

test('department pagination', async ({ tablePage }) => {
  await tablePage.navigate();

  await tablePage.goToDepartmentsPage(2);
  await tablePage.goToDepartmentsPage(3);
});

test('navigate to iframes section', async ({ tablePage, page }) => {
  await tablePage.navigate();

  await tablePage.goToIframesSection();
  await expect(page).toHaveURL(/iframes/);
});