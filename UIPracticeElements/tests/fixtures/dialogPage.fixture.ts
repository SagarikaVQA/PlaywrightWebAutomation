import { test as base } from '@playwright/test';
import { DialogPage } from '../../pages/DialogPage';

type Fixtures = {
  dialogPage: DialogPage;
};

export const test = base.extend<Fixtures>({
  dialogPage: async ({ page }, use) => {
    const dialogPage = new DialogPage(page);
    await dialogPage.open();
    await use(dialogPage);
  }
});

export { expect } from '@playwright/test';