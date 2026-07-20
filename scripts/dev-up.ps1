param(
  [switch]$Prod
)

$composeFile = if ($Prod) { "docker-compose.yml" } else { "docker-compose.dev.yml" }
$mode = if ($Prod) { "Production" } else { "Development" }

Write-Host "=== Starting $mode environment ===" -ForegroundColor Cyan

# Start Docker daemon in WSL if not running
wsl -d Ubuntu -- bash -c "service docker status 2>&1 | grep -q running" 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Starting Docker daemon in WSL..." -ForegroundColor Yellow
  wsl -d Ubuntu -- bash -c "service docker start"
  Start-Sleep -Seconds 3
}

$projectPath = (Get-Item "$PSScriptRoot\..").FullName
$wslPath = $projectPath -replace '^([A-Z]):', '/mnt/$1' -replace '\\', '/'

Write-Host "Running: docker compose -f $composeFile up --build" -ForegroundColor Green
wsl -d Ubuntu -- bash -c "cd '$wslPath' && docker compose -f '$composeFile' up --build"
