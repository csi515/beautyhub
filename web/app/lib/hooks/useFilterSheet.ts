/**
 * 필터 Bottom Sheet 상태 관리 훅
 * 활성 필터 개수 계산 및 필터 초기화 로직 포함
 */

'use client'

import { useState, useCallback, useMemo } from 'react'
import { useTheme, useMediaQuery } from '@mui/material'

interface FilterState {
  [key: string]: any
}

interface UseFilterSheetOptions<T extends FilterState> {
  filters: T
  onFiltersChange: (filters: Partial<T>) => void
  onReset?: () => void
  calculateActiveCount?: (filters: T) => number
}

/**
 * 필터 Bottom Sheet 상태 관리 훅
 */
export function useFilterSheet<T extends FilterState>(
  options: UseFilterSheetOptions<T>
) {
  const {
    filters,
    onFiltersChange,
    onReset,
    calculateActiveCount,
  } = options

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [sheetOpen, setSheetOpen] = useState(false)

  // 활성 필터 개수 계산
  const activeFilterCount = useMemo(() => {
    if (calculateActiveCount) {
      return calculateActiveCount(filters)
    }

    // 기본 계산: 빈 문자열이 아니고, 'all'이 아닌 필터 개수
    return Object.values(filters).filter(value => {
      if (value === '' || value === null || value === undefined) return false
      if (value === 'all') return false
      if (Array.isArray(value) && value.length === 0) return false
      if (typeof value === 'object' && Object.keys(value).length === 0) return false
      return true
    }).length
  }, [filters, calculateActiveCount])

  const openSheet = useCallback(() => {
    setSheetOpen(true)
  }, [])

  const closeSheet = useCallback(() => {
    setSheetOpen(false)
  }, [])

  const handleReset = useCallback(() => {
    if (onReset) {
      onReset()
    } else {
      // 기본 초기화: 모든 필터를 빈 값 또는 기본값으로 설정
      const resetFilters = Object.keys(filters).reduce((acc, key) => {
        acc[key] = Array.isArray(filters[key]) ? [] : ''
        return acc
      }, {} as Record<string, any>) as Partial<T>
      onFiltersChange(resetFilters)
    }
  }, [filters, onFiltersChange, onReset])

  return {
    isMobile,
    sheetOpen,
    openSheet,
    closeSheet,
    activeFilterCount,
    handleReset,
  }
}
