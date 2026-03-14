import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseServerAdmin } from '@/lib/supabase/server-admin'

export const dynamic = 'force-dynamic'

export async function POST() {
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

		const email = user.email ?? (user.user_metadata as Record<string, unknown>)?.['email']
		if (!email || typeof email !== 'string') {
			return NextResponse.json(
				{ error: 'MISSING_EMAIL', message: '이메일 정보가 없습니다.' },
				{ status: 400 }
			)
		}

		const admin = createSupabaseServerAdmin()
		const payload = {
			id: user.id,
			email,
			name: (user.user_metadata as Record<string, unknown>)['name'] ?? null,
			phone: (user.user_metadata as Record<string, unknown>)['phone'] ?? null,
			birthdate: (user.user_metadata as Record<string, unknown>)['birthdate'] ?? null,
			approved: true,
			role: 'user',
		}
		// upsert: 존재하면 무시, 없으면 생성 (race condition 방지)
		const { error } = await admin
			.from('users')
			.upsert(payload, { onConflict: 'id', ignoreDuplicates: true })
		if (error) {
			console.error('api/user/ensure upsert error:', error)
			return NextResponse.json({ error: error.message }, { status: 400 })
		}
		return NextResponse.json({ ok: true })
	} catch (e: unknown) {
		const message = e instanceof Error ? e.message : 'unknown error'
		return NextResponse.json({ error: message }, { status: 500 })
	}
}


