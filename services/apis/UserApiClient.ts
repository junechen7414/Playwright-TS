import type { APIRequestContext } from '@playwright/test';
import { GET_USER_DETAIL_QUERY } from './queries/UserQueries.js';

export class UserApiClient {
	private readonly endpoint: string;

	constructor(private readonly request: APIRequestContext) {
		this.endpoint = '/graphql';
	}

	/**
	 * 取得使用者資料 (純 API 測試用)
	 */
	async getUser(id: number) {
		const response = await this.request.post(this.endpoint, {
			data: {
				query: GET_USER_DETAIL_QUERY,
				variables: { userId: id },
			},
		});
		return response;
	}
}
