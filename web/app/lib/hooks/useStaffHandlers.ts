'use client'

import { useModals } from './useModals'
import { useModalWithData } from './useModalWithData'
import { useStaffExport } from './staff/useStaffExport'
import { useStaffAttendance } from './staff/useStaffAttendance'
import { useStaffSchedule } from './staff/useStaffSchedule'
import { useStaffManagement } from './staff/useStaffManagement'
import { Staff, StaffAttendance, StaffAttendanceCreateInput } from '@/types/entities'
import { StaffScheduleRepeat } from '@/types/staff'

export function useStaffHandlers(
  staff: Staff[],
  schedules: StaffAttendance[],
  actualAttendance: StaffAttendance[],
  loadAll: () => Promise<void>
) {
  // Modal states
  const modals = useModals<'detail' | 'status' | 'attendanceRecord' | 'schedule' | 'weeklySchedule'>()
  
  // Selected items
  const selectedStaff = useModalWithData<Staff>()
  const selectedAttendance = useModalWithData<StaffAttendance>()
  const selectedDate = useModalWithData<Date>()

  // Feature hooks
  const { handleExport } = useStaffExport(staff, schedules, actualAttendance)
  const {
    handleCheckIn,
    handleCheckOut,
    handleSaveAttendanceRecord: baseHandleSaveAttendanceRecord,
    handleDeleteAttendanceRecord,
  } = useStaffAttendance(schedules, loadAll)
  const {
    handleSaveSchedule: baseHandleSaveSchedule,
    handleDeleteSchedule,
    handleQuickScheduleCreate,
    handleBulkScheduleApply,
  } = useStaffSchedule(schedules, loadAll)
  const { handleStatusSave: baseHandleStatusSave } = useStaffManagement(selectedStaff.data?.id || null, loadAll)

  // === 출퇴근 기록 핸들러 (모달 연동) ===
  const handleOpenAttendanceRecord = (staff: Staff, record?: StaffAttendance) => {
    selectedStaff.openModal(staff)
    if (record) {
      selectedAttendance.openModal(record)
    }
    modals.open('attendanceRecord')
  }

  const handleSaveAttendanceRecord = async (data: StaffAttendanceCreateInput) => {
    const recordId = selectedAttendance.data?.id
    await baseHandleSaveAttendanceRecord(data, recordId)
  }

  // === 스케줄 핸들러 (모달 연동) ===
  const handleOpenSchedule = (staff: Staff, date: Date, schedule?: StaffAttendance) => {
    selectedStaff.openModal(staff)
    selectedDate.openModal(date)
    if (schedule) {
      selectedAttendance.openModal(schedule)
    }
    modals.open('schedule')
  }

  const handleSaveSchedule = async (
    data: StaffAttendanceCreateInput,
    repeat?: StaffScheduleRepeat
  ) => {
    const selectedAttendanceId = selectedAttendance.data?.id || null
    await baseHandleSaveSchedule(data, selectedAttendanceId, repeat)
  }

  // === 직원 관리 핸들러 ===
  const handleEdit = (staff: Staff) => {
    selectedStaff.openModal(staff)
    modals.open('detail')
  }

  const handleStatusClick = (staff: Staff) => {
    selectedStaff.openModal(staff)
    modals.open('status')
  }

  const handleStatusSave = async (status: string) => {
    await baseHandleStatusSave(status)
    modals.close('status')
  }

  const handleCreateStaff = () => {
    selectedStaff.closeModal()
    modals.open('detail')
  }

  return {
    // Modal states
    detailOpen: modals.isOpen('detail'),
    statusOpen: modals.isOpen('status'),
    attendanceRecordOpen: modals.isOpen('attendanceRecord'),
    scheduleOpen: modals.isOpen('schedule'),
    weeklyScheduleOpen: modals.isOpen('weeklySchedule'),

    // Selected items
    selected: selectedStaff.data,
    selectedAttendance: selectedAttendance.data,
    selectedDate: selectedDate.data,

    // Handlers
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

    // Modal setters
    setDetailOpen: (open: boolean) => modals.setOpen('detail', open),
    setStatusOpen: (open: boolean) => modals.setOpen('status', open),
    setAttendanceRecordOpen: (open: boolean) => modals.setOpen('attendanceRecord', open),
    setScheduleOpen: (open: boolean) => modals.setOpen('schedule', open),
    setWeeklyScheduleOpen: (open: boolean) => modals.setOpen('weeklySchedule', open),
    setSelected: (staff: Staff | null) => {
      if (staff) {
        selectedStaff.openModal(staff)
      } else {
        selectedStaff.closeModal()
      }
    },
  }
}
