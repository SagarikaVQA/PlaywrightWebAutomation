import { test as base } from '@playwright/test';
import { TablePage } from '../../pages/TablePage';

type Fixtures = {
  tablePage: TablePage;
};

export const test = base.extend<Fixtures>({
  tablePage: async ({ page }, use) => {
    const tablePage = new TablePage(page);
    await tablePage.navigate();
    await use(tablePage);
  },
});

export { expect } from '@playwright/test';