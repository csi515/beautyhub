'use client'

import { useEffect } from 'react'
import { Home, RefreshCw } from 'lucide-react'
import Button from './components/ui/Button'
import ErrorState from './components/common/ErrorState'

type ErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * 에러 페이지 컴포넌트
 * Next.js App Router의 error.tsx
 */
export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // 에러 로깅 (콘솔)
    if (typeof window !== 'undefined') {
      console.error('Application error:', error)

      // 개발 환경에서는 상세 정보 출력
      if (process.env.NODE_ENV === 'development') {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          digest: error.digest,
        })
      }
    }
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-neutral-50">
      <div className="w-full max-w-md">
        <ErrorState
          title="오류가 발생했습니다"
          message={error.message || '예상치 못한 오류가 발생했습니다. 페이지를 새로고침하거나 다시 시도해주세요.'}
          onRetry={reset}
          retryLabel="다시 시도"
        />

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="secondary"
            onClick={() => {
              window.location.href = '/'
            }}
            leftIcon={<Home className="h-4 w-4" />}
            className="w-full sm:w-auto"
          >
            홈으로 이동
          </Button>
          <Button
            variant="primary"
            onClick={reset}
            leftIcon={<RefreshCw className="h-4 w-4" />}
            className="w-full sm:w-auto"
          >
            다시 시도
          </Button>
        </div>

        {process.env.NODE_ENV === 'development' && error.digest && (
          <div className="mt-6 p-4 bg-neutral-100 rounded-lg">
            <p className="text-xs font-mono text-neutral-600">
              Error Digest: {error.digest}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

