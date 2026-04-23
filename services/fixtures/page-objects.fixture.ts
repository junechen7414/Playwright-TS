import { test as baseTest } from '@playwright/test';
import { HamburgerMenu } from '../services/components/hamburger-menu';
import { CartPage } from '../services/pages/cart-page';
import { CheckoutPage } from '../services/pages/checkout-page';
import { LoginPage } from '../services/pages/login-page';
import { ProductPage } from '../services/pages/product-page';

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
		const productPage = new ProductPage(page);
		await productPage.gotoProductPage();
		await use(productPage);
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
