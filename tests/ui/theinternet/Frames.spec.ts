import { expect, type Locator, test } from '@playwright/test';

test('測試多層嵌套 Frames', async ({ page }) => {
	const frameSet = page.frameLocator('frame[name="frame-top"]');
	const middleFrame = frameSet.frameLocator('frame[name="frame-middle"]');
	const messageLocator: Locator = middleFrame.locator('#content');

	await test.step('step1: 前往多層嵌套 Frames 頁面', async () => {
		await page.goto('/nested_frames');
	});
	await test.step('step2: 驗證內層 Frame 中的訊息', async () => {
		await expect(messageLocator).toHaveText('MIDDLE');
	});
});
