'use client'

/**
 * 필터 상태 관리 훅
 * 필터 변경 시 페이지 리셋, 활성 필터 개수 계산 등 포함
 * Bottom Sheet UI 상태 관리 포함 (모바일)
 */

import { useState, useCallback, useMemo } from 'react'
import { useTheme, useMediaQuery } from '@mui/material'

export interface UseFiltersOptions<T extends Record<string, any>> {
  onFilterChange?: (filters: T) => void
  resetPageOnChange?: boolean
  getPageSetter?: () => ((page: number) => void) | undefined
  calculateActiveCount?: (filters: T) => number
  onReset?: () => void
}

export interface UseFiltersReturn<T extends Record<string, any>> {
  filters: T
  updateFilters: (newFilters: Partial<T>) => void
  resetFilters: () => void
  hasActiveFilters: boolean
  activeFilterCount: number
  setFilters: (filters: T) => void
  // Bottom Sheet 관련 (모바일)
  isMobile: boolean
  sheetOpen: boolean
  openSheet: () => void
  closeSheet: () => void
}

/**
 * 필터 상태 관리 훅
 * 
 * @example
 * const filters = useFilters(
 *   { status: 'all', minPrice: '', maxPrice: '' },
 *   { 
 *     resetPageOnChange: true,
 *     getPageSetter: () => setPage
 *   }
 * )
 */
export function useFilters<T extends Record<string, any>>(
  initialFilters: T,
  options: UseFiltersOptions<T> = {}
): UseFiltersReturn<T> {
  const {
    onFilterChange,
    resetPageOnChange = false,
    getPageSetter,
    calculateActiveCount,
    onReset,
  } = options

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [filters, setFiltersState] = useState<T>(initialFilters)
  const [sheetOpen, setSheetOpen] = useState(false)

  const updateFilters = useCallback(
    (newFilters: Partial<T>) => {
      setFiltersState(prev => {
        const updated = { ...prev, ...newFilters }
        onFilterChange?.(updated)
        return updated
      })

      if (resetPageOnChange) {
        const setPage = getPageSetter?.()
        if (setPage) {
          setPage(1)
        }
      }
    },
    [onFilterChange, resetPageOnChange, getPageSetter]
  )

  const resetFilters = useCallback(() => {
    if (onReset) {
      onReset()
    } else {
      setFiltersState(initialFilters)
      onFilterChange?.(initialFilters)
    }

    if (resetPageOnChange) {
      const setPage = getPageSetter?.()
      if (setPage) {
        setPage(1)
      }
    }
  }, [initialFilters, onFilterChange, resetPageOnChange, getPageSetter, onReset])

  const setFilters = useCallback(
    (newFilters: T) => {
      setFiltersState(newFilters)
      onFilterChange?.(newFilters)

      if (resetPageOnChange) {
        const setPage = getPageSetter?.()
        if (setPage) {
          setPage(1)
        }
      }
    },
    [onFilterChange, resetPageOnChange, getPageSetter]
  )

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

  const hasActiveFilters = useMemo(() => {
    return activeFilterCount > 0
  }, [activeFilterCount])

  const openSheet = useCallback(() => {
    setSheetOpen(true)
  }, [])

  const closeSheet = useCallback(() => {
    setSheetOpen(false)
  }, [])

  return {
    filters,
    updateFilters,
    resetFilters,
    hasActiveFilters,
    activeFilterCount,
    setFilters,
    // Bottom Sheet 관련
    isMobile,
    sheetOpen,
    openSheet,
    closeSheet,
  }
}
