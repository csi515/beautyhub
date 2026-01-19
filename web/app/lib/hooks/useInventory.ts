import { useState, useEffect, useCallback } from 'react'
import { useAppToast } from '../ui/toast'

export interface Product {
  id: string
  name: string
  stock_count?: number
  safety_stock?: number
  price?: number
  inventory_status?: string
  needs_restock?: boolean
}

export interface InventoryAlert {
  id: string
  product_id: string
  alert_type: 'low_stock' | 'out_of_stock'
  acknowledged: boolean
  created_at?: string
  product?: {
    id: string
    name: string
    stock_count?: number
    safety_stock?: number
  } | null
}

export interface InventoryFilters {
  status: string
  minPrice: string
  maxPrice: string
  minStock: string
  maxStock: string
}

export function useInventory() {
  const [products, setProducts] = useState<Product[]>([])
  const [alerts, setAlerts] = useState<InventoryAlert[]>([])
  const [loading, setLoading] = useState(true)
  const toast = useAppToast()

  // Pagination, Search, Filter, Sort states
  const [page, setPage] = useState(1)
  const [limit] = useState(25)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<InventoryFilters>({
    status: '',
    minPrice: '',
    maxPrice: '',
    minStock: '',
    maxStock: ''
  })
  const [sortBy, setSortBy] = useState<string>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Phase 2: Bulk selection
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set())

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)

      // Build query string
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('limit', limit.toString())
      if (search) params.append('search', search)
      if (filters.status) params.append('status', filters.status)
      if (filters.minPrice) params.append('min_price', filters.minPrice)
      if (filters.maxPrice) params.append('max_price', filters.maxPrice)
      if (filters.minStock) params.append('min_stock', filters.minStock)
      if (filters.maxStock) params.append('max_stock', filters.maxStock)
      params.append('sort_by', sortBy)
      params.append('sort_order', sortOrder)

      const inventoryResponse = await fetch(`/api/inventory?${params.toString()}`)

      if (inventoryResponse.ok) {
        const inventoryData = await inventoryResponse.json()
        setProducts(Array.isArray(inventoryData.data) ? inventoryData.data : [])
        setTotal(inventoryData.pagination?.total || 0)
        setTotalPages(inventoryData.pagination?.total_pages || 0)
      }
    } catch (error) {
      console.error('Error fetching inventory:', error)
      toast.error('데이터를 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }, [page, limit, search, filters, sortBy, sortOrder, toast])

  const fetchAlerts = useCallback(async () => {
    try {
      const alertsResponse = await fetch('/api/inventory/alerts?unacknowledged=true')
      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json()
        setAlerts(Array.isArray(alertsData) ? alertsData : [])
      }
    } catch (error) {
      console.error('Error fetching alerts:', error)
    }
  }, [])

  useEffect(() => {
    fetchData()
    fetchAlerts()
  }, [fetchData, fetchAlerts])

  const quickStockAdjust = useCallback(async (product: Product, adjustment: number) => {
    const newQuantity = (product.stock_count || 0) + adjustment
    if (newQuantity < 0) {
      toast.error('재고는 0보다 작을 수 없습니다')
      return
    }

    try {
      const response = await fetch('/api/inventory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          quantity: newQuantity,
          type: 'adjustment',
          memo: adjustment > 0 ? `빠른 입고 (+${adjustment})` : `빠른 출고 (${adjustment})`,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update stock')
      }

      toast.success(adjustment > 0 ? '입고 완료' : '출고 완료')
      fetchData()
    } catch (error) {
      console.error('Error updating stock:', error)
      toast.error('재고 업데이트에 실패했습니다')
    }
  }, [toast, fetchData])

  const acknowledgeAllAlerts = useCallback(async () => {
    try {
      const response = await fetch('/api/inventory/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acknowledge_all: true }),
      })

      if (!response.ok) {
        throw new Error('Failed to acknowledge alerts')
      }

      toast.success('모든 알림이 확인되었습니다')
      fetchData()
    } catch (error) {
      console.error('Error acknowledging alerts:', error)
      toast.error('알림 확인에 실패했습니다')
    }
  }, [toast, fetchData])

  const toggleSelectProduct = useCallback((productId: string) => {
    setSelectedProductIds(prev => {
      const newSelection = new Set(prev)
      if (newSelection.has(productId)) {
        newSelection.delete(productId)
      } else {
        newSelection.add(productId)
      }
      return newSelection
    })
  }, [])

  const toggleSelectAll = useCallback(() => {
    setSelectedProductIds(prev => {
      if (prev.size === products.length) {
        return new Set()
      } else {
        return new Set(products.map(p => p.id))
      }
    })
  }, [products])

  const handleSearchChange = useCallback((newSearch: string) => {
    setSearch(newSearch)
    setPage(1)
  }, [])

  const handleFilterChange = useCallback((newFilters: InventoryFilters) => {
    setFilters(newFilters)
    setPage(1)
  }, [])

  const handleResetFilters = useCallback(() => {
    setFilters({
      status: '',
      minPrice: '',
      maxPrice: '',
      minStock: '',
      maxStock: ''
    })
    setPage(1)
  }, [])

  const handleSortChange = useCallback((field: string) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }, [sortBy])

  return {
    // Data
    products,
    alerts,
    loading,
    
    // Pagination
    page,
    setPage,
    limit,
    total,
    totalPages,
    
    // Search & Filter
    search,
    setSearch: handleSearchChange,
    filters,
    setFilters: handleFilterChange,
    handleResetFilters,
    
    // Sort
    sortBy,
    sortOrder,
    handleSortChange,
    
    // Selection
    selectedProductIds,
    toggleSelectProduct,
    toggleSelectAll,
    setSelectedProductIds,
    
    // Actions
    quickStockAdjust,
    acknowledgeAllAlerts,
    refetch: fetchData,
  }
}
