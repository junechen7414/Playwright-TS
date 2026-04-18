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
		return this.requester.post<number>(`${this.endpoints.account}/create`, { data: payload });
	}

	getAccount(id: number): Promise<ApiResult<Schemas['GetAccountDetailResponse']>> {
		return this.requester.get<Schemas['GetAccountDetailResponse']>(
			`${this.endpoints.account}/getDetail/${id}`,
		);
	}

	listAccounts(): Promise<ApiResult<Schemas['GetAccountListResponse'][]>> {
		return this.requester.get<Schemas['GetAccountListResponse'][]>(
			`${this.endpoints.account}/getList`,
		);
	}

	updateAccount(payload: Schemas['UpdateAccountRequest']): Promise<ApiResult<void>> {
		const params: Record<string, string | number | boolean> = { id: payload.id };
		if (payload.name) params.name = payload.name;
		if (payload.status) params.status = payload.status;
		return this.requester.put<void>(`${this.endpoints.account}/update`, { params });
	}

	deleteAccount(id: number): Promise<ApiResult<void>> {
		return this.requester.delete<void>(`${this.endpoints.account}/delete/${id}`);
	}

	/**
	 * Product 相關操作
	 */
	createProduct(payload: Schemas['CreateProductRequest']): Promise<ApiResult<number>> {
		return this.requester.post<number>(`${this.endpoints.product}/create`, { data: payload });
	}

	getProduct(id: number): Promise<ApiResult<Schemas['GetProductDetailResponse']>> {
		return this.requester.get<Schemas['GetProductDetailResponse']>(
			`${this.endpoints.product}/getDetail/${id}`,
		);
	}

	listProducts(): Promise<ApiResult<Schemas['GetProductListResponse'][]>> {
		return this.requester.get<Schemas['GetProductListResponse'][]>(
			`${this.endpoints.product}/getList`,
		);
	}

	updateProduct(payload: Schemas['UpdateProductRequest']): Promise<ApiResult<void>> {
		const params: Record<string, string | number | boolean> = {
			id: payload.id,
			price: payload.price,
			saleStatus: payload.saleStatus,
			available: payload.available,
		};
		if (payload.name) params.name = payload.name;
		return this.requester.put<void>(`${this.endpoints.product}/update`, { params });
	}

	deleteProduct(id: number): Promise<ApiResult<void>> {
		return this.requester.delete<void>(`${this.endpoints.product}/delete/${id}`);
	}

	/**
	 * Order 相關操作
	 */
	createOrder(payload: Schemas['CreateOrderRequest']): Promise<ApiResult<number>> {
		return this.requester.post<number>(`${this.endpoints.order}/create`, { data: payload });
	}

	getOrder(id: number): Promise<ApiResult<Schemas['GetOrderDetailResponse']>> {
		return this.requester.get<Schemas['GetOrderDetailResponse']>(
			`${this.endpoints.order}/getDetail/${id}`,
		);
	}

	listOrdersByAccount(accountId: number): Promise<ApiResult<Schemas['GetOrderListResponse'][]>> {
		return this.requester.get<Schemas['GetOrderListResponse'][]>(
			`${this.endpoints.order}/getList/${accountId}`,
		);
	}

	updateOrder(payload: Schemas['UpdateOrderRequest']): Promise<ApiResult<void>> {
		return this.requester.put<void>(`${this.endpoints.order}/update`, { data: payload });
	}

	deleteOrder(id: number): Promise<ApiResult<void>> {
		return this.requester.delete<void>(`${this.endpoints.order}/delete/${id}`);
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
