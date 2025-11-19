'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  isBiometricSupported,
  isPlatformAuthenticatorAvailable,
  registerBiometric,
  authenticateBiometric,
  isBiometricRegistered,
  removeBiometric,
  type BiometricAuthOptions,
} from '../utils/biometric'

export interface UseBiometricReturn {
  supported: boolean
  available: boolean
  registered: boolean
  loading: boolean
  error: string | null
  register: (options: BiometricAuthOptions) => Promise<void>
  authenticate: (userId: string) => Promise<{ token: string }>
  checkRegistered: (userId: string) => Promise<void>
  remove: (userId: string) => Promise<void>
}

/**
 * 생체 인증 훅
 */
export function useBiometric(): UseBiometricReturn {
  const [supported, setSupported] = useState(false)
  const [available, setAvailable] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkSupport = async () => {
      const isSupported = isBiometricSupported()
      setSupported(isSupported)

      if (isSupported) {
        const isAvailable = await isPlatformAuthenticatorAvailable()
        setAvailable(isAvailable)
      }
    }

    checkSupport()
  }, [])

  const register = useCallback(async (options: BiometricAuthOptions) => {
    try {
      setLoading(true)
      setError(null)
      await registerBiometric(options)
      setRegistered(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : '생체 인증 등록에 실패했습니다.'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const authenticate = useCallback(async (userId: string) => {
    try {
      setLoading(true)
      setError(null)
      const result = await authenticateBiometric(userId)
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : '생체 인증에 실패했습니다.'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const checkRegistered = useCallback(async (userId: string) => {
    try {
      setLoading(true)
      setError(null)
      const isReg = await isBiometricRegistered(userId)
      setRegistered(isReg)
    } catch (err) {
      const message = err instanceof Error ? err.message : '등록 여부 확인에 실패했습니다.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const remove = useCallback(async (userId: string) => {
    try {
      setLoading(true)
      setError(null)
      await removeBiometric(userId)
      setRegistered(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : '생체 인증 해제에 실패했습니다.'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    supported,
    available,
    registered,
    loading,
    error,
    register,
    authenticate,
    checkRegistered,
    remove,
  }
}

