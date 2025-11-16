# Vercel 환경변수 설정 가이드

## NEXT_PUBLIC_SITE_URL 설정

비밀번호 재설정 링크를 위해 Vercel 배포 URL을 환경변수로 설정해야 합니다.

### 현재 프로덕션 도메인
- **프로덕션 URL**: `https://web-seven-beta-92.vercel.app`
- **팀 도메인**: `https://web-nocturns-projects-33a5a182.vercel.app`

### 방법 1: Vercel 대시보드에서 설정 (권장)

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. 프로젝트 "web" 선택
3. Settings → Environment Variables 메뉴로 이동
4. 다음 환경변수 추가:
   - **Key**: `NEXT_PUBLIC_SITE_URL`
   - **Value**: `https://web-seven-beta-92.vercel.app`
   - **Environment**: Production, Preview, Development 모두 선택
5. Save 클릭
6. 새 배포 트리거 (자동으로 트리거될 수도 있음)

### 방법 2: Vercel CLI 사용

```bash
cd web
vercel env add NEXT_PUBLIC_SITE_URL production preview development
# 프롬프트에 값 입력: https://web-seven-beta-92.vercel.app
```

### 방법 3: Vercel API 사용 (스크립트)

#### PowerShell (Windows)
```powershell
cd web
.\scripts\set-vercel-env.ps1 -VercelToken "your-vercel-token"
```

#### Bash (Mac/Linux)
```bash
cd web
chmod +x scripts/set-vercel-env.sh
./scripts/set-vercel-env.sh your-vercel-token
```

#### Vercel 토큰 발급 방법
1. [Vercel Settings](https://vercel.com/account/tokens) 접속
2. "Create Token" 클릭
3. 토큰 이름 입력 (예: "env-setup")
4. 토큰 복사 (한 번만 표시됨)

### 방법 4: cURL 직접 사용

```bash
curl -X POST "https://api.vercel.com/v10/projects/prj_2xQf400zau38GIna6YyGRKlCyPzs/env?teamId=team_PA4CUVPRS0ESYk4ZBW9OOx2J" \
  -H "Authorization: Bearer YOUR_VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "NEXT_PUBLIC_SITE_URL",
    "value": "https://web-seven-beta-92.vercel.app",
    "type": "encrypted",
    "target": ["production", "preview", "development"]
  }'
```

## 확인 방법

설정 후 다음을 확인하세요:

1. Vercel 대시보드에서 환경변수 목록 확인
2. 새 배포 실행 (환경변수 변경 후 재배포 필요)
3. 배포 후 비밀번호 재설정 기능 테스트

## 참고사항

- 환경변수 변경 후에는 새 배포가 필요합니다
- `NEXT_PUBLIC_` 접두사가 있는 변수는 클라이언트 번들에 포함됩니다
- 프로덕션 도메인이 변경되면 이 값도 업데이트해야 합니다

