'use client'

export const dynamic = 'force-dynamic'

import { Suspense, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { SupabaseClient } from '@supabase/supabase-js'
import { Eye, EyeOff, CheckCircle, XCircle, AlertTriangle, Loader2, Shield } from 'lucide-react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Button from '@/app/components/ui/Button'
import Input from '@/app/components/ui/Input'
import Alert from '@/app/components/ui/Alert'
import { usePasswordRecoveryFlow } from '@/app/lib/hooks/usePasswordRecoveryFlow'
import { useResponsiveLayout } from '@/app/lib/hooks/useResponsiveLayout'

function ResetPasswordInner() {
  const router = useRouter()
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  const layout = useResponsiveLayout({
    spacing: { xs: 1.5, sm: 2, md: 2.5 },
    padding: { xs: 2, sm: 2.5, md: 3 },
  })

  // 비밀번호 재설정 플로우 훅 사용
  const { sessionReady, error: recoveryError, userEmail, retry } = usePasswordRecoveryFlow(supabase)

  // recoveryError를 로컬 error state와 동기화
  useEffect(() => {
    if (recoveryError) {
      setError(recoveryError)
    }
  }, [recoveryError])

  // 세션이 준비되면 사용자 이메일을 emailInput에 자동 설정
  useEffect(() => {
    if (sessionReady && userEmail && !emailInput) {
      setEmailInput(userEmail)
    }
  }, [sessionReady, userEmail, emailInput])

  useEffect(() => {
    const init = async () => {
      if (typeof window === 'undefined') return
      try {
        const { createSupabaseBrowserClient } = await import('@/lib/supabase/client')
        const client = createSupabaseBrowserClient()
        setSupabase(client)
      } catch (error) {
        console.error('Supabase 초기화 오류:', error)
        setError('환경설정 오류: Supabase 초기화에 실패했습니다.')
      }
    }
    init()
  }, [])

  // 비밀번호 강도 검증
  const getPasswordStrength = (password: string) => {
    let score = 0
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }

    score = Object.values(checks).filter(Boolean).length

    if (score <= 2) return { level: 'weak', color: 'error', label: '약함' }
    if (score <= 3) return { level: 'medium', color: 'warning', label: '보통' }
    return { level: 'strong', color: 'success', label: '강함' }
  }

  // 이메일 유효성 검증
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const changePassword = async () => {
    if (!supabase) return

    if (!emailInput.trim()) {
      setError('아이디(이메일)를 입력해주세요.')
      return
    }

    if (!isValidEmail(emailInput.trim())) {
      setError('올바른 이메일 형식을 입력해주세요.')
      return
    }

    if (userEmail && emailInput.trim() !== userEmail) {
      setError('입력한 이메일이 현재 인증된 계정과 일치하지 않습니다.')
      return
    }

    if (newPassword.length < 8) {
      setError('비밀번호는 최소 8자 이상이어야 합니다.')
      return
    }

    const strength = getPasswordStrength(newPassword)
    if (strength.level === 'weak') {
      setError('비밀번호가 너무 약합니다. 대문자, 소문자, 숫자, 특수문자를 포함해주세요.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    setError(''); setInfo(''); setBusy(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setBusy(false)

    if (error) {
      setError(error.message)
      return
    }

    setInfo('비밀번호가 변경되었습니다. 잠시 후 로그인 페이지로 이동합니다.')
    setTimeout(() => router.push('/login'), 1500)
  }

  if (!sessionReady && !error) {
    return (
      <Box
        component="main"
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          px: layout.paddingX as any,
          pt: layout.paddingTop,
          pb: layout.paddingBottom,
        }}
      >
        <Box sx={{ textAlign: 'center', space: 2 }}>
          <Box
            sx={{
              mx: 'auto',
              width: 48,
              height: 48,
              bgcolor: 'primary.50',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          </Box>
          <Box>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827', marginBottom: '0.5rem' }}>
              링크 확인 중
            </h2>
            <p style={{ color: '#6b7280', marginTop: '0.25rem' }}>
              비밀번호 재설정 링크의 유효성을 확인하고 있습니다...
            </p>
          </Box>
        </Box>
      </Box>
    )
  }

  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: layout.isMobile ? 'flex-start' : 'center',
        justifyContent: 'center',
        bgcolor: layout.isMobile ? 'background.default' : 'background.paper',
        background: layout.isMobile
          ? 'none'
          : 'linear-gradient(to bottom right, #eff6ff, #ffffff, #eef2ff)',
        px: layout.paddingX as any,
        pt: layout.isMobile ? layout.paddingTop : 0,
        pb: layout.isMobile ? layout.paddingBottom : 0,
        overflowY: 'auto',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: layout.isMobile ? '100%' : 448,
          bgcolor: 'background.paper',
          border: layout.isMobile ? 'none' : '1px solid',
          borderColor: 'divider',
          borderRadius: layout.isMobile ? 0 : 2,
          boxShadow: layout.isMobile ? 'none' : 3,
          p: layout.isMobile ? { xs: 3, sm: 4 } : 4,
          minHeight: layout.isMobile ? '100vh' : 'auto',
        }}
      >
        <Stack spacing={3}>
          <Box sx={{ textAlign: 'center' }}>
            <Box
              sx={{
                mx: 'auto',
                width: 64,
                height: 64,
                bgcolor: 'primary.50',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <Shield className="w-8 h-8 text-blue-600" />
            </Box>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>
              비밀번호 재설정
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
              안전한 새 비밀번호를 설정해주세요.
            </p>
          </Box>

          {error && (
            <Alert variant="error" title="오류" description={error} />
          )}
          {info && (
            <Alert variant="success" title="성공" description={info} />
          )}

          {sessionReady && (
            <>
              <Stack spacing={2.5}>
                <Box>
                  <Input
                    label="아이디 (이메일)"
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="가입된 이메일 주소"
                    disabled={busy}
                  />
                  {emailInput && !isValidEmail(emailInput) && (
                    <Box sx={{ fontSize: '0.75rem', color: 'error.main', mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <XCircle className="w-3 h-3" />
                      올바른 이메일 형식을 입력해주세요
                    </Box>
                  )}
                  {emailInput && isValidEmail(emailInput) && (
                    <Box sx={{ fontSize: '0.75rem', color: 'success.main', mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CheckCircle className="w-3 h-3" />
                      올바른 이메일 형식입니다
                    </Box>
                  )}
                </Box>

                <Box>
                  <Box sx={{ position: 'relative' }}>
                    <Input
                      label="새 비밀번호"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="대문자, 소문자, 숫자, 특수문자 포함 8자 이상"
                      disabled={busy}
                    />
                    <Box
                      component="button"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={busy}
                      sx={{
                        position: 'absolute',
                        right: 12,
                        top: 36,
                        color: 'text.secondary',
                        '&:hover': { color: 'text.primary' },
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        p: 0.5,
                        display: 'flex',
                        alignItems: 'center',
                        '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
                      }}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Box>
                  </Box>

                  {/* 비밀번호 강도 표시 */}
                  {newPassword && (
                    <Box sx={{ mt: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                        <Box component="span" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                          비밀번호 강도
                        </Box>
                        <Box
                          component="span"
                          sx={{
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            color:
                              getPasswordStrength(newPassword).level === 'strong'
                                ? 'success.main'
                                : getPasswordStrength(newPassword).level === 'medium'
                                ? 'warning.main'
                                : 'error.main',
                          }}
                        >
                          {getPasswordStrength(newPassword).label}
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {[1, 2, 3, 4, 5].map((level) => {
                          const strength = getPasswordStrength(newPassword)
                          const filled = level <= (strength.level === 'strong' ? 5 : strength.level === 'medium' ? 3 : 1)
                          return (
                            <Box
                              key={level}
                              sx={{
                                height: 4,
                                flex: 1,
                                borderRadius: '4px',
                                bgcolor: filled
                                  ? strength.level === 'strong'
                                    ? 'success.main'
                                    : strength.level === 'medium'
                                    ? 'warning.main'
                                    : 'error.main'
                                  : 'grey.200',
                              }}
                            />
                          )
                        })}
                      </Box>
                    </Box>
                  )}
                </Box>

                <Box>
                  <Box sx={{ position: 'relative' }}>
                    <Input
                      label="비밀번호 확인"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="비밀번호를 다시 입력하세요"
                      disabled={busy}
                    />
                    <Box
                      component="button"
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={busy}
                      sx={{
                        position: 'absolute',
                        right: 12,
                        top: 36,
                        color: 'text.secondary',
                        '&:hover': { color: 'text.primary' },
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        p: 0.5,
                        display: 'flex',
                        alignItems: 'center',
                        '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
                      }}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Box>
                  </Box>

                  {/* 비밀번호 일치 표시 */}
                  {confirmPassword && (
                    <Box
                      sx={{
                        fontSize: '0.75rem',
                        mt: 0.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        color: newPassword === confirmPassword ? 'success.main' : 'error.main',
                      }}
                    >
                      {newPassword === confirmPassword ? (
                        <>
                          <CheckCircle className="w-3 h-3" /> 비밀번호가 일치합니다
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" /> 비밀번호가 일치하지 않습니다
                        </>
                      )}
                    </Box>
                  )}
                </Box>
              </Stack>

              <Stack spacing={2}>
                <Button
                  variant="primary"
                  onClick={changePassword}
                  loading={busy}
                  disabled={
                    !supabase ||
                    !emailInput.trim() ||
                    !isValidEmail(emailInput.trim()) ||
                    newPassword.length < 8 ||
                    getPasswordStrength(newPassword).level === 'weak' ||
                    newPassword !== confirmPassword
                  }
                  className="w-full h-12 text-base font-semibold"
                >
                  {busy ? '비밀번호 변경 중...' : '비밀번호 변경하기'}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => router.push('/login')}
                  disabled={busy}
                  className="w-full"
                >
                  로그인으로 돌아가기
                </Button>
              </Stack>
            </>
          )}

          {!sessionReady && error && (
            <Box sx={{ textAlign: 'center', space: 2 }}>
              <Box
                sx={{
                  mx: 'auto',
                  width: 48,
                  height: 48,
                  bgcolor: 'error.50',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </Box>
              <Box sx={{ mb: 2 }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827', marginBottom: '0.5rem' }}>
                  링크가 유효하지 않습니다
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                  비밀번호 재설정 링크가 만료되었거나 이미 사용되었습니다.
                </p>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button variant="primary" onClick={retry} className="w-full">
                  다시 시도
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => router.push('/forgot-password')}
                  className="w-full"
                >
                  비밀번호 재설정 다시 요청하기
                </Button>
              </Box>
            </Box>
          )}
        </Stack>
      </Box>
    </Box>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <Box
          component="main"
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default',
          }}
        >
          <Box sx={{ textAlign: 'center', space: 2 }}>
            <Box
              sx={{
                mx: 'auto',
                width: 48,
                height: 48,
                bgcolor: 'primary.50',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            </Box>
            <p style={{ color: '#6b7280' }}>페이지 로딩 중...</p>
          </Box>
        </Box>
      }
    >
      <ResetPasswordInner />
    </Suspense>
  )
}
