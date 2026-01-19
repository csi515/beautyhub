import { NextRequest } from 'next/server'
import { withAuth } from '@/app/lib/api/middleware'
import { parseBody, createSuccessResponse } from '@/app/lib/api/handlers'
import { CustomerProductsRepository } from '@/app/lib/repositories/customer-products.repository'

// PATCH /api/customer-products/ledger/[id]
export const PATCH = withAuth(async (req: NextRequest, { userId, supabase, params }) => {
    const id = params?.['id']
    if (!id || typeof id !== "string") {
        return createSuccessResponse({ ok: false, error: "Missing or invalid ledger ID" })
    }

    const body = await parseBody<{ notes: string }>(req)

    const repository = new CustomerProductsRepository(userId, supabase)
    await repository.updateLedgerNote(id, body.notes)

    return createSuccessResponse({ ok: true })
})
