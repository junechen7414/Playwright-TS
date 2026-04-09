import { defineConfig, devices } from '@playwright/test';

/**
 * 建立時間戳記 (優化可讀性)
 */
function getLocalDate() {
	const now = new Date();

	// 使用解構賦值並給予預設值 ''
	const [datePart = ''] = now.toISOString().split('T');

	// 這裡同樣給予預設值，確保 timePart 永遠是 string
	const [timePart = ''] = now.toTimeString().split(' ');

	// 現在 timePart 確定是字串了，replace 不會再報錯
	const formattedTime = timePart.replace(/:/g, '-');

	return `${datePart}_${formattedTime}`;
}
process.env.PW_DATE = process.env.PW_DATE || getLocalDate();

export default defineConfig({
	testDir: './tests',
	timeout: 30000,
	expect: { timeout: 5000 },
	fullyParallel: true,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 2 : 3,

	outputDir: 'test-results/',

	// CI 與本地 Reporter 區分報告產出路徑
	reporter: process.env.CI
		? [['list'], ['html', { outputFolder: 'playwright-report/', open: 'never' }]]
		: [
				['list'],
				['html', { outputFolder: `playwright-report/${process.env.PW_DATE}`, open: 'never' }],
			],

	use: {
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
			name: 'springboot-api',
			testMatch: '**/springboot/*.spec.ts',
			use: {
				baseURL: 'http://localhost:8787/', // 對應你 docker-compose 的 port
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
