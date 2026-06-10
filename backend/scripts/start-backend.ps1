$ErrorActionPreference = 'Stop'

$backendRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $backendRoot '..')

Write-Host "Starting TaleForge AI backend from $(Get-Location)..." -ForegroundColor Cyan
npm run dev
