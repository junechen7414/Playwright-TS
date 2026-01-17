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
		this.menuButton = page.getByRole('button', { name: 'Open Menu' });
		this.inventoryLink = page.getByRole('link', { name: 'All Items' });
		this.aboutLink = page.getByRole('link', { name: 'About' });
		this.logoutLink = page.getByRole('link', { name: 'Logout' });
		this.resetAppStateLink = page.getByRole('link', { name: 'Reset App State' });
		this.closeMenuButton = page.getByRole('button', { name: 'Close menu' });
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
