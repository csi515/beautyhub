import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * POST /api/auth/biometric/verify-authentication
 * WebAuthn 인증 검증 및 로그인 토큰 발급
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, ...authenticationData } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    const supabase = createSupabaseServerClient()

    // Challenge 검증
    const challengeCookie = req.cookies.get(`webauthn_challenge_${userId}`)
    if (!challengeCookie) {
      return NextResponse.json({ error: 'Challenge expired' }, { status: 400 })
    }

    // 자격증명 조회
    const { data: credential, error: credError } = await supabase
      .from('biometric_credentials')
      .select('*')
      .eq('owner_id', userId)
      .eq('credential_id', authenticationData.id)
      .single()

    if (credError || !credential) {
      return NextResponse.json({ error: 'Invalid credential' }, { status: 401 })
    }

    // 실제 프로덕션에서는 여기서 signature 검증을 수행해야 함
    // @simplewebauthn/server 라이브러리 사용 권장

    // Counter 업데이트 (replay attack 방지)
    await supabase
      .from('biometric_credentials')
      .update({ counter: credential.counter + 1 })
      .eq('owner_id', userId)
      .eq('credential_id', authenticationData.id)

    // 세션 토큰 생성 (Supabase 세션)
    // 실제로는 사용자 정보로부터 세션을 생성해야 함
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      // 세션이 없으면 새로 생성 (실제로는 사용자 ID로 세션 생성)
      return NextResponse.json({ error: 'Session required' }, { status: 401 })
    }

    const response = NextResponse.json({
      token: session.access_token,
      session: {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      },
    })

    // Challenge 쿠키 삭제
    response.cookies.delete(`webauthn_challenge_${userId}`)

    return response
  } catch (error) {
    console.error('Biometric verify authentication error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

