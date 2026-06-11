# AGENTS.md

This file provides guidance to agents when working with code in this repository.

---

## 📚 文件導覽

本文件已模組化，請參考以下分類文件：

### 🚀 專案基礎

- **[@專案概述](docs/agents/01-project-overview.md)** - 專案簡介、技術棧與架構原則
- **[@環境準備](docs/agents/02-environment-setup.md)** - 開發環境設定與安裝步驟
- **[@快速開始](docs/agents/03-quick-start.md)** - 測試執行與常用腳本說明

### 📋 開發規範

- **[@開發規範](docs/agents/04-development-standards.md)** - 語言偏好、工具選擇與 Shell 指令規範
- **[@Git 工作流程](docs/agents/05-git-workflow.md)** - 分支命名與 Commit 訊息規範
- **[@程式設計原則](docs/agents/06-coding-principles.md)** - 核心程式設計理念與最佳實踐

### 🏗️ 架構設計

- **[@架構概覽](docs/agents/07-architecture-overview.md)** - 目錄結構與組織方式
- **[@測試架構](docs/agents/08-test-architecture.md)** - Custom Fixtures 與 Page Object Model 設計
- **[@元素定位策略](docs/agents/09-locator-strategies.md)** - Playwright 元素定位最佳實踐

### 🧪 測試與部署

- **[@測試策略](docs/agents/10-testing-strategies.md)** - 資料清理策略與全域登入狀態管理
- **[@CI/CD 整合](docs/agents/11-cicd-integration.md)** - GitHub Actions 與 Docker Compose 配置
- **[@配置指南](docs/agents/12-configuration-guide.md)** - Playwright 與 TypeScript 配置說明

### 🔧 維運支援

- **[@進階技巧](docs/agents/13-advanced-techniques.md)** - API 型別安全、網路攔截與進階功能
- **[@疑難排解](docs/agents/14-troubleshooting.md)** - 常見問題與解決方案
- **[@專案現代化分析](docs/project-modernization-analysis.md)** - 現代化分析報告
- **[@專案現代化進度](docs/project-modernization-progress.md)** - 實施進度追蹤

---

## 相關文件

- [筆記.md](./筆記.md) - 詳細的開發指南和最佳實踐
- [docs/testing/e2e-cleanup-strategy.md](./docs/testing/e2e-cleanup-strategy.md) - 測試資料清理策略
- [.github/instructions/Global.instructions.md](./.github/instructions/Global.instructions.md) - 開發規範
- [Playwright 官方文件](https://playwright.dev/docs/intro)
- [Docker Compose 文件](https://docs.docker.com/compose/)

## 重要提醒

1. **不要使用 `npm` 或 `yarn`**: 本專案統一使用 `pnpm`
2. **不要使用 `docker`**: 本專案統一使用 `podman`
3. **遵循 Business-Layer POM**: 測試應該讀起來像商業流程
4. **使用 Custom Fixtures**: 避免在測試中重複初始化邏輯
5. **優先使用 `getByRole`**: 最穩健的元素定位方式
6. **容器重啟策略**: 確保測試隔離性和可重複性
7. **繁體中文優先**: 所有註解和文件使用繁體中文
8. **持續改進文件**: 發現可改進的 instruction 時，應主動提出並更新相關文件
9. **遵循 Git 工作流程**:
   - 必須在適當的 feature 分支上進行開發（參考 [@Git 工作流程](docs/agents/05-git-workflow.md)）
   - 推送後需清理本地和遠端分支（合併後刪除 feature 分支）
   - 使用 `git checkout main && git pull && git branch -d <branch-name>` 清理本地分支
   - 使用 `git push origin --delete <branch-name>` 清理遠端分支（如需要）

---

**最後更新**: 2026-06-01  
**專案版本**: 1.0.0  
**Playwright 版本**: 1.57.0
