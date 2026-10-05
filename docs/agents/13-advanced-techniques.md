# 進階技巧

> 本文件說明 API 型別產生的機制，以及 CI job summary 中 spec 差異提示的讀法

## API 型別產生

使用 `openapi-typescript` 從 Swagger 自動生成型別定義，確保 API 呼叫的型別安全。

### 生成型別定義

```bash
pnpm run api-spec:update
```

這個指令會：
1. 從 `http://localhost:8787/v3/api-docs` 取得 Swagger 規格（存成 `docs/swagger.live.json`，不入版控）
2. 生成 TypeScript 型別定義
3. 儲存到 `services/schema/api-types.ts`

因此執行前需要先 `pnpm run compose-up` 把後端容器帶起來。沒有容器可用時，改跑
`pnpm run api-spec:update:file`，它讀版控裡的 `docs/swagger.json` 快照。

### 為什麼從容器抓，而不是直接讀 docs/swagger.json

`docs/swagger.json` 是上游 SpringBoot repo 的 CI 推過來的**快照**，它必然落後被測 image：
上游 workflow 是在 build-and-push job 裡就 dispatch 本 repo 的 E2E，而同步 swagger 是**後續**
的 job，所以 E2E 開跑時 checkout 到的還是上一版 spec。手動 `workflow_dispatch` 指定舊 image
時錯配更明顯——檔案永遠是 main 最新的，image 卻是舊的。

規格的正確來源是**被測的那個 artifact 自己**：image 吐出來的 `/v3/api-docs` 定義上就同步，
四種觸發路徑（`repository_dispatch` / `workflow_dispatch` / 本 repo push `main` / PR 貼標籤）一次全對。`docs/swagger.json`
則保留為 API 變更的可讀記錄（在本 repo 看得到後端何時改了什麼），CI 會比對兩者並在
job summary 提示落差，但不阻擋測試。

### 怎麼讀 job summary 的「快照與 live spec 有差異」

**這個提示絕大多數時候是預期行為，不是故障。** 它比的是「**上一次**上游 push 留下的快照」對
「**這次**被測 image 的 live spec」，所以它真正的語意是「上游這次改了 API 契約」，而不是
「快照壞了」。實測時間軸（2026-08-13，上游 `b09b76a`）：

| UTC | 事件 |
|---|---|
| 11:52:36 | 本 workflow 被 dispatch、checkout → 拿到的是 8/07 的舊快照 |
| 11:53:39 | 上游 `generate-docs` 才把新的 `docs/swagger.json` 推進本 repo（**慢 63 秒**） |

成因在上游 `image-publish.yml` 的 job 依賴：dispatch 是 `build-and-push` 的**最後一步**，而同步
快照的 `generate-docs` 是 `needs: build-and-push` —— 順序上永遠追不上。因此四種觸發各有各的讀法：

| 觸發 | 差異的意義 | 該做什麼 |
|---|---|---|
| 上游 push `main`（`repository_dispatch`，payload `event_name=push`） | 這次 push 改了 API 契約，差異即變更內容；快照晚約 60 秒補上 | 什麼都不用做，下次自動觸發會是 ✅ |
| 上游 PR 貼標籤（`repository_dispatch`，payload 非 `push`） | 上游 `generate-docs` 只在 push `main` 跑，這個 image **永遠不會**有對應快照 | 什麼都不用做，差異到該 PR 合併才消失 |
| `workflow_dispatch` / 本 repo push `main` / 本 repo PR 貼標籤 | 快照對應上游最新 `main`，image 由 tag 指定（push `main` 固定為 `latest`），兩者無版本關聯 | 差異僅供參考 |

**唯一該追的異常**：連續多次「上游 push `main`」觸發都出現**相同**差異 —— 那代表上游
`generate-docs` job 沒把快照推過來（例如 token 過期、job 失敗），去查上游 run。

也因為這個提示的常態是「有差異」，它刻意**不用 ⚠️**：拿警示符號標一件每次改 API 都會發生的事，
只會訓練所有人跳過它，等到真的該看時已經沒人看了。

### 在 API client 中使用

`api-types.ts` 匯出 `paths`、`components`、`operations`。端點路徑沒有 `/api` 前綴（例如 `/account`、`/product/{id}`、`/order/account/{accountId}`），
且回應的 content type 是 `"*/*"` 而非 `application/json`，所以專案不從 `paths[...]` 層層取回應型別，而是直接引用
`components['schemas']`：

```typescript
// services/apis/springboot-api-client.ts（節錄）
import type { APIRequestContext } from '@playwright/test';
import type { components } from '@schema/api-types';
import { ApiRequester, type ApiResult, type CreatedResponse } from './base-api-client';

type Schemas = components['schemas'];

export class SpringbootApiClient {
	private readonly requester: ApiRequester; // 組合而非繼承
	constructor(request: APIRequestContext) {
		this.requester = new ApiRequester(request);
	}

	getAccount(id: number): Promise<ApiResult<Schemas['GetAccountDetailResponse']>> {
		return this.requester.get<Schemas['GetAccountDetailResponse']>(`account/${id}`);
	}
}
```

- URL 是相對路徑（無開頭 `/`），由 `springboot-api` project 的 `baseURL` 補上。
- `ApiRequester` 不丟例外，一律回傳 `ApiResult<T>`（`status` / `data` / `raw`）；204 或純文字回應會轉成字串或數字。斷言交給 `expectOk`、`expectCreated`（驗 201 + `Location`）、`expectError`（驗 RFC 9457 錯誤格式與 `code`）。
- 測試資料 payload 也用同一組型別（`services/fixtures/springboot-test-data.fixture.ts` 的 `components['schemas']['CreateAccountRequest']` 等），上游改了契約，重新產生型別後 `tsc` / IDE 就會指出要改的地方。
- 不要手改 `api-types.ts`；需要手寫的共用型別放 `services/schema/common-types.ts`。

## 相關文件

- [`AGENTS.md`](../../AGENTS.md)
- [測試策略](./10-testing-strategies.md)
- [CI/CD 整合](./11-cicd-integration.md)
