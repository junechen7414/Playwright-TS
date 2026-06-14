# AGENTS.md

This file provides guidance to agents when working with code in this repository.

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
9. **遵循 Git 工作流程**: 必須在適當的 feature 分支上進行開發（參考 [@Git 工作流程](docs/agents/05-git-workflow.md)）

---

**最後更新**: 2026-06-14  
**Playwright 版本**: 1.57.0
