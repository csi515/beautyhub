/**
 * 예약 관련 유틸리티 함수
 */

import type { Appointment } from '@/types/entities'
import { AppointmentRemindersRepository } from '@/app/lib/repositories/appointment-reminders.repository'
import type { SupabaseClient } from '@supabase/supabase-js'

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
