import { expect, type Locator, type Page } from '@playwright/test';

/**
 * ProductPage 頁面物件
 *
 * 管理產品列表和產品詳情頁面的互動和驗證
 * 提供加入購物車、查看產品詳情和導航到購物車的功能
 */
export class ProductPage {
	readonly page: Page;
	readonly cartIcon: Locator;
	readonly productTitle: Locator;
	readonly backToProductsButton: Locator;
	readonly cartLink: Locator;

	constructor(page: Page) {
		this.page = page;
		// 購物車徽章：使用 data-test 因為沒有更好的語義化選擇器
		this.cartIcon = page.locator('[data-test="shopping-cart-badge"]');
		// 產品標題：使用 getByText 因為它是 span 元素而非 heading
		this.productTitle = page.getByText('Products', { exact: true });
		this.backToProductsButton = page.getByRole('button', { name: 'Back to products' });
		// 購物車連結：使用 class selector 因為沒有更好的語義化選擇器（它是一個沒有文字的圖示連結）
		this.cartLink = page.locator('.shopping_cart_link');
	}

	/**
	 * 產生特定商品的容器定位器
	 *
	 * @param productName - 商品名稱
	 * @returns 商品容器的 Locator
	 * @private
	 */
	private getProductContainer(productName: string) {
		return this.page.locator('.inventory_item').filter({ hasText: productName });
	}

	/**
	 * 導航到產品列表頁面
	 *
	 * @example
	 * await productPage.goto();
	 */
	async goto() {
		await this.page.goto('/inventory.html');
	}

	/**
	 * 將商品加入購物車
	 *
	 * @param productName - 要加入購物車的商品名稱
	 *
	 * @example
	 * await productPage.addProductToCart('Sauce Labs Backpack');
	 */
	async addProductToCart(productName: string) {
		const productContainer = this.getProductContainer(productName);
		await productContainer.getByRole('button', { name: 'Add to cart' }).click();
	}

	/**
	 * 驗證商品按鈕狀態是否為 Remove
	 *
	 * 用於確認商品已成功加入購物車
	 *
	 * @param productName - 要驗證的商品名稱
	 */
	async verifyItemButtonStatusIsRemove(productName: string) {
		const productContainer = this.getProductContainer(productName);
		const removeButton = productContainer.getByRole('button', { name: 'Remove' });
		await expect.soft(removeButton).toBeVisible();
	}

	/**
	 * 將多個商品加入購物車
	 *
	 * @param productNames - 要加入購物車的商品名稱陣列
	 *
	 * @example
	 * await productPage.addMultipleProductsToCart(['Sauce Labs Backpack', 'Sauce Labs Bike Light']);
	 */
	async addMultipleProductsToCart(productNames: string[]) {
		for (const productName of productNames) {
			await this.addProductToCart(productName);
		}
	}

	/**
	 * 驗證多個商品的按鈕狀態是否為 Remove
	 *
	 * @param productNames - 要驗證的商品名稱陣列
	 */
	async verifyMultipleItemsStatusIsRemove(productNames: string[]) {
		for (const productName of productNames) {
			await this.verifyItemButtonStatusIsRemove(productName);
		}
	}

	/**
	 * 驗證購物車圖示上的商品數量
	 *
	 * @param count - 預期的商品數量
	 *
	 * @example
	 * await productPage.verifyCartItemCount(2);
	 */
	async verifyCartItemCount(count: number) {
		await expect(this.cartIcon).toHaveText(String(count));
	}

	/**
	 * 驗證購物車圖示是否不可見
	 *
	 * 用於確認購物車為空時圖示不顯示
	 */
	async verifyCartIconNotVisible() {
		await expect(this.cartIcon).toBeHidden();
	}

	/**
	 * 查看商品詳情
	 *
	 * @param productName - 要查看的商品名稱
	 *
	 * @example
	 * await productPage.viewProductDetails('Sauce Labs Backpack');
	 */
	async viewProductDetails(productName: string) {
		await this.page.getByText(productName).click();
	}

	/**
	 * 返回產品列表頁面
	 *
	 * 從產品詳情頁面返回產品列表
	 */
	async returnToProductList() {
		await this.backToProductsButton.click();
	}

	/**
	 * 驗證當前頁面是否為產品列表頁面
	 *
	 * 檢查頁面標題是否為 'Products'
	 */
	async verifyOnProductListPage() {
		await expect.soft(this.productTitle).toBeVisible();
	}

	/**
	 * 驗證當前頁面是否為產品詳情頁面
	 *
	 * 檢查 'Back to products' 按鈕是否可見
	 */
	async verifyOnProductDetailPage() {
		await expect.soft(this.backToProductsButton).toBeVisible();
	}

	/**
	 * 導航到購物車頁面
	 *
	 * 點擊購物車圖示進入購物車
	 */
	async goToCartPage() {
		await this.cartLink.click();
	}
}
