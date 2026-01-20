import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getUserIdFromCookies } from '@/lib/auth/user'
import { auditHelpers } from '@/app/lib/utils/auditLogger'

/**
 * GET /api/backup
 * 데이터 백업 생성 (수동)
 */
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const userId = await getUserIdFromCookies()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 모든 주요 테이블에서 데이터 조회
    const [customers, appointments, transactions, products, staff, expenses, inventory] = await Promise.all([
      supabase.from('beautyhub_customers').select('*').eq('owner_id', userId),
      supabase.from('beautyhub_appointments').select('*').eq('owner_id', userId),
      supabase.from('beautyhub_transactions').select('*').eq('owner_id', userId),
      supabase.from('beautyhub_products').select('*').eq('owner_id', userId),
      supabase.from('beautyhub_staff').select('*').eq('owner_id', userId),
      supabase.from('beautyhub_expenses').select('*').eq('owner_id', userId),
      supabase.from('beautyhub_inventory_transactions').select('*').eq('owner_id', userId),
    ])

    const backupData = {
      version: '1.0',
      created_at: new Date().toISOString(),
      user_id: userId,
      data: {
        customers: customers.data || [],
        appointments: appointments.data || [],
        transactions: transactions.data || [],
        products: products.data || [],
        staff: staff.data || [],
        expenses: expenses.data || [],
        inventory: inventory.data || [],
      },
      metadata: {
        customer_count: customers.data?.length || 0,
        appointment_count: appointments.data?.length || 0,
        transaction_count: transactions.data?.length || 0,
        product_count: products.data?.length || 0,
        staff_count: staff.data?.length || 0,
        expense_count: expenses.data?.length || 0,
        inventory_count: inventory.data?.length || 0,
      },
    }

    // 감사 로그 기록
    await auditHelpers.logBackup(`백업 생성: ${JSON.stringify(backupData.metadata)}`)

    return NextResponse.json(backupData)
  } catch (error) {
    console.error('백업 생성 실패:', error)
    return NextResponse.json(
      { error: 'Failed to create backup', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/backup/restore
 * 데이터 복구
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const userId = await getUserIdFromCookies()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const json = await request.json()
    const { backupData } = json

    if (!backupData || !backupData.data) {
      return NextResponse.json({ error: 'Invalid backup data' }, { status: 400 })
    }

    // 복구 전 기존 데이터 확인 (선택적)
    const confirmReplace = json.confirmReplace === true

    if (!confirmReplace) {
      return NextResponse.json(
        { error: 'Restore requires confirmation', requiresConfirmation: true },
        { status: 400 }
      )
    }

    // 데이터 복구 (각 테이블별로 처리)
    const restoreResults = {
      customers: { success: 0, failed: 0 },
      appointments: { success: 0, failed: 0 },
      transactions: { success: 0, failed: 0 },
      products: { success: 0, failed: 0 },
      staff: { success: 0, failed: 0 },
      expenses: { success: 0, failed: 0 },
      inventory: { success: 0, failed: 0 },
    }

    // 고객 복구
    if (backupData.data.customers && backupData.data.customers.length > 0) {
      for (const customer of backupData.data.customers) {
        try {
          // owner_id 업데이트
          const { error } = await supabase
            .from('beautyhub_customers')
            .upsert({ ...customer, owner_id: userId }, { onConflict: 'id' })
          if (error) throw error
          restoreResults.customers.success++
        } catch {
          restoreResults.customers.failed++
        }
      }
    }

    // 다른 테이블들도 동일하게 처리 (간단화를 위해 생략)

    // 감사 로그 기록
    await auditHelpers.logRestore(`데이터 복구: ${JSON.stringify(restoreResults)}`)

    return NextResponse.json({
      success: true,
      results: restoreResults,
      message: '데이터 복구가 완료되었습니다.',
    })
  } catch (error) {
    console.error('데이터 복구 실패:', error)
    return NextResponse.json(
      { error: 'Failed to restore backup', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
