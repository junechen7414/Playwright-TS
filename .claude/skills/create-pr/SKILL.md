---
name: create-pr
description: 為高風險變更開分支、建立 PR、加 label，並以 rebase merge 合併與清理分支。
disable-model-invocation: true
argument-hint: [變更簡述]
---
# 建立 PR（create-pr）

只用於高風險變更：CI workflow 修改、大型功能、跨模組重構、依賴大版本升級。日常小改直接 commit 到 `main`（見 AGENTS.md「Git 工作流程」）。

## 1. 開分支

從最新的 `main` 切出：`<類別>/<任務簡述>`，全小寫、以 `-` 分隔單字。

類別：`feature/`、`bugfix/`、`hotfix/`、`refactor/`、`docs/`、`test/`、`chore/`。例：`refactor/improve-page-objects`。

## 2. Commit 並推送

- Commit 遵循 Conventional Commits（`<type>(<scope>): <subject>`），規則見 [`docs/agents/05-git-workflow.md`](../../../docs/agents/05-git-workflow.md)。
- 推送前先在本機跑過對應的測試 project，確認通過（green locally = green in CI）。

## 3. 建立 PR

- **標題**：Conventional Commits 格式，例如 `feat(auth): add login functionality`。
- **描述**寫這三件事：
  - 變更的目的與背景
  - 主要改動
  - 相關 issue（`Closes #123`）與破壞性變更（`BREAKING CHANGE`）
- 檔案列表、測試結果、程式碼細節由 GitHub 與 CI 呈現，描述裡不需重複。
- 工具：GitHub MCP 的 `create_pull_request`，或 `gh pr create --label ...`。

## 4. 加 label（1–2 個最相關的）

先查 repo 現有 label，只用已存在的：GitHub MCP 沒有建立 label 的工具。查詢方式：`gh label list`，或 `https://api.github.com/repos/junechen7414/Playwright-TS/labels`。

| 變更類型 | Label |
|---|---|
| 文件 | `documentation` |
| 新功能 | `enhancement` |
| 錯誤修復 | `bugfix` |
| 重構 | `refactor` |
| 測試 | `e2e-test` |
| 依賴更新 | `dependencies` |
| 設定檔 | `config` |
| 破壞性變更 | `breaking-change` |
| 建置／工具／CI | `chore` |

用 GitHub MCP 加 label 的方式：
- `create_pull_request` / `update_pull_request` 沒有 labels 欄位，改用 `issue_write`（`method: "update"`、`issue_number` 填 **PR 號**、`labels: [...]`），因為 PR 在 API 中也是 issue。
- 查 PR 目前的 labels 用 `pull_request_read`；`get_labels` 只適用純 issue，傳 PR 號會回 `Could not resolve to an Issue`。

## 5. 合併：一律 rebase merge

本 repo 與上游 `SpringBoot` 統一用 rebase merge，main 保持線性，PR 內各自有意義的 commit 也保留下來。合併時明確指定方式，並帶上 `expectedHeadSha`：

```
merge_pull_request(pullNumber: <PR 號>, merge_method: "rebase", expectedHeadSha: "<分支 HEAD 全長 SHA>")
```

`expectedHeadSha` 讓「檢查完 PR 之後才被推上來的 commit」導致合併失敗，避免靜默合併掉沒看過的內容。

合併前先向使用者確認，這是對外操作。

## 6. 清理分支

確認 PR 已合併後：切回 `main` 並 pull，用 `git branch -d <branch>` 安全刪除本地分支；若遠端分支仍在，執行 `git push origin --delete <branch>`。
