import type { Locator, Page } from '@playwright/test';

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
		this.menuButton = page.locator('#react-burger-menu-btn');
		this.inventoryLink = page.locator('[data-test="inventory-sidebar-link"]');
		this.aboutLink = page.locator('[data-test="about-sidebar-link"]');
		this.logoutLink = page.locator('[data-test="logout-sidebar-link"]');
		this.resetAppStateLink = page.locator('[data-test="reset-sidebar-link"]');
		this.closeMenuButton = page.locator('#react-burger-cross-btn');
	}

	async openMenu() {
		await this.menuButton.click();
	}

	async closeMenu() {
		await this.closeMenuButton.click();
	}

	async goToProductPage() {
		await this.openMenu();
		await this.inventoryLink.click();
	}

	async goToAboutPage() {
		await this.openMenu();
		await this.aboutLink.click();
	}

	async verifyOnAboutPage() {
		await this.page.url().includes('saucelabs.com');
	}

	async logout() {
		await this.openMenu();
		await this.logoutLink.click();
	}

	async resetAppState() {
		await this.openMenu();
		await this.resetAppStateLink.click();
		await this.closeMenu();
		await this.page.reload();
	}
}
