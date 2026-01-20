'use client'

import { useState } from 'react'
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Alert,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Tooltip,
    useTheme,
    useMediaQuery,
    Stack,
    Pagination,
    TableSortLabel,
    Checkbox
} from '@mui/material'
import MobileDataCard from '../components/ui/MobileDataCard'
import { Package, Edit, History, AlertTriangle, TrendingDown } from 'lucide-react'
import StatusBadge from '../components/common/StatusBadge'
import PaginationInfo from '../components/common/PaginationInfo'
import TableSelectHeader from '../components/common/TableSelectHeader'
import FilterPanel from '../components/inventory/FilterPanel'
import StandardPageLayout from '../components/common/StandardPageLayout'
import PageToolbar from '../components/common/PageToolbar'
import InventoryHistoryModal from '../components/inventory/InventoryHistoryModal'
import BulkActionBar from '../components/common/BulkActionBar'
import ProductAddModal from '../components/inventory/ProductAddModal'
import InventoryStockAdjustModal from '../components/inventory/InventoryStockAdjustModal'
import { exportToCSV, prepareInventoryDataForExport } from '../lib/utils/export'
import { useInventory, type Product } from '../lib/hooks/useInventory'
import { useAppToast } from '../components/ui/Toast'
import { useResponsivePaginationSize } from '../lib/hooks/useResponsivePaginationSize'

export default function InventoryPage() {
    const toast = useAppToast()
    const paginationSize = useResponsivePaginationSize()
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

    const [stockModalOpen, setStockModalOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

    // Phase 2: History modal
    const [historyModalOpen, setHistoryModalOpen] = useState(false)
    const [historyProductId, setHistoryProductId] = useState<string | null>(null)
    const [historyProductName, setHistoryProductName] = useState('')

    // Product add modal
    const [productAddModalOpen, setProductAddModalOpen] = useState(false)

    const openStockModal = (product: Product) => {
        setSelectedProduct(product)
        setStockModalOpen(true)
    }

    const handleStockUpdate = async (quantity: number, type: 'purchase' | 'sale' | 'adjustment', memo: string) => {
        if (!selectedProduct) return

        try {
            const response = await fetch('/api/inventory', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_id: selectedProduct.id,
                    quantity,
                    type,
                    memo,
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to update stock')
            }

            setStockModalOpen(false)
            refetch()
        } catch (error) {
            console.error('Error updating stock:', error)
            throw error
        }
    }

    const openHistoryModal = (product: Product) => {
        setHistoryProductId(product.id)
        setHistoryProductName(product.name)
        setHistoryModalOpen(true)
    }

    const handleExport = () => {
        const dataToExport = prepareInventoryDataForExport(products)
        exportToCSV(dataToExport, `재고현황_${new Date().toISOString().slice(0, 10)}.csv`)
    }

    const lowStockProducts = products.filter(p => p.inventory_status === 'low_stock')
    const outOfStockProducts = products.filter(p => p.inventory_status === 'out_of_stock')

    return (
        <StandardPageLayout
            loading={loading}
            empty={!loading && products.length === 0}
            emptyTitle="등록된 제품이 없습니다"
            emptyDescription="새로운 제품을 등록하고 재고를 관리해보세요."
            emptyActionLabel="제품 추가"
            emptyActionOnClick={() => setProductAddModalOpen(true)}
            maxWidth="lg"
        >
            <PageToolbar
                search={{
                    value: search,
                    onChange: setSearch,
                    placeholder: '제품명 검색...',
                }}
                filters={
                    <FilterPanel
                        filters={filters}
                        onFilterChange={setFilters}
                        onReset={handleResetFilters}
                    />
                }
                actions={{
                    primary: {
                        label: '제품 추가',
                        onClick: () => setProductAddModalOpen(true),
                    },
                }}
                export={{
                    label: 'CSV 내보내기',
                    onClick: handleExport,
                }}
            />

            {/* 알림 섹션 */}
            {alerts.length > 0 && (
                <Alert
                    severity="warning"
                    sx={{ mb: 3 }}
                    action={
                        <Button color="inherit" size="small" onClick={acknowledgeAllAlerts}>
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
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Package size={20} color="#667eea" />
                                <Typography variant="body2" color="text.secondary">
                                    총 제품 수
                                </Typography>
                            </Box>
                            <Typography variant="h4" fontWeight={700}>
                                {products.length}개
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <AlertTriangle size={20} color="#f59e0b" />
                                <Typography variant="body2" color="text.secondary">
                                    재고 부족
                                </Typography>
                            </Box>
                            <Typography variant="h4" fontWeight={700} color="warning.main">
                                {lowStockProducts.length}개
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <TrendingDown size={20} color="#ef4444" />
                                <Typography variant="body2" color="text.secondary">
                                    품절
                                </Typography>
                            </Box>
                            <Typography variant="h4" fontWeight={700} color="error.main">
                                {outOfStockProducts.length}개
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>


            {/* 재고 현황 테이블 */}
            <Card>
                <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                        재고 현황
                    </Typography>

                    {isMobile ? (
                        <Stack spacing={1.5} sx={{ mt: 2 }}>
                            {products.map((product) => (
                                <MobileDataCard
                                    key={product.id}
                                    title={product.name}
                                    subtitle={`현재 재고: ${product.stock_count ?? 0} | 안전 재고: ${product.safety_stock ?? 0}`}
                                    status={
                                        product.inventory_status === 'out_of_stock'
                                            ? { label: '품절', color: 'error' }
                                            : product.inventory_status === 'low_stock'
                                                ? { label: '재고 부족', color: 'warning' }
                                                : { label: '정상', color: 'success' }
                                    }
                                    action={
                                        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                color="error"
                                                onClick={() => quickStockAdjust(product, -1)}
                                                sx={{ 
                                                    minHeight: '44px',
                                                    fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                                                    flex: { xs: '1 1 calc(50% - 4px)', sm: 'none' },
                                                    minWidth: { xs: 'calc(50% - 4px)', sm: 'auto' }
                                                }}
                                            >
                                                출고
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                color="success"
                                                onClick={() => quickStockAdjust(product, 1)}
                                                sx={{ 
                                                    minHeight: '44px',
                                                    fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                                                    flex: { xs: '1 1 calc(50% - 4px)', sm: 'none' },
                                                    minWidth: { xs: 'calc(50% - 4px)', sm: 'auto' }
                                                }}
                                            >
                                                입고
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={() => openStockModal(product)}
                                                startIcon={<Edit size={16} />}
                                                sx={{ 
                                                    minHeight: '44px',
                                                    fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                                                    flex: { xs: '1 1 100%', sm: 'none' },
                                                    width: { xs: '100%', sm: 'auto' }
                                                }}
                                            >
                                                조정
                                            </Button>
                                        </Stack>
                                    }
                                />
                            ))}
                        </Stack>
                    ) : (
                        <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableSelectHeader
                                            selectedCount={selectedProductIds.size}
                                            totalCount={products.length}
                                            onSelectPage={toggleSelectAll}
                                            onDeselectAll={() => setSelectedProductIds(new Set())}
                                            disabled={products.length === 0}
                                        />
                                        <TableCell>
                                            <TableSortLabel
                                                active={sortBy === 'name'}
                                                direction={sortBy === 'name' ? sortOrder : 'asc'}
                                                onClick={() => handleSortChange('name')}
                                            >
                                                제품명
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell align="right">
                                            <TableSortLabel
                                                active={sortBy === 'stock_count'}
                                                direction={sortBy === 'stock_count' ? sortOrder : 'asc'}
                                                onClick={() => handleSortChange('stock_count')}
                                            >
                                                현재 재고
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell align="right">안전 재고</TableCell>
                                        <TableCell>상태</TableCell>
                                        <TableCell align="right">작업</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {products.map((product) => (
                                        <TableRow
                                            key={product.id}
                                            sx={{
                                                bgcolor: product.inventory_status === 'out_of_stock'
                                                    ? 'error.light'
                                                    : product.inventory_status === 'low_stock'
                                                        ? 'warning.light'
                                                        : 'inherit'
                                            }}
                                        >
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    checked={selectedProductIds.has(product.id)}
                                                    onChange={() => toggleSelectProduct(product.id)}
                                                />
                                            </TableCell>
                                            <TableCell>{product.name}</TableCell>
                                            <TableCell align="right">
                                                <Typography variant="body2" fontWeight={600}>
                                                    {product.stock_count ?? 0}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">{product.safety_stock ?? 5}</TableCell>
                                            <TableCell>
                                                <StatusBadge
                                                    status={product.inventory_status as 'out_of_stock' | 'low_stock' | 'normal'}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                    <Tooltip title="출고 (-1)">
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() => quickStockAdjust(product, -1)}
                                                        >
                                                            <TrendingDown size={18} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="입고 (+1)">
                                                        <IconButton
                                                            size="small"
                                                            color="success"
                                                            onClick={() => quickStockAdjust(product, 1)}
                                                        >
                                                            <Package size={18} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="재고 조정">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => openStockModal(product)}
                                                        >
                                                            <Edit size={18} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="재고 이력">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => openHistoryModal(product)}
                                                        >
                                                            <History size={18} />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={(_, value) => setPage(value)}
                                color="primary"
                                size={paginationSize}
                                siblingCount={0}
                                boundaryCount={1}
                                showFirstButton={false}
                                showLastButton={false}
                                sx={{
                                    '& .MuiPaginationItem-root': {
                                        minWidth: { xs: '36px', sm: '40px' },
                                        minHeight: { xs: '36px', sm: '40px' },
                                        fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                                    },
                                }}
                            />
                        </Box>
                    )}

                    {/* Results Info */}
                    <PaginationInfo
                        totalItems={total}
                        page={page}
                        pageSize={limit}
                        totalPages={totalPages}
                        format="detailed"
                        itemLabel="개"
                        className="mt-2"
                    />
                </CardContent>
            </Card>

            {/* 재고 조정 모달 */}
            <InventoryStockAdjustModal
                open={stockModalOpen}
                onClose={() => setStockModalOpen(false)}
                product={selectedProduct}
                onUpdate={handleStockUpdate}
            />

            {/* Phase 2: Bulk Action Bar */}
            <BulkActionBar
                selectedCount={selectedProductIds.size}
                selectedLabel="개의 제품이 선택되었습니다"
                variant="fixed"
                onClearSelection={() => setSelectedProductIds(new Set())}
                actions={[
                    {
                        label: '일괄 조정',
                        onClick: () => {
                            toast.info('대량 조정 기능은 곧 추가됩니다')
                        },
                        variant: 'secondary',
                    },
                    {
                        label: '선택 삭제',
                        onClick: () => {
                            // TODO: 선택 삭제 기능 구현
                            toast.info('선택 삭제 기능은 곧 추가됩니다')
                        },
                        variant: 'error',
                    },
                ]}
            />

            {/* Phase 2: History Modal */}
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
        </StandardPageLayout>
    )
}
