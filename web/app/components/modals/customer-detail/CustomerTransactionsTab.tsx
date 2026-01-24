/**
 * 고객 포인트 및 보유상품 탭 컴포넌트
 */

'use client'

import { Stack } from '@mui/material'
import PointsManagementSection from './transactions/PointsManagementSection'
import ProductManagementSection from './transactions/ProductManagementSection'
import LedgerHistorySection from './transactions/LedgerHistorySection'
import type { CustomerProduct } from '@/app/lib/repositories/customer-products.repository'

interface Product {
    id: string
    name: string
}

interface PointLedgerEntry {
    created_at: string
    delta: number
    reason?: string | null
}

interface ProductLedgerEntry {
    created_at: string
    delta: number
    reason?: string | null | undefined
    product_id: string
    notes?: string | null
    id: string
}

type Holding = CustomerProduct

interface CustomerTransactionsTabProps {
    customerId: string
    pointsBalance: number
    pointsLedger: PointLedgerEntry[]
    productLedger: ProductLedgerEntry[]
    holdings: Holding[]
    products: Product[]
    pointsDelta: number
    onChangePointsDelta: (delta: number) => void
    pointsReason: string
    onChangePointsReason: (reason: string) => void
    onAddPoints: () => void
    onDeductPoints: () => void
    holdingDelta: Record<string, number>
    onChangeHoldingDelta: (id: string, value: number) => void
    holdingReason: Record<string, string>
    onChangeHoldingReason: (id: string, value: string) => void
    onIncrease: (holding: Holding) => void | Promise<void>
    onDecrease: (holding: Holding) => void | Promise<void>
    newProductId: string
    onChangeNewProduct: (id: string) => void
    newQty: number
    onChangeNewQty: (qty: number) => void
    newReason: string
    onChangeNewReason: (reason: string) => void
    onAddProduct: () => void
    addingProduct: boolean
    onDelete: (id: string) => void
    onUpdateLedgerNote?: (ledgerId: string, notes: string) => void | Promise<void>
}

export default function CustomerTransactionsTab({
    customerId,
    pointsBalance,
    pointsLedger,
    productLedger,
    holdings,
    products,
    pointsDelta,
    onChangePointsDelta,
    pointsReason,
    onChangePointsReason,
    onAddPoints,
    onDeductPoints,
    holdingDelta,
    onChangeHoldingDelta,
    holdingReason,
    onChangeHoldingReason,
    onIncrease,
    onDecrease,
    newProductId,
    onChangeNewProduct,
    newQty,
    onChangeNewQty,
    newReason,
    onChangeNewReason,
    onAddProduct,
    addingProduct,
    onDelete,
    onUpdateLedgerNote,
}: CustomerTransactionsTabProps) {
    if (!customerId) return null

    return (
        <Stack spacing={3}>
            <PointsManagementSection
                pointsBalance={pointsBalance}
                pointsDelta={pointsDelta}
                pointsReason={pointsReason}
                onChangePointsDelta={onChangePointsDelta}
                onChangePointsReason={onChangePointsReason}
                onAddPoints={onAddPoints}
                onDeductPoints={onDeductPoints}
            />

            <ProductManagementSection
                holdings={holdings}
                products={products}
                newProductId={newProductId}
                newQty={newQty}
                newReason={newReason}
                holdingDelta={holdingDelta}
                holdingReason={holdingReason}
                addingProduct={addingProduct}
                onChangeNewProduct={onChangeNewProduct}
                onChangeNewQty={onChangeNewQty}
                onChangeNewReason={onChangeNewReason}
                onChangeHoldingDelta={onChangeHoldingDelta}
                onChangeHoldingReason={onChangeHoldingReason}
                onAddProduct={onAddProduct}
                onIncrease={onIncrease}
                onDecrease={onDecrease}
                onDelete={onDelete}
            />

            <LedgerHistorySection
                pointsLedger={pointsLedger}
                productLedger={productLedger}
                products={products}
                onUpdateLedgerNote={onUpdateLedgerNote}
            />
        </Stack>
    )
}
