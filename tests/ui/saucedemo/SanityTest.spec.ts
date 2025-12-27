import { expect, test } from '../../../fixtures/chainFixtures.js';

test('has title', async ({ page }) => {
	await page.goto('');

	// Expect a title "to contain" a substring.
	await expect(page).toHaveTitle(/Swag Labs/);
});

test.describe('各頁面導航流程', () => {
	test('產品頁與單一商品頁面導航', async ({ productPage, productToView }) => {
		await productPage.viewProductDetails(productToView);
		await productPage.verifyOnProductDetailPage();
		await productPage.returnToProductList();
		await productPage.verifyOnProductListPage();
	});

	test('產品頁與購物車頁面導航', async ({ productPage, cartPage }) => {
		await productPage.goToCartPage();
		await cartPage.verifyOnCartPage();
		await cartPage.continueShopping();
		await productPage.verifyOnProductListPage();
	});

	test('取消結帳流程', async ({
		productPage,
		cartPage,
		checkoutPage,
		checkoutPersonData,
		productToView,
	}) => {
		// 前置步驟: 將一個商品加入購物車
		await productPage.addProductToCart(productToView);
		await productPage.goToCartPage();
		await cartPage.verifyOnCartPage();

		// 測試取消結帳at checkout step one page
		await cartPage.goToCheckoutPage();
		await checkoutPage.verifyOnCheckoutStepOnePage();
		await checkoutPage.cancelCheckout();
		await cartPage.verifyOnCartPage();

		// 測試取消結帳at checkout step two page
		await cartPage.goToCheckoutPage();
		await checkoutPage.fillCheckoutInformation(
			checkoutPersonData.firstName,
			checkoutPersonData.lastName,
			checkoutPersonData.postalCode,
		);
		await checkoutPage.continueCheckout();
		await checkoutPage.verifyOnCheckoutStepTwoPage();
		await checkoutPage.cancelCheckout();
		await productPage.verifyOnProductListPage();
	});
});

test.describe('漢堡選單從各頁面導航到 About 頁面', () => {
	test.beforeEach(async ({ loginPage, standardUserData, productPage, page }) => {
		await page.goto('');
		await loginPage.login(standardUserData.username, standardUserData.password);
		await productPage.verifyOnProductListPage();
	});
	test('從商品頁導航到 About 頁面', async ({ hamburgerMenu }) => {
		await hamburgerMenu.goToAboutPage();
		await hamburgerMenu.verifyOnAboutPage();
	});
	test('從購物車頁導航到 About 頁面', async ({ hamburgerMenu, productPage, cartPage }) => {
		await productPage.goToCartPage();
		await cartPage.verifyOnCartPage();
		await hamburgerMenu.goToAboutPage();
		await hamburgerMenu.verifyOnAboutPage();
	});
	test('從結帳資訊頁導航到 About 頁面', async ({
		hamburgerMenu,
		productPage,
		cartPage,
		productToView,
		checkoutPage,
		checkoutPersonData,
	}) => {
		await productPage.addProductToCart(productToView);
		await productPage.goToCartPage();
		await cartPage.goToCheckoutPage();
		await checkoutPage.fillCheckoutInformation(
			checkoutPersonData.firstName,
			checkoutPersonData.lastName,
			checkoutPersonData.postalCode,
		);
		await checkoutPage.continueCheckout();
		await hamburgerMenu.goToAboutPage();
		await hamburgerMenu.verifyOnAboutPage();
	});
	test('從結帳完成頁導航到 About 頁面', async ({
		hamburgerMenu,
		productPage,
		productToView,
		cartPage,
		checkoutPage,
		checkoutPersonData,
	}) => {
		await productPage.addProductToCart(productToView);
		await productPage.goToCartPage();
		await cartPage.goToCheckoutPage();
		await checkoutPage.fillCheckoutInformation(
			checkoutPersonData.firstName,
			checkoutPersonData.lastName,
			checkoutPersonData.postalCode,
		);
		await checkoutPage.continueCheckout();
		await checkoutPage.finishCheckout();
		await checkoutPage.verifyOrderCompletion();
		await hamburgerMenu.goToAboutPage();
		await hamburgerMenu.verifyOnAboutPage();
	});
});

test.describe
	.skip('漢堡選單從各頁面登出', () => {
		test.beforeEach(async ({ loginPage, standardUserData, productPage, page }) => {
			await page.goto('');
			await loginPage.login(standardUserData.username, standardUserData.password);
			await productPage.verifyOnProductListPage();
		});
		test('從商品頁登出', async ({ hamburgerMenu, loginPage }) => {
			await hamburgerMenu.logout();
			await loginPage.verifyOnLoginPage();
		});
		test('從購物車頁登出', async ({ hamburgerMenu, productPage, cartPage, loginPage }) => {
			await productPage.goToCartPage();
			await cartPage.verifyOnCartPage();
			await hamburgerMenu.logout();
			await loginPage.verifyOnLoginPage();
		});
		test('從結帳資訊頁登出', async ({
			hamburgerMenu,
			productPage,
			productToView,
			cartPage,
			checkoutPage,
			loginPage,
			checkoutPersonData,
		}) => {
			await productPage.addProductToCart(productToView);
			await productPage.goToCartPage();
			await cartPage.goToCheckoutPage();
			await checkoutPage.fillCheckoutInformation(
				checkoutPersonData.firstName,
				checkoutPersonData.lastName,
				checkoutPersonData.postalCode,
			);
			await checkoutPage.continueCheckout();
			await hamburgerMenu.logout();
			await loginPage.verifyOnLoginPage();
		});
		test('從結帳完成頁登出', async ({
			hamburgerMenu,
			productPage,
			productToView,
			cartPage,
			checkoutPage,
			loginPage,
			checkoutPersonData,
		}) => {
			await productPage.addProductToCart(productToView);
			await productPage.goToCartPage();
			await cartPage.goToCheckoutPage();
			await checkoutPage.fillCheckoutInformation(
				checkoutPersonData.firstName,
				checkoutPersonData.lastName,
				checkoutPersonData.postalCode,
			);
			await checkoutPage.continueCheckout();
			await checkoutPage.finishCheckout();
			await checkoutPage.verifyOrderCompletion();
			await hamburgerMenu.logout();
			await loginPage.verifyOnLoginPage();
		});
	});
