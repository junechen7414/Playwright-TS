import { test } from '../fixtures/chainFixtures.js';

test.describe('Shopping Scenarios', () => {
	// test('登入進入檢視商品頁後返回商品主頁，加入指定商品到購物車，Reset App State 回到初始狀態，重新加入指定商品到購物車，進入購物車頁面確認商品，繼續購物，登出，再次登入，進入購物車頁面確認商品，導向商品主頁，進入購物車頁面確認商品，導向商品主頁，進入購物車頁面確認商品', async ({
	// 	loginPage,
	// 	standardUserData,
	// 	productPage,
	// 	cartPage,
	// }) => {
	// 	// 流程1: 登入
	// 	await loginPage.login(standardUserData.username, standardUserData.password);

	// 	// --- 驗證點 (Assertion) ---
	// 	// 驗證點1: 確認已登入成功進入商品主頁
	// 	await productPage.verifyOnProductListPage();
	// 	// 驗證點2: 確認購物車圖示初始狀態無數量顯示
	// 	await productPage.verifyCartIconNotVisible();

	// 	const productName = 'Sauce Labs Backpack';

	// 	// 流程2: 進入檢視商品頁後返回商品主頁
	// 	await productPage.viewProductDetails(productName);
	// 	await productPage.returnToProductList();

	// 	// --- 驗證點 (Assertion) ---
	// 	// 驗證點: 確認已返回商品主頁
	// 	await productPage.verifyOnProductListPage();

	// 	const productsToAdd = [
	// 		'Sauce Labs Backpack',
	// 		'Sauce Labs Bike Light',
	// 		'Sauce Labs Bolt T-Shirt',
	// 	];

	// 	// 流程3：加入指定商品到購物車
	// 	await productPage.addMultipleProductsToCart(productsToAdd);

	// 	// --- 驗證點 (Assertion) ---
	// 	// 驗證點 1: 確認商品頁面按鈕狀態改變
	// 	await productPage.verifyMultipleItemsStatusIsRemove(productsToAdd);
	// 	// 驗證點 2: 確認購物車圖示數量正確
	// 	await productPage.verifyCartItemCount(productsToAdd.length);

	// 	// 流程4: Reset App State 回到初始狀態
	// 	await productPage.hamburgerMenu.resetAppState();

	// 	// --- 驗證點 (Assertion) ---
	// 	// 驗證點 1: 確認購物車圖示數量歸零
	// 	await productPage.verifyCartIconNotVisible();

	// 	// 流程5: 重新加入指定商品到購物車
	// 	await productPage.addMultipleProductsToCart(productsToAdd);

	// 	// --- 驗證點 (Assertion) ---
	// 	// 驗證點 1: 確認商品頁面按鈕狀態改變
	// 	await productPage.verifyMultipleItemsStatusIsRemove(productsToAdd);
	// 	// 驗證點 2: 確認購物車圖示數量正確
	// 	await productPage.verifyCartItemCount(productsToAdd.length);

	// 	// 流程6：進入購物車頁面
	// 	await productPage.goToCartPage();

	// 	// --- 驗證點 (Assertion) ---
	// 	// 驗證點1: 確認購物車頁面商品正確
	// 	await cartPage.verifyCartItems(productsToAdd);
	// 	// 驗證點2: 確認購物車頁面商品數量正確
	// 	await cartPage.verifyCartItemCount(productsToAdd.length);

	// 	// 流程7: 繼續購物
	// 	await cartPage.continueShopping();

	// 	// --- 驗證點 (Assertion) ---
	// 	// 驗證點: 確認已返回商品主頁
	// 	await productPage.verifyOnProductListPage();

	// 	// 流程8: 登出
	// 	await productPage.hamburgerMenu.logout();
	// 	// --- 驗證點 (Assertion) ---
	// 	// 驗證點: 確認已登出回到登入頁面
	// 	await loginPage.verifyOnLoginPage();

	// 	// 流程9: 再次登入
	// 	await loginPage.login(standardUserData.username, standardUserData.password);

	// 	// --- 驗證點 (Assertion) ---
	// 	// 驗證點: 確認已登入成功進入商品主頁
	// 	await productPage.verifyOnProductListPage();
	// 	// 驗證點: 確認購物車圖示數量仍維持正確
	// 	await productPage.verifyCartItemCount(productsToAdd.length);

	// 	// 流程10: 進入購物車頁面確認商品
	// 	await productPage.goToCartPage();

	// 	// --- 驗證點 (Assertion) ---
	// 	// 驗證點1: 確認購物車頁面商品正確
	// 	await cartPage.verifyCartItems(productsToAdd);
	// 	// 驗證點2: 確認購物車頁面商品數量正確
	// 	await cartPage.verifyCartItemCount(productsToAdd.length);

	// 	// 流程11: 導向商品主頁
	// 	await cartPage.hamburgerMenu.goToProductPage();

	// 	// --- 驗證點 (Assertion) ---
	// 	// 驗證點: 確認已返回商品主頁
	// 	await productPage.verifyOnProductListPage();
	// 	// 驗證點: 確認購物車圖示數量仍維持正確
	// 	await productPage.verifyCartItemCount(productsToAdd.length);

	// 	// 流程12: 進入購物車頁面確認商品
	// 	await productPage.goToCartPage();

	// 	// --- 驗證點 (Assertion) ---
	// 	// 驗證點1: 確認購物車頁面商品正確
	// 	await cartPage.verifyCartItems(productsToAdd);
	// 	// 驗證點2: 確認購物車頁面商品數量正確
	// 	await cartPage.verifyCartItemCount(productsToAdd.length);
	// });
	// 拆分上面的測試案例
	test('登入登出後購物車狀態持久性', async ({
		loginPage,
		standardUserData,
		productPage,
		cartPage,
	}) => {
		// 流程1: 登入
		await loginPage.login(standardUserData.username, standardUserData.password);

		const productsToAdd = [
			'Sauce Labs Backpack',
			'Sauce Labs Bike Light',
			'Sauce Labs Bolt T-Shirt',
		];
		// 流程2：加入指定商品到購物車
		await productPage.addMultipleProductsToCart(productsToAdd);

		// 流程3: 登出
		await productPage.hamburgerMenu.logout();

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
	test('重設應用程式狀態後購物車清空', async ({ loginPage, standardUserData, productPage }) => {
		// 流程1: 登入
		await loginPage.login(standardUserData.username, standardUserData.password);

		// 流程2：加入指定商品到購物車
		const productsToAdd = [
			'Sauce Labs Backpack',
			'Sauce Labs Bike Light',
			'Sauce Labs Bolt T-Shirt',
		];
		await productPage.addMultipleProductsToCart(productsToAdd);

		// 流程3: 重設應用程式狀態
		await productPage.hamburgerMenu.resetAppState();

		// --- 驗證點 (Assertion) ---
		// 驗證點1: 確認購物車頁面無商品
		await productPage.verifyCartIconNotVisible();
	});
	test('商品主頁與購物車頁間導航不影響商品狀態', async ({
		loginPage,
		standardUserData,
		productPage,
		cartPage,
	}) => {
		// 流程1: 登入
		await loginPage.login(standardUserData.username, standardUserData.password);

		const productName = 'Sauce Labs Backpack';

		await productPage.addProductToCart(productName);

		// 流程2: 進入檢視商品頁後返回商品主頁
		await productPage.viewProductDetails(productName);
		await productPage.returnToProductList();
		// 流程3：進入購物車頁面
		await productPage.goToCartPage();
		// 流程4: 使用漢堡選單導向商品主頁
		await cartPage.hamburgerMenu.goToProductPage();
		// 流程5: 再次進入購物車頁面
		await productPage.goToCartPage();
		// 流程6: 用頁面按鈕導向商品主頁
		await cartPage.continueShopping();

		// --- 驗證點 (Assertion) ---
		// 驗證點1: 確認已返回商品主頁
		await productPage.verifyOnProductListPage();
		// 驗證點2: 確認購物車圖示數量正確
		await productPage.verifyCartItemCount(1);
	});
});
