import { test as baseTest } from '@playwright/test';

// 1. 取得測試環境，預設為 'local'
const TEST_ENV = (process.env.ENV || 'local').toLowerCase().trim();

// 定義使用者憑證類型
type UserCredential = {
	username: string;
	password: string;
};

// 定義使用者憑證資料
// 預設資料 (Local)
const defaultCredentials = {
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
const defaultLoginErrorData = {
	invalidCredentialsMessage:
		'Epic sadface: Username and password do not match any user in this service',
	lockedOutCredentialsMessage: 'Epic sadface: Sorry, this user has been locked out.',
	bypassLoginMessage: `Epic sadface: You can only access '/inventory.html' when you are logged in.`,
	bypassUrl: '/inventory.html',
} as const;

// 定義商品資料
const defaultProductsToAdd = [
	'Sauce Labs Backpack',
	'Sauce Labs Bolt T-Shirt',
	'Sauce Labs Bike Light',
];
const defaultProductToView = 'Sauce Labs Backpack';

// 定義結帳人資料類型
export type CheckoutPersonData = {
	firstName: string;
	lastName: string;
	postalCode: string;
};

// 定義結帳人資料
const checkoutPersonDataFromEnv: CheckoutPersonData = {
	firstName: process.env.CHECKOUT_FIRSTNAME || 'CI',
	lastName: process.env.CHECKOUT_LASTNAME || 'Test',
	postalCode: process.env.CHECKOUT_POSTALCODE || '101',
};

// ==================================================
// 環境資料設定 (Environment Data Configuration)
// ==================================================

// 2. 定義資料集結構 (Base Data)
const baseTestData = {
	credentials: defaultCredentials,
	loginErrorData: defaultLoginErrorData,
	productsToAdd: defaultProductsToAdd,
	productToView: defaultProductToView,
	checkoutPersonData: checkoutPersonDataFromEnv,
};

// 3. 定義 Staging 環境的資料 (Override)
// 使用 ...baseTestData 繼承預設值，只修改需要變更的部分
const stagingTestData = {
	...baseTestData,
	// 針對 Staging 修改商品列表
	productsToAdd: ['Sauce Labs Onesie', 'Sauce Labs Fleece Jacket'],
};

// 4. 根據環境變數選擇目前的資料集
const dataMap: Record<string, typeof baseTestData> = {
	local: baseTestData,
	staging: stagingTestData,
};

const currentData = dataMap[TEST_ENV] || baseTestData;

// 匯出結帳人資料供引用
export const checkoutPersonData = currentData.checkoutPersonData;

// 定義商品類型
type Product = string;

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
	standardUserData: async ({ page: _ }, use) => {
		await use({ ...currentData.credentials.standard });
	},

	lockedUserData: async ({ page: _ }, use) => {
		await use({ ...currentData.credentials.lockedOut });
	},

	invalidUserData: async ({ page: _ }, use) => {
		await use({ ...currentData.credentials.invalid });
	},

	loginErrorData: async ({ page: _ }, use) => {
		await use({ ...currentData.loginErrorData });
	},

	productsToAdd: async ({ page: _ }, use) => {
		await use([...currentData.productsToAdd]);
	},

	productToView: async ({ page: _ }, use) => {
		await use(currentData.productToView);
	},

	checkoutPersonData: async ({ page: _ }, use) => {
		await use({ ...currentData.checkoutPersonData });
	},
});
