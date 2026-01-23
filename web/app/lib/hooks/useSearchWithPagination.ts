'use client'

/**
 * 검색과 페이지네이션을 연동하는 훅
 * 검색 변경 시 자동으로 페이지 리셋
 */

import { useCallback } from 'react'
import { useSearch } from './useSearch'
import { usePagination } from './usePagination'

export interface UseSearchWithPaginationOptions {
  debounceMs?: number
  resetPageOnSearch?: boolean
  initialPage?: number
  initialPageSize?: number
  totalItems?: number
}

export interface UseSearchWithPaginationReturn {
  query: string
  debouncedQuery: string
  setQuery: (query: string) => void
  clear: () => void
  isEmpty: boolean
  page: number
  pageSize: number
  totalPages: number
  totalItems: number
  setPage: (page: number) => void
  setPageSize: (size: number) => void
  setTotalItems: (items: number) => void
  nextPage: () => void
  prevPage: () => void
  goToFirstPage: () => void
  goToLastPage: () => void
  hasNextPage: boolean
  hasPrevPage: boolean
  offset: number
}

/**
 * 검색과 페이지네이션을 연동하는 훅
 * 검색 변경 시 자동으로 페이지 리셋
 * 
 * @example
 * const search = useSearchWithPagination({
 *   debounceMs: 300,
 *   resetPageOnSearch: true,
 *   initialPage: 1,
 *   initialPageSize: 10
 * })
 */
export function useSearchWithPagination(
  options: UseSearchWithPaginationOptions = {}
): UseSearchWithPaginationReturn {
  const {
    debounceMs = 300,
    resetPageOnSearch = true,
    initialPage = 1,
    initialPageSize = 10,
    totalItems: initialTotalItems = 0,
  } = options

  const search = useSearch({ debounceMs })
  const pagination = usePagination({
    initialPage,
    initialPageSize,
    totalItems: initialTotalItems,
  })

  const setQuery = useCallback(
    (query: string) => {
      search.setQuery(query)
      if (resetPageOnSearch) {
        pagination.setPage(1)
      }
    },
    [search, pagination, resetPageOnSearch]
  )

  const clear = useCallback(() => {
    search.clear()
    if (resetPageOnSearch) {
      pagination.setPage(1)
    }
  }, [search, pagination, resetPageOnSearch])

  return {
    query: search.query,
    debouncedQuery: search.debouncedQuery,
    setQuery,
    clear,
    isEmpty: search.isEmpty,
    page: pagination.page,
    pageSize: pagination.pageSize,
    totalPages: pagination.totalPages,
    totalItems: pagination.totalItems,
    setPage: pagination.setPage,
    setPageSize: pagination.setPageSize,
    setTotalItems: pagination.setTotalItems,
    nextPage: pagination.nextPage,
    prevPage: pagination.prevPage,
    goToFirstPage: pagination.goToFirstPage,
    goToLastPage: pagination.goToLastPage,
    hasNextPage: pagination.hasNextPage,
    hasPrevPage: pagination.hasPrevPage,
    offset: pagination.offset,
  }
}
