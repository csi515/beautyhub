'use client'

import { format, addWeeks, getDay, addDays } from 'date-fns'
import { useAppToast } from '../../ui/toast'
import { attendanceApi } from '../../api/attendance'
import { StaffAttendance, StaffAttendanceCreateInput } from '@/types/entities'
import { StaffScheduleRepeat } from '@/types/staff'

export function useStaffSchedule(
  schedules: StaffAttendance[],
  loadAll: () => Promise<void>
) {
  const toast = useAppToast()

  const handleSaveSchedule = async (
    data: StaffAttendanceCreateInput,
    selectedAttendanceId: string | null,
    repeat?: StaffScheduleRepeat
  ) => {
    try {
      if (selectedAttendanceId) {
        // 수정 모드
        await attendanceApi.update(selectedAttendanceId, data)
        toast.success('스케줄이 수정되었습니다')
      } else {
        // 추가 모드
        if (repeat && repeat.days.length > 0) {
          // 반복 스케줄 생성 (향후 4주)
          const baseDate = new Date(data.start_time)
          const startTime = format(new Date(data.start_time), 'HH:mm')
          const endTime = format(new Date(data.end_time), 'HH:mm')

          const promises = []
          for (let week = 0; week < 4; week++) {
            for (const day of repeat.days) {
              const targetDate = addWeeks(baseDate, week)
              const targetDay = getDay(targetDate)
              const daysToAdd = (day - targetDay + 7) % 7
              const scheduleDate = addDays(targetDate, daysToAdd)

              const scheduleData: StaffAttendanceCreateInput = {
                ...data,
                start_time: `${format(scheduleDate, 'yyyy-MM-dd')}T${startTime}`,
                end_time: `${format(scheduleDate, 'yyyy-MM-dd')}T${endTime}`
              }

              promises.push(attendanceApi.create(scheduleData))
            }
          }

          await Promise.all(promises)
          toast.success(`${promises.length}개의 스케줄이 생성되었습니다`)
        } else {
          await attendanceApi.create(data)
          toast.success('스케줄이 추가되었습니다')
        }
      }
      await loadAll()
    } catch (error) {
      console.error('저장 실패:', error)
      throw error
    }
  }

  const handleDeleteSchedule = async (id: string) => {
    try {
      await attendanceApi.delete(id)
      toast.success('스케줄이 삭제되었습니다')
      await loadAll()
    } catch (error) {
      console.error('삭제 실패:', error)
      throw error
    }
  }

  const handleQuickScheduleCreate = async (staffId: string, date: Date, startTime: string, endTime: string) => {
    try {
      // 해당 날짜에 이미 스케줄이 있는지 확인
      const existingSchedule = schedules.find(s =>
        s.staff_id === staffId &&
        s.type === 'scheduled' &&
        format(new Date(s.start_time), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      )

      if (existingSchedule) {
        toast.warning('해당 날짜에 이미 스케줄이 있습니다')
        return
      }

      await attendanceApi.create({
        staff_id: staffId,
        type: 'scheduled',
        start_time: `${format(date, 'yyyy-MM-dd')}T${startTime}`,
        end_time: `${format(date, 'yyyy-MM-dd')}T${endTime}`,
        status: 'scheduled',
        memo: '빠른 스케줄 생성'
      })

      toast.success('스케줄이 생성되었습니다')
      await loadAll()
    } catch (error) {
      console.error('빠른 스케줄 생성 실패:', error)
      toast.error('스케줄 생성에 실패했습니다')
      throw error
    }
  }

  const handleBulkScheduleApply = async (staffIds: string[], dates: Date[], startTime: string, endTime: string) => {
    try {
      const promises = []

      for (const staffId of staffIds) {
        for (const date of dates) {
          // 해당 날짜에 이미 스케줄이 있는지 확인
          const existingSchedule = schedules.find(s =>
            s.staff_id === staffId &&
            s.type === 'scheduled' &&
            format(new Date(s.start_time), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
          )

          if (!existingSchedule) {
            promises.push(attendanceApi.create({
              staff_id: staffId,
              type: 'scheduled',
              start_time: `${format(date, 'yyyy-MM-dd')}T${startTime}`,
              end_time: `${format(date, 'yyyy-MM-dd')}T${endTime}`,
              status: 'scheduled',
              memo: '일괄 스케줄 적용'
            }))
          }
        }
      }

      await Promise.all(promises)
      toast.success(`${promises.length}개의 스케줄이 생성되었습니다`)
      await loadAll()
    } catch (error) {
      console.error('일괄 스케줄 적용 실패:', error)
      toast.error('일괄 스케줄 적용에 실패했습니다')
      throw error
    }
  }

  return {
    handleSaveSchedule,
    handleDeleteSchedule,
    handleQuickScheduleCreate,
    handleBulkScheduleApply,
  }
}
