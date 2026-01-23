/**
 * 제품 관련 비즈니스 로직 서비스
 * 데이터 필터링, 정렬, 페이지네이션 로직을 담당
 */

import type { Product } from '@/types/entities'

export interface ProductFilters {
  search?: string
  status?: 'all' | 'active' | 'inactive'
  minPrice?: number
  maxPrice?: number
}

export interface ProductListResult {
  filtered: Product[]
  sorted: Product[]
  paginated: Product[]
  totalPages: number
}

export class ProductsService {
  /**
   * 제품 필터링
   */
  static filterProducts(
    products: Product[],
    filters: ProductFilters
  ): Product[] {
    return products.filter((p) => {
      // Search query
      if (filters.search?.trim()) {
        const qLower = filters.search.trim().toLowerCase()
        const matchesName = (p.name || '').toLowerCase().includes(qLower)
        const matchesDesc = (p.description || '').toLowerCase().includes(qLower)
        if (!matchesName && !matchesDesc) return false
      }

      // Status filter
      if (filters.status === 'active' && !p.active) return false
      if (filters.status === 'inactive' && p.active) return false

      // Price range filter
      if (filters.minPrice !== undefined && (p.price ?? 0) < filters.minPrice) return false
      if (filters.maxPrice !== undefined && (p.price ?? 0) > filters.maxPrice) return false

      return true
    })
  }

  /**
   * 제품 정렬
   */
  static sortProducts(
    products: Product[],
    key: string,
    direction: 'asc' | 'desc'
  ): Product[] {
    if (!key) return products

    return [...products].sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[key]
      const bVal = (b as unknown as Record<string, unknown>)[key]

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
   * 제품 페이지네이션
   */
  static paginateProducts(
    products: Product[],
    page: number,
    pageSize: number
  ): { paginated: Product[]; totalPages: number } {
    const start = (page - 1) * pageSize
    const end = start + pageSize
    return {
      paginated: products.slice(start, end),
      totalPages: Math.max(1, Math.ceil(products.length / pageSize))
    }
  }

  /**
   * 통합 처리: 필터링 + 정렬 + 페이지네이션
   */
  static processProductList(
    products: Product[],
    filters: ProductFilters,
    sortKey: string,
    sortDirection: 'asc' | 'desc',
    page: number,
    pageSize: number
  ): ProductListResult {
    const filtered = this.filterProducts(products, filters)
    const sorted = this.sortProducts(filtered, sortKey, sortDirection)
    const { paginated, totalPages } = this.paginateProducts(sorted, page, pageSize)
    
    return {
      filtered,
      sorted,
      paginated,
      totalPages
    }
  }
}
