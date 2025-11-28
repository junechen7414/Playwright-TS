import { type Page, expect, type Locator } from '@playwright/test';
export class ProductPage {
	readonly page: Page;
	readonly cartIcon: Locator;
	readonly productTitle: Locator;
	readonly backToProductsButton: Locator;
	readonly cartLink: Locator;
	constructor(page: Page) {
		this.page = page;
		this.cartIcon = page.locator('[data-test="shopping-cart-badge"]');
		this.productTitle = page.locator('[data-test="title"]');
		this.backToProductsButton = page.locator('[data-test="back-to-products"]');
		this.cartLink = page.locator('[data-test="shopping-cart-link"]');
	}

	// 產生特定商品的定位器
	private getProductContainer(productName: string) {
		return this.page.locator('.inventory_item').filter({ hasText: productName });
	}

	async addProductToCart(productName: string) {
		const productContainer = this.getProductContainer(productName);
		await productContainer.locator('.btn_inventory').filter({ hasText: 'Add to cart' }).click();
	}

	async verifyItemButtonStatusIsRemove(productName: string) {
		const productContainer = this.getProductContainer(productName);
		const removeButton = productContainer
			.locator('.btn_inventory')
			.filter({ hasText: 'Remove' });
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
		const productContainer = this.getProductContainer(productName);
		await productContainer.locator('[data-test="inventory-item-name"]').click();
	}

	async returnToProductList() {
		await this.page.locator('[data-test="back-to-products"]').click();
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
