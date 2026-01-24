'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useTheme, useMediaQuery } from '@mui/material'
import { usePageHeader } from '@/app/lib/contexts/PageHeaderContext'

export interface UseMobilePageHeaderOptions {
  /** 페이지 제목 (모바일 TopBar 표시) */
  title: string
  /** 필터 뱃지 숫자 (0이면 뱃지 비표시) */
  filterBadge?: number
  /** 액션 버튼 (모바일에서만 TopBar에 표시, 빈 배열이면 비표시) */
  actions?: React.ReactNode | React.ReactNode[]
  /** true면 setHeaderInfo/clearHeaderInfo 스킵 (embedded 등) */
  disabled?: boolean
}

export interface UseMobilePageHeaderReturn {
  isMobile: boolean
  filterSheetOpen: boolean
  openFilterSheet: () => void
  closeFilterSheet: () => void
}

/**
 * 모바일 TopBar 헤더 동기화 + 필터 Bottom Sheet 열기/닫기 상태.
 * FilterBottomSheet와 PageHeaderContext 연동에 사용.
 */
export function useMobilePageHeader(
  options: UseMobilePageHeaderOptions
): UseMobilePageHeaderReturn {
  const { title, filterBadge = 0, actions, disabled = false } = options
  const actionsRef = useRef(actions)
  actionsRef.current = actions
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { setHeaderInfo, clearHeaderInfo } = usePageHeader()
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)

  const openFilterSheet = useCallback(() => setFilterSheetOpen(true), [])
  const closeFilterSheet = useCallback(() => setFilterSheetOpen(false), [])

  useEffect(() => {
    if (disabled) return
    if (isMobile) {
      const a = actionsRef.current
      setHeaderInfo({
        title,
        onFilter: openFilterSheet,
        filterBadge: filterBadge > 0 ? filterBadge : undefined,
        actions: Array.isArray(a) ? a : a ? [a] : [],
      })
    } else {
      clearHeaderInfo()
    }
    return () => {
      if (isMobile) clearHeaderInfo()
    }
  }, [disabled, isMobile, title, filterBadge, setHeaderInfo, clearHeaderInfo, openFilterSheet])

  return {
    isMobile,
    filterSheetOpen,
    openFilterSheet,
    closeFilterSheet,
  }
}
