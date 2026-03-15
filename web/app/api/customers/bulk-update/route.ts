import { NextRequest } from 'next/server'
import { withAuth } from '@/app/lib/api/middleware'
import { parseAndValidateBody, createSuccessResponse } from '@/app/lib/api/handlers'
import { CustomersRepository } from '@/app/lib/repositories/customers.repository'
import { customerBulkStatusSchema } from '@/app/lib/api/schemas'

/**
 * POST /api/customers/bulk-update
 * 고객 일괄 상태(활성/비활성) 변경
 */
export const POST = withAuth(async (req: NextRequest, { userId, supabase }) => {
  const { ids, active } = await parseAndValidateBody(req, customerBulkStatusSchema)
  const repository = new CustomersRepository(userId, supabase)

  const results: { id: string; ok: boolean }[] = []
  for (const id of ids) {
    try {
      await repository.updateCustomer(id, { active })
      results.push({ id, ok: true })
    } catch {
      results.push({ id, ok: false })
    }
  }

  const successCount = results.filter((r) => r.ok).length
  return createSuccessResponse({
    updated: successCount,
    total: ids.length,
    results,
  })
})
