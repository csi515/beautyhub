/**
 * 급여 관련 비즈니스 로직 서비스
 * 데이터 필터링, 정렬, 통계 계산 로직을 담당
 */

import type { Staff, PayrollRecord } from '@/types/payroll'

export interface PayrollFilters {
  search?: string
  status?: 'all' | 'not_calculated' | 'draft' | 'confirmed' | 'paid' | string
}

export interface PayrollListResult {
  filtered: Staff[]
  sorted: Staff[]
  paginated: Staff[]
  totalPages: number
  totalGrossPay: number
  totalNetPay: number
}

export class PayrollService {
  /**
   * 직원 필터링
   */
  static filterStaff(
    staff: Staff[],
    records: PayrollRecord[],
    filters: PayrollFilters
  ): Staff[] {
    return staff.filter(s => {
      // Search filter
      if (filters.search?.trim()) {
        const qLower = filters.search.trim().toLowerCase()
        if (!s.name.toLowerCase().includes(qLower)) return false
      }

      // Status filter
      if (filters.status && filters.status !== 'all') {
        const record = records.find(r => r.staff_id === s.id)
        if (filters.status === 'not_calculated') {
          return !record
        } else {
          return record?.status === filters.status
        }
      }

      return true
    })
  }

  /**
   * 직원 정렬
   */
  static sortStaff(
    staff: Staff[],
    key: string,
    direction: 'asc' | 'desc'
  ): Staff[] {
    if (!key) return staff

    return [...staff].sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[key]
      const bVal = (b as unknown as Record<string, unknown>)[key]

      // null/undefined 처리
      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1

      // 문자열 비교
      const aStr = String(aVal)
      const bStr = String(bVal)
      const comparison = aStr.localeCompare(bStr, 'ko', { numeric: true })

      return direction === 'asc' ? comparison : -comparison
    })
  }

  /**
   * 페이지네이션
   */
  static paginateStaff(
    staff: Staff[],
    page: number,
    pageSize: number
  ): { paginated: Staff[]; totalPages: number } {
    const start = (page - 1) * pageSize
    const end = start + pageSize
    return {
      paginated: staff.slice(start, end),
      totalPages: Math.max(1, Math.ceil(staff.length / pageSize))
    }
  }

  /**
   * 급여 통계 계산
   */
  static calculatePayrollStats(records: PayrollRecord[]): {
    totalGrossPay: number
    totalNetPay: number
  } {
    const totalGrossPay = records.reduce((sum, r) => sum + r.total_gross, 0)
    const totalNetPay = records.reduce((sum, r) => sum + r.net_salary, 0)
    return { totalGrossPay, totalNetPay }
  }

  /**
   * 통합 처리: 필터링 + 정렬 + 페이지네이션 + 통계
   */
  static processPayrollList(
    staff: Staff[],
    records: PayrollRecord[],
    filters: PayrollFilters,
    sortKey: string,
    sortDirection: 'asc' | 'desc',
    page: number,
    pageSize: number
  ): PayrollListResult {
    const filtered = this.filterStaff(staff, records, filters)
    const sorted = this.sortStaff(filtered, sortKey, sortDirection)
    const { paginated, totalPages } = this.paginateStaff(sorted, page, pageSize)
    const { totalGrossPay, totalNetPay } = this.calculatePayrollStats(records)

    return {
      filtered,
      sorted,
      paginated,
      totalPages,
      totalGrossPay,
      totalNetPay
    }
  }
}
