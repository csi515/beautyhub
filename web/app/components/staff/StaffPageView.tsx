/**
 * Staff 페이지 View 컴포넌트
 * 순수 UI만 담당, 모든 로직은 props로 받음
 */

'use client'

import { Users, Download } from 'lucide-react'
import { Stack } from '@mui/material'
import { useEffect } from 'react'
import PageHeader, { createActionButton } from '../common/PageHeader'
import StaffStatsCards from './StaffStatsCards'
import StaffTabsContainer from './StaffTabsContainer'
import StaffAttendanceTab from './StaffAttendanceTab'
import StaffScheduleTab from './StaffScheduleTab'
import StaffListTab from './StaffListTab'
import StaffPayrollTab from './StaffPayrollTab'
import StandardPageLayout from '../common/StandardPageLayout'
import { useTheme, useMediaQuery } from '@mui/material'
import { usePageHeader } from '@/app/lib/contexts/PageHeaderContext'
import type { Staff, StaffAttendance } from '@/types/entities'
import type { StaffStats } from '@/types/staff'

export interface StaffPageViewProps {
    // 데이터
    staff: Staff[]
    actualAttendance: StaffAttendance[]
    schedules: StaffAttendance[]
    workingStaff: Staff[]
    stats: StaffStats
    loading: boolean
    error: string | undefined
    
    // 탭
    tabIndex: number
    setTabIndex: (index: number) => void
    
    // 액션
    onRetry: () => void
    onExport: (tabIndex: number) => void
    onCheckIn: (staffId: string) => Promise<void>
    onCheckOut: (staffId: string) => Promise<void>
    onOpenAttendanceRecord: (staff: Staff, record?: StaffAttendance) => void
    onOpenSchedule: (staff: Staff, date: Date, schedule?: StaffAttendance) => void
    onQuickScheduleCreate: (staffId: string, date: Date, startTime: string, endTime: string) => Promise<void>
    onBulkScheduleApply: (staffIds: string[], dates: Date[], startTime: string, endTime: string) => Promise<void>
    onEdit: (staff: Staff) => void
    onStatusClick: (staff: Staff) => void
    onCreateStaff: () => void
    listSelectedIds?: string[]
    onListSelectedIdsChange?: (ids: string[]) => void
}

export default function StaffPageView({
    staff,
    actualAttendance,
    schedules,
    workingStaff,
    stats,
    loading,
    error,
    tabIndex,
    setTabIndex,
    onExport,
    onCheckIn,
    onCheckOut,
    onOpenAttendanceRecord,
    onOpenSchedule,
    onQuickScheduleCreate,
    onBulkScheduleApply,
    onRetry,
    onEdit,
    onStatusClick,
    onCreateStaff,
    listSelectedIds = [],
    onListSelectedIdsChange,
}: StaffPageViewProps) {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('md'))
    const { setHeaderInfo, clearHeaderInfo } = usePageHeader()

    // 모바일에서 Context에 헤더 정보 설정
    useEffect(() => {
        if (isMobile) {
            setHeaderInfo({
                title: '직원 통합 관리',
                icon: <Users className="h-5 w-5" />,
                description: '출결 확인부터 상세 일정 구성까지 한 곳에서 관리하세요',
                actions: [
                    createActionButton(
                        '직원 추가',
                        onCreateStaff,
                        'primary',
                        <Users size={16} />
                    ),
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
    }, [isMobile, setHeaderInfo, clearHeaderInfo, onCreateStaff])

    return (
        <StandardPageLayout
            loading={loading}
            error={error || undefined}
            errorTitle="직원 데이터를 불러오는 중 오류가 발생했습니다"
            maxWidth="lg"
        >
            <Stack spacing={{ xs: 1, sm: 1.5, md: 3 }}>
                <PageHeader
                    title="직원 통합 관리"
                    icon={<Users className="h-5 w-5" />}
                    description="출결 확인부터 상세 일정 구성까지 한 곳에서 관리하세요"
                    actions={[
                        ...(isMobile || tabIndex === 3 ? [] : [createActionButton('CSV 내보내기', () => onExport(tabIndex), 'secondary', <Download size={16} />)]),
                        createActionButton(
                            '직원 추가',
                            onCreateStaff,
                            'primary',
                            <Users size={16} />
                        ),
                    ]}
                />

                {/* 통계 카드 */}
                <StaffStatsCards
                    stats={stats}
                    schedulesCount={schedules.length}
                />

                {/* 탭 컨테이너 */}
                <StaffTabsContainer
                    tabIndex={tabIndex}
                    onTabChange={setTabIndex}
                    loading={loading}
                    error={error}
                    staffCount={staff.length}
                    onRetry={onRetry}
                    onCreateStaff={onCreateStaff}
                    attendanceTab={
                        <StaffAttendanceTab
                            staff={staff}
                            actualAttendance={actualAttendance}
                            workingStaff={workingStaff}
                            onCheckIn={onCheckIn}
                            onCheckOut={onCheckOut}
                            onOpenAttendanceRecord={onOpenAttendanceRecord}
                        />
                    }
                    scheduleTab={
                        <StaffScheduleTab
                            staff={staff}
                            schedules={schedules}
                            onOpenSchedule={onOpenSchedule}
                            onBulkSchedule={onBulkScheduleApply}
                            onQuickSchedule={onQuickScheduleCreate}
                        />
                    }
                    listTab={
                        <StaffListTab
                            staff={staff}
                            onEdit={onEdit}
                            onStatusClick={onStatusClick}
                            selectedIds={listSelectedIds}
                            onSelectedIdsChange={onListSelectedIdsChange}
                        />
                    }
                    payrollTab={<StaffPayrollTab />}
                />
            </Stack>
        </StandardPageLayout>
    )
}
