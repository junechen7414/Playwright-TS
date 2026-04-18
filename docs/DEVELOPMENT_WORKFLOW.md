# AI 與開發者協作流程 (AI & Developer Collaboration Workflow)

本專案鼓勵透過 AI 輔助產出測試腳本與實作程式碼。為了確保品質並符合專案架構，請遵循以下流程。

## 1. 任務啟動 (Task Initiation)

開發者應提供清晰的測試需求。例如：
> "實作一項 API 測試，驗證 Springboot 的 Account 更新功能。需要包含正向測試與負向測試（無效的 ID）。"

## 2. AI 實作階段 (AI Implementation Phase)

AI 應根據 `docs/ARCHITECTURAL_GUIDE.md` 自動完成以下工作：

1.  **實作定義 (Implementation)**:
    - 檢查 `services/apis/springboot-api-client.ts` 是否已有對應方法，若無則新增。
    - 確保 `schema/api-types.ts` 已有對應的 Request/Response 型別。
2.  **依賴注入 (Dependency Injection)**:
    - 檢查 `fixtures/springboot-api-objects.fixture.ts` 是否已正確導出對應的 Client。
3.  **撰寫劇本 (Spec Generation)**:
    - 在 `tests/api/springboot/` 產出 `.spec.ts` 檔案。

## 3. 人工介入檢查點 (Human Checkpoints)

在 AI 完成實作後，開發者應檢查以下事項：

-   **命名規範**: 方法與變數名稱是否符合業務邏輯？
-   **定位器準確性**: (UI 測試) AI 選用的定位器是否足夠穩健 (Robust)？
-   **斷言強度**: 測試是否確實驗證了關鍵欄位，而非僅驗證狀態碼 200？

## 4. 故障排除 (Troubleshooting)

若 AI 產出的程式碼執行失敗：

1.  **檢查型別**: 執行 `pnpm exec tsc` 查看是否有型別衝突。
2.  **日誌分析**: 檢視 Playwright Trace Viewer 以確認失敗點。
3.  **反饋修正**: 將錯誤訊息貼回給 AI，並要求其修正。

---

## 5. 指令參考 (Command Reference)

-   `pnpm test`: 執行所有測試
-   `pnpm exec playwright show-report`: 查看測試報告
-   `pnpm exec playwright codegen`: (輔助) 錄製 UI 操作以供 AI 參考
