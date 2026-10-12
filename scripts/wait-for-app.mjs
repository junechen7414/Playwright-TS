// 等 Spring Boot app 就緒再往下跑。
//
// `compose-up -d` 只等到 DB healthy（depends_on），app 容器一啟動就回傳，
// 但 Spring Boot 本身還要幾十秒才開始接請求。本機的 podman 沒有套用 image 的
// HEALTHCHECK，無法像 CI 一樣用 `compose up --wait` 等，所以改由這裡輪詢 actuator。
//
// 環境變數：
//   APP_HEALTH_URL      預設 http://localhost:8787/actuator/health
//   APP_WAIT_TIMEOUT_S  預設 180（秒）

const url = process.env.APP_HEALTH_URL ?? 'http://localhost:8787/actuator/health';
const timeoutMs = Number(process.env.APP_WAIT_TIMEOUT_S ?? 180) * 1000;
const intervalMs = 2000;

const startedAt = Date.now();
let lastError = '';
let ready = false;

// 不用 process.exit()：Windows 上 fetch 的 keep-alive 連線還在關閉時強制結束，
// 會觸發 libuv 的 UV_HANDLE_CLOSING assertion，改設 exitCode 讓程序自然結束。
while (!ready && Date.now() - startedAt < timeoutMs) {
	try {
		const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
		const body = await res.json().catch(() => ({}));
		if (res.ok && body.status === 'UP') {
			const waited = Math.round((Date.now() - startedAt) / 1000);
			console.log(`app 已就緒（等待 ${waited}s）：${url}`);
			ready = true;
			break;
		}
		lastError = `HTTP ${res.status}，status=${body.status ?? '未知'}`;
	} catch (error) {
		lastError = error instanceof Error ? (error.cause?.code ?? error.message) : String(error);
	}
	await new Promise((resolve) => setTimeout(resolve, intervalMs));
}

if (!ready) {
	console.error(`app 在 ${timeoutMs / 1000}s 內未就緒：${url}（最後一次：${lastError}）`);
	console.error('可用 `podman logs --tail 100 spring-boot-app-test` 查看原因');
	process.exitCode = 1;
}
