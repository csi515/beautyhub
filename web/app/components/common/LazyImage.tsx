'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useImageLazyLoading } from '@/app/lib/hooks/useImageLazyLoading'
import { Skeleton } from '../ui/Skeleton'

type LazyImageProps = {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
}

/**
 * 모바일 최적화 지연 로딩 이미지 컴포넌트
 */
export default function LazyImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  objectFit = 'cover',
}: LazyImageProps) {
  const { imgRef, isInView, handleLoad } = useImageLazyLoading()
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return (
      <div className={`bg-neutral-100 flex items-center justify-center ${className}`} style={{ width, height }}>
        <span className="text-neutral-400 text-sm">이미지 로드 실패</span>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
      {isLoading && (
        <div className="absolute inset-0">
          <Skeleton className="w-full h-full" />
        </div>
      )}
      {(isInView || priority) && (
        <Image
          ref={imgRef}
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          style={{ objectFit }}
          onLoad={() => {
            setIsLoading(false)
            handleLoad()
          }}
          onError={() => {
            setIsLoading(false)
            setHasError(true)
          }}
          loading={priority ? 'eager' : 'lazy'}
          quality={85}
        />
      )}
    </div>
  )
}

