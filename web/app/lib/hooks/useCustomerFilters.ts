import { useMemo, useEffect } from 'react'
import { useSort } from './useSort'
import { usePagination } from './usePagination'
import { CustomersService } from '../services/customers.service'
import { type Customer } from '@/types/entities'
import { type CustomerFilters } from '@/types/customer'

export function useCustomerFilters(
  customers: Customer[],
  pointsByCustomer: Record<string, number>,
  filters: CustomerFilters
) {
  const { sortKey, sortDirection, toggleSort } = useSort<Customer & Record<string, unknown>>({
    initialKey: 'name',
    initialDirection: 'asc',
  })

  const pagination = usePagination({
    initialPage: 1,
    initialPageSize: 10,
    totalItems: customers.length,
  })

  const { page, pageSize, setPage, setPageSize } = pagination

  // Service 레이어를 사용한 데이터 가공
  const processed = useMemo(() => {
    return CustomersService.processCustomerList(
      customers,
      filters,
      sortKey as string,
      sortDirection,
      page,
      pageSize,
      pointsByCustomer
    )
  }, [customers, filters, sortKey, sortDirection, page, pageSize, pointsByCustomer])

  // 페이지 변경 시 필터 변경으로 인해 현재 페이지가 유효 범위를 벗어나면 첫 페이지로 이동
  useEffect(() => {
    if (page > processed.totalPages && processed.totalPages > 0) {
      setPage(1)
    }
  }, [processed.totalPages, page, setPage])

  return {
    // Sorting
    sortKey,
    sortDirection,
    toggleSort,

    // Pagination
    page,
    pageSize,
    setPage,
    setPageSize,
    filteredTotalPages: processed.totalPages,

    // Filtered data
    filteredRows: processed.filtered,
    paginatedRows: processed.paginated,

    // Actions
    resetFilters: () => {}, // 컴포넌트에서 구현
  }
}
