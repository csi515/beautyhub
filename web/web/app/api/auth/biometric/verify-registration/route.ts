import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * POST /api/auth/biometric/verify-registration
 * WebAuthn 등록 검증 및 저장
 * 
 * 실제 프로덕션에서는 @simplewebauthn/server 같은 라이브러리 사용 권장
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const registrationData = await req.json()

    // Challenge 검증 (쿠키에서 가져오기)
    const challengeCookie = req.cookies.get(`webauthn_challenge_${user.id}`)
    if (!challengeCookie) {
      return NextResponse.json({ error: 'Challenge expired' }, { status: 400 })
    }

    // 실제 프로덕션에서는 여기서 attestation 검증을 수행해야 함
    // @simplewebauthn/server 라이브러리 사용 권장
    
    // 등록 정보를 데이터베이스에 저장
    const { error: dbError } = await supabase
      .from('biometric_credentials')
      .upsert({
        owner_id: user.id,
        credential_id: registrationData.id,
        public_key: JSON.stringify(registrationData.response),
        counter: 0,
        created_at: new Date().toISOString(),
      }, {
        onConflict: 'owner_id,credential_id',
      })

    if (dbError) {
      console.error('Biometric credential save error:', dbError)
      return NextResponse.json({ error: 'Failed to save credential' }, { status: 500 })
    }

    // Challenge 쿠키 삭제
    const response = NextResponse.json({ success: true })
    response.cookies.delete(`webauthn_challenge_${user.id}`)

    return response
  } catch (error) {
    console.error('Biometric verify registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

