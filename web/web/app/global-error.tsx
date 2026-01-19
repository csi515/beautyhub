'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import Button from './components/ui/Button'

type GlobalErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * 글로벌 에러 페이지 컴포넌트
 * 루트 레이아웃의 에러를 처리
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // 글로벌 에러 로깅
    console.error('Global error:', error)

    // Sentry 에러 추적 연동
    const sentryDsn = process.env['NEXT_PUBLIC_SENTRY_DSN']
    if (process.env.NODE_ENV === 'production' && sentryDsn) {
      import('@/app/lib/utils/sentry').then(({ captureError }) => {
        captureError(error, {
          digest: error.digest,
          location: typeof window !== 'undefined' ? window.location.href : 'unknown',
          type: 'global',
        })
      })
    }
  }, [error])

  return (
    <html lang="ko">
      <body>
        <div className="flex min-h-screen items-center justify-center p-4 bg-neutral-50">
          <div className="w-full max-w-md text-center space-y-6">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-error-50 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-error-600" />
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                심각한 오류가 발생했습니다
              </h1>
              <p className="text-neutral-600">
                애플리케이션을 초기화할 수 없습니다. 페이지를 새로고침해주세요.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="primary"
                onClick={() => {
                  window.location.href = '/'
                }}
                className="w-full sm:w-auto"
              >
                홈으로 이동
              </Button>
              <Button
                variant="secondary"
                onClick={reset}
                className="w-full sm:w-auto"
              >
                다시 시도
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6 p-4 bg-neutral-100 rounded-lg text-left">
                <p className="text-xs font-mono text-neutral-600 break-all">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="text-xs font-mono text-neutral-500 mt-2">
                    Digest: {error.digest}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </body>
    </html>
  )
}

