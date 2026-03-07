import { useState } from 'react'
import { useAppToast } from '../../lib/ui/toast'
import type { Product } from './useInventoryData'

export function useInventoryActions(onSuccess?: () => void) {
    const [stockModalOpen, setStockModalOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [stockQuantity, setStockQuantity] = useState(0)
    const [stockType, setStockType] = useState<'purchase' | 'sale' | 'adjustment'>('adjustment')
    const [stockMemo, setStockMemo] = useState('')
    const [savingStock, setSavingStock] = useState(false)
    const toast = useAppToast()

    function openStockModal(product: Product) {
        setSelectedProduct(product)
        setStockQuantity(product.stock_count || 0)
        setStockType('adjustment')
        setStockMemo('')
        setStockModalOpen(true)
    }

    async function handleStockUpdate() {
        if (!selectedProduct || savingStock) return

        try {
            setSavingStock(true)
            const response = await fetch('/api/inventory', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_id: selectedProduct.id,
                    quantity: stockQuantity,
                    type: stockType,
                    memo: stockMemo,
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to update stock')
            }

            toast.success('재고가 업데이트되었습니다')
            setStockModalOpen(false)
            onSuccess?.()
        } catch (error) {
            console.error('Error updating stock:', error)
            toast.error('재고 업데이트에 실패했습니다')
        } finally {
            setSavingStock(false)
        }
    }

    async function quickStockAdjust(product: Product, adjustment: number) {
        const newQuantity = (product.stock_count || 0) + adjustment
        if (newQuantity < 0) {
            toast.error('재고는 0보다 작을 수 없습니다')
            return
        }

        try {
            const response = await fetch('/api/inventory', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_id: product.id,
                    quantity: newQuantity,
                    type: 'adjustment',
                    memo: adjustment > 0 ? `빠른 입고 (+${adjustment})` : `빠른 출고 (${adjustment})`,
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to update stock')
            }

            toast.success(adjustment > 0 ? '입고 완료' : '출고 완료')
            onSuccess?.()
        } catch (error) {
            console.error('Error updating stock:', error)
            toast.error('재고 업데이트에 실패했습니다')
        }
    }

    async function acknowledgeAllAlerts() {
        try {
            const response = await fetch('/api/inventory/alerts', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ acknowledge_all: true }),
            })

            if (!response.ok) {
                throw new Error('Failed to acknowledge alerts')
            }

            toast.success('모든 알림이 확인되었습니다')
            onSuccess?.()
        } catch (error) {
            console.error('Error acknowledging alerts:', error)
            toast.error('알림 확인에 실패했습니다')
        }
    }

    return {
        stockModalOpen,
        selectedProduct,
        stockQuantity,
        stockType,
        stockMemo,
        savingStock,
        setStockModalOpen,
        setStockQuantity,
        setStockType,
        setStockMemo,
        openStockModal,
        handleStockUpdate,
        quickStockAdjust,
        acknowledgeAllAlerts,
    }
}
