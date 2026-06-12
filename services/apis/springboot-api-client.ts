import type { APIRequestContext } from '@playwright/test';
import type { components, PageResponse } from '@schema/api-types';
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
	 * 過濾掉 undefined 的屬性
	 * @param obj - 要過濾的物件
	 * @returns 過濾後的物件
	 */
	private filterUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
		return Object.fromEntries(
			Object.entries(obj).filter(([_, value]) => value !== undefined),
		) as Partial<T>;
	}

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
		const params = this.filterUndefined(payload);
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
		// 排除不屬於 schema 的欄位（如 id）
		const { name, price, saleStatus, available } = payload;
		const params = this.filterUndefined({ name, price, saleStatus, available });
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

	listOrdersByAccount(
		accountId: number,
		params?: {
			page?: number;
			size?: number;
			sort?: string;
		},
	): Promise<ApiResult<PageResponse<Schemas['GetOrderListResponse']>>> {
		return this.requester.get<PageResponse<Schemas['GetOrderListResponse']>>(
			`${this.endpoints.order}/account/${accountId}`,
			params ? { params } : undefined,
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
