import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getUserIdFromCookies } from '@/lib/auth/user'
import { BudgetsRepository } from '@/app/lib/repositories/budgets.repository'
import { z } from 'zod'

/**
 * PATCH /api/finance/budget/[id]
 * 예산 수정
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createSupabaseServerClient()
    const userId = await getUserIdFromCookies()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const budgetId = params.id
    const json = await request.json()
    const body = z.object({ budget_amount: z.number().min(0).optional() }).parse(json)

    const budgetsRepo = new BudgetsRepository(userId, supabase)
    const budget = await budgetsRepo.updateBudget(budgetId, body)

    return NextResponse.json({ budget })
  } catch (error) {
    console.error('예산 수정 실패:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Failed to update budget', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/finance/budget/[id]
 * 예산 삭제
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createSupabaseServerClient()
    const userId = await getUserIdFromCookies()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const budgetId = params.id

    const budgetsRepo = new BudgetsRepository(userId, supabase)
    await budgetsRepo.delete(budgetId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('예산 삭제 실패:', error)
    return NextResponse.json(
      { error: 'Failed to delete budget', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
