import type { APIRequestContext } from '@playwright/test';
import type { components } from '../../schema/api-types';
import { ApiRequester, type ApiResult } from './base-api-client';

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
	createAccount(payload: Schemas['CreateAccountRequest']): Promise<ApiResult<number>> {
		return this.requester.post<number>(`${this.endpoints.account}`, { data: payload });
	}

	getAccount(id: number): Promise<ApiResult<Schemas['GetAccountDetailResponse']>> {
		return this.requester.get<Schemas['GetAccountDetailResponse']>(
			`${this.endpoints.account}/${id}`,
		);
	}

	listAccounts(): Promise<ApiResult<Schemas['GetAccountListResponse'][]>> {
		return this.requester.get<Schemas['GetAccountListResponse'][]>(`${this.endpoints.account}`);
	}

	updateAccount(id: number, payload: Schemas['UpdateAccountRequest']): Promise<ApiResult<void>> {
		const params: Record<string, string | number | boolean> = {};
		if (payload.name) params.name = payload.name;
		if (payload.status) params.status = payload.status;
		return this.requester.put<void>(`${this.endpoints.account}/${id}`, { data: params });
	}

	deleteAccount(id: number): Promise<ApiResult<void>> {
		return this.requester.delete<void>(`${this.endpoints.account}/${id}`);
	}

	/**
	 * Product 相關操作
	 */
	createProduct(payload: Schemas['CreateProductRequest']): Promise<ApiResult<number>> {
		return this.requester.post<number>(`${this.endpoints.product}`, { data: payload });
	}

	getProduct(id: number): Promise<ApiResult<Schemas['GetProductDetailResponse']>> {
		return this.requester.get<Schemas['GetProductDetailResponse']>(
			`${this.endpoints.product}/${id}`,
		);
	}

	listProducts(): Promise<ApiResult<Schemas['GetProductListResponse'][]>> {
		return this.requester.get<Schemas['GetProductListResponse'][]>(`${this.endpoints.product}`);
	}

	updateProduct(id: number, payload: Schemas['UpdateProductRequest']): Promise<ApiResult<void>> {
		const params: Record<string, string | number | boolean> = {
			price: payload.price,
			saleStatus: payload.saleStatus,
			available: payload.available,
		};
		if (payload.name) params.name = payload.name;
		return this.requester.put<void>(`${this.endpoints.product}/${id}`, { data: params });
	}

	deleteProduct(id: number): Promise<ApiResult<void>> {
		return this.requester.delete<void>(`${this.endpoints.product}/${id}`);
	}

	/**
	 * Order 相關操作
	 */
	createOrder(payload: Schemas['CreateOrderRequest']): Promise<ApiResult<number>> {
		return this.requester.post<number>(`${this.endpoints.order}`, { data: payload });
	}

	getOrder(id: number): Promise<ApiResult<Schemas['GetOrderDetailResponse']>> {
		return this.requester.get<Schemas['GetOrderDetailResponse']>(`${this.endpoints.order}/${id}`);
	}

	listOrdersByAccount(accountId: number): Promise<ApiResult<Schemas['GetOrderListResponse'][]>> {
		return this.requester.get<Schemas['GetOrderListResponse'][]>(
			`${this.endpoints.order}/account/${accountId}`,
		);
	}

	updateOrder(payload: Schemas['UpdateOrderRequest']): Promise<ApiResult<void>> {
		return this.requester.put<void>(`${this.endpoints.order}`, { data: payload });
	}

	deleteOrder(id: number): Promise<ApiResult<void>> {
		return this.requester.delete<void>(`${this.endpoints.order}/${id}`);
	}

	/**
	 * 測試資料準備 (TestData / Preconditions)
	 */
	prepareOrdersTestData(count: number): Promise<ApiResult<void>> {
		return this.requester.post<void>(`${this.endpoints.testData}/createOrderPrecondition`, {
			data: { number: count },
		});
	}
}
