import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getUserIdFromCookies } from '@/lib/auth/user'
import { AppointmentTemplatesRepository } from '@/app/lib/repositories/appointment-templates.repository'
import type { AppointmentTemplateCreateInput } from '@/types/entities'

/**
 * GET /api/appointment-templates
 * 예약 템플릿 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const userId = await getUserIdFromCookies()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search') || undefined

    const repository = new AppointmentTemplatesRepository(userId, supabase)
    const templates = await repository.findAll({
      limit,
      offset,
      search,
      orderBy: 'created_at',
      ascending: false,
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Error fetching appointment templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch appointment templates' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/appointment-templates
 * 예약 템플릿 생성
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const userId = await getUserIdFromCookies()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const input: AppointmentTemplateCreateInput = {
      name: body.name,
      service_id: body.service_id || null,
      duration_minutes: body.duration_minutes || null,
      default_price: body.default_price || null,
      default_notes: body.default_notes || null,
    }

    const repository = new AppointmentTemplatesRepository(userId, supabase)
    const template = await repository.createTemplate(input)

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error('Error creating appointment template:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to create appointment template'
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    )
  }
}
