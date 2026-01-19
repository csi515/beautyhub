'use client'

/**
 * 스크롤 유틸리티
 * 스크롤 위치 저장/복원 및 입력 필드 스크롤
 */

/**
 * 스크롤 위치 저장
 */
export function saveScrollPosition(key: string): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(`scroll:${key}`, String(window.scrollY))
}

/**
 * 스크롤 위치 복원
 */
export function restoreScrollPosition(key: string): void {
  if (typeof window === 'undefined') return
  const saved = sessionStorage.getItem(`scroll:${key}`)
  if (saved) {
    window.scrollTo(0, parseInt(saved, 10))
  }
}

/**
 * 모바일에서 입력 필드 포커스 시 자동 스크롤
 */
export function scrollToInput(input: HTMLElement, offset: number = 100): void {
  if (!input) return
  
  const rect = input.getBoundingClientRect()
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const targetY = rect.top + scrollTop - offset
  
  window.scrollTo({
    top: targetY,
    behavior: 'smooth',
  })
}
