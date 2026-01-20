'use client'

import { useMediaQuery, useTheme } from '@mui/material'

/**
 * 반응형 Pagination size 훅
 * 모바일에서는 'small', 데스크톱에서는 'medium' 반환
 */
export function useResponsivePaginationSize(): 'small' | 'medium' {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  
  return isMobile ? 'small' : 'medium'
}
