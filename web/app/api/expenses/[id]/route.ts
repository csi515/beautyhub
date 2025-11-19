import { NextRequest } from 'next/server'
import { withAuth } from '@/app/lib/api/middleware'
import { parseAndValidateBody, createSuccessResponse } from '@/app/lib/api/handlers'
import { ExpensesRepository } from '@/app/lib/repositories/expenses.repository'
import { expenseUpdateSchema } from '@/app/lib/api/schemas'
import { NotFoundError } from '@/app/lib/api/errors'

export const GET = withAuth(async (_req: NextRequest, { userId, params }) => {
  const id = params?.['id']
  if (!id || typeof id !== "string") {
    throw new NotFoundError("Missing or invalid expense ID")
  }
  const repository = new ExpensesRepository(userId)
  const data = await repository.findById(id)
  if (!data) {
    throw new NotFoundError("Expense not found")
  }
  return createSuccessResponse(data)
})

export const PUT = withAuth(async (req: NextRequest, { userId, params }) => {
  const id = params?.['id']
  if (!id || typeof id !== "string") {
    throw new NotFoundError("Missing or invalid expense ID")
  }
  const validatedBody = await parseAndValidateBody(req, expenseUpdateSchema)
  const repository = new ExpensesRepository(userId)
  // exactOptionalPropertyTypes를 위한 타입 변환
  const body: Parameters<typeof repository.updateExpense>[1] = {}
  if (validatedBody.amount !== undefined) {
    body.amount = validatedBody.amount
  }
  if (validatedBody.expense_date !== undefined) {
    body.expense_date = validatedBody.expense_date
  }
  if (validatedBody.category !== undefined) {
    body.category = validatedBody.category
  }
  if (validatedBody.memo !== undefined) {
    body.memo = validatedBody.memo
  }
  const data = await repository.updateExpense(id, body)
  return createSuccessResponse(data)
})

export const DELETE = withAuth(async (_req: NextRequest, { userId, params }) => {
  const id = params?.['id']
  if (!id || typeof id !== "string") {
    throw new NotFoundError("Missing or invalid expense ID")
  }
  const repository = new ExpensesRepository(userId)
  await repository.delete(id)
  return createSuccessResponse({ ok: true })
})


