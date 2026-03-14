'use client'

import { lazy, Suspense, useState } from 'react'
import { Stack, Box } from '@mui/material'
import PageContainer from '@/app/components/layout/PageContainer'
import PageIntro from '@/app/components/common/PageIntro'
import ErrorState from '@/app/components/common/ErrorState'

// Components
import FinanceSummaryCards from '@/app/components/features/finance/FinanceSummaryCards'
import FinanceFilters from '@/app/components/features/finance/FinanceFilters'
import FinanceMobileCards from '@/app/components/features/finance/FinanceMobileCards'
import FinanceDesktopTable from '@/app/components/features/finance/FinanceDesktopTable'
import FinanceCreateModal from '@/app/components/features/finance/FinanceCreateModal'

// Modals
const ExpenseDetailModal = lazy(() => import('@/app/components/modals/ExpenseDetailModal'))
const TransactionDetailModal = lazy(() => import('@/app/components/modals/TransactionDetailModal'))

// Hooks
import { useFinanceData } from '@/app/lib/hooks/useFinanceData'
import { useFinanceFilters } from '@/app/lib/hooks/useFinanceFilters'
import { useFinanceActions } from '@/app/lib/hooks/useFinanceActions'
import { FinanceModalState, FinanceCombinedRow } from '@/types/finance'

export default function FinancePage() {
  const [modalState, setModalState] = useState<FinanceModalState>({
    newOpen: false,
    expenseOpen: false,
    txOpen: false,
    expenseDetail: null,
    txDetail: null
  })

  // Data hooks
  const {
    dateRange,
    updateRange,
    expenses,
    transactions,
    loading,
    error,
    incomeCategories,
    expenseCategories,
    load
  } = useFinanceData()

  // Filters and pagination hook
  const {
    filters,
    updateFilters,
    toggleSort,
    ...paginationData
  } = useFinanceFilters(expenses, transactions, dateRange)

  // Actions hook
  const {
    createForm,
    updateCreateForm,
    handleExportExcel,
    handleGenerateTaxReport,
    handleCreateSubmit: submitCreate
  } = useFinanceActions(
    paginationData.combined,
    dateRange,
    paginationData.sumIncome,
    paginationData.sumExpense,
    paginationData.profit,
    load
  )

  // Modal handlers
  const openCreateModal = () => {
    setModalState(prev => ({ ...prev, newOpen: true }))
  }

  const closeCreateModal = () => {
    setModalState(prev => ({ ...prev, newOpen: false }))
  }

  const handleCreateSubmit = async (incomeCategories: string[], expenseCategories: string[]): Promise<boolean> => {
    return await submitCreate(incomeCategories, expenseCategories)
  }

  const handleItemClick = (row: FinanceCombinedRow) => {
    if (row.type === 'income') {
      setModalState(prev => ({
        ...prev,
        txDetail: row.raw as any,
        txOpen: true
      }))
    } else {
      setModalState(prev => ({
        ...prev,
        expenseDetail: row.raw as any,
        expenseOpen: true
      }))
    }
  }

  return (
    <PageContainer maxWidth="xl">
      <Stack spacing={3} sx={{ flex: 1, minHeight: 0, minWidth: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <PageIntro description="수입·지출 내역을 확인하고 관리합니다" />
      {/* 요약 카드 */}
      <Box sx={{ flexShrink: 0 }}>
      <FinanceSummaryCards
        sumIncome={paginationData.sumIncome}
        sumExpense={paginationData.sumExpense}
        profit={paginationData.profit}
      />
      </Box>

      {/* 기간 */}
      <Box sx={{ flexShrink: 0 }}>
      <FinanceFilters
        dateRange={dateRange}
        onUpdateRange={updateRange}
        filterType={filters.filterType}
        onFilterTypeChange={(types) => updateFilters({ filterType: types })}
        showFilters={filters.showFilters}
        onToggleShowFilters={() => updateFilters({ showFilters: !filters.showFilters })}
        onExportExcel={handleExportExcel}
        onGenerateTaxReport={handleGenerateTaxReport}
      />
      </Box>

      {/* 모바일 카드 뷰 + 데스크톱 테이블 */}
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
      {error ? (
        <ErrorState
          message={error}
          onRetry={load}
          retryLabel="다시 시도"
        />
      ) : (
      <>
      <FinanceMobileCards
        loading={loading}
        pagedCombined={paginationData.pagedCombined}
        combined={paginationData.combined}
        page={paginationData.page}
        pageSize={paginationData.pageSize}
        onPageChange={paginationData.setPage}
        onItemClick={handleItemClick}
        onCreateNew={openCreateModal}
      />

      {/* 데스크톱 테이블 뷰 */}
      <FinanceDesktopTable
        loading={loading}
        pagedCombined={paginationData.pagedCombined}
        combined={paginationData.combined}
        sortKey={filters.sortKey}
        sortDir={filters.sortDir}
        page={paginationData.page}
        pageSize={paginationData.pageSize}
        onSortToggle={toggleSort}
        onPageChange={paginationData.setPage}
        onItemClick={handleItemClick}
        onCreateNew={openCreateModal}
      />
      </>
      )}
      </Box>

      {/* 신규 등록 모달 */}
      <FinanceCreateModal
        open={modalState.newOpen}
        onClose={closeCreateModal}
        form={createForm}
        onFormChange={updateCreateForm}
        incomeCategories={incomeCategories}
        expenseCategories={expenseCategories}
        onSubmit={handleCreateSubmit}
      />


      {/* 상세 모달 (Lazy) */}
      <Suspense fallback={null}>
        {modalState.expenseOpen && <ExpenseDetailModal
          open={modalState.expenseOpen}
          item={modalState.expenseDetail}
          onClose={() => setModalState(prev => ({ ...prev, expenseOpen: false, expenseDetail: null }))}
          onSaved={load}
          onDeleted={load}
        />}
        {modalState.txOpen && <TransactionDetailModal
          open={modalState.txOpen}
          item={modalState.txDetail}
          onClose={() => setModalState(prev => ({ ...prev, txOpen: false, txDetail: null }))}
          onSaved={load}
          onDeleted={load}
        />}
      </Suspense>
      </Stack>
    </PageContainer>
  )
}
