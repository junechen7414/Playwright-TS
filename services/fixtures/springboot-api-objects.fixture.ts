import { expectOk } from '@apis/base-api-client';
import { SpringbootApiClient } from '@apis/springboot-api-client';
import { faker } from '@faker-js/faker';
import { test as baseTest } from '@playwright/test';
import { AccountStatus } from '@schema/constants';

type SpringbootApiFixtures = {
	springbootApi: SpringbootApiClient;
	existingAccount: { id: number; name: string; status: string };
	existingAccountWithOrders: { id: number; name: string; status: string };
	existingProduct: {
		id: number;
		name: string;
		price: number;
		saleStatus: number;
		available: number;
	};
	existingMultipleProducts: [
		{
			id: number;
			name: string;
			price: number;
			saleStatus: number;
			available: number;
		},
		{
			id: number;
			name: string;
			price: number;
			saleStatus: number;
			available: number;
		},
	];
	existingOrder: {
		id: number;
		accountId: number;
		productId: number;
		items: Array<{ productId: number; quantity: number }>;
	};
	existingAccountWithMultipleOrders: {
		id: number;
		name: string;
		status: string;
		orderIds: number[];
	};
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

		await use({ id: accountId, name: accountName, status: AccountStatus.Active });
	},

	existingProduct: async ({ springbootApi }, use) => {
		// 在 fixture 中建立一筆商品資料並返回完整物件
		const productData = {
			name: `Test Product ${faker.string.uuid()}`,
			price: faker.number.int({ min: 10, max: 100 }),
			available: 100,
		};
		const createResponse = await springbootApi.createProduct(productData);
		const productId = expectOk(createResponse);

		// 取得完整商品資訊
		const getResponse = await springbootApi.getProduct(productId);
		const product = expectOk(getResponse);

		await use({
			id: productId,
			name: product.name ?? '',
			price: product.price ?? 0,
			saleStatus: product.saleStatus ?? 1001,
			available: product.available ?? 0,
		});
	},
	existingMultipleProducts: async ({ springbootApi }, use) => {
		// 建立兩個商品用於重複名稱測試
		const product1Data = {
			name: `Product_A_${faker.string.uuid()}`,
			price: faker.number.int({ min: 10, max: 100 }),
			available: 50,
		};
		const product1Response = await springbootApi.createProduct(product1Data);
		const product1Id = expectOk(product1Response);

		// 取得完整商品資訊
		const getProduct1 = await springbootApi.getProduct(product1Id);
		const product1 = expectOk(getProduct1);

		const product2Data = {
			name: `Product_B_${faker.string.uuid()}`,
			price: faker.number.int({ min: 10, max: 100 }),
			available: 50,
		};
		const product2Response = await springbootApi.createProduct(product2Data);
		const product2Id = expectOk(product2Response);

		// 取得完整商品資訊
		const getProduct2 = await springbootApi.getProduct(product2Id);
		const product2 = expectOk(getProduct2);

		await use([
			{
				id: product1Id,
				name: product1.name ?? '',
				price: product1.price ?? 0,
				saleStatus: product1.saleStatus ?? 1001,
				available: product1.available ?? 0,
			},
			{
				id: product2Id,
				name: product2.name ?? '',
				price: product2.price ?? 0,
				saleStatus: product2.saleStatus ?? 1001,
				available: product2.available ?? 0,
			},
		]);
	},
	existingOrder: async ({ springbootApi, existingAccount, existingProduct }, use) => {
		// 在 fixture 中建立一筆訂單資料
		const orderData = {
			accountId: existingAccount.id,
			items: [{ productId: existingProduct.id, quantity: faker.number.int({ min: 1, max: 5 }) }],
		};
		const response = await springbootApi.createOrder(orderData);
		const orderId = expectOk(response);

		await use({
			id: orderId,
			accountId: existingAccount.id,
			productId: existingProduct.id,
			items: orderData.items,
		});
	},
	existingAccountWithOrders: async ({ springbootApi, existingProduct }, use) => {
		// 建立一個有關聯訂單的帳戶
		const accountName = faker.person.fullName();
		const accountResponse = await springbootApi.createAccount({ name: accountName });
		const accountId = expectOk(accountResponse);

		// 為該帳戶建立訂單
		const orderResponse = await springbootApi.createOrder({
			accountId: accountId,
			items: [{ productId: existingProduct.id, quantity: 1 }],
		});
		expectOk(orderResponse);

		await use({ id: accountId, name: accountName, status: AccountStatus.Active });
	},

	existingAccountWithMultipleOrders: async ({ springbootApi, existingProduct }, use) => {
		// 建立一個有多張訂單的帳戶
		const accountName = faker.person.fullName();
		const accountResponse = await springbootApi.createAccount({ name: accountName });
		const accountId = expectOk(accountResponse);

		// 建立多張訂單
		const orderIds: number[] = [];

		const order1Response = await springbootApi.createOrder({
			accountId: accountId,
			items: [{ productId: existingProduct.id, quantity: 1 }],
		});
		orderIds.push(expectOk(order1Response));

		const order2Response = await springbootApi.createOrder({
			accountId: accountId,
			items: [{ productId: existingProduct.id, quantity: 1 }],
		});
		orderIds.push(expectOk(order2Response));

		await use({
			id: accountId,
			name: accountName,
			status: AccountStatus.Active,
			orderIds: orderIds,
		});
	},
});
