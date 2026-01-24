/**
 * Customers 페이지 View 컴포넌트
 * 순수 UI만 담당, 모든 로직은 props로 받음
 */

'use client'

import { Plus, List, TrendingUp } from 'lucide-react'
import { Box, Typography } from '@mui/material'
import CustomerFilters from './CustomerFilters'
import CustomerTable from './CustomerTable'
import CustomerCards from './CustomerCards'
import CustomerPagination from './CustomerPagination'
import StandardPageLayout from '../common/StandardPageLayout'
import MobileFAB from '../common/MobileFAB'
import FilterBottomSheet from '../common/FilterBottomSheet'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs'
import { useMobilePageHeader } from '@/app/lib/hooks/useMobilePageHeader'
import type { Customer } from '@/types/entities'
import type { CustomerFilters as CustomerFiltersType } from '@/types/customer'

export interface CustomersPageViewProps {
  tab?: 'list' | 'analytics'
  onTabChange?: (tab: 'list' | 'analytics') => void
  analyticsTab?: React.ReactNode
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
  tab = 'list',
  onTabChange,
  analyticsTab,
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
  const activeFilterCount = [
    query !== '',
    filters.statusFilter !== 'all',
    filters.vipFilter !== 'all',
    filters.minPoints !== '',
    filters.maxPoints !== '',
  ].filter(Boolean).length
  const { isMobile, filterSheetOpen, closeFilterSheet } = useMobilePageHeader({
    title: '고객 관리',
    filterBadge: activeFilterCount,
  })

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

  const isListTab = tab === 'list'
  const showListEmpty = !loading && filteredCustomers.length === 0 && customers.length === 0

  const listContent = (
    <>
      {isMobile ? (
        <FilterBottomSheet
          open={filterSheetOpen}
          onClose={closeFilterSheet}
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

      <CustomerCards
        customers={customers}
        paginatedCustomers={paginatedCustomers}
        loading={loading}
        pointsByCustomer={pointsByCustomer}
        onCustomerClick={onCustomerClick}
      />

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

      {isListTab && (
        <MobileFAB
          icon={<Plus className="h-5 w-5" />}
          label="새 고객 추가"
          onClick={onCreateCustomer}
        />
      )}
    </>
  )

  return (
    <StandardPageLayout
      loading={isListTab ? loading : false}
      error={isListTab ? error : undefined}
      empty={isListTab && showListEmpty}
      emptyTitle="고객이 없습니다"
      emptyDescription="새로운 고객을 추가하여 시작하세요"
      emptyActionLabel="고객 추가"
      emptyActionOnClick={onCreateCustomer}
      errorTitle="오류 발생"
    >
      {onTabChange != null && analyticsTab != null ? (
        <Tabs value={tab} onValueChange={(v) => onTabChange(v as 'list' | 'analytics')}>
          <Box sx={{ mb: 2 }}>
            <TabsList>
              <TabsTrigger value="list">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <List size={18} />
                  <Typography variant="body2" fontWeight={500}>고객 목록</Typography>
                </Box>
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUp size={18} />
                  <Typography variant="body2" fontWeight={500}>고객 분석</Typography>
                </Box>
              </TabsTrigger>
            </TabsList>
          </Box>

          <TabsContent value="list">{listContent}</TabsContent>
          <TabsContent value="analytics">{analyticsTab}</TabsContent>
        </Tabs>
      ) : (
        listContent
      )}
    </StandardPageLayout>
  )
}
