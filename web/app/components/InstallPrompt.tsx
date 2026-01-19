'use client'

import { useInstallPrompt } from '../lib/hooks/useInstallPrompt'
import { Download, X } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function InstallPrompt() {
  const { isInstallable, isInstalled, promptInstall } = useInstallPrompt()
  const [isDismissed, setIsDismissed] = useState(false)

  // 로컬 스토리지에서 닫힘 상태 확인
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const dismissed = localStorage.getItem('install-prompt-dismissed')
    if (dismissed === 'true') {
      setIsDismissed(true)
    }
  }, [])

  const handleInstall = async () => {
    const accepted = await promptInstall()
    if (accepted) {
      setIsDismissed(true)
      if (typeof window !== 'undefined') {
        localStorage.setItem('install-prompt-dismissed', 'true')
      }
    }
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    if (typeof window !== 'undefined') {
      localStorage.setItem('install-prompt-dismissed', 'true')
      // 7일 후 다시 표시되도록 설정 (선택사항)
      const expiry = new Date()
      expiry.setDate(expiry.getDate() + 7)
      localStorage.setItem('install-prompt-expiry', expiry.toISOString())
    }
  }

  // 이미 설치되었거나 닫혔거나 설치 불가능한 경우 표시하지 않음
  if (isInstalled || isDismissed || !isInstallable) {
    return null
  }

  // 만료 시간 확인 (7일 후 다시 표시)
  if (typeof window !== 'undefined') {
    const expiry = localStorage.getItem('install-prompt-expiry')
    if (expiry) {
      const expiryDate = new Date(expiry)
      if (new Date() < expiryDate) {
        return null
      } else {
        // 만료되었으면 로컬 스토리지 정리
        localStorage.removeItem('install-prompt-dismissed')
        localStorage.removeItem('install-prompt-expiry')
      }
    }
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[1100] animate-slide-in-up">
      <div className="bg-white rounded-xl border-2 border-[#F472B6] shadow-lg p-4 flex items-start gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-neutral-900 mb-1">앱 설치하기</h3>
          <p className="text-sm text-neutral-600 mb-3">
            홈 화면에 추가하여 더 빠르게 접근하세요
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleInstall}
              className="flex-1 bg-[#F472B6] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#EC4899] transition-colors flex items-center justify-center gap-2 touch-manipulation"
            >
              <Download className="h-4 w-4" />
              설치하기
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-2 text-neutral-500 hover:text-neutral-700 transition-colors touch-manipulation"
              aria-label="닫기"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

