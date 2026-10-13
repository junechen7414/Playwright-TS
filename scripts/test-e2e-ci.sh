#!/bin/bash

# E2E 測試腳本 - CI/CD 環境用（容器重啟策略）
# 
# 此腳本會：
# 1. 停止並刪除現有的測試容器和 volumes
# 2. 重新啟動測試環境（Spring Boot + Oracle DB）
# 3. 等待應用程式回報 UP（pnpm run compose-wait）
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

# 4. 等待 Spring Boot 在 /actuator/health 回報 UP
#    compose up -d 只等到 DB healthy，app 本身還要 30–100 秒才開始接請求
echo -e "\n${YELLOW}⏳ 步驟 3: 等待應用程式就緒...${NC}"
if ! pnpm run compose-wait; then
    echo -e "${YELLOW}📋 容器日誌：${NC}"
    docker-compose -f docker-compose.test.yml logs --tail=50
    exit 1
fi

# 5. 執行測試
echo -e "\n${YELLOW}🧪 步驟 4: 執行 E2E 測試...${NC}"
pnpm run test:e2e

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
