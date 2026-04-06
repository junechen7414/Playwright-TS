import { test as baseTest } from '@playwright/test';
import { SpringbootApiClient } from '../services/apis/SpringbootApiClient';

type SpringbootApiFixtures = {
	springbootApi: SpringbootApiClient;
};

export const springbootApiTest = baseTest.extend<SpringbootApiFixtures>({
	springbootApi: async ({ request }, use) => {
		const client = new SpringbootApiClient(request);
		// Fixture 僅負責提供實例，不應在此呼叫 API 造成隱含副作用
		await use(client);
	},
});
