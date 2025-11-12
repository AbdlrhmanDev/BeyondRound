# Fix Next.js Build Issues
# This script fixes EPERM and ENOENT errors by cleaning .next folder

Write-Host "=== Fixing Next.js Build Issues ===" -ForegroundColor Cyan

# Step 1: Stop any running Next.js dev servers
Write-Host "`nStep 1: Checking for running Node processes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    $_.Path -notlike "*cursor*" -and $_.Path -notlike "*code*"
}
if ($nodeProcesses) {
    Write-Host "Found $($nodeProcesses.Count) Node.js processes" -ForegroundColor Yellow
    Write-Host "Please stop your dev server (Ctrl+C) before continuing, or we'll try to kill them..."
    Start-Sleep -Seconds 2
    
    # Try to kill processes using port 3000
    $port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    if ($port3000) {
        Write-Host "Found process using port 3000, attempting to stop..." -ForegroundColor Yellow
        Stop-Process -Id $port3000.OwningProcess -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 1
    }
}

# Step 2: Remove .next folder with multiple attempts
Write-Host "`nStep 2: Removing .next folder..." -ForegroundColor Yellow
if (Test-Path .next) {
    # Try to remove files individually first
    Get-ChildItem .next -Recurse -File -ErrorAction SilentlyContinue | ForEach-Object {
        Remove-Item $_.FullName -Force -ErrorAction SilentlyContinue
    }
    
    # Remove directories
    Get-ChildItem .next -Recurse -Directory -ErrorAction SilentlyContinue | Sort-Object FullName -Descending | ForEach-Object {
        Remove-Item $_.FullName -Force -Recurse -ErrorAction SilentlyContinue
    }
    
    # Finally remove .next itself
    Start-Sleep -Seconds 1
    Remove-Item .next -Force -Recurse -ErrorAction SilentlyContinue
    
    if (Test-Path .next) {
        Write-Host "✗ Could not fully remove .next folder. Please close all Node.js processes and try again." -ForegroundColor Red
        Write-Host "  Or manually delete the .next folder" -ForegroundColor Yellow
    } else {
        Write-Host "✓ .next folder removed successfully" -ForegroundColor Green
    }
} else {
    Write-Host "✓ .next folder does not exist" -ForegroundColor Green
}

# Step 3: Clean npm cache
Write-Host "`nStep 3: Cleaning npm cache..." -ForegroundColor Yellow
npm cache clean --force 2>&1 | Out-Null
Write-Host "✓ npm cache cleaned" -ForegroundColor Green

# Step 4: Remove node_modules cache if exists
if (Test-Path "node_modules\.cache") {
    Remove-Item "node_modules\.cache" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✓ Removed node_modules cache" -ForegroundColor Green
}

Write-Host "`n=== Cleanup Complete ===" -ForegroundColor Cyan
Write-Host "You can now run: npm run dev" -ForegroundColor Green

