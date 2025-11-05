import { test } from '../fixtures/chainFixtures.js';

test.describe('Unsuccessful Login Scenarios', () => {
    test('Unsuccessful Login with Invalid Credentials', async ({ loginPage, invalidUserData }) => {
        await loginPage.login(invalidUserData.username, invalidUserData.password);
        await loginPage.verifyErrorMessage('Epic sadface: Username and password do not match any user in this service');
    });
    test('Unsuccessful Login with Locked out Credentials', async ({ loginPage, lockedUserData }) => {
        await loginPage.login(lockedUserData.username, lockedUserData.password);
        await loginPage.verifyErrorMessage('Epic sadface: Sorry, this user has been locked out.');
    });
    test('Bypass Login Attempt', async ({ loginPage }) => {
        let targetUrl = '/inventory.html';
        await loginPage.bypassLogin(targetUrl);
        await loginPage.verifyErrorMessage(`Epic sadface: You can only access '${targetUrl}' when you are logged in.`);
    });
});
