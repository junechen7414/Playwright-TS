import { defineConfig, devices } from '@playwright/test';

/**
 * 讀取環境變數
 * 預設使用 'local'，可以透過命令列傳入 ENV=staging 來改變
 */
const environment = (process.env.ENV || 'local').toLowerCase().trim();

// 根據環境載入對應的 .env 檔案
dotenv.config({
	path: `.env.${environment}`,
});
/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
// 建立一個代表本地時區的日期時間字串
function getLocalDate() {
	const now = new Date();
	const year = now.getFullYear();
	const month = (now.getMonth() + 1).toString().padStart(2, '0');
	const day = now.getDate().toString().padStart(2, '0');
	const hours = now.getHours().toString().padStart(2, '0');
	const minutes = now.getMinutes().toString().padStart(2, '0');
	const seconds = now.getSeconds().toString().padStart(2, '0');
	return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}
// 透過環境變數確保時間戳記在整個測試流程中只被建立一次
process.env.PW_DATE = process.env.PW_DATE || getLocalDate();
// const date = process.env.PW_DATE;

export default defineConfig({
	testDir: './tests',
	timeout: 30 * 1000,
	expect: {
		timeout: 5000,
	},
	/* Run tests in files in parallel */
	fullyParallel: true,
	/* Fail the build on CI if you accidentally left test.only in the source code. */
	// forbidOnly: !!process.env.CI,
	/* Retry on CI only */
	retries: process.env.CI ? 2 : 0,
	/* Opt out of parallel tests on CI. */
	workers: process.env.CI ? 2 : 3,
	/* Reporter to use. See https://playwright.dev/docs/test-reporters */
	// 將所有測試產出物 (影片、截圖、追蹤檔) 儲存到帶有時間戳記的資料夾中
	outputDir: `playwright-report/`,
	reporter: process.env.CI
		? [['list'], ['html', { outFolder: `playwright-report/`, open: 'never' }]]
		: 'list',
	// reporter: [
	// 	// HTML 報告也使用相同的時間戳記資料夾，方便歸檔
	// 	['html', { outputFolder: `playwright-report/${date}`, open: 'never' }],
	// ],
	// reporter: 'list',
	/* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
	use: {
		/* Base URL to use in actions like `await page.goto('')`. */
		// baseURL: 'localhost:3000',
		/* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
		trace: 'off',
		screenshot: 'on-first-failure',
		video: {
			mode: 'retain-on-failure',
			size: { width: 1280, height: 960 },
		},
	},

	projects: [
		/* --- 1. API 測試 --- */
		{
			name: 'api',
			testMatch: '**/api/*.spec.ts',
			use: {
				baseURL: process.env.API_BASE_URL || 'https://restful-booker.herokuapp.com/booking',
			},
		},

		/* --- 2. UI Setup (登入預處理) --- */
		{
			name: 'ui-setup',
			testMatch: '**/saucedemo/*.setup.ts',
			use: {
				baseURL: 'https://www.saucedemo.com/',
				...devices['Desktop Chrome'],
			},
		},

		/* --- 3. UI 本地測試 (對接你的 Docker Spring Boot) --- */
		{
			name: 'ui-local',
			testMatch: '**/saucedemo/*.spec.ts',
			dependencies: ['ui-setup'],
			use: {
				baseURL: 'http://localhost:8787', // 對應你 docker-compose 的 port
				...devices['Desktop Chrome'],
				storageState: '.auth/login.json',
			},
		},

		/* --- 4. UI Staging 測試 (對接外部環境) --- */
		{
			name: 'ui-staging',
			testMatch: '**/saucedemo/*.spec.ts',
			dependencies: ['ui-setup'],
			use: {
				baseURL: 'https://www.saucedemo.com/',
				...devices['Desktop Chrome'],
				storageState: '.auth/login.json',
			},
		},

		/* --- 5. WebKit 專屬 (處理你提到的 Windows Crash 問題) --- */
		{
			name: 'ui-webkit',
			testMatch: '**/saucedemo/*.spec.ts',
			dependencies: ['ui-setup'],
			use: {
				baseURL: 'https://www.saucedemo.com/',
				...devices['Desktop Safari'],
				video: 'off', // 避開非 ASCII 路徑崩潰
				storageState: '.auth/login.json',
			},
		},
	],
});
