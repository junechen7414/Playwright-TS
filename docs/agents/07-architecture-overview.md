# 架構概覽

> 本文件說明專案的目錄結構與組織方式

## 目錄結構

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
├── docs/                 # 專案文件
│   └── agents/           # Agent 指引文件
└── .github/              # CI/CD 配置
    └── workflows/        # GitHub Actions
```

## 目錄說明

### services/ - 核心服務層

包含所有可重用的測試基礎設施。

#### apis/
- `base-api-client.ts` - API 客戶端基礎類別
- `springboot-api-client.ts` - Spring Boot API 客戶端

#### components/
- `hamburger-menu.ts` - 漢堡選單元件
- 其他可重用 UI 元件

#### fixtures/
- `chain-fixtures.fixture.ts` - 整合所有 Fixtures
- `page-objects.fixture.ts` - UI 頁面物件 Fixtures
- `springboot-api-objects.fixture.ts` - API 客戶端 Fixtures
- `saucedemo-test-data.fixture.ts` - UI 測試資料
- `springboot-test-data.fixture.ts` - API 測試資料

#### pages/
- `login-page.ts` - 登入頁面
- `product-page.ts` - 產品頁面
- `cart-page.ts` - 購物車頁面
- `checkout-page.ts` - 結帳頁面

#### schema/
- `api-types.ts` - 從 Swagger 生成的 API 型別定義
- `constants.ts` - 常數定義

### tests/ - 測試案例

#### api/springboot/
- `account.spec.ts` - 帳戶 API 測試
- `product.spec.ts` - 產品 API 測試
- `order.spec.ts` - 訂單 API 測試

#### ui/saucedemo/
- `Login.setup.ts` - 登入狀態設定
- `Login.spec.ts` - 登入功能測試
- `Shopping.spec.ts` - 購物流程測試
- `sanity-test.spec.ts` - 冒煙測試

### init-scripts/ - 資料庫初始化

- `01_setup.sh` - Oracle DB 使用者創建腳本

### scripts/ - 執行腳本

- `test-e2e-ci.ps1` - Windows CI/CD 測試腳本
- `test-e2e-ci.sh` - Linux/macOS CI/CD 測試腳本

### docs/ - 專案文件

- `agents/` - Agent 指引模組化文件
- `swagger.json` - API 規格文件

### .github/ - CI/CD 配置

- `workflows/` - GitHub Actions 工作流程定義

## 設計原則

### 分層架構

```
測試層 (tests/)
    ↓ 使用
服務層 (services/)
    ↓ 封裝
技術層 (Playwright API)
```

### 關注點分離

- **測試案例**: 專注於業務邏輯驗證
- **Page Objects**: 封裝頁面操作
- **Fixtures**: 管理測試依賴與資料
- **API Clients**: 封裝 API 呼叫

### 可重用性

- 元件化設計（如 `hamburger-menu.ts`）
- Fixtures 依賴注入
- 共用測試資料

## 命名慣例

### 檔案命名

- Page Objects: `{page-name}-page.ts`
- Fixtures: `{name}.fixture.ts`
- 測試檔案: `{feature}.spec.ts`
- Setup 檔案: `{feature}.setup.ts`

### 類別命名

- Page Objects: `{PageName}Page`
- API Clients: `{ServiceName}ApiClient`
- Components: `{ComponentName}`

## 相關文件

- [專案概述](./01-project-overview.md)
- [測試架構](./08-test-architecture.md)
- [配置指南](./12-configuration-guide.md)