'use client'

import { useTheme, useMediaQuery } from '@mui/material'

export interface UseExportVisibilityReturn {
  showExport: boolean
  isMobile: boolean
}

/**
 * 모바일에서 CSV/Excel 내보내기 비표시 판단.
 * breakpoint: down('sm'). showExport = !isMobile.
 */
export function useExportVisibility(): UseExportVisibilityReturn {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  return {
    showExport: !isMobile,
    isMobile,
  }
}
