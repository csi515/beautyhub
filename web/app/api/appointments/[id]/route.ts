import { NextRequest } from 'next/server'
import { withAuth } from '@/app/lib/api/middleware'
import { parseAndValidateBody, createSuccessResponse } from '@/app/lib/api/handlers'
import { AppointmentsRepository } from '@/app/lib/repositories/appointments.repository'
import { appointmentUpdateSchema } from '@/app/lib/api/schemas'
import { NotFoundError } from '@/app/lib/api/errors'
import type { AppointmentUpdateInput } from '@/types/entities'

export const GET = withAuth(async (_req: NextRequest, { userId, supabase, params }) => {
  const id = params?.['id']
  if (!id || typeof id !== "string") {
    throw new NotFoundError("Missing or invalid appointment ID")
  }
  const repository = new AppointmentsRepository(userId, supabase)
  const data = await repository.findById(id)
  if (!data) {
    throw new NotFoundError("Appointment not found")
  }
  return createSuccessResponse(data)
})

export const PUT = withAuth(async (req: NextRequest, { userId, supabase, params }) => {
  const id = params?.['id']
  if (!id || typeof id !== "string") {
    throw new NotFoundError("Missing or invalid appointment ID")
  }
  const body = await parseAndValidateBody(req, appointmentUpdateSchema)
  // exactOptionalPropertyTypes 호환성을 위해 undefined 제거 후 타입 단언
  const cleanBody = Object.fromEntries(
    Object.entries(body).filter(([_, value]) => value !== undefined)
  ) as AppointmentUpdateInput
  const repository = new AppointmentsRepository(userId, supabase)
  const data = await repository.updateAppointment(id, cleanBody)
  return createSuccessResponse(data)
})

export const DELETE = withAuth(async (_req: NextRequest, { userId, supabase, params }) => {
  const id = params?.['id']
  if (!id || typeof id !== "string") {
    throw new NotFoundError("Missing or invalid appointment ID")
  }
  const repository = new AppointmentsRepository(userId, supabase)
  await repository.delete(id)
  return createSuccessResponse({ ok: true })
})
