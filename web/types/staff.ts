/**
 * Staff 페이지 관련 타입 정의
 */

export interface StaffStats {
  total: number
  active: number
  atOffice: number
  away: number
  /** 이번 달 전체 누적 근무일 (직원별 출근일 합계) */
  totalMonthWorkDays?: number
  /** 오늘 스케줄 있으나 실근무 없는 직원 수 */
  todayAbsentCount?: number
}

export interface StaffPageState {
  loading: boolean
  error: string
  tabIndex: number
}

export interface StaffModalState {
  detailOpen: boolean
  statusOpen: boolean
  attendanceRecordOpen: boolean
  scheduleOpen: boolean
  weeklyScheduleOpen: boolean
}

export interface StaffSelectedItems {
  selected: any // Staff | null
  selectedAttendance: any // StaffAttendance | null
  selectedDate: Date | null
}

export interface StaffScheduleRepeat {
  days: number[]
}
