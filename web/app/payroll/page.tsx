/**
 * Payroll 페이지 컨트롤러
 * 인증 확인, 파라미터 결정, 데이터 로딩 결정, View에 props 전달만 담당
 */

'use client'

import { useState } from 'react'
import PayrollPageView from '../components/payroll/PayrollPageView'
import PayrollCalculationModal from '../components/payroll/PayrollCalculationModal'
import PayrollSettingsModal from '../components/modals/PayrollSettingsModal'
import PayrollDetailModal from '../components/modals/PayrollDetailModal'
import { useAppToast } from '../lib/ui/toast'
import { usePayroll } from '../lib/hooks/usePayroll'
import { usePayrollFilters } from '../lib/hooks/usePayrollFilters'
import { exportToCSV, preparePayrollDataForExport } from '../lib/utils/export'
import { useModals } from '../lib/hooks/useModals'
import { useModalWithData } from '../lib/hooks/useModalWithData'
import { useSelection } from '../lib/hooks/useSelection'
import type { PayrollCalculationResult } from '@/types/payroll'

export default function PayrollPage() {
    // Modal states
    const modals = useModals<'calculate' | 'settings' | 'detail'>()
    const calculationModal = useModalWithData<{
        staffId: string
        result: PayrollCalculationResult | null
    }>()
    const settingsModal = useModalWithData<{ staffId: string; staffName: string }>()
    const detailModal = useModalWithData<any>()

    // Bulk calculation state
    const selectedStaffIds = useSelection<string>({ useSet: false })
    const [bulkCalculating, setBulkCalculating] = useState(false)

    const toast = useAppToast()

    // Payroll hooks
    const {
        staff,
        records,
        loading,
        selectedMonth,
        setSelectedMonth,
        refreshData,
        calculatePayroll,
        calculateBulkPayroll,
        updatePayrollStatus
    } = usePayroll()

    // Filters hook
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
        totalNetPay
    } = usePayrollFilters(staff, records)

    async function handleCalculatePayroll() {
        if (!calculationModal.data?.staffId) return

        const result = await calculatePayroll(calculationModal.data.staffId, selectedMonth)
        calculationModal.updateData({ result })
    }

    async function handleBulkCalculatePayroll() {
        const ids = selectedStaffIds.selected as string[]
        if (ids.length === 0) return

        setBulkCalculating(true)
        await calculateBulkPayroll(ids, selectedMonth)
        selectedStaffIds.clear()
        setBulkCalculating(false)
    }

    function openCalculateModal() {
        calculationModal.openModal({ staffId: '', result: null })
        modals.open('calculate')
    }

    function closeCalculateModal() {
        modals.close('calculate')
        calculationModal.closeModal()
    }

    const openSettingsModal = (staffId: string, staffName: string) => {
        settingsModal.openModal({ staffId, staffName })
        modals.open('settings')
    }

    const openDetailModal = (record: any) => {
        detailModal.openModal(record)
        modals.open('detail')
    }

    const handleStatusChange = async (record: any, newStatus: 'approved' | 'paid') => {
        await updatePayrollStatus(record.staff_id, record.month, newStatus)
    }


    const handleExport = () => {
        // Export logic might still want to use RECORDS for the CSV
        // Or we can export all staff and their payroll info if available
        const dataToExport = preparePayrollDataForExport(records)
        exportToCSV(dataToExport, `${selectedMonth}_급여내역.csv`)
        toast.success('CSV 파일이 다운로드되었습니다')
    }


    return (
        <>
            <PayrollPageView
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
                staffName={detailModal.data?.staff?.name || undefined}
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
