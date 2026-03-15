import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getUserIdFromCookies } from '@/lib/auth/user'
import { CustomerPhotosRepository } from '@/app/lib/repositories/customer-photos.repository'
import type { CustomerPhotoCreateInput } from '@/types/entities'
import { logger } from '@/app/lib/utils/logger'

/**
 * GET /api/customers/[id]/photos
 * 고객 사진 목록 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createSupabaseServerClient()
    const userId = await getUserIdFromCookies()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const customerId = params.id
    const searchParams = request.nextUrl.searchParams
    const photo_type = searchParams.get('photo_type') as 'before' | 'after' | 'general' | null
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const repository = new CustomerPhotosRepository(userId, supabase)
    const photos = await repository.findByCustomerId(customerId, {
      ...(photo_type ? { photo_type } : {}),
      limit,
      offset,
    })

    return NextResponse.json(photos)
  } catch (error) {
    logger.error('Error fetching customer photos', error, 'CustomerPhotos')
    return NextResponse.json(
      { error: 'Failed to fetch customer photos' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/customers/[id]/photos
 * 고객 사진 업로드
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createSupabaseServerClient()
    const userId = await getUserIdFromCookies()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const customerId = params.id
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const photo_type = formData.get('photo_type') as 'before' | 'after' | 'general'
    const appointment_id = formData.get('appointment_id') as string | null
    const notes = formData.get('notes') as string | null
    const taken_at = formData.get('taken_at') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      )
    }

    if (!['before', 'after', 'general'].includes(photo_type)) {
      return NextResponse.json(
        { error: 'Invalid photo_type' },
        { status: 400 }
      )
    }

    // 파일 업로드
    const fileExt = file.name.split('.').pop()
    const fileName = `${customerId}/${Date.now()}.${fileExt}`
    const filePath = `customer-photos/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('customer-photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      logger.error('Error uploading file', uploadError, 'CustomerPhotos')
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      )
    }

    // 공개 URL 가져오기
    const { data: { publicUrl } } = supabase.storage
      .from('customer-photos')
      .getPublicUrl(filePath)

    // 데이터베이스에 사진 정보 저장
    const repository = new CustomerPhotosRepository(userId, supabase)
    const input: CustomerPhotoCreateInput = {
      customer_id: customerId,
      appointment_id: appointment_id || null,
      photo_url: publicUrl,
      photo_type,
      notes: notes || null,
      taken_at: taken_at || null,
    }

    const photo = await repository.createPhoto(input)

    return NextResponse.json(photo, { status: 201 })
  } catch (error) {
    logger.error('Error creating customer photo', error, 'CustomerPhotos')
    const errorMessage = error instanceof Error ? error.message : 'Failed to create customer photo'
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    )
  }
}
