/**
 * 고객 관련 비즈니스 로직 서비스
 * 데이터 필터링, 정렬, 페이지네이션 로직을 담당
 */

import type { Customer } from '@/types/entities'
import type { CustomerFilters } from '@/types/customer'

export interface CustomerListResult {
  filtered: Customer[]
  sorted: Customer[]
  paginated: Customer[]
  totalPages: number
}

export class CustomersService {
  /**
   * 고객 필터링
   */
  static filterCustomers(
    customers: Customer[],
    filters: CustomerFilters,
    pointsByCustomer: Record<string, number>
  ): Customer[] {
    return customers.filter((customer) => {
      const points = pointsByCustomer[customer.id] || 0

      // Status filter
      if (filters.statusFilter === 'active' && customer.active === false) return false
      if (filters.statusFilter === 'inactive' && customer.active !== false) return false

      // VIP filter (assuming VIP = points > 1000)
      if (filters.vipFilter === 'vip' && points <= 1000) return false
      if (filters.vipFilter === 'regular' && points > 1000) return false

      // Points range filter
      if (filters.minPoints && points < Number(filters.minPoints)) return false
      if (filters.maxPoints && points > Number(filters.maxPoints)) return false

      return true
    })
  }

  /**
   * 고객 정렬
   */
  static sortCustomers(
    customers: Customer[],
    key: string,
    direction: 'asc' | 'desc',
    pointsByCustomer?: Record<string, number>
  ): Customer[] {
    if (!key) return customers

    return [...customers].sort((a, b) => {
      let aVal: unknown
      let bVal: unknown

      // 포인트 정렬의 경우 pointsByCustomer에서 가져오기
      if (key === 'points' && pointsByCustomer) {
        aVal = pointsByCustomer[a.id] || 0
        bVal = pointsByCustomer[b.id] || 0
      } else {
        aVal = (a as unknown as Record<string, unknown>)[key]
        bVal = (b as unknown as Record<string, unknown>)[key]
      }

      // null/undefined 처리
      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1

      // 숫자 비교
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return direction === 'asc' ? aVal - bVal : bVal - aVal
      }

      // 문자열 비교
      const aStr = String(aVal)
      const bStr = String(bVal)
      const comparison = aStr.localeCompare(bStr, 'ko', { numeric: true })

      return direction === 'asc' ? comparison : -comparison
    })
  }

  /**
   * 고객 페이지네이션
   */
  static paginateCustomers(
    customers: Customer[],
    page: number,
    pageSize: number
  ): { paginated: Customer[]; totalPages: number } {
    const start = (page - 1) * pageSize
    const end = start + pageSize
    return {
      paginated: customers.slice(start, end),
      totalPages: Math.max(1, Math.ceil(customers.length / pageSize))
    }
  }

  /**
   * 통합 처리: 필터링 + 정렬 + 페이지네이션
   */
  static processCustomerList(
    customers: Customer[],
    filters: CustomerFilters,
    sortKey: string,
    sortDirection: 'asc' | 'desc',
    page: number,
    pageSize: number,
    pointsByCustomer: Record<string, number>
  ): CustomerListResult {
    const filtered = this.filterCustomers(customers, filters, pointsByCustomer)
    const sorted = this.sortCustomers(filtered, sortKey, sortDirection, pointsByCustomer)
    const { paginated, totalPages } = this.paginateCustomers(sorted, page, pageSize)
    
    return {
      filtered,
      sorted,
      paginated,
      totalPages
    }
  }
}
