import { NextRequest } from 'next/server'
import { withAuth } from '@/app/lib/api/middleware'
import { parseQueryParams, parseAndValidateBody, createSuccessResponse } from '@/app/lib/api/handlers'
import { AppointmentsRepository } from '@/app/lib/repositories/appointments.repository'
import { appointmentCreateSchema } from '@/app/lib/api/schemas'
import type { AppointmentCreateInputExtended } from '@/types/entities'

export const GET = withAuth(async (req: NextRequest, { userId, supabase }) => {
  const params = parseQueryParams(req)
  const repository = new AppointmentsRepository(userId, supabase)
  const options: Parameters<typeof repository.findAll>[0] = {
    ...params,
  }
  if (params.from) {
    options.from = params.from
  }
  if (params.to) {
    options.to = params.to
  }
  const data = await repository.findAll(options)
  return createSuccessResponse(data)
})

export const POST = withAuth(async (req: NextRequest, { userId, supabase }) => {
  const validatedBody = await parseAndValidateBody(req, appointmentCreateSchema)
  const repository = new AppointmentsRepository(userId, supabase)
  // exactOptionalPropertyTypes를 위한 타입 변환
  const body: Parameters<typeof repository.createAppointment>[0] = {
    appointment_date: validatedBody.appointment_date,
    status: validatedBody.status,
  }
  if (validatedBody.customer_id !== undefined) {
    body.customer_id = validatedBody.customer_id ?? null
  }
  if (validatedBody.staff_id !== undefined) {
    body.staff_id = validatedBody.staff_id ?? null
  }
  // service_id는 스키마에 있지만 타입에 추가
  if ('service_id' in validatedBody && validatedBody.service_id !== undefined) {
    (body as AppointmentCreateInputExtended).service_id = validatedBody.service_id ?? null
  }
  if (validatedBody.notes !== undefined) {
    body.notes = validatedBody.notes ?? null
  }
  const data = await repository.createAppointment(body)
  return createSuccessResponse(data, 201)
})
