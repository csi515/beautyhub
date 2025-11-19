/**
 * Service Worker 등록 유틸리티
 */

export function registerServiceWorker() {
  if (typeof window === 'undefined') {
    return
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js', {
          scope: '/',
        })
        .then((registration) => {
          // eslint-disable-next-line no-console
          console.log('[Service Worker] 등록 성공:', registration.scope)

          // 업데이트 확인
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // 새 버전이 설치되었을 때 사용자에게 알림 (선택사항)
                  // eslint-disable-next-line no-console
                  console.log('[Service Worker] 새 버전이 설치되었습니다.')
                }
              })
            }
          })
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error('[Service Worker] 등록 실패:', error)
        })

      // Service Worker 업데이트 확인
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // eslint-disable-next-line no-console
        console.log('[Service Worker] 컨트롤러가 변경되었습니다.')
        // 필요시 페이지 새로고침
        // window.location.reload()
      })
    })
  } else {
    // eslint-disable-next-line no-console
    console.warn('[Service Worker] 이 브라우저는 Service Worker를 지원하지 않습니다.')
  }
}

export function unregisterServiceWorker() {
  if (typeof window === 'undefined') {
    return
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister()
        // eslint-disable-next-line no-console
        console.log('[Service Worker] 등록 해제 완료')
      })
      .catch((error) => {
        console.error('[Service Worker] 등록 해제 실패:', error)
      })
  }
}

