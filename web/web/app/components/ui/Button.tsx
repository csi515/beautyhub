'use client'

import clsx from 'clsx'
import { memo, useState } from 'react'
import type { ReactNode } from 'react'
import { useRipple } from '@/app/lib/hooks/useRipple'
import { useHapticFeedback } from '@/app/lib/hooks/useHapticFeedback'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'contrast'
  size?: 'sm' | 'md' | 'lg'
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  ripple?: boolean
  loading?: boolean
}

function Button({ 
  variant = 'primary', 
  size = 'md', 
  className, 
  leftIcon,
  rightIcon,
  ripple = true,
  disabled,
  loading = false,
  onClick,
  ...rest 
}: Props) {
  const { ripples, addRipple } = useRipple()
  const [isHovered, setIsHovered] = useState(false)

  const base =
    'relative inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants: Record<string, string> = {
    // Primary: action-blue 배경, 흰색 텍스트 (저장 버튼용)
    primary:
      'rounded-xl active:scale-[0.98] focus-visible:ring-action-blue-300 shadow-md hover:shadow-lg',
    // Secondary: cancel-gray 배경, 흰색 텍스트 (취소 버튼용)
    secondary:
      'rounded-xl active:scale-[0.98] focus-visible:ring-cancel-gray-300 shadow-md hover:shadow-lg',
    // Outline: 투명 배경, 테두리
    outline:
      'rounded-xl border-2 active:scale-[0.98] focus-visible:ring-secondary-300',
    // Ghost: 투명 배경, 호버 시 배경
    ghost:
      'rounded-xl active:scale-[0.98] focus-visible:ring-secondary-300',
    // Danger: 에러 색상 배경, 흰색 텍스트 (삭제 버튼용)
    danger:
      'rounded-xl active:scale-[0.98] focus-visible:ring-error-300 shadow-md hover:shadow-lg',
    // Contrast: 흰색 배경, 테두리
    contrast:
      'rounded-xl border-2 active:scale-[0.98] focus-visible:ring-secondary-300 shadow-sm hover:shadow-md',
  }
  
  const sizes: Record<string, string> = {
    sm: 'h-10 px-5 py-2.5 text-sm gap-2 min-w-[80px] min-h-[44px]',
    md: 'h-11 px-5 py-2.5 text-base gap-2 min-w-[100px] min-h-[44px]',
    lg: 'h-14 px-10 py-3.5 text-lg gap-2 min-w-[120px] min-h-[48px]'
  }

  const isDisabled = disabled || loading

  const haptic = useHapticFeedback()

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isDisabled) {
      if (ripple) {
        addRipple(e)
      }
      // 모바일에서 햅틱 피드백 제공
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        haptic.light()
      }
    }
    onClick?.(e)
  }

  const handleTouchStart = (_e: React.TouchEvent<HTMLButtonElement>) => {
    // 모바일에서만 터치 이벤트 처리
    // onClick과 중복 실행 방지
    if (!isDisabled && onClick && typeof window !== 'undefined' && window.innerWidth < 768) {
      // 기본 동작은 prevent하지 않음 (브라우저 기본 터치 처리 유지)
      // onClick이 자동으로 처리됨
    }
  }

  const getStyle = () => {
    // Primary (저장 버튼): action-blue
    if (variant === 'primary') {
      return { 
        backgroundColor: isHovered ? '#364fc7' : '#4263eb',
        color: '#ffffff' 
      }
    }
    // Secondary (취소 버튼): cancel-gray
    if (variant === 'secondary') {
      return { 
        backgroundColor: isHovered ? '#5a6268' : '#6c757d',
        color: '#ffffff' 
      }
    }
    // Danger (삭제 버튼): error 색상
    if (variant === 'danger') {
      return { 
        backgroundColor: isHovered ? '#DC2626' : '#EF4444',
        color: '#ffffff' 
      }
    }
    // Outline: 투명 배경 + secondary 색상 테두리
    if (variant === 'outline') {
      return { 
        backgroundColor: isHovered ? 'rgba(66, 99, 235, 0.1)' : 'transparent', 
        borderColor: '#4263eb', 
        color: isHovered ? '#4263eb' : '#4263eb' 
      }
    }
    // Ghost: 투명 배경
    if (variant === 'ghost') {
      return { 
        backgroundColor: isHovered ? 'rgba(66, 99, 235, 0.1)' : 'transparent', 
        borderColor: 'transparent', 
        color: isHovered ? '#4263eb' : '#64748B' 
      }
    }
    // Contrast: 흰 배경 + 테두리
    if (variant === 'contrast') {
      return { 
        backgroundColor: isHovered ? '#F3F4F6' : '#ffffff', 
        borderColor: '#D1D5DB', 
        color: isHovered ? '#1C1A1B' : '#1C1A1B' 
      }
    }
    return {}
  }

  // 접근성: aria-label이 없고 children이 문자열이 아닐 때 자동 생성
  const ariaLabel = rest['aria-label'] || (typeof rest.children === 'string' ? rest.children : undefined)
  
  return (
    <button 
      className={clsx(base, variants[variant], sizes[size], className)} 
      style={getStyle()}
      disabled={isDisabled}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-disabled={isDisabled}
      aria-label={ariaLabel}
      aria-busy={loading}
      {...rest}
    >
      <span className={clsx('inline-flex items-center gap-inherit', loading && 'opacity-70')}>
        {loading && (
          <span className="flex-shrink-0">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
        )}
        {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        <span>{rest.children}</span>
        {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </span>
      {ripples.map((ripple, index) => (
        <span
          key={index}
          className="ripple-effect"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
          }}
        />
      ))}
    </button>
  )
}

export default memo(Button)


