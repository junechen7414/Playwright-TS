import { expect, type Page, test } from '@playwright/test';

/**
 * 通用的 Mock UI 設置函數
 * @param mode 模擬的情境：401 錯誤、500 錯誤、或是網路直接中斷
 */
async function setupTestUI(page: Page, apiUrl: string, mode: '401' | '500' | 'abort') {
	// 1. 設定 Playwright Network Interception
	await page.route(apiUrl, async (route) => {
		if (mode === '401') {
			await route.fulfill({
				status: 401,
				contentType: 'application/json',
				body: JSON.stringify({ message: 'Unauthorized' }),
			});
		} else if (mode === '500') {
			await route.fulfill({
				status: 500,
				contentType: 'application/json',
				body: JSON.stringify({ message: 'Internal Server Error' }),
			});
		} else if (mode === 'abort') {
			// 模擬底層網路崩潰 (例如斷網、DNS 失敗)
			await route.abort('failed');
		}
	});

	// 2. 注入包含前端錯誤處理邏輯的 HTML
	await page.setContent(`
        <div style="padding: 20px;">
            <button id="action-btn">發送請求</button>
            <div id="status-box" style="margin-top: 10px; padding: 10px; display: none;"></div>
        </div>
        <script>
            document.getElementById('action-btn').onclick = async () => {
                const box = document.getElementById('status-box');
                box.style.display = 'block';
                try {
                    const res = await fetch('${apiUrl}');
                    
                    if (res.status === 401) {
                        box.innerText = '錯誤：連線逾時，請重新登入';
                        box.style.background = 'rgb(255, 0, 0)'; // 紅色
                        box.style.color = 'white';
                    } else if (res.status === 500) {
                        box.innerText = '錯誤：伺服器異常，請稍後再試';
                        box.style.background = 'rgb(255, 165, 0)'; // 橘色
                        box.style.color = 'black';
                    } else {
                        box.innerText = '請求成功';
                        box.style.background = 'green';
                    }
                } catch (e) {
                    // 只有在網路完全斷開 (Abort) 時會進入此區塊
                    box.innerText = '連線失敗：請檢查網路連線';
                    box.style.background = 'rgb(0, 0, 0)'; // 黑色
                    box.style.color = 'white';
                }
            };
        </script>
    `);
}

test.describe('API 異常情境 UI 測試', () => {
	const MOCK_API = 'https://demo-api.local/endpoint';

	const testCases: {
		mode: '401' | '500' | 'abort';
		description: string;
		expectedText: RegExp;
		expectedColor: string;
	}[] = [
		{
			mode: '401',
			description: '模擬 401 錯誤 - 應顯示重新登入提示',
			expectedText: /連線逾時/,
			expectedColor: 'rgb(255, 0, 0)',
		},
		{
			mode: '500',
			description: '模擬 500 錯誤 - 應顯示伺服器異常提示',
			expectedText: /伺服器異常/,
			expectedColor: 'rgb(255, 165, 0)',
		},
		{
			mode: 'abort',
			description: '模擬網路中斷 (Abort) - 應顯示網路檢查提示',
			expectedText: /檢查網路連線/,
			expectedColor: 'rgb(0, 0, 0)',
		},
	];

	for (const { mode, description, expectedText, expectedColor } of testCases) {
		test(description, async ({ page }) => {
			await setupTestUI(page, MOCK_API, mode);
			await page.click('#action-btn');

			const statusBox = page.locator('#status-box');
			await expect(statusBox).toBeVisible();
			await expect(statusBox).toHaveText(expectedText);
			await expect(statusBox).toHaveCSS('background-color', expectedColor);
		});
	}
});
