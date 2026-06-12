// tests/api/springboot/product.spec.ts

import { expectError, expectOk } from '@apis/base-api-client';
import { test } from '@fixtures/springboot-chained.fixture';
import { expect } from '@playwright/test';

test.describe('Product 商品管理', () => {
	test('應該能建立新商品', async ({ springbootApi, newProductData }) => {
		const response = await springbootApi.createProduct(newProductData);
		const productId = expectOk(response);

		expect(typeof productId).toBe('number');
	});

	test('當商品名稱已存在時，不應該能建立新商品', async ({ springbootApi, existingProductId }) => {
		const existingProduct = expectOk(await springbootApi.getProduct(existingProductId));

		const newProductRequest = {
			name: existingProduct.name ?? '',
			price: 100,
			available: 10,
		};

		const response = await springbootApi.createProduct(newProductRequest);
		const errorBody = expectError(response, 400);
		expect(errorBody).toMatchObject({
			status: 400,
			error: '商品名稱已存在',
		});
		expect(errorBody.message).toContain(`${existingProduct.name} already exists`);
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

	test('當商品名稱已存在時，不應該能更新成相同名稱', async ({
		springbootApi,
		existingProductId,
		newProductData,
		updateProductData,
	}) => {
		const productA = expectOk(await springbootApi.getProduct(existingProductId));
		const productBId = expectOk(await springbootApi.createProduct(newProductData));

		const updateRequest = {
			...updateProductData(productBId),
			name: productA.name ?? '',
		};

		const response = await springbootApi.updateProduct(productBId, updateRequest);
		const errorBody = expectError(response, 400);

		expect(errorBody).toMatchObject({
			status: 400,
			error: '商品名稱已存在',
		});
		expect(errorBody.message).toContain(`${productA.name} already exists`);
	});

	test('應該能刪除商品', async ({ springbootApi, existingProductId }) => {
		const response = await springbootApi.deleteProduct(existingProductId);
		expectOk(response);

		const getResponse = await springbootApi.getProduct(existingProductId);
		expectError(getResponse, 404);
	});
});
