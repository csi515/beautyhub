'use client'

import { Plus } from 'lucide-react'
import { useState, lazy, Suspense } from 'react'
import { useAppToast } from '../lib/ui/toast'
import { exportToCSV, prepareCustomerDataForExport } from '../lib/utils/export'

// Components
import CustomerFilters from '../components/customers/CustomerFilters'
import CustomerTable from '../components/customers/CustomerTable'
import CustomerCards from '../components/customers/CustomerCards'
import CustomerPagination from '../components/customers/CustomerPagination'
import StandardPageLayout from '../components/common/StandardPageLayout'
import MobileFAB from '../components/common/MobileFAB'

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
  const toast = useAppToast()

  // Search
  const { query, setQuery } = useSearch({ debounceMs: 300 })

  // Filters state
  const [filters, setFilters] = useState<CustomerFiltersType>({
    statusFilter: 'all',
    vipFilter: 'all',
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

  // CSV export function
  const handleExport = () => {
    const dataToExport = prepareCustomerDataForExport(filteredRows)
    exportToCSV(dataToExport, `고객목록_${new Date().toISOString().slice(0, 10)}.csv`)
    toast.success('CSV 파일이 다운로드되었습니다')
  }

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      statusFilter: 'all',
      vipFilter: 'all',
      minPoints: '',
      maxPoints: ''
    })
  }

  // Update filters
  const handleFiltersChange = (newFilters: Partial<CustomerFiltersType>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }


  const handleCreateCustomer = () => {
    setSelected({ id: '', owner_id: '', name: '', phone: '', email: '', address: '' } as Customer)
    setDetailOpen(true)
  }

  return (
    <StandardPageLayout
      loading={loading}
      error={error}
      empty={!loading && filteredRows.length === 0 && customers.length === 0}
      emptyTitle="고객이 없습니다"
      emptyDescription="새로운 고객을 추가하여 시작하세요"
      emptyActionLabel="고객 추가"
      emptyActionOnClick={handleCreateCustomer}
      errorTitle="오류 발생"
    >
      {/* 필터 및 검색 */}
      <CustomerFilters
        query={query}
        onQueryChange={setQuery}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onResetFilters={handleResetFilters}
        onExport={handleExport}
        onCreateCustomer={handleCreateCustomer}
        filteredCount={filteredRows.length}
        totalCount={customers.length}
      />

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
        onCreateCustomer={handleCreateCustomer}
      />

      {/* 페이지네이션 및 일괄 작업 */}
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
      />

      {detailOpen && (
        <Suspense fallback={null}>
          <CustomerDetailModal
            open={detailOpen}
            item={selected}
            onClose={() => setDetailOpen(false)}
            onSaved={refreshCustomers}
          />
        </Suspense>
      )}

      {/* Mobile FAB */}
      <MobileFAB
        icon={<Plus className="h-5 w-5" />}
        label="새 고객 추가"
        onClick={handleCreateCustomer}
      />
    </StandardPageLayout>
  )
}
