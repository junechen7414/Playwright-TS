import { expect, type Locator, type Page } from '@playwright/test';

/**
 * HamburgerMenu 元件
 *
 * 管理 SauceDemo 應用程式的漢堡選單互動
 * 提供導航、登出和重置應用程式狀態的功能
 */
export class HamburgerMenu {
	readonly page: Page;
	readonly menuButton: Locator;
	readonly inventoryButton: Locator;
	readonly aboutLink: Locator;
	readonly logoutButton: Locator;
	readonly resetAppStateButton: Locator;
	readonly closeMenuButton: Locator;

	constructor(page: Page) {
		this.page = page;
		this.menuButton = page.getByRole('button', { name: 'Open Menu' });
		// 選單項目中只有 About 仍是外部連結，其餘皆為 button
		this.inventoryButton = page.getByRole('button', { name: 'All Items' });
		this.aboutLink = page.getByRole('link', { name: 'About' });
		this.logoutButton = page.getByRole('button', { name: 'Logout' });
		this.resetAppStateButton = page.getByRole('button', { name: 'Reset App State' });
		this.closeMenuButton = page.getByRole('button', { name: 'Close menu' });
	}

	/**
	 * 開啟漢堡選單
	 */
	async openMenu() {
		await this.menuButton.click();
	}

	/**
	 * 關閉漢堡選單
	 */
	async closeMenu() {
		await this.closeMenuButton.click();
	}

	/**
	 * 導航到產品列表頁面
	 *
	 * @example
	 * await hamburgerMenu.goto();
	 */
	async goto() {
		await this.openMenu();
		await this.inventoryButton.click();
	}

	/**
	 * 導航到關於頁面
	 */
	async goToAboutPage() {
		await this.openMenu();
		await this.aboutLink.click();
	}

	/**
	 * 驗證當前頁面是否為關於頁面
	 *
	 * 檢查 URL 是否包含 'saucelabs.com'
	 */
	async verifyOnAboutPage() {
		await expect(this.page).toHaveURL(/saucelabs\.com/);
	}

	/**
	 * 執行登出操作
	 *
	 * 開啟選單並點擊登出按鈕
	 */
	async logout() {
		await this.openMenu();
		await this.logoutButton.click();
	}

	/**
	 * 重置應用程式狀態
	 *
	 * 清除購物車和其他應用程式狀態，然後重新載入頁面
	 */
	async resetAppState() {
		await this.openMenu();
		await this.resetAppStateButton.click();
		await this.closeMenu();
		await this.page.reload();
	}
}
