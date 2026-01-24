'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import StaffPageView from '@/app/components/staff/StaffPageView'
import StaffDetailModal from '@/app/components/modals/StaffDetailModal'
import StatusChangeModal from '@/app/components/modals/StatusChangeModal'
import AttendanceRecordModal from '@/app/components/modals/AttendanceRecordModal'
import ScheduleModal from '@/app/components/modals/ScheduleModal'
import WeeklyScheduleModal from '@/app/components/modals/WeeklyScheduleModal'
import LeaveRequestModal from '@/app/components/modals/LeaveRequestModal'
import { useStaffData } from '@/app/lib/hooks/useStaffData'
import { useStaffHandlers } from '@/app/lib/hooks/useStaffHandlers'

const TAB_TO_IDX: Record<string, number> = {
  attendance: 0,
  schedule: 1,
  list: 2,
  payroll: 3,
}
const IDX_TO_TAB = ['attendance', 'schedule', 'list', 'payroll'] as const

export default function StaffPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab') ?? 'attendance'
  const tabFromUrl = TAB_TO_IDX[tabParam] ?? 0
  const [tabIndex, setTabIndex] = useState(tabFromUrl)

  useEffect(() => {
    setTabIndex(tabFromUrl)
  }, [tabFromUrl])

  const handleTabChange = (idx: number) => {
    setTabIndex(idx)
    const tab = IDX_TO_TAB[idx] ?? 'attendance'
    router.replace(`/staff?tab=${tab}`)
  }

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
  } = useStaffHandlers(staff, schedules, actualAttendance, loadAll)

  const handleViewSchedule = () => {
    if (!selected) return
    setDetailOpen(false)
    handleTabChange(1)
    setWeeklyScheduleOpen(true)
  }

  const handleViewAttendance = () => {
    if (!selected) return
    setDetailOpen(false)
    handleTabChange(0)
    handleOpenAttendanceRecord(selected)
  }

  const [leaveRequestOpen, setLeaveRequestOpen] = useState(false)
  const [listSelectedIds, setListSelectedIds] = useState<string[]>([])

  const handleViewLeaveRequest = () => {
    if (!selected) return
    setDetailOpen(false)
    setLeaveRequestOpen(true)
  }

  return (
    <>
      <StaffPageView
        staff={staff}
        actualAttendance={actualAttendance}
        schedules={schedules}
        workingStaff={workingStaff}
        stats={stats}
        loading={loading}
        error={error}
        tabIndex={tabIndex}
        setTabIndex={handleTabChange}
        onRetry={loadAll}
        onExport={handleExport}
        onCheckIn={handleCheckIn}
        onCheckOut={handleCheckOut}
        onOpenAttendanceRecord={handleOpenAttendanceRecord}
        onOpenSchedule={handleOpenSchedule}
        onQuickScheduleCreate={handleQuickScheduleCreate}
        onBulkScheduleApply={handleBulkScheduleApply}
        onEdit={handleEdit}
        onStatusClick={handleStatusClick}
        onCreateStaff={handleCreateStaff}
        listSelectedIds={listSelectedIds}
        onListSelectedIdsChange={setListSelectedIds}
      />

      <StaffDetailModal
        open={detailOpen}
        item={selected}
        onClose={() => setDetailOpen(false)}
        onSaved={loadAll}
        onDeleted={loadAll}
        onViewSchedule={handleViewSchedule}
        onViewAttendance={handleViewAttendance}
        onLeaveRequest={handleViewLeaveRequest}
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
        onClose={() => setAttendanceRecordOpen(false)}
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
        onClose={() => setScheduleOpen(false)}
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

      <LeaveRequestModal
        open={leaveRequestOpen}
        onClose={() => setLeaveRequestOpen(false)}
        preSelectedStaff={selected ? { id: selected.id, name: selected.name } : null}
        onSaved={loadAll}
      />
    </>
  )
}
