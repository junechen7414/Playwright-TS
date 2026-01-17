import { expect, test } from '@playwright/test';
import {
	type CreateProductPayload,
	ProductApiClient,
	type UpdateProductPayload,
} from '../../services/apis/ProductApiClient';

test.describe('Product API Tests', () => {
	test('should perform full CRUD lifecycle for a product', async ({ request }) => {
		const apiClient = new ProductApiClient(request);

		// 準備動態測試資料
		const timestamp = Date.now();
		const newProductPayload: CreateProductPayload = {
			title: `Auto Test Product ${timestamp}`,
			price: 100,
			description: 'Created via Playwright API Test',
			categoryId: 20,
			images: ['https://placehold.co/600x400'],
		};

		let createdProductId: number;

		// 1. Create
		await test.step('Create Product', async () => {
			console.log('Creating product with payload:', newProductPayload);
			const response = await apiClient.createProduct(newProductPayload);
			console.log('Response Body:', await response.text());
			expect(response.status()).toBe(201);

			const data = await response.json();
			createdProductId = data.id;
			expect(createdProductId).toBeDefined();
			expect.soft(data.title).toBe(newProductPayload.title);
		});

		// 2. Read
		await test.step('Read Product', async () => {
			const response = await apiClient.readProduct(createdProductId);
			expect(response.status()).toBe(200);

			const product = await response.json();

			expect.soft(product.id).toBe(createdProductId);
			expect.soft(product.title).toBe(newProductPayload.title);
			expect.soft(product).toHaveProperty('price');
		});

		// 3. Update
		await test.step('Update Product', async () => {
			const updatePayload: UpdateProductPayload = { title: `Updated Title ${timestamp}` };
			const response = await apiClient.updateProduct(createdProductId, updatePayload);
			expect(response.status()).toBe(200);
			const data = await response.json();
			expect.soft(data.title).toBe(updatePayload.title);
		});

		// 4. Read after Update
		await test.step('Read Product after Update', async () => {
			const response = await apiClient.readProduct(createdProductId);
			expect(response.status()).toBe(200);

			const product = await response.json();

			expect.soft(product.title).toBe(`Updated Title ${timestamp}`);
		});

		// 5. Delete
		await test.step('Delete Product', async () => {
			const response = await apiClient.deleteProduct(createdProductId);
			expect(response.status()).toBe(200); // Platzi delete 通常回傳 true 或被刪除的物件

			// 再次查詢確認 404
			const getResponse = await apiClient.readProduct(createdProductId);
			expect(getResponse.status()).toBe(404);
		});
	});
});
