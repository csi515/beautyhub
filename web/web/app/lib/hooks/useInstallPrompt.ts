'use client'

import { useState, useEffect, useCallback } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type DeviceType = 'mobile' | 'desktop' | 'tablet'
type PlatformType = 'ios' | 'android' | 'other'

interface UseInstallPromptReturn {
  isInstallable: boolean
  isInstalled: boolean
  deviceType: DeviceType
  platformType: PlatformType
  promptInstall: () => Promise<boolean>
  shouldShowPrompt: boolean
}

/**
 * PWA 설치 프롬프트를 관리하는 hook
 * - beforeinstallprompt 이벤트 감지
 * - iOS Safari 대응
 * - 데스크탑 환경 감지
 */
export function useInstallPrompt(): UseInstallPromptReturn {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop')
  const [platformType, setPlatformType] = useState<PlatformType>('other')

  // 디바이스 타입 및 플랫폼 감지
  useEffect(() => {
    if (typeof window === 'undefined') return

    const detectDevice = () => {
      const ua = navigator.userAgent.toLowerCase()
      const isIOS = /iphone|ipad|ipod/.test(ua)
      const isAndroid = /android/.test(ua)
      const isTablet = /tablet|ipad/.test(ua) || (isAndroid && /mobile/.test(ua) === false)

      if (isIOS) {
        setPlatformType('ios')
        setDeviceType(isTablet ? 'tablet' : 'mobile')
      } else if (isAndroid) {
        setPlatformType('android')
        setDeviceType(isTablet ? 'tablet' : 'mobile')
      } else {
        setPlatformType('other')
        setDeviceType('desktop')
      }
    }

    detectDevice()

    // 이미 설치되었는지 확인
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isInWebAppiOS = (window.navigator as { standalone?: boolean }).standalone === true
    const isInWebAppChrome = window.matchMedia('(display-mode: standalone)').matches

    if (isStandalone || isInWebAppiOS || isInWebAppChrome) {
      setIsInstalled(true)
      return
    }

    // beforeinstallprompt 이벤트 리스너 (Android Chrome 등)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    // appinstalled 이벤트 리스너 (설치 완료 감지)
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false
    }

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      setDeferredPrompt(null)
      setIsInstallable(false)
      
      return outcome === 'accepted'
    } catch (error) {
      console.error('설치 프롬프트 오류:', error)
      return false
    }
  }, [deferredPrompt])

  // 프롬프트 표시 여부 결정
  // - 모바일/태블릿만 표시
  // - 데스크탑은 제외
  // - 이미 설치된 경우 제외
  const shouldShowPrompt = 
    !isInstalled && 
    isInstallable && 
    (deviceType === 'mobile' || deviceType === 'tablet')

  return {
    isInstallable,
    isInstalled,
    deviceType,
    platformType,
    promptInstall,
    shouldShowPrompt,
  }
}
