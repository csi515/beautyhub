import { useState, useEffect } from 'react'
import { useAppToast } from '../../lib/ui/toast'
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

    useEffect(() => {
        fetchData()
        fetchAlerts()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, limit, search, filters, sortBy, sortOrder])

    async function fetchData() {
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
            console.error('Error fetching inventory:', error)
            toast.error('데이터를 불러오는데 실패했습니다')
        } finally {
            setLoading(false)
        }
    }

    async function fetchAlerts() {
        try {
            const alertsResponse = await fetch('/api/inventory/alerts?unacknowledged=true')
            if (alertsResponse.ok) {
                const alertsData = await alertsResponse.json()
                setAlerts(Array.isArray(alertsData) ? alertsData : [])
            }
        } catch (error) {
            console.error('Error fetching alerts:', error)
        }
    }

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
