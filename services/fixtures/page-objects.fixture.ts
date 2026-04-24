import { test as baseTest } from '@playwright/test';
import { HamburgerMenu } from '../components/hamburger-menu';
import { CartPage } from '../pages/cart-page';
import { CheckoutPage } from '../pages/checkout-page';
import { LoginPage } from '../pages/login-page';
import { ProductPage } from '../pages/product-page';

export type PageObject = {
	loginPage: LoginPage;
	productPage: ProductPage;
	cartPage: CartPage;
	checkoutPage: CheckoutPage;
	hamburgerMenu: HamburgerMenu;
};

type Roles = {
	standardUserPage: PageObject;
	problemUserPage: PageObject;
};

export const pageObjectTest = baseTest.extend<PageObject & Roles>({
	standardUserPage: async ({ browser }, use) => {
		const context = await browser.newContext({ storageState: '.auth/standard_user.json' });
		const page = await context.newPage();
		await use({
			loginPage: new LoginPage(page),
			productPage: new ProductPage(page),
			cartPage: new CartPage(page),
			checkoutPage: new CheckoutPage(page),
			hamburgerMenu: new HamburgerMenu(page),
		});
		await context.close();
	},
	problemUserPage: async ({ browser }, use) => {
		const context = await browser.newContext({ storageState: '.auth/problem_user.json' });
		const page = await context.newPage();
		await use({
			loginPage: new LoginPage(page),
			productPage: new ProductPage(page),
			cartPage: new CartPage(page),
			checkoutPage: new CheckoutPage(page),
			hamburgerMenu: new HamburgerMenu(page),
		});
		await context.close();
	},
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
