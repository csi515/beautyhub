'use client'

import { useEffect, useState } from 'react'

/**
 * 가상 키보드 감지 훅
 * 모바일에서 키보드가 열렸는지 감지
 */
export function useVirtualKeyboard() {
  const [isOpen, setIsOpen] = useState(false)
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const viewportHeight = window.visualViewport?.height || window.innerHeight
    const initialHeight = viewportHeight

    const handleResize = () => {
      const currentHeight = window.visualViewport?.height || window.innerHeight
      const heightDiff = initialHeight - currentHeight

      // 키보드가 열린 것으로 간주하는 임계값 (150px)
      if (heightDiff > 150) {
        setIsOpen(true)
        setKeyboardHeight(heightDiff)
      } else {
        setIsOpen(false)
        setKeyboardHeight(0)
      }
    }

    // Visual Viewport API 지원 시
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize)
    } else {
      window.addEventListener('resize', handleResize)
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize)
      } else {
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [])

  return {
    isOpen,
    keyboardHeight,
  }
}

