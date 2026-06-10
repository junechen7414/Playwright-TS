# 程式設計原則

> 本文件說明專案的核心程式設計理念與最佳實踐

## 核心原則

### 1. 可讀性優先

程式碼應該易於理解，即使犧牲簡潔性。

**理念**:
- 程式碼是寫給人看的，其次才是給機器執行
- 清晰的命名比簡短的命名更重要
- 適當的註解能幫助理解複雜邏輯

**範例**:

```typescript
// ✅ 好的做法：清晰易懂
const isUserEligibleForDiscount = user.age >= 65 || user.isPremiumMember;

// ❌ 避免：過於簡潔但難以理解
const d = u.a >= 65 || u.p;
```

### 2. 現代化語法

使用最新的 TypeScript/JavaScript 語法特性。

**優先使用**:
- `const` 和 `let` 取代 `var`
- 箭頭函式 `() => {}`
- 解構賦值 `const { name, age } = user`
- 可選鏈 `user?.address?.city`
- 空值合併 `value ?? defaultValue`
- Template literals `` `Hello ${name}` ``

**範例**:

```typescript
// ✅ 現代化語法
const getUserInfo = async (userId: string) => {
  const user = await fetchUser(userId);
  return {
    name: user?.name ?? 'Unknown',
    email: user?.email ?? 'N/A',
  };
};

// ❌ 過時語法
function getUserInfo(userId) {
  return fetchUser(userId).then(function(user) {
    return {
      name: user && user.name ? user.name : 'Unknown',
      email: user && user.email ? user.email : 'N/A',
    };
  });
}
```

### 3. 實務導向

理論正確但實務不適用的方案應避免。

**考量因素**:
- 維護成本
- 團隊熟悉度
- 執行效能
- 除錯難度

**範例**:

```typescript
// ✅ 實務導向：直接明瞭
if (user.role === 'admin' || user.role === 'moderator') {
  allowAccess();
}

// ❌ 過度設計：增加複雜度但無實質好處
const PRIVILEGED_ROLES = new Set(['admin', 'moderator']);
if (PRIVILEGED_ROLES.has(user.role)) {
  allowAccess();
}
```

## 測試程式碼原則

### Business-Layer 導向

測試應該讀起來像商業流程，而非技術操作。

```typescript
// ✅ 商業流程導向
test('使用者可以完成購物流程', async ({ productPage, cartPage }) => {
  await productPage.addProductToCart('Backpack');
  await cartPage.proceedToCheckout();
  await checkoutPage.completeOrder('John', 'Doe', '12345');
  await checkoutPage.verifyOrderSuccess();
});

// ❌ 技術操作導向
test('購物流程', async ({ page }) => {
  await page.click('[data-test="add-to-cart"]');
  await page.click('[data-test="checkout"]');
  await page.fill('#first-name', 'John');
  await page.fill('#last-name', 'Doe');
  await page.click('[data-test="continue"]');
});
```

### 封裝細節

將技術細節封裝在 Page Objects 或 Helper 函式中。

```typescript
// ✅ 封裝在 Page Object
class CheckoutPage {
  async fillCheckoutInformation(firstName: string, lastName: string, zipCode: string) {
    await this.page.getByLabel('First Name').fill(firstName);
    await this.page.getByLabel('Last Name').fill(lastName);
    await this.page.getByLabel('Zip/Postal Code').fill(zipCode);
  }
}

// 測試中使用
await checkoutPage.fillCheckoutInformation('John', 'Doe', '12345');
```

## TypeScript 最佳實踐

### 型別安全

- 啟用 `strict` 模式
- 避免使用 `any`
- 使用 `noUncheckedIndexedAccess` 確保陣列存取安全

```typescript
// ✅ 型別安全
const getFirstItem = <T>(items: T[]): T | undefined => {
  return items[0]; // TypeScript 知道可能是 undefined
};

// ❌ 不安全
const getFirstItem = (items: any[]) => {
  return items[0]; // 可能導致執行時錯誤
};
```

### 介面優於型別別名

對於物件結構，優先使用 `interface`。

```typescript
// ✅ 使用 interface
interface User {
  id: string;
  name: string;
  email: string;
}

// ⚠️ 型別別名也可以，但 interface 更適合物件
type User = {
  id: string;
  name: string;
  email: string;
};
```

## 相關文件

- [開發規範](./04-development-standards.md)
- [測試架構](./08-test-architecture.md)
- [元素定位策略](./09-locator-strategies.md)