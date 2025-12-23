import { expect, type Locator, type Page } from '@playwright/test';
export class ProductPage {
	readonly page: Page;
	readonly cartIcon: Locator;
	readonly productTitle: Locator;
	readonly backToProductsButton: Locator;
	readonly cartLink: Locator;
	constructor(page: Page) {
		this.page = page;
		this.cartIcon = page.locator('[data-test="shopping-cart-badge"]'); // nothing better available, can't use user-first locator
		this.productTitle = page.getByText('Products');
		this.backToProductsButton = page.getByRole('button', { name: 'Back to products' });
		this.cartLink = page.locator('.shopping_cart_link');
	}

	// 產生特定商品的定位器
	private getProductContainer(productName: string) {
		return this.page.locator('.inventory_item').filter({ hasText: productName });
	}

	async addProductToCart(productName: string) {
		const productContainer = this.getProductContainer(productName);
		await productContainer.getByRole('button', { name: 'Add to cart' }).click();
	}

	async verifyItemButtonStatusIsRemove(productName: string) {
		const productContainer = this.getProductContainer(productName);
		const removeButton = productContainer.getByRole('button', { name: 'Remove' });
		await expect.soft(removeButton).toBeVisible();
	}

	async addMultipleProductsToCart(productNames: string[]) {
		for (const productName of productNames) {
			await this.addProductToCart(productName);
		}
	}

	async verifyMultipleItemsStatusIsRemove(productNames: string[]) {
		for (const productName of productNames) {
			await this.verifyItemButtonStatusIsRemove(productName);
		}
	}

	async verifyCartItemCount(count: number) {
		await expect(this.cartIcon).toHaveText(String(count));
	}

	async verifyCartIconNotVisible() {
		await expect(this.cartIcon).toBeHidden();
	}

	async viewProductDetails(productName: string) {
		await this.page.getByText(productName).click();
	}

	async returnToProductList() {
		await this.backToProductsButton.click();
	}
	async verifyOnProductListPage() {
		await expect.soft(this.productTitle).toHaveText('Products');
	}
	async verifyOnProductDetailPage() {
		expect.soft(this.backToProductsButton).toBeVisible();
	}

	async goToCartPage() {
		await this.cartLink.click();
	}
}
