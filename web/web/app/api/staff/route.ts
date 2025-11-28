import { NextRequest } from 'next/server'
import { withAuth } from '@/app/lib/api/middleware'
import { parseQueryParams, parseAndValidateBody, createSuccessResponse } from '@/app/lib/api/handlers'
import { StaffRepository } from '@/app/lib/repositories/staff.repository'
import { staffCreateSchema } from '@/app/lib/api/schemas'

export const GET = withAuth(async (req: NextRequest, { userId, supabase }) => {
  const params = parseQueryParams(req)
  const repository = new StaffRepository(userId, supabase)
  const data = await repository.findAll(params)
  return createSuccessResponse(data)
})

export const POST = withAuth(async (req: NextRequest, { userId, supabase }) => {
  const validatedBody = await parseAndValidateBody(req, staffCreateSchema)
  const repository = new StaffRepository(userId, supabase)
  // exactOptionalPropertyTypes를 위한 타입 변환
  const body: Parameters<typeof repository.createStaff>[0] = {
    name: validatedBody.name,
    active: validatedBody.active,
  }
  if (validatedBody.email !== undefined) {
    body.email = validatedBody.email
  }
  if (validatedBody.role !== undefined) {
    body.role = validatedBody.role
  }
  if (validatedBody.phone !== undefined) {
    body.phone = validatedBody.phone
  }
  if (validatedBody.notes !== undefined) {
    body.notes = validatedBody.notes
  }
  const data = await repository.createStaff(body)
  return createSuccessResponse(data, 201)
})


