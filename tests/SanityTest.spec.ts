import { test, expect } from '../fixtures/chainFixtures.js';

test('has title', async ({ page }) => {
	await page.goto('');

	// Expect a title "to contain" a substring.
	await expect(page).toHaveTitle(/Swag Labs/);
});

test('頁面間導航', async ({
	loginPage,
	standardUserData,
	productPage,
	productToView,
	cartPage,
	checkoutPage,
	checkoutPersonData,
}) => {
	await loginPage.login(standardUserData.username, standardUserData.password);
	await productPage.verifyOnProductListPage();
	await productPage.viewProductDetails(productToView);
	await productPage.verifyOnProductDetailPage();
	await productPage.returnToProductList();
	await productPage.verifyOnProductListPage();
	await productPage.goToCartPage();
	await cartPage.verifyOnCartPage();
	await cartPage.continueShopping();
	await productPage.verifyOnProductListPage();
	await productPage.goToCartPage();
	await cartPage.verifyOnCartPage();
	await cartPage.goToCheckoutPage();
	await checkoutPage.verifyOnCheckoutStepOnePage();
	await checkoutPage.cancelCheckout();
	await cartPage.verifyOnCartPage();
	await cartPage.goToCheckoutPage();
	await checkoutPage.verifyOnCheckoutStepOnePage();
	await checkoutPage.fillCheckoutInformation(
		checkoutPersonData.firstName,
		checkoutPersonData.lastName,
		checkoutPersonData.postalCode,
	);
	await checkoutPage.continueCheckout();
	await checkoutPage.verifyOnCheckoutStepTwoPage();
	await checkoutPage.cancelCheckout();
	await productPage.verifyOnProductListPage();
	await productPage.goToCartPage();
	await cartPage.verifyOnCartPage();
	await cartPage.goToCheckoutPage();
	await checkoutPage.verifyOnCheckoutStepOnePage();
	await checkoutPage.fillCheckoutInformation(
		checkoutPersonData.firstName,
		checkoutPersonData.lastName,
		checkoutPersonData.postalCode,
	);
	await checkoutPage.continueCheckout();
	await checkoutPage.verifyOnCheckoutStepTwoPage();
	await checkoutPage.finishCheckout();
	await checkoutPage.verifyOrderCompletion();
});
