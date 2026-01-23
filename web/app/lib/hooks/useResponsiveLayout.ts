'use client'

/**
 * 반응형 레이아웃 훅
 * 모바일/데스크탑 레이아웃 규칙 강제
 * AppBar/BottomNav 높이 자동 계산, PWA safe-area-inset 자동 적용
 */

import { useMemo } from 'react'
import { useTheme, useMediaQuery } from '@mui/material'
import { usePWA } from './usePWA'
import type { ResponsiveSpacing } from '../utils/spacing'

// 모바일 AppBar 및 BottomNav 높이 상수
const MOBILE_APP_BAR_HEIGHT = { xs: 56, sm: 64 }
const MOBILE_BOTTOM_NAV_HEIGHT = 64

export interface UseResponsiveLayoutOptions {
  spacing?: ResponsiveSpacing
  maxWidth?: string | number | { xs?: string | number; sm?: string | number; md?: string | number; lg?: string | number; xl?: string | number }
  padding?: ResponsiveSpacing
}

export interface UseResponsiveLayoutReturn {
  isMobile: boolean
  isStandalone: boolean
  paddingTop: string | number | { xs?: string | number; sm?: string | number; md?: number; lg?: number }
  paddingBottom: string | number | { xs?: string | number; sm?: string | number; md?: number; lg?: number }
  paddingX: ResponsiveSpacing
  spacing: ResponsiveSpacing
  maxWidth: string | number | { xs?: string | number; sm?: string | number; md?: string | number; lg?: string | number; xl?: string | number }
}

/**
 * 반응형 레이아웃 훅
 * 모바일/데스크탑 레이아웃 규칙 강제
 * 
 * UX 규칙:
 * - 모바일 paddingTop: calc(AppBar 높이 + 8px)
 * - 모바일 paddingBottom: calc(BottomNav 높이 + 8px)
 * - 데스크탑: breakpoint별 padding 직접 지정
 * - PWA standalone 모드: safe-area-inset 자동 적용
 * 
 * @example
 * const layout = useResponsiveLayout()
 * <Box sx={{ pt: layout.paddingTop, px: layout.paddingX }}>
 */
export function useResponsiveLayout(
  options: UseResponsiveLayoutOptions = {}
): UseResponsiveLayoutReturn {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { isStandalone, isIOS } = usePWA()

  const {
    spacing: customSpacing = { xs: 0.5, sm: 1, md: 2.5, lg: 3 },
    maxWidth: customMaxWidth = { xs: '100%', sm: '100%', md: '90%', lg: '1200px', xl: '1400px' },
    padding: customPadding = { xs: 1.5, sm: 2, md: 2.5, lg: 3, xl: 3 },
  } = options

  const paddingTop = useMemo(() => {
    if (isMobile) {
      // 모바일: AppBar 높이 + 최소 여백(8px)
      const baseTop = {
        xs: `calc(${MOBILE_APP_BAR_HEIGHT.xs}px + ${theme.spacing(1)})`,
        sm: `calc(${MOBILE_APP_BAR_HEIGHT.sm}px + ${theme.spacing(1)})`,
      }

      // PWA standalone 모드: safe-area-inset-top 추가 고려
      if (isStandalone && isIOS) {
        return {
          xs: `calc(${MOBILE_APP_BAR_HEIGHT.xs}px + ${theme.spacing(1)} + env(safe-area-inset-top))`,
          sm: `calc(${MOBILE_APP_BAR_HEIGHT.sm}px + ${theme.spacing(1)} + env(safe-area-inset-top))`,
        }
      }

      return baseTop
    }

    // 데스크탑: breakpoint별 padding 직접 지정
    return { xs: 2, sm: 2.5, md: 3 }
  }, [isMobile, isStandalone, isIOS, theme])

  const paddingBottom = useMemo(() => {
    if (isMobile) {
      // 모바일: BottomNav 높이 + 최소 여백(8px)
      const baseBottom = `calc(${MOBILE_BOTTOM_NAV_HEIGHT}px + ${theme.spacing(1)})`

      // PWA standalone 모드: safe-area-inset-bottom 추가 고려
      if (isStandalone) {
        return `calc(${MOBILE_BOTTOM_NAV_HEIGHT}px + ${theme.spacing(1)} + env(safe-area-inset-bottom))`
      }

      return baseBottom
    }

    // 데스크탑: breakpoint별 padding 직접 지정
    return { xs: 2, sm: 2.5, md: 3 }
  }, [isMobile, isStandalone, theme])

  return {
    isMobile,
    isStandalone,
    paddingTop,
    paddingBottom,
    paddingX: customPadding,
    spacing: customSpacing,
    maxWidth: customMaxWidth,
  }
}
