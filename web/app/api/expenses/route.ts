import { NextRequest } from 'next/server'
import { withAuth } from '@/app/lib/api/middleware'
import { parseQueryParams, parseAndValidateBody, createSuccessResponse } from '@/app/lib/api/handlers'
import { ExpensesRepository } from '@/app/lib/repositories/expenses.repository'
import { expenseCreateSchema } from '@/app/lib/api/schemas'

export const GET = withAuth(async (req: NextRequest, { userId }) => {
  const params = parseQueryParams(req)
  const repository = new ExpensesRepository(userId)
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

export const POST = withAuth(async (req: NextRequest, { userId }) => {
  const validatedBody = await parseAndValidateBody(req, expenseCreateSchema)
  const repository = new ExpensesRepository(userId)
  // exactOptionalPropertyTypes를 위한 타입 변환
  const body: Parameters<typeof repository.createExpense>[0] = {
    amount: validatedBody.amount,
    expense_date: validatedBody.expense_date,
    category: validatedBody.category,
  }
  if (validatedBody.memo !== undefined) {
    body.memo = validatedBody.memo
  }
  const data = await repository.createExpense(body)
  return createSuccessResponse(data, 201)
})


