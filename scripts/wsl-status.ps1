Write-Host "=== WSL + Docker Status ===" -ForegroundColor Cyan

Write-Host "`n[WSL Distributions]" -ForegroundColor Yellow
wsl -l -v

Write-Host "`n[Docker Daemon]" -ForegroundColor Yellow
$dockerRunning = wsl -d Ubuntu -- bash -c "service docker status 2>&1 | grep -q running && echo '1' || echo '0'"
if ($dockerRunning -eq "1") {
  Write-Host "  Status: Running" -ForegroundColor Green
  wsl -d Ubuntu -- bash -c "docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"
} else {
  Write-Host "  Status: Stopped" -ForegroundColor Red
}

Write-Host "`n[Docker Volumes]" -ForegroundColor Yellow
wsl -d Ubuntu -- bash -c "docker volume ls --format 'table {{.Name}}'" 2>$null

Write-Host "`n[WSL Config]" -ForegroundColor Yellow
wsl -d Ubuntu -- bash -c "cat /etc/wsl.conf" 2>$null

Write-Host "`n[Project .env]" -ForegroundColor Yellow
$envFile = Join-Path "$PSScriptRoot\.." ".env"
if (Test-Path $envFile) {
  Get-Content $envFile | ForEach-Object {
    if ($_ -match '^(.*?)=(.+)$') {
      $key = $matches[1]
      $val = $matches[2]
      if ($key -match 'SECRET|KEY|PASS|TOKEN') {
        $val = '****'
      }
      Write-Host "  $key=$val"
    }
  }
}
