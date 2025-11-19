import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * POST /api/auth/biometric/remove
 * 생체 인증 등록 해제
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await req.json()

    if (!userId || userId !== user.id) {
      return NextResponse.json({ error: 'Invalid userId' }, { status: 403 })
    }

    const { error } = await supabase
      .from('biometric_credentials')
      .delete()
      .eq('owner_id', userId)

    if (error) {
      console.error('Biometric remove error:', error)
      return NextResponse.json({ error: 'Failed to remove credentials' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Biometric remove error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

