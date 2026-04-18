// tests/api/springboot/order.spec.ts
import { expect } from '@playwright/test';
import { test } from '../../../fixtures/springboot-chained.fixture';
import { expectError, expectOk } from '../../../services/apis/base-api-client';

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
