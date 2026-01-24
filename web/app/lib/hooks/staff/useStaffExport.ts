'use client'

import { format } from 'date-fns'
import { useAppToast } from '../../ui/toast'
import { exportToCSV } from '../../utils/export'
import { Staff, StaffAttendance } from '@/types/entities'

export function useStaffExport(
  staff: Staff[],
  schedules: StaffAttendance[],
  actualAttendance: StaffAttendance[]
) {
  const toast = useAppToast()

  const handleExport = (tabIndex: number) => {
    if (tabIndex === 2) {
      // Export Staff List
      const data = staff.map(r => ({
        '이름': r.name,
        '직급': r.role || '-',
        '전화번호': r.phone || '-',
        '이메일': r.email || '-',
        '상태': r.active !== false ? '재직' : '퇴사',
        '현재상태': r.status === 'office' ? '근무중' : r.status === 'away' ? '자리비움' : '퇴근'
      }))
      exportToCSV(data, `직원명부_${format(new Date(), 'yyyyMMdd')}.csv`)
    } else {
      // tab 0: 실근무(actualAttendance), tab 1: 스케줄(schedules)
      const staffMap = staff.reduce((acc, s) => {
        acc[s.id] = s.name
        return acc
      }, {} as Record<string, string>)

      const attendanceData = tabIndex === 0 ? actualAttendance : schedules

      const data = attendanceData.map(a => ({
        '직원명': staffMap[a.staff_id] || '-',
        '유형': a.type === 'actual' ? '실근무' : '스케줄',
        '날짜': format(new Date(a.start_time), 'yyyy-MM-dd'),
        '시작시간': format(new Date(a.start_time), 'HH:mm'),
        '종료시간': format(new Date(a.end_time), 'HH:mm'),
        '상태': a.status,
        '메모': a.memo || '-'
      }))
      exportToCSV(data, `근태기록_${format(new Date(), 'yyyyMM')}.csv`)
    }
    toast.success('CSV 파일이 다운로드되었습니다')
  }

  return { handleExport }
}
