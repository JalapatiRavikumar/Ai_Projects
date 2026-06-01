# =============================================================================
# start-live.ps1
# One command to bring the LMS live on a public URL (single origin, one tunnel).
#
# What it does:
#   1. Starts the Spring Boot backend on :8080 (MySQL must be running).
#   2. Builds the React frontend in same-origin mode (relative /api paths).
#   3. Starts the zero-dependency Node proxy on :5000 (serves UI + proxies /api).
#   4. Starts a Cloudflare quick-tunnel and prints the public URL.
#
# Run from the project root:
#   powershell -ExecutionPolicy Bypass -File deploy\start-live.ps1
#
# Stop everything later with:  deploy\stop-live.ps1
# =============================================================================

$ErrorActionPreference = "Stop"
$root      = Split-Path -Parent $PSScriptRoot
$backend   = Join-Path $root "backend"
$frontend  = Join-Path $root "frontend"
$deploy    = Join-Path $root "deploy"
$tools     = Join-Path $deploy "tools"
$cf        = Join-Path $tools "cloudflared.exe"

# --- DB password (MySQL root). Override by setting $env:DB_PASSWORD beforehand. ---
if (-not $env:DB_PASSWORD) { $env:DB_PASSWORD = "system" }

function Wait-Port($port, $timeoutSec) {
    for ($i = 0; $i -lt $timeoutSec; $i++) {
        if (Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue) { return $true }
        Start-Sleep -Seconds 1
    }
    return $false
}

Write-Host "[1/4] Starting backend on :8080 ..." -ForegroundColor Cyan
Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "set DB_PASSWORD=$($env:DB_PASSWORD)&& mvnw.cmd spring-boot:run" -WorkingDirectory $backend -WindowStyle Minimized
if (-not (Wait-Port 8080 180)) { Write-Host "Backend failed to start on :8080" -ForegroundColor Red; exit 1 }
Write-Host "      backend up." -ForegroundColor Green

Write-Host "[2/4] Building frontend (same-origin) ..." -ForegroundColor Cyan
Push-Location $frontend
$env:REACT_APP_SAME_ORIGIN = "true"
$env:REACT_APP_API_BASE_URL = ""
cmd.exe /c "npm run build" | Out-Null
Pop-Location
Write-Host "      build done." -ForegroundColor Green

Write-Host "[3/4] Starting single-origin proxy on :5000 ..." -ForegroundColor Cyan
Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "set PORT=5000&& set BACKEND=http://localhost:8080&& node proxy-server.js" -WorkingDirectory $deploy -WindowStyle Minimized
if (-not (Wait-Port 5000 30)) { Write-Host "Proxy failed to start on :5000" -ForegroundColor Red; exit 1 }
Write-Host "      proxy up." -ForegroundColor Green

Write-Host "[4/4] Starting Cloudflare tunnel ..." -ForegroundColor Cyan
$log = Join-Path $tools "app-tunnel.log"
if (Test-Path $log) { Remove-Item $log -Force }
Start-Process -FilePath $cf -ArgumentList "tunnel", "--url", "http://localhost:5000", "--no-autoupdate", "--logfile", $log -WindowStyle Minimized

$publicUrl = $null
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 2
    if (Test-Path $log) {
        $raw = (Get-Content $log -Raw) -replace "[`r`n| ]", ""
        if ($raw -match "https://([a-z0-9-]+\.trycloudflare\.com)") { $publicUrl = "https://$($matches[1])"; break }
    }
}

Write-Host ""
if ($publicUrl) {
    Write-Host "======================================================================" -ForegroundColor Green
    Write-Host " LIVE URL:  $publicUrl" -ForegroundColor Green
    Write-Host " Login:     admin@gmail.com / admin123" -ForegroundColor Green
    Write-Host "======================================================================" -ForegroundColor Green
} else {
    Write-Host "Tunnel started but URL not captured yet. Check: $log" -ForegroundColor Yellow
}
