import { faker } from '@faker-js/faker';
import { test as baseTest } from '@playwright/test';
import type { AccountPayload, ProductPayload } from '../services/apis/SpringbootApiClient';

type SpringbootDataFixtures = {
	newAccountData: AccountPayload;
	updatedAccountData: (id: number, username: string) => AccountPayload;
	newProductData: ProductPayload;
	updatedProductData: (id: number, name: string) => ProductPayload;
};

/**
 * 核心 Fixture 邏輯：提供動態與靜態測試資料
 */
export const springbootTestData = baseTest.extend<SpringbootDataFixtures>({
	// 建立新帳號的資料
	newAccountData: async ({}, use) => {
		await use({
			name: `user_${faker.string.alphanumeric(8)}`,
		});
	},

	// 更新帳號的資料範本
	updatedAccountData: async ({}, use) => {
		await use(
			(id: number, name: string): AccountPayload => ({
				id,
				name,
				status: 'INACTIVE',
			}),
		);
	},

	// 建立新商品的資料
	newProductData: async ({}, use) => {
		await use({
			name: `Prod_${faker.commerce.productName()}_${faker.string.alphanumeric(4)}`,
			price: faker.number.int({ min: 10, max: 1000 }),
			available: faker.number.int({ min: 1, max: 100 }),
			status: 'AVAILABLE',
		});
	},

	// 更新商品的資料範本
	updatedProductData: async ({}, use) => {
		await use(
			(id: number, name: string): ProductPayload => ({
				id,
				name,
				price: faker.number.int({ min: 10, max: 1000 }),
				available: faker.number.int({ min: 1, max: 100 }),
				status: 'ON_SALE',
			}),
		);
	},
});
