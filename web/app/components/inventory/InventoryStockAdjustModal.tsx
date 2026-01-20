'use client'

import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
} from '@mui/material'
import type { Product } from '@/app/lib/hooks/useInventory'

type Props = {
    open: boolean
    onClose: () => void
    product: Product | null
    onUpdate: (quantity: number, type: 'purchase' | 'sale' | 'adjustment', memo: string) => Promise<void>
}

export default function InventoryStockAdjustModal({ open, onClose, product, onUpdate }: Props) {
    const [stockQuantity, setStockQuantity] = useState(0)
    const [stockType, setStockType] = useState<'purchase' | 'sale' | 'adjustment'>('adjustment')
    const [stockMemo, setStockMemo] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open && product) {
            setStockQuantity(product.stock_count || 0)
            setStockType('adjustment')
            setStockMemo('')
        }
    }, [open, product])

    const handleUpdate = async () => {
        if (!product) return
        setLoading(true)
        try {
            await onUpdate(stockQuantity, stockType, stockMemo)
            onClose()
            setStockQuantity(0)
            setStockMemo('')
        } catch (error) {
            console.error('Error updating stock:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="sm" 
            fullWidth
            PaperProps={{
                sx: {
                    m: { xs: 1, sm: 2 },
                    borderRadius: { xs: 3, sm: 3 },
                }
            }}
        >
            <DialogTitle sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' }, pb: { xs: 1, sm: 1.5 } }}>
                재고 조정 - {product?.name}
            </DialogTitle>
            <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 2.5 } }}>
                    <FormControl fullWidth>
                        <InputLabel shrink>조정 유형</InputLabel>
                        <Select
                            value={stockType}
                            onChange={(e) => setStockType(e.target.value as any)}
                            label="조정 유형"
                            sx={{
                                minHeight: '44px',
                                '& .MuiSelect-select': {
                                    fontSize: { xs: '16px', sm: '14px' },
                                },
                            }}
                        >
                            <MenuItem value="adjustment" sx={{ fontSize: { xs: '16px', sm: '14px' }, minHeight: '44px' }}>직접 입력</MenuItem>
                            <MenuItem value="purchase" sx={{ fontSize: { xs: '16px', sm: '14px' }, minHeight: '44px' }}>입고</MenuItem>
                            <MenuItem value="sale" sx={{ fontSize: { xs: '16px', sm: '14px' }, minHeight: '44px' }}>출고</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        label={stockType === 'adjustment' ? '재고 수량' : '수량 변경'}
                        type="number"
                        value={stockQuantity}
                        onChange={(e) => setStockQuantity(Number(e.target.value))}
                        fullWidth
                        inputProps={{
                            inputMode: 'numeric',
                            pattern: '[0-9]*',
                            style: { fontSize: '16px' },
                        }}
                        helperText={
                            stockType === 'adjustment'
                                ? '현재 재고를 직접 입력하세요'
                                : `현재 재고: ${product?.stock_count ?? 0}`
                        }
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                minHeight: '44px',
                                fontSize: { xs: '16px', sm: '14px' },
                            },
                        }}
                    />

                    <TextField
                        label="메모"
                        value={stockMemo}
                        onChange={(e) => setStockMemo(e.target.value)}
                        fullWidth
                        multiline
                        rows={2}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                fontSize: { xs: '16px', sm: '14px' },
                            },
                        }}
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: { xs: 2, sm: 2 }, gap: 1 }}>
                <Button 
                    onClick={onClose}
                    disabled={loading}
                    sx={{ 
                        minHeight: '44px', 
                        flex: { xs: 1, sm: 'none' },
                        fontSize: { xs: '0.9375rem', sm: '1rem' }
                    }}
                >
                    취소
                </Button>
                <Button 
                    onClick={handleUpdate} 
                    variant="contained"
                    disabled={loading}
                    sx={{ 
                        minHeight: '44px', 
                        flex: { xs: 1, sm: 'none' },
                        fontSize: { xs: '0.9375rem', sm: '1rem' }
                    }}
                >
                    저장
                </Button>
            </DialogActions>
        </Dialog>
    )
}
