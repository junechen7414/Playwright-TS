import { expect, test } from '../fixtures/chainFixtures.js';

test.describe('Login Tests', () => {
    test.describe('Successful Login Scenarios', () => {
        test('Successful Login with Valid Credentials', async ({ loginPage, standardUserData }) => {
            await loginPage.login(standardUserData.username, standardUserData.password);
            await expect(loginPage.page).toHaveURL('https://www.saucedemo.com/inventory.html');
        });
    });
    test.describe('Unsuccessful Login Scenarios', () => {
        test('Unsuccessful Login with Invalid Credentials', async ({ loginPage, invalidUserData }) => {
            await loginPage.login(invalidUserData.username, invalidUserData.password);
            const errorMessage = await loginPage.getErrorMessage();
            expect(errorMessage).toBe('Epic sadface: Username and password do not match any user in this service');
        });
        test('Unsuccessful Login with Locked out Credentials', async ({ loginPage, lockedUserData }) => {
            await loginPage.login(lockedUserData.username, lockedUserData.password);
            const errorMessage = await loginPage.getErrorMessage();
            expect(errorMessage).toBe('Epic sadface: Sorry, this user has been locked out.');
        });
        test('Bypass Login Attempt', async ({ loginPage }) => {
            let targetUrl = '/inventory.html';
            await loginPage.bypassLogin(targetUrl);
            const errorMessage = await loginPage.getErrorMessage();
            expect(errorMessage).toBe(`Epic sadface: You can only access '${targetUrl}' when you are logged in.`);
        });
    });
});