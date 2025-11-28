import { type Page, type Locator, expect } from '@playwright/test';

export class CheckoutPage {
	readonly page: Page;
	readonly firstNameInput: Locator;
	readonly lastNameInput: Locator;
	readonly postalCodeInput: Locator;
	readonly continueButton: Locator;
	readonly finishButton: Locator;
	readonly completeHeader: Locator;
	readonly completeText: Locator;
	constructor(page: Page) {
		this.page = page;
		this.firstNameInput = page.locator('[data-test="firstName"]');
		this.lastNameInput = page.locator('[data-test="lastName"]');
		this.postalCodeInput = page.locator('[data-test="postalCode"]');
		this.continueButton = page.locator('[data-test="continue"]');
		this.finishButton = page.locator('[data-test="finish"]');
		this.completeHeader = page.locator('[data-test="complete-header"]');
		this.completeText = page.locator('[data-test="complete-text"]');
	}

	async fillCheckoutInformation(firstName: string, lastName: string, postalCode: string) {
		await this.firstNameInput.fill(firstName);
		await this.lastNameInput.fill(lastName);
		await this.postalCodeInput.fill(postalCode);
	}

	async continueCheckout() {
		await this.continueButton.click();
	}

	async finishCheckout() {
		await this.finishButton.click();
	}

	async verifyOrderCompletion() {
		await expect(this.completeHeader).toBeVisible();
		await expect(this.completeText).toBeVisible();
	}
}
