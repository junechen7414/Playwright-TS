import { test } from '../fixtures/chainFixtures.js';

test.describe('Unsuccessful Login Scenarios', () => {
	test('Unsuccessful Login with Invalid Credentials, Locked out Credentials and Bypass Login Attempt', async ({
		loginPage,
		invalidUserData,
		lockedUserData,
	}) => {
		await loginPage.login(invalidUserData.username, invalidUserData.password);
		await loginPage.verifyErrorMessage(
			'Epic sadface: Username and password do not match any user in this service',
		);
		await loginPage.login(lockedUserData.username, lockedUserData.password);
		await loginPage.verifyErrorMessage('Epic sadface: Sorry, this user has been locked out.');
		await loginPage.bypassLogin('/inventory.html');
		await loginPage.verifyErrorMessage(
			`Epic sadface: You can only access '/inventory.html' when you are logged in.`,
		);
	});
});
