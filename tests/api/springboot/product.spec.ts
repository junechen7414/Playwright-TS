// tests/api/springboot/product.spec.ts
import { expect } from '@playwright/test';
import { test } from '../../../fixtures/springboot-chained.fixture';
import { expectError, expectOk } from '../../../services/apis/base-api-client';

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
