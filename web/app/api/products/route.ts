import { NextRequest } from 'next/server'
import { withAuth } from '@/app/lib/api/middleware'
import { parseQueryParams, parseAndValidateBody, createSuccessResponse } from '@/app/lib/api/handlers'
import { ProductsRepository } from '@/app/lib/repositories/products.repository'
import { productCreateSchema } from '@/app/lib/api/schemas'
import { getCachedData, createResourceCacheKey, ResourceCacheConfig, revalidateResourceCache } from '@/app/lib/api/cache'

export const GET = withAuth(async (req: NextRequest, { userId, supabase }) => {
  const params = parseQueryParams(req)

  // 캐싱된 데이터 가져오기 (5분간 유효)
  const data = await getCachedData(
    async () => {
      const repository = new ProductsRepository(userId, supabase)
      return repository.findAll(params)
    },
    createResourceCacheKey('products', userId, JSON.stringify(params)),
    ResourceCacheConfig.products.revalidate,
    [`products:${userId}`, 'products']
  )

  return createSuccessResponse(data)
})

export const POST = withAuth(async (req: NextRequest, { userId, supabase }) => {
  const validatedBody = await parseAndValidateBody(req, productCreateSchema)
  const repository = new ProductsRepository(userId, supabase)
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

  // 캐시 무효화 (새 제품이 생성되었으므로)
  await revalidateResourceCache('products', userId)

  return createSuccessResponse(data, 201)
})
