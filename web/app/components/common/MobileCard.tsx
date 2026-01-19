'use client'

import { ReactNode } from 'react'
import clsx from 'clsx'

type MobileCardProps = {
  children: ReactNode
  onClick?: () => void
  className?: string
  /** 터치 피드백 활성화 */
  touchFeedback?: boolean
  /** 호버 효과 (데스크톱) */
  hover?: boolean
}

/**
 * 모바일 최적화 카드 컴포넌트
 * 터치 피드백 및 반응형 디자인 포함
 */
export default function MobileCard({
  children,
  onClick,
  className = '',
  touchFeedback = true,
  hover = true,
}: MobileCardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-white rounded-xl border border-neutral-200 shadow-md',
        'transition-all duration-200',
        touchFeedback && [
          'touch-feedback',
          'active:bg-neutral-50 active:scale-[0.98]',
        ],
        hover && 'hover:shadow-lg hover:border-primary-200 hover:-translate-y-0.5',
        onClick && [
          'cursor-pointer',
          'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
        ],
        className
      )}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onClick()
        }
      }}
    >
      {children}
    </div>
  )
}

