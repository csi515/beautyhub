/**
 * 직원 관련 비즈니스 로직 서비스
 * 데이터 필터링, 통계 계산 로직을 담당
 */

import { startOfMonth, endOfMonth, startOfDay, endOfDay, isWithinInterval } from 'date-fns'
import type { Staff, StaffAttendance } from '@/types/entities'
import type { StaffStats } from '@/types/staff'

export interface StaffFilters {
  search?: string
  status?: 'all' | 'active' | 'inactive' | 'office' | 'away'
}

export class StaffService {
  /**
   * 직원 통계 계산
   */
  static calculateStats(staff: Staff[]): StaffStats {
    return {
      total: staff.length,
      active: staff.filter(r => r.active !== false).length,
      atOffice: staff.filter(r => r.status === 'office').length,
      away: staff.filter(r => r.status === 'away').length,
    }
  }

  /**
   * 실제 근무 기록 필터링
   */
  static filterActualAttendance(attendance: StaffAttendance[]): StaffAttendance[] {
    if (!Array.isArray(attendance)) return []
    return attendance.filter(a => a.type === 'actual')
  }

  /**
   * 스케줄 필터링
   */
  static filterSchedules(attendance: StaffAttendance[]): StaffAttendance[] {
    if (!Array.isArray(attendance)) return []
    return attendance.filter(a => a.type === 'scheduled')
  }

  /**
   * 근무중인 직원 필터링
   */
  static filterWorkingStaff(staff: Staff[]): Staff[] {
    return staff.filter(r => r.status === 'office')
  }

  /**
   * 이번 달 누적 근무일 (실근무 기준, 직원·날짜별 1일로 카운트)
   */
  static totalMonthWorkDays(actualAttendance: StaffAttendance[]): number {
    const now = new Date()
    const start = startOfMonth(now)
    const end = endOfMonth(now)
    const set = new Set<string>()
    for (const a of actualAttendance) {
      const d = new Date(a.start_time)
      if (isWithinInterval(d, { start, end })) {
        set.add(`${a.staff_id}-${d.toISOString().slice(0, 10)}`)
      }
    }
    return set.size
  }

  /**
   * 오늘 스케줄 있는데 실근무 없는 직원 수
   */
  static todayAbsentCount(schedules: StaffAttendance[], actualAttendance: StaffAttendance[]): number {
    const today = new Date()
    const dayStart = startOfDay(today)
    const dayEnd = endOfDay(today)
    const scheduledIds = new Set<string>()
    for (const s of schedules) {
      const d = new Date(s.start_time)
      if (isWithinInterval(d, { start: dayStart, end: dayEnd })) {
        scheduledIds.add(s.staff_id)
      }
    }
    const actualIds = new Set<string>()
    for (const a of actualAttendance) {
      const d = new Date(a.start_time)
      if (isWithinInterval(d, { start: dayStart, end: dayEnd })) {
        actualIds.add(a.staff_id)
      }
    }
    let count = 0
    for (const id of scheduledIds) {
      if (!actualIds.has(id)) count += 1
    }
    return count
  }

  /**
   * 직원 필터링
   */
  static filterStaff(
    staff: Staff[],
    filters: StaffFilters
  ): Staff[] {
    return staff.filter(s => {
      // Search filter
      if (filters.search?.trim()) {
        const qLower = filters.search.trim().toLowerCase()
        if (!s.name.toLowerCase().includes(qLower)) return false
      }

      // Status filter
      if (filters.status && filters.status !== 'all') {
        if (filters.status === 'active' && s.active === false) return false
        if (filters.status === 'inactive' && s.active !== false) return false
        if (filters.status === 'office' && s.status !== 'office') return false
        if (filters.status === 'away' && s.status !== 'away') return false
      }

      return true
    })
  }
}
