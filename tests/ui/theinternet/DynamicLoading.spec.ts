import { expect, type Locator, test } from '@playwright/test';

// 兩個測試案例的程式碼其實相同，唯一差別在於前往的頁面不同
test.describe('Dynamic Loading 頁面測試', () => {
	let startButton: Locator;
	let hellowWorldHeading: Locator;

	test.beforeEach(async ({ page }) => {
		startButton = page.getByRole('button', { name: 'Start' });
		hellowWorldHeading = page.getByRole('heading', { name: 'Hello World!' });
	});

	test('範例 1: 元素在 DOM 中但隱藏', async ({ page }) => {
		await test.step('step1: 前往 Dynamic Loading 範例 1 頁面', async () => {
			page.goto('/dynamic_loading/1');
			await expect(hellowWorldHeading).toBeHidden();
		});

		await test.step('step2: 點擊 Start 按鈕並等待 Hello World 出現', async () => {
			await startButton.click();
			await expect(hellowWorldHeading).toBeVisible({ timeout: 10000 });
		});
	});

	test('範例 2: 元素不在 DOM 中', async ({ page }) => {
		await test.step('step1: 前往 Dynamic Loading 範例 2 頁面', async () => {
			page.goto('/dynamic_loading/2');
			await expect(hellowWorldHeading).toBeHidden();
		});
		await test.step('step2: 點擊 Start 按鈕並等待 Hello World 出現', async () => {
			await startButton.click();
			await expect(hellowWorldHeading).toBeVisible({ timeout: 10000 });
		});
	});
});
