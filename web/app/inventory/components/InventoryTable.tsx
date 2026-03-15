'use client'

import {
    Box,
    Typography,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    Checkbox,
    Paper,
    Chip,
    IconButton,
    Tooltip,
    Pagination,
} from '@mui/material'
import { Package, AlertTriangle, Edit, TrendingDown, History } from 'lucide-react'
import { Button } from '@mui/material'
import MobileDataCard from '../../components/ui/MobileDataCard'
import type { Product } from '../hooks/useInventoryData'

interface InventoryTableProps {
    products: Product[]
    isMobile: boolean
    selectedProductIds: Set<string>
    sortBy: string
    sortOrder: 'asc' | 'desc'
    page: number
    totalPages: number
    total: number
    limit: number
    onToggleSelect: (productId: string) => void
    onToggleSelectAll: () => void
    onSortChange: (field: string) => void
    onPageChange: (page: number) => void
    onQuickAdjust: (product: Product, adjustment: number) => void
    onOpenStockModal: (product: Product) => void
    onOpenHistoryModal: (product: Product) => void
}

export default function InventoryTable({
    products,
    isMobile,
    selectedProductIds,
    sortBy,
    sortOrder,
    page,
    totalPages,
    total,
    limit,
    onToggleSelect,
    onToggleSelectAll,
    onSortChange,
    onPageChange,
    onQuickAdjust,
    onOpenStockModal,
    onOpenHistoryModal,
}: InventoryTableProps) {
    if (isMobile) {
        return (
            <>
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
                                        onClick={() => onQuickAdjust(product, -1)}
                                        sx={{ minHeight: 32 }}
                                    >
                                        출고
                                    </Button>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        color="success"
                                        onClick={() => onQuickAdjust(product, 1)}
                                        sx={{ minHeight: 32 }}
                                    >
                                        입고
                                    </Button>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={() => onOpenStockModal(product)}
                                        startIcon={<Edit size={16} />}
                                        sx={{ minHeight: 32 }}
                                    >
                                        조정
                                    </Button>
                                </Stack>
                            }
                        />
                    ))}
                </Stack>
                {totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={(_, value) => onPageChange(value)}
                            color="primary"
                            showFirstButton
                            showLastButton
                        />
                    </Box>
                )}
            </>
        )
    }

    return (
        <>
            <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
                <Table sx={{
                    tableLayout: 'fixed',
                    width: '100%',
                    '& .MuiTableCell-root': { py: { md: 1 }, px: 1 },
                    '& .MuiTableCell-root:first-of-type': { px: 0.5 },
                    '& .MuiTableCell-root:last-of-type': { px: 0.5 },
                }}>
                    <colgroup>
                        <col style={{ width: '36px' }} />
                        <col style={{ width: '110px' }} />
                        <col style={{ width: '52px' }} />
                        <col style={{ width: '52px' }} />
                        <col style={{ width: '72px' }} />
                        <col style={{ width: '100px' }} />
                    </colgroup>
                    <TableHead>
                        <TableRow>
                            <TableCell padding="none" align="center" sx={{ width: 36, minWidth: 36, px: 0.5 }}>
                                <Checkbox
                                    size="small"
                                    checked={products.length > 0 && selectedProductIds.size === products.length}
                                    indeterminate={selectedProductIds.size > 0 && selectedProductIds.size < products.length}
                                    onChange={onToggleSelectAll}
                                />
                            </TableCell>
                            <TableCell align="center" sx={{ whiteSpace: 'nowrap', minWidth: 0 }}>
                                <TableSortLabel
                                    active={sortBy === 'name'}
                                    direction={sortBy === 'name' ? sortOrder : 'asc'}
                                    onClick={() => onSortChange('name')}
                                >
                                    상품명
                                </TableSortLabel>
                            </TableCell>
                            <TableCell align="center" sx={{ whiteSpace: 'nowrap', width: 52, minWidth: 52 }}>
                                <TableSortLabel
                                    active={sortBy === 'stock_count'}
                                    direction={sortBy === 'stock_count' ? sortOrder : 'asc'}
                                    onClick={() => onSortChange('stock_count')}
                                >
                                    현재고
                                </TableSortLabel>
                            </TableCell>
                            <TableCell align="center" sx={{ whiteSpace: 'nowrap', width: 52, minWidth: 52 }}>안전재고</TableCell>
                            <TableCell align="center" sx={{ whiteSpace: 'nowrap', width: 72, minWidth: 72 }}>상태</TableCell>
                            <TableCell align="center" sx={{ whiteSpace: 'nowrap', width: 100, minWidth: 100, px: 0.5 }}>작업</TableCell>
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
                                <TableCell padding="none" align="center" sx={{ width: 36, minWidth: 36, px: 0.5 }}>
                                    <Checkbox
                                        size="small"
                                        checked={selectedProductIds.has(product.id)}
                                        onChange={() => onToggleSelect(product.id)}
                                    />
                                </TableCell>
                                <TableCell sx={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={product.name}>
                                    {product.name}
                                </TableCell>
                                <TableCell align="center">
                                    <Typography variant="body2" fontWeight={600}>
                                        {product.stock_count ?? 0}
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">{product.safety_stock ?? 5}</TableCell>
                                <TableCell align="center" sx={{ width: 72, minWidth: 72 }}>
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
                                <TableCell align="center" sx={{ width: 100, minWidth: 100, px: 0.5 }}>
                                    <Stack direction="row" spacing={0} justifyContent="center" sx={{ gap: 0 }}>
                                        <Tooltip title="출고 (-1)">
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => onQuickAdjust(product, -1)}
                                                sx={{ p: 0.25 }}
                                            >
                                                <TrendingDown size={14} />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="입고 (+1)">
                                            <IconButton
                                                size="small"
                                                color="success"
                                                onClick={() => onQuickAdjust(product, 1)}
                                                sx={{ p: 0.25 }}
                                            >
                                                <Package size={14} />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="재고 조정">
                                            <IconButton
                                                size="small"
                                                onClick={() => onOpenStockModal(product)}
                                                sx={{ p: 0.25 }}
                                            >
                                                <Edit size={14} />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="재고 이력">
                                            <IconButton
                                                size="small"
                                                onClick={() => onOpenHistoryModal(product)}
                                                sx={{ p: 0.25 }}
                                            >
                                                <History size={14} />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(_, value) => onPageChange(value)}
                        color="primary"
                        showFirstButton
                        showLastButton
                    />
                </Box>
            )}
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
                총 {total}개 중 {Math.min((page - 1) * limit + 1, total)}-{Math.min(page * limit, total)}개 표시
            </Typography>
        </>
    )
}
