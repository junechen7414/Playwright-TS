import { expect, test } from '@playwright/test';
import { UserApiClient } from '../../services/apis/UserApiClient.js';

test.describe('User API Tests', () => {
	test('should retrieve user data successfully', async ({ request }) => {
		const apiClient = new UserApiClient(request);
		const userId = 1;

		const response = await apiClient.getUser(userId);

		// 驗證狀態碼
		expect(response.status()).toBe(200);

		// 驗證回傳資料結構 (GraphQL 回傳資料會封裝在 data 屬性中)
		const result = await response.json();
		const user = result.data.user;

		expect(Number(user.id)).toBe(userId);
		expect(user).toHaveProperty('name');
		expect(user).toHaveProperty('avatar');
	});
});
