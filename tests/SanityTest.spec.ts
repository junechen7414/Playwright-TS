import { test, expect } from '../fixtures/chainFixtures.js';

test('has title', async ({ page }) => {
	await page.goto('');

	// Expect a title "to contain" a substring.
	await expect(page).toHaveTitle(/Swag Labs/);
});

test('頁面間導航', async ({ productPage, cartPage, checkoutPage, productsToAdd }) => {
	await productPage.addMultipleProductsToCart(productsToAdd);
	await productPage.goToCartPage();
	await cartPage.goToCheckoutPage();
	await checkoutPage.finishCheckout();
});
