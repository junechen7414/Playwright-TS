import { expect, type Locator, type Page } from '@playwright/test';

/**
 * CartPage 頁面物件
 *
 * 管理購物車頁面的互動和驗證
 * 提供查看購物車內容、前往結帳和繼續購物的功能
 */
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
		// 使用 link role 定位購物車商品名稱（它們是可點擊的連結）
		this.cartItems = page.getByRole('link').filter({ has: page.locator('.inventory_item_name') });
		// 購物車標題：使用 getByText 因為它是 span 元素而非 heading
		this.cartTitle = page.getByText('Your Cart', { exact: true });
	}

	/**
	 * 導航到結帳頁面
	 *
	 * 點擊 Checkout 按鈕進入結帳流程
	 *
	 * @example
	 * await cartPage.goto();
	 */
	async goto() {
		await this.checkoutButton.click();
	}

	/**
	 * 繼續購物
	 *
	 * 返回產品列表頁面繼續選購商品
	 */
	async continueShopping() {
		await this.continueShoppingButton.click();
	}

	/**
	 * 驗證購物車中的商品
	 *
	 * @param productNames - 要驗證的商品名稱陣列
	 *
	 * @example
	 * await cartPage.verifyCartItems(['Sauce Labs Backpack', 'Sauce Labs Bike Light']);
	 */
	async verifyCartItems(productNames: string[]) {
		for (const productName of productNames) {
			await expect(this.cartItems.filter({ hasText: productName })).toBeVisible();
		}
	}

	/**
	 * 驗證購物車商品數量
	 *
	 * @param count - 預期的商品數量
	 *
	 * @example
	 * await cartPage.verifyCartItemCount(2);
	 */
	async verifyCartItemCount(count: number) {
		await expect(this.cartItems).toHaveCount(count);
	}

	/**
	 * 驗證當前頁面是否為購物車頁面
	 *
	 * 檢查頁面標題是否為 'Your Cart'
	 */
	async verifyOnCartPage() {
		await expect.soft(this.cartTitle).toBeVisible();
	}
}
