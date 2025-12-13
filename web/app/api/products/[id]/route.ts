import { NextRequest } from 'next/server'
import { withAuth } from '@/app/lib/api/middleware'
import { parseAndValidateBody, createSuccessResponse } from '@/app/lib/api/handlers'
import { ProductsRepository } from '@/app/lib/repositories/products.repository'
import { productUpdateSchema } from '@/app/lib/api/schemas'
import { NotFoundError } from '@/app/lib/api/errors'
import { revalidateResourceCache } from '@/app/lib/api/cache'

export const GET = withAuth(async (_req: NextRequest, { userId, supabase, params }) => {
  const id = params?.['id']
  if (!id || typeof id !== "string") {
    throw new NotFoundError("Missing or invalid product ID")
  }
  const repository = new ProductsRepository(userId, supabase)
  const data = await repository.findById(id)
  if (!data) {
    throw new NotFoundError("Product not found")
  }
  return createSuccessResponse(data)
})

export const PUT = withAuth(async (req: NextRequest, { userId, supabase, params }) => {
  const id = params?.['id']
  if (!id || typeof id !== "string") {
    throw new NotFoundError("Missing or invalid product ID")
  }
  const validatedBody = await parseAndValidateBody(req, productUpdateSchema)
  const repository = new ProductsRepository(userId, supabase)
  // exactOptionalPropertyTypes를 위한 타입 변환
  const body: Parameters<typeof repository.updateProduct>[1] = {}
  if (validatedBody.name !== undefined) {
    body.name = validatedBody.name
  }
  if (validatedBody.price !== undefined) {
    body.price = validatedBody.price
  }
  if (validatedBody.description !== undefined) {
    body.description = validatedBody.description
  }
  if (validatedBody.active !== undefined) {
    body.active = validatedBody.active
  }
  const data = await repository.updateProduct(id, body)

  // 캐시 무효화
  await revalidateResourceCache('products', userId)

  return createSuccessResponse(data)
})

export const DELETE = withAuth(async (_req: NextRequest, { userId, supabase, params }) => {
  const id = params?.['id']
  if (!id || typeof id !== "string") {
    throw new NotFoundError("Missing or invalid product ID")
  }
  const repository = new ProductsRepository(userId, supabase)
  await repository.delete(id)

  // 캐시 무효화
  await revalidateResourceCache('products', userId)

  return createSuccessResponse({ ok: true })
})
