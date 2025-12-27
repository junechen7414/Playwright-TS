import fs from 'fs';
import { test as setup } from '../fixtures/chainFixtures.js';

const authFileDir = '.auth/login.json';
const protectedPath = 'https://www.saucedemo.com/inventory.html';

setup('登入後儲存狀態', async ({ page, loginPage, standardUserData, productPage, playwright }) => {
	// 檢查檔案是否存在
	if (fs.existsSync(authFileDir)) {
		const storageState = JSON.parse(fs.readFileSync(authFileDir, 'utf-8'));

		// 使用 playwright.request 建立一個臨時的 API 請求環境並注入狀態
		const apiContext = await playwright.request.newContext({ storageState });
		const response = await apiContext.get(protectedPath);

		if (response.ok()) {
			console.log(`✅ Session 有效 (Status: ${response.status()})。跳過登入步驟。`);
			await apiContext.dispose(); // 釋放 API 資源
			return;
		}
		await apiContext.dispose();
		console.log('❌ Session 已過期，準備重新登入...');
	}

	// 沒有驗證成功，執行 UI 登入
	await page.goto('');
	await loginPage.login(standardUserData.username, standardUserData.password);
	await productPage.verifyOnProductListPage();

	// 儲存狀態
	await page.context().storageState({ path: authFileDir });
});
