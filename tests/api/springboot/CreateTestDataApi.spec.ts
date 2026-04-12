import { expect, test } from '../../../fixtures/SpringbootCombined.fixture';

test.describe('Springboot API 完整 CRUD 測試', () => {
	/**
	 * Account CRUD 測試
	 */
	test.describe('Account 帳號管理', () => {
		test('應該能建立新帳號', async ({
			springbootApi,
			accountFixtureDeletedAfterward,
			newAccountData,
		}) => {
			const response = await springbootApi.createAccount(newAccountData);
			// 1. 硬驗證：確保伺服器回覆 2xx
			expect(response).toBeOK();

			const accountId = await response.json(); // 回傳的是 ID (number)
			expect.soft(typeof accountId).toBe('number');
			accountFixtureDeletedAfterward.ids.push(accountId); // 將 ID 存入容器，以便後續清理
		});

		test('應該能取得帳號詳情', async ({ springbootApi, existingAccount }) => {
			const response = await springbootApi.getAccount(existingAccount.id);
			expect(response).toBeOK();

			const data = await response.json();
			expect.soft(data).toMatchObject({
				name: existingAccount.name,
				status: existingAccount.status,
			});
		});

		test('應該能更新帳號', async ({ springbootApi, existingAccount, updateAccountData }) => {
			const response = await springbootApi.updateAccount(updateAccountData(existingAccount));
			expect(response).toBeOK();
		});

		test('應該能刪除帳號', async ({ springbootApi, existingAccount }) => {
			const response = await springbootApi.deleteAccount(existingAccount.id);
			expect(response).toBeOK();

			const getResponse = await springbootApi.getAccount(existingAccount.id);
			expect(getResponse.status()).toBe(404);
		});
	});

	/**
	 * Product CRUD 測試
	 */
	test.describe('Product 商品管理', () => {
		test('應該能建立新商品', async ({
			springbootApi,
			productFixtureDeletedAfterward,
			newProductData,
		}) => {
			const response = await springbootApi.createProduct(newProductData);
			expect(response).toBeOK();

			const productId = await response.json(); // 回傳的是 ID (number)
			expect.soft(typeof productId).toBe('number');
			productFixtureDeletedAfterward.ids.push(productId); // 將 ID 存入容器，以便後續清理
		});

		test('應該能更新商品價格與庫存', async ({
			springbootApi,
			existingProductId,
			updateProductData,
		}) => {
			const response = await springbootApi.updateProduct(updateProductData(existingProductId));
			expect(response).toBeOK();
		});

		test('應該能刪除商品', async ({ springbootApi, existingProductId }) => {
			const response = await springbootApi.deleteProduct(existingProductId);
			expect(response).toBeOK();

			const getResponse = await springbootApi.getProduct(existingProductId);
			expect(getResponse.status()).toBe(404);
		});
	});

	/**
	 * Order CRUD 測試 (整合測試)
	 */
	test.describe('Order 訂單管理 (含明細更新)', () => {
		test('應該能建立新訂單', async ({
			springbootApi,
			existingAccount,
			existingProductId,
			orderFixtureDeletedAfterward,
		}) => {
			const response = await springbootApi.createOrder({
				accountId: existingAccount.id,
				orderDetails: [{ productId: existingProductId, quantity: 2 }],
			});
			expect(response).toBeOK();

			const orderId = await response.json(); // 回傳的是 ID (number)
			expect.soft(typeof orderId).toBe('number');
			orderFixtureDeletedAfterward.ids.push(orderId); // 將 ID 存入容器，以便後續清理
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
						quantity: 1,
					},
				],
			});
			expect(response).toBeOK();
		});

		test('應該能根據帳號查詢訂單列表', async ({
			springbootApi,
			existingMultipleOrdersAccountId,
		}) => {
			const response = await springbootApi.listOrdersByAccount(existingMultipleOrdersAccountId);
			expect(response).toBeOK();

			const list = await response.json();
			expect(Array.isArray(list)).toBeTruthy();
			// expect(list).toContainEqual(expect.objectContaining({ id: existingOrderId }));
		});

		test('應該能刪除訂單', async ({ springbootApi, existingOrder }) => {
			const response = await springbootApi.deleteOrder(existingOrder.orderId);
			expect(response).toBeOK();

			const getResponse = await springbootApi.getOrder(existingOrder.orderId);
			expect(getResponse.status()).toBe(404);
		});
	});
});
