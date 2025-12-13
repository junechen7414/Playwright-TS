import { defineConfig, devices } from '@playwright/test';

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
const date = process.env.PW_DATE;

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
	retries: process.env.CI ? 2 : 2,
	/* Opt out of parallel tests on CI. */
	workers: process.env.CI ? 2 : 3,
	/* Reporter to use. See https://playwright.dev/docs/test-reporters */
	// 將所有測試產出物 (影片、截圖、追蹤檔) 儲存到帶有時間戳記的資料夾中
	outputDir: `test-results/${date}`,
	reporter: [
		// HTML 報告也使用相同的時間戳記資料夾，方便歸檔
		['html', { outputFolder: `playwright-report/${date}`, open: 'never' }],
	],
	/* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
	use: {
		/* Base URL to use in actions like `await page.goto('')`. */
		baseURL: 'https://www.saucedemo.com/',
		/* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
		trace: 'off',
	},

	/* Configure projects for major browsers */
	projects: [
		{
			name: 'setup',
			testMatch: /.*\.setup\.ts/,
		},
		{
			name: 'chromium',
			use: {
				...devices['Desktop Chrome'],
				storageState: '.auth/login.json',
				screenshot: 'only-on-failure',
				video: {
					mode: 'on', // 'on', 'off', 'retain-on-failure', 'on-first-retry'
					size: { width: 1280, height: 960 }, // 可選，指定影片解析度
				},
			},
			dependencies: ['setup'],
		},

		// {
		//   name: 'firefox',
		//   use: { ...devices['Desktop Firefox'] },
		// },

		// {
		//   name: 'webkit',
		//   use: { ...devices['Desktop Safari'] },
		// },

		/* ================================================== */
		/* ==           自訂的環境設定 (Environments)           == */
		/* ================================================== */

		// {
		//   name: 'dev',
		//   use: {
		//     baseURL: 'http://localhost:4000', // 開發環境的 URL
		//   },
		// },

		// {
		//   name: 'test',
		//   use: {
		//     baseURL: 'https://test.your-awesome-app.com', // 測試環境的 URL
		//   },
		// },

		/* Test against mobile viewports. */
		// {
		//   name: 'Mobile Chrome',
		//   use: { ...devices['Pixel 5'] },
		// },
		// {
		//   name: 'Mobile Safari',
		//   use: { ...devices['iPhone 12'] },
		// },

		/* Test against branded browsers. */
		// {
		// 	name: 'Microsoft Edge',
		// 	use: { ...devices['Desktop Edge'], channel: 'msedge' },
		// },
		// {
		//   name: 'Google Chrome',
		//   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
		// },
	],

	/* Run your local dev server before starting the tests */
	// webServer: {
	//   command: 'npm run start',
	//   url: 'http://localhost:3000',
	//   reuseExistingServer: !process.env.CI,
	// },
});
