'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

type UseVirtualKeyboardOptions = {
  onShow?: () => void
  onHide?: () => void
  enabled?: boolean
}

/**
 * 가상 키보드 감지 훅
 * 모바일에서 가상 키보드가 열리고 닫힐 때를 감지
 */
export function useVirtualKeyboard({
  onShow,
  onHide,
  enabled = true,
}: UseVirtualKeyboardOptions = {}) {
  const [isVisible, setIsVisible] = useState(false)
  const initialViewportHeight = useRef<number>(0)

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    // 초기 뷰포트 높이 저장
    initialViewportHeight.current = window.visualViewport?.height || window.innerHeight

    const handleResize = () => {
      if (!window.visualViewport) return

      const currentHeight = window.visualViewport.height
      const wasVisible = isVisible
      const nowVisible = currentHeight < initialViewportHeight.current * 0.75 // 75% 이하면 키보드가 열린 것으로 간주

      if (nowVisible !== wasVisible) {
        setIsVisible(nowVisible)
        if (nowVisible) {
          onShow?.()
        } else {
          onHide?.()
        }
      }
    }

    // Visual Viewport API 사용 (모바일 브라우저 지원)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize)
    } else {
      // Fallback: window resize 이벤트
      window.addEventListener('resize', handleResize)
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize)
      } else {
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [enabled, isVisible, onShow, onHide])

  const scrollToInput = useCallback((element: HTMLElement) => {
    if (!element) return

    // 입력 필드가 뷰포트에 보이도록 스크롤
    const rect = element.getBoundingClientRect()
    const viewportHeight = window.visualViewport?.height || window.innerHeight
    const inputBottom = rect.bottom
    const keyboardHeight = viewportHeight * 0.3 // 예상 키보드 높이

    if (inputBottom > viewportHeight - keyboardHeight) {
      const scrollOffset = inputBottom - (viewportHeight - keyboardHeight) + 20 // 여유 공간
      window.scrollBy({
        top: scrollOffset,
        behavior: 'smooth',
      })
    }
  }, [])

  return {
    isVisible,
    scrollToInput,
  }
}
