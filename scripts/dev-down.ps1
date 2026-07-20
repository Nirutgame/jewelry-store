param(
  [switch]$Prod,
  [switch]$Volumes
)

$composeFile = if ($Prod) { "docker-compose.yml" } else { "docker-compose.dev.yml" }
$mode = if ($Prod) { "Production" } else { "Development" }
$volFlag = if ($Volumes) { " -v" } else { "" }

Write-Host "=== Stopping $mode environment$volFlag ===" -ForegroundColor Cyan

$projectPath = (Get-Item "$PSScriptRoot\..").FullName
$drive = $projectPath[0].ToString().ToLower()
$wslPath = "/mnt/$drive" + $projectPath.Substring(2) -replace '\\', '/'

wsl -d Ubuntu -- bash -c "cd '$wslPath' && docker compose -f '$composeFile' down$volFlag"

Write-Host "Done." -ForegroundColor Green
