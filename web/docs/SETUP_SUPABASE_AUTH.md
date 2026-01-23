# Supabase 인증 설정 가이드

## 개요

이 문서는 Supabase 인증을 올바르게 설정하기 위한 가이드입니다. 특히 비밀번호 재설정 플로우와 관련된 설정을 다룹니다.

## 필수 환경 변수

### 프로덕션 환경

프로덕션 환경에서는 다음 환경 변수를 반드시 설정해야 합니다:

```bash
# 필수
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 비밀번호 재설정 링크 생성을 위해 필수
NEXT_PUBLIC_SITE_URL=https://your-production-domain.com

# 선택적 (대체용)
NEXT_PUBLIC_BASE_URL=https://your-production-domain.com
```

### 개발 환경

개발 환경에서는 `NEXT_PUBLIC_SITE_URL`이 없어도 동작하지만, 경고가 표시됩니다:

```bash
# 필수
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 선택적 (없으면 localhost 사용, 경고 표시)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Supabase 콘솔 설정

### 1. Site URL 설정

1. Supabase 대시보드에 로그인
2. **Settings** > **Authentication** > **URL Configuration** 이동
3. **Site URL**을 프로덕션 도메인으로 설정:
   ```
   https://your-production-domain.com
   ```

⚠️ **주의**: Site URL이 `localhost`로 설정되어 있으면 이메일 링크가 localhost로 생성되어 모바일에서 작동하지 않습니다.

### 2. Redirect URLs 등록

1. **Settings** > **Authentication** > **URL Configuration** 이동
2. **Redirect URLs** 섹션에 다음 URL들을 추가:

   ```
   https://your-production-domain.com/reset-password
   https://your-production-domain.com/auth/callback
   http://localhost:3000/reset-password (개발용)
   http://localhost:3000/auth/callback (개발용)
   ```

   PWA를 사용하는 경우 추가:
   ```
   https://your-production-domain.com/*
   ```

### 3. Password Recovery Redirect URL 설정

1. **Settings** > **Authentication** > **Email Templates** 이동
2. **Password Reset** 템플릿 확인
3. 기본적으로 `{{ .SiteURL }}/reset-password`로 설정되어 있어야 합니다.

또는 **Settings** > **Authentication** > **URL Configuration**에서:
- **Password recovery redirect URL**을 명시적으로 설정:
  ```
  https://your-production-domain.com/reset-password
  ```

## 배포 시 확인 사항

### Vercel 배포

1. **Environment Variables** 섹션에서 다음 변수 확인:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (프로덕션 도메인)

2. 배포 후 다음을 테스트:
   - 비밀번호 재설정 이메일 발송
   - 이메일 링크 클릭 시 올바른 도메인으로 이동하는지 확인
   - 모바일에서 링크 클릭 시 정상 작동하는지 확인

### 다른 플랫폼 배포

환경 변수 설정 방법은 플랫폼마다 다르지만, 동일한 변수들을 설정해야 합니다.

## 문제 해결

### localhost로 리다이렉트되는 문제

**증상**: 프로덕션에서 비밀번호 재설정 이메일 링크가 localhost로 생성됨

**원인**:
1. `NEXT_PUBLIC_SITE_URL` 환경 변수가 설정되지 않음
2. Supabase 콘솔의 Site URL이 localhost로 설정됨

**해결**:
1. 프로덕션 환경 변수에 `NEXT_PUBLIC_SITE_URL` 추가
2. Supabase 콘솔의 Site URL을 프로덕션 도메인으로 변경

### 모바일에서 링크가 작동하지 않는 문제

**증상**: 모바일에서 비밀번호 재설정 링크 클릭 시 페이지가 열리지 않음

**원인**:
1. 링크가 localhost로 생성됨
2. Redirect URLs에 해당 URL이 등록되지 않음

**해결**:
1. `NEXT_PUBLIC_SITE_URL` 환경 변수 확인
2. Supabase 콘솔의 Redirect URLs에 프로덕션 URL 추가

### 세션이 생성되지 않는 문제

**증상**: 비밀번호 재설정 링크 클릭 후 세션이 생성되지 않음

**원인**:
1. PKCE flow 설정 문제
2. 쿠키 동기화 실패

**해결**:
1. Supabase 클라이언트가 `flowType: 'pkce'`로 설정되어 있는지 확인
2. `/api/auth/session` 엔드포인트가 정상 작동하는지 확인
3. 브라우저 콘솔에서 에러 로그 확인

## 코드 참고

### redirectTo 생성

코드에서는 `getAuthRedirectTo` 유틸리티를 사용하여 localhost 방지:

```typescript
import { getAuthRedirectTo } from '@/app/lib/utils/authRedirect'

const redirectTo = getAuthRedirectTo('/reset-password')
```

### 비밀번호 재설정 플로우

`usePasswordRecoveryFlow` 훅이 자동으로 처리:

```typescript
import { usePasswordRecoveryFlow } from '@/app/lib/hooks/usePasswordRecoveryFlow'

const { sessionReady, error, userEmail, retry } = usePasswordRecoveryFlow(supabase)
```

## 추가 리소스

- [Supabase Auth 문서](https://supabase.com/docs/guides/auth)
- [Supabase Password Reset 가이드](https://supabase.com/docs/guides/auth/auth-password-reset)
- [PKCE Flow 설명](https://oauth.net/2/pkce/)
