import { test as baseTest } from '@playwright/test';
import { HamburgerMenu } from '../services/components/HamburgerMenu.js';
import { CartPage } from '../services/pages/CartPage.js';
import { CheckoutPage } from '../services/pages/CheckoutPage.js';
import { LoginPage } from '../services/pages/LoginPage.js';
import { ProductPage } from '../services/pages/ProductPage.js';

type PageObject = {
	loginPage: LoginPage;
	productPage: ProductPage;
	cartPage: CartPage;
	checkoutPage: CheckoutPage;
	hamburgerMenu: HamburgerMenu;
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
	checkoutPage: async ({ page }, use) => {
		await use(new CheckoutPage(page));
	},
	hamburgerMenu: async ({ page }, use) => {
		await use(new HamburgerMenu(page));
	},
});
