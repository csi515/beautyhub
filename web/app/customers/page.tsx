'use client'

import { Plus } from 'lucide-react'
import { useState, lazy, Suspense } from 'react'
// MUI 레이아웃 유틸리티 (허용)
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
// 공통 컴포넌트
import ErrorState from '../components/common/ErrorState'
import Button from '../components/ui/Button'
import PageContainer from '../components/layout/PageContainer'
import PageIntro from '../components/common/PageIntro'

// Components
import CustomerFilters from '../components/features/customers/CustomerFilters'
import CustomerTable from '../components/features/customers/CustomerTable'
import CustomerCards from '../components/features/customers/CustomerCards'
import CustomerPagination from '../components/features/customers/CustomerPagination'

// Hooks
import { useCustomers } from '../lib/hooks/useCustomers'
import { useCustomerFilters } from '../lib/hooks/useCustomerFilters'
import { useSearch } from '../lib/hooks/useSearch'

// Types
import { type Customer } from '@/types/entities'
import { type CustomerFilters as CustomerFiltersType } from '@/types/customer'

const CustomerDetailModal = lazy(() => import('../components/modals/CustomerDetailModal'))

export default function CustomersPage() {
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<Customer | null>(null)

  // Search
  const { query, setQuery } = useSearch({ debounceMs: 300 })

  // Filters state
  const [filters, setFilters] = useState<CustomerFiltersType>({
    statusFilter: 'all',
    minPoints: '',
    maxPoints: ''
  })

  // Customer data hook
  const {
    customers,
    loading,
    error,
    selectedCustomerIds,
    pointsByCustomer,
    refreshCustomers,
    updateSelectedCustomerIds
  } = useCustomers(query)

  // Filters and pagination hook
  const {
    sortKey,
    sortDirection,
    toggleSort,
    page,
    pageSize,
    setPage,
    setPageSize,
    filteredTotalPages,
    filteredRows,
    paginatedRows
  } = useCustomerFilters(customers, pointsByCustomer, filters)

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      statusFilter: 'all',
      minPoints: '',
      maxPoints: ''
    })
  }

  // Update filters
  const handleFiltersChange = (newFilters: Partial<CustomerFiltersType>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }


  return (
    <PageContainer maxWidth="xl" fullScreenOnTablet>
      <Stack spacing={2} sx={{ flex: 1, minHeight: 0, minWidth: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <PageIntro description="고객 목록을 검색하고 관리합니다" count={`${filteredRows.length}명`} />
      {/* 검색 */}
      <Box sx={{ flexShrink: 0 }}>
      <CustomerFilters
        query={query}
        onQueryChange={setQuery}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onResetFilters={handleResetFilters}
        onCreateCustomer={() => {
          setSelected({ id: '', owner_id: '', name: '', phone: '', email: '', address: '' } as Customer)
          setDetailOpen(true)
        }}
        filteredCount={filteredRows.length}
        totalCount={customers.length}
      />
      </Box>

      {error && (
        <ErrorState
          message={error}
          onRetry={refreshCustomers}
          retryLabel="다시 시도"
        />
      )}

      {/* 본문 영역 - 태블릿에서 flex로 남은 공간 채움 */}
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', display: { xs: 'block', md: 'flex' }, flexDirection: { md: 'column' } }}>
      {/* 모바일 카드 뷰 */}
      <CustomerCards
        customers={customers}
        paginatedCustomers={paginatedRows}
        loading={loading}
        pointsByCustomer={pointsByCustomer}
        onCustomerClick={(customer) => {
          setSelected(customer)
          setDetailOpen(true)
        }}
      />


      {/* 데스크톱 테이블 뷰 */}
      <CustomerTable
        customers={customers}
        paginatedCustomers={paginatedRows}
        loading={loading}
        selectedCustomerIds={selectedCustomerIds}
        onSelectedCustomerIdsChange={updateSelectedCustomerIds}
        pointsByCustomer={pointsByCustomer}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSortToggle={toggleSort}
        onCustomerClick={(customer) => {
          setSelected(customer)
          setDetailOpen(true)
        }}
        onCreateCustomer={() => {
          setSelected({ id: '', owner_id: '', name: '', phone: '', email: '', address: '', active: true } as Customer)
          setDetailOpen(true)
        }}
      />
      </Box>

      {/* 페이지네이션 및 일괄 작업 */}
      <Box sx={{ flexShrink: 0 }}>
      <CustomerPagination
        loading={loading}
        filteredCount={filteredRows.length}
        page={page}
        pageSize={pageSize}
        totalPages={filteredTotalPages}
        onPageChange={setPage}
        onPageSizeChange={(newPageSize) => {
          setPageSize(newPageSize)
          setPage(1)
        }}
        selectedCustomerIds={selectedCustomerIds}
        onClearSelection={() => updateSelectedCustomerIds([])}
        onRefresh={refreshCustomers}
      />
      </Box>

      {detailOpen && (
        <Suspense fallback={null}>
          <CustomerDetailModal
            open={detailOpen}
            item={selected}
            onClose={() => setDetailOpen(false)}
            onSaved={refreshCustomers}
            onDeleted={refreshCustomers}
          />
        </Suspense>
      )}

      {/* Mobile FAB */}
      <Box
        sx={{
          position: 'fixed',
          bottom: { xs: 80, md: 24 },
          right: { xs: 16, md: 24 },
          zIndex: 1000,
          display: { xs: 'block', md: 'none' }
        }}
      >
        <Button
          variant="primary"
          size="lg"
          onClick={() => {
            setSelected({ id: '', owner_id: '', name: '', phone: '', email: '', address: '' } as Customer)
            setDetailOpen(true)
          }}
          aria-label="새 고객 추가"
          sx={{
            borderRadius: '50%',
            width: 56,
            height: 56,
            minWidth: 56,
            padding: 0,
            boxShadow: 4
          }}
        >
          <Plus size={24} />
        </Button>
      </Box>
    </Stack>
    </PageContainer>
  )
}
