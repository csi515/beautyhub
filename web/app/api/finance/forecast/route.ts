import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getUserIdFromCookies } from '@/lib/auth/user'
import { TransactionsRepository } from '@/app/lib/repositories/transactions.repository'
import { ExpensesRepository } from '@/app/lib/repositories/expenses.repository'
import { format, subMonths } from 'date-fns'
import { forecastRevenue, analyzeSeasonality } from '@/app/lib/utils/forecast'

/**
 * GET /api/finance/forecast
 * 재무 예측 분석
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const userId = await getUserIdFromCookies()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const months = parseInt(searchParams.get('months') || '12') // 기본 12개월

    const transactionsRepo = new TransactionsRepository(userId, supabase)
    const expensesRepo = new ExpensesRepository(userId, supabase)

    const startDate = subMonths(new Date(), months)

    // 매출 데이터 조회
    const allTransactions = await transactionsRepo.findAll({ limit: 100000 })
    const allExpenses = await expensesRepo.findAll({ limit: 100000 })
    
    // 날짜 필터링
    const filteredTransactions = allTransactions.filter((t) => {
      const transactionDate = t.transaction_date || t.created_at
      return transactionDate && new Date(transactionDate) >= startDate
    })
    const filteredExpenses = allExpenses.filter((e) => {
      const expenseDate = e.expense_date || e.created_at
      return expenseDate && new Date(expenseDate) >= startDate
    })

    // 월별 매출 집계
    const monthlyRevenue: Record<string, number> = {}
    const monthlyExpenses: Record<string, number> = {}

    filteredTransactions.forEach((t) => {
      const transactionDate = t.transaction_date || t.created_at
      if (transactionDate) {
        const monthKey = format(new Date(transactionDate), 'yyyy-MM')
        monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + (t.amount || 0)
      }
    })

    filteredExpenses.forEach((e) => {
      if (e.expense_date) {
        const monthKey = format(new Date(e.expense_date), 'yyyy-MM')
        monthlyExpenses[monthKey] = (monthlyExpenses[monthKey] || 0) + (e.amount || 0)
      }
    })

    // 월별 데이터 배열로 변환
    const revenueData = Object.entries(monthlyRevenue)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const expenseData = Object.entries(monthlyExpenses)
      .map(([date, expense]) => ({ date, revenue: expense }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // 매출 예측
    const revenueForecast = forecastRevenue(revenueData)
    const expenseForecast = forecastRevenue(expenseData)

    // 계절성 분석
    const revenueSeasonality = analyzeSeasonality(revenueData)
    const expenseSeasonality = analyzeSeasonality(expenseData)

    // 목표 대비 실적 (최근 3개월 평균)
    const recentMonths = revenueData.slice(-3)
    const avgRecentRevenue = recentMonths.length > 0
      ? recentMonths.reduce((sum, d) => sum + d.revenue, 0) / recentMonths.length
      : 0

    // 다음 3개월 예측 순이익
    const predictedProfitNextQuarter = revenueForecast.predictedNextQuarter.map(
      (rev, index) => rev - expenseForecast.predictedNextQuarter[index]
    )

    return NextResponse.json({
      revenue: {
        historical: revenueData,
        forecast: revenueForecast,
        seasonality: revenueSeasonality,
      },
      expenses: {
        historical: expenseData,
        forecast: expenseForecast,
        seasonality: expenseSeasonality,
      },
      profit: {
        predictedNextMonth: revenueForecast.predictedNextMonth - expenseForecast.predictedNextMonth,
        predictedNextQuarter: predictedProfitNextQuarter,
      },
      summary: {
        avgRecentRevenue,
        trend: revenueForecast.trend,
        confidence: revenueForecast.confidence,
        period: `${months}개월`,
      },
    })
  } catch (error) {
    console.error('재무 예측 분석 실패:', error)
    return NextResponse.json(
      { error: 'Failed to forecast finances', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
