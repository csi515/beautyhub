/**
 * Products 페이지 View 컴포넌트
 * 순수 UI만 담당, 모든 로직은 props로 받음
 */

'use client'

import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Pagination from '@mui/material/Pagination'
import Box from '@mui/material/Box'
import { Plus, Package, Archive } from 'lucide-react'
import StandardPageLayout from '../common/StandardPageLayout'
import PageToolbar from '../common/PageToolbar'
import ProductGrid from './ProductGrid'
import ProductFilters from './ProductFilters'
import FilterBottomSheet from '../common/FilterBottomSheet'
import MobileFAB from '../common/MobileFAB'
import PaginationInfo from '../common/PaginationInfo'
import Button from '../ui/Button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs'
import { useResponsivePaginationSize } from '@/app/lib/hooks/useResponsivePaginationSize'
import { useMobilePageHeader } from '@/app/lib/hooks/useMobilePageHeader'
import type { Product } from '@/types/entities'

export interface ProductsPageViewProps {
  tab?: 'products' | 'inventory'
  onTabChange?: (tab: 'products' | 'inventory') => void
  inventoryTab?: React.ReactNode
  // 데이터
  products: Product[]
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
  onProductClick: (product: Product) => void
  onCreateClick: () => void
  onResetFilters: () => void
  onExport: () => void
}

export default function ProductsPageView({
  tab = 'products',
  onTabChange,
  inventoryTab,
  products,
  totalItems,
  totalPages,
  loading,
  error,
  query,
  setQuery,
  statusFilter,
  setStatusFilter,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  sortKey,
  sortDirection,
  toggleSort,
  page,
  pageSize,
  setPage,
  onProductClick,
  onCreateClick,
  onResetFilters,
  onExport,
}: ProductsPageViewProps) {
  const paginationSize = useResponsivePaginationSize()
  const hasActiveFilters = statusFilter !== 'all' || minPrice !== '' || maxPrice !== '' || query !== ''
  const hasProducts = products.length > 0
  const activeFilterCount = [
    statusFilter !== 'all',
    minPrice !== '',
    maxPrice !== '',
  ].filter(Boolean).length
  const { isMobile, filterSheetOpen, closeFilterSheet } = useMobilePageHeader({
    title: '제품 관리',
    filterBadge: activeFilterCount,
  })

  // 필터 콘텐츠
  const filterContent = (
    <ProductFilters
      statusFilter={statusFilter}
      onStatusFilterChange={setStatusFilter}
      minPrice={minPrice}
      onMinPriceChange={setMinPrice}
      maxPrice={maxPrice}
      onMaxPriceChange={setMaxPrice}
      hasActiveFilters={hasActiveFilters}
      onReset={onResetFilters}
      sortKey={sortKey}
      sortDirection={sortDirection}
      toggleSort={toggleSort}
      hideReset={isMobile}
    />
  )

  const isProductsTab = tab === 'products'
  const showEmpty = !loading && !hasProducts && totalItems === 0

  const productsContent = (
    <>
      <PageToolbar
        search={{
          value: query,
          onChange: setQuery,
          placeholder: '상품명 또는 설명으로 검색',
        }}
        filters={!isMobile ? filterContent : undefined}
        actions={isMobile ? undefined : {
          primary: { label: '상품 등록', onClick: onCreateClick },
        }}
        export={{ label: 'CSV 내보내기', onClick: onExport }}
      />

      {isMobile && (
        <FilterBottomSheet
          open={filterSheetOpen}
          onClose={closeFilterSheet}
          title="필터"
          description="제품 목록을 필터링하세요"
          activeFilterCount={activeFilterCount}
          onReset={onResetFilters}
        >
          {filterContent}
        </FilterBottomSheet>
      )}

      {!loading && hasProducts && (
        <>
          <ProductGrid
            products={products}
            loading={loading}
            onProductClick={onProductClick}
            onCreateClick={onCreateClick}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 1.5, md: 2 }} justifyContent="space-between" alignItems="center">
            <PaginationInfo
              totalItems={totalItems}
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
                '& .MuiPagination-ul': { flexWrap: 'wrap', justifyContent: 'center' },
                '& .MuiPaginationItem-root': { minWidth: 44, minHeight: 44, fontSize: { xs: '0.875rem', sm: '0.9375rem' } },
              }}
            />
          </Stack>
        </>
      )}

      {!loading && !hasProducts && totalItems > 0 && (
        <Stack spacing={{ xs: 1, sm: 1.5, md: 2 }} alignItems="center" sx={{ py: 4 }}>
          <Typography variant="body1" color="text.secondary">검색 결과가 없습니다.</Typography>
          <Button variant="primary" onClick={onCreateClick} sx={{ minHeight: 44 }}>제품 추가</Button>
        </Stack>
      )}

      {isProductsTab && (
        <MobileFAB icon={<Plus className="h-5 w-5" />} label="제품 추가" onClick={onCreateClick} />
      )}
    </>
  )

  return (
    <StandardPageLayout
      loading={isProductsTab ? loading : false}
      error={isProductsTab ? error : undefined}
      empty={isProductsTab && showEmpty}
      emptyTitle="제품이 없습니다"
      emptyDescription="새로운 제품을 추가하여 시작하세요"
      emptyActionLabel="제품 추가"
      emptyActionOnClick={onCreateClick}
      errorTitle="오류 발생"
    >
      {onTabChange != null && inventoryTab != null ? (
        <Tabs value={tab} onValueChange={(v) => onTabChange(v as 'products' | 'inventory')}>
          <Box sx={{ mb: 2 }}>
            <TabsList>
              <TabsTrigger value="products">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Package size={18} />
                  <Typography variant="body2" fontWeight={500}>제품</Typography>
                </Box>
              </TabsTrigger>
              <TabsTrigger value="inventory">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Archive size={18} />
                  <Typography variant="body2" fontWeight={500}>재고</Typography>
                </Box>
              </TabsTrigger>
            </TabsList>
          </Box>
          <TabsContent value="products">{productsContent}</TabsContent>
          <TabsContent value="inventory">{inventoryTab}</TabsContent>
        </Tabs>
      ) : (
        productsContent
      )}
    </StandardPageLayout>
  )
}
