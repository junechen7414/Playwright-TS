// tests/api/springboot/account.spec.ts
import { expect } from '@playwright/test';
import { expectError, expectOk } from '../../../services/apis/base-api-client';
import { test } from '../../../services/fixtures/springboot-chained.fixture';

test.describe('Account 帳號管理', () => {
	test('應該能建立新帳號', async ({ springbootApi, newAccountData }) => {
		const response = await springbootApi.createAccount(newAccountData);
		const accountId = expectOk(response);

		expect(typeof accountId).toBe('number');
	});

	test('應該能取得帳號詳情', async ({ springbootApi, existingAccount }) => {
		const response = await springbootApi.getAccount(existingAccount.id);
		const data = expectOk(response);

		expect.soft(data).toMatchObject({
			name: existingAccount.name,
			status: existingAccount.status,
		});
	});

	test('應該能更新帳號', async ({ springbootApi, existingAccount, updateAccountData }) => {
		const response = await springbootApi.updateAccount(
			existingAccount.id,
			updateAccountData(existingAccount),
		);
		expectOk(response);
	});

	test('應該能刪除帳號', async ({ springbootApi, existingAccount }) => {
		const response = await springbootApi.deleteAccount(existingAccount.id);
		expectOk(response);

		const getResponse = await springbootApi.getAccount(existingAccount.id);
		expectError(getResponse, 404);
	});
});
