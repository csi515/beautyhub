/**
 * 페이지 전환 애니메이션 훅
 * 리스트 아이템 클릭 시 모달이 열릴 때 화면 전환 효과 제공
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { useTheme, useMediaQuery } from '@mui/material'

interface UsePageTransitionOptions {
  enabled?: boolean
  duration?: number
}

interface TransitionState {
  isTransitioning: boolean
  itemRect: DOMRect | null
}

/**
 * 리스트 → 상세 화면 전환 애니메이션 훅
 * 모바일에서만 적용
 */
export function usePageTransition(options: UsePageTransitionOptions = {}) {
  const { enabled = true, duration = 300 } = options
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [transitionState, setTransitionState] = useState<TransitionState>({
    isTransitioning: false,
    itemRect: null,
  })
  const itemRef = useRef<HTMLElement | null>(null)

  // 모바일이 아니거나 비활성화된 경우 빈 함수 반환
  if (!isMobile || !enabled) {
    return {
      onItemClick: () => {},
      transitionStyle: {},
      isTransitioning: false,
    }
  }

  const handleItemClick = (element: HTMLElement | null) => {
    if (!element) return

    // 클릭된 아이템의 위치 저장
    const rect = element.getBoundingClientRect()
    itemRef.current = element
    setTransitionState({
      isTransitioning: true,
      itemRect: rect,
    })

    // 전환 완료 후 상태 초기화
    setTimeout(() => {
      setTransitionState({
        isTransitioning: false,
        itemRect: null,
      })
    }, duration)
  }

  // 전환 스타일 계산
  const transitionStyle = transitionState.isTransitioning && transitionState.itemRect
    ? {
        transformOrigin: `${transitionState.itemRect.left + transitionState.itemRect.width / 2}px ${transitionState.itemRect.top + transitionState.itemRect.height / 2}px`,
        animation: `pageTransition ${duration}ms ease-out`,
      }
    : {}

  return {
    onItemClick: handleItemClick,
    transitionStyle,
    isTransitioning: transitionState.isTransitioning,
  }
}

/**
 * 모달 열기 시 전환 효과 적용
 */
export function useModalTransition(
  open: boolean,
  itemElement: HTMLElement | null,
  options: UsePageTransitionOptions = {}
) {
  const { enabled = true, duration = 300 } = options
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [initialRect, setInitialRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    if (!isMobile || !enabled || !open || !itemElement) {
      setInitialRect(null)
      return
    }

    // 모달이 열릴 때 아이템 위치 저장
    const rect = itemElement.getBoundingClientRect()
    setInitialRect(rect)

    // 전환 완료 후 초기화
    const timer = setTimeout(() => {
      setInitialRect(null)
    }, duration)

    return () => clearTimeout(timer)
  }, [open, itemElement, isMobile, enabled, duration])

  // 초기 위치에서 확대되는 스타일
  const modalStyle = initialRect
    ? {
        transformOrigin: `${initialRect.left + initialRect.width / 2}px ${initialRect.top + initialRect.height / 2}px`,
        animation: `modalOpen ${duration}ms ease-out`,
      }
    : {}

  return {
    modalStyle,
    isTransitioning: initialRect !== null,
  }
}
