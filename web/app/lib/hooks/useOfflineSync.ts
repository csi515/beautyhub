/**
 * 오프라인 동기화 훅
 */

import { useEffect, useState, useCallback } from 'react'
import { getOfflineQueue, removeFromOfflineQueue } from '../utils/offlineStorage'

export interface UseOfflineSyncReturn {
  pendingOperations: number
  isSyncing: boolean
  sync: () => Promise<void>
}

/**
 * 오프라인 동기화 훅
 */
export function useOfflineSync(enabled: boolean = true): UseOfflineSyncReturn {
  const [pendingOperations, setPendingOperations] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)

  const checkPendingOperations = useCallback(async () => {
    if (!enabled) return

    try {
      const queue = await getOfflineQueue()
      setPendingOperations(queue.length)
    } catch (error) {
      console.error('대기 중인 작업 확인 실패:', error)
    }
  }, [enabled])

  const sync = useCallback(async () => {
    if (isSyncing) return

    try {
      setIsSyncing(true)
      const queue = await getOfflineQueue()

      // 큐가 비어있으면 동기화 불필요
      if (queue.length === 0) {
        setPendingOperations(0)
        return
      }

      // 네트워크 상태 확인
      if (!navigator.onLine) {
        console.log('오프라인 상태: 동기화 대기 중')
        return
      }

      // 각 작업을 순차적으로 실행
      for (const operation of queue) {
        try {
          // API 호출 시뮬레이션 (실제로는 각 타입에 맞는 API 호출)
          let url = ''
          let method = 'POST'
          let body = operation.data

          switch (operation.type) {
            case 'create':
              url = `/api/${operation.store}`
              method = 'POST'
              break
            case 'update':
              url = `/api/${operation.store}/${operation.data.id}`
              method = 'PATCH'
              break
            case 'delete':
              url = `/api/${operation.store}/${operation.data.id}`
              method = 'DELETE'
              body = undefined
              break
          }

          const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: body ? JSON.stringify(body) : undefined,
          })

          if (response.ok) {
            // 성공 시 큐에서 제거
            await removeFromOfflineQueue(operation.id)
          } else {
            // 실패 시 다음 작업으로 (재시도는 나중에)
            console.error('동기화 실패:', operation, response.status)
          }
        } catch (error) {
          console.error('동기화 중 오류:', operation, error)
          // 네트워크 오류 시 중단
          if (error instanceof TypeError && error.message.includes('fetch')) {
            break
          }
        }
      }

      // 최종 상태 확인
      await checkPendingOperations()
    } catch (error) {
      console.error('동기화 실패:', error)
    } finally {
      setIsSyncing(false)
    }
  }, [isSyncing, checkPendingOperations])

  // 네트워크 상태 변경 감지
  useEffect(() => {
    if (!enabled) return

    const handleOnline = () => {
      // 온라인 복구 시 자동 동기화
      setTimeout(() => {
        sync()
      }, 2000) // 2초 후 동기화 (안정화 시간)
    }

    window.addEventListener('online', handleOnline)

    // 초기 상태 확인
    checkPendingOperations()

    // 주기적으로 대기 중인 작업 확인 (5분마다)
    const intervalId = setInterval(() => {
      checkPendingOperations()
      if (navigator.onLine && pendingOperations > 0) {
        sync()
      }
    }, 5 * 60000)

    return () => {
      window.removeEventListener('online', handleOnline)
      clearInterval(intervalId)
    }
  }, [enabled, sync, checkPendingOperations, pendingOperations])

  return {
    pendingOperations,
    isSyncing,
    sync,
  }
}
