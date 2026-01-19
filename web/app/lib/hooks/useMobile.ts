'use client'

import { useEffect, useState } from 'react'

export function useMobile(breakpoint: number = 768): boolean {
  // 초기값 설정으로 SSR 대응 개선
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < breakpoint
    }
    return false
  })

  useEffect(() => {
    // 초기값 설정
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < breakpoint)
    }

    // 디바운스된 체크 함수
    let timeoutId: NodeJS.Timeout
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < breakpoint)
      }
    }

    // 디바운스 적용 (150ms)
    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(checkMobile, 150)
    }

    // passive: true 옵션으로 스크롤 성능 개선
    window.addEventListener('resize', handleResize, { passive: true })

    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(timeoutId)
    }
  }, [breakpoint])

  return isMobile
}
