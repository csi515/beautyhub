import { useMemo, useState, useEffect } from 'react'
import { usePagination } from './usePagination'
import { FinanceService } from '../services/finance.service'
import { Expense, Transaction } from '@/types/entities'
import { FinanceFilters, FinanceDateRange } from '@/types/finance'

export function useFinanceFilters(
  expenses: Expense[],
  transactions: Transaction[],
  dateRange: FinanceDateRange
) {
  const [filters, setFilters] = useState<FinanceFilters>({
    filterType: ['income', 'expense'],
    sortKey: 'date',
    sortDir: 'desc',
    showFilters: true
  })

  const pagination = usePagination({
    initialPage: 1,
    initialPageSize: 10,
    totalItems: 0,
  })
  const { page, pageSize, setPage } = pagination

  // Service 레이어를 사용한 데이터 가공
  const processed = useMemo(() => {
    return FinanceService.processFinanceData(
      transactions,
      expenses,
      filters,
      dateRange,
      page,
      pageSize
    )
  }, [transactions, expenses, filters, dateRange, page, pageSize])

  // 페이지 변경 시 필터 변경으로 인해 현재 페이지가 유효 범위를 벗어나면 첫 페이지로 이동
  useEffect(() => {
    if (page > processed.totalPages && processed.totalPages > 0) {
      setPage(1)
    }
  }, [processed.totalPages, page, setPage])

  const updateFilters = (newFilters: Partial<FinanceFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const toggleSort = (key: 'date' | 'amount') => {
    const isAsc = filters.sortKey === key && filters.sortDir === 'asc'
    setFilters(prev => ({
      ...prev,
      sortKey: key,
      sortDir: isAsc ? 'desc' : 'asc'
    }))
  }

  return {
    // Filters
    filters,
    updateFilters,
    toggleSort,

    // Pagination
    ...pagination,

    // Data
    combined: processed.combined,
    pagedCombined: processed.paginated,

    // Stats
    sumIncome: processed.sumIncome,
    sumExpense: processed.sumExpense,
    profit: processed.profit,
  }
}
