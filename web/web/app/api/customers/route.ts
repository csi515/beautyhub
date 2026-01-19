import { NextRequest } from 'next/server'
import { withAuth } from '@/app/lib/api/middleware'
import { parseQueryParams, parseAndValidateBody, createSuccessResponse } from '@/app/lib/api/handlers'
import { CustomersRepository } from '@/app/lib/repositories/customers.repository'
import { customerCreateSchema } from '@/app/lib/api/schemas'

export const GET = withAuth(async (req: NextRequest, { userId, supabase }) => {
  const params = parseQueryParams(req)
  const repository = new CustomersRepository(userId, supabase)
  const data = await repository.findAll(params)
  return createSuccessResponse(data)
})

export const POST = withAuth(async (req: NextRequest, { userId, supabase }) => {
  const validatedBody = await parseAndValidateBody(req, customerCreateSchema)
  const repository = new CustomersRepository(userId, supabase)
  // exactOptionalPropertyTypes를 위한 타입 변환
  const body: Parameters<typeof repository.createCustomer>[0] = {
    name: validatedBody.name,
  }
  if (validatedBody.email !== undefined) {
    body.email = validatedBody.email
  }
  if (validatedBody.address !== undefined) {
    body.address = validatedBody.address
  }
  if (validatedBody.phone !== undefined) {
    body.phone = validatedBody.phone
  }
  const data = await repository.createCustomer(body)
  return createSuccessResponse(data, 201)
})
