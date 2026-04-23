import { faker } from '@faker-js/faker';
import { test as baseTest } from '@playwright/test';
import { expectOk } from '../services/apis/base-api-client';
import { SpringbootApiClient } from '../services/apis/springboot-api-client';

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
		// 在 fixture 中建立一筆帳號資料
		const accountName = faker.person.fullName();
		const response = await springbootApi.createAccount({ name: accountName });
		const accountId = expectOk(response);

		await use({ id: accountId, name: accountName, status: 'Y' });
	},

	existingProductId: async ({ springbootApi }, use) => {
		// 在 fixture 中建立一筆商品資料
		const response = await springbootApi.createProduct({
			name: `Test Product ${faker.string.uuid()}`,
			price: faker.number.int({ min: 10, max: 100 }),
			available: 100,
		});
		const productId = expectOk(response);

		await use(productId);
	},
	existingOrder: async ({ springbootApi, existingAccount, existingProductId }, use) => {
		// 在 fixture 中建立一筆訂單資料
		const response = await springbootApi.createOrder({
			accountId: existingAccount.id,
			orderDetails: [
				{ productId: existingProductId, quantity: faker.number.int({ min: 1, max: 5 }) },
			],
		});
		const orderId = expectOk(response);

		await use({ orderId: orderId, accountId: existingAccount.id, productId: existingProductId });
	},
	existingMultipleOrdersAccountId: async (
		{ springbootApi, existingAccount, existingProductId },
		use,
	) => {
		// 建立多張訂單，確保有多筆資料
		const orderResponse1 = await springbootApi.createOrder({
			accountId: existingAccount.id,
			orderDetails: [{ productId: existingProductId, quantity: 1 }],
		});
		expectOk(orderResponse1);

		const orderResponse2 = await springbootApi.createOrder({
			accountId: existingAccount.id,
			orderDetails: [{ productId: existingProductId, quantity: 1 }],
		});
		expectOk(orderResponse2);

		await use(existingAccount.id);
	},
});
