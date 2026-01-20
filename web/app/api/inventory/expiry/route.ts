import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getUserIdFromCookies } from '@/lib/auth/user'
import { ProductBatchesRepository } from '@/app/lib/repositories/product-batches.repository'
import { ProductsRepository } from '@/app/lib/repositories/products.repository'
import { z } from 'zod'
import { differenceInDays } from 'date-fns'

const batchSchema = z.object({
  product_id: z.string().uuid(),
  batch_number: z.string().min(1),
  quantity: z.number().min(0),
  expiry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  purchase_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  notes: z.string().optional().nullable(),
})

/**
 * GET /api/inventory/expiry
 * 유통기한 관리 조회
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const userId = await getUserIdFromCookies()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const days = parseInt(searchParams.get('days') || '30') // 기본 30일
    const productId = searchParams.get('product_id')

    const batchesRepo = new ProductBatchesRepository(userId, supabase)
    const productsRepo = new ProductsRepository(userId, supabase)

    let batches
    if (productId) {
      batches = await batchesRepo.findByProductId(productId)
    } else {
      batches = await batchesRepo.findExpiringSoon(days)
    }

    // 제품 정보 포함
    const productIds = Array.from(new Set(batches.map((b) => b.product_id)))
    const products = await Promise.all(
      productIds.map((id) => productsRepo.findById(id))
    )

    const productsById = new Map(
      products.filter((p) => p).map((p) => [p!.id, p!])
    )

    const batchesWithProduct = batches.map((batch) => {
      const product = productsById.get(batch.product_id)
      const expiryDate = new Date(batch.expiry_date)
      const today = new Date()
      const daysUntilExpiry = differenceInDays(expiryDate, today)
      const isExpired = expiryDate < today
      const isExpiringSoon = daysUntilExpiry >= 0 && daysUntilExpiry <= days

      return {
        ...batch,
        product_name: product?.name || '알 수 없음',
        days_until_expiry: daysUntilExpiry,
        is_expired: isExpired,
        is_expiring_soon: isExpiringSoon,
      }
    })

    // 정렬: 만료된 것 먼저, 그 다음 임박 순
    batchesWithProduct.sort((a, b) => {
      if (a.is_expired && !b.is_expired) return -1
      if (!a.is_expired && b.is_expired) return 1
      if (a.is_expiring_soon && !b.is_expiring_soon) return -1
      if (!a.is_expiring_soon && b.is_expiring_soon) return 1
      return a.days_until_expiry - b.days_until_expiry
    })

    return NextResponse.json({
      batches: batchesWithProduct,
      summary: {
        total: batchesWithProduct.length,
        expired: batchesWithProduct.filter((b) => b.is_expired).length,
        expiringSoon: batchesWithProduct.filter((b) => b.is_expiring_soon && !b.is_expired).length,
        days,
      },
    })
  } catch (error) {
    console.error('유통기한 조회 실패:', error)
    return NextResponse.json(
      { error: 'Failed to fetch expiry data', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/inventory/expiry
 * 배치 생성
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const userId = await getUserIdFromCookies()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const json = await request.json()
    const body = batchSchema.parse(json)

    const batchesRepo = new ProductBatchesRepository(userId, supabase)
    const batch = await batchesRepo.createBatch(body)

    return NextResponse.json({ batch })
  } catch (error) {
    console.error('배치 생성 실패:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Failed to create batch', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
