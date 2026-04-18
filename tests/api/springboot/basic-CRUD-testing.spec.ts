import { expect } from '@playwright/test';
import { test } from '../../../fixtures/springboot-chained.fixture';
import { expectError, expectOk } from '../../../services/apis/base-api-client';

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
			// 使用 expectOk 同時驗證狀態碼並取得資料
			const accountId = expectOk(response);

			expect(typeof accountId).toBe('number');
			accountFixtureDeletedAfterward.ids.push(accountId);
		});

		test('應該能取得帳號詳情', async ({ springbootApi, existingAccount }) => {
			const response = await springbootApi.getAccount(existingAccount.id);
			const data = expectOk(response);

			expect.soft(data).toMatchObject({
				name: existingAccount.name,
				status: existingAccount.status,
			});
		});

		test('應該能更新帳號', async ({ springbootApi, existingAccount, updateAccountData }) => {
			const response = await springbootApi.updateAccount(updateAccountData(existingAccount));
			expectOk(response);
		});

		test('應該能刪除帳號', async ({ springbootApi, existingAccount }) => {
			const response = await springbootApi.deleteAccount(existingAccount.id);
			expectOk(response);

			const getResponse = await springbootApi.getAccount(existingAccount.id);
			// 使用 expectError 驗證 404
			expectError(getResponse, 404);
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
			const productId = expectOk(response);

			expect(typeof productId).toBe('number');
			productFixtureDeletedAfterward.ids.push(productId);
		});

		test('應該能更新商品價格與庫存', async ({
			springbootApi,
			existingProductId,
			updateProductData,
		}) => {
			const response = await springbootApi.updateProduct(updateProductData(existingProductId));
			expectOk(response);
		});

		test('應該能刪除商品', async ({ springbootApi, existingProductId }) => {
			const response = await springbootApi.deleteProduct(existingProductId);
			expectOk(response);

			const getResponse = await springbootApi.getProduct(existingProductId);
			expectError(getResponse, 404);
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
			const orderId = expectOk(response);

			expect(typeof orderId).toBe('number');
			orderFixtureDeletedAfterward.ids.push(orderId);
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
			expectOk(response);
		});

		test('應該能根據帳號查詢訂單列表', async ({
			springbootApi,
			existingMultipleOrdersAccountId,
		}) => {
			const response = await springbootApi.listOrdersByAccount(existingMultipleOrdersAccountId);
			const list = expectOk(response);

			expect(Array.isArray(list)).toBeTruthy();
		});

		test('應該能刪除訂單', async ({ springbootApi, existingOrder }) => {
			const response = await springbootApi.deleteOrder(existingOrder.orderId);
			expectOk(response);

			const getResponse = await springbootApi.getOrder(existingOrder.orderId);
			expectError(getResponse, 404);
		});
	});
});
