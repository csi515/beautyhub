/**
 * 알림 스케줄러 유틸리티
 * 예약 리마인더 및 다른 알림을 스케줄링합니다.
 */

import { showAppointmentReminder, showLowStockAlert, showOutOfStockAlert } from './notifications'
import type { Appointment, Product } from '@/types/entities'
import { settingsApi } from '../api/settings'

export interface ScheduledNotification {
  id: string
  type: 'appointment_reminder' | 'low_stock' | 'out_of_stock'
  scheduledTime: number
  data: any
  sent: boolean
}

class NotificationScheduler {
  private intervals: Map<string, NodeJS.Timeout> = new Map()
  private scheduledNotifications: ScheduledNotification[] = []

  /**
   * 예약 리마인더 체크 시작
   */
  startAppointmentReminderCheck(appointments: Appointment[], customers: Map<string, any>, products: Map<string, any>): void {
    // 기존 체크 정리
    this.stopAppointmentReminderCheck()

    // 1분마다 예약 리마인더 체크
    const intervalId = setInterval(async () => {
      try {
        const settings = await settingsApi.get()
        const { reminderTimings } = settings.bookingSettings
        const { customerNotificationsEnabled } = settings.systemSettings

        if (!customerNotificationsEnabled) return

        const now = new Date().getTime()

        for (const appointment of appointments) {
          if (!appointment.appointment_date) continue

          const appointmentTime = new Date(appointment.appointment_date).getTime()
          const customer = customers.get(appointment.customer_id || '')
          const product = products.get(appointment.service_id || '')

          if (!customer) continue

          for (const hoursBefore of reminderTimings) {
            const reminderTime = appointmentTime - hoursBefore * 60 * 60 * 1000
            const timeDiff = reminderTime - now

            // 1분 이내의 리마인더만 표시 (중복 방지)
            if (timeDiff >= 0 && timeDiff < 60000) {
              const notificationId = `appointment-${appointment.id}-${hoursBefore}h`

              // 이미 보낸 알림인지 확인
              if (this.scheduledNotifications.some((n) => n.id === notificationId && n.sent)) {
                continue
              }

              await showAppointmentReminder(
                customer.name,
                new Date(appointment.appointment_date),
                product?.name
              )

              // 알림 전송 기록
              this.scheduledNotifications.push({
                id: notificationId,
                type: 'appointment_reminder',
                scheduledTime: reminderTime,
                data: { appointmentId: appointment.id },
                sent: true,
              })
            }
          }
        }

        // 24시간 이전 알림 제거 (메모리 정리)
        const oneDayAgo = now - 24 * 60 * 60 * 1000
        this.scheduledNotifications = this.scheduledNotifications.filter(
          (n) => n.scheduledTime > oneDayAgo
        )
      } catch (error) {
        console.error('예약 리마인더 체크 실패:', error)
      }
    }, 60000) // 1분마다 체크

    this.intervals.set('appointment_reminder', intervalId)
  }

  /**
   * 예약 리마인더 체크 중지
   */
  stopAppointmentReminderCheck(): void {
    const intervalId = this.intervals.get('appointment_reminder')
    if (intervalId) {
      clearInterval(intervalId)
      this.intervals.delete('appointment_reminder')
    }
  }

  /**
   * 재고 알림 체크 시작
   */
  startInventoryCheck(products: Product[]): void {
    // 기존 체크 정리
    this.stopInventoryCheck()

    // 5분마다 재고 체크
    const intervalId = setInterval(async () => {
      try {
        const settings = await settingsApi.get()
        const { internalNotificationsEnabled } = settings.systemSettings

        if (!internalNotificationsEnabled) return

        for (const product of products) {
          const stockCount = product.stock_count || 0
          const safetyStock = product.safety_stock || 0

          if (stockCount === 0) {
            // 품절 알림
            const notificationId = `out-of-stock-${product.id}`
            if (!this.scheduledNotifications.some((n) => n.id === notificationId && n.sent)) {
              await showOutOfStockAlert(product.name)
              this.scheduledNotifications.push({
                id: notificationId,
                type: 'out_of_stock',
                scheduledTime: Date.now(),
                data: { productId: product.id },
                sent: true,
              })
            }
          } else if (stockCount <= safetyStock) {
            // 재고 부족 알림
            const notificationId = `low-stock-${product.id}`
            // 1시간마다 알림 (중복 방지)
            const lastNotification = this.scheduledNotifications.find(
              (n) => n.id === notificationId && n.sent
            )
            const oneHourAgo = Date.now() - 60 * 60 * 1000

            if (!lastNotification || lastNotification.scheduledTime < oneHourAgo) {
              await showLowStockAlert(product.name, stockCount)
              this.scheduledNotifications.push({
                id: notificationId,
                type: 'low_stock',
                scheduledTime: Date.now(),
                data: { productId: product.id },
                sent: true,
              })

              // 이전 알림 제거
              this.scheduledNotifications = this.scheduledNotifications.filter(
                (n) => n.id !== notificationId || n.scheduledTime >= oneHourAgo
              )
            }
          }
        }

        // 24시간 이전 알림 제거 (메모리 정리)
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
        this.scheduledNotifications = this.scheduledNotifications.filter(
          (n) => n.scheduledTime > oneDayAgo
        )
      } catch (error) {
        console.error('재고 알림 체크 실패:', error)
      }
    }, 5 * 60000) // 5분마다 체크

    this.intervals.set('inventory_check', intervalId)
  }

  /**
   * 재고 알림 체크 중지
   */
  stopInventoryCheck(): void {
    const intervalId = this.intervals.get('inventory_check')
    if (intervalId) {
      clearInterval(intervalId)
      this.intervals.delete('inventory_check')
    }
  }

  /**
   * 유통기한 임박 알림 체크 시작
   */
  startExpiryCheck(): void {
    // 기존 체크 정리
    this.stopExpiryCheck()

    // 1시간마다 유통기한 체크
    const intervalId = setInterval(async () => {
      try {
        const settings = await settingsApi.get()
        const { internalNotificationsEnabled } = settings.systemSettings

        if (!internalNotificationsEnabled) return

        const response = await fetch('/api/inventory/expiry?days=30')
        if (!response.ok) return

        const data = await response.json()
        if (!data.batches) return

        for (const batch of data.batches) {
          if (batch.is_expiring_soon && !batch.is_expired) {
            const notificationId = `expiry-${batch.id}`
            if (!this.scheduledNotifications.some((n) => n.id === notificationId && n.sent)) {
              const { showNotification } = await import('./notifications')
              await showNotification({
                title: '유통기한 임박 알림',
                body: `${batch.product_name} (배치: ${batch.batch_number})의 유통기한이 ${batch.days_until_expiry}일 남았습니다.`,
                type: 'low_stock',
                tag: notificationId,
                requireInteraction: false,
              })
              this.scheduledNotifications.push({
                id: notificationId,
                type: 'low_stock',
                scheduledTime: Date.now(),
                data: { batchId: batch.id },
                sent: true,
              })
            }
          }
        }

        // 24시간 이전 알림 제거
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
        this.scheduledNotifications = this.scheduledNotifications.filter(
          (n) => n.scheduledTime > oneDayAgo
        )
      } catch (error) {
        console.error('유통기한 알림 체크 실패:', error)
      }
    }, 60 * 60000) // 1시간마다 체크

    this.intervals.set('expiry_check', intervalId)
  }

  /**
   * 유통기한 알림 체크 중지
   */
  stopExpiryCheck(): void {
    const intervalId = this.intervals.get('expiry_check')
    if (intervalId) {
      clearInterval(intervalId)
      this.intervals.delete('expiry_check')
    }
  }

  /**
   * 모든 알림 체크 중지
   */
  stopAll(): void {
    this.intervals.forEach((intervalId) => clearInterval(intervalId))
    this.intervals.clear()
    this.scheduledNotifications = []
  }
}

// 싱글톤 인스턴스
export const notificationScheduler = new NotificationScheduler()
