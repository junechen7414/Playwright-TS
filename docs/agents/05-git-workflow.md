# Git 工作流程

> 本文件說明 Git 分支命名與 Commit 訊息規範

## 分支命名規範

### 格式

```
類別/任務簡述
```

### 常用前綴

- `feature/` - 新功能開發
- `bugfix/` - 錯誤修復
- `hotfix/` - 緊急修復
- `refactor/` - 程式碼重構
- `docs/` - 文件更新
- `test/` - 測試相關

### 命名規則

- ✅ 全小寫
- ✅ 使用 `-` 分隔單字
- ✅ 使用 `/` 分層
- ❌ 避免使用空格或特殊字元

### 範例

```bash
feature/add-login-page
bugfix/fix-checkout-error
refactor/improve-page-objects
docs/update-readme
```

## Commit 訊息規範

遵循 **Conventional Commits** 規範。

### 格式

```
<type>(<scope>): <subject>
```

### 常用類型

| Type | 說明 | 範例 |
|------|------|------|
| `feat` | 新功能 | `feat(auth): add login functionality` |
| `fix` | 錯誤修復 | `fix(cart): resolve checkout calculation error` |
| `docs` | 文件更新 | `docs(readme): update installation guide` |
| `style` | 程式碼格式 | `style: format code with biome` |
| `refactor` | 重構 | `refactor(pages): simplify page object structure` |
| `test` | 測試 | `test(api): add product API tests` |
| `chore` | 雜項 | `chore: update dependencies` |

### 撰寫原則

- ✅ 使用祈使句（如 `add` 而非 `added`）
- ✅ 第一個字母小寫
- ✅ 不要在結尾加句號
- ✅ 簡潔明瞭，說明「做了什麼」而非「為什麼」

### 範例

```bash
# 好的範例
feat(login): add remember me checkbox
fix(api): handle timeout error correctly
docs(agents): split into modular files

# 避免的範例
Added login feature  # 非祈使句
Fix bug.  # 不夠具體
updated readme  # 缺少 type
```

## 工作流程建議

1. 從 `main` 分支創建新分支
2. 進行開發並定期 commit
3. 推送到遠端並創建 Pull Request
4. 通過 CI/CD 檢查後合併
5. 合併後清理本地和遠端分支

## 分支清理

### 合併後的清理流程

當 Pull Request 被合併到 `main` 後，應該清理本地和遠端的 feature 分支。

### PowerShell 指令

PowerShell 使用分號 (`;`) 來串接多個指令：

```powershell
# 切換回 main 分支並更新
git checkout main; git pull

# 刪除本地分支
git branch -d <branch-name>

# 刪除遠端分支（如果需要）
git push origin --delete <branch-name>
```

**完整範例**：

```powershell
# 假設要清理 feature/add-login-page 分支
git checkout main; git pull; git branch -d feature/add-login-page

# 如果遠端分支還存在，也一併刪除
git push origin --delete feature/add-login-page
```

### CMD 指令

CMD 使用 `&&` 來串接多個指令：

```cmd
REM 切換回 main 分支並更新
git checkout main && git pull

REM 刪除本地分支
git branch -d <branch-name>

REM 刪除遠端分支（如果需要）
git push origin --delete <branch-name>
```

**完整範例**：

```cmd
REM 假設要清理 feature/add-login-page 分支
git checkout main && git pull && git branch -d feature/add-login-page

REM 如果遠端分支還存在，也一併刪除
git push origin --delete feature/add-login-page
```

### 清理注意事項

- ✅ 確認 PR 已經合併後再刪除分支
- ✅ 使用 `-d` 參數（小寫）進行安全刪除，如果分支未合併會提示警告
- ✅ 如果確定要強制刪除未合併的分支，使用 `-D` 參數（大寫）
- ⚠️ 刪除遠端分支前，確認其他團隊成員不再需要該分支

## 查詢 GitHub Labels

在建立 PR 時需要選擇正確的 label。可透過 PowerShell 查詢目前 repo 上的所有 labels：

```powershell
# 查詢 GitHub repo 的 labels（PowerShell）
(Invoke-RestMethod -Uri "https://api.github.com/repos/junechen7414/Playwright/labels").name
```

**目前可用的 Labels：**

| Label | 用途 |
|-------|------|
| `breaking-change` | API 或行為的破壞性變更 |
| `bugfix` | 修復程式錯誤 |
| `chore` | 建置/工具/CI 配置調整 |
| `config` | 設定檔變更 |
| `dependencies` | 依賴版本更新 |
| `documentation` | 文件更新 |
| `e2e-test` | E2E 測試相關 |
| `enhancement` | 功能增強 |
| `refactor` | 程式碼重構 |
| `test` | 測試相關 |

**Agent 建議流程**：建立 PR 時應根據改動性質選擇 1-2 個最相關的 labels。

## 相關文件

- [開發規範](./04-development-standards.md)
- [程式設計原則](./06-coding-principles.md)