import { test } from '../fixtures/chainFixtures.js';

test.describe
	.skip('Unsuccessful Login Scenarios', () => {
		test('Unsuccessful Login with Invalid Credentials, Locked out Credentials and Bypass Login Attempt', async ({
			loginPage,
			invalidUserData,
			lockedUserData,
			loginErrorData,
		}) => {
			await loginPage.login(lockedUserData.username, lockedUserData.password);
			await loginPage.verifyErrorMessage(loginErrorData.lockedOutCredentialsMessage);
			await loginPage.login(invalidUserData.username, invalidUserData.password);
			await loginPage.verifyErrorMessage(loginErrorData.invalidCredentialsMessage);
			await loginPage.bypassLogin(loginErrorData.bypassUrl);
			await loginPage.verifyErrorMessage(loginErrorData.bypassLoginMessage);
		});
	});
