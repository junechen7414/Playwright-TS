import { execSync } from 'node:child_process';

/**
 * Global Setup - 在所有測試執行前執行
 *
 * 策略：使用 Flyway clean + migrate 清理並重建資料庫 schema
 *
 * 注意事項：
 * 1. 此策略假設 Spring Boot 容器已經啟動（透過 docker-compose）
 * 2. Flyway 會透過 Spring Boot 應用程式執行
 * 3. 需要確保 Spring Boot 的 application-e2e.yml 中有正確的 Flyway 設定
 */
export default async function globalSetup() {
	console.log('\n🧹 [Global Setup] 開始清理測試資料庫...\n');

	try {
		// 方法 1: 透過 Spring Boot Actuator 觸發 Flyway clean + migrate
		// 這需要在 Spring Boot 中暴露 Flyway endpoint
		// 例如：POST http://localhost:8787/actuator/flyway/clean
		//      POST http://localhost:8787/actuator/flyway/migrate

		// 方法 2: 直接使用 Flyway CLI（需要安裝 Flyway CLI）
		// 這裡我們使用方法 2，因為更直接且不依賴 Spring Boot 的配置

		const flywayConfig = {
			url: process.env.SPRING_DATASOURCE_URL || 'jdbc:oracle:thin:@localhost:1521/FREEPDB1',
			user: process.env.ORACLE_TEST_USERNAME || 'testuser',
			password: process.env.ORACLE_TEST_PASSWORD || 'testpass',
			locations: 'filesystem:./src/main/resources/db/migration', // 根據你的 Flyway migration 檔案位置調整
		};

		console.log('📍 Flyway 設定:');
		console.log(`   URL: ${flywayConfig.url}`);
		console.log(`   User: ${flywayConfig.user}`);
		console.log(`   Locations: ${flywayConfig.locations}\n`);

		// 執行 Flyway clean（清空所有資料）
		console.log('🗑️  執行 Flyway clean...');
		execSync(
			`flyway clean -url="${flywayConfig.url}" -user="${flywayConfig.user}" -password="${flywayConfig.password}" -locations="${flywayConfig.locations}"`,
			{ stdio: 'inherit' },
		);

		// 執行 Flyway migrate（重建 schema）
		console.log('🔄 執行 Flyway migrate...');
		execSync(
			`flyway migrate -url="${flywayConfig.url}" -user="${flywayConfig.user}" -password="${flywayConfig.password}" -locations="${flywayConfig.locations}"`,
			{ stdio: 'inherit' },
		);

		console.log('\n✅ [Global Setup] 資料庫清理完成！\n');
	} catch (error) {
		console.error('\n❌ [Global Setup] 資料庫清理失敗:', error);
		console.error('\n⚠️  提示：');
		console.error('   1. 確認 Flyway CLI 已安裝（npm install -g node-flywaydb 或下載官方 CLI）');
		console.error('   2. 確認 Spring Boot 容器已啟動（docker-compose up）');
		console.error('   3. 確認環境變數設定正確（ORACLE_TEST_USERNAME, ORACLE_TEST_PASSWORD）');
		console.error('   4. 確認 Flyway migration 檔案路徑正確\n');

		// 不拋出錯誤，讓測試繼續執行（可根據需求調整）
		// throw error;
	}
}
