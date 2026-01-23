/**
 * Products 페이지 전용 훅
 * 데이터 로딩, 필터링, 정렬, 페이지네이션을 통합 관리
 */

'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearch } from './useSearch'
import { useSort } from './useSort'
import { usePagination } from './usePagination'
import { ProductsService, type ProductFilters } from '../services/products.service'
import type { Product } from '@/types/entities'

export interface UseProductsPageReturn {
  // 데이터
  products: Product[]
  filteredProducts: Product[] // 필터링된 전체 데이터 (export용)
  totalItems: number
  totalPages: number
  loading: boolean
  error: string
  
  // 필터/검색
  query: string
  setQuery: (query: string) => void
  statusFilter: 'all' | 'active' | 'inactive'
  setStatusFilter: (filter: 'all' | 'active' | 'inactive') => void
  minPrice: string
  setMinPrice: (price: string) => void
  maxPrice: string
  setMaxPrice: (price: string) => void
  
  // 정렬
  sortKey: string
  sortDirection: 'asc' | 'desc'
  toggleSort: (key: string) => void
  
  // 페이지네이션
  page: number
  pageSize: number
  setPage: (page: number) => void
  
  // 액션
  refetch: () => Promise<void>
}

export function useProductsPage(): UseProductsPageReturn {
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { query, debouncedQuery, setQuery } = useSearch({ debounceMs: 300 })
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  
  const { sortKey, sortDirection, toggleSort } = useSort<Product & Record<string, unknown>>({
    initialKey: 'name',
    initialDirection: 'asc',
  })
  
  const { page, pageSize, setPage } = usePagination({
    initialPage: 1,
    initialPageSize: 10,
    totalItems: 0,
  })

  // 데이터 로딩
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const { productsApi } = await import('@/app/lib/api/products')
      const rows = await productsApi.list(debouncedQuery ? { search: debouncedQuery } : {})
      setAllProducts(Array.isArray(rows) ? rows : [])
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : '에러가 발생했습니다.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [debouncedQuery])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  // Service를 사용한 데이터 가공
  const processed = useMemo(() => {
    const filters: ProductFilters = {
      search: debouncedQuery,
      status: statusFilter,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined
    }

    return ProductsService.processProductList(
      allProducts,
      filters,
      sortKey as string,
      sortDirection,
      page,
      pageSize
    )
  }, [allProducts, debouncedQuery, statusFilter, minPrice, maxPrice, sortKey, sortDirection, page, pageSize])

  // 페이지 변경 시 필터/검색 변경으로 인해 현재 페이지가 유효 범위를 벗어나면 첫 페이지로 이동
  useEffect(() => {
    if (page > processed.totalPages && processed.totalPages > 0) {
      setPage(1)
    }
  }, [processed.totalPages, page, setPage])

  return {
    // 데이터
    products: processed.paginated,
    filteredProducts: processed.filtered, // 필터링된 전체 데이터 (export용)
    totalItems: processed.filtered.length,
    totalPages: processed.totalPages,
    loading,
    error,
    
    // 필터/검색
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    
    // 정렬
    sortKey: sortKey as string,
    sortDirection,
    toggleSort: (key: string) => toggleSort(key as keyof Product),
    
    // 페이지네이션
    page,
    pageSize,
    setPage,
    
    // 액션
    refetch: loadProducts
  }
}
