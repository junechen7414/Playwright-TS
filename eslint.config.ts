import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
	{
		// 作用範圍：所有子目錄下的 .ts 檔案
		files: ['**/*.ts'],
		// 忽略範圍：所有以 .config.ts 結尾的檔案，其實應該放在上一層的{}裡，但是目前files只有ts檔，如果有多種個路徑或是多個檔案各自不同設定，就需要放到上一層的{}
		ignores: ['**/*.config.ts'],

		languageOptions: {
			// 指定 ESLint 使用 @typescript-eslint/parser 來解析 TypeScript 語法
			parser: tsparser,
			// 原始碼類型，'module' 表示你的程式碼使用 ES 模組 (import/export)
			sourceType: 'module',
		},

		plugins: {
			// @typescript-eslint 插件，提供 TypeScript 相關的 lint 規則
			'@typescript-eslint': tseslint,
			// eslint-plugin-prettier 插件，讓 Prettier 的格式問題能以 ESLint 錯誤的形式顯示
			prettier: prettierPlugin,
		},

		rules: {
			// 啟用 @typescript-eslint 插件推薦的所有核心規則。
			...tseslint.configs.recommended.rules,
			// 來自 eslint-config-prettier 的設定，其作用是「關閉」所有可能與 Prettier 衝突的 ESLint 規則。
			// 避免 ESLint 和 Prettier 在程式碼格式上有不同的意見。
			...prettierConfig.rules,
		},
	},
];
