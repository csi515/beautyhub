'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Landing from './components/Landing'

/**
 * 홈페이지 클라이언트 컴포넌트
 * 비밀번호 재설정 code 파라미터를 감지하고 리디렉션
 */
function HomePage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // 비밀번호 재설정 code 파라미터 체크
    const code = searchParams.get('code')
    const type = searchParams.get('type')

    // Supabase 비밀번호 재설정 플로우
    if (code) {
      // type이 명시되지 않았거나 recovery인 경우
      if (!type || type === 'recovery') {
        router.push(`/reset-password?code=${code}`)
        return
      }
    }
  }, [searchParams, router])

  return <Landing />
}

export default HomePage
