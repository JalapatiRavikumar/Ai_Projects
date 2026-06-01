$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not (Test-Path "env\Scripts\python.exe")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv env
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to create virtual environment. Install Python 3.10+ and try again." -ForegroundColor Red
        exit 1
    }
}

$python = Join-Path $PSScriptRoot "env\Scripts\python.exe"

if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "Created .env from .env.example — add your API keys before using payments." -ForegroundColor Yellow
    } else {
        Write-Host "Warning: backend/.env not found. Stripe payments will not work." -ForegroundColor Yellow
    }
}

Write-Host "Installing dependencies..." -ForegroundColor Yellow
& $python -m pip install --upgrade pip
& $python -m pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "Running migrations..." -ForegroundColor Yellow
& $python manage.py migrate
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host ""
Write-Host "Backend starting at http://127.0.0.1:8000" -ForegroundColor Green
Write-Host "Products API: http://127.0.0.1:8000/api/products/" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""

& $python manage.py runserver 127.0.0.1:8000
