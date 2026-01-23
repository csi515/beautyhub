import { useState, useEffect, useCallback, useMemo } from 'react'
import { startOfMonth, endOfMonth } from 'date-fns'
import { staffApi } from '../api/staff'
import { attendanceApi } from '../api/attendance'
import { settingsApi } from '../api/settings'
import { Staff, StaffAttendance } from '@/types/entities'
import { AppSettings } from '@/types/settings'
import { StaffStats } from '@/types/staff'

export function useStaffData() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [attendance, setAttendance] = useState<StaffAttendance[]>([])
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadAll = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const now = new Date()
      const start = startOfMonth(now).toISOString()
      const end = endOfMonth(now).toISOString()

      // 병렬 데이터 로딩
      const [staffData, attendanceData, settingsData] = await Promise.all([
        staffApi.list(),
        attendanceApi.list({ start, end }),
        settingsApi.get().catch(() => null) // 설정 로드 실패 시 null
      ])

      setStaff(staffData || [])
      setAttendance(attendanceData || [])
      setSettings(settingsData)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '데이터 로드 실패')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  // Service 레이어를 사용한 통계 계산 및 필터링
  const { StaffService } = require('../services/staff.service')
  
  const stats: StaffStats = useMemo(() => 
    StaffService.calculateStats(staff),
    [staff]
  )

  // 실제 근무 기록만 필터링 (타임라인용)
  const actualAttendance = useMemo(() =>
    StaffService.filterActualAttendance(attendance),
    [attendance]
  )

  // 스케줄만 필터링 (스케줄 표용)
  const schedules = useMemo(() =>
    StaffService.filterSchedules(attendance),
    [attendance]
  )

  // 근무중인 직원들
  const workingStaff = useMemo(() =>
    StaffService.filterWorkingStaff(staff),
    [staff]
  )

  return {
    // Data
    staff,
    attendance,
    settings,
    actualAttendance,
    schedules,
    workingStaff,
    stats,

    // State
    loading,
    error,

    // Actions
    loadAll,
  }
}
