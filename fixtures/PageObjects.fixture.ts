import { LoginPage } from '../services/pages/LoginPage.js';
import { ProductPage } from '../services/pages/ProductPage.js';
import { CartPage } from '../services/pages/CartPage.js';
import { test as baseTest } from '@playwright/test';

type PageObject = {
	loginPage: LoginPage;
	productPage: ProductPage;
	cartPage: CartPage;
};

export const pageObjectTest = baseTest.extend<PageObject>({
	loginPage: async ({ page }, use) => {
		const loginPage = new LoginPage(page);
		await loginPage.goto();
		await use(loginPage);
	},
	productPage: async ({ page }, use) => {
		await use(new ProductPage(page));
	},
	cartPage: async ({ page }, use) => {
		await use(new CartPage(page));
	},
});
