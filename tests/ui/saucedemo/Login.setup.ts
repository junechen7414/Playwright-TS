import { test as setup } from '../../../services/fixtures/chain-fixtures.fixture';

const authDir = '.auth';

setup(
	'登入 Standard User 並儲存狀態',
	async ({ page, loginPage, standardUserData, productPage }) => {
		await page.goto('');
		await loginPage.login(standardUserData.username, standardUserData.password);
		await productPage.verifyOnProductListPage();
		await page.context().storageState({ path: `${authDir}/standard_user.json` });
	},
);

setup('登入 Problem User 並儲存狀態', async ({ page, loginPage, problemUserData }) => {
	await page.goto('');
	await loginPage.login(problemUserData.username, problemUserData.password);
	// 這裡不檢查 productPage 因為會登入失敗，但可以儲存錯誤狀態或僅示範多帳號
	await page.context().storageState({ path: `${authDir}/problem_user.json` });
});
