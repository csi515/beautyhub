'use client'

/**
 * 모바일 최적화 유틸리티 (레거시 호환성)
 * @deprecated 각 기능별 파일로 분할되었습니다. 직접 import하세요.
 * - deviceDetection.ts: isMobile, isTouchDevice, isIOS, isAndroid
 * - viewportUtils.ts: getViewportHeight, getMobileBrowserChromeHeight, getSafeAreaInsets
 * - scrollUtils.ts: saveScrollPosition, restoreScrollPosition, scrollToInput
 * - keyboardUtils.ts: isKeyboardOpen
 */

export { isMobile, isTouchDevice, isIOS, isAndroid } from './deviceDetection'
export { getViewportHeight, getMobileBrowserChromeHeight, getSafeAreaInsets } from './viewportUtils'
export { saveScrollPosition, restoreScrollPosition, scrollToInput } from './scrollUtils'
export { isKeyboardOpen } from './keyboardUtils'
