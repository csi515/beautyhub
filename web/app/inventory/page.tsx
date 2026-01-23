/**
 * Inventory 페이지 컨트롤러
 * 인증 확인, 파라미터 결정, 데이터 로딩 결정, View에 props 전달만 담당
 */

'use client'

import InventoryPageView from '../components/inventory/InventoryPageView'
import InventoryHistoryModal from '../components/inventory/InventoryHistoryModal'
import ProductAddModal from '../components/inventory/ProductAddModal'
import InventoryStockAdjustModal from '../components/inventory/InventoryStockAdjustModal'
import { exportToCSV, prepareInventoryDataForExport } from '../lib/utils/export'
import { useInventory, type Product } from '../lib/hooks/useInventory'
import { useAppToast } from '../components/ui/Toast'
import { InventoryService } from '../lib/services/inventory.service'
import { useModalWithData } from '../lib/hooks/useModalWithData'
import { useModal } from '../lib/hooks/useModal'

export default function InventoryPage() {
    const toast = useAppToast()
    
    // 모달 상태 관리 (컨트롤러 역할)
    const stockModal = useModalWithData<Product>()
    const historyModal = useModal<{ productId: string; productName: string }>()
    const productAddModal = useModal()

    // 데이터 로딩 및 가공은 훅에서 처리
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

    // Service 레이어를 사용한 통계 계산
    const stats = InventoryService.calculateStats(products)

    // 이벤트 핸들러 (컨트롤러 역할)
    const openStockModal = (product: Product) => {
        stockModal.openModal(product)
    }

    const handleStockUpdate = async (quantity: number, type: 'purchase' | 'sale' | 'adjustment', memo: string) => {
        if (!stockModal.data) return

        try {
            const response = await fetch('/api/inventory', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_id: stockModal.data.id,
                    quantity,
                    type,
                    memo,
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to update stock')
            }

            stockModal.closeModal()
            refetch()
        } catch (error) {
            console.error('Error updating stock:', error)
            throw error
        }
    }

    const openHistoryModal = (product: Product) => {
        historyModal.openModal({ productId: product.id, productName: product.name })
    }

    const handleExport = () => {
        const dataToExport = prepareInventoryDataForExport(products)
        exportToCSV(dataToExport, `재고현황_${new Date().toISOString().slice(0, 10)}.csv`)
        toast.success('CSV 파일이 다운로드되었습니다')
    }



    return (
        <>
            <InventoryPageView
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

            {/* 재고 조정 모달 */}
            <InventoryStockAdjustModal
                open={stockModal.open}
                onClose={stockModal.closeModal}
                product={stockModal.data}
                onUpdate={handleStockUpdate}
            />

            {/* History Modal */}
            {historyModal.selected && (
                <InventoryHistoryModal
                    open={historyModal.open}
                    onClose={historyModal.closeModal}
                    productId={historyModal.selected.productId}
                    productName={historyModal.selected.productName}
                />
            )}

            {/* Product Add Modal */}
            <ProductAddModal
                open={productAddModal.open}
                onClose={productAddModal.closeModal}
                onSuccess={refetch}
            />
        </>
    )
}
