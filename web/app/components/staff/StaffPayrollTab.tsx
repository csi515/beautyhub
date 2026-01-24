'use client'

import { useState } from 'react'
import PayrollPageView from '@/app/components/payroll/PayrollPageView'
import PayrollCalculationModal from '@/app/components/payroll/PayrollCalculationModal'
import PayrollSettingsModal from '@/app/components/modals/PayrollSettingsModal'
import PayrollDetailModal from '@/app/components/modals/PayrollDetailModal'
import { useAppToast } from '@/app/lib/ui/toast'
import { usePayroll } from '@/app/lib/hooks/usePayroll'
import { usePayrollFilters } from '@/app/lib/hooks/usePayrollFilters'
import { exportToCSV, preparePayrollDataForExport } from '@/app/lib/utils/export'
import { useModals } from '@/app/lib/hooks/useModals'
import { useModalWithData } from '@/app/lib/hooks/useModalWithData'
import { useSelection } from '@/app/lib/hooks/useSelection'
import type { PayrollCalculationResult, PayrollRecord } from '@/types/payroll'

/**
 * 직원 페이지 내 급여 탭 콘텐츠
 * usePayroll, usePayrollFilters, 모달을 묶어 Staff 탭에서 사용
 */
export default function StaffPayrollTab() {
    const modals = useModals<'calculate' | 'settings' | 'detail'>()
    const calculationModal = useModalWithData<{
        staffId: string
        result: PayrollCalculationResult | null
    }>()
    const settingsModal = useModalWithData<{ staffId: string; staffName: string }>()
    const detailModal = useModalWithData<PayrollRecord | null>()

    const selectedStaffIds = useSelection<string>({ useSet: false })
    const [bulkCalculating, setBulkCalculating] = useState(false)
    const toast = useAppToast()

    const {
        staff,
        records,
        loading,
        error: payrollError,
        selectedMonth,
        setSelectedMonth,
        refreshData,
        calculatePayroll,
        calculateBulkPayroll,
        updatePayrollStatus,
    } = usePayroll()

    const {
        query,
        setQuery,
        page,
        setPage,
        totalPages,
        statusFilter,
        setStatusFilter,
        filteredStaff,
        paginatedStaff,
        totalGrossPay,
        totalNetPay,
    } = usePayrollFilters(staff, records)

    const handleCalculatePayroll = async () => {
        if (!calculationModal.data?.staffId) return
        const result = await calculatePayroll(calculationModal.data.staffId, selectedMonth)
        calculationModal.updateData({ result })
    }

    const handleBulkCalculatePayroll = async () => {
        const ids = selectedStaffIds.selected as string[]
        if (ids.length === 0) return
        setBulkCalculating(true)
        await calculateBulkPayroll(ids, selectedMonth)
        selectedStaffIds.clear()
        setBulkCalculating(false)
    }

    const openCalculateModal = () => {
        calculationModal.openModal({ staffId: '', result: null })
        modals.open('calculate')
    }

    const closeCalculateModal = () => {
        modals.close('calculate')
        calculationModal.closeModal()
    }

    const openSettingsModal = (staffId: string, staffName: string) => {
        settingsModal.openModal({ staffId, staffName })
        modals.open('settings')
    }

    const openDetailModal = (record: PayrollRecord | null) => {
        detailModal.openModal(record)
        modals.open('detail')
    }

    const handleStatusChange = async (record: { staff_id: string; month: string } | null, newStatus: 'approved' | 'paid') => {
        if (!record) return
        await updatePayrollStatus(record.staff_id, record.month, newStatus)
    }

    const handleExport = () => {
        const dataToExport = preparePayrollDataForExport(records)
        exportToCSV(dataToExport, `${selectedMonth}_급여내역.csv`)
        toast.success('CSV 파일이 다운로드되었습니다')
    }

    return (
        <>
            <PayrollPageView
                embedded
                error={payrollError}
                onRetry={refreshData}
                staff={staff}
                records={records}
                loading={loading}
                selectedMonth={selectedMonth}
                setSelectedMonth={setSelectedMonth}
                query={query}
                setQuery={setQuery}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                page={page}
                setPage={setPage}
                totalPages={totalPages}
                paginatedStaff={paginatedStaff}
                filteredStaff={filteredStaff}
                totalGrossPay={totalGrossPay}
                totalNetPay={totalNetPay}
                selectedStaffIds={selectedStaffIds.selected as string[]}
                setSelectedStaffIds={selectedStaffIds.setSelected}
                bulkCalculating={bulkCalculating}
                onExport={handleExport}
                onCalculate={openCalculateModal}
                onBulkCalculate={handleBulkCalculatePayroll}
                onSettingsModalOpen={openSettingsModal}
                onDetailModalOpen={openDetailModal}
                onStatusChange={handleStatusChange}
            />

            <PayrollSettingsModal
                open={modals.isOpen('settings')}
                onClose={() => {
                    modals.close('settings')
                    settingsModal.closeModal()
                }}
                staffId={settingsModal.data?.staffId || ''}
                staffName={settingsModal.data?.staffName || ''}
                onSaved={refreshData}
            />

            <PayrollDetailModal
                open={modals.isOpen('detail')}
                onClose={() => {
                    modals.close('detail')
                    detailModal.closeModal()
                }}
                record={detailModal.data}
                staffName={detailModal.data?.staff?.name}
                onSaved={refreshData}
            />

            <PayrollCalculationModal
                open={modals.isOpen('calculate')}
                onClose={closeCalculateModal}
                staff={staff}
                selectedStaffId={calculationModal.data?.staffId || ''}
                selectedMonth={selectedMonth}
                calculationResult={calculationModal.data?.result || null}
                onStaffChange={(id) => calculationModal.updateData({ staffId: id })}
                onMonthChange={setSelectedMonth}
                onCalculate={handleCalculatePayroll}
            />
        </>
    )
}
