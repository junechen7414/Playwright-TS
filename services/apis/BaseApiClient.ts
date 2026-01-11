import type { APIRequestContext, APIResponse } from '@playwright/test';

/**
 * 定義 API 回傳結果的包裝介面
 */
export abstract class BaseApiClient {
	constructor(protected readonly request: APIRequestContext) {}

	/**
	 * 封裝底層請求邏輯
	 * @param method HTTP 動詞
	 * @param url 端點路徑
	 * @param options Playwright 原生請求參數
	 */
	private async sendRequest(
		method: 'get' | 'post' | 'put' | 'delete',
		url: string,
		options?: Parameters<APIRequestContext['get']>[1],
	): Promise<APIResponse> {
		const response = await this.request[method](url, options);

		// 在 Base object 做日誌紀錄
		if (!response.ok()) {
			console.error(`[API ERROR] ${method.toUpperCase()} ${url} - Status: ${response.status()}`);
		}

		return response;
	}

	protected async get(
		url: string,
		options?: Parameters<APIRequestContext['get']>[1],
	): Promise<APIResponse> {
		return this.sendRequest('get', url, options);
	}

	protected async post(
		url: string,
		options?: Parameters<APIRequestContext['post']>[1],
	): Promise<APIResponse> {
		return this.sendRequest('post', url, options);
	}

	protected async put(
		url: string,
		options?: Parameters<APIRequestContext['put']>[1],
	): Promise<APIResponse> {
		return this.sendRequest('put', url, options);
	}

	protected async delete(
		url: string,
		options?: Parameters<APIRequestContext['delete']>[1],
	): Promise<APIResponse> {
		return this.sendRequest('delete', url, options);
	}
}
