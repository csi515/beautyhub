'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { lazy, Suspense } from 'react'
import { useAppToast } from '@/app/lib/ui/toast'
import { exportToCSV, prepareCustomerDataForExport } from '@/app/lib/utils/export'
import CustomersPageView from '@/app/components/customers/CustomersPageView'
import CustomerAnalyticsTab from '@/app/components/customers/CustomerAnalyticsTab'
import { useCustomers } from '@/app/lib/hooks/useCustomers'
import { useCustomerFilters } from '@/app/lib/hooks/useCustomerFilters'
import { useSearch } from '@/app/lib/hooks/useSearch'
import { useModalWithData } from '@/app/lib/hooks/useModalWithData'
import { useFilters } from '@/app/lib/hooks/useFilters'
import type { Customer } from '@/types/entities'
import type { CustomerFilters as CustomerFiltersType } from '@/types/customer'

const CustomerDetailModal = lazy(() => import('@/app/components/modals/CustomerDetailModal'))

type TabValue = 'list' | 'analytics'

export default function CustomersPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = (searchParams.get('tab') ?? 'list') as TabValue
  const tabFromUrl = tabParam === 'analytics' ? 'analytics' : 'list'
  const [tab, setTab] = useState<TabValue>(tabFromUrl)

  useEffect(() => {
    setTab(tabFromUrl)
  }, [tabFromUrl])

  const handleTabChange = (t: TabValue) => {
    setTab(t)
    router.replace(`/customers?tab=${t}`)
  }

  const detailModal = useModalWithData<Customer>()
  const toast = useAppToast()
  const { query, setQuery } = useSearch({ debounceMs: 300 })

  const initialFilters: CustomerFiltersType = {
    statusFilter: 'all',
    vipFilter: 'all',
    minPoints: '',
    maxPoints: '',
  }
  const filters = useFilters(initialFilters)

  const {
    customers,
    loading,
    error,
    selectedCustomerIds,
    pointsByCustomer,
    refreshCustomers,
    updateSelectedCustomerIds,
  } = useCustomers(query)

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
    paginatedRows,
  } = useCustomerFilters(customers, pointsByCustomer, filters.filters)

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
        tab={tab}
        onTabChange={handleTabChange}
        analyticsTab={<CustomerAnalyticsTab />}
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
