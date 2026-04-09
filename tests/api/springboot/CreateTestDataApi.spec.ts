import { expect, test } from '../../../fixtures/SpringbootCombined.fixture';

test.describe('Springboot API 完整 CRUD 測試', () => {
	/**
	 * Account CRUD 測試
	 */
	test.describe('Account 帳號管理', () => {
		let accountId: number;

		test('應該能建立新帳號', async ({ springbootApi, newAccountData }) => {
			const response = await springbootApi.createAccount({ name: newAccountData.name });
			// 1. 硬驗證：確保伺服器回覆 2xx
			expect(response.ok()).toBeTruthy();

			accountId = await response.json(); // 回傳的是 ID (number)
			expect.soft(typeof accountId).toBe('number');
		});

		test('應該能取得帳號詳情', async ({ springbootApi, newAccountData }) => {
			const response = await springbootApi.getAccount(accountId);
			expect(response.ok()).toBeTruthy();

			const data = await response.json();
			expect.soft(data).toMatchObject({
				id: accountId,
				name: newAccountData.name,
			});
		});

		test('應該能更新帳號狀態', async ({ springbootApi, newAccountData, updatedAccountData }) => {
			const updatePayload = updatedAccountData(accountId, newAccountData.name);
			const response = await springbootApi.updateAccount(updatePayload);
			expect(response.ok()).toBeTruthy();

			const data = await response.json();
			expect.soft(data).toMatchObject({ status: 'INACTIVE' });
		});

		test('應該能刪除帳號', async ({ springbootApi }) => {
			const response = await springbootApi.deleteAccount(accountId);
			expect(response.ok()).toBeTruthy();

			const getResponse = await springbootApi.getAccount(accountId);
			expect(getResponse.status()).toBe(404);
		});
	});

	/**
	 * Product CRUD 測試
	 */
	test.describe('Product 商品管理', () => {
		let productId: number;

		test('應該能建立新商品', async ({ springbootApi, newProductData }) => {
			const response = await springbootApi.createProduct(newProductData);
			expect(response.ok()).toBeTruthy();

			productId = await response.json(); // 回傳的是 ID (number)
			expect.soft(typeof productId).toBe('number');
		});

		test('應該能更新商品價格與庫存', async ({
			springbootApi,
			newProductData,
			updatedProductData,
		}) => {
			const updatePayload = updatedProductData(productId, newProductData.name);
			const response = await springbootApi.updateProduct(updatePayload);
			expect(response.ok()).toBeTruthy();

			const data = await response.json();
			expect.soft(data).toMatchObject({
				price: updatePayload.price,
				available: updatePayload.available,
				status: 'ON_SALE',
			});
		});

		test('應該能刪除商品', async ({ springbootApi }) => {
			const response = await springbootApi.deleteProduct(productId);
			expect(response.ok()).toBeTruthy();

			const getResponse = await springbootApi.getProduct(productId);
			expect(getResponse.status()).toBe(404);
		});
	});

	/**
	 * Order CRUD 測試 (整合測試)
	 */
	test.describe('Order 訂單管理 (含明細更新)', () => {
		let accountId: number;
		let productId: number;
		let orderId: number;

		// 準備測試環境：需要一個帳號與一個商品
		test.beforeAll(async ({ springbootApi }) => {
			// 使用批量資料初始化介面，模擬預設情境 (例如：自動產生一個帳號與一個商品環境)
			const response = await springbootApi.prepareOrdersTestData(1);
			expect(response.ok()).toBeTruthy();

			const data = await response.json();
			// 從預先準備的資料中提取 ID，維持測試資料流的一致性
			accountId = data[0].accountId;
			productId = data[0].items[0].productId;
		});

		test('應該能建立新訂單', async ({ springbootApi }) => {
			const response = await springbootApi.createOrder({
				accountId: accountId,
				orderDetails: [{ productId: productId, quantity: 2 }],
			});
			expect(response.ok()).toBeTruthy();

			orderId = await response.json(); // 回傳的是 ID (number)
			expect.soft(typeof orderId).toBe('number');
		});

		test('應該能更新訂單明細數量與狀態', async ({ springbootApi }) => {
			const response = await springbootApi.updateOrder({
				orderId: orderId,
				orderStatus: 1001,
				items: [
					{
						productId: productId,
						quantity: 5,
					},
				],
			});
			expect(response.ok()).toBeTruthy();

			const data = await response.json();
			expect.soft(data).toMatchObject({
				orderStatus: 'SHIPPED',
				items: expect.arrayContaining([expect.objectContaining({ quantity: 5 })]),
			});
		});

		test('應該能根據帳號查詢訂單列表', async ({ springbootApi }) => {
			const response = await springbootApi.listOrdersByAccount(accountId);
			expect(response.ok()).toBeTruthy();

			const list = await response.json();
			expect(Array.isArray(list)).toBeTruthy();
			expect(list).toContainEqual(expect.objectContaining({ id: orderId }));
		});

		test('應該能刪除訂單', async ({ springbootApi }) => {
			const response = await springbootApi.deleteOrder(orderId);
			expect(response.ok()).toBeTruthy();

			const getResponse = await springbootApi.getOrder(orderId);
			expect(getResponse.status()).toBe(404);
		});
	});
});
