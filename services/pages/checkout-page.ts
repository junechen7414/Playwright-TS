import { expect, type Locator, type Page } from '@playwright/test';

/**
 * CheckoutPage 頁面物件
 *
 * 管理結帳流程的互動和驗證
 * 包含填寫個人資訊、確認訂單和完成購買的功能
 */
export class CheckoutPage {
	readonly page: Page;
	readonly firstNameInput: Locator;
	readonly lastNameInput: Locator;
	readonly postalCodeInput: Locator;
	readonly continueButton: Locator;
	readonly finishButton: Locator;
	readonly completeHeader: Locator;
	readonly completeText: Locator;
	readonly cancelButton: Locator;
	readonly checkoutTitle: Locator;
	readonly errorMessage: Locator;

	constructor(page: Page) {
		this.page = page;
		this.firstNameInput = page.getByRole('textbox', { name: 'First Name' });
		this.lastNameInput = page.getByRole('textbox', { name: 'Last Name' });
		this.postalCodeInput = page.getByRole('textbox', { name: 'Postal Code' });
		this.continueButton = page.getByRole('button', { name: 'Continue' });
		this.finishButton = page.getByRole('button', { name: 'Finish' });
		this.completeHeader = page.getByRole('heading', { name: 'Thank you for your order' });
		this.completeText = page.locator('[data-test="complete-text"]');
		this.cancelButton = page.getByRole('button', { name: 'Cancel' });
		this.checkoutTitle = page.locator('[data-test="title"]');
		this.errorMessage = page.getByText('Error');
	}

	/**
	 * 填寫結帳資訊
	 *
	 * @param firstName - 名字
	 * @param lastName - 姓氏
	 * @param postalCode - 郵遞區號
	 *
	 * @example
	 * await checkoutPage.fillCheckoutInformation('John', 'Doe', '12345');
	 */
	async fillCheckoutInformation(firstName: string, lastName: string, postalCode: string) {
		await this.firstNameInput.fill(firstName);
		await this.lastNameInput.fill(lastName);
		await this.postalCodeInput.fill(postalCode);
	}

	/**
	 * 繼續結帳流程
	 *
	 * 從資訊填寫頁面進入訂單確認頁面
	 */
	async continueCheckout() {
		await this.continueButton.click();
	}

	/**
	 * 完成結帳
	 *
	 * 確認訂單並完成購買流程
	 */
	async finishCheckout() {
		await this.finishButton.click();
	}

	/**
	 * 驗證訂單完成
	 *
	 * 檢查訂單完成頁面的標題和訊息是否顯示
	 */
	async verifyOrderCompletion() {
		await expect(this.completeHeader).toBeVisible();
		await expect(this.completeText).toBeVisible();
	}

	/**
	 * 驗證當前頁面是否為結帳步驟一（填寫資訊）
	 *
	 * 檢查頁面標題是否為 'Checkout: Your Information'
	 */
	async verifyOnCheckoutStepOnePage() {
		await expect.soft(this.checkoutTitle).toHaveText('Checkout: Your Information');
	}

	/**
	 * 驗證當前頁面是否為結帳步驟二（訂單確認）
	 *
	 * 檢查頁面標題是否為 'Checkout: Overview'
	 */
	async verifyOnCheckoutStepTwoPage() {
		await expect.soft(this.checkoutTitle).toHaveText('Checkout: Overview');
	}

	/**
	 * 驗證錯誤訊息是否顯示
	 *
	 * 用於驗證表單驗證錯誤
	 */
	async verifyErrorMessageShows() {
		await expect.soft(this.errorMessage).toBeVisible();
	}

	/**
	 * 取消結帳
	 *
	 * 返回購物車或產品列表頁面
	 */
	async cancelCheckout() {
		await this.cancelButton.click();
	}
}
