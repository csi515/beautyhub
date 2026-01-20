'use client'

import { useEffect, useState, useMemo, lazy, Suspense, useCallback } from 'react'
import { useAppToast } from '../lib/ui/toast'
import Button from '../components/ui/Button'
import ProductCreateEditModal from '../components/products/ProductCreateEditModal'
import ProductFilters from '../components/products/ProductFilters'
import ProductGrid from '../components/products/ProductGrid'
import PageToolbar from '../components/common/PageToolbar'
import StandardPageLayout from '../components/common/StandardPageLayout'
import { useSearch } from '../lib/hooks/useSearch'
import { useSort } from '../lib/hooks/useSort'
import { usePagination } from '../lib/hooks/usePagination'
import { useResponsivePaginationSize } from '../lib/hooks/useResponsivePaginationSize'
import { exportToCSV, prepareProductDataForExport } from '../lib/utils/export'

import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Pagination from '@mui/material/Pagination'
import { Plus } from 'lucide-react'
import MobileFAB from '../components/common/MobileFAB'
import PaginationInfo from '../components/common/PaginationInfo'

const ProductDetailModal = lazy(() => import('../components/modals/ProductDetailModal'))

import type { Product } from '@/types/entities'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { sortFn } = useSort<Product & Record<string, unknown>>({
    initialKey: 'name',
    initialDirection: 'asc',
  })
  const pagination = usePagination({
    initialPage: 1,
    initialPageSize: 10,
    totalItems: 0,
  })
  const { page, pageSize, setPage } = pagination
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<Product | null>(null)
  const toast = useAppToast()
  const { query, debouncedQuery, setQuery } = useSearch({ debounceMs: 300 })
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const paginationSize = useResponsivePaginationSize()

  // Price range filter
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  const load = useCallback(async () => {
    try {
      setLoading(true); setError('')
      const { productsApi } = await import('@/app/lib/api/products')
      const rows = await productsApi.list(debouncedQuery ? { search: debouncedQuery } : {})
      setProducts(Array.isArray(rows) ? rows as Product[] : [])
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : '에러가 발생했습니다.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [debouncedQuery])

  useEffect(() => { load() }, [load])

  // 필터링된 데이터
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search query
      if (debouncedQuery.trim()) {
        const qLower = debouncedQuery.trim().toLowerCase()
        const matchesName = (p.name || '').toLowerCase().includes(qLower)
        const matchesDesc = (p.description || '').toLowerCase().includes(qLower)
        if (!matchesName && !matchesDesc) return false
      }

      // Status filter
      if (statusFilter === 'active' && !p.active) return false
      if (statusFilter === 'inactive' && p.active) return false

      // Price range filter
      if (minPrice && (p.price ?? 0) < Number(minPrice)) return false
      if (maxPrice && (p.price ?? 0) > Number(maxPrice)) return false

      return true
    })
  }, [products, debouncedQuery, statusFilter, minPrice, maxPrice])

  // 정렬된 데이터
  const sortedProducts = useMemo(() => {
    return sortFn(filteredProducts as (Product & Record<string, unknown>)[])
  }, [filteredProducts, sortFn])

  // 페이지네이션된 데이터
  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * pageSize
    const end = start + pageSize
    return sortedProducts.slice(start, end)
  }, [sortedProducts, page, pageSize])

  // totalPages 계산 (필터링된 데이터 기준)
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize))

  // CSV export function
  const handleExport = () => {
    const dataToExport = prepareProductDataForExport(filteredProducts)
    exportToCSV(dataToExport, `상품목록_${new Date().toISOString().slice(0, 10)}.csv`)
    toast.success('CSV 파일이 다운로드되었습니다')
  }

  const handleResetFilters = () => {
    setStatusFilter('all')
    setMinPrice('')
    setMaxPrice('')
    setQuery('')
  }


  // 페이지 변경 시 필터/검색 변경으로 인해 현재 페이지가 유효 범위를 벗어나면 첫 페이지로 이동
  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(1)
    }
  }, [totalPages, page, setPage])

  const openCreate = () => {
    setEditing(null)
    setShowModal(true)
  }

  const handleProductSaved = useCallback(async () => {
    await load()
    setShowModal(false)
    setEditing(null)
  }, [load])

  return (
    <StandardPageLayout
      loading={loading}
      error={error}
      empty={!loading && filteredProducts.length === 0 && products.length === 0}
      emptyTitle="제품이 없습니다"
      emptyDescription="새로운 제품을 추가하여 시작하세요"
      emptyActionLabel="제품 추가"
      emptyActionOnClick={openCreate}
      errorTitle="오류 발생"
    >
      <PageToolbar
        search={{
          value: query,
          onChange: setQuery,
          placeholder: '상품명 또는 설명으로 검색',
        }}
        filters={
          <ProductFilters
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            minPrice={minPrice}
            onMinPriceChange={setMinPrice}
            maxPrice={maxPrice}
            onMaxPriceChange={setMaxPrice}
            hasActiveFilters={statusFilter !== 'all' || minPrice !== '' || maxPrice !== '' || query !== ''}
            onReset={handleResetFilters}
          />
        }
        actions={{
          primary: {
            label: '상품 등록',
            onClick: openCreate,
          },
        }}
        export={{
          label: 'CSV 내보내기',
          onClick: handleExport,
        }}
      />

      {!loading && filteredProducts.length > 0 && (
        <>
          <ProductGrid
            products={paginatedProducts}
            loading={loading}
            onProductClick={(p) => { setSelected(p); setDetailOpen(true) }}
            onCreateClick={openCreate}
          />

          {/* 페이지네이션 */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems="center">
            <PaginationInfo
              totalItems={filteredProducts.length}
              page={page}
              pageSize={pageSize}
              totalPages={totalPages}
              format="compact"
              itemLabel="개"
            />
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, p) => setPage(p)}
              color="primary"
              size={paginationSize}
              siblingCount={0}
              boundaryCount={1}
              showFirstButton={false}
              showLastButton={false}
              shape="rounded"
              sx={{
                '& .MuiPagination-ul': {
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                },
                '& .MuiPaginationItem-root': {
                  minWidth: { xs: '36px', sm: '40px' },
                  minHeight: { xs: '36px', sm: '40px' },
                  fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                },
              }}
            />
          </Stack>
        </>
      )}

      {!loading && filteredProducts.length === 0 && products.length > 0 && (
        <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            검색 결과가 없습니다.
          </Typography>
          <Button variant="primary" onClick={openCreate}>
            제품 추가
          </Button>
        </Stack>
      )}

      <ProductCreateEditModal
        open={showModal}
        onClose={() => { setShowModal(false); setEditing(null) }}
        editing={editing}
        onSaved={handleProductSaved}
      />

      {detailOpen && (
        <Suspense fallback={null}>
          <ProductDetailModal
            open={detailOpen}
            item={selected}
            onClose={() => setDetailOpen(false)}
            onSaved={load}
            onDeleted={load}
          />
        </Suspense>
      )}

      {/* Mobile FAB */}
      <MobileFAB
        icon={<Plus className="h-5 w-5" />}
        label="제품 추가"
        onClick={openCreate}
      />
    </StandardPageLayout>
  )
}
