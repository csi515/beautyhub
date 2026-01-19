'use client'

import { useState, useEffect } from 'react'
import { Download, X, Share2 } from 'lucide-react'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import { useInstallPrompt } from '@/app/lib/hooks/useInstallPrompt'

const STORAGE_KEY_DISMISSED = 'install-prompt-dismissed'
const STORAGE_KEY_EXPIRY = 'install-prompt-expiry'
const DISMISS_EXPIRY_DAYS = 7

/**
 * PWA 설치 프롬프트 컴포넌트
 * - 모바일/태블릿 환경에서만 표시
 * - iOS Safari 대응 안내 포함
 * - 데스크탑에서는 절대 표시되지 않음
 */
export default function InstallPrompt() {
  const { isInstalled, deviceType, platformType, promptInstall, shouldShowPrompt } = useInstallPrompt()
  const [isDismissed, setIsDismissed] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    // 로컬 스토리지에서 닫힘 상태 확인
    const dismissed = localStorage.getItem(STORAGE_KEY_DISMISSED)
    const expiry = localStorage.getItem(STORAGE_KEY_EXPIRY)

    if (dismissed === 'true' && expiry) {
      const expiryDate = new Date(expiry)
      if (new Date() < expiryDate) {
        setIsDismissed(true)
        return undefined
      } else {
        // 만료되었으면 로컬 스토리지 정리
        localStorage.removeItem(STORAGE_KEY_DISMISSED)
        localStorage.removeItem(STORAGE_KEY_EXPIRY)
      }
    }

    // 표시 조건 확인
    if (shouldShowPrompt && !isDismissed && !isInstalled) {
      // 약간의 지연 후 표시 (사용자 경험 개선)
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 1000)
      return () => clearTimeout(timer)
    }

    return undefined
  }, [shouldShowPrompt, isDismissed, isInstalled])

  const handleInstall = async () => {
    const accepted = await promptInstall()
    if (accepted) {
      setIsDismissed(true)
      setIsVisible(false)
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_DISMISSED, 'true')
      }
    }
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    setIsVisible(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_DISMISSED, 'true')
      const expiry = new Date()
      expiry.setDate(expiry.getDate() + DISMISS_EXPIRY_DAYS)
      localStorage.setItem(STORAGE_KEY_EXPIRY, expiry.toISOString())
    }
  }

  // 표시 조건 불만족 시 렌더링하지 않음
  if (!isVisible || isInstalled || isDismissed || !shouldShowPrompt || deviceType === 'desktop') {
    return null
  }

  // iOS Safari 대응 UI
  const isIOS = platformType === 'ios'

  if (isIOS) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-[1100] safe-area-inset-bottom md:hidden">
        <div className="animate-slide-in-up">
          <div className="bg-white/95 backdrop-blur-xl border-t-2 border-[#F472B6] shadow-2xl rounded-t-3xl p-5 mx-2 mb-2">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 mt-1">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F472B6] to-[#EC4899] flex items-center justify-center shadow-lg">
                  <Download className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-neutral-900 mb-1">
                  이 앱을 설치하시겠습니까?
                </h3>
                <p className="text-sm text-neutral-600 mb-3">
                  홈 화면에 추가하여 더 빠르게 접근하세요
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3">
                  <div className="flex items-start gap-2">
                    <Share2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-blue-900 mb-1">
                        설치 방법
                      </p>
                      <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                        <li>하단 <span className="font-semibold">공유</span> 버튼을 누르세요</li>
                        <li><span className="font-semibold">홈 화면에 추가</span>를 선택하세요</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
              <IconButton
                onClick={handleDismiss}
                aria-label="닫기"
                sx={{ color: 'text.secondary' }}
              >
                <X className="h-5 w-5" />
              </IconButton>
            </div>
            <Button
              onClick={handleDismiss}
              fullWidth
              variant="contained"
              sx={{ bgcolor: 'neutral.100', color: 'text.primary', borderRadius: 3, py: 1.5, textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: 'neutral.200' } }}
            >
              나중에
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Android Chrome 등 (beforeinstallprompt 지원)
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[1100] safe-area-inset-bottom md:hidden">
      <div className="animate-slide-in-up">
        <div className="bg-white/95 backdrop-blur-xl border-t-2 border-[#F472B6] shadow-2xl rounded-t-3xl p-5 mx-2 mb-2">
          <div className="flex items-start gap-3 mb-4">
            <div className="flex-shrink-0 mt-1">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F472B6] to-[#EC4899] flex items-center justify-center shadow-lg">
                <Download className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-neutral-900 mb-1">
                이 앱을 설치하시겠습니까?
              </h3>
              <p className="text-sm text-neutral-600">
                홈 화면에 추가하여 더 빠르게 접근하세요
              </p>
            </div>
            <IconButton
              onClick={handleDismiss}
              aria-label="닫기"
              sx={{ color: 'text.secondary' }}
            >
              <X className="h-5 w-5" />
            </IconButton>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleInstall}
              variant="contained"
              startIcon={<Download className="h-5 w-5" />}
              className="flex-1 bg-gradient-to-r from-[#F472B6] to-[#EC4899] hover:from-[#EC4899] hover:to-[#DB2777]"
              sx={{ borderRadius: 3, py: 1.5, textTransform: 'none', fontSize: '1rem', fontWeight: 600 }}
            >
              설치하기
            </Button>
            <Button
              onClick={handleDismiss}
              variant="text"
              sx={{ color: 'text.primary', bgcolor: 'action.hover', borderRadius: 3, px: 3, textTransform: 'none', fontWeight: 600 }}
            >
              나중에
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

