// tests/api/springboot/order.spec.ts
import { expect } from '@playwright/test';
import { expectError, expectOk } from '../../../services/apis/base-api-client';
import { test } from '../../../services/fixtures/springboot-chained.fixture';
import { AccountStatus, ProductSaleStatus } from '../../../services/schema/constants';

test.describe('Order 訂單管理 (含明細更新)', () => {
	test('應該能建立新訂單', async ({
		springbootApi,
		existingAccount,
		existingProductId,
		newOrderData,
	}) => {
		const response = await springbootApi.createOrder(
			newOrderData(existingAccount.id, existingProductId),
		);
		const orderId = expectOk(response);

		expect(typeof orderId).toBe('number');
	});

	test('當帳戶狀態為無效時，無法建立新訂單', async ({
		springbootApi,
		existingAccount,
		existingProductId,
		newOrderData,
		updateAccountData,
	}) => {
		// 將帳戶狀態設為無效
		const updateResponse = await springbootApi.updateAccount(existingAccount.id, {
			...updateAccountData(existingAccount),
			status: AccountStatus.Inactive,
		});
		expectOk(updateResponse);

		const response = await springbootApi.createOrder(
			newOrderData(existingAccount.id, existingProductId),
		);

		const errorBody = expectError(response, 404);
		expect(errorBody.message).toBe(`Account not found with id: ${existingAccount.id}`);
	});

	test('當商品狀態為無效時，無法建立新訂單', async ({
		springbootApi,
		existingAccount,
		existingProductId,
		newOrderData,
		updateProductData,
	}) => {
		// 將商品狀態設為無效
		const updateResponse = await springbootApi.updateProduct(existingProductId, {
			...updateProductData(existingProductId),
			saleStatus: ProductSaleStatus.Inactive,
		});
		expectOk(updateResponse);

		const response = await springbootApi.createOrder(
			newOrderData(existingAccount.id, existingProductId),
		);

		const errorBody = expectError(response, 404);
		expect(errorBody.message).toBe(`Products not found with IDs: ${existingProductId}`);
	});

	test('應該能更新訂單明細數量與狀態', async ({
		springbootApi,
		existingOrder,
		existingProductId,
		updateOrderData,
	}) => {
		const response = await springbootApi.updateOrder(
			updateOrderData(existingOrder.orderId, existingProductId),
		);
		expectOk(response);
	});

	test('應該能根據帳號查詢訂單列表', async ({ springbootApi, existingMultipleOrdersAccountId }) => {
		const response = await springbootApi.listOrdersByAccount(existingMultipleOrdersAccountId);
		const pageResponse = expectOk(response);

		// 驗證分頁回應結構
		expect(pageResponse).toHaveProperty('content');
		expect(pageResponse).toHaveProperty('totalElements');
		expect(pageResponse).toHaveProperty('totalPages');
		expect(Array.isArray(pageResponse.content)).toBeTruthy();
		expect(pageResponse.content.length).toBeGreaterThan(0);
	});

	test('應該能使用分頁參數查詢訂單列表', async ({
		springbootApi,
		existingMultipleOrdersAccountId,
	}) => {
		// 使用分頁參數查詢
		const response = await springbootApi.listOrdersByAccount(existingMultipleOrdersAccountId, {
			page: 0,
			size: 1,
			sort: 'id,desc',
		});
		const pageResponse = expectOk(response);

		// 驗證分頁參數生效
		expect(pageResponse.size).toBe(1);
		expect(pageResponse.number).toBe(0);
		expect(pageResponse.content.length).toBeLessThanOrEqual(1);
	});

	test('應該能刪除訂單', async ({ springbootApi, existingOrder }) => {
		const response = await springbootApi.deleteOrder(existingOrder.orderId);
		expectOk(response);

		const getResponse = await springbootApi.getOrder(existingOrder.orderId);
		expectError(getResponse, 404);
	});

	test('當商品庫存不足時，無法建立新訂單', async ({
		springbootApi,
		existingAccount,
		existingProductId,
	}) => {
		// 取得現有商品的庫存量
		const product = await springbootApi.getProduct(existingProductId);
		const availableQuantity = expectOk(product).available ?? 0;

		// 嘗試建立一個訂單數量大於庫存的訂單
		const response = await springbootApi.createOrder({
			accountId: existingAccount.id,
			items: [{ productId: existingProductId, quantity: availableQuantity + 1 }],
		});

		const errorBody = expectError(response, 400);
		expect(errorBody.message).toBe(`商品 ID ${existingProductId} 庫存不足，無法預留`);
	});

	test('當商品庫存不足時，無法更新訂單', async ({
		springbootApi,
		existingOrder,
		existingProductId,
		updateOrderData,
	}) => {
		// 取得現有商品的庫存量
		const product = await springbootApi.getProduct(existingProductId);
		const availableQuantity = expectOk(product).available ?? 0;

		// 取得原訂單中該商品的數量，因為更新時會先歸還庫存
		const order = await springbootApi.getOrder(existingOrder.orderId);
		const originalItem = expectOk(order).items?.find((i) => i.productId === existingProductId);
		const originalQuantity = originalItem?.quantity ?? 0;

		// 嘗試將訂單更新為數量大於 (目前可用庫存 + 原訂單數量)
		const response = await springbootApi.updateOrder({
			...updateOrderData(existingOrder.orderId, existingProductId),
			items: [{ productId: existingProductId, quantity: availableQuantity + originalQuantity + 1 }],
		});

		const errorBody = expectError(response, 400);
		expect(errorBody.message).toBe(`商品 ID ${existingProductId} 庫存不足，無法預留`);
	});
});
