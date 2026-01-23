/**
 * 대시보드 관련 비즈니스 로직 서비스
 * 데이터 집계, 계산 로직을 담당
 */

export interface DashboardRawData {
  todayAppointments: any[]
  monthlyAppointments: number | any[] // count 또는 배열
  monthlyNewCustomers: any[]
  monthlyTransactions: any[]
  monthlyExpenses: any[]
  recentAppointments: any[]
  recentTransactions: any[]
  recentExpenses: any[]
  products: any[]
  appointmentStats: any[]
}

export interface DashboardProcessedData {
  todayAppointments: number
  monthlyAppointments: number
  monthlyProfit: number
  monthlyNewCustomers: number
  recentAppointments: Array<{
    id: string
    appointment_date: string
    customer_name: string
    product_name: string
  }>
  chartAppointments: Array<{
    product_name: string
  }>
  recentTransactions: Array<{
    id: string
    type: 'income' | 'expense'
    date: string
    amount: number
    memo: string
  }>
  monthlyRevenueData: Array<{
    id: string
    amount: number
    transaction_date: string
    type: 'income'
    owner_id: string
  }>
  activeProducts: any[]
}

export class DashboardService {
  /**
   * 월 범위 계산
   */
  static getMonthBounds(): { monthStart: string; monthEnd: string } {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    return {
      monthStart: monthStart.toISOString(),
      monthEnd: nextMonth.toISOString()
    }
  }

  /**
   * 오늘 날짜 범위 계산
   */
  static getTodayRange(): { start: string; end: string } {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()
    return { start, end }
  }

  /**
   * 월별 수입 계산
   */
  static calculateMonthlyIncome(
    transactions: any[],
    fromDate: string,
    toDate: string
  ): number {
    return Array.isArray(transactions)
      ? transactions
          .filter((t) => {
            const d = (t.transaction_date || t.created_at || '').slice(0, 10)
            return (!fromDate || d >= fromDate) && (!toDate || d <= toDate)
          })
          .reduce((s: number, t) => s + Number(t.amount || 0), 0)
      : 0
  }

  /**
   * 월별 지출 계산
   */
  static calculateMonthlyExpense(expenses: any[]): number {
    return Array.isArray(expenses)
      ? expenses.reduce((s: number, e) => s + Number(e.amount || 0), 0)
      : 0
  }

  /**
   * 최근 거래 결합 (수입 + 지출)
   */
  static combineRecentTransactions(
    transactions: any[],
    expenses: any[]
  ): Array<{
    id: string
    type: 'income' | 'expense'
    date: string
    amount: number
    memo: string
  }> {
    const trData = Array.isArray(transactions) ? transactions : []
    const exData = Array.isArray(expenses) ? expenses : []

    const combined = [
      ...trData.map((t: any) => ({
        id: t.id,
        type: 'income' as const,
        date: t.transaction_date || t.created_at || new Date().toISOString(),
        amount: Number(t.amount),
        memo: t.memo || '수입'
      })),
      ...exData.map((e: any) => ({
        id: e.id,
        type: 'expense' as const,
        date: e.expense_date || e.created_at || new Date().toISOString(),
        amount: Number(e.amount),
        memo: e.memo || e.category
      }))
    ].sort((a, b) => {
      const dA = new Date(a.date).getTime() || 0
      const dB = new Date(b.date).getTime() || 0
      return dB - dA
    }).slice(0, 10)

    return combined
  }

  /**
   * 고객/제품 매핑 생성
   */
  static createMappings(
    customers: any[],
    products: any[]
  ): {
    customersById: Record<string, string>
    productsById: Record<string, string>
  } {
    const customersById: Record<string, string> = {}
    const productsById: Record<string, string> = {}

    if (Array.isArray(customers)) {
      customers.forEach((c: any) => {
        customersById[c.id] = c.name
      })
    }

    if (Array.isArray(products)) {
      products.forEach((p: any) => {
        productsById[p.id] = p.name
      })
    }

    return { customersById, productsById }
  }

  /**
   * 대시보드 데이터 가공
   */
  static processDashboardData(
    rawData: DashboardRawData,
    customersById: Record<string, string>,
    productsById: Record<string, string>,
    fromDate: string,
    toDate: string
  ): DashboardProcessedData {
    const todayAppointments = Array.isArray(rawData.todayAppointments) ? rawData.todayAppointments.length : 0
    const monthlyAppointments = typeof rawData.monthlyAppointments === 'number' 
      ? rawData.monthlyAppointments 
      : (Array.isArray(rawData.monthlyAppointments) ? rawData.monthlyAppointments.length : 0)
    const monthlyNewCustomers = Array.isArray(rawData.monthlyNewCustomers) ? rawData.monthlyNewCustomers.length : 0

    const monthlyIncome = this.calculateMonthlyIncome(rawData.monthlyTransactions, fromDate, toDate)
    const monthlyExpense = this.calculateMonthlyExpense(rawData.monthlyExpenses)
    const monthlyProfit = monthlyIncome - monthlyExpense

    const recentAppointments = Array.isArray(rawData.recentAppointments)
      ? rawData.recentAppointments.map((a: any) => ({
          id: a.id,
          appointment_date: a.appointment_date,
          customer_name: a.customer_id ? customersById[a.customer_id] || '-' : '-',
          product_name: a.service_id ? productsById[a.service_id] || '-' : '-',
        }))
      : []

    const chartAppointments = Array.isArray(rawData.appointmentStats)
      ? rawData.appointmentStats.map((a: any) => ({
          product_name: a.service_id ? productsById[a.service_id] || '-' : '-',
        }))
      : []

    const recentTransactions = this.combineRecentTransactions(
      rawData.recentTransactions,
      rawData.recentExpenses
    )

    const monthlyRevenueData = Array.isArray(rawData.monthlyTransactions)
      ? rawData.monthlyTransactions.map((t: any) => ({
          id: t.id,
          amount: Number(t.amount),
          transaction_date: t.transaction_date || t.created_at,
          type: 'income' as const,
          owner_id: '' // Will be set by caller
        }))
      : []

    const activeProducts = Array.isArray(rawData.products)
      ? rawData.products.filter((p: any) => p.active !== false)
      : []

    return {
      todayAppointments,
      monthlyAppointments,
      monthlyProfit,
      monthlyNewCustomers,
      recentAppointments,
      chartAppointments,
      recentTransactions,
      monthlyRevenueData,
      activeProducts
    }
  }
}
