'use client'

import { useEffect, useState } from 'react'

type NetworkStatus = 'online' | 'offline' | 'slow'

/**
 * 네트워크 상태 감지 훅
 * 모바일에서 네트워크 연결 상태 및 속도 감지
 */
export function useNetworkStatus() {
  const [status, setStatus] = useState<NetworkStatus>('online')
  const [effectiveType, setEffectiveType] = useState<string | null>(null)
  const [downlink, setDownlink] = useState<number | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !navigator) return

    const updateStatus = () => {
      // 온라인/오프라인 상태
      const isOnline = navigator.onLine
      setStatus(isOnline ? 'online' : 'offline')

      // Network Information API 지원 시 (Chrome, Edge)
      const connection = (navigator as any).connection || 
                         (navigator as any).mozConnection || 
                         (navigator as any).webkitConnection

      if (connection) {
        setEffectiveType(connection.effectiveType || null)
        setDownlink(connection.downlink || null)

        // 느린 연결 감지 (2G, slow-2g)
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
          setStatus('slow')
        }
      }
    }

    updateStatus()

    // 이벤트 리스너 등록
    window.addEventListener('online', updateStatus)
    window.addEventListener('offline', updateStatus)

    const connection = (navigator as any).connection || 
                       (navigator as any).mozConnection || 
                       (navigator as any).webkitConnection

    if (connection) {
      connection.addEventListener('change', updateStatus)
    }

    return () => {
      window.removeEventListener('online', updateStatus)
      window.removeEventListener('offline', updateStatus)
      if (connection) {
        connection.removeEventListener('change', updateStatus)
      }
    }
  }, [])

  return {
    status,
    isOnline: status === 'online',
    isOffline: status === 'offline',
    isSlow: status === 'slow',
    effectiveType,
    downlink,
  }
}

