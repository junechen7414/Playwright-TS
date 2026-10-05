# 測試策略

> 本文件補充 [`AGENTS.md`](../../AGENTS.md) 沒寫到的測試執行細節：Playwright projects、登入狀態的實際機制、資料隔離的邊界。
> 硬性規範、常用指令、架構與 fixtures 請以 `AGENTS.md` 為準。

## Playwright projects

`playwright.config.ts` 只定義三個 project，沒有其他名稱（例如 `api-e2e` 並不存在）：

| Project | testMatch | 對象 | 備註 |
|---|---|---|---|
| `ui-setup` | `**/saucedemo/*.setup.ts` | `https://www.saucedemo.com/` | 登入並寫出 storage state |
| `ui-staging` | `**/saucedemo/*.spec.ts` | 同上 | `dependencies: ['ui-setup']`，跑它會先自動跑 setup |
| `springboot-api` | `**/springboot/*.spec.ts` | `BASE_URL`，預設 `http://localhost:8787/` | 每個請求透過 `extraHTTPHeaders` 帶 HTTP Basic 標頭 |

- `pnpm test:e2e` 是 `playwright test tests/api/springboot`，實際只會命中 `springboot-api`。
- `tests/api/Network.spec.ts`（`page.route` mock 示範）**不符合任何 project 的 testMatch，永遠不會被執行**。
- HTTP Basic 憑證取自 `API_USERNAME` / `API_PASSWORD`，未設定時落回 `api` / `local-api-secret`；`docker-compose.test.yml` 對後端容器用同一組預設值，所以本機不設也能直接跑。

## UI 登入狀態（storageState）

本專案**沒有**在 config 的 `use.storageState` 設定登入狀態，而是由 fixture 自己開 context：

1. `tests/ui/saucedemo/Login.setup.ts`（`ui-setup`）透過 `loginPage` 登入兩個帳號，分別寫出
   `.auth/standard_user.json` 與 `.auth/problem_user.json`（`.auth/` 已列入 `.gitignore`）。
   problem user 那段不驗證商品頁，只示範多帳號。
2. `services/fixtures/page-objects.fixture.ts` 的角色 fixture 以
   `browser.newContext({ storageState: '.auth/<user>.json' })` 建立獨立 context，並在其上組好整組 Page Objects：
   - `standardUserPage` / `problemUserPage` —— 已登入的 `PageObject` 組合，尚未導頁。
   - `standardUserProductPage` —— 在 `standardUserPage` 之上先 `productPage.goto()`。
3. 測試直接解構使用，例如 `async ({ standardUserProductPage }) => { const { productPage, cartPage } = standardUserProductPage; ... }`。

注意事項：

- 角色 fixture 用的是**自己開的 context**，與內建的 `page` fixture 無關；同一個測試混用 `page`（未登入）與角色 fixture 會是兩個互不共用 cookie 的獨立 context。
- 一般的 `loginPage` / `productPage` fixture 建在內建 `page` 上且會先 `goto()`，用於「從未登入開始」的流程（如登入測試本身）。
- `.auth/*.json` 路徑是相對於執行目錄，請從 repo 根目錄跑 Playwright。
- 新增角色：在 `Login.setup.ts` 加一段登入與寫檔，再於 `page-objects.fixture.ts` 的 `Roles` 加對應 fixture。

## API 測試的資料隔離

容器重啟策略（見 `AGENTS.md` 與 [`docs/testing/e2e-cleanup-strategy.md`](../testing/e2e-cleanup-strategy.md)）只保證**每次執行之間**資料庫是乾淨的。**同一次執行內**：

- `fullyParallel: true`，本機 3 個 worker、CI 2 個，所有測試共用同一個 Oracle。
- 因此測試不可假設資料表為空、不可依賴列表筆數或特定 ID；需要的狀態一律透過 `existingAccount`、`existingProduct`、`existingOrder` 等資料型 fixture 自行建立，並只斷言自己建立的資料。
- 連續跑兩次而不重啟時，第二次會看到第一次留下的資料 —— 這正是上述規則存在的原因。

## 等待後端就緒

不要用固定秒數的 sleep 等容器。Oracle 的 healthcheck（PDB 為 READ WRITE、測試使用者已建立、Listener 已註冊 `FREEPDB1`）配合 `depends_on: condition: service_healthy`，讓 app 只在 DB 真的可用後才啟動；CI 則再以 `docker compose up --wait` 等 app 的 healthcheck。本機若剛 `pnpm compose-up` 就跑測試而遇到連線被拒，用 `podman ps` 確認 `spring-boot-app-test` 狀態後再跑。

## 常用執行方式

```bash
pnpm test:e2e:ci                              # 重啟容器 + 清報告 + API 測試
pnpm playwright test --project=ui-staging     # 只跑 UI（自動先跑 ui-setup）
pnpm playwright test --project=springboot-api # 只跑 API（需先 pnpm compose-up）
pnpm local-test-all                           # 清報告後跑全部 project
```

## 相關文件

- [`AGENTS.md`](../../AGENTS.md)
- [CI/CD 整合](./11-cicd-integration.md)
- [E2E 測試清理策略](../testing/e2e-cleanup-strategy.md)
