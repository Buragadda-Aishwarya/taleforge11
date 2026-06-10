$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$venvPath = Join-Path $repoRoot '.chroma-venv'
$activatePath = Join-Path $venvPath 'Scripts\Activate.ps1'
$chromaExe = Join-Path $venvPath 'Scripts\chroma.exe'

if (-not (Test-Path $venvPath)) {
    Write-Host 'Creating Python virtual environment...' -ForegroundColor Cyan
    python -m venv $venvPath
}

Write-Host 'Activating virtual environment...' -ForegroundColor Cyan
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process | Out-Null
. $activatePath

Write-Host 'Installing/validating Chroma server package...' -ForegroundColor Cyan
pip install --upgrade pip
pip install "chromadb[server]"

if (-not (Test-Path $chromaExe)) {
    throw 'Could not find chroma.exe in the virtual environment. Install failed or the venv path is invalid.'
}

Write-Host 'Starting Chroma server on http://127.0.0.1:8000' -ForegroundColor Green
$env:CHROMA_SERVER_ALLOW_ORIGINS = 'http://localhost:5173'
& $chromaExe run --host 127.0.0.1 --port 8000
