/**
 * Finance 페이지 컨트롤러
 * 인증 확인, 파라미터 결정, 데이터 로딩 결정, View에 props 전달만 담당
 */

'use client'

import { lazy, Suspense, useState } from 'react'
import FinancePageView from '../components/finance/FinancePageView'
import FinanceCreateModal from '../components/finance/FinanceCreateModal'
import { useFinanceData } from '../lib/hooks/useFinanceData'
import { useFinanceFilters } from '../lib/hooks/useFinanceFilters'
import { useFinanceActions } from '../lib/hooks/useFinanceActions'
import type { FinanceModalState, FinanceCombinedRow } from '@/types/finance'

// Modals
const ExpenseDetailModal = lazy(() => import('../components/modals/ExpenseDetailModal'))
const TransactionDetailModal = lazy(() => import('../components/modals/TransactionDetailModal'))

export default function FinancePage() {
  // 모달 상태 관리 (컨트롤러 역할)
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

  // 이벤트 핸들러 (컨트롤러 역할)
  const openCreateModal = () => {
    setModalState(prev => ({ ...prev, newOpen: true }))
  }

  const closeCreateModal = () => {
    setModalState(prev => ({ ...prev, newOpen: false }))
  }

  const handleCreateSubmit = async (incomeCategories: string[], expenseCategories: string[]): Promise<boolean> => {
    const result = await submitCreate(incomeCategories, expenseCategories)
    if (result) {
      closeCreateModal()
    }
    return result
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
    <>
      <FinancePageView
        loading={loading}
        error={error}
        dateRange={dateRange}
        onUpdateRange={updateRange}
        filters={filters}
        onUpdateFilters={updateFilters}
        onToggleSort={toggleSort}
        page={paginationData.page}
        pageSize={paginationData.pageSize}
        onPageChange={paginationData.setPage}
        combined={paginationData.combined}
        pagedCombined={paginationData.pagedCombined}
        sumIncome={paginationData.sumIncome}
        sumExpense={paginationData.sumExpense}
        profit={paginationData.profit}
        onCreateNew={openCreateModal}
        onItemClick={handleItemClick}
        onExportExcel={handleExportExcel}
        onGenerateTaxReport={handleGenerateTaxReport}
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
        {modalState.expenseOpen && (
          <ExpenseDetailModal
            open={modalState.expenseOpen}
            item={modalState.expenseDetail}
            onClose={() => setModalState(prev => ({ ...prev, expenseOpen: false, expenseDetail: null }))}
            onSaved={load}
            onDeleted={load}
          />
        )}
        {modalState.txOpen && (
          <TransactionDetailModal
            open={modalState.txOpen}
            item={modalState.txDetail}
            onClose={() => setModalState(prev => ({ ...prev, txOpen: false, txDetail: null }))}
            onSaved={load}
            onDeleted={load}
          />
        )}
      </Suspense>
    </>
  )
}
