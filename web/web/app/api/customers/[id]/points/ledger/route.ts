import { NextRequest } from 'next/server'
import { withAuth } from '@/app/lib/api/middleware'
import { parseQueryParams, createSuccessResponse } from '@/app/lib/api/handlers'
import { PointsRepository } from '@/app/lib/repositories/points.repository'
import { ValidationError } from '@/app/lib/api/errors'

// Vercel 배포를 위한 동적 렌더링 설정
export const dynamic = 'force-dynamic'

export const GET = withAuth(async (req: NextRequest, { userId, supabase, params }) => {
    const id = params?.['id']
    if (!id || typeof id !== "string") {
        throw new ValidationError("Missing or invalid customer ID")
    }

    const queryParams = parseQueryParams(req)

    const repository = new PointsRepository(userId, supabase)
    const ledger = await repository.getLedger(id, queryParams)

    return createSuccessResponse(ledger)
})
