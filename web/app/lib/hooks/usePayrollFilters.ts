import { useState, useMemo, useEffect } from 'react'
import { useSearch } from './useSearch'
import { usePagination } from './usePagination'
import { PayrollService } from '../services/payroll.service'
import { type Staff, type PayrollRecord } from '@/types/payroll'

export function usePayrollFilters(staff: Staff[], records: PayrollRecord[]) {
    const { query, debouncedQuery, setQuery } = useSearch({ debounceMs: 300 })
    const { page, pageSize, setPage } = usePagination({
        initialPage: 1,
        initialPageSize: 10,
        totalItems: 0
    })

    const [statusFilter, setStatusFilter] = useState<string>('all')

    // Service 레이어를 사용한 데이터 가공
    const processed = useMemo(() => {
        return PayrollService.processPayrollList(
            staff,
            records,
            {
                search: debouncedQuery,
                status: statusFilter
            },
            'name', // 기본 정렬 키
            'asc', // 기본 정렬 방향
            page,
            pageSize
        )
    }, [staff, records, debouncedQuery, statusFilter, page, pageSize])

    // 페이지 변경 시 필터 변경으로 인해 현재 페이지가 유효 범위를 벗어나면 첫 페이지로 이동
    useEffect(() => {
        if (page > processed.totalPages && processed.totalPages > 0) {
            setPage(1)
        }
    }, [processed.totalPages, page, setPage])

    return {
        // Search
        query,
        setQuery,

        // Pagination
        page,
        pageSize,
        setPage,
        totalPages: processed.totalPages,

        // Filters
        statusFilter,
        setStatusFilter,

        // Filtered data
        filteredStaff: processed.filtered,
        paginatedStaff: processed.paginated,

        // Calculations
        totalGrossPay: processed.totalGrossPay,
        totalNetPay: processed.totalNetPay,
    }
}
