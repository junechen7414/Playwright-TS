import { mergeTests } from '@playwright/test';
import { pageObjectTest } from './page-objects.fixture';
import { sauceTest } from './saucedemo-test-data.fixture';

export const test = mergeTests(pageObjectTest, sauceTest);
export { expect } from '@playwright/test';
export { HamburgerMenu } from '../services/components/HamburgerMenu';
