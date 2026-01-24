'use client'

import { useCallback } from 'react'
import InventoryPageView from '@/app/components/inventory/InventoryPageView'
import InventoryHistoryModal from '@/app/components/inventory/InventoryHistoryModal'
import ProductAddModal from '@/app/components/inventory/ProductAddModal'
import InventoryStockAdjustModal from '@/app/components/inventory/InventoryStockAdjustModal'
import { useAppToast } from '@/app/lib/ui/toast'
import { useInventory, type Product } from '@/app/lib/hooks/useInventory'
import { exportToCSV, prepareInventoryDataForExport } from '@/app/lib/utils/export'
import { InventoryService } from '@/app/lib/services/inventory.service'
import { useModalWithData } from '@/app/lib/hooks/useModalWithData'
import { useModal } from '@/app/lib/hooks/useModal'

/**
 * 제품 페이지 내 재고 탭 콘텐츠
 * useInventory + 재고 모달 + InventoryPageView(embedded)
 */
export default function ProductInventoryTab() {
  const toast = useAppToast()
  const stockModal = useModalWithData<Product>()
  const historyModal = useModal<{ productId: string; productName: string }>()
  const productAddModal = useModal()

  const {
    products,
    alerts,
    loading,
    page,
    setPage,
    limit,
    total,
    totalPages,
    search,
    setSearch,
    filters,
    setFilters,
    handleResetFilters,
    sortBy,
    sortOrder,
    handleSortChange,
    selectedProductIds,
    toggleSelectProduct,
    toggleSelectAll,
    setSelectedProductIds,
    quickStockAdjust,
    acknowledgeAllAlerts,
    refetch,
  } = useInventory()

  const stats = InventoryService.calculateStats(products)

  const openStockModal = useCallback((product: Product) => {
    stockModal.openModal(product)
  }, [stockModal])

  const handleStockUpdate = useCallback(
    async (quantity: number, type: 'purchase' | 'sale' | 'adjustment', memo: string) => {
      if (!stockModal.data) return
      try {
        const res = await fetch('/api/inventory', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_id: stockModal.data.id,
            quantity,
            type,
            memo,
          }),
        })
        if (!res.ok) throw new Error('Failed to update stock')
        stockModal.closeModal()
        refetch()
      } catch (e) {
        console.error(e)
        throw e
      }
    },
    [stockModal, refetch]
  )

  const openHistoryModal = useCallback(
    (product: Product) => {
      historyModal.openModal({ productId: product.id, productName: product.name })
    },
    [historyModal]
  )

  const handleExport = useCallback(() => {
    const data = prepareInventoryDataForExport(products)
    exportToCSV(data, `재고현황_${new Date().toISOString().slice(0, 10)}.csv`)
    toast.success('CSV 파일이 다운로드되었습니다')
  }, [products, toast])

  return (
    <>
      <InventoryPageView
        embedded
        products={products}
        alerts={alerts}
        loading={loading}
        stats={stats}
        page={page}
        setPage={setPage}
        limit={limit}
        total={total}
        totalPages={totalPages}
        search={search}
        setSearch={setSearch}
        filters={filters}
        setFilters={setFilters}
        handleResetFilters={handleResetFilters}
        sortBy={sortBy}
        sortOrder={sortOrder}
        handleSortChange={handleSortChange}
        selectedProductIds={selectedProductIds}
        toggleSelectProduct={toggleSelectProduct}
        toggleSelectAll={toggleSelectAll}
        setSelectedProductIds={setSelectedProductIds}
        onStockAdjust={openStockModal}
        onHistoryClick={openHistoryModal}
        onQuickStockAdjust={quickStockAdjust}
        onCreateProduct={() => productAddModal.openModal()}
        onExport={handleExport}
        onAcknowledgeAllAlerts={acknowledgeAllAlerts}
      />

      <InventoryStockAdjustModal
        open={stockModal.open}
        onClose={stockModal.closeModal}
        product={stockModal.data}
        onUpdate={handleStockUpdate}
      />

      {historyModal.selected && (
        <InventoryHistoryModal
          open={historyModal.open}
          onClose={historyModal.closeModal}
          productId={historyModal.selected.productId}
          productName={historyModal.selected.productName}
        />
      )}

      <ProductAddModal
        open={productAddModal.open}
        onClose={productAddModal.closeModal}
        onSuccess={refetch}
      />
    </>
  )
}
