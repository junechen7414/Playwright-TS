import { expect, test } from '../../../services/fixtures/chain-fixtures.fixture';

test('has title', async ({ standardUserProductPage }) => {
	await expect(standardUserProductPage.productPage.page).toHaveTitle(/Swag Labs/);
});

test.describe('各頁面導航流程', () => {
	test('產品頁與單一商品頁面導航', async ({ standardUserProductPage, productToView }) => {
		const { productPage } = standardUserProductPage;
		await productPage.viewProductDetails(productToView);
		await productPage.verifyOnProductDetailPage();
		await productPage.returnToProductList();
		await productPage.verifyOnProductListPage();
	});

	test('產品頁與購物車頁面導航', async ({ standardUserProductPage }) => {
		const { productPage, cartPage } = standardUserProductPage;
		await productPage.goToCartPage();
		await cartPage.verifyOnCartPage();
		await cartPage.continueShopping();
		await productPage.verifyOnProductListPage();
	});

	test('取消結帳流程', async ({ standardUserProductPage, checkoutPersonData, productToView }) => {
		const { productPage, cartPage, checkoutPage } = standardUserProductPage;
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
	test('從商品頁導航到 About 頁面', async ({ standardUserProductPage }) => {
		await standardUserProductPage.hamburgerMenu.goToAboutPage();
		await standardUserProductPage.hamburgerMenu.verifyOnAboutPage();
	});

	test('從購物車頁導航到 About 頁面', async ({ standardUserProductPage }) => {
		const { productPage, cartPage, hamburgerMenu } = standardUserProductPage;
		await productPage.goToCartPage();
		await cartPage.verifyOnCartPage();
		await hamburgerMenu.goToAboutPage();
		await hamburgerMenu.verifyOnAboutPage();
	});

	test('從結帳資訊頁導航到 About 頁面', async ({
		standardUserProductPage,
		productToView,
		checkoutPersonData,
	}) => {
		const { productPage, cartPage, checkoutPage, hamburgerMenu } = standardUserProductPage;
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
		standardUserProductPage,
		productToView,
		checkoutPersonData,
	}) => {
		const { productPage, cartPage, checkoutPage, hamburgerMenu } = standardUserProductPage;
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

test.describe('漢堡選單從各頁面登出', () => {
	test('從商品頁登出', async ({ standardUserProductPage }) => {
		await standardUserProductPage.hamburgerMenu.logout();
		await standardUserProductPage.loginPage.verifyOnLoginPage();
	});

	test('從購物車頁登出', async ({ standardUserProductPage }) => {
		const { productPage, cartPage, hamburgerMenu, loginPage } = standardUserProductPage;
		await productPage.goToCartPage();
		await cartPage.verifyOnCartPage();
		await hamburgerMenu.logout();
		await loginPage.verifyOnLoginPage();
	});

	test('從結帳資訊頁登出', async ({
		standardUserProductPage,
		productToView,
		checkoutPersonData,
	}) => {
		const { productPage, cartPage, checkoutPage, hamburgerMenu, loginPage } =
			standardUserProductPage;
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
		standardUserProductPage,
		productToView,
		checkoutPersonData,
	}) => {
		const { productPage, cartPage, checkoutPage, hamburgerMenu, loginPage } =
			standardUserProductPage;
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
