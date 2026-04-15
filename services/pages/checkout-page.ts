import { expect, type Locator, type Page } from '@playwright/test';

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

	async verifyOnCheckoutStepOnePage() {
		await expect.soft(this.checkoutTitle).toHaveText('Checkout: Your Information');
	}
	async verifyOnCheckoutStepTwoPage() {
		await expect.soft(this.checkoutTitle).toHaveText('Checkout: Overview');
	}

	async verifyErrorMessageShows() {
		await expect.soft(this.errorMessage).toBeVisible();
	}

	async cancelCheckout() {
		await this.cancelButton.click();
	}
}
