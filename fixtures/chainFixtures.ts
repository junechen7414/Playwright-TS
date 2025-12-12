import { mergeTests } from '@playwright/test';
import { pageObjectTest } from './PageObjects.fixture.js';
import { dataTest } from './TestData.fixture.js';

export const test = mergeTests(pageObjectTest, dataTest);
export { expect } from '@playwright/test';
export { HamburgerMenu } from '../services/components/HamburgerMenu.js';
