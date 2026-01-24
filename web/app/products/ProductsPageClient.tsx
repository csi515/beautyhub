'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { lazy, Suspense, useCallback } from 'react'
import { useAppToast } from '@/app/lib/ui/toast'
import { useProductsPage } from '@/app/lib/hooks/useProductsPage'
import ProductsPageView from '@/app/components/products/ProductsPageView'
import ProductInventoryTab from '@/app/components/products/ProductInventoryTab'
import { exportToCSV, prepareProductDataForExport } from '@/app/lib/utils/export'
import { useModalWithData } from '@/app/lib/hooks/useModalWithData'
import type { Product } from '@/types/entities'

const ProductDetailModal = lazy(() => import('@/app/components/modals/ProductDetailModal'))
const ProductCreateEditModal = lazy(() => import('@/app/components/products/ProductCreateEditModal'))

type TabValue = 'products' | 'inventory'

export default function ProductsPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = (searchParams.get('tab') ?? 'products') as TabValue
  const tabFromUrl = tabParam === 'inventory' ? 'inventory' : 'products'
  const [tab, setTab] = useState<TabValue>(tabFromUrl)

  useEffect(() => {
    setTab(tabFromUrl)
  }, [tabFromUrl])

  const handleTabChange = (t: TabValue) => {
    setTab(t)
    router.replace(`/products?tab=${t}`)
  }

  const createEditModal = useModalWithData<Product>()
  const detailModal = useModalWithData<Product>()
  const toast = useAppToast()
  const pageData = useProductsPage()

  const handleCreate = () => {
    createEditModal.closeModal()
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
    const data = prepareProductDataForExport(pageData.filteredProducts)
    exportToCSV(data, `상품목록_${new Date().toISOString().slice(0, 10)}.csv`)
    toast.success('CSV 파일이 다운로드되었습니다')
  }

  return (
    <>
      <ProductsPageView
        {...pageData}
        tab={tab}
        onTabChange={handleTabChange}
        inventoryTab={<ProductInventoryTab />}
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
