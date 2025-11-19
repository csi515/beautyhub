'use client'

export const dynamic = 'force-dynamic'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Mail, Lock, Eye, EyeOff, Fingerprint } from 'lucide-react'
import Button from '@/app/components/ui/Button'
import Input from '@/app/components/ui/Input'
import Modal, { ModalBody, ModalFooter, ModalHeader } from '@/app/components/ui/Modal'
import Alert from '@/app/components/ui/Alert'
import { useAppToast } from '@/app/lib/ui/toast'
import { useBiometric } from '@/app/lib/hooks/useBiometric'
import BiometricConsentModal from '@/app/components/biometric/BiometricConsentModal'

function LoginInner() {
  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get('redirect') || '/dashboard'

  const [authApi, setAuthApi] = useState<Awaited<ReturnType<typeof import('@/app/lib/api/auth').getAuthApi>> | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [info, setInfo] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [remember, setRemember] = useState(true)
  const [infoModalOpen, setInfoModalOpen] = useState(false)
  const [consentModalOpen, setConsentModalOpen] = useState(false)
  const [biometricAttempts, setBiometricAttempts] = useState(0)
  const toast = useAppToast()
  const biometric = useBiometric()

  useEffect(() => {
    const init = async () => {
      if (typeof window === 'undefined') return
      try {
        const { getAuthApi } = await import('@/app/lib/api/auth')
        const api = await getAuthApi()
        setAuthApi(api)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Supabase 환경변수가 설정되지 않았습니다. 관리자에게 문의하세요.'
        setError(errorMessage)
      }
    }
    init()
  }, [])
  
  // 생체 인증 등록 상태 확인 (이메일 입력 시)
  useEffect(() => {
    if (!email || !biometric.supported || !biometric.available) return
    
    const checkRegistration = async () => {
      try {
        // 이메일로는 사용자 ID를 알 수 없으므로, 로그인 성공 후에만 확인 가능
        // 여기서는 단순히 지원 여부만 확인
        const lastEmail = localStorage.getItem('lastLoginEmail')
        if (lastEmail === email) {
          // 마지막 로그인 이메일과 일치하면 등록 여부 확인 시도
          // 실제로는 서버에서 사용자 ID를 가져와야 하지만, 여기서는 생략
        }
      } catch {
        // 조용히 실패 처리
      }
    }
    
    checkRegistration()
  }, [email, biometric.supported, biometric.available])
  
  const handleBiometricLogin = useCallback(async (token: string) => {
    if (!authApi) return
    try {
      setBusy(true)
      setError('')
      
      // 토큰으로 세션 설정
      await authApi.setSession({
        access_token: token,
        refresh_token: '',
        expires_in: 3600,
      }, remember)
      
      toast.success('생체 인증 로그인 성공')
      router.push(redirect || '/dashboard')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '생체 인증 로그인에 실패했습니다.'
      setError(errorMessage)
    } finally {
      setBusy(false)
    }
  }, [authApi, remember, toast, router, redirect])

  // 생체 인증 자동 시도 (등록된 경우)
  useEffect(() => {
    if (!biometric.registered || !biometric.available || busy || !email) return
    
    let cancelled = false
    
    const tryBiometric = async () => {
      try {
        const { token } = await biometric.authenticate(email)
        if (!cancelled) {
          await handleBiometricLogin(token)
        }
      } catch (err) {
        if (cancelled) return
        
        const newAttempts = biometricAttempts + 1
        setBiometricAttempts(newAttempts)
        if (newAttempts >= 3) {
          toast.error('생체 인증이 3회 실패했습니다. 비밀번호로 로그인해주세요.')
          try {
            await biometric.remove(email)
          } catch {
            // 조용히 실패 처리
          }
        }
      }
    }
    
    // 약간의 지연 후 시도 (UI 렌더링 완료 후)
    const timer = setTimeout(tryBiometric, 500)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [biometric.registered, biometric.available, email, busy, biometricAttempts, biometric, toast, handleBiometricLogin])

  const signIn = async () => {
    if (!authApi) { setError('환경설정 오류: 인증 API 초기화에 실패했습니다.'); return }
    const trimmedEmail = email.trim()
    const isEmailValid = /.+@.+\..+/.test(trimmedEmail)
    const isPwValid = password.length >= 6
    if (!isEmailValid || !isPwValid) {
      setError(!isEmailValid ? '유효한 이메일을 입력하세요.' : '비밀번호는 6자 이상이어야 합니다.')
      return
    }
    setError(''); setInfo(''); setBusy(true)
    try {
      const { user, session } = await authApi.login({ email: trimmedEmail, password })
      
      // 프로필 생성/확인
      try {
        await authApi.ensureProfile()
      } catch {
        // 프로필 생성 실패는 무시 (이미 존재할 수 있음)
      }

      // 승인 여부 확인
      const profile = await authApi.checkApproval(user.id)
      if (!profile?.approved) {
        await authApi.logout()
        setError('관리자 승인 후 로그인할 수 있습니다.')
        setBusy(false)
        return
      }

      // 세션 토큰을 쿠키에 저장하여 미들웨어 통과 보장
      await authApi.setSession(
        {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_in: session.expires_in,
        },
        remember
      )

      // 마지막 로그인 이메일 저장
      localStorage.setItem('lastLoginEmail', trimmedEmail)
      
      toast.success('로그인 성공')
      
      // 생체 인증 등록 제안 (동의 모달 표시)
      if (biometric.supported && biometric.available && !biometric.registered) {
        setConsentModalOpen(true)
      } else {
        router.push(redirect || '/dashboard')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '로그인 중 오류가 발생했습니다.'
      setError(errorMessage)
    } finally {
      setBusy(false)
    }
  }

  const handleBiometricConsent = async () => {
    if (!authApi || !email) return
    
    try {
      setConsentModalOpen(false)
      setBusy(true)
      
      // 사용자 정보 가져오기
      const { getAuthApi } = await import('@/app/lib/api/auth')
      const api = await getAuthApi()
      const profile = await api.getCurrentUserProfile()
      
      if (!profile) {
        throw new Error('사용자 정보를 가져올 수 없습니다.')
      }
      
      // 생체 인증 등록
      await biometric.register({
        userId: profile.id,
        username: email,
        displayName: profile.name || email,
      })
      
      toast.success('생체 인증이 활성화되었습니다.')
      router.push(redirect || '/dashboard')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '생체 인증 등록에 실패했습니다.'
      setError(errorMessage)
      toast.error('생체 인증 등록 실패', errorMessage)
    } finally {
      setBusy(false)
    }
  }

  const handleBiometricLoginClick = async () => {
    if (!email) {
      setError('이메일을 먼저 입력해주세요.')
      return
    }
    
    try {
      setBusy(true)
      setError('')
      const { token } = await biometric.authenticate(email)
      await handleBiometricLogin(token)
    } catch (err) {
      const newAttempts = biometricAttempts + 1
      setBiometricAttempts(newAttempts)
      const errorMessage = err instanceof Error ? err.message : '생체 인증에 실패했습니다.'
      setError(errorMessage)
      
      if (newAttempts >= 3) {
        toast.error('생체 인증이 3회 실패했습니다. 비밀번호로 로그인해주세요.')
        await biometric.remove(email)
      }
    } finally {
      setBusy(false)
    }
  }

  const isEmailInvalid = !!email && !/.+@.+\..+/.test(email)
  const isPasswordInvalid = !!password && password.length < 6
  const canSubmit = !busy && /.+@.+\..+/.test(email.trim()) && password.length >= 6

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <Image 
        src="/illustrations/welcome.svg" 
        alt="" 
        width={160} 
        height={160}
        className="pointer-events-none select-none absolute -top-6 right-4 opacity-70 hidden md:block" 
        priority
      />
      <div className="w-full max-w-md bg-white border border-neutral-200 rounded-2xl shadow-lg p-7">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-1">여우스킨 · 로그인</h1>
            <p className="text-sm text-neutral-500">CRM에 접속하려면 계정 정보를 입력하세요.</p>
          </div>

          {error && (
            <Alert variant="error" title={error} />
          )}
          {info && (
            <Alert variant="success" title={info} />
          )}

          <div className="space-y-4">
            <div>
              <Input
                label="이메일"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoFocus
                {...(isEmailInvalid ? { error: '유효한 이메일을 입력하세요.' } : {})}
                leftIcon={<Mail className="h-5 w-5 text-neutral-400" />}
              />
            </div>

            <div>
              <Input
                label="비밀번호"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호"
                onKeyDown={(e) => { if (e.key === 'Enter') signIn() }}
                {...(isPasswordInvalid ? { error: '비밀번호는 6자 이상이어야 합니다.' } : {})}
                leftIcon={<Lock className="h-5 w-5 text-neutral-400" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    aria-label={showPw ? '비밀번호 숨기기' : '비밀번호 보기'}
                    className="p-1 hover:bg-neutral-100 rounded-md transition-colors"
                  >
                    {showPw ? <EyeOff className="h-5 w-5 text-neutral-400" /> : <Eye className="h-5 w-5 text-neutral-400" />}
                  </button>
                }
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-300 text-action-blue-600 focus:ring-action-blue-500"
              />
              <span className="text-sm text-neutral-700">로그인 유지</span>
            </label>
            <button
              type="button"
              onClick={() => router.push('/forgot-password')}
              disabled={busy}
              className="text-sm text-action-blue-600 hover:text-action-blue-700 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              비밀번호를 잊으셨나요?
            </button>
          </div>

          {/* 생체 인증 버튼 (등록된 경우) */}
          {biometric.registered && biometric.available && (
            <Button
              variant="outline"
              onClick={handleBiometricLoginClick}
              loading={busy}
              disabled={busy}
              leftIcon={<Fingerprint className="h-5 w-5" />}
              className="w-full"
            >
              생체 인증으로 로그인
            </Button>
          )}

          <Button
            variant="primary"
            onClick={signIn}
            loading={busy}
            disabled={!canSubmit}
            className="w-full"
          >
            로그인
          </Button>

          <div className="space-y-2">
            <Button
              variant="ghost"
              onClick={() => router.push('/signup')}
              disabled={busy}
              className="w-full"
            >
              회원가입
            </Button>
            <button
              type="button"
              onClick={() => setInfoModalOpen(true)}
              className="w-full text-sm text-action-blue-600 hover:text-action-blue-700 hover:underline"
            >
              회원가입 절차는 어떻게 되나요?
            </button>
          </div>
        </div>
      </div>

      <Modal open={infoModalOpen} onClose={() => setInfoModalOpen(false)} size="md">
        <ModalHeader title="회원가입 절차 안내" />
        <ModalBody>
          <div className="space-y-3">
            <p className="text-base">1) 이름/전화번호/이메일/비밀번호/생년월일을 입력하여 회원가입</p>
            <p className="text-base">2) 관리자가 승인하면 로그인 가능 상태로 전환</p>
            <p className="text-base">3) 승인 완료 후 로그인하여 서비스를 이용하세요</p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setInfoModalOpen(false)}>닫기</Button>
          <Button variant="primary" onClick={() => { setInfoModalOpen(false); router.push('/signup') }}>지금 회원가입</Button>
        </ModalFooter>
      </Modal>

      {/* 생체 인증 동의 모달 */}
      <BiometricConsentModal
        open={consentModalOpen}
        onClose={() => {
          setConsentModalOpen(false)
          router.push(redirect || '/dashboard')
        }}
        onAccept={handleBiometricConsent}
      />
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="p-6"><p>로딩 중...</p></main>}>
      <LoginInner />
    </Suspense>
  )
}
