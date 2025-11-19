'use client'

import { useEffect, useRef, useState } from 'react'

type UseImageLazyLoadingOptions = {
  /** 이미지가 뷰포트에 들어왔을 때 로드할지 여부 */
  rootMargin?: string
  /** Intersection Observer 옵션 */
  threshold?: number
}

/**
 * 이미지 지연 로딩 훅
 * 모바일 성능 최적화를 위한 이미지 lazy loading
 */
export function useImageLazyLoading(options: UseImageLazyLoadingOptions = {}) {
  const { rootMargin = '50px', threshold = 0.1 } = options
  const imgRef = useRef<HTMLImageElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !imgRef.current) return

    const img = imgRef.current

    // Intersection Observer로 뷰포트 진입 감지
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        })
      },
      {
        rootMargin,
        threshold,
      }
    )

    observer.observe(img)

    return () => {
      observer.disconnect()
    }
  }, [rootMargin, threshold])

  const handleLoad = () => {
    setIsLoaded(true)
  }

  return {
    imgRef,
    isLoaded,
    isInView,
    handleLoad,
  }
}

