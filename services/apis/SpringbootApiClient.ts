import type { components } from '../../schema/api-types';
import { BaseApiClient } from './BaseApiClient';

type Schemas = components['schemas'];

/**
 * Springboot API Client
 * 採用領域驅動的結構將 API 邏輯分群，提升維護性。
 */
export class SpringbootApiClient extends BaseApiClient {
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
		return this.post(`${this.endpoints.account}/create`, { data: payload });
	}

	getAccount(id: number) {
		return this.get(`${this.endpoints.account}/getDetail/${id}`);
	}

	listAccounts() {
		return this.get(`${this.endpoints.account}/getList`);
	}

	updateAccount(payload: Schemas['UpdateAccountRequest']) {
		const params: Record<string, string | number | boolean> = { id: payload.id };
		if (payload.name) params.name = payload.name;
		if (payload.status) params.status = payload.status;
		return this.put(`${this.endpoints.account}/update`, { params });
	}

	deleteAccount(id: number) {
		return this.delete(`${this.endpoints.account}/delete/${id}`);
	}

	/**
	 * Product 相關操作
	 */
	createProduct(payload: Schemas['CreateProductRequest']) {
		return this.post(`${this.endpoints.product}/create`, { data: payload });
	}

	getProduct(id: number) {
		return this.get(`${this.endpoints.product}/getDetail/${id}`);
	}

	listProducts() {
		return this.get(`${this.endpoints.product}/getList`);
	}

	updateProduct(payload: Schemas['UpdateProductRequest']) {
		const params: Record<string, string | number | boolean> = {
			id: payload.id,
			price: payload.price,
			saleStatus: payload.saleStatus,
			available: payload.available,
		};
		if (payload.name) params.name = payload.name;
		return this.put(`${this.endpoints.product}/update`, { params });
	}

	deleteProduct(id: number) {
		return this.delete(`${this.endpoints.product}/delete/${id}`);
	}

	/**
	 * Order 相關操作
	 */
	createOrder(payload: Schemas['CreateOrderRequest']) {
		return this.post(`${this.endpoints.order}/create`, { data: payload });
	}

	getOrder(id: number) {
		return this.get(`${this.endpoints.order}/getDetail/${id}`);
	}

	listOrdersByAccount(accountId: number) {
		return this.get(`${this.endpoints.order}/getList/${accountId}`);
	}

	updateOrder(payload: Schemas['UpdateOrderRequest']) {
		return this.put(`${this.endpoints.order}/update`, { data: payload });
	}

	deleteOrder(id: number) {
		return this.delete(`${this.endpoints.order}/delete/${id}`);
	}

	/**
	 * 測試資料準備 (TestData / Preconditions)
	 */
	prepareOrdersTestData(count: number) {
		return this.post(`${this.endpoints.testData}/createOrderPrecondition`, {
			data: { number: count },
		});
	}
}
