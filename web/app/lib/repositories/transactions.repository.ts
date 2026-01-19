import { SupabaseClient } from '@supabase/supabase-js'
/**
 * 嫄곕옒 Repository
 */

import { BaseRepository } from './base.repository'
import type { Transaction, TransactionCreateInput, TransactionUpdateInput } from '@/types/entities'
import type { QueryOptions } from './base.repository'

export class TransactionsRepository extends BaseRepository<Transaction> {
  constructor(userId: string, supabase: SupabaseClient) {
    super(userId, 'transactions', supabase)
  }

  /**
   * 怨좉컼蹂?嫄곕옒 議고쉶
   */
  override async findAll(options: QueryOptions & { customer_id?: string } = {}): Promise<Transaction[]> {
    if (this.userId === 'demo-user') {
      const { MOCK_TRANSACTIONS } = await import('@/app/lib/mock-data')
      return MOCK_TRANSACTIONS as unknown as Transaction[]
    }

    const {
      limit = 50,
      offset = 0,
      customer_id,
      orderBy = 'transaction_date',
      ascending = false,
    } = options

    let query = this.supabase
      .from(this.tableName)
      .select('*')
      .eq('owner_id', this.userId)
      .order(orderBy, { ascending })

    if (customer_id) {
      query = query.eq('customer_id', customer_id)
    }

    const { data, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      this.handleSupabaseError(error)
    }

    return (data || []) as Transaction[]
  }

  /**
   * 嫄곕옒 ?앹꽦
   */
  async createTransaction(input: TransactionCreateInput): Promise<Transaction> {
    const payload: Partial<Transaction> = {
      customer_id: input.customer_id || null,
      amount: input.amount,
      transaction_date: input.transaction_date || new Date().toISOString(),
    }

    if (input.type !== undefined) {
      const typeValue = String(input.type).trim()
      if (typeValue) {
        payload['type'] = typeValue
      }
    }

    // category ?꾨뱶 泥섎━
    if (input.category !== undefined && input.category !== null && input.category !== '') {
      payload['category'] = String(input.category).trim()
    }

    // appointment_id媛 紐낆떆?곸쑝濡??쒓났??寃쎌슦?먮쭔 ?ы븿
    if (input.appointment_id !== undefined) {
      payload.appointment_id = input.appointment_id || null
    }

    // payment_method??媛믪씠 ?덉쓣 ?뚮쭔 ?ы븿 (?ㅽ궎留덉뿉 ?놁쓣 ???덉쓬)
    const paymentMethodValue = input.payment_method
    if (paymentMethodValue !== undefined) {
      if (paymentMethodValue === null) {
        payload['payment_method'] = null
      } else {
        const trimmed = String(paymentMethodValue).trim()
        payload['payment_method'] = trimmed ? trimmed : null
      }
    }

    // notes ?꾨뱶???곗씠?곕쿋?댁뒪??而щ읆???놁쑝誘濡??쒖쇅
    // const notesValue = input.notes
    // if (notesValue !== undefined) {
    //   if (notesValue === null) {
    //     payload['notes'] = null
    //   } else {
    //     const trimmed = String(notesValue).trim()
    //     payload['notes'] = trimmed ? trimmed : null
    //   }
    // }

    return this.create(payload)
  }

  /**
   * 嫄곕옒 ?낅뜲?댄듃
   */
  async updateTransaction(id: string, input: TransactionUpdateInput): Promise<Transaction> {
    const payload: Partial<Transaction> = {}

    // appointment_id??紐낆떆?곸쑝濡??쒓났??寃쎌슦?먮쭔 ?낅뜲?댄듃
    if (input.appointment_id !== undefined) {
      payload.appointment_id = input.appointment_id || null
    }
    if (input.customer_id !== undefined) {
      const customerId = input.customer_id
      payload.customer_id = customerId === null || customerId === '' ? null : customerId
    }
    if (input.type !== undefined) {
      const typeValue = String(input.type).trim()
      if (typeValue) {
        payload['type'] = typeValue
      } else {
        delete payload['type']
      }
    }
    if (input.amount !== undefined) payload.amount = input.amount
    // payment_method??媛믪씠 ?덉쓣 ?뚮쭔 ?낅뜲?댄듃 (?ㅽ궎留덉뿉 ?놁쓣 ???덉쓬)
    const paymentMethodValue = input.payment_method
    if (paymentMethodValue !== undefined) {
      if (paymentMethodValue === null) {
        payload['payment_method'] = null
      } else {
        const trimmed = String(paymentMethodValue).trim()
        payload['payment_method'] = trimmed ? trimmed : null
      }
    }
    if (input.transaction_date !== undefined) {
      payload.transaction_date = input.transaction_date
    }
    // notes ?꾨뱶???곗씠?곕쿋?댁뒪??而щ읆???놁쑝誘濡??쒖쇅
    // const notesValue = input.notes
    // if (notesValue !== undefined) {
    //   if (notesValue === null) {
    //     payload['notes'] = null
    //   } else {
    //     const trimmed = String(notesValue).trim()
    //     payload['notes'] = trimmed ? trimmed : null
    //   }
    // }

    return this.update(id, payload)
  }
}


