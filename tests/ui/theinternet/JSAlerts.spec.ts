import { expect, test } from '@playwright/test';

test('JavaScript 彈窗練習', async ({ page }) => {
	await page.goto('/javascript_alerts');

	// 1. JS Alert (只有「確定」按鈕)
	page.once('dialog', async (dialog) => {
		console.log(`彈窗訊息: ${dialog.message()}`);
		expect(dialog.type()).toBe('alert');
		await dialog.accept(); // 點擊「確定」
	});
	await page.getByText('Click for JS Alert').click();
	await expect(page.locator('#result')).toHaveText('You successfully clicked an alert');

	// 2. JS Confirm (有「確定」與「取消」)
	page.once('dialog', async (dialog) => {
		expect(dialog.message()).toBe('I am a JS Confirm');
		await dialog.dismiss(); // 點擊「取消」
	});
	await page.getByText('Click for JS Confirm').click();
	await expect(page.locator('#result')).toHaveText('You clicked: Cancel');

	// 3. JS Prompt (需要輸入文字)
	const inputText = 'Test JS Prompt';
	page.once('dialog', async (dialog) => {
		expect(dialog.type()).toBe('prompt');
		await dialog.accept(inputText); // 輸入文字並點擊「確定」
	});
	await page.getByText('Click for JS Prompt').click();
	await expect(page.locator('#result')).toHaveText(`You entered: ${inputText}`);
});
