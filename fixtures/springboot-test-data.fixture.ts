import { faker } from '@faker-js/faker';
import { test as baseTest } from '@playwright/test';
import type { components } from '../schema/api-types';

type SpringbootDataFixtures = {
	newAccountData: components['schemas']['CreateAccountRequest'];
	updateAccountData: (
		existingAccount: components['schemas']['UpdateAccountRequest'],
	) => components['schemas']['UpdateAccountRequest'];
	newProductData: components['schemas']['CreateProductRequest'];
	updateProductData: (existingProductId: number) => components['schemas']['UpdateProductRequest'];
	newOrderData: (
		accountId: number,
		productId: number,
	) => components['schemas']['CreateOrderRequest'];
	updateOrderData: (
		orderId: number,
		productId: number,
	) => components['schemas']['UpdateOrderRequest'];
};

export const springbootTestData = baseTest.extend<SpringbootDataFixtures>({
	// 建立新帳號的資料
	newAccountData: async ({}, use) => {
		await use({
			name: `user_${faker.string.alphanumeric(8)}`,
		});
	},
	// 更新帳號的資料
	updateAccountData: async ({}, use) => {
		await use((existingAccount) => ({
			id: existingAccount.id,
			name: faker.person.fullName(),
			status: 'Y',
		}));
	},

	// 建立新商品的資料
	newProductData: async ({}, use) => {
		await use({
			name: `Prod_${faker.commerce.productName()}_${faker.string.alphanumeric(4)}`,
			price: faker.number.int({ min: 10, max: 1000 }),
			available: faker.number.int({ min: 1, max: 100 }),
		});
	},
	// 更新商品的資料
	updateProductData: async ({}, use) => {
		await use((existingProductId) => ({
			id: existingProductId,
			name: `Updated_Product_${faker.number.int({ min: 1, max: 100 })}`,
			price: faker.number.int({ min: 10, max: 1000 }),
			available: faker.number.int({ min: 1, max: 100 }),
			saleStatus: 1001,
		}));
	},

	// 建立新訂單的資料
	newOrderData: async ({}, use) => {
		await use((accountId, productId) => ({
			accountId: accountId,
			orderDetails: [{ productId: productId, quantity: 1 }],
		}));
	},

	// 更新訂單的資料
	updateOrderData: async ({}, use) => {
		await use((orderId, productId) => ({
			orderId: orderId,
			orderStatus: 1001,
			items: [{ productId: productId, quantity: 1 }],
		}));
	},
});
