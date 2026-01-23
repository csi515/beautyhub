'use client'

import { useEffect } from 'react'
import { registerServiceWorker } from '../lib/utils/serviceWorker'
import { checkServiceWorkerUpdate, applyServiceWorkerUpdate } from '../lib/utils/pwa'
import { useAppToast } from '../lib/ui/toast'

/**
 * Service Worker 등록 컴포넌트
 * 앱이 마운트될 때 Service Worker를 등록하고 업데이트를 감지합니다.
 */
export default function ServiceWorkerRegistration() {
  const toast = useAppToast()

  useEffect(() => {
    registerServiceWorker()

    // Service Worker 업데이트 감지
    checkServiceWorkerUpdate(
      () => {
        // 새 버전이 설치되었을 때
        toast.info(
          '새 버전이 사용 가능합니다',
          '페이지를 새로고침하여 업데이트를 적용하세요'
        )
        // 자동으로 업데이트 적용
        setTimeout(() => {
          applyServiceWorkerUpdate()
        }, 2000) // 2초 후 자동 적용
      },
      () => {
        // 새 버전이 적용되었을 때
        toast.success('앱이 업데이트되었습니다.')
      }
    )
  }, [toast])

  return null
}

