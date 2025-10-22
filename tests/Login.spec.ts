import LoginPage from '../services/pages/LoginPage.js';
import { test, expect } from '@playwright/test';

test.describe('Login Tests', () => {
    let loginPage: LoginPage;
    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        await loginPage.goto();
    });
    test.describe('Successful Login Scenarios', () => {
    test('Successful Login with Valid Credentials', async () => {
        await loginPage.login('standard_user', 'secret_sauce');
        await expect(loginPage.page).toHaveURL('https://www.saucedemo.com/inventory.html');
    });
    });
    test.describe('Unsuccessful Login Scenarios', () => {
    test('Unsuccessful Login with Invalid Credentials', async () => {
        await loginPage.login('invalid_user', 'invalid_password');
        const errorMessage = await loginPage.getErrorMessage();
        expect(errorMessage).toBe('Epic sadface: Username and password do not match any user in this service');
    });
});