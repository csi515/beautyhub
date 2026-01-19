'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useHapticFeedback } from './useHapticFeedback'

type UseMobileGestureNavigationOptions = {
  enabled?: boolean
  onBack?: () => void
}

/**
 * 모바일 제스처 네비게이션 훅
 * 뒤로가기 제스처 및 엣지 스와이프 지원
 */
export function useMobileGestureNavigation({
  enabled = true,
  onBack,
}: UseMobileGestureNavigationOptions = {}) {
  const router = useRouter()
  const { light } = useHapticFeedback()
  const startXRef = useRef<number>(0)
  const startYRef = useRef<number>(0)
  const isTrackingRef = useRef<boolean>(false)
  const edgeThreshold = 20 // 화면 왼쪽 20px 이내

  const handleBack = useCallback(() => {
    light() // 햅틱 피드백
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }, [router, onBack, light])

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0]!
        startXRef.current = touch.clientX
        startYRef.current = touch.clientY
        
        // 왼쪽 엣지에서 시작하는 경우만 추적
        if (startXRef.current <= edgeThreshold) {
          isTrackingRef.current = true
        }
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isTrackingRef.current || e.touches.length === 0) return
      
      const touch = e.touches[0]!
      const deltaX = touch.clientX - startXRef.current
      const deltaY = Math.abs(touch.clientY - startYRef.current)
      
      // 수평 이동이 수직 이동보다 크고, 오른쪽으로 스와이프하는 경우
      if (deltaX > 50 && deltaX > deltaY * 1.5) {
        // 뒤로가기 제스처 감지
        // 시각적 피드백은 여기서 처리하지 않음 (브라우저 기본 동작 사용)
      } else if (deltaY > 30) {
        // 수직 이동이 크면 취소
        isTrackingRef.current = false
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isTrackingRef.current) return
      
      if (e.changedTouches.length > 0) {
        const touch = e.changedTouches[0]!
        const deltaX = touch.clientX - startXRef.current
        const deltaY = Math.abs(touch.clientY - startYRef.current)
        
        // 오른쪽으로 충분히 스와이프했고, 수직 이동이 적은 경우
        if (deltaX > 100 && deltaX > deltaY * 1.5) {
          handleBack()
        }
      }
      
      isTrackingRef.current = false
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchmove', handleTouchMove, { passive: true })
    document.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [enabled, handleBack])

  return {
    // 제스처 네비게이션 활성화 여부
    enabled,
  }
}
