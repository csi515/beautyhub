import { useState, useEffect, useCallback } from 'react'
import { useAppToast } from '../../lib/ui/toast'
import { logger } from '@/app/lib/utils/logger'
import { getLocalizedErrorMessage } from '@/app/lib/utils/messages'
export interface InventoryFilters {
    status: string
    minPrice: string
    maxPrice: string
    minStock: string
    maxStock: string
}

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

export function useInventoryData(
    page: number,
    limit: number,
    search: string,
    filters: InventoryFilters,
    sortBy: string,
    sortOrder: 'asc' | 'desc'
) {
    const [products, setProducts] = useState<Product[]>([])
    const [alerts, setAlerts] = useState<InventoryAlert[]>([])
    const [loading, setLoading] = useState(true)
    const [total, setTotal] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const toast = useAppToast()

    const fetchData = useCallback(async () => {
        try {
            setLoading(true)

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
            logger.error('Error fetching inventory', error, 'useInventoryData')
            toast.error(getLocalizedErrorMessage(error, '데이터를 불러오는데 실패했습니다'))
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
            logger.error('Error fetching alerts', error, 'useInventoryData')
            toast.error(getLocalizedErrorMessage(error, '재고 알림을 불러오는데 실패했습니다.'))
        }
    }, [toast])

    useEffect(() => {
        fetchData()
        fetchAlerts()
    }, [fetchData, fetchAlerts])

    return {
        products,
        alerts,
        loading,
        total,
        totalPages,
        refetch: fetchData,
        refetchAlerts: fetchAlerts,
    }
}
