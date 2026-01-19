'use client'

import { getViewportHeight } from './viewportUtils'

/**
 * 키보드 유틸리티
 * 가상 키보드 감지
 */

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
