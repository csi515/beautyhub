'use client'

import { useState } from 'react'
import { Box, Typography, Alert, Stack, CardContent } from '@mui/material'
import { useTheme, useMediaQuery } from '@mui/material'
import { PackageX, Plus } from 'lucide-react'

import PageContainer from '@/app/components/layout/PageContainer'
import PageIntro from '@/app/components/common/PageIntro'
import { useIsTablet } from '@/app/lib/hooks/useBreakpoint'
import Card from '@/app/components/ui/Card'
import FilterCard from '@/app/components/common/FilterCard'
import Button from '@/app/components/ui/Button'
import { TableSkeleton, CardSkeleton } from '@/app/components/ui/SkeletonLoader'
import EmptyState from '@/app/components/ui/EmptyState'
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
import { INVENTORY_PAGE_SIZE } from '@/app/lib/constants/pagination'
import { useInventoryData } from './hooks/useInventoryData'
import { useInventoryActions } from './hooks/useInventoryActions'
import InventorySummaryCards from './components/InventorySummaryCards'
import InventoryTable from './components/InventoryTable'
import StockAdjustmentModal from './components/StockAdjustmentModal'

export default function InventoryPage() {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    const isTablet = useIsTablet()

    // Pagination, Search, Filter, Sort states
    const [page, setPage] = useState(1)
    const limit = isTablet ? INVENTORY_PAGE_SIZE.tablet : INVENTORY_PAGE_SIZE.desktop
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
        savingStock,
        setStockModalOpen,
        setStockQuantity,
        setStockType,
        setStockMemo,
        openStockModal,
        handleStockUpdate,
        quickStockAdjust,
        acknowledgeAllAlerts,
        acknowledging,
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

    if (loading) {
        return (
            <PageContainer maxWidth="xl" fullScreenOnTablet>
                <Box sx={{ mb: 4 }}>
                    <CardSkeleton count={3} />
                </Box>
                <TableSkeleton rows={5} cols={5} />
            </PageContainer>
        )
    }

    if (products.length === 0) {
        return (
            <PageContainer maxWidth="xl" fullScreenOnTablet>
                <InventorySummaryCards products={[]} />
                <EmptyState
                    icon={PackageX}
                    title="등록된 상품이 없습니다"
                    description="새로운 상품을 등록하고 재고를 관리해보세요."
                    actionLabel="상품 추가"
                    onAction={() => setProductAddModalOpen(true)}
                />
            </PageContainer>
        )
    }

    return (
        <PageContainer maxWidth="xl" fullScreenOnTablet>
            <Stack spacing={2} sx={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
            <PageIntro description="재고 현황을 확인하고 입출고를 관리합니다" count={total} />
            <Box sx={{ flexShrink: 0 }}>
            {/* 알림 섹션 */}
            {alerts.length > 0 && (
                <Alert
                    severity="warning"
                    sx={{ mb: 3 }}
                    action={
                        <Button variant="ghost" size="sm" onClick={acknowledgeAllAlerts} loading={acknowledging} disabled={acknowledging}>
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

            {/* Search, Filter, Actions */}
            <FilterCard>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                    <Box sx={{ flexGrow: 1, width: '100%' }}>
                        <SearchBar
                            value={search}
                            onChange={(newSearch) => {
                                setSearch(newSearch)
                                setPage(1)
                            }}
                            placeholder="상품명 검색..."
                        />
                    </Box>
                    <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                        <Button
                            variant="primary"
                            leftIcon={<Plus size={16} />}
                            onClick={() => setProductAddModalOpen(true)}
                            sx={{ whiteSpace: 'nowrap' }}
                        >
                            상품 추가
                        </Button>
                    </Stack>
                </Stack>
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
                    title="조건"
                />
            </FilterCard>
            </Box>

            {/* 재고 현황 테이블 */}
            <Box sx={{ flex: 1, minHeight: { xs: 200, md: 280 }, overflow: 'auto' }}>
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
            </Box>

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
                saving={savingStock}
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
            </Stack>
        </PageContainer>
    )
}
