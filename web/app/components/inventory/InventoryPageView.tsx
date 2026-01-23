/**
 * Inventory 페이지 View 컴포넌트
 * 순수 UI만 담당, 모든 로직은 props로 받음
 */

'use client'

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
import MobileDataCard from '../ui/MobileDataCard'
import { Package, Edit, History, AlertTriangle, TrendingDown } from 'lucide-react'
import StatusBadge from '../common/StatusBadge'
import PaginationInfo from '../common/PaginationInfo'
import TableSelectHeader from '../common/TableSelectHeader'
import { useState, useEffect } from 'react'
import FilterPanel from './FilterPanel'
import FilterBottomSheet from '../common/FilterBottomSheet'
import StandardPageLayout from '../common/StandardPageLayout'
import PageToolbar from '../common/PageToolbar'
import BulkActionBar from '../common/BulkActionBar'
import { useResponsivePaginationSize } from '@/app/lib/hooks/useResponsivePaginationSize'
import { usePageHeader } from '@/app/lib/contexts/PageHeaderContext'
import type { Product, InventoryAlert, InventoryFilters } from '@/app/lib/hooks/useInventory'
import type { InventoryStats } from '@/app/lib/services/inventory.service'

export interface InventoryPageViewProps {
    // 데이터
    products: Product[]
    alerts: InventoryAlert[]
    loading: boolean
    stats: InventoryStats
    
    // 페이지네이션
    page: number
    setPage: (page: number) => void
    limit: number
    total: number
    totalPages: number
    
    // 검색/필터
    search: string
    setSearch: (search: string) => void
    filters: InventoryFilters
    setFilters: (filters: InventoryFilters) => void
    handleResetFilters: () => void
    
    // 정렬
    sortBy: string
    sortOrder: 'asc' | 'desc'
    handleSortChange: (field: string) => void
    
    // 선택
    selectedProductIds: Set<string>
    toggleSelectProduct: (id: string) => void
    toggleSelectAll: () => void
    setSelectedProductIds: (ids: Set<string>) => void
    
    // 액션
    onStockAdjust: (product: Product) => void
    onHistoryClick: (product: Product) => void
    onQuickStockAdjust: (product: Product, adjustment: number) => void
    onCreateProduct: () => void
    onExport: () => void
    onAcknowledgeAllAlerts: () => void
}

export default function InventoryPageView({
    products,
    alerts,
    loading,
    stats,
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
    onStockAdjust,
    onHistoryClick,
    onQuickStockAdjust,
    onCreateProduct,
    onExport,
    onAcknowledgeAllAlerts,
}: InventoryPageViewProps) {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    const paginationSize = useResponsivePaginationSize()
    const { setHeaderInfo, clearHeaderInfo } = usePageHeader()
    const [filterSheetOpen, setFilterSheetOpen] = useState(false)
    
    // 활성 필터 개수 계산
    const activeFilterCount = Object.values(filters).filter(v => v !== '').length

    // 모바일에서 Context에 헤더 정보 설정
    useEffect(() => {
        if (isMobile) {
            setHeaderInfo({
                title: '재고 관리',
                onFilter: () => setFilterSheetOpen(true),
                filterBadge: activeFilterCount,
            })
        } else {
            clearHeaderInfo()
        }

        return () => {
            if (isMobile) {
                clearHeaderInfo()
            }
        }
    }, [isMobile, setHeaderInfo, clearHeaderInfo, activeFilterCount])

    // 필터 콘텐츠
    const filterContent = (
        <FilterPanel
            filters={filters}
            onFilterChange={setFilters}
            onReset={handleResetFilters}
        />
    )

    return (
        <StandardPageLayout
            loading={loading}
            empty={!loading && products.length === 0}
            emptyTitle="등록된 제품이 없습니다"
            emptyDescription="새로운 제품을 등록하고 재고를 관리해보세요."
            emptyActionLabel="제품 추가"
            emptyActionOnClick={onCreateProduct}
            maxWidth="lg"
        >
            <PageToolbar
                search={{
                    value: search,
                    onChange: setSearch,
                    placeholder: '제품명 검색...',
                }}
                filters={!isMobile ? filterContent : undefined}
                actions={{
                    primary: {
                        label: '제품 추가',
                        onClick: onCreateProduct,
                    },
                }}
                export={{
                    label: 'CSV 내보내기',
                    onClick: onExport,
                }}
            />

            {/* 모바일 필터 Bottom Sheet */}
            {isMobile && (
                <FilterBottomSheet
                    open={filterSheetOpen}
                    onClose={() => setFilterSheetOpen(false)}
                    title="필터"
                    description="재고 목록을 필터링하세요"
                    activeFilterCount={activeFilterCount}
                    onReset={handleResetFilters}
                >
                    {filterContent}
                </FilterBottomSheet>
            )}

            {/* 알림 섹션 */}
            {alerts.length > 0 && (
                <Alert
                    severity="warning"
                    sx={{ mb: 3 }}
                    action={
                        <Button color="inherit" size="small" onClick={onAcknowledgeAllAlerts}>
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
            <Grid container spacing={{ xs: 1, sm: 1.5, md: 3 }} sx={{ mb: { xs: 2, sm: 2.5, md: 4 } }}>
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
                                {stats.totalProducts}개
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
                                {stats.lowStockCount}개
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
                                {stats.outOfStockCount}개
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
                        <Stack spacing={{ xs: 1, sm: 1.5 }} sx={{ mt: 2 }}>
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
                                                onClick={() => onQuickStockAdjust(product, -1)}
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
                                                onClick={() => onQuickStockAdjust(product, 1)}
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
                                                onClick={() => onStockAdjust(product)}
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
                                                            onClick={() => onQuickStockAdjust(product, -1)}
                                                        >
                                                            <TrendingDown size={18} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="입고 (+1)">
                                                        <IconButton
                                                            size="small"
                                                            color="success"
                                                            onClick={() => onQuickStockAdjust(product, 1)}
                                                        >
                                                            <Package size={18} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="재고 조정">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => onStockAdjust(product)}
                                                        >
                                                            <Edit size={18} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="재고 이력">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => onHistoryClick(product)}
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
                                        minWidth: { xs: '44px', sm: '44px' },
                                        minHeight: { xs: '44px', sm: '44px' },
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

            {/* Bulk Action Bar */}
            <BulkActionBar
                selectedCount={selectedProductIds.size}
                selectedLabel="개의 제품이 선택되었습니다"
                variant="fixed"
                onClearSelection={() => setSelectedProductIds(new Set())}
                actions={[
                    {
                        label: '일괄 조정',
                        onClick: () => {
                            // 컨트롤러에서 처리
                        },
                        variant: 'secondary',
                    },
                    {
                        label: '선택 삭제',
                        onClick: () => {
                            // 컨트롤러에서 처리
                        },
                        variant: 'error',
                    },
                ]}
            />
        </StandardPageLayout>
    )
}
