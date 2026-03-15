import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { logger } from '@/app/lib/utils/logger'

export const dynamic = 'force-dynamic'

export async function GET() {
	try {
		const supabase = await createSupabaseServerClient()
		const { data: { user }, error: authError } = await supabase.auth.getUser()

		// 토큰 만료 또는 유효하지 않은 경우
		if (authError) {
			const isExpired = authError.message.includes('expired') || authError.message.includes('invalid')
			if (isExpired) {
				return NextResponse.json(
					{ error: 'TOKEN_EXPIRED', message: '세션이 만료되었습니다. 다시 로그인해주세요.' },
					{ status: 401 }
				)
			}
			return NextResponse.json({ error: 'unauthorized', message: authError.message }, { status: 401 })
		}

		if (!user) {
			return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
		}

		const { data, error } = await supabase
			.from('users')
			.select('id, approved, name, email')
			.eq('id', user.id)
			.maybeSingle()

		if (error) {
			logger.error('Database error in /api/user/me', error, 'UserMeAPI')
			// RLS/권한 오류는 401로 처리 (클라이언트에서 로그인 유도)
			const isAuthRelated = ['PGRST301', '42501', '42P01'].includes(error.code ?? '')
			return NextResponse.json(
				{ error: error.message, code: error.code },
				{ status: isAuthRelated ? 401 : 500 }
			)
		}

		if (!data) {
			// Auth에는 있지만 User 테이블에 없는 경우 (회원가입 미완료 등)
			return NextResponse.json({ error: 'USER_NOT_FOUND', message: '사용자 정보를 찾을 수 없습니다.' }, { status: 404 })
		}

		return NextResponse.json({ profile: data })
	} catch (e: unknown) {
		logger.error('API /api/user/me error', e, 'UserMeAPI')
		const message = e instanceof Error ? e.message : 'unknown error'
		const isConfigError = message.includes('환경변수') || message.includes('environment')
		return NextResponse.json(
			{ error: message },
			{ status: isConfigError ? 503 : 500 }
		)
	}
}

export async function PUT(request: NextRequest) {
	try {
		const supabase = await createSupabaseServerClient()
		const { data: { user }, error: authError } = await supabase.auth.getUser()

		if (authError || !user) {
			return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
		}

		const body = await request.json()
		const updates: { name?: string; email?: string; phone?: string | null } = {}
		if (typeof body.name === 'string') updates.name = body.name
		if (typeof body.email === 'string') updates.email = body.email
		if (body.phone !== undefined) updates.phone = body.phone ?? null

		if (Object.keys(updates).length === 0) {
			return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
		}

		const { error } = await supabase
			.from('users')
			.update(updates)
			.eq('id', user.id)

		if (error) {
			logger.error('Database error in PUT /api/user/me', error, 'UserMeAPI')
			return NextResponse.json({ error: error.message }, { status: 500 })
		}

		return NextResponse.json({ success: true })
	} catch (e: unknown) {
		logger.error('API /api/user/me error', e, 'UserMeAPI')
		// 환경변수 누락 등 초기화 실패는 503
		const message = e instanceof Error ? e.message : 'unknown error'
		const isConfigError = message.includes('환경변수') || message.includes('environment')
		return NextResponse.json(
			{ error: message },
			{ status: isConfigError ? 503 : 500 }
		)
	}
}

