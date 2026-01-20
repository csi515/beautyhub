import { SupabaseClient } from '@supabase/supabase-js'
/**
 * 吏異?Repository
 */

import { BaseRepository } from './base.repository'
import type { Expense, ExpenseCreateInput, ExpenseUpdateInput } from '@/types/entities'
import type { QueryOptions } from './base.repository'

export class ExpensesRepository extends BaseRepository<Expense> {
  constructor(userId: string, supabase: SupabaseClient) {
    super(userId, 'beautyhub_expenses', supabase)
  }

  /**
   * ?좎쭨 踰붿쐞濡?吏異?議고쉶
   */
  override async findAll(options: QueryOptions & { from?: string; to?: string } = {}): Promise<Expense[]> {
    if (this.userId === 'demo-user') {
      const { MOCK_EXPENSES } = await import('@/app/lib/mock-data')
      return MOCK_EXPENSES as unknown as Expense[]
    }

    const {
      limit = 50,
      offset = 0,
      from,
      to,
      orderBy = 'expense_date',
      ascending = false,
    } = options

    let query = this.supabase
      .from(this.tableName)
      .select('*')
      .eq('owner_id', this.userId)
      .order(orderBy, { ascending })

    if (from) {
      query = query.gte('expense_date', from)
    }
    if (to) {
      query = query.lte('expense_date', to)
    }

    const { data, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      this.handleSupabaseError(error)
    }

    return (data || []) as Expense[]
  }

  /**
   * 吏異??앹꽦
   */
  async createExpense(input: ExpenseCreateInput): Promise<Expense> {
    const expense_date = input.expense_date
    const amount = Number(input.amount || 0)
    const category = String(input.category || '').trim()

    if (!expense_date) {
      throw new Error('date required')
    }
    if (Number.isNaN(amount) || amount <= 0) {
      throw new Error('invalid amount')
    }
    if (!category) {
      throw new Error('category required')
    }

    const payload: Record<string, unknown> = {
      expense_date,
      amount,
      category,
    }

    // memo??媛믪씠 ?덉쓣 ?뚮쭔 ?ы븿 (?ㅽ궎留덉뿉 ?놁쓣 ???덉쓬)
    const memoValue = input.memo
    if (memoValue !== undefined && memoValue !== null && memoValue !== '' && String(memoValue).trim() !== '') {
      payload['memo'] = String(memoValue).trim()
    }
    if (payload['memo'] === undefined || payload['memo'] === null || payload['memo'] === '' || String(payload['memo']).trim() === '') {
      delete payload['memo']
    }

    return this.create(payload as unknown as Expense)
  }

  /**
   * 吏異??낅뜲?댄듃
   */
  async updateExpense(id: string, input: ExpenseUpdateInput): Promise<Expense> {
    const payload: Partial<Expense> = {}

    if (input.expense_date !== undefined) payload.expense_date = input.expense_date
    if (input.amount !== undefined) {
      const amount = Number(input.amount)
      if (Number.isNaN(amount) || amount <= 0) {
        throw new Error('invalid amount')
      }
      payload.amount = amount
    }
    if (input.category !== undefined) {
      const category = String(input.category).trim()
      if (!category) {
        throw new Error('category cannot be empty')
      }
      payload.category = category
    }
    // memo??媛믪씠 ?덉쓣 ?뚮쭔 ?낅뜲?댄듃 (?ㅽ궎留덉뿉 ?놁쓣 ???덉쓬)
    const memoValue = input.memo
    if (memoValue !== undefined && memoValue !== null && memoValue !== '' && String(memoValue).trim() !== '') {
      payload.memo = String(memoValue).trim()
    }
    if (payload.memo === undefined || payload.memo === null || payload.memo === '' || String(payload.memo).trim() === '') {
      delete payload.memo
    }

    return this.update(id, payload)
  }
}


