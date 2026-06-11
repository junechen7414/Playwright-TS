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
	readonly inventoryLink: Locator;
	readonly aboutLink: Locator;
	readonly logoutLink: Locator;
	readonly resetAppStateLink: Locator;
	readonly closeMenuButton: Locator;

	constructor(page: Page) {
		this.page = page;
		this.menuButton = page.getByRole('button', { name: 'Open Menu' });
		this.inventoryLink = page.getByRole('link', { name: 'All Items' });
		this.aboutLink = page.getByRole('link', { name: 'About' });
		this.logoutLink = page.getByRole('link', { name: 'Logout' });
		this.resetAppStateLink = page.getByRole('link', { name: 'Reset App State' });
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
		await this.inventoryLink.click();
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
	 * 開啟選單並點擊登出連結
	 */
	async logout() {
		await this.openMenu();
		await this.logoutLink.click();
	}

	/**
	 * 重置應用程式狀態
	 *
	 * 清除購物車和其他應用程式狀態，然後重新載入頁面
	 */
	async resetAppState() {
		await this.openMenu();
		await this.resetAppStateLink.click();
		await this.closeMenu();
		await this.page.reload();
	}
}
