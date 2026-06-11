/**
 * 環境變數型別定義和驗證
 */

/**
 * 環境變數介面
 */
export interface Env {
	// API 相關
	API_BASE_URL: string;
	API_TIMEOUT: number;

	// 測試相關
	HEADLESS: boolean;
	SLOW_MO: number;

	// CI/CD 相關
	CI: boolean;
}

/**
 * 驗證並取得環境變數
 */
export function getEnv(): Env {
	return {
		API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:8080',
		API_TIMEOUT: Number(process.env.API_TIMEOUT) || 30000,
		HEADLESS: process.env.HEADLESS !== 'false',
		SLOW_MO: Number(process.env.SLOW_MO) || 0,
		CI: process.env.CI === 'true',
	};
}

/**
 * 全域環境變數實例
 */
export const env = getEnv();
