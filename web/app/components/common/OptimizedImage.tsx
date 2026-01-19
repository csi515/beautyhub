'use client'

import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import clsx from 'clsx'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  fill?: boolean
  sizes?: string
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  /** Intersection Observer를 사용한 지연 로딩 (priority가 false일 때만) */
  useIntersectionObserver?: boolean
  /** Intersection Observer rootMargin */
  rootMargin?: string
}

/**
 * 최적화된 이미지 컴포넌트
 * Next.js Image를 래핑하여 lazy loading, 스켈레톤, 반응형 최적화 제공
 * LazyImage와 OptimizedImage의 기능을 통합
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  fill = false,
  sizes,
  objectFit = 'cover',
  useIntersectionObserver = false,
  rootMargin = '50px',
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isInView, setIsInView] = useState(priority || !useIntersectionObserver)
  const imgRef = useRef<HTMLDivElement>(null)

  // Intersection Observer를 사용한 지연 로딩
  useEffect(() => {
    if (!useIntersectionObserver || priority || isInView || typeof window === 'undefined') return

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
        threshold: 0.1,
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [useIntersectionObserver, priority, isInView, rootMargin])

  // 기본 sizes 값 설정 (반응형 최적화)
  const defaultSizes = sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'

  if (hasError) {
    return (
      <div
        className={clsx(
          'flex items-center justify-center bg-neutral-100 text-neutral-400',
          className
        )}
        style={fill ? undefined : { width, height }}
      >
        <span className="text-xs">이미지를 불러올 수 없습니다</span>
      </div>
    )
  }

  return (
    <div 
      ref={imgRef}
      className={clsx('relative', className)} 
      style={fill ? undefined : { width, height }}
    >
      {/* 로딩 중 스켈레톤 */}
      {isLoading && (
        <div
          className="absolute inset-0 bg-neutral-200 animate-pulse rounded"
          style={fill ? undefined : { width, height }}
        />
      )}
      {isInView && (
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        className={clsx(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          objectFit === 'cover' && 'object-cover',
          objectFit === 'contain' && 'object-contain',
          objectFit === 'fill' && 'object-fill',
          objectFit === 'none' && 'object-none',
          objectFit === 'scale-down' && 'object-scale-down'
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false)
          setHasError(true)
        }}
        loading={priority ? undefined : 'lazy'}
        sizes={defaultSizes}
        priority={priority}
      />
      )}
    </div>
  )
}
