#!/bin/bash
set -e  # 任何命令失敗就立即停止腳本執行

echo "--- Debug: Checking Environment ---"
echo "Username: $ORACLE_TEST_USERNAME"

# 檢查必要的環境變數是否已設定
if [ -z "$ORACLE_TEST_USERNAME" ]; then
    echo "ERROR: ORACLE_TEST_USERNAME is not set"
    exit 1
fi

if [ -z "$ORACLE_TEST_PASSWORD" ]; then
    echo "ERROR: ORACLE_TEST_PASSWORD is not set"
    exit 1
fi

echo "--- Debug: Checking Files ---"
# 檢查範本檔案是否存在
if [ ! -f /opt/oracle/template/01_setup.sql.tmpl ]; then
    echo "ERROR: Template file /opt/oracle/template/01_setup.sql.tmpl not found"
    exit 1
fi

ls -l /opt/oracle/template/01_setup.sql.tmpl

# 使用 sed 代替 envsubst (因為 sed 是 Linux 標配)
# 注意：這裡直接寫死容器內部的絕對路徑
echo "--- Generating SQL from template ---"
sed "s/\${ORACLE_TEST_USERNAME}/$ORACLE_TEST_USERNAME/g; s/\${ORACLE_TEST_PASSWORD}/$ORACLE_TEST_PASSWORD/g" \
    /opt/oracle/template/01_setup.sql.tmpl > /tmp/setup_final.sql

# 檢查 sed 是否成功生成檔案
if [ ! -s /tmp/setup_final.sql ]; then
    echo "ERROR: Failed to generate SQL file or file is empty"
    exit 1
fi

echo "--- Debug: Checking Generated SQL ---"
cat /tmp/setup_final.sql

# 執行 SQL 並檢查結果
echo "--- Executing SQL ---"
if sqlplus -S / as sysdba @/tmp/setup_final.sql; then
    echo "--- Custom Setup Finished Successfully ---"
    exit 0
else
    echo "ERROR: SQL execution failed"
    exit 1
fi