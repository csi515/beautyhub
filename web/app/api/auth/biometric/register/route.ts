import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

/**
 * POST /api/auth/biometric/register
 * WebAuthn 등록을 위한 challenge 생성
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, username } = await req.json()

    if (!userId || !username) {
      return NextResponse.json({ error: 'userId and username required' }, { status: 400 })
    }

    // Challenge 생성 (32바이트 랜덤)
    const challenge = crypto.randomBytes(32).toString('base64')

    // Challenge를 세션에 임시 저장 (실제로는 Redis 등 사용 권장)
    // 여기서는 간단히 쿠키에 저장
    const response = NextResponse.json({
      challenge,
      rp: {
        name: '여우스킨 CRM',
        id: process.env['NEXT_PUBLIC_SITE_URL']?.replace(/^https?:\/\//, '') || 'localhost',
      },
      user: {
        id: Buffer.from(userId).toString('base64'),
        name: username,
        displayName: username,
      },
    })

    // Challenge를 쿠키에 저장 (5분 유효)
    response.cookies.set(`webauthn_challenge_${userId}`, challenge, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 300, // 5분
    })

    return response
  } catch (error) {
    console.error('Biometric register error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

