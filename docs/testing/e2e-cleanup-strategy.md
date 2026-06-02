# E2E 測試資料清理策略說明

## 📋 背景

從 JPA 的 `ddl-auto: create-drop` 策略改為 `validate` 並引入 Flyway 後，資料庫不會在每次啟動時自動重建，因此需要明確的資料清理策略來確保測試的隔離性和可重複性。

## 🎯 採用的清理策略

本專案採用**容器重啟策略**作為主要的資料清理方案。

### ✅ 容器重啟策略（已實作並驗證）

**工作原理**：
- 每次測試執行前停止並刪除所有測試容器和 volumes
- 重新啟動 podman compose 環境（Spring Boot + Oracle DB）
- Spring Boot 啟動時會自動執行 Flyway migrate
- 等待服務健康檢查通過後執行測試

**優點**：
- ✅ 完全隔離，每次都是全新環境
- ✅ 不依賴額外工具（如 Flyway CLI）
- ✅ 適合 CI/CD pipeline
- ✅ 測試結果可重複且可靠

**缺點**：
- ⏱️ 啟動時間較長（Oracle DB 需要 1-2 分鐘）
- 💾 每次都會重建容器和 volumes

**測試結果**：✅ 18/18 測試通過

---

## 📦 可用的測試方式

### 方式 1：手動啟動容器 + 執行測試（本地開發推薦）⭐⭐

適合本地開發時快速迭代：

```bash
# 1. 啟動測試環境（只需執行一次）
pnpm run compose-up

# 2. 執行測試（可重複執行）
pnpm run test:e2e

# 3. 停止測試環境（可選）
pnpm run compose-down
```

**注意**：
- 容器啟動後會保持運行，測試間的資料會累積
- 如需乾淨環境，使用方式 2 或手動重啟容器

---

### 方式 2：完整的容器重啟流程（CI/CD 推薦）⭐

適合 CI/CD pipeline 或需要完全乾淨環境：

```bash
# Windows (PowerShell)
.\scripts\test-e2e-ci.ps1

# Linux/macOS (Bash)
bash scripts/test-e2e-ci.sh

# 或使用 pnpm script
pnpm run test:e2e:ci
```

**腳本會自動執行**：
1. 停止並刪除現有容器和 volumes
2. 重新啟動測試環境
3. 等待服務健康檢查（最多 5 分鐘）
4. 執行測試
5. 顯示測試結果和日誌

---

## 🔧 設定檔說明

### 1. `playwright.config.ts`

```typescript
export default defineConfig({
  testDir: './tests',
  // globalSetup: './global-setup.ts', // 已註解，使用容器重啟策略
  timeout: 30000,
  // ... 其他設定
});
```

**說明**：
- `globalSetup` 已註解，因為採用容器重啟策略
- 如果未來需要使用 Flyway CLI 清理，可以取消註解

### 2. `package.json` 測試腳本

```json
{
  "scripts": {
    "test:e2e": "執行 E2E 測試",
    "test:e2e:clean": "清理報告後執行測試",
    "test:e2e:ci": "完整的 CI/CD 測試流程（容器重啟）",
    "compose-up": "啟動測試環境",
    "compose-down": "停止並刪除測試環境",
    "compose-restart": "重啟測試環境"
  }
}
```

### 3. CI/CD 測試腳本

- `scripts/test-e2e-ci.sh`（Linux/macOS）
- `scripts/test-e2e-ci.ps1`（Windows）

這些腳本實作完整的容器重啟流程，包含錯誤處理和日誌輸出。

---

## 🚀 快速開始

### 本地開發

```bash
# 1. 啟動測試環境
pnpm run compose-up

# 2. 等待容器啟動完成（約 1-2 分鐘）
# 可以使用以下指令檢查狀態：
podman ps

# 3. 執行測試
pnpm run test:e2e
```

### CI/CD Pipeline

```yaml
# GitHub Actions 範例
- name: Run E2E Tests
  run: pnpm run test:e2e:ci
  env:
    ORACLE_TEST_USERNAME: ${{ secrets.ORACLE_TEST_USERNAME }}
    ORACLE_TEST_PASSWORD: ${{ secrets.ORACLE_TEST_PASSWORD }}
```

---

## ⚠️ 注意事項

### 環境變數設定

確保 `.env` 檔案包含正確的資料庫憑證：

```bash
ORACLE_TEST_USERNAME=your_username
ORACLE_TEST_PASSWORD=your_password
```

### 容器健康檢查

測試腳本會等待以下條件：
- Oracle DB 健康狀態為 `healthy`
- Spring Boot 容器狀態為 `running`
- 最多等待 5 分鐘

### 測試資料累積

**方式 1（手動啟動）**：
- 容器保持運行，測試資料會累積
- 如需乾淨環境，執行 `pnpm run compose-restart`

**方式 2（容器重啟）**：
- 每次都是全新環境，無資料累積問題

---

## 🐛 疑難排解

### 問題 1：容器啟動失敗

**檢查項目**：
1. 確認 podman 正在運行
2. 檢查 `.env` 檔案是否存在且正確
3. 查看容器日誌：`podman logs spring-boot-app-test`

### 問題 2：測試連線失敗

**錯誤訊息**：`connect ECONNREFUSED ::1:8787`

**解決方式**：
1. 確認容器正在運行：`podman ps`
2. 確認 Spring Boot 已完全啟動（等待 10-20 秒）
3. 檢查 port 8787 是否被佔用

### 問題 3：Oracle DB 啟動超時

**解決方式**：
1. 增加等待時間（在測試腳本中調整 `maxWait`）
2. 確認系統資源充足（Oracle DB 需要較多記憶體）
3. 檢查 Oracle DB 日誌：`podman logs oracle-db-test`

---

## 📊 測試結果

最近一次測試結果：

```
✅ 18/18 測試通過
⏱️ 執行時間：7.8 秒
📦 策略：容器重啟（手動啟動後執行測試）
```

測試涵蓋：
- Account 帳號管理（5 個測試）
- Order 訂單管理（8 個測試）
- Product 商品管理（5 個測試）

---

## 🔄 替代方案（未採用）

### 方案 A：Flyway Clean + Migrate

**為何未採用**：
- 需要安裝 Flyway CLI
- 需要知道 Flyway migration 檔案路徑
- 本專案的 migration 檔案在 Spring Boot 專案中，不在此 E2E 測試 repo

**如何啟用**（如果需要）：
1. 安裝 Flyway CLI：`pnpm add -g node-flywaydb`
2. 在 `global-setup.ts` 中設定正確的 migration 路徑
3. 取消 `playwright.config.ts` 中的 `globalSetup` 註解

### 方案 B：測試後手動清理（Teardown）

**為何未採用**：
- 需要處理外鍵依賴順序
- 如果測試失敗，可能無法清理
- 維護成本高

### 方案 C：Transaction Rollback

**為何未採用**：
- API 測試無法控制 Spring Boot 的 transaction
- 不適合當前的測試架構

---

## 📚 相關文件

- [Playwright 官方文件](https://playwright.dev/docs/intro)
- [Podman Compose 文件](https://docs.podman.io/en/latest/markdown/podman-compose.1.html)
- [Flyway 官方文件](https://flywaydb.org/documentation/)

---

**最後更新**：2026-05-13  
**測試狀態**：✅ 已驗證（18/18 測試通過）