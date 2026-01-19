'use client'

import { RefreshCw } from 'lucide-react'
import { usePullToRefresh } from '@/app/lib/hooks/usePullToRefresh'

type PullToRefreshProps = {
  onRefresh: () => Promise<void> | void
  children: React.ReactNode
  enabled?: boolean
  className?: string
}

/**
 * Pull-to-Refresh 컴포넌트
 * 모바일에서 아래로 당겨서 새로고침
 */
export default function PullToRefresh({
  onRefresh,
  children,
  enabled = true,
  className = '',
}: PullToRefreshProps) {
  const { containerRef, isPulling, pullProgress } = usePullToRefresh({
    onRefresh,
    enabled,
  })

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{
        touchAction: 'pan-y',
      }}
    >
      {/* Pull Indicator */}
      {isPulling && (
        <div
          className="fixed top-0 left-0 right-0 z-[1100] flex items-center justify-center bg-white/95 backdrop-blur-sm transition-all duration-200 md:hidden"
          style={{
            height: `${Math.min(pullProgress * 60, 60)}px`,
            opacity: pullProgress,
            transform: `translateY(${pullProgress > 1 ? 0 : -60 + pullProgress * 60}px)`,
          }}
        >
          <div className="flex items-center gap-2 text-secondary-600">
            <RefreshCw
              className="h-5 w-5 animate-spin"
              style={{
                animationDuration: '1s',
              }}
            />
            <span className="text-sm font-medium">
              {pullProgress >= 1 ? '놓으면 새로고침' : '당겨서 새로고침'}
            </span>
          </div>
        </div>
      )}
      {children}
    </div>
  )
}

