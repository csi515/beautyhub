/**
 * 직원 관련 비즈니스 로직 서비스
 * 데이터 필터링, 통계 계산 로직을 담당
 */

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
    return attendance.filter(a => a.type === 'actual')
  }

  /**
   * 스케줄 필터링
   */
  static filterSchedules(attendance: StaffAttendance[]): StaffAttendance[] {
    return attendance.filter(a => a.type === 'scheduled')
  }

  /**
   * 근무중인 직원 필터링
   */
  static filterWorkingStaff(staff: Staff[]): Staff[] {
    return staff.filter(r => r.status === 'office')
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
