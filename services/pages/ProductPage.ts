import { type Page, expect } from '@playwright/test';

export class ProductPage {
    readonly page: Page;
    readonly CartIcon;

    constructor(page: Page) {
        this.page = page;
        this.CartIcon = page.locator('[data-test="shopping-cart-badge"]');
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
        const removeButton = productContainer.locator('.btn_inventory').filter({ hasText: 'Remove' });
        await expect(removeButton).toBeVisible();
    }

    async addMultipleProductsToCart(productNames: string[]) {
        for (const productName of productNames) {
            await this.addProductToCart(productName);
        }
    }

    async verifyMultipleItemsStatusIsRemove(productNames:string[]) {
        for (const productName of productNames) {
            await this.verifyItemButtonStatusIsRemove(productName);
        }
    }

    async verifyCartItemCount(count: number) {
        await expect(this.CartIcon).toHaveText(String(count));
    }
}