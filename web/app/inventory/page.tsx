'use client'

import { useState } from 'react'
import { Box, Typography, Alert, Stack, CardContent } from '@mui/material'
import { useTheme, useMediaQuery } from '@mui/material'
import { Package, PackageX, Download } from 'lucide-react'

import PageContainer from '@/app/components/layout/PageContainer'
import Card from '@/app/components/ui/Card'
import Button from '@/app/components/ui/Button'
import { TableSkeleton, CardSkeleton } from '@/app/components/ui/SkeletonLoader'
import EmptyState from '@/app/components/ui/EmptyState'
import PageHeader, { createActionButton } from '@/app/components/common/PageHeader'
import SearchBar from '@/app/components/common/SearchBar'
import FilterPanel from '@/app/components/common/FilterPanel'
import InventoryHistoryModal from '@/app/components/features/inventory/InventoryHistoryModal'

export interface InventoryFilters {
    [key: string]: string
    status: string
    minPrice: string
    maxPrice: string
    minStock: string
    maxStock: string
}
import BulkActionBar from '@/app/components/features/inventory/BulkActionBar'
import ProductAddModal from '@/app/components/features/inventory/ProductAddModal'
import { exportToCSV, prepareInventoryDataForExport } from '@/app/lib/utils/export'

import { useInventoryData } from './hooks/useInventoryData'
import { useInventoryActions } from './hooks/useInventoryActions'
import InventorySummaryCards from './components/InventorySummaryCards'
import InventoryTable from './components/InventoryTable'
import StockAdjustmentModal from './components/StockAdjustmentModal'

export default function InventoryPage() {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

    // Pagination, Search, Filter, Sort states
    const [page, setPage] = useState(1)
    const [limit] = useState(25)
    const [search, setSearch] = useState('')
    const [filters, setFilters] = useState<InventoryFilters>({
        status: '',
        minPrice: '',
        maxPrice: '',
        minStock: '',
        maxStock: ''
    })
    const [sortBy, setSortBy] = useState<string>('name')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

    // History modal and bulk selection
    const [historyModalOpen, setHistoryModalOpen] = useState(false)
    const [historyProductId, setHistoryProductId] = useState<string | null>(null)
    const [historyProductName, setHistoryProductName] = useState('')
    const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set())

    // Product add modal
    const [productAddModalOpen, setProductAddModalOpen] = useState(false)

    // Data fetching
    const { products, alerts, loading, total, totalPages, refetch } = useInventoryData(
        page,
        limit,
        search,
        filters,
        sortBy,
        sortOrder
    )

    // Actions
    const {
        stockModalOpen,
        selectedProduct,
        stockQuantity,
        stockType,
        stockMemo,
        setStockModalOpen,
        setStockQuantity,
        setStockType,
        setStockMemo,
        openStockModal,
        handleStockUpdate,
        quickStockAdjust,
        acknowledgeAllAlerts,
    } = useInventoryActions(refetch)

    // Helper functions
    function openHistoryModal(product: { id: string; name: string }) {
        setHistoryProductId(product.id)
        setHistoryProductName(product.name)
        setHistoryModalOpen(true)
    }

    function toggleSelectProduct(productId: string) {
        const newSelection = new Set(selectedProductIds)
        if (newSelection.has(productId)) {
            newSelection.delete(productId)
        } else {
            newSelection.add(productId)
        }
        setSelectedProductIds(newSelection)
    }

    function toggleSelectAll() {
        if (selectedProductIds.size === products.length) {
            setSelectedProductIds(new Set())
        } else {
            setSelectedProductIds(new Set(products.map(p => p.id)))
        }
    }

    function handleSortChange(field: string) {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortBy(field)
            setSortOrder('asc')
        }
    }

    function handleExport() {
        const dataToExport = prepareInventoryDataForExport(products)
        exportToCSV(dataToExport, `재고현황_${new Date().toISOString().slice(0, 10)}.csv`)
    }

    if (loading) {
        return (
            <PageContainer maxWidth="lg">
                <PageHeader
                    title="재고 관리"
                    description="제품 재고 현황 및 알림 관리"
                    icon={<Package />}
                    actions={[]}
                />
                <Box sx={{ mb: 4 }}>
                    <CardSkeleton count={3} />
                </Box>
                <TableSkeleton rows={5} cols={5} />
            </PageContainer>
        )
    }

    if (products.length === 0) {
        return (
            <PageContainer maxWidth="lg">
                <PageHeader
                    title="재고 관리"
                    description="제품 재고 현황 및 알림 관리"
                    icon={<Package />}
                    actions={[
                        createActionButton('제품 추가', () => setProductAddModalOpen(true), 'primary')
                    ]}
                />
                <InventorySummaryCards products={[]} />
                <EmptyState
                    icon={PackageX}
                    title="등록된 제품이 없습니다"
                    description="새로운 제품을 등록하고 재고를 관리해보세요."
                    actionLabel="제품 추가"
                    onAction={() => setProductAddModalOpen(true)}
                />
            </PageContainer>
        )
    }

    return (
        <PageContainer maxWidth="lg">
            <PageHeader
                title="재고 관리"
                description="제품 재고 현황 및 알림 관리"
                icon={<Package />}
                actions={[
                    createActionButton('CSV 내보내기', handleExport, 'secondary', <Download size={16} />),
                    createActionButton('제품 추가', () => setProductAddModalOpen(true), 'primary'),
                ]}
            />

            {/* 알림 섹션 */}
            {alerts.length > 0 && (
                <Alert
                    severity="warning"
                    sx={{ mb: 3 }}
                    action={
                        <Button variant="ghost" size="sm" onClick={acknowledgeAllAlerts}>
                            모두 확인
                        </Button>
                    }
                >
                    <Typography variant="body2" fontWeight={600}>
                        {alerts.length}개의 재고 알림이 있습니다
                    </Typography>
                </Alert>
            )}

            {/* 요약 카드 */}
            <InventorySummaryCards products={products} />

            {/* Search and Filter Section */}
            <Stack spacing={2} sx={{ mb: 3 }}>
                <SearchBar
                    value={search}
                    onChange={(newSearch) => {
                        setSearch(newSearch)
                        setPage(1)
                    }}
                />
                <FilterPanel<InventoryFilters>
                    filters={filters}
                    onFilterChange={(newFilters) => {
                        setFilters(newFilters)
                        setPage(1)
                    }}
                    onReset={() => {
                        setFilters({
                            status: '',
                            minPrice: '',
                            maxPrice: '',
                            minStock: '',
                            maxStock: ''
                        })
                        setPage(1)
                    }}
                    fields={[
                        {
                            key: 'status',
                            label: '재고 상태',
                            type: 'select',
                            options: [
                                { value: 'normal', label: '정상' },
                                { value: 'low_stock', label: '재고 부족' },
                                { value: 'out_of_stock', label: '품절' },
                            ],
                        },
                        {
                            key: 'price',
                            label: '가격 범위',
                            type: 'range',
                            placeholder: '가격',
                        },
                        {
                            key: 'stock',
                            label: '재고 수량 범위',
                            type: 'range',
                            placeholder: '재고',
                        },
                    ]}
                    title="필터"
                />
            </Stack>

            {/* 재고 현황 테이블 */}
            <Card>
                <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                        재고 현황
                    </Typography>

                    <InventoryTable
                        products={products}
                        isMobile={isMobile}
                        selectedProductIds={selectedProductIds}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        page={page}
                        totalPages={totalPages}
                        total={total}
                        limit={limit}
                        onToggleSelect={toggleSelectProduct}
                        onToggleSelectAll={toggleSelectAll}
                        onSortChange={handleSortChange}
                        onPageChange={setPage}
                        onQuickAdjust={quickStockAdjust}
                        onOpenStockModal={openStockModal}
                        onOpenHistoryModal={openHistoryModal}
                    />
                </CardContent>
            </Card>

            {/* 재고 조정 모달 */}
            <StockAdjustmentModal
                open={stockModalOpen}
                onClose={() => setStockModalOpen(false)}
                product={selectedProduct}
                quantity={stockQuantity}
                type={stockType}
                memo={stockMemo}
                onQuantityChange={setStockQuantity}
                onTypeChange={setStockType}
                onMemoChange={setStockMemo}
                onSave={handleStockUpdate}
            />

            {/* Bulk Action Bar */}
            <BulkActionBar
                selectedCount={selectedProductIds.size}
                onClearSelection={() => setSelectedProductIds(new Set())}
                onBulkAction={() => {
                    // 대량 조정 기능은 곧 추가됩니다
                }}
            />

            {/* History Modal */}
            <InventoryHistoryModal
                open={historyModalOpen}
                onClose={() => setHistoryModalOpen(false)}
                productId={historyProductId}
                productName={historyProductName}
            />

            {/* Product Add Modal */}
            <ProductAddModal
                open={productAddModalOpen}
                onClose={() => setProductAddModalOpen(false)}
                onSuccess={refetch}
            />
        </PageContainer>
    )
}
