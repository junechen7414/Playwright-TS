# AGENTS.md

This file provides guidance to agents (Claude Code, etc.) when working with code in this repository.

本專案是一個採用 **Business-Layer Page Object Model** 架構的 **Playwright + TypeScript (ESM)** E2E 測試專案。測試對象有兩個：SauceDemo 網頁 UI，以及在本機容器中執行的 Spring Boot + Oracle DB API 堆疊。

更完整的指引請見下方引用、位於 `docs/agents/` 下的模組化文件（皆以繁體中文撰寫）。

## 硬性規範

1. **一律使用 `pnpm`，不要使用 `npm` 或 `yarn`。**
2. **一律使用 `podman`，不要使用 `docker`**（compose 指令透過 `podman compose` 執行）。
3. **註解與文件使用繁體中文**，與現有程式碼保持一致。
4. **優先使用 `getByRole`** 等以無障礙角色為基礎的 locator（最穩健的元素定位方式），避免 CSS/XPath。
5. 格式化與 Lint 使用 **Biome**。`noFloatingPromises` 設為 error —— promise 一律要 `await`。
6. import 一律使用 `tsconfig.json` 定義的路徑別名（`@pages/*`、`@fixtures/*` 等），不用冗長的相對路徑。
7. **遵循 Business-Layer POM**：測試應該讀起來像商業流程。
8. **使用 Custom Fixtures**：避免在測試中重複初始化邏輯。
9. **容器重啟策略**：確保測試隔離性和可重複性。
10. **持續改進文件**：發現可改進的 instruction 時，應主動提出並更新相關文件。

## 常用指令

```bash
pnpm compose-restart      # down + up —— 執行間用於重置測試隔離狀態
pnpm test:e2e:ci          # compose-restart + clean + API 測試 (完整 CI 流程)

# 重新產生 API 型別 -> services/schema/api-types.ts
pnpm api-spec:update      # 從跑起來的容器抓 /v3/api-docs（需先 compose-up；CI 走這條）
pnpm api-spec:update:file # 離線：改用版控裡的 docs/swagger.json 快照
```

需要一個含 `ORACLE_TEST_USERNAME` / `ORACLE_TEST_PASSWORD` 的 `.env`（參考 `.env.example`）。執行 API 測試前需先啟動容器堆疊（`pnpm compose-up`），或使用會先重啟堆疊的 `pnpm test:e2e:ci`。

CI job summary 常出現「版控快照 `docs/swagger.json` 與被測 image 的 spec 有差異」—— **那是預期行為**（上游同步快照的 job 排在 dispatch 之後，必定慢一步），型別是從被測容器的 live spec 產生的，不影響測試。四種觸發各自的讀法與唯一該追的異常見 [`docs/agents/13-advanced-techniques.md`](docs/agents/13-advanced-techniques.md#怎麼讀-job-summary-的快照與-live-spec-有差異)。

## 架構

三層架構 —— 測試層使用服務層，服務層封裝 Playwright API。測試應讀起來像商業流程，而非 UI/HTTP 操作。

- **`tests/`** —— 只放測試案例，不含 locator 或原始 HTTP 呼叫。`tests/ui/saucedemo/`（瀏覽器）與 `tests/api/springboot/`（API）。
- **`services/`** —— 可重用的基礎設施：
  - `pages/` —— Page Objects（`{name}-page.ts`，類別 `{Name}Page`）。公開方法為語意化的商業行為（`continueCheckout`、`verifyOrderCompletion`）；locator 保持私有。
  - `components/` —— 可重用 UI 元件（如 `hamburger-menu.ts`），組合進 Page Objects。
  - `apis/` —— `base-api-client.ts` 提供 `ApiRequester`（採組合而非繼承），回傳 `ApiResult<T>`，並提供 `expectOk` / `expectError` 斷言輔助函式；`springboot-api-client.ts` 封裝具體端點。
  - `schema/` —— `api-types.ts` 由被測容器的 `/v3/api-docs` **自動產生**（請勿手動編輯，見 `api-spec:update`）；另有 `constants.ts`、`common-types.ts`。
  - `fixtures/` —— 依賴注入層（見下方）。

### Fixtures 是組合的核心

測試從 chained fixture 匯入 `test`/`expect`，絕不直接建構 Page Objects 或 API clients。Fixtures 以 `mergeTests` 組合：

- `chain-fixtures.fixture.ts` → UI：合併 `page-objects` + `saucedemo-test-data`。
- `springboot-chained.fixture.ts` → API：合併 `springboot-api-objects` + `springboot-test-data`。

範例（API 測試）：`test('...', async ({ springbootApi, existingAccount, newOrderData }) => { ... })`。資料型 fixture 如 `existingAccount`、`existingProduct`、`existingOrder` 會按需建立後端狀態；`updateAccountData` 等則提供 payload。

### 測試隔離

`globalSetup`（Flyway clean/migrate）目前**已停用**，改採**容器重啟策略**：`compose-restart` 會清除 volumes 並重建資料庫，讓每次執行都從乾淨的 Oracle schema 開始。詳見 [`docs/testing/e2e-cleanup-strategy.md`](./docs/testing/e2e-cleanup-strategy.md)。

## 回應與工具偏好

> 此區塊由 `.github/instructions/Global.instructions.md` 統一引用，作為 GitHub Copilot 的 custom instructions 來源。

### 回應語言

所有回應必須使用**繁體中文**（正體中文）。絕對不可使用簡體中文。若遇到使用英文更好理解的情況（如特定技術詞彙），才改以英文回應；優先順序：繁體中文 > 英文。

### 程式設計中心思想

1. 程式碼應以**可讀性**為優先考量，即使程式簡短、可運作、速度快，可讀性不佳仍不可接受。
2. 考量**現代化做法**，盡量使用最新語法與方法，避免過時寫法。
3. 考量**實務做法**，理論上好但實務上非最佳解的方案也沒有意義。

### 指令執行偏好

1. **容器管理**：一律使用 `podman`，嚴禁使用 `docker`。
2. **套件管理**：一律使用 `pnpm`，嚴禁使用 `npm` 或 `yarn`。
3. **Shell 環境適配**：執行指令前須偵測當前 Shell，並使用對應語法：
   - PowerShell (`pwsh`)：串接用 `;`，執行當前目錄腳本用 `./script`
   - CMD (`cmd.exe`)：串接用 `&&`，執行當前目錄腳本直接用名稱（不加 `./`）
   - 不可假設預設 Shell，須透過環境資訊判斷後再決定語法。

### 文檔管理規範

1. 所有專案相關文檔必須放在 `docs/` 目錄下（根目錄只保留必要配置檔）。
2. 命名使用小寫字母與連字符（kebab-case），範例：`git-branch-push-plan.md`。
3. 文檔類型分類：
   - 指南類：`*-guide.md`
   - 計劃類：`*-plan.md`
   - 說明類：`*-explanation.md`
   - 流程圖：`*-workflow.md` / `*-diagram.md`
   - 快速參考：`*-quick-*.md`

---

## Git 工作流程

Trunk-based：**小型變更直接提交到 `main`**（push 時 CI 會執行）。只有高風險變更才開 `feature/`、`bugfix/`、`refactor/` 等分支加 PR（CI 設定、大型功能、跨模組重構、依賴大版本升級）。Commit 遵循 **Conventional Commits**（`<type>(<scope>): <subject>`，祈使句、字首小寫、結尾不加句號）。PR 一律以 **rebase merge** 合併（與上游 `SpringBoot` 一致）。完整細節與 PR 加 label 步驟見 [`docs/agents/05-git-workflow.md`](docs/agents/05-git-workflow.md)。

---

## 模組化文件

<!-- 專案基礎 -->
@./docs/agents/01-project-overview.md
@./docs/agents/02-environment-setup.md
@./docs/agents/03-quick-start.md

<!-- 開發規範 -->
@./docs/agents/04-development-standards.md
@./docs/agents/05-git-workflow.md
@./docs/agents/06-coding-principles.md

<!-- 架構設計 -->
@./docs/agents/07-architecture-overview.md
@./docs/agents/08-test-architecture.md
@./docs/agents/09-locator-strategies.md

<!-- 測試與部署 -->
@./docs/agents/10-testing-strategies.md
@./docs/agents/11-cicd-integration.md
@./docs/agents/12-configuration-guide.md

<!-- 維運支援 -->
@./docs/agents/13-advanced-techniques.md
@./docs/agents/14-troubleshooting.md

## 相關文件

- [筆記.md](./筆記.md) - 詳細的開發指南和最佳實踐
- [docs/testing/e2e-cleanup-strategy.md](./docs/testing/e2e-cleanup-strategy.md) - 測試資料清理策略
- [Playwright 官方文件](https://playwright.dev/docs/intro)
- [Docker Compose 文件](https://docs.docker.com/compose/)

---

**最後更新**: 2025-06-24
**Playwright 版本**: 1.57.0
