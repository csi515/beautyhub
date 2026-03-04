import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getUserIdFromCookies } from '@/lib/auth/user'
import { ConsultationNotesRepository } from '@/app/lib/repositories/consultation-notes.repository'
import type { ConsultationNoteCreateInput } from '@/types/entities'

/**
 * GET /api/customers/[id]/consultation-notes
 * 고객 상담 일지 목록 조회
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
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const orderBy = searchParams.get('orderBy') || 'note_date'
    const ascending = searchParams.get('ascending') === 'true'

    const repository = new ConsultationNotesRepository(userId, supabase)
    const notes = await repository.findByCustomerId(customerId, {
      limit,
      offset,
      orderBy,
      ascending,
    })

    return NextResponse.json(notes)
  } catch (error) {
    console.error('Error fetching consultation notes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch consultation notes' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/customers/[id]/consultation-notes
 * 고객 상담 일지 생성
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
    const body = await request.json()
    const input: ConsultationNoteCreateInput = {
      customer_id: customerId,
      appointment_id: body.appointment_id || null,
      note_date: body.note_date,
      content: body.content,
    }

    const repository = new ConsultationNotesRepository(userId, supabase)
    const note = await repository.createNote(input)

    return NextResponse.json(note, { status: 201 })
  } catch (error) {
    console.error('Error creating consultation note:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to create consultation note'
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    )
  }
}
