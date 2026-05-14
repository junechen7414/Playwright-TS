# E2E Testing Script - CI/CD Environment (Container Restart Strategy) - PowerShell Version
# 
# This script will:
# 1. Stop and remove existing test containers and volumes
# 2. Restart test environment (Spring Boot + Oracle DB)
# 3. Wait for service health checks to pass
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

# 4. Wait for service health checks to pass
Write-Host "`nStep 3: Waiting for service health checks..." -ForegroundColor Yellow
$maxWait = 300  # Maximum wait time: 5 minutes
$waitTime = 0
$interval = 10

while ($waitTime -lt $maxWait) {
    # Check Oracle DB health status
    try {
        $dbHealth = podman inspect --format='{{.State.Health.Status}}' oracle-db-test 2>$null
    } catch {
        $dbHealth = "not_found"
    }
    
    # Check Spring Boot container status
    try {
        $appStatus = podman inspect --format='{{.State.Status}}' spring-boot-app-test 2>$null
    } catch {
        $appStatus = "not_found"
    }
    
    Write-Host "   DB Health: $dbHealth | App Status: $appStatus | Waited: ${waitTime}s" -ForegroundColor Gray
    
    if ($dbHealth -eq "healthy" -and $appStatus -eq "running") {
        Write-Host "Services are ready!" -ForegroundColor Green
        break
    }
    
    if ($waitTime -ge $maxWait) {
        Write-Host "Timeout! Services did not become ready within $maxWait seconds" -ForegroundColor Red
        Write-Host "`nContainer logs:" -ForegroundColor Yellow
        podman compose -f docker-compose.test.yml logs --tail=50
        exit 1
    }
    
    Start-Sleep -Seconds $interval
    $waitTime += $interval
}

# Additional wait to ensure Spring Boot is fully started
Write-Host "`nWaiting an additional 10 seconds to ensure application is fully started..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# 5. Execute tests
Write-Host "`nStep 4: Executing E2E tests..." -ForegroundColor Yellow
try {
    npm run test:e2e
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