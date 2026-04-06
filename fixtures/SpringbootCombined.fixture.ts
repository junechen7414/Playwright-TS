import { mergeTests } from '@playwright/test';
import { springbootApiTest } from './SpringbootApiObjects.fixture';
import { springbootTestData } from './SpringbootTestData.fixture';

// 使用組合 (Composition) 取代繼承 (Inheritance)
export const test = mergeTests(springbootApiTest, springbootTestData);

// 統一匯出常用的斷言工具
export { expect } from '@playwright/test';