/**
 * Customers 페이지 컨트롤러
 * 인증 확인, 파라미터 결정, 데이터 로딩 결정, View에 props 전달만 담당
 */

'use client'

import { lazy, Suspense } from 'react'
import { useAppToast } from '../lib/ui/toast'
import { exportToCSV, prepareCustomerDataForExport } from '../lib/utils/export'
import CustomersPageView from '../components/customers/CustomersPageView'
import { useCustomers } from '../lib/hooks/useCustomers'
import { useCustomerFilters } from '../lib/hooks/useCustomerFilters'
import { useSearch } from '../lib/hooks/useSearch'
import { useModalWithData } from '../lib/hooks/useModalWithData'
import { useFilters } from '../lib/hooks/useFilters'
import type { Customer } from '@/types/entities'
import type { CustomerFilters as CustomerFiltersType } from '@/types/customer'

const CustomerDetailModal = lazy(() => import('../components/modals/CustomerDetailModal'))

export default function CustomersPage() {
  // 모달 상태 관리 (컨트롤러 역할)
  const detailModal = useModalWithData<Customer>()
  const toast = useAppToast()

  // Search
  const { query, setQuery } = useSearch({ debounceMs: 300 })

  // Filters state
  const initialFilters: CustomerFiltersType = {
    statusFilter: 'all',
    vipFilter: 'all',
    minPoints: '',
    maxPoints: ''
  }
  
  const filters = useFilters(initialFilters)

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
  } = useCustomerFilters(customers, pointsByCustomer, filters.filters)

  // 이벤트 핸들러 (컨트롤러 역할)
  const handleExport = () => {
    const dataToExport = prepareCustomerDataForExport(filteredRows)
    exportToCSV(dataToExport, `고객목록_${new Date().toISOString().slice(0, 10)}.csv`)
    toast.success('CSV 파일이 다운로드되었습니다')
  }

  const handleCreateCustomer = () => {
    detailModal.openModal({ id: '', owner_id: '', name: '', phone: '', email: '', address: '' } as Customer)
  }

  const handleCustomerClick = (customer: Customer) => {
    detailModal.openModal(customer)
  }

  return (
    <>
      <CustomersPageView
        customers={customers}
        paginatedCustomers={paginatedRows}
        filteredCustomers={filteredRows}
        loading={loading}
        error={error}
        selectedCustomerIds={selectedCustomerIds}
        pointsByCustomer={pointsByCustomer}
        query={query}
        setQuery={setQuery}
        filters={filters.filters}
        onFiltersChange={filters.updateFilters}
        sortKey={sortKey}
        sortDirection={sortDirection}
        toggleSort={toggleSort}
        page={page}
        pageSize={pageSize}
        setPage={setPage}
        setPageSize={setPageSize}
        totalPages={filteredTotalPages}
        onCustomerClick={handleCustomerClick}
        onCreateCustomer={handleCreateCustomer}
        onResetFilters={filters.resetFilters}
        onExport={handleExport}
        onSelectedCustomerIdsChange={updateSelectedCustomerIds}
        onClearSelection={() => updateSelectedCustomerIds([])}
      />

      {detailModal.open && detailModal.data && (
        <Suspense fallback={null}>
          <CustomerDetailModal
            open={detailModal.open}
            item={detailModal.data}
            onClose={detailModal.closeModal}
            onSaved={refreshCustomers}
          />
        </Suspense>
      )}
    </>
  )
}
