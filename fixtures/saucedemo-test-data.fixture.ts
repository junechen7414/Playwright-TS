import { faker } from '@faker-js/faker';
import { test as baseTest } from '@playwright/test';

// ==========================================
// 1. 類型定義 (保持簡潔)
// ==========================================
type UserCredential = { username: string; password: string };
type ErrorDatas = {
	invalidCredentialsMessage: string;
	lockedOutCredentialsMessage: string;
	bypassLoginMessage: string;
	bypassUrl: string;
};
export type CheckoutPersonData = { firstName: string; lastName: string; postalCode: string };
type Product = string;

// Fixture 類型定義
type SauceDataFixtures = {
	standardUserData: UserCredential;
	lockedUserData: UserCredential;
	invalidUserData: UserCredential;
	loginErrorData: ErrorDatas;
	productsToAdd: readonly Product[];
	productToView: Product;
	checkoutPersonData: CheckoutPersonData;
};

// ==========================================
// 2. 靜態資料集 (只放 SauceDemo 專屬資料)
// ==========================================
const SAUCE_DATA = {
	credentials: {
		standard: { username: 'standard_user', password: 'secret_sauce' },
		lockedOut: { username: 'locked_out_user', password: 'secret_sauce' },
		invalid: { username: 'invalid_user', password: 'invalid_password' },
	},
	loginErrorData: {
		invalidCredentialsMessage:
			'Epic sadface: Username and password do not match any user in this service',
		lockedOutCredentialsMessage: 'Epic sadface: Sorry, this user has been locked out.',
		bypassLoginMessage: `Epic sadface: You can only access '/inventory.html' when you are logged in.`,
		bypassUrl: '/inventory.html',
	},
	// 這邊直接放 Staging 環境需要的產品列表
	productsToAdd: ['Sauce Labs Onesie', 'Sauce Labs Fleece Jacket'],
	productToView: 'Sauce Labs Backpack',
} as const;

// ==========================================
// 3. 核心 Fixture 邏輯
// ==========================================
export const sauceTest = baseTest.extend<SauceDataFixtures>({
	standardUserData: async ({}, use) => {
		await use(SAUCE_DATA.credentials.standard);
	},

	lockedUserData: async ({}, use) => {
		await use(SAUCE_DATA.credentials.lockedOut);
	},

	invalidUserData: async ({}, use) => {
		await use(SAUCE_DATA.credentials.invalid);
	},

	loginErrorData: async ({}, use) => {
		await use(SAUCE_DATA.loginErrorData);
	},

	productsToAdd: async ({}, use) => {
		await use(SAUCE_DATA.productsToAdd);
	},
	productToView: async ({}, use) => {
		await use(SAUCE_DATA.productToView);
	},

	// 結帳人資料動態產生
	checkoutPersonData: async ({}, use) => {
		await use({
			firstName: faker.person.firstName(),
			lastName: faker.person.lastName(),
			postalCode: faker.location.zipCode('###'),
		});
	},
});
