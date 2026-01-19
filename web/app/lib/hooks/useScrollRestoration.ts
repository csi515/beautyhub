'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

/**
 * 스크롤 위치 복원 훅
 * 페이지 이동 후 이전 스크롤 위치를 복원
 */
export function useScrollRestoration(enabled: boolean = true) {
  const pathname = usePathname()
  const scrollPositions = useRef<Record<string, number>>({})
  const isRestoring = useRef(false)

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    // 현재 스크롤 위치 저장
    const saveScrollPosition = () => {
      if (!isRestoring.current) {
        scrollPositions.current[pathname] = window.scrollY
      }
    }

    // 스크롤 위치 복원
    const restoreScrollPosition = () => {
      const savedPosition = scrollPositions.current[pathname]
      if (savedPosition !== undefined) {
        isRestoring.current = true
        // 약간의 지연을 두어 DOM이 완전히 렌더링된 후 복원
        requestAnimationFrame(() => {
          window.scrollTo({
            top: savedPosition,
            behavior: 'auto', // 즉시 이동 (부드러운 스크롤은 사용자 경험을 해칠 수 있음)
          })
          // 복원 완료 후 플래그 해제
          setTimeout(() => {
            isRestoring.current = false
          }, 100)
        })
      }
    }

    // 스크롤 이벤트 리스너 (throttle 적용)
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          saveScrollPosition()
          ticking = false
        })
        ticking = true
      }
    }

    // 페이지 언로드 시 현재 위치 저장
    const handleBeforeUnload = () => {
      saveScrollPosition()
    }

    // 스크롤 위치 복원
    restoreScrollPosition()

    // 이벤트 리스너 등록
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      // 컴포넌트 언마운트 시 현재 위치 저장
      saveScrollPosition()
    }
  }, [pathname, enabled])
}
