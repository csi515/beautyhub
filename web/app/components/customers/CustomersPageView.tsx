/**
 * Customers 페이지 View 컴포넌트
 * 순수 UI만 담당, 모든 로직은 props로 받음
 */

'use client'

import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTheme, useMediaQuery } from '@mui/material'
import CustomerFilters from './CustomerFilters'
import CustomerTable from './CustomerTable'
import CustomerCards from './CustomerCards'
import CustomerPagination from './CustomerPagination'
import StandardPageLayout from '../common/StandardPageLayout'
import MobileFAB from '../common/MobileFAB'
import FilterBottomSheet from '../common/FilterBottomSheet'
import { usePageHeader } from '@/app/lib/contexts/PageHeaderContext'
import type { Customer } from '@/types/entities'
import type { CustomerFilters as CustomerFiltersType } from '@/types/customer'

export interface CustomersPageViewProps {
  // 데이터
  customers: Customer[]
  paginatedCustomers: Customer[]
  filteredCustomers: Customer[]
  loading: boolean
  error: string
  selectedCustomerIds: string[]
  pointsByCustomer: Record<string, number>
  
  // 필터/검색
  query: string
  setQuery: (query: string) => void
  filters: CustomerFiltersType
  onFiltersChange: (filters: Partial<CustomerFiltersType>) => void
  
  // 정렬
  sortKey: string | null
  sortDirection: 'asc' | 'desc'
  toggleSort: (key: string) => void
  
  // 페이지네이션
  page: number
  pageSize: number
  setPage: (page: number) => void
  setPageSize: (pageSize: number) => void
  totalPages: number
  
  // 액션
  onCustomerClick: (customer: Customer) => void
  onCreateCustomer: () => void
  onResetFilters: () => void
  onExport: () => void
  onSelectedCustomerIdsChange: (ids: string[]) => void
  onClearSelection: () => void
}

export default function CustomersPageView({
  customers,
  paginatedCustomers,
  filteredCustomers,
  loading,
  error,
  selectedCustomerIds,
  pointsByCustomer,
  query,
  setQuery,
  filters,
  onFiltersChange,
  sortKey,
  sortDirection,
  toggleSort,
  page,
  pageSize,
  setPage,
  setPageSize,
  totalPages,
  onCustomerClick,
  onCreateCustomer,
  onResetFilters,
  onExport,
  onSelectedCustomerIdsChange,
  onClearSelection,
}: CustomersPageViewProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { setHeaderInfo, clearHeaderInfo } = usePageHeader()
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)

  // 활성 필터 개수 계산
  const activeFilterCount = [
    query !== '',
    filters.statusFilter !== 'all',
    filters.vipFilter !== 'all',
    filters.minPoints !== '',
    filters.maxPoints !== '',
  ].filter(Boolean).length

  // 모바일에서 Context에 헤더 정보 설정
  useEffect(() => {
    if (isMobile) {
      setHeaderInfo({
        title: '고객 관리',
        onFilter: () => setFilterSheetOpen(true),
        filterBadge: activeFilterCount,
      })
    } else {
      clearHeaderInfo()
    }

    return () => {
      if (isMobile) {
        clearHeaderInfo()
      }
    }
  }, [isMobile, setHeaderInfo, clearHeaderInfo, activeFilterCount])

  // 필터 콘텐츠
  const filterContent = (
    <CustomerFilters
      query={query}
      onQueryChange={setQuery}
      filters={filters}
      onFiltersChange={onFiltersChange}
      onResetFilters={onResetFilters}
      onExport={onExport}
      onCreateCustomer={onCreateCustomer}
      filteredCount={filteredCustomers.length}
      totalCount={customers.length}
    />
  )

  return (
    <StandardPageLayout
      loading={loading}
      error={error}
      empty={!loading && filteredCustomers.length === 0 && customers.length === 0}
      emptyTitle="고객이 없습니다"
      emptyDescription="새로운 고객을 추가하여 시작하세요"
      emptyActionLabel="고객 추가"
      emptyActionOnClick={onCreateCustomer}
      errorTitle="오류 발생"
    >
      {/* 필터 및 검색 */}
      {isMobile ? (
        <FilterBottomSheet
          open={filterSheetOpen}
          onClose={() => setFilterSheetOpen(false)}
          title="필터"
        >
          {filterContent}
        </FilterBottomSheet>
      ) : (
        <CustomerFilters
          query={query}
          onQueryChange={setQuery}
          filters={filters}
          onFiltersChange={onFiltersChange}
          onResetFilters={onResetFilters}
          onExport={onExport}
          onCreateCustomer={onCreateCustomer}
          filteredCount={filteredCustomers.length}
          totalCount={customers.length}
        />
      )}

      {/* 모바일 카드 뷰 */}
      <CustomerCards
        customers={customers}
        paginatedCustomers={paginatedCustomers}
        loading={loading}
        pointsByCustomer={pointsByCustomer}
        onCustomerClick={onCustomerClick}
      />

      {/* 데스크톱 테이블 뷰 */}
      <CustomerTable
        customers={customers}
        paginatedCustomers={paginatedCustomers}
        loading={loading}
        selectedCustomerIds={selectedCustomerIds}
        onSelectedCustomerIdsChange={onSelectedCustomerIdsChange}
        pointsByCustomer={pointsByCustomer}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSortToggle={toggleSort}
        onCustomerClick={onCustomerClick}
        onCreateCustomer={onCreateCustomer}
      />

      {/* 페이지네이션 및 일괄 작업 */}
      <CustomerPagination
        loading={loading}
        filteredCount={filteredCustomers.length}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        onPageChange={setPage}
        onPageSizeChange={(newPageSize) => {
          setPageSize(newPageSize)
          setPage(1)
        }}
        selectedCustomerIds={selectedCustomerIds}
        onClearSelection={onClearSelection}
      />

      {/* Mobile FAB */}
      <MobileFAB
        icon={<Plus className="h-5 w-5" />}
        label="새 고객 추가"
        onClick={onCreateCustomer}
      />
    </StandardPageLayout>
  )
}
