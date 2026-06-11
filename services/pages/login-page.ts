import { expect, type Locator, type Page } from '@playwright/test';

/**
 * LoginPage 頁面物件
 *
 * 管理登入頁面的互動和驗證
 * 提供登入、錯誤訊息驗證和繞過登入的功能
 */
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
		// 使用 getByRole 定位錯誤訊息容器
		this.errorMessage = page
			.getByRole('heading', { level: 3 })
			.filter({ hasText: 'Epic sadface:' });
	}

	/**
	 * 導航到登入頁面
	 *
	 * @example
	 * await loginPage.goto();
	 */
	async goto() {
		await this.page.goto('');
	}

	/**
	 * 執行登入操作
	 *
	 * @param username - 使用者名稱
	 * @param password - 密碼
	 *
	 * @example
	 * await loginPage.login('standard_user', 'secret_sauce');
	 */
	async login(username: string, password: string) {
		await this.usernameInput.fill(username);
		await this.passwordInput.fill(password);
		await this.loginButton.click();
	}

	/**
	 * 驗證當前頁面是否為登入頁面
	 *
	 * 檢查 URL 是否為登入頁面的 URL
	 */
	async verifyOnLoginPage() {
		await expect(this.page).toHaveURL('');
	}

	/**
	 * 驗證錯誤訊息
	 *
	 * @param expectedMessage - 預期的錯誤訊息文字
	 *
	 * @example
	 * await loginPage.verifyErrorMessage('Epic sadface: Username is required');
	 */
	async verifyErrorMessage(expectedMessage: string) {
		await expect(this.errorMessage).toHaveText(expectedMessage);
	}

	/**
	 * 繞過登入直接導航到目標頁面
	 *
	 * 用於測試中需要直接訪問特定頁面的情況
	 *
	 * @param targetPage - 目標頁面的相對路徑
	 *
	 * @example
	 * await loginPage.bypassLogin('/inventory.html');
	 */
	async bypassLogin(targetPage: string) {
		await this.page.goto(`${targetPage}`);
	}
}
