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
  const { isOpen: isKeyboardOpen, keyboardHeight } = useVirtualKeyboard()
  const formRef = useRef<HTMLFormElement>(null)
  const focusedInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)

  useEffect(() => {
    if (!isKeyboardOpen || !scrollOnKeyboardOpen) return

    // 키보드가 열렸을 때 포커스된 입력 필드가 보이도록 스크롤
    if (focusedInputRef.current && scrollIntoView) {
      setTimeout(() => {
        focusedInputRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }, 100)
    }
  }, [isKeyboardOpen, scrollOnKeyboardOpen, scrollIntoView])

  const handleInputFocus = (element: HTMLInputElement | HTMLTextAreaElement) => {
    focusedInputRef.current = element
    
    // 모바일에서 포커스 시 약간의 지연 후 스크롤
    if (scrollIntoView) {
      setTimeout(() => {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }, 300)
    }
  }

  const handleInputBlur = () => {
    focusedInputRef.current = null
  }

  return {
    formRef,
    isKeyboardOpen,
    keyboardHeight,
    handleInputFocus,
    handleInputBlur,
  }
}

