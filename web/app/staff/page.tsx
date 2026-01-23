/**
 * Staff 페이지 컨트롤러
 * 인증 확인, 파라미터 결정, 데이터 로딩 결정, View에 props 전달만 담당
 */

'use client'

import { useState } from 'react'
import StaffPageView from '@/app/components/staff/StaffPageView'
import StaffDetailModal from '@/app/components/modals/StaffDetailModal'
import StatusChangeModal from '@/app/components/modals/StatusChangeModal'
import AttendanceRecordModal from '@/app/components/modals/AttendanceRecordModal'
import ScheduleModal from '@/app/components/modals/ScheduleModal'
import WeeklyScheduleModal from '@/app/components/modals/WeeklyScheduleModal'
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
  } = useStaffHandlers(staff, schedules, loadAll)


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
        setTabIndex={setTabIndex}
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
    </>
  )
}
