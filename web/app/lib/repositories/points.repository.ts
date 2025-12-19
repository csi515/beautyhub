/**
 * 포인트 Repository
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { ApiError, NotFoundError, UnauthorizedError } from '../api/errors'
import type { QueryOptions } from './base.repository'

export interface PointsLedger {
  id: string
  owner_id: string
  customer_id: string
  delta: number
  reason?: string | null
  created_at?: string
}

export interface PointsBalance {
  balance: number
  ledger?: PointsLedger[]
}

export interface PointsReport {
  total_add: number
  total_deduct: number
  net: number
  by_reason: Array<{
    reason: string
    sum: number
    count: number
  }>
}

export interface PointsLedgerCreateInput {
  delta: number
  reason?: string
}

export class PointsRepository {
  protected supabase: SupabaseClient
  protected userId: string

  constructor(userId: string, supabase: SupabaseClient) {
    this.userId = userId
    this.supabase = supabase
  }

  /**
   * Supabase 에러 처리
   */
  private handleSupabaseError(error: unknown): never {
    console.error(`[PointsRepository] Supabase Error:`, error)

    const err = error as { code?: string; message?: string; status?: number }

    // 인증 관련 에러 (401, JWT expired 등)
    if (
      err.code === 'PGRST301' ||
      err.message?.includes('JWT') ||
      err.status === 401 ||
      err.message?.includes('invalid claim')
    ) {
      throw new UnauthorizedError()
    }

    if (err.code === 'PGRST116') {
      throw new NotFoundError('Resource not found')
    }

    // Postgres 에러 코드 처리
    if (err.code?.startsWith('23')) {
      if (err.code === '23505') {
        throw new ApiError(err.message || 'Unique constraint violation', 409)
      }
      if (err.code === '23503') {
        throw new ApiError(err.message || 'Foreign key violation', 400)
      }
      throw new ApiError(err.message || 'Database error', 400)
    }

    throw new ApiError(err.message || 'Unknown error', (err.status && err.status >= 400) ? err.status : 500)
  }

  /**
   * 고객의 포인트 잔액 및 ledger 조회
   */
  async getBalance(
    customerId: string,
    options: QueryOptions & { withLedger?: boolean; from?: string; to?: string } = {}
  ): Promise<PointsBalance> {
    if (this.userId === 'demo-user') {
      const { MOCK_POINTS_LEDGER } = await import('@/app/lib/mock-data')
      const ledger = MOCK_POINTS_LEDGER.filter(l => l.customer_id === customerId)
      const balance = ledger.reduce((s, l) => s + l.delta, 0)
      return { balance, ledger: options.withLedger !== false ? (ledger as unknown as PointsLedger[]) : [] }
    }

    const { withLedger = true, limit = 50, offset = 0, from, to } = options

    // 전체 잔액 계산 (기간 무관)
    const { data: allRows, error: e1 } = await this.supabase
      .from('points_ledger')
      .select('delta, created_at')
      .eq('customer_id', customerId)
      .eq('owner_id', this.userId)
      .order('created_at', { ascending: false })

    if (e1) {
      this.handleSupabaseError(e1)
    }

    const balance = (allRows || []).reduce((s: number, r: { delta?: number }) => s + Number(r.delta || 0), 0)

    if (!withLedger) {
      return { balance }
    }

    // 기간 필터가 있으면 ledger 범위를 제한
    let query = this.supabase
      .from('points_ledger')
      .select('*')
      .eq('customer_id', customerId)
      .eq('owner_id', this.userId)
      .order('created_at', { ascending: false })

    if (from) {
      query = query.gte('created_at', from)
    }
    if (to) {
      query = query.lt('created_at', to)
    }

    const { data: ledger, error: e2 } = await query.range(offset, offset + limit - 1)

    if (e2) {
      this.handleSupabaseError(e2)
    }

    return {
      balance,
      ledger: (ledger || []) as PointsLedger[],
    }
  }

  /**
   * 포인트 ledger 항목 추가
   */
  async addLedgerEntry(customerId: string, input: PointsLedgerCreateInput): Promise<PointsBalance> {
    const { delta, reason = '' } = input

    if (!delta || delta === 0) {
      throw new Error('delta must be non-zero')
    }

    const { error: insErr } = await this.supabase.from('points_ledger').insert({
      customer_id: customerId,
      delta,
      reason,
      owner_id: this.userId,
    })

    if (insErr) {
      this.handleSupabaseError(insErr)
    }

    // 새로운 잔액 계산
    const { data: ledger, error } = await this.supabase
      .from('points_ledger')
      .select('delta')
      .eq('customer_id', customerId)
      .eq('owner_id', this.userId)

    if (error) {
      this.handleSupabaseError(error)
    }

    const balance = (ledger || []).reduce((s: number, r: { delta?: number }) => s + Number(r.delta || 0), 0)

    return { balance }
  }

  /**
   * 포인트 ledger만 조회
   */
  async getLedger(
    customerId: string,
    options: QueryOptions & { from?: string; to?: string } = {}
  ): Promise<Array<{ created_at: string; delta: number; reason?: string }>> {
    if (this.userId === 'demo-user') {
      const { MOCK_POINTS_LEDGER } = await import('@/app/lib/mock-data')
      return MOCK_POINTS_LEDGER
        .filter(l => l.customer_id === customerId)
        .map(l => ({ created_at: l.created_at, delta: l.delta, reason: l.reason })) as unknown as Array<{ created_at: string; delta: number; reason?: string }>
    }

    const { limit = 50, offset = 0, from, to } = options

    let query = this.supabase
      .from('points_ledger')
      .select('created_at, delta, reason')
      .eq('customer_id', customerId)
      .eq('owner_id', this.userId)
      .order('created_at', { ascending: false })

    if (from) {
      query = query.gte('created_at', from)
    }
    if (to) {
      query = query.lt('created_at', to)
    }

    const { data, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      this.handleSupabaseError(error)
    }

    return (data || []) as Array<{ created_at: string; delta: number; reason?: string }>
  }

  /**
   * 포인트 리포트 생성
   */
  async getReport(customerId: string, from?: string, to?: string): Promise<PointsReport> {
    let query = this.supabase
      .from('points_ledger')
      .select('delta, reason, created_at')
      .eq('customer_id', customerId)
      .eq('owner_id', this.userId)

    if (from) {
      query = query.gte('created_at', from)
    }
    if (to) {
      query = query.lt('created_at', to)
    }

    const { data, error } = await query

    if (error) {
      this.handleSupabaseError(error)
    }

    const rows = data || []

    let total_add = 0
    let total_deduct = 0
    const by_reason_map: Record<string, { sum: number; count: number }> = {}

    for (const r of rows) {
      const d = Number((r as { delta?: number }).delta || 0)
      if (d >= 0) {
        total_add += d
      } else {
        total_deduct += Math.abs(d)
      }
      const reason = String((r as { reason?: string }).reason || '기타')
      if (!by_reason_map[reason]) {
        by_reason_map[reason] = { sum: 0, count: 0 }
      }
      by_reason_map[reason].sum += Math.abs(d)
      by_reason_map[reason].count += 1
    }

    const by_reason = Object.entries(by_reason_map).map(([reason, { sum, count }]) => ({
      reason,
      sum,
      count,
    }))

    const net = total_add - total_deduct

    return {
      total_add,
      total_deduct,
      net,
      by_reason,
    }
  }
}

