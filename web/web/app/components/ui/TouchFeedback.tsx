'use client'

import { useState, useRef, useEffect } from 'react'

type TouchFeedbackProps = {
  children: React.ReactNode
  className?: string
  /** 활성화 시 배경색 변경 */
  activeBg?: string
  /** 활성화 시 스케일 변경 */
  activeScale?: number
}

/**
 * 터치 피드백 컴포넌트
 * 모바일에서 터치 시 시각적 피드백 제공
 */
export function TouchFeedback({
  children,
  className = '',
  activeBg = 'bg-neutral-100',
  activeScale = 0.98,
}: TouchFeedbackProps) {
  const [isActive, setIsActive] = useState(false)
  const timeoutRef = useRef<number | null>(null)

  const handleTouchStart = () => {
    setIsActive(true)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  const handleTouchEnd = () => {
    timeoutRef.current = window.setTimeout(() => {
      setIsActive(false)
    }, 150)
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
      className={`
        transition-all duration-150 touch-manipulation
        ${isActive ? `${activeBg} scale-[${activeScale}]` : ''}
        ${className}
      `}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
    >
      {children}
    </div>
  )
}

