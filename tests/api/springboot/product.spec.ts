// tests/api/springboot/product.spec.ts
import { expect } from '@playwright/test';
import { expectError, expectOk } from '../../../services/apis/base-api-client';
import { test } from '../../../services/fixtures/springboot-chained.fixture';

test.describe('Product 商品管理', () => {
	test('應該能建立新商品', async ({ springbootApi, newProductData }) => {
		const response = await springbootApi.createProduct(newProductData);
		const productId = expectOk(response);

		expect(typeof productId).toBe('number');
	});

	test('應該能更新商品價格與庫存', async ({
		springbootApi,
		existingProductId,
		updateProductData,
	}) => {
		const response = await springbootApi.updateProduct(
			existingProductId,
			updateProductData(existingProductId),
		);
		expectOk(response);
	});

	test('應該能刪除商品', async ({ springbootApi, existingProductId }) => {
		const response = await springbootApi.deleteProduct(existingProductId);
		expectOk(response);

		const getResponse = await springbootApi.getProduct(existingProductId);
		expectError(getResponse, 404);
	});
});
