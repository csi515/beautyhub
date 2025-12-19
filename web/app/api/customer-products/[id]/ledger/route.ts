import { NextRequest } from 'next/server'
import { withAuth } from '@/app/lib/api/middleware'
import { parseQueryParams, parseBody, createSuccessResponse } from '@/app/lib/api/handlers'
import { CustomerProductsRepository } from '@/app/lib/repositories/customer-products.repository'

export const GET = withAuth(async (req: NextRequest, { userId, supabase, params }) => {
  const queryParams = parseQueryParams(req)
  const id = params?.['id']
  if (!id || typeof id !== "string") {
    return createSuccessResponse({ ok: false, error: "Missing or invalid product ID" })
  }
  const repository = new CustomerProductsRepository(userId, supabase)
  const data = await repository.getCustomerLedger(id, queryParams)
  return createSuccessResponse(data)
})

export const POST = withAuth(async (req: NextRequest, { userId, supabase, params }) => {
  const id = params?.['id']
  if (!id || typeof id !== "string") {
    return createSuccessResponse({ ok: false, error: "Missing or invalid product ID" })
  }
  const body = await parseBody<{ delta: number; reason?: string }>(req)
  const repository = new CustomerProductsRepository(userId, supabase)
  await repository.addLedgerEntry(id, body.delta, body.reason || '')
  return createSuccessResponse({ ok: true })
})

export const PUT = withAuth(async (req: NextRequest, { userId, supabase, params }) => {
  const id = params?.['id']
  if (!id || typeof id !== "string") {
    return createSuccessResponse({ ok: false, error: "Missing or invalid product ID" })
  }
  const body = await parseBody<{ replace_from?: string; replace_to?: string; delta_override?: number }>(req)
  const repository = new CustomerProductsRepository(userId, supabase)
  await repository.updateLedgerEntry(
    id,
    body.replace_from || '',
    body.replace_to || '',
    body.delta_override
  )
  return createSuccessResponse({ ok: true })
})

