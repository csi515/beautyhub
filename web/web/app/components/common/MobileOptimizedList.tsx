'use client'

import { ReactNode } from 'react'
import clsx from 'clsx'

type MobileOptimizedListProps = {
  children: ReactNode
  className?: string
  /** 모바일에서 카드 뷰, 데스크톱에서 테이블 뷰 */
  mobileCardView?: boolean
  /** 빈 상태 메시지 */
  emptyMessage?: string
  /** 로딩 상태 */
  loading?: boolean
}

/**
 * 모바일 최적화 리스트 컴포넌트
 * 모바일에서는 카드 뷰, 데스크톱에서는 테이블 뷰 제공
 */
export default function MobileOptimizedList({
  children,
  className = '',
  mobileCardView = true,
  emptyMessage,
  loading,
}: MobileOptimizedListProps) {
  if (loading) {
    return (
      <div className={clsx('space-y-3', className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-neutral-200 p-4 animate-pulse">
            <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2" />
            <div className="h-4 bg-neutral-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={clsx(
      mobileCardView ? 'md:hidden space-y-3' : '',
      className
    )}>
      {children}
      {emptyMessage && (
        <div className="text-center py-12 text-neutral-500">
          {emptyMessage}
        </div>
      )}
    </div>
  )
}

