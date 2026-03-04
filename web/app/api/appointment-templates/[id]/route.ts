import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getUserIdFromCookies } from '@/lib/auth/user'
import { AppointmentTemplatesRepository } from '@/app/lib/repositories/appointment-templates.repository'
import type { AppointmentTemplateUpdateInput } from '@/types/entities'

/**
 * PATCH /api/appointment-templates/[id]
 * 예약 템플릿 수정
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createSupabaseServerClient()
    const userId = await getUserIdFromCookies()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const templateId = params.id
    const body = await request.json()
    const input: AppointmentTemplateUpdateInput = {
      name: body.name,
      service_id: body.service_id,
      duration_minutes: body.duration_minutes,
      default_price: body.default_price,
      default_notes: body.default_notes,
    }

    const repository = new AppointmentTemplatesRepository(userId, supabase)
    const template = await repository.updateTemplate(templateId, input)

    return NextResponse.json(template)
  } catch (error) {
    console.error('Error updating appointment template:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to update appointment template'
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    )
  }
}

/**
 * DELETE /api/appointment-templates/[id]
 * 예약 템플릿 삭제
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createSupabaseServerClient()
    const userId = await getUserIdFromCookies()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const templateId = params.id
    const repository = new AppointmentTemplatesRepository(userId, supabase)
    await repository.delete(templateId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting appointment template:', error)
    return NextResponse.json(
      { error: 'Failed to delete appointment template' },
      { status: 500 }
    )
  }
}
