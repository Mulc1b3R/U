# =====================================================================
# SOVEREIGN .BIO HOLOGRAM - ONE-CLICK WINDOWS SETUP (OLLAMA + 3 MODELS)
# =====================================================================
$ErrorActionPreference = "Stop"

Write-Host "`n=== Sovereign .bio Hologram - Local Engine & Model Setup ===" -ForegroundColor Cyan

# 1. Check for Ollama; install via winget if missing
if (-not (Get-Command ollama -ErrorAction SilentlyContinue)) {
    Write-Host "[1/4] Ollama not found. Installing Ollama via winget..." -ForegroundColor Yellow
    winget install -e --id Ollama.Ollama --accept-package-agreements --accept-source-agreements
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
} else {
    Write-Host "[1/4] Ollama is already installed." -ForegroundColor Green
}

# 2. Ensure Ollama background service is listening
Write-Host "[2/4] Starting local Ollama service..." -ForegroundColor Cyan
Start-Process "ollama" -ArgumentList "serve" -WindowStyle Hidden -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3

# 3. Pull & tag the 3 open-weight models to match bio_app.js
$models = @(
    @{ source = "gemma4:e4b";      alias = "local-gemma" },
    @{ source = "qwen3:8b";        alias = "local-qwen" },
    @{ source = "deepseek-r1:8b";  alias = "local-deepseek" }
)

Write-Host "[3/4] Downloading & tagging open-weight models (this may take a few minutes)..." -ForegroundColor Cyan
foreach ($m in $models) {
    Write-Host "  -> Pulling $($m.source) as '$($m.alias)'..." -ForegroundColor Yellow
    ollama pull $m.source
    ollama cp $m.source $m.alias
}

# 4. Verify installed models with ollama list
Write-Host "`n[4/4] Verifying installed models in local registry:" -ForegroundColor Cyan
ollama list

Write-Host "`nSetup complete! Run 'python bio_web.py' to launch your .bio console." -ForegroundColor Green


