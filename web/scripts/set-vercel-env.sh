#!/bin/bash
# Vercel 환경변수 설정 스크립트
# 사용법: ./scripts/set-vercel-env.sh YOUR_VERCEL_TOKEN

VERCEL_TOKEN=${1:-$VERCEL_TOKEN}
PROJECT_ID="prj_2xQf400zau38GIna6YyGRKlCyPzs"
TEAM_ID="team_PA4CUVPRS0ESYk4ZBW9OOx2J"
SITE_URL="https://web-seven-beta-92.vercel.app"

if [ -z "$VERCEL_TOKEN" ]; then
    echo "❌ Vercel 토큰이 필요합니다."
    echo "사용법: ./scripts/set-vercel-env.sh YOUR_VERCEL_TOKEN"
    echo "또는 환경변수로: export VERCEL_TOKEN=your-token"
    exit 1
fi

echo "🔧 Setting NEXT_PUBLIC_SITE_URL to $SITE_URL..."

curl -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env?teamId=$TEAM_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"key\": \"NEXT_PUBLIC_SITE_URL\",
    \"value\": \"$SITE_URL\",
    \"type\": \"encrypted\",
    \"target\": [\"production\", \"preview\", \"development\"]
  }"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ NEXT_PUBLIC_SITE_URL 환경변수가 성공적으로 설정되었습니다!"
    echo "   값: $SITE_URL"
else
    echo ""
    echo "❌ 환경변수 설정에 실패했습니다."
    exit 1
fi

