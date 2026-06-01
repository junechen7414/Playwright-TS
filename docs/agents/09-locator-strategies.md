# 元素定位策略

> 本文件說明 Playwright 元素定位的最佳實踐

## 定位器優先順序

按照穩健性和可維護性排序（由高到低）：

### 1. getByRole (最推薦)

最穩健的定位方式，符合無障礙設計原則。

```typescript
// 按鈕
await page.getByRole('button', { name: 'Submit' }).click();

// 連結
await page.getByRole('link', { name: 'Home' }).click();

// 文字輸入框
await page.getByRole('textbox', { name: 'Username' }).fill('user123');

// 複選框
await page.getByRole('checkbox', { name: 'Remember me' }).check();
```

**優點**:
- ✅ 最穩健，不受 DOM 結構變化影響
- ✅ 符合無障礙設計（ARIA）
- ✅ 語意清晰，易於理解
- ✅ 自動處理多語言（透過 ARIA label）

**常用 Role**:
- `button` - 按鈕
- `link` - 連結
- `textbox` - 文字輸入框
- `checkbox` - 複選框
- `radio` - 單選按鈕
- `heading` - 標題
- `list` - 列表
- `listitem` - 列表項目

### 2. getByText

透過顯示文字定位元素。

```typescript
// 精確匹配
await page.getByText('Welcome back!').click();

// 部分匹配
await page.getByText('Welcome', { exact: false }).click();

// 使用正則表達式
await page.getByText(/welcome/i).click();
```

**適用情境**:
- 靜態文字內容
- 標籤或標題
- 確認訊息

**注意事項**:
- ⚠️ 文字變更會導致測試失敗
- ⚠️ 多語言環境需要特別處理

### 3. getByLabel

適用於表單輸入欄位。

```typescript
// 透過 label 定位
await page.getByLabel('Email address').fill('user@example.com');
await page.getByLabel('Password').fill('secret123');

// 支援部分匹配
await page.getByLabel('Email', { exact: false }).fill('user@example.com');
```

**優點**:
- ✅ 語意清晰
- ✅ 符合無障礙設計
- ✅ 適合表單測試

### 4. getByPlaceholder

當沒有 label 時使用。

```typescript
await page.getByPlaceholder('Enter your email').fill('user@example.com');
await page.getByPlaceholder('Search...').fill('product name');
```

**適用情境**:
- 搜尋框
- 沒有明確 label 的輸入框

### 5. getByTestId (最後選擇)

使用 `data-testid` 屬性定位。

```typescript
await page.getByTestId('submit-button').click();
await page.getByTestId('user-profile').click();
```

**使用時機**:
- 其他定位器都不適用時
- 需要穩定的定位器但元素沒有語意化屬性

**缺點**:
- ❌ 需要修改 HTML 添加測試屬性
- ❌ 不符合無障礙設計原則

## 使用 Chrome DevTools 查看 Accessibility

### 步驟

1. 開啟 Chrome DevTools (F12)
2. 切換到 **Elements** 面板
3. 選擇要檢查的元素
4. 在右側面板切換到 **Accessibility** 標籤
5. 查看 **Role** 和 **Name** 屬性

### 範例

```html
<button aria-label="Add to cart">
  <svg>...</svg>
</button>
```

**Accessibility 面板顯示**:
- Role: `button`
- Name: `Add to cart`

**對應的定位器**:
```typescript
await page.getByRole('button', { name: 'Add to cart' }).click();
```

## 定位器組合

### 鏈式定位

```typescript
// 在特定容器內定位
await page
  .getByRole('article')
  .filter({ hasText: 'Product 1' })
  .getByRole('button', { name: 'Add to cart' })
  .click();
```

### 使用 locator

```typescript
// 定義可重用的定位器
const productCard = page.locator('[data-testid="product-card"]').first();
await productCard.getByRole('button', { name: 'Add to cart' }).click();
```

## 避免的定位方式

### ❌ CSS Selector (不推薦)

```typescript
// 脆弱，容易因 DOM 變化而失效
await page.locator('.btn-primary').click();
await page.locator('#submit-btn').click();
```

### ❌ XPath (不推薦)

```typescript
// 難以閱讀和維護
await page.locator('//button[@class="btn-primary"]').click();
```

### ❌ 依賴 DOM 結構 (不推薦)

```typescript
// 脆弱，DOM 結構變化會失效
await page.locator('div > div > button').click();
```

## 最佳實踐

### 1. 優先使用語意化定位器

```typescript
// ✅ 好的做法
await page.getByRole('button', { name: 'Submit' }).click();

// ❌ 避免
await page.locator('[data-testid="submit-btn"]').click();
```

### 2. 使用有意義的 name 參數

```typescript
// ✅ 清晰明確
await page.getByRole('button', { name: 'Add to cart' }).click();

// ❌ 模糊不清
await page.getByRole('button').first().click();
```

### 3. 封裝定位邏輯到 Page Object

```typescript
class ProductPage {
  // 私有方法封裝定位器
  private getAddToCartButton(productName: string) {
    return this.page.getByRole('button', { name: `Add ${productName} to cart` });
  }

  // 公開方法提供操作
  async addProductToCart(productName: string) {
    await this.getAddToCartButton(productName).click();
  }
}
```

### 4. 處理動態內容

```typescript
// 使用正則表達式
await page.getByText(/Product \d+/).click();

// 使用 filter
await page
  .getByRole('listitem')
  .filter({ hasText: 'Available' })
  .first()
  .click();
```

### 5. 等待元素狀態

```typescript
// 等待可見
await page.getByRole('button', { name: 'Submit' }).waitFor({ state: 'visible' });

// 等待啟用
await page.getByRole('button', { name: 'Submit' }).waitFor({ state: 'enabled' });
```

## 常見問題

### Q: 如何定位沒有文字的按鈕？

```typescript
// 使用 aria-label
await page.getByRole('button', { name: 'Close' }).click();

// 或使用 title 屬性
await page.getByTitle('Close dialog').click();
```

### Q: 如何處理重複的元素？

```typescript
// 使用 filter 縮小範圍
await page
  .getByRole('button', { name: 'Delete' })
  .filter({ hasText: 'Product 1' })
  .click();

// 或使用 nth
await page.getByRole('button', { name: 'Delete' }).nth(0).click();
```

### Q: 如何定位 Shadow DOM 內的元素？

```typescript
// Playwright 自動穿透 Shadow DOM
await page.getByRole('button', { name: 'Submit' }).click();
```

## 相關文件

- [測試架構](./08-test-architecture.md)
- [程式設計原則](./06-coding-principles.md)
- [Playwright Locators 官方文件](https://playwright.dev/docs/locators)