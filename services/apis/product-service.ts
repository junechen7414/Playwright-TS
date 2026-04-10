import type { components } from '../../schema/api-types';
import type { ApiClient } from './api-client';

type Schemas = components['schemas'];

/**
 * 商品相關純函式
 */
export const createProduct = (client: ApiClient, body: Schemas['CreateProductRequest']) =>
	client.POST('/product/create', { body });

export const getProductDetail = (client: ApiClient, id: number) =>
	client.GET('/product/getDetail/{id}', {
		params: {
			path: { id },
		},
	});

export const getProductList = (client: ApiClient) => client.GET('/product/getList');

/**
 * 根據 Schema，此 API 的參數定義在 query 欄位中的 updateProductRequest
 */
export const updateProduct = (client: ApiClient, payload: Schemas['UpdateProductRequest']) =>
	client.PUT('/product/update', {
		params: {
			query: {
				updateProductRequest: payload,
			},
		},
	});

export const deleteProduct = (client: ApiClient, id: number) =>
	client.DELETE('/product/delete/{id}', {
		params: {
			path: { id },
		},
	});

export const getProductDetails = (client: ApiClient, ids: number[]) =>
	client.GET('/product/getProductDetails', {
		params: {
			query: { ids },
		},
	});

export const processOrderItems = (client: ApiClient, body: Schemas['ProcessOrderItemsRequest']) =>
	client.POST('/product/processOrderItems', { body });
