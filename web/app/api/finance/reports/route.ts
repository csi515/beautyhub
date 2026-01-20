import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getUserIdFromCookies } from '@/lib/auth/user'
import { TransactionsRepository } from '@/app/lib/repositories/transactions.repository'
import { ExpensesRepository } from '@/app/lib/repositories/expenses.repository'
import { startOfMonth, endOfMonth, startOfQuarter, endOfQuarter } from 'date-fns'

/**
 * GET /api/finance/reports
 * 재무 리포트 생성
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const userId = await getUserIdFromCookies()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') || 'monthly' // monthly, quarterly
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()))
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1))
    const quarter = parseInt(searchParams.get('quarter') || String(Math.ceil((new Date().getMonth() + 1) / 3)))

    const transactionsRepo = new TransactionsRepository(userId, supabase)
    const expensesRepo = new ExpensesRepository(userId, supabase)

    let startDate: Date
    let endDate: Date
    let periodLabel: string

    if (type === 'quarterly') {
      // 분기 시작/종료 날짜 계산
      const quarterStartMonth = (quarter - 1) * 3
      startDate = startOfQuarter(new Date(year, quarterStartMonth, 1))
      endDate = endOfQuarter(new Date(year, quarterStartMonth, 1))
      periodLabel = `${year}년 ${quarter}분기`
    } else {
      // 월별
      startDate = startOfMonth(new Date(year, month - 1, 1))
      endDate = endOfMonth(new Date(year, month - 1, 1))
      periodLabel = `${year}년 ${month}월`
    }

    // 매출 데이터 조회
    const allTransactions = await transactionsRepo.findAll({ limit: 100000 })
    const allExpenses = await expensesRepo.findAll({ limit: 100000 })
    
    // 날짜 필터링
    const transactions = allTransactions.filter((t) => {
      const transactionDate = t.transaction_date || t.created_at
      if (!transactionDate) return false
      const date = new Date(transactionDate)
      return date >= startDate && date <= endDate
    })
    
    const expenses = allExpenses.filter((e) => {
      const expenseDate = e.expense_date || e.created_at
      if (!expenseDate) return false
      const date = new Date(expenseDate)
      return date >= startDate && date <= endDate
    })

    // 총 매출
    const totalRevenue = transactions.reduce((sum, t) => sum + (t.amount || 0), 0)

    // 총 지출
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)

    // 순이익
    const profit = totalRevenue - totalExpenses

    // 부가세 계산 (매출의 10% - 단순 계산, 실제로는 공제 입력액 등 고려 필요)
    const vat = Math.round(totalRevenue * 0.1)

    // 카테고리별 지출 내역
    const expensesByCategory: Record<string, number> = {}
    expenses.forEach((e) => {
      const category = e.category || '기타'
      expensesByCategory[category] = (expensesByCategory[category] || 0) + (e.amount || 0)
    })

    const expenseDetails = Object.entries(expensesByCategory).map(([category, amount]) => ({
      category,
      amount,
    }))

    // 거래 타입별 매출 내역
    const revenueByType: Record<string, number> = {}
    transactions.forEach((t) => {
      const type = t.type || '매출'
      revenueByType[type] = (revenueByType[type] || 0) + (t.amount || 0)
    })

    const revenueDetails = Object.entries(revenueByType).map(([type, amount]) => ({
      category: type,
      amount,
    }))

    return NextResponse.json({
      period: periodLabel,
      type,
      year,
      month: type === 'monthly' ? month : null,
      quarter: type === 'quarterly' ? quarter : null,
      summary: {
        revenue: totalRevenue,
        expenses: totalExpenses,
        profit,
        vat,
      },
      revenueDetails,
      expenseDetails,
      transactionCount: transactions.length,
      expenseCount: expenses.length,
    })
  } catch (error) {
    console.error('재무 리포트 생성 실패:', error)
    return NextResponse.json(
      { error: 'Failed to generate financial report', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
