import { test } from '@fixtures/chain-fixtures.fixture';

test.describe('登入失敗情境', () => {
	test('使用無效憑證、鎖定帳號憑證和繞過登入嘗試的失敗登入', async ({
		loginPage,
		invalidUserData,
		lockedOutUserData,
		loginErrorData,
	}) => {
		await loginPage.login(lockedOutUserData.username, lockedOutUserData.password);
		await loginPage.verifyErrorMessage(loginErrorData.lockedOutCredentialsMessage);
		await loginPage.login(invalidUserData.username, invalidUserData.password);
		await loginPage.verifyErrorMessage(loginErrorData.invalidCredentialsMessage);
		await loginPage.bypassLogin(loginErrorData.bypassUrl);
		await loginPage.verifyErrorMessage(loginErrorData.bypassLoginMessage);
	});
	test('使用問題使用者憑證登入', async ({ problemUserPage }) => {
		await problemUserPage.productPage.goto();
		await problemUserPage.productPage.verifyOnProductListPage();
	});
});
