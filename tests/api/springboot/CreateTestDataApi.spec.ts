import { expect, test } from '../../../fixtures/SpringbootCombined.fixture';

test.describe('Springboot API 完整 CRUD 測試', () => {
	/**
	 * Account CRUD 測試
	 */
	test.describe('Account 帳號管理', () => {
		test('應該能建立新帳號', async ({ springbootApi, newAccountData }) => {
			const response = await springbootApi.createAccount({ name: newAccountData.name });
			// 1. 硬驗證：確保伺服器回覆 2xx
			expect(response.ok()).toBeTruthy();

			const accountId = await response.json(); // 回傳的是 ID (number)
			expect.soft(typeof accountId).toBe('number');
		});

		test('應該能取得帳號詳情', async ({ springbootApi, existingAccount }) => {
			const response = await springbootApi.getAccount(existingAccount.id);
			expect(response.ok()).toBeTruthy();

			const data = await response.json();
			expect.soft(data).toMatchObject({
				name: existingAccount.name,
				status: existingAccount.status,
			});
		});

		test('應該能更新帳號狀態', async ({ springbootApi, existingAccount }) => {
			const response = await springbootApi.updateAccount({
				id: existingAccount.id,
				name: existingAccount.name,
				status: 'N',
			});
			expect(response.ok()).toBeTruthy();

			const data = await response.json();
			expect.soft(data).toMatchObject({ status: 'N' });
		});

		test('應該能刪除帳號', async ({ springbootApi, existingAccount }) => {
			const response = await springbootApi.deleteAccount(existingAccount.id);
			expect(response.ok()).toBeTruthy();

			const getResponse = await springbootApi.getAccount(existingAccount.id);
			expect(getResponse.status()).toBe(404);
		});
	});

	/**
	 * Product CRUD 測試
	 */
	test.describe('Product 商品管理', () => {
		test('應該能建立新商品', async ({ springbootApi, newProductData }) => {
			const response = await springbootApi.createProduct(newProductData);
			expect(response.ok()).toBeTruthy();

			const productId = await response.json(); // 回傳的是 ID (number)
			expect.soft(typeof productId).toBe('number');
		});

		test('應該能更新商品價格與庫存', async ({
			springbootApi,
			existingProductId,
			newProductData,
			updatedProductData,
		}) => {
			const updatePayload = updatedProductData(existingProductId, newProductData.name);
			const response = await springbootApi.updateProduct(updatePayload);
			expect(response.ok()).toBeTruthy();

			const data = await response.json();
			expect.soft(data).toMatchObject({
				price: updatePayload.price,
				available: updatePayload.available,
				status: 'ON_SALE',
			});
		});

		test('應該能刪除商品', async ({ springbootApi, existingProductId }) => {
			const response = await springbootApi.deleteProduct(existingProductId);
			expect(response.ok()).toBeTruthy();

			const getResponse = await springbootApi.getProduct(existingProductId);
			expect(getResponse.status()).toBe(404);
		});
	});

	/**
	 * Order CRUD 測試 (整合測試)
	 */
	test.describe('Order 訂單管理 (含明細更新)', () => {
		test('應該能建立新訂單', async ({ springbootApi, existingAccount, existingProductId }) => {
			const response = await springbootApi.createOrder({
				accountId: existingAccount.id,
				orderDetails: [{ productId: existingProductId, quantity: 2 }],
			});
			expect(response.ok()).toBeTruthy();

			const orderId = await response.json(); // 回傳的是 ID (number)
			expect.soft(typeof orderId).toBe('number');
		});

		test('應該能更新訂單明細數量與狀態', async ({
			springbootApi,
			existingOrder,
			existingProductId,
		}) => {
			const response = await springbootApi.updateOrder({
				orderId: existingOrder.orderId,
				orderStatus: 1001,
				items: [
					{
						productId: existingProductId,
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

		test('應該能根據帳號查詢訂單列表', async ({
			springbootApi,
			existingMultipleOrdersAccountId,
		}) => {
			const response = await springbootApi.listOrdersByAccount(existingMultipleOrdersAccountId);
			expect(response.ok()).toBeTruthy();

			const list = await response.json();
			expect(Array.isArray(list)).toBeTruthy();
			// expect(list).toContainEqual(expect.objectContaining({ id: existingOrderId }));
		});

		test('應該能刪除訂單', async ({ springbootApi, existingOrder }) => {
			const response = await springbootApi.deleteOrder(existingOrder.orderId);
			expect(response.ok()).toBeTruthy();

			const getResponse = await springbootApi.getOrder(existingOrder.orderId);
			expect(getResponse.status()).toBe(404);
		});
	});
});
