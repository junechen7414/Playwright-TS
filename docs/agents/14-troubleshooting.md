# 疑難排解

> 本文件說明常見問題與解決方案

## 容器相關問題

### 容器啟動失敗

**症狀**: 執行 `pnpm run compose-up` 後容器無法啟動

**檢查項目**:

1. **確認 Podman/Docker 正在運行**
   ```bash
   # 檢查 Podman 狀態
   podman info
   
   # 或檢查 Docker 狀態
   docker info
   ```

2. **檢查 .env 檔案**
   ```bash
   # 確認檔案存在
   ls -la .env
   
   # 檢查內容
   cat .env
   ```
   
   必要的環境變數：
   - `ORACLE_TEST_USERNAME`
   - `ORACLE_TEST_PASSWORD`

3. **查看容器日誌**
   ```bash
   # Spring Boot 應用日誌
   podman logs spring-boot-app-test
   
   # Oracle DB 日誌
   podman logs oracle-db-test
   ```

4. **檢查 Port 佔用**
   ```bash
   # Windows (PowerShell)
   netstat -ano | findstr :8787
   netstat -ano | findstr :1521
   
   # Linux/macOS
   lsof -i :8787
   lsof -i :1521
   ```

**解決方式**:

```bash
# 完全清理並重新啟動
podman compose -f docker-compose.test.yml down -v
podman compose -f docker-compose.test.yml up -d

# 等待服務啟動
sleep 30
```

### 容器健康檢查失敗

**症狀**: 容器啟動但健康檢查一直失敗

**檢查方式**:

```bash
# 檢查容器狀態
podman ps -a

# 手動執行健康檢查
podman exec oracle-db-test healthcheck.sh
```

**常見原因**:

1. **Oracle DB 初始化未完成**
   - Oracle DB 需要 1-2 分鐘完全啟動
   - 解決：增加等待時間

2. **PDB 未開啟**
   ```bash
   # 進入容器檢查
   podman exec -it oracle-db-test sqlplus sys/password@//localhost:1521/FREEPDB1 as sysdba
   
   # 檢查 PDB 狀態
   SELECT name, open_mode FROM v$pdbs;
   
   # 如果是 MOUNTED，手動開啟
   ALTER PLUGGABLE DATABASE FREEPDB1 OPEN;
   ```

3. **記憶體不足**
   - Oracle DB 需要至少 2GB 記憶體
   - 解決：增加 Docker/Podman 記憶體限制

## 測試連線問題

### 測試連線失敗

**錯誤訊息**: `connect ECONNREFUSED ::1:8787`

**原因分析**:
- Spring Boot 應用尚未完全啟動
- Port 8787 被其他程式佔用
- 防火牆阻擋連線

**解決步驟**:

1. **確認容器正在運行**
   ```bash
   podman ps
   ```
   
   應該看到：
   - `spring-boot-app-test` (healthy)
   - `oracle-db-test` (healthy)

2. **等待 Spring Boot 完全啟動**
   ```bash
   # 持續檢查健康狀態
   curl http://localhost:8787/actuator/health
   
   # 或查看日誌
   podman logs -f spring-boot-app-test
   ```
   
   等待看到：
   ```
   Started Application in X.XXX seconds
   ```

3. **檢查 Port 是否被佔用**
   ```bash
   # Windows
   netstat -ano | findstr :8787
   
   # Linux/macOS
   lsof -i :8787
   ```

4. **測試連線**
   ```bash
   # 使用 curl 測試
   curl -v http://localhost:8787/actuator/health
   
   # 或使用 PowerShell
   Invoke-WebRequest -Uri http://localhost:8787/actuator/health
   ```

**建議等待時間**:
- 本地開發：10-20 秒
- CI 環境：30-60 秒

### API 請求超時

**症狀**: 測試執行時 API 請求超時

**解決方式**:

1. **增加超時時間**
   ```typescript
   // playwright.config.ts
   export default defineConfig({
     timeout: 60 * 1000,  // 從 30 秒增加到 60 秒
   });
   ```

2. **檢查網路連線**
   ```bash
   # 測試 API 回應時間
   curl -w "@curl-format.txt" -o /dev/null -s http://localhost:8787/api/products
   ```

3. **查看應用日誌**
   ```bash
   podman logs spring-boot-app-test | grep ERROR
   ```

## Oracle DB 問題

### Oracle DB 啟動超時

**症狀**: Oracle DB 容器啟動超過 5 分鐘仍未就緒

**解決方式**:

1. **增加等待時間**
   ```typescript
   // 在測試腳本中
   const maxWait = 300000;  // 從 120 秒增加到 300 秒
   ```

2. **確認系統資源充足**
   ```bash
   # 檢查記憶體使用
   free -h  # Linux
   Get-ComputerInfo | Select-Object CsPhysicallyInstalledMemory  # Windows
   ```
   
   Oracle DB 建議配置：
   - 記憶體：至少 2GB
   - CPU：至少 2 核心
   - 磁碟空間：至少 10GB

3. **檢查 Oracle DB 日誌**
   ```bash
   podman logs oracle-db-test | tail -100
   ```

4. **手動重啟**
   ```bash
   podman restart oracle-db-test
   ```

### 資料庫連線錯誤

**錯誤訊息**: `ORA-12541: TNS:no listener`

**解決方式**:

1. **檢查 Listener 狀態**
   ```bash
   podman exec oracle-db-test lsnrctl status
   ```

2. **重啟 Listener**
   ```bash
   podman exec oracle-db-test lsnrctl stop
   podman exec oracle-db-test lsnrctl start
   ```

3. **檢查連線字串**
   ```bash
   # 正確格式
   jdbc:oracle:thin:@localhost:1521/FREEPDB1
   
   # 錯誤格式（缺少 PDB 名稱）
   jdbc:oracle:thin:@localhost:1521
   ```

## Playwright 測試問題

### 元素找不到

**錯誤訊息**: `Error: locator.click: Timeout 30000ms exceeded`

**解決步驟**:

1. **檢查元素是否存在**
   ```typescript
   // 使用 Playwright Inspector
   await page.pause();
   ```

2. **增加等待時間**
   ```typescript
   await page.getByRole('button', { name: 'Submit' }).click({ timeout: 60000 });
   ```

3. **檢查元素是否被遮擋**
   ```typescript
   // 滾動到元素位置
   await page.getByRole('button', { name: 'Submit' }).scrollIntoViewIfNeeded();
   await page.getByRole('button', { name: 'Submit' }).click();
   ```

4. **使用更穩健的定位器**
   ```typescript
   // ❌ 脆弱
   await page.locator('.btn-primary').click();
   
   // ✅ 穩健
   await page.getByRole('button', { name: 'Submit' }).click();
   ```

### 測試不穩定（Flaky）

**症狀**: 測試有時通過，有時失敗

**常見原因與解決方式**:

1. **競態條件**
   ```typescript
   // ❌ 不穩定
   await page.click('button');
   await expect(page.locator('.result')).toBeVisible();
   
   // ✅ 穩定
   await page.click('button');
   await page.waitForResponse('**/api/submit');
   await expect(page.locator('.result')).toBeVisible();
   ```

2. **動畫干擾**
   ```typescript
   // 停用動畫
   export default defineConfig({
     use: {
       actionTimeout: 10000,
       navigationTimeout: 30000,
     },
   });
   ```

3. **網路延遲**
   ```typescript
   // 等待網路閒置
   await page.waitForLoadState('networkidle');
   ```

### 截圖或錄影失敗

**症狀**: 測試失敗但沒有生成截圖或錄影

**檢查配置**:

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    screenshot: 'only-on-failure',  // 確保已啟用
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
});
```

**檢查權限**:

```bash
# 確認輸出目錄可寫入
ls -la playwright-report/
ls -la test-results/
```

## 效能問題

### 測試執行緩慢

**優化建議**:

1. **增加並行執行數**
   ```typescript
   export default defineConfig({
     workers: 4,  // 根據 CPU 核心數調整
   });
   ```

2. **使用 storageState 避免重複登入**
   - 參考：[測試策略 - 全域登入狀態分享](./10-testing-strategies.md#全域登入狀態分享)

3. **減少不必要的等待**
   ```typescript
   // ❌ 固定等待
   await page.waitForTimeout(5000);
   
   // ✅ 條件等待
   await page.waitForLoadState('networkidle');
   ```

4. **停用不需要的功能**
   ```typescript
   export default defineConfig({
     use: {
       video: 'off',  // 本地開發時停用
       trace: 'off',
     },
   });
   ```

## 環境問題

### Node.js 版本不相容

**錯誤訊息**: `Error: The engine "node" is incompatible`

**解決方式**:

```bash
# 檢查 Node.js 版本
node --version

# 升級到 v18 或更高版本
# 使用 nvm (推薦)
nvm install 20
nvm use 20

# 或使用 fnm
fnm install 20
fnm use 20
```

### pnpm 指令找不到

**錯誤訊息**: `pnpm: command not found`

**解決方式**:

```bash
# 安裝 pnpm
npm install -g pnpm

# 或使用 corepack (Node.js 16.13+)
corepack enable
corepack prepare pnpm@latest --activate
```

## 取得協助

如果問題仍未解決：

1. **查看詳細日誌**
   ```bash
   # Playwright 詳細輸出
   DEBUG=pw:api pnpm playwright test
   
   # 容器日誌
   podman logs --tail 100 spring-boot-app-test
   podman logs --tail 100 oracle-db-test
   ```

2. **檢查相關文件**
   - [環境準備](./02-environment-setup.md)
   - [CI/CD 整合](./11-cicd-integration.md)
   - [測試策略](./10-testing-strategies.md)

3. **參考官方文件**
   - [Playwright 疑難排解](https://playwright.dev/docs/troubleshooting)
   - [Docker Compose 疑難排解](https://docs.docker.com/compose/troubleshooting/)

## 相關文件

- [環境準備](./02-environment-setup.md)
- [快速開始](./03-quick-start.md)
- [CI/CD 整合](./11-cicd-integration.md)
- [配置指南](./12-configuration-guide.md)