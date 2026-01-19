'use client'

import { isMobile } from './deviceDetection'

/**
 * 뷰포트 유틸리티
 * 뷰포트 높이, Safe Area, 브라우저 크롬 높이 계산
 */

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
