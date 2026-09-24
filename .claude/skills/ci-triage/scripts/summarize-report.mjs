#!/usr/bin/env node
// 解析 CI 上傳的 playwright-report artifact，列出失敗測試的摘要
//
// 用法：node summarize-report.mjs <artifact.zip 或已解壓的目錄>
//
// 兩個 workflow 的 artifact 名稱都是 playwright-report，但內容結構不同：
// - demo.yml（UI）：根目錄就是 HTML report（index.html + data/）
// - springboot.yml（API）：playwright-report/ + docs/swagger.live.json + spec-drift.diff
//
// HTML report 的測試結果以 base64 zip 內嵌在 index.html 中，需再解一層才拿得到 JSON。

import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const MAX_ERROR_CHARS = 1500;

const input = process.argv[2];
if (!input) {
	console.error('用法：node summarize-report.mjs <artifact.zip 或已解壓的目錄>');
	process.exit(1);
}

/** 依序嘗試可用的解壓工具（Git Bash 的 GNU tar 不支援 zip，Windows 內建的 tar.exe 可以） */
function unzip(zipPath, destDir) {
	const attempts = [
		['unzip', ['-q', '-o', zipPath, '-d', destDir]],
		['tar', ['-xf', zipPath, '-C', destDir]],
		[
			'powershell',
			[
				'-NoProfile',
				'-Command',
				`Expand-Archive -LiteralPath '${zipPath}' -DestinationPath '${destDir}' -Force`,
			],
		],
	];
	for (const [cmd, args] of attempts) {
		try {
			execFileSync(cmd, args, { stdio: 'ignore' });
			return;
		} catch {
			// 換下一個工具
		}
	}
	throw new Error(`無法解壓 ${zipPath}（unzip / tar / Expand-Archive 皆失敗）`);
}

// 錯誤訊息帶有終端機色碼（ESC[...m），以 String.fromCharCode 組 regex 避開 Biome 的控制字元規則
const ANSI_PATTERN = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g');
const stripAnsi = (s) => s.replace(ANSI_PATTERN, '');

// 1. 取得 artifact 根目錄
let root = resolve(input);
if (statSync(root).isFile()) {
	const dest = mkdtempSync(join(tmpdir(), 'ci-triage-'));
	unzip(root, dest);
	root = dest;
}

// 2. 找出 HTML report 位置並判斷 artifact 類型
const reportDir = [root, join(root, 'playwright-report')].find((d) =>
	existsSync(join(d, 'index.html')),
);
if (!reportDir) {
	console.error(`在 ${root} 找不到 index.html —— 這可能不是 playwright-report artifact`);
	process.exit(1);
}
const liveSpec = join(root, 'docs', 'swagger.live.json');
const specDrift = join(root, 'spec-drift.diff');

// 3. 解出內嵌在 index.html 的 report zip
const html = readFileSync(join(reportDir, 'index.html'), 'utf8');
const match = html.match(
	/<script id="playwrightReportBase64"[^>]*>data:application\/zip;base64,([^<]+)<\/script>/,
);
if (!match) {
	console.error('index.html 中沒有內嵌的 report 資料（playwrightReportBase64）');
	process.exit(1);
}
const jsonDir = mkdtempSync(join(tmpdir(), 'ci-triage-json-'));
const embeddedZip = join(jsonDir, 'report.zip');
writeFileSync(embeddedZip, Buffer.from(match[1].replace(/\s/g, ''), 'base64'));
unzip(embeddedZip, jsonDir);

const readJson = (name) => JSON.parse(readFileSync(join(jsonDir, name), 'utf8'));
const report = readJson('report.json');

// 4. 輸出摘要
const ci = report.metadata?.ci ?? {};
console.log('## Artifact');
console.log(`- 根目錄：${root}`);
console.log(`- Report：${reportDir}`);
console.log(`- Commit：${ci.commitHash ?? '(未知)'}`);
console.log(`- Run：${ci.buildHref ?? '(未知)'}`);
console.log(`- 統計：${JSON.stringify(report.stats)}`);
if (existsSync(liveSpec)) {
	console.log(`- 被測 image 的 live spec：${liveSpec}`);
}
if (existsSync(specDrift)) {
	const size = statSync(specDrift).size;
	console.log(`- 快照與 live spec 差異：${size === 0 ? '無' : `${specDrift}（${size} bytes）`}`);
}

const buckets = { unexpected: [], flaky: [] };
for (const file of report.files) {
	const detail = readJson(`${file.fileId}.json`);
	for (const test of detail.tests) {
		if (test.outcome in buckets) buckets[test.outcome].push({ fileName: file.fileName, test });
	}
}

console.log(`\n## 失敗（${buckets.unexpected.length}）`);
for (const { fileName, test } of buckets.unexpected) {
	// 取最後一次重試的結果，錯誤與附件最完整
	const result = test.results[test.results.length - 1];
	const titlePath = [...(test.path ?? []), test.title].join(' › ');
	console.log(`\n### [${test.projectName}] ${fileName}:${test.location?.line} › ${titlePath}`);
	console.log(`- 重試次數：${test.results.length - 1}`);
	for (const att of result.attachments ?? []) {
		if (att.path)
			console.log(`- 附件 ${att.name}（${att.contentType}）：${join(reportDir, att.path)}`);
	}
	for (const err of result.errors ?? []) {
		const msg = stripAnsi(err.message ?? '');
		console.log('```');
		console.log(
			msg.length > MAX_ERROR_CHARS ? `${msg.slice(0, MAX_ERROR_CHARS)}\n…（已截斷）` : msg,
		);
		console.log('```');
	}
}

if (buckets.flaky.length > 0) {
	console.log(`\n## Flaky（重試後通過，${buckets.flaky.length}）`);
	for (const { fileName, test } of buckets.flaky) {
		console.log(`- [${test.projectName}] ${fileName}:${test.location?.line} › ${test.title}`);
	}
}
