# 環境準備

> 本文件說明如何設定開發與測試環境

## 安裝步驟

### 1. 安裝依賴

```bash
pnpm install
```

### 2. 設定環境變數

複製 `.env.example` 並修改為 `.env`：

```bash
cp .env.example .env
```

### 3. 啟動測試環境

啟動 Spring Boot + Oracle DB 測試環境：

```bash
pnpm run compose-up
```

## 環境需求

- **Node.js**: v18 或更高版本
- **pnpm**: 最新版本
- **Podman/Docker**: 用於容器管理
- **作業系統**: Windows、macOS 或 Linux

## 驗證環境

確認環境設定正確：

```bash
# 檢查容器狀態
podman ps

# 檢查 Spring Boot 健康狀態
curl http://localhost:8787/actuator/health
```

## 相關文件

- [專案概述](./01-project-overview.md)
- [快速開始](./03-quick-start.md)
- [疑難排解](./14-troubleshooting.md)