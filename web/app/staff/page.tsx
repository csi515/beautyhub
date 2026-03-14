'use client'

import { useState } from 'react'
import Button from '@/app/components/ui/Button'
import StaffDetailModal from '@/app/components/modals/StaffDetailModal'
import StatusChangeModal from '@/app/components/modals/StatusChangeModal'
import AttendanceRecordModal from '@/app/components/modals/AttendanceRecordModal'
import ScheduleModal from '@/app/components/modals/ScheduleModal'
import WeeklyScheduleModal from '@/app/components/modals/WeeklyScheduleModal'
import StaffStatsCards from '@/app/components/features/staff/StaffStatsCards'
import StaffTabsContainer from '@/app/components/features/staff/StaffTabsContainer'
import StaffAttendanceTab from '@/app/components/features/staff/StaffAttendanceTab'
import StaffScheduleTab from '@/app/components/features/staff/StaffScheduleTab'
import StaffListTab from '@/app/components/features/staff/StaffListTab'
import { Stack, Box } from '@mui/material'
import { Download } from 'lucide-react'
import PageContainer from '@/app/components/layout/PageContainer'
import PageIntro from '@/app/components/common/PageIntro'

// Hooks
import { useStaffData } from '@/app/lib/hooks/useStaffData'
import { useStaffHandlers } from '@/app/lib/hooks/useStaffHandlers'

/**
 * 직원 통합 관리 대시보드
 * 근태 현황판, 스케줄 표, 명부 관리를 하나의 뷰에서 제공
 */
export default function StaffPage() {
  const [tabIndex, setTabIndex] = useState(0) // 0: 근태현황, 1: 스케줄 표, 2: 명부관리

  // Data hook
  const {
    staff,
    actualAttendance,
    schedules,
    workingStaff,
    stats,
    loading,
    error,
    loadAll,
    settings
  } = useStaffData()

  // Handlers hook
  const {
    detailOpen,
    statusOpen,
    attendanceRecordOpen,
    scheduleOpen,
    weeklyScheduleOpen,
    selected,
    selectedAttendance,
    selectedDate,
    handleExport,
    handleCheckIn,
    handleCheckOut,
    handleOpenAttendanceRecord,
    handleSaveAttendanceRecord,
    handleDeleteAttendanceRecord,
    handleOpenSchedule,
    handleSaveSchedule,
    handleDeleteSchedule,
    handleQuickScheduleCreate,
    handleBulkScheduleApply,
    handleEdit,
    handleStatusClick,
    handleStatusSave,
    handleCreateStaff,
    setDetailOpen,
    setStatusOpen,
    setAttendanceRecordOpen,
    setScheduleOpen,
    setWeeklyScheduleOpen,
    setSelected,
  } = useStaffHandlers(staff, schedules, loadAll)


  return (
    <PageContainer maxWidth="xl" fullScreenOnTablet>
      <Stack spacing={4}>
      <PageIntro description="근태 현황, 스케줄, 직원 명부를 통합 관리합니다" {...(staff.length ? { count: `${staff.length}명` } : {})} />
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'flex-end' }}>
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Download size={16} />}
          onClick={() => handleExport(tabIndex)}
          sx={{ whiteSpace: 'nowrap', display: { xs: 'none', lg: 'inline-flex' } }}
        >
          엑셀 내보내기
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setSelected(null)
            setDetailOpen(true)
          }}
          sx={{ whiteSpace: 'nowrap' }}
        >
          직원 추가
        </Button>
        {tabIndex === 1 && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setSelected(null)
              setWeeklyScheduleOpen(true)
            }}
            sx={{ whiteSpace: 'nowrap' }}
          >
            주간 반복 설정
          </Button>
        )}
      </Box>

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
        onRetry={loadAll}
        onCreateStaff={handleCreateStaff}
        attendanceTab={
          <StaffAttendanceTab
            staff={staff}
            actualAttendance={actualAttendance}
            workingStaff={workingStaff}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
            onOpenAttendanceRecord={handleOpenAttendanceRecord}
          />
        }
        scheduleTab={
          <StaffScheduleTab
            staff={staff}
            schedules={schedules}
            onOpenSchedule={handleOpenSchedule}
            onBulkSchedule={handleBulkScheduleApply}
            onQuickSchedule={handleQuickScheduleCreate}
          />
        }
        listTab={
          <StaffListTab
            staff={staff}
            onEdit={handleEdit}
            onStatusClick={handleStatusClick}
          />
        }
      />

      {/* 모달 관리 */}
      <StaffDetailModal
        open={detailOpen}
        item={selected}
        onClose={() => setDetailOpen(false)}
        onSaved={loadAll}
        onDeleted={loadAll}
      />

      <StatusChangeModal
        open={statusOpen}
        staff={selected}
        onClose={() => setStatusOpen(false)}
        onSave={handleStatusSave}
      />

      <AttendanceRecordModal
        open={attendanceRecordOpen}
        record={selectedAttendance}
        staffList={staff}
        preSelectedStaff={selected}
        onClose={() => {
          setAttendanceRecordOpen(false)
        }}
        onSave={handleSaveAttendanceRecord}
        onDelete={handleDeleteAttendanceRecord}
      />

      <ScheduleModal
        open={scheduleOpen}
        schedule={selectedAttendance}
        staffList={staff}
        preSelectedStaff={selected}
        preSelectedDate={selectedDate}
        defaultWorkHours={settings?.staffSettings?.defaultWorkHours}
        onClose={() => {
          setScheduleOpen(false)
        }}
        onSave={handleSaveSchedule}
        onDelete={handleDeleteSchedule}
      />

      {selected && (
        <WeeklyScheduleModal
          open={weeklyScheduleOpen}
          staff={selected}
          onClose={() => setWeeklyScheduleOpen(false)}
          onSaved={loadAll}
        />
      )}
    </Stack>
    </PageContainer>
  )
}
