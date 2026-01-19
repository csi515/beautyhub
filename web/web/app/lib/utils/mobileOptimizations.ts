'use client'

/**
 * 모바일 최적화 유틸리티 함수들
 */

/**
 * 모바일 기기인지 확인
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
}

/**
 * 터치 디바이스인지 확인
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

/**
 * iOS 기기인지 확인
 */
export function isIOS(): boolean {
  if (typeof window === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

/**
 * Android 기기인지 확인
 */
export function isAndroid(): boolean {
  if (typeof window === 'undefined') return false
  return /Android/.test(navigator.userAgent)
}

/**
 * Safe area inset 값 가져오기
 */
export function getSafeAreaInsets(): { top: number; bottom: number; left: number; right: number } {
  if (typeof window === 'undefined') {
    return { top: 0, bottom: 0, left: 0, right: 0 }
  }

  const top = parseInt(getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-top)') || '0', 10)
  const bottom = parseInt(getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-bottom)') || '0', 10)
  const left = parseInt(getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-left)') || '0', 10)
  const right = parseInt(getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-right)') || '0', 10)

  return { top, bottom, left, right }
}

/**
 * 뷰포트 높이 가져오기 (가상 키보드 고려)
 */
export function getViewportHeight(): number {
  if (typeof window === 'undefined') return 0
  
  // Visual Viewport API 지원 시
  if (window.visualViewport) {
    return window.visualViewport.height
  }
  
  return window.innerHeight
}

/**
 * 모바일 브라우저의 주소창 높이 추정
 */
export function getMobileBrowserChromeHeight(): number {
  if (!isMobile()) return 0
  
  const viewportHeight = getViewportHeight()
  const screenHeight = window.screen.height
  
  // 주소창 높이 추정 (일반적으로 60-80px)
  return Math.max(0, screenHeight - viewportHeight)
}

/**
 * 스크롤 위치 저장 및 복원
 */
export function saveScrollPosition(key: string): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(`scroll:${key}`, String(window.scrollY))
}

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

/**
 * 모바일에서 키보드가 열렸는지 감지
 */
export function isKeyboardOpen(): boolean {
  if (typeof window === 'undefined') return false
  
  const viewportHeight = getViewportHeight()
  const windowHeight = window.innerHeight
  
  // 키보드가 열리면 viewport height가 window height보다 작아짐
  return windowHeight - viewportHeight > 150
}

