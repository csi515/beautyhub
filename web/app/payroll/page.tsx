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
import type { PayrollCalculationResult } from '@/types/payroll'

export default function PayrollPage() {
    // Modal states
    const [calculateModalOpen, setCalculateModalOpen] = useState(false)
    const [settingsModalOpen, setSettingsModalOpen] = useState(false)
    const [detailModalOpen, setDetailModalOpen] = useState(false)
    const [selectedRecord, setSelectedRecord] = useState<any>(null)

    // Calculation modal state
    const [selectedStaffId, setSelectedStaffId] = useState('')
    const [calculationResult, setCalculationResult] = useState<PayrollCalculationResult | null>(null)

    // Settings modal state
    const [settingsStaffId, setSettingsStaffId] = useState('')
    const [settingsStaffName, setSettingsStaffName] = useState('')

    // Bulk calculation state
    const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([])
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
        if (!selectedStaffId) return

        const result = await calculatePayroll(selectedStaffId, selectedMonth)
            setCalculationResult(result)
    }

    async function handleBulkCalculatePayroll() {
        if (selectedStaffIds.length === 0) return

            setBulkCalculating(true)
        await calculateBulkPayroll(selectedStaffIds, selectedMonth)
                setSelectedStaffIds([])
            setBulkCalculating(false)
    }

    function openCalculateModal() {
        setCalculateModalOpen(true)
        setCalculationResult(null)
    }

    function closeCalculateModal() {
        setCalculateModalOpen(false)
        setCalculationResult(null)
        setSelectedStaffId('')
    }

    const openSettingsModal = (staffId: string, staffName: string) => {
        setSettingsStaffId(staffId)
        setSettingsStaffName(staffName)
        setSettingsModalOpen(true)
    }

    const openDetailModal = (record: any) => {
        setSelectedRecord(record)
        setDetailModalOpen(true)
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
                selectedStaffIds={selectedStaffIds}
                setSelectedStaffIds={setSelectedStaffIds}
                bulkCalculating={bulkCalculating}
                onExport={handleExport}
                onCalculate={openCalculateModal}
                onBulkCalculate={handleBulkCalculatePayroll}
                onSettingsModalOpen={openSettingsModal}
                onDetailModalOpen={openDetailModal}
                onStatusChange={handleStatusChange}
            />

            <PayrollSettingsModal
                open={settingsModalOpen}
                onClose={() => setSettingsModalOpen(false)}
                staffId={settingsStaffId}
                staffName={settingsStaffName}
                onSaved={refreshData}
            />

            <PayrollDetailModal
                open={detailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                record={selectedRecord}
                staffName={selectedRecord?.staff?.name || undefined}
                onSaved={refreshData}
            />

            <PayrollCalculationModal
                open={calculateModalOpen}
                onClose={closeCalculateModal}
                staff={staff}
                selectedStaffId={selectedStaffId}
                selectedMonth={selectedMonth}
                calculationResult={calculationResult}
                onStaffChange={setSelectedStaffId}
                onMonthChange={setSelectedMonth}
                onCalculate={handleCalculatePayroll}
            />
        </>
    )
}
