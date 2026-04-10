import createClient from 'openapi-fetch';
import type { paths } from '../../schema/api-types';

/**
 * 配置好的純粹 API Client
 * @param baseUrl API 的基礎路徑
 * @param customFetch 可傳入 Playwright 的 request.fetch 實作，確保請求走 Playwright 的 Context
 */
export const createApiClient = (baseUrl: string, customFetch?: typeof fetch) => {
	return createClient<paths>({
		baseUrl,
		// 如果在 Playwright 測試中，建議傳入 request.fetch.bind(request)
		fetch: customFetch,
		// 你可以在這裡加入統一的 headers 或 middleware
		headers: {
			'Content-Type': 'application/json',
		},
	});
};

export type ApiClient = ReturnType<typeof createApiClient>;

export default createApiClient;
