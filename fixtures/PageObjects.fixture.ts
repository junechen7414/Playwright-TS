import { LoginPage } from '../services/pages/LoginPage.js';
import { ProductPage } from '../services/pages/ProductPage.js';
import { test as baseTest } from '@playwright/test';

type PageObject = {
    loginPage: LoginPage;
    productPage: ProductPage;
}

export const pageObjectTest = baseTest.extend<PageObject>({
    loginPage: async ({ page }, use) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await use(loginPage);
    },
    productPage: async ({ page }, use) => {
        await use(new ProductPage(page));
    },
});
