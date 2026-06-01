# 測試架構

> 本文件說明 Custom Fixtures 與 Page Object Model 設計

## Custom Fixtures 架構

本專案使用 Playwright 的 Fixture 系統來管理測試依賴。

### 核心優勢

1. **封裝與可重用性**: 將準備工作與測試內容分離
2. **依賴注入**: 自動執行初始化邏輯
3. **按需執行**: 只有測試用到的 Fixture 才會執行（與 `beforeEach` 不同）

### Fixture 類型

#### page-objects.fixture.ts
封裝 UI 頁面物件，提供：
- `loginPage` - 登入頁面
- `productPage` - 產品頁面
- `cartPage` - 購物車頁面
- `checkoutPage` - 結帳頁面

#### springboot-api-objects.fixture.ts
封裝 API 客戶端，提供：
- `accountApi` - 帳戶 API
- `productApi` - 產品 API
- `orderApi` - 訂單 API

#### saucedemo-test-data.fixture.ts
封裝 UI 測試資料，提供：
- `standardUserData` - 標準使用者資料
- `lockedOutUserData` - 鎖定使用者資料
- `problemUserData` - 問題使用者資料

#### chain-fixtures.fixture.ts
使用 `mergeTests` 整合所有 Fixtures，提供統一的測試入口。

### 使用範例

```typescript
import { test, expect } from '../fixtures/chain-fixtures';

test('使用者可以成功登入', async ({ loginPage, standardUserData }) => {
  // Fixtures 自動注入，無需手動初始化
  await loginPage.login(standardUserData.username, standardUserData.password);
  await loginPage.verifyLoginSuccess();
});

test('可以新增產品到購物車', async ({ productPage, cartPage }) => {
  await productPage.addProductToCart('Backpack');
  await cartPage.verifyProductInCart('Backpack');
});
```

### Fixture 優勢對比

**使用 Fixture**:
```typescript
test('測試', async ({ loginPage, standardUserData }) => {
  // 直接使用，無需初始化
  await loginPage.login(standardUserData.username, standardUserData.password);
});
```

**不使用 Fixture** (傳統方式):
```typescript
test('測試', async ({ page }) => {
  // 每個測試都要重複初始化
  const loginPage = new LoginPage(page);
  const userData = { username: 'standard_user', password: 'secret_sauce' };
  await loginPage.login(userData.username, userData.password);
});
```

## Page Object Model 設計

### 核心原則

1. **封裝低階操作**: 不暴露 Locators 和 `page.click()` 等細節
2. **商業邏輯導向**: 方法名稱反映使用者行為，而非 UI 操作
3. **隱藏斷言細節**: 將驗證邏輯封裝進 Page Object

### 設計範例

#### ✅ 好的做法：語意化方法

```typescript
class CheckoutPage {
  async fillCheckoutInformation(firstName: string, lastName: string, zipCode: string) {
    await this.page.getByLabel('First Name').fill(firstName);
    await this.page.getByLabel('Last Name').fill(lastName);
    await this.page.getByLabel('Zip/Postal Code').fill(zipCode);
  }

  async continueCheckout() {
    await this.page.getByRole('button', { name: 'Continue' }).click();
  }

  async finishCheckout() {
    await this.page.getByRole('button', { name: 'Finish' }).click();
  }

  async verifyOrderCompletion() {
    await expect(this.page.getByText('Thank you for your order!')).toBeVisible();
  }
}

// 測試中使用
await checkoutPage.fillCheckoutInformation('John', 'Doe', '12345');
await checkoutPage.continueCheckout();
await checkoutPage.finishCheckout();
await checkoutPage.verifyOrderCompletion();
```

#### ❌ 避免：暴露技術細節

```typescript
// 不好的做法：在測試中直接操作元素
await page.getByLabel('First Name').fill('John');
await page.getByLabel('Last Name').fill('Doe');
await page.getByLabel('Zip/Postal Code').fill('12345');
await page.getByRole('button', { name: 'Continue' }).click();
await page.getByRole('button', { name: 'Finish' }).click();
await expect(page.getByText('Thank you for your order!')).toBeVisible();
```

### Page Object 結構

```typescript
export class ProductPage {
  constructor(private readonly page: Page) {}

  // 私有方法：封裝元素定位
  private getAddToCartButton(productName: string) {
    return this.page.getByRole('button', { name: `Add ${productName} to cart` });
  }

  // 公開方法：提供商業邏輯操作
  async addProductToCart(productName: string) {
    await this.getAddToCartButton(productName).click();
  }

  // 驗證方法：封裝斷言邏輯
  async verifyProductAdded(productName: string) {
    const button = this.getAddToCartButton(productName);
    await expect(button).toHaveText('Remove');
  }
}
```

### 方法命名規範

| 操作類型 | 命名模式 | 範例 |
|---------|---------|------|
| 導航 | `navigateTo{Page}` | `navigateToCart()` |
| 填寫 | `fill{Field}` | `fillCheckoutInformation()` |
| 點擊 | `click{Element}` 或動詞 | `continueCheckout()` |
| 驗證 | `verify{Condition}` | `verifyOrderCompletion()` |
| 取得 | `get{Data}` | `getProductPrice()` |

## 元件化設計

對於重複出現的 UI 元件，創建獨立的元件類別。

### 範例：漢堡選單元件

```typescript
export class HamburgerMenu {
  constructor(private readonly page: Page) {}

  async open() {
    await this.page.getByRole('button', { name: 'Open Menu' }).click();
  }

  async logout() {
    await this.open();
    await this.page.getByRole('link', { name: 'Logout' }).click();
  }
}

// 在 Page Object 中使用
class ProductPage {
  private hamburgerMenu: HamburgerMenu;

  constructor(private readonly page: Page) {
    this.hamburgerMenu = new HamburgerMenu(page);
  }

  async logout() {
    await this.hamburgerMenu.logout();
  }
}
```

## 測試資料管理

### 使用 Fixture 管理測試資料

```typescript
// saucedemo-test-data.fixture.ts
export const saucedemoTestDataFixture = base.extend<SaucedemoTestData>({
  standardUserData: async ({}, use) => {
    await use({
      username: 'standard_user',
      password: 'secret_sauce',
    });
  },
});

// 測試中使用
test('登入測試', async ({ loginPage, standardUserData }) => {
  await loginPage.login(standardUserData.username, standardUserData.password);
});
```

### 優點

- ✅ 集中管理測試資料
- ✅ 易於維護和更新
- ✅ 避免硬編碼
- ✅ 支援多環境配置

## 相關文件

- [架構概覽](./07-architecture-overview.md)
- [元素定位策略](./09-locator-strategies.md)
- [程式設計原則](./06-coding-principles.md)