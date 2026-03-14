import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/app/lib/api/middleware'
import { ProductsRepository } from '@/app/lib/repositories/products.repository'
import { InventoryTransactionsRepository } from '@/app/lib/repositories/inventory-transactions.repository'
import { InventoryAlertsRepository } from '@/app/lib/repositories/inventory-alerts.repository'

/**
 * GET /api/inventory
 * 재고 조회 (재고 부족 제품 포함)
 * Query params: page, limit, search, status, sort_by, sort_order, min_price, max_price, min_stock, max_stock
 */
export const GET = withAuth(async (request: NextRequest, { userId, supabase }) => {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '25')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const sortBy = searchParams.get('sort_by') || 'name'
    const sortOrder = searchParams.get('sort_order') || 'asc'
    const minPrice = searchParams.get('min_price') ? parseFloat(searchParams.get('min_price')!) : null
    const maxPrice = searchParams.get('max_price') ? parseFloat(searchParams.get('max_price')!) : null
    const minStock = searchParams.get('min_stock') ? parseInt(searchParams.get('min_stock')!) : null
    const maxStock = searchParams.get('max_stock') ? parseInt(searchParams.get('max_stock')!) : null

    const productsRepo = new ProductsRepository(userId, supabase)
    const allProducts = await productsRepo.findAll({ limit: 10000 })

    let inventoryData = allProducts.map(product => {
      const stockCount = product.stock_count ?? 0
      const safetyStock = product.safety_stock ?? 5

      let inventoryStatus = 'normal'
      if (stockCount === 0) {
        inventoryStatus = 'out_of_stock'
      } else if (stockCount <= safetyStock) {
        inventoryStatus = 'low_stock'
      }

      return {
        ...product,
        inventory_status: inventoryStatus,
        needs_restock: inventoryStatus !== 'normal',
      }
    })

    if (search) {
      const searchLower = search.toLowerCase()
      inventoryData = inventoryData.filter(product =>
        product.name?.toLowerCase().includes(searchLower)
      )
    }

    if (status) {
      inventoryData = inventoryData.filter(product => product.inventory_status === status)
    }

    if (minPrice !== null) {
      inventoryData = inventoryData.filter(product => (product.price ?? 0) >= minPrice)
    }
    if (maxPrice !== null) {
      inventoryData = inventoryData.filter(product => (product.price ?? 0) <= maxPrice)
    }

    if (minStock !== null) {
      inventoryData = inventoryData.filter(product => (product.stock_count ?? 0) >= minStock)
    }
    if (maxStock !== null) {
      inventoryData = inventoryData.filter(product => (product.stock_count ?? 0) <= maxStock)
    }

    inventoryData.sort((a, b) => {
      let aVal: string | number = a[sortBy as keyof typeof a] as string | number
      let bVal: string | number = b[sortBy as keyof typeof b] as string | number

      if (aVal === null || aVal === undefined) aVal = ''
      if (bVal === null || bVal === undefined) bVal = ''

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }
      const aNum = Number(aVal)
      const bNum = Number(bVal)
      return sortOrder === 'asc' ? aNum - bNum : bNum - aNum
    })

    const total = inventoryData.length
    const totalPages = Math.ceil(total / limit)
    const offset = (page - 1) * limit
    const paginatedData = inventoryData.slice(offset, offset + limit)

    return NextResponse.json({
      data: paginatedData,
      pagination: {
        total,
        page,
        limit,
        total_pages: totalPages,
      }
    })
  } catch (error) {
    console.error('Error fetching inventory:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inventory' },
      { status: 500 }
    )
  }
})

/**
 * PATCH /api/inventory
 * 재고 수량 업데이트
 */
export const PATCH = withAuth(async (request: NextRequest, { userId, supabase }) => {
  try {
    const { product_id, quantity, type = 'adjustment', memo } = await request.json()

    if (!product_id) {
      return NextResponse.json({ error: 'product_id is required' }, { status: 400 })
    }

    const productsRepo = new ProductsRepository(userId, supabase)
    const transactionsRepo = new InventoryTransactionsRepository(userId, supabase)
    const alertsRepo = new InventoryAlertsRepository(userId, supabase)

    const product = await productsRepo.findById(product_id)
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const beforeCount = product.stock_count ?? 0
    const afterCount = type === 'adjustment'
      ? quantity
      : beforeCount + quantity

    await productsRepo.update(product_id, { stock_count: afterCount })

    await transactionsRepo.createTransaction({
      product_id,
      type: type as 'purchase' | 'sale' | 'adjustment',
      quantity: type === 'adjustment' ? quantity - beforeCount : quantity,
      before_count: beforeCount,
      after_count: afterCount,
      memo,
    })

    const safetyStock = product.safety_stock ?? 5
    if (afterCount <= safetyStock) {
      const alertType = afterCount === 0 ? 'out_of_stock' : 'low_stock'

      const existingAlerts = await alertsRepo.findByProductId(product_id)
      const hasUnacknowledgedAlert = existingAlerts.some(
        alert => !alert.acknowledged && alert.alert_type === alertType
      )

      if (!hasUnacknowledgedAlert) {
        await alertsRepo.createAlert({
          product_id,
          alert_type: alertType,
          acknowledged: false,
        })
      }
    }

    return NextResponse.json({
      success: true,
      before_count: beforeCount,
      after_count: afterCount,
    })
  } catch (error) {
    console.error('Error updating inventory:', error)
    return NextResponse.json(
      { error: 'Failed to update inventory' },
      { status: 500 }
    )
  }
})

