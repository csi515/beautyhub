import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

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
			console.error('Database error in /api/user/me:', error)
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
		console.error('API /api/user/me error:', e)
		// 환경변수 누락 등 초기화 실패는 503
		const message = e instanceof Error ? e.message : 'unknown error'
		const isConfigError = message.includes('환경변수') || message.includes('environment')
		return NextResponse.json(
			{ error: message },
			{ status: isConfigError ? 503 : 500 }
		)
	}
}

