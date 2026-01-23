/**
 * 분석 관련 비즈니스 로직 서비스
 * 데이터 집계, 통계 계산, 차트 데이터 변환 로직을 담당
 */

export interface CustomerLTV {
  customer_id: string
  customer_name: string
  total_revenue: number
  visit_count: number
  avg_revenue: number
  first_visit: string
  last_visit: string
  return_rate: number
}

export interface VIPCustomer {
  customer_id: string
  customer_name: string
  customer_phone: string
  total_revenue: number
  transaction_count: number
  last_visit: string
}

export interface ProductProfitabilityData {
  product_id: string
  product_name: string
  product_price: number
  sales_count: number
  total_revenue: number
  avg_revenue: number
  turnover_rate: number
  margin_rate: number
  total_margin: number
  profitability_score: number
  stock_count: number
  safety_stock: number
  active: boolean
}

export class AnalyticsService {
  /**
   * LTV 통계 계산
   */
  static calculateLTVStats(ltvData: CustomerLTV[]): {
    totalCustomers: number
    avgLTV: number
  } {
    const totalCustomers = ltvData.length
    const avgLTV = totalCustomers > 0
      ? ltvData.reduce((sum, c) => sum + c.total_revenue, 0) / totalCustomers
      : 0

    return { totalCustomers, avgLTV }
  }

  /**
   * 차트 데이터 변환 (LTV)
   */
  static prepareLTVChartData(ltvData: CustomerLTV[], limit: number = 10): Array<{
    name: string
    구매액: number
    방문횟수: number
  }> {
    return ltvData
      .sort((a, b) => b.total_revenue - a.total_revenue)
      .slice(0, limit)
      .map(c => ({
        name: c.customer_name,
        구매액: c.total_revenue,
        방문횟수: c.visit_count
      }))
  }

  /**
   * LTV 데이터를 CSV 내보내기 형식으로 변환
   */
  static prepareLTVForExport(ltvData: CustomerLTV[]): Array<{
    '고객명': string
    '총 매출액': number
    '방문 횟수': number
    '평균 매출액': number
    '첫 방문일': string
    '최근 방문일': string
    '재방문율(%)': string
  }> {
    return ltvData.map(item => ({
      '고객명': item.customer_name,
      '총 매출액': item.total_revenue,
      '방문 횟수': item.visit_count,
      '평균 매출액': Math.round(item.avg_revenue),
      '첫 방문일': item.first_visit ? new Date(item.first_visit).toLocaleDateString() : '-',
      '최근 방문일': item.last_visit ? new Date(item.last_visit).toLocaleDateString() : '-',
      '재방문율(%)': (item.return_rate * 100).toFixed(1)
    }))
  }

  /**
   * 제품 수익성 데이터 정렬 및 필터링
   */
  static sortProductsBy(
    products: ProductProfitabilityData[],
    sortBy: 'profitability' | 'revenue' | 'turnover'
  ): ProductProfitabilityData[] {
    const sorted = [...products]

    switch (sortBy) {
      case 'profitability':
        return sorted.sort((a, b) => b.profitability_score - a.profitability_score)
      case 'revenue':
        return sorted.sort((a, b) => b.total_revenue - a.total_revenue)
      case 'turnover':
        return sorted.sort((a, b) => b.turnover_rate - a.turnover_rate)
      default:
        return sorted
    }
  }

  /**
   * 제품 수익성 통계 계산
   */
  static calculateProductStats(products: ProductProfitabilityData[]): {
    totalProducts: number
    activeProducts: number
    totalRevenue: number
    totalMargin: number
    avgProfitability: number
  } {
    const totalProducts = products.length
    const activeProducts = products.filter(p => p.active).length
    const totalRevenue = products.reduce((sum, p) => sum + p.total_revenue, 0)
    const totalMargin = products.reduce((sum, p) => sum + p.total_margin, 0)
    const avgProfitability = totalProducts > 0
      ? products.reduce((sum, p) => sum + p.profitability_score, 0) / totalProducts
      : 0

    return {
      totalProducts,
      activeProducts,
      totalRevenue,
      totalMargin,
      avgProfitability
    }
  }

  /**
   * 제품 수익성 데이터를 CSV 내보내기 형식으로 변환
   */
  static prepareProductProfitabilityForExport(
    products: ProductProfitabilityData[]
  ): Array<{
    '제품명': string
    '판매 수량': number
    '총 매출액': number
    '평균 매출액': number
    '회전율': string
    '마진율(%)': string
    '총 마진': number
    '수익성 점수': number
  }> {
    return products.map(item => ({
      '제품명': item.product_name,
      '판매 수량': item.sales_count,
      '총 매출액': item.total_revenue,
      '평균 매출액': Math.round(item.avg_revenue),
      '회전율': `${item.turnover_rate.toFixed(2)}회`,
      '마진율(%)': `${(item.margin_rate * 100).toFixed(1)}%`,
      '총 마진': item.total_margin,
      '수익성 점수': Math.round(item.profitability_score)
    }))
  }
}
