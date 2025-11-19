import './globals.css'
import AppShell from './components/AppShell'
import Providers from './providers'
import ServiceWorkerRegistration from './components/ServiceWorkerRegistration'
import InstallPrompt from './components/InstallPrompt'
import { getEnv } from './lib/env'
import { Inter } from 'next/font/google'

const pretendard = Inter({
  subsets: ['latin'],
  display: 'swap', // 폰트 로딩 중 텍스트 표시
  variable: '--font-pretendard',
  fallback: ['system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
  preload: true, // 폰트 프리로드
  adjustFontFallback: true, // 폴백 폰트 크기 자동 조정
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // 환경변수는 빌드 타임에 검증되므로 안전하게 사용 가능
  const supabaseUrl = getEnv.supabaseUrl()
  const supabaseAnonKey = getEnv.supabaseAnonKey()
  
  return (
    <html lang="ko" className={`h-full ${pretendard.variable}`}>
      <head>
        {/* 뷰포트 메타 태그 - 모바일 최적화 필수 */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fullcalendar/core@6.1.14/main.min.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fullcalendar/daygrid@6.1.14/main.min.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fullcalendar/timegrid@6.1.14/main.min.css" />
        {/* Pretendard 폰트 로드 - 모바일 성능 최적화 */}
        <link 
          rel="preload" 
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css" 
          as="style" 
        />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css" />
        <noscript>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css" />
        </noscript>
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2c3e50" />
        {/* Apple PWA 설정 */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="여우스킨 CRM" />
        <link rel="apple-touch-icon" href="/icons/yeowooskin_192x192.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/yeowooskin_192x192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icons/yeowooskin_512x512.png" />
        {/* 클라이언트에서 환경변수 접근을 위한 메타 태그 (fallback용) */}
        <meta name="x-supabase-url" content={supabaseUrl} />
        <meta name="x-supabase-anon" content={supabaseAnonKey} />
      </head>
      <body className={`h-full font-sans bg-[var(--bg)] text-[color:var(--neutral-900)] ${pretendard.className}`}>
        <Providers>
          <ServiceWorkerRegistration />
          <AppShell>{children}</AppShell>
          <InstallPrompt />
        </Providers>
      </body>
    </html>
  )
}
