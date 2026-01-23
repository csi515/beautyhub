/**
 * 모바일 AppBar 상태 관리 훅
 * 뒤로가기, 필터, 액션 버튼 통합 관리
 */

'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme, useMediaQuery } from '@mui/material'

interface UseMobileAppBarOptions {
  title?: string
  showBack?: boolean
  onBack?: () => void
  onFilter?: () => void
  filterBadge?: number
  actions?: React.ReactNode | React.ReactNode[]
}

interface MobileAppBarState {
  filterOpen: boolean
}

/**
 * 모바일 AppBar 상태 관리 훅
 */
export function useMobileAppBar(options: UseMobileAppBarOptions = {}) {
  const {
    title,
    showBack = true,
    onBack,
    onFilter,
    filterBadge,
    actions,
  } = options

  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [state, setState] = useState<MobileAppBarState>({
    filterOpen: false,
  })

  const handleBack = useCallback(() => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }, [onBack, router])

  const handleFilterOpen = useCallback(() => {
    if (onFilter) {
      onFilter()
    } else {
      setState(prev => ({ ...prev, filterOpen: true }))
    }
  }, [onFilter])

  const handleFilterClose = useCallback(() => {
    setState(prev => ({ ...prev, filterOpen: false }))
  }, [])

  // 모바일이 아니면 빈 객체 반환
  if (!isMobile) {
    return {
      isMobile: false,
      title: undefined,
      showBack: false,
      onBack: () => {},
      onFilter: undefined,
      filterBadge: undefined,
      actions: undefined,
      filterOpen: false,
      openFilter: () => {},
      closeFilter: () => {},
    }
  }

  return {
    isMobile: true,
    title,
    showBack,
    onBack: handleBack,
    onFilter: onFilter ? handleFilterOpen : undefined,
    filterBadge,
    actions: Array.isArray(actions) ? actions : (actions ? [actions] : []),
    filterOpen: state.filterOpen,
    openFilter: handleFilterOpen,
    closeFilter: handleFilterClose,
  }
}
