/**
 * PWA 관련 유틸리티 함수
 * PWA 설치, 업데이트, 오프라인 상태 관리
 */

import type { BeforeInstallPromptEvent } from '../hooks/usePWA'

/**
 * PWA 설치 프롬프트 표시
 */
export async function promptPWAInstall(installPrompt: BeforeInstallPromptEvent): Promise<boolean> {
  try {
    await installPrompt.prompt()
    const choiceResult = await installPrompt.userChoice
    return choiceResult.outcome === 'accepted'
  } catch (error) {
    console.error('PWA 설치 프롬프트 실패:', error)
    return false
  }
}

/**
 * Service Worker 업데이트 확인 및 적용
 */
export function checkServiceWorkerUpdate(
  onUpdateAvailable?: () => void,
  onUpdateApplied?: () => void
) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return
  }

  navigator.serviceWorker.ready.then((registration) => {
    // 주기적으로 업데이트 확인
    setInterval(() => {
      registration.update()
    }, 60000) // 1분마다 확인

    // 업데이트 발견 시
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // 새 버전이 설치되었을 때
            onUpdateAvailable?.()
          } else if (newWorker.state === 'activated') {
            // 새 버전이 활성화되었을 때
            onUpdateApplied?.()
          }
        })
      }
    })
  })
}

/**
 * Service Worker 업데이트 적용
 */
export function applyServiceWorkerUpdate() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return
  }

  navigator.serviceWorker.ready.then((registration) => {
    if (registration.waiting) {
      // 대기 중인 Service Worker에 메시지 전송
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    }
  })

  // 컨트롤러 변경 시 페이지 새로고침
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload()
  })
}

/**
 * 오프라인 상태 확인
 */
export function isOffline(): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  return !navigator.onLine
}

/**
 * 네트워크 연결 상태 확인 (실제 연결 테스트)
 */
export async function checkNetworkConnection(timeout: number = 3000): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    const response = await fetch('/api/health', {
      method: 'HEAD',
      cache: 'no-cache',
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    return response.ok
  } catch {
    return false
  }
}
