# 專案架構與開發規範指南 (Architectural & Development Guide)

本文件旨在定義本專案的 **Business-Layer Page-Object Pattern** 架構，確保 AI 在自動產出程式碼時能遵循統一的邏輯與規範，並維持 TypeScript 的型別安全性。

## 1. 核心架構階層 (Core Layers)

本架構將「業務邏輯」與「技術實作」完全分離，分為以下五個核心層級：

### 1.1 Business Logic (Spec Files)
- **路徑**: `tests/ui/` 或 `tests/api/`
- **職責**: 描述「測試情境」與「驗證邏輯」。
- **規範**:
    - 禁止在 spec 檔案中寫入 CSS/XPath selector。
    - 禁止在 spec 檔案中直接進行 API 通訊（應透過 Service）。
    - 透過 Playwright Fixtures 引用需要的物件。
- **範例**:
  ```typescript
  // tests/ui/example.spec.ts
  import { pageObjectTest as test } from '../../fixtures/page-objects.fixture';

  test('使用者應能成功登入並查看產品', async ({ loginPage, productPage }) => {
      await loginPage.login('standard_user', 'secret_sauce');
      await productPage.verifyHeaderIsVisible();
  });
  ```

### 1.2 Fixtures (Object Injection)
- **路徑**: `fixtures/`
- **職責**: 初始化 Page Objects 與 API Clients，並將其注入測試環境。
- **規範**:
    - 所有物件的實例化應在此完成，spec 檔不應自行 `new` 物件。
    - 提供強型別支援，確保測試腳本能享有完整的 IntelliSense。

### 1.3 Page Objects (POM)
- **路徑**: `services/pages/`
- **職責**: 封裝 UI 元素定位器 (Locators) 與頁面操作行為。
- **規範**:
    - 使用 Playwright 的 `Locator` API。
    - 方法名稱應具備業務意義（例如：`login` 而非 `clickLoginButton`）。
    - 複雜組件應抽離至 `services/components/`。

### 1.4 API Clients (Services)
- **路徑**: `services/apis/`
- **職責**: 封裝 REST API 呼叫、路徑管理、Payload 處理。
- **規範**:
    - 繼承 `BaseApiClient` 以確保一致的連線處理與錯誤捕捉。
    - 回傳型別應定義於 `schema/api-types.ts`。

### 1.5 Schema & Types
- **路徑**: `schema/`
- **職責**: 定義資料結構與 API 型別（通常由 Swagger/OpenAPI 生成）。
- **規範**:
    - 嚴格遵守 TypeScript 型別安全，避免使用 `any`。

---

## 2. 目錄結構規範 (Directory Structure)

```text
/
├── tests/              # 測試劇本 (Spec Files)
│   ├── ui/             # UI 測試
│   └── api/            # API 測試
├── fixtures/           # Fixture 定義 (依賴注入)
├── services/           # 實作層
│   ├── pages/          # Page Objects
│   ├── components/     # UI 通用組件
│   └── apis/           # API Clients
├── schema/             # 型別與定義
└── docs/               # 相關文件
```

---

## 3. AI 開發指導原則 (AI Development Principles)

當 AI 接收到開發任務時，請遵循以下步驟：

1.  **分析需求**: 判斷該需求涉及哪些 UI 頁面或 API 介面。
2.  **型別先行**: 如果涉及新的 API，優先檢查 `schema/` 是否有對應型別。
3.  **封裝實作**:
    - 在 `services/pages/` 建立或修改 Page Object。
    - 在 `services/apis/` 建立或修改 API Client。
4.  **更新 Fixture**: 確保新物件已加入 `fixtures/` 供測試使用。
5.  **產出 Spec**: 最後才撰寫 `tests/` 下的測試劇本，確保劇本簡潔可讀。

## 4. 型別安全要求 (Type Safety)

- 所有 API 回傳值應包裝在 `ApiResult<T>` 中。
- 頁面物件方法若回傳其他頁面，應確保型別正確。
- 優先使用 `readonly` 定義不可變的定位器。
