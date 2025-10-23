import { LoginPage } from '../services/pages/LoginPage.js';
import { test as baseTest } from '@playwright/test';

type PageObject = {
    loginPage: LoginPage;
}

export const pageObjectTest = baseTest.extend<PageObject>({
    loginPage: async ({ page }, use) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await use(loginPage);
    },
});

