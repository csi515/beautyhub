'use client'

import { AlertCircle } from 'lucide-react'
import Button from '../ui/Button'

type ErrorStateProps = {
  title?: string
  message: string
  onRetry?: () => void
  retryLabel?: string
  className?: string
}

/**
 * 에러 상태 컴포넌트
 * 일관된 에러 표시 및 재시도 기능
 */
export default function ErrorState({
  title = '오류가 발생했습니다',
  message,
  onRetry,
  retryLabel = '다시 시도',
  className = '',
}: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      <div className="text-center space-y-4 max-w-md">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-full bg-error-50 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-error-600" />
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-1">{title}</h3>
          <p className="text-sm text-neutral-600">{message}</p>
        </div>
        {onRetry && (
          <Button variant="primary" onClick={onRetry} className="mt-2">
            {retryLabel}
          </Button>
        )}
      </div>
    </div>
  )
}

