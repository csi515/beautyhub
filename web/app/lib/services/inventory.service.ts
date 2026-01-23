/**
 * 인벤토리 관련 비즈니스 로직 서비스
 * 데이터 필터링, 통계 계산 로직을 담당
 */

import type { Product, InventoryAlert } from '../hooks/useInventory'

export interface InventoryFilters {
  status: string
  minPrice: string
  maxPrice: string
  minStock: string
  maxStock: string
}

export interface InventoryStats {
  totalProducts: number
  lowStockCount: number
  outOfStockCount: number
  lowStockProducts: Product[]
  outOfStockProducts: Product[]
}

export class InventoryService {
  /**
   * 재고 상태별 제품 필터링
   */
  static filterByStatus(products: Product[], status: string): Product[] {
    if (!status) return products
    return products.filter(p => p.inventory_status === status)
  }

  /**
   * 가격 범위 필터링
   */
  static filterByPriceRange(
    products: Product[],
    minPrice: string,
    maxPrice: string
  ): Product[] {
    return products.filter(p => {
      const price = p.price ?? 0
      if (minPrice && price < Number(minPrice)) return false
      if (maxPrice && price > Number(maxPrice)) return false
      return true
    })
  }

  /**
   * 재고 수량 범위 필터링
   */
  static filterByStockRange(
    products: Product[],
    minStock: string,
    maxStock: string
  ): Product[] {
    return products.filter(p => {
      const stock = p.stock_count ?? 0
      if (minStock && stock < Number(minStock)) return false
      if (maxStock && stock > Number(maxStock)) return false
      return true
    })
  }

  /**
   * 인벤토리 통계 계산
   */
  static calculateStats(products: Product[]): InventoryStats {
    const lowStockProducts = products.filter(p => p.inventory_status === 'low_stock')
    const outOfStockProducts = products.filter(p => p.inventory_status === 'out_of_stock')

    return {
      totalProducts: products.length,
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length,
      lowStockProducts,
      outOfStockProducts
    }
  }

  /**
   * 알림 확인 여부 확인
   */
  static hasUnacknowledgedAlerts(alerts: InventoryAlert[]): boolean {
    return alerts.some(alert => !alert.acknowledged)
  }

  /**
   * 알림 개수 계산
   */
  static getUnacknowledgedAlertCount(alerts: InventoryAlert[]): number {
    return alerts.filter(alert => !alert.acknowledged).length
  }
}
