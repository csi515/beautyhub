/**
 * 브라우저 Notification API 유틸리티
 */

export type NotificationType = 'appointment_reminder' | 'low_stock' | 'out_of_stock' | 'customer_birthday' | 'general'

export interface NotificationOptions {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  requireInteraction?: boolean
  silent?: boolean
  type?: NotificationType
}

/**
 * 브라우저 알림 권한 확인
 */
export function getNotificationPermission(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied'
  }
  return Notification.permission
}

/**
 * 브라우저 알림 권한 요청
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied'
  }

  if (Notification.permission === 'granted') {
    return 'granted'
  }

  if (Notification.permission === 'denied') {
    return 'denied'
  }

  try {
    const permission = await Notification.requestPermission()
    return permission
  } catch (error) {
    console.error('알림 권한 요청 실패:', error)
    return 'denied'
  }
}

/**
 * 브라우저 알림 표시
 */
export async function showNotification(options: NotificationOptions): Promise<void> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('이 브라우저는 알림을 지원하지 않습니다.')
    return
  }

  const permission = await requestNotificationPermission()
  if (permission !== 'granted') {
    console.warn('알림 권한이 없습니다.')
    return
  }

  try {
    const notificationOptions: NotificationOptions = {
      icon: options.icon || '/icons/icon-192.png',
      badge: options.badge || '/icons/icon-192.png',
      tag: options.tag || options.type || 'general',
      requireInteraction: options.requireInteraction || false,
      silent: options.silent || false,
      ...options,
    }

    const notification = new Notification(options.title, notificationOptions)

    // 알림 클릭 시 포커스
    notification.onclick = () => {
      window.focus()
      notification.close()
    }

    // 기본 5초 후 자동 닫기
    if (!options.requireInteraction) {
      setTimeout(() => {
        notification.close()
      }, 5000)
    }
  } catch (error) {
    console.error('알림 표시 실패:', error)
  }
}

/**
 * 예약 리마인더 알림
 */
export async function showAppointmentReminder(
  customerName: string,
  appointmentDate: Date,
  serviceName?: string
): Promise<void> {
  const dateStr = appointmentDate.toLocaleString('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

  const body = serviceName
    ? `${customerName}님의 ${serviceName} 예약이 ${dateStr}에 있습니다.`
    : `${customerName}님의 예약이 ${dateStr}에 있습니다.`

  await showNotification({
    title: '예약 리마인더',
    body,
    type: 'appointment_reminder',
    tag: `appointment-${appointmentDate.getTime()}`,
    requireInteraction: true,
  })
}

/**
 * 재고 부족 알림
 */
export async function showLowStockAlert(productName: string, stockCount: number): Promise<void> {
  await showNotification({
    title: '재고 부족 알림',
    body: `${productName}의 재고가 ${stockCount}개로 부족합니다.`,
    type: 'low_stock',
    tag: `low-stock-${productName}`,
    requireInteraction: false,
  })
}

/**
 * 품절 알림
 */
export async function showOutOfStockAlert(productName: string): Promise<void> {
  await showNotification({
    title: '품절 알림',
    body: `${productName}이(가) 품절되었습니다.`,
    type: 'out_of_stock',
    tag: `out-of-stock-${productName}`,
    requireInteraction: true,
  })
}

/**
 * 고객 생일 알림
 */
export async function showCustomerBirthdayAlert(customerName: string): Promise<void> {
  await showNotification({
    title: '고객 생일',
    body: `오늘은 ${customerName}님의 생일입니다. 축하 메시지를 보내보세요.`,
    type: 'customer_birthday',
    tag: `birthday-${customerName}`,
    requireInteraction: false,
  })
}

/**
 * 모든 알림 닫기
 */
export function closeAllNotifications(): void {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    // 현재 열린 알림들을 모두 닫기
    // Notification API는 직접적으로 모든 알림을 닫는 방법이 없으므로
    // tag를 이용한 방법을 사용할 수 없으므로 브라우저가 자동으로 관리
  }
}
