import { mergeTests } from '@playwright/test';
import { pageObjectTest } from './PageObjects.fixture';
import { sauceTest } from './saucedemoTestData.fixture';

export const test = mergeTests(pageObjectTest, sauceTest);
export { expect } from '@playwright/test';
export { HamburgerMenu } from '../services/components/HamburgerMenu';
