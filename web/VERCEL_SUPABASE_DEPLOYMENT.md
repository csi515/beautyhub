# Vercel + Supabase 배포 체크리스트

## 🔴 필수 수정 사항

### 1. ~~Cron 테이블명 불일치~~ ✅ 수정 완료
`appointment_reminders`, `appointments`로 통일됨.

---

### 2. Vercel 프로젝트 루트 설정
**현재 구조:** `beautyhub/` (루트) → `web/` (Next.js 앱)

Vercel에 `beautyhub` 전체를 연결했다면 **Root Directory**를 `web`으로 설정해야 합니다.
- Vercel 대시보드 → Project Settings → General → Root Directory: `web`

---

### 3. Vercel 환경 변수 (필수)
| 변수명 | 설명 | 필수 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role Key (admin API용) | ✅ |
| `CRON_SECRET` | Cron 인증용 시크릿 (16자 이상) | ✅ (Cron 사용 시) |

**CRON_SECRET 생성:** `openssl rand -hex 32`

---

### 4. Supabase Auth 리다이렉트 URL
Supabase 대시보드 → Authentication → URL Configuration:

- **Site URL:** `https://your-app.vercel.app`
- **Redirect URLs:**  
  `https://your-app.vercel.app/**`  
  `https://your-app.vercel.app/auth/callback`

---

## 🟡 확인 필요 사항

### 5. Supabase Storage 버킷
고객 사진 업로드 시 `customer-photos` 버킷 사용.  
Supabase Storage에서 해당 버킷 생성 및 RLS 정책 설정 필요.

### 6. Cron Job (Production 전용)
`vercel.json`의 Cron은 **Production 배포**에서만 동작합니다.  
Preview 배포에서는 실행되지 않음.

### 7. 선택 환경 변수
| 변수명 | 용도 |
|--------|------|
| `NEXT_PUBLIC_SITE_URL` | PWA, 이메일 링크 등 |
| `NEXT_PUBLIC_BASE_URL` | API base URL |
| `HEALTH_CHECK_TOKEN` | `/api/health/supabase` 보호 |

---

## 🟢 이미 적용된 설정

- `vercel.json`: framework, region(icn1), crons
- `next.config.js`: output standalone 주석 처리 (Vercel 자동 처리)
- Auth callback: `secure` 플래그 production 대응
- Cookie: `sb:token`, `sb-access-token` 등 middleware에서 확인
