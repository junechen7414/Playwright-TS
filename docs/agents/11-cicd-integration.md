# CI/CD 整合

> 本文件說明 `.github/workflows/` 下兩支 workflow 的設計理由與陷阱。
> 本機指令、容器重啟策略與架構請見 [`AGENTS.md`](../../AGENTS.md)。

## 兩支 workflow 一覽

| | `demo.yml`（Saucedemo UI Tests） | `springboot.yml`（Spring Boot API E2E Tests） |
|---|---|---|
| Project | `--project=ui-staging` | `--project=springboot-api` |
| 執行環境 | job `container:` 用 `mcr.microsoft.com/playwright:v1.57.0-noble`（`--user 0`），瀏覽器已內建，設 `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` | 直接跑在 `ubuntu-latest` runner 上，**不用** Playwright 映像（API 測試不需要瀏覽器，且要在 runner 上啟動 compose 堆疊） |
| 報告路徑 | `PLAYWRIGHT_HTML_REPORT=custom-report-folder` | `playwright-report/`，另附 `docs/swagger.live.json`、`spec-drift.diff` |
| Artifact 名稱 | 皆為 `playwright-report`，保留 30 天 | 同左 |

兩者都用 `pnpm/action-setup`（pnpm 10）+ `pnpm install --frozen-lockfile`；`demo.yml` 額外快取 pnpm store（只快取 store、不快取 `node_modules`，避免解壓大量小檔的 I/O）。

> 升級 `@playwright/test` 時，`demo.yml` 的映像 tag 必須同步升級，否則容器內瀏覽器版本與套件不符。

## 觸發條件

兩支的觸發不同，因為 API 測試綁著上游後端 image、每次都要拉起 Oracle，成本高得多。

`demo.yml` 沒有外部依賴，能跑就跑：`push` / `pull_request`（`main`、`master`）與 `workflow_dispatch`。

`springboot.yml`：

```yaml
on:
  workflow_dispatch:      # 手動指定 image_tag (最後的保險)
  repository_dispatch:    # 上游 SpringBoot repo 推新 image 時連動
    types: [backend_image_updated]
  pull_request:           # 需再貼上 'e2e-test' 標籤才會真的跑 (見 job 的 if:)
    types: [labeled, synchronize]
    branches: [main]
  push:                   # trunk-based 下直接進 main 的小改，唯一的 CI 把關
    branches: [main]
```

job 層的閘門對 `labeled` 事件只認「**這次加的**標籤是不是 `e2e-test`」（比對
`github.event.label.name`），而不是問「這個 PR 現在有沒有 `e2e-test`」。因為一次貼多個
標籤時，GitHub 會為每個標籤各發一次 `labeled` 事件，而每次事件的 payload 都已含完整標籤
集合 —— 用 `contains()` 判斷會讓每次事件都成立，貼 N 個標籤就重複拉 N 次 Oracle。
`synchronize` 事件的 payload 沒有 `github.event.label`，那一路仍用 `contains()` 判斷標籤存在。

被測 image 的 tag 由觸發來源決定（`Set Image Tag` 步驟，並寫入 job summary）：`repository_dispatch` 取 payload 的 `image_tag`、
`workflow_dispatch` 取輸入值（預設 `latest`），`push` / `pull_request` 則固定對接 `latest`。

## `springboot.yml` 步驟重點

1. **登入 GHCR**：`docker/login-action` 以 `github.actor` + 內建的 `secrets.GITHUB_TOKEN` 登入 `ghcr.io`，不需要另設 token secret。
2. **啟動堆疊**：`docker compose -f docker-compose.test.yml up -d --wait --quiet-pull`，接著以 `docker inspect` 確認 `spring-boot-app-test` 為 `healthy`，否則印出 app log 並失敗。`--wait` 取代任何固定秒數的等待。
   - CI 用 `docker` 是**刻意的**：GitHub 託管 runner 內建 Docker 與 compose plugin。本機開發一律用 `podman compose`（`pnpm compose-up` 等腳本），兩者讀同一份 `docker-compose.test.yml`。
   - compose 檔只替 `oracle-db` 定義 healthcheck；app 的 health 狀態來自後端 image 本身的 `HEALTHCHECK`。
3. **產生 API 型別**：`pnpm run api-spec:update` 從剛啟動的容器抓 live spec；接著比對版控快照並在 job summary 提示差異（純提示、不阻擋）。原因與讀法見 [`13-advanced-techniques.md`](./13-advanced-techniques.md)。
4. **跑測試**：`pnpm playwright test --project=springboot-api`，`BASE_URL=http://localhost:8787`。
5. **收尾**：`docker compose down`（`if: always()`）與上傳報告。

## Secrets

| Secret | 用途 | 對應 |
|---|---|---|
| `DB_USER` | Oracle 測試帳號 | 傳入 compose 的 `ORACLE_TEST_USERNAME` |
| `DB_PASSWORD` | Oracle 測試密碼 | `ORACLE_TEST_PASSWORD` |
| `API_USERNAME` | 後端 HTTP Basic 帳號 | 同時傳給 compose（後端）與 Playwright 步驟 |
| `API_PASSWORD` | 後端 HTTP Basic 密碼 | 同上 |

`GITHUB_TOKEN` 由 Actions 自動提供。`API_USERNAME` / `API_PASSWORD` 必須**同時**出現在「啟動堆疊」與「跑測試」兩個步驟的 `env`，否則後端與 Playwright 送出的標頭不一致會全面 401。兩邊在 secret 未設定時都會落回 `api` / `local-api-secret`（compose 用 `${VAR:-default}`、config 用 `||`），所以「都沒設」仍能通過，「只設一邊」才會壞。

## CI 與本機的設定差異

依 `process.env.CI` 切換（`playwright.config.ts`）：

| 設定 | CI | 本機 |
|---|---|---|
| `retries` | 2 | 0 |
| `workers` | 2 | 3 |
| HTML 報告 | `playwright-report/` | `playwright-report/<時間戳記>/`（`PW_DATE`） |

不分環境的共同設定：`trace: 'off'`、`screenshot: 'on-first-failure'`、`video: 'retain-on-failure'`（1280×960）。因為 trace 關閉，CI 失敗時的除錯依據是報告內的截圖、錄影與錯誤快照。

## 相關文件

- [`AGENTS.md`](../../AGENTS.md)
- [測試策略](./10-testing-strategies.md)
- [進階技巧：API 型別與 spec 差異](./13-advanced-techniques.md)
