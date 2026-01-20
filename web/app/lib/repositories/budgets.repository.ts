import { SupabaseClient } from '@supabase/supabase-js'
import { BaseRepository } from './base.repository'
import type { Budget, BudgetCreateInput, BudgetUpdateInput } from '@/types/finance'

export class BudgetsRepository extends BaseRepository<Budget> {
  constructor(userId: string, supabase: SupabaseClient) {
    super(userId, 'beautyhub_budgets', supabase)
  }

  /**
   * 예산 생성
   */
  async createBudget(input: BudgetCreateInput): Promise<Budget> {
    const payload = {
      owner_id: this.userId,
      category: input.category,
      month: input.month,
      budget_amount: input.budget_amount,
      spent_amount: 0,
    }
    return this.create(payload as unknown as Budget)
  }

  /**
   * 월별 예산 조회
   */
  async findByMonth(month: string): Promise<Budget[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('owner_id', this.userId)
      .eq('month', month)
      .order('category', { ascending: true })

    if (error) {
      this.handleSupabaseError(error)
    }

    return (data || []) as Budget[]
  }

  /**
   * 카테고리별 예산 조회
   */
  async findByCategory(category: string, month?: string): Promise<Budget[]> {
    let query = this.supabase
      .from(this.tableName)
      .select('*')
      .eq('owner_id', this.userId)
      .eq('category', category)

    if (month) {
      query = query.eq('month', month)
    }

    const { data, error } = await query.order('month', { ascending: false })

    if (error) {
      this.handleSupabaseError(error)
    }

    return (data || []) as Budget[]
  }

  /**
   * 예산 업데이트 (지출 금액 자동 계산 포함)
   */
  async updateBudget(id: string, input: BudgetUpdateInput): Promise<Budget> {
    return this.update(id, input as Partial<Budget>)
  }
}
