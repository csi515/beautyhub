import { NextRequest } from 'next/server'
import { withAuth } from '@/app/lib/api/middleware'
import { parseQueryParams, parseAndValidateBody, createSuccessResponse } from '@/app/lib/api/handlers'
import { ProductsRepository } from '@/app/lib/repositories/products.repository'
import { productCreateSchema } from '@/app/lib/api/schemas'

export const GET = withAuth(async (req: NextRequest, { userId }) => {
  const params = parseQueryParams(req)
  const repository = new ProductsRepository(userId)
  const data = await repository.findAll(params)
  return createSuccessResponse(data)
})

export const POST = withAuth(async (req: NextRequest, { userId }) => {
  const validatedBody = await parseAndValidateBody(req, productCreateSchema)
  const repository = new ProductsRepository(userId)
  // exactOptionalPropertyTypes를 위한 타입 변환
  const body: Parameters<typeof repository.createProduct>[0] = {
    name: validatedBody.name,
    active: validatedBody.active,
  }
  if (validatedBody.price !== undefined) {
    body.price = validatedBody.price
  }
  if (validatedBody.description !== undefined) {
    body.description = validatedBody.description
  }
  const data = await repository.createProduct(body)
  return createSuccessResponse(data, 201)
})
