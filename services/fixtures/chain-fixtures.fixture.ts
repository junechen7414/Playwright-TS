import { mergeTests } from '@playwright/test';
import { pageObjectTest } from './page-objects.fixture';
import { sauceTest } from './saucedemo-test-data.fixture';

export const test = mergeTests(pageObjectTest, sauceTest);
export { HamburgerMenu } from '@components/hamburger-menu';
export { expect } from '@playwright/test';
