// PreToolUse hook：攔截破壞性 git 指令（改寫自 mattpocock-skills 的 git-guardrails-claude-code）。
// 本專案採 trunk-based，一般 `git push` 刻意放行；只擋會改寫歷史或丟棄工作的指令。
// 以 Node 實作而非 bash + jq，因為 Windows 開發環境未必有 jq。

const DANGEROUS_PATTERNS = [
	{ pattern: /\bgit\b.*\bpush\b.*(\s--force(-with-lease)?\b|\s-f\b)/, label: 'git push --force' },
	{ pattern: /\bgit\b.*\breset\b.*\s--hard\b/, label: 'git reset --hard' },
	{ pattern: /\bgit\b.*\bclean\b.*\s-[a-zA-Z]*f/, label: 'git clean -f' },
	{ pattern: /\bgit\b.*\bbranch\b.*\s-D\b/, label: 'git branch -D' },
	{ pattern: /\bgit\b.*\bcheckout\b(\s+--)?\s+\.(\s|$)/, label: 'git checkout .' },
	{ pattern: /\bgit\b.*\brestore\b.*\s\.(\s|$)/, label: 'git restore .' },
];

let input = '';
for await (const chunk of process.stdin) input += chunk;

const command = JSON.parse(input || '{}').tool_input?.command ?? '';
// 以 ; && || | 與換行切成子指令，避免 `git status && rm` 之類的組合讓 .* 跨指令誤判
const segments = command.split(/;|&&|\|\||\||\n/);

for (const segment of segments) {
	const hit = DANGEROUS_PATTERNS.find(({ pattern }) => pattern.test(segment));
	if (hit) {
		console.error(
			`BLOCKED: '${segment.trim()}' 符合破壞性指令 '${hit.label}'。使用者已禁止 agent 執行此類指令，請改請使用者手動處理。`,
		);
		process.exit(2);
	}
}

process.exit(0);
