import { test } from '../../../services/fixtures/chain-fixtures.fixture';

test.describe('Unsuccessful Login Scenarios', () => {
	test('Unsuccessful Login with Invalid Credentials, Locked out Credentials and Bypass Login Attempt', async ({
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
	test('Login with Problem User Credentials', async ({ problemUserPage }) => {
		await problemUserPage.productPage.gotoProductPage();
		await problemUserPage.productPage.verifyOnProductListPage();
	});
});
