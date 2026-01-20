import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getUserIdFromCookies } from '@/lib/auth/user'
import { StaffRepository } from '@/app/lib/repositories/staff.repository'
import { AppointmentsRepository } from '@/app/lib/repositories/appointments.repository'
import { TransactionsRepository } from '@/app/lib/repositories/transactions.repository'
import { AttendanceRepository } from '@/app/lib/repositories/attendance.repository'
import { startOfMonth, subMonths } from 'date-fns'

/**
 * GET /api/staff/[id]/performance
 * 직원 성과 분석
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createSupabaseServerClient()
    const userId = await getUserIdFromCookies()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const staffId = params.id
    const searchParams = request.nextUrl.searchParams
    const months = parseInt(searchParams.get('months') || '3') // 기본 3개월

    const staffRepo = new StaffRepository(userId, supabase)
    const appointmentsRepo = new AppointmentsRepository(userId, supabase)
    const transactionsRepo = new TransactionsRepository(userId, supabase)
    const attendanceRepo = new AttendanceRepository(userId, supabase)

    // 직원 정보 조회
    const staff = await staffRepo.findById(staffId)
    if (!staff) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 })
    }

    // 검증: 직원이 사용자의 소유인지 확인
    if (staff.owner_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const startDate = subMonths(new Date(), months)

    // 해당 직원의 예약, 거래, 근태 데이터 조회
    const allAppointments = await appointmentsRepo.findAll({ limit: 10000 })
    const allTransactions = await transactionsRepo.findAll({ limit: 50000 })
    
    // 날짜 필터링
    const filteredAppointments = allAppointments.filter((a) => {
      const appointmentDate = a.appointment_date || a.created_at
      return appointmentDate && new Date(appointmentDate) >= startDate
    })
    const filteredTransactions = allTransactions.filter((t) => {
      const transactionDate = t.transaction_date || t.created_at
      return transactionDate && new Date(transactionDate) >= startDate
    })

    const allAttendance = await attendanceRepo.findAll({ limit: 10000 })

    // 직원 관련 데이터 필터링
    const staffAppointments = filteredAppointments.filter((a) => a.staff_id === staffId)
    const staffTransactions = filteredTransactions.filter((t) => {
      if (!t.appointment_id) return false
      const appointment = filteredAppointments.find((a) => a.id === t.appointment_id)
      return appointment?.staff_id === staffId
    })

    const staffAttendance = allAttendance.filter((a) => a.staff_id === staffId && a.type === 'actual')

    // 예약 수
    const appointmentCount = staffAppointments.length

    // 완료된 예약 수
    const completedAppointments = staffAppointments.filter((a) => a.status === 'completed' || a.status === 'complete')
    const completedCount = completedAppointments.length

    // 총 매출
    const totalRevenue = staffTransactions.reduce((sum, t) => sum + (t.amount || 0), 0)

    // 평균 매출
    const avgRevenue = completedCount > 0 ? totalRevenue / completedCount : 0

    // 근무 시간 계산
    let totalWorkHours = 0
    staffAttendance.forEach((attendance) => {
      if (attendance.start_time && attendance.end_time) {
        const start = new Date(attendance.start_time)
        const end = new Date(attendance.end_time)
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
        if (hours > 0) {
          totalWorkHours += hours
        }
      }
    })

    // 시간당 매출
    const revenuePerHour = totalWorkHours > 0 ? totalRevenue / totalWorkHours : 0

    // 인센티브 계산 미리보기
    const incentiveRate = staff.incentive_rate || 0
    const incentivePay = totalRevenue * (incentiveRate / 100)

    // 월별 성과 추이
    const monthlyPerformance: Record<string, { appointments: number; revenue: number }> = {}
    for (let i = 0; i < months; i++) {
      const month = subMonths(new Date(), i)
      const monthKey = startOfMonth(month).toISOString().slice(0, 7) // YYYY-MM
      monthlyPerformance[monthKey] = { appointments: 0, revenue: 0 }
    }

    staffAppointments.forEach((apt) => {
      if (apt.appointment_date) {
        const monthKey = new Date(apt.appointment_date).toISOString().slice(0, 7)
        if (monthlyPerformance[monthKey]) {
          monthlyPerformance[monthKey].appointments++
        }
      }
    })

    staffTransactions.forEach((t) => {
      const transactionDate = t.transaction_date || t.created_at
      if (transactionDate) {
        const monthKey = new Date(transactionDate).toISOString().slice(0, 7)
        if (monthlyPerformance[monthKey]) {
          monthlyPerformance[monthKey].revenue += t.amount || 0
        }
      }
    })

    const monthlyTrendArray = Object.entries(monthlyPerformance)
      .map(([month, stats]) => ({ month, ...stats }))
      .sort((a, b) => a.month.localeCompare(b.month))

    // 목표 대비 실적 (목표 데이터가 없으므로 평균 대비로 계산)
    const avgAppointmentsPerMonth = appointmentCount / months
    const avgRevenuePerMonth = totalRevenue / months

    return NextResponse.json({
      staff: {
        id: staff.id,
        name: staff.name,
        role: staff.role,
        incentive_rate: incentiveRate,
      },
      performance: {
        appointmentCount,
        completedCount,
        totalRevenue,
        avgRevenue,
        totalWorkHours: Math.round(totalWorkHours * 10) / 10,
        revenuePerHour: Math.round(revenuePerHour),
        incentivePay: Math.round(incentivePay),
        avgAppointmentsPerMonth: Math.round(avgAppointmentsPerMonth * 10) / 10,
        avgRevenuePerMonth: Math.round(avgRevenuePerMonth),
      },
      monthlyTrends: monthlyTrendArray,
      period: `${months}개월`,
    })
  } catch (error) {
    console.error('직원 성과 분석 실패:', error)
    return NextResponse.json(
      { error: 'Failed to analyze staff performance', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
