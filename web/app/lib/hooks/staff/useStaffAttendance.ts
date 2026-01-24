'use client'

import { useAppToast } from '../../ui/toast'
import { attendanceApi } from '../../api/attendance'
import { StaffAttendance, StaffAttendanceCreateInput } from '@/types/entities'

export function useStaffAttendance(
  schedules: StaffAttendance[],
  loadAll: () => Promise<void>
) {
  const toast = useAppToast()

  const handleCheckIn = async (staffId: string): Promise<void> => {
    try {
      const now = new Date()
      const endTime = new Date(now.getTime() + 9 * 60 * 60 * 1000) // 9시간 후

      await attendanceApi.create({
        staff_id: staffId,
        type: 'actual',
        start_time: now.toISOString(),
        end_time: endTime.toISOString(),
        status: 'normal',
        memo: '출근 기록'
      })

      toast.success('출근 기록이 저장되었습니다')
      await loadAll()
    } catch (error) {
      console.error('출근 실패:', error)
      toast.error('출근 기록에 실패했습니다')
    }
  }

  const handleCheckOut = async (staffId: string): Promise<void> => {
    try {
      // 오늘의 출근 기록 찾기
      const today = new Date()
      const todayRecord = schedules.find(a => {
        const recordDate = new Date(a.start_time)
        return a.staff_id === staffId &&
          recordDate.toDateString() === today.toDateString()
      })

      if (!todayRecord) {
        toast.error('출근 기록을 찾을 수 없습니다')
        return
      }

      // 퇴근 시간 업데이트
      await attendanceApi.update(todayRecord.id, {
        end_time: new Date().toISOString()
      })

      toast.success('퇴근 기록이 저장되었습니다')
      await loadAll()
    } catch (error) {
      console.error('퇴근 실패:', error)
      toast.error('퇴근 기록에 실패했습니다')
    }
  }

  const handleSaveAttendanceRecord = async (data: StaffAttendanceCreateInput, recordId?: string) => {
    try {
      if (recordId) {
        await attendanceApi.update(recordId, data)
        toast.success('근태 기록이 수정되었습니다')
      } else {
        await attendanceApi.create(data)
        toast.success('근태 기록이 추가되었습니다')
      }
      await loadAll()
    } catch (error) {
      console.error('저장 실패:', error)
      throw error
    }
  }

  const handleDeleteAttendanceRecord = async (id: string) => {
    try {
      await attendanceApi.delete(id)
      toast.success('근태 기록이 삭제되었습니다')
      await loadAll()
    } catch (error) {
      console.error('삭제 실패:', error)
      throw error
    }
  }

  return {
    handleCheckIn,
    handleCheckOut,
    handleSaveAttendanceRecord,
    handleDeleteAttendanceRecord,
  }
}
