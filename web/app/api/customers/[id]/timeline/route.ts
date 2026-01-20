import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getUserIdFromCookies } from '@/lib/auth/user'

/**
 * GET /api/customers/[id]/timeline
 * 고객 이벤트 타임라인 조회 (예약, 거래, 포인트 변동, 상담 기록 통합)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createSupabaseServerClient()
    const userId = await getUserIdFromCookies()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const customerId = params.id

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 })
    }

    // 검증: 고객이 사용자의 소유인지 확인
    const { data: customer, error: customerError } = await supabase
      .from('beautyhub_customers')
      .select('id')
      .eq('id', customerId)
      .eq('owner_id', userId)
      .single()

    if (customerError || !customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // 모든 이벤트 병렬 조회
    const [appointmentsResult, transactionsResult, pointsResult, productsResult] = await Promise.all([
      // 예약 조회
      supabase
        .from('beautyhub_appointments')
        .select('id, appointment_date, status, notes, service_id, staff_id, created_at')
        .eq('customer_id', customerId)
        .eq('owner_id', userId)
        .order('appointment_date', { ascending: false })
        .limit(500),
      // 거래 조회
      supabase
        .from('beautyhub_transactions')
        .select('id, transaction_date, amount, notes, appointment_id, created_at')
        .eq('customer_id', customerId)
        .eq('owner_id', userId)
        .order('transaction_date', { ascending: false })
        .limit(500),
      // 포인트 변동 조회
      supabase
        .from('beautyhub_points_ledger')
        .select('id, created_at, delta, balance, reason, notes')
        .eq('customer_id', customerId)
        .eq('owner_id', userId)
        .order('created_at', { ascending: false })
        .limit(500),
      // 보유상품 변동 조회
      supabase
        .from('beautyhub_customer_products')
        .select('id, product_id, quantity, notes, created_at, updated_at')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
        .limit(500),
    ])

    // 타임라인 이벤트 배열 생성
    const timelineEvents: Array<{
      id: string
      type: 'appointment' | 'transaction' | 'points' | 'product'
      date: string
      title: string
      description?: string
      metadata?: any
    }> = []

    // 예약 이벤트 추가
    if (appointmentsResult.data) {
      for (const appointment of appointmentsResult.data) {
        timelineEvents.push({
          id: `appointment-${appointment.id}`,
          type: 'appointment',
          date: appointment.appointment_date || appointment.created_at || '',
          title: `예약: ${appointment.status || 'scheduled'}`,
          description: appointment.notes || undefined,
          metadata: {
            appointment_id: appointment.id,
            status: appointment.status,
            service_id: appointment.service_id,
            staff_id: appointment.staff_id,
          },
        })
      }
    }

    // 거래 이벤트 추가
    if (transactionsResult.data) {
      for (const transaction of transactionsResult.data) {
        timelineEvents.push({
          id: `transaction-${transaction.id}`,
          type: 'transaction',
          date: transaction.transaction_date || transaction.created_at || '',
          title: `거래: ${Number(transaction.amount || 0).toLocaleString()}원`,
          description: transaction.notes || undefined,
          metadata: {
            transaction_id: transaction.id,
            amount: transaction.amount,
            appointment_id: transaction.appointment_id,
          },
        })
      }
    }

    // 포인트 변동 이벤트 추가
    if (pointsResult.data) {
      for (const point of pointsResult.data) {
        const delta = Number(point.delta || 0)
        const sign = delta >= 0 ? '+' : ''
        timelineEvents.push({
          id: `points-${point.id}`,
          type: 'points',
          date: point.created_at || '',
          title: `포인트 ${sign}${delta.toLocaleString()}점 (잔액: ${Number(point.balance || 0).toLocaleString()}점)`,
          description: point.reason || point.notes || undefined,
          metadata: {
            points_ledger_id: point.id,
            delta: delta,
            balance: point.balance,
          },
        })
      }
    }

    // 보유상품 변동 이벤트 추가
    if (productsResult.data) {
      for (const product of productsResult.data) {
        timelineEvents.push({
          id: `product-${product.id}`,
          type: 'product',
          date: product.created_at || '',
          title: `보유상품: ${product.quantity}개`,
          description: product.notes || undefined,
          metadata: {
            customer_product_id: product.id,
            product_id: product.product_id,
            quantity: product.quantity,
          },
        })
      }
    }

    // 날짜순으로 정렬 (최신순)
    timelineEvents.sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return dateB - dateA
    })

    return NextResponse.json({
      events: timelineEvents,
      total: timelineEvents.length,
    })
  } catch (error) {
    console.error('고객 타임라인 조회 실패:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customer timeline', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
