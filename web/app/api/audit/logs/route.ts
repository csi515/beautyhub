import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getUserIdFromCookies } from '@/lib/auth/user'
import { AuditLogsRepository } from '@/app/lib/repositories/audit-logs.repository'
import { z } from 'zod'

const auditLogSchema = z.object({
  action_type: z.enum(['create', 'update', 'delete', 'view', 'export', 'login', 'logout', 'backup', 'restore']),
  resource_type: z.string(),
  resource_id: z.string().uuid().optional().nullable(),
  old_data: z.any().optional().nullable(),
  new_data: z.any().optional().nullable(),
  description: z.string().optional().nullable(),
  user_id: z.string().uuid().optional().nullable(),
})

/**
 * POST /api/audit/logs
 * 감사 로그 생성
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const userId = await getUserIdFromCookies()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const json = await request.json()
    const body = auditLogSchema.parse(json)

    // IP 주소 가져오기
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    const auditLogsRepo = new AuditLogsRepository(userId, supabase)
    
    const log = await auditLogsRepo.create({
      owner_id: userId,
      user_id: body.user_id || userId,
      action_type: body.action_type,
      resource_type: body.resource_type as any,
      resource_id: body.resource_id || null,
      old_data: body.old_data || null,
      new_data: body.new_data || null,
      description: body.description || null,
      ip_address: ipAddress,
      user_agent: userAgent,
    } as any)

    return NextResponse.json({ log })
  } catch (error) {
    console.error('감사 로그 생성 실패:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Failed to create audit log', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/audit/logs
 * 감사 로그 조회
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const userId = await getUserIdFromCookies()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const actionType = searchParams.get('action_type')
    const resourceType = searchParams.get('resource_type')
    const resourceId = searchParams.get('resource_id')
    const userIdFilter = searchParams.get('user_id')
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const auditLogsRepo = new AuditLogsRepository(userId, supabase)
    const logs = await auditLogsRepo.findAll({
      action_type: actionType || undefined,
      resource_type: resourceType || undefined,
      resource_id: resourceId || undefined,
      user_id: userIdFilter || undefined,
      from: from || undefined,
      to: to || undefined,
      limit,
      offset,
    })

    return NextResponse.json({ logs })
  } catch (error) {
    console.error('감사 로그 조회 실패:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audit logs', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
