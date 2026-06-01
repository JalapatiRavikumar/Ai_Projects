# =============================================================================
# stop-live.ps1
# Stops everything started by start-live.ps1 (backend, proxy, tunnel).
# Run from the project root:
#   powershell -ExecutionPolicy Bypass -File deploy\stop-live.ps1
# =============================================================================

Write-Host "Stopping Cloudflare tunnel ..." -ForegroundColor Cyan
Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "Stopping proxy / static server (port 5000) ..." -ForegroundColor Cyan
$p5000 = (Get-NetTCPConnection -State Listen -LocalPort 5000 -ErrorAction SilentlyContinue).OwningProcess | Select-Object -Unique
foreach ($pid in $p5000) { if ($pid) { Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue } }

Write-Host "Stopping backend (port 8080) ..." -ForegroundColor Cyan
$p8080 = (Get-NetTCPConnection -State Listen -LocalPort 8080 -ErrorAction SilentlyContinue).OwningProcess | Select-Object -Unique
foreach ($pid in $p8080) { if ($pid) { Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue } }

Write-Host "Done. (MySQL was left running.)" -ForegroundColor Green
