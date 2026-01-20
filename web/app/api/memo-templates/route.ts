import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromCookies } from '@/lib/auth/user'
import { z } from 'zod'

const memoTemplateSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1),
  category: z.string().optional(),
})

/**
 * GET /api/memo-templates
 * 메모 템플릿 목록 조회
 */
export async function GET(_request: NextRequest) {
  try {
    const userId = await getUserIdFromCookies()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 현재는 로컬 스토리지 기반이지만, 향후 DB 테이블로 확장 가능
    // 임시로 빈 배열 반환 (클라이언트에서 로컬 스토리지 사용)
    return NextResponse.json({ templates: [] })
  } catch (error) {
    console.error('메모 템플릿 조회 실패:', error)
    return NextResponse.json(
      { error: 'Failed to fetch memo templates', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/memo-templates
 * 메모 템플릿 생성
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromCookies()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const json = await request.json()
    const body = memoTemplateSchema.parse(json)

    // 현재는 로컬 스토리지 기반이지만, 향후 DB 테이블로 확장 가능
    const template = {
      id: crypto.randomUUID(),
      owner_id: userId,
      title: body.title,
      content: body.content,
      category: body.category || 'general',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    return NextResponse.json({ template })
  } catch (error) {
    console.error('메모 템플릿 생성 실패:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Failed to create memo template', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
