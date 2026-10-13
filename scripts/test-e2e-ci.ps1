# E2E Testing Script - CI/CD Environment (Container Restart Strategy) - PowerShell Version
# 
# This script will:
# 1. Stop and remove existing test containers and volumes
# 2. Restart test environment (Spring Boot + Oracle DB)
# 3. Wait for the application to report UP (pnpm run compose-wait)
# 4. Execute E2E tests
# 5. Clean up test environment (optional)

$ErrorActionPreference = "Stop"

Write-Host "Starting E2E test process (container restart strategy)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. Stop and remove existing containers
Write-Host "`nStep 1: Stopping and removing existing containers..." -ForegroundColor Yellow
try {
    podman compose -f docker-compose.test.yml down -v
} catch {
    Write-Host "   (Ignoring cleanup errors, containers may not exist)" -ForegroundColor Gray
}

# 2. Pull latest images (optional, enable as needed)
# Write-Host "`nStep 2: Pulling latest images..." -ForegroundColor Yellow
# podman compose -f docker-compose.test.yml pull

# 3. Start test environment
Write-Host "`nStep 2: Starting test environment..." -ForegroundColor Yellow
podman compose -f docker-compose.test.yml up -d

# 4. Wait for Spring Boot to report UP on /actuator/health
#    compose up -d only waits for the DB to be healthy; the app still needs 30-100s to start.
Write-Host "`nStep 3: Waiting for application to be ready..." -ForegroundColor Yellow
pnpm run compose-wait
if ($LASTEXITCODE -ne 0) {
    Write-Host "`nContainer logs:" -ForegroundColor Yellow
    podman compose -f docker-compose.test.yml logs --tail=50
    exit 1
}

# 5. Execute tests
Write-Host "`nStep 4: Executing E2E tests..." -ForegroundColor Yellow
try {
    pnpm run test:e2e
    $testExitCode = $LASTEXITCODE
} catch {
    $testExitCode = 1
}

# 6. Display test results
Write-Host "`n========================================" -ForegroundColor Cyan
if ($testExitCode -eq 0) {
    Write-Host "Tests passed!" -ForegroundColor Green
} else {
    Write-Host "Tests failed!" -ForegroundColor Red
    Write-Host "`nApplication logs:" -ForegroundColor Yellow
    podman compose -f docker-compose.test.yml logs spring-boot-app-test --tail=100
}

# 7. Cleanup (optional, enable as needed)
# Write-Host "`nStep 5: Cleaning up test environment..." -ForegroundColor Yellow
# podman compose -f docker-compose.test.yml down -v

exit $testExitCode