import { test as baseTest } from '@playwright/test';

// 定義使用者憑證類型
type UserCredential = {
	username: string;
	password: string;
};

// 定義使用者憑證資料
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
const loginErrorData = {
	invalidCredentialsMessage:
		'Epic sadface: Username and password do not match any user in this service',
	lockedOutCredentialsMessage: 'Epic sadface: Sorry, this user has been locked out.',
	bypassLoginMessage: `Epic sadface: You can only access '/inventory.html' when you are logged in.`,
	bypassUrl: '/inventory.html',
} as const;

// 定義資料fixture類型
type DataFixtures = {
	standardUserData: UserCredential;
	lockedUserData: UserCredential;
	invalidUserData: UserCredential;
	loginErrorData: ErrorDatas;
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
});
