import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getUserIdFromCookies } from '@/lib/auth/user'
import { AppointmentsRepository } from '@/app/lib/repositories/appointments.repository'
import { ProductsRepository } from '@/app/lib/repositories/products.repository'
import { StaffRepository } from '@/app/lib/repositories/staff.repository'
import { format, getDay, getHours, subMonths } from 'date-fns'

/**
 * GET /api/analytics/appointments
 * 예약 패턴 분석 API
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const userId = await getUserIdFromCookies()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const months = parseInt(searchParams.get('months') || '3') // 기본 3개월

    const appointmentsRepo = new AppointmentsRepository(userId, supabase)
    const productsRepo = new ProductsRepository(userId, supabase)
    const staffRepo = new StaffRepository(userId, supabase)

    // 최근 N개월 예약 데이터 조회
    const startDate = subMonths(new Date(), months)
    const allAppointments = await appointmentsRepo.findAll({ limit: 10000 })
    
    // 날짜 필터링
    const filteredAppointments = allAppointments.filter((a) => {
      const appointmentDate = a.appointment_date || a.created_at
      return appointmentDate && new Date(appointmentDate) >= startDate
    })

    const allProducts = await productsRepo.findAll({ limit: 1000 })
    const allStaff = await staffRepo.findAll({ limit: 100 })

    const productsById = new Map(allProducts.map((p) => [p.id, p]))
    const staffById = new Map(allStaff.map((s) => [s.id, s]))

    // 시간대별 인기 분석 (24시간)
    const hourlyCounts: Record<number, number> = {}
    for (let h = 0; h < 24; h++) {
      hourlyCounts[h] = 0
    }

    // 요일별 인기 분석 (0: 일요일, 6: 토요일)
    const dayOfWeekCounts: Record<number, number> = {}
    for (let d = 0; d < 7; d++) {
      dayOfWeekCounts[d] = 0
    }

    // 시술별 소요 시간 통계 (실제 데이터가 없으므로 예약 수로 대체)
    const serviceCounts: Record<string, { count: number; name: string }> = {}

    // 직원별 효율성 분석
    const staffEfficiency: Record<string, { count: number; name: string }> = {}

    // 월별 트렌드 분석
    const monthlyTrends: Record<string, number> = {}

    for (const appointment of filteredAppointments) {
      if (!appointment.appointment_date) continue

      const date = new Date(appointment.appointment_date)
      const hour = getHours(date)
      const monthKey = format(date, 'yyyy-MM')

      // 시간대별 카운트
      hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1

      // 요일별 카운트
      dayOfWeekCounts[getDay(date)] = (dayOfWeekCounts[getDay(date)] || 0) + 1

      // 월별 카운트
      monthlyTrends[monthKey] = (monthlyTrends[monthKey] || 0) + 1

      // 시술별 카운트
      if (appointment.service_id) {
        const product = productsById.get(appointment.service_id)
        if (product) {
          if (!serviceCounts[appointment.service_id]) {
            serviceCounts[appointment.service_id] = {
              count: 0,
              name: product.name,
            }
          }
          serviceCounts[appointment.service_id].count++
        }
      }

      // 직원별 카운트
      if (appointment.staff_id) {
        const staff = staffById.get(appointment.staff_id)
        if (staff) {
          if (!staffEfficiency[appointment.staff_id]) {
            staffEfficiency[appointment.staff_id] = {
              count: 0,
              name: staff.name,
            }
          }
          staffEfficiency[appointment.staff_id].count++
        }
      }
    }

    // 가장 인기 있는 시간대
    const topHours = Object.entries(hourlyCounts)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // 가장 인기 있는 요일
    const topDays = Object.entries(dayOfWeekCounts)
      .map(([day, count]) => ({ day: parseInt(day), count }))
      .sort((a, b) => b.count - a.count)

    // 가장 인기 있는 시술 (Top 10)
    const topServices = Object.values(serviceCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // 가장 효율적인 직원 (Top 10)
    const topStaff = Object.values(staffEfficiency)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // 월별 트렌드 데이터 (정렬)
    const monthlyTrendArray = Object.entries(monthlyTrends)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month))

    // 요일별 인기 데이터 (일요일부터)
    const dayOfWeekData = [
      { day: 0, label: '일요일', count: dayOfWeekCounts[0] || 0 },
      { day: 1, label: '월요일', count: dayOfWeekCounts[1] || 0 },
      { day: 2, label: '화요일', count: dayOfWeekCounts[2] || 0 },
      { day: 3, label: '수요일', count: dayOfWeekCounts[3] || 0 },
      { day: 4, label: '목요일', count: dayOfWeekCounts[4] || 0 },
      { day: 5, label: '금요일', count: dayOfWeekCounts[5] || 0 },
      { day: 6, label: '토요일', count: dayOfWeekCounts[6] || 0 },
    ]

    // 시간대별 인기 데이터
    const hourlyData = Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      label: `${h}시`,
      count: hourlyCounts[h] || 0,
    }))

    return NextResponse.json({
      summary: {
        totalAppointments: filteredAppointments.length,
        period: `${months}개월`,
      },
      hourlyAnalysis: {
        topHours,
        hourlyData,
      },
      dayOfWeekAnalysis: {
        topDays,
        dayOfWeekData,
      },
      serviceAnalysis: {
        topServices,
        totalServices: Object.keys(serviceCounts).length,
      },
      staffAnalysis: {
        topStaff,
        totalStaff: Object.keys(staffEfficiency).length,
      },
      monthlyTrends: monthlyTrendArray,
    })
  } catch (error) {
    console.error('예약 패턴 분석 실패:', error)
    return NextResponse.json(
      { error: 'Failed to analyze appointment patterns', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
