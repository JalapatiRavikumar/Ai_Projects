$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "Checking backend..." -ForegroundColor Yellow
try {
    $backend = Invoke-WebRequest -Uri "http://127.0.0.1:8000/" -UseBasicParsing -TimeoutSec 3
    if ($backend.StatusCode -ne 200) {
        throw "Backend returned status $($backend.StatusCode)"
    }
    Write-Host "Backend is running." -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "Backend is NOT running on http://127.0.0.1:8000" -ForegroundColor Red
    Write-Host "Start the backend first:" -ForegroundColor Yellow
    Write-Host "  cd ..\backend" -ForegroundColor Gray
    Write-Host "  powershell -ExecutionPolicy Bypass -File .\start_backend.ps1" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

$portInUse = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Host "Port 3000 is already in use. Stopping old process..." -ForegroundColor Yellow
    $portInUse | ForEach-Object {
        Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
}

Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host ""
Write-Host "Frontend starting at http://localhost:3000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""

npm start
