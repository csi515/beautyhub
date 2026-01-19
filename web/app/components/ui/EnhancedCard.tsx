'use client'

import { ReactNode, MouseEvent } from 'react'
import clsx from 'clsx'

type EnhancedCardProps = {
  children: ReactNode
  className?: string
  onClick?: (e: MouseEvent<HTMLDivElement>) => void
  clickable?: boolean
  hover?: boolean
  variant?: 'default' | 'elevated' | 'outlined' | 'flat'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  shadow?: 'none' | 'sm' | 'md' | 'lg'
}

/**
 * 개선된 카드 컴포넌트
 * 일관된 그림자, 깊이감, 호버 효과
 */
export default function EnhancedCard({
  children,
  className = '',
  onClick,
  clickable = false,
  hover = true,
  variant = 'default',
  padding = 'md',
  shadow = 'md',
}: EnhancedCardProps) {
  const isClickable = clickable || !!onClick

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4 md:p-5',
    lg: 'p-5 md:p-6',
  }

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  }

  const variantClasses = {
    default: 'bg-white border border-neutral-200',
    elevated: 'bg-white border-0',
    outlined: 'bg-transparent border-2 border-neutral-300',
    flat: 'bg-neutral-50 border-0',
  }

  return (
    <div
      onClick={onClick}
      className={clsx(
        'rounded-xl transition-all duration-200',
        variantClasses[variant],
        paddingClasses[padding],
        shadow !== 'none' && shadowClasses[shadow],
        isClickable && [
          'cursor-pointer',
          'focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2',
        ],
        hover && isClickable && [
          'hover:shadow-lg hover:-translate-y-0.5',
          variant === 'default' && 'hover:border-primary-200',
        ],
        isClickable && 'active:scale-[0.99] active:shadow-md',
        className
      )}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onClick?.(e as unknown as MouseEvent<HTMLDivElement>)
        }
      }}
    >
      {children}
    </div>
  )
}
