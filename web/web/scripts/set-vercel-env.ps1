# Vercel 환경변수 설정 스크립트
# 사용법: .\scripts\set-vercel-env.ps1 -VercelToken "your-token"

param(
    [Parameter(Mandatory=$true)]
    [string]$VercelToken,
    
    [string]$ProjectId = "prj_2xQf400zau38GIna6YyGRKlCyPzs",
    [string]$TeamId = "team_PA4CUVPRS0ESYk4ZBW9OOx2J",
    [string]$SiteUrl = "https://web-seven-beta-92.vercel.app"
)

$headers = @{
    "Authorization" = "Bearer $VercelToken"
    "Content-Type" = "application/json"
}

# NEXT_PUBLIC_SITE_URL 설정
$body = @{
    type = "encrypted"
    value = $SiteUrl
    target = @("production", "preview", "development")
} | ConvertTo-Json

Write-Host "Setting NEXT_PUBLIC_SITE_URL to $SiteUrl..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "https://api.vercel.com/v10/projects/$ProjectId/env?teamId=$TeamId" `
        -Method POST `
        -Headers $headers `
        -Body (@{
            key = "NEXT_PUBLIC_SITE_URL"
            value = $SiteUrl
            type = "encrypted"
            target = @("production", "preview", "development")
        } | ConvertTo-Json -Depth 10)
    
    Write-Host "✅ NEXT_PUBLIC_SITE_URL 환경변수가 성공적으로 설정되었습니다!" -ForegroundColor Green
    Write-Host "   값: $SiteUrl" -ForegroundColor Gray
} catch {
    Write-Host "❌ 오류 발생: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "   상세: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
    exit 1
}

