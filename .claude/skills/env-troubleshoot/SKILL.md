---
name: env-troubleshoot
description: 排查本機 API 測試環境（podman 上的 Spring Boot + Oracle 容器）。當容器起不來或一直 unhealthy、測試出現 ECONNREFUSED 或 401、連不到 Oracle（ORA- 錯誤）、或 compose-up 卡住時使用。
---
# 本機測試環境排查（env-troubleshoot）

堆疊定義在 `docker-compose.test.yml`，以 `podman compose` 執行：

| 服務 | 容器名稱 | Port | 說明 |
|---|---|---|---|
| `oracle-db` | `oracle-db-test` | 1521 | Oracle Free，PDB 為 `FREEPDB1` |
| `app` | `spring-boot-app-test` | 8787 | `ghcr.io/<owner>/springboot` image，`pull_policy: always`；DB healthy 後才啟動 |

依序檢查，找到根因就停下來回報，並附上指令與輸出作為證據。

## 1. Podman 本身

`podman info` 失敗時，Windows 上通常是 podman machine 沒啟動：先看 `podman machine list`，再執行 `podman machine start`。

## 2. `.env`

- 必須有 `ORACLE_TEST_USERNAME` / `ORACLE_TEST_PASSWORD`（參考 `.env.example`）。少了的話，DB 健康檢查第 2 階段永遠找不到測試使用者。
- `API_USERNAME` / `API_PASSWORD` 可省略，Playwright 與後端都會落回預設值 `api` / `local-api-secret`。
- 測試全部回 **401** 時，代表 Playwright 端（`playwright.config.ts`）與容器端的 API 憑證不一致。檢查 shell 環境變數是否覆寫了其中一邊。

## 3. 容器狀態與健康檢查

```bash
podman ps -a
podman inspect --format '{{.State.Health.Status}}' oracle-db-test
podman logs --tail 100 oracle-db-test
podman logs --tail 100 spring-boot-app-test
```

- **時間**：DB 健康檢查設定為 `start_period 90s`、每 30 秒一次、重試 20 次，首次啟動要等數分鐘才算異常。等待時以狀態為準，不靠固定 sleep。
- **三個階段**：健康檢查依序確認下列三項，失敗訊息會指出卡在哪一段：
  1. `PDB not ready`：`FREEPDB1` 尚未 `READ WRITE`。
  2. `Test user not created yet`：`init-scripts/` 的建帳腳本尚未跑完或失敗，到 DB log 找錯誤。
  3. `FREEPDB1 service not registered with listener`：listener 尚未註冊，可用 `podman exec oracle-db-test lsnrctl status` 查看。
- **app 一直沒起來**：多半是 DB 尚未 healthy。若 DB 已 healthy，到 app log 找 datasource 或認證錯誤。image 拉不到時，確認網路與 ghcr 存取權限。
- **記憶體**：Oracle 需要至少約 2GB，podman machine 記憶體不足時會反覆重啟。

## 4. 連線

- `ECONNREFUSED ...:8787` 或 `socket hang up` 表示 app 尚未就緒，或 port 被占用。`compose-up` 只等 DB healthy，不等 app，Spring Boot 啟動要再花 30–100 秒；本機 podman 也沒套用 image 的 HEALTHCHECK。手動跑測試前先執行 `pnpm compose-wait`（`test:e2e:ci` 已內建）。
- 健康狀態：`curl http://localhost:8787/actuator/health`。
- Port 占用：PowerShell 用 `netstat -ano | findstr :8787`（1521 同理）。
- `ORA-12541: TNS:no listener`，或連線字串缺少 PDB 名稱：容器內正確的連線字串是 `jdbc:oracle:thin:@oracle-db:1521/FREEPDB1`，主機端則用 `localhost:1521/FREEPDB1`。

## 5. 重置

狀態不明時，直接重建乾淨環境：

```bash
pnpm compose-restart
```

這會執行 `down -v` 清掉 volume，再 `up -d`。這也是測試隔離的標準做法。
