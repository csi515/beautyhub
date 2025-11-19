# 여우스킨 CRM - Web Application

Next.js 14 기반의 피부관리샵 관리 시스템 웹 애플리케이션입니다.

## 기술 스택

- **Framework**: Next.js 14 (App Router)
- **UI**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel
- **PWA**: Service Worker, Manifest

## 시작하기

### 필수 요구사항

- Node.js 18 이상
- npm 또는 yarn
- Supabase 프로젝트

### 설치

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

### 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수를 설정하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

자세한 내용은 `.env.example` 파일을 참고하세요.

## 프로젝트 구조

```
web/
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트
│   ├── components/        # React 컴포넌트
│   ├── lib/               # 유틸리티 및 헬퍼
│   └── (auth)/            # 인증 관련 페이지
├── public/                # 정적 파일
├── types/                 # TypeScript 타입 정의
└── middleware.ts          # Next.js 미들웨어
```

## 주요 기능

- ✅ 고객 관리
- ✅ 제품 관리
- ✅ 예약 관리
- ✅ 직원 관리
- ✅ 재무 관리
- ✅ PWA 지원
- ✅ 반응형 디자인

## 배포

### Vercel 배포

1. Vercel에 프로젝트 연결
2. 환경 변수 설정 (Vercel 대시보드)
3. Root Directory: `web`
4. Build Command: `npm run build`
5. 배포 완료!

자세한 배포 가이드는 `VERCEL_DEPLOYMENT.md`를 참고하세요.

## 개발 가이드

### 코드 스타일

- TypeScript 사용
- ESLint 규칙 준수
- 컴포넌트는 함수형 컴포넌트 사용
- API 라우트는 Zod 스키마로 검증

### API 응답 형식

모든 API는 다음 형식을 따릅니다:

```typescript
{
  success: boolean
  data?: T
  error?: string
}
```

### 에러 처리

- `error.tsx`: 페이지 레벨 에러 처리
- `global-error.tsx`: 글로벌 에러 처리
- `not-found.tsx`: 404 페이지

## 라이선스

프로젝트 라이선스를 확인하세요.
