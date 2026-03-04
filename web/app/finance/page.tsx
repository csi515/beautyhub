'use client'

import { lazy, Suspense, useState } from 'react'
import { Plus } from 'lucide-react'
import { Box, Stack, Fab, Typography } from '@mui/material'

// Components
import FinanceHeader from '@/app/components/features/finance/FinanceHeader'
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
    <Box sx={{ px: { xs: 1.5, sm: 2, md: 3 }, py: 4, maxWidth: { xs: '100%', md: '1200px' }, mx: 'auto', width: '100%' }}>
      <Stack spacing={3}>
      {/* 헤더 영역 */}
      <FinanceHeader
        onExportExcel={handleExportExcel}
        onGenerateTaxReport={handleGenerateTaxReport}
      />

      {/* 요약 카드 */}
      <FinanceSummaryCards
        sumIncome={paginationData.sumIncome}
        sumExpense={paginationData.sumExpense}
        profit={paginationData.profit}
      />

      {/* 필터 및 기간 */}
      <FinanceFilters
        dateRange={dateRange}
        onUpdateRange={updateRange}
        filterType={filters.filterType}
        onFilterTypeChange={(types) => updateFilters({ filterType: types })}
        showFilters={filters.showFilters}
        onToggleShowFilters={() => updateFilters({ showFilters: !filters.showFilters })}
        onCreateNew={openCreateModal}
        onExportExcel={handleExportExcel}
      />

      {/* 모바일 카드 뷰 */}
      <FinanceMobileCards
        loading={loading}
        pagedCombined={paginationData.pagedCombined}
        combined={paginationData.combined}
        page={paginationData.page}
        pageSize={paginationData.pageSize}
        onPageChange={paginationData.setPage}
        onItemClick={handleItemClick}
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
      />

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
      {error && <Typography color="error" variant="body2">{error}</Typography>}

      {/* Mobile FAB */}
      <Fab
        color="primary"
        aria-label="새 수입/지출 추가"
        sx={{
          position: 'fixed',
          bottom: { xs: 72, md: 16 },
          right: 16,
          display: { xs: 'flex', md: 'none' },
        }}
        onClick={openCreateModal}
      >
        <Plus />
      </Fab>
    </Stack>
    </Box>
  )
}
