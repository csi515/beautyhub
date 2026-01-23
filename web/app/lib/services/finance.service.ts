/**
 * 재무 관련 비즈니스 로직 서비스
 * 데이터 가공, 집계, 계산 로직을 담당
 */

import type { Expense, Transaction } from '@/types/entities'
import type { FinanceFilters, FinanceDateRange, FinanceCombinedRow } from '@/types/finance'

export interface FinanceProcessResult {
  combined: FinanceCombinedRow[]
  paginated: FinanceCombinedRow[]
  totalPages: number
  sumIncome: number
  sumExpense: number
  profit: number
}

export class FinanceService {
  /**
   * 날짜 범위 내에 있는지 확인
   */
  private static inRange(date: string, dateRange: FinanceDateRange): boolean {
    const d = (date || '').slice(0, 10)
    return (!dateRange.from || d >= dateRange.from) && (!dateRange.to || d <= dateRange.to)
  }

  /**
   * 수입/지출 데이터 결합
   */
  static combineFinanceData(
    transactions: Transaction[],
    expenses: Expense[],
    filters: FinanceFilters,
    dateRange: FinanceDateRange
  ): FinanceCombinedRow[] {
    const incomeRows: FinanceCombinedRow[] = filters.filterType.includes('income')
      ? transactions
          .filter(t => this.inRange(t.transaction_date || t.created_at || '', dateRange))
          .map(t => ({
            id: t.id,
            type: 'income' as const,
            date: (t.transaction_date || t.created_at || '').slice(0, 10),
            amount: Number(t.amount || 0),
            memo: t.category || '',
            raw: t,
          }))
      : []

    const expenseRows: FinanceCombinedRow[] = filters.filterType.includes('expense')
      ? expenses
          .filter(e => this.inRange(e.expense_date || '', dateRange))
          .map(e => ({
            id: e.id,
            type: 'expense' as const,
            date: (e.expense_date || '').slice(0, 10),
            amount: Number(e.amount || 0),
            note: e.category || e.memo || '',
            raw: e,
          }))
      : []

    const rows = [...incomeRows, ...expenseRows]

    // 정렬
    rows.sort((a, b) => {
      if (filters.sortKey === 'date') {
        const dateA = a.date || ''
        const dateB = b.date || ''
        return filters.sortDir === 'asc' ? dateA.localeCompare(dateB) : dateB.localeCompare(dateA)
      }
      if (a.amount < b.amount) return filters.sortDir === 'asc' ? -1 : 1
      if (a.amount > b.amount) return filters.sortDir === 'asc' ? 1 : -1
      return 0
    })

    return rows
  }

  /**
   * 통계 계산
   */
  static calculateStats(
    transactions: Transaction[],
    expenses: Expense[],
    dateRange: FinanceDateRange
  ): { sumIncome: number; sumExpense: number; profit: number } {
    const sumIncome = transactions
      .filter(t => {
        const d = (t.transaction_date || t.created_at || '').slice(0, 10)
        return this.inRange(d, dateRange)
      })
      .reduce((s, t) => s + Number(t.amount || 0), 0)

    const sumExpense = expenses
      .filter(e => this.inRange(e.expense_date || '', dateRange))
      .reduce((s, e) => s + Number(e.amount || 0), 0)

    const profit = sumIncome - sumExpense

    return { sumIncome, sumExpense, profit }
  }

  /**
   * 페이지네이션
   */
  static paginateFinanceData(
    combined: FinanceCombinedRow[],
    page: number,
    pageSize: number
  ): { paginated: FinanceCombinedRow[]; totalPages: number } {
    const start = (page - 1) * pageSize
    const end = start + pageSize
    return {
      paginated: combined.slice(start, end),
      totalPages: Math.max(1, Math.ceil(combined.length / pageSize))
    }
  }

  /**
   * 통합 처리: 결합 + 정렬 + 페이지네이션 + 통계
   */
  static processFinanceData(
    transactions: Transaction[],
    expenses: Expense[],
    filters: FinanceFilters,
    dateRange: FinanceDateRange,
    page: number,
    pageSize: number
  ): FinanceProcessResult {
    const combined = this.combineFinanceData(transactions, expenses, filters, dateRange)
    const { paginated, totalPages } = this.paginateFinanceData(combined, page, pageSize)
    const { sumIncome, sumExpense, profit } = this.calculateStats(transactions, expenses, dateRange)

    return {
      combined,
      paginated,
      totalPages,
      sumIncome,
      sumExpense,
      profit
    }
  }
}
