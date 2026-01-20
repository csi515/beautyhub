import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getUserIdFromCookies } from '@/lib/auth/user'
import { CustomersRepository } from '@/app/lib/repositories/customers.repository'
import { TransactionsRepository } from '@/app/lib/repositories/transactions.repository'
import { AppointmentsRepository } from '@/app/lib/repositories/appointments.repository'
import { subDays } from 'date-fns'

/**
 * GET /api/analytics/customer-segmentation
 * RFM (Recency, Frequency, Monetary) 분석
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const userId = await getUserIdFromCookies()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const periodDays = parseInt(searchParams.get('period_days') || '90') // 기본 90일

    const customersRepo = new CustomersRepository(userId, supabase)
    const transactionsRepo = new TransactionsRepository(userId, supabase)
    const appointmentsRepo = new AppointmentsRepository(userId, supabase)

    const cutoffDate = subDays(new Date(), periodDays)

    // 모든 데이터 조회
    const customers = await customersRepo.findAll({ limit: 10000 })
    const allTransactions = await transactionsRepo.findAll({ limit: 50000 })
    const allAppointments = await appointmentsRepo.findAll({ limit: 50000 })

    // 고객별 RFM 분석
    const rfmAnalysis = customers.map((customer) => {
      // 해당 기간 내 거래만 필터링
      const customerTransactions = allTransactions.filter((t) => {
        if (t.customer_id !== customer.id) return false
        const transactionDate = t.transaction_date || t.created_at
        if (!transactionDate) return false
        return new Date(transactionDate) >= cutoffDate
      })

      // 해당 기간 내 예약 필터링
      const customerAppointments = allAppointments.filter((a) => {
        if (a.customer_id !== customer.id) return false
        if (!a.appointment_date) return false
        return new Date(a.appointment_date) >= cutoffDate
      })

      // Monetary: 총 구매액
      const monetary = customerTransactions.reduce((sum, t) => sum + (t.amount || 0), 0)

      // Frequency: 거래/방문 횟수
      const frequency = Math.max(customerTransactions.length, customerAppointments.length)

      // Recency: 최근 거래/방문일로부터 경과 일수
      const allDates = [
        ...customerTransactions.map((t) => t.transaction_date || t.created_at),
        ...customerAppointments.map((a) => a.appointment_date),
      ].filter(Boolean) as string[]

      let recency = periodDays // 기본값 (거래/방문 이력이 없으면 최대값)
      if (allDates.length > 0) {
        const latestDate = new Date(Math.max(...allDates.map((d) => new Date(d).getTime())))
        const daysSince = Math.floor((Date.now() - latestDate.getTime()) / (1000 * 60 * 60 * 24))
        recency = daysSince
      }

      return {
        customer_id: customer.id,
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_email: customer.email,
        recency,
        frequency,
        monetary,
        transaction_count: customerTransactions.length,
        visit_count: customerAppointments.length,
        last_transaction_date: allDates.length > 0 ? Math.max(...allDates.map((d) => new Date(d).getTime())) : null,
      }
    })

    // RFM 점수 계산 (1-5 점)
    // Recency: 최근일수록 높은 점수 (최근 30일: 5점, 60일: 4점, 90일: 3점, 180일: 2점, 그 이상: 1점)
    // Frequency: 많을수록 높은 점수
    // Monetary: 많을수록 높은 점수

    const frequencyScores = rfmAnalysis.map((r) => r.frequency).sort((a, b) => b - a)
    const monetaryScores = rfmAnalysis.map((r) => r.monetary).sort((a, b) => b - a)

    const getQuintile = (value: number, scores: number[]): number => {
      if (scores.length === 0) return 1
      const quintileSize = Math.ceil(scores.length / 5)
      const index = scores.findIndex((s) => (value <= scores[0] ? value >= s : value <= s))
      return Math.min(5, Math.max(1, Math.floor(index / quintileSize) + 1))
    }

    const segmentedCustomers = rfmAnalysis.map((customer) => {
      const rScore = customer.recency <= 30 ? 5 : customer.recency <= 60 ? 4 : customer.recency <= 90 ? 3 : customer.recency <= 180 ? 2 : 1
      const fScore = getQuintile(customer.frequency, frequencyScores)
      const mScore = getQuintile(customer.monetary, monetaryScores)

      // 세그먼트 분류
      let segment = '일반'
      if (rScore >= 4 && fScore >= 4 && mScore >= 4) {
        segment = 'VIP'
      } else if (rScore >= 3 && fScore >= 3 && mScore >= 3) {
        segment = '우수'
      } else if (rScore <= 2 && fScore <= 2 && mScore <= 2) {
        segment = '휴면'
      } else if (mScore >= 4 && (rScore >= 4 || fScore >= 4)) {
        segment = '잠재VIP'
      } else if (rScore <= 2) {
        segment = '이탈위험'
      }

      return {
        ...customer,
        r_score: rScore,
        f_score: fScore,
        m_score: mScore,
        segment,
      }
    })

    // 세그먼트별 통계
    const segmentStats: Record<string, { count: number; total_revenue: number; avg_revenue: number }> = {}
    segmentedCustomers.forEach((c) => {
      if (!segmentStats[c.segment]) {
        segmentStats[c.segment] = {
          count: 0,
          total_revenue: 0,
          avg_revenue: 0,
        }
      }
      segmentStats[c.segment].count++
      segmentStats[c.segment].total_revenue += c.monetary
    })

    Object.keys(segmentStats).forEach((segment) => {
      const stats = segmentStats[segment]
      stats.avg_revenue = stats.count > 0 ? stats.total_revenue / stats.count : 0
    })

    return NextResponse.json({
      customers: segmentedCustomers,
      segmentStats,
      period: `${periodDays}일`,
      totalCustomers: segmentedCustomers.length,
    })
  } catch (error) {
    console.error('RFM 분석 실패:', error)
    return NextResponse.json(
      { error: 'Failed to perform RFM analysis', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
