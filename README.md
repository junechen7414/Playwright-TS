# Playwright 自動化測試練習

以 Playwright 與 TypeScript 練習 UI、API 自動化，以及跨 repo 的持續整合。

最初從網路上的 [SauceDemo](https://www.saucedemo.com/) 練習 UI 自動化，之後接上自己的 [SpringBoot 訂單管理後端](https://github.com/junechen7414/SpringBoot)，練習從後端建置、映像發布、跨 repo 觸發，到啟動測試環境與驗證 API 的整段流程。後端與測試分開放在兩個 repo，正是這項整合練習的一部分。

- 想跑畫面測試：看 [SauceDemo UI 測試](#saucedemo-ui-測試)。
- 想跑後端測試：看 [SpringBoot API 測試](#springboot-api-測試)，先確認資料重置的影響。
- 想理解設計與 CI：看[測試怎麼分工](#測試怎麼分工)、[CI 與上游整合](#ci-與上游整合)。

## 測試目標

| 目標 | 範圍 | 執行時需要什麼 |
| --- | --- | --- |
| SauceDemo UI | 登入、商品、購物車與結帳等瀏覽器操作，包含不同示範帳號的行為 | 可連線到 SauceDemo 的網路與 Chromium；不用啟動 SpringBoot 或 Oracle。 |
| SpringBoot API | Account、Product、Order 的請求、回應、驗證與業務流程 | 後端 image、隔離的 Oracle 測試庫，以及 Podman／Compose；純 request 測試不用下載瀏覽器。 |

[playwright.config.ts](playwright.config.ts) 定義三個 projects：

- `ui-setup`：先登入並保存示範帳號的 storageState。
- `ui-staging`：SauceDemo UI 測試，依賴 `ui-setup`。
- `springboot-api`：SpringBoot API 測試，預設連到 `http://localhost:8787/`。

是否執行某個檔案由各 project 的 `testMatch` 決定，不是放進 tests/ 就一定會跑。

## 測試怎麼分工

採用 Business-Layer Page Object Model：讓案例表達操作與預期結果，把 locator、HTTP 與資料準備細節放到各自的位置。

| 位置 | 責任 |
| --- | --- |
| [tests/ui/saucedemo/](tests/ui/saucedemo/) | UI 案例與登入 setup。 |
| [tests/api/springboot/](tests/api/springboot/) | 後端 API 案例。 |
| [services/pages/](services/pages/)、[services/components/](services/components/) | Page Objects 與可組合的畫面操作。 |
| [services/apis/](services/apis/) | `ApiRequester` 組合 Playwright request context；具體 client 封裝後端端點。 |
| [services/fixtures/](services/fixtures/) | 注入 Page Objects、API clients，並按需建立測試資料。 |
| [services/schema/](services/schema/) | 共用型別與由 OpenAPI 產生的 API 型別。 |
| [scripts/wait-for-app.mjs](scripts/wait-for-app.mjs) | 等後端真的可用，再開始測試。 |

UI 與 API 各自以 `mergeTests` 組合物件、資料 fixtures。API 案例透過 [base-api-client.ts](services/apis/base-api-client.ts) 的 `ApiResult<T>` 與斷言輔助函式處理 HTTP 結果；型別標註不等於 runtime 驗證，狀態碼與實際回應仍由案例斷言。

## 前置與安裝

- 可執行目前鎖檔套件的 Node.js 與 **pnpm 10**。TypeScript 設定參照 Node 22；目前 package.json 沒有指定唯一的 Node runtime，請一併留意套件的 engine 要求。
- 套件使用 TypeScript ESM、Playwright、Biome、Faker 與 openapi-typescript。精確安裝版本以 [pnpm-lock.yaml](pnpm-lock.yaml) 為準，不把 package.json 的版本範圍當成已鎖定版本。
- 只有 API 容器測試需要 Podman、可用的 Compose provider、Oracle 所需資源，以及後端映像的拉取權限。

以下命令從 repo 根目錄執行，本機以 PowerShell 為例：

```powershell
pnpm install --frozen-lockfile
```

## SauceDemo UI 測試

```powershell
# 第一次執行 UI 測試前安裝瀏覽器
pnpm exec playwright install chromium

# 先執行登入 setup，再執行 UI 案例
pnpm playwright test --project=ui-staging
```

示範帳號與測試資料集中在 [saucedemo-test-data.fixture.ts](services/fixtures/saucedemo-test-data.fixture.ts)，不是個人帳號或 GitHub Secrets。登入 setup 會產生 `.auth/` 狀態檔，角色 fixture 再建立獨立的 browser context，避免案例共用同一個登入中的 page。

這組測試依賴外部練習網站的可用性；網站異動、網路問題與測試本身的回歸需要分開判讀。

## SpringBoot API 測試

### 1. 準備專用測試環境

[docker-compose.test.yml](docker-compose.test.yml) 會啟動 SpringBoot image 與 Oracle，預設占用主機 `8787`、`1521`。不要同時啟動使用相同埠的開發環境，也不要將測試設定指向重要資料庫。

預設後端 image 是 `ghcr.io/junechen7414/springboot:latest`。可透過 `GITHUB_REPOSITORY_OWNER`、`IMAGE_TAG` 選擇其他 owner／tag；Compose 設了 `pull_policy: always`，每次啟動都會嘗試拉取指定映像，並不是在本 repo 編譯後端原始碼。若映像需要認證，先準備相應 registry 存取權限。

環境變數可參考 [.env.example](.env.example)。Compose 會讀取 `.env`，但 **Playwright config 不會自動載入 `.env`**；自訂 API Basic 憑證必須同時送入後端容器與測試程序。

以下採用同一個 PowerShell 的程序環境變數提供設定，請替換密碼，並僅使用可丟棄的測試資料：

```powershell
$env:ORACLE_TEST_USERNAME = 'e2e_app'
$env:ORACLE_TEST_PASSWORD = '<測試資料庫密碼>'
$env:API_USERNAME = 'api'
$env:API_PASSWORD = '<測試 API 機器帳號密碼>'
```

### 2. 啟動、等待、對準規格後測試

```powershell
pnpm compose-up
pnpm compose-wait
pnpm api-spec:update
pnpm test:e2e
```

- `compose-up` 啟動測試堆疊，但不代表 Spring Boot 已準備好接收請求。
- `compose-wait` 輪詢 health，預設最多等 180 秒；可用 `APP_HEALTH_URL`、`APP_WAIT_TIMEOUT_S` 調整。
- `api-spec:update` 從受測 app 取得 OpenAPI，更新生成型別；`test:e2e` 本身不會先做這一步。
- `BASE_URL` 可覆寫 Playwright 的 API 目標；但型別更新 script 仍固定抓 `localhost:8787`，health script 也有獨立設定。換目標時要一起核對，不能只改其中一個。

### 3. 需要乾淨測試庫時才重置

> **會移除測試環境與資料：**`pnpm compose-down` 使用 `down -v`；`compose-restart` 與 `test:e2e:ci` 也會經過它。請只對本 repo 的專用測試堆疊執行。

```powershell
# 重建測試環境、等待就緒、清理報告，再跑 API 測試
pnpm test:e2e:ci
```

這個合併指令不包含 `api-spec:update`。需要測新的 image／契約時，可明確執行：

```powershell
pnpm compose-restart
pnpm compose-wait
pnpm api-spec:update
pnpm test:e2e:clean
```

重置隔開的是不同次執行。同一次執行內，各 worker 仍共用同一個 DB，所以資料型 fixture 按需建立自己的 Account／Product／Order，案例只斷言自己建立的資料，不依賴全表筆數或固定 ID。原先 Flyway clean 的 `globalSetup` 目前停用。

**平台限制：**`clean` 是 Windows CMD 語法；`test:e2e:clean`、`test:e2e:ci` 與 `local-test-all` 會呼叫它，不是可直接照搬到 Linux 的流程。實際 GitHub Actions 另有明確步驟，沒有靠這些 Windows 合併指令執行。

## 型別、檢查與報告

### OpenAPI 型別

```powershell
# 從執行中的 app 抓規格並產生型別
pnpm api-spec:update

# 從版控中的 docs/swagger.json 快照產生型別
pnpm api-spec:update:file

# 格式與 Lint 檢查
pnpm biome:check
```

兩種型別生成方式都會更新 [services/schema/api-types.ts](services/schema/api-types.ts)，請重新產生，不手動修改。離線快照可能與指定 image 不同；要判斷 API 測試結果，先確認當次實際測的是哪個 image、用了哪份 spec。

### 測試報告

| 執行環境 | HTML 報告位置 |
| --- | --- |
| 本機 | `playwright-report/<時間戳記>/` |
| API CI | `playwright-report/` |
| SauceDemo UI CI | `custom-report-folder/`，由 workflow 覆寫 |

本機查看時指定實際產生的時間戳子目錄：

```powershell
pnpm playwright show-report "playwright-report/<時間戳記>"
```

設定為失敗時保留截圖／錄影，trace 目前關閉；不要預期每次失敗都有 trace 檔。CI 的報告 artifact 保留 30 天，API workflow 另外保留受測的 live spec 與快照差異。`clean` 會刪本機報告與 test-results，需要保存的證據先另外保留。

## CI 與上游整合

### 為什麼分兩個 repo

[SpringBoot](https://github.com/junechen7414/SpringBoot) 負責建置與發布後端映像，本 repo 負責把映像當成受測系統，啟動環境並從外部呼叫 API。這讓 image 版本、健康檢查、規格同步、跨 repo 事件與失敗報告，都成為可實際練習的整合環節。

### 兩條 workflow

| Workflow | 觸發與工作 |
| --- | --- |
| [demo.yml](.github/workflows/demo.yml) | `main`／`master` 的 push、PR 與手動觸發；使用內建瀏覽器的 Playwright image，執行 `ui-staging`。 |
| [springboot.yml](.github/workflows/springboot.yml) | `main` push、手動觸發、`backend_image_updated` dispatch，以及通過 `e2e-test` 標籤條件的 main PR；啟動後端與 Oracle、產生 live API 型別、執行 `springboot-api` 並保留報告。 |

API PR 只在「這次新增 `e2e-test` 標籤」或「已有該標籤後又推 commit」時執行。只有開 PR 或推一般分支，不代表已跑 API E2E。

API 測試的 image tag 依觸發來源決定：

- 上游 dispatch：使用 payload 的 `image_tag`。
- 手動執行：使用指定輸入，預設 `latest`。
- 本 repo 的 main push／PR：使用後端 `latest`，不是自動對應本 repo commit 的某個後端映像。

本機使用 Podman；CI 使用 GitHub runner 的 Docker Compose 是刻意的差異。API CI 需設定 `DB_USER`、`DB_PASSWORD`，映射為 Oracle 測試帳密；自訂 `API_USERNAME`、`API_PASSWORD` 同時送入 app 與 Playwright。UI CI 使用的 Playwright image 版本要與測試套件相容。

### Live spec 與版控快照

上游先發布 image、dispatch 本 repo，再由後續 job 推送 Swagger 快照。因此自動觸發時，checkout 到的 [docs/swagger.json](docs/swagger.json) 可能尚未更新。

API CI 從已啟動的 app 抓取 live spec 產生型別，再比對版控快照，將差異寫到 job summary 作提示，不以快照落後直接擋住測試。這不代表任意規格差異都可忽略，仍要看觸發來源與選定 image。

完整的觸發條件、secrets 與設計理由見 [CI/CD 整合](docs/agents/11-cicd-integration.md)；快照判讀見[進階技巧](docs/agents/13-advanced-techniques.md)。

## 延伸閱讀

- [測試策略與隔離](docs/agents/10-testing-strategies.md)
- [CI/CD 整合](docs/agents/11-cicd-integration.md)
- [API 型別與 spec 差異](docs/agents/13-advanced-techniques.md)
- [資料清理策略的背景](docs/testing/e2e-cleanup-strategy.md)：目前命令與等待期限以 package scripts、workflow 與 wait script 為準。

本文依目前程式、設定與 workflow 整理；本次文件整理未重新安裝套件、啟動容器或執行 UI／API 測試，不代表當前外站或本機環境已驗證成功。
