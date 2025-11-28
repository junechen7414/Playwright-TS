import { test } from '../fixtures/chainFixtures.js';

test.describe('Shopping Scenarios', () => {
	test('完整流程從購物到結帳', async ({
		loginPage,
		standardUserData,
		productPage,
		cartPage,
		checkoutPage,
		productsToAdd,
		checkoutPersonData,
	}) => {
		// 流程1: 登入
		await loginPage.login(standardUserData.username, standardUserData.password);
		// 流程2：加入指定商品到購物車
		await productPage.addMultipleProductsToCart(productsToAdd);
		// 流程3: 進入購物車頁面
		await productPage.goToCartPage();
		// 流程4: 進入結帳頁面
		await cartPage.goToCheckoutPage();
		// 流程5: 填寫結帳資訊並完成訂單
		await checkoutPage.fillCheckoutInformation(
			checkoutPersonData.firstName,
			checkoutPersonData.lastName,
			checkoutPersonData.postalCode,
		);
		await checkoutPage.continueCheckout();
		// 流程6: 完成訂單
		await checkoutPage.finishCheckout();
		// --- 驗證點 (Assertion) ---
		// 驗證點1: 確認訂單完成頁面顯示
		await checkoutPage.verifyOrderCompletion();
	});
	test('登入登出後購物車狀態持久性', async ({
		loginPage,
		standardUserData,
		productPage,
		hamburgerMenu,
		cartPage,
		productsToAdd,
	}) => {
		// 流程1: 登入
		await loginPage.login(standardUserData.username, standardUserData.password);

		// 流程2：加入指定商品到購物車
		await productPage.addMultipleProductsToCart(productsToAdd);

		// 流程3: 登出
		await hamburgerMenu.logout();

		// 流程4: 再次登入
		await loginPage.login(standardUserData.username, standardUserData.password);

		// 流程5: 進入購物車頁面確認商品
		await productPage.goToCartPage();

		// --- 驗證點 (Assertion) ---
		// 驗證點1: 確認購物車頁面商品正確
		await cartPage.verifyCartItems(productsToAdd);
		// 驗證點2: 確認購物車頁面商品數量正確
		await cartPage.verifyCartItemCount(productsToAdd.length);
	});
	test('重設應用程式狀態後購物車清空', async ({
		loginPage,
		standardUserData,
		productPage,
		hamburgerMenu,
		productsToAdd,
	}) => {
		// 流程1: 登入
		await loginPage.login(standardUserData.username, standardUserData.password);

		// 流程2：加入指定商品到購物車
		await productPage.addMultipleProductsToCart(productsToAdd);

		// 流程3: 重設應用程式狀態
		await hamburgerMenu.resetAppState();

		// --- 驗證點 (Assertion) ---
		// 驗證點1: 確認購物車頁面無商品
		await productPage.verifyCartIconNotVisible();
	});
});
