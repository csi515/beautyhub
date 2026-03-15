import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getUserIdFromCookies } from '@/lib/auth/user'
import { CustomersRepository } from '@/app/lib/repositories/customers.repository'
import { logger } from '@/app/lib/utils/logger'

/**
 * GET /api/customers/inactive
 * 장기 미방문 고객 조회
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const userId = await getUserIdFromCookies()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const days = parseInt(searchParams.get('days') || '90')

    const repository = new CustomersRepository(userId, supabase)
    const inactiveCustomers = await repository.findInactiveCustomers(days)

    return NextResponse.json(inactiveCustomers)
  } catch (error) {
    logger.error('Error fetching inactive customers', error, 'CustomersInactive')
    return NextResponse.json(
      { error: 'Failed to fetch inactive customers' },
      { status: 500 }
    )
  }
}
