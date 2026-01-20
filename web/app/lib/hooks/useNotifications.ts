/**
 * 알림 관련 훅
 */

import { useState, useEffect, useCallback } from 'react'
import {
  getNotificationPermission,
  requestNotificationPermission,
  showNotification,
  type NotificationOptions,
} from '../utils/notifications'

export interface UseNotificationsReturn {
  permission: NotificationPermission
  isSupported: boolean
  requestPermission: () => Promise<NotificationPermission>
  show: (options: NotificationOptions) => Promise<void>
  isEnabled: boolean
}

/**
 * 알림 기능을 사용하는 훅
 */
export function useNotifications(): UseNotificationsReturn {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    if ('Notification' in window) {
      setIsSupported(true)
      setPermission(getNotificationPermission())
    } else {
      setIsSupported(false)
    }
  }, [])

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    const newPermission = await requestNotificationPermission()
    setPermission(newPermission)
    return newPermission
  }, [])

  const show = useCallback(
    async (options: NotificationOptions): Promise<void> => {
      await showNotification(options)
      // 권한이 변경되었을 수 있으므로 확인
      setPermission(getNotificationPermission())
    },
    []
  )

  const isEnabled = permission === 'granted'

  return {
    permission,
    isSupported,
    requestPermission,
    show,
    isEnabled,
  }
}
