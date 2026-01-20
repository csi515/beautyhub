'use client'

import { useEffect, useState } from 'react'
import { useNotifications } from '@/app/lib/hooks/useNotifications'
import { Bell, BellOff } from 'lucide-react'
import Button from '../ui/Button'

interface NotificationPermissionProps {
  onPermissionChange?: (granted: boolean) => void
}

/**
 * 알림 권한 요청 컴포넌트
 */
export default function NotificationPermission({ onPermissionChange }: NotificationPermissionProps) {
  const { permission, isSupported, requestPermission, isEnabled } = useNotifications()
  const [requesting, setRequesting] = useState(false)

  useEffect(() => {
    onPermissionChange?.(isEnabled)
  }, [isEnabled, onPermissionChange])

  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 text-sm text-neutral-600">
        <BellOff className="w-4 h-4" />
        <span>이 브라우저는 알림을 지원하지 않습니다.</span>
      </div>
    )
  }

  if (permission === 'granted') {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <Bell className="w-4 h-4" />
        <span>알림이 활성화되어 있습니다.</span>
      </div>
    )
  }

  const handleRequest = async () => {
    setRequesting(true)
    try {
      await requestPermission()
    } catch (error) {
      console.error('알림 권한 요청 실패:', error)
    } finally {
      setRequesting(false)
    }
  }

  if (permission === 'denied') {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-red-600">
          <BellOff className="w-4 h-4" />
          <span>알림이 차단되었습니다. 브라우저 설정에서 알림을 허용해주세요.</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-neutral-600">
        <Bell className="w-4 h-4" />
        <span>예약 리마인더 및 재고 알림을 받으려면 알림 권한이 필요합니다.</span>
      </div>
      <Button variant="primary" size="sm" onClick={handleRequest} disabled={requesting}>
        {requesting ? '요청 중...' : '알림 권한 허용'}
      </Button>
    </div>
  )
}
