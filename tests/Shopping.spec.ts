import { test } from '../fixtures/chainFixtures.js';

test.describe('Shopping Scenarios', () => {
	test('進入檢視單一商品頁後返回商品主頁，再把多個商品加入購物車後狀態驗證', async ({
		loginPage,
		standardUserData,
		productPage,
	}) => {
		// 流程1: 登入
		await loginPage.login(standardUserData.username, standardUserData.password);

		// --- 驗證點 (Assertion) ---
		// 驗證點1: 確認已登入成功進入商品主頁
		await productPage.verifyOnProductListPage();

		const productName = 'Sauce Labs Backpack';

		// 流程2: 進入檢視商品頁後返回商品主頁
		await productPage.viewProductDetails(productName);
		await productPage.returnToProductList();

		// --- 驗證點 (Assertion) ---
		// 驗證點2: 確認已返回商品主頁
		await productPage.verifyOnProductListPage();

		const productsToAdd = [
			'Sauce Labs Backpack',
			'Sauce Labs Bike Light',
			'Sauce Labs Bolt T-Shirt',
		];

		// 流程3：加入指定商品到購物車
		await productPage.addMultipleProductsToCart(productsToAdd);

		// --- 驗證點 (Assertion) ---
		// 驗證點 1: 確認商品頁面按鈕狀態改變
		await productPage.verifyMultipleItemsStatusIsRemove(productsToAdd);
		// 驗證點 2: 確認購物車圖示數量正確
		await productPage.verifyCartItemCount(productsToAdd.length);
	});
});
