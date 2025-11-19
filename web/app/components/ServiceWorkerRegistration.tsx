'use client'

import { useEffect } from 'react'
import { registerServiceWorker } from '../lib/utils/serviceWorker'

/**
 * Service Worker 등록 컴포넌트
 * 앱이 마운트될 때 Service Worker를 등록합니다.
 */
export default function ServiceWorkerRegistration() {
  useEffect(() => {
    registerServiceWorker()
  }, [])

  return null
}

