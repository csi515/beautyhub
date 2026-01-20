/**
 * 단축키 관리 유틸리티
 */

export interface ShortcutHandler {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  handler: () => void
  description?: string
}

class ShortcutManager {
  private handlers: Map<string, ShortcutHandler> = new Map()

  /**
   * 단축키 등록
   */
  register(handler: ShortcutHandler): () => void {
    const key = this.getKeyString(handler)
    this.handlers.set(key, handler)

    // 등록 해제 함수 반환
    return () => {
      this.handlers.delete(key)
    }
  }

  /**
   * 단축키 키 문자열 생성
   */
  private getKeyString(handler: ShortcutHandler): string {
    const parts: string[] = []
    if (handler.ctrl) parts.push('ctrl')
    if (handler.shift) parts.push('shift')
    if (handler.alt) parts.push('alt')
    parts.push(handler.key.toLowerCase())
    return parts.join('+')
  }

  /**
   * 키보드 이벤트 처리
   */
  handleKeyDown(event: KeyboardEvent): void {
    const key = event.key.toLowerCase()
    const ctrl = event.ctrlKey || event.metaKey
    const shift = event.shiftKey
    const alt = event.altKey

    const keyString = `${ctrl ? 'ctrl+' : ''}${shift ? 'shift+' : ''}${alt ? 'alt+' : ''}${key}`
    const handler = this.handlers.get(keyString)

    if (handler) {
      event.preventDefault()
      event.stopPropagation()
      handler.handler()
    }
  }
}

// 싱글톤 인스턴스
export const shortcutManager = new ShortcutManager()

/**
 * 전역 단축키 리스너 초기화 (브라우저 환경에서만)
 */
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (event) => {
    shortcutManager.handleKeyDown(event)
  })
}

/**
 * 기본 단축키 등록
 */
export function registerDefaultShortcuts() {
  if (typeof window === 'undefined') return

  // `/` 키로 검색 포커스
  shortcutManager.register({
    key: '/',
    handler: () => {
      const searchInput = document.querySelector('input[type="search"], input[placeholder*="검색"]') as HTMLInputElement
      if (searchInput) {
        searchInput.focus()
        searchInput.select()
      }
    },
    description: '검색 포커스',
  })

  // `Ctrl/Cmd + K` 키로 빠른 검색
  shortcutManager.register({
    key: 'k',
    ctrl: true,
    handler: () => {
      // 빠른 검색 모달 열기 (구현 필요)
      console.log('빠른 검색 열기')
    },
    description: '빠른 검색',
  })

  // `Esc` 키로 모달 닫기
  shortcutManager.register({
    key: 'Escape',
    handler: () => {
      // 열려있는 모달 닫기
      const modals = document.querySelectorAll('[role="dialog"], .modal-open')
      if (modals.length > 0) {
        const closeButton = document.querySelector('[aria-label="Close"], [aria-label="닫기"], button[data-modal-close]') as HTMLButtonElement
        if (closeButton) {
          closeButton.click()
        }
      }
    },
    description: '모달 닫기',
  })
}

// 기본 단축키 자동 등록
if (typeof window !== 'undefined') {
  registerDefaultShortcuts()
}
