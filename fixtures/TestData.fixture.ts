import { test as baseTest } from '@playwright/test';

// 定義使用者憑證類型
type UserCredential = {
	username: string;
	password: string;
};

// 定義使用者憑證資料
// as const 讓const物件變成readonly
const credentials = {
	standard: { username: 'standard_user', password: 'secret_sauce' },
	lockedOut: { username: 'locked_out_user', password: 'secret_sauce' },
	invalid: { username: 'invalid_user', password: 'invalid_password' },
} as const;

// 定義錯誤訊息類型
type ErrorDatas = {
	invalidCredentialsMessage: string;
	lockedOutCredentialsMessage: string;
	bypassLoginMessage: string;
	bypassUrl: string;
};

// 定義錯誤訊息資料
// as const 讓const物件變成readonly
const loginErrorData = {
	invalidCredentialsMessage:
		'Epic sadface: Username and password do not match any user in this service',
	lockedOutCredentialsMessage: 'Epic sadface: Sorry, this user has been locked out.',
	bypassLoginMessage: `Epic sadface: You can only access '/inventory.html' when you are logged in.`,
	bypassUrl: '/inventory.html',
} as const;

// 定義商品類型
type Product = (typeof productsToAdd)[number];

// 定義商品資料
// as const 讓const陣列變成readonly
const productsToAdd = [
	'Sauce Labs Backpack',
	'Sauce Labs Bolt T-Shirt',
	'Sauce Labs Bike Light',
] as const;
const productToView = 'Sauce Labs Backpack' as const;

// 定義結帳人資料類型
export type CheckoutPersonData = {
	firstName: string;
	lastName: string;
	postalCode: string;
};

// 定義結帳人資料
export const checkoutPersonData: CheckoutPersonData = {
	firstName: 'Bobby',
	lastName: 'Chen',
	postalCode: '8787',
};

// 定義資料fixture類型
type DataFixtures = {
	standardUserData: UserCredential;
	lockedUserData: UserCredential;
	invalidUserData: UserCredential;
	loginErrorData: ErrorDatas;
	productsToAdd: Product[];
	productToView: Product;
	checkoutPersonData: CheckoutPersonData;
};

// 擴展基本測試fixture以包含資料fixture
export const dataTest = baseTest.extend<DataFixtures>({
	standardUserData: async ({}, use) => {
		await use({ ...credentials.standard });
	},
	lockedUserData: async ({}, use) => {
		await use({ ...credentials.lockedOut });
	},
	invalidUserData: async ({}, use) => {
		await use({ ...credentials.invalid });
	},
	loginErrorData: async ({}, use) => {
		await use({ ...loginErrorData });
	},
	productsToAdd: async ({}, use) => {
		await use([...productsToAdd]);
	},
	productToView: async ({}, use) => {
		await use(productToView);
	},
	checkoutPersonData: async ({}, use) => {
		await use({ ...checkoutPersonData });
	},
});
