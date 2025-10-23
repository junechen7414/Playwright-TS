import { mergeTests } from '@playwright/test';
import { dataTest } from './TestData.fixture.js';
import {pageObjectTest} from './PageObjects.fixture.js';

export const test = mergeTests(pageObjectTest, dataTest);

export { expect } from '@playwright/test';