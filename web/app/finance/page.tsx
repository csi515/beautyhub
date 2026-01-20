'use client'

import { lazy, Suspense, useState } from 'react'
import { Plus } from 'lucide-react'
import { Stack } from '@mui/material'

// Components
import FinanceSummaryCards from '../components/finance/FinanceSummaryCards'
import FinanceFilters from '../components/finance/FinanceFilters'
import FinanceMobileCards from '../components/finance/FinanceMobileCards'
import FinanceDesktopTable from '../components/finance/FinanceDesktopTable'
import FinanceCreateModal from '../components/finance/FinanceCreateModal'
import StandardPageLayout from '../components/common/StandardPageLayout'
import MobileFAB from '../components/common/MobileFAB'
import PageHeader from '../components/common/PageHeader'
import Button from '../components/ui/Button'
import { FileText, Download } from 'lucide-react'
import { IconButton } from '@mui/material'

// Modals
const ExpenseDetailModal = lazy(() => import('../components/modals/ExpenseDetailModal'))
const TransactionDetailModal = lazy(() => import('../components/modals/TransactionDetailModal'))

// Hooks
import { useFinanceData } from '../lib/hooks/useFinanceData'
import { useFinanceFilters } from '../lib/hooks/useFinanceFilters'
import { useFinanceActions } from '../lib/hooks/useFinanceActions'
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
    <StandardPageLayout
      loading={loading}
      error={error || undefined}
      errorTitle="재무 데이터를 불러오는 중 오류가 발생했습니다"
      maxWidth={{ xs: '100%', md: '1200px' }}
    >
      <Stack spacing={3}>
      {/* 헤더 영역 */}
      <PageHeader
        title="재무 관리"
        useMUI
        actions={[
          <Button
            key="tax-report"
            variant="outline"
            size="sm"
            leftIcon={<FileText className="h-4 w-4" />}
            onClick={handleGenerateTaxReport}
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          >
            세무 자료 생성
          </Button>,
          <Button
            key="export"
            variant="outline"
            size="sm"
            leftIcon={<Download className="h-4 w-4" />}
            onClick={handleExportExcel}
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          >
            엑셀로 내보내기
          </Button>,
          // 모바일용
          <IconButton key="export-mobile" onClick={handleExportExcel} sx={{ display: { xs: 'flex', sm: 'none' } }}>
            <Download className="h-5 w-5" />
          </IconButton>,
        ]}
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
      {/* Mobile FAB */}
      <MobileFAB
        icon={<Plus />}
        label="새 수입/지출 추가"
        onClick={openCreateModal}
      />
    </Stack>
    </StandardPageLayout>
  )
}
