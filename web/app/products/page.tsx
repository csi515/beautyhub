/**
 * Products 페이지 컨트롤러
 * 인증 확인, 파라미터 결정, 데이터 로딩 결정, View에 props 전달만 담당
 */

'use client'

import { lazy, Suspense, useCallback } from 'react'
import { useAppToast } from '../lib/ui/toast'
import { useProductsPage } from '../lib/hooks/useProductsPage'
import ProductsPageView from '../components/products/ProductsPageView'
import { exportToCSV, prepareProductDataForExport } from '../lib/utils/export'
import { useModalWithData } from '../lib/hooks/useModalWithData'
import type { Product } from '@/types/entities'

const ProductDetailModal = lazy(() => import('../components/modals/ProductDetailModal'))
const ProductCreateEditModal = lazy(() => import('../components/products/ProductCreateEditModal'))

export default function ProductsPage() {
  // 모달 상태 관리 (컨트롤러 역할)
  const createEditModal = useModalWithData<Product>()
  const detailModal = useModalWithData<Product>()
  
  const toast = useAppToast()
  
  // 데이터 로딩 및 가공은 훅에서 처리
  const pageData = useProductsPage()

  // 이벤트 핸들러 (컨트롤러 역할)
  const handleCreate = () => {
    createEditModal.closeModal()
    // 새로 생성할 때는 null을 전달하지 않고 빈 객체나 undefined를 사용
    // 모달 컴포넌트에서 editing이 null이면 생성 모드로 처리
    createEditModal.openModal({} as Product)
  }

  const handleProductClick = (product: Product) => {
    detailModal.openModal(product)
  }

  const handleProductSaved = useCallback(async () => {
    await pageData.refetch()
    createEditModal.closeModal()
  }, [pageData, createEditModal])

  const handleResetFilters = () => {
    pageData.setStatusFilter('all')
    pageData.setMinPrice('')
    pageData.setMaxPrice('')
    pageData.setQuery('')
  }

  const handleExport = () => {
    // 필터링된 전체 데이터 사용
    const dataToExport = prepareProductDataForExport(pageData.filteredProducts)
    exportToCSV(dataToExport, `상품목록_${new Date().toISOString().slice(0, 10)}.csv`)
    toast.success('CSV 파일이 다운로드되었습니다')
  }

  return (
    <>
      <ProductsPageView
        {...pageData}
        onProductClick={handleProductClick}
        onCreateClick={handleCreate}
        onResetFilters={handleResetFilters}
        onExport={handleExport}
      />
      
      <ProductCreateEditModal
        open={createEditModal.open}
        onClose={createEditModal.closeModal}
        editing={createEditModal.data}
        onSaved={handleProductSaved}
      />

      {detailModal.open && detailModal.data && (
        <Suspense fallback={null}>
          <ProductDetailModal
            open={detailModal.open}
            item={detailModal.data}
            onClose={detailModal.closeModal}
            onSaved={pageData.refetch}
            onDeleted={pageData.refetch}
          />
        </Suspense>
      )}
    </>
  )
}
