/**
 * 고객 포인트 및 보유상품 탭 컴포넌트
 */

'use client'

import { useState, useMemo } from 'react'
import { Card, Grid, Typography, Box, Stack, TextField, InputAdornment, MenuItem, FormControl, InputLabel, Select, IconButton, Chip } from '@mui/material'
import { Plus, Minus, Package, Coins, History, Trash2, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'
import Button from '@/app/components/ui/Button'
import { DataTable } from '@/app/components/ui/DataTable'
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

type LedgerEntry = (PointLedgerEntry & { type: 'points' }) | (ProductLedgerEntry & { type: 'products' })

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
    const [isHistoryExpanded, setIsHistoryExpanded] = useState(false)
    const [historyFilter, setHistoryFilter] = useState<'all' | 'points' | 'products'>('all')

    if (!customerId) return null

    // 통합 변동 내역
    const combinedLedger: LedgerEntry[] = useMemo(() => {
        return [
            ...pointsLedger.map(entry => ({ ...entry, type: 'points' as const })),
            ...productLedger.map(entry => ({ ...entry, type: 'products' as const }))
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }, [pointsLedger, productLedger])

    const filteredLedger = useMemo(() => {
        if (historyFilter === 'all') return combinedLedger
        return combinedLedger.filter(entry => entry.type === historyFilter)
    }, [combinedLedger, historyFilter])

    return (
        <Stack spacing={3}>
            {/* 포인트 관리 섹션 */}
            <Card variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <Coins size={20} className="text-primary-main" />
                    <Typography variant="subtitle1" fontWeight={700}>
                        포인트 관리
                    </Typography>
                </Box>

                <Box sx={{ bgcolor: 'primary.50', p: 2, borderRadius: 2, mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2" fontWeight={600} color="primary.dark">현 보유 포인트</Typography>
                    <Typography variant="h5" fontWeight={800} color="primary.main">
                        {pointsBalance.toLocaleString()} <Typography component="span" variant="body1" fontWeight={600}>점</Typography>
                    </Typography>
                </Box>

                <Stack spacing={2}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="변경량"
                                type="number"
                                fullWidth
                                size="small"
                                value={pointsDelta || ''}
                                onChange={(e) => onChangePointsDelta(Number(e.target.value))}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">점</InputAdornment>,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={8}>
                            <TextField
                                label="변동 사유"
                                fullWidth
                                size="small"
                                placeholder="사유를 입력하세요 (선택)"
                                value={pointsReason}
                                onChange={(e) => onChangePointsReason(e.target.value)}
                            />
                        </Grid>
                    </Grid>
                    <Stack direction="row" spacing={2}>
                        <Button
                            onClick={onAddPoints}
                            disabled={!pointsDelta || pointsDelta <= 0}
                            variant="primary"
                            className="flex-1"
                            leftIcon={<Plus size={18} />}
                        >
                            포인트 추가
                        </Button>
                        <Button
                            onClick={onDeductPoints}
                            disabled={!pointsDelta || pointsDelta <= 0}
                            variant="danger"
                            className="flex-1"
                            leftIcon={<Minus size={18} />}
                        >
                            포인트 차감
                        </Button>
                    </Stack>
                </Stack>
            </Card>

            {/* 보유상품 관리 섹션 */}
            <Card variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <Package size={20} className="text-primary-main" />
                    <Typography variant="subtitle1" fontWeight={700}>
                        보유상품 관리
                    </Typography>
                </Box>

                {/* 신규 상품 추가 */}
                <Box sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 2, p: 2, mb: 3 }}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                        새로운 상품 지급
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={5}>
                            <FormControl fullWidth size="small">
                                <InputLabel>상품 선택</InputLabel>
                                <Select
                                    value={newProductId}
                                    onChange={(e) => onChangeNewProduct(e.target.value as string)}
                                    label="상품 선택"
                                >
                                    <MenuItem value=""><em>선택 안 함</em></MenuItem>
                                    {products.filter(p => !holdings.some(h => h.product_id === p.id)).map(product => (
                                        <MenuItem key={product.id} value={product.id}>{product.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField
                                label="수량"
                                type="number"
                                fullWidth
                                size="small"
                                value={newQty || ''}
                                onChange={(e) => onChangeNewQty(Number(e.target.value))}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">개</InputAdornment>,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Button
                                onClick={onAddProduct}
                                disabled={!newProductId || !newQty || newQty <= 0 || addingProduct}
                                variant="primary"
                                fullWidth
                                leftIcon={<Plus size={18} />}
                            >
                                상품 지급
                            </Button>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="지급 사유"
                                fullWidth
                                size="small"
                                placeholder="사유를 입력하세요 (선택)"
                                value={newReason}
                                onChange={(e) => onChangeNewReason(e.target.value)}
                            />
                        </Grid>
                    </Grid>
                </Box>

                {/* 보유 목록 */}
                <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="body2" fontWeight={700} color="text.secondary">보유 목록 ({holdings.length})</Typography>
                    </Box>

                    {holdings.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4, bgcolor: 'action.hover', borderRadius: 2 }}>
                            <AlertCircle size={32} className="mx-auto text-neutral-300 mb-2" />
                            <Typography variant="body2" color="text.secondary">보유 중인 상품이 없습니다.</Typography>
                        </Box>
                    ) : (
                        holdings.map(holding => (
                            <Box key={holding.id} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Package size={16} className="text-primary-main" />
                                        <Typography variant="body2" fontWeight={700}>
                                            {holding.products?.name || products.find(p => p.id === holding.product_id)?.name || '알 수 없음'}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={`${holding.quantity}개`}
                                        color="primary"
                                        size="small"
                                        sx={{ fontWeight: 700, borderRadius: 1.5 }}
                                    />
                                </Box>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                                    <TextField
                                        size="small"
                                        type="number"
                                        placeholder="변동량"
                                        value={holdingDelta[holding.id] || 1}
                                        onChange={(e) => onChangeHoldingDelta(holding.id, Number(e.target.value))}
                                        sx={{ width: { xs: '100%', sm: 80 } }}
                                        InputProps={{ sx: { fontSize: '0.8125rem' } }}
                                    />
                                    <TextField
                                        size="small"
                                        placeholder="사유 (선택)"
                                        value={holdingReason[holding.id] || ''}
                                        onChange={(e) => onChangeHoldingReason(holding.id, e.target.value)}
                                        sx={{ flex: 1 }}
                                        InputProps={{ sx: { fontSize: '0.8125rem' } }}
                                    />
                                    <Stack direction="row" spacing={1}>
                                        <IconButton
                                            size="small"
                                            onClick={() => onIncrease(holding)}
                                            sx={{ bgcolor: 'primary.50', color: 'primary.main', '&:hover': { bgcolor: 'primary.100' } }}
                                        >
                                            <Plus size={18} />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => onDecrease(holding)}
                                            sx={{ bgcolor: 'error.50', color: 'error.main', '&:hover': { bgcolor: 'error.100' } }}
                                        >
                                            <Minus size={18} />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => onDelete(holding.id)}
                                            sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                                        >
                                            <Trash2 size={18} />
                                        </IconButton>
                                    </Stack>
                                </Stack>
                            </Box>
                        ))
                    )}
                </Stack>
            </Card>

            {/* 변동 내역 섹션 */}
            <Card variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <Box
                    component="button"
                    onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                    sx={{
                        w: '100%',
                        p: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        bgcolor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        width: '100%',
                        textAlign: 'left',
                        '&:hover': { bgcolor: 'action.hover' },
                        transition: 'background-color 200ms'
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <History size={20} className="text-primary-main" />
                        <Typography variant="subtitle1" fontWeight={700}>변동 내역</Typography>
                    </Box>
                    {isHistoryExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </Box>

                {isHistoryExpanded && (
                    <Box sx={{ px: 3, pb: 3 }}>
                        <Box sx={{ mb: 3, display: 'flex', gap: 1 }}>
                            {(['all', 'points', 'products'] as const).map((filter) => (
                                <Button
                                    key={filter}
                                    variant={historyFilter === filter ? 'primary' : 'ghost'}
                                    size="sm"
                                    onClick={() => setHistoryFilter(filter)}
                                    className="flex-1"
                                >
                                    {filter === 'all' ? '전체' : filter === 'points' ? '포인트' : '상세상품'}
                                </Button>
                            ))}
                        </Box>

                        <DataTable
                            columns={[
                                {
                                    key: 'created_at',
                                    header: '일시',
                                    width: 150,
                                    render: (r) => {
                                        const row = r as LedgerEntry
                                        return row.created_at ? new Date(row.created_at).toLocaleString('ko-KR', {
                                            month: '2-digit',
                                            day: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        }) : '-'
                                    }
                                },
                                {
                                    key: 'type',
                                    header: '유형',
                                    width: 100,
                                    render: (r) => {
                                        const row = r as LedgerEntry
                                        return (
                                            <Chip
                                                label={row.type === 'points' ? '포인트' : '상품'}
                                                size="small"
                                                color={row.type === 'points' ? 'info' : 'success'}
                                                variant="filled"
                                                sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                                            />
                                        )
                                    }
                                },
                                {
                                    key: 'product_id',
                                    header: '상품/상세',
                                    render: (r) => {
                                        const row = r as LedgerEntry
                                        if (row.type === 'products' && row.product_id) {
                                            return products.find(p => p.id === row.product_id)?.name || '-'
                                        }
                                        return '-'
                                    }
                                },
                                {
                                    key: 'delta',
                                    header: '변동',
                                    align: 'right',
                                    width: 100,
                                    render: (r) => {
                                        const row = r as LedgerEntry
                                        return (
                                            <Typography
                                                variant="body2"
                                                fontWeight={700}
                                                color={(row.delta || 0) > 0 ? 'primary.main' : 'error.main'}
                                            >
                                                {(row.delta || 0) > 0 ? '+' : ''}{(row.delta || 0).toLocaleString()}
                                            </Typography>
                                        )
                                    }
                                },
                                {
                                    key: 'reason',
                                    header: '사유',
                                    render: (r) => {
                                        const row = r as LedgerEntry
                                        return (
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 150 }} noWrap>
                                                {row.reason || '-'}
                                            </Typography>
                                        )
                                    }
                                },
                                {
                                    key: 'notes',
                                    header: '메모',
                                    render: (r) => {
                                        const row = r as LedgerEntry
                                        if (row.type === 'products') {
                                            return (
                                                <TextField
                                                    size="small"
                                                    variant="standard"
                                                    placeholder="메모 입력"
                                                    defaultValue={row.notes || ''}
                                                    onBlur={(e) => {
                                                        const newVal = e.target.value;
                                                        if (newVal !== (row.notes || '')) {
                                                            onUpdateLedgerNote?.(row.id, newVal);
                                                        }
                                                    }}
                                                    sx={{ '& .MuiInput-root': { fontSize: '0.8125rem' } }}
                                                />
                                            )
                                        }
                                        return null
                                    }
                                }
                            ]}
                            data={filteredLedger as unknown as Record<string, any>[]}
                            emptyMessage="내역이 없습니다."
                        />
                    </Box>
                )}
            </Card>
        </Stack>
    )
}
