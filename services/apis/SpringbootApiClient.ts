import type { APIRequestContext } from '@playwright/test';
import type { components } from '../../schema/api-types';
import { ApiRequester } from './BaseApiClient';

type Schemas = components['schemas'];

/**
 * Springboot API Client
 */
export class SpringbootApiClient {
	private readonly requester: ApiRequester;
	constructor(request: APIRequestContext) {
		this.requester = new ApiRequester(request);
	}

	private readonly endpoints = {
		account: 'account',
		product: 'product',
		order: 'order',
		testData: 'PlaywrightTestData',
	};

	/**
	 * Account 相關操作
	 */
	createAccount(payload: Schemas['CreateAccountRequest']) {
		return this.requester.post(`${this.endpoints.account}/create`, { data: payload });
	}

	getAccount(id: number) {
		return this.requester.get(`${this.endpoints.account}/getDetail/${id}`);
	}

	listAccounts() {
		return this.requester.get(`${this.endpoints.account}/getList`);
	}

	updateAccount(payload: Schemas['UpdateAccountRequest']) {
		const params: Record<string, string | number | boolean> = { id: payload.id };
		if (payload.name) params.name = payload.name;
		if (payload.status) params.status = payload.status;
		return this.requester.put(`${this.endpoints.account}/update`, { params });
	}

	deleteAccount(id: number) {
		return this.requester.delete(`${this.endpoints.account}/delete/${id}`);
	}

	/**
	 * Product 相關操作
	 */
	createProduct(payload: Schemas['CreateProductRequest']) {
		return this.requester.post(`${this.endpoints.product}/create`, { data: payload });
	}

	getProduct(id: number) {
		return this.requester.get(`${this.endpoints.product}/getDetail/${id}`);
	}

	listProducts() {
		return this.requester.get(`${this.endpoints.product}/getList`);
	}

	updateProduct(payload: Schemas['UpdateProductRequest']) {
		const params: Record<string, string | number | boolean> = {
			id: payload.id,
			price: payload.price,
			saleStatus: payload.saleStatus,
			available: payload.available,
		};
		if (payload.name) params.name = payload.name;
		return this.requester.put(`${this.endpoints.product}/update`, { params });
	}

	deleteProduct(id: number) {
		return this.requester.delete(`${this.endpoints.product}/delete/${id}`);
	}

	/**
	 * Order 相關操作
	 */
	createOrder(payload: Schemas['CreateOrderRequest']) {
		return this.requester.post(`${this.endpoints.order}/create`, { data: payload });
	}

	getOrder(id: number) {
		return this.requester.get(`${this.endpoints.order}/getDetail/${id}`);
	}

	listOrdersByAccount(accountId: number) {
		return this.requester.get(`${this.endpoints.order}/getList/${accountId}`);
	}

	updateOrder(payload: Schemas['UpdateOrderRequest']) {
		return this.requester.put(`${this.endpoints.order}/update`, { data: payload });
	}

	deleteOrder(id: number) {
		return this.requester.delete(`${this.endpoints.order}/delete/${id}`);
	}

	/**
	 * 測試資料準備 (TestData / Preconditions)
	 */
	prepareOrdersTestData(count: number) {
		return this.requester.post(`${this.endpoints.testData}/createOrderPrecondition`, {
			data: { number: count },
		});
	}
}
