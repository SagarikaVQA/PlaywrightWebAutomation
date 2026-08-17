import { Page } from '@playwright/test';

export class TablePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get staticTable() { return this.page.locator('[data-testid="static-table"]'); }
  get staticRows() { return this.page.locator('[data-testid="static-tbody"] tr'); }

  async navigate() {
    await this.page.goto('/ui-practice/tables');
  }

  // ---- Shopping Products table ----

  async searchProduct(name: string) {
    await this.page.getByTestId('products-search').fill(name);
  }

  async clearProductSearch() {
    await this.page.getByTestId('products-clear-btn').click();
  }

  async editProductCategory(rowId: string, newCategory: string) {
    await this.page.getByTestId(`products-edit-btn-${rowId}`).click();
    await this.page.getByTestId(`products-edit-category-${rowId}`).fill(newCategory);
    await this.page.getByTestId(`products-save-btn-${rowId}`).click();
  }

  async deleteProduct(rowId: string) {
    await this.page.getByTestId(`products-delete-btn-${rowId}`).click();
  }

  async getProductRowIdByName(productName: string): Promise<string> {
    const nameCell = this.page.locator('[data-testid^="products-name-"]').filter({ hasText: productName });
    const testId = await nameCell.getAttribute('data-testid');
    return testId?.replace('products-name-', '') ?? '';
  }

  async editProductCategoryByName(productName: string, newCategory: string) {
    const rowId = await this.getProductRowIdByName(productName);
    await this.editProductCategory(rowId, newCategory);
  }

  async deleteProductByName(productName: string) {
    const rowId = await this.getProductRowIdByName(productName);
    await this.deleteProduct(rowId);
  }

  // ---- Departments table ----

  async editDepartment(rowId: string, { name, salary }: { name?: string; salary?: string }) {
    await this.page.getByTestId(`departments-edit-btn-${rowId}`).click();

    if (name) {
      await this.page.getByTestId(`departments-edit-name-${rowId}`).fill(name);
    }
    if (salary) {
      await this.page.getByTestId(`departments-edit-salary-${rowId}`).fill(salary);
    }

    await this.page.getByTestId(`departments-save-btn-${rowId}`).click();
  }

  async toggleDepartmentStatus(rowId: string) {
    await this.page
      .getByTestId(`departments-row-${rowId}`)
      .getByTestId('status-active')
      .click();
  }

  async deleteDepartment(rowId: string) {
    await this.page.getByTestId(`departments-delete-btn-${rowId}`).click();
  }

  async goToDepartmentsPage(pageNumber: number) {
    await this.page.getByTestId(`departments-btn-${pageNumber}`).click();
  }

  // ---- Navigation ----

  async goToIframesSection() {
    await this.page.getByTestId('ui-practice-nav-iframes').click();
  }
}