/**
 * Products 페이지 컨트롤러
 * 인증 확인, 파라미터 결정, 데이터 로딩 결정, View에 props 전달만 담당
 */

'use client'

import { useState, lazy, Suspense, useCallback } from 'react'
import { useAppToast } from '../lib/ui/toast'
import { useProductsPage } from '../lib/hooks/useProductsPage'
import ProductsPageView from '../components/products/ProductsPageView'
import { exportToCSV, prepareProductDataForExport } from '../lib/utils/export'
import type { Product } from '@/types/entities'

const ProductDetailModal = lazy(() => import('../components/modals/ProductDetailModal'))
const ProductCreateEditModal = lazy(() => import('../components/products/ProductCreateEditModal'))

export default function ProductsPage() {
  // 모달 상태 관리 (컨트롤러 역할)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selected, setSelected] = useState<Product | null>(null)
  
  const toast = useAppToast()
  
  // 데이터 로딩 및 가공은 훅에서 처리
  const pageData = useProductsPage()

  // 이벤트 핸들러 (컨트롤러 역할)
  const handleCreate = () => {
    setEditing(null)
    setShowModal(true)
  }

  const handleProductClick = (product: Product) => {
    setSelected(product)
    setDetailOpen(true)
  }

  const handleProductSaved = useCallback(async () => {
    await pageData.refetch()
    setShowModal(false)
    setEditing(null)
  }, [pageData])

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
            onSaved={pageData.refetch}
            onDeleted={pageData.refetch}
          />
        </Suspense>
      )}
    </>
  )
}
