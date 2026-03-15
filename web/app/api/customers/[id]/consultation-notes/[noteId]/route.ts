import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getUserIdFromCookies } from '@/lib/auth/user'
import { ConsultationNotesRepository } from '@/app/lib/repositories/consultation-notes.repository'
import type { ConsultationNoteUpdateInput } from '@/types/entities'
import { logger } from '@/app/lib/utils/logger'

/**
 * PATCH /api/customers/[id]/consultation-notes/[noteId]
 * 고객 상담 일지 수정
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; noteId: string } }
) {
  try {
    const supabase = await createSupabaseServerClient()
    const userId = await getUserIdFromCookies()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const noteId = params.noteId
    const body = await request.json()
    const input: ConsultationNoteUpdateInput = {
      content: body.content,
      note_date: body.note_date,
      appointment_id: body.appointment_id,
    }

    const repository = new ConsultationNotesRepository(userId, supabase)
    const note = await repository.updateNote(noteId, input)

    return NextResponse.json(note)
  } catch (error) {
    logger.error('Error updating consultation note', error, 'ConsultationNote')
    const errorMessage = error instanceof Error ? error.message : 'Failed to update consultation note'
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    )
  }
}

/**
 * DELETE /api/customers/[id]/consultation-notes/[noteId]
 * 고객 상담 일지 삭제
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string; noteId: string } }
) {
  try {
    const supabase = await createSupabaseServerClient()
    const userId = await getUserIdFromCookies()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const noteId = params.noteId
    const repository = new ConsultationNotesRepository(userId, supabase)
    await repository.delete(noteId)

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Error deleting consultation note', error, 'ConsultationNote')
    return NextResponse.json(
      { error: 'Failed to delete consultation note' },
      { status: 500 }
    )
  }
}
