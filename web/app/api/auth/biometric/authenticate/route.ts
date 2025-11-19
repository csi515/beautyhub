import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

/**
 * POST /api/auth/biometric/authenticate
 * WebAuthn 인증을 위한 challenge 생성
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    const supabase = createSupabaseServerClient()

    // 사용자의 등록된 자격증명 조회
    const { data: credentials, error } = await supabase
      .from('biometric_credentials')
      .select('credential_id')
      .eq('owner_id', userId)

    if (error || !credentials || credentials.length === 0) {
      return NextResponse.json({ error: 'No registered credentials' }, { status: 404 })
    }

    // Challenge 생성
    const challenge = crypto.randomBytes(32).toString('base64')

    const response = NextResponse.json({
      challenge,
      allowCredentials: credentials.map((cred) => ({
        id: cred.credential_id,
        type: 'public-key',
      })),
    })

    // Challenge를 쿠키에 저장
    response.cookies.set(`webauthn_challenge_${userId}`, challenge, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 300, // 5분
    })

    return response
  } catch (error) {
    console.error('Biometric authenticate error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

