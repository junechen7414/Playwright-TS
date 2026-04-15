import type { APIRequestContext, APIResponse } from '@playwright/test';

/**
 * API 請求執行器 (使用組合而非繼承)
 */
export class ApiRequester {
	constructor(protected readonly request: APIRequestContext) {}

	/**
	 * 封裝底層請求邏輯
	 */
	async sendRequest(
		method: 'get' | 'post' | 'put' | 'delete',
		url: string,
		options?: Parameters<APIRequestContext['get']>[1],
	): Promise<APIResponse> {
		const response = await this.request[method](url, options);

		if (!response.ok()) {
			console.error(`[API ERROR] ${method.toUpperCase()} ${url} - Status: ${response.status()}`);
		}

		return response;
	}

	async get(url: string, options?: Parameters<APIRequestContext['get']>[1]): Promise<APIResponse> {
		return this.sendRequest('get', url, options);
	}

	async post(
		url: string,
		options?: Parameters<APIRequestContext['post']>[1],
	): Promise<APIResponse> {
		return this.sendRequest('post', url, options);
	}

	async put(url: string, options?: Parameters<APIRequestContext['put']>[1]): Promise<APIResponse> {
		return this.sendRequest('put', url, options);
	}

	async delete(
		url: string,
		options?: Parameters<APIRequestContext['delete']>[1],
	): Promise<APIResponse> {
		return this.sendRequest('delete', url, options);
	}
}
