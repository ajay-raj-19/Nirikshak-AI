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
    $BASE_DIR = Get-Location
}

$REMOTE_USER = "ubuntu"
$REMOTE_HOST = "155.248.255.235"
$SSH_KEY = "C:\Users\visha\.ssh\ssh-key-2026-08-29.key"
$REMOTE_DIR = "/var/www/nirikshak"
$LOCAL_BACKEND = Join-Path $BASE_DIR "backend"
$LOCAL_FRONTEND = Join-Path $BASE_DIR "frontend"
$LOCAL_FRONTEND_DATA = Join-Path $BASE_DIR "frontend\public\data"
$LOCAL_FRONTEND_DIST = Join-Path $BASE_DIR "frontend\dist"

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  NIRIKSHAK AI — Targeted Production Deployment" -ForegroundColor Cyan
Write-Host "  Base: $BASE_DIR" -ForegroundColor Cyan
Write-Host "  Target: $REMOTE_USER@$REMOTE_HOST" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan

# ── 1. FRONTEND DEPLOYMENT ──
if ($Frontend -or $All) {
    Write-Host "[1/4] Building and Deploying Frontend bundle..." -ForegroundColor Yellow
    npm --prefix "$LOCAL_FRONTEND" run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Frontend build failed. Aborting deployment."
        exit 1
    }
    ssh -o StrictHostKeyChecking=no -i $SSH_KEY ${REMOTE_USER}@${REMOTE_HOST} "mkdir -p ~/tmp_frontend"
    scp -o StrictHostKeyChecking=no -i $SSH_KEY -r "$LOCAL_FRONTEND_DIST\*" ${REMOTE_USER}@${REMOTE_HOST}:~/tmp_frontend/
    ssh -o StrictHostKeyChecking=no -i $SSH_KEY ${REMOTE_USER}@${REMOTE_HOST} "sudo cp -r ~/tmp_frontend/* ${REMOTE_DIR}/frontend/ && rm -rf ~/tmp_frontend && sudo nginx -t && sudo systemctl reload nginx"
    Write-Host "  ✓ Frontend deployed and Nginx reloaded." -ForegroundColor Green
}

# ── 2. DATA FEEDS DEPLOYMENT ──
if ($Data -or $All) {
    Write-Host "[2/4] Deploying Data feeds to server directories..." -ForegroundColor Yellow
    ssh -o StrictHostKeyChecking=no -i $SSH_KEY ${REMOTE_USER}@${REMOTE_HOST} "mkdir -p ~/tmp_data && sudo mkdir -p ${REMOTE_DIR}/frontend/data ${REMOTE_DIR}/frontend/public/data ${REMOTE_DIR}/data/live_exports ${REMOTE_DIR}/data"
    scp -o StrictHostKeyChecking=no -i $SSH_KEY -r "$LOCAL_FRONTEND_DATA\*" ${REMOTE_USER}@${REMOTE_HOST}:~/tmp_data/
    ssh -o StrictHostKeyChecking=no -i $SSH_KEY ${REMOTE_USER}@${REMOTE_HOST} "sudo cp -r ~/tmp_data/* ${REMOTE_DIR}/frontend/data/ && sudo cp -r ~/tmp_data/* ${REMOTE_DIR}/frontend/public/data/ && sudo cp -r ~/tmp_data/* ${REMOTE_DIR}/data/live_exports/ && sudo cp -r ~/tmp_data/* ${REMOTE_DIR}/data/ && rm -rf ~/tmp_data"
    Write-Host "  ✓ Data feeds synchronized." -ForegroundColor Green
}

# ── 3. BACKEND DEPLOYMENT ──
if ($Backend -or $All) {
    Write-Host "[3/4] Deploying Backend updates and restarting service..." -ForegroundColor Yellow
    ssh -o StrictHostKeyChecking=no -i $SSH_KEY ${REMOTE_USER}@${REMOTE_HOST} "mkdir -p ~/tmp_backend"
    scp -o StrictHostKeyChecking=no -i $SSH_KEY -r "$LOCAL_BACKEND\*" ${REMOTE_USER}@${REMOTE_HOST}:~/tmp_backend/
    ssh -o StrictHostKeyChecking=no -i $SSH_KEY ${REMOTE_USER}@${REMOTE_HOST} "sudo cp -r ~/tmp_backend/* ${REMOTE_DIR}/backend/ && rm -rf ~/tmp_backend && sudo systemctl restart nirikshak-backend.service"
    Write-Host "  ✓ Backend deployed and nirikshak-backend.service restarted." -ForegroundColor Green
}

# ── 4. LIVE HEALTH VERIFICATION ──
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
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host "  ✓ DEPLOYMENT COMPLETE & VERIFIED: Server is LIVE and HEALTHY!" -ForegroundColor Green
    Write-Host "  API Status: $($health.status) | Service: $($health.service)" -ForegroundColor Green
    Write-Host "  URL: http://${REMOTE_HOST}" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
} else {
    Write-Warning "Health probe could not verify 'ok' within 12s, check 'sudo systemctl status nirikshak-backend.service'"
}
