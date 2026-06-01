# 開發規範

> 本文件說明專案的語言、工具與 Shell 指令執行規範

## 語言偏好

- **主要語言**: 繁體中文（正體中文）
- **次要語言**: 英文（僅在技術術語更清晰時使用）
- **禁止**: 簡體中文

## 工具偏好

- **容器管理**: 使用 `podman`，不使用 `docker`
- **套件管理**: 使用 `pnpm`，禁止使用 `npm` 或 `yarn`

## Shell 指令執行規範

執行 CLI 指令前，必須先偵測當前使用的 Shell 環境（PowerShell 或 CMD），並根據環境調整指令語法：

### Shell 差異對照表

| 差異項目 | PowerShell (`pwsh`) | CMD (`cmd.exe`) |
|---------|-------------------|-----------------|
| 指令串接 | 使用 `;` 分隔 | 使用 `&&` 分隔 |
| 執行當前目錄腳本 | `./gradlew` | `gradlew` (或 `.\gradlew`) |
| 環境變數引用 | `$env:VAR_NAME` | `%VAR_NAME%` |
| 路徑分隔 | 支援 `/` 和 `\` | 建議使用 `\` |

### 範例對照

**PowerShell**:
```powershell
cd src; ./gradlew test
```

**CMD**:
```cmd
cd src && gradlew test
```

### 重要原則

- ❌ 不可假設預設 Shell，須透過環境資訊判斷
- ✅ 指令語法必須與當前 Shell 相容，避免跨 Shell 語法混用
- ✅ 優先使用 PowerShell 語法（本專案主要開發環境）

## 程式碼風格

- 使用 Biome 進行程式碼格式化與 Linting
- 執行 `pnpm run biome:fix` 自動修復格式問題
- 遵循 TypeScript 嚴格模式規範

## 相關文件

- [Git 工作流程](./05-git-workflow.md)
- [程式設計原則](./06-coding-principles.md)
- [快速開始](./03-quick-start.md)