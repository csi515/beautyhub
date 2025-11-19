import { NextRequest } from 'next/server'
import { withAuth } from '@/app/lib/api/middleware'
import { parseBody, createSuccessResponse } from '@/app/lib/api/handlers'
import { CustomerProductsRepository } from '@/app/lib/repositories/customer-products.repository'
import type { CustomerProductUpdateInput } from '@/app/lib/repositories/customer-products.repository'

export const PUT = withAuth(async (req: NextRequest, { userId, params }) => {
  const id = params?.['id']
  if (!id || typeof id !== "string") {
    return createSuccessResponse({ ok: false, error: "Missing or invalid product ID" })
  }
  const body = await parseBody<CustomerProductUpdateInput>(req)
  const repository = new CustomerProductsRepository(userId)
  const data = await repository.updateHolding(id, body)
  return createSuccessResponse(data)
})

export const DELETE = withAuth(async (_req: NextRequest, { userId, params }) => {
  const id = params?.['id']
  if (!id || typeof id !== "string") {
    return createSuccessResponse({ ok: false, error: "Missing or invalid product ID" })
  }
  const repository = new CustomerProductsRepository(userId)
  await repository.delete(id)
  return createSuccessResponse({ ok: true })
})


