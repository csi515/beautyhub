'use client'

import EnhancedErrorState, { getErrorType } from './EnhancedErrorState'

type ErrorStateProps = {
  title?: string
  message: string
  error?: unknown
  onRetry?: () => void
  retryLabel?: string
  className?: string
}

/**
 * 에러 상태 컴포넌트
 * 일관된 에러 표시 및 재시도 기능
 * EnhancedErrorState를 사용하여 개선된 UX 제공
 */
export default function ErrorState({
  title,
  message,
  error,
  onRetry,
  retryLabel = '다시 시도',
  className = '',
}: ErrorStateProps) {
  const errorType = error ? getErrorType(error) : 'unknown'

  return (
    <EnhancedErrorState
      {...(title && { title })}
      message={message}
      errorType={errorType}
      {...(onRetry && { onRetry })}
      retryLabel={retryLabel}
      className={className}
    />
  )
}

