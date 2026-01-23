/**
 * Products 페이지 View 컴포넌트
 * 순수 UI만 담당, 모든 로직은 props로 받음
 */

'use client'

import { useState, useEffect } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Pagination from '@mui/material/Pagination'
import { useTheme, useMediaQuery } from '@mui/material'
import { Plus } from 'lucide-react'
import StandardPageLayout from '../common/StandardPageLayout'
import PageToolbar from '../common/PageToolbar'
import ProductGrid from './ProductGrid'
import ProductFilters from './ProductFilters'
import FilterBottomSheet from '../common/FilterBottomSheet'
import MobileFAB from '../common/MobileFAB'
import PaginationInfo from '../common/PaginationInfo'
import Button from '../ui/Button'
import { useResponsivePaginationSize } from '@/app/lib/hooks/useResponsivePaginationSize'
import { usePageHeader } from '@/app/lib/contexts/PageHeaderContext'
import type { Product } from '@/types/entities'

export interface ProductsPageViewProps {
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
  page,
  pageSize,
  setPage,
  onProductClick,
  onCreateClick,
  onResetFilters,
  onExport,
}: ProductsPageViewProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const paginationSize = useResponsivePaginationSize()
  const { setHeaderInfo, clearHeaderInfo } = usePageHeader()
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const hasActiveFilters = statusFilter !== 'all' || minPrice !== '' || maxPrice !== '' || query !== ''
  const hasProducts = products.length > 0
  
  // 활성 필터 개수 계산
  const activeFilterCount = [
    statusFilter !== 'all',
    minPrice !== '',
    maxPrice !== '',
  ].filter(Boolean).length

  // 모바일에서 Context에 헤더 정보 설정
  useEffect(() => {
    if (isMobile) {
      setHeaderInfo({
        title: '제품 관리',
        onFilter: () => setFilterSheetOpen(true),
        filterBadge: activeFilterCount,
      })
    } else {
      clearHeaderInfo()
    }

    return () => {
      if (isMobile) {
        clearHeaderInfo()
      }
    }
  }, [isMobile, setHeaderInfo, clearHeaderInfo, activeFilterCount])

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
    />
  )

  return (
    <StandardPageLayout
      loading={loading}
      error={error}
      empty={!loading && !hasProducts && totalItems === 0}
      emptyTitle="제품이 없습니다"
      emptyDescription="새로운 제품을 추가하여 시작하세요"
      emptyActionLabel="제품 추가"
      emptyActionOnClick={onCreateClick}
      errorTitle="오류 발생"
    >
      <PageToolbar
        search={{
          value: query,
          onChange: setQuery,
          placeholder: '상품명 또는 설명으로 검색',
        }}
        filters={!isMobile ? filterContent : undefined}
        actions={{
          primary: {
            label: '상품 등록',
            onClick: onCreateClick,
          },
        }}
        export={{
          label: 'CSV 내보내기',
          onClick: onExport,
        }}
      />

      {/* 모바일 필터 Bottom Sheet */}
      {isMobile && (
        <FilterBottomSheet
          open={filterSheetOpen}
          onClose={() => setFilterSheetOpen(false)}
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

          {/* 페이지네이션 */}
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

      {!loading && !hasProducts && totalItems > 0 && (
        <Stack spacing={{ xs: 1, sm: 1.5, md: 2 }} alignItems="center" sx={{ py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            검색 결과가 없습니다.
          </Typography>
          <Button variant="primary" onClick={onCreateClick}>
            제품 추가
          </Button>
        </Stack>
      )}

      {/* Mobile FAB */}
      <MobileFAB
        icon={<Plus className="h-5 w-5" />}
        label="제품 추가"
        onClick={onCreateClick}
      />
    </StandardPageLayout>
  )
}
