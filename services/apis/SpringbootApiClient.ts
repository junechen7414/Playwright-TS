import { BaseApiClient } from './BaseApiClient';

/**
 * API Request Payloads
 */
export interface AccountPayload {
	id?: number;
	name: string;
	status?: string;
}

export interface ProductPayload {
	id?: number;
	name: string;
	price: number;
	available: number;
	status?: string;
}

export interface OrderItem {
	productId: number;
	quantity: number;
}

export interface OrderPayload {
	orderId?: number;
	accountId: number;
	items: OrderItem[];
	orderStatus?: string;
}

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
	createAccount(name: string) {
		return this.post(`${this.endpoints.account}/create`, { data: { name } });
	}

	getAccount(id: number) {
		return this.get(`${this.endpoints.account}/getDetail/${id}`);
	}

	listAccounts() {
		return this.get(`${this.endpoints.account}/getList`);
	}

	updateAccount(payload: AccountPayload) {
		return this.put(`${this.endpoints.account}/update`, { data: payload });
	}

	deleteAccount(id: number) {
		return this.delete(`${this.endpoints.account}/delete/${id}`);
	}

	/**
	 * Product 相關操作
	 */
	createProduct(payload: ProductPayload) {
		return this.post(`${this.endpoints.product}/create`, { data: payload });
	}

	getProduct(id: number) {
		return this.get(`${this.endpoints.product}/getDetail/${id}`);
	}

	listProducts() {
		return this.get(`${this.endpoints.product}/getList`);
	}

	updateProduct(payload: ProductPayload) {
		return this.put(`${this.endpoints.product}/update`, { data: payload });
	}

	deleteProduct(id: number) {
		return this.delete(`${this.endpoints.product}/delete/${id}`);
	}

	/**
	 * Order 相關操作
	 */
	createOrder(payload: OrderPayload) {
		return this.post(`${this.endpoints.order}/create`, { data: payload });
	}

	getOrder(id: number) {
		return this.get(`${this.endpoints.order}/getDetail/${id}`);
	}

	listOrdersByAccount(accountId: number) {
		return this.get(`${this.endpoints.order}/getList/${accountId}`);
	}

	updateOrder(payload: OrderPayload) {
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
