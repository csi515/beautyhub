// Appointment status color constants
export const APPOINTMENT_STATUS_COLORS = {
    scheduled: 'primary',
    pending: 'warning',
    cancelled: 'error',
    complete: 'success',
} as const

export type AppointmentStatus = keyof typeof APPOINTMENT_STATUS_COLORS

// Appointment status labels
export const APPOINTMENT_STATUS_LABELS = {
    scheduled: '예약확정',
    pending: '대기',
    cancelled: '취소',
    complete: '완료',
} as const
