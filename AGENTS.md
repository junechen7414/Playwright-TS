# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## 專案概述

這是一個使用 **Playwright + TypeScript** 開發的 E2E 自動化測試專案，採用 **Business-Layer Page Object Model** 架構模式。專案整合了 Docker Compose 進行環境管理，並支援 CI/CD 自動化測試流程。

### 核心技術棧

- **測試框架**: Playwright v1.57.0
- **程式語言**: TypeScript (ES Modules)
- **套件管理**: pnpm
- **容器管理**: Podman/Docker Compose
- **CI/CD**: GitHub Actions
- **測試目標**: 
  - UI 測試 (SauceDemo)
  - API 測試 (Spring Boot + Oracle DB)

### 專案架構原則

本專案遵循 **Business-Layer Page-Object Pattern**，核心理念是：
- 測試腳本應該讀起來像商業流程，而非技術操作
- 封裝低階操作細節（Locators、Clicks）
- 使用語意化的方法名稱
- 讓非技術人員也能理解測試內容

## 建置與執行

### 環境準備

```bash
# 1. 安裝依賴
pnpm install

# 2. 設定環境變數（複製 .env.example 並修改）
cp .env.example .env

# 3. 啟動測試環境（Spring Boot + Oracle DB）
pnpm run compose-up
```

### 測試執行

```bash
# UI 測試（SauceDemo）
pnpm playwright test --project=ui-staging

# API 測試（Spring Boot）
pnpm run test:e2e

# 完整 CI/CD 流程（容器重啟 + 測試）
pnpm run test:e2e:ci

# 或使用腳本
# Windows
.\scripts\test-e2e-ci.ps1
# Linux/macOS
bash scripts/test-e2e-ci.sh
```

### 重要腳本說明

| 指令 | 說明 |
|------|------|
| `pnpm run compose-up` | 啟動測試環境（Spring Boot + Oracle DB） |
| `pnpm run compose-down` | 停止並刪除測試環境 |
| `pnpm run compose-restart` | 重啟測試環境 |
| `pnpm run test:e2e` | 執行 API E2E 測試 |
| `pnpm run test:e2e:ci` | 完整 CI/CD 測試流程（容器重啟） |
| `pnpm run api-spec:update` | 從 Swagger 更新 API 型別定義 |
| `pnpm run biome:fix` | 自動修復程式碼格式問題 |

## 開發規範

### 語言偏好

- **主要語言**: 繁體中文（正體中文）
- **次要語言**: 英文（僅在技術術語更清晰時使用）
- **禁止**: 簡體中文

### 工具偏好

- **容器管理**: 使用 `podman`，不使用 `docker`
- **套件管理**: 使用 `pnpm`，禁止使用 `npm` 或 `yarn`

### Shell 指令執行規範

執行 CLI 指令前，必須先偵測當前使用的 Shell 環境（PowerShell 或 CMD），並根據環境調整指令語法：

| 差異項目 | PowerShell (`pwsh`) | CMD (`cmd.exe`) |
|---------|-------------------|-----------------|
| 指令串接 | 使用 `;` 分隔 | 使用 `&&` 分隔 |
| 執行當前目錄腳本 | `./gradlew` | `gradlew` (或 `.\gradlew`) |
| 環境變數引用 | `$env:VAR_NAME` | `%VAR_NAME%` |
| 路徑分隔 | 支援 `/` 和 `\` | 建議使用 `\` |

**範例對照：**
- PowerShell：`cd src; ./gradlew test`
- CMD：`cd src && gradlew test`

**重要原則：**
- 不可假設預設 Shell，須透過環境資訊判斷
- 指令語法必須與當前 Shell 相容，避免跨 Shell 語法混用

### Git 規範

**分支命名**:
- 格式: `類別/任務簡述`
- 常用前綴: `feature/`, `bugfix/`, `hotfix/`, `refactor/`
- 規則: 全小寫、使用 `-` 分隔、使用 `/` 分層

**Commit 訊息** (Conventional Commits):
- 格式: `<type>(<scope>): <subject>`
- 常用類型: `feat`, `fix`, `docs`, `style`, `refactor`, `chore`
- 使用祈使句（如 `add` 而非 `added`）

### 程式設計原則

1. **可讀性優先**: 程式碼應該易於理解，即使犧牲簡潔性
2. **現代化語法**: 使用最新的 TypeScript/JavaScript 語法
3. **實務導向**: 理論正確但實務不適用的方案應避免

## 架構設計

### 目錄結構

```
Playwright/
├── services/              # 核心服務層
│   ├── apis/             # API 客戶端
│   ├── components/       # 可重用 UI 元件
│   ├── fixtures/         # Playwright Fixtures
│   ├── pages/            # Page Objects
│   └── schema/           # API 型別定義
├── tests/                # 測試案例
│   ├── api/              # API 測試
│   │   └── springboot/   # Spring Boot API 測試
│   └── ui/               # UI 測試
│       └── saucedemo/    # SauceDemo UI 測試
├── init-scripts/         # Oracle DB 初始化腳本
├── scripts/              # 測試執行腳本
└── .github/              # CI/CD 配置
    └── workflows/        # GitHub Actions
```

### Custom Fixtures 架構

本專案使用 Playwright 的 Fixture 系統來管理測試依賴：

**核心優勢**:
1. **封裝與可重用性**: 將準備工作與測試內容分離
2. **依賴注入**: 自動執行初始化邏輯
3. **按需執行**: 只有測試用到的 Fixture 才會執行（與 `beforeEach` 不同）

**Fixture 類型**:
- `page-objects.fixture.ts`: 封裝 UI 頁面物件
- `springboot-api-objects.fixture.ts`: 封裝 API 客戶端
- `saucedemo-test-data.fixture.ts`: 封裝測試資料
- `chain-fixtures.fixture.ts`: 使用 `mergeTests` 整合所有 Fixtures

**使用範例**:
```typescript
import { test, expect } from '../fixtures/chain-fixtures';

test('範例測試', async ({ loginPage, standardUserData }) => {
  await loginPage.login(standardUserData.username, standardUserData.password);
  // Fixtures 自動注入，無需手動初始化
});
```

### Page Object Model 設計

**核心原則**:
1. **封裝低階操作**: 不暴露 Locators 和 `page.click()` 等細節
2. **商業邏輯導向**: 方法名稱反映使用者行為，而非 UI 操作
3. **隱藏斷言細節**: 將驗證邏輯封裝進 Page Object

**範例**:
```typescript
// ✅ 好的做法：語意化方法
await checkoutPage.fillCheckoutInformation('John', 'Doe', '12345');
await checkoutPage.continueCheckout();
await checkoutPage.finishCheckout();
await checkoutPage.verifyOrderCompletion();

// ❌ 避免：暴露技術細節
await page.getByLabel('First Name').fill('John');
await page.getByLabel('Last Name').fill('Doe');
await page.getByRole('button', { name: 'Continue' }).click();
```

### 元素定位最佳實踐

**優先順序** (由高到低):
1. `page.getByRole(role, { name })` - 最穩健，符合無障礙設計
2. `page.getByText(text)` - 透過顯示文字定位
3. `page.getByLabel(label)` - 適用於表單輸入
4. `page.getByPlaceholder(text)` - 無 Label 時使用

**使用 Chrome DevTools 查看 Accessibility**:
1. 開啟 DevTools (F12)
2. 切換到 **Accessibility** 面板
3. 查看 **Role** 和 **Name** 屬性
4. 使用這些資訊構建 `getByRole` 定位器

## 測試策略

### 資料清理策略

本專案採用 **容器重啟策略** 確保測試隔離性：

**工作原理**:
1. 每次測試前停止並刪除所有容器和 volumes
2. 重新啟動 Docker Compose 環境
3. Spring Boot 自動執行 Flyway migrate
4. 等待健康檢查通過後執行測試

**優點**:
- ✅ 完全隔離，每次都是全新環境
- ✅ 不依賴額外工具（如 Flyway CLI）
- ✅ 適合 CI/CD pipeline
- ✅ 測試結果可重複且可靠

**缺點**:
- ⏱️ 啟動時間較長（Oracle DB 需要 1-2 分鐘）

詳細說明請參考: [E2E-TESTING-CLEANUP-STRATEGY.md](./E2E-TESTING-CLEANUP-STRATEGY.md)

### 全域登入狀態分享

使用 `storageState` 避免每個測試重複登入：

1. Setup 測試執行登入並儲存狀態
2. 主測試設定 `dependencies: ['ui-setup']`
3. 自動注入登入狀態到所有測試

**配置** (playwright.config.ts):
```typescript
projects: [
  {
    name: 'ui-setup',
    testMatch: '**/saucedemo/*.setup.ts',
  },
  {
    name: 'ui-staging',
    testMatch: '**/saucedemo/*.spec.ts',
    dependencies: ['ui-setup'], // 依賴 Setup
  },
]
```

## CI/CD 整合

### GitHub Actions 配置

本專案使用 GitHub Actions 進行自動化測試，關鍵特點：

**容器化執行**:
- 使用官方 Playwright Docker 映像檔
- 預先安裝瀏覽器，省去下載時間
- 確保環境一致性

**觸發條件**:
- Pull Request 合併至 `main` 或 `master`
- 手動觸發 (`workflow_dispatch`)
- 後端專案觸發 (`repository_dispatch`)

**環境變數管理**:
- 使用 GitHub Secrets 儲存敏感資訊
- `DB_USER`: 資料庫使用者名稱
- `DB_PASSWORD`: 資料庫密碼

**關鍵步驟**:
1. 登入 GHCR (GitHub Container Registry)
2. 啟動 Docker Compose 環境並等待健康檢查
3. 執行 Playwright 測試
4. 上傳測試報告

### Docker Compose 配置

**服務架構**:
- `app`: Spring Boot 應用 (Port 8787)
- `oracle-db`: Oracle Database Free (Port 1521)

**環境變數配置**:
```yaml
environment:
  - SPRING_DATASOURCE_URL=jdbc:oracle:thin:@oracle-db:1521/FREEPDB1
  - SPRING_DATASOURCE_USERNAME=${ORACLE_TEST_USERNAME}
  - SPRING_DATASOURCE_PASSWORD=${ORACLE_TEST_PASSWORD}
```

**健康檢查**:
- Oracle DB: 檢查 PDB 是否處於 READ WRITE 模式
- 使用 SYS 使用者，避免時序問題

**初始化流程**:
1. Oracle DB 啟動
2. 執行 `init-scripts/01_setup.sh` 創建測試使用者
3. Spring Boot 連接資料庫並執行 Flyway migrate

## 進階技巧

### API 型別安全

使用 `openapi-typescript` 從 Swagger 自動生成型別定義：

```bash
pnpm run api-spec:update
```

生成的型別檔案: `services/schema/api-types.ts`

### 網路攔截與 Mocking

使用 `page.route` 攔截網路請求並偽造回應：

```typescript
// 模擬 API 錯誤
await page.route('**/api/user', async route => {
  await route.fulfill({
    status: 500,
    contentType: 'application/json',
    body: JSON.stringify({ message: 'Internal Server Error' }),
  });
});
```

**適用情境**:
- 測試錯誤處理邏輯
- 固定測試資料
- 模擬網路中斷

### 自動處理隨機彈窗

使用 `addLocatorHandler` 處理隨機出現的元素：

```typescript
await page.addLocatorHandler(
  page.getByRole('button', { name: '同意' }),
  async () => {
    await page.getByRole('button', { name: '關閉' }).click();
  }
);
```

### 斷言技巧

**軟斷言** (`expect.soft`):
- 失敗時不中止測試，繼續執行後續步驟
- 適合單一測試有多個檢查點

**API 狀態驗證** (`expect.toBeOK`):
- 驗證 Response Status Code 是否在 200-299 之間

## 配置檔案說明

### playwright.config.ts

**動態報告路徑**:
- 本地: `playwright-report/2024-05-20_14-30-00/`
- CI: `playwright-report/`

**CI/CD 策略差異**:

| 設定項目 | CI 環境 | 本機開發 |
|---------|---------|----------|
| Retries | 2 次 | 0 次 |
| Workers | 2 | 3 |
| Reporter | List + HTML | List + HTML (時間戳記) |
| Video/Trace | Retain on Failure | Off |

**專案依賴**:
```typescript
projects: [
  { name: 'ui-setup', testMatch: '**/saucedemo/*.setup.ts' },
  { 
    name: 'ui-staging', 
    dependencies: ['ui-setup'], // 先執行 Setup
  },
]
```

### tsconfig.json

使用現代化 TypeScript 配置：
- `module: "esnext"` - ES 模組支援
- `moduleResolution: "bundler"` - 現代模組解析
- `strict: true` - 嚴格型別檢查
- `noUncheckedIndexedAccess: true` - 陣列存取安全

## 疑難排解

### 容器啟動失敗

**檢查項目**:
1. 確認 Podman/Docker 正在運行
2. 檢查 `.env` 檔案是否存在且正確
3. 查看容器日誌: `podman logs spring-boot-app-test`

### 測試連線失敗

**錯誤訊息**: `connect ECONNREFUSED ::1:8787`

**解決方式**:
1. 確認容器正在運行: `podman ps`
2. 等待 Spring Boot 完全啟動（10-20 秒）
3. 檢查 port 8787 是否被佔用

### Oracle DB 啟動超時

**解決方式**:
1. 增加等待時間（調整測試腳本中的 `maxWait`）
2. 確認系統資源充足（Oracle DB 需要較多記憶體）
3. 檢查 Oracle DB 日誌: `podman logs oracle-db-test`

## 相關文件

- [筆記.md](./筆記.md) - 詳細的開發指南和最佳實踐
- [E2E-TESTING-CLEANUP-STRATEGY.md](./E2E-TESTING-CLEANUP-STRATEGY.md) - 測試資料清理策略
- [.github/instructions/Global.instructions.md](./.github/instructions/Global.instructions.md) - 開發規範
- [Playwright 官方文件](https://playwright.dev/docs/intro)
- [Docker Compose 文件](https://docs.docker.com/compose/)

## 重要提醒

1. **不要使用 `npm` 或 `yarn`**: 本專案統一使用 `pnpm`
2. **不要使用 `docker`**: 本專案統一使用 `podman`
3. **遵循 Business-Layer POM**: 測試應該讀起來像商業流程
4. **使用 Custom Fixtures**: 避免在測試中重複初始化邏輯
5. **優先使用 `getByRole`**: 最穩健的元素定位方式
6. **容器重啟策略**: 確保測試隔離性和可重複性
7. **繁體中文優先**: 所有註解和文件使用繁體中文

---

**最後更新**: 2026-05-27  
**專案版本**: 1.0.0  
**Playwright 版本**: 1.57.0
