/**
 * 예약 관련 유틸리티 함수
 */

import type { Appointment } from '@/types/entities'
import { AppointmentRemindersRepository } from '@/app/lib/repositories/appointment-reminders.repository'
import type { SupabaseClient } from '@supabase/supabase-js'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { CalendarView } from '../types'

// 캘린더 이벤트 타입
export type AppointmentEvent = {
  id: string
  title: string
  start: Date | string
  end?: Date | string | undefined
  extendedProps?: {
    notes?: string | undefined
    product_name?: string | undefined
    status?: string | undefined
    service_id?: string | undefined
    customer_id?: string | undefined
    staff_id?: string | undefined
    no_show?: boolean | undefined
    total_price?: number | null | undefined
  }
}

// API에서 받는 예약 raw 데이터 타입
export type AppointmentRow = Appointment & {
  service_id?: string | null
}

// 상품/서비스 타입
export type Product = {
  id: string
  name: string
  price?: number | null
}

/**
 * 날짜 범위 레이블 생성
 */
export function formatRangeLabel(start: Date, end: Date, viewType: CalendarView): string {
  if (viewType === 'month') {
    return format(start, 'yyyy년 M월', { locale: ko })
  }
  if (viewType === 'week') {
    const startStr = format(start, 'M월 d일', { locale: ko })
    const endStr = format(end, 'M월 d일', { locale: ko })
    return `${startStr} – ${endStr}`
  }
  return format(start, 'yyyy년 M월 d일 (EEE)', { locale: ko })
}

/**
 * 예약 데이터를 캘린더 이벤트로 변환
 */
export function mapAppointments(rows: AppointmentRow[], products: Product[]): AppointmentEvent[] {
  const productMap = new Map(products.map(p => [p.id, p]))

  return rows.map(row => {
    const product = row.service_id ? productMap.get(row.service_id) : undefined
    const customerLabel = row.customer_id ? '고객' : '미지정'
    const productLabel = product ? product.name : '서비스 미지정'
    const title = `${customerLabel} · ${productLabel}`
    const start = new Date(row.appointment_date)
    const end = new Date(start.getTime() + 60 * 60 * 1000)

    return {
      id: row.id,
      title,
      start,
      end,
      extendedProps: {
        notes: row.notes ?? undefined,
        product_name: product?.name,
        status: row.status,
        service_id: row.service_id ?? undefined,
        customer_id: row.customer_id ?? undefined,
        staff_id: row.staff_id ?? undefined,
        no_show: row.no_show,
        total_price: row.total_price,
      },
    }
  })
}

/**
 * 예약 시간 충돌 검사
 */
export function checkAppointmentConflict(
  appointments: Appointment[],
  newAppointmentDate: string,
  newDurationMinutes: number = 60,
  newStaffId: string | null | undefined,
  existingDurationMinutes: number = 60
): { hasConflict: boolean; conflictingAppointments: Appointment[] } {
  if (!newStaffId) {
    return { hasConflict: false, conflictingAppointments: [] }
  }

  const newStart = new Date(newAppointmentDate)
  const newEnd = new Date(newStart.getTime() + newDurationMinutes * 60000)

  const conflicting: Appointment[] = []

  for (const appointment of appointments) {
    if (appointment.staff_id !== newStaffId) {
      continue
    }

    if (appointment.status !== 'scheduled' && appointment.status !== 'pending') {
      continue
    }

    const existingStart = new Date(appointment.appointment_date)
    const existingEnd = new Date(existingStart.getTime() + existingDurationMinutes * 60000)

    // 시간대가 겹치는지 확인
    if (
      (newStart >= existingStart && newStart < existingEnd) ||
      (newEnd > existingStart && newEnd <= existingEnd) ||
      (newStart <= existingStart && newEnd >= existingEnd)
    ) {
      conflicting.push(appointment)
    }
  }

  return {
    hasConflict: conflicting.length > 0,
    conflictingAppointments: conflicting,
  }
}

/**
 * 예약에 대한 리마인더 자동 생성
 */
export async function createRemindersForAppointment(
  appointmentId: string,
  userId: string,
  supabase: SupabaseClient
): Promise<void> {
  const repository = new AppointmentRemindersRepository(userId, supabase)
  await repository.createRemindersForAppointment(appointmentId)
}

/**
 * 예약 날짜로부터 리마인더 전송 시간 계산
 */
export function calculateReminderTime(
  appointmentDate: string,
  reminderType: '1_day_before' | '3_hours_before' | 'on_day'
): Date {
  const appointment = new Date(appointmentDate)
  const reminderTime = new Date(appointment)

  switch (reminderType) {
    case '1_day_before':
      reminderTime.setDate(reminderTime.getDate() - 1)
      reminderTime.setHours(9, 0, 0, 0) // 전일 오전 9시
      break
    case '3_hours_before':
      reminderTime.setHours(reminderTime.getHours() - 3) // 3시간 전
      break
    case 'on_day':
      reminderTime.setHours(9, 0, 0, 0) // 당일 오전 9시
      break
  }

  return reminderTime
}

/**
 * 리마인더 전송 여부 확인
 */
export function shouldSendReminder(
  appointmentDate: string,
  reminderType: '1_day_before' | '3_hours_before' | 'on_day',
  sentAt: string | null | undefined
): boolean {
  if (sentAt) {
    return false // 이미 전송됨
  }

  const now = new Date()
  const reminderTime = calculateReminderTime(appointmentDate, reminderType)
  const appointment = new Date(appointmentDate)

  // 예약일이 과거면 전송하지 않음
  if (appointment < now) {
    return false
  }

  // 리마인더 시간이 현재 시간 이후면 아직 전송하지 않음
  if (reminderTime > now) {
    return false
  }

  return true
}
