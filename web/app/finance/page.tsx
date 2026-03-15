'use client'

import { lazy, Suspense, useState, useCallback } from 'react'
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
import FinancialSettingsModal from '@/app/components/features/settings/modals/FinancialSettingsModal'

// Hooks
import { useFinanceData } from '@/app/lib/hooks/useFinanceData'
import { useAppToast } from '@/app/lib/ui/toast'
import { getLocalizedErrorMessage } from '@/app/lib/utils/messages'
import { settingsApi } from '@/app/lib/api/settings'
import { DEFAULT_SETTINGS, type FinancialSettings } from '@/types/settings'
import { useFinanceFilters } from '@/app/lib/hooks/useFinanceFilters'
import { useFinanceActions } from '@/app/lib/hooks/useFinanceActions'
import { FinanceModalState, FinanceCombinedRow } from '@/types/finance'
import type { Expense, Transaction } from '@/types/entities'

export default function FinancePage() {
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [financialSettings, setFinancialSettings] = useState<FinancialSettings>(DEFAULT_SETTINGS.financialSettings)

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
    load,
    loadCategories
  } = useFinanceData()

  const toast = useAppToast()

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

  const openCategoryModal = useCallback(async () => {
    try {
      const data = await settingsApi.get()
      if (data?.financialSettings) {
        setFinancialSettings(data.financialSettings)
      }
    } catch (error) {
      setFinancialSettings(DEFAULT_SETTINGS.financialSettings)
      toast.error(getLocalizedErrorMessage(error, '카테고리 설정을 불러오는데 실패했습니다. 기본값으로 표시됩니다.'))
    }
    setCategoryModalOpen(true)
  }, [toast])

  const handleSaveCategorySettings = useCallback(async (data: FinancialSettings) => {
    try {
      await settingsApi.update({ financialSettings: data })
      setFinancialSettings(data)
      await loadCategories()
      toast.success('카테고리가 저장되었습니다.')
    } catch (error) {
      toast.error(getLocalizedErrorMessage(error, '카테고리 저장에 실패했습니다.'))
    }
  }, [loadCategories, toast])

  const handleItemClick = (row: FinanceCombinedRow) => {
    if (row.type === 'income') {
      setModalState(prev => ({
        ...prev,
        txDetail: row.raw as Transaction,
        txOpen: true
      }))
    } else {
      setModalState(prev => ({
        ...prev,
        expenseDetail: row.raw as Expense,
        expenseOpen: true
      }))
    }
  }

  return (
    <PageContainer maxWidth="xl" fullScreenOnTablet>
      <Stack spacing={2} sx={{ flex: 1, minHeight: 0, minWidth: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
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
        onCategorySettings={openCategoryModal}
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

      {/* 카테고리 설정 모달 */}
      <FinancialSettingsModal
        open={categoryModalOpen}
        data={financialSettings}
        onClose={() => setCategoryModalOpen(false)}
        onSave={handleSaveCategorySettings}
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
      </Stack>
    </PageContainer>
  )
}
