import { cookies } from 'next/headers'
import { getServerUser } from '@/lib/supabase/server'

export async function getUserIdFromCookies(): Promise<string | null> {
  try {
    const cookieStore = await cookies()

    // 데모 모드 확인 (실제 인증 우회가 허용된 특별 모드)
    if (cookieStore.get('demo_mode')?.value === 'true') {
      return 'demo-user'
    }

    // Supabase 서버에서 토큰을 검증하여 사용자 조회
    const { user, error } = await getServerUser()
    if (error || !user) {
      return null
    }

    return user.id
  } catch {
    return null
  }
}

