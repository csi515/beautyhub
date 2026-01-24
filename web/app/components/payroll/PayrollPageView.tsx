/**
 * Payroll 페이지 View 컴포넌트
 * 순수 UI만 담당, 모든 로직은 props로 받음
 */

'use client'

import { Box, Typography, Paper, Stack, TextField, Button } from '@mui/material'
import { useEffect } from 'react'
import { useTheme, useMediaQuery } from '@mui/material'
import StandardPageLayout from '../common/StandardPageLayout'
import { DollarSign, Download, Calculator, Search } from 'lucide-react'
import PageHeader, { createActionButton } from '../common/PageHeader'
import InputAdornment from '@mui/material/InputAdornment'
import { Chip } from '@mui/material'
import { usePageHeader } from '@/app/lib/contexts/PageHeaderContext'
import PayrollSummaryCards from './PayrollSummaryCards'
import PayrollStatusSummary from './PayrollStatusSummary'
import PayrollTable from './PayrollTable'
import LoadingState from '../common/LoadingState'
import ErrorState from '../common/ErrorState'
import type { Staff, PayrollRecord } from '@/types/payroll'

export interface PayrollPageViewProps {
    /** 탭 등에 임베드 시 레이아웃·헤더 생략 */
    embedded?: boolean
    /** 로드 실패 시 메시지 (embedded 시 ErrorState 표시용) */
    error?: string | null
    /** 재시도 핸들러 (embedded + error 시 사용) */
    onRetry?: () => void
    // 데이터
    staff: Staff[]
    records: PayrollRecord[]
    loading: boolean
    selectedMonth: string
    setSelectedMonth: (month: string) => void
    
    // 필터/검색
    query: string
    setQuery: (query: string) => void
    statusFilter: string
    setStatusFilter: (filter: string) => void
    
    // 페이지네이션
    page: number
    setPage: (page: number) => void
    totalPages: number
    paginatedStaff: Staff[]
    filteredStaff: Staff[]
    
    // 통계
    totalGrossPay: number
    totalNetPay: number
    
    // 선택
    selectedStaffIds: string[]
    setSelectedStaffIds: (ids: string[]) => void
    bulkCalculating: boolean
    
    // 액션
    onExport: () => void
    onCalculate: () => void
    onBulkCalculate: () => void
    onSettingsModalOpen: (staffId: string, staffName: string) => void
    onDetailModalOpen: (record: any) => void
    onStatusChange: (record: any, newStatus: 'approved' | 'paid') => Promise<void>
}

export default function PayrollPageView({
    embedded = false,
    error: errorProp,
    onRetry,
    staff,
    records,
    loading,
    selectedMonth,
    setSelectedMonth,
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    totalPages,
    paginatedStaff,
    filteredStaff,
    totalGrossPay,
    totalNetPay,
    selectedStaffIds,
    setSelectedStaffIds,
    bulkCalculating,
    onExport,
    onCalculate,
    onBulkCalculate,
    onSettingsModalOpen,
    onDetailModalOpen,
    onStatusChange,
}: PayrollPageViewProps) {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    const { setHeaderInfo, clearHeaderInfo } = usePageHeader()

    // 모바일에서 Context에 헤더 정보 설정 (embedded 시 스킵)
    useEffect(() => {
        if (embedded) return
        if (isMobile) {
            setHeaderInfo({
                title: '급여 관리',
                icon: <DollarSign />,
                description: '직원 급여 자동 계산 및 관리',
                actions: [
                    createActionButton('일괄 계산', onBulkCalculate, 'primary', <Calculator size={16} />, bulkCalculating || selectedStaffIds.length === 0),
                    createActionButton('급여 계산', onCalculate, 'primary'),
                ],
            })
        } else {
            clearHeaderInfo()
        }

        return () => {
            if (isMobile) {
                clearHeaderInfo()
            }
        }
    }, [embedded, isMobile, setHeaderInfo, clearHeaderInfo, onExport, onBulkCalculate, onCalculate, bulkCalculating, selectedStaffIds.length])

    const inner = (
        <>
            {/* 데스크탑 헤더 (embedded 시 스킵) */}
            {!embedded && !isMobile && (
                <PageHeader
                    title="급여 관리"
                    description="직원 급여 자동 계산 및 관리"
                    icon={<DollarSign />}
                    actions={[
                        createActionButton('CSV 내보내기', onExport, 'secondary', <Download size={16} />),
                        createActionButton('일괄 계산', onBulkCalculate, 'primary', <Calculator size={16} />, bulkCalculating || selectedStaffIds.length === 0),
                        createActionButton('급여 계산', onCalculate, 'primary'),
                    ]}
                />
            )}

            {/* embedded 시 액션 버튼 (내보내기·계산, 모바일에서는 CSV 비노출) */}
            {embedded && (
                <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap">
                    {!isMobile && (
                        <Button variant="outlined" size="small" startIcon={<Download size={16} />} onClick={onExport}>
                            CSV 내보내기
                        </Button>
                    )}
                    <Button variant="outlined" size="small" startIcon={<Calculator size={16} />} onClick={onBulkCalculate} disabled={bulkCalculating || selectedStaffIds.length === 0}>
                        일괄 계산
                    </Button>
                    <Button variant="contained" size="small" onClick={onCalculate}>
                        급여 계산
                    </Button>
                </Stack>
            )}

            {/* 필터 및 검색 */}
            <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }} variant="outlined">
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 1.5, md: 2 }} alignItems="center">
                    <TextField
                        type="month"
                        label="조회 월"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        size="small"
                        sx={{ width: { xs: '100%', sm: 200 } }}
                    />
                    <TextField
                        placeholder="직원명 검색"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        size="small"
                        sx={{ flexGrow: 1, width: { xs: '100%', sm: 'auto' } }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search size={16} className="text-gray-400" />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Stack>

                {/* 상태 필터 */}
                <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        상태 필터
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                        {[
                            { value: 'all', label: '전체', color: 'default' },
                            { value: 'not_calculated', label: '미계산', color: 'default' },
                            { value: 'calculated', label: '계산완료', color: 'warning' },
                            { value: 'approved', label: '승인완료', color: 'info' },
                            { value: 'paid', label: '지급완료', color: 'success' },
                        ].map((filter) => (
                            <Chip
                                key={filter.value}
                                label={filter.label}
                                color={statusFilter === filter.value ? filter.color as any : 'default'}
                                variant={statusFilter === filter.value ? 'filled' : 'outlined'}
                                size="small"
                                onClick={() => setStatusFilter(filter.value)}
                                sx={{ cursor: 'pointer' }}
                            />
                        ))}
                    </Stack>
                </Box>
            </Paper>

            {/* 요약 카드 */}
            <PayrollSummaryCards
                totalStaffCount={staff.length}
                filteredStaffCount={filteredStaff.length}
                totalGrossPay={totalGrossPay}
                totalNetPay={totalNetPay}
                calculatedRecordsCount={records.length}
                filteredStaffLength={filteredStaff.length}
            />

            {/* 급여 상태 요약 */}
            <PayrollStatusSummary
                records={records}
                filteredStaffLength={filteredStaff.length}
            />

            <PayrollTable
                selectedMonth={selectedMonth}
                records={records}
                selectedStaffIds={selectedStaffIds}
                onSelectedStaffIdsChange={setSelectedStaffIds}
                paginatedStaff={paginatedStaff}
                totalPages={totalPages}
                currentPage={page}
                onPageChange={setPage}
                onSettingsModalOpen={onSettingsModalOpen}
                onDetailModalOpen={onDetailModalOpen}
                onStatusChange={onStatusChange}
            />
        </>
    )

    if (embedded) {
        if (errorProp) return <ErrorState message={errorProp} onRetry={onRetry} />
        if (loading) return <LoadingState rows={5} variant="card" />
        return <>{inner}</>
    }
    return (
        <StandardPageLayout loading={loading} maxWidth={{ xs: '100%', md: '1200px' }}>
            {inner}
        </StandardPageLayout>
    )
}
