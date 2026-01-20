'use client'

import { useEffect, useRef } from 'react'
import { useVirtualKeyboard } from './useVirtualKeyboard'

type UseMobileOptimizedFormOptions = {
  /** 키보드가 열릴 때 스크롤할지 여부 */
  scrollOnKeyboardOpen?: boolean
  /** 포커스된 필드가 키보드에 가려지지 않도록 스크롤 */
  scrollIntoView?: boolean
}

/**
 * 모바일 폼 최적화 훅
 * 가상 키보드 대응 및 포커스 관리
 */
export function useMobileOptimizedForm(options: UseMobileOptimizedFormOptions = {}) {
  const { scrollOnKeyboardOpen = true, scrollIntoView = true } = options
  const { isVisible: isKeyboardOpen } = useVirtualKeyboard()
  const formRef = useRef<HTMLFormElement>(null)
  const focusedInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)

  useEffect(() => {
    if (!isKeyboardOpen || !scrollOnKeyboardOpen) return

    // 키보드가 열렸을 때 포커스된 입력 필드가 키보드 위에 보이도록 스크롤
    if (focusedInputRef.current && scrollIntoView && typeof window !== 'undefined') {
      setTimeout(() => {
        const element = focusedInputRef.current
        if (!element) return

        const rect = element.getBoundingClientRect()
        const viewportHeight = window.visualViewport?.height || window.innerHeight
        const initialHeight = window.innerHeight
        
        // 가상 키보드 높이 계산
        const keyboardHeight = window.visualViewport 
          ? initialHeight - viewportHeight
          : Math.min(viewportHeight * 0.4, 350)
        
        const inputBottom = rect.bottom
        const padding = 20
        const availableHeight = viewportHeight - keyboardHeight
        const targetPosition = availableHeight - padding

        if (inputBottom > targetPosition) {
          const scrollOffset = inputBottom - targetPosition
          const currentScrollY = window.scrollY || window.pageYOffset
          
          window.scrollTo({
            top: currentScrollY + scrollOffset,
            behavior: 'smooth',
          })
        }
      }, 150) // 키보드 열림 애니메이션 중간 시점
    }
  }, [isKeyboardOpen, scrollOnKeyboardOpen, scrollIntoView])

  const handleInputFocus = (element: HTMLInputElement | HTMLTextAreaElement) => {
    focusedInputRef.current = element
    
    // 모바일에서 포커스 시 가상 키보드 높이를 고려한 스크롤
    if (scrollIntoView && typeof window !== 'undefined') {
      setTimeout(() => {
        const rect = element.getBoundingClientRect()
        const viewportHeight = window.visualViewport?.height || window.innerHeight
        const initialHeight = window.innerHeight
        
        // 가상 키보드 높이 추정 (일반적으로 250-350px)
        // visualViewport가 있으면 더 정확하게 계산
        const keyboardHeight = window.visualViewport 
          ? initialHeight - viewportHeight
          : Math.min(viewportHeight * 0.4, 350) // 최대 350px
        
        // 입력 필드 하단 위치
        const inputBottom = rect.bottom
        // 키보드 위에 표시할 여유 공간
        const padding = 20
        
        // 입력 필드가 키보드에 가려지는지 확인
        const availableHeight = viewportHeight - keyboardHeight
        const targetPosition = availableHeight - padding
        
        if (inputBottom > targetPosition) {
          // 스크롤이 필요한 경우
          const scrollOffset = inputBottom - targetPosition
          
          // visualViewport API를 사용하여 더 정확한 스크롤
          if (window.visualViewport) {
            const currentScrollY = window.scrollY || window.pageYOffset
            window.scrollTo({
              top: currentScrollY + scrollOffset,
              behavior: 'smooth',
            })
          } else {
            // Fallback: scrollIntoView 사용
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            })
          }
        }
      }, 350) // 키보드 애니메이션 완료 대기
    }
  }

  const handleInputBlur = () => {
    focusedInputRef.current = null
  }

  return {
    formRef,
    isKeyboardOpen,
    handleInputFocus,
    handleInputBlur,
  }
}

