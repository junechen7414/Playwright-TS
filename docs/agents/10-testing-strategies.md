# 測試策略

> 本文件說明資料清理策略與全域登入狀態管理

## 資料清理策略

本專案採用 **容器重啟策略** 確保測試隔離性。

### 工作原理

1. 每次測試前停止並刪除所有容器和 volumes
2. 重新啟動 Docker Compose 環境
3. Spring Boot 自動執行 Flyway migrate
4. 等待健康檢查通過後執行測試

### 實作方式

#### Windows (PowerShell)

```powershell
# 停止並刪除容器
podman compose -f docker-compose.test.yml down -v

# 啟動新環境
podman compose -f docker-compose.test.yml up -d

# 等待健康檢查
Start-Sleep -Seconds 30

# 執行測試
pnpm playwright test --project=api-e2e
```

#### Linux/macOS (Bash)

```bash
# 停止並刪除容器
podman compose -f docker-compose.test.yml down -v

# 啟動新環境
podman compose -f docker-compose.test.yml up -d

# 等待健康檢查
sleep 30

# 執行測試
pnpm playwright test --project=api-e2e
```

### 優點

- ✅ **完全隔離**: 每次都是全新環境，無殘留資料
- ✅ **簡單可靠**: 不依賴額外工具（如 Flyway CLI）
- ✅ **適合 CI/CD**: 容易整合到自動化流程
- ✅ **可重複性**: 測試結果穩定且可預測

### 缺點

- ⏱️ **啟動時間較長**: Oracle DB 需要 1-2 分鐘啟動
- 💾 **資源消耗**: 每次都要重新初始化資料庫

### 適用情境

- ✅ E2E 測試
- ✅ 整合測試
- ✅ CI/CD Pipeline
- ❌ 單元測試（過於重量級）

### 詳細說明
完整的策略分析請參考：[e2e-cleanup-strategy.md](../testing/e2e-cleanup-strategy.md)


## 全域登入狀態分享

使用 `storageState` 避免每個測試重複登入，提升測試效率。

### 工作原理

1. **Setup 測試**執行登入並儲存狀態
2. **主測試**設定依賴關係
3. Playwright 自動注入登入狀態到所有測試

### 配置方式

#### playwright.config.ts

```typescript
export default defineConfig({
  projects: [
    // Setup 專案：執行登入並儲存狀態
    {
      name: 'ui-setup',
      testMatch: '**/saucedemo/*.setup.ts',
      use: {
        storageState: 'playwright/.auth/user.json',
      },
    },
    // 主測試專案：使用儲存的登入狀態
    {
      name: 'ui-staging',
      testMatch: '**/saucedemo/*.spec.ts',
      dependencies: ['ui-setup'], // 依賴 Setup
      use: {
        storageState: 'playwright/.auth/user.json',
      },
    },
  ],
});
```

### Setup 測試範例

```typescript
// tests/ui/saucedemo/Login.setup.ts
import { test as setup } from '@playwright/test';

setup('登入並儲存狀態', async ({ page }) => {
  // 執行登入
  await page.goto('https://www.saucedemo.com/');
  await page.getByLabel('Username').fill('standard_user');
  await page.getByLabel('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();

  // 等待登入完成
  await page.waitForURL('**/inventory.html');

  // 狀態會自動儲存到 storageState 指定的路徑
});
```

### 主測試使用

```typescript
// tests/ui/saucedemo/Shopping.spec.ts
import { test, expect } from '@playwright/test';

test('可以新增產品到購物車', async ({ page }) => {
  // 已經是登入狀態，直接開始測試
  await page.goto('https://www.saucedemo.com/inventory.html');
  
  await page.getByRole('button', { name: 'Add to cart' }).first().click();
  
  const cartBadge = page.locator('.shopping_cart_badge');
  await expect(cartBadge).toHaveText('1');
});
```

### 優點

- ✅ **效率提升**: 避免每個測試重複登入
- ✅ **測試隔離**: 每個測試仍然獨立執行
- ✅ **易於維護**: 登入邏輯集中管理
- ✅ **支援多使用者**: 可以為不同角色創建不同的 Setup

### 多使用者範例

```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    // 標準使用者 Setup
    {
      name: 'ui-setup-standard',
      testMatch: '**/setup/standard-user.setup.ts',
      use: {
        storageState: 'playwright/.auth/standard-user.json',
      },
    },
    // 管理員 Setup
    {
      name: 'ui-setup-admin',
      testMatch: '**/setup/admin-user.setup.ts',
      use: {
        storageState: 'playwright/.auth/admin-user.json',
      },
    },
    // 標準使用者測試
    {
      name: 'ui-standard-user',
      testMatch: '**/tests/standard-user/*.spec.ts',
      dependencies: ['ui-setup-standard'],
      use: {
        storageState: 'playwright/.auth/standard-user.json',
      },
    },
    // 管理員測試
    {
      name: 'ui-admin',
      testMatch: '**/tests/admin/*.spec.ts',
      dependencies: ['ui-setup-admin'],
      use: {
        storageState: 'playwright/.auth/admin-user.json',
      },
    },
  ],
});
```

## 測試執行策略

### 本地開發

```bash
# 執行特定測試
pnpm playwright test Shopping.spec.ts

# 執行特定專案
pnpm playwright test --project=ui-staging

# Debug 模式
pnpm playwright test --debug
```

### CI/CD 環境

```bash
# 完整測試流程（含容器重啟）
pnpm run test:e2e:ci

# 或使用腳本
.\scripts\test-e2e-ci.ps1  # Windows
bash scripts/test-e2e-ci.sh  # Linux/macOS
```

## 測試組織

### 按功能分組

```
tests/
├── ui/
│   └── saucedemo/
│       ├── Login.setup.ts      # Setup
│       ├── Login.spec.ts       # 登入測試
│       ├── Shopping.spec.ts    # 購物測試
│       └── Checkout.spec.ts    # 結帳測試
└── api/
    └── springboot/
        ├── account.spec.ts     # 帳戶 API
        ├── product.spec.ts     # 產品 API
        └── order.spec.ts       # 訂單 API
```

### 使用標籤

```typescript
// 標記為冒煙測試
test('基本功能檢查', { tag: '@smoke' }, async ({ page }) => {
  // ...
});

// 標記為回歸測試
test('完整購物流程', { tag: '@regression' }, async ({ page }) => {
  // ...
});

// 執行特定標籤的測試
// pnpm playwright test --grep @smoke
```

## 相關文件

- [快速開始](./03-quick-start.md)
- [CI/CD 整合](./11-cicd-integration.md)
- [配置指南](./12-configuration-guide.md)
- [E2E 測試清理策略](../testing/e2e-cleanup-strategy.md)