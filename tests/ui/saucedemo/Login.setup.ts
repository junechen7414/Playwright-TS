import { test as setup } from '../../../fixtures/chainFixtures.js';

const authFileDir = '.auth/login.json';

setup('登入後儲存狀態', async ({ page, loginPage, standardUserData, productPage }) => {
	await page.goto('');
	await loginPage.login(standardUserData.username, standardUserData.password);
	await productPage.verifyOnProductListPage();

	// 儲存狀態
	await page.context().storageState({ path: authFileDir });
});
