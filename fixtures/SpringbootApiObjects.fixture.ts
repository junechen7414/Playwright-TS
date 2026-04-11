import { faker } from '@faker-js/faker';
import { test as baseTest } from '@playwright/test';
import { SpringbootApiClient } from '../services/apis/SpringbootApiClient';

type SpringbootApiFixtures = {
	springbootApi: SpringbootApiClient;
	existingAccount: { id: number; name: string; status: string };
	existingProductId: number;
	existingOrder: { accountId: number; productId: number; orderId: number };
	existingMultipleOrdersAccountId: number;
};

export const springbootApiTest = baseTest.extend<SpringbootApiFixtures>({
	springbootApi: async ({ request }, use) => {
		const client = new SpringbootApiClient(request);
		await use(client);
	},
	existingAccount: async ({ springbootApi }, use) => {
		// 在 fixture 中建立一筆帳號資料，並在測試結束後刪除，確保測試獨立性
		const accountName = faker.person.fullName();
		const createResponse = await springbootApi.createAccount({ name: accountName });

		if (!createResponse.ok()) {
			throw new Error('Failed to create account for fixture');
		}
		const accountId = await createResponse.json();

		if (typeof accountId !== 'number' || Number.isNaN(accountId)) {
			throw new Error('Invalid accountId received from API');
		}
		await use({ id: accountId, name: accountName, status: 'Y' });
		await springbootApi.deleteAccount(accountId).catch(() => {
			// 忽略已經被測案刪除的情況
			/*靜默處理*/
		});
	},
	existingProductId: async ({ springbootApi }, use) => {
		// 在 fixture 中建立一筆商品資料，並在測試結束後刪除，確保測試獨立性
		const createResponse = await springbootApi.createProduct({
			name: `Test Product ${faker.string.uuid()}`,
			price: faker.number.int({ min: 10, max: 100 }),
			available: 100,
		});
		if (!createResponse.ok()) {
			throw new Error('Failed to create product for fixture');
		}
		const productId = await createResponse.json();
		await use(productId);
		await springbootApi.deleteProduct(productId).catch(() => {
			// 忽略已經被測試刪除的情況
			/*靜默處理*/
		});
	},
	existingOrder: async ({ springbootApi, existingAccount, existingProductId }, use) => {
		// 在 fixture 中建立一筆訂單資料，並在測試結束後刪除，確保測試獨立性
		const createResponse = await springbootApi.createOrder({
			accountId: existingAccount.id,
			orderDetails: [
				{ productId: existingProductId, quantity: faker.number.int({ min: 1, max: 5 }) },
			],
		});
		if (!createResponse.ok()) {
			throw new Error('Failed to create order for fixture');
		}
		const orderId = await createResponse.json();
		await use(orderId);
		await springbootApi.deleteOrder(orderId).catch(() => {
			// 忽略已經被測試刪除的情況
			/*靜默處理*/
		});
	},
	existingMultipleOrdersAccountId: async (
		{ springbootApi, existingOrder, existingProductId },
		use,
	) => {
		springbootApi
			.createOrder({
				accountId: existingOrder.accountId,
				orderDetails: [{ productId: existingProductId, quantity: 1 }],
			})
			.catch(() => {
				/*靜默處理*/
			});
		await use(existingOrder.accountId);
	},
});
