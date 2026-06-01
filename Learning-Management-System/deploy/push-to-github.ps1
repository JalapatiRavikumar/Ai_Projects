# Pushes this entire project to https://github.com/JalapatiRavikumar/AI-Projects.git
#
# Prerequisites:
#   - Git installed
#   - You are authenticated to GitHub (a browser credential prompt will appear,
#     or configure a Personal Access Token / GitHub CLI beforehand).
#
# Run from the PROJECT ROOT:
#   powershell -ExecutionPolicy Bypass -File deploy/push-to-github.ps1

$ErrorActionPreference = "Stop"

$RepoUrl = "https://github.com/JalapatiRavikumar/AI-Projects.git"
$Branch  = "main"

# Move to the project root (parent of this script's folder)
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot
Write-Host "Project root: $ProjectRoot"

# Initialise a fresh repo here if one isn't already present in THIS folder.
if (-not (Test-Path ".git")) {
    git init
    git checkout -b $Branch
}

# Identity (edit if you want different values)
git config user.name  "JalapatiRavikumar"
git config user.email "rravi@example.com"

# Wire up the remote
if (git remote | Select-String -Quiet "origin") {
    git remote set-url origin $RepoUrl
} else {
    git remote add origin $RepoUrl
}

git add .
git commit -m "Add Learning Management System project with deployment config"

# Push. Use --force only if you intend to overwrite the remote history.
git push -u origin $Branch

Write-Host "`nDone. View it at: https://github.com/JalapatiRavikumar/AI-Projects"
