'use client'

import { useRef, useEffect, useState, useMemo } from 'react'
import { useMobileScrollOptimization } from '@/app/lib/hooks/useMobileScrollOptimization'

type MobileOptimizedListProps<T> = {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  itemHeight?: number // 고정 높이 (가상화를 위해)
  overscan?: number // 화면 밖 렌더링할 아이템 수
  className?: string
  emptyMessage?: string
}

/**
 * 모바일 최적화 리스트 컴포넌트
 * 가상화 및 스크롤 성능 최적화
 */
export default function MobileOptimizedList<T>({
  items,
  renderItem,
  itemHeight = 80, // 기본 카드 높이
  overscan = 3,
  className = '',
  emptyMessage = '항목이 없습니다.',
}: MobileOptimizedListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 })
  const { optimizeScrollContainer } = useMobileScrollOptimization()

  useEffect(() => {
    if (containerRef.current) {
      optimizeScrollContainer(containerRef.current)
    }
  }, [optimizeScrollContainer])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updateVisibleRange = () => {
      const scrollTop = container.scrollTop
      const containerHeight = container.clientHeight
      
      const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
      const end = Math.min(
        items.length,
        Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
      )

      setVisibleRange({ start, end })
    }

    updateVisibleRange()
    container.addEventListener('scroll', updateVisibleRange, { passive: true })

    return () => {
      container.removeEventListener('scroll', updateVisibleRange)
    }
  }, [items.length, itemHeight, overscan])

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end).map((item, idx) => ({
      item,
      index: visibleRange.start + idx,
    }))
  }, [items, visibleRange])

  const totalHeight = items.length * itemHeight
  const offsetY = visibleRange.start * itemHeight

  if (items.length === 0) {
    return (
      <div className={`flex items-center justify-center py-12 text-neutral-500 ${className}`}>
        <p>{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`overflow-y-auto scroll-container ${className}`}
      style={{
        height: '100%',
        contain: 'layout style paint',
      }}
    >
      {/* 가상 스크롤 컨테이너 */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            willChange: 'transform',
          }}
        >
          {visibleItems.map(({ item, index }) => (
            <div
              key={index}
              style={{
                height: itemHeight,
                contain: 'layout style paint',
              }}
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
