# Git 工作流程

> 本文件說明分支策略與 Commit 訊息規範。開分支、建立 PR、加 label、rebase merge 與分支清理的完整步驟見 `/create-pr` skill（`.claude/skills/create-pr/SKILL.md`）。

## 分支策略：Trunk-based（main 小步快跑）

預設**直接在 `main` 上小步提交並推送**。CI/CD（GitHub Actions）在 push 到 `main` 與 PR 時都會執行檢查，所以「只是想跑測試」不需要開 PR。

- `main` 沒有 branch protection。若不小心把 `main` 推壞了，優先 **fix-forward**（補一個修正 commit）或 `git revert`。
- **只有高風險變更才開 branch 加 PR**，例如 CI workflow 本身的修改、大型功能、跨模組重構、依賴大版本升級。也就是任何你希望 CI 在進入 `main` 之前先驗證，或需要他人 review 的變更。
- 推送前請先在本機確認測試通過（green locally = green in CI）。

## 合併方式：一律 rebase merge

本 repo 與上游 `SpringBoot` 統一使用 rebase merge，GitHub 設定只開放「Allow rebase merging」。

- 相對 merge commit：不會多出 `Merge pull request #NN from …` 這種除了 PR 編號外沒有資訊的 subject，`main` 保持線性。
- 相對 squash：不會把 PR 內多個各自有意義、各自可 revert 的 commit 壓成一顆。歷史 commit 標題中的 `(#NN)` 後綴，是過去採用 squash 時留下的。

## Commit 訊息規範

遵循 **Conventional Commits**：`<type>(<scope>): <subject>`

| Type | 說明 | 範例 |
|------|------|------|
| `feat` | 新功能 | `feat(auth): add login functionality` |
| `fix` | 錯誤修復 | `fix(cart): resolve checkout calculation error` |
| `docs` | 文件更新 | `docs(readme): update installation guide` |
| `style` | 程式碼格式 | `style: format code with biome` |
| `refactor` | 重構 | `refactor(pages): simplify page object structure` |
| `test` | 測試 | `test(api): add product API tests` |
| `chore` | 雜項 | `chore: update dependencies` |

撰寫原則：

- 使用祈使句（`add`，而非 `added`）
- 第一個字母小寫
- 結尾不加句號
- 說明「做了什麼」；「為什麼」寫在 commit body
