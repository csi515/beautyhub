'use client'

import { useEffect, useRef, useCallback } from 'react'

type UseMobileScrollOptimizationOptions = {
  enabled?: boolean
  debounceMs?: number
}

/**
 * 모바일 스크롤 성능 최적화 훅
 * 스크롤 이벤트 최적화 및 GPU 가속
 */
export function useMobileScrollOptimization({
  enabled = true,
  debounceMs = 16, // ~60fps
}: UseMobileScrollOptimizationOptions = {}) {
  const rafRef = useRef<number | null>(null)
  const lastScrollTime = useRef<number>(0)

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    const handleScroll = () => {
      const now = Date.now()
      
      // 디바운스 (60fps 제한)
      if (now - lastScrollTime.current < debounceMs) {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current)
        }
        rafRef.current = requestAnimationFrame(() => {
          lastScrollTime.current = Date.now()
        })
        return
      }

      lastScrollTime.current = now
    }

    // Passive 이벤트 리스너로 스크롤 성능 개선
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [enabled, debounceMs])

  // 스크롤 컨테이너에 GPU 가속 적용
  const optimizeScrollContainer = useCallback((element: HTMLElement | null) => {
    if (!element) return

    // GPU 가속을 위한 transform 적용
    element.style.willChange = 'scroll-position'
    element.style.transform = 'translateZ(0)'
    
    // iOS 스크롤 최적화
    ;(element.style as any).webkitOverflowScrolling = 'touch'
  }, [])

  return {
    optimizeScrollContainer,
  }
}
