param (
    [switch]$Backend,
    [switch]$Frontend,
    [switch]$Data,
    [switch]$All
)

# Default to full deploy if no specific switches provided
if (-not $Backend -and -not $Frontend -and -not $Data) {
    $All = $true
}

$BASE_DIR = $PSScriptRoot
if (-not $BASE_DIR) {
    $BASE_DIR = (Get-Location).Path
}

$REMOTE_USER = "ubuntu"
$REMOTE_HOST = "155.248.255.235"
$SSH_KEY = "C:\Users\visha\.ssh\ssh-key-2026-08-29.key"
$REMOTE_DIR = "/var/www/nirikshak"
$REMOTE_TARGET = "${REMOTE_USER}@${REMOTE_HOST}"

$LOCAL_BACKEND = Join-Path $BASE_DIR "backend"
$LOCAL_FRONTEND = Join-Path $BASE_DIR "frontend"
$LOCAL_FRONTEND_DATA = Join-Path $BASE_DIR "frontend\public\data"
$LOCAL_FRONTEND_DIST = Join-Path $BASE_DIR "frontend\dist"

Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "  NIRIKSHAK AI - Targeted Production Deployment" -ForegroundColor Cyan
Write-Host "  Base: $BASE_DIR" -ForegroundColor Cyan
Write-Host "  Target: $REMOTE_TARGET" -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan

# -- 1. FRONTEND DEPLOYMENT --
if ($Frontend -or $All) {
    Write-Host "[1/4] Building and Deploying Frontend bundle..." -ForegroundColor Yellow
    npm --prefix "$LOCAL_FRONTEND" run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Frontend build failed. Aborting deployment."
        exit 1
    }
    $tmpTar = Join-Path $env:TEMP "frontend_dist.tar.gz"
    tar --exclude="data" -czf "$tmpTar" -C "$LOCAL_FRONTEND_DIST" .
    scp -o StrictHostKeyChecking=no -i $SSH_KEY "$tmpTar" "${REMOTE_TARGET}:~/frontend_dist.tar.gz"
    ssh -o StrictHostKeyChecking=no -i $SSH_KEY $REMOTE_TARGET "sudo mkdir -p $REMOTE_DIR/frontend ; sudo tar -xzf ~/frontend_dist.tar.gz -C $REMOTE_DIR/frontend/ ; rm -f ~/frontend_dist.tar.gz ; sudo nginx -t ; sudo systemctl reload nginx"
    Remove-Item -Force "$tmpTar" -ErrorAction SilentlyContinue
    Write-Host "  [OK] Frontend deployed and Nginx reloaded." -ForegroundColor Green
}

# -- 2. DATA FEEDS DEPLOYMENT --
if ($Data -or $All) {
    Write-Host "[2/4] Deploying Data feeds to server directories..." -ForegroundColor Yellow
    $tmpTar = Join-Path $env:TEMP "data_feeds.tar.gz"
    tar -czf "$tmpTar" -C "$LOCAL_FRONTEND_DATA" .
    scp -o StrictHostKeyChecking=no -i $SSH_KEY "$tmpTar" "${REMOTE_TARGET}:~/data_feeds.tar.gz"
    ssh -o StrictHostKeyChecking=no -i $SSH_KEY $REMOTE_TARGET "sudo mkdir -p $REMOTE_DIR/frontend/data $REMOTE_DIR/frontend/public/data $REMOTE_DIR/data/live_exports $REMOTE_DIR/data ; sudo tar -xzf ~/data_feeds.tar.gz -C $REMOTE_DIR/frontend/data/ ; sudo tar -xzf ~/data_feeds.tar.gz -C $REMOTE_DIR/frontend/public/data/ ; sudo tar -xzf ~/data_feeds.tar.gz -C $REMOTE_DIR/data/live_exports/ ; sudo tar -xzf ~/data_feeds.tar.gz -C $REMOTE_DIR/data/ ; rm -f ~/data_feeds.tar.gz"
    Remove-Item -Force "$tmpTar" -ErrorAction SilentlyContinue
    Write-Host "  [OK] Data feeds synchronized." -ForegroundColor Green
}

# -- 3. BACKEND DEPLOYMENT --
if ($Backend -or $All) {
    Write-Host "[3/4] Deploying Backend updates and restarting service..." -ForegroundColor Yellow
    $tmpTar = Join-Path $env:TEMP "backend.tar.gz"
    tar --exclude="__pycache__" --exclude="*.pyc" -czf "$tmpTar" -C "$LOCAL_BACKEND" .
    scp -o StrictHostKeyChecking=no -i $SSH_KEY "$tmpTar" "${REMOTE_TARGET}:~/backend.tar.gz"
    ssh -o StrictHostKeyChecking=no -i $SSH_KEY $REMOTE_TARGET "sudo mkdir -p $REMOTE_DIR/backend ; sudo tar -xzf ~/backend.tar.gz -C $REMOTE_DIR/backend/ ; rm -f ~/backend.tar.gz ; sudo systemctl restart nirikshak-backend.service"
    Remove-Item -Force "$tmpTar" -ErrorAction SilentlyContinue
    Write-Host "  [OK] Backend deployed and nirikshak-backend.service restarted." -ForegroundColor Green
}

# -- 4. LIVE HEALTH VERIFICATION --
Write-Host "[4/4] Verifying live server health..." -ForegroundColor Yellow
$healthy = $false
for ($i = 1; $i -le 6; $i++) {
    Start-Sleep -Seconds 2
    try {
        $health = Invoke-RestMethod -Uri "http://${REMOTE_HOST}/api/health" -TimeoutSec 5 -ErrorAction SilentlyContinue
        if ($health.status -eq "ok") {
            $healthy = $true
            break
        }
    } catch {}
}

if ($healthy) {
    Write-Host "===============================================================" -ForegroundColor Green
    Write-Host "  [OK] DEPLOYMENT COMPLETE AND VERIFIED: Server is LIVE and HEALTHY!" -ForegroundColor Green
    Write-Host "  API Status: $($health.status) | Service: $($health.service)" -ForegroundColor Green
    Write-Host "  URL: http://$REMOTE_HOST" -ForegroundColor Green
    Write-Host "===============================================================" -ForegroundColor Green
} else {
    Write-Warning "Health probe could not verify ok within 12s, check: sudo systemctl status nirikshak-backend.service"
}
