# Git 工作流程

> 本文件說明分支策略、Commit 訊息規範與本機 AI／Git hooks 維護。開分支、建立 PR、加 label、rebase merge 與分支清理的完整步驟見 `/create-pr` skill（`.claude/skills/create-pr/SKILL.md`）。

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

## AI 指引與本機 hooks 維護

`AGENTS.md` 是共用規範的單一來源；`.github/instructions/Global.instructions.md` 以 `applyTo: '**'` 套用並用 Markdown 連結引用它。修改入口後，核對 YAML frontmatter、連結目標與適用範圍，不另維護一份規範副本。

- **Skills**：版控只隨附 `.claude/skills/` 的 `ci-triage`、`create-pr`、`env-troubleshoot`。其他個人外掛是否存在，以當次 session 的能力清單為準；沒有設定某工具不代表專案缺件。`argument-hint` 是字串，像 `'[變更簡述]'` 這種帶中括號的提示須加引號，避免 YAML 解析成陣列。
- **MCP**：`.mcp.json` 保留既有 GitHub HTTP server，不為了讓不同工具看起來一致而新增 server。只用白名單 parser 比對 server／transport 與 env、header 名稱，不輸出 URL、認證值或 payload，也不以連線、安裝或登入驗證設定。
- **本機安裝**：整個 `.bob/` 與 `.claude/settings.local.json` 都被 ignore，不隨 commit／clone 傳遞。第三方 skill 內的 `npx`／`bunx` 範例與溝通模式，不覆寫本 repo 的繁體中文、`pnpm`、`podman` 與授權邊界。其引用的其他 skills／CLI 不保證隨安裝提供，先核對實際能力，缺少時回到本 repo 流程，不猜名稱或擅自安裝，也不直接改寫或刪除 skill packages。
- **Agents／modes**：不同工具的 skill 內附 agent 範本不等於已啟用的專案 agent／mode。僅核對實際入口與引用；遇到跨 repo 的 symlink／junction／共用 target，只回報，不跟隨修改。
- **兩種 hooks 不同**：`.claude/settings.json` 綁定的 `.claude/hooks/block-dangerous-git.mjs` 是 Claude `PreToolUse` guard，不等於 Git lifecycle hook，也不會替 Git 自行觸發的 `post-commit` 限制遠端同步。保留既有 guard，不因補 Git hook 而放寬它。

### Bob notes 遠端同步須明確 opt-in

先以唯讀指令確認有效路徑，不假設一定使用 `.git/hooks`：

```bash
git config --show-origin --show-scope --get-all core.hooksPath
git rev-parse --path-format=absolute --git-path hooks/post-commit
```

第一個指令沒有輸出且 exit code 為 `1`，表示該設定未指定。有效 Bob `post-commit` 的 `sync_notes_with_remote()` 必須以此 gate 開頭，放在 remote discovery 之前，**不是放在整個 hook 最前面**：

```bash
sync_notes_with_remote() {
    # 僅在明確 opt-in 時同步；預設只保留本機 notes，不偵測遠端。
    if [ "${BOB_NOTES_REMOTE_SYNC:-}" != "1" ]; then
        return 0
    fi
    # 以下保留既有同步實作
}
```

如此未設定或設為 `0` 時，本機 matching notes 的附加與 pending 整理仍保留，但不會進入 `remote get-url`、`ls-remote`、push dry-run、fetch 或 push。既有程式會附加整行 matching JSONL；這只是程式行為，不能據此推定真實 notes 含敏感內容或曾發布。本維護流程不讀取真 notes／transcripts／logs、不改 notes 歷史、不設定 opt-in，也不執行遠端同步。

**有效 `.git/hooks/post-commit` 是 ignored／未追蹤的 machine-local 安裝檔**（位於 Git 中繼資料，不是 repo 原始碼），commit／clone 不會帶走此修正。Bob 重裝或更新 hooks、或 `core.hooksPath` 改變後，須重新檢查有效檔案；tracked 測試與文件不會自動安裝 gate。其他 Bob hooks 的本機 pending 整理流程保持不變；不要為了測試而切分支或直接執行真 hook，避免觸發它們。

### 離線驗證

先檢查安裝檔內容，再執行：

```bash
python -I -X utf8 scripts/test-bob-notes-hook.py
git diff --check
```

測試僅用 Python stdlib、Bash 與現有文字處理工具，不安裝套件。它以 `TemporaryDirectory` 建立 hook 副本、合成 pending JSONL 與 stub Git；PATH 不包含真 Git，所有未允許的 Git 呼叫都記錄並拒絕，不執行真 `init`／`commit`／remote commands。腳本比對已人工稽核的 hook 指紋；安裝內容有變時先停止，再人工檢查是否仍只有已知行為，不可直接更新指紋略過檢查。

必要矩陣是 pending 缺少／空／無 matching／有 matching，各乘上 opt-in 未設／`0`，共 **8 案**，並斷言本機 notes 與未提交 pending 保留。另僅在合成子行程設為 `1`，確認會到達 stub 的拒絕點；再於副本移除 gate，確認能偵測 remote discovery 回歸。兩個探針均不接觸真遠端，也不設定本機 shell 的 opt-in。缺少本機 hook、Bash／必要工具，或有效路徑跨出 workspace／經過連結時，明確回報 `SKIP` 並以 exit code `2` 結束；**skip 不算安全通過**。這不是執行任意未知 hook 的沙箱，也不驗證真實遠端、權限或 opt-in 後的 fetch／push 結果。

本段只涵蓋 AI 設定／hooks；未改 UI 或 API 時，不為這項維護啟動容器、app、MCP 或瀏覽器。修改到測試服務或案例時，仍須遵守 `AGENTS.md` 的對應 E2E 完成條件。
