import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getUserIdFromCookies } from '@/lib/auth/user'
import { BudgetsRepository } from '@/app/lib/repositories/budgets.repository'
import { ExpensesRepository } from '@/app/lib/repositories/expenses.repository'
import { z } from 'zod'
import { format, startOfMonth, endOfMonth } from 'date-fns'

const budgetSchema = z.object({
  category: z.string().min(1),
  month: z.string().regex(/^\d{4}-\d{2}$/),
  budget_amount: z.number().min(0),
})

/**
 * GET /api/finance/budget
 * 예산 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const userId = await getUserIdFromCookies()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const month = searchParams.get('month') || format(new Date(), 'yyyy-MM')

    const budgetsRepo = new BudgetsRepository(userId, supabase)
    const expensesRepo = new ExpensesRepository(userId, supabase)

    // 예산 조회
    const budgets = await budgetsRepo.findByMonth(month)

    // 해당 월의 지출 데이터 조회 및 집계
    const monthStart = startOfMonth(new Date(month + '-01'))
    const monthEnd = endOfMonth(new Date(month + '-01'))

    const expenses = await expensesRepo.findAll({
      from: monthStart.toISOString(),
      to: monthEnd.toISOString(),
      limit: 100000,
    })

    // 카테고리별 지출 금액 계산
    const expensesByCategory: Record<string, number> = {}
    expenses.forEach((e) => {
      const category = e.category || '기타'
      expensesByCategory[category] = (expensesByCategory[category] || 0) + (e.amount || 0)
    })

    // 예산에 지출 금액 업데이트 및 경고 상태 계산
    const budgetsWithSpending = await Promise.all(
      budgets.map(async (budget) => {
        const spent = expensesByCategory[budget.category] || 0
        const percentage = budget.budget_amount > 0 ? (spent / budget.budget_amount) * 100 : 0
        const isOverBudget = spent > budget.budget_amount
        const isWarning = percentage >= 80 && percentage < 100

        // spent_amount 업데이트 (다를 경우만)
        if (budget.spent_amount !== spent) {
          await budgetsRepo.updateBudget(budget.id, { spent_amount: spent })
        }

        return {
          ...budget,
          spent_amount: spent,
          percentage: Math.round(percentage * 10) / 10,
          isOverBudget,
          isWarning,
          remaining: budget.budget_amount - spent,
        }
      })
    )

    // 예산이 설정되지 않은 카테고리에 대한 지출도 포함
    const categoriesWithExpenses = new Set([
      ...budgets.map((b) => b.category),
      ...Object.keys(expensesByCategory),
    ])

    const allBudgets = categoriesWithExpenses.size > 0
      ? Array.from(categoriesWithExpenses).map((category) => {
          const existing = budgetsWithSpending.find((b) => b.category === category)
          if (existing) return existing

          const spent = expensesByCategory[category] || 0
          return {
            id: '',
            owner_id: userId,
            category,
            month,
            budget_amount: 0,
            spent_amount: spent,
            percentage: 0,
            isOverBudget: false,
            isWarning: false,
            remaining: 0,
            created_at: undefined,
            updated_at: undefined,
          }
        })
      : []

    return NextResponse.json({
      budgets: allBudgets,
      month,
      summary: {
        totalBudget: budgetsWithSpending.reduce((sum, b) => sum + b.budget_amount, 0),
        totalSpent: budgetsWithSpending.reduce((sum, b) => sum + b.spent_amount, 0),
        totalRemaining: budgetsWithSpending.reduce((sum, b) => sum + b.remaining, 0),
        overBudgetCount: budgetsWithSpending.filter((b) => b.isOverBudget).length,
        warningCount: budgetsWithSpending.filter((b) => b.isWarning).length,
      },
    })
  } catch (error) {
    console.error('예산 조회 실패:', error)
    return NextResponse.json(
      { error: 'Failed to fetch budgets', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/finance/budget
 * 예산 생성
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const userId = await getUserIdFromCookies()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const json = await request.json()
    const body = budgetSchema.parse(json)

    const budgetsRepo = new BudgetsRepository(userId, supabase)
    const budget = await budgetsRepo.createBudget(body)

    return NextResponse.json({ budget })
  } catch (error) {
    console.error('예산 생성 실패:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Failed to create budget', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

