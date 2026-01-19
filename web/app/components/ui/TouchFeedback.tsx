'use client'

import { useState, useRef, useEffect } from 'react'
import { useHapticFeedback } from '@/app/lib/hooks/useHapticFeedback'
import clsx from 'clsx'

type TouchFeedbackProps = {
  children: React.ReactNode
  className?: string
  activeBg?: string
  activeScale?: number
  haptic?: boolean
  disabled?: boolean
  onPress?: () => void
}

/**
 * 터치 피드백 컴포넌트
 * 모바일에서 터치 시 시각적 및 햅틱 피드백 제공
 */
export function TouchFeedback({
  children,
  className = '',
  activeBg = 'bg-neutral-100',
  activeScale = 0.98,
  haptic = true,
  disabled = false,
  onPress,
}: TouchFeedbackProps) {
  const [isActive, setIsActive] = useState(false)
  const { light } = useHapticFeedback()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleTouchStart = () => {
    if (disabled) return
    setIsActive(true)
    if (haptic) {
      light()
    }
  }

  const handleTouchEnd = () => {
    if (disabled) return
    
    // 짧은 딜레이로 피드백 유지
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      setIsActive(false)
      onPress?.()
    }, 100)
  }

  const handleTouchCancel = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsActive(false)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <div
      className={clsx(
        'touch-manipulation transition-all duration-150',
        isActive && !disabled && [
          activeBg,
          `scale-[${activeScale}]`,
        ],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      style={{
        transform: isActive && !disabled ? `scale(${activeScale})` : 'scale(1)',
        transition: 'transform 150ms ease-out, background-color 150ms ease-out',
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchCancel}
    >
      {children}
    </div>
  )
}
