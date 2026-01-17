import { expect, type Locator, type Page } from '@playwright/test';

export class CartPage {
	readonly page: Page;
	readonly checkoutButton: Locator;
	readonly continueShoppingButton: Locator;
	readonly cartItems: Locator;
	readonly cartTitle: Locator;
	constructor(page: Page) {
		this.page = page;
		this.checkoutButton = page.getByRole('button', { name: 'Checkout' });
		this.continueShoppingButton = page.getByRole('button', { name: 'Continue shopping' });
		this.cartItems = page.locator('.inventory_item_name');
		this.cartTitle = page.locator('[data-test="title"]');
	}

	async goToCheckoutPage() {
		this.checkoutButton.click();
	}

	async continueShopping() {
		await this.continueShoppingButton.click();
	}

	async verifyCartItems(productNames: string[]) {
		for (const productName of productNames) {
			await expect(this.cartItems.filter({ hasText: productName })).toBeVisible();
		}
	}

	async verifyCartItemCount(count: number) {
		await expect(this.cartItems).toHaveCount(count);
	}

	async verifyOnCartPage() {
		await expect.soft(this.cartTitle).toHaveText('Your Cart');
	}
}
