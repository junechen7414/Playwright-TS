import { expect, type Locator, type Page } from '@playwright/test';

export class LoginPage {
	readonly page: Page;
	readonly usernameInput: Locator;
	readonly passwordInput: Locator;
	readonly loginButton: Locator;
	readonly errorMessage: Locator;
	constructor(page: Page) {
		this.page = page;
		this.usernameInput = page.getByRole('textbox', { name: 'Username' });
		this.passwordInput = page.getByRole('textbox', { name: 'Password' });
		this.loginButton = page.getByRole('button', { name: 'Login' });
		this.errorMessage = page.getByText('Epic sadface:');
	}
	async goto() {
		await this.page.goto('');
	}
	async login(username: string, password: string) {
		await this.usernameInput.fill(username);
		await this.passwordInput.fill(password);
		await this.loginButton.click();
	}
	async verifyOnLoginPage() {
		await expect(this.page).toHaveURL('');
	}
	async verifyErrorMessage(expectedMessage: string) {
		await expect(this.errorMessage).toHaveText(expectedMessage);
	}
	async bypassLogin(targetPage: string) {
		await this.page.goto(`${targetPage}`);
	}
}
