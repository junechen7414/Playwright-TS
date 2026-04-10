import type { components } from '../../schema/api-types';
import type { ApiClient } from './api-client';

type Schemas = components['schemas'];

/**
 * 訂單相關純函式
 */
export const createOrder = (client: ApiClient, body: Schemas['CreateOrderRequest']) =>
	client.POST('/order/create', { body });

export const getOrderDetail = (client: ApiClient, orderId: number) =>
	client.GET('/order/getDetail/{orderId}', {
		params: {
			path: { orderId },
		},
	});

export const getOrderListByAccount = (client: ApiClient, accountId: number) =>
	client.GET('/order/getList/{accountId}', {
		params: {
			path: { accountId },
		},
	});

export const updateOrder = (client: ApiClient, body: Schemas['UpdateOrderRequest']) =>
	client.PUT('/order/update', { body });

export const deleteOrder = (client: ApiClient, orderId: number) =>
	client.DELETE('/order/delete/{orderId}', { params: { path: { orderId } } });
