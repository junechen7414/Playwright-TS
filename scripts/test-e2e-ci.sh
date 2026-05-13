#!/bin/bash

# E2E 測試腳本 - CI/CD 環境用（容器重啟策略）
# 
# 此腳本會：
# 1. 停止並刪除現有的測試容器和 volumes
# 2. 重新啟動測試環境（Spring Boot + Oracle DB）
# 3. 等待服務健康檢查通過
# 4. 執行 E2E 測試
# 5. 清理測試環境（可選）

set -e  # 遇到錯誤立即退出

echo "🚀 開始 E2E 測試流程（容器重啟策略）"
echo "========================================"

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. 停止並刪除現有容器
echo -e "\n${YELLOW}📦 步驟 1: 停止並刪除現有容器...${NC}"
docker-compose -f docker-compose.test.yml down -v || true

# 2. 拉取最新映像檔（可選，根據需求啟用）
# echo -e "\n${YELLOW}📥 步驟 2: 拉取最新映像檔...${NC}"
# docker-compose -f docker-compose.test.yml pull

# 3. 啟動測試環境
echo -e "\n${YELLOW}🔄 步驟 2: 啟動測試環境...${NC}"
docker-compose -f docker-compose.test.yml up -d

# 4. 等待服務健康檢查通過
echo -e "\n${YELLOW}⏳ 步驟 3: 等待服務健康檢查...${NC}"
MAX_WAIT=300  # 最多等待 5 分鐘
WAIT_TIME=0
INTERVAL=10

while [ $WAIT_TIME -lt $MAX_WAIT ]; do
    # 檢查 Oracle DB 健康狀態
    DB_HEALTH=$(docker inspect --format='{{.State.Health.Status}}' oracle-db-test 2>/dev/null || echo "not_found")
    
    # 檢查 Spring Boot 容器狀態
    APP_STATUS=$(docker inspect --format='{{.State.Status}}' spring-boot-app-test 2>/dev/null || echo "not_found")
    
    echo "   DB Health: $DB_HEALTH | App Status: $APP_STATUS | 已等待: ${WAIT_TIME}s"
    
    if [ "$DB_HEALTH" = "healthy" ] && [ "$APP_STATUS" = "running" ]; then
        echo -e "${GREEN}✅ 服務已就緒！${NC}"
        break
    fi
    
    if [ $WAIT_TIME -ge $MAX_WAIT ]; then
        echo -e "${RED}❌ 等待超時！服務未能在 ${MAX_WAIT} 秒內就緒${NC}"
        echo -e "${YELLOW}📋 容器日誌：${NC}"
        docker-compose -f docker-compose.test.yml logs --tail=50
        exit 1
    fi
    
    sleep $INTERVAL
    WAIT_TIME=$((WAIT_TIME + INTERVAL))
done

# 額外等待 10 秒確保 Spring Boot 完全啟動
echo -e "\n${YELLOW}⏳ 額外等待 10 秒確保應用程式完全啟動...${NC}"
sleep 10

# 5. 執行測試
echo -e "\n${YELLOW}🧪 步驟 4: 執行 E2E 測試...${NC}"
npm run test:e2e

TEST_EXIT_CODE=$?

# 6. 顯示測試結果
echo -e "\n========================================"
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ 測試通過！${NC}"
else
    echo -e "${RED}❌ 測試失敗！${NC}"
    echo -e "${YELLOW}📋 應用程式日誌：${NC}"
    docker-compose -f docker-compose.test.yml logs spring-boot-app-test --tail=100
fi

# 7. 清理（可選，根據需求啟用）
# echo -e "\n${YELLOW}🧹 步驟 5: 清理測試環境...${NC}"
# docker-compose -f docker-compose.test.yml down -v

exit $TEST_EXIT_CODE
