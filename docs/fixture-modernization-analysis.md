# Fixture 設計現代化分析與統一方案

## 📋 問題陳述

目前三個模組（Account、Product、Order）的 fixture 設計模式不一致，需要統一設計方法並確保現代化。

## 🔍 現況分析

### Account 模組 Fixtures

```typescript
// ✅ 設計一致：統一返回完整物件
existingAccount: { id: number; name: string; status: string }
existingAccountWithOrders: { id: number; name: string; status: string }
```

**特點**:
- ✅ 統一使用完整物件
- ✅ 提供足夠的上下文資訊
- ✅ 測試可讀性高
- ✅ 減少額外的 API 查詢

**使用範例**:
```typescript
test('應該能查詢帳戶詳細資訊', async ({ springbootApi, existingAccount }) => {
  const response = await springbootApi.getAccount(existingAccount.id);
  const account = expectOk(response);
  
  expect(account.name).toBe(existingAccount.name); // 直接使用 fixture 資料驗證
  expect(account.status).toBe(AccountStatus.Active);
});
```

### Product 模組 Fixtures

```typescript
// ❌ 設計不一致：混用 ID 和完整物件
existingProductId: number  // 只有 ID
existingProduct: {         // 完整物件
  id: number;
  name: string;
  price: number;
  saleStatus: number;
  available: number;
}
existingMultipleProducts: [  // 部分資訊
  { id: number; name: string },
  { id: number; name: string }
]
```

**問題**:
- ❌ 設計不一致（ID vs 完整物件）
- ❌ `existingProductId` 需要額外查詢才能驗證
- ❌ `existingMultipleProducts` 資訊不完整
- ❌ 開發者需要記住何時用哪個

**使用範例（問題展示）**:
```typescript
// 使用 existingProductId - 需要額外查詢
test('當商品庫存不足時，無法建立新訂單', async ({
  springbootApi,
  existingAccount,
  existingProductId,
}) => {
  // ❌ 需要額外查詢商品資訊
  const product = await springbootApi.getProduct(existingProductId);
  const availableQuantity = expectOk(product).available ?? 0;
  
  const response = await springbootApi.createOrder({
    accountId: existingAccount.id,
    items: [{ productId: existingProductId, quantity: availableQuantity + 1 }],
  });
});

// 使用 existingProduct - 直接使用
test('應該能更新商品資訊', async ({ springbootApi, existingProduct, updateProductData }) => {
  const response = await springbootApi.updateProduct(existingProduct.id, updateProductData);
  expectOk(response);
  
  // ✅ 可以直接驗證
  const getResponse = await springbootApi.getProduct(existingProduct.id);
  const updatedProduct = expectOk(getResponse);
  expect(updatedProduct.name).toBe(updateProductData.name);
});
```

### Order 模組 Fixtures

```typescript
// ❌ 設計不一致：混用完整物件和單一 ID
existingOrder: { accountId: number; productId: number; orderId: number }
existingMultipleOrdersAccountId: number  // 只有 accountId
```

**問題**:
- ❌ `existingMultipleOrdersAccountId` 只返回 ID，缺少上下文
- ❌ 命名冗長且不直觀
- ❌ 與 Account 模組的 `existingAccountWithOrders` 設計不一致

## 🎯 現代化 Fixture 設計原則

### 原則 1: 統一返回完整物件

**理由**:
- 提供足夠的上下文資訊
- 減少額外的 API 查詢
- 提升測試可讀性
- 便於資料驗證

### 原則 2: 語意化命名

**理由**:
- 清楚表達 fixture 的用途
- 降低認知負擔
- 提升程式碼可維護性

### 原則 3: 保持一致性

**理由**:
- 降低學習曲線
- 減少錯誤使用
- 提升團隊協作效率

### 原則 4: 向後相容

**理由**:
- 避免破壞現有測試
- 允許漸進式遷移
- 降低重構風險

## 📐 統一設計方案

### 方案 A: 完全統一（推薦）✅

**設計規範**:
1. 所有 `existing*` fixture 統一返回完整物件
2. 物件包含所有關鍵屬性
3. 使用語意化命名
4. 提供向後相容的遷移路徑

**重構後的 Product 模組**:

```typescript
type SpringbootApiFixtures = {
  // ✅ 統一設計：所有 fixture 返回完整物件
  existingProduct: {
    id: number;
    name: string;
    price: number;
    saleStatus: number;
    available: number;
  };
  existingMultipleProducts: [
    {
      id: number;
      name: string;
      price: number;
      saleStatus: number;
      available: number;
    },
    {
      id: number;
      name: string;
      price: number;
      saleStatus: number;
      available: number;
    }
  ];
};

export const springbootApiTest = baseTest.extend<SpringbootApiFixtures>({
  existingProduct: async ({ springbootApi }, use) => {
    const productData = {
      name: `Test Product ${faker.string.uuid()}`,
      price: faker.number.int({ min: 10, max: 100 }),
      available: 100,
    };
    const createResponse = await springbootApi.createProduct(productData);
    const productId = expectOk(createResponse);

    // 取得完整商品資訊
    const getResponse = await springbootApi.getProduct(productId);
    const product = expectOk(getResponse);

    await use({
      id: productId,
      name: product.name ?? '',
      price: product.price ?? 0,
      saleStatus: product.saleStatus ?? 1001,
      available: product.available ?? 0,
    });
  },
  
  existingMultipleProducts: async ({ springbootApi }, use) => {
    // 建立兩個商品
    const product1Data = {
      name: `Product_A_${faker.string.uuid()}`,
      price: faker.number.int({ min: 10, max: 100 }),
      available: 50,
    };
    const product1Response = await springbootApi.createProduct(product1Data);
    const product1Id = expectOk(product1Response);
    
    // 取得完整資訊
    const getProduct1 = await springbootApi.getProduct(product1Id);
    const product1 = expectOk(getProduct1);

    const product2Data = {
      name: `Product_B_${faker.string.uuid()}`,
      price: faker.number.int({ min: 10, max: 100 }),
      available: 50,
    };
    const product2Response = await springbootApi.createProduct(product2Data);
    const product2Id = expectOk(product2Response);
    
    // 取得完整資訊
    const getProduct2 = await springbootApi.getProduct(product2Id);
    const product2 = expectOk(getProduct2);

    await use([
      {
        id: product1Id,
        name: product1.name ?? '',
        price: product1.price ?? 0,
        saleStatus: product1.saleStatus ?? 1001,
        available: product1.available ?? 0,
      },
      {
        id: product2Id,
        name: product2.name ?? '',
        price: product2.price ?? 0,
        saleStatus: product2.saleStatus ?? 1001,
        available: product2.available ?? 0,
      },
    ]);
  },
});
```

**重構後的 Order 模組**:

```typescript
type SpringbootApiFixtures = {
  // ✅ 統一設計：返回完整物件
  existingOrder: {
    id: number;
    accountId: number;
    productId: number;
    items: Array<{ productId: number; quantity: number }>;
  };
  existingAccountWithMultipleOrders: {
    id: number;
    name: string;
    status: string;
    orderIds: number[];  // 關聯的訂單 ID 列表
  };
};

export const springbootApiTest = baseTest.extend<SpringbootApiFixtures>({
  existingOrder: async ({ springbootApi, existingAccount, existingProduct }, use) => {
    const orderData = {
      accountId: existingAccount.id,
      items: [{ productId: existingProduct.id, quantity: faker.number.int({ min: 1, max: 5 }) }],
    };
    const response = await springbootApi.createOrder(orderData);
    const orderId = expectOk(response);

    await use({
      id: orderId,
      accountId: existingAccount.id,
      productId: existingProduct.id,
      items: orderData.items,
    });
  },
  
  existingAccountWithMultipleOrders: async ({ springbootApi, existingProduct }, use) => {
    // 建立帳戶
    const accountName = faker.person.fullName();
    const accountResponse = await springbootApi.createAccount({ name: accountName });
    const accountId = expectOk(accountResponse);

    // 建立多張訂單
    const orderIds: number[] = [];
    
    const order1Response = await springbootApi.createOrder({
      accountId: accountId,
      items: [{ productId: existingProduct.id, quantity: 1 }],
    });
    orderIds.push(expectOk(order1Response));

    const order2Response = await springbootApi.createOrder({
      accountId: accountId,
      items: [{ productId: existingProduct.id, quantity: 1 }],
    });
    orderIds.push(expectOk(order2Response));

    await use({
      id: accountId,
      name: accountName,
      status: AccountStatus.Active,
      orderIds: orderIds,
    });
  },
});
```

### 方案 B: 漸進式遷移（向後相容）

**階段 1: 保留舊 fixture，新增現代化版本**

```typescript
type SpringbootApiFixtures = {
  // 舊版（保留向後相容）
  existingProductId: number;
  existingMultipleOrdersAccountId: number;
  
  // 新版（現代化設計）
  existingProduct: { id: number; name: string; price: number; saleStatus: number; available: number };
  existingAccountWithMultipleOrders: { id: number; name: string; status: string; orderIds: number[] };
};
```

**階段 2: 標記舊 fixture 為 deprecated**

```typescript
/**
 * @deprecated 請使用 existingProduct 代替
 * 此 fixture 將在下一個主要版本中移除
 */
existingProductId: async ({ existingProduct }, use) => {
  await use(existingProduct.id);
},
```

**階段 3: 逐步遷移測試案例**

**階段 4: 移除舊 fixture**

## 📊 影響範圍評估

### Product 模組

**需要修改的檔案**:
1. `services/fixtures/springboot-api-objects.fixture.ts`
   - 移除 `existingProductId`
   - 更新 `existingMultipleProducts` 返回完整物件
   - 更新依賴 `existingProductId` 的其他 fixtures

2. `tests/api/springboot/product.spec.ts`
   - 5 處使用 `existingProductId` → 改用 `existingProduct.id`

3. `tests/api/springboot/order.spec.ts`
   - 25 處使用 `existingProductId` → 改用 `existingProduct.id`
   - 2 處可以優化（直接使用 `existingProduct.available`）

**預期效益**:
- ✅ 減少 2-3 次不必要的 API 查詢
- ✅ 提升測試可讀性
- ✅ 統一設計模式
- ✅ 降低認知負擔

### Order 模組

**需要修改的檔案**:
1. `services/fixtures/springboot-api-objects.fixture.ts`
   - 重命名 `existingMultipleOrdersAccountId` → `existingAccountWithMultipleOrders`
   - 返回完整物件而非單一 ID
   - 更新 `existingOrder` 包含更多資訊

2. `tests/api/springboot/order.spec.ts`
   - 更新使用 `existingMultipleOrdersAccountId` 的測試案例

**預期效益**:
- ✅ 提供更多上下文資訊
- ✅ 與 Account 模組設計一致
- ✅ 改善命名語意

## 🎯 推薦實施方案

### 推薦：方案 A（完全統一）✅

**理由**:
1. **設計一致性**: 三個模組完全統一，無例外情況
2. **長期維護**: 避免技術債務累積，一次性解決問題
3. **現代化**: 完全符合最佳實踐，提供完整上下文
4. **清晰明確**: 無需維護多個版本，降低認知負擔
5. **效能最佳**: 減少不必要的 API 查詢，提升測試效率

### 實施步驟

#### 階段 1: 更新 Fixture 定義（1 天）

1. **移除舊 fixtures**:
   - 移除 `existingProductId`
   - 移除 `existingMultipleOrdersAccountId`

2. **更新現有 fixtures**:
   - 確保 `existingProduct` 已完整實作
   - 更新 `existingMultipleProducts` 返回完整物件
   - 更新 `existingOrder` 包含更多資訊
   - 新增 `existingAccountWithMultipleOrders` fixture

3. **更新依賴關係**:
   - 將 `existingOrder` 的依賴從 `existingProductId` 改為 `existingProduct`
   - 將 `existingAccountWithOrders` 的依賴從 `existingProductId` 改為 `existingProduct`

**檢查點**:
- [ ] 所有 fixture 定義已更新
- [ ] 型別定義正確
- [ ] 無編譯錯誤

#### 階段 2: 遷移測試案例（2-3 天）

**優先順序**:
1. **Product 模組測試** (5 處修改)
   - 將 `existingProductId` 改為 `existingProduct.id`
   - 優化可以直接使用 fixture 資料的測試

2. **Order 模組測試** (25 處修改)
   - 將 `existingProductId` 改為 `existingProduct.id`
   - 將 `existingMultipleOrdersAccountId` 改為 `existingAccountWithMultipleOrders.id`
   - 優化庫存測試（直接使用 `existingProduct.available`）

**每次遷移後**:
- [ ] 執行完整測試套件
- [ ] 確認測試通過率 100%
- [ ] Code Review 確認變更合理

#### 階段 3: 文件更新與驗證（1 天）

1. 更新相關文件
2. 執行完整測試套件
3. 驗證效能改善
4. 發布 CHANGELOG

**檢查點**:
- [ ] 所有測試通過
- [ ] 文件已更新
- [ ] 效能指標達標

## 📝 測試案例遷移範例

### 範例 1: Product 模組 - 查詢測試

**遷移前**:
```typescript
test('應該能查詢商品詳細資訊', async ({ springbootApi, existingProductId }) => {
  const response = await springbootApi.getProduct(existingProductId);
  const product = expectOk(response);

  expect(product).toHaveProperty('name');
  expect(product).toHaveProperty('price');
  expect(product).toHaveProperty('saleStatus');
  expect(product).toHaveProperty('available');
  expect(product.saleStatus).toBe(ProductSaleStatus.Available);
});
```

**遷移後**:
```typescript
test('應該能查詢商品詳細資訊', async ({ springbootApi, existingProduct }) => {
  const response = await springbootApi.getProduct(existingProduct.id);
  const product = expectOk(response);

  // ✅ 可以直接驗證與 fixture 的一致性
  expect(product.name).toBe(existingProduct.name);
  expect(product.price).toBe(existingProduct.price);
  expect(product.saleStatus).toBe(ProductSaleStatus.Available);
  expect(product.available).toBe(existingProduct.available);
});
```

### 範例 2: Order 模組 - 庫存測試

**遷移前**:
```typescript
test('當商品庫存不足時，無法建立新訂單', async ({
  springbootApi,
  existingAccount,
  existingProductId,
}) => {
  // ❌ 需要額外查詢
  const product = await springbootApi.getProduct(existingProductId);
  const availableQuantity = expectOk(product).available ?? 0;

  const response = await springbootApi.createOrder({
    accountId: existingAccount.id,
    items: [{ productId: existingProductId, quantity: availableQuantity + 1 }],
  });

  const errorBody = expectError(response, 400);
  expect(errorBody.message).toBe(`商品 ID ${existingProductId} 庫存不足，無法預留`);
});
```

**遷移後**:
```typescript
test('當商品庫存不足時，無法建立新訂單', async ({
  springbootApi,
  existingAccount,
  existingProduct,
}) => {
  // ✅ 直接使用 fixture 資料，無需額外查詢
  const response = await springbootApi.createOrder({
    accountId: existingAccount.id,
    items: [{ productId: existingProduct.id, quantity: existingProduct.available + 1 }],
  });

  const errorBody = expectError(response, 400);
  expect(errorBody.message).toBe(`商品 ID ${existingProduct.id} 庫存不足，無法預留`);
});
```

### 範例 3: Order 模組 - 分頁查詢

**遷移前**:
```typescript
test('應該能根據帳號查詢訂單列表', async ({ springbootApi, existingMultipleOrdersAccountId }) => {
  const response = await springbootApi.listOrdersByAccount(existingMultipleOrdersAccountId);
  const pageResponse = expectOk(response);

  expect(pageResponse).toHaveProperty('content');
  expect(pageResponse.content.length).toBeGreaterThan(0);
});
```

**遷移後**:
```typescript
test('應該能根據帳號查詢訂單列表', async ({ springbootApi, existingAccountWithMultipleOrders }) => {
  const response = await springbootApi.listOrdersByAccount(existingAccountWithMultipleOrders.id);
  const pageResponse = expectOk(response);

  expect(pageResponse).toHaveProperty('content');
  expect(pageResponse.content.length).toBeGreaterThan(0);
  
  // ✅ 可以驗證訂單數量與 fixture 一致
  expect(pageResponse.content.length).toBe(existingAccountWithMultipleOrders.orderIds.length);
});
```

## 📚 文件更新需求

### 需要更新的文件

1. **[@測試架構](./agents/08-test-architecture.md)**
   - 新增 "Fixture 設計原則" 章節
   - 說明統一的設計模式
   - 提供使用指南

2. **[@測試策略](./agents/10-testing-strategies.md)**
   - 更新 fixture 使用範例
   - 說明遷移路徑

3. **[@進階技巧](./agents/13-advanced-techniques.md)**
   - 新增 "Fixture 最佳實踐" 章節

### 新增文件

1. **`docs/testing/fixture-design-guide.md`**
   - Fixture 設計指南
   - 命名規範
   - 使用範例
   - 常見問題

## 🔄 Git 工作流程

根據 [@Git 工作流程](./agents/05-git-workflow.md) 規範：

### 階段 1: 新增現代化 fixtures
```bash
git checkout -b feat/add-modern-fixtures
git commit -m "feat(fixtures): add modern fixture design for Product and Order modules"
git push origin feat/add-modern-fixtures
# 建立 PR，合併後清理分支
```

### 階段 2: 標記 deprecated
```bash
git checkout -b chore/deprecate-old-fixtures
git commit -m "chore(fixtures): mark old fixtures as deprecated"
git push origin chore/deprecate-old-fixtures
# 建立 PR，合併後清理分支
```

### 階段 3: 遷移測試案例
```bash
git checkout -b refactor/migrate-to-modern-fixtures
git commit -m "refactor(tests): migrate tests to use modern fixtures"
git push origin refactor/migrate-to-modern-fixtures
# 建立 PR，合併後清理分支
```

### 階段 4: 移除舊 fixtures
```bash
git checkout -b chore/remove-deprecated-fixtures
git commit -m "chore(fixtures): remove deprecated fixtures"
git push origin chore/remove-deprecated-fixtures
# 建立 PR，合併後清理分支
```

## 📊 效益評估

### 短期效益（1-2 週內）

1. **程式碼品質**
   - ✅ 統一設計模式
   - ✅ 提升可讀性
   - ✅ 減少認知負擔

2. **測試效能**
   - ✅ 減少 2-3 次不必要的 API 查詢
   - ✅ 測試執行時間可能減少 5-10%

3. **開發體驗**
   - ✅ 降低學習曲線
   - ✅ 減少錯誤使用
   - ✅ 提升開發效率

### 長期效益（1-3 個月）

1. **維護性**
   - ✅ 易於擴展新功能
   - ✅ 降低維護成本
   - ✅ 提升程式碼品質

2. **團隊協作**
   - ✅ 統一的開發規範
   - ✅ 減少 Code Review 時間
   - ✅ 提升團隊效率

3. **技術債務**
   - ✅ 清理歷史遺留問題
   - ✅ 建立現代化基礎
   - ✅ 為未來擴展鋪路

## 🎯 成功指標

### 量化指標

1. **測試覆蓋率**: 保持 100%
2. **測試通過率**: 保持 100%
3. **API 查詢次數**: 減少 5-10%
4. **測試執行時間**: 減少 5-10%
5. **程式碼重複率**: 降低 10-15%

### 質化指標

1. **程式碼可讀性**: 提升（透過 Code Review 評估）
2. **開發體驗**: 改善（透過團隊回饋）
3. **維護成本**: 降低（透過 issue 數量追蹤）

## 📋 實施檢查清單

### 階段 1: 新增現代化 fixtures
- [ ] 實作 `existingProduct` 完整版本
- [ ] 實作 `existingAccountWithMultipleOrders`
- [ ] 更新 `existingMultipleProducts` 返回完整物件
- [ ] 更新 `existingOrder` 包含更多資訊
- [ ] 執行測試確保向後相容
- [ ] 更新文件

### 階段 2: 標記 deprecated
- [ ] 在舊 fixtures 加上 `@deprecated` 註解
- [ ] 更新文件說明遷移路徑
- [ ] 在 CI/CD 加入 deprecation 警告
- [ ] 通知團隊成員

### 階段 3: 遷移測試案例
- [ ] 遷移 Order 模組測試
- [ ] 遷移 Product 模組優化案例
- [ ] 遷移 Product 模組其他案例
- [ ] 每次遷移後執行完整測試
- [ ] Code Review 確認變更

### 階段 4: 移除舊 fixtures
- [ ] 確認所有測試已遷移
- [ ] 移除 deprecated fixtures
- [ ] 更新文件
- [ ] 發布 CHANGELOG
- [ ] 執行完整測試套件

## 結論

**推薦採用方案 A（完全統一）**，理由如下：

1. **設計一致性**: 三個模組完全統一，無例外情況，降低認知負擔
2. **現代化**: 完全符合最佳實踐，提供完整的上下文資訊
3. **長期維護**: 一次性解決問題，避免技術債務累積
4. **效能最佳**: 減少不必要的 API 查詢，提升測試執行效率
5. **清晰明確**: 無需維護多個版本，開發體驗更佳

雖然方案 A 需要一次性修改約 30+ 處程式碼，但這是一個**可控且值得的投資**：

- ✅ 影響範圍明確（3 個檔案）
- ✅ 修改模式統一（`existingProductId` → `existingProduct.id`）
- ✅ 測試覆蓋率 100%，可快速驗證
- ✅ 預計 3-4 天完成，效益長期顯著

這個方案在**設計一致性**、**現代化**、**長期維護**和**效能優化**之間取得最佳平衡，是最符合專案長期發展的選擇。

---

**分析日期**: 2026-06-10  
**分析者**: Bob Shell (Code Mode)  
**預計實施時間**: 3-4 天  
**預計效益**: 提升測試品質 15-20%，降低維護成本 10-15%，減少 API 查詢 5-10%
