import { faker } from '@faker-js/faker';
import { test as baseTest } from '@playwright/test';
import { expectOk } from '../services/apis/base-api-client';
import { SpringbootApiClient } from '../services/apis/springboot-api-client';

type CleanupBox = { ids: number[] };
type SpringbootApiFixtures = {
	springbootApi: SpringbootApiClient;
	existingAccount: { id: number; name: string; status: string };
	accountFixtureDeletedAfterward: CleanupBox;
	existingProductId: number;
	productFixtureDeletedAfterward: CleanupBox;
	existingOrder: { accountId: number; productId: number; orderId: number };
	orderFixtureDeletedAfterward: CleanupBox;
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
		const response = await springbootApi.createAccount({ name: accountName });
		const accountId = expectOk(response);

		await use({ id: accountId, name: accountName, status: 'Y' });
		await springbootApi.deleteAccount(accountId).catch(() => {
			// 忽略已經被測案刪除的情況
			/*靜默處理*/
		});
	},
	accountFixtureDeletedAfterward: async ({ springbootApi }, use) => {
		const box: CleanupBox = { ids: [] };
		await use(box);
		for (const id of box.ids) {
			await springbootApi.deleteAccount(id).catch(() => {
				/* 靜默處理，防止清理失敗影響測試結果 */
			});
		}
	},

	existingProductId: async ({ springbootApi }, use) => {
		// 在 fixture 中建立一筆商品資料，並在測試結束後刪除，確保測試獨立性
		const response = await springbootApi.createProduct({
			name: `Test Product ${faker.string.uuid()}`,
			price: faker.number.int({ min: 10, max: 100 }),
			available: 100,
		});
		const productId = expectOk(response);

		await use(productId);
		await springbootApi.deleteProduct(productId).catch(() => {
			// 忽略已經被測試刪除的情況
			/*靜默處理*/
		});
	},
	productFixtureDeletedAfterward: async ({ springbootApi }, use) => {
		const box: CleanupBox = { ids: [] };
		await use(box);
		for (const id of box.ids) {
			await springbootApi.deleteProduct(id).catch(() => {
				/* 靜默處理，防止清理失敗影響測試結果 */
			});
		}
	},
	existingOrder: async ({ springbootApi, existingAccount, existingProductId }, use) => {
		// 在 fixture 中建立一筆訂單資料，並在測試結束後刪除，確保測試獨立性
		const response = await springbootApi.createOrder({
			accountId: existingAccount.id,
			orderDetails: [
				{ productId: existingProductId, quantity: faker.number.int({ min: 1, max: 5 }) },
			],
		});
		const orderId = expectOk(response);

		await use({ orderId: orderId, accountId: existingAccount.id, productId: existingProductId });
		await springbootApi.deleteOrder(orderId).catch(() => {
			// 忽略已經被測試刪除的情況
			/*靜默處理*/
		});
	},
	orderFixtureDeletedAfterward: async ({ springbootApi }, use) => {
		const box: CleanupBox = { ids: [] };
		await use(box);
		for (const id of box.ids) {
			await springbootApi.deleteOrder(id).catch(() => {
				/* 靜默處理，防止清理失敗影響測試結果 */
			});
		}
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
		await springbootApi.deleteOrder(orderResponse1.data).catch(() => {
			/* 靜默處理，防止清理失敗影響測試結果 */
		});
		await springbootApi.deleteOrder(orderResponse2.data).catch(() => {
			/* 靜默處理，防止清理失敗影響測試結果 */
		});
	},
});
