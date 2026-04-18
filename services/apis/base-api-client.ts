import { type APIRequestContext, type APIResponse, expect } from '@playwright/test';

/**
 * 封裝後的 API 回傳結構
 */
export type ApiResult<T> = {
	status: number;
	data: T;
	raw: APIResponse;
};

/**
 * 成功斷言：驗證狀態碼為 2xx 並回傳資料
 */
export function expectOk<T>(res: ApiResult<T>): T {
	expect(res.status, `Expected status 2xx but got ${res.status}`).toBeGreaterThanOrEqual(200);
	expect(res.status, `Expected status 2xx but got ${res.status}`).toBeLessThan(300);
	return res.data;
}

/**
 * 錯誤斷言：驗證特定錯誤狀態碼並回傳資料
 */
export function expectError<T>(res: ApiResult<T>, expectedStatus: number): T {
	expect(res.status, `Expected status ${expectedStatus} but got ${res.status}`).toBe(
		expectedStatus,
	);
	return res.data;
}

/**
 * API 請求執行器 (使用組合而非繼承)
 */
export class ApiRequester {
	constructor(protected readonly request: APIRequestContext) {}

	/**
	 * 封裝底層請求邏輯
	 */
	async sendRequest<T>(
		method: 'get' | 'post' | 'put' | 'delete',
		url: string,
		options?: Parameters<APIRequestContext['get']>[1],
	): Promise<ApiResult<T>> {
		const response = await this.request[method](url, options);

		let data: unknown;
		const contentType = response.headers()['content-type'];

		if (response.status() === 204 || !contentType || contentType.includes('text/plain')) {
			// 處理 204 No Content 或純文字回應
			const textData = await response.text();
			// 嘗試將純文字轉成數字 (針對 Springboot 回傳 ID 的情況)
			if (textData.length > 0 && !Number.isNaN(Number(textData))) {
				data = Number(textData);
			} else {
				data = textData;
			}
		} else {
			try {
				data = await response.json();
			} catch {
				// 如果 JSON 解析失敗，回退到純文字
				data = await response.text();
			}
		}

		if (!response.ok()) {
			console.error(`[API ERROR] ${method.toUpperCase()} ${url} - Status: ${response.status()}`);
		}

		return {
			status: response.status(),
			data: data as T,
			raw: response,
		};
	}

	async get<T>(
		url: string,
		options?: Parameters<APIRequestContext['get']>[1],
	): Promise<ApiResult<T>> {
		return this.sendRequest<T>('get', url, options);
	}

	async post<T>(
		url: string,
		options?: Parameters<APIRequestContext['post']>[1],
	): Promise<ApiResult<T>> {
		return this.sendRequest<T>('post', url, options);
	}

	async put<T>(
		url: string,
		options?: Parameters<APIRequestContext['put']>[1],
	): Promise<ApiResult<T>> {
		return this.sendRequest<T>('put', url, options);
	}

	async delete<T>(
		url: string,
		options?: Parameters<APIRequestContext['delete']>[1],
	): Promise<ApiResult<T>> {
		return this.sendRequest<T>('delete', url, options);
	}
}
