import './globals.css'
import AppShell from './components/AppShell'
import Providers from './providers'
import ServiceWorkerRegistration from './components/ServiceWorkerRegistration'
import InstallPrompt from './components/InstallPrompt'
import OfflineIndicator from './components/OfflineIndicator'
import { SnackbarProvider } from './components/GlobalSnackbar'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <head>
        {/* 뷰포트 메타 태그 - 모바일 최적화 필수 */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover" />
        {/* Pretendard 폰트 로드 - 모바일 성능 최적화 */}
        <link
          rel="preconnect"
          href="https://cdn.jsdelivr.net"
          crossOrigin="anonymous"
        />
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
        <meta name="theme-color" content="#2563EB" />
        {/* Apple PWA 설정 */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="BeautyHub" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icons/icon-512.png" />
        {/* PWA 아이콘 preload */}
        <link rel="preload" href="/icons/icon-192.png" as="image" />
        <link rel="preload" href="/icons/icon-512.png" as="image" />
      </head>
      <body className="h-full font-sans bg-[var(--bg)] text-[color:var(--neutral-900)]">
        <Providers>
          <SnackbarProvider>
            <ServiceWorkerRegistration />
            <OfflineIndicator />
            <AppShell>{children}</AppShell>
            <InstallPrompt />
          </SnackbarProvider>
        </Providers>
      </body>
    </html>
  )
}
