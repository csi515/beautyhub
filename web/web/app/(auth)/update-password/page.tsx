'use client'

export const dynamic = 'force-dynamic'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function UpdatePasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [supabase, setSupabase] = useState<any>(null)
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)

  useEffect(() => {
    const init = async () => {
      if (typeof window === 'undefined') return
      try {
        const { createSupabaseBrowserClient } = await import('@/lib/supabase/client')
        const client = createSupabaseBrowserClient()
        setSupabase(client)

        // URL에서 code 파라미터 확인
        const code = searchParams.get('code')
        if (code) {
          // code를 사용하여 세션 교환 시도
          try {
            const { data, error: exchangeError } = await client.auth.exchangeCodeForSession(code)
            if (exchangeError) {
              console.error('세션 교환 오류:', exchangeError)
              setError('비밀번호 재설정 링크가 유효하지 않거나 만료되었습니다. 다시 요청해주세요.')
            } else if (data.session) {
              setSessionReady(true)
              setInfo('비밀번호를 재설정할 수 있습니다.')
            }
          } catch (exchangeError: any) {
            console.error('세션 교환 예외:', exchangeError)
            setError('세션 복원 중 오류가 발생했습니다.')
          }
        } else {
          // code가 없으면 현재 세션 확인 (이미 로그인된 경우)
          const { data: { session } } = await client.auth.getSession()
          if (session) {
            setSessionReady(true)
          } else {
            setError('비밀번호 재설정 링크가 필요합니다. 이메일에서 링크를 클릭해주세요.')
          }
        }
      } catch (error) {
        console.error('Supabase 초기화 오류:', error)
        setError('환경설정 오류: Supabase 초기화에 실패했습니다.')
      }
    }
    init()
  }, [searchParams])

  const changePassword = async () => {
    if (!supabase || !sessionReady) {
      setError('세션이 준비되지 않았습니다. 링크를 다시 확인해주세요.')
      return
    }
    if (newPassword.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.')
      return
    }
    setError(''); setInfo(''); setBusy(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) {
        setError(error.message)
        setBusy(false)
        return
      }
      setInfo('비밀번호가 변경되었습니다. 잠시 후 로그인 페이지로 이동합니다.')
      setTimeout(() => router.push('/login'), 1200)
    } catch (err: any) {
      setError(err?.message || '비밀번호 변경 중 오류가 발생했습니다.')
      setBusy(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--brand-50)] via-white to-[var(--champagne-100)] px-4">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow rounded-lg p-6 space-y-5 border border-[var(--brand-100)]">
        <h1 className="text-2xl font-bold text-gray-900">비밀번호 변경</h1>
        {!sessionReady && !error && (
          <p className="text-sm text-gray-600">세션을 확인하는 중...</p>
        )}
        <input
          type="password"
          value={newPassword}
          onChange={e=>setNewPassword(e.target.value)}
          placeholder="새 비밀번호 (최소 6자)"
          disabled={!sessionReady || busy}
          className="w-full border rounded-md px-3 py-2 focus:outline-none focus:border-[var(--brand-500)] focus:ring-2 focus:ring-[color:rgba(255,107,138,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          onClick={changePassword}
          disabled={busy || newPassword.length < 6 || !supabase || !sessionReady}
          className="w-full bg-[var(--brand-500)] text-white py-2 rounded-md hover:bg-[var(--brand-600)] disabled:opacity-60 disabled:cursor-not-allowed"
        >{busy ? '처리 중...' : '비밀번호 변경하기'}</button>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {info && <p className="text-sm text-green-700">{info}</p>}
      </div>
    </main>
  )
}

export default function UpdatePasswordPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--brand-50)] via-white to-[var(--champagne-100)] px-4">
        <div className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow rounded-lg p-6 space-y-5 border border-[var(--brand-100)]">
          <h1 className="text-2xl font-bold text-gray-900">비밀번호 변경</h1>
          <p className="text-sm text-gray-600">로딩 중...</p>
        </div>
      </main>
    }>
      <UpdatePasswordContent />
    </Suspense>
  )
}


