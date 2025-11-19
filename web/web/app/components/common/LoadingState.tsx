'use client'

import { Skeleton } from '../ui/Skeleton'

type LoadingStateProps = {
  rows?: number
  columns?: number
  variant?: 'table' | 'card' | 'list'
  className?: string
}

/**
 * 로딩 상태 컴포넌트
 * 다양한 레이아웃에 맞는 스켈레톤 UI 제공
 */
export default function LoadingState({
  rows = 5,
  columns = 3,
  variant = 'list',
  className = '',
}: LoadingStateProps) {
  if (variant === 'table') {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-b border-neutral-200">
            {Array.from({ length: columns }).map((_, j) => (
              <Skeleton key={j} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-5">
            <Skeleton className="h-5 w-1/2 mb-3" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  // list variant (default)
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-neutral-200 p-4">
          <Skeleton className="h-5 w-1/3 mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  )
}

