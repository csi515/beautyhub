'use client'

import { useState } from 'react'
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Alert,
    Button,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Tooltip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    useTheme,
    useMediaQuery,
    Stack,
    Pagination,
    TableSortLabel,
    Checkbox
} from '@mui/material'
import MobileDataCard from '../components/ui/MobileDataCard'
import { TableSkeleton, CardSkeleton } from '../components/ui/SkeletonLoader'
import EmptyState from '../components/ui/EmptyState'
import { Package, AlertTriangle, Edit, TrendingDown, PackageX, History, Download } from 'lucide-react'
import PageHeader, { createActionButton } from '../components/common/PageHeader'
import SearchBar from '../components/inventory/SearchBar'
import FilterPanel from '../components/inventory/FilterPanel'
import InventoryHistoryModal from '../components/inventory/InventoryHistoryModal'
import BulkActionBar from '../components/inventory/BulkActionBar'
import ProductAddModal from '../components/inventory/ProductAddModal'
import { exportToCSV, prepareInventoryDataForExport } from '../lib/utils/export'
import { useInventory, type Product } from '../lib/hooks/useInventory'
import { useAppToast } from '../components/ui/Toast'

export default function InventoryPage() {
    const toast = useAppToast()
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
    const [stockQuantity, setStockQuantity] = useState(0)
    const [stockType, setStockType] = useState<'purchase' | 'sale' | 'adjustment'>('adjustment')
    const [stockMemo, setStockMemo] = useState('')
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
        setStockQuantity(product.stock_count || 0)
        setStockType('adjustment')
        setStockMemo('')
        setStockModalOpen(true)
    }

    const handleStockUpdate = async () => {
        if (!selectedProduct) return

        try {
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

            setStockModalOpen(false)
            refetch()
        } catch (error) {
            console.error('Error updating stock:', error)
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

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
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
            </Container>
        )
    }

    // products가 비어있을 때 처리 (EmptyState)
    if (products.length === 0) {
        return (
            <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
                <PageHeader
                    title="재고 관리"
                    description="제품 재고 현황 및 알림 관리"
                    icon={<Package />}
                    actions={[
                        createActionButton('제품 추가', () => setProductAddModalOpen(true), 'primary')
                    ]}
                />

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
                                    0개
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <EmptyState
                    icon={PackageX}
                    title="등록된 제품이 없습니다"
                    description="새로운 제품을 등록하고 재고를 관리해보세요."
                    actionLabel="제품 추가"
                    onAction={() => setProductAddModalOpen(true)}
                />
            </Container>
        )
    }


    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
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

            {/* Search and Filter Section */}
            <Stack spacing={2} sx={{ mb: 3 }}>
                <SearchBar
                    value={search}
                    onChange={setSearch}
                />
                <FilterPanel
                    filters={filters}
                    onFilterChange={setFilters}
                    onReset={handleResetFilters}
                />
            </Stack>

            {/* 재고 현황 테이블 */}
            <Card>
                <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                        재고 현황
                    </Typography>

                    {isMobile ? (
                        <Stack spacing={2} sx={{ mt: 2 }}>
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
                                        <Stack direction="row" spacing={1}>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                color="error"
                                                onClick={() => quickStockAdjust(product, -1)}
                                            >
                                                출고
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                color="success"
                                                onClick={() => quickStockAdjust(product, 1)}
                                            >
                                                입고
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={() => openStockModal(product)}
                                                startIcon={<Edit size={16} />}
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
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={products.length > 0 && selectedProductIds.size === products.length}
                                                indeterminate={selectedProductIds.size > 0 && selectedProductIds.size < products.length}
                                                onChange={toggleSelectAll}
                                            />
                                        </TableCell>
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
                                                {product.inventory_status === 'out_of_stock' && (
                                                    <Chip
                                                        label="품절"
                                                        color="error"
                                                        size="small"
                                                        icon={<TrendingDown size={16} />}
                                                    />
                                                )}
                                                {product.inventory_status === 'low_stock' && (
                                                    <Chip
                                                        label="재고 부족"
                                                        color="warning"
                                                        size="small"
                                                        icon={<AlertTriangle size={16} />}
                                                    />
                                                )}
                                                {product.inventory_status === 'normal' && (
                                                    <Chip label="정상" color="success" size="small" />
                                                )}
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
                                showFirstButton
                                showLastButton
                            />
                        </Box>
                    )}

                    {/* Results Info */}
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
                        총 {total}개 중 {Math.min((page - 1) * limit + 1, total)}-{Math.min(page * limit, total)}개 표시
                    </Typography>
                </CardContent>
            </Card>

            {/* 재고 조정 모달 */}
            <Dialog open={stockModalOpen} onClose={() => setStockModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>재고 조정 - {selectedProduct?.name}</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <FormControl fullWidth>
                            <InputLabel>조정 유형</InputLabel>
                            <Select
                                value={stockType}
                                onChange={(e) => setStockType(e.target.value as any)}
                                label="조정 유형"
                            >
                                <MenuItem value="adjustment">직접 입력</MenuItem>
                                <MenuItem value="purchase">입고</MenuItem>
                                <MenuItem value="sale">출고</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            label={stockType === 'adjustment' ? '재고 수량' : '수량 변경'}
                            type="number"
                            value={stockQuantity}
                            onChange={(e) => setStockQuantity(Number(e.target.value))}
                            fullWidth
                            helperText={
                                stockType === 'adjustment'
                                    ? '현재 재고를 직접 입력하세요'
                                    : `현재 재고: ${selectedProduct?.stock_count ?? 0}`
                            }
                        />

                        <TextField
                            label="메모"
                            value={stockMemo}
                            onChange={(e) => setStockMemo(e.target.value)}
                            fullWidth
                            multiline
                            rows={2}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setStockModalOpen(false)}>취소</Button>
                    <Button onClick={handleStockUpdate} variant="contained">
                        저장
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Phase 2: Bulk Action Bar */}
            <BulkActionBar
                selectedCount={selectedProductIds.size}
                onClearSelection={() => setSelectedProductIds(new Set())}
                onBulkAction={(action) => {
                    if (action === 'adjust') {
                        toast.info('대량 조정 기능은 곧 추가됩니다')
                    }
                }}
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
        </Container>
    )
}
