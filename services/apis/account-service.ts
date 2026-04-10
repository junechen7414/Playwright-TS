import type { components } from '../../schema/api-types';
import type { ApiClient } from './api-client';

type Schemas = components['schemas'];

/**
 * 帳戶相關純函式
 */
export const createAccount = (client: ApiClient, body: Schemas['CreateAccountRequest']) =>
	client.POST('/account/create', { body });

export const getAccountDetail = (client: ApiClient, id: number) =>
	client.GET('/account/getDetail/{id}', {
		params: {
			path: { id },
		},
	});

export const getAccountList = (client: ApiClient) => client.GET('/account/getList');

export const updateAccount = (client: ApiClient, payload: Schemas['UpdateAccountRequest']) =>
	client.PUT('/account/update', {
		params: {
			query: {
				updateAccountRequest: payload,
			},
		},
	});

export const deleteAccount = (client: ApiClient, id: number) =>
	client.DELETE('/account/delete/{id}', {
		params: {
			path: { id },
		},
	});

export const checkAccountInOrder = (client: ApiClient, accountId: number) =>
	client.GET('/order/AccountIdIsInOrder/{accountId}', { params: { path: { accountId } } });
