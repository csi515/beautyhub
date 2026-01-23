'use client'

/**
 * 비밀번호 재설정 플로우 훅
 * 토큰 파싱 + 세션 전환 + 쿠키 동기화 통합
 */

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface UsePasswordRecoveryFlowReturn {
  sessionReady: boolean
  error: string | null
  userEmail: string | null
  retry: () => void
}

/**
 * 비밀번호 재설정 플로우 훅
 * 
 * 기능:
 * - URL에서 `code` 파라미터 추출
 * - `exchangeCodeForSession` 호출
 * - 세션 생성 후 `/api/auth/session`으로 쿠키 동기화
 * - 에러 처리 및 사용자 안내
 * 
 * @param supabase Supabase 클라이언트 인스턴스
 * @returns sessionReady, error, userEmail, retry
 */
export function usePasswordRecoveryFlow(
  supabase: SupabaseClient | null
): UsePasswordRecoveryFlowReturn {
  const searchParams = useSearchParams()
  const [sessionReady, setSessionReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const processRecovery = useCallback(async () => {
    if (!supabase) {
      setError('환경설정 오류: Supabase 초기화에 실패했습니다.')
      return
    }

    setError(null)

    try {
      const code = searchParams.get('code')

      if (code) {
        // PKCE flow: code를 세션으로 교환
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

        if (exchangeError) {
          setError('재설정 링크가 만료되었거나 유효하지 않습니다. 다시 요청해주세요.')
          return
        }

        if (!data.session) {
          setError('세션 생성에 실패했습니다. 다시 요청해주세요.')
          return
        }

        // 세션을 쿠키에 동기화
        try {
          const response = await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
              expires_in: data.session.expires_in,
              remember: false,
            }),
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.message || '세션 동기화에 실패했습니다.')
          }
        } catch (syncError) {
          console.error('Session sync error:', syncError)
          // 쿠키 동기화 실패해도 세션은 생성되었으므로 계속 진행
          // 단, 사용자에게 경고 표시는 하지 않음 (자동 재시도 가능)
        }

        // 사용자 이메일 가져오기
        if (data.user?.email) {
          setUserEmail(data.user.email)
        }

        setSessionReady(true)
      } else {
        // code가 없으면 이미 세션이 있는지 확인
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

        if (sessionError || !sessionData.session) {
          setError('유효한 재설정 링크가 필요합니다.')
          return
        }

        // 기존 세션이 있으면 사용자 이메일 가져오기
        const { data: userData } = await supabase.auth.getUser()
        if (userData.user?.email) {
          setUserEmail(userData.user.email)
        }

        setSessionReady(true)
      }
    } catch (e: unknown) {
      console.error('Password recovery flow error:', e)
      const errorMessage = e instanceof Error ? e.message : '비밀번호 재설정 처리 중 오류가 발생했습니다.'
      setError(errorMessage)
    }
  }, [supabase, searchParams])

  const retry = useCallback(() => {
    setRetryCount((prev) => prev + 1)
    setError(null)
    setSessionReady(false)
  }, [])

  useEffect(() => {
    if (retryCount > 0 || (!sessionReady && !error)) {
      processRecovery()
    }
  }, [processRecovery, retryCount, sessionReady, error])

  return {
    sessionReady,
    error,
    userEmail,
    retry,
  }
}
