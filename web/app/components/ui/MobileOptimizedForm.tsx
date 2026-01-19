'use client'

import { ReactNode } from 'react'
import { useMobileOptimizedForm } from '@/app/lib/hooks/useMobileOptimizedForm'

type MobileOptimizedFormProps = {
  children: ReactNode
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void
  className?: string
  /** 키보드가 열릴 때 스크롤할지 여부 */
  scrollOnKeyboardOpen?: boolean
}

/**
 * 모바일 최적화 폼 컴포넌트
 * 가상 키보드 대응 및 포커스 관리
 */
export default function MobileOptimizedForm({
  children,
  onSubmit,
  className = '',
  scrollOnKeyboardOpen = true,
}: MobileOptimizedFormProps) {
  const { formRef, handleInputFocus, handleInputBlur } = useMobileOptimizedForm({
    scrollOnKeyboardOpen,
  })

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className={className}
      onFocus={(e) => {
        const target = e.target
        if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
          handleInputFocus(target)
        }
      }}
      onBlur={(e) => {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
          handleInputBlur()
        }
      }}
    >
      {children}
    </form>
  )
}

