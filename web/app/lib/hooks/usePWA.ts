/**
 * PWA 관련 훅
 * standalone 모드, iOS/Android 감지, PWA 설치 상태 등을 제공
 */

'use client'

import { useState, useEffect } from 'react'

export interface PWAState {
  isStandalone: boolean
  isIOS: boolean
  isAndroid: boolean
  isInstalled: boolean
  canInstall: boolean
  installPrompt: BeforeInstallPromptEvent | null
}

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/**
 * PWA 상태를 감지하는 훅
 */
export function usePWA(): PWAState {
  const [isStandalone, setIsStandalone] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [canInstall, setCanInstall] = useState(false)
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Standalone 모드 감지
    const checkStandalone = () => {
      // display-mode: standalone 감지
      const standaloneMediaQuery = window.matchMedia('(display-mode: standalone)')
      const isStandaloneMode = standaloneMediaQuery.matches

      // iOS Safari standalone 모드 감지
      const isIOSStandalone = (window.navigator as any).standalone === true

      // Android Chrome standalone 모드 감지
      const isAndroidStandalone = document.referrer.includes('android-app://')

      return isStandaloneMode || isIOSStandalone || isAndroidStandalone
    }

    // iOS/Android 감지
    const userAgent = navigator.userAgent
    const detectedIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream
    const detectedAndroid = /Android/.test(userAgent)

    setIsStandalone(checkStandalone())
    setIsIOS(detectedIOS)
    setIsAndroid(detectedAndroid)
    setIsInstalled(checkStandalone())

    // PWA 설치 프롬프트 감지
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
      setCanInstall(true)
    }

    // 설치 완료 감지
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setCanInstall(false)
      setInstallPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // 초기 상태 확인
    if (checkStandalone()) {
      setIsInstalled(true)
      setCanInstall(false)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  return {
    isStandalone,
    isIOS,
    isAndroid,
    isInstalled,
    canInstall,
    installPrompt,
  }
}

/**
 * PWA 설치를 트리거하는 함수
 */
export function usePWAInstall() {
  const { installPrompt, canInstall } = usePWA()

  const install = async (): Promise<boolean> => {
    if (!installPrompt || !canInstall) {
      return false
    }

    try {
      await installPrompt.prompt()
      const choiceResult = await installPrompt.userChoice
      return choiceResult.outcome === 'accepted'
    } catch (error) {
      console.error('PWA 설치 실패:', error)
      return false
    }
  }

  return { install, canInstall }
}
