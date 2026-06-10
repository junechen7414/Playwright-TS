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

## 相關文件

- [開發規範](./04-development-standards.md)
- [程式設計原則](./06-coding-principles.md)