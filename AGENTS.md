# AGENTS.md

This file provides guidance to agents (Claude Code, GitHub Copilot, etc.) when working with code in this repository.

> 本檔同時是 GitHub Copilot 的 custom instructions（由 `.github/instructions/Global.instructions.md` 引用）。

本專案是採用 **Business-Layer Page Object Model** 架構的 **Playwright + TypeScript (ESM)** E2E 測試專案，有兩個測試對象：
- SauceDemo 網頁 UI
- 在本機容器中執行的 Spring Boot + Oracle DB API 堆疊

## 硬性規範

1. **回應、註解與文件一律使用繁體中文**，絕不使用簡體中文。只有技術詞彙用英文更清楚時才改用英文。
2. **套件管理一律用 `pnpm`。** `npm` 與 `yarn` 都不使用。
3. **本機容器一律用 `podman`**（compose 指令透過 `podman compose` 執行）。CI runner 上的 `docker compose` 是刻意的，屬於例外。
4. **優先使用 `getByRole`** 等以無障礙角色為基礎的 locator，CSS/XPath 只在別無選擇時使用。
5. 格式化與 Lint 使用 **Biome**。`noFloatingPromises` 設為 error，promise 一律要 `await`。
6. import 一律使用 `tsconfig.json` 定義的路徑別名（`@pages/*`、`@fixtures/*` 等）。
7. **測試讀起來像商業流程**：初始化邏輯放在 custom fixture，locator 與 HTTP 細節放在服務層（見「架構」）。
8. **持續改進文件**：發現可改進的指引時，主動提出並更新相關文件。

## 常用指令

```bash
pnpm playwright test --project=ui-staging   # UI 測試（會連帶跑 ui-setup 登入）
pnpm test:e2e             # API 測試（需容器已啟動）
pnpm compose-restart      # down -v + up，重置測試隔離狀態（不等 app 就緒）
pnpm compose-wait         # 輪詢 /actuator/health 直到 app 回報 UP（預設最多 180 秒）
pnpm test:e2e:ci          # compose-restart + compose-wait + clean + API 測試（完整 CI 流程）
pnpm playwright show-report

# 重新產生 API 型別 -> services/schema/api-types.ts
pnpm api-spec:update      # 從跑起來的容器抓 /v3/api-docs（需先 compose-up；CI 走這條）
pnpm api-spec:update:file # 離線：改用版控裡的 docs/swagger.json 快照
```

- **Playwright projects**：`ui-setup`（登入並存 storageState）、`ui-staging`（SauceDemo，依賴 `ui-setup`）、`springboot-api`（`localhost:8787`）。
- **`.env`**：需要 `ORACLE_TEST_USERNAME` / `ORACLE_TEST_PASSWORD`（參考 `.env.example`）。`API_USERNAME` / `API_PASSWORD` 可省略，預設為 `api` / `local-api-secret`。
- **環境出問題**（容器 unhealthy、ECONNREFUSED、401、ORA- 錯誤）：使用 `env-troubleshoot` skill。
- **`clean` script 是 cmd 語法**，只能在 Windows 執行。
- **報告位置**：本機輸出到 `playwright-report/<時間戳>/`，CI 輸出到 `playwright-report/`。
- **spec 差異提示**：CI job summary 常出現「版控快照 `docs/swagger.json` 與被測 image 的 spec 有差異」，**這是預期行為**。上游同步快照的 job 排在 dispatch 之後，必定慢一步；型別是從被測容器的 live spec 產生的，不影響測試。四種觸發各自的讀法，以及唯一該追的異常，見 [`docs/agents/13-advanced-techniques.md`](docs/agents/13-advanced-techniques.md#怎麼讀-job-summary-的快照與-live-spec-有差異)。

## 完成條件

改動完成的標準是**對應的測試 project 跑過且通過**。回報時附上執行的指令與輸出：
- 改 UI（`services/pages/`、`services/components/`、`tests/ui/`）：跑 `pnpm playwright test --project=ui-staging`
- 改 API（`services/apis/`、`services/schema/`、`tests/api/`）：跑 `pnpm test:e2e:ci`

測試失敗時，先找出根因並修正；不以跳過測試或放寬斷言的方式讓它通過。

## 架構

三層架構：測試層使用服務層，服務層封裝 Playwright API。

- **`tests/`**：只放測試案例。
  - `tests/ui/saucedemo/`：瀏覽器測試
  - `tests/api/springboot/`：API 測試
- **`services/`**：可重用的基礎設施。
  - `pages/`：Page Objects，檔名 `{name}-page.ts`，類別 `{Name}Page`。公開方法是語意化的商業行為（`continueCheckout`、`verifyOrderCompletion`），locator 保持私有。
  - `components/`：可重用的 UI 元件（如 `hamburger-menu.ts`），組合進 Page Objects。
  - `apis/`：
    - `base-api-client.ts` 提供 `ApiRequester`（採組合而非繼承），回傳 `ApiResult<T>`，並提供 `expectOk` / `expectError` 斷言輔助函式。
    - `springboot-api-client.ts` 封裝具體端點。
  - `schema/`：`api-types.ts` 由 `api-spec:update` **自動產生**，修改型別時重新產生，不手動編輯。另有 `constants.ts`、`common-types.ts`。
  - `fixtures/`：依賴注入層（見下方）。

### Fixtures 是組合的核心

測試從 chained fixture 匯入 `test` / `expect`，由 fixture 提供 Page Objects 與 API clients。Fixtures 以 `mergeTests` 組合：

- UI：`chain-fixtures.fixture.ts`，合併 `page-objects` 與 `saucedemo-test-data`。
- API：`springboot-chained.fixture.ts`，合併 `springboot-api-objects` 與 `springboot-test-data`。

API 測試範例：`test('...', async ({ springbootApi, existingAccount, newOrderData }) => { ... })`。

fixture 分兩種：
- **資料型 fixture**（如 `existingAccount`、`existingProduct`、`existingOrder`）按需建立後端狀態。
- **payload fixture**（如 `updateAccountData`）只提供 request payload。

### 測試隔離

`globalSetup`（Flyway clean/migrate）**已停用**。`global-setup.ts` 仍留在 repo 與 tsconfig include 中，但不會執行。

目前採用**容器重啟策略**：`compose-restart` 清除 volumes 並重建資料庫，讓每次執行都從乾淨的 Oracle schema 開始。

這只保證每次執行**之間**是乾淨的。同一次執行內，所有平行 worker 共用同一個 DB，因此：
- 測試透過資料型 fixture 自行建立需要的狀態
- 只斷言自己建立的資料，不依賴資料表筆數或固定 ID

詳見 [`docs/testing/e2e-cleanup-strategy.md`](docs/testing/e2e-cleanup-strategy.md)。

## Shell 與文件慣例

- **Shell**：
  - 執行指令前，依環境資訊判斷目前的 Shell，並使用對應語法。本專案以 PowerShell 為主要開發環境。
  - PowerShell 以 `;` 串接指令，用 `./script` 執行當前目錄腳本。
  - CMD 以 `&&` 串接指令，直接用名稱執行腳本。
- **文件**：
  - 專案文件放在 `docs/` 下，根目錄只保留必要的設定檔。
  - 檔名使用 kebab-case，並依類型加後綴：`*-guide.md`（指南）、`*-plan.md`（計劃）、`*-explanation.md`（說明）、`*-workflow.md` / `*-diagram.md`（流程圖）、`*-quick-*.md`（快速參考）。

## Git 工作流程

- **Trunk-based**：小型變更直接 commit 到 `main`，push 時 CI 會執行。
- **高風險變更**才開分支加 PR，例如 CI 設定、大型功能、跨模組重構、依賴大版本升級。步驟見 `/create-pr` skill。
- **Commit 訊息**遵循 Conventional Commits：`<type>(<scope>): <subject>`，祈使句、字首小寫、結尾不加句號。
- **合併**：PR 一律以 rebase merge 合併，與上游 `SpringBoot` 一致。

規範細節與理由見 [`docs/agents/05-git-workflow.md`](docs/agents/05-git-workflow.md)。

## Skills 與工作流程

| 情境 | Skill |
|---|---|
| CI 紅了，或拿到 `playwright-report` artifact | `ci-triage` |
| 本機容器、DB、連線問題 | `env-troubleshoot` |
| 高風險變更要開 PR | `/create-pr` |
| 難解的 bug 或 flaky test | `diagnosing-bugs` |
| 改完後的獨立審查 | `/mattpocock-skills:code-review` |
| 新功能 | `/grill-with-docs` → `/to-spec` → `/to-tickets` → `/implement` |
| 架構改善 | `/improve-codebase-architecture` |
| 跨 session 交接 | `/handoff` |
| 不確定用哪個 skill | `/ask-matt` |

## 參考文件（需要時才讀）

| 何時讀 | 文件 |
|---|---|
| 調整測試隔離、storageState 登入或資料策略 | [`docs/agents/10-testing-strategies.md`](docs/agents/10-testing-strategies.md) |
| 修改 `.github/workflows/`，或需要理解 CI 觸發、label gate、dispatch 時 | [`docs/agents/11-cicd-integration.md`](docs/agents/11-cicd-integration.md) |
| 修改 API 型別產生流程，或判讀 spec 差異 | [`docs/agents/13-advanced-techniques.md`](docs/agents/13-advanced-techniques.md) |
| 需要完整的開發筆記 | [`筆記.md`](筆記.md) |

## Context 壓縮

壓縮對話時，務必保留已修改的檔案清單，以及驗證用的測試指令與最近一次的結果。
