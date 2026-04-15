import { mergeTests } from '@playwright/test';
import { springbootApiTest } from './springboot-api-objects.fixture';
import { springbootTestData } from './springboot-test-data.fixture';

// 使用組合 (Composition) 取代繼承 (Inheritance)
export const test = mergeTests(springbootApiTest, springbootTestData);

// 統一匯出常用的斷言工具
export { expect } from '@playwright/test';